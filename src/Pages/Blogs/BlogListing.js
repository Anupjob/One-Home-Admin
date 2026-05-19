import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";

import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import deleteApiCall from "../../Services/deleteApiCall";
import Constant from "../../Components/Constant";
import PaginationNew from "../../Widgets/PaginationNew";
import {shortText} from "../../Services/helpers";
import useGetRoleModule from '../../Services/useGetRoleModule';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CustomButton from '../../Utils/CustomButton';
import CommonActionIcons from '../../Utils/CommonActionIcons';
import axios from 'axios';
import loginUser from '../../Services/loginUser';
var slugify = require('slugify');

const BlogListing = () => {
    let { accessToken } = loginUser();
    const [lists, setLists] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState({})
    const [search,setSearch] = useState('')
    const [mobileResponseData, setMobileResponseData] = useState()

    function pageChangeHandler(page) {
        if (isLoaded) {
            setPageNo(page);
        }
    }

    useEffect(() => {
        GetRole()
    }, [pageNo])

    async function getList() {
        let response
        if(search != ''){
             response = await getApiCall('common/blog/get-all', {
                page: pageNo,
                contentPerPage: perPage,
                searchKey: search
            });
        }else{
             response = await getApiCall('common/blog/get-all', {
                page: pageNo,
                contentPerPage: perPage,
            });
        }
      
        setLists(response.data)
        setTotalItems(response.total)
        const formattedData = response.data.map((item, index) => ({
            header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
            data: [
                { label: "Title/Header", value: item.title },
                { label: "Author", value: item.postBy },
                { label: "Designation", value: item.designation },
                { label: "Description", value: shortText(item.description) },
                { label: "Status", value: item.status },
            ],
            status: item.status, // card footer status
            footerId: item._id,
            url: ``,
            actionButtons: actionRender(item)
        }));
        setMobileResponseData(formattedData)
    }

    async function GetRole() {
        let Role = await useGetRoleModule("blogs");
        if(Role.moduleList.read === false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            setPermission(Role)
            getList();
        }
        
    }

    useEffect(() => {
        GetRole()
    }, []);

    useEffect(()=>{
        const handler = setTimeout(() => {
      getList()
    }, 2000);
    return () => clearTimeout(handler);
    },[search])

    function UpdateStatus(id, status) {
       
        status = status === "DEACTIVE" ? "ACTIVE" : "DEACTIVE"
        patchApiCall('common/blog/changeStatus/' + id, {
            status: status,
        }).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getList();
            }
        });
    }

    const handleChange =(e)=>{
       setSearch(e)
    }

    function DeleteEvent(id) {
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
                        swal({text: response.meta.msg, icon: "success", timer: 1500})
                        getList();
                    }
                });
            } else {
                // swal("Your imaginary file is safe!");
            }
        });

    }
