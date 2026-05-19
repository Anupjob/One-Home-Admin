import React, { useEffect, useState, useRef } from "react";
import getApiCall from "../../../../Services/getApiCall";
import postApiCall from "../../../../Services/postApiCall";
import { Modal } from "react-bootstrap";
import { Form } from 'react-formio';
import { toast } from "react-toastify";
import CustomButton from "../../../../Utils/CustomButton";
import loginUser from "../../../../Services/loginUser";
import Constant from "../../../../Components/Constant";
import CommonActionIcons from "../../../../Utils/CommonActionIcons";

const Exposure = ({ formData, idFromURL,dataEntryFormData }) => {
    const formRef = useRef(null)
    let { accessToken } = loginUser();
    const [list, setLists] = useState([
        { propertyType: 'Building-Wing' },
        { propertyType: 'Plot' },
        { propertyType: 'Bunglow' }
    ])
    const [propertyType, setPropertyType] = useState('')
    const [index, setIndex] = useState(null)
    const [open, setOpen] = useState(false)
    const [type, setType] = useState('add')
    const [responseData, setResponseData] = useState()
    const formId = "697b1656f392e660eeca13b1"
    const [formSchema, setFormSchema] = useState({
        display: "form",
        components: []
    });
    useEffect(() => {
        getExposureByEntryId();
        getFormDataById();
    }, [])

    const getExposureByEntryId = async () => {
        const response = await getApiCall(`admin/apf-flow/hierarchical-data?formId=${formId}&dataEntryId=${idFromURL}`)

        if (response.meta.status) {
            if (response.data?.items) {
                setLists(prevList =>
  prevList.map((item, index) => {
    const updatedItem = response.data?.items.find(
      apiItem => apiItem?.formFields?.listIndex === index
    );

    return updatedItem ? { ...item, ...updatedItem } : item;
  })
);

            }
        }
    }

    const getFormDataById = () => {
        getApiCall(`admin/dynamic/form/details/${formId}`)
            .then((response) => {
                if (response.meta.status) {
                    setFormSchema({
                        display: "form",
                        components: [...response.data.moduleFormData]
                    });
                }
            })
            .catch((error) => {
                console.error("Error loading form schema:", error);
            });
    };
    const handleEditExposure = (item, index) => {
        setType('edit')
        setIndex(index)
        setPropertyType(item?.formFields?.propertyType || item?.propertyType)
        setResponseData(item)
        setOpen(true)


    }
    const handleView = (item) => {
        setResponseData(item)
        setType('view')
        setOpen(true)
    }

    const actionRender = async (item, index) => {
        const actions = [];
        if(dataEntryFormData.status !== "SUBMITTED" && dataEntryFormData.status!== "APPROVED" && type !== "view"){
        actions.push({
            type: "edit",
            label: "Edit",
            onClick: () => { handleEditExposure(item, index) },
        });
    }
        actions.push({
            type: "view",
            label: "View",
            onClick: () => { handleView(item, index) },
        });


        return <CommonActionIcons actions={actions} />;
    };

    const handleSubmit = async (type) => {
        if (!formRef.current || !formRef.current.formio) return;

        const formio = formRef.current.formio;

        // Access the current data
        const submissionData = formio.submission?.data || {};

        try {
            // Validate form manually

            const isValid = await formio.checkValidity(
                formio.submission?.data,   // must pass actual submission data
                true                      // trigger all validations
            );

            if (!isValid) {
                // highlight invalid fields
                formio.setPristine(false);
                console.log("Validation Check:", isValid, formio.submission.data);

                // show built-in form.io errors
                formio.emit("error", {
                    message: "Please fill all required fields before submitting."
                });

                return; // stop submit
            }
            let payload = {
                formId,
                userComment: "",
                formFields: {
                    ...submissionData,
                    h0Name: formData?.h0Name || '',
                    h1Name: formData?.h1Name || '',
                    h2Name: formData?.h2Name || '',
                    h3Name: formData?.h3Name || '',
                    h4Name: formData?.h4Name || '',
                    h5Name: formData?.h5Name || '',
                    dataEntryId: idFromURL,
                    propertyType: propertyType,
                    listIndex: index

                },
                status: 'SUBMITTED'
            };
            let response = {};
            // === Special case for "partner-user" ===
            const formEntryId = responseData._id;

            if (formEntryId) {
                response = await postApiCall(
                    `admin/submit/form/update/${formEntryId}`,
                    payload,
                    true
                );
            } else {
                response = await postApiCall(
                    'admin/submit/form/add',
                    payload,
                    true
                );
            }


            // === Common response handling ===
            if (response?.meta?.status) {
                toast.success(response.meta.msg);
                getExposureByEntryId();
                setOpen(false)
            } else {
                toast.error(response?.meta?.msg || 'Submission failed');
            }
        } catch (err) {
            console.error('Validation or submission error:', err);
            toast.error('An unexpected error occurred during submission.');
        }
    }
    return (<>
        <div className="table-container-wrapper">
            <div className="table-wrapper">
                <table className="table table-bordered" width="100%" cellSpacing="0" style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    <thead style={{ backgroundColor: "#FCFCFD" }}>
                        <tr>
                            <th>
                                Property Type
                            </th>
                            <th>
                                Exposure (%)
                            </th>
                            <th>
                                Sanctioned Exposure (₹)
                            </th>
                            <th>Disbursed Exposure (₹)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, rowIndex) => (
                            <tr>
                                <td>{item?.formFields?.propertyType || item?.propertyType || '-'}</td>
                                <td>{item?.formFields?.exposure || '-'}</td>
                                <td>{item?.formFields?.sanctionedExposure || '-'}</td>
                                <td>{item?.formFields?.disbursedExposure || '-'}</td>
                                <td>
                                    {actionRender(item, rowIndex)}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
        <Modal
            show={open}
            // onHide={closeModal}
            centered
            size="xl"
            backdrop="static"
        >
            <Modal.Header>
                <Modal.Title>
                    Add Exposure
                </Modal.Title>
                <i
                    className="fa fa-times ms-auto"
                    role="button"
                    onClick={() => setOpen(false)}
                    style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                />
            </Modal.Header>

            <Modal.Body>

                {/* BUILDING */}

                <div className="container-fluid">
                    <Form
                        ref={formRef}
                        submission={{ data: { ...responseData?.formFields, accessToken, apiBasePath: Constant.apiBasePath, projectName: formData?.projectName || '' } }}
                        form={formSchema}
                        options={{
                            readOnly: type == "view"
                        }}
                    />
                </div>
            </Modal.Body>
            {type !== "view" &&
                <Modal.Footer>
                    <CustomButton label={'Submit'} appendClass="text-white" onClick={handleSubmit} />
                </Modal.Footer>
            }
        </Modal>
    </>)

}
export default Exposure;