import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import postApiCall from "../../Services/postApiCall";
import swal from "sweetalert";

import deleteApiCall from "../../Services/deleteApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CustomButton from '../../Utils/CustomButton';

const BlogCategoryListing = () => {
    const [lists, setLists] = useState([]);
    const [filterForm, setFilterForm] = useState({
        status: '',
        searchKey: '',
        'type': '',
    });
    const [permission, setPermission] = useState({})
     const [mobileResponseData, setMobileResponseData] = useState()

    async function getEmenities() {
        let response = await getApiCall('common/blog/category/list', filterForm);
        if(response.meta.status == true) {
            setLists(response.data != undefined ? response.data : [])
            const formattedData = response.data.map((item, index) => ({
            header: `S No: ${(index + 1)}`, // card header
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
        let Role = await useGetRoleModule("Blog Categories");
        if(Role.moduleList.read === false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            setPermission(Role)
            getEmenities();
        }
        
    }

    useEffect(() => {
        GetRole()
    }, []);


    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');
        let status = e.currentTarget.getAttribute('status');
        let isDeleted = e.currentTarget.getAttribute('isDeleted');
        status = status === "DEACTIVE" ? "ACTIVE" : "DEACTIVE"
        postApiCall('common/blog/category/status', {
            categoryId: id,
            status: status,
        }).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getEmenities();
            }
        });
    }

    function deleteEvent(e) {
        let id = e.currentTarget.getAttribute('value');
        if (!id) return;
        deleteApiCall('common/blog/category/delete/' + id, {}).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getEmenities();
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
        getEmenities()
    }

    const actionRender = (item, forScreen) => (<>
        {permission?.moduleList?.updateDisabled ? null : item?.status == "DEACTIVE" ?
            <button
                onClick={UpdateStatus} value={item?.categoryId}
                isDeleted={item?.isDeleted} status={item?.status}
                className="btn btn-info btn-icon-split btn-sm  mb-1 mr-1"><span
                    className="icon text-white-50"><i
                        className="fas fa-exclamation-triangle"></i></span>
                <span className="text">Disable</span>
            </button>
            :
            <button className="btn btn-success btn-icon-split btn-sm mb-1 mr-1"
                onClick={UpdateStatus} value={item?.categoryId}
                isDeleted={item?.isDeleted}
                status={item?.status}
            >
                <span className="icon text-white-50"><i
                    className="fas fa-check"></i></span>
                <span className="text">Enable</span>
            </button>
        }
        {permission?.moduleList?.updateDisabled ? null :
            <Link to={"/blogs/categories/add?id=" + item.categoryId}
                className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
                <span className="icon text-white-50">
                    <i className="far fa-edit"></i>
                </span>
                <span className="text">Edit</span>
            </Link>}
        {permission?.moduleList?.deleteDisabled ? null :
            <button onClick={deleteEvent} value={item.categoryId}
                className="btn btn-danger btn-icon-split btn-sm mb-1">
                <span className="icon text-white-50">
                    <i className="far fa-eye"></i>
                </span>
                <span className="text">Delete</span>
            </button>}
             </>)
        const renderFilter = (forScreen) => (<>
        <div className='moduleList'>
                <div className="form-group">
                    <input type="text" className="form-control" name="searchKey"
                        value={filterForm.searchKey}
                        placeholder='Search....'
                        onChange={onChangeFilter}
                    />
                </div>
                <div className="form-group">
                    <select className="form-control" name="status" value={filterForm.status}
                        onChange={onChangeFilter}>
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="deactivate">Deactivate</option>
                    </select>
                </div>
            <div className="form-group d-none d-md-block">
        <CustomButton
          label="Apply"
          
          appendClass='text-white'
          variant='danger'
          iconAppendClass="me-2"
          onClick={submitFilter}
        />
      </div>
      </div>
        </>)
    const headerButtons = () => {
        return (
            <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
                {permission?.moduleList?.createDisabled ? null :
                    <CustomButton
                        label="Add"
                        variant="danger"
                        icon="bi-plus-lg"
                        appendClass='text-white mx-2'
                       to="/blogs/categories/add"
                    />
                }
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
          <FilterWithButtonsCard title={'Blog Categories'} filters={renderFilter()} headerButtons={headerButtons()}/>
                </div>
                <div className="d-block d-md-none">
                                <CardListMobile
                                    dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                    isAction={true}
                                     perPage={20}
                                    totalItems={20}
                                    currentPage={1}
                                    handleFilter={submitFilter}
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
                                    <th className="width5">Sl. No.</th>
                                    <th>Name</th>
                                    {/*<th>Type</th>*/}
                                    <th>Status</th>
                                    {permission.moduleList.deleteDisabled && permission.moduleList.updateDisabled ? null :   <th class="width25">Action</th> }
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    lists.map((item, index) => {
                                        return <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.categoryName}</td>
                                            {/*<td>{item.type}</td>*/}
                                            <td>{item.status}</td>
                                            {permission.moduleList.deleteDisabled && permission.moduleList.updateDisabled ? null : <td>
                                               {actionRender(item)}
                                            </td>}
                                        </tr>

                                    })
                                }
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

export default BlogCategoryListing
