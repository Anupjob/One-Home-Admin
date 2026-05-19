import React, {useState, useEffect} from "react";
import CustomButton from "../../../Utils/CustomButton";
import getApiCall from "../../../Services/getApiCall";

const Deviation = ({workFlowId, type,  setCurrentParentIndex, workflowData, handleSubmit, recommendationData}) => {
  const [deviationData, setDeviationData] = useState(null);
  useEffect(() => {
    getDeviationData();
  }, []);

  useEffect(()=>{
    if(recommendationData?.deviation)
setDeviationData(recommendationData?.deviation)
  },[recommendationData])

  const getDeviationData = async () => {
    try {
      const response = await getApiCall(
        `admin/apf-flow/project/rtm-deviation/${workFlowId}/${workflowData?._id}`
      );
  
      if (response?.meta?.status) {
            setDeviationData(response.data)  // <-- merge project docs into response data
      }
  
    } catch (error) {
      console.error("Error loading form schema:", error);
    }
  };
  console.log("deviationData", deviationData)
  return (<>
    <div>
      {deviationData?.isROCskip && (<>
      <h6>Agency Type: ROC - Skipped</h6>
      <div className="card">
        <div className="card-body">
      <label>User Authority</label>
      <select className="form-control w-25 mb-3" disabled={type=="view" || recommendationData?.deviation} aria-label="Select Deviation Type" value={deviationData?.rocSkipDeviationType} onChange={(e)=>setDeviationData({...deviationData, rocSkipDeviationType:e.target.value})}>
        <option value="">Select Deviation Type</option>
        <option value="L3">L3</option>
        <option value="L4">L4</option>
        <option value="L5">L5</option>
      </select>
 <div className="mb-3">
        <label htmlFor="deviationDescription" className="form-label">Mitigation Plan</label>
        <textarea disabled={type=="view" || recommendationData?.deviation} className="form-control" value={deviationData?.rocSkipMitigationPlan} onChange={(e)=>setDeviationData({...deviationData, rocSkipMitigationPlan:e.target.value})} id="deviationDescription" rows="4" placeholder="Mitigation Plan..."></textarea>
      </div>
      </div>
      </div>
      </>)}

{deviationData?.isFCUskip && (<>
      <h6>Agency Type: FCU - Skipped</h6>
      <div className="card">
        <div className="card-body">
      <label>User Authority</label>
      <select className="form-control w-25 mb-3" disabled={type=="view" || recommendationData?.deviation} aria-label="Select Deviation Type" value={deviationData?.fcuskipDeviationType} onChange={(e)=>setDeviationData({...deviationData, fcuskipDeviationType:e.target.value})}>
        <option value="">Select Deviation Type</option>
        <option value="L3">L3</option>
        <option value="L4">L4</option>
        <option value="L5">L5</option>
      </select>
 <div className="mb-3">
        <label htmlFor="deviationDescription" className="form-label">Mitigation Plan</label>
        <textarea className="form-control" disabled={type=="view" || recommendationData?.deviation} value={deviationData?.fcuskipMitigationPlan} onChange={(e)=>setDeviationData({...deviationData, fcuskipMitigationPlan:e.target.value})} id="deviationDescription" rows="4" placeholder="Mitigation Plan..."></textarea>
      </div>
      </div>
      </div>
      </>)}
{deviationData?.exposureDeviation&&Object.keys(deviationData?.exposureDeviation)?.length>0 && (<>
<h6>Exposure</h6>
{Object.keys(deviationData?.exposureDeviation)?.map((key)=>(<>
{Object.keys(deviationData?.exposureDeviation[key] || {}).length == 0 &&  (<>
  <div className="card mt-2">
    <div className="card-body">
  <div><span>{key} -</span> <span className="fw-bold" style={{fontWeight:800}}> {deviationData?.exposureDeviation[key]} %</span></div>
      <label>User Authority</label>
      <select className="form-control w-25 mb-3" disabled={type=="view" || recommendationData?.deviation} aria-label="Select Deviation Type" value={deviationData?.exposureDeviation['exposure_' + key]?.type} onChange={(e)=>setDeviationData({...deviationData, exposureDeviation:{...deviationData?.exposureDeviation, ['exposure_' + key]:{...deviationData?.exposureDeviation['exposure_' + key], type:e.target.value}}})}>
        <option value="">Select Deviation Type</option>
        <option value="L3">L3</option>
        <option value="L4">L4</option>
        <option value="L5">L5</option>
      </select>
 <div className="mb-3">
        <label htmlFor="deviationDescription" className="form-label">Mitigation Plan</label>
        <textarea className="form-control" disabled={type=="view" || recommendationData?.deviation} value={deviationData?.exposureDeviation['exposure_' + key]?.mitigationPlan} onChange={(e)=>setDeviationData({...deviationData, exposureDeviation:{...deviationData?.exposureDeviation, ['exposure_' + key]:{...deviationData?.exposureDeviation['exposure_' + key], mitigationPlan:e.target.value}}})} id="deviationDescription" rows="4" placeholder="Mitigation Plan..."></textarea>
      </div>
</div>
</div>
</>)}
 </>))}
 </>)}
      <div className="mb-3">
        <label htmlFor="deviationDescription" className="form-label">Remark</label>
        <textarea className="form-control" disabled={type=="view" || recommendationData?.deviation} value={deviationData?.remark} onChange={(e)=>setDeviationData({...deviationData, remark:e.target.value})} id="deviationDescription" rows="4" placeholder="Remark..."></textarea>
      </div>
      {(type!=="view" && !recommendationData?.deviation)&&(
<div className="d-flex justify-content-end">
     <CustomButton label={"Cancel"}  variant="outline"   updateBgColor ="#fff" onClick={() => setCurrentParentIndex(null)}/>
      <CustomButton label={"Submit"}  appendClass="text-white mx-2" onClick={() => handleSubmit('DRAFT', 'deviation', deviationData)}/>
      </div>
      )}
    </div>
  </>);
};

export default Deviation;