import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import '../../css/style.css';
import Layout from "../../Layout";
import getApiCall from "../../Services/getApiCall";
import postApiCall from "../../Services/postApiCall";
import swal from "sweetalert";
import Constant from "../Constant";
import PaginationNew from "../../Widgets/PaginationNew";
import useGetRoleModule from '../../Services/useGetRoleModule';
import {blobUrl} from "../../Services/helpers";
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CommonActionIcons from '../../Utils/CommonActionIcons';


const AmenitiesManagement = () => {
    const [lists, setLists] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState({})
    const [mobileResponseData, setMobileResponseData] = useState([])

    function pageChangeHandler(page) {
        setPageNo(page);

    }

   

    async function GetRole() {
        let Role = await useGetRoleModule("amenities");
        if (Role.moduleAccress) {
            setPermission(Role)
            getData();
        }else{
            setPermission(Role)
        }

    }

    async function getData() {
        getApiCall('common/amenity/get-all', {
            page: pageNo,
            contentPerPage: perPage,
        })
            .then((response) => {
                setLists(response.data)
                setTotalItems(response.total)
                setIsLoaded(true);
                const formattedData = response.data.map((item, index) => ({
                    header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
                    data: [
                        { label: "Amenity Name", value: item.name },
                        { label: "Image", value: blobUrl(item.amenityImg), isImage: true },
                    ],
                    status: '', // card footer status
                    footerId: item._id,
                    url: ``,
                    actionButtons: actionRender(item)
                }));
                setMobileResponseData(formattedData)
            })
    }

    useEffect(() => {
        getData();
        GetRole();
    }, [pageNo]);

    // useEffect(() => {
    //     GetRole();

    // }, []);


    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');

        let status = e.currentTarget.getAttribute('status');
        let isDeleted = e.currentTarget.getAttribute('isDeleted');


        status = status == "DEACTIVE" ? "active" : "deactive"
        isDeleted = isDeleted == 0 ? 0 : 1;
        if (isDeleted) {
            // eslint-disable-next-line no-restricted-globals
            if (!confirm('Are you sure you want to delete ?')) return
        } else {
            // eslint-disable-next-line no-restricted-globals
            if (!confirm('Are you sure you  want to change status ?')) return
        }
        postApiCall('common/amenity/status', {
            amenityId: id,
            status: status,
            isDeleted: isDeleted
        }).then((response) => {
            if (response.meta.status) {
                //auto close swal
                swal({text: response.meta.msg, icon: "success", timer: 700})

                getData();
            }
        });
    }

    // const actionRender = (item, forScreen) => (<>
    //     {permission?.moduleList?.updateDisabled ? null :
    //         item.status == "DEACTIVE" ?
    //             <button
    //                 onClick={UpdateStatus} value={item._id}
    //                 isDeleted={item.isDeleted}
    //                 status={item.status}
    //                 className="btn btn-info btn-icon-split btn-sm  mb-1 mr-1"><span
    //                     className="icon text-white-50"><i
    //                         className="fas fa-exclamation-triangle"></i></span>
    //                 <span className="text">Disable</span>
    //             </button>
    //             :
    //             <button
    //                 className="btn btn-success btn-icon-split btn-sm mb-1 mr-1"
    //                 onClick={UpdateStatus} value={item._id}
    //                 isDeleted={item.isDeleted}
    //                 status={item.status}
    //             >
    //                 <span className="icon text-white-50"><i
    //                     className="fas fa-check"></i></span>
    //                 <span className="text">Enable</span>
    //             </button>
    //     }

    //     {permission?.moduleList?.updateDisabled ? null :
    //         <Link to={"/amenities/add?id=" + item._id}
    //             className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
    //             <span className="icon text-white-50">
    //                 <i className="far fa-edit"></i>
    //             </span>
    //             <span className="text">Edit</span>
    //         </Link>}

    //     {permission?.moduleList?.deleteDisabled ? null :
    //         <button onClick={UpdateStatus} value={item._id}
    //             isDeleted={1}
    //             className="btn btn-danger btn-icon-split btn-sm mb-1">
    //             <span className="icon text-white-50">
    //                 <i className="far fa-eye"></i>
    //             </span>
    //             <span className="text">Delete</span>
    //         </button>}
    // </>)
    const actionRender = (item) => {
  const actions = [];

  // Enable / Disable action
  if (!permission?.moduleList?.updateDisabled) {
    if (item.status === "DEACTIVE") {
      actions.push({
        type: "deactivate",
        tooltip: "Disable",
        icon: "fas fa-exclamation-triangle",
        variant: "btn-info",
        onClick: () =>
          UpdateStatus({
            value: item._id,
            status: item.status,
            isDeleted: item.isDeleted,
          }),
      });
    } else {
      actions.push({
        type: "activate",
        tooltip: "Enable",
        icon: "fas fa-check",
        variant: "btn-success",
        onClick: () =>
          UpdateStatus({
            value: item._id,
            status: item.status,
            isDeleted: item.isDeleted,
          }),
      });
    }
  }

  // Edit action
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: "edit",
      tooltip: "Edit",
      icon: "far fa-edit",
      variant: "btn-primary",
      redirectUrl: `/amenities/add?id=${item._id}`,
    });
  }

  // Delete action
  if (!permission?.moduleList?.deleteDisabled) {
    actions.push({
      type: "delete",
      tooltip: "Delete",
      icon: "far fa-eye",
      variant: "btn-danger",
      onClick: () =>
        UpdateStatus({
          value: item._id,
          isDeleted: 1,
        }),
    });
  }

  return <CommonActionIcons actions={actions} />;
};


     const headerButtons = () => {
         if (Object.keys(permission).length > 0) {
            return (
                <>
                    <div className="d-sm-flex align-items-center justify-content-end mb-4">
                        {permission.moduleList.createDisabled ? null :
                            <Link to="/amenities/add"
                                className="d-sm-inline-block btn btn-sm btn-warning shadow-sm">
                                Add New
                            </Link>}
                    </div>
                </>
            )
        }
   
  }

    const renderFilter = () => {
        return (
      <>
      
      </>
    )
   
  }

    return (

        <>
            <div className="container-fluid">
                <div className="main-title">
                    {/* <h3> Amenities Management</h3> */}
                    <FilterWithButtonsCard filters={renderFilter()} title={'Amenities Management'} headerButtons={headerButtons()}/>

                </div>
                {permission.hasOwnProperty('moduleAccress') && !permission.moduleAccress ?
                   <div className="row text-center">
                   <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                     <div className="errer">
                       <img src="/program-error.png" />
                       <h2>403</h2>
                       <p>{permission.message}</p>
                     </div>
                   </div>
                 </div>
                    : (Object.keys(permission).length > 0) ?
                    <>
                        {/* <div className="d-sm-flex align-items-center justify-content-end mb-4">
                            {permission.moduleList.createDisabled ? null :
                                <Link to="/amenities/add"
                                      className="d-sm-inline-block btn btn-sm btn-warning shadow-sm">
                                    Add New
                                </Link>}
                        </div> */}
                            <div className="d-block d-md-none">
                                <CardListMobile
                                    dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                    perPage={perPage}
                                    totalItems={totalItems}
                                    currentPage={pageNo}
                                    pageChangeHandler={pageChangeHandler}
                                    handleFilter={getData}
                                    isAction={true}
                                >
                                    {/* <div style={{ width: '100%', marginRight: '10px' }}>
                              {renderFilter('mobile')}
                            </div> */}

                                </CardListMobile>
                            </div>
                        <div className="card shadow mb-4 d-none d-md-block">
                            <div className="card-body">

                                <div className="table-responsive">
                                    <table className="table table-bordered" width="100%" cellSpacing="0">
                                        <thead>
                                        <tr>
                                            <th className='width5'>Sl. No.</th>
                                            <th>Amenity Name</th>
                                            <th>Image</th>
                                            {permission.moduleList.deleteDisabled && permission?.moduleList?.updateDisabled ? null :
                                                <th className='width25'>Action</th>}
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {
                                            lists.map((item, index) => {
                                                return <tr key={index}>
                                                    <td>{(index + 1) + ((pageNo - 1) * 10)}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.amenityImg ?
                                                        <img src={blobUrl(item.amenityImg)} width={50} height={50}
                                                             alt=""/> : 'NO Image'} </td>
                                                    <td>
                                                        {actionRender(item)}
                                                    </td>
                                                </tr>

                                            })
                                        }

                                        <div className="justify-content-center mt-2">
                                            <PaginationNew perPage={perPage} totalItems={totalItems}
                                                           currentPage={pageNo}
                                                           handler={pageChangeHandler}/>
                                        </div>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </> : ''}


            </div>
        </>
    )
}

export default AmenitiesManagement
