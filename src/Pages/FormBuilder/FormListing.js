import React, {useEffect, useState} from 'react'
import {Link, useLocation} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import axios from "axios";

import patchApiCall from "../../Services/patchApiCall";
import Constant from "../../Components/Constant";
import postApiCall from '../../Services/postApiCall';
import PaginationNew from "../../Widgets/PaginationNew";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { DateRangePicker, Stack} from 'rsuite';
import "rsuite/dist/rsuite.css";
import moment from 'moment'
import loginUser from '../../Services/loginUser';
import { SelectPicker } from 'rsuite';
import { slugifyTransform } from '../../Utils/Helpers';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CustomButton from '../../Utils/CustomButton';
import CommonActionIcons from '../../Utils/CommonActionIcons';
import CommonTable from '../../Utils/CommonTable';
import {
    Modal,
    Box,
    Typography,
    Button
} from "@mui/material";
import { toast } from 'react-toastify';

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

const FormListing = () => {
    let {accessToken} = loginUser();

    const [lists, setLists] = useState([{formId:'F0001', formName:'Technical Form',createdDate:'12-April-2024', status:'Draft'}]);
    const [filterForm, setFilterForm] = useState({ searchKey: ''});
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState({})
    const [partner, setPartner] = useState("")
    const [partnerArr, setPartnerArr] = useState([])
    const [mobileResponseData, setMobileResponseData] = useState()
    const [debounceTimer, setDebounceTimer] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState(null);

    function pageChangeHandler(page) {
        // if (isLoaded) {
        setPageNo(page);
        // getList()
        // }
    }

     useEffect(() => {
            if(permission?.moduleList&&!permission?.moduleList?.readDisabled){
            getList();
            }
        }, [pageNo, permission])
    
    const location = useLocation();

    // Debounce search - triggers when searchKey has at least 3 characters
    useEffect(() => {
        if (permission?.moduleList && !permission?.moduleList?.readDisabled) {
            if (debounceTimer) clearTimeout(debounceTimer);
            
            const searchValue = filterForm.searchKey ? filterForm.searchKey.trim() : '';
            if (searchValue.length >= 3 || searchValue.length === 0) {
                const timer = setTimeout(() => {
                    setPageNo(1);
                    // Directly fetch to ensure API call even if pageNo is already 1
                    setTimeout(getList, 50);
                }, 800);
                setDebounceTimer(timer);
            }
        }
        
        return () => {
            if (debounceTimer) clearTimeout(debounceTimer);
        };
    }, [filterForm.searchKey, permission]);


    async function GetRole() {
        let Role = await useGetRoleModule("Form Builder");
        console.log("rrr111 role = ",Role);
        
         if (Role.moduleList.read === false) {
            setPermission({ moduleAccress: false, moduleList: {}, message: "Module Need Some Permission...Pls contact with Your Partner" })
        } else {
            setPermission(Role)
            // getList();
        }
    }

    

    useEffect(() => {
        GetRole();
    }, [])

      // delete click
    const handleDelete = (formId) => {
        // console.log("ppp111 permission = ",permission);
        // console.log("ppp111 item = ",formId);

        
        setSelectedFormId(formId);
        setShowDeleteModal(true);
    };

        // confirm delete api
    const confirmDelete = async () => {
        try {
    
            // const deleteUrl = `admin/submit/form/soft-delete/${selectedFormId.formId}/${selectedFormId.itemID}/true`;
    const deleteUrl = `admin/dynamic/form/soft-delete/${selectedFormId}/true`;
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
   

    function getList() {
        let params={
        contentPerPage: perPage,
        page:pageNo,
        ...filterForm
        }

        getApiCall('admin/dynamic/form/list', params).then((response) => {
            if (response.meta.status) {
                setLists(response.data)
                setTotalItems(response.total)
                const formattedData = response.data.map((item, index) => ({
                    header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
                    data: [
                        { label: "Form ID", value: item.formID ? item.formID : "-", isLink: true, linkUrl: `/forms-list/${slugifyTransform(item?.name)}/${item._id}?creator=${item.dataCreationAssignProcess}&approver=${item.dataApprovalAssignProcess}` },
                        { label: "Form Name", value: item.name ? item.name : "-", isLink: true, linkUrl: `/forms-list/${slugifyTransform(item?.name)}/${item._id}?creator=${item.dataCreationAssignProcess}&approver=${item.dataApprovalAssignProcess}` },
                        { label: "Created Date", value: item.createdAt ? moment(item.createdAt).format('DD/MM/YYYY') : "-" },
                        { label: "Updated Date", value: item.updatedAt ? moment(item.updatedAt).format('DD/MM/YYYY') : "-" },
                        { label: "Status", value: item.status },
                    ],
                    status: item.status, // card footer status
                    footerId: item._id,
                    url: ``,
                    isAction: true,
                    actionButtons: actionRender(item)
                }));
                setMobileResponseData(formattedData)
            } else {
                setLists([])
                setTotalItems(0)
                setMobileResponseData([])
            }
        })
            .catch((error) => {
                setLists([])
                setTotalItems(0)
                setMobileResponseData([])
            })

    }

    // const actionRender = (item, forScreen) => (<>
    //     <Link
    //         to={`/form-builder/${item._id}?edit`}
    //         className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1"
    //     >
    //         <span className="icon text-white-50">
    //             <i className="far fa-edit"></i>
    //         </span>
    //             </Link>
    //  </>)
    const actionRender = (item, forScreen) => {
  const actions = [
    {
      type: "edit",
      label: "Edit",
      redirectUrl: `/form-builder/${item._id}?edit`,
      // onClick is optional since redirectUrl handles navigation
    }
  ];

   if (permission?.permissionKeys?.includes('delete')) {
            actions.push({
                type: "delete",
                label: "Delete",
                // redirectUrl: deleteUrl,
                onClick: () => handleDelete(item["_id"])
            });
        }

  return <CommonActionIcons actions={actions} />;
};
    const headerButtons = () => {
        return (
            <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
                {permission?.moduleList?.createDisabled ? null :
                    <CustomButton
                        label="Add"
                        variant="danger"
                        icon="bi-plus-lg"
                        appendClass='text-white mx-2'
                       to="/form-builder"
                    />
                }
            </div>
        )
    }
    const handleFilterClick = () => {
        setPageNo(1)
        getList()
    }

    const resetFilter = () => {
      setFilterForm({searchKey:''})
          setPageNo(1)
       
    }
//     useEffect(()=>{
// if(!filterForm?.searchKey){
//  getList()
// }
//     },[filterForm])
    const renderFilter =()=>(
              <div className='moduleList'>
                <div className="form-group11 mb-m">
                    <input type="text" className="form-control input-height-40" name="searchKey"
                        value={filterForm.searchKey || ''} onChange={(e) => setFilterForm({...filterForm, searchKey:e.target.value})}
                        placeholder="Search"
                    />
                </div>
                {/* <CustomButton
                label="Apply"
                variant='danger'
                appendClass='text-white mx-2 d-none d-md-block'
                onClick={handleFilterClick}
            /> */}
            
                </div>
    )
    return (
        <>
            {permission.hasOwnProperty('moduleAccress') && !permission.moduleAccress ?
                <div className="row text-center">
                    <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                        <div className="errer">
                            <img src="/program-error.png" />
                            <h2>403</h2>
                            {/* <h4 className="text-danger">{permission.message}</h4> */}
                            <p>{permission.message}</p>

                        </div>
                    </div>
                </div>
                : <div className="container-fluid">
                    <div className="main-title1">
                        {/* <h3>FAQs Categories</h3> */}
                        {/* <FilterWithButtonsCard filters={renderFilter()} title={'Form Listing'} headerButtons={headerButtons()}/> */}
                        <FilterWithButtonsCard title={'Form Builder'} headerButtons={headerButtons()}/>
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
                            {renderFilter()}
                        </CardListMobile>
                    </div>
                    <div className="card shadow mb-4 d-none d-md-block">
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
                </div>}

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

export default FormListing
