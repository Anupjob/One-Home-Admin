import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";

import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import postApiCall from '../../Services/postApiCall';
import deleteApiCall from "../../Services/deleteApiCall";
import Constant from "../../Components/Constant";
import PaginationNew from "../../Widgets/PaginationNew";
import { shortText } from "../../Services/helpers";
import useGetRoleModule from '../../Services/useGetRoleModule';
var slugify = require('slugify');

const NotificationSetting = () => {
    const history = useNavigate();
    const parms = useParams();
    const {partnerId} = parms
    console.log('partnerId::::::',partnerId)
    const [lists, setLists] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState({})
    const [search, setSearch] = useState('')
    const [downloadButton, setDownloadButton] = useState(false)

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
            response = await getApiCall(`admin/notification-management/listPartnerNotifications?partnerId=${partnerId}`, {
                page: pageNo,
                contentPerPage: perPage,
                searchKey: search
            });
        } else {
            response = await getApiCall(`admin/notification-management/listPartnerNotifications?partnerId=${partnerId}`, {
                page: pageNo,
                contentPerPage: perPage,
            });
        }

        setLists(response.data)
        setTotalItems(response.total)
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

    useEffect(() => {
      getList()
    }, [search])

    function UpdateStatus(id, status) {
        postApiCall('admin/notification-management/deactivateNotification', {
            notificationId:id,
            updatedStatus:status === 0 ? 1 : 0
        }).then((response) => {
            if (response.meta.status) {
                swal({ text: response.meta.msg, icon: "success", timer: 1500 })
                getList();
            }
        });
    }

    const handleChange = (e) => {
        setSearch(e)
    }

    const handleNavigate= (notificationTemplateId)=>{
        if (notificationTemplateId) {
            history({
              pathname: `/create-update-notification`,
              state: {
                notificationTemplateId: notificationTemplateId,
                partnerId:partnerId
              }
            });
          }
          else{
            history({
              pathname: `/create-update-notification`,
              state: {
                partnerId:partnerId
              }
            });
          }
    }

    const formatTitle = (camelCase) => {
        return camelCase
          .replace(/([A-Z])/g, ' $1')         // insert space before capital letters
          .replace(/^./, str => str.toUpperCase()); // capitalize first letter
      };
      const getSignedFrequency = (type, frequency) => {
        const value =Number(frequency);
        if (type === 'pre') return -value;
        if (type === 'post') return +value;
        return value; // default case, if needed
      };
    
    return (

        <>
            <div className="container-fluid">
                {!permission.hasOwnProperty('moduleAccress') && permission.moduleAccress ?
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
                        <>
                            <div className="main-title"><h3> Notification Settings</h3></div>

                            <div className="card shadow mb-4">
                                <div className="card-body">
                                    <div className='row'>
                                        <div className="col-xs-12 col-md-3 col-lg-3">
                                            <div className="form-group">
                                                <input type="text" className="form-control" name="searchKey"
                                                    value={search} onChange={(e) => handleChange(e.target.value)}
                                                    placeholder="Search ..."
                                                />
                                            </div>
                                        </div>
                                        {permission.moduleList.createDisabled ? null :
                                        <div className="col-xs-12 col-md-7 col-lg-7 d-sm-flex align-items-center justify-content-end" onClick={()=>handleNavigate(null)}>
                                           <span className='d-sm-inline-block btn btn-sm btn-warning shadow-sm'>
                                                Create Notification
                                            </span>
                                        </div>
                                        }
                                        <div className="col-xs-12 col-md-2 col-lg-2 d-sm-flex align-items-center justify-content-end ">

                                            <button className="btn download listclass" style={{ border: '1px outset #000' }} disabled>
                                                {
                                                    downloadButton ?
                                                        <img src="../../assets/images/download_icon_white.png" className='mb-1' />
                                                        :
                                                        <img src="../../assets/images/download_Icon.jpg" className='mb-1' />
                                                }

                                                Download Excel</button>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-bordered" width="100%" cellSpacing="0">
                                            <thead>
                                                <tr>
                                                    <th align='center'>Sl. No.</th>
                                                    <th align='center'>Notification ID</th>
                                                    <th align='center'>Notification Name</th>
                                                    <th align='center'>Trigger</th>
                                                    <th align='center'>Frequency</th>
                                                    {permission.moduleList.deleteDisabled && permission.moduleList.updateDisabled ? null : <th>Action</th>}
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {
                                                    lists && lists.map((item, index) => {
                                                        return <tr key={index}>
                                                            <td align='center'>{(index + 1) + ((pageNo - 1) * 10)}</td>
                                                            <td align='center'>{item._id}</td>
                                                            <td align='center'>{item.notificationTitle}</td>
                                                            <td align='center'>{item.notificationTriggerEventName?formatTitle(item.notificationTriggerEventName):'-'}</td>
                                                            <td align='center'>{getSignedFrequency(item.notificationFrequencyType, item.notificationFrequency)}</td>
                                                            {/* <td>{item.status}</td> */}
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <button
                                                                        onClick={()=>UpdateStatus(item._id, item.notificationStatus)} value={item._id}
                                                                        status={item.notificationStatus}
                                                                        className={`btn ${item.notificationStatus?'btn btn-success':'btn-info'} btn-icon-split btn-sm  mb-1 mr-1`}><span
                                                                            className="icon text-white-50"><i
                                                                                className="fas fa-exclamation-triangle"></i></span>
                                                                        <span className="text">{item.notificationStatus?'Active':'Deactive'}</span>
                                                                    </button>
                                                                    <button onClick={()=>handleNavigate(item.notificationTemplateId)}
                                                                        className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
                                                                        <span className="icon text-white-50">
                                                                            <i className="far fa-edit"></i>
                                                                        </span>
                                                                        <span className="text">Edit</span>
                                                                    </button>
                                                                </div>
                                                                {/* <span className="text">Disable</span> */}
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

export default NotificationSetting
