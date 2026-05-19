import React, { Component } from 'react';
import Axios from 'axios';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import Select from 'react-select'
import swal from 'sweetalert';
import { notAllowedSpecialcharacter, onlyAllowedNumber} from '../../Components/validationUtils'

class UpdateUserPartner extends Component {
    constructor(props) {
        super(props);
        this.name = React.createRef();
        this.email = React.createRef();  
        this.mobile = React.createRef();
        this.role = React.createRef();  
        this.username = React.createRef();
        this.employee_code = React.createRef();  
        this.state = {
            name: '',
            email: '',
            mobile: '',
            role: '',
            _id:"",
            username: '',
            employee_code:'',
            rolelist:[],
            ModulesAccess: [],
            GetData: {},
            Error: {},
        }
    }
    

    //--------------------------------------------save field value in state------------------------------------\\

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.id != "mobile" ? notAllowedSpecialcharacter(e.target.value) : onlyAllowedNumber(e.target.value)
        })
    };


    //-----------------------------------------Integrate API for create sub admin --------------------\\

    handleSubmit = (event) => {
        event.preventDefault();
        let id = this.props.match.params.id;
        let GetData = this.state.GetData;

            postApiCall('admin/partner/updateProfileWithModulePermissionById', { _id: this.state._id, name: this.name.current.value, email: this.email.current.value, mobile: this.mobile.current.value, role: this.state.role, username: this.state.username,
                employee_code: this.state.employee_code},)
            .then(data => {
            if(data.meta.status ) {
                swal({ text: data.meta.msg, icon: "success" }).then( () => {
                    window.history.back(-1)
                })
            }
            else{
                alert(data.meta.msg);
                return false;
            }
        }).catch(error => {
            let { data } = error;
            alert(data.message);
            return false;
        });
    }

    //----------------------------------Get admin data by id----------------------------------\\

    async getUserDetailsById(id) {
        let rolelist = await getApiCall(`admin/partner/role`);
        getApiCall('admin/partner/getUserDetailsById?id=' + id).then(data => {

          
            if (data.meta.status) {
                let {_id,name, email, role, mobile, username, employee_code}  = data.data
                this.setState({ _id, name, email, role, mobile, username, employee_code, GetData: data.data, ModulesAccess: data.data.childData, rolelist: rolelist.data, ERROR: false });
            }
            
            else {
                alert(data.meta.msg);
                return false;
            }
        }).catch(error => {
            let {data} = error;
            alert(data.message);
            return false;
        })
    }

    /* call apis */

    componentDidMount() {
        let id = this.props.match.params.id;
        this.getUserDetailsById(id);
    }

    //-----------------------------------------End-------------------------------------------------------------\\

    render() {
        const { ModulesAccess, GetData } = this.state;

        function triggleHandler(shortName){
            let id = "#" + shortName + "_module";
            if($(id).prop('checked') === true) {
                $(id).prop('checked', true);
                $("#" + shortName + "_view1").prop('checked', true);
                $("#" + shortName + "_view2").prop('checked', true);
                $("#" + shortName + "_view3").prop('checked', true);
                $("#" + shortName + "_view4").prop('checked', true);
            }
            else{
                $(id).prop('checked', false);
                $("#" + shortName + "_view1").prop('checked', false);
                $("#" + shortName + "_view2").prop('checked', false);
                $("#" + shortName + "_view3").prop('checked', false);
                $("#" + shortName + "_view4").prop('checked', false);
            }
        }


        let modules = [];
        if(ModulesAccess.length > 0) {
            modules = ModulesAccess.map(el => {
                let isAccess = (el.isAccess === 1) ? 'checked' : '';
                let isRead = (el.isRead === 1) ? 'checked' : '';
                let isWrite = (el.isWrite === 1) ? 'checked' : '';
                let isEdit = (el.isEdit === 1) ? 'checked' : '';
                let isDelete = (el.isDelete === 1) ? 'checked' : '';

                return <div className="row">
                    <div className="col-sm-4 pdl5">
                        <div className="checkboxMt">
                            <label for={`${el.shortModuleName}_module`} className="checkboxtitle">{el.moduleName}</label>
                            <input type="checkbox" className="form-control checkboxModule" id={`${el.shortModuleName}_module`} name="" defaultValue="1" onClick={()=>{triggleHandler(el.shortModuleName)}} defaultChecked={isAccess}/>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <div className="checkboxMt">
                            <input type="checkbox" className="form-control checkboxModule permissioncheckbox" id={`${el.shortModuleName}_view1`} name="" defaultValue="1" title="View permission" defaultChecked={isRead}/>
                            <label for={`${el.shortModuleName}_view1`} title="View permission"></label>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <div className="checkboxMt">
                            <input type="checkbox" className="form-control checkboxModule permissioncheckbox" id={`${el.shortModuleName}_view2`} name="" defaultValue="1" title="View permission" defaultChecked={isWrite}/>
                            <label for={`${el.shortModuleName}_view2`} title="View permission"></label>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <div className="checkboxMt">
                            <input type="checkbox" className="form-control checkboxModule permissioncheckbox" id={`${el.shortModuleName}_view3`} name="" defaultValue="1" title="View permission" defaultChecked={isEdit}/>
                            <label for={`${el.shortModuleName}_view3`} title="View permission"></label>
                        </div>
                    </div>
                    {/* <div className="col-sm-2">
                                <div className=" ">
                                    <input type="checkbox" className="form-control checkboxModule permissioncheckbox" id={`${el.shortModuleName}_view4`} name="" defaultValue="1" title="View permission" defaultChecked={isDelete}/>
                                    <label for={`${el.shortModuleName}_view4`} title="View permission"></label>
                                </div>
                            </div> */}
                </div>
            });
        }

        let roleOptions = '';
        if(GetData) {
            roleOptions = this.state.rolelist.map( rec => { return { value: rec.shortName, label: rec.name } })

            }

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
                                        <li className="breadcrumb-item"><Link to="/partner-management">Partner Management</Link>
                                        </li>
                                        <li className="breadcrumb-item">Edit
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
                                                    <label htmlFor="update" className="update">Name *</label>
                                                    <input type="text" id="name" ref={this.name} className="form-control" onChange={this.handleChange} value={this.state.name} required={true}/>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label htmlFor="update" className="update admin-pass-label">Role *</label>
                                                   {this.state.role && roleOptions.length >= 1 ? <Select options={roleOptions} onChange={(e) => this.setState({ role: e.value})} ref={this.role} defaultValue={roleOptions.filter(option => option.value === this.state.role)}/> : null}
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label htmlFor="update" className="update admin-pass-label">Mobile *</label>
                                                    <input type="text" ref={this.mobile} className='form-control' id="mobile" onChange={this.handleChange} value={this.state.mobile} required={true}/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label htmlFor="update" className="update admin-pass-label">Email *</label>
                                                    <input type="email" ref={this.email} className='form-control' id="email" onChange={this.handleChange} value={this.state.email} required={true}/>
                                                </div>
                                            </div>
                                        </div>
                                     
                                        <button type="submit" className="btn btn-warning">Update</button>
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
export default UpdateUserPartner;