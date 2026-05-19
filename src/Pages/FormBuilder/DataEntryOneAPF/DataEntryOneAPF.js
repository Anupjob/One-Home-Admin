import React, { useState, useEffect, useRef, memo } from "react";
import ReusableAccordion from "../../../Utils/Accordion/ReusableAccordionFormIo";
import { Button } from "@mui/material";
import CustomButton from "../../../Utils/CustomButton";
import { Modal } from "react-bootstrap";
import { Form } from 'react-formio';
import getApiCall from "../../../Services/getApiCall";
import Constant from "../../../Components/Constant";
import loginUser from "../../../Services/loginUser";
import postApiCall from "../../../Services/postApiCall";
import { toast } from "react-toastify";
import './BuildingManager.css'
import CommonTable from "../../../Utils/CommonTable";
import CommonActionIcons from "../../../Utils/CommonActionIcons";
import DataEntryBulkDataUpload from "./DataEntryBulkDataUpload";
import PaymentPlans from "./PaymentPlans";
import Exposure from "./Exposure/Exposure";
import ProjectProgressLists from "./ProjectProgress/ProjectProgressLists";
import DisbursementDocuments from "./DisbursementDocuments/DisbursementDocuments";
import { useNavigate } from "react-router-dom";
import Recommendation from "./AssignForRecommendation";

