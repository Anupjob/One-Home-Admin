import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";

import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import deleteApiCall from "../../Services/deleteApiCall";
import Constant from "../../Components/Constant";
import PaginationNew from "../../Widgets/PaginationNew";
import { shortText } from "../../Services/helpers";
import useGetRoleModule from '../../Services/useGetRoleModule';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CustomButton from '../../Utils/CustomButton';
var slugify = require('slugify');

const NotificationListing = () => {
    const history = useNavigate();
    const [lists, setLists] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(10);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState({})
    const [search, setSearch] = useState('')
    const [downloadButton, setDownloadButton] = useState(false)
    const [mobileResponseData, setMobileResponseData] = useState([])

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
        if (search != '') {
            response = await getApiCall('admin/notification-management/listNotifications', {
                page: pageNo,
                contentPerPage: perPage,
                searchKey: search
            });
        } else {
            response = await getApiCall('admin/notification-management/listNotifications', {
                page: pageNo,
                contentPerPage: perPage,
            });
        }

        setLists(response.data)
        const formattedData = response.data.map((item, index) => ({
                header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
                data: [
                    { label: "Name of Partner", value: item.partnerName },
                    { label: "Total no. of Notifiaction", value: item.totalNotifications },
                    { label: "Active Notifications", value: item.totalActiveNotifications || "-" },
                ],
                status: item.totalActiveNotifications, // card footer status
                footerId: item._id,
                url: ``,
                actionButtons: actionRender(item)
            }));
                setMobileResponseData(formattedData)
        // setTotalItems(response.total)
    }

    async function GetRole() {
        let Role = await useGetRoleModule("blogs");
        if (Role.moduleList.read === false) {
            setPermission({ moduleAccress: false, moduleList: {}, message: "Module Need Some Permission...Pls contact with Your Partner" })
        } else {
            setPermission(Role)
            getList();
        }

    }

    useEffect(() => {
        GetRole()
    }, []);

    //     useEffect(()=>{
    // getList()
    //     },[search])

    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');
        let status = e.currentTarget.getAttribute('status');
        status = status === "DEACTIVE" ? "ACTIVE" : "DEACTIVE"
        patchApiCall('common/blog/changeStatus/' + id, {
            status: status,
        }).then((response) => {
            if (response.meta.status) {
                swal({ text: response.meta.msg, icon: "success", timer: 1500 })
                // getList();
            }
        });
    }

    const handleChange = (e, screen) => {
        setSearch(e)
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
                        // getList();
                    }
                });
            } else {
                // swal("Your imaginary file is safe!");
            }
        });

    }

    const handleNavigate = (row) => {
        if (row) {
            const partnerId = row.partnerId;

            history({pathname: `/notification-settings/${partnerId}`});
        }
    }

     const actionRender = (item, forScreen) => (<>
         <span onClick={() => handleNavigate(item)}
             className="icon text-white-50 btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
             <span className="icon text-white-50">
                 <i class="fa fa-cog" style={{ color: '#fff', fontSize: '20px' }}></i>
             </span>
         </span>
  </>)
  
    const renderFilter = (forScreen) => (<>
        <div className='moduleList'>
            <div className="form-group">
                <input type="text" className="form-control" name="searchKey"
                    value={search} onChange={(e) => handleChange(e.target.value, forScreen)}
                    placeholder="Search ..."
                />
            </div>
        </div>
    </>)

     const headerButtons=()=>{
    return(
        <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
            <div className="position-relative">
                <CustomButton
                    label=""
                    icon="bi-download"
                    appendClass='bg-transparent'
                    iconAppendClass="me-2"
                    // onClick={downloadExcel}
                />
            </div>
        </div>
    )}

    return (

        <>
            <div className="container-fluid">
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
                    :
                    (Object.keys(permission).length > 0) ?
                        <>    <div className="main-title">
          <FilterWithButtonsCard title={'Nofication Management'} filters={renderFilter()} headerButtons={headerButtons()}/>
                </div>
                            <div className="main-title"><h3> </h3></div>
                            <div className="card shadow mb-4">
                                <div className="card-body">
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
                                    <div className="table-responsive d-none d-md-block">
                                        <table className="table table-bordered" width="100%" cellSpacing="0" >
                                            <thead>
                                                <tr>
                                                    <th align='center'>Sl. No.</th>
                                                    <th align='center'>Name of Partner</th>
                                                    <th align='center'>Total no. of Notifiaction</th>
                                                    <th align='center'>Active Notifications</th>
                                                    {permission.moduleList.deleteDisabled && permission.moduleList.updateDisabled ? null : <th>Action</th>}
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {
                                                    lists && lists.map((item, index) => {
                                                        return <tr key={index}>
                                                            <td align='center'>{(index + 1) + ((pageNo - 1) * 10)}</td>
                                                            <td align='center'>{item.partnerName}</td>
                                                            <td align='center'>{item.totalNotifications}</td>
                                                            <td align='center'>{item.totalActiveNotifications}</td>
                                                            {/* <td>{item.status}</td> */}
                                                            <td align='center'>
                                                                {actionRender(item)}
                                                            </td>
                                                        </tr>

                                                    })
                                                }
                                            </tbody>
                                        </table>
                                        <div className="justify-content-center mt-2">
                                            <PaginationNew perPage={perPage} totalItems={totalItems}
                                                currentPage={pageNo}
                                                handler={pageChangeHandler} />
                                        </div>
                                    </div>
                                </div>
                            </div></> : null}


            </div>
        </>
    )
}

export default NotificationListing