const actionRender = (item) => {
  const actions = [];

  // Enable / Disable based on status
  if (!permission?.moduleList?.updateDisabled) {
    if (item?.status === "DEACTIVE") {
      actions.push({
        type: "activate",
        label: "Activate",
        tooltip: "Activate Blog",
        icon: "fas fa-check",
        variant: "btn-success",
        onClick: () => UpdateStatus(item._id, item.status)
      });
    } else {
      actions.push({
        type: "deactivate",
        label: "Deactivate",
        tooltip: "Deactivate Blog",
        icon: "fas fa-exclamation-triangle",
        variant: "btn-info",
        onClick: () => UpdateStatus(item._id, item.status)
      });
    }
  }

  // Edit Action
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: "edit",
      label: "Edit",
      tooltip: "Edit Blog",
      icon: "far fa-edit",
      redirectUrl:
        "blogs/add?" +
        slugify(item.title, {
          replacement: "-",
          remove: /[*+~.()'"!:@]/g,
          lower: true,
          strict: true,
          trim: true,
        }),
      variant: "btn-primary",
    });
  }

  // View / Delete / Eye Icon (your logic says deleteDisabled? Then eye? → keeping same)
  if (!permission?.moduleList?.deleteDisabled) {
    actions.push({
      type: "delete",
      label: "Delete",
      tooltip: "Delete Blog",
      icon: "far fa-eye",
      variant: "btn-dark",
      onClick: () => DeleteEvent(item._id), // If you want true delete, replace here.
    });
  }

  return <CommonActionIcons actions={actions} />;
};

    const renderFilter = (forScreen) => (<>
    <div className='moduleList'>
        <div className={`form-group ${forScreen !== 'mobile' && 'd-none d-md-block'} input-height-40` }>
            <input type="text" className="w-100 form-control" name="searchKey"
                value={search} onChange={(e) => handleChange(e.target.value)}
                placeholder="Search By Blog Name"
            />
        </div>
        </div>
    </>)
     const headerButtons = () => {
        return (
            <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
                 {permission?.moduleList?.downloadDisabled ? null : (<>
                    <CustomButton
                                        label=""
                                        variant='danger'
                                        icon="bi-download"
                                        appendClass='text-white mx-1'
                                        onClick={exportToExcel}
                                    />
                </>)}
                {permission?.moduleList?.createDisabled ? null : (<>
                    <CustomButton
                                        label="Add"
                                        variant='danger'
                                        icon="bi-plus-lg"
                                        appendClass='text-white mx-1'
                                       to="/blogs/add"
                                    />
                </>)}
            </div>
        )
    }
      const exportToExcel = async () => {
    try {
      const response = await axios({
        url: Constant.apiBasePath + "common/blog/get-all-download",
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
      link.download = "Blogs.xlsx";
      document.body.appendChild(link);
      link.click();
      // Clean up the URL object when the download is complete
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };
    return (
        
        <>
            <div className="container-fluid">
            {permission.hasOwnProperty('moduleAccress') && !permission.moduleAccress ?
                    <div className="row text-center">
                        <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                            <div className="errer">
                                <img src="/program-error.png"/>
                                <h2>403</h2>
                                {/* <h4 className="text-danger">{permission.message}</h4> */}
                                <p>{permission.message}</p>

                            </div>
                        </div>
                    </div>
                    :
                    (Object.keys(permission).length > 0) ?
                <>
                <div className="main-title">
                  <FilterWithButtonsCard filters={renderFilter()} title={'Blogs'} headerButtons={headerButtons()}/>
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
                        >
                            <div style={{ width: '100%', marginRight: '10px' }}>
                              {renderFilter('mobile')}
                            </div>

                        </CardListMobile>
                    </div>
                <div className="card shadow mb-4 d-none d-md-block">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                <tr>
                                    <th>SNo.</th>
                                    <th>Title/Header</th>
                                    <th>Author</th>
                                    <th>Designation</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    {permission.moduleList.deleteDisabled && permission.moduleList.updateDisabled ? null : <th>Action</th> }
                                </tr>
                                </thead>

                                <tbody>
                                {
                                 lists &&  lists.map((item, index) => {
                                        return <tr key={index}>
                                            <td>{(index + 1) + ((pageNo - 1) * 10)}</td>
                                            <td>{item.title}</td>
                                            <td>{item.postBy}</td>
                                            <td>{item.designation}</td>
                                            <td>{shortText(item.description)}</td>
                                            <td >{item.status}</td>
                                            {permission.moduleList.deleteDisabled && permission.moduleList.updateDisabled ? null : <td style={{ whiteSpace: 'nowrap'}}>
                                               {actionRender(item)}
                                            </td> }
                                        </tr>

                                    })
                                }
                                </tbody>
                            </table>
                            <div className="justify-content-center mt-2">
                                <PaginationNew perPage={perPage} totalItems={totalItems}
                                               currentPage={pageNo}
                                               handler={pageChangeHandler}/>
                            </div>
                        </div>
                    </div>
                </div></> : null}


            </div>
        </>
    )
}

export default BlogListing
