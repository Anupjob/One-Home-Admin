import React, {useCallback, useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import Layout from "../../Layout";
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import deleteApiCall from "../../Services/deleteApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';
import Constant from "../../Components/Constant";
import PaginationNew from "../../Widgets/PaginationNew";
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CommonActionIcons from '../../Utils/CommonActionIcons';

const CategoryListing = () => {
    const [lists, setLists] = useState([]);
    const [permission, setPermission] = useState({})
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    // const [perPage, setPerPage] = useState(Constant.perPage);
    const [perPage, setPerPage] = useState(10);
    const [isLoaded, setIsLoaded] = useState(true);
    const [mobileResponseData, setMobileResponseData] = useState([])

    function pageChangeHandler(page) {
        // if (isLoaded) {
        setPageNo(page);
        // getList()
        // }
    }

    useEffect(() => {
        getList()
    }, [pageNo]);


    async function getList() {
        let response = await getApiCall('common/category/get-all', {
            pageNo: pageNo,
            contentPerPage: perPage,
        });
        setLists(response.data)
        setTotalItems(response.total)
        const formattedData = response.data.map((item, index) => ({
            header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
            data: [
                { label: "Name", value: item.title },
                { label: "Status", value: item.status },
            ],
            status: item.status, // card footer status
            footerId: item._id,
            url: ``,
            actionButtons: actionRender(item)
        }));
        setMobileResponseData(formattedData)
        setIsLoaded(true);
    }

    async function GetRole() {
        let Role = await useGetRoleModule("Property Images Category");
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


    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');
        let status = e.currentTarget.getAttribute('status');
        status = status == "DEACTIVE" ? "active" : "deactive"
        patchApiCall('common/category/changeStatus/' + id, {
            status: status,
        }).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getList();
            }
        });
    }

    function Delete(e) {
        let id = e.currentTarget.getAttribute('value');
        deleteApiCall('common/category/delete/' + id, {}).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getList();
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
    //         <Link to={"categories/add?id=" + item._id}
    //             className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
    //             <span className="icon text-white-50">
    //                 <i className="far fa-edit"></i>
    //             </span>
    //             <span className="text">Edit</span>
    //         </Link>}

    //     {permission?.moduleList?.deleteDisabled ? null :
    //         <button onClick={Delete} value={item._id}
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
    actions.push({
      type: item.status === "DEACTIVE" ? "deactivate" : "activate",
      tooltip: item.status === "DEACTIVE" ? "Disable" : "Enable",
      icon: item.status === "DEACTIVE" ? "fas fa-exclamation-triangle" : "fas fa-check",
      variant: item.status === "DEACTIVE" ? "btn-info" : "btn-success",
      onClick: () =>
        UpdateStatus({
          value: item._id,
          status: item.status,
          isDeleted: item.isDeleted,
        }),
    });
  }

  // Edit action
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: "edit",
      tooltip: "Edit",
      icon: "far fa-edit",
      variant: "btn-primary",
      redirectUrl: `/categories/add?id=${item._id}`,
    });
  }

  // Delete action
  if (!permission?.moduleList?.deleteDisabled) {
    actions.push({
      type: "delete",
      tooltip: "Delete",
      icon: "far fa-eye",
      variant: "btn-danger",
      onClick: () => Delete(item._id),
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
                                <Link to="/categories/add"
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
                    {/* <h3>Categories Management</h3> */}
                    <FilterWithButtonsCard filters={renderFilter()} title={'Categories Management'} headerButtons={headerButtons()}/>

                </div>

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
                    : (Object.keys(permission).length > 0) ?
                    <>
                        {/* <div className="d-sm-flex align-items-center justify-content-end mb-4">
                            {permission.moduleList.createDisabled ? null :
                                <Link to="/categories/add"
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
                            handleFilter={getList}
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
                                            <th>Name</th>
                                            <th>Status</th>
                                            {/*<th>Type</th>*/}
                                            {/*<th>Icon</th>*/}
                                            {permission.moduleList.deleteDisabled && permission?.moduleList?.updateDisabled ? null :
                                                <th className='width25'>Action</th>}
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {
                                            lists.map((item, index) => {
                                                return <tr key={index}>
                                                    <td>{(index + 1)+((pageNo-1)*10)}</td>
                                                    <td>{item.title}</td>
                                                    <td>{item.status}</td>
                                                    {/*<td>{item.type == 1 ? 'Residential' : 'Commercial' }</td>*/}
                                                    {/*<td><img src={item.icon} width={50} height={50} alt=""/></td>*/}
                                                    <td>
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
                                                       handler={pageChangeHandler}/>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </> : ''}


            </div>
        </>
    )
}

export default CategoryListing
