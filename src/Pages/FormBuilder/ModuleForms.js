import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Form } from 'react-formio';
import JSZip from 'jszip';
import { QueryBuilder, formatQuery } from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";

import { toast } from 'react-toastify';
import postApiCall from '../../Services/postApiCall.js';
import getApiCall from '../../Services/getApiCall.js';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation, useParams } from 'react-router-dom';
import loginUser from '../../Services/loginUser.js';
import Constant from '../../Components/Constant.js';
import ConfirmationModal from './ConfirmationModal.js';
import { toTitleCase } from '../../Utils/Helpers.js';
import useGetRoleModule from '../../Services/useGetRoleModule.js';
import HierarchySelect from './HierarchySelect.js';
import { slugifyTransform } from '../../Utils/Helpers.js';
import 'formiojs/dist/formio.full.min.css';
import Modal from 'react-bootstrap/Modal';
import CustomButton from '../../Utils/CustomButton.js';
import DataEntryOneAPF from './DataEntryOneAPF/DataEntryOneAPF.js';
import ReusableAccordion from '../../Utils/Accordion/ReusableAccordion.jsx';
import FormRendererComponent from './FormRendererComponent.js';
import ErrorModal from '../Reusable/ErrorModal/ErrorModal.jsx';
import { Button,Typography,TextField,InputAdornment,Box } from '@mui/material';
import ReusableSelect from '../Reusable/ReusableSelect.jsx';
import Recommendation from './Recommendation/Recommendation.js';
import ReusableModal from '../Reusable/ReusableModal/ReusableModal.jsx';
import { userDetails } from '../../Services/authenticationService.js';
import { useUserDetailsStore } from '../../Store/userDetailsStore.js';

import {
  NoOfYearsOfExperienceOfBuilder, NoOfProjectsCompletedByBuilder, VolumeOfPastDevelopmentInSqFt, TypeOfFirm,
  PlanningAndExecution, CustomerSegment, ProposedProjectApprovedByOtherBanksFI, StageOfConstructionForTheProposedProject,
  DetailsOfProposedProject, QualityOfProjectAndConstruction, LegalTrackRecord
} from '../../Services/constantData.js';
// import { T } from 'react-querybuilder/dist/index-ByIV7_Fn.js';

