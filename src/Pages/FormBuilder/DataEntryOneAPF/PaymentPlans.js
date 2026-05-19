import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import CustomButton from "../../../Utils/CustomButton";
import { useNavigate } from "react-router-dom";
const PaymentPlans = ({
    renderTabs,
    payCurrentTab,
    buildingList,
    getLists,
    wingsList,
    idFromURL,
    formId,
    renderTable,
    dataEntryFormData,
    type
}) => {
    const navigate=useNavigate();
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [isCopyPlan, setIsCopyPlan] = useState(false);
    useEffect(() => {
        if (payCurrentTab) {
            setSelectedBuilding(null)
        }
    }, [payCurrentTab])
    console.log('payCurrentTab:::', payCurrentTab)
    const handleCopyPlans=()=>{
navigate('/copy-payment-plans',{state:{idFromURL}})
    }
    return (<>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div className="d-flex align-items-center" style={{ gap: "1rem" }}>
                {renderTabs('Payment_Plans')}
                {/* 🔽 Building Dropdown (ONLY when building tab is active) */}
                {(payCurrentTab === "building") && (
                    <div className="mb-3 mx-5" style={{ width: "300px" }}>
                        {/* <label className="fw-semibold">Select Creator User *</label> */}
                        <CreatableSelect
                            name="creatorUserKey"
                            isClearable
                            placeholder="Select Building"
                            value={selectedBuilding || null}
                            onChange={(selectedOptions) => { setSelectedBuilding(selectedOptions); getLists('68c3e8824a3b18b0efee2019', selectedOptions?.value || '', '', 'paymentPlan') }}
                            options={buildingList.map((item) => ({
                                label: item.buildingName,
                                value: item._id,
                            }))}
                        />
                    </div>
                )}
            </div>
                {dataEntryFormData.status !== "SUBMITTED" && dataEntryFormData.status!== "APPROVED" && type !== "view" &&
            <div>
            <CustomButton label={'Copy Payment Plan'} icon={'bi-copy'} appendClass="text-white mx-2" onClick={handleCopyPlans} />
                </div>
}
        </div>
        {wingsList?.length > 0 ? renderTable(wingsList) : (
            <div className={`card shadow-sm h-100 card-body not-answerd-card`} >
                <p className="text-muted-not-answerd fst-italic mb-0" style={{ height: `200px`, textAlign: 'center', paddingTop: '80px' }}>
                    No Record Found !
                </p>
            </div>
        )}
    </>)
}
export default PaymentPlans;