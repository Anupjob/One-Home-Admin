import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import postApiCall from "../../Services/postApiCall";
import swal from "sweetalert";
import deleteApiCall from "../../Services/deleteApiCall";
import Constant from "../../Components/Constant";
import PaginationNew from "../../Widgets/PaginationNew";
import useGetRoleModule from '../../Services/useGetRoleModule';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CommonActionIcons from '../../Utils/CommonActionIcons';
import CustomButton from '../../Utils/CustomButton';


const FaqsCategoryListing = () => {
    const [lists, setLists] = useState([]);
    const [filterForm, setFilterForm] = useState({
        status: '',
        searchKey: '',
        'type': '',
    });
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

    async function getList() {
        let response = await getApiCall('common/faq/category/list', {
            ...filterForm,
            page: pageNo,
            contentPerPage: perPage,
        });
        if(response.meta.status == true) {
            setLists(response.data != undefined ? response.data : [])
             const formattedData = response.data.map((item, index) => ({
            header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
            data: [
                { label: "Name", value: item.categoryName },
                { label: "Status", value: item.status },
            ],
            status: item.status, // card footer status
            footerId: item._id,
            url: ``,
            actionButtons: actionRender(item)
        }));
            setMobileResponseData(formattedData)
        }
        else setLists([])
    }

    async function GetRole() {
        let Role = await useGetRoleModule("FAQ Categories");
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


    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');
        let status = e.currentTarget.getAttribute('status');
        let isDeleted = e.currentTarget.getAttribute('isDeleted');
        console.log('status', status)
        status = status === "DEACTIVE" ? "active" : "deactive"
        postApiCall('common/faq/category/status', {
            categoryId: id,
            status: status,
        }).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getList();
            }
        });
    }

    function deleteEvent(e) {
        let id = e.currentTarget.getAttribute('value');
        if (!id) return;
        deleteApiCall('common/faq/category/delete/' + id, {}).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getList();
            }
        });
    }

    const onChangeFilter = (e) => {
        if (!e.target.name) return
        setFilterForm({
            ...filterForm,
            [e.target.name]: e.target.value
        })
    }
    const submitFilter = (e) => {
        e.preventDefault();
        getList()
    }

    //  const actionRender = (item, forScreen) => (<>
    //      {permission?.moduleList?.updateDisabled ? null : item.status == "DEACTIVE" ?
    //          <button
    //              onClick={UpdateStatus} value={item.categoryId}
    //              isDeleted={item.isDeleted}
    //              status={item.status}

    //              className="btn btn-info btn-icon-split btn-sm  mb-1 mr-1"><span
    //                  className="icon text-white-50"><i
    //                      className="fas fa-exclamation-triangle"></i></span>
    //          </button>
    //          :
    //          <button className="btn btn-success btn-icon-split btn-sm mb-1 mr-1"
    //              onClick={UpdateStatus} value={item.categoryId}
    //              isDeleted={item.isDeleted}
    //              status={item.status}
    //          >
    //              <span className="icon text-white-50"><i
    //                  className="fas fa-check"></i></span>
    //          </button>
    //      }
    //      {permission?.moduleList?.updateDisabled ? null :
    //          <Link to={"/faqs/categories/add?id=" + item.categoryId}
    //              className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
    //              <span className="icon text-white-50">
    //                  <i className="far fa-edit"></i>
    //              </span>
    //          </Link>}
    //      {permission?.moduleList?.deleteDisabled ? null :
    //          <button onClick={deleteEvent} value={item.categoryId}
    //              className="btn btn-danger btn-icon-split btn-sm mb-1">
    //              <span className="icon text-white-50">
    //                  <i className="fa fa-trash"></i>
    //              </span>
    //          </button>}
    //      </>)
    const actionRender = (item) => {
  const actions = [];

  // Enable / Disable
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: item.status === "DEACTIVE" ? "deactivate" : "activate",
      tooltip: item.status === "DEACTIVE" ? "Disable" : "Enable",
      icon: item.status === "DEACTIVE" ? "fas fa-exclamation-triangle" : "fas fa-check",
      variant: item.status === "DEACTIVE" ? "btn-info" : "btn-success",
      onClick: () => UpdateStatus({ value: item.categoryId, status: item.status }),
    });
  }

  // Edit
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: "edit",
      tooltip: "Edit",
      icon: "far fa-edit",
      variant: "btn-primary",
      redirectUrl: `/faqs/categories/add?id=${item.categoryId}`,
    });
  }

  // Delete
  if (!permission?.moduleList?.deleteDisabled) {
    actions.push({
      type: "delete",
      tooltip: "Delete",
      icon: "fa fa-trash",
      variant: "btn-danger",
      onClick: () => deleteEvent(item.categoryId),
    });
  }

  return <CommonActionIcons actions={actions} />;
};

    const renderFilter = (forScreen) => (<>
        <div className="moduleList">
            <div className="form-group">
                <input type="text" className="form-control" name="searchKey"
                    value={filterForm.searchKey}
                    onChange={onChangeFilter}
                    placeholder='Search....'
                />
            </div>
            <div className="form-group">
                <select className="form-control" name="status" value={filterForm.status}
                    onChange={onChangeFilter}
                >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="deactivate">Deactivate</option>
                </select>
            </div>
            <div className="form-group d-none d-md-block">
            <CustomButton
              label="Apply"
              variant='danger'

              appendClass='text-white'
              onClick={submitFilter}
            />
            </div>
        </div>
    </>)

     const headerButtons = () => {
        return(
            <>
            {permission?.moduleList?.createDisabled ? null :
                    <CustomButton
                        label="Add"
                        variant='danger'
                        icon="bi-plus-lg"
                        appendClass='text-white mx-1'
                        to={`/faqs/categories/add`}
                    />
                }
            </>
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
            {/* <h3>FAQs Categories</h3> */}
                    <FilterWithButtonsCard filters={renderFilter()} title={'FAQs Categories'} headerButtons={headerButtons()}/>
                </div>
                
                            <div className="d-block d-md-none">
                                <CardListMobile
                                    dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                    perPage={perPage}
                                    totalItems={totalItems}
                                    currentPage={pageNo}
                                    pageChangeHandler={pageChangeHandler}
                                    handleFilter={submitFilter}
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
                                    <th className='width5'>Sl. No.</th>
                                    <th>Name</th>
                                    {/*<th>Type</th>*/}
                                    <th>Status</th>
                                    {permission.moduleList.deleteDisabled && permission?.moduleList?.updateDisabled ? null : <th className='width25'>Action</th>}
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    lists.map((item, index) => {
                                        return <tr key={index}>
                                            <td>{(index + 1)+((pageNo-1)*10)}</td>
                                            <td>{item.categoryName}</td>
                                            {/*<td>{item.type}</td>*/}
                                            <td>{item.status}</td>
                                            {permission.moduleList.deleteDisabled && permission?.moduleList?.updateDisabled ? null : <td>
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
                </div></> : null }


            </div>
        </>
    )
}

export default FaqsCategoryListing