const ModuleForms = ({formId, formName, type, from="createUpdateForm", displayName}) => {
  console.log('formId::::::::sdghjdjhkgjhghdfghjkdfhbd',formId)
  let {accessToken} = loginUser();
  let blogToken = localStorage.getItem('uploadT')
const formRef = useRef();
const approveRejectRef = useRef();
const userDetail=userDetails()
// const approveFormRef = useRef();
  const [formData, setFormData] = useState()
  const [formioInstance, setFormioInstance] = useState(null);
  const [responseData, setResponseData] = useState({})
  const [projectResponseData, setProjectResponseData] = useState({})
  const [responseId, setResponseId] = useState('')
  const [newResponseId, setNewResponseId] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [selectedButton, setSelectedButton] = useState('')
  const [permission, setPermission] = useState([])
  const [userComment, setUserComment] = useState('')
  const [hierarchyPermission, setHierarchyPermission] = useState({})
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const idFromURL = params.get('id');
  const workflowName = params.get('workflowName');
  const [selectionType, setSelectionType] = useState("positive"); // positive | negative
  const [selectedOption, setSelectedOption] = useState([]);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const selectedPartnerValue = useUserDetailsStore((state) => state.selectedPartnerValue);
  

  console.log('hierarchyPermission::::::::', idFromURL, selectedPartnerValue)
  const history = useNavigate();
  const [formSchema, setFormSchema] = useState({
    display: "form",
    components: []
  });
  const [workflowId, setWorkflowId] = useState(null);

  const[projectFormSchema,setProjectFormSchema]=useState({
    display: "form",
    components: []
  });
  const [projectFormData,setProjectFormData]=useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

const showImageModal = (url) => {
  setPreviewUrl(url);
};
const [openErrorModal, setOpenErrorModal] = useState(false);
const [modalErrorMsg, setModalErrorMsg] = useState("");
// const [duplicateNpa, setDuplicateNpa] = useState(false);
const [showNpaDuplicateModal, setShowNpaDuplicateModal] = useState(false);
const [npaDuplicateMessage, setNpaDuplicateMessage] = useState("");
const [currentPayloadForNpa, setCurrentPayloadForNpa] = useState(null);
const [isProcessingNpaOverride, setIsProcessingNpaOverride] = useState(false);
const [gradeValue, setGradeValue] = useState("");
const [scoreValue, setScoreValue] = useState("");
const [isShowBuilderScoreForm, setIsShowBuilderScoreForm] = useState(false);

// Query Builder States
const [fields, setFields] = useState([]);
const [rules, setRules] = useState({ rules: [], combinator: 'and', not: false });
const previousProjectionRef = useRef(null);

const [experienceOfBuilder,setExperienceOfBuilder] = useState(null);
const [projectsCompletedByBuilder,setProjectsCompletedByBuilder] = useState(null);
const [volumeOfPastDevelopmentInSqFt,setVolumeOfPastDevelopmentInSqFt] = useState(null);
const [typeOfFirm,setTypeOfFirm] = useState(null);
const [planningAndExecution,setPlanningAndExecution] = useState(null);
const [customerSegment,setCustomerSegment] = useState(null);
const [proposedProjectApprovedByOtherBanksFI,setProposedProjectApprovedByOtherBanksFI] = useState(null);
const [stageOfConstructionForTheProposedProject,setStageOfConstructionForTheProposedProject] = useState(null);
const [detailsOfProposedProject,setDetailsOfProposedProject] = useState(null);
const [qualityOfProjectAndConstruction,setQualityOfProjectAndConstruction] = useState(null);
const [legalTrackRecord,setLegalTrackRecord] = useState(null);
const [formResponse,setFormResponse] = useState(null);
// const [totleBuildeScore, setTotleBuilderScore] = useState(0);
  
 async function GetRole() {
        let Role = await useGetRoleModule(toTitleCase(formName));
        if (Role.moduleList.read === false) {
            setPermission({ moduleAccress: false, moduleList: {}, message: "Module Need Some Permission...Pls contact with Your Partner" })
        } else {
            setPermission(Role)
        }
        // const FilteredData = permissionData.formFields.permission.filter((item, index)=>item.label.includes('Auctions'))[0]?.actions || []
        //     setPermission(FilteredData)
        //      getList();

    }

    useEffect(() => {
        GetRole()
    }, []);
    const disableAll = (items = []) =>
  items.map((item) => {
    const copy = { ...item, disabled: true };

    if (Array.isArray(copy.components)) {
      copy.components = disableAll(copy.components);
    }

    if (Array.isArray(copy.columns)) {
      copy.columns = copy.columns.map((col) => ({
        ...col,
        disabled: true,
        components: disableAll(col.components || []),
      }));
    }

    if (Array.isArray(copy.rows)) {
      copy.rows = copy.rows.map((row) =>
        row.map((col) => ({
          ...col,
          disabled: true,
          components: disableAll(col.components || []),
        }))
      );
    }

    return copy;
  });
   const getFormDataById = () => {
    getApiCall(`admin/dynamic/form/details/${formId}`)
      .then((response) => {
        
        if (response.meta.status) {
          if(formName!=="create-roles"&& formName!=="partner-user" && formName!=="hierarchy"){
          setFormSchema({
            display: "form",
            components: [...response.data.moduleFormData]
          });
        }else{
           setFormSchema({
            display: "form",
            components: [...response.data.moduleFormData]
          });
        }
        setWorkflowId(response.data.workflowId)
        }
      })
      .catch((error) => {
        console.error("Error loading form schema:", error);
      });
  };


const getProjectDocuments = async () => {
  let agencyAssignmentName = "legalAgencyAssignment";

  switch (formName) {
    case "legal-agency-assignment-form":
      agencyAssignmentName = "legalAgencyAssignment";
      break;
    case "agency-report-upload":
      agencyAssignmentName = "technicalAgencyAssignment";
      break;
    case "fcu":
      agencyAssignmentName = "fcuAgencyAssignment";
      break;
    case "roc":
      agencyAssignmentName = "rocAgencyAssignment";
      break;
    default:
      break;
  }

  try {
    const response = await getApiCall(
      `admin/apf-flow/assigned-documents/${formId}/${idFromURL || responseId}/${agencyAssignmentName}`
    );

    if (response?.meta?.status) {
      const projectDocs = response?.data?.formFields?.projectDocuments;
      return projectDocs;   // ✅ return data properly
    }

    return null;
  } catch (error) {
    console.error("Error loading form schema:", error);
    return null;
  }
};


//      const getPaymentStagesByPlan = () => {
//       let query = {
//         propertyType: "Building-Wing",
//         city: 'Ahmedabad',
//         state: 'Gujarat'
//       }
//     getApiCall(`admin/apf-flow/fetch-master-payment-plan?` + new URLSearchParams(query))
//       .then((response) => {
        
//         if (response.meta.status) {
//           const components = [];
//         const data = {};

//        response.data[0].formFields.dataGrid.forEach(stage => {
//   console.log('stage:::::',stage)
//   // Title
//   components.push({
//     type: "content",
//     html: `<h4>${stage.stageOfConstruction}</h4>`,
//   });

//   // Grid columns
//   const gridColumns = [
//     {
//       type: "textfield",
//       key: "constructionStage",
//       label: "Construction Stage",
//       disabled: true,
//       persistent: true
//     }
//   ];

//   if (stage.floorwiseSeparation) {
//     gridColumns.push({
//       type: "textfield",
//       key: "floorNumber",
//       label: "Floor",
//       disabled: true,
//       persistent: true
//     });
//   }

//   gridColumns.push(
//     {
//       type: "number",
//       key: "workCompleted",
//       label: "Work Completed (%)",
//       disabled: true,
//       persistent: true
//     },
//     {
//       type: "number",
//       key: "disbursementRecommendedMaster",
//       label: "Disbursement Recommended (%)"
//     }
//   );

//   // EditGrid
//   components.push({
//     type: "editgrid",
//     key: `grid_${stage.stageId}`,
//     input: true,
//     addAnother: false,
//     removeRow: false,
//     components: gridColumns
//   });

//   // ✅ ROW DATA (THIS IS WHAT CREATES ROWS)
//   data[`grid_${stage.stageId}`] = [{
//     constructionStage: stage.constructionStage,
//     floorNumber: stage.floorNumber,
//     workCompleted: stage.workCompleted,
//     disbursementRecommendedMaster: stage.disbursementRecommendedMaster,
//     projectPaymentPlanCnstDetailId: stage.projectPaymentPlanCnstDetailId
//   }];
// });
// const allComponent = [...formSchema.components,...components ]

//         setFormSchema({ display: "form", components:allComponent});
//         setFormData({...formData, ...data})
//         }
//       })
//       .catch((error) => {
//         console.error("Error loading form schema:", error);
//       });
//   };

 

  // Fetch submitted data for editing
  const getFormDataByRowId = (responseId) => {
    getApiCall(`admin/submit/form/details/${formId}/${idFromURL||responseId}`)
      .then((response) => {
        const newFormFields = { ...response?.data?.formFields,...response?.data?.rejectFormFields,...response?.data?.approveFormFields };
        if (response.meta.status) {
          // setFormData(response.data.formFields); // Form.io expects the raw data object
          setFormData(newFormFields);
          setResponseData(response.data)
          setFormResponse(response)
        }
      })
      .catch((error) => {
        console.error("Error loading form data:", error);
      });
  };
  useEffect(()=>{
    if(formData?.prospectNo && (!formData?.referenceImage || formData?.referenceImage?.length==0) && formId=="683ef3f2f676296479d29224"){
      imageLoadByProspectNumber(formData?.prospectNo)
    }

  },[formData?.prospectNo])
  
  const processImages=async(images)=> {
  const result = [];

  for (const img of images) {
    result.push({
      ...img,
      name: img.filename,
      originalName:img.filename,
      storage: 'base64'
    });
  }

  return result;
}

const imageLoadByProspectNumber = async (prospectNum) => {
  try {
    const response = await getApiCall(`admin/los-images/${prospectNum}`);
    if (response.meta.status) {
      const referenceImages = await processImages(response?.data?.images || []);
      setFormData({
        ...formData,
        referenceImage: referenceImages
      });
    } else {
      console.warn("API returned status = false", response);
    }
  } catch (error) {
    console.error("Error loading form data:", error);
  }
};
console.log('permissionObject:::::', formData)
  useEffect(() => {
    if (formId) {getFormDataById()};
    if (idFromURL) {getFormDataByRowId()};

    
  }, [formId, idFromURL]);

  // Fetch fields for Query Builder when formName is "api-builder"
  // useEffect(() => {
  //   if (formName === "api-builder" && formId) {
  //     getApiCall(`admin/dynamic/form/keys/${formId}`)
  //       .then((response) => {
  //         if (response.meta.status) {
  //           const keys = response.data.keys || [];
  //           setFields(keys);
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("Error loading form fields:", error);
  //       });
  //   }
  // }, [formName, formId]);

  // useEffect(() => {
  //   console.log("ddd111 formname,workflowId = ",formName,workflowId,idFromURL,responseId);
  //   console.log("ddd111 URL ID:", idFromURL, typeof idFromURL);

  //   if ((formName == "legal-agency-report" || formName == "legal-agency-assignment-form" ||
  //     formName == "agency-report-upload" || formName == "fcu" || formName == "roc") && workflowId && (idFromURL || responseId)
  //   ) {
  //     getSecondFormDataById(workflowId)
  //   }
  //     // getSecondFormDataById()
  //     // getProjectDocuments()

  // },[workflowId,idFromURL,formId]);

  useEffect(() => {
    console.log("ddd111 formname,workflowId = ", formName, workflowId, idFromURL, responseId);

    const allowedForms = [
      "legal-agency-report",
      "legal-agency-assignment-form",
      "agency-report-upload",
      "fcu",
      "roc"
    ];

    if (
      allowedForms.includes(formName) &&
      workflowId &&
      (idFromURL || responseId)
    ) {
      getSecondFormDataById(workflowId);
    }
  }, [workflowId, idFromURL, responseId, formId, formName]);

  //  const getSecondFormDataById = (workflowId) => {
  //   getApiCall(`admin/workflow-instance/by-form-response/${workflowId}/${formId}/${idFromURL||responseId}?collectionName=form_project`)
  //     .then((response) => {
  //       if (response.meta.status) {

  //         setProjectFormSchema({
  //           display: "form",
  //           components: [...response.data.moduleFormData]
  //         });
  //         setProjectFormData(response.data.responseData)
  //         setResponseData(response.data.responseData)
  //       }

  //     })
  //     .catch((error) => {
  //       console.error("Error loading form schema:", error);
  //     });
  // };
  const getSecondFormDataById = async (workflowId) => {
  try {
    const response = await getApiCall(
      `admin/workflow-instance/by-form-response/${workflowId}/${formId}/${idFromURL || responseId}?collectionName=form_project`
    );

    if (response?.meta?.status) {

      // ✅ call second API
      const projectDocs = await getProjectDocuments();
      console.log("Project Documents:", projectDocs);

       setProjectFormSchema({
            display: "form",
            components: [...response.data.moduleFormData]
          });
          // setProjectFormData(projectDocs.formFields)
          // setResponseData(response.data.responseData)
          setProjectFormData({...response.data.responseData, projectDocuments: projectDocs})  // <-- merge project docs into response data
    }

  } catch (error) {
    console.error("Error loading form schema:", error);
  }
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

  const traverseAndUpload = async (obj) => {
    if (Array.isArray(obj)) {
      // Process array elements
      const updatedArray = [];
      for (const item of obj) {
        updatedArray.push(await traverseAndUpload(item));
      }
      return updatedArray;
    } else if (obj && typeof obj === 'object') {
      const updatedObj = {};
      for (const key in obj) {
        const value = obj[key];

        // If value is a base64 file array
        if (Array.isArray(value) && value[0]?.storage === 'base64' && value[0]?.url?.startsWith('data:')) {
          const uploadedList = [];

          for (const file of value) {
            try {
              const base64Data = file.url.split(',')[1];
              const mimeType = file.type;
              const blob = base64ToBlob(base64Data, mimeType);
              const formUpload = new FormData();
              let result = null;

              if (formId === "691b16cca2e080e2b32f5d77") {
                if (file.name?.toLowerCase().endsWith(".apk")) {
                  formUpload.append('apk', blob, file.name);
                  result = await postApiCall(
                    `common/upload/blob/admin/apk`,
                    formUpload,
                    true
                  );
                } else {
                  console.warn('Only APK upload allowed for this form!');
                  continue;
                }
              } else if (mimeType.startsWith("image/")) {
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

              if (result?.meta?.status) {
                uploadedList.push({
                  name: file.name,
                  originalName: file.name,
                  url: result.data + blogToken,
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

          updatedObj[key] = uploadedList; // replace with uploaded metadata
        } else {
          // Recursively traverse nested objects/arrays
          updatedObj[key] = await traverseAndUpload(value);
        }
      }
      return updatedObj;
    }
    return obj; // primitive values remain unchanged
  };

  const updatedData = await traverseAndUpload(formData);
  console.log('updatedData::::::', updatedData);
  return updatedData;
};

// apiService.js (or wherever you keep API functions)

const postApiByUrl = async (url,payload) => {
  payload = {
    name: payload?.partnerName,
    logo: payload?.partnerLogo[0]?.url || '',
    tenderTermsAndConditionsHtml: payload?.tenderTermsAndConditions,
    tenderHtml: payload?.tenderFormHtmlFormat,
    bidderDeclarationHtml: payload?.bidderDeclarationHtmlFormat,
    saleLetterDocxTemplate: payload?.saleLetterDocxTemplate[0]?.url || '',
  };
  try {
    const response = await postApiCall(
      url,
      {
        ...payload
      }
    );

    return response; // return full response
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

const postApiByUrlAndPayload = async (url,payload) => {
 
  try {
    const response = await postApiCall(
      url,
      {
        ...payload
      }
    );

    return response; // return full response
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

  // Handle Query Builder changes
  const handleQueryChange = (query) => {
    console.log('query:::::', query);
    setRules((prev) => ({ ...prev, ...query, mongoQuery: formatQuery(query, "mongodb") }));
  };

  const handleSubmit = async (status, payloadparam = {}) => {
    if (!formRef.current || !formRef.current.formio) return;

    const formio = formRef.current.formio;

    // Access the current data
    const submissionData = formio.submission?.data || {};

    try {
      // Validate form manually
      if (status !== "DRAFT") {
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
      }
      console.log('finalData:::::: submissionData = ', submissionData)

      const finalData = await uploadAllBase64Files(submissionData)
      console.log('finalData::::::', finalData)
      // Clone submissionData to avoid mutating the original
      const beforePayload = { ...finalData, ...hierarchyPermission };
      delete beforePayload.accessToken;
      delete beforePayload.apiBasePath;
      delete beforePayload.formName;
      delete beforePayload.userDepartment;
      delete beforePayload.allLegalAddress;

      console.log('Submission Data:', submissionData);
      console.log('Payload Data (sanitized):', beforePayload);





      // Construct base payload

      let payload={}

      if(formId=="69e9d4282bed16f0b56f1b3e"){
        payload={
         formId,
        userComment,
        formFields: {
  ...beforePayload,
  approvedUserDetails: [
    ...(beforePayload?.approvedUserDetails || []),
    {
      userId: userDetail?.id,
      userName: userDetail?.name,
      approvalStatus: beforePayload?.status,
      remarks: beforePayload?.remarks
    }
  ]
},
        status:beforePayload?.status
      }
      }
      else{ payload = {
        formId,
        userComment,
        formFields: beforePayload,
        status
      };
    }

      let response = {};
      let firstResponse = {};

      if (submissionData?.formName === "Create Partner") {
        console.log("sss111 responseData = ", responseData.partnerResponseUserId);
        if (responseData?.partnerResponseUserId) {
          const partnerUserId = idFromURL || responseId;
          const addPartnerResponse = await postApiByUrl(`admin/partner/update/${responseData?.partnerResponseUserId}`, beforePayload);

          // this will always run
          if (addPartnerResponse.meta?.status) {
            console.log('Success123 = ', addPartnerResponse);
            response = await postApiCall(
              `admin/submit/form/update/${partnerUserId}`,
              { ...payload, partnerResponseUserId: responseData?.partnerResponseUserId },
              true
            );
            toast.success(response.meta?.msg);
          } else {
            console.log('Handled error, but continuing flow');
            return; // stop submit if partner addition fails
          }
        } else {
          if (submissionData?.formName === "Create Partner") {
            const addPartnerResponse = await postApiByUrl('admin/partner/add', beforePayload);

            // this will always run
            if (addPartnerResponse.meta?.status) {
              console.log('Success123 = ', addPartnerResponse);
              response = await postApiCall(
                'admin/submit/form/add',
                { ...payload, partnerResponseUserId: addPartnerResponse?.data },
                true
              );
              toast.success(addPartnerResponse.meta?.msg);
            } else {
              console.log('Handled error, but continuing flow');
              return; // stop submit if partner addition fails
            }
          }
        }
        return;

      }

      if (submissionData?.formName === "Partner Settings") {
        // console.log("sss111 responseData = ", responseData.partnerResponseUserId);
        console.log("sss111 responseData = ", responseData);
        const formEntryId = idFromURL || responseId;
        console.log("sss111 formEntryId = ", formEntryId);


        if (formEntryId) {
          console.log("condition111 update before ", beforePayload);
          const url = `admin/partner/settings`;
          const customPayload = {
            partnerId: beforePayload?.selectPartnerId,
            tenderHtml: beforePayload?.tenderFormHtmlFormat,
            tenderTermsAndConditionsHtml: beforePayload?.tenderTermsAndConditions,
            bidderDeclarationHtml: beforePayload?.bidderDeclarationHtmlFormat,
            saleLetterDocxTemplate: beforePayload?.saleLetterDocxTemplate[0]?.url || '',
          }

          // const partnerUserId = idFromURL || responseId;
          const partnerSettingResponse = await postApiByUrlAndPayload(url, customPayload);
          console.log("ddd1111 partnerSettingResponse = ", partnerSettingResponse);

          // this will always run
          if (partnerSettingResponse.meta?.status) {
            console.log('Success123 = ', partnerSettingResponse);
            response = await postApiCall(
              `admin/submit/form/update/${formEntryId}`,
              { ...payload, partnerResponseUserId: partnerSettingResponse?.data },
              true
            );
            toast.success(response.meta?.msg);
          } else {
            console.log('Handled error, but continuing flow');
            return; // stop submit if partner addition fails
          }
        } else {
          console.log("iii create responseData = ", responseData);
          const url = `admin/partner/settings`;
          console.log("iii id = ", selectedPartnerValue);
          console.log("iii beforePayload = ", beforePayload);


          const customPayload = {
            partnerId: beforePayload?.selectPartnerId,
            tenderHtml: beforePayload?.tenderFormHtmlFormat,
            tenderTermsAndConditionsHtml: beforePayload?.tenderTermsAndConditions,
            bidderDeclarationHtml: beforePayload?.bidderDeclarationHtmlFormat,
            saleLetterDocxTemplate: beforePayload?.saleLetterDocxTemplate[0]?.url || '',
          }
          const partnerSettingResponse = await postApiByUrlAndPayload(url, customPayload);
          console.log("ddd1111 partnerSettingResponse = ", partnerSettingResponse);
          if (partnerSettingResponse.meta?.status) {
            console.log('Success123 = ', partnerSettingResponse);
            response = await postApiCall(
              'admin/submit/form/add',
              { ...payload, partnerResponseUserId: partnerSettingResponse?.data },
              true
            );
            toast.success(partnerSettingResponse.meta?.msg);
          } else {
            console.log('Handled error, but continuing flow');
            return; // stop submit if partner addition fails
          }

          // if (submissionData?.formName === "Create Partner") {
          //   const addPartnerResponse = await postApiByUrl('admin/partner/add', beforePayload);

          //   // this will always run
          //   if (addPartnerResponse.meta?.status) {
          //     console.log('Success123 = ', addPartnerResponse);
          //     response = await postApiCall(
          //       'admin/submit/form/add',
          //       { ...payload, partnerResponseUserId: addPartnerResponse?.data },
          //       true
          //     );
          //      toast.success(addPartnerResponse.meta?.msg);
          //   } else {
          //     console.log('Handled error, but continuing flow');
          //     return; // stop submit if partner addition fails
          //   }
          // }
        }
        return;

      }

      function addPrefixToKeys(obj, prefix) {
        if (Array.isArray(obj)) {
          return obj.map(item => addPrefixToKeys(item, prefix));
        }

        if (obj !== null && typeof obj === "object") {
          const result = {};

          for (const key in obj) {
            const newKey = key.startsWith("$") ? key : `${prefix}.${key}`;
            result[newKey] = addPrefixToKeys(obj[key], prefix);
          }

          return result;
        }

        return obj;
      }

      // function toMongoString(obj) {
      //   if (Array.isArray(obj)) {
      //     return `[${obj.map(toMongoString).join(", ")}]`;
      //   }

      //   if (obj !== null && typeof obj === "object") {
      //     return `{${Object.entries(obj)
      //       .map(([key, value]) => `"${key}": ${toMongoString(value)}`) // ✅ key in quotes
      //       .join(", ")}}`;
      //   }

      //   if (typeof obj === "string") {
      //     return `"${obj}"`;
      //   }

      //   return obj;
      // }
      // === Special case for "partner-user" ===
      if (formName == "api-builder") {
        const partnerUserId = idFromURL || responseId;
        const projectionObj = beforePayload?.projection.reduce((acc, key) => {
          acc[key] = 1;
          return acc;
        }, {});

        let mongoQuery = formatQuery(rules, "mongodb");
        if (typeof mongoQuery === "string") {
          mongoQuery = JSON.parse(mongoQuery);
        }
        let updatedQuery = addPrefixToKeys(mongoQuery, "formField");
        // let finalQueryString = toMongoString(updatedQuery);

        //         let cleanMongoFilter = JSON.stringify(JSON.parse(finalQueryString));
        // cleanMongoFilter = `"${cleanMongoFilter.replace(/\\"/g, '"')}"`;
        if (typeof updatedQuery === "string") {
          updatedQuery = JSON.parse(mongoQuery);
        }

        console.log("bbb111 clean mongoQuery = ", mongoQuery);
        console.log("bbb111 clean updatedQuery = ", updatedQuery);




        let apiBuilderPayload = {
          name: beforePayload?.name,
          description: beforePayload?.name,
          modelName: slugifyTransform(beforePayload?.ModelName),
          isModuleForm: true,
          apiFor: beforePayload.typeOfApi,
          projection: projectionObj,
          searchKey: { [beforePayload?.searchKey]: 1 },
          searchApiRequired: beforePayload.searchApi,
          sorting: { [beforePayload?.sorting]: -1 },
          filters: {
            status: beforePayload?.statusFilter
          },
          pagination: {
            defaultLimit: beforePayload?.defaultLimit,
            maxLimit: beforePayload?.maxLimit
          },
          mongoFilter: updatedQuery
        }
        // If editing (update)
        if (partnerUserId) {


          firstResponse = await postApiCall(
            `admin/builder/update/${responseData.partnerResponseUserId}`,
            apiBuilderPayload,
            true
          );

          if (firstResponse?.meta?.status) {
            setNewResponseId(firstResponse?.data)
            payload = {
              ...payload,
              formFields: { ...payload.formFields, endPoint: firstResponse.endPoint }
            }
            response = await postApiCall(
              `admin/submit/form/update/${partnerUserId}`,
              { ...payload, partnerResponseUserId: firstResponse?.data },
              true
            );
          }
          else {
            toast.error(firstResponse?.meta?.msg || 'Submission failed');
            return;
          }
        } else {
          // If adding new

          firstResponse = await postApiCall(
            'admin/builder/add',
            apiBuilderPayload,
            true
          );

          if (firstResponse?.meta?.status) {
            setNewResponseId(firstResponse?.data)
            payload = {
              ...payload,
              formFields: { ...payload.formFields, endPoint: firstResponse.endPoint }
            }
            response = await postApiCall(
              'admin/submit/form/add',
              { ...payload, partnerResponseUserId: firstResponse?.data },
              true
            );
          } else {
            toast.error(firstResponse?.meta?.msg || 'Submission failed');
            return;
          }
        }
      }

      // === Special case for "partner-user" ===
      else if (formName == "partner-user") {
        const partnerUserId = idFromURL || responseId;

        // If editing (update)
        if (partnerUserId) {
          const cleanedData = beforePayload.rolePermission.map(item => ({
            partnerId: item.partnerId,
            roleId: item.roleId
          }));
          firstResponse = await postApiCall(
            `admin/partner-user/update/${responseData.partnerResponseUserId}`,
            { ...beforePayload, rolePermission: cleanedData },
            true
          );

          if (firstResponse?.meta?.status) {
            setNewResponseId(firstResponse?.data)
            response = await postApiCall(
              `admin/submit/form/update/${partnerUserId}`,
              { ...payload, partnerResponseUserId: firstResponse?.data },
              true
            );
          }
          else {
            toast.error(firstResponse?.meta?.msg || 'Submission failed');
            return;
          }
        } else {
          const cleanedData = beforePayload.rolePermission.map(item => ({
            partnerId: item.partnerId,
            roleId: item.roleId
          }));

          // If adding new
          firstResponse = await postApiCall(
            'admin/partner-user/add',
            { ...beforePayload, rolePermission: cleanedData },
            true
          );

          if (firstResponse?.meta?.status) {
            setNewResponseId(firstResponse?.data)
            response = await postApiCall(
              'admin/submit/form/add',
              { ...payload, partnerResponseUserId: firstResponse?.data },
              true
            );
          } else {
            toast.error(firstResponse?.meta?.msg || 'Submission failed');
            return;
          }
        }
      }

      // === Generic case for all other forms ===
      else {
        const formEntryId = idFromURL || responseId;

        if (formEntryId) {


          response = await postApiCall(
            `admin/submit/form/update/${formEntryId}`,
            // payload,
            { ...payload, ...payloadparam },
            true
          );
        } else {

          response = await postApiCall(
            'admin/submit/form/add',
            payload,
            true
          );
        }
      }

      console.log("sss111 submit response = ",response);
      

      // === Common response handling ===
      if (response?.meta?.status) {
        toast.success(response.meta.msg);
        setResponseId(response?.data?._id);
        // getFormDataByRowId(response?.data?._id)
        if (from == 'createUpdateForm') {
          if (status !== 'DRAFT') {
            history(-1);
          }
          else if (status == 'DRAFT') {
            if (type == "add") {
              window.location.href = `/create-update-from/${slugifyTransform(formName)}/${formId}/edit?id=${response?.data?._id}`
            }
            else if (type == "edit") {
              getFormDataByRowId(response?.data?._id)
            }
          }
        }
      } else {
        // Check if this is an NPA duplicate error
        if(formName == "npa-vendor-allocation" && response?.requiresConfirmation){
          // setDuplicateNpa(response?.requiresConfirmation);
          setNpaDuplicateMessage(response?.meta?.msg || "Duplicate NPA found");
          setCurrentPayloadForNpa({ payload, status }); // Store payload and status for retry
          setShowNpaDuplicateModal(true);
        } else {
          setModalErrorMsg(response || "Submission failed");
          setOpenErrorModal(true);
        }
        // toast.error(response?.meta?.msg || 'Submission failed');
        // alert(response?.meta?.msg || 'Submission failed');

      }

    } catch (err) {
      console.error('Validation or submission error:', err);
      toast.error('An unexpected error occurred during submission.');
    }

  };  

  // Handle NPA duplicate - Proceed with override
  const handleNpaDuplicateProceed = async () => {
    try {
      setIsProcessingNpaOverride(true);
      
      if (!currentPayloadForNpa) return;

      const { payload, status } = currentPayloadForNpa;
      
      // Add override flag to formFields
      // const updatedPayload = {
      //   ...payload,
      //   overrideNpaCheck: true
      //   // formFields: {
      //   //   ...payload.formFields,
      //   //   overrideNpaCheck: true
      //   // }
      // };
      const updatedPayload = {
        ...payload,
        overrideNpaCheck: true,
        formFields: {
          ...payload.formFields,
        }
      };

      // Make API call with override
      const response = await postApiCall(
        'admin/submit/form/add',
        updatedPayload,
        true
      );

      if (response?.meta?.status) {
        toast.success(response.meta.msg);
        setShowNpaDuplicateModal(false);
        setCurrentPayloadForNpa(null);
        // setDuplicateNpa(false);
        setResponseId(response?.data?._id);
        
        // Navigate back
        if (from == 'createUpdateForm') {
          if (status !== 'DRAFT') {
            history(-1);
          }
          else if (status == 'DRAFT') {
            if (type == "add") {
              window.location.href = `/create-update-from/${slugifyTransform(formName)}/${formId}/edit?id=${response?.data?._id}`
            }
            else if (type == "edit") {
              getFormDataByRowId(response?.data?._id)
            }
          }
        }
      } else {
        toast.error(response?.meta?.msg || 'Failed to process with override');
      }
    } catch (err) {
      console.error('NPA override error:', err);
      toast.error('An error occurred while processing the override');
    } finally {
      setIsProcessingNpaOverride(false);
    }
  };

  // Handle NPA duplicate - Cancel
  const handleNpaDuplicateCancel = () => {
    setShowNpaDuplicateModal(false);
    setCurrentPayloadForNpa(null);
    // setDuplicateNpa(false);
    // Go back to previous step (list)
    history(-1);
  };

const handleButton = (name) =>{
// setOpenModal(true)
setOpenApproveModal(true)
setSelectedButton(name)
}
const addDownloadButtonsToAllFileComponents = (formio) => {
  formio.everyComponent((comp) => {
    if (comp.type === "file") {
      addButtonsToFileComponent(comp);
    }
  });
};
const addButtonsToFileComponent = (comp) => {
  const files = comp.dataValue;
  if (!Array.isArray(files) || files.length === 0) return;

  const wrapper = comp.element?.closest(".formio-component-file");
  if (!wrapper) return;

  let rows = wrapper.querySelectorAll(".fileRow");

  if (!rows.length) {
    rows = wrapper.querySelectorAll("span > img");
  }
  
  // PDF/file link fallback
  if (!rows.length) {
    rows = wrapper.querySelectorAll('a[ref="fileLink"]');
  }

  // Add ZIP button
  addZipDownloadButton(wrapper, files);

  // Add buttons + preview
  files.forEach((file, index) => {
    if (!file?.url) return;

    const row = rows[index];
    if (!row) return;

    const previewElement = row.tagName === "IMG" ? row : row.querySelector("img");

    if (previewElement) {
      previewElement.style.cursor = "pointer";

      // ⬇️ Add Preview Click Handler
      previewElement.onclick = () => {
        previewFile(file.url, file.type);
      };
    }

    // Add download btn
    // if (!row.parentElement.querySelector(".individual-download-btn")) {
    //   row.parentElement.style.display = "flex";
    //   row.parentElement.style.height= "40px";
    //   row.style.height= "40px";
    //   const btn = document.createElement("a");
    //   btn.className = "individual-download-btn btn btn-sm btn-primary";
    //   btn.style.height = "30px";
    //   btn.innerHTML = `<i class="bi bi-download"></i>`;
    //   btn.href = file.url;
    //   btn.target = "_blank";
    //   btn.download = file.name || "file";
    //   row.parentElement.appendChild(btn);
    // }
    if (!row.parentElement.querySelector(".individual-download-btn")) {

  row.parentElement.style.display = "flex";
  row.parentElement.style.height = "40px";
  row.style.height = "40px";

  const btn = document.createElement("button");

  btn.className =
    "individual-download-btn btn btn-sm btn-primary";

  btn.style.height = "30px";

  btn.innerHTML = `<i class="bi bi-download"></i>`;

  btn.onclick = async () => {
    try {

      const response = await fetch(file.url);

      const blob = await response.blob();

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = downloadUrl;

      a.download = file.name || "file";

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  row.parentElement.appendChild(btn);
}
  });
};

const previewFile = (url, type) => {
  if (!url) return;

  // Image preview → open in a modal
  if (type?.startsWith("image/")) {
    showImageModal(url);
    return;
  }

  // Documents → open in new tab (PDF, DOC, XLS)
  window.open(url, "_blank");
};


const downloadFileByUrl = async (url, fileName = 'file') => {
  try {
    console.log('Downloading file:', url, fileName);

    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('Download failed:', err);
    alert('Failed to download file.');
  }
};


const addZipDownloadButton = (wrapper, files) => {
  if (wrapper.querySelector(".zip-download-btn")) return;

  const zipBtn = document.createElement("button");
  zipBtn.type = "button";
  zipBtn.className = "zip-download-btn btn btn-sm btn-warning";
  zipBtn.style.marginLeft = "10px";
  zipBtn.innerHTML = `<i class="bi bi-file-zip"></i> ZIP`;

  zipBtn.onclick = () => downloadZip(files);

  const label = wrapper.querySelector("label");
  if (label) {
    label.appendChild(zipBtn);   // Add on label (top-right)
  }
};

const downloadZip = async (files) => {
  // const JSZip = window.JSZip;
  const zip = new JSZip();

  for (const file of files) {
    if (!file.url) continue;

    const response = await fetch(file.url);
    const blob = await response.blob();

    zip.file(file.name || "file", blob);
  }

  const content = await zip.generateAsync({ type: "blob" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = "files.zip";
  a.click();
};
const disableFields = (formio, fieldsToDisable = []) => {
  if (!formio) return;

  const hasFieldsToDisable = Array.isArray(fieldsToDisable) && fieldsToDisable.length > 0;

  formio.everyComponent((comp) => {
    // If nothing to disable → enable all
    if (!hasFieldsToDisable) {
      comp.disabled = false;
      if (comp.refs?.input) {
        comp.refs.input.forEach(el => {
          el.removeAttribute("disabled");
          el.style.pointerEvents = "auto";
        });
      }
      return;
    }

    // Skip if not in carried-forward list
    if (!fieldsToDisable.includes(comp.key)) return;

    // 🔍 Check value: allow edit if empty
    const val = comp.dataValue;
    const isEmpty =
      val === null ||
      val === undefined ||
      val === "" ||
      (Array.isArray(val) && val.length === 0);

    // ✅ If empty → keep editable
    if (isEmpty) {
      comp.disabled = false;
      return;
    }

    /* ===============================
       DATAGRID / EDITGRID
    =============================== */
    if (comp.type === "datagrid" || comp.type === "editgrid") {
      comp.disabled = false;

      const existingRowCount = comp.dataValue?.length || 0;
      const rows = comp.refs?.row || [];

      rows.forEach((rowEl, rowIndex) => {
        if (rowIndex < existingRowCount) {
          const inputs = rowEl.querySelectorAll("input, select, textarea, button");
          inputs.forEach((el) => {
            if (el.classList.contains("btn-add-row")) return;
            el.setAttribute("disabled", true);
            el.style.pointerEvents = "none";
          });
        }
      });

      // Enable Add Row button
      if (comp.refs?.addRow) {
        comp.refs.addRow.removeAttribute("disabled");
        comp.refs.addRow.style.pointerEvents = "auto";
      }

      // Hide delete buttons for existing rows
      if (comp.refs?.removeRow) {
        comp.refs.removeRow.forEach((btn, index) => {
          if (index < existingRowCount) btn.style.display = "none";
        });
      }

      return;
    }

    /* ===============================
       OTHER FIELDS
    =============================== */
    comp.disabled = true;
    if (comp.refs?.input) {
      comp.refs.input.forEach(el => {
        el.setAttribute("disabled", true);
        el.style.pointerEvents = "none";
      });
    }
  });
};


  const handlebuilderScoreClick = () => {
    setIsShowBuilderScoreForm(true);
  }

  const totalBuilderScore =
  Number(experienceOfBuilder?.value || 0) +
  Number(projectsCompletedByBuilder?.value || 0)+
  Number(volumeOfPastDevelopmentInSqFt?.value || 0)+
  Number(typeOfFirm?.value || 0)+
  Number(planningAndExecution?.value || 0)+
  Number(customerSegment?.value || 0)+
  Number(proposedProjectApprovedByOtherBanksFI?.value || 0)+
  Number(stageOfConstructionForTheProposedProject?.value || 0)+
  Number(detailsOfProposedProject?.value || 0)+
  Number(qualityOfProjectAndConstruction?.value || 0)+
  Number(legalTrackRecord?.value || 0)

  ;

  const handleCancelClick = () => {
    setExperienceOfBuilder(null);
    setProjectsCompletedByBuilder(null);
    setVolumeOfPastDevelopmentInSqFt(null);
    setTypeOfFirm(null);
    setPlanningAndExecution(null);
    setCustomerSegment(null);
    setProposedProjectApprovedByOtherBanksFI(null);
    setStageOfConstructionForTheProposedProject(null);
    setDetailsOfProposedProject(null);
    setQualityOfProjectAndConstruction(null);
    setLegalTrackRecord(null);
    setIsShowBuilderScoreForm(false);
  }

  const isdisableOkbutton = !experienceOfBuilder || !projectsCompletedByBuilder || !volumeOfPastDevelopmentInSqFt || !typeOfFirm || !planningAndExecution || !customerSegment || !proposedProjectApprovedByOtherBanksFI || !stageOfConstructionForTheProposedProject || !detailsOfProposedProject || !qualityOfProjectAndConstruction || !legalTrackRecord;

  const getBuilderGrade = (score) => {
    if (score >= 50) return "CAT A";
    if (score >= 40) return "CAT B";
    if (score >= 30) return "CAT C";
    if (score > 0) return "CAT D";
    return "Non-Graded";
  };
  const handleApproveModalClose = () => {
    setOpenApproveModal(false);
  }

  const filteredApproveRejectSendBackSchema = useMemo(() => {
  const filterdata = formSchema.components.filter(
    (item) =>
      item.legend?.toLowerCase()?.trim() !== "approve" &&
      item.legend?.toLowerCase()?.trim() !== "reject" &&
      item.legend?.toLowerCase()?.trim() !== "send back"
  );

  return { ...formSchema, components: filterdata };
}, [formSchema]);

const filterApproveformSchema = useMemo(() => {
  const filterdata = formSchema.components.filter(
    (item) =>
      item.legend?.toLowerCase()?.trim() === "approve" 
  );

  return { ...formSchema, components: filterdata };
}, [formSchema]);

const filterRejectformSchema = useMemo(() => {
  const filterdata = formSchema.components.filter(
    (item) =>
      item.legend?.toLowerCase()?.trim() === "reject"
  );

  return { ...formSchema, components: filterdata };
}, [formSchema]);

const filterSendbackformSchema = useMemo(() => {
  const filterdata = formSchema.components.filter(
    (item) =>
      item.legend?.toLowerCase()?.trim() === "send back"
  );

  return { ...formSchema, components: filterdata };
}, [formSchema]);

const dymamicFormSchema = useMemo(() => {
  console.log("zzz111 selected button = ",selectedButton);
  
  switch (selectedButton) {
    case 'APPROVED':
      return filterApproveformSchema;

    case 'REJECTED':
      return filterRejectformSchema;

    case 'SEND_BACK':
      return filterSendbackformSchema;

    default:
      return null;
  }
}, [
  selectedButton,
  filterApproveformSchema,
  filterRejectformSchema,
  filterSendbackformSchema
]);

const getActionButton = useMemo(() => {
  return (
    <Button
      variant="contained"
      // onClick={() => handleSubmit(selectedButton)}
      onClick={() => handleApprovRejectModalSubmit()}

    >
      {
        selectedButton === 'APPROVED'
          ? 'Approve'
          : selectedButton === 'REJECTED'
          ? 'Reject'
          : selectedButton === 'SEND_BACK'
          ? 'Send Back'
          : 'Save'
      }
    </Button>
  );
}, [selectedButton]);
const getAllLabels = (components = []) => {
  let labels = [];

  const traverse = (items) => {
    items.forEach(item => {
      // push label if exists and not hidden
      if (item.label && !item.hideLabel) {
        labels.push(item.label);
      }

      // handle datagrid / nested components
      if (item.components) {
        traverse(item.components);
      }

      // handle table structure (rows → columns → components)
      if (item.rows) {
        item.rows.forEach(row => {
          row.forEach(col => {
            if (col.components) {
              traverse(col.components);
            }
          });
        });
      }
    });
  };

  traverse(components);

  return labels;
};

// const mapFormDataWithValues = (approveFormData = [], submissionData = {}) => {
//   console.log("ccc111 approveFormData111 = ",approveFormData);
//   console.log("ccc111 submissionData111 = ",submissionData);
  
//   const hasKey = (obj = {}, key = "") => {
//     return Object.prototype.hasOwnProperty.call(obj, key);
//   };
//   console.log("ccc111 = ", hasKey(submissionData, "textField1"))
//    const mappedData = approveFormData?.map((item) => {
//     return item?.map((field) => {
//       if (hasKey(submissionData, field.key)) {
//         // return { ...field, value: submissionData[field.key] };
//         return { [field.key]: submissionData[field.key] };
//       }
//    });
//   });
//   console.log("ccc111 mappedData = ",mappedData);
//  const result = mappedData?.reduce((acc, curr) => {
//   return { ...acc, ...curr };
// }, {});

// const result1 = Object.values(result)?.reduce((acc, curr) => {
//   return { ...acc, ...curr };
// }, {});

// console.log("ccc111 result1 = ",result1);

// console.log("ccc111 result = ",result);
//   return result1;
// };


const mapFormDataWithValues = (
  approveFormData = [],
  submissionData = {}
) => {

  return approveFormData.reduce((acc, field) => {

    if (
      Object.prototype.hasOwnProperty.call(
        submissionData,
        field.key
      )
    ) {
      acc[field.key] = submissionData[field.key];
    }

    return acc;

  }, {});
};

const getAllFields = (components = []) => {
  let fields = [];

  components.forEach((comp) => {

    // Normal/root field
    if (comp?.key) {
      fields.push({
        key: comp.key,
        type: comp.type
      });
    }

    // Columns support
    if (comp?.columns) {
      comp.columns.forEach((col) => {
        fields = [
          ...fields,
          ...getAllFields(col.components || [])
        ];
      });
    }

    // Nested components support
    if (comp?.components) {
      fields = [
        ...fields,
        ...getAllFields(comp.components)
      ];
    }
  });

  return fields;
};
const handleApprovRejectModalSubmit = () => {
//   const formData = formRef.current?.formio;
//   // const approveFormData = formRef?.current?.formio._form.components.map((comp) => (comp.components.map((c) => ({ key: c.key, value: c.value })))) || [];
//   const approveFormData = formRef?.current?.formio?._form?.components?.map((comp) => (comp?.components?.map((c) => ({key: c.key, value: c.value})))) || [];

//   // console.log("debug1111 Form Data:", formData);
//   console.log("debug1111 Approve Form Data:", approveFormData);
//   console.log("debug1111 = ",formRef?.current?.formio.submission.data);
//  const submittonData = formRef?.current?.formio.submission.data || {};
//   const updatedApproveformdata = mapFormDataWithValues(approveFormData, submittonData);


const formData = approveRejectRef.current?.formio;

console.log("formData =", formData);

const submissionData =
  approveRejectRef?.current?.formio?.submission?.data || {};


// Recursive extractor


const approveFormData =
  getAllFields(approveRejectRef?.current?.formio?._form?.components || []);

console.log("Approve Form Data =", approveFormData);

const updatedApproveformdata =
  mapFormDataWithValues(approveFormData, submissionData);
  

   console.log("ccc1111 updatedApproveformdata = ",updatedApproveformdata);
   const payloadParam = (selectedButton === 'APPROVED'
          ? {approveFormFields: updatedApproveformdata}
          : selectedButton === 'REJECTED'
          ? {rejectFormFields: updatedApproveformdata}
          : selectedButton === 'SEND_BACK'
          ? {revokeFormFields: updatedApproveformdata}
          : {saveFormFields: updatedApproveformdata})

          console.log("ccc1111 payloadParam = ",payloadParam);
          

  handleSubmit(selectedButton, payloadParam);
  if(selectedButton==="SEND_BACK" && workflowId && (idFromURL || responseId) && dymamicFormSchema?.components?.length>0){
  handleSendBackStage()
  }
}

const handleSendBackStage = () => {
  if(selectedButton === 'SEND_BACK'){
    const sendBackData = {
      workflowId,
      formId,
      formResponseId: idFromURL || responseId,
      currentStageId: 4,
      nextStageId: 3,
    }
    postApiCall(
      'admin/submit/form/move-to-next-stage/',
      sendBackData,
      true
    ).then((response) => {
      if (response.meta.status) {
      } else {
        toast.error(response?.meta?.msg || 'Submission failed');
      }
    }).catch((err) => {
      console.error("Error during send back:", err);
      toast.error('An unexpected error occurred during send back.');
    });
  }
}

  console.log('debug111:fsffsffsf:::',formData)
  console.log('debug111 formSchema = ',formSchema)
  console.log('debug111 responseData = ',responseData);
  console.log("debug1111 filteredApproveRejectSendBackSchema = ",filteredApproveRejectSendBackSchema);
  console.log("hhh111 - ",formResponse?.formData?.enableRejectAction);
  console.log("rendering");
  

  return (
    <>
      {isShowBuilderScoreForm ? (
        <div className='container-fluid'>
          {!workflowName}
          <div className="main-title"><h3> {toTitleCase(displayName || formName)}</h3>
            <div className="card shadow mb-4">
              <div className="card-body">
                <h4>Builder Score</h4>
                <div className='mb-3'>
                  <ReusableSelect
                    style={{ width: "100%" }}
                    className="mui-input-40"
                    options={NoOfYearsOfExperienceOfBuilder || []}
                    placeholder={'No. of years of experience of Builder*'}
                    isMulti={false}
                    width={'100%'}
                    value={experienceOfBuilder}
                    onChange={(selectedValue) => {
                      console.log('Selected Value:', selectedValue);
                      setExperienceOfBuilder(selectedValue);
                    }}
                  />
                </div>

                <div className='mb-3'>
                  <ReusableSelect
                    style={{ width: "100%" }}
                    className="mui-input-40"
                    options={NoOfProjectsCompletedByBuilder || []}
                    placeholder={'No. of Projects completed (given possession)*'}
                    isMulti={false}
                    width={'100%'}
                    value={projectsCompletedByBuilder}
                    onChange={(selectedValue) => {
                      console.log('Selected Value:', selectedValue);
                      setProjectsCompletedByBuilder(selectedValue);
                    }}
                  />
                </div>

                <div className='mb-3'>
                  <ReusableSelect
                    style={{ width: "100%" }}
                    className="mui-input-40"
                    options={VolumeOfPastDevelopmentInSqFt || []}
                    placeholder={'Volume of past development in sq.ft*'}
                    isMulti={false}
                    width={'100%'}
                    value={volumeOfPastDevelopmentInSqFt}
                    onChange={(selectedValue) => {
                      console.log('Selected Value:', selectedValue);
                      setVolumeOfPastDevelopmentInSqFt(selectedValue);
                    }}
                  />
                </div>

                <div className='mb-3'>
                  <ReusableSelect
                    style={{ width: "100%" }}
                    className="mui-input-40"
                    options={TypeOfFirm || []}
                    placeholder={'Type of Firm*'}
                    isMulti={false}
                    width={'100%'}
                    value={typeOfFirm}
                    onChange={(selectedValue) => {
                      console.log('Selected Value:', selectedValue);
                      setTypeOfFirm(selectedValue);
                    }}
                  />
                </div>

                <div className='mb-3'>
                  <ReusableSelect
                    style={{ width: "100%" }}
                    className="mui-input-40"
                    options={PlanningAndExecution || []}
                    placeholder={'Planning & Execution (Architect & Engineers)*'}
                    isMulti={false}
                    width={'100%'}
                    value={planningAndExecution}
                    onChange={(selectedValue) => {
                      console.log('Selected Value:', selectedValue);
                      setPlanningAndExecution(selectedValue);
                    }}
                  />
                </div>

                <div className='mb-3'>
                  <ReusableSelect
                    style={{ width: "100%" }}
                    className="mui-input-40"
                    options={CustomerSegment || []}
                    placeholder={'Customer Segment*'}
                    isMulti={false}
                    width={'100%'}
                    value={customerSegment}
                    onChange={(selectedValue) => {
                      console.log('Selected Value:', selectedValue);
                      setCustomerSegment(selectedValue);
                    }}
                  />
                </div>

                <div className='mb-3'>
                  <ReusableSelect
                    style={{ width: "100%" }}
                    className="mui-input-40"
                    options={ProposedProjectApprovedByOtherBanksFI || []}
                    placeholder={'Proposed Project Approved by other Banks/FI/NBFC*'}
                    isMulti={false}
                    width={'100%'}
                    value={proposedProjectApprovedByOtherBanksFI}
                    onChange={(selectedValue) => {
                      console.log('Selected Value:', selectedValue);
                      setProposedProjectApprovedByOtherBanksFI(selectedValue);
                    }}
                  />
                </div>

                <div className='mb-3'>
                  <ReusableSelect
                    style={{ width: "100%" }}
                    className="mui-input-40"
                    options={StageOfConstructionForTheProposedProject || []}
                    placeholder={'Stage of construction for the proposed project(as per technical report)*'}
                    isMulti={false}
                    width={'100%'}
                    value={stageOfConstructionForTheProposedProject}
                    onChange={(selectedValue) => {
                      console.log('Selected Value:', selectedValue);
                      setStageOfConstructionForTheProposedProject(selectedValue);
                    }}
                  />
                </div>

                <div className='mb-3'>
                  <ReusableSelect
                    style={{ width: "100%" }}
                    className="mui-input-40"
                    options={DetailsOfProposedProject || []}
                    placeholder={'Details of Proposed project : a) Location b) Marketability c) Infrastructure availability ( to be ascertained by project visit & technical report)*'}
                    isMulti={false}
                    width={'100%'}
                    value={detailsOfProposedProject}
                    onChange={(selectedValue) => {
                      console.log('Selected Value:', selectedValue);
                      setDetailsOfProposedProject(selectedValue);
                    }}
                  />
                </div>

                <div className='mb-3'>
                  <ReusableSelect
                    style={{ width: "100%" }}
                    className="mui-input-40"
                    options={QualityOfProjectAndConstruction || []}
                    placeholder={'Quality of Project & construction (to be ascertained by market information & technical report)*'}
                    isMulti={false}
                    width={'100%'}
                    value={qualityOfProjectAndConstruction}
                    onChange={(selectedValue) => {
                      console.log('Selected Value:', selectedValue);
                      setQualityOfProjectAndConstruction(selectedValue);
                    }}
                  />
                </div>

                <div className='mb-3'>
                  <ReusableSelect
                    style={{ width: "100%" }}
                    className="mui-input-40"
                    options={LegalTrackRecord || []}
                    placeholder={'Legal Track record (Compliance to FSI, transfer of clean titles to investors, receipt of completion & occupancy certificates from competetant authority)*'}
                    isMulti={false}
                    width={'100%'}
                    value={legalTrackRecord}
                    onChange={(selectedValue) => {
                      console.log('Selected Value:', selectedValue);
                      setLegalTrackRecord(selectedValue);
                    }}
                  />
                </div>


                <h5 className="text-end mt-5">Total Score: {totalBuilderScore}</h5>
                <div className="text-end mt-5">
                  <Button sx={{ width: "90px" }} variant="outlined" color="error" onClick={handleCancelClick}>
                    cancel
                  </Button>
                  <Button sx={{ width: "90px" }} variant="contained" color="error"
                    onClick={() => setIsShowBuilderScoreForm(false)}
                    className='ml-3'
                    disabled={isdisableOkbutton}
                  >
                    OK
                  </Button>

                </div>
              </div>
            </div>

          </div>
        </div>
      )
        :
        (
          <div className={!workflowName ? 'container-fluid' : ''}>
            {!workflowName&&
            <div className="main-title"><h3> {toTitleCase(displayName || formName)}</h3></div>
}
            {/* <ReusableAccordion title="Project Details">
        <div style={{ marginTop: '0.75rem' }}>
          <div className="">
             {formSchema && (
            <div className="col-md-12">
              <FormRendererComponent formSchema={formSchema} />
            </div>
          )}
          </div>
        </div>
      </ReusableAccordion> */}
            {
              (formName == "legal-agency-report" || formName == "legal-agency-assignment-form" ||
                formName == "agency-report-upload" || formName == "fcu" || formName == "roc"
              ) &&
              <ReusableAccordion title="Project Details">
                <div style={{ marginTop: '0.75rem' }}>
                  <div className="">
                    {projectFormSchema && responseData &&
                      <Form
                        form={projectFormSchema}
                        // ref={formRef}
                        submission={{ data: { ...projectFormData, accessToken, apiBasePath: Constant.apiBasePath, formName: toTitleCase(formName) } }}
                        onFormLoad={(instance) => {
                          setFormioInstance(instance);
                        }}
                        // onChange={() => {
                        //   if (formRef.current?.formio) {
                        //     addDownloadButtonsToAllFileComponents(formRef.current.formio);
                        //   }
                        //   if (responseData?.fieldsCarriedForward?.length > 0) {
                        //     disableFields(formRef.current?.formio, responseData.fieldsCarriedForward)
                        //   }
                        // }}
                        options={{
                          readOnly: true
                        }}
                      />

                    }
                  </div>
                </div>
              </ReusableAccordion>
            }




            <div className="card shadow mb-4">
              <div className="card-body">
                {(formName !== "create-roles" && formName !== "partner-user" && formName !== "hierarchy") && (type === "edit" || type === "add") &&
                  <HierarchySelect responseData={responseData} setHierarchyPermission={setHierarchyPermission} />
                }
                {
                  formName == "builder-group" &&
                  <>

                    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>

                      <Box sx={{ width: 300 }}>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 500,
                            mb: "6px",
                            color: "#333",
                          }}
                        >
                          Grade
                        </Typography>

                        {/* Input */}
                        <TextField
                          fullWidth
                          disabled
                          variant="outlined"
                          value={totalBuilderScore === 0 ? "" : getBuilderGrade(totalBuilderScore)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "40px",
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "8px 14px",
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography
                                  onClick={handlebuilderScoreClick}
                                  sx={{
                                    color: "#F36C28",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    pointerEvents: "auto", // required since input is disabled
                                  }}
                                >
                                  click here*
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>

                      <Box sx={{ width: 300 }}>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 500,
                            mb: "6px",
                            color: "#333",
                          }}
                        >
                          Score
                        </Typography>

                        <TextField
                          fullWidth
                          disabled
                          variant="outlined"
                          value={totalBuilderScore === 0 ? "" : totalBuilderScore}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "40px",
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "8px 14px",
                            },
                          }}
                        />
                      </Box>
                    </div>

                  </>
                }
                {/* {formSchema && responseData &&
                  <Form
                    onCustomEvent={(event) => {
                      console.log('Custom Event:', event);
                      if (event.type === 'download') {
                        downloadFileByUrl(event.url, event.name);
                      }
                    }}
                    // form={formSchema}
                    form={filteredApproveRejectSendBackSchema}
                    ref={formRef}
                    submission={{ data: { ...formData, accessToken, apiBasePath: Constant.apiBasePath, formName: toTitleCase(formName), userDepartment:userDetail?.department } }}
                    onFormLoad={(instance) => {
                      setFormioInstance(instance);
                    }}
                    onChange={() => {
                      if (formRef.current?.formio) {
                        addDownloadButtonsToAllFileComponents(formRef.current.formio);
                      }
                      if (responseData?.fieldsCarriedForward?.length > 0) {
                        disableFields(formRef.current?.formio, responseData.fieldsCarriedForward)
                      }
                    }}
                    
                    options={{
                      readOnly: !(type === "edit" || type === "add")
                    }}
                  />
                  } */}
                   {formSchema && responseData &&
                  <Form
                    onCustomEvent={(event) => {
                      console.log('Custom Event:', event);
                      if (event.type === 'download') {
                        downloadFileByUrl(event.url, event.name);
                      }
                    }}
                    // form={formSchema}
                    form={filteredApproveRejectSendBackSchema}
                    ref={formRef}
                    submission={{ data: { ...formData, accessToken, apiBasePath: Constant.apiBasePath, formName: toTitleCase(formName), userDepartment:userDetail?.department } }}
                    onFormLoad={(instance) => {
                      setFormioInstance(instance);
                    }}
                    onChange={(event) => {
                      console.log("aaa111 test = ",event?.data?.projection ,event?.component?.value);
                      console.log("aaa111 fields = ",fields);
                      
                      // if (event?.data?.projection?.length > 0 && formName == 'api-builder') {
                      //   setFields(event.data.projection);
                      // }
                      
                      if (formRef.current?.formio) {
                        addDownloadButtonsToAllFileComponents(formRef.current.formio);
                      }
                      if (responseData?.fieldsCarriedForward?.length > 0) {
                        disableFields(formRef.current?.formio, responseData.fieldsCarriedForward)
                      }
                    }}
                    
                    options={{
                      readOnly: !(type === "edit" || type === "add")
                    }}
                  />
                  }

                {/* Query Builder for api-builder form */}
                {formName === "api-builder" && (
                  <div className="card shadow-sm border-0 mt-4">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 fw-bold">Query Builder</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12 mb-3">
                          <QueryBuilder
                            fields={fields}
                            query={rules}
                            onQueryChange={handleQueryChange}
                          />
                          {/* <h5 className="mt-3 fw-semibold">MongoDB Query:</h5>
                          <pre className="bg-light p-2 rounded border">
                            {JSON.stringify(formatQuery(rules, "mongodb"), null, 2)}
                          </pre> */}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* {formId == "68fb20c0a68bebe5b6ee1c3a" && (<DataEntryOneAPF formData={formData} setFormData={setFormData} idFromURL={idFromURL} workFlowId={responseData?.workflowId || ""} />)} */}
                {formId=="68fb20c0a68bebe5b6ee1c3a"?(<DataEntryOneAPF formData={formData} setFormData={setFormData} idFromURL={idFromURL} workFlowId={responseData?.workflowId || ""} getFormDataEntryByRowId={getFormDataByRowId} dataEntryFormData={responseData} dataEntryFormId={formId} type={type}/>) :formId=="69ccb63d6229ecfe1284b6ca"?(<Recommendation formData={formData} setFormData={setFormData} idFromURL={idFromURL} recommendationFormData={responseData} workFlowId={responseData?.workflowId || ""} getFormDataEntryByRowId={getFormDataByRowId} dataEntryFormData={responseData} formId={formId} type={type}/>) 
                :(<>
                {type == 'view' ? null :
                  <div className="d-flex flex-wrap gap-5 justify-content-center">
                    {type == "edit" || type == "add" ? (<>
                      {permission?.moduleList?.createDisabled ? null : (<>
                        <button className="btn btn-secondary mx-2 my-2" onClick={() => handleSubmit('DRAFT')}>
                          <i className="fa fa-save me-2"></i> Save as Draft
                        </button>
                        <button className="btn btn-success mx-2 my-2" onClick={() => handleSubmit('SUBMITTED')}>
                          <i className="fa fa-save me-2"></i> Submit
                        </button>
                      </>)}
                    </>) : responseData.status == "SUBMITTED" && (<>
                      {permission?.moduleList?.rejectDisabled ? null : 
                        formResponse?.formData?.enableRejectAction === true && (
                          <button className="btn btn-danger mx-2 my-2" onClick={() => handleButton('REJECTED')}>
                            <i className="fa fa-close me-2"></i> Reject
                          </button>
                        )
                      }
                      {permission?.moduleList?.approveDisabled ? null :
                        <button className="btn btn-success mx-2 my-2" onClick={() => handleButton('APPROVED')}>
                          <i className="fa fa-check me-2"></i> Approve
                        </button>
                      }

                      {permission?.moduleList?.approveDisabled ? null :
                        <button className="btn btn-warning mx-2 my-2" style={{backgroundColor:'#fe9a02', borderColor:'#fe9a02'}} onClick={() => handleButton('SEND_BACK')}>
                           <i class="bi bi-arrow-counterclockwise me-2"></i> Send Back
                        </button>
                      }

                    </>)}
                  </div>
                }
                </>)}

                 {formSchema && responseData && responseData?.approveFormFields &&
                 <>
                  <Form
                    onCustomEvent={(event) => {
                      console.log('Custom Event:', event);
                      if (event.type === 'download') {
                        downloadFileByUrl(event.url, event.name);
                      }
                    }}
                    // form={formSchema}
                    form={filterApproveformSchema}
                    ref={approveRejectRef}
                    submission={{ data: { ...formData, accessToken, apiBasePath: Constant.apiBasePath, formName: toTitleCase(formName) } }}
                    onFormLoad={(instance) => {
                      setFormioInstance(instance);
                    }}
                    // onChange={() => {
                    //   if (formRef.current?.formio) {
                    //     addDownloadButtonsToAllFileComponents(formRef.current.formio);
                    //   }
                    //   if (responseData?.fieldsCarriedForward?.length > 0) {
                    //     disableFields(formRef.current?.formio, responseData.fieldsCarriedForward)
                    //   }
                    // }}
                    options={{
                      readOnly: true
                    }}
                  />
                 </>
                 
                }
                 {formSchema && responseData && responseData?.rejectFormFields &&
                 <>
                  <Form
                    onCustomEvent={(event) => {
                      console.log('Custom Event:', event);
                      if (event.type === 'download') {
                        downloadFileByUrl(event.url, event.name);
                      }
                    }}
                    // form={formSchema}
                    form={filterRejectformSchema}
                    ref={approveRejectRef}
                    submission={{ data: { ...formData, accessToken, apiBasePath: Constant.apiBasePath, formName: toTitleCase(formName) } }}
                    onFormLoad={(instance) => {
                      setFormioInstance(instance);
                    }}
                    // onChange={() => {
                    //   if (formRef.current?.formio) {
                    //     addDownloadButtonsToAllFileComponents(formRef.current.formio);
                    //   }
                    //   if (responseData?.fieldsCarriedForward?.length > 0) {
                    //     disableFields(formRef.current?.formio, responseData.fieldsCarriedForward)
                    //   }
                    // }}
                    options={{
                      readOnly: true
                    }}
                  />
                 </>
                 
                }
                 {formSchema && responseData && responseData?.sendbackFormFields &&
                 <>
                  <Form
                    onCustomEvent={(event) => {
                      console.log('Custom Event:', event);
                      if (event.type === 'download') {
                        downloadFileByUrl(event.url, event.name);
                      }
                    }}
                    // form={formSchema}
                    form={filterSendbackformSchema}
                    ref={approveRejectRef}
                    submission={{ data: { ...formData, accessToken, apiBasePath: Constant.apiBasePath, formName: toTitleCase(formName), formId: formId, workflowId:workflowId } }}
                    onFormLoad={(instance) => {
                      setFormioInstance(instance);
                    }}
                    // onChange={() => {
                    //   if (formRef.current?.formio) {
                    //     addDownloadButtonsToAllFileComponents(formRef.current.formio);
                    //   }
                    //   if (responseData?.fieldsCarriedForward?.length > 0) {
                    //     disableFields(formRef.current?.formio, responseData.fieldsCarriedForward)
                    //   }
                    // }}
                    options={{
                      readOnly: true
                    }}
                  />
                 </>
                 
                }
              </div>
            </div>
          </div>
        )
      }

      {/* {openModal && (
  <ConfirmationModal 
    show={openModal} 
    onClose={() => {setSelectedOption([]); setSelectionType('positive');setOpenModal(false)}} 
    comment={userComment} 
    setComment={setUserComment}
    onConfirm={() => handleSubmit(selectedButton)}
    formId={formId}
    selectedButton={selectedButton}
    selectedOption={selectedOption}
    setSelectedOption={setSelectedOption}
    setSelectionType={setSelectionType}
    selectionType={selectionType}
  />
)} */}
      {
        openApproveModal && (
          <ReusableModal
            open={openApproveModal}
            handleClose={() => setOpenApproveModal(false)}
            title="Confirm Action"
            actions={
              <>
                <Button onClick={() => setOpenApproveModal(false)}>Cancel</Button>
                {/* <Button variant="contained" onClick={() => handleApprovRejectModalSubmit('SUBMITTED')}>
                  Save
                </Button> */}
                {getActionButton}
              </>
            }
          >
            {/* Parent Content */}
            {console.log("dynamic:::::::",dymamicFormSchema)}
            {/* {dymamicFormSchema?.components?.length>0&& selectedButton==="SEND_BACK"&&(<>
            <div className='row'>
              <div className='col-md-6'>
                <select className='form-control' value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                  <option value="formSendBack" disabled>Form Send Back</option>
                  <option value="stageSendBack">Stage Send Back</option>
                </select>
                </div>
                <div className='col-md-6'>
                </div>
            </div>
            </>)} */}
            {dymamicFormSchema?.components?.length>0?(<>
            <Form
                    onCustomEvent={(event) => {
                      console.log('Custom Event:', event);
                      if (event.type === 'download') {
                        downloadFileByUrl(event.url, event.name);
                      }
                    }}
                    form={dymamicFormSchema}
                    // form={selectedButton == 'APPROVED' ? filterApproveformSchema : filterRejectformSchema}
                    ref={approveRejectRef}
                    // ref={formRef}
                    submission={{ data: { ...formData, accessToken, apiBasePath: Constant.apiBasePath, formName: toTitleCase(formName), workFlowId: responseData?.workflowId, formId } }}
                    onFormLoad={(instance) => {
                      setFormioInstance(instance);
                    }}
                    // onChange={() => {
                    //   if (formRef.current?.formio) {
                    //     addDownloadButtonsToAllFileComponents(formRef.current.formio);
                    //   }
                    //   if (responseData?.fieldsCarriedForward?.length > 0) {
                    //     disableFields(formRef.current?.formio, responseData.fieldsCarriedForward)
                    //   }
                    // }}
                    options={{
                      // readOnly: !(type === "edit" || type === "add")
                    }}
                  />
          </>):(selectedButton==="APPROVED" || selectedButton==="REJECTED")?(<Typography>
            Are you sure you want to {selectedButton === 'APPROVED' ? 'Approve' : selectedButton === 'REJECTED' && 'Reject'} this entry? Once {selectedButton === 'APPROVED' ? 'Approved' : selectedButton === 'REJECTED' && 'Rejected'}, no further changes can be made.</Typography>)
          :(<Typography>
            Do you want to send this entry back for review and resubmission?</Typography>)
          }

          </ReusableModal>

        )
      }
      <Modal show={!!previewUrl} onHide={() => setPreviewUrl(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Preview</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
          <img src={previewUrl} style={{ maxWidth: "100%", maxHeight: "70vh" }} />
        </Modal.Body>

        <Modal.Footer>
          <CustomButton
            label={'Close'}
            appendClass='text-white'
            onClick={() => setPreviewUrl(null)}
          />
        </Modal.Footer>
      </Modal>


      {/* {openModal && (
        <ConfirmationModal
          show={openModal}
          onClose={() => { setSelectedOption([]); setSelectionType('positive'); setOpenModal(false) }}
          comment={userComment}
          setComment={setUserComment}
          onConfirm={() => handleSubmit(selectedButton)}
          formId={formId}
          selectedButton={selectedButton}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          setSelectionType={setSelectionType}
          selectionType={selectionType}
        />
      )} */}
      <Modal show={!!previewUrl} onHide={() => setPreviewUrl(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Preview</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
          <img src={previewUrl} style={{ maxWidth: "100%", maxHeight: "70vh" }} />
        </Modal.Body>

        <Modal.Footer>
          <CustomButton
            label={'Close'}
            appendClass='text-white'
            onClick={() => setPreviewUrl(null)}
          />
        </Modal.Footer>
      </Modal>


      <>
        <ErrorModal
          open={openErrorModal}
          onClose={() => setOpenErrorModal(false)}
          title={modalErrorMsg?.meta?.msg || "Error"}
          showCloseIcon={true}
          actions={
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenErrorModal(false)}
            >
              Close
            </Button>
          }

        >
          {
            Array.isArray(modalErrorMsg?.error) ? (
              modalErrorMsg?.error?.map((item, index) => (
                <Typography key={index} variant="body1">• {item?.msg || "An error occurred"}</Typography>
              ))
            ) : Array.isArray(modalErrorMsg?.error) ? (
              modalErrorMsg.error.map((item, index) => (
                <>
                  <Typography key={index} variant="body1" sx={{ color: "black" }}> {item?.msg || "An error occurred"}</Typography>
                </>
              ))
            ) : (
              <Typography variant="body1">{typeof modalErrorMsg === 'string' ? modalErrorMsg : "An error occurred"}</Typography>
            )
          }

        </ErrorModal>
      </>

      {/* NPA Duplicate Modal */}
      <>
        <Modal
          show={showNpaDuplicateModal}
          onHide={handleNpaDuplicateCancel}
          centered
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Dedupe Prospect No. Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Typography variant="body1" sx={{ p: 2, fontWeight: "500" }}>
              {npaDuplicateMessage}
            </Typography>
            {/* {duplicateNpa && (
              <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                <strong>Duplicate NPA:</strong> {JSON.stringify(duplicateNpa)}
              </Typography>
            )} */}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleNpaDuplicateCancel}
              disabled={isProcessingNpaOverride}
              sx={{marginRight:"10px"}}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNpaDuplicateProceed}
              disabled={isProcessingNpaOverride}
            >
              {isProcessingNpaOverride ? 'Processing...' : 'Proceed'}
            </Button>
          </Modal.Footer>
        </Modal>
      </>

      

    </>

  );
};

export default ModuleForms;
