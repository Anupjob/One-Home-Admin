import React, { useState, useEffect } from "react";
import FilterWithButtonsCard from "../../../../Utils/FilterWithButtonsCard";
import CreatableSelect from "react-select/creatable";
import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../../../../Utils/CustomButton";
import getApiCall from "../../../../Services/getApiCall";
import ConfirmationModal from "../../ConfirmationModal";
import ConstructionMergeStage from "./ConstructionMergeStage";
import FloorMergeStage from "./FloorMergeStage";

const PaymentPlanSelection = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state;
    const [paymentPlanList, setPaymentPlanList] = useState([])
    const [selectedPaymentPlan, setSelectedPaymentPlan] = useState()
    const [paymentPlan, setPaymentPlan] = useState()
    const [isConstructionStage, setIsConstructionStage]=useState(false)
    const [isFloorStage, setIsFloorStage]=useState(false)
    const [confirmConstruction, setConfirmConstruction] = useState(false)
    const [confirmFloor, setConfirmFloor] = useState(false)
    const [constructionStageList, setConstructionStageList] = useState([])
    useEffect(() => {
        getPaymentStagesByPlan()
    }, [])
    const getPaymentStagesByPlan = () => {
        let query = {
            propertyType: data.activeTab=="plot"?"Plot":data.activeTab=="banglow"?"Banglow":"Building-Wing",
            city: 'Ahmedabad',
            state: 'Gujarat'
        }
        getApiCall(`admin/apf-flow/fetch-master-payment-plan?` + new URLSearchParams(query))
            .then((response) => {

                if (response.meta.status) {
                    setPaymentPlanList(response.data || [])
                }
            })
    }

    const handleSelection = (value) => {
        let filterdRow = paymentPlanList.filter((item) => item._id == value.value)[0] || {}
        setSelectedPaymentPlan(filterdRow)
        setConstructionStageList(filterdRow?.formFields?.dataGrid || [])
        setPaymentPlan(value)
    }
    const handleNavigateToCreate = () => {
 setIsConstructionStage(true)
        
    }

    const handleCloseModal=()=>{
        console.log('Flexi::::')
 if(isConstructionStage||confirmConstruction){
            setIsConstructionStage(false)
            if(data.activeTab=="building"){
            setIsFloorStage(true)
            }
            else{
                navigate(`/manage-payment-plans/create`, { state: { ...data, selectedPaymentPlan: selectedPaymentPlan, mergeStageFloor:constructionStageList } });
            }
        }else if(isFloorStage||confirmConstruction){
           navigate(`/manage-payment-plans/create`, { state: { ...data, selectedPaymentPlan: selectedPaymentPlan, mergeStageFloor:constructionStageList } });
        }

    }

    const handleCloseConstruction=()=>{
        if(confirmConstruction){
            setConfirmConstruction(false)
            if(data.activeTab=="building"){
            setIsFloorStage(true)
            }
            else{
                navigate(`/manage-payment-plans/create`, { state: { ...data, selectedPaymentPlan: selectedPaymentPlan, mergeStageFloor:constructionStageList } });
            }
        }
        else if(confirmFloor){
            
                    navigate(`/manage-payment-plans/create`, { state: { ...data, selectedPaymentPlan: selectedPaymentPlan, mergeStageFloor: constructionStageList } });
        }
    }

    const handleConfirm=()=>{
        if(isConstructionStage){
            setConfirmConstruction(true)
            setIsConstructionStage(false)
        }else if(isFloorStage){
            setConfirmFloor(true)
            setIsFloorStage(false)
        }

    }

    // Recursive flatten function
function flattenAllStages(mergedStages) {
  let result = [];
  mergedStages.forEach(ms => {
    if (typeof ms === "string") {
      result.push(ms);
    } else if (ms.stages && Array.isArray(ms.stages)) {
      result.push(...flattenAllStages(ms.stages));
    }
  });
  return result;
}

// Get last merge name from hierarchy (deepest first top-level only)
function getLastMergeName(mergedStages) {
  for (let i = mergedStages.length - 1; i >= 0; i--) {
    const ms = mergedStages[i];
    if (typeof ms === "string") continue;
    if (ms.mergeName) return ms.mergeName;
    if (ms.stages) return getLastMergeName(ms.stages);
  }
  return null;
}

// Build single merge array for one record
function buildSingleMerge(item) {
  if (!item.mergedStages || !item.mergedStages.length) return null;
  const allStages = flattenAllStages(item.mergedStages);
  const lastMergeName = getLastMergeName(item.mergedStages) || item.stageOfConstruction;
  return [allStages, lastMergeName];
}


    return (
        <div className="container-fluid">
            <div className="main-title">
            <FilterWithButtonsCard title={confirmConstruction?"Construction Stages Merge":confirmFloor?"Floors Stage Merge ":"Payment Plan Selection"} />
            </div>
            {(!confirmConstruction && !confirmFloor)?(<>
            <div className="card mt-3">
                <div className="card-body">

        
            <div className="row">
                <div className="col-12 col-xs-4 col-md-4 col-lg-4 mb-3">
                    <label className="fw-semibold">Select Payment Plan</label>
                    <CreatableSelect
                        isClearable
                        placeholder={`Select Payment Plan`}
                        value={paymentPlan}
                        onChange={(option) => handleSelection(option)}
                        options={paymentPlanList.map((item) => ({
                            label: item.formFields.planName,
                            value: item._id,
                        }))}
                    />
                </div>

            </div>
                    </div>
         
            <div className="card-footer d-flex justify-content-end">
                <CustomButton label={'Next'} disabled={!selectedPaymentPlan} appendClass="text-white" onClick={handleNavigateToCreate} />
            </div>
               </div>
               </>)
               :(     <div className="card mt-3">
            <div className="card-body"> 
                <div className="row">
                    <div className="col-md-4">
                                <small className="mb-0">Property Type</small>
                                <p className="fw-bold">{data.activeTab || '-'}</p>
                    </div>
                    {data.activeTab=="building" ? (<>
                       <div className="col-md-4">
                                <small className="mb-0">Building Name</small>
                                <p className="text-muted">{data.buildingName || '-'}</p>
                    </div>
             
                       <div className="col-md-4">
                                <small className="mb-0">Wing Name</small>
                                <p className="text-muted">{data.wingName || '-'}</p>
                    </div>
                          </> )
                        :(<>
                         <div className="col-md-4">
                                <small className="mb-0">Unit No.</small>
                                <p className="text-muted">{data.unitNo || '-'}</p>
                    </div>
                        </>)}
                              <div className="col-md-4">
                                <small className="mb-0">Payment Plan Name</small>
                                <p className="text-muted">{selectedPaymentPlan?.formFields?.planName|| '-'}</p>
                    </div>
                </div>
        </div>
      </div>)
               }
               <ConfirmationModal 
               show={isConstructionStage || isFloorStage}  
               onClose={handleCloseModal} 
               comment={isConstructionStage?'Do you want to merge the stages of construction?':'Do you want to merge floors within the stages of construction?'}
               firstButton="Yes"
               secondButton="No"
               isAlert={true}
               onConfirm={handleConfirm}
               />
               {confirmConstruction&&
               <ConstructionMergeStage 
               constructionStageList={constructionStageList} 
               setConstructionStageList={setConstructionStageList}
               handleCloseModal={handleCloseConstruction}
               />
               }
               {confirmFloor&&
               <FloorMergeStage 
               data={data}
               constructionStageList={constructionStageList} 
               setConstructionStageList={setConstructionStageList}
               handleCloseModal={handleCloseConstruction}
               />
               }
        </div>
    )

}
export default PaymentPlanSelection;