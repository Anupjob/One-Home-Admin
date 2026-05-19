import React, {Component} from 'react';
import Axios from 'axios';

import {Link} from 'react-router-dom';
import $ from 'jquery';
import Constant from "../../Components/Constant";
import loginUser from "../../Services/loginUser";
import postApiCall from "../../Services/postApiCall";
import patchApiCall from "../../Services/patchApiCall";
import getApiCall from '../../Services/getApiCall';
import PaginationNew from "../../Widgets/PaginationNew";
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CustomButton from '../../Utils/CustomButton';

let {accessToken} = loginUser();

class DataManagement extends Component {

    state = {
        DataList: [],
        roleList:[],
        ERROR: true,
        pageNo:1,
        totalItems:0,
        perPage:Constant.perPage,
        isLoaded:true,
        permission: false,
        mobileResponseData:[]
    }





    //----------------------------------Integrate show Country API----------------------------------\\

    handleSubmit = async () => {
        try {
            let metaData = {
                'pageNo': this.state.pageNo,
                'searchText': $('#searchText').val()
            };
            let dropdown = await getApiCall("admin/partner/role");
            getApiCall('admin/partner/list', metaData)
                .then(data => {
                    if (data.meta.status) {
                        let page = Math.ceil(data.total / 10)
                        const formattedData = data.data.map((item, index) => ({
                        header: `S No: ${(index + 1) + ((this.state.pageNo - 1) * 20)}`, // card header
                        data: [
                            { label: "Partner ID", value: item.customId },
                            { label: "Partner Name", value: item.name },
                            { label: "Mobile No", value: item.mobile },
                            { label: "Email ID", value: item.email },
                            { label: "Type of Service", value: item.serviceType === 2 ? "Auction Property" : "Property Listing" },
                            { label: "Role", value: item.status },
                        ],
                        status: item.status == 0? 'DEACTIVE':'ACTIVE', // card footer status
                        footerId: item._id,
                        url: ``,
                        actionButtons: this.actionRender(item)
                    }));
                        this.setState({DataList: data.data, ERROR: false, roleList: dropdown.data, totalItems:page, mobileResponseData: formattedData });
                    } else {
                        // alert(data.meta.msg);
                        this.setState({DataList: [], ERROR: false});
                        return false;
                    }
                }).catch(error => {
                console.log(error);
            })
        } catch (err) {
            console.log(err);
        }
    }

    changeStatus = (id, status) => {
        try {
            let metaData = {'status': status, 'isDeleted': 0};
            patchApiCall('admin/partner/changeStatus/' + id, metaData)
                .then(data => {
                    if (data.meta.status) {
                        this.handleSubmit();
                    } else {
                        alert(data.message);
                        return false;
                    }
                }).catch(error => {
                console.log(error);
            })
        } catch (err) {
            console.log(err);
        }
    }

    //--------------------------------------------Reload component----------------------------------------------//    

    componentDidMount() {
        let userDetails = localStorage.getItem("userDetails")
        let roleName = JSON.parse(userDetails)
        if(roleName.role == "admin"){
            this.setState({ permission: true})
            this.handleSubmit();
        }else{
            this.setState({ permission: false})
        }
    }

actionRender = (el) => (<>
            <Link to={`/partner-users/${el._id}/${el.name}`}>
                <button className="btn btn-warning btn-sm ml-2 mb-1">Users</button>
            </Link>
            <Link to={`/edit-partner/${el._id}`} className="btn btn-primary btn-sm ml-2 mb-1">Edit</Link>
            {/* <Link to={`/permission/${el._id}`} className="btn btn-warning btn-sm ml-2 mb-1">Permission</Link> */}
            <button className="btn btn-warning btn-sm ml-2 mb-1" disabled>Permission</button>
        </>)

        renderFilter = (forScreen) => (<>
            <div className='moduleList'>
                <div className="form-group">
                    <input type="text" id="searchText" className="form-control"
                        placeholder="Search by Financial Institution Name/Mobile No/Partner ID" />
                </div>
                <div className="form-group d-none d-md-block">
                    <CustomButton
                        label="Apply"
                        
                        appendClass='text-white'
                        variant='danger'
                        iconAppendClass="me-2"
                        onClick={this.handleSubmit}
                    />
                </div>
            </div>
        </>)
        headerButtons = () => {
        return (
            <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
                {this.permission?.moduleList?.createDisabled ? null :
                    <CustomButton
                        label="Create Partner"
                        variant="danger"
                        icon="bi-plus-lg"
                        appendClass='text-white mx-2'
                        to="/create-partner"
                    />
                }
            </div>
        )
    }
    //-------------------------------------------End API-------------------------------------------------------\\     

