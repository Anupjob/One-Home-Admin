import React, {useState, useEffect} from "react";
import FilterWithButtonsCard from "../../../Utils/FilterWithButtonsCard";
import CommonTable from "../../../Utils/CommonTable";
import Constant from "../../../Components/Constant";
import getApiCall from "../../../Services/getApiCall";
import { useParams } from "react-router-dom";
import moment from "moment";
import CustomButton from "../../../Utils/CustomButton";
import ConfirmationModal from "../ConfirmationModal";
import postApiCall from "../../../Services/postApiCall";

const DuplicateProjects = ({idFromURL, workFlowId, formId, setIsVerifyDataEntryVerified, handleSubmit, formData}) => {
        const [pageNo, setPageNo] = useState(1);
        const [totalItems, setTotalItems] = useState(0);
        const [perPage, setPerPage] = useState(Constant.perPage);
        const [duplicateData, setDuplicateData] = useState([]);
        const [projectFormData, setProjectFormData] = useState(null);
        const [remarks, setRemarks] = useState("");
        const [isOpen, setIsOpen] = useState(false);
        const [rtmDetail, setRtmDetail] = useState()

  const getSecondFormDataById = async () => {
  try {
    const response = await getApiCall(
      `admin/workflow-instance/by-form-response/${workFlowId}/${formId}/${idFromURL}?collectionName=form_project`
    );

    if (response?.meta?.status) {

          setProjectFormData(response.data)  // <-- merge project docs into response data
          getList(response.data.responseId)
    }

  } catch (error) {
    console.error("Error loading form schema:", error);
  }
};

const getAssignedRTMDetailById = async () => {
    console.log('formData:::::::duplicate::::',formData)
    try {
        let payload = {
    matchingKey: "projectName",
    matchingValue: formData?.projectName,
    requiredKey: []
  };
      let url = ''
        url =  `admin/submit/form/fetch-values/69b8edeb83fe67d59125a92b`
      const response = await postApiCall(
        url,
        payload
      );

      if (response?.meta?.status) {
        if(Array.isArray(response.data)){
setRtmDetail(response.data[0])
        }
        else{
setRtmDetail(response.data)
            
        }
      }

    } catch (error) {
      console.error("Error loading form schema:", error);
    }
  };

    function pageChangeHandler(page) {
        setPageNo(page);
    }
    useEffect(()=>{
        getAssignedRTMDetailById()
        if(workFlowId && formId && idFromURL){
            getSecondFormDataById()
        }
    },[])
    useEffect(() => {
            getList(projectFormData?.responseId);
        }, [pageNo]);

        const getList = async (projectId) => {
            let query = `?page=${pageNo}&limit=${perPage}`;
            let response = await getApiCall(`admin/apf-flow/fetch-duplicate-projects/${projectId}`);
            if (response.meta.status) {
                const formattedData = response.data.map((item, index) => ({
                    header: `S No: ${(index + 1) + ((pageNo - 1) * perPage)}`, // card header
                    data: [
                        { label: "Project Name", value: item.projectName ? item.projectName : "-" },
                        { label: "City", value: item.city ? item.city : "-" },
                        { label: "Builder Group", value: item.builderGroup ? item.builderGroup : "-" },
                        { label: "Survey No.", value: item.surveyNo ? item.surveyNo : "-" },
                        { label: "Created Date/Time", value: item.createdDateTime ? moment(item.createdDateTime).format('DD-MM-YYYY hh:mm') : "-" },
                        { label: "Status", value: item.status ? item.status : "-" },
                    ],
                    footerId: item._id,
                }));
                setDuplicateData(formattedData);
                setTotalItems(response.data.total);
            }
        }
  return (
    <div>
        <div className="main-title">
        <FilterWithButtonsCard title="Duplicate Projects" />
      </div>
        <div className="card shadow-sm h-100 card-body">
        <CommonTable 
         formattedData={duplicateData?.length > 0 ? duplicateData : []}
                        perPage={perPage}
                        totalItems={totalItems}
                        currentPage={pageNo}
                        handler={pageChangeHandler}
        />
    </div>
            <div className="card shadow-sm h-100 card-body mt-3">
               <label>Remarks *</label>
      <textarea maxLength={5000} type="text" className="form-control mt-2" placeholder="Enter remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
             <div className="d-flex justify-content-end mt-3">
                <CustomButton className="btn btn-primary" variant = "outline" updateBgColor="#fff" label={'Cancel'} onClick={()=>setIsVerifyDataEntryVerified(false)}/>
                <CustomButton className="btn btn-primary" appendClass="mx-1" variant = "outline" updateBgColor="#fff" label={'Reject Dedupe'} onClick={()=>setIsOpen(true)}/>
      <CustomButton className="btn btn-primary"  appendClass="text-white mx-1" label={'Approve Dedupe'} disabled={remarks.trim() === ""} onClick={() => {handleSubmit('DRAFT', 'duplicateProjects', { remarks, status:'APPROVED',dateTime:new Date(),userName:rtmDetail?.userName  }); setIsVerifyDataEntryVerified(false)}}/>
    </div>
    {isOpen && <ConfirmationModal
                show={isOpen}
                onClose={() => setIsOpen(false)}
                firstButton="Yes"
                secondButton="No"
                onConfirm={() => {handleSubmit('DRAFT', 'duplicateProjects', { remarks, status:'REJECTED',dateTime:new Date(),userName:rtmDetail?.userName }); setIsVerifyDataEntryVerified(false)}}
                isAlert
                comment={'Are you sure you want to reject this project?'}
            />}
    </div>
    )
    }

    export default DuplicateProjects;
