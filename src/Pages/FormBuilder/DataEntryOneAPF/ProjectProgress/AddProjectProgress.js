import React, { useState, useEffect } from "react";
import moment from "moment";
import FilterWithButtonsCard from "../../../../Utils/FilterWithButtonsCard";
import CreatableSelect from "react-select/creatable";
import CustomButton from "../../../../Utils/CustomButton";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import getApiCall from "../../../../Services/getApiCall";
import postApiCall from "../../../../Services/postApiCall";
import { toast } from "react-toastify";

const AddProjectProgress = ({

}) => {
    const { type } = useParams();
    const location = useLocation();
    console.log('ocation.state:::', location.state)
    const idFromURL = location?.state?.idFromURL;
    const workFlowId = location?.state?.workFlowId;
    const navigate = useNavigate()
    const [active, setActive] = useState('building')
    const [buildingList, setBuildingList] = useState([])
    const [wingList, setWingList] = useState([])
    const [paymentPlanList, setPaymentPlanList] = useState([])
    const [agencyTypeList, setAgencyTypeList] = useState([
        { label: 'Employee', value: 'Employee' },
        { label: 'Vendor', value: 'Vendor' }
    ])
    const [technicalAgencyList, setTechnicalAgencyList] = useState([])
    const [unitList, setUnitList] = useState([])
    const [formData, setFormData] = useState({})
    const [selectedBuilding, setSelectedBuilding] = useState([]);
    const [selectedWing, setSelectedWing] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState([]);
    const [selectedPaymentPlans, setSelectedPaymentPlans] = useState([]);
    const [selectedAgencyTypes, setSelectedAgencyTypes] = useState([]);
    const [selectedTechnicalAgency, setSelectedTechnicalAgency] = useState(null);
    const [selectFirstData, setSelectFirstData] = useState()
    const [dynamicFields, setDynamicFields] = useState({})
    const [progressId, setProgressId] = useState('')
    // const [formData, setStageOfConstruction]=useState('')
    const [isNext, setIsNext] = useState(false)

    const toValues = (sel) => {
        if (!sel) return [];
        return Array.isArray(sel) ? sel.map(s => s.value ?? s) : sel.value ?? sel;
    };

    const handleBuildingChange = (value) => {
        console.log('value::::', value)
        setSelectedBuilding(value || null);
        setFormData(prev => ({ ...prev, buildingId: toValues(value) }));
        // replace the placeholder with this
        const selected = Array.isArray(value) ? value[0] : value;
        if (selected) {
            // const formId = selected.value ?? selected;
            getLists('68c3e8824a3b18b0efee2019', setWingList, value.value);
        } else {
            setWingList([]);
        }
    };

    const handleWingChange = (value) => {
        setSelectedWing(value || null);
        setFormData(prev => ({ ...prev, wingId: toValues(value) }));
        const filterData = wingList.filter((item) => item._id == toValues(value))[0]
        setSelectFirstData(filterData)
        getPaymentPlans(value.value)
        updateFormData(filterData?.formFields)
    };

    const handleUnitChange = (value) => {
        setSelectedUnit(value || []);
        setFormData(prev => ({ ...prev, unitId: toValues(value) }));
        const filterData = unitList.filter((item) => item._id == toValues(value))[0]
        setSelectFirstData(filterData)
        updateFormData(filterData?.formFields)
        getPaymentPlans(value.value)
    };

    const handlePaymentPlanChange = (value) => {
        setSelectedPaymentPlans(value || []);
        setFormData(prev => ({ ...prev, paymentPlanId: toValues(value) }));
    };

    const handleAgencyTypeChange = (value) => {
        setSelectedAgencyTypes(value || []);
        setFormData(prev => ({ ...prev, agencyType: toValues(value) }));
        getTechnicalListByAgency(toValues(value))
    };

    const handleTechnicalAgencyChange = (value) => {
        setSelectedTechnicalAgency(value || null);
        setFormData(prev => ({ ...prev, technicalAgencyId: value ? (value.value ?? value) : null }));
    };

    const updateFormData = (data) => {
        setFormData((prev) => ({
            ...prev,
            ...data,
            maintenanceCharge: data.maintenanceChargesInr || '',
            waterCharge: data.waterChargesInr || '',
            clubCharge: data.clubChargesInr || '',
            sinkingFund: data.sinkingFundInr || '',
            electricityCharges: data.electricityChargesInr || '',
            reraApprovalNo: data.reraApprovalNo || '',
        }))
    }
    const getLists = async (formId, setValue, buildingId = "") => {
        const response = await getApiCall(`admin/apf-flow/hierarchical-data?formId=${formId}&dataEntryId=${idFromURL}&buildingId=${buildingId}`)

        if (response.meta.status) {
            if (response.data?.items) {
                setValue(response.data?.items)

            }
        }
    }
    console.log('formDatta::::::', formData, selectFirstData,unitList)
    useEffect(() => {
        if (type == "add") {
            getLists("696887e9d3a31d4279a1efce", setBuildingList);
        }
        else {
            const data = location.state.data
            setFormData({ ...data, inspectionDate: data.inspectionDate ? moment(data.inspectionDate).format('YYYY-MM-DD') :'', workCompleted: data.workCompletedPercentage || '', maintenanceCharge:data.maintenanceCharges ||'', waterCharge:data.waterCharges || '', clubCharge:data.clubCharges || '' })
            setDynamicFields({ stages: data.stages })
            if(!data?.unitNumber){
                setActive('building')
            setSelectedBuilding({ label: data.buildingName, value: data.buildingId })
            setSelectedWing({ label: data.wingName, value: data.wingId })
            }
            else{
                if(data.propertyType=="Plot"){
                    setActive('plot')
                }
                else{
                    setActive('bunglow')
                }
            setSelectedUnit({label: data.unitNumber, value: data.unitNumber})
            }
            setSelectedPaymentPlans({ label: data.masterPaymentPlanName, value: data.masterPaymentPlanId })
            setSelectedAgencyTypes({ label: data.agencyType, value: data.agencyType })
            setSelectedTechnicalAgency({ label: data.technicalAgencyName, value: data.technicalAgencyId })
            setIsNext(true)
            setProgressId(data._id)
        }
    }, [])
    const getPaymentPlans = async (wingId) => {
        console.log('getPaymentPlans::::', wingId, idFromURL)
        if (!idFromURL) return;

        try {
            let query = {
                propertyType: active == "plot" ? "Plot" : active == "banglow" ? "Banglow" : "Building-Wing",
                city: 'Ahmedabad',
                state: 'Gujarat'
            }
            const url = `admin/apf-flow/fetch-master-payment-plan?` + new URLSearchParams(query)
            const response = await getApiCall(url);
            if (response?.meta?.status) {
                setPaymentPlanList(response.data || []);
            } else {
                setPaymentPlanList([]);
            }
        } catch (error) {
            console.error("Error fetching payment plans:", error);
            setPaymentPlanList([]);
        }
    }
    const getTechnicalListByAgency = async (type) => {
        if (!idFromURL) return;

        try {
            const paraResponse = await getApiCall(`admin/workflow-instance/by-form-response/${workFlowId}/68fb20c0a68bebe5b6ee1c3a/${idFromURL}?collectionName=form_agency-assignment`)
            const url = `admin/apf-flow/fetch-technical-list/${paraResponse?.data?.responseId}`;

            const response = await getApiCall(url);
            if (response?.meta?.status) {
                setTechnicalAgencyList(response?.data?.filter((item) => item.selectType == type) || []);
            } else {
                setTechnicalAgencyList([]);
            }
        } catch (error) {
            console.error("Error fetching payment plans:", error);
            setTechnicalAgencyList([]);
        }
    }
    const validateRequiredFields = (active, formData) => {

    const propertyTypeMap = {
        building: "BuildingWing",
        plot: "Plot",
        bunglow: "Bunglow"
    };

    const payload = {
        propertyType: propertyTypeMap[active] || null,
        buildingId: formData?.buildingId,
        wingId: formData?.wingId,
        unitId: formData?.unitId,
        masterPaymentPlanId: formData?.paymentPlanId,
        agencyType: formData?.agencyType,
        technicalAgencyId: formData?.technicalAgencyId
    };

    let requiredFields = [];

    if (active === "building") {
        // Only validate building + wing
        requiredFields = ["propertyType", 
            "buildingId", 
            "wingId",
        "masterPaymentPlanId",
            "agencyType",
            "technicalAgencyId"];
    } else {
        // Validate everything except building + wing
        requiredFields = [
            "propertyType",
            "unitId",
            "masterPaymentPlanId",
            "agencyType",
            "technicalAgencyId"
        ];
    }

    const missingFields = requiredFields.filter(field =>
        payload[field] === undefined ||
        payload[field] === null ||
        payload[field] === ""
    );

    if (missingFields?.length > 0) {
        return {
            isValid: false,
            message: `Missing required fields: ${missingFields.join(", ")}`
        };
    }

    return {
        isValid: true,
        payload
    };
};


    const getInitiateProjectProgress = async () => {
        if (!idFromURL) return;

        try {
            const validation = validateRequiredFields(active, formData);
        if (!validation.isValid) {
        toast.error(validation.message); // or toast.error(validation.message)
        return;
    }
            let payload = {
                propertyType: active == "building" ? "BuildingWing" : active == "plot" ? "Plot" : active == "bunglow" && "Bunglow",
                buildingId: formData.buildingId,
                wingId: formData.wingId,
                unitId: formData.unitId,
                masterPaymentPlanId: formData.paymentPlanId,
                agencyType: formData.agencyType,
                technicalAgencyId: formData.technicalAgencyId
            }
            const url = `admin/apf-flow/initiate-project-progress/${idFromURL}`;

            const response = await postApiCall(url, payload);
            if (response?.meta?.status) {
                setDynamicFields(response.data || []);
                setProgressId(response.data._id)
                setIsNext(true)
            } else {
                setDynamicFields({});
            }
        } catch (error) {
            console.error("Error fetching payment plans:", error);
            setDynamicFields({});
        }
    }
    const handleCancel = () => {
        if (isNext) {
            setIsNext(false)
        }
        else {
            navigate(-1)
        }
    }
    const renderTabs = (sectionName) => (
        <>
            <div className="btn-group tab-btn-group mb-3">
                <button
                    className={`btn ${active === "building" ? "oneAPF-custom-btn-danger" : "oneAPF-custom-btn-outline"}`}
                    onClick={() => {
                        setActive("building");
                        getLists("696887e9d3a31d4279a1efce", setBuildingList);
                        setFormData()
                        setSelectFirstData()
                        setSelectedBuilding()
                        setSelectedPaymentPlans()
                        setSelectedAgencyTypes()
                        setSelectedTechnicalAgency()
                        setSelectedUnit()
                        setSelectedWing()
                    }}
                >
                    Building
                </button>

                <button
                    className={`btn ${active === "plot" ? "oneAPF-custom-btn-danger" : "oneAPF-custom-btn-outline"}`}
                    onClick={() => {
                        setActive("plot");
                        getLists("68d4dea6058b71b5595c0b74", setUnitList);
                        setFormData()
                        setSelectFirstData()
                        setSelectedBuilding()
                        setSelectedPaymentPlans()
                        setSelectedAgencyTypes()
                        setSelectedTechnicalAgency()
                        setSelectedUnit()
                        setSelectedWing()
                    }}
                >
                    Plot
                </button>

                <button
                    className={`btn ${active === "bungalow" ? "oneAPF-custom-btn-danger" : "oneAPF-custom-btn-outline"}`}
                    onClick={() => {
                        setActive("bungalow");
                        getLists("68d4ec3a058b71b5595cacc6", setUnitList);
                        setFormData()
                        setSelectFirstData()
                        setSelectedBuilding()
                        setSelectedPaymentPlans()
                        setSelectedAgencyTypes()
                        setSelectedTechnicalAgency()
                        setSelectedUnit()
                        setSelectedWing()

                    }}
                >
                    Bungalow
                </button>
            </div>


        </>
    );const validateConstructionForm = (formData) => {

    const errors = [];

    // Regex: Only letters, numbers and space
    const stageRegex = /^[A-Za-z0-9 ]+$/;

    // Required checks
    if (!formData?.inspectionDate)
        errors.push("inspectionDate is required");

    if (!formData?.stages || !Array.isArray(formData?.stages) || formData?.stages?.length === 0)
        errors.push("stages is required");

    if (!formData?.stageOfConstruction)
        errors.push("stageOfConstruction is required");
    else if (!stageRegex.test(formData?.stageOfConstruction))
        errors.push("stageOfConstruction allows only alphabets, numbers and spaces");

    if (formData?.workCompleted === undefined || formData?.workCompleted === null)
        errors.push("workCompleted is required");

    if (formData?.recommendedDisbursement === undefined || formData?.recommendedDisbursement === null)
        errors.push("recommendedDisbursement is required");

    if (formData?.basicRate === undefined || formData?.basicRate === null)
        errors.push("basicRate is required");

    if (!formData?.remarks)
        errors.push("remarks is required");

    if (errors.length > 0) {
        return {
            isValid: false,
            message: errors.join(", ")
        };
    }

    return { isValid: true };
};

    const handleSubmit = async () => {
            const validation = validateConstructionForm(formData);

    if (!validation.isValid) {
        toast.error(validation.message); // or toast.error(validation.message)
        return;
    }
        let payload = {
            "stages": formData.stages.map((item)=>({stageName:item.stageName, status:item.status})),
            "stageOfConstruction": formData.stageOfConstruction,
            "workCompleted": formData.workCompleted,
            "recommendedDisbursement": formData.recommendedDisbursement,

            "maintenanceCharges": formData.maintenanceCharge || 0,
            "waterCharges": formData.waterCharge|| 0,
            "clubCharges": formData.clubCharge|| 0,
            "sinkingFund": formData.sinkingFund|| 0,
            "electricityCharges": formData.electricityCharges|| 0,

            "reraApprovalNo": formData.reraApprovalNo || '0',

            "basicRate": formData.basicRate|| 0,
            "govtApprovedRate": formData.govtApprovedRate|| 0,
            // "costOfAmenities":formData.costOfAmenities || 0,
            "inspectionDate": formData.inspectionDate,

            "floorRise": formData.floorRise || 0,
            "plc": formData.plc || 0,
            "otherCharges": formData.otherCharges|| 0,

            "basementParking": formData.basementParking|| 0,
            "openParking": formData.openParking|| 0,
            "stiltParking": formData.stiltParking|| 0,
            "coveredParking": formData.coveredParking|| 0,
            "podiumParking": formData.podiumParking|| 0,

            "remarks": formData.remarks
        }
        let url = `admin/apf-flow/update-project-progress/${progressId}`
        const response = await postApiCall(url, payload);
        if (response?.meta?.status) {
            navigate(-1)
            toast.success(response.meta.mesg)
        } else {
            toast.error(response.meta.mesg)
        }
    }
    const handleNext = () => {
        getInitiateProjectProgress()
        // setIsNext(true)
    }
    const getIndividualStagePercent = (stagesConfig, index) => {
        const current = Number(stagesConfig[index].workCompleted);
        const previous = index === 0
            ? 0
            : Number(stagesConfig[index - 1].workCompleted);

        return current - previous;
    };

    const calculateTotalWorkCompleted = (stagesConfig, selectedStages, noOfFloors) => {
        let totalWork = 0;

        for (let i = 0; i < stagesConfig.length; i++) {
            const stage = stagesConfig[i];
            const selected = selectedStages[i]?.status;

            if (!selected) break;

            const currentCumulative = Number(stage.workCompleted);
            const previousCumulative = i === 0
                ? 0
                : Number(stagesConfig[i - 1].workCompleted);

            const individualStagePercent = currentCumulative - previousCumulative;

            // ✅ FLOOR-WISE STAGE
            if (stage.floorWiseSeparation) {
                const totalFloors = Number(noOfFloors || 0);
                const selectedFloors = Number(selected || 0);

                if (totalFloors > 0 && selectedFloors > 0) {

                    const partialPercent =
                        (selectedFloors / totalFloors) * individualStagePercent;

                    totalWork += partialPercent;
                    // break; // stop after partial stage
                } else {
                    // break;
                }
            }

            // ✅ NORMAL STAGE
            if (selected === "COMPLETED") {
                totalWork += individualStagePercent;
            } else {
                // break;
            }
        }
                console.log('stagename:::', totalWork)


        return Number(totalWork.toFixed(2));
    };

const propertyValidation = validateRequiredFields(active, formData);
const constructionValidation = validateConstructionForm(formData);

const isDisabled = isNext
    ? !constructionValidation.isValid
    : !propertyValidation.isValid;
console.log('isDisabled:::::',isDisabled,propertyValidation, constructionValidation)
    return (<>
        <div className="container-fluid">
            <div className="main-title">
                <FilterWithButtonsCard title="Add Project Progress" />
            </div>
            {!isNext &&
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    {renderTabs()}
                </div>
            }
            <div className="card">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Basic Info</h5>
                </div>
                <div className="card-body">
                    <div className="row">

                        {active === "building" ? (<>
                            <div className="col-md-4">
                                <label className="fw-semibold">Building Name *</label>
                                <CreatableSelect
                                    name="building"
                                    isClearable
                                    placeholder="Type to search or create..."
                                    value={selectedBuilding}
                                    onChange={handleBuildingChange}
                                    options={buildingList.map((item) => ({ label: item.formFields.buildingName, value: item._id }))}
                                    isDisabled={isNext}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="fw-semibold">Wing Name *</label>
                                <CreatableSelect
                                    name="wing"
                                    isClearable
                                    placeholder="Type to search or create..."
                                    value={selectedWing}
                                    onChange={handleWingChange}
                                    options={wingList.map((item) => ({ label: item.formFields.wingName, value: item._id }))}
                                    isDisabled={isNext}
                                />
                            </div>
                        </>)
                            : (
                                <div className="col-md-4">
                                    <label className="fw-semibold">Unit No. *</label>
                                    <CreatableSelect
                                        name="unit"
                                        isClearable
                                        placeholder="Type to search or create..."
                                        value={selectedUnit}
                                        onChange={handleUnitChange}
                                        options={unitList.map((item) => ({ label: item.formFields.unitNo, value: item._id }))}
                                        isDisabled={isNext}
                                    />
                                </div>
                            )}
                        <div className="col-md-4">
                            <label className="fw-semibold">Payment Plan Name *</label>
                            <CreatableSelect
                                name="paymentPlan"
                                isClearable
                                placeholder="Type to search or create..."
                                value={selectedPaymentPlans}
                                onChange={handlePaymentPlanChange}
                                options={paymentPlanList.map((item) => ({ label: item.formFields.planName, value: item._id }))}
                                isDisabled={isNext}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="fw-semibold">Agency Type *</label>
                            <CreatableSelect
                                name="agencyType"
                                isClearable
                                placeholder="Type to search or create..."
                                value={selectedAgencyTypes}
                                onChange={handleAgencyTypeChange}
                                options={agencyTypeList}
                                isDisabled={isNext}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="fw-semibold">Technical Agency *</label>
                            <CreatableSelect
                                name="technicalAgency"
                                isClearable
                                placeholder="Type to search or create..."
                                value={selectedTechnicalAgency}
                                onChange={handleTechnicalAgencyChange}
                                options={technicalAgencyList.map((item) => ({ label: item.selectAgencyUnitName, value: item.selectAgencyUnit }))}
                                isDisabled={isNext}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {isNext && (<>
                <div className="card mt-3">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold">Stages</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {(dynamicFields.stages || []).map((stage, idx) => {
                                const currentStatus = (formData.stages && formData.stages[idx] && formData.stages[idx].status) || stage.status || "";

                                // determine if previous stage has a selected value
                                const prevStatus = idx === 0
                                    ? (true) // first always enabled
                                    : (
                                        (formData.stages && formData.stages[idx - 1] && formData.stages[idx - 1].status) ||
                                        (dynamicFields.stages && dynamicFields.stages[idx - 1] && dynamicFields.stages[idx - 1].status) ||
                                        ""
                                    );

                                const isDisabled = type === "view" || (idx !== 0 && !prevStatus);

                                return (
                                    <div className="col-md-4" key={idx}>
                                        <label className="fw-semibold">{stage.stageName} *</label>
                                        <select
                                            className="form-control"
                                            value={currentStatus}
                                            disabled={isDisabled}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;

                                                setFormData(prev => {
                                                    const prevStages = Array.isArray(prev.stages)
                                                        ? [...prev.stages]
                                                        : (dynamicFields.stages || []).map(s => ({
                                                            ...s,
                                                            stageName: s.stageName,
                                                            status: ""
                                                        }));

                                                    while (prevStages.length <= idx) {
                                                        prevStages.push({
                                                            ...dynamicFields.stages?.[prevStages.length] || {},
                                                            stageName: dynamicFields.stages?.[prevStages.length]?.stageName || "",
                                                            status: ""
                                                        });
                                                    }

                                                    prevStages[idx] = {
                                                        ...prevStages[idx],
                                                        stageName: stage.stageName,
                                                        status: newStatus
                                                    };

                                                    // If user cleared this stage, clear all subsequent stages
                                                    if (!newStatus) {
                                                        for (let j = idx + 1; j < prevStages.length; j++) {
                                                            prevStages[j] = {
                                                                ...prevStages[j],
                                                                status: ""
                                                            };
                                                        }
                                                    }

                                                    const totalWork = calculateTotalWorkCompleted(
                                                        dynamicFields.stages,
                                                        prevStages,
                                                        selectFirstData?.formFields?.noOfFloors || formData?.floorNumber
                                                    );

                                                    return {
                                                        ...prev,
                                                        stages: prevStages,
                                                        workCompleted: totalWork
                                                    };
                                                });
                                            }}

                                        >
                                            <option value="">Select status</option>
                                            {stage.floorWiseSeparation ? (<>
                                                {[...Array(Number(selectFirstData?.formFields?.noOfFloors || formData?.floorNumber || '0'))].map((_, fi) =>
                                                    <option value={fi + 1} key={fi + 1}>{fi + 1}</option>
                                                )}
                                            </>) : (<>
                                                <option value="NOT_STARTED">Not Started</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                            </>)}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="card mt-3">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold">Project Progress Details</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">
                                <label className="fw-semibold">Stage Of Construction *</label>
                                <input
                                    name="stageOfConstruction"
                                    type="text"
                                    value={formData.stageOfConstruction || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, stageOfConstruction: e.target.value }))}
                                    placeholder="Stage Of Construction"
                                    className="form-control"
                                    disabled={type == "view"}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="fw-semibold">Work Completed [%] *</label>
                                <input
                                    name="workCompleted"
                                    type="text"
                                    value={formData.workCompleted || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, workCompleted: e.target.value }))}
                                    placeholder="Work Completed (%)"
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="fw-semibold">Recommended Disbursement [%] *</label>
                                <input
                                    name="recommendedDisbursement"
                                    type="number"
                                    value={formData.recommendedDisbursement || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        if (value === "") {
                                            setFormData(prev => ({ ...prev, recommendedDisbursement: "" }));
                                            return;
                                        }

                                        const numericValue = Number(value);

                                        if (numericValue >= 0 && numericValue <= 100) {
                                            setFormData(prev => ({
                                                ...prev,
                                                recommendedDisbursement: numericValue
                                            }));
                                        }
                                    }}
                                    placeholder="Recommended Disbursement (%)"
                                    className="form-control"
                                    disabled={type == "view"}
                                    min={0}
                                    max={100}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="fw-semibold">Maintenance Charge</label>
                                <input
                                    name="maintenanceCharge"
                                    type="text"
                                    value={formData.maintenanceCharge || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCharge: e.target.value }))}
                                    placeholder="Maintenance Charge"
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="fw-semibold">Water Charge</label>
                                <input
                                    name="waterCharge"
                                    type="text"
                                    value={formData.waterCharge || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, waterCharge: e.target.value }))}
                                    placeholder="Water Charge"
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="fw-semibold">Club Charge</label>
                                <input
                                    name="clubCharge"
                                    type="text"
                                    value={formData.clubCharge || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, clubCharge: e.target.value }))}
                                    placeholder="Club Charge"
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="fw-semibold">Sinking Fund</label>
                                <input
                                    name="sinkingFund"
                                    type="text"
                                    value={formData.sinkingFund || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, sinkingFund: e.target.value }))}
                                    placeholder="Sinking Fund"
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="fw-semibold">Electricity Charges (₹)</label>
                                <input
                                    name="electricityCharges"
                                    type="text"
                                    value={formData.electricityCharges || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, electricityCharges: e.target.value }))}
                                    placeholder="Electricity Charges"
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="fw-semibold">RERA Approval No.</label>
                                <input
                                    name="reraApprovalNo"
                                    type="text"
                                    value={formData.reraApprovalNo || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, reraApprovalNo: e.target.value }))}
                                    placeholder="RERA Approval No."
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="fw-semibold">Basic Rate (₹) *</label>
                                <input
                                    name="basicRate"
                                    type="number"
                                    value={formData.basicRate || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        if (value === "") {
                                            setFormData(prev => ({ ...prev, basicRate: "" }));
                                            return;
                                        }

                                        const numericValue = Number(value);

                                        if (numericValue >= 0 && numericValue <= 9999999999) {
                                            setFormData(prev => ({
                                                ...prev,
                                                basicRate: numericValue
                                            }));
                                        }
                                    }}
                                    placeholder="Basic Rate"
                                    className="form-control"
                                    min={0}
                                    max={9999999999}
                                    disabled={type == "view"}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="fw-semibold">Govt Approved Rate (₹)</label>
                                <input
                                    name="govtApprovedRate"
                                    type="number"
                                    value={formData.govtApprovedRate || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        if (value === "") {
                                            setFormData(prev => ({ ...prev, govtApprovedRate: "" }));
                                            return;
                                        }

                                        const numericValue = Number(value);

                                        if (numericValue >= 0 && numericValue <= 9999999999) {
                                            setFormData(prev => ({
                                                ...prev,
                                                govtApprovedRate: numericValue
                                            }));
                                        }
                                    }}
                                    placeholder="Govt Approved Rate"
                                    className="form-control"
                                    disabled={type == "view"}
                                    min={0}
                                    max={9999999999}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="fw-semibold">Inspection Date *</label>
                                <input
                                    name="inspectionDate"
                                    type="date"
                                    value={formData.inspectionDate || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, inspectionDate: e.target.value }))}
                                    className="form-control"
                                    disabled={type == "view"}
                                />
                            </div>

                        </div>
                    </div>
                </div>
                <div className="card mt-3">

                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-12">
                                <label className="fw-semibold">Remarks *</label>
                                <input
                                    name="remarks"
                                    type="text"
                                    value={formData.remarks || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                                    placeholder="Remarks"
                                    className="form-control"
                                    disabled={type == "view"}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </>)}
            {type !== "view"&&
            <div className="card mt-3">
                <div className="card-body d-flex justify-content-end">
                    <div>
                        {type == "add" &&
                            <CustomButton label={'Cancel'} appendClass="text-black border border-primary" updateBgColor={"#fff"} onClick={() => handleCancel()} />
                        }
                            <CustomButton label={isNext ? 'Submit' : 'Processed'} 
                            disabled={isDisabled} 
                            appendClass="text-white mx-2" onClick={() => { isNext ? handleSubmit() : handleNext() }} />
                    </div>
                </div>
            </div>
}
        </div>
    </>);

}
export default AddProjectProgress;