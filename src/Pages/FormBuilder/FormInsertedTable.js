import React, { useEffect, useState, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import { useSearchParams } from 'react-router-dom';
import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import deleteApiCall from "../../Services/deleteApiCall";
import postApiCall from '../../Services/postApiCall';
import Constant from "../../Components/Constant";
import PaginationNew from "../../Widgets/PaginationNew";
import axios from 'axios';
import useGetRoleModule from '../../Services/useGetRoleModule';
import loginUser from '../../Services/loginUser';
import { slugifyTransform, deslugifyTransform } from '../../Utils/Helpers';
import CustomButton from '../../Utils/CustomButton';
import { Whisper, Tooltip } from 'rsuite';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import UserAssignmentModal from './userAssignmentModal';
import { DateRangePicker } from 'rsuite';
import "rsuite/dist/rsuite.css";
import "../../../src/css/formInsertedTable.css"
import ReusableSelect from '../../Pages/Reusable/ReusableSelect.jsx';
import moment from 'moment';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard.js';
import CommonActionIcons from '../../Utils/CommonActionIcons.js';
import BulkDataUpload from './BulkDataUpload.js';
import CommonTable from '../../Utils/CommonTable.js';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { userDetails } from '../../Services/authenticationService.js';
import AssigneedAvatar from '../../Utils/AssigneedAvatar.js';
import { useNavigate, useLocation } from 'react-router-dom';
import {Menu, MenuItem} from '@mui/material';
import {
    Modal,
    Box,
    Typography,
    Button
} from "@mui/material";
import { toast } from 'react-toastify';

var slugify = require('slugify');

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: "10px",
    boxShadow: 24,
    p: 3
};