    render() {

      const  handleSubmit = async (page) => {
            try {
                let metaData = {
                    'pageNo': page,
                    'searchText': $('#searchText').val()
                };
                let dropdown = await getApiCall("admin/partner/role");
                getApiCall('admin/partner/list', metaData)
                    .then(data => {
                        if (data.meta.status) {
                            let page = Math.ceil(data.total / 10)
                            this.setState({DataList: data.data, ERROR: false, roleList: dropdown.data, totalItems:page});
                        } else {
                            // alert(data.meta.msg);
                            this.setState({DataList: [], ERROR: false});
                            return false;
                        }
                    }).catch(error => {
                    console.log(error);
                })
            } catch (err) {
                console.log(err);
            }
        }


        const  pageChangeHandler = (page) => {
            this.setState({pageNo:page});
            handleSubmit(page);
        }


        const {DataList, } = this.state;
        let i = 0;
        let bodyData = '';

        if (DataList.length > 0) {
            bodyData = DataList.map(el => {
                i++;
                let dynamicClass = "btn custom-round-icon btn-success";
                let btnName = <i className="fa fa-check" aria-hidden="true"></i>;
                let actionStatus = 0;

                if (el.status === 0) {
                    dynamicClass = "btn custom-round-icon btn-warning";
                    btnName = <i className="fa fa-ban" aria-hidden="true"></i>
                    actionStatus = 1;
                }

                return <tr key={i}>
                    <td>{(i)+((this.state.pageNo-1)*10)} </td>
                    <td>{el.customId}</td>
                    <td>{el.name}</td>
                    <td>{el.mobile}</td>
                    <td>{el.email}</td>
                    <td>{el.serviceType === 2 ? "Auction Property" : "Property Listing"}</td>
                    <td>
                        <button id={el._id} className={dynamicClass}
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to change status?')) this.changeStatus(el._id, el.status)
                                }}> {btnName}</button>
                    </td>
                    <td>
                    <div className="dropdown">
                           <button className="btn btn-primary dropdown-toggle btn-sm" type="button" data-toggle="dropdown">Role</button>
                           <ul className="dropdown-menu">
                             {this.state.roleList.map( rec => {
                                 return <li key={rec.name} className='dropdown-item'><Link to={`/role/${el._id}/${rec.shortName}`}>{rec.name}</Link></li>
                             })}
                           </ul>
                         </div>
                                    </td>
                    <td className='d-flex flex-col'>
                       {this.actionRender(el)}

                    </td>
                </tr>
            })
        }
console.log('this.mobileResponseData:::::',this.mobileResponseData)
        return (<>
            { !this.state.permission ?
                    <div className="row text-center">
                        <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                            <div className="errer">
                                <img src="/program-error.png"/>
                                <h2>403</h2>
                                {/* <h4 className="text-danger">{permission.message}</h4> */}
                                <p>Module Need Some Permission...Pls contact with Your Admin</p>

                            </div>
                        </div>
                    </div>
                    : 
            <div>
                <div className="container-fluid">
                    <div className="main-title">
          <FilterWithButtonsCard title={'User Access Management'} filters={this.renderFilter()} headerButtons={this.headerButtons()}/>
                </div>
                        <div className="d-block d-md-none">
                            <CardListMobile
                                dataList={this.state.mobileResponseData?.length > 0 ? this.state.mobileResponseData : []}
                                perPage={this.state.perPage}
                                totalItems={this.state.totalItems}
                                currentPage={this.state.pageNo}
                                pageChangeHandler={pageChangeHandler}
                                handleFilter={this.handleSubmit}
                                isAction={true}
                            >
                                <div style={{ width: '100%', marginRight: '10px' }}>
                                    {this.renderFilter('mobile')}
                                </div>

                            </CardListMobile>
                        </div>
                    <div className="card d-none d-md-block">
                        <div className="card-body">
                            <div className="table-responsive mb-3">
                                <table className="table table-striped">
                                    <thead>
                                    <tr>
                                        <th scope="col">Sl.No.</th>
                                        <th scope="col">Partner ID</th>
                                        <th scope="col">Partner Name</th>
                                        <th scope="col">Mobile No</th>
                                        <th scope="col">Email ID</th>
                                        <th scope="col">Type of Service</th>
                                        <th scope="col">Status</th>
                                        <th scope='col'>Role</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>{bodyData}</tbody>
                                </table>

                                <div className="justify-content-center mt-2">
                                    <PaginationNew perPage={this.state.perPage} totalItems={12} currentPage={this.state.pageNo}
                                                   handler={pageChangeHandler}/>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div> }
            </>
        )
    }

}

export default DataManagement;