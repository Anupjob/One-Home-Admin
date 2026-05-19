import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import Layout from "../../Layout";
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import Constant from "../../Components/Constant";
import PaginationNew from "../../Widgets/PaginationNew";
import useGetRoleModule from '../../Services/useGetRoleModule';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import { blobUrl } from '../../Services/helpers';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CommonActionIcons from '../../Utils/CommonActionIcons';

const PropertyTypeListing = () => {
    const [lists, setLists] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState({})
    const [mobileResponseData, setMobileResponseData] = useState([])


    function pageChangeHandler(page) {
        if (isLoaded) {
            setPageNo(page);
        }
    }

    useEffect(() => {
        if (isLoaded) {
            getData()
        }
    }, [pageNo])

    async function getData() {
        getApiCall('common/property-type/get-all', {
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
                { label: "Name", value: item.name },
                { label: "Type", value: item.type == 1 ? 'Residential' : 'Commercial' },
                { label: "Icon", value: blobUrl(item.icon), isImage:true },
                { label: "Status", value: item.status ? 'Active' : 'Inactive' },
            ],
            status: item.status ? 'Active' : 'Inactive', // card footer status
            footerId: item._id,
            url: ``,
            actionButtons: actionRender(item)
        }));
        setMobileResponseData(formattedData)
            })
            .catch((error) => {
                setIsLoaded(true);
            })
    }

    async function GetRole() {
        let Role = await useGetRoleModule("Property Type");
        if(Role.moduleList.read === false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            setPermission(Role)
            getData();
        }
        
    }

    useEffect(() => {
        GetRole();
    }, []);


    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');
        let status = e.currentTarget.getAttribute('status');
        let isDeleted = e.currentTarget.getAttribute('isDeleted');
        let obj = {}
        status = status != 1 ? "active" : "deactive"
        obj.status = status;
        if (isDeleted) obj.isDeleted = isDeleted;
        // console.log('status', obj)
        patchApiCall('common/property-type/change-status/' + id, obj).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getData();
            }
        });
    }

    // const actionRender = (item, forScreen) => (<>
    //     {permission?.moduleList?.updateDisabled ? null :
    //         item.status === 1 ?
    //             <button
    //                 onClick={UpdateStatus} value={item._id}
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
    //                 status={item.status}
    //             >
    //                 <span className="icon text-white-50"><i
    //                     className="fas fa-check"></i></span>
    //                 <span className="text">Enable</span>
    //             </button>
    //     }

    //     {permission.moduleList.deleteDisabled ? null :
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

  // Enable / Disable button
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: item.status === 1 ? "deactivate" : "activate",
      tooltip: item.status === 1 ? "Disable" : "Enable",
      icon: item.status === 1 ? "fas fa-exclamation-triangle" : "fas fa-check",
      variant: item.status === 1 ? "btn-info" : "btn-success",
      onClick: () =>
        UpdateStatus({
          value: item._id,
          status: item.status,
        }),
    });
  }

  // Delete button
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
                                <Link to="/property-types/add"
                                      className="d-sm-inline-block btn btn-sm btn-warning shadow-sm">
                                    Add New
                                </Link>}
                        </div>
                      </>
                  )
              }
  }

    return (
        <>
            <div className="container-fluid">
            <div className="main-title">
                    <FilterWithButtonsCard title={'Property Type Management'} headerButtons={headerButtons()}/>
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
                    : (Object.keys(permission).length > 0) ? <>
                        {/* <div className="d-sm-flex align-items-center justify-content-end mb-4">
                            {permission.moduleList.createDisabled ? null :
                                <Link to="/property-types/add"
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
                        </CardListMobile>
                    </div>
                        <div className="card shadow mb-4 d-none d-md-block">
                            <div className="card-body">

                                <div className="table-responsive">
                                    <table className="table table-bordered" width="100%" cellSpacing="0">
                                        <thead>
                                        <tr>
                                            <th>Sl. No.</th>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Icon</th>
                                            <th>Status</th>
                                            {permission.moduleList.deleteDisabled && permission.moduleList.updateDisabled ? null :
                                                <th className='width25'>Action</th>}
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {
                                            lists.map((item, index) => {
                                                return <tr key={index}>
                                                    <td>{(index + 1) + ((pageNo - 1) * 10)}</td>
                                                    <td>{item.name} </td>
                                                    <td>{item.type == 1 ? 'Residential' : 'Commercial'}</td>
                                                    <td><img src={item.icon} width={50} height={50} alt=""/></td>
                                                    <td>{item.status ? 'Active' : 'Inactive'}</td>
                                                    {permission.moduleList.updateDisabled ? null :  <td>
                                                        
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
                        </div>
                    </> : ''}
            </div>
        </>
    )
}

export default PropertyTypeListing
