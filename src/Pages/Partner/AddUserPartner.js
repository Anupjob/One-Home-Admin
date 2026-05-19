import React, {Component} from 'react';
import Axios from 'axios';

import $ from 'jquery';
import {Link} from 'react-router-dom';
import {getAccessToken} from "../../Services/AccessToken";
import Constant from "../../Components/Constant";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import {toast} from "react-toastify";
import Select from 'react-select'
import swal from 'sweetalert';
import { notAllowedSpecialcharacter, onlyAllowedNumber} from '../../Components/validationUtils'

class AddUserPartner extends Component {
    state = {
        name: '',
        email: '',
        mobile: '',
        role: '',
        username: '',
        employee_code:'',
        rolelist:[],
        partnerId: '',
        Modules: [],
        Error: {},
    }

    //--------------------------------------------save field value in state------------------------------------\\

    handleChange = (e) => {
        this.setState({
            [e.target.id]: notAllowedSpecialcharacter(e.target.value)
        })
    };


    //-----------------------------------------Integrate API for create sub admin --------------------\\

    handleSubmit = (event) => {
        event.preventDefault();

        let metaData = {
            name: this.state.name,
            email: this.state.email,
            mobile: this.state.mobile,
            role: this.state.role,
            username: this.state.username,
            employee_code: this.state.employee_code,
            partnerId: this.props.match.params.id
        }

        let partnerId = this.props.match.params.id;
        let partnerName = this.props.match.params.name;
        postApiCall('admin/partner/create-user', metaData)
            .then(getResults => {
                if (getResults.meta.status) {
                    /* Write a code for manage module access permission */
                    let moduleAccess = [];
                    let modules = this.state.Modules;
                    moduleAccess = modules.map(el => {
                        let shortName = "#" + el.shortName;

                        let isAccess = ($(shortName + "_module:checked").val()) ? parseInt($(shortName + "_module:checked").val()) : 0;
                        let isRead = ($(shortName + "_view1:checked").val()) ? parseInt($(shortName + "_view1:checked").val()) : 0;
                        let isWrite = ($(shortName + "_view2:checked").val()) ? parseInt($(shortName + "_view2:checked").val()) : 0;
                        let isEdit = ($(shortName + "_view3:checked").val()) ? parseInt($(shortName + "_view3:checked").val()) : 0;
                        let isDelete = ($(shortName + "_view4:checked").val()) ? parseInt($(shortName + "_view4:checked").val()) : 0;

                        return {
                            userId: getResults.data._id,
                            moduleId: el._id,
                            moduleName: el.name,
                            shortModuleName: el.shortName,
                            'isAccess': isAccess,
                            'isRead': isRead,
                            'isWrite': isWrite,
                            'isEdit': isEdit,
                            'isDelete': isDelete
                        }
                        swal({ text: getResults.meta.msg, icon: "success" }).then( () => {
                            window.history.back(-1)
                        })
                    });
                       // postApiCall('admin/partner/moduleAccessPermission', {'moduleAccess': moduleAccess})
                        //.then(data => {
                       // if (data.meta.status) {
                            // toast(getResults.meta.msg, { type: toast.TYPE.SUCCESS})
                           // this.props.history(`/partner-users/${partnerId}/${partnerName}`);

                           // setTimeout(function () {
                            //    window.location.reload();
                          //  }, 2000);
                        //} else {
                            // toast(getResults.meta.msg, { type: toast.TYPE.SUCCESS})
                            // toast(data.meta.msg, { type: toast.TYPE.ERROR})
                            // alert(data.meta.msg);
                            //return false;
                        //}
                   // }).catch(error => {
                       // let {data} = error;
                        // alert(data.message);
                        //return false;
                    //});
                    swal({ text: getResults.meta.msg, icon: "success" }).then( () => {
                        window.history.back(-1)
                    })
                } else {
                    // swal({ text: getResults.meta.msg, icon: "warning", dangerMode: true });
                    return false;
                }
            }).catch(error => {
            console.log(error);
        })
    }

    //----------------------------------Integrate show sub admin list API----------------------------------\\

    async getModules() {
        let rolelist = await getApiCall(`admin/partner/role`);
        this.setState({rolelist: rolelist.data})
    }

    /* call module api */

    componentDidMount() {
        this.getModules();
    }

    //-----------------------------------------End-------------------------------------------------------------\\