function DataEntryOneAPF({ formData, idFromURL, workFlowId, getFormDataEntryByRowId, dataEntryFormData, dataEntryFormId, type }) {
  const navigate = useNavigate();
  console.log('formData:::::', formData)
  let blogToken = localStorage.getItem('uploadT')
  const formRef = useRef(null);
  const [active, setActive] = useState("building");
  const [payCurrentTab, setPayCurrentTab] = useState("building");
  const [permission, setPermission] = useState([])
  const [unitsLists, setUnitsLists] = useState([])
  const [wingsList, setWingsList] = useState([])
  const [buildingList, setBuildingList] = useState([])
  const [plotsList, setPlotsList] = useState([])
  const [bungalowsList, setBungalowsList] = useState([])

  let { accessToken } = loginUser();
  const [buildings, setBuildings] = useState([]);
  const [projectInfoResponse, setProjectInfoResponse] = useState([]);
  const [formSchema, setFormSchema] = useState({
    display: "form",
    components: []
  });
  const [currentBuildingId, setCurrentBuildingId] = useState(null);
  const [currentWingId, setCurrentWingId] = useState(null);
  const [currentParentIndex, setCurrentParentIndex] = useState(null);
  // Modal state
  const [modal, setModal] = useState({ type: "", subType: "", show: false });
  const [currentBuildingIndex, setCurrentBuildingIndex] = useState(null);
  const [currentWingIndex, setCurrentWingIndex] = useState(null);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(null);
  const [formId, setFormId] = useState('696887e9d3a31d4279a1efce');
  const [responseId, setResponseId] = useState(null);
  const [responseData, setResponseData] = useState({});

  const [pageNo, setPageNo] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [isRecommend, setIsRecommend] =useState(false)
  const pageChangeHandler = (event, value) => {
    setPageNo(value);
  };
  const [unitPage, setUnitPage] = useState(1);
  const unitsPerPage = 5;
  useEffect(() => {
    getLists(formId)
  }, [])
  const updateBuildings = (updated) => setBuildings([...updated]);

  // ---------------- MODAL ----------------
  const openModal = (parentRow, type, formId, bIdx = null, wIdx = null, uIdx = null) => {
    getFormDataById(formId);
    setModal({ type, show: true });
    setCurrentBuildingIndex(bIdx);
    setCurrentWingIndex(wIdx);
    setCurrentUnitIndex(uIdx);
    setFormId(formId);
    setResponseId();
    console.log('parentRow:::::', parentRow)
    setResponseData({
      formFields: {
        buildingName: parentRow.buildingName || '',
        wingName: parentRow.wingName || '',
        wingNumberFloor: parentRow?.formFields?.noOfFloors || 0

      }
    })
  };

  const closeModal = () => {
    setModal({ type: "", show: false });
    setIsRecommend(false)
  };

  // ---------------- DELETE ----------------
  const deleteBuilding = (bIdx) => {
    const updated = [...buildings];
    updated.splice(bIdx, 1);
    updateBuildings(updated);
  };
  const deleteWing = (bIdx, wIdx) => {
    const updated = [...buildings];
    updated[bIdx].wings.splice(wIdx, 1);
    updateBuildings(updated);
  };
  const deleteUnit = (bIdx, wIdx, uIdx) => {
    const updated = [...buildings];
    updated[bIdx].wings[wIdx].units.splice(uIdx, 1);
    updateBuildings(updated);
  };

  const paginateUnits = (units) => {
    const start = (unitPage - 1) * unitsPerPage;
    return units.slice(start, start + unitsPerPage);
  };

  const getFormDataById = (formId) => {
    getApiCall(`admin/dynamic/form/details/${formId}`)
      .then((response) => {
        if (response.meta.status) {
          // if(formName!=="create-roles"&& formName!=="partner-user" && formName!=="hierarchy"){
          setFormSchema({
            display: "form",
            components: [...response.data.moduleFormData]
          });
          // setResponseData(response.data);
        } else {
          setFormSchema({
            display: "form",
            components: [...response.data.moduleFormData]
          });
        }
        //   }
      })
      .catch((error) => {
        console.error("Error loading form schema:", error);
      });
  };
  const base64ToBlob = (base64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
  };
  const uploadAllBase64Files = async (formData) => {
    const updatedData = { ...formData };

    for (const key in updatedData) {
      const value = updatedData[key];

      // Check for base64 file format (array of file objects with storage === "base64")
      if (Array.isArray(value) && value[0]?.storage === 'base64' && value[0]?.url?.startsWith('data:')) {
        const uploadedList = [];

        for (const file of value) {
          try {
            const base64Data = file.url.split(',')[1];
            const mimeType = file.type;
            console.log('mimeType::::::', mimeType, mimeType.startsWith("image/"), file.name?.toLowerCase().endsWith(".apk"))

            const blob = base64ToBlob(base64Data, mimeType);
            const formUpload = new FormData();
            let result = null
            if (formId == "691b16cca2e080e2b32f5d77") {
              if (file.name?.toLowerCase().endsWith(".apk")) {
                formUpload.append('apk', blob, file.name);

                result = await postApiCall(
                  `common/upload/blob/admin/apk`,
                  formUpload,
                  true
                );
              }
              else {
                toast.error('Only APK upload !')
                return
              }
            }
            else if (mimeType.startsWith("image/")) {
              formUpload.append('image', blob, file.name);

              result = await postApiCall(
                `common/upload/blob/admin/image`,
                formUpload,
                true
              );
            } else {
              formUpload.append('document', blob, file.name);

              result = await postApiCall(
                `common/upload/blob/admin/document`,
                formUpload,
                true
              );
            }
            if (result.meta?.status) {
              uploadedList.push({
                name: file.name,
                url: result.data + blogToken, // or result.data.url depending on your API
                type: mimeType,
                size: file.size,
                storage: "base64"
              });
            } else {
              console.warn(`Upload failed for ${file.name}`);
            }
          } catch (err) {
            console.error(`Error uploading ${file.name}`, err);
          }
        }
        // Replace original field with uploaded file metadata
        updatedData[key] = uploadedList;
      }
    }
    console.log('updatedData::::::', updatedData)

    return { ...updatedData };
  };
  const handleSubmit = async (type) => {
    if (!formRef.current || !formRef.current.formio) return;

    const formio = formRef.current.formio;

    // Access the current data
    const submissionData = formio.submission?.data || {};

    try {
      // Validate form manually

      const isValid = await formio.checkValidity(
        formio.submission?.data,   // must pass actual submission data
        true                      // trigger all validations
      );


      if (!isValid) {
        // highlight invalid fields
        formio.setPristine(false);
        console.log("Validation Check:", isValid, formio.submission.data);

        // show built-in form.io errors
        formio.emit("error", {
          message: "Please fill all required fields before submitting."
        });

        return; // stop submit
      }

      const finalData = await uploadAllBase64Files(submissionData)
      console.log('finalData::::::', finalData)
      // Clone submissionData to avoid mutating the original
      const beforePayload = { ...finalData };
      delete beforePayload.accessToken;
      delete beforePayload.apiBasePath;
      delete beforePayload.formName;

      console.log('Submission Data:', submissionData);
      console.log('Payload Data (sanitized):', beforePayload);

      // Construct base payload
      let payload = {
        formId,
        userComment: "",
        formFields: {
          ...beforePayload,
          h0Name: formData?.h0Name || '',
          h1Name: formData?.h1Name || '',
          h2Name: formData?.h2Name || '',
          h3Name: formData?.h3Name || '',
          h4Name: formData?.h4Name || '',
          h5Name: formData?.h5Name || '',
          dataEntryId: idFromURL

        },
        status: 'SUBMITTED'
      };
      if (type.includes("wing")) {
        payload.formFields["buildingId"] = currentBuildingIndex
      }
      else if (type.includes("unit")) {
        payload.formFields["buildingId"] = currentBuildingIndex
        payload.formFields["wingId"] = currentWingIndex
      }
      let response = {};
      // === Special case for "partner-user" ===
      const formEntryId = responseId;

      if (formEntryId) {
        response = await postApiCall(
          `admin/submit/form/update/${formEntryId}`,
          payload,
          true
        );
      } else {
        response = await postApiCall(
          'admin/submit/form/add',
          payload,
          true
        );
      }


      // === Common response handling ===
      if (response?.meta?.status) {
        toast.success(response.meta.msg);
        // getFormDataByRowId(response?.data?._id)
        closeModal();
        // if(type==="building"){
        getLists(formId, currentBuildingIndex||"", currentWingIndex||"");

        if(type=="recommendation"){
          handleUpdateStatus()
        }
        // }
        // getFormDataByRowId(response?.data?._id)
      } else {
        toast.error(response?.meta?.msg || 'Submission failed');
      }

    } catch (err) {
      console.error('Validation or submission error:', err);
      toast.error('An unexpected error occurred during submission.');
    }

  };

  const handleUpdateStatus=async()=>{
    let response = {};
      // === Special case for "partner-user" ===
      const formEntryId = idFromURL;
let payload={ status:'SUBMITTED',formId:dataEntryFormId, formFields:dataEntryFormData.formFields}
      if (formEntryId) {
        response = await postApiCall(
          `admin/submit/form/update/${formEntryId}`,
          payload,
          true
        );

      // === Common response handling ===
      if (response?.meta?.status) {
        toast.success(response.meta.msg);
        getFormDataEntryByRowId(idFromURL)
      }
    }
  }
  const getFormDataByRowId = (responseId, formId) => {
    getApiCall(`admin/submit/form/details/${formId}/${responseId}`)
      .then((response) => {
        if (response.meta.status) {
          setResponseData(response.data)
        }
      })
      .catch((error) => {
        console.error("Error loading form data:", error);
      });
  };
  function formatLabel(key) {
    return key
      .replace(/([A-Z])/g, ' $1')   // insert space before capital letters
      .replace(/^./, str => str.toUpperCase()); // capitalize first letter
  }

  const formattingTableData = (response, type, formId) => {
    const submissions = response?.data?.items || [];
    const tableSettingArr = response?.formData?.tableHeaderSetting || [];
    const { headers, rows } = prepareDynamicTable(submissions, tableSettingArr?.length);
    const formattedData = rows.map((item, index) => ({
      header: `S No: ${(index + 1) + ((pageNo - 1) * Constant.perPage)}`,
      data: headers
        .filter((key) => key !== "ID" && key !== "isPdfExists" && key !== "dataCreationAssignedById" && key !== "formId")
        .reduce((acc, key, i) => {
          // For first item only
          // When we reach the Status column, insert Approved By and Created By before it
          if (key === 'Status') {
            acc.push({
              label: 'Approved By',
              value: item.dataApprovalAssigneName ?? '-',
            });
            acc.push({
              label: 'Created By',
              value: item.dataCreationAssigneName ?? '-',
            });

            acc.push({
              label: formatLabel(key),
              value: item[key] ?? '-',
              isStricky: true
            });

            return acc;
          }

          // For remaining items
          acc.push({
            label: formatLabel(key),
            value: item[key] ?? "-"
          });

          return acc;
        }, []),
      status: item.Status,
      footerId: item._id,
      actionButtons: actionRender(item, type, formId, false),
      isAction: actionRender(item, type, formId, true)
    }));

    return formattedData;
  }
  const getLists = (formId, buildingId = '', wingId = '', from = '') => {
    // Determine page & page-size independently for buildings, wings (per building) and units (per wing).
    // Use existing pageNo/perPage for top-level (buildings/plots/bungalows),
    // unitPage/unitsPerPage for units,
    // and persist per-building / per-wing page numbers in sessionStorage so each accordion keeps its own pagination.
    const getPersistedPage = (key, fallback) => {
      const v = sessionStorage.getItem(key);
      return v ? parseInt(v, 10) : fallback;
    };

    let apiPage;
    if (buildingId && wingId) {
      // units listing for a specific wing
      apiPage = getPersistedPage(`unitPage_${wingId}`, unitPage);
    } else if (buildingId) {
      // wings listing for a specific building
      apiPage = getPersistedPage(`wingPage_${buildingId}`, null);
    } else {
      // top-level building/plot/bungalow listing
      apiPage = pageNo;
    }

    let contentPerPageParam;
    if (buildingId && wingId) {
      contentPerPageParam = unitsPerPage;
    } else if (buildingId) {
      // wings per-page (can be customized)
      contentPerPageParam = perPage;
    } else {
      contentPerPageParam = perPage;
    }

    getApiCall(`admin/apf-flow/hierarchical-data?formId=${formId}&dataEntryId=${idFromURL}&buildingId=${buildingId}&wingId=${wingId}`)
      .then((response) => {
      if (response.meta.status) {
        let type="Update PropertyInfo"
        if(formId==="68c3fd5fe42fa16a3856a89c"){
        type="Edit Unit"
        }
        else if(formId==="68c3e8824a3b18b0efee2019"){
        type="Edit Wing"
        }
        if (from == 'paymentPlan') {
        type="paymentPlan"
          setWingsList(formattingTableData(response,type, formId))
        }
        else if (buildingId && wingId) {

        setUnitsLists(formattingTableData(response, type, formId) || [])
        setTotalItems(response.data.total)
        }
        else if (buildingId) {
        projectInfoResponse?.forEach((building) => {
          if (building._id === buildingId) {
          building.wings = response?.data?.items || []
          }
        });
        setProjectInfoResponse([...projectInfoResponse])
        }
        else if (formId == "696887e9d3a31d4279a1efce") {
        setBuildingList(response?.data?.items || []);
        setProjectInfoResponse(response?.data?.items || [])
        } else {

        setUnitsLists(formattingTableData(response, type, formId) || [])
        setTotalItems(response.data.total)
        }
      }
      else {
        if (from == 'paymentPlan') {
        console.log('from:::::', from)
        setWingsList([])
        }
        else if (buildingId && wingId) {  
        setUnitsLists([])
        setTotalItems(0)
        }
        else if(buildingId){  
        projectInfoResponse?.forEach((building) => {
          if (building._id === buildingId) { 
          building.wings = []
          }
        });
        setProjectInfoResponse([...projectInfoResponse])
        }else if (formId == "696887e9d3a31d4279a1efce") {   
        setBuildingList([]);
        setProjectInfoResponse([])
        } else {  
        setUnitsLists([])
        setTotalItems(0)
        }
      }
      })
      .catch((error) => {
      console.error("Error loading form data:", error);
      });
  }

  const renderTabs = (sectionName) => (
    <>
      <div className="btn-group tab-btn-group mb-3">
        <button
          className={`btn ${(sectionName !== "Payment_Plans" ? active : payCurrentTab) === "building" ? "oneAPF-custom-btn-danger" : "oneAPF-custom-btn-outline"}`}
          onClick={() => {
            if (sectionName == "Payment_Plans") {
              console.log('payment::::::::inside')
              setPayCurrentTab('building')
              setWingsList([])
            }
            else {
              setActive("building");
              setProjectInfoResponse([]);
              setUnitsLists([])
              setResponseId(null)
            }
            getLists("696887e9d3a31d4279a1efce");
          }}
        >
          Building
        </button>

        <button
          className={`btn ${(sectionName !== "Payment_Plans" ? active : payCurrentTab) === "plot" ? "oneAPF-custom-btn-danger" : "oneAPF-custom-btn-outline"}`}
          onClick={() => {
            if (sectionName == "Payment_Plans") {
              setPayCurrentTab('plot')
              setWingsList([])
              getLists("68d4dea6058b71b5595c0b74", "", "", "paymentPlan");
            }
            else {
              setActive("plot");
              setProjectInfoResponse([]);
              setUnitsLists([])
              setResponseId(null)
              getLists("68d4dea6058b71b5595c0b74");
            }
          }}
        >
          Plot
        </button>

        <button
          className={`btn ${(sectionName !== "Payment_Plans" ? active : payCurrentTab) === "bungalow" ? "oneAPF-custom-btn-danger" : "oneAPF-custom-btn-outline"}`}
          onClick={() => {
            if (sectionName == "Payment_Plans") {
              setPayCurrentTab('bungalow')
              setWingsList([])
              getLists("68d4ec3a058b71b5595cacc6", "", "", "paymentPlan");
            }
            else {
              setActive("bungalow");
              setProjectInfoResponse([]);
              setUnitsLists([])
              setResponseId(null)
              getLists("68d4ec3a058b71b5595cacc6");
            }
          }}
        >
          Bungalow
        </button>
      </div>


    </>
  );

  function prepareDynamicTable(dataList, isTableSetting) {
    if (!dataList || dataList.length === 0) {
      return { headers: [], rows: [] };
    }

    const allFieldKeys = new Set();
    const arrayFieldMap = {};

    const isPrimitiveArray = (arr) =>
      Array.isArray(arr) && arr.every(v => typeof v !== "object");

    // 🔥 Convert selectboxes object → readable string
    const formatSelectBoxObject = (obj) => {
      if (!obj || typeof obj !== "object") return "-";

      return Object.keys(obj)
        .filter(k => obj[k] === true)
        .join(", ") || "-";
    };

    // =========================
    // STEP 1: Collect keys
    // =========================
    dataList.forEach(entry => {
      const formFields = entry.formFields || {};

      Object.keys(formFields).forEach(key => {
        if (key === "rolePermission") {
          const rpArray = formFields[key] || [];
          rpArray.forEach(rp => {
            Object.keys(rp).forEach(rpKey => {
              if (rpKey !== "partnerId" && rpKey !== "roleId") {
                if (Array.isArray(rp[rpKey])) {
                  arrayFieldMap[rpKey] = true;
                }
                allFieldKeys.add(rpKey);
              }
            });
          });
        } else if (key !== "permission") {
          if (Array.isArray(formFields[key])) {
            arrayFieldMap[key] = true;
          } else {
            allFieldKeys.add(key);
          }
        }
      });
    });

    const baseKeys = isTableSetting
      ? Array.from(allFieldKeys)
      : Array.from(allFieldKeys);

    // =========================
    // STEP 2: Expand headers
    // =========================
    let expandedHeaders = [];

    baseKeys.forEach(key => {
      if (arrayFieldMap[key]) {
        let isPrimitive = false;

        for (const entry of dataList) {
          const arr = entry.formFields?.[key];
          if (isPrimitiveArray(arr)) {
            isPrimitive = true;
            break;
          }
        }

        if (isPrimitive) {
          expandedHeaders.push(key);
        } else {
          let sample = null;

          dataList.forEach(entry => {
            const arr = entry.formFields?.[key];
            if (Array.isArray(arr) && Array.isArray(arr[0])) {
              sample = arr[0][0];
            } else if (Array.isArray(arr)) {
              sample = arr[0];
            }
          });

          if (sample && typeof sample === "object") {
            Object.keys(sample).forEach(subKey => {
              expandedHeaders.push(`${key}_${subKey}`);
            });
          } else {
            expandedHeaders.push(key);
          }
        }
      } else {
        expandedHeaders.push(key);
      }
    });

    expandedHeaders.push("Status", "ID", "isPdfExists", "formId");

    // =========================
    // STEP 3: Build rows
    // =========================
    const rows = [];

    dataList.forEach(entry => {
      const formFields = entry.formFields || {};
      const rolePermissionArray = formFields.rolePermission || [];

      const pushRow = (rp = null) => {
        const row = {};

        expandedHeaders.forEach(header => {
          if (header === "Status") {
            row[header] = entry.status || "-";
            return;
          }
          if (header === "ID") {
            row[header] = entry._id || "-";
            return;
          }
          if (header === "isPdfExists") {
            row[header] = entry.pdfTemplateExist || "-";
            return;
          }
          if (header === "formId") {
            row[header] = entry.formId || "-";
            return;
          }

          const parts = header.split("_");
          const key = parts[0];
          const subKey = parts[1];
          const value = formFields[key];

          // 🔥 ARRAY INSIDE ARRAY
          if (Array.isArray(value) && Array.isArray(value[0])) {
            row[header] = value[0][0]?.[subKey] ?? "-";
            return;
          }

          // 🔥 PRIMITIVE ARRAY
          if (isPrimitiveArray(value)) {
            row[header] = value.join(", ");
            return;
          }

          // 🔥 ARRAY OF OBJECTS
          if (Array.isArray(value) && typeof value[0] === "object") {
            row[header] = value[0]?.[subKey] ?? "-";
            return;
          }

          // 🔥 ROLE PERMISSION
          if (rp && rp.hasOwnProperty(header)) {
            row[header] = rp[header] ?? "-";
            return;
          }

          // 🔥 SELECTBOX OBJECT FIX (IMPORTANT)
          if (typeof value === "object" && !Array.isArray(value)) {
            row[header] = formatSelectBoxObject(value);
            return;
          }

          // 🔥 NORMAL FIELD
          row[header] = value !== undefined ? value : "-";
        });

        // Copy meta fields
        row.dataApprovalAssigneName =
          entry.dataApprovalAssigneName ??
          entry.dataApprovalAssigneeName ??
          entry.dataApprovalAssigne?.name ??
          "-";

        row.dataCreationAssigneName =
          entry.dataCreationAssigneName ??
          entry.dataCreationAssigneeName ??
          entry.dataCreationAssigne?.name ??
          "-";

        row.dataCreationAssignedById =
          entry.dataCreationAssignedById ?? "";

        rows.push(row);
      };

      if (Array.isArray(rolePermissionArray) && rolePermissionArray.length > 0) {
        rolePermissionArray.forEach(rp => pushRow(rp));
      } else {
        pushRow();
      }
    });

    return {
      headers: expandedHeaders,
      rows
    };
  }
const handleRoute=(item)=>{
  let tabName='building'
  if(item.formId=="68d4dea6058b71b5595c0b74"){
    tabName="plot"
  }
  else if(item.formId=="68d4ec3a058b71b5595cacc6"){
    tabName="bungalow"
  }
  console.log('C156430:::::',payCurrentTab, tabName, item)
  navigate(`/manage-payment-plans`,{state:{...item, idFromURL, activeTab: tabName}});
}
  const actionRender = async (item, type, formId, forLength = false) => {
    console.log('renderaction::::', item)
    const actions = [];
    // Always allow edit
    if(type!=="paymentPlan"){
    actions.push({
      type: "edit",
      label: "Edit",
      onClick: () => { handleEditProjectInfo(item, type, formId) },
    });

    actions.push({
      type: "delete",
      label: "Delete",
      // onClick: ()=>{},
    });

  }
  else{
     actions.push({
      type: "audit",
      label: "Manage Plans",
      onClick: () => {handleRoute(item)},
      // redirectUrl: `/manage-payment-plans?dataEntryId=${idFromURL}&formId=${formId}&responseId=${item.ID}`
    });
  }
    if (forLength) {
      return actions?.length > 0 ? true : false
    }
    return <CommonActionIcons actions={actions} />;
  };
  const renderTable = (data) => {
    return (
      <CommonTable
        formattedData={data?.length > 0 ? data : []}
        perPage={perPage}
        totalItems={totalItems}
        currentPage={pageNo}
        handler={pageChangeHandler}
        isActionStricky={true}
      />
    )
  }
  const handleEditProjectInfo = (row, type, formId) => {
    console.log('row::::::::::', row)
    setResponseId(row._id || row.ID);
    getFormDataById(formId);
    getFormDataByRowId(row._id || row.ID, formId);
    setFormId(formId)
    setModal({ type: type, show: true });
  };
  console.log('responseData:::::', responseData)
  return (<>
    <div>


      <ReusableAccordion
        title={'Project Information'}
        isOpen={currentParentIndex === 0}
        onToggle={() => { setCurrentBuildingId(null); setCurrentWingId(null); setCurrentParentIndex(currentParentIndex === 0 ? null : 0) }}

      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>

          {renderTabs()}
          {(dataEntryFormData?.status !== "SUBMITTED" && dataEntryFormData?.status!== "APPROVED" && type!== "view") &&
          <div>
            <CustomButton label={'Import Data'} icon={'bi-upload'} appendClass="text-white" onClick={() => openModal('', `${active.charAt(0).toUpperCase() + active.slice(1)} ImportData`, active == "building" ? '696887e9d3a31d4279a1efce' : active == "plot" ? '68d4dea6058b71b5595c0b74' : active == "bungalow" ? '68d4ec3a058b71b5595cacc6' : '')} />
            <CustomButton label={'+ Add ' + active.charAt(0).toUpperCase() + active.slice(1)} appendClass="text-white mx-2" onClick={() => openModal('', "Add PropertyInfo", active == "building" ? '696887e9d3a31d4279a1efce' : active == "plot" ? '68d4dea6058b71b5595c0b74' : active == "bungalow" ? '68d4ec3a058b71b5595cacc6' : '')} />
          </div>
}
        </div>
        {(projectInfoResponse?.length === 0 && unitsLists?.length == 0) &&
          <div className={`card shadow-sm h-100 card-body not-answerd-card`} >
            <p className="text-muted-not-answerd fst-italic mb-0" style={{ height: `200px`, textAlign: 'center', paddingTop: '80px' }}>
              No Record Found !
            </p>
          </div>
        }
        {active == "building" && <>
          {projectInfoResponse?.map((res, bIdx) => (
            <ReusableAccordion
              key={res?._id}
              title={res?.formFields?.buildingName}
              isOpen={currentBuildingId === res._id}
              onToggle={() => { setCurrentBuildingId(currentBuildingId === res._id ? null : res._id); setCurrentWingId(null); if (currentBuildingId !== res._id) { getLists('68c3e8824a3b18b0efee2019', res?._id) } }}
              actions={
                dataEntryFormData.status !== "SUBMITTED" && dataEntryFormData.status!== "APPROVED" &&
                <>
                  <Button size="small" onClick={() => handleEditProjectInfo(res,'Add PropertyInfo', active == "building" ? '696887e9d3a31d4279a1efce' : active == "plot" ? '68d4dea6058b71b5595c0b74' : active == "bungalow" ? '68d4ec3a058b71b5595cacc6' : '')} style={{ marginRight: 8 }}>Edit</Button>
                  <Button size="small" color="error" onClick={() => deleteBuilding(bIdx)} style={{ marginRight: 8 }}>Delete</Button>
                  <Button size="small" onClick={() => openModal(res, "New wing ImportData", '68c3e8824a3b18b0efee2019', res._id)} style={{ marginRight: 8 }}>+ Import Data</Button>
                  <Button size="small" onClick={() => openModal(res, "Wing", '68c3e8824a3b18b0efee2019', res._id)} style={{ marginRight: 8 }}>+ Add Wing</Button>
                </>
              }
            >
              {/* <div><strong>Address:</strong> {building.address || "-"}</div> */}

              {/* Wings */}
              {res?.wings?.map((wing, wIdx) => (
                <ReusableAccordion
                  key={wing?._id}
                  isOpen={currentWingId == wing._id && currentBuildingId == res._id}
                  onToggle={() => { setCurrentWingId(currentWingId === wing._id ? null : wing._id); if (currentWingId !== wing._id) { getLists('68c3fd5fe42fa16a3856a89c', res?._id, wing?._id) } }}
                  title={wing?.wingName}
                  actions={
                    (dataEntryFormData.status !== "SUBMITTED" && dataEntryFormData.status!== "APPROVED" && type!== "view")&&
                    <>
                      <Button size="small" onClick={() => handleEditProjectInfo(wing, 'Edit Wing', '68c3e8824a3b18b0efee2019')} style={{ marginRight: 8 }}>Edit</Button>
                      <Button size="small" color="error" onClick={() => deleteWing(bIdx, wIdx)} style={{ marginRight: 8 }}>Delete</Button>
                      <Button size="small" onClick={() => openModal(res, "New unit ImportData", '68c3fd5fe42fa16a3856a89c', res._id, wing._id)} style={{ marginRight: 8 }}>+ Import Data</Button>
                      <Button size="small" onClick={() => openModal(wing, "Unit", '68c3fd5fe42fa16a3856a89c', res._id, wing._id)} style={{ marginRight: 8 }}>+ Add Unit</Button>
                    </>
                  }
                >
                  {/* Units Table */}
                  {renderTable(unitsLists)}
                </ReusableAccordion>
              ))}
            </ReusableAccordion>
          ))}
        </>
        }
        {(active !== "building" && unitsLists?.length > 0) && <>
          {renderTable(unitsLists)}
        </>
        }
        {/* ---------------- MODAL ---------------- */}
        <Modal
          show={modal.show && (modal.type.includes("editBuilding") || modal.type.includes("PropertyInfo") || modal.type.includes("Wing") || modal.type.includes("Unit"))}
          // onHide={closeModal}
          centered
          size="xl"
          backdrop="static"
        >
          <Modal.Header>
            <Modal.Title>
              {active.charAt(0).toUpperCase() + active.slice(1)}  Management
            </Modal.Title>
            <i
            className="fa fa-times ms-auto"
            role="button"
            onClick={closeModal}
            style={{ fontSize: '1.2rem', cursor: 'pointer' }}
          />
          </Modal.Header>

          <Modal.Body>

            {/* BUILDING */}

            <div className="container-fluid">
              <Form
                ref={formRef}
                submission={{ data: { ...responseData?.formFields, accessToken, apiBasePath: Constant.apiBasePath, projectName: formData?.projectName || '' } }}
                form={formSchema}
              />
            </div>
          </Modal.Body>

          <Modal.Footer>
            {modal.type.includes("PropertyInfo") && (
              <button className="btn btn-success" onClick={() => handleSubmit(active)}>
                Save {active.charAt(0).toUpperCase() + active.slice(1)}
              </button>
            )}

            {modal.type.includes("Wing") && (
              <button className="btn btn-success" onClick={() => handleSubmit('wing')}>
                Save Wing
              </button>
            )}

            {modal.type.includes("Unit") && (
              <button className="btn btn-success" onClick={() => handleSubmit('unit')}>
                Save Unit
              </button>
            )}
          </Modal.Footer>
        </Modal>
        <DataEntryBulkDataUpload
          formId={formId}
          visible={modal.show && modal.type.includes("ImportData")}
          setVisible={closeModal}
          projectName={formData?.projectName || ''}
          getLists={getLists}
          activeTab={active}
          type={modal.type}
          idFromURL={idFromURL}
          buildingId={currentBuildingIndex}
          wingId={currentWingIndex}
          actionType={type}
        />
      </ReusableAccordion>
      <ReusableAccordion title={'Payment Plans'}
        isOpen={currentParentIndex === 1}
        onToggle={() => setCurrentParentIndex(currentParentIndex === 1 ? null : 1)}
      >
        <PaymentPlans
          renderTabs={renderTabs}
          wingsList={wingsList}
          buildingList={buildingList}
          payCurrentTab={payCurrentTab}
          idFromURL={idFromURL}
          getLists={getLists}
          formId={formId}
          renderTable={renderTable}
          dataEntryFormData={dataEntryFormData}
          type={type}
        />

      </ReusableAccordion>
      <ReusableAccordion title={'Exposure'}
        isOpen={currentParentIndex === 2}
        onToggle={() => setCurrentParentIndex(currentParentIndex === 2 ? null : 2)}
      >
        <Exposure
        idFromURL={idFromURL}
        formData={formData}
        dataEntryFormData={dataEntryFormData}
        type={type}
        />
      </ReusableAccordion>
      <ReusableAccordion title={'Disbursement Documents'}
        isOpen={currentParentIndex === 3}
        onToggle={() => setCurrentParentIndex(currentParentIndex === 3 ? null : 3)}
      >
        <DisbursementDocuments
         idFromURL={idFromURL}
        formData={formData}
        dataEntryFormData={dataEntryFormData}
        actionType={type}
        />
      </ReusableAccordion>
      <ReusableAccordion title={'Project Progress'}
        isOpen={currentParentIndex === 4}
        onToggle={() => setCurrentParentIndex(currentParentIndex === 4 ? null : 4)}
      >
        <ProjectProgressLists  type={type} idFromURL={idFromURL} formData={formData} workFlowId={workFlowId} dataEntryFormData={dataEntryFormData}/>
      </ReusableAccordion>
    </div>
{dataEntryFormData?.status !== "SUBMITTED" && dataEntryFormData?.status!== "APPROVED" &&<>
<div className="d-flex justify-content-end">
  <CustomButton label={'Assign For Recommendation'} appendClass="text-white" variant="danger" onClick={()=>{setIsRecommend(true);getFormDataById('69b8edeb83fe67d59125a92b'); setFormId('69b8edeb83fe67d59125a92b')}}/>
    {isRecommend&&<Recommendation 
    open={isRecommend}
    setOpen={setIsRecommend}
    dataEntryId={idFromURL}
    workFlowId={workFlowId}
    accessToken={accessToken}
    apiBasePath={Constant.apiBasePath}
    projectName={formData.projectName}
    handleSubmit={handleSubmit}
    formRef={formRef}
    formSchema={formSchema}
    />}
</div>
</>}
  </>);
}


export default memo(DataEntryOneAPF);
