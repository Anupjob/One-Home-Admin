import React from "react";
import { useState, useEffect } from "react";
import FilterWithButtonsCard from "../../../../Utils/FilterWithButtonsCard";
import CustomButton from "../../../../Utils/CustomButton";
import { useLocation, useNavigate } from "react-router-dom";
import PaginationNew from "../../../../Widgets/PaginationNew";
import CommonActionIcons from "../../../../Utils/CommonActionIcons";
import getApiCall from "../../../../Services/getApiCall";
import CreatableSelect from "react-select/creatable";
import postApiCall from "../../../../Services/postApiCall";
import "./accordion.css";
import "../BuildingManager.css"

const CopyPaymentPlans = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state;
    const [paymentPlanList, setPaymentPlanList] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState([]);
    const [selectedWing, setSelectedWing] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState([]);
    const [selectedPaymentPlans, setSelectedPaymentPlans] = useState(null);
    const [active, setActive] = useState('building')
    const [buildingList, setBuildingList] = useState([])
    const [wingList, setWingList] = useState([])
    const [unitList, setUnitList] = useState([])
    const [formData, setFormData] = useState()
    const [filterData, setFilterData] = useState([])
    const [openIndex, setOpenIndex] = useState(null);
    const [selected, setSelected] = useState([]);


    const toggleAccordion = (index) => {
        setOpenIndex(prev => (prev === index ? null : index));
    };

    useEffect(() => {
        getLists("696887e9d3a31d4279a1efce", setBuildingList);
    }, [data]);
    console.log('data::::', data)
    const getLists = async (formId, setValue, buildingId = "") => {
        const response = await getApiCall(`admin/apf-flow/hierarchical-data?formId=${formId}&dataEntryId=${data.idFromURL}&buildingId=${buildingId}`)

        if (response.meta.status) {
            if (response.data?.items) {
                setValue(response.data?.items)

            }
        }
    }
    const getPaymentPlans = async (dataId) => {
        if (!data?.idFromURL) return;

        try {
            const params = new URLSearchParams();

            // property-specific params
            if (active === "building" && selectedBuilding) {
                params.append("buildingId", selectedBuilding.value);
                // if wing id is provided in data.ID for building tab
                if (dataId) params.append("wingId", dataId);
            } else if (active === "plot" && selectedUnit) {
                params.append("plotId", dataId);
            } else if (active === "bunglow" && selectedUnit) {
                params.append("bunglowId", dataId);
            }

            // include pagination if needed
            // if (pageNo) params.append("page", pageNo);
            // if (perPage) params.append("limit", perPage);

            const queryString = params.toString();
            const url = `admin/apf-flow/fetch-payment-plan/${data.idFromURL}${queryString ? `?${queryString}` : ""}`;

            const response = await getApiCall(url);
            if (response?.meta?.status) {
                setPaymentPlanList(response.data || []);
                // try to set totalItems from meta if available
            } else {
                setPaymentPlanList([]);
            }
        } catch (error) {
            console.error("Error fetching payment plans:", error);
            setPaymentPlanList([]);
        }
    }
    //  const getPaymentPlans = async () => {
    //         if (!data.idFromURL) return;

    //         try {
    //             let query = {
    //                 propertyType: active == "plot" ? "Plot" : active == "banglow" ? "Banglow" : "Building-Wing",
    //                 city: 'Ahmedabad',
    //                 state: 'Gujarat'
    //             }
    //             const url = `admin/apf-flow/fetch-master-payment-plan?` + new URLSearchParams(query)
    //             const response = await getApiCall(url);
    //             if (response?.meta?.status) {
    //                 setPaymentPlanList(response.data || []);
    //             } else {
    //                 setPaymentPlanList([]);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching payment plans:", error);
    //             setPaymentPlanList([]);
    //         }
    //     }
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
        getPaymentPlans(value.value)
        setFilterData(wingList.filter((item) => item._id !== toValues(value)))
    };

    const handleUnitChange = (value) => {
        setSelectedUnit(value || []);
        setFormData(prev => ({ ...prev, unitId: toValues(value) }));
        getPaymentPlans(value.value)
    };

    const handlePaymentPlanChange = (value) => {
        setSelectedPaymentPlans(value || []);
        setFormData(prev => ({ ...prev, paymentPlanId: toValues(value) }));
    };

    const handleSubmit = async () => {
        let payload = {
            paymentPlanId: formData.paymentPlanId,
            plotIds: active == "plot" ? ['68d4dea6058b71b5595c0b74'] : undefined,
            bunglowIds: active == "bungalow" ? ['68d4ec3a058b71b5595cacc6'] : undefined,
            buildingWingIds: active == "building" ? [{ building: selectedBuilding.value, wing: selectedWing.value }] : undefined,
        }
        const response = await postApiCall('admin/apf-flow/copy-payment-plan', payload)
        if (response.meta.status) {

        }
    }

    const handleCancel=()=>{
        navigate(-1)
    }
    const groupedData = Object.values(
        filterData.reduce((acc, item) => {
            const building = item.buildingName;

            if (!acc[building]) {
                acc[building] = {
                    buildingName: building,
                    buildingId: item.buildingId,
                    wings: []
                };
            }

            acc[building].wings.push({
                wingId: item._id,
                wingName: item.formFields.wingName,
                buildingId: item.buildingId
            });

            return acc;
        }, {})
    );
    console.log('groupedData:::::', groupedData, selected)
    const renderTabs = (sectionName) => (
        <>
            <div className="btn-group tab-btn-group mb-3">
                <button
                    className={`btn ${active === "building" ? "oneAPF-custom-btn-danger" : "oneAPF-custom-btn-outline"}`}
                    onClick={() => {
                        setActive("building");
                        getLists("696887e9d3a31d4279a1efce", setBuildingList);
                        setFormData()
                        setSelectedBuilding(null)
                        setSelectedPaymentPlans(null)
                        setSelectedUnit(null)
                        setSelectedWing(null)
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
                        setSelectedBuilding(null)
                        setSelectedPaymentPlans(null)
                        setSelectedUnit(null)
                        setSelectedWing(null)
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
                        setSelectedBuilding(null)
                        setSelectedPaymentPlans(null)
                        setSelectedUnit(null)
                        setSelectedWing(null)

                    }}
                >
                    Bungalow
                </button>
            </div>


        </>
    );

    // Select All
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = groupedData?.flatMap(group =>
                group.wings.map(item => ({buildingId:group.buidingId,wingId:item.wingId}))
            );
            setSelected(allIds);
        } else {
            setSelected([]);
        }
    };

    // Individual select
    const handleSelect = (id, buidingId) => {
        setSelected(prev =>
            prev.filter(x => x.wingId == id)?.length>0
                ? prev.filter(x => x.wingId !== id)
                : [...prev, {buidingId:buidingId,wingId:id}]
        );
    };
    const handleBuildingSelect = (group) => {
        const wingIds = group.wings.map(w => w.wingId);

        const allSelected = wingIds.every(id =>
            selected.includes(id)
        );

        if (allSelected) {
            // unselect all
            setSelected(prev =>
                prev.filter(id => !wingIds.includes(id))
            );
        } else {
            // select all
            setSelected(prev => [
                ...new Set([...prev, ...wingIds])
            ]);
        }
    };
    const isAllSelected =
        selected.length === groupedData.flatMap(g => g.wingIds).length;

    return (
        <div className="container-fluid p-4">
            <div className="row">
                <div className="col-12">
                    <FilterWithButtonsCard
                        title="Copy Payment Plans"
                    >
                        {/* Table or list of payment plans would go here */}
                    </FilterWithButtonsCard>
                </div>
            </div>

            <div className="card mt-3">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-12" style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            {renderTabs()}
                        </div>

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
                                options={paymentPlanList.map((item) => ({ label: item.paymentPlanName, value: item._id }))}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {selectedPaymentPlans&&
            <div className="card mt-3">
                <div className="card-body">
                    <p className="bold">Select Building Wing*</p>
                    <div className="form-check mb-3">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                        />
                        <label className="form-check-label">Select All</label>
                    </div>

                    {/* Accordion */}
                    <div className="accordion" id="accordionExample">
                        {groupedData.map((group, index) => {
                            const wingIds = group.wings.map(w => w.wingId);

                            const isBuildingChecked = wingIds.every(wing =>
    selected.some(selected => selected.wingId === wing.wingId)
);

                            const isOpen = openIndex === index;

                            return (
                                <div className="accordion-item" key={index}>

                                    <div className="accordion-header d-flex align-items-center">
                                        {/* ✅ Building Checkbox */}
                                        <input
                                            type="checkbox"
                                            className="form-check"
                                            checked={isBuildingChecked}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleBuildingSelect(group);
                                            }}
                                        />

                                        <button
                                            className="accordion-button d-flex justify-content-between align-items-center"
                                            onClick={() => toggleAccordion(index)}
                                            style={{ boxShadow: "none" }}
                                        >
                                            <i
                                                className={`bi ${isOpen ? "bi-dash-square mx-2" : "bi-plus-square mx-2"
                                                    }`}
                                            />
                                            <span>{group.buildingName}</span>

                                            {/* ✅ Icon */}
                                        </button>

                                    </div>

                                    {/* ✅ Collapse manually */}
                                    <div className={`accordion-collapse ${isOpen ? "show" : "collapse"}`}>
                                        <div className="accordion-body">
                                            {group.wings.map(item => (
                                                <div className="form-check" key={item.wingId}>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={selected.filter((wing)=>wing.wingId==item.wingId)?.length>0}
                                                        onChange={() => handleSelect(item.wingId, group.buildingId)}
                                                    />
                                                    <label className="form-check-label">
                                                        {item.wingName}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="card-footer d-flex justify-content-end">
                    <CustomButton label={'Cancel'} updateBgColor="#fff"  variant="outline" appendClass="text-black mx-2" onClick={handleCancel}/>
                    <CustomButton label={'Save'} disabled={selected?.length==0} appendClass="text-white" onClick={handleSubmit}/>
                    </div>
            </div>
}
        </div>
    );
};

export default CopyPaymentPlans;