    render() {
        const {Modules} = this.state;

        function triggleHandler(shortName) {
            let id = "#" + shortName + "_module";
            if ($(id).prop('checked') === true) {
                $("#" + shortName + "_view1").prop('checked', true);
                $("#" + shortName + "_view2").prop('checked', true);
                $("#" + shortName + "_view3").prop('checked', true);
                $("#" + shortName + "_view4").prop('checked', true);
            } else {
                $("#" + shortName + "_view1").prop('checked', false);
                $("#" + shortName + "_view2").prop('checked', false);
                $("#" + shortName + "_view3").prop('checked', false);
                $("#" + shortName + "_view4").prop('checked', false);
            }
        }


        let modules = [];
        if (Modules.length > 0) {
            modules = Modules.map(el => {
                return <div className="row">

                    <div className="col-sm-4 pdl5">
                        <div className="checkboxMt">
                            <label className="checkboxtitle" for={`${el.shortName}_module`}>{el.name}</label>
                            <input type="checkbox" className="form-control checkboxModule" id={`${el.shortName}_module`}
                                   name="" defaultValue="1" onClick={() => {
                                triggleHandler(el.shortName)
                            }}/>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <div className="checkboxMt">
                            <input type="checkbox" className="form-control checkboxModule permissioncheckbox"
                                   id={`${el.shortName}_view1`} name="" title="View permission" defaultValue="1"/>
                            <label for={`${el.shortName}_view1`} title="View permission"></label>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <div className="checkboxMt">
                            <input type="checkbox" className="form-control checkboxModule permissioncheckbox"
                                   id={`${el.shortName}_view2`} name="" title="View permission" defaultValue="1"/>
                            <label for={`${el.shortName}_view2`} title="View permission"></label>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <div className="checkboxMt">
                            <input type="checkbox" className="form-control checkboxModule permissioncheckbox"
                                   id={`${el.shortName}_view3`} name="" title="View permission" defaultValue="1"/>
                            <label for={`${el.shortName}_view3`} title="View permission"></label>
                        </div>
                    </div>
                    {/* <div className="col-sm-2">
                                <div className=" ">
                                    <input type="checkbox" className="form-control checkboxModule permissioncheckbox" id={`${el.shortName}_view4`} name="" title="View permission" defaultValue="1"/>
                                    <label for={`${el.shortName}_view4`} title="View permission"></label>
                                </div>
                            </div> */}
                </div>
            });
        }

        let partnerId = this.props.match.params.id;
        let partnerName = this.props.match.params.name;
        let roleOptions = this.state.rolelist.map( rec => { return { value: rec.shortName, label: rec.name } })
        return (
            <div>
                
                {/* **************core-container************ */}
                <div className="container-fluid">
                <div className="page-breadcrumb">
                    <div className="row">
                        <div className="col-6 align-self-center">
                            <div className="d-flex align-items-center">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb m-0 p-0">
                                        <li className="breadcrumb-item"><Link to="/partner-management">Partner
                                            Management</Link>
                                        </li>
                                        <li className="breadcrumb-item"><Link
                                            to={`/partner-users/${partnerId}/${partnerName}`}> {partnerName} User's</Link>
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="card mt-3">
                                <div className="card-body">

                                    <form onSubmit={this.handleSubmit} className="change-password-form">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label htmlFor="update" className="update">Name *</label>
                                                    <input type="text" id="name" className="form-control"
                                                           onChange={this.handleChange} value={this.state.name}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label htmlFor="update" className="update">username *</label>
                                                    <input type="text" id="username" className="form-control"
                                                           onChange={this.handleChange} required={true} value={this.state.username}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label htmlFor="update" className="update">Employee code *</label>
                                                    <input type="text" id="employee_code" className="form-control"
                                                           onChange={this.handleChange} required={true} value={this.state.employee_code}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label htmlFor="update" className="update admin-pass-label">Partner
                                                        Name *</label>
                                                    <input type="text" className='form-control'
                                                           defaultValue={this.props.match.params.name} disabled/>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label htmlFor="update" className="update admin-pass-label">Mobile
                                                        *</label>
                                                    <input type="number" className='form-control' id="mobile"
                                                           onChange={this.handleChange} value={this.state.mobile}/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label htmlFor="update" className="update admin-pass-label">Email
                                                        *</label>
                                                    <input type="email" className='form-control' id="email"
                                                           onChange={this.handleChange}  value={this.state.email}/>
                                                </div>
                                            </div>
                                            <div className='col-md-4'>
                                                <div className='form-group mb-3'>
                                                    <label htmlFor="update" className="update admin-pass-label">Role
                                                        *</label>
                                                        { roleOptions.length >= 1 ? <Select options={roleOptions} onChange={(e) => this.setState({ role: e.value})} ref={this.role} defaultValue={roleOptions.filter(option => option.value === this.state.role)}/> : null}
                                                </div>
                                            </div>
                                        </div>

                                        <button type="submit" className="btn btn-warning">Create</button>
                                    </form>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )

    }
}

export default AddUserPartner;