import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import moment from "moment";
import CustomButton from "../../../../Utils/CustomButton";
import getApiCall from "../../../../Services/getApiCall";
import Constant from "../../../../Components/Constant";
import { useNavigate } from "react-router-dom";
import CommonActionIcons from "../../../../Utils/CommonActionIcons";
import PaginationNew from "../../../../Widgets/PaginationNew";

const ProjectProgressLists = ({
  idFromURL,
  formData,
  workFlowId,
  dataEntryFormData,
  type
}) => {
  const navigate = useNavigate()
  const [responseDataList, setResponseDataList] = useState([])
  const [active, setActive] = useState('building')
  const [pageNo, setPageNo] = useState(1);
  const [perPage, setPerPage] = useState(Constant.perPage);
  const [totalItems, setTotalItems] = useState(0);
  const [technicalAgencyList, setTechnicalAgencyList] = useState([])
  const [selectedAgencyTypes, setSelectedAgencyTypes] = useState(null);
  const [selectedTechnicalAgency, setSelectedTechnicalAgency] = useState(null);
  const [agencyTypeList, setAgencyTypeList] = useState([
    { label: 'Employee', value: 'Employee' },
    { label: 'Vendor', value: 'Vendor' }
  ])
  useEffect(() => {
    if (pageNo > 1)
      getLists(selectedTechnicalAgency?.value, active, selectedAgencyTypes?.value)
  }, [pageNo])

  console.log('data:::', responseDataList)
  useEffect(() => {
    // Load initial data without filters
    getLists(null, active, null)
  }, [])
  const pageChangeHandler = (event, value) => {
    setPageNo(value);
  };
  const getTechnicalListByAgency = async (type, active) => {
    if (!idFromURL) return;

    try {
      const paraResponse = await getApiCall(`admin/workflow-instance/by-form-response/${workFlowId}/68fb20c0a68bebe5b6ee1c3a/${idFromURL}?collectionName=form_agency-assignment`)
      const url = `admin/apf-flow/fetch-technical-list/${paraResponse?.data?.responseId}`;

      const response = await getApiCall(url);
      if (response?.meta?.status) {
        if (response?.data?.length > 0) {
          const filteredAgencies = response?.data?.filter((item) => item.selectType == type) || [];
          setTechnicalAgencyList(filteredAgencies);
        }
      } else {
        setTechnicalAgencyList([]);
      }
    } catch (error) {
      console.error("Error fetching technical agencies:", error);
      setTechnicalAgencyList([]);
    }
  }
  const getLists = async (technicalAgencyId, active, agencyType) => {
    let params = {
      propertyType: active == "building" ? "BuildingWing" : active == "plot" ? "Plot" : active == "bungalow" ? "Bungalow" : "",
      page: pageNo,
      contentPerPage: perPage
    }
    
    // Only add agencyType if it's provided
    if (agencyType) {
      params.agencyType = agencyType;
    }
    
    // Only add technicalAgencyId if it's provided
    if (technicalAgencyId) {
      params.technicalAgencyId = technicalAgencyId;
    }

    const response = await getApiCall(`admin/apf-flow/fetch-project-progress/${idFromURL}?` + new URLSearchParams(params))

    if (response.meta.status) {
      setResponseDataList(response.data)
    }
    else {
      setResponseDataList([])
    }
  }
  const actionRender = async (item, index) => {
    const actions = [];
    if(dataEntryFormData.status !== "SUBMITTED" && dataEntryFormData.status!== "APPROVED" && type !== "view"){
    actions.push({
      type: "edit",
      label: "Edit",
      onClick: () => { handleEdit(item, index) },
    });
  }
    actions.push({
      type: "view",
      label: "View",
      onClick: () => { handleView(item, index) },
    });


    return <CommonActionIcons actions={actions} />;
  };
  const handleView = (item) => {
    navigate('/one-apf/project-progress/view', { state: { idFromURL: idFromURL, workFlowId: workFlowId, data:item } })
  }
  const handleEdit = (item) => {
    navigate('/one-apf/project-progress/update', { state: { idFromURL: idFromURL, workFlowId: workFlowId, data:item } })
  }
  const handleBulkUpdate=()=>{
    navigate('/one-apf/project-progress/bulk-update', { state: { idFromURL: idFromURL, workFlowId: workFlowId } })
  }
  const renderTable = () => {
    return (
      <div class="table-responsive">
        <table class="table table-bordered table-striped table-hover align-middle text-nowrap">
          <thead>
            <tr>
              {active=="building"?(<>
              <th>Building Name</th>
              <th>Wing Name</th>
              </>):(
                <th>Unit No.</th>
              )}
              <th>Payment Plan Name</th>
              <th>Stage of Construction</th>
              <th>Work Completed [%]</th>
              <th>Recommended Disbursement [%]</th>
              <th>Maintenance Charges (₹)</th>
              <th>Water Charges (₹)</th>
              <th>Club Charges (₹)</th>
              <th>Electricity Charges (₹)</th>
              <th>Sinking Fund (₹)</th>
              <th>RERA Approval No.</th>
              <th>Basic Rate (₹)</th>
              <th>Govt Approved Rate (₹)</th>
              <th>Basement Parking (₹)</th>
              <th>Open Parking (₹)</th>
              <th>Stilt Parking (₹)</th>
              <th>Covered Parking (₹)</th>
              <th>Podium Parking (₹)</th>
              <th>Inspection Date</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {responseDataList.map((item) => (
              <tr>
                 {active=="building"?(<>
                <td>{item.buildingName || ''}</td>
                <td>{item.wingName || ''}</td>
                </>):(
                  <td>{item.unitNumber || ''}</td>
                )}
                <td>{item.masterPaymentPlanName || ''}</td>
                <td>{item.stageOfConstruction || ''}</td>
                <td class="text-center">{item.workCompletedPercentage || ''}</td>
                <td class="text-center">{item.recommendedDisbursement || ''}</td>
                <td class="text-end">{item.maintenanceCharges || ''}</td>
                <td class="text-end">{item.waterCharges || ''}</td>
                <td class="text-end">{item.clubCharges || ''}</td>
                <td class="text-end">{item.electricityCharges || ''}</td>
                <td class="text-end">{item.sinkingFund || ''}</td>
                <td>{item.reraApprovalNo || ''}</td>
                <td class="text-end">{item.basicRate || ''}</td>
                <td class="text-end">{item.govtApprovedRate || ''}</td>
                <td class="text-end">{item.basementParking || ''}</td>
                <td class="text-end">{item.openParking || ''}</td>
                <td class="text-end">{item.stiltParking || ''}</td>
                <td class="text-end">{item.coveredParking || ''}</td>
                <td class="text-end">{item.podiumParking || ''}</td>
                <td>{item.inspectionDate && moment(item.inspectionDate).format('DD-MM-YYYY') || ''}</td>
                <td>{item.remarks || ''}</td>
                <td class="text-center">
                  {actionRender(item)}
                </td>
              </tr>
            ))}
          </tbody>
          <div className="justify-content-center mt-2">
            <PaginationNew perPage={perPage} totalItems={totalItems}
              currentPage={pageNo}
              handler={pageChangeHandler} />
          </div>
        </table>
      </div>
    )
  }
  const renderTabs = (sectionName) => (
    <>
      <div className="btn-group tab-btn-group">
        <button
          className={`btn ${active === "building" ? "oneAPF-custom-btn-danger" : "oneAPF-custom-btn-outline"}`}
          onClick={() => {
            setActive("building");
            setSelectedAgencyTypes(null);
            setSelectedTechnicalAgency(null);
            setTechnicalAgencyList([]);
            getLists(null, 'building', null);
          }}
        >
          Building
        </button>

        <button
          className={`btn ${active === "plot" ? "oneAPF-custom-btn-danger" : "oneAPF-custom-btn-outline"}`}
          onClick={() => {
            setActive("plot");
            setSelectedAgencyTypes(null);
            setSelectedTechnicalAgency(null);
            setTechnicalAgencyList([]);
            getLists(null, 'plot', null);
          }}

        >
          Plot
        </button>

        <button
          className={`btn ${active === "bungalow" ? "oneAPF-custom-btn-danger" : "oneAPF-custom-btn-outline"}`}
          onClick={() => {
            setActive("bungalow");
            setSelectedAgencyTypes(null);
            setSelectedTechnicalAgency(null);
            setTechnicalAgencyList([]);
            getLists(null, 'bungalow', null);
          }}
        >
          Bungalow
        </button>
      </div>


    </>
  );

  const handleNewProcess = () => {
    navigate('/one-apf/project-progress/add', { state: { idFromURL: idFromURL, workFlowId: workFlowId } })
  }
  const toValues = (sel) => {
    if (!sel) return [];
    return Array.isArray(sel) ? sel.map(s => s.value ?? s) : sel.value ?? sel;
  };
  const handleAgencyTypeChange = (value) => {
    setSelectedAgencyTypes(value || null);
    setSelectedTechnicalAgency(null);
    
    if (value?.value) {
      // Fetch technical agencies for selected agency type
      getTechnicalListByAgency(value.value, active);
    } else {
      // If deselected, show all data without filters
      setTechnicalAgencyList([]);
      getLists(null, active, null);
    }
  };
  const handleTechnicalAgencyChange = (value) => {
    setSelectedTechnicalAgency(value || null);
    if (value?.value) {
      // Fetch data with selected technical agency filter
      getLists(value.value, active, selectedAgencyTypes?.value);
    } else {
      // If deselected, show data for selected agency type only
      getLists(null, active, selectedAgencyTypes?.value);
    }
  };
  const handleOverAllProgress=()=>{
    navigate('/one-apf/project-progress/over-all-progress',{ state: { idFromURL: idFromURL, workFlowId: workFlowId, formData:formData } })
  }
  return (
    <>
      <div
        className="d-flex align-items-center mb-3"
        style={{ justifyContent: "space-between", gap: "1rem", flexWrap: "nowrap" }}
      >
        {renderTabs()}

        <div className="d-flex align-items-center flex-grow-1 justify-content-center">
          <div >
            {/* <label className="fw-semibold">Agency Type</label> */}
            <CreatableSelect
              name="agencyType"
              isClearable
              placeholder="Type to search or create..."
              value={selectedAgencyTypes}
              onChange={handleAgencyTypeChange}
              options={agencyTypeList}
              styles={{ width: 100 }}
            />
          </div>

          <div className="mx-2">
            {/* <label className="fw-semibold">Technical Agency</label> */}
            <CreatableSelect

              styles={{ width: 100 }}
              name="technicalAgency"
              isClearable
              placeholder="Type to search or create..."
              value={selectedTechnicalAgency}
              onChange={handleTechnicalAgencyChange}
              options={technicalAgencyList.map((item) => ({ label: item.selectAgencyUnitName, value: item.selectAgencyUnit }))}
            />
          </div>
        </div>
{dataEntryFormData.status !== "SUBMITTED" && dataEntryFormData.status!== "APPROVED" &&  type !== "view" && (
        <div className="d-flex align-items-center">
          <div>
            <CustomButton label={'Bulk Update'} icon={'bi-upload'} appendClass="text-white" onClick={handleBulkUpdate}/>
          </div>
          <div>
            <CustomButton label={'+ Add Progress'} appendClass="text-white mx-1" onClick={handleNewProcess} />
          </div>
          <div>
            <CustomButton label={'Overall Project Progress '} appendClass="text-white mx-1" onClick={handleOverAllProgress}/>
          </div>
        </div>
        )}
      </div>

      {responseDataList?.length > 0 ? (
        renderTable()
      ) : (
        <div className={`card shadow-sm h-100 card-body not-answerd-card`}>
          <p className="text-muted-not-answerd fst-italic mb-0" style={{ height: `200px`, textAlign: 'center', paddingTop: '80px' }}>
            No Record Found !
          </p>
        </div>
      )}
    </>
  )

}
export default ProjectProgressLists;