const FormInsertdTable = () => {
    const navigate = useNavigate()
    const location = useLocation();
    const {displayName} = location.state || {};
    const userDetailsData = userDetails();
    const { formId, formName } = useParams();
    const [searchParams] = useSearchParams();
    const creator = searchParams.get("creator");
    const approver = searchParams.get("approver");
    let { accessToken } = loginUser();
    console.log('userDetailsData:::::',userDetailsData)
    const [lists, setLists] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState([])
    const [search, setSearch] = useState('')
    const [formatData, setFormatData] = useState({})
    const [tableHeaders, setTableHeaders] = useState([])
    const [tableValues, setTableValues] = useState([])
    const [open, setOpen] = useState(false);
    const [downLoadOpen, setDownLoadOpen] = useState(false);
    const [mobileResponseData, setMobileResponseData] = useState()
    const [show, setShow] = useState(false)
    const [userIndex, setUserIndex] = useState('')
    const [filterData, setFilterData] = useState({})
    const [rangeValues, setRangeValues] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [isAssignedToMe, setIsAssignedToMe] = useState(false);
    const [visible, setVisible] = useState(false)
    const [isAllowedOnly,setIsAllowedOnly] = useState('')
    const [btnType, setBtnType] = useState(false)
   
    const [anchorEl, setAnchorEl] = useState(null);
    const [templates, setTemplates] = useState([]);
    const openDownloadMenu = Boolean(anchorEl);
    const [formIdForTemplate,setFormIdForTemplate] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState(null);

    const searchTimeoutRef = useRef(null);

    const statusList = [
        { label: 'DRAFT', value: 'DRAFT' },
        { label: 'SUBMITTED', value: 'SUBMITTED' },
        { label: 'APPROVED', value: 'APPROVED' },
        { label: 'REJECTED', value: 'REJECTED' },
        { label: 'DATA ENTRY PENDING', value: 'DATA_ENTRY_PENDING' },
        { label: 'QUERY OPEN', value: 'QUERY_OPEN' },
        { label: 'SEND BACK', value: 'SEND_BACK' }
    ]
    function pageChangeHandler(page) {
        if (isLoaded) {
            setPageNo(page);
        }
    }

    useEffect(() => {
        if (permission?.moduleList&&!permission?.moduleList?.readDisabled) {
            if (isFilterApplied) {
                getList(true);
            }else{
                getList();
            }
        }
    }, [pageNo, permission])


    const flattenObject = (obj, prefix = '') => {
        return Object.keys(obj).reduce((acc, key) => {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(acc, flattenObject(value, newKey));
            } else {
                acc[newKey] = value;
            }
            return acc;
        }, {});
    };

    const getAllFormFieldKeys = (data) => {
        const keys = new Set();
        data.forEach(item => {
            const fields = item.formFields || {};
            Object.keys(fields).forEach(key => keys.add(key));
        });
        return Array.from(keys);
    };

    function prepareDynamicTable(dataList, isTableSetting) {
        if (!dataList || dataList.length === 0) {
            return { headers: [], rows: [] };
        }

        const allFieldKeys = new Set();
        const arrayFieldMap = {};

        const isPrimitiveArray = (arr) =>
            Array.isArray(arr) && arr.every(v => typeof v !== "object");

        // STEP 1: Collect all keys and detect arrays
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

        const baseKeys = !isTableSetting ? allFieldKeys : allFieldKeys;

        // STEP 2: Generate expanded headers
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

                    // 🔥 NEW: Support array-inside-array
                    dataList.forEach(entry => {
                        const arr = entry.formFields?.[key];

                        if (Array.isArray(arr) && Array.isArray(arr[0])) {
                            sample = arr[0][0];           // TAKE FIRST ROW → FIRST OBJECT
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

        expandedHeaders.push("Status", "ID", "isPdfExists");
        if(tableHeaders?.length==0){
        setTableHeaders(expandedHeaders)
        }
        else{
            expandedHeaders=tableHeaders;
        }
        // STEP 3: Build rows
        const rows = [];

        dataList.forEach(entry => {
            const formFields = entry.formFields || {};
            const rolePermissionArray = formFields.rolePermission || [];

            const pushRow = (rp = null) => {
                const row = {};

                expandedHeaders.forEach(header => {
                    if (header === "Status") {
                        row[header] = entry.status=="DATA_ENTRY_PENDING"?"PENDING": entry.status|| "-";
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

                    const parts = header.split("_");
                    const key = parts[0];
                    const subKey = parts[1];

                    const value = formFields[key];

                    // 🔥 NEW: ARRAY INSIDE ARRAY SUPPORT
                    if (Array.isArray(value) && Array.isArray(value[0])) {
                        const obj = value[0][0];
                        row[header] = obj?.[subKey] ?? "-";
                        return;
                    }

                    // CASE 1: primitive array
                    if (isPrimitiveArray(value)) {
                        row[header] = value.join(", ");
                        return;
                    }

                    // CASE 2: array of objects
                    if (Array.isArray(value) && typeof value[0] === "object") {
                        row[header] = value[0][subKey] ?? "-";
                        return;
                    }

                    // CASE 3: rolePermission match
                    if (rp && rp.hasOwnProperty(header)) {
                        row[header] = rp[header] ?? "-";
                        return;
                    }

                    // CASE 4: normal field
                    row[header] = formFields[header] !== undefined ? formFields[header] : "-";
                });

                // copy approval/creation display names from the original entry so they are available on the generated row
                row.dataApprovalAssigneName = entry.dataApprovalAssigneName ?? entry.dataApprovalAssigneeName ?? entry.dataApprovalAssigne?.name ?? '-';
                row.dataCreationAssigneName = entry.dataCreationAssigneName ?? entry.dataCreationAssigneeName ?? entry.dataCreationAssigne?.name ?? '-';
                row.dataCreationAssignedById = entry.dataCreationAssignedById ?? '';
                row.dataApprovalAssigneId = entry.dataApprovalAssigneId ?? '';

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


    const convertRangeArray = (ranges) => {
        return ranges.map(([start, end]) => {
            const startDate = moment(start).format("YYYY-MM-DD");
            const endDate = moment(end).format("YYYY-MM-DD");
            return [startDate, endDate];
        });
    };

    // const convertToQueryParams = (data) => {
    //     const params = [];

    //     for (const key in data) {
    //         const field = data[key];

    //         if (Array.isArray(field)) {
    //             // For multi-select → tags[], role[]
    //             const values = field.map(item => item.value).join(",");
    //             params.push(`${key}=${values}`);
    //         } else if (field && field.value) {
    //             // For single-select → gender, education
    //             params.push(`${key}=${field.value}`);
    //         }
    //     }

    //     return "?" + params.join("&");
    // };
    const convertToQueryObject = (data) => {
        const result = {};

        for (const key in data) {
            const field = data[key];

            if (Array.isArray(field)) {
                // Multi-select → convert to comma-separated values
                result[key] = field.map(item => item.value).join(",");
            } else if (field && field.value) {
                // Single-select
                result[key] = field.value;
            }
        }

        return result;
    };



    const getFilterPayload = () => {
        const payload = {};
        // const formatedDate =  convertRangeArray(rangeValues);
        // console.log("rrrrr selectedFilters = ",formatedDate);
        const apiParams = convertToQueryObject(selectedFilters);
        console.log("rrrrr apiparam = ", apiParams);

        return apiParams;
    }


    async function getList(isFilterApplied = false, searchValue = null) {
        let response
        // const apiParams = getFilterPayload();
        const selectedFiltersParams = convertToQueryObject(selectedFilters);
        // include checkbox filter flag (always send true/false)
        selectedFiltersParams.isAssignedToMe = isAssignedToMe;

        const dateFilters = getFormattedDateFilters();
        // const basePayload = {
        //     page: pageNo,
        //     contentPerPage: perPage,
        //     searchKey: search
        // };
        
        // Use passed searchValue if provided, otherwise use state search value
        const effectiveSearch = searchValue !== null ? searchValue : search;
        
        const basePayload = {
            page: isFilterApplied ? 1 : pageNo,
            contentPerPage: perPage,
            ...(effectiveSearch?.trim() ? { searchKey: effectiveSearch } : {})
        };


        const finalPayload = {
            ...basePayload,
            ...selectedFiltersParams,
            ...dateFilters    // merged here
        };


        //   response = await getApiCall(`admin/submit/form/list/${formId}`, finalPayload);

        if (isFilterApplied) {
            response = await getApiCall('admin/submit/form/list/' + formId, {
                ...finalPayload
            });
        } else {
            response = await getApiCall('admin/submit/form/list/' + formId, {
                page: pageNo,
                contentPerPage: perPage,
                isAssignedToMe: isFilterApplied ? isAssignedToMe : false,
            });
        }
        const templatesFromResponse = response?.formData?.docxTemplates || [];
        const submissions = response?.data || [];
        const tableSettingArr = response?.formData?.tableHeaderSetting || [];
        console.log('response?.data::::::', response?.data)

        const { headers, rows } = prepareDynamicTable(submissions, tableSettingArr?.length);

        // setTableHeaders(headers.map((keys)=>formatLabel(keys))); // ["ID", "Status", "roleName", ...]
        setTableValues(rows);     // Array of objects keyed by headers
        setLists(submissions);    // raw
        setTotalItems(response.total)
        setFilterData(response.formData)
        // const formattedData = rows.map((item, index) => ({
        //     header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
        //     data: headers.filter((key) => (key !== "ID"&&key !== "isPdfExists")).map((key) => ({
        //         label: key,
        //         value: item[key] ?? "-", // fallback if key doesn't exist
        //     })),
        //     status: item.Status, // card footer status
        //     footerId: item._id,
        //     url: `/create-update-from/${slugifyTransform(formName)}/${formId}/view?id=${item["ID"]}`,
        //     actionButtons: actionRender(item, index, false),
        //     isAction: actionRender(item, index, true)
        // }));
        // setMobileResponseData(formattedData)
        console.log("rows123 == ",rows);
        
        const formattedData = rows.map((item, index) => ({
            header: `S No: ${(index + 1) + ((pageNo - 1) * perPage)}`,
            data: headers
                .filter((key) => key !== "ID" && key !== "isPdfExists" && key !== "dataCreationAssignedById")
                .reduce((acc, key, i) => {
                    // For first item only
                    if (i === 0) {
                        acc.push({
                            label: formatLabel(key),
                            value: item[key] ?? '-',
                            isLink: true,
                            linkUrl: `/create-update-from/${slugifyTransform(formName)}/${formId}/view?id=${item["ID"]}`,
                            isStricky: true,
                            displayName:displayName
                        });
                        return acc;
                    }

                    // When we reach the Status column, insert Approved By and Created By before it
                    if (key === 'Status') {
                        // acc.push({
                        //     label: 'Approved By',
                        //     value: item.dataApprovalAssigneName ?? '-',
                        // });
                        // acc.push({
                        //     label: 'Created By',
                        //     value: item.dataCreationAssigneName ?? '-',
                        // });

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
            actionButtons: actionRender(item, index, false,templatesFromResponse),
            isAction: actionRender(item, index, true,templatesFromResponse)
        }));

        setMobileResponseData(formattedData);

    }

    async function GetRole() {
        let Role = await useGetRoleModule(deslugifyTransform(formName));
        console.log('headers:::::rows::::::', Role)

        if (Role.moduleList.readDisabled) {
            setPermission({ moduleAccress: false, moduleList: {}, message: "Module Need Some Permission...Pls contact with Your Partner" })
        return;
        } else {
            setPermission(Role)
            // getList()
        }
        // const FilteredData = permissionData.formFields.permission.filter((item, index)=>item.label.includes('Auctions'))[0]?.actions || []
        //     setPermission(FilteredData)
        //      getList();

    }

    useEffect(() => {
        GetRole()
    }, [formName]);
    // useEffect(() => {
    //     getList()
    // }, [search, formName])

    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');
        let status = e.currentTarget.getAttribute('status');
        status = status === "DEACTIVE" ? "ACTIVE" : "DEACTIVE"
        patchApiCall('common/blog/changeStatus/' + id, {
            status: status,
        }).then((response) => {
            if (response.meta.status) {
                swal({ text: response.meta.msg, icon: "success", timer: 1500 })
                getList();
            }
        });
    }

    function DeleteEvent(e) {
        let id = e.currentTarget.getAttribute('value');
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                deleteApiCall('common/blog/delete/' + id, {}).then((response) => {
                    if (response.meta.status) {
                        swal({ text: response.meta.msg, icon: "success", timer: 1500 })
                        getList();
                    }
                });
            } else {
                // swal("Your imaginary file is safe!");
            }
        });

    }

    async function downloaBulkAssignmentTemplate() {
        try {
            const params =  {}
             

            const response = await axios({
                url: `${Constant.apiBasePath}admin/submit/form/bulk-assignment-template/${formId}`,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                },
                params
            });

            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${deslugifyTransform(formName)}-Bulk-Assignment-Template`; // better to specify extension
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);
        }
    }


    async function downloadExcelSheet() {
        try {
            const selectedFiltersParams = convertToQueryObject(selectedFilters);
            selectedFiltersParams.isAssignedToMe = isAssignedToMe;
            const dateFilters = getFormattedDateFilters();
            const searchFilter = search?.trim() ? { searchKey: search } : {};

            const params = isFilterApplied ? {
                ...selectedFiltersParams,
                ...dateFilters,
                ...searchFilter,
                // page: pageNo,
                // contentPerPage: perPage,
                isExcelDownload: true,

            } : {
                // page: pageNo,
                // contentPerPage: perPage,
                isExcelDownload: true,

            };

            let apiUrl = `${Constant.apiBasePath}admin/submit/form/list/${formId}`;
            if (formId === '684ff0df3fc5c3489b3f65e2') {
                apiUrl = `${Constant.apiBasePath}admin/partner-user/export-all`
            }

            const response = await axios({
                url: apiUrl,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                },
                params
            });

            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${deslugifyTransform(formName)}`; // better to specify extension
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);
        }
    }

const downloadBase64File = (responseData) => {
    console.log("response data = ",responseData);
    
  const fileName = responseData?.data?.fileName;

  let base64 = responseData?.data?.fileBuffer;

  if (!base64) {
    console.error("Base64 data not found");
    return;
  }

  // Remove base64 prefix if exists
  base64 = base64.includes(",") ? base64.split(",")[1] : base64;

  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
};


    async function downloadReport() {
        try {
            let apiUrl = `${Constant.apiBasePath}admin/submit/form/tat-report-excel/${formId}`;

            const response = await axios({
                url: apiUrl,
                method: 'GET',
                // responseType: 'blob',
                headers: {
                    authkey: accessToken
                }
            });

           if (response?.data) {
      downloadBase64File(response.data);
    } else {
      console.error("No response data received");
    }

        } catch (error) {
            console.error(error);
        }
    }

    async function downloadDataZip() {
        try {
            const selectedFiltersParams = convertToQueryObject(selectedFilters);
            selectedFiltersParams.isAssignedToMe = isAssignedToMe;
            const dateFilters = getFormattedDateFilters();
            const searchFilter = search?.trim() ? { searchKey: search } : {};

            const params = isFilterApplied ?{
                ...selectedFiltersParams,
                ...dateFilters,
                ...searchFilter,
                page: pageNo,
                contentPerPage: perPage,
                isPdfZipDownload: true,
            }:{
                page: pageNo,
                contentPerPage: perPage,
                isPdfZipDownload: true,
            };

            const response = await axios({
                url: `${Constant.apiBasePath}admin/submit/form/list/${formId}`,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                },
                params
            });

            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${deslugifyTransform(formName)}.zip`;
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);
        }
    }

    async function handleImageDocDownload() {
        try {
            const params = {
                 page: pageNo, 
                contentPerPage: perPage
            };

            const response = await axios({
                url: `${Constant.apiBasePath}admin/submit/form/download-images-zip/${formId}`,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                },
                params
            });

            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${deslugifyTransform(formName)}.zip`;
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);
        }
    }

    async function handleBulkImageDownload() {
        try {
            const selectedFiltersParams = convertToQueryObject(selectedFilters);
            selectedFiltersParams.isAssignedToMe = isAssignedToMe;
            const dateFilters = getFormattedDateFilters();
            const searchFilter = search?.trim() ? { searchKey: search } : {};

            const params = isFilterApplied ? {
                ...selectedFiltersParams,
                ...dateFilters,
                ...searchFilter,
                page: pageNo,
                contentPerPage: perPage,
                isBulkDownload: true,

            } : {
                page: pageNo,
                contentPerPage: perPage,
                isBulkDownload: true,

            };

            const response = await axios({
                url: `${Constant.apiBasePath}admin/submit/form/list/${formId}`,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                },
                params
            });

            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${deslugifyTransform(formName)}`; // better to specify extension
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);
        }
    }
 

    async function downloadTemplate() {
        let apiUrl = Constant.apiBasePath + `admin/submit/form/template/${formId} `;
        if(formId==='684ff0df3fc5c3489b3f65e2'){
            apiUrl = Constant.apiBasePath + `admin/partner-user/export-template`
        }

        try {
            const response = await axios({
                url: apiUrl,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                }
            });
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = deslugifyTransform(formName) + ' Template';
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    }

    function formatLabel(key) {
        return key
            .replace(/([A-Z])/g, ' $1')   // insert space before capital letters
            .replace(/^./, str => str.toUpperCase()); // capitalize first letter
    }

    const handleMenuItemClick = (formId,template,formIdForTemplate) => {
        handleDocDownload(formId,template._id,formIdForTemplate);
         setAnchorEl(null);
        
    }

     const handleDocDownload = async (formId,templateId,id) => {
        try {

            const response = await axios({
                url: Constant.apiBasePath + `admin/submit/form/download/docs/pdf/${formId}/${templateId}/${id}`,
                method: "GET", // Changed to POST
                responseType: "blob",
                headers: {
                    authkey: accessToken,
                    "Content-Type": "application/json", // Added content type for POST request
                },
            });

            const url = URL.createObjectURL(response.data);
            const link = document.createElement("a");
            console.log("zzz111 link = ",link);
            
            link.href = url;
            link.download = `ResponsePdf${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            // Clean up the URL object when the download is complete
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    }

    const handleDownload = async (id) => {
        try {

            const response = await axios({
                url: Constant.apiBasePath + `admin/submit/form/download/${formId}/${id}`,
                method: "GET", // Changed to POST
                responseType: "blob",
                headers: {
                    authkey: accessToken,
                    "Content-Type": "application/json", // Added content type for POST request
                },
            });

            const url = URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = `ResponsePdf${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            // Clean up the URL object when the download is complete
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    }
    console.log('permission.accessType:::::111', permission)
    const hasKey = (obj = {}, key = "") => {
        console.log("zzz111 = ",obj,key);
        
     return Object.prototype.hasOwnProperty.call(obj, key);
    };


    const handleMenuOpen = async (event, id, templates = []) => {
        const anchor = event.currentTarget; // ✅ save it first

        // const response = await fetchFormList(isFilterApplied);
        //  const templateList = response?.formData?.docxTemplates || [];
        const templateList = templates || [];
         const hasMultipleTemplates = templateList.length > 1;
        

        if (hasMultipleTemplates) {
            setTemplates(templateList);
            setFormIdForTemplate(id);
            setAnchorEl(anchor); // ✅ use saved value
        } else {
            // handleDownload(id);
             handleMenuItemClick(formId,templateList[0],id);
        }
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // delete click
    const handleDelete = (formId, itemID) => {
        console.log("rrr111 permission = ",permission);
        console.log("ppp111 item = ",itemID);

        
        setSelectedFormId({formId:formId,itemID:itemID});
        setShowDeleteModal(true);
    };

    // confirm delete api
const confirmDelete = async () => {
    try {

        const deleteUrl = `admin/submit/form/soft-delete/${selectedFormId.formId}/${selectedFormId.itemID}/true`;

        const response = await postApiCall(deleteUrl, {}, true);

        if (response?.meta?.status) {

            toast.success(response?.meta?.msg || "Deleted successfully");

            setShowDeleteModal(false);
            setSelectedFormId(null);
            getList();
        }

    } catch (error) {
        console.error("Delete failed:", error);
    }
};

// cancel modal
const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedFormId(null);
};

    const actionRender = async (item, index, forLength = false, templates = []) => {
        console.log("ddd333 item = ",item);
        
        
        const actions = [];

        const editUrl = `/create-update-from/${slugifyTransform(formName)}/${formId}/edit?id=${item["ID"]}`;
        const reviewUrl = `/create-update-from/${slugifyTransform(formName)}/${formId}/forApproval?id=${item["ID"]}`;
        const auditUrl = `/formData/audit-trails/${slugifyTransform(formName)}/${formId}/${item["ID"]}`;
        const queryUrl = `/formData/${slugifyTransform(formName)}/queries/${formId}/${item["ID"]}`;
        const deleteUrl = `/dynamic/form/soft-delete/${formId}/true`;
        console.log('isPdfExists', item)
        // ⭐ EDIT BUTTON RULES
        if(formId == "69e9d4282bed16f0b56f1b3e"){
const userId = String(userDetailsData?.id);

if (
  item?.dataApprovalAssigneId &&
  item.dataApprovalAssigneId[userId] === false
) {

  actions.push({
    type: "edit",
    label: "Edit",
    redirectUrl: editUrl,
    displayName: displayName
  });

}
    }
        else if (permission?.accessType == "Data Owner") {
            // Always allow edit
            actions.push({
                type: "edit",
                label: "Edit",
                redirectUrl: editUrl,
                displayName: displayName
            });
        } else {
            const canEdit =
                (
                    // userDetailsData.id==item?.dataCreationAssignedById &&
                    !permission?.moduleList?.updateDisabled &&
                    ["DRAFT", "DATA_ENTRY_PENDING", "QUERY_OPEN","SEND_BACK", "PENDING"].includes(item.Status)) ||
                (permission?.accessType === "Approver with Edit" &&
                    item.Status === "SUBMITTED");

            // if (canEdit && (hasKey(item, "rejectFormFields"))) {
            if (canEdit) {
                actions.push({
                    type: "edit",
                    label: "Edit",
                    redirectUrl: editUrl,
                    displayName: displayName
                });
            }
        }

        // ⭐ REVIEW BUTTON RULES
        if (
            !(permission?.moduleList?.approveDisabled ||
                permission?.moduleList?.rejectDisabled ||
                permission?.accessType === "Owner Data")
        ) {
            if (item.Status === "SUBMITTED" && formId !== "69e9d4282bed16f0b56f1b3e") {
                actions.push({
                    type: "review",
                    label: "Review",
                    redirectUrl: reviewUrl,
                    displayName: displayName
                });
            }
        }
        if (!permission?.moduleList?.usereditDisabled || !permission?.moduleList?.userviewDisabled) {
            let approvalName = item.dataApprovalAssigneName
            if (typeof item.dataApprovalAssigneName == "object") {
                const firstFalseUserName = Object.keys(item.dataApprovalAssigneId)
                    .find((userId) => item.dataApprovalAssigneId[userId] === false);

                const userName = firstFalseUserName
                    ? item.dataApprovalAssigneName[firstFalseUserName]
                    : '';
                approvalName = userName;
            }
            actions.push({
                type: "userAssign",
                label: "User Assignment",
                userName:
                    (item.Status === "APPROVED" || formId == "69e9d4282bed16f0b56f1b3e")
                        ? approvalName
                        // lists[index]?.dataApprovalAssignedByName
                        : item.dataCreationAssigneName,
                        // lists[index]?.dataCreationAssignedByName,
                onClick: () => {
                    setShow(true);
                    setUserIndex(index);
                },
            });
            //              <AssigneedAvatar
            //   user={{ name: userDetailsData?.name + ' Singh' }}
            //   onChange={(value) => {
            //     console.log("Assigned to Me:", value);
            //   }}
            // />
        }

        // ⭐ DOWNLOAD ALLOWED ONLY WHEN APPROVED + PDF EXISTS
        if (!permission?.moduleList?.downloadDisabled) {
            // if (item.isPdfExists == false) {
            //     actions.push({
            //         type: "download",
            //         label: "Download",
            //         onClick: () => handleDownload(item["ID"]),
            //     });
            // }
            if (templates.length > 0) {
                 actions.push({
                type: "download",
                label: "Download",
                onClick:(event) => handleMenuOpen(event, item["ID"], templates) 
            });
            }
           
            
        }

        // ⭐ AUDIT BUTTON
        if (!permission?.moduleList?.auditDisabled) {
            actions.push({
                type: "audit",
                label: "Audit Trail",
                redirectUrl: auditUrl,
                displayName: displayName
            });
        }
        // ⭐ USER ASSIGNMENT

        if (!permission?.moduleList?.queryDisabled) {
            actions.push({
                type: "query",
                label: "Query",
                redirectUrl: queryUrl
            });

        }

        //delete icon here
         if (permission?.permissionKeys?.includes('delete')) {
            actions.push({
                type: "delete",
                label: "Delete",
                // redirectUrl: deleteUrl,
                onClick: () => handleDelete(formId,item["ID"])
            });

        }
        const isMobile = window.innerWidth <= 768;

        // Reverse actions only for mobile
        const actionsToRender = isMobile ? [...actions].reverse() : actions;

        if (forLength) {
            return actions?.length > 0 ? true : false
        }
        return <CommonActionIcons actions={actionsToRender} />;
    };


    const checkIfAnyFilterExists = (filterData) => {
        if (!filterData) return false;

        return (
            (filterData.searchableFields && filterData.searchableFields.length > 0) ||
            (filterData.dateFilterFields && filterData.dateFilterFields.length > 0) ||
            (filterData.multiSelectFilterFields && filterData.multiSelectFilterFields.length > 0) ||
            (filterData.dropdownFilterFields && filterData.dropdownFilterFields.length > 0)
        );
    };




    const renderFilter = (forScreen) => (
        <>
            <div
                className='moduleList111'
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{width:'370px'}}>
                    <div className="position-relative" style={{ width: '100%' }}>
                        <i
                            className="bi bi-search position-absolute"
                            style={{
                                left: "8px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                fontSize: "12px",
                            }}
                        ></i>
                        <input type="text" className="form-control input-height-40" name="searchKey"
                            value={search} 
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearch(value);
                                clearTimeout(searchTimeoutRef.current);
                                if (value.length >= 3) {
                                    searchTimeoutRef.current = setTimeout(() => {
                                        handleFilterClick(value);
                                    }, 500);
                                } else if (value.length === 0) {
                                    handleFilterClick(value);
                                }
                            }}
                            placeholder="Search"
                            style={{ textIndent: "12px", paddingRight: "2.5rem", fontSize: "12px", height: "30px" }}
                        />
                        {search && (
                            <i
                                className="bi bi-x-lg position-absolute"
                                style={{
                                    right: "0.5rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                }}
                                onClick={() => { setSearch(''); clearTimeout(searchTimeoutRef.current); handleFilterClick(''); }}
                            ></i>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    {filterData?.dateFilterFields?.map((item, index) => (
                        <div key={index} className='mb-m' style={{borderRadius:'8px'}}>
                            <DateRangePicker
                                style={{ width: "100%", height: '32px'}}
                                className="input-height-40"
                                value={rangeValues[index] || null}
                                onChange={(val) => { HandleDateFilterFieldsChange(val, index); handleFilterClick(); }}
                                placeholder={getLabelNameByKeys(item, filterData?.moduleFormData)}
                            />
                        </div>
                    ))}

                    {filterData?.multiSelectFilterFields?.map((item, index) => {
                        const field = getFormFields({
                            display: "form",
                            components: filterData?.moduleFormData
                        }).find(f => f.key === item) || [];

                        return (
                            <div key={index} className='mb-m' style={{borderRadius:'8px',width:'150px' }}>
                                <ReusableSelect
                                    style={{ width: "150px" }}
                                    className="mui-input-40"
                                    options={field?.value || []}
                                    placeholder={field?.label || item}
                                    isMulti={true}
                                    value={selectedFilters[item] || (field?.data?.type === "multi" ? [] : null)}
                                    onChange={(selectedValue) => {
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            [item]: selectedValue
                                        }));
                                    }}
                                    onClose={() => handleFilterClick()}
                                />
                            </div>
                        );
                    })}

                    {filterData?.dropdownFilterFields?.map((item, index) => {
                        const field = getFormFields({
                            display: "form",
                            components: filterData?.moduleFormData
                        }).find(f => f.key === item) || [];

                        return (
                            <div key={index} className='mb-m' style={{borderRadius:'8px' }}>
                                <ReusableSelect
                                    style={{ width: "100%" }}
                                    className="mui-input-40"
                                    options={field?.value || []}
                                    placeholder={field?.label || item}
                                    isMulti={false}
                                    value={selectedFilters[item] || null}
                                    onChange={(selectedOption) => {
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            [item]: selectedOption
                                        }));
                                        handleFilterClick();
                                    }}
                                />
                            </div>
                        );
                    })}

                    <div className='mb-m' style={{borderRadius:'8px'  }}>
                        <ReusableSelect
                            style={{ width: "100%" }}
                            // width='130px'
                            options={statusList}
                            className="mui-input-40"
                            isMulti={true}
                            placeholder='Select Status'
                            value={selectedFilters.status || []}
                            onChange={(selectedOption) => {
                                setSelectedFilters(prev => ({
                                    ...prev,
                                    status: selectedOption
                                }));
                            }}
                            onClose={() => handleFilterClick()}
                        />
                    </div>
                </div>
            </div>
        </>
    )

    const handleAssign = () => {

    }
    const handleClose = () => {
        setShow(false)
    }

    const HandleDateFilterFieldsChange = (val, index) => {
        const updated = [...rangeValues];
        updated[index] = val;
        setRangeValues(updated);
    };

    const handleFilterClick = (searchValue = null) => {
        const payload = getFilterPayload();
        console.log("ffff payload= ", payload);
        setIsFilterApplied(true);
        setPageNo(1);
        getList(true, searchValue);
        // Use payload to fetch filtered data
    }

    const resetfilterState = () => {
        setSelectedFilters({});
        setRangeValues([]);
        setSearch('');
        setPageNo(1);
        setIsFilterApplied(false);
        setIsAssignedToMe(false);
    }

    const resetFilter = () => {
        resetfilterState()
        getList(false);
    }

    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };


    const getFormattedDateFilters = () => {
        const result = {};
        filterData?.dateFilterFields?.forEach((field, index) => {
            const range = rangeValues[index];
            if (range && range.length === 2) {
                const [from, to] = range;
                result[`${field}From`] = formatDate(from);
                result[`${field}To`] = formatDate(to);
            }
        });
        return result;
    };

    const getLabelNameByKeys = (key, data) => {
         const field = getFormFields({
                     display: "form",
                     components: data
                    }).find(f => f.key === key) || [];
                return field.label;
    }

    function getLabelsByKeys(key, formData) {
        const field = formData.filter(item => item.key === key);
        return (field.length > 0) ? field[0].label : "";
    }

    console.log("debug11 permission = ",permission);
    

    const headerButtons = () => {
        return (
            <div className="d-flex gap-3 flex-wrap">
                <div className="position-relative">
                    <CustomButton
                        label=""
                        icon="bi-upload"
                        appendClass='bg-transparent'
                        iconAppendClass="me-2"
                        onClick={() => setOpen(!open)}
                        // btnWidth='36px'
                    />
                    {open && (<>
                        <div className="user-backdrop" onClick={() => setOpen(false)}></div>
                        <div
                            className="user-dropdown show shadow"
                            style={{
                                display: "block",
                                position: "absolute",
                                top: "105%",
                                right: 0,
                                minWidth: "220px",
                                borderRadius: "10px",
                                padding: "0"
                            }}
                        >
                            <>
                                {/* */}
                                {!permission?.moduleList?.createDisabled && (
                                    <div className="border-bottom">
                                        <Link
                                            className="dropdown-item gap-2 py-2"
                                            onClick={() => { downloadTemplate(); setDownLoadOpen(false) }}
                                        >
                                            <i className="bi bi-download mx-2"></i>   Download Template
                                        </Link>
                                    </div>
                                )}
                                {!permission?.moduleList?.uploadDisabled && (
                                    <div className="border-bottom">
                                        <Link
                                            // to={`/formData/bulk-upload/${formName}/upload/${formId}`}
                                            className="dropdown-item gap-2 py-2"
                                            onClick={() => { setOpen(false); setVisible(true); setBtnType('Bulk Upload') }}
                                        >
                                            <i className="bi bi-upload mx-2"></i>  Bulk Upload
                                        </Link>
                                    </div>
                                )}
                                {!permission?.moduleList?.updateDisabled && (
                                    <div className="border-bottom">
                                        <Link
                                            // to={`/formData/bulk-upload/${formName}/update/${formId}`}
                                            className="dropdown-item gap-2 py-2"
                                            onClick={() => { setOpen(false); setVisible(true); setBtnType('Bulk Update') }}
                                        >
                                            <i className="bi bi-arrow-repeat mx-2"></i>  Bulk Update
                                        </Link>
                                    </div>
                                )}
                                {!permission?.moduleList?.uploadDisabled && (
                                    <div className="border-bottom">
                                        <Link
                                            // to={`/formData/bulk-upload/${formName}/image-upload/${formId}`}
                                            className="dropdown-item gap-2 py-2"
                                            onClick={() => { setOpen(false); setVisible(true); setBtnType('Bulk Image Upload') }}
                                        >
                                            <i className="bi bi-upload mx-2"></i> Bulk Image Upload
                                        </Link>
                                    </div>
                                )}
                                {!permission?.moduleList?.usereditDisabled && (
                                    <div className="border-bottom">
                                        <Link
                                            className="dropdown-item gap-2 py-2"
                                            onClick={() => { setOpen(false); setVisible(true); setBtnType('Bulk Assignment') }}
                                        >
                                            <i className="bi bi-upload mx-2"></i> Bulk Assignment
                                        </Link>
                                    </div>
                                )}
                                {
                                    // (!permission?.moduleList?.approveDisabled || !permission?.moduleList?.rejectDisabled) &&
                                    (permission?.permissionKeys?.includes('approve')) &&
                                    <div className="border-bottom">
                                        <Link
                                            className="dropdown-item gap-2 py-2"
                                            onClick={() => { setOpen(false); setVisible(true); setBtnType('Bulk Review') }}
                                        >
                                            <i className="bi bi-upload mx-2"></i> Bulk Review
                                        </Link>
                                    </div>
                                }

                                {
                                    // (!permission?.moduleList?.approveDisabled || !permission?.moduleList?.rejectDisabled) &&
                                    (permission?.permissionKeys?.includes('admin_bulk_update')) &&
                                    <div className="border-bottom">
                                        <Link
                                            className="dropdown-item gap-2 py-2"
                                            onClick={() => { setOpen(false); setVisible(true); setBtnType('Admin Bulk Update') }}
                                        >
                                            <i className="bi bi-upload mx-2"></i> Admin Bulk Update
                                        </Link>
                                    </div>
                                }


                            </>
                        </div>
                    </>)}
                </div>
                {permission?.moduleList?.downloadDisabled ? null : (<>
                    <div className="position-relative">
                        <CustomButton
                            label=""
                            // btnWidth='36px'
                            icon="bi-download"
                            appendClass='bg-transparent mx-2'
                            onClick={() =>{ tableHeaders?.length == 0?toast.error('No data available to download'):setDownLoadOpen(true)}}
                        />
                        {downLoadOpen && (<>
                            <div className="user-backdrop" onClick={() => setDownLoadOpen(false)}></div>
                            <div
                                className="user-dropdown show shadow"
                                style={{
                                    display: "block",
                                    position: "absolute",
                                    top: "105%",
                                    right: "0px",
                                    minWidth: "220px",
                                    borderRadius: "10px",
                                    padding: "0"
                                }}
                            >
                                {!permission?.moduleList?.downloadDisabled && (
                                    <>
                                        {/* */}
                                        {tableHeaders?.length > 0 ?
                                            <>
                                                <div className="border-bottom">
                                                    <Link
                                                        className="dropdown-item gap-2 py-2"
                                                        onClick={() => { downloadExcelSheet(); setDownLoadOpen(false) }}
                                                    >
                                                        <i className="bi bi-download mx-2"></i>  Download List
                                                    </Link>
                                                </div>

                                                <div className="border-bottom">
                                                    <Link
                                                        className="dropdown-item gap-2 py-2"
                                                        onClick={() => { downloadDataZip(); setDownLoadOpen(false) }}
                                                    >
                                                        <i className="bi bi-download mx-2"></i>  Download Report Zip
                                                    </Link>
                                                </div>
                                                <div className="border-bottom">
                                                    <Link
                                                        className="dropdown-item gap-2 py-2"
                                                        onClick={() => { handleBulkImageDownload(); setDownLoadOpen(false) }}
                                                    >
                                                        <i className="bi bi-download mx-2"></i>  Bulk File Download
                                                    </Link>
                                                </div>
                                                {filterData?.tatReportName &&
                                                    <div className="border-bottom">
                                                        <Link
                                                            className="dropdown-item gap-2 py-2"
                                                            onClick={() => { downloadReport(); setDownLoadOpen(false) }}
                                                        >
                                                            <i className="bi bi-download mx-2"></i> {filterData?.tatReportName}
                                                        </Link>
                                                    </div>
                                                }
                                            </>
                                            :
                                            <div className="border-bottom">
                                                <p>No Data to Download</p>
                                            </div>
                                        }

                                        {/* <div className="border-bottom">
                                            <Link
                                                className="dropdown-item gap-2 py-2"
                                                onClick={() => { handleImageDocDownload(); setDownLoadOpen(false) }}
                                            >
                                                <i className="bi bi-download mx-2"></i>  Bulk Image/Doc Download
                                            </Link>
                                        </div> */}
                                        <div className="border-bottom">
                                            {/* <Link
                                                className="dropdown-item gap-2 py-2"
                                                onClick={() => { downloadTemplate(); setDownLoadOpen(false) }}
                                            >
                                                <i className="bi bi-download mx-2"></i>   Download Template
                                            </Link> */}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>)}
                    </div>
                    {/* <CustomButton
                                        label="Download Report Zip"
                                        icon="bi-download"
                                        // appendClass='dropdown-toggle'
                                        appendClass='mx-2'
                                        onClick={downloadDataZip}
                                    /> */}
                </>)}
                {permission?.moduleList?.createDisabled ? null : (<>
                    <CustomButton
                        label=""
                        variant='danger'
                        icon="bi-plus-lg"
                        appendClass='text-white d-block d-md-none'
                        onClick={handleAdd}
                    // to={`/create-update-from/${slugifyTransform(formName)}/${formId}/add`}
                    />
                    <CustomButton
                        label="Add"
                        variant='danger'
                        icon="bi-plus-lg"
                        appendClass='text-white d-none d-md-block'
                        onClick={handleAdd}
                    // to={`/create-update-from/${slugifyTransform(formName)}/${formId}/add`}
                    />
                </>)}
            </div>
        )
    }
const handleAdd=()=>{
    navigate(`/create-update-from/${slugifyTransform(formName)}/${formId}/add`)
}
    const getFormFields = (schema, allowedTypes = null, notAllowedTypes = null) => {
  const leafFields = [];
  const matchedFields = [];

  const extract = (comp) => {
    // If component has nested components → go deeper
    if (comp.components && comp.components.length > 0) {
      comp.components.forEach(extract);
      return;
    }

    // Columns structure → each column has .components array
    if (comp.columns && comp.columns.length > 0) {
      comp.columns.forEach(col => col.components.forEach(extract));
      return;
    }

    // Rows structure → rows is array of arrays
    if (comp.rows && comp.rows.length > 0) {
      comp.rows.forEach(row =>
        row.forEach(cell => {
          if (cell.components) {
            cell.components.forEach(extract);
          }
        })
      );
      return;
    }

    // Datagrid → comp.components is inside each row
    if (comp.type === "datagrid" && comp.components) {
      comp.components.forEach(extract);
      return;
    }

    // Tables
    if (comp.type === "table" && comp.rows) {
      comp.rows.forEach(row =>
        row.forEach(cell => {
          if (cell.components) {
            cell.components.forEach(extract);
          }
        })
      );
      return;
    }

    // If here → component is LEAF (actual input)
    if (comp.key && comp.label) {
      const field = {
        label: comp.label,
        key: comp.key,
        type: comp.type,
        value: comp?.data?.values || []
      };
      if (notAllowedTypes && notAllowedTypes.includes(comp.type)) {
        return;
      }

      leafFields.push(field);
      if (allowedTypes && allowedTypes.includes(comp.type)) {
        matchedFields.push(field);
      }
    }
  };

  // Start recursion
  (schema.components || []).forEach(extract);

  // No filter → all leaf fields
  if (!allowedTypes) return leafFields;

  // If matching types found → return only those
  if (matchedFields.length > 0) return matchedFields;

  // No matched → return all leaf fields
  return leafFields;
};



console.log("ddd111 lists = ",lists);

    return (
        <>
            <div className="container-fluid">
                {permission.hasOwnProperty("moduleAccress") &&
                    !permission.moduleAccress ?
                    <div className="row text-center">
                        <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                            <div className="errer">
                                <img src="/program-error.png" />
                                <h2>403</h2>
                                <p>{permission?.message}</p>

                            </div>
                        </div>
                    </div>
                    :
                    <>
                        <div className="main-title1">
                            <FilterWithButtonsCard title={deslugifyTransform(displayName || formName)} headerButtons={headerButtons()} />
                        </div>
                        <div className="d-block d-md-none">
                            <CardListMobile
                                dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                perPage={perPage}
                                totalItems={totalItems}
                                currentPage={pageNo}
                                pageChangeHandler={pageChangeHandler}
                                handleFilter={getList}
                                isAction={true}
                                onreset={resetFilter}
                            >
                                <div style={{ width: '100%', marginRight: '10px' }}>
                                    {renderFilter('mobile')}
                                </div>
                            </CardListMobile>
                        </div>
                        <div className="card mb-4 d-none d-md-block">
                            <div className="card-body">
                                <CommonTable
                                    formattedData={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                    perPage={perPage}
                                    totalItems={totalItems}
                                    currentPage={pageNo}
                                    handler={pageChangeHandler}
                                    isActionStricky={true}
                                    filters={renderFilter()}
                                />
                            </div>
                        </div>
                    </>
                }
            </div>
            {show && <UserAssignmentModal
                formId={formId}
                show={show}
                data={lists[userIndex]}
                handleClose={handleClose}
                formCreator={creator}
                formApprover={approver}
                reloadList={getList}
                permission={permission}
            />
            }
            {visible && <BulkDataUpload
                formId={formId}
                formName={formName}
                type={btnType}
                visible={visible}
                setVisible={setVisible}
                downloaBulkAssignmentTemplate={downloaBulkAssignmentTemplate}
            />
            }
            <Menu
                anchorEl={anchorEl}
                open={openDownloadMenu}
                onClose={handleMenuClose}
            >
                {templates.map((item, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => {
                            handleMenuItemClick(formId, item, formIdForTemplate); // or item.id if needed
                            handleMenuClose();
                        }}
                    >
                        {item.name}
                    </MenuItem>
                ))}
            </Menu>

            
                {<Modal
    open={showDeleteModal}
    onClose={closeDeleteModal}
>
    <Box sx={modalStyle}>

        <Typography variant="h6" mb={2}>
            Confirm Delete
        </Typography>

        <Typography mb={3}>
           Are you sure you want to delete this record?
        </Typography>

        <Box
            display="flex"
            justifyContent="flex-end"
            gap={2}
        >
            <Button
                variant="outlined"
                onClick={closeDeleteModal}
            >
                Cancel
            </Button>

            <Button
                variant="contained"
                color="error"
                onClick={confirmDelete}
            >
                Confirm
            </Button>
        </Box>

    </Box>
</Modal>}
            
        </>
    )
}

export default FormInsertdTable
