import React, { useState, useEffect } from "react";
import FilterWithButtonsCard from "../../../../Utils/FilterWithButtonsCard";
import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../../../../Utils/CustomButton";
import postApiCall from "../../../../Services/postApiCall";
import { useParams } from "react-router-dom";

const CreatePaymentPlan = () => {
    const { type } = useParams()
    const location = useLocation();
    const navigate = useNavigate();
    let data = location.state;
    const [stageList, setStageList] = React.useState([]);
    const [paymentPlanId, setPaymentPlanId] = useState()
    const [paymentPlanName, setPaymentPlanName] = useState('')
    const [builderSubvention, setBuilderSubvention] = useState('NO')
    const [planType, setPlanType] = useState('')
    const [priceMultiplier, setPriceMultiplier] = useState('1.0')
    const [bookingStartDate, setBookingStartDate] = useState('')
    const [bookingEndDate, setBookingEndDate] = useState('')
    const [subventionPeriods, setSubventionPeriods] = useState('')
    const [subventionType, setSubventionType] = useState('')
    const [createPaymentResponse, setCreatePaymentResponse] = useState(data.paymentStructure)
    const [remarks, setRemarks] = useState('')
  useEffect(() => {
    // Check if page was loaded before
    const hasVisited = sessionStorage.getItem("hasVisited");
    console.log('hasVisited::::',hasVisited)

    if (hasVisited) {
      sessionStorage.removeItem("hasVisited")
      // Page was loaded before → this is likely a refresh
      if(type == "create"){
     navigate(-3)
      }
      else{
         navigate(-2)
      }
      
    } else {
      // First time visiting this page
      sessionStorage.setItem("hasVisited", "true");
    }
    return(()=>sessionStorage.removeItem("hasVisited"))
  }, []);

    useEffect(() => {
        // if(data?.selectedPaymentPlan?.formFields?.dataGrid?.length>0){
        //     setStageList(data?.selectedPaymentPlan?.formFields?.dataGrid?.map((dt)=>{
        //         dt["recommendedDisbursementProject"]=dt.recommendedDisbursement ||0;
        //         return dt;
        //     }))
        if (type == "create") {
        handleCreate()
        }
        else {
            let resp = data.paymentStructure;
            let grouped = paymentStructureGroup(data.paymentStructure)
            console.log('grouped::::::', grouped, data)
            if (resp && !Array.isArray(resp) && typeof resp === "object") {
                setCreatePaymentResponse({ ...resp, paymentStructure: grouped });
            } else {
                setCreatePaymentResponse(grouped);
            }
            setPlanType(data.planType || '')
            setPriceMultiplier(data.priceMultiplier || 1.0)
            setBuilderSubvention(data.builderSubvention || '')
            setBookingEndDate((data.bookingEndDate&& new Date(data.bookingEndDate)) || '')
            setBookingStartDate((data.bookingStartDate&& new Date(data.bookingStartDate)) || '')
            setSubventionPeriods(data.subventionPeriodInMonths || '')
            setSubventionType(data.subventionType || '')
            setRemarks(data.remarks || '')
            setPaymentPlanId(data._id)
            setPaymentPlanName(data.planName)
        }
        // }
    }, [data])


    // Recursive flatten function for nested merged stages
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

    // Build stagesMerge for entire list
    function buildStagesMergeList(stageList) {
        const stageMergeList = [];
        stageList.map(item => {
            if (item?.mergedStages?.length > 0) {
                // No merges → keep as single stage

                const allStages = flattenAllStages(item.mergedStages);
                const lastMergeName = getLastMergeName(item.mergedStages) || item.stageOfConstruction;
                stageMergeList.push([allStages, lastMergeName]);
            }
        });
        return stageMergeList;
    }

    function buildFloorsMergeList(stageList) {
        const floorsMergeList = [];

        stageList?.forEach(item => {
            if (item?.floorMerges && item?.floorMerges.length) {
                item?.floorMerges.forEach(fm => {
                    // Each merged floor group uses the top-level stageOfConstruction as name
                    floorsMergeList.push([item.stageOfConstruction, fm.floors]);
                });
            }
        });

        return floorsMergeList;
    }
    const handleCreate = async () => {
        let payload = {
            planId: data?.selectedPaymentPlan?._id,
            projectId: data.dataEntryId,
            plotId: data.activeTab == "plot" ? data.ID : null,
            bunglowId: data.activeTab == "bunglow" ? data.ID : null,
            buildingId: data.buildingId,
            wingId: data.buildingId ? data.ID : null,
            noOfFloors: data.noOfFloors || 0,
            stagesMerge: buildStagesMergeList(data.mergeStageFloor) || [],
            floorsMerge: buildFloorsMergeList(data.mergeStageFloor) || []

        }
        const response = await postApiCall('admin/apf-flow/create-payment-plan', payload)
        if (response.meta.status) {
            const resp = response?.data?.paymentStructure || [];
            setPaymentPlanId(response?.data?._id)
            setPaymentPlanName(response?.data.planName)
            // store grouped result — if original resp was an object with paymentStructure key, replace it,
            // otherwise just store the grouped array
            let grouped = paymentStructureGroup(resp)
            if (resp && !Array.isArray(resp) && typeof resp === "object") {
                setCreatePaymentResponse({ ...resp, paymentStructure: grouped });
            } else {
                setCreatePaymentResponse(grouped);
            }
        }

    }

    const paymentStructureGroup = (resp) => {
        let paymentStructureArray = [];

        // normalize to an array of payment structure entries
        if (Array.isArray(resp)) {
            paymentStructureArray = resp;
        } else if (resp && Array.isArray(resp.paymentStructure)) {
            paymentStructureArray = resp.paymentStructure;
        }

        // Ensure each entry has a recommendedDisbursementProject fallback and keep immutability
        paymentStructureArray = paymentStructureArray.map((p) => ({
            ...p,
            recommendedDisbursementProject: p.recommendedDisbursementProject ?? p.recommendedDisbursement ?? 0,
        }));

        // Group by stageOfConstruction while preserving first-seen order
        const map = {};
        const orderedKeys = [];
        paymentStructureArray.forEach((item) => {
            const key = item.stageOfConstruction ?? "Unknown";
            if (!map[key]) {
                map[key] = [];
                orderedKeys.push(key);
            }
            map[key].push(item);
        });
        console.log('map::::::', map, orderedKeys)
        const grouped = orderedKeys.map((k) => ({
            stageOfConstruction: k,
            isFloorWiseSeperation: map[k][0]?.floorNumber ? true : false,
            paymentStructure: map[k] || [],
        }));

        return grouped;
    };
    console.log('createpayment::::', createPaymentResponse)
    const handleUpdateSubmit = async () => {
        let payload = {
            paymentPlanId: paymentPlanId,
            planType,
            priceMultiplier,
            builderSubvention,
            bookingStartDate,
            bookingEndDate,
            subventionType,
            subventionPeriodInMonths: subventionPeriods,
            paymentStructure: ungroupPaymentStructure(createPaymentResponse),
            remarks

        }
        const response = await postApiCall('admin/apf-flow/update-payment-plan', payload)
        if (response.meta.status) {
            if (type == "create") {
                navigate(-2)
            }
            else {
                navigate(-1)
            }
        }

    }

    const ungroupPaymentStructure = (grouped) => {
        if (!grouped) return [];
        // If caller passed an object with paymentStructure key, extract it
        let groups = grouped;
        if (
            grouped &&
            !Array.isArray(grouped) &&
            typeof grouped === "object" &&
            Array.isArray(grouped.paymentStructure)
        ) {
            groups = grouped.paymentStructure;
        }
        if (!Array.isArray(groups)) return [];

        // Flatten while preserving stageOfConstruction (prefer per-row value, fallback to stage header)
        const flat = [];
        groups.forEach((stage) => {
            const stageName = stage?.stageOfConstruction ?? null;
            const rows = Array.isArray(stage?.paymentStructure) ? stage.paymentStructure : [];
            rows.forEach((row) => {
                flat.push({
                    ...row,
                    isMergedFloor: row.isMergedFloor,
                    isMergedStage: row.isMergedStage,
                    floorNumber: row.floorNumber ?? null,
                    stageOfConstruction: row?.stageOfConstruction ?? stageName,
                    workCompleted: row?.workCompleted || '',
                    recommendedDisbursementMaster: row?.recommendedDisbursementMaster || '',
                    recommendedDisbursementProject: row?.recommendedDisbursementProject || ''
                });
            });
        });
        return flat;
    };



    const handleChangeProject = (value, stageIndex, rowIndex) => {
        setCreatePaymentResponse(prev => {
            if (!Array.isArray(prev)) return prev;
            return prev.map((stage, sIdx) => {
                if (sIdx !== stageIndex) return stage;
                // shallow copy stage
                const newStage = { ...stage };
                // if a rowIndex is provided, update that specific paymentStructure row immutably
                if (typeof rowIndex === "number") {
                    newStage.paymentStructure = (stage.paymentStructure || []).map((p, pIdx) =>
                        pIdx === rowIndex ? { ...p, recommendedDisbursementProject: value } : p
                    );
                } else {
                    // fallback: update stage-level recommendedDisbursementProject
                    newStage.recommendedDisbursementProject = value;
                }
                return newStage;
            });
        });
    };
    console.log('data:stageList:::', data)

    return (<>
        <div className="container-fluid">
            <div className="main-title">
                <FilterWithButtonsCard title="Create Payment Plan" />
            </div>
            <div className="card mt-3">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <label className="fw-semibold">Payment Plan Name</label>
                            <input type="text" disabled value={paymentPlanName} className="form-control" placeholder="Enter Payment Plan Name" />
                        </div>

                        {data.activeTab == "building" ? (<>
                            <div className="col-md-4">
                                <label className="fw-semibold">Building Name</label>
                                <input type="text" value={data.buildingName || '-'} disabled className="form-control" placeholder="Enter Building Name" />
                            </div>
                            <div className="col-md-4">
                                <label className="fw-semibold">Wing Name</label>
                                <input type="text" value={data.wingName || '-'} disabled className="form-control" placeholder="Enter Wing Name" />
                            </div>
                        </>)
                            : (
                                <div className="col-md-4">
                                    <label className="fw-semibold">Unit No.</label>
                                    <input type="text" disabled value={data.unitNo || '-'} className="form-control" placeholder="Enter Building Name" />
                                </div>
                            )}
                        <div className="col-md-4">
                            <label className="fw-semibold">Plan Type</label>
                            <select disabled={data?.planType} onChange={(e) => setPlanType(e.target.value)} value={planType} className="form-control">
                                <option value={''}>Select...</option>
                                <option value={'ADF'}>ADF</option>
                                <option value={'Accelerated'}>Accelerated</option>
                                <option value={'Time Bound'}>Time Bound</option>
                                <option value={'Construction Linked'}>Construction Linked</option>
                                <option value={'Flexi'}>Flexi</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="fw-semibold">Price Multiplier</label>
                            <input type="number" value={priceMultiplier} onChange={(e) => setPriceMultiplier(e.target.value)} className="form-control" placeholder="Enter Price Multiplier" />
                        </div>
                        <div className="col-md-4">
                            <label className="fw-semibold">Builder Subvention</label>
                            <div className="form-group">
                                <label className="me-3">
                                    <input
                                        type="radio"
                                        name="builderSubvention"
                                        value="YES"
                                        checked={builderSubvention === 'YES'}
                                        onChange={(e) => setBuilderSubvention(e.target.value)}
                                    /> Yes
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="builderSubvention"
                                        value="NO"
                                        checked={builderSubvention === 'NO'}
                                        onChange={(e) => setBuilderSubvention(e.target.value)}
                                    /> No
                                </label>
                            </div>
                        </div>
                        {builderSubvention == "YES" && (<>
                            <div className="col-md-4">
                                <label className="fw-semibold">Booking Start Date</label>
                                <input type="date" value={bookingStartDate} onChange={(e) => setBookingStartDate(e.target.value)} className="form-control" placeholder="Enter Booking Start Date" />
                            </div>
                            <div className="col-md-4">
                                <label className="fw-semibold">Booking End Date</label>
                                <input type="date" value={bookingEndDate} onChange={(e) => setBookingEndDate(e.target.value)} className="form-control" placeholder="Enter Booking End Date" />
                            </div>
                            <div className="col-md-4">
                                <label className="fw-semibold">Subvention Type</label>
                                <select onChange={(e) => setSubventionType(e.target.value)} value={subventionType} className="form-control">
                                    <option value={''}>Select...</option>
                                    <option value={'Interest'}>Interest</option>
                                    <option value={'EMI'}>EMI</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="fw-semibold">Subvention Periods (Months)</label>
                                <input type="text" value={subventionPeriods} onChange={(e) => setSubventionPeriods(e.target.value)} className="form-control" placeholder="Enter Subvention Type" />
                            </div>
                        </>)}
                    </div>

                </div>
            </div>

            {createPaymentResponse?.map((item, index) => (
                <div className="card mt-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">{item.stageOfConstruction}</h6>
                    </div>
                    <div className="card-body">
                        <div className="table-container-wrapper">
                            <div className="table-wrapper">
                                <table className="table table-bordered" width="100%" cellSpacing="0" style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                    <thead style={{ backgroundColor: "#FCFCFD" }}>
                                        <tr>
                                            <th>
                                                Stage of Construction
                                            </th>
                                            {item.isFloorWiseSeperation &&
                                                <th>
                                                    Floor
                                                </th>
                                            }
                                            <th>
                                                Work Completed [%]
                                            </th>
                                            <th>
                                                Recommended Disbursement [%] - Master
                                            </th>
                                            <th>Recommended Disbursement [%] - Project *</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.paymentStructure?.map((subItem, ind) => {
                                            return (
                                                <tr key={subItem}>
                                                    <td>{subItem.stageOfConstruction + ' ' + (ind + 1)}  </td>
                                                    {subItem?.floorNumber &&
                                                        <td>{subItem?.floorNumber}</td>
                                                    }
                                                    <td>{subItem.workCompleted}</td>
                                                    <td>{subItem.recommendedDisbursementMaster}</td>
                                                    <td>
                                                        <input class="form-control" value={subItem.recommendedDisbursementProject} onChange={(e) => handleChangeProject(e.target.value, index, ind)} />
                                                    </td>
                                                </tr>
                                            )
                                        })}

                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div className="card mt-3">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-12">
                            <label className="fw-semibold">Remarks *</label>
                            <textarea type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="form-control" placeholder="Enter Remarks..." />
                        </div>
                    </div>
                </div>
            </div>
            <div className="card mt-3">
                <div className="card-footer d-flex justify-content-end">
                    <CustomButton label={'Create Plan'} appendClass="text-white" onClick={handleUpdateSubmit} />
                </div>
            </div>
        </div>
    </>)
}
export default CreatePaymentPlan;   