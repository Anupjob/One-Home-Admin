import React from "react";
import CustomButton from "../../../Utils/CustomButton";

const VerifyDataEntry = ({setIsVerifyDataEntryVerified, type, handleSubmit, recommendationData}) => {
    const [selectedOption, setSelectedOption] = React.useState(recommendationData?.verifyDataEntry?.selectedOption || 'no');
    const [remarks, setRemarks] = React.useState(recommendationData?.verifyDataEntry?.remarks || "");

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };
  return (
    <div className="card shadow-sm h-100 card-body">
        <label>Have you verified the details in data entry section?</label>
        <div className="d-flex align-items-center" style={{ gap: "1rem" }}>
          <div className="form-check d-flex align-items-center">
      <input disabled={type==="view" || recommendationData?.duplicateProjects?.status} className="form-control" type="radio" value="no" checked={selectedOption === "no"} onChange={handleOptionChange}/> 
      <label className="mt-1 mx-1">No</label>
      </div>
      <div className="form-check d-flex align-items-center">  
      <input disabled={type==="view" || recommendationData?.duplicateProjects?.status} className="form-control" type="radio" value="yes" checked={selectedOption === "yes"} onChange={handleOptionChange}/> 
    <label className="mx-1 mt-1">Yes</label>
      </div>
      </div>
      {selectedOption=="yes"&&(<>
      <label>Remarks *</label>
      <textarea maxLength={5000} disabled={type==="view" || recommendationData?.duplicateProjects?.status} className="form-control mt-2" placeholder="Enter remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
   {type!=="view"&& !recommendationData?.duplicateProjects?.status &&
    <div className="d-flex justify-content-end mt-3">
      <CustomButton className="btn btn-primary" appendClass="text-white" label={'Submit'} disabled={selectedOption === "yes" && remarks.trim() === ""} onClick={() => {setIsVerifyDataEntryVerified(true); handleSubmit('DRAFT', 'verifyDataEntry', { selectedOption, remarks })}}/>
    </div>
}
     </>)}
  </div>
);
}

export default VerifyDataEntry;