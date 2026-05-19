import React, {useState, useRef, useEffect} from "react";
import { Form } from 'react-formio';
import { useParams } from "react-router-dom";
import getApiCall from "../../Services/getApiCall";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";
import ReusableAccordion from "../../Utils/Accordion/ReusableAccordion";
import loginUser from "../../Services/loginUser";
import Constant from "../../Components/Constant";
import 'formiojs/dist/formio.full.min.css';
import ModuleForms from "../FormBuilder/ModuleForms";
import { useLocation } from "react-router-dom";
import { toTitleCase } from "../../Utils/Helpers";


const WorkFlowFormRender = () => {
    const formRef = useRef();
      const location = useLocation();
      const params = new URLSearchParams(location.search);
  const action = params.get('action');
    const workflowName = params.get('workflowName');
  let {accessToken} = loginUser();
    const [responseData, setResponseData] = useState(null);
    const { wofId, instanceId } = useParams();
useEffect(()=>{
getList()
},[])
      function getList() {
        getApiCall(`admin/workflow-instance/detail/${wofId}/${instanceId}`).then((response) => {
          if (response.meta.status) {
            setResponseData(response.data)
          }
        })
          .catch((error) => {
            // setWorkflows([])
            // setTotalItems(0)
          })
    
      }
console.log('responseData:::::',responseData)
  return (
    <div className="container-fluid">
        <div className="main-title">
     <FilterWithButtonsCard title={toTitleCase(workflowName)}/>
     </div>
{responseData&&responseData?.formResponses?.map((res)=>{
    let dymamicFormSchema = {
    display: "form",
    components: res.moduleFormData || []
  }

  let formData = res.responseData ||{};
  let formId = res.formId;
  let formName = res.formName;

    return(<>
    <ReusableAccordion title={res.name} key={res._id}>
        <ModuleForms formId={formId} formName={formName} type={action}/>
  {/* <Form
                    onCustomEvent={(event) => {
                      console.log('Custom Event:', event);
                    //   if (event.type === 'download') {
                    //     downloadFileByUrl(event.url, event.name);
                    //   }
                    }}
                    form={dymamicFormSchema}
                    // form={selectedButton == 'APPROVED' ? filterApproveformSchema : filterRejectformSchema}
                    // ref={formRef}
                    ref={formRef}
                    submission={{ data: { ...formData, accessToken, apiBasePath: Constant.apiBasePath, workFlowId: responseData?.workflowId } }}
                    // onFormLoad={(instance) => {
                    //   setFormioInstance(instance);
                    // }}
                    // onChange={() => {
                    //   if (formRef.current?.formio) {
                    //     addDownloadButtonsToAllFileComponents(formRef.current.formio);
                    //   }
                    //   if (responseData?.fieldsCarriedForward?.length > 0) {
                    //     disableFields(formRef.current?.formio, responseData.fieldsCarriedForward)
                    //   }
                    // }}
                    options={{
                      readOnly: !(action === "edit")
                    }}
                  /> */}
    </ReusableAccordion>
    </>)
})}

  
    </div>
  );
};

export default WorkFlowFormRender;