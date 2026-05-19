import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { Form } from 'react-formio';
import { toast } from "react-toastify";
import CustomButton from "../../../../Utils/CustomButton";
import getApiCall from "../../../../Services/getApiCall";
import postApiCall from "../../../../Services/postApiCall";
import loginUser from "../../../../Services/loginUser";
import CommonActionIcons from "../../../../Utils/CommonActionIcons";
import Constant from "../../../../Components/Constant";


const DisbursementDocuments = ({
    idFromURL,
    formData,
    dataEntryFormData,
    actionType
}) => {
    const formRef = useRef(null)
    let { accessToken } = loginUser();
    const [type, setType] = useState('')
    const [formId, setFormId] = useState('')
    const [role, setRole] = useState('')
    const [open, setOpen] = useState(false)
    const [formSchema, setFormSchema] = useState()
    const [responseData, setResponseData] = useState()
    const [customerDocList, setCustomerDocList] = useState([])
    const [builderDocList, setBuilderDocList] = useState()

    const handleEditProjectInfo = (item, type) => {
        setResponseData(item)
        setRole(type)
        setType('edit')
        setFormId(formId)
        setOpen(true)
    };
    const handleView = (item, type) => {
        setResponseData(item)
        setRole(type)
        setType('view')
        setOpen(true)
    }
    const handleAddDocByRole = (type, formId) => {
        setResponseData()
        setFormId(formId)
        getFormDataById(formId)
        setType(type)
        setOpen(true)
    }
    const actionRender = async (item, type) => {
        const actions = [];
        // Always allow edit
        if(dataEntryFormData.status !== "SUBMITTED" && dataEntryFormData.status!== "APPROVED" && actionType !== "view"){
        actions.push({
            type: "edit",
            label: "Edit",
            onClick: () => { handleEditProjectInfo(item, type) },
        });
    }

        actions.push({
            type: "view",
            label: "View",
            onClick: () => { handleView(item, type) },
        });

        return <CommonActionIcons actions={actions} />;
    };

    useEffect(() => {
        getDocumentByEntryId('698ece78d38a1dc202b96555');
        getDocumentByEntryId('698ed052d38a1dc202b96609');
    }, [])

    const getDocumentByEntryId = async (formId) => {
        const response = await getApiCall(`admin/apf-flow/hierarchical-data?formId=${formId}&dataEntryId=${idFromURL}`)

        if (response.meta.status) {
            if (response.data?.items) {
                if (formId == "698ece78d38a1dc202b96555") {
                    setCustomerDocList(response?.data?.items)
                }

                if (formId == "698ed052d38a1dc202b96609") {
                    setBuilderDocList(response?.data?.items)
                }
            }
        }
    }

    const getFormDataById = (formId) => {
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
                    dataEntryId: idFromURL
                },
                status: 'SUBMITTED'
            };
            let response = {};
            // === Special case for "partner-user" ===
            const formEntryId = responseData?._id || null;

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
                getDocumentByEntryId(formId);
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
        <div className="mt-2">

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h5>Customer Documents</h5>
                {dataEntryFormData.status !== "SUBMITTED" && dataEntryFormData.status!== "APPROVED" && actionType !== "view"&& (
                    <CustomButton label={'Add Customer Document'} icon={'bi-plus'} appendClass="text-white" onClick={() => handleAddDocByRole('customerDoc', '698ece78d38a1dc202b96555')} />
                )}
            </div>
            {customerDocList?.length > 0 ? (
                <div className="table-container-wrapper">
                    <div className="table-wrapper">
                        <table className="table table-bordered" width="100%" cellSpacing="0" style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                            <thead style={{ backgroundColor: "#FCFCFD" }}>
                                <tr>
                                    <th>
                                        Phase
                                    </th>
                                    <th>
                                        Document Type
                                    </th>
                                    <th>
                                        Due Date
                                    </th>
                                    <th>Remarks</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerDocList.map((item, rowIndex) => (
                                    <tr>
                                        <td>{item?.formFields?.phase || '-'}</td>
                                        <td>{item?.formFields?.documentType || '-'}</td>
                                        <td>{item?.formFields?.dueDate || '-'}</td>
                                        <td>{item?.formFields?.remarks || '-'}</td>
                                        <td>
                                            {actionRender(item, 'customerDoc')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </div>

            )
                : (
                    <div className={`card shadow-sm h-100 card-body not-answerd-card`} >
                        <p className="text-muted-not-answerd fst-italic mb-0" style={{ height: `200px`, textAlign: 'center', paddingTop: '80px' }}>
                            No Record Found !
                        </p>
                    </div>
                )}
        </div>
        <div className="mt-2">

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h5>Builder Documents</h5>
                {dataEntryFormData.status !== "SUBMITTED" && dataEntryFormData.status!== "APPROVED" && actionType !== "view" && (
                <CustomButton label={'Add Builder Document'} icon={'bi-plus'} appendClass="text-white" onClick={() => handleAddDocByRole('builderDoc', '698ed052d38a1dc202b96609')} />
                )}
                </div>
            {builderDocList?.length > 0 ? (
                <div className="table-container-wrapper">
                    <div className="table-wrapper">
                        <table className="table table-bordered" width="100%" cellSpacing="0" style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                            <thead style={{ backgroundColor: "#FCFCFD" }}>
                                <tr>
                                    <th>
                                        Phase
                                    </th>
                                    <th>
                                        Document Type
                                    </th>
                                    <th>
                                        Due Date
                                    </th>
                                    <th>Remarks</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {builderDocList.map((item, rowIndex) => (
                                    <tr>
                                        <td>{item?.formFields?.phase || '-'}</td>
                                        <td>{item?.formFields?.documentType || '-'}</td>
                                        <td>{item?.formFields?.dueDate || '-'}</td>
                                        <td>{item?.formFields?.remarks || '-'}</td>
                                        <td>
                                            {actionRender(item, 'builderDoc')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </div>)
                : (
                    <div className={`card shadow-sm h-100 card-body not-answerd-card`} >
                        <p className="text-muted-not-answerd fst-italic mb-0" style={{ height: `200px`, textAlign: 'center', paddingTop: '80px' }}>
                            No Record Found !
                        </p>
                    </div>
                )}
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
                    Add {type=="builderDoc"?"Builder":"Customer"} Document
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
export default DisbursementDocuments;