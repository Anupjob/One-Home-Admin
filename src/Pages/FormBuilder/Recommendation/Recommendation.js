import React, { useState, useEffect, useRef } from "react";
import ReusableAccordion from "../../../Utils/Accordion/ReusableAccordionFormIo";
import FilterWithButtonsCard from "../../../Utils/FilterWithButtonsCard";
import VerifyDataEntry from "./VerifyDataEntry";
import Deviation from "./Deviation";
import DedupeStatus from "./DedupeStatus";
import CustomButton from "../../../Utils/CustomButton";
import DuplicateProjects from "./DuplicateProjects";
import ConfirmationModal from "../ConfirmationModal";
import getApiCall from "../../../Services/getApiCall";
import postApiCall from "../../../Services/postApiCall";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import { Form } from "react-formio";
import Constant from "../../../Components/Constant";
import loginUser from "../../../Services/loginUser";

const Recommendation = ({ idFromURL, workFlowId, formId, type, formData, recommendationFormData }) => {
  console.log('recommendationFormData::::::',recommendationFormData)
  let { accessToken } = loginUser();
  const formRef = useRef(null);
  const [currentParentIndex, setCurrentParentIndex] = useState(null);
  const [isVerifyDataEntryVerified, setIsVerifyDataEntryVerified] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isHoldOpen, setIsHoldOpen] = useState(false);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [workflowData, setWorkflowData] = useState(null);
  const [projectResponseData, setProjectResponseData] = useState(null);
  const [recommendationData, setRecommendationData] = useState()
    const [formSchema, setFormSchema] = useState({
      display: "form",
      components: []
    });
  const handleRejectionConfirm = () => {
    // Handle the confirmation action here (e.g., send back the project)
    setRejectOpen(false);
    // Optionally, show a success message or perform additional actions
  }

  const handleHoldConfirm = () => {
    // Handle the hold confirmation action here (e.g., put the project on hold)
    setIsHoldOpen(false);
    // Optionally, show a success message or perform additional actions
  }

  useEffect(() => {
    if (workFlowId) {
      getSecondFormDataById(workFlowId)
    }
  }, [workFlowId])

    useEffect(() => {
    if (recommendationFormData) {
      setRecommendationData(recommendationFormData?.formFields)
    }
  }, [recommendationFormData])

  const getSecondFormDataById = async (workFlowId, type) => {
    try {
      let url = ''
      if(type=="AssignForApproval" && !projectResponseData){
        url =  `admin/workflow-instance/by-form-response/${workFlowId}/${formId}/${idFromURL}?collectionName=form_project`
      }
      else{
        url = `admin/workflow-instance/by-form-response/${workFlowId}/${formId}/${idFromURL}`
      }
      const response = await getApiCall(
        url
      );

      if (response?.meta?.status) {
        if(type=="AssignForApproval"){
        setProjectResponseData(response.data)
        getFormDataById()
        }
        else{
        setWorkflowData(response.data)
        }
      }

    } catch (error) {
      console.error("Error loading form schema:", error);
    }
  };

     const getFormDataById = () => {
      getApiCall(`admin/dynamic/form/details/69e9d9472bed16f0b56f215d`)
        .then((response) => {
          if (response.meta.status) {
             setFormSchema({
              display: "form",
              components: [...response.data.moduleFormData]
            });
            setApprovalOpen(true)
          }
        })
        .catch((error) => {
          console.error("Error loading form schema:", error);
        });
    };
  

  const handleSubmitStatus = async (status) => {
    let body = {
      status: status
    }
    const url = `admin/apf-flow/project/reject/${workFlowId}/${workflowData?._id}`;
    try {
      const res = await postApiCall(url, body);
      if (res.meta.status) {
        toast.success(res.meta.msg)
        setIsHoldOpen(false);
        setApprovalOpen(false);
        setSendBackOpen(false);
        setRejectOpen(false);
      }
      else {
        toast.error(res.meta.msg)
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }

    const handleSubmit = async (status,key, keyData) => {
      const recommendationFields= {...recommendationData,[key]: keyData}
      setRecommendationData(recommendationFields)
    let payload = {
        formId,
        userComment: "",
        formFields: {
          ...recommendationFields,
          h0Name: formData?.h0Name || '',
          h1Name: formData?.h1Name || '',
          h2Name: formData?.h2Name || '',
          h3Name: formData?.h3Name || '',
          h4Name: formData?.h4Name || '',
          h5Name: formData?.h5Name || '',
          dataEntryId: idFromURL,
        },
        status: status
      };
      if(key=="approvalForum"){
        payload={
          ...payload,
          formFields:{...payload.formFields, forumId: keyData?.forumName}
        }
      }
    const url = `admin/submit/form/update/${idFromURL}`;
    try {
      const res = await postApiCall(url, payload);
      if (res.meta.status) {
        toast.success(res.meta.msg)
      }
      else {
        toast.error(res.meta.msg)
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }


   const handleSubmitAddAssignApproval = async () => {
    if (!formRef.current || !formRef.current.formio) return;

    const formio = formRef.current.formio;

    // Access the current data
    const submissionData = formio.submission?.data || {};
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
      delete submissionData.accessToken;
      delete submissionData.apiBasePath;
      delete submissionData.formName;
    let payload = {
        formId:'69e9d9472bed16f0b56f215d',
        userComment: "",
        formFields: {
          ...submissionData,
          h0Name: formData?.h0Name || '',
          h1Name: formData?.h1Name || '',
          h2Name: formData?.h2Name || '',
          h3Name: formData?.h3Name || '',
          h4Name: formData?.h4Name || '',
          h5Name: formData?.h5Name || '',
          recommendationId: idFromURL,
        },
        status: 'SUBMITTED'
      };
    const url = `admin/submit/form/add`;
    try {
      const res = await postApiCall(url, payload);
      if (res.meta.status) {
       handleSubmit('SUBMITTED', 'approvalForum', submissionData)
        setApprovalOpen(false)
        toast.success(res.meta.msg)
      }
      else {
        toast.error(res.meta.msg)
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }

  return (
    <div>
      {isVerifyDataEntryVerified ? <DuplicateProjects idFromURL={idFromURL} workFlowId={workFlowId} formId={formId} setIsVerifyDataEntryVerified={setIsVerifyDataEntryVerified} handleSubmit={handleSubmit} formData={formData}/> : (<>
        <div className="main-title">
          <FilterWithButtonsCard title="Recommendation" />
        </div>
        <ReusableAccordion title="Verify Data Entry"
          isOpen={currentParentIndex === 1}
          onToggle={() => setCurrentParentIndex(currentParentIndex === 1 ? null : 1)}
        >
          <VerifyDataEntry setIsVerifyDataEntryVerified={setIsVerifyDataEntryVerified} type={type} handleSubmit={handleSubmit} recommendationData={recommendationData}/>
        </ReusableAccordion>
        <ReusableAccordion title="Deviation"
          isOpen={currentParentIndex === 2 && recommendationData?.duplicateProjects}
          onToggle={() => setCurrentParentIndex(currentParentIndex === 2 ? null : 2)}
        >
          <Deviation workFlowId={workFlowId} type={type} setCurrentParentIndex={setCurrentParentIndex} workflowData={workflowData} handleSubmit={handleSubmit} recommendationData={recommendationData}/>
        </ReusableAccordion>
        <ReusableAccordion title="Dedupe Status"
          isOpen={currentParentIndex === 3 && recommendationData?.deviation}
          onToggle={() => setCurrentParentIndex(currentParentIndex === 3 ? null : 3)}
        >
          <DedupeStatus recommendationData={recommendationData}/>
          {/* Recommendation content goes here */}
        </ReusableAccordion>
        {(type !== "view" || recommendationFormData?.status!=="APPROVED")&&
          <div className="d-flex justify-content-end mt-3 mb-3">
            {recommendationFormData?.status!=="APPROVED"&&
            <CustomButton className="btn btn-primary" appendClass="text-white" label={'Send Back'} onClick={() => setSendBackOpen(true)} />
            }
            <CustomButton className="btn btn-primary" appendClass="text-white" label={'Hold'} onClick={() => setIsHoldOpen(true)} />
            <CustomButton className="btn btn-primary" appendClass="text-white" label={'Reject'} onClick={() => setRejectOpen(true)} />
             {recommendationFormData?.status!=="APPROVED"&&
            <CustomButton className="btn btn-primary" appendClass="text-white" label={'Assign For Approval'} onClick={() => getSecondFormDataById(workFlowId, 'AssignForApproval')} />
             }
          </div>
        }
      </>)}

      {rejectOpen && <ConfirmationModal
        show={rejectOpen}
        onClose={() => setRejectOpen(false)}
        firstButton="Yes"
        secondButton="No"
        onConfirm={() => handleSubmitStatus('REJECTED')}
        isAlert
        comment={'Are you sure you want to reject this project?'}
      />}
      {isHoldOpen && <ConfirmationModal
        show={isHoldOpen}
        onClose={() => setIsHoldOpen(false)}
        firstButton="Yes"
        secondButton="No"
        onConfirm={() => handleSubmitStatus('ONHOLD')}
        isAlert
        comment={'Are you sure you want to put this project on hold?'}
      />}

      {sendBackOpen && <ConfirmationModal
        show={sendBackOpen}
        onClose={() => setSendBackOpen(false)}
        firstButton="Yes"
        secondButton="No"
        // onConfirm={() => handleSubmitStatus('SEND_BACK')}
        isAlert
        comment={'Are you sure you want to send back this project?'}
      />}
      {approvalOpen && <ConfirmationModal
        show={approvalOpen}
        onClose={() => setApprovalOpen(false)}
        firstButton="Yes"
        secondButton="No"
        // onConfirm={() => handleSubmitStatus('SEND_BACK')}
        isAlert
        comment={'Are you sure you want to approval this project?'}
      />}
       {/* ---------------- MODAL ---------------- */}
              <Modal
                show={approvalOpen}
                // onHide={closeModal}
                centered
                size="xl"
                backdrop="static"
              >
                <Modal.Header>
                  <Modal.Title>
                    Assign For Approval
                  </Modal.Title>
                  <i
                  className="fa fa-times ms-auto"
                  role="button"
                  onClick={()=>setApprovalOpen(false)}
                  style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                />
                </Modal.Header>
      
                <Modal.Body>
      
                  {/* BUILDING */}
      
                  <div className="container-fluid">
                    <Form
                      ref={formRef}
                      submission={{ data: { accessToken, apiBasePath: Constant.apiBasePath, projectState:projectResponseData?.responseData?. state ||'', projectCity:projectResponseData?.responseData?.city} }}
                      form={formSchema}
                    />
                  </div>
                </Modal.Body>
                 <Modal.Footer>
                            <CustomButton label={'Approved'} appendClass="text-white" onClick={() => {handleSubmitAddAssignApproval()}}/>
                          </Modal.Footer>
                          </Modal>
      
    </div>
  );
};

export default Recommendation;