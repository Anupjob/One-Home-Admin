import React from "react";
import FilterWithButtonsCard from "../../../../../Utils/FilterWithButtonsCard";
import CustomButton from "../../../../../Utils/CustomButton";
import { useNavigate, useLocation } from "react-router-dom";

const BulkUpdate=()=>{
    const navigate=useNavigate()
    const location=useLocation()
    const state=location.state
    const handleGroup=()=>{
navigate('/one-apf/project-progress/group',{state:state})
    }
return(<>
<div className="container-fluid">
    <div className="main-title">
        <FilterWithButtonsCard title="Bulk Update"/>
    </div>
    <div className={`card shadow-sm h-100 card-body not-answerd-card`}>
          <p className="text-muted-not-answerd fst-italic mb-0" style={{ height: `200px`, textAlign: 'center', paddingTop: '80px' }}>
            No Record Found !
          </p>
        </div>
    <footer className="mt-3 d-flex justify-content-end">
        <CustomButton label={'Project Progress Group'} appendClass="text-white" onClick={handleGroup}/>
    </footer>
</div>

</>)
}
export default BulkUpdate;