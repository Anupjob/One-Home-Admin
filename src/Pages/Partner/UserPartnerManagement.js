import React, {Component} from 'react';
import Axios from 'axios';

import {Link} from 'react-router-dom';
import $ from 'jquery';
import {getAccessToken} from "../../Services/AccessToken";
import Constant from "../../Components/Constant";
import postApiCall from "../../Services/postApiCall";
import patchApiCall from "../../Services/patchApiCall";
import PaginationNew from "../../Widgets/PaginationNew";
import { SelectPicker, Tooltip, Whisper, } from 'rsuite';

class UserPartnerManagement extends Component {

    state = {
        DataList: [],
        ERROR: true,
        pageNo: 1,
        totalItems: 0,
        perPage: 10,
        isLoaded: false
    }


    //----------------------------------Integrate show Country API----------------------------------\\

    handleSubmit = (page) => {
        if(typeof(page) != 'number'){
            page = 1
        }
        try {
            let metaData = {
                'pageNo': page,
                'searchText': $("#searchText").val()
            }
            postApiCall('admin/partner/getUserByPartnerId/' + this.props.match.params.id, metaData)
                .then(data => {
                    if (data.meta.status) {
                        this.setState({DataList: data.data.docs, ERROR: false, isLoaded: true, totalItems: data.data.length * 10});
                    } else {
                        // alert(data.meta.msg);
                        this.setState({DataList: [], ERROR: false, totalItems: data.data.length * 10, isLoaded: false});
                        return false;
                    }
                })
        } catch (err) {
            console.log(err);
        }
    }

    changeStatus = (id, status) => {
        let metaData = {'status': status, 'isDeleted': 0, 'type': 'userPartner'};
        patchApiCall('admin/partner/changeStatus/' + id, metaData)
            .then(data => {
                // console.log(data.meta.msg);
                if (data.meta.status) {
                    this.handleSubmit();
                } else {
                    alert(data.meta.msg);
                    return false;
                }
            }).catch(error => {
            console.log(error);
        })
    }

    //--------------------------------------------Reload component----------------------------------------------//    

    componentDidMount() {
        this.handleSubmit(1);
    }

 pageChangeHandler = (page)=> {
        if (this.state.isLoaded) {
            this.setState({ pageNo: page})
            this.handleSubmit(page)
        }
    }


    //-------------------------------------------End API-------------------------------------------------------\\     

    render() {
        const {DataList, perPage, totalItems, pageNo} = this.state;
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

                return <tr>
                    <td>{(i) + ((this.state.pageNo - 1) * 10)}</td>
                    <td>{el.name}</td>
                    <td>{el.email}</td>
                    <td>{el.mobile}</td>
                    <td>{el.role}</td>
                    <td>{el.parnterName}</td>
                    <td>{el.customId}</td>
                    <td>
                        <button id={el._id} className={dynamicClass}
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to change status?')) this.changeStatus(el._id, el.status ? 1 : 0 )
                                }}>{btnName}</button>
                    </td>
                    <td><Link to={`/edit-user-partner/${el._id}`}
                              className="btn btn-warning btn-sm" style={{marginRight: 10}}><span className="icon text-white-50">
                              <i className="far fa-edit" style={{color: 'white'}}></i>
                            </span></Link>
                                <Whisper followCursor placement="left" speaker={<Tooltip>Audit Trail</Tooltip>}>
                              <a href={`/partner-user-audit-trail/${el._id}`}><button className="btn btn-icon-split btn-sm mb-1" style={{backgroundColor: 'black'}}>
                                <span className="icon" style={{color: 'white'}}>
                                   <i class="fa fa-history" aria-hidden="true"></i>
                                </span>
                              </button></a>
                              </Whisper>
                              </td>
                </tr>
            })
        }

        let partnerId = this.props?.match?.params?.id;
        let partnerName = this.props?.match?.params?.name;
        let userDetails = localStorage.getItem("userDetails")
        let roleName = JSON.parse(userDetails)
        return (
            <div className="container-fluid">
                <div className="main-title">
                    <h3>User Access Management, Partner - {partnerName} User's</h3>
                </div>
                <div className='row'>
                    <div className='col-12 col-sm-4 col-md-4'>

                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link
                                    to={roleName.role != "partner" ? "/partner-management" : "#"}>Partner
                                    Management</Link></li>
                                <li className="breadcrumb-item"><Link
                                    to={`/partner-users/${partnerId}/${partnerName}`}>{this.props?.match?.params?.name} User's</Link>
                                </li>
                            </ol>
                        </nav>
                    </div>
                    <div className='col-12 col-sm-8 col-md-8'>
                        <div className="d-sm-flex align-items-center justify-content-end mb-4">
                            <Link to={`/add-user-partner/${partnerId}/${partnerName}`}
                                  className="btn btn-sm btn-warning shadow-sm"><i
                                className="fas fa-plus"></i> Create</Link>
                        </div>

                    </div>
                </div>


                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-8 col-sm-7 col-md-5">
                                <div className="form-group">
                                    <input type="text" id="searchText" className="form-control"
                                           placeholder="Search by Financial Institution Name/Mobile No/Partner ID"/>
                                </div>
                            </div>
                            <div className="col-4 col-sm-5 col-md-3">
                                <button className="btn btn-warning" type="button" onClick={this.handleSubmit}>Filter
                                </button>
                            </div>
                        </div>
                        <div className="table-responsive mb-3">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th scope="col">Sl.No.</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email ID</th>
                                    <th scope="col">Mobile No</th>
                                    <th scope="col">Role</th>
                                    <th scope='col'>Name of Partner</th>
                                    <th scope='col'>Partner ID</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Actions</th>
                                </tr>
                                </thead>
                                <tbody>{bodyData}</tbody>
                            </table>
                        </div>
                    </div>
                    {
                        totalItems > 10
                        ?
                        <PaginationNew perPage={perPage} totalItems={totalItems} currentPage={pageNo}
                        handler={this.pageChangeHandler}/>
                        :
                        <></>

                    }
                 
                </div>
            </div>
        )
    }

}

export default UserPartnerManagement;