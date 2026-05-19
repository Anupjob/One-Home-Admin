import React, { useEffect, useState, useRef } from "react";
import FilterWithButtonsCard from "../../../../../Utils/FilterWithButtonsCard";
import CustomButton from "../../../../../Utils/CustomButton";
import { useNavigate, useLocation } from "react-router-dom";
import CommonActionIcons from "../../../../../Utils/CommonActionIcons";
import PaginationNew from "../../../../../Widgets/PaginationNew";
import Constant from "../../../../../Components/Constant";
import { Modal } from "react-bootstrap";
import { Form } from 'react-formio';
import loginUser from "../../../../../Services/loginUser";
import getApiCall from "../../../../../Services/getApiCall";
import { toast } from "react-toastify";
import postApiCall from "../../../../../Services/postApiCall";
import moment from "moment";

const OverAllProjectProgress = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const formRef = useRef(null);
    const state = location.state
    const idFromURL = state.idFromURL;
    const formData = state.formData;
    const [progressList, setProgressList] = useState([])
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [open, setOpen] = useState(false)
    const [responseData, setResponseData] = useState(false)
    const [type, setType] = useState('add')
    const formId = '6980430f7f5271c851c134e1'

    let { accessToken } = loginUser();
    const [formSchema, setFormSchema] = useState({
        display: "form",
        components: []
    });
    const handleView = (item) => {
        setResponseData(item)
        setType('view')
        setOpen(true)
    }
    const handleEdit = (item) => {
        setResponseData(item)
        setType('edit')
        setOpen(true)
    }
    function pageChangeHandler(page) {
        setPageNo(page);

    }
    const headerButtons = () => (
        <CustomButton
            label="Add Progress"
            variant="danger"
            icon="bi-plus-lg"
            appendClass='text-white mx-2'
            onClick={() => setOpen(true)}
        />
    )
    const actionRender = async (item, index) => {
        const actions = [];
        actions.push({
            type: "edit",
            label: "Edit",
            onClick: () => { handleEdit(item, index) },
        });
        actions.push({
            type: "view",
            label: "View",
            onClick: () => { handleView(item, index) },
        });


        return <CommonActionIcons actions={actions} />;
    };
    useEffect(() => {
        getLists()
        getFormDataById()
    }, [])
    const getFormDataById = () => {
        getApiCall(`admin/dynamic/form/details/${formId}`)
            .then((response) => {
                if (response.meta.status) {
                    // if(formName!=="create-roles"&& formName!=="partner-user" && formName!=="hierarchy"){
                    setFormSchema({
                        display: "form",
                        components: [...response.data.moduleFormData]
                    });
                    // setResponseData(response.data);
                } else {
                    setFormSchema({
                        display: "form",
                        components: [...response.data.moduleFormData]
                    });
                }
                //   }
            })
            .catch((error) => {
                console.error("Error loading form schema:", error);
            });
    };
    const getLists = () => {

        getApiCall(`admin/apf-flow/hierarchical-data?formId=${formId}&dataEntryId=${idFromURL}`)
            .then((response) => {
                if (response.meta.status) {
                    setProgressList(response.data.items)
                    setTotalItems(response.data.total)
                }
                else {
                    setProgressList([])
                }
            })
            .catch((error) => {
                console.error("Error loading form data:", error);
            });
    }
    const renderTable = () => {
        return (
            <div className="card">
                <div className="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped table-hover align-middle text-nowrap">
                            <thead>
                                <tr>
                                    <th>Project Completion [%]</th>
                                    <th>Project Completion Date</th>
                                    <th>Updated Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {progressList.map((item) => (
                                    <tr>
                                        <td>{item.formFields.projectCompletion || ''}</td>
                                        <td>{item.formFields.projectCompleteDate && moment(item.formFields.projectCompleteDate).format('DD-MM-YYYY') || ''}</td>
                                        <td>{item.updatedAt && moment(item.updatedAt).format('DD-MM-YYYY') || ''}</td>
                                        <td class="text-center">
                                            {actionRender(item)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <div className="justify-content-center mt-2">
                                <PaginationNew perPage={perPage} totalItems={totalItems}
                                    currentPage={pageNo}
                                    handler={pageChangeHandler} />
                            </div>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
    const closeModal = () => {
        setOpen(false)
        setResponseData()
    }
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

            // Clone submissionData to avoid mutating the original
            const beforePayload = { ...submissionData };
            delete beforePayload.accessToken;
            delete beforePayload.apiBasePath;
            delete beforePayload.formName;

            console.log('Submission Data:', submissionData);
            console.log('Payload Data (sanitized):', beforePayload);

            // Construct base payload
            let payload = {
                formId,
                userComment: "",
                formFields: {
                    ...beforePayload,
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
            const formEntryId = responseData?._id;

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
                // getFormDataByRowId(response?.data?._id)
                closeModal();
                // if(type==="building"){
                getLists();
                // }
                // getFormDataByRowId(response?.data?._id)
            } else {
                toast.error(response?.meta?.msg || 'Submission failed');
            }

        } catch (err) {
            console.error('Validation or submission error:', err);
            toast.error('An unexpected error occurred during submission.');
        }

    };
    return (<>
        <div className="container-fluid">
            <div className="main-title">
                <FilterWithButtonsCard title="Over All Project Progress" headerButtons={headerButtons()} />
            </div>

            {progressList?.length > 0 ? (
                renderTable()
            ) : (
                <div className={`card shadow-sm h-100 card-body not-answerd-card`}>
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
                    Add Progress
                </Modal.Title>
                <i
                    className="fa fa-times ms-auto"
                    role="button"
                    onClick={closeModal}
                    style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                />
            </Modal.Header>

            <Modal.Body>

                {/* BUILDING */}

                <div className="container-fluid">
                    <Form
                        ref={formRef}
                        submission={{ data: { ...responseData?.formFields, accessToken, apiBasePath: Constant.apiBasePath } }}
                        form={formSchema}
                        options={{
                            readOnly: type == "view"
                        }}
                    />
                </div>
            </Modal.Body>
            {type !== "view" &&
                <Modal.Footer>
                    <CustomButton label={'Submit'} onClick={handleSubmit} appendClass="text-white" />
                </Modal.Footer>
            }
        </Modal>

    </>)
}
export default OverAllProjectProgress;