import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import Constant from "../../Components/Constant";
import PaginationNew from "../../Widgets/PaginationNew";
import {shortText} from "../../Services/helpers";
import useGetRoleModule from '../../Services/useGetRoleModule';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import CustomButton from '../../Utils/CustomButton';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CommonActionIcons from '../../Utils/CommonActionIcons';

const CmsListing = () => {
    const [lists, setLists] = useState([]);

    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState({})
    const [mobileResponseData, setMobileResponseData] = useState()


    function pageChangeHandler(page) {
        if (isLoaded) {
            setPageNo(page);
            getList()
        }
    }

    function getList() {
        getApiCall('common/static/page/list', {
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
                        { label: "Title", value: item.title },
                        { label: "URL", value: item.url },
                        { label: "Description", value: shortText(item.description) },
                        { label: "Status", value: item.status },
                    ],
                    status: '', // card footer status
                    footerId: item._id,
                    url: ``,
                    actionButtons: actionRender(item)
                }));
                setMobileResponseData(formattedData)
            })
        // console.log('response', response)
    }

   
    async function GetRole() {
        let Role = await useGetRoleModule("Website Content");
        if(Role.moduleList.read === false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            setPermission(Role)
            getList()
        }
        
    }

    useEffect(() => {
        GetRole()
    }, []);


    function UpdateStatus(id, isDeleted, status) {
        status = status === "DEACTIVE" ? "ACTIVE" : "DEACTIVE"
        if (isDeleted){ status = "DELETE"}
        patchApiCall('common/static/page/changeStatus', {
            'pageId': id,
            status: status,
            // isDeleted: isDeleted
        }).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getList();
            }
        });
    }

    // const actionRender = (item, forScreen) => (<>
    //     {permission?.moduleList?.updateDisabled ? null : item.status == "DEACTIVE" ?
    //         <button
    //             onClick={UpdateStatus} value={item.pageId}
    //             isDeleted={item.isDeleted} status={item.status}
    //             className="btn btn-info btn-icon-split btn-sm  mb-1 mr-1"><span
    //                 className="icon text-white-50"><i
    //                     className="fas fa-exclamation-triangle"></i></span>
    //             <span className="text">Disable</span>
    //         </button>
    //         :
    //         <button className="btn btn-success btn-icon-split btn-sm mb-1 mr-1"
    //             onClick={UpdateStatus} value={item.pageId}
    //             isDeleted={item.isDeleted}
    //             status={item.status}
    //         >
    //             <span className="icon text-white-50"><i
    //                 className="fas fa-check"></i></span>
    //             <span className="text">Enable</span>
    //         </button>
    //     }

    //     {permission?.moduleList?.updateDisabled ? null :
    //         <Link to={"cms/add?id=" + item.pageId}
    //             className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
    //             <span className="icon text-white-50">
    //                 <i className="far fa-edit"></i>
    //             </span>
    //             <span className="text">Edit</span>
    //         </Link>}
    //     {permission.moduleList?.deleteDisabled ? null :
    //         <button onClick={UpdateStatus} value={item.pageId} isDeleted={1}
    //             className="btn btn-danger btn-icon-split btn-sm mb-1">
    //             <span className="icon text-white-50">
    //                 <i className="far fa-eye"></i>
    //             </span>
    //             <span className="text">Delete</span>
    //         </button>}
    //  </>)
    const actionRender = (item) => {
  const isDeActive = item.status === "DEACTIVE";
  const actions = [];

  // Enable / Disable
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: isDeActive ? "deactivate" : "activate",
      tooltip: isDeActive ? "Disable" : "Enable",
      variant: isDeActive ? "btn-info" : "btn-success",
      icon: isDeActive ? "fas fa-exclamation-triangle" : "fas fa-check",
      onClick: () =>UpdateStatus(
         item.pageId,
          0,
         item.status,
        ),
    });
  }

  // Edit
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: "edit",
      tooltip: "Edit CMS",
      icon: "far fa-edit",
      variant: "btn-primary",
      redirectUrl: `cms/add?id=${item.pageId}`,
    });
  }

  // Delete
  if (!permission?.moduleList?.deleteDisabled) {
    actions.push({
      type: "delete",
      tooltip: "Delete CMS",
      icon: "fa fa-trash",
      variant: "btn-danger",
      onClick: () =>
        UpdateStatus(item.pageId,
          1,
        ),
    });
  }

  return <CommonActionIcons actions={actions} />;
};

    const headerButtons = () => {
        return (
            <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
                {permission?.moduleList?.createDisabled ? null : (<>
                    <CustomButton
                                        label="Add"
                                        variant='danger'
                                        icon="bi-plus-lg"
                                        appendClass='text-white mx-1'
                                        to="/cms/add"
                                    />
                </>)}
            </div>
        )
    }
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
                  <FilterWithButtonsCard  title={'Website Content'} headerButtons={headerButtons()}/>
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
                       />

                       
                    </div>
                <div className="card shadow mb-4 d-none d-md-block">
                    <div className="card-body">

                        <div className="table-responsive">
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                <tr>
                                    <th>Sl. No.</th>
                                    <th>Title</th>
                                    <th>URL</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    {permission?.moduleList?.deleteDisabled && permission?.moduleList?.updateDisabled ? null : <th>Action</th> }
                                </tr>
                                </thead>

                                <tbody>
                                {
                                    lists.map((item, index) => {
                                        return <tr key={index}>
                                            <td>{(index + 1)+((pageNo-1)*10)}</td>
                                            <td>{item.title}</td>
                                            <td>{item.url}</td>
                                            <td>{shortText(item.description)}</td>

                                            <td>{item.status}</td>
                                            {permission?.moduleList?.deleteDisabled && permission?.moduleList?.updateDisabled ? null :<td>
                                               {actionRender(item)}
                                            </td>}
                                        </tr>

                                    })
                                }
                                <div className="justify-content-center mt-2">
                                    <PaginationNew perPage={perPage} totalItems={totalItems} currentPage={pageNo}
                                                   handler={pageChangeHandler}/>
                                </div>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                 </> : null}

            </div>
        </>
    )
}

export default CmsListing
