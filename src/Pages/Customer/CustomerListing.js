import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import Layout from "../../Layout";
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import postApiCall from "../../Services/postApiCall";
import PaginationNew from "../../Widgets/PaginationNew";
import Constant from "../../Components/Constant";
import useGetRoleModule from '../../Services/useGetRoleModule';
import deleteApiCall from "../../Services/deleteApiCall";
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CustomButton from '../../Utils/CustomButton';

const CustomerListing = () => {
    const [lists, setLists] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState({})
    const [mobileResponseData, setMobileResponseData] = useState()

    const [filterForm, setFilterForm] = useState({
        // status: '',
        searchKey: '',
        // 'type': '',
    });

    const onChangeFilter = (e) => {
        if (!e.target.name) return
        setFilterForm({
            ...filterForm,
            [e.target.name]: e.target.value
        })
    }
    const submitFilter = (e) => {
        e.preventDefault();
        getUser()
    }

    function pageChangeHandler(page) {
        setPageNo(page);
    }

    useEffect(() => {
        getUser()
    }, [pageNo])

    async function GetRole() {
        let Role = await useGetRoleModule("Customer Management");
        if (Role.moduleAccress) {
            setPermission(Role)
            getUser();
        }
    }

    function getUser() {

        getApiCall('admin/user/list', {
            page: pageNo,
            contentPerPage: perPage,
            ...filterForm
        })
            .then((response) => {
                if (response.meta.status) {
                    setLists(response.data);
                    const formattedData = response.data.map((item, index) => ({
                        header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
                        data: [
                            { label: "First Name", value: item.firstName },
                            { label: "Last Name", value: item.lastName },
                            { label: "Email", value: item.email },
                            { label: "Country Code", value: item.countryCode },
                            { label: "Status", value: item.status },
                        ],
                        status: item.status, // card footer status
                        footerId: item._id,
                        url: ``,
                        actionButtons: actionRender(item)
                    }));
                            setMobileResponseData(formattedData)
                } else {
                    setLists([]);
                }
                setIsLoaded(true);
                setTotalItems(response.total)
            })
            .catch((error) => {
                setIsLoaded(true);
            })
    }

    useEffect(() => {
        GetRole();
    }, []);


    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');
        let status = e.currentTarget.getAttribute('status');
        let isDeleted = e.currentTarget.getAttribute('isDeleted');
        status = status === "DEACTIVE" ? "active" : "deactive"
        postApiCall('admin/user/status', {
            _id: id,
            status: status,
            // isDeleted: isDeleted
        }).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getUser();
            }
        });
    }

    function Delete(e) {
        if (!window.confirm("Are you sure you want to delete this user?")) return
        let id = e.currentTarget.getAttribute('value');
        deleteApiCall('admin/user/delete/' + id).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getUser();
            }
        });
    }

 const actionRender = (item, forScreen) => (<>
     {permission?.moduleList?.updateDisabled ? null :
         item.status == 'DEACTIVE' ?
             <button
                 className="btn btn-success btn-icon-split btn-sm mb-1 mr-1"
                 onClick={UpdateStatus} value={item._id}
                 status={item.status}
             >
                 <span className="icon text-white-50"><i
                     className="fas fa-check"></i></span>
                 <span className="text">Enable</span>
             </button> :

             <button
                 onClick={UpdateStatus}
                 value={item._id}
                 status={item.status}
                 className="btn btn-info btn-icon-split btn-sm  mb-1 mr-1">
                 <span
                     className="icon text-white-50"><i
                         className="fas fa-exclamation-triangle"></i></span>
                 <span className="text">Disable</span>
             </button>


     }

     {permission?.moduleList?.updateDisabled ? null :
         <Link to={"customers/add?id=" + item._id}
             className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
             <span className="icon text-white-50">
                 <i className="far fa-edit"></i>
             </span>
             <span className="text">Edit</span>
         </Link>}
 </>)

    const renderFilter = (forScreen) => (<>
    <div className='moduleList'>
        <div className="form-group">
            <input type="text" className="form-control" name="searchKey"
                value={filterForm.searchKey}
                onChange={onChangeFilter}
                placeholder='Search....'
            />
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
    
    return (
        <>

            <div className="container-fluid">
                {permission.hasOwnProperty('moduleAccress') && !permission.moduleAccress ?
                    <div className="row text-center">
                        <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                            <div className="errer">
                                <img src="/program-error.png"/>
                                <h2>403</h2>
                                <h4 className="text-danger">Module Required Some Permission</h4>
                                {/* <p>Sorry, something went wrong :</p> */}

                            </div>
                        </div>
                    </div>
                    : (Object.keys(permission).length > 0) ? <>
                    <div className="main-title">
          <FilterWithButtonsCard title={'Customers'} filters={renderFilter()}/>
                </div>
                        {/*<div className="d-sm-flex align-items-center justify-content-end mb-4">*/}

                        {/*    {permission.moduleList.createDisabled ? null :*/}
                        {/*        <Link to="/customers/add"*/}
                        {/*              className="d-sm-inline-block btn btn-sm btn-warning shadow-sm">*/}
                        {/*            Add New*/}
                        {/*        </Link>}*/}
                        {/*</div>*/}
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
                                            <th>Sl. No.</th>
                                            <th>First Name</th>
                                            {/*<th>Middle Name</th>*/}
                                            <th>Last Name</th>
                                            {/*<th>DOB</th>*/}
                                            <th>Email</th>
                                            <th>Country Code</th>
                                            {/* <th>Mobile</th> */}
                                            {/*<th>Profile Image</th>*/}
                                            {/*<th>Gender</th>*/}
                                            <th>Status</th>
                                            {permission.moduleList.deleteDisabled && permission?.moduleList?.updateDisabled ? null :
                                                <th>Action</th>}
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {
                                            lists.map((item, index) => {
                                                return <tr key={index}>
                                                    <td>{(index + 1) + ((pageNo - 1) * 10)}</td>
                                                    <td>{item.firstName}</td>
                                                    {/*<td>{item.middleName}</td>*/}
                                                    <td>{item.lastName}</td>
                                                    {/*<td>{item.dob}</td>*/}
                                                    <td>{item.email}</td>
                                                    <td>{item.countryCode}</td>
                                                    {/* <td>{item.mobile}</td> */}
                                                    {/*<td>{ item.profileImg ? <img src={item.profileImg} width={50} height={50} alt=""/> : 'NO Image' } </td>*/}
                                                    {/*<td>{item.gender}</td>*/}
                                                    <td>{item.status}</td>
                                                    <td>
                                                        {actionRender(item)}
{/* 
                                                        {permission.moduleList.deleteDisabled ? null :
                                                            <button onClick={Delete} value={item._id}
                                                                    className="btn btn-danger btn-icon-split btn-sm mb-1">
                                                        <span className="icon text-white-50">
                                                            <i className="fas fa-trash"></i>
                                                        </span>
                                                                <span className="text">Delete</span>
                                                            </button>} */}
                                                    </td>
                                                </tr>

                                            })
                                        }


                                        </tbody>
                                    </table>
                                    <div className="justify-content-center mt-2">
                                        <PaginationNew perPage={perPage} totalItems={totalItems} currentPage={pageNo}
                                                       handler={pageChangeHandler}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </> : ''
                }

            </div>
        </>
    )
}

export default CustomerListing
