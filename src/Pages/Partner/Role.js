import React, { Component } from 'react';
import Axios from 'axios';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import swal from 'sweetalert';


class Role extends Component {
    state = {
        roleList:[],
        role: '',
        ModulesAccess: [],
        objectRequest:{},
        GetData: {},
        Error: {},
    }

    //--------------------------------------------save field value in state------------------------------------\\

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        })
    };


    //-----------------------------------------Integrate API for create sub admin --------------------\\

    handleSubmit = (event) => {
        
        event.preventDefault();
        let userId = this.props.match.params.id;
        let role = this.props.match.params.role;
       
        /* Write a code for manage module access permission */
        let objectReq =  this.state.objectRequest
        delete objectReq["requ"]
        let requestObj = Object.values(objectReq)
       
        requestObj = requestObj.map( rec => {
            
             return { ...rec, childModule: Object.values(rec.childModule)}
        })
     
        // Axios.put(Constant.apiBasePath + 'partner/updateProfileWithModulePermissionById', metaData, { headers: { 'token': accessToken }})
            postApiCall('admin/partner/role/permission', { userId, obj: requestObj, role },)
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

    async getUserDetailsById(id,role) {
        let rolelist = await getApiCall(`admin/partner/role`);
        getApiCall(`admin/partner/role/permission?userId=${id}&role=${role}`).then(data => {
            console.log("dsds",data.data)
            if (data.meta.status) {
                let objectRequest = {}     
                  data.data.map( el => {
                    let module = {}
                    el.childModule.map( ele => {
                        Object.assign(module, {}, {[ele.shortName] : ele})
                    })
                    Object.assign(objectRequest, {}, { [el.moduleId] : {...el , childModule: module} });
                })     
                this.setState({ roleList: rolelist.data, objectRequest, ModulesAccess: data.data, ERROR: false });
            }
            else {
                alert(data.meta.msg);
                return false;
            }
        }).catch(error => {
            console.log(error)
            let {data} = error;
            alert(data.message);
            return false;
        })
    }

    childCheckBoxHandler = ({event, permission, shortName, module}) => {
       let { objectRequest } = this.state
       let requ = objectRequest[module.moduleId]
       requ.childModule[shortName] = { ...requ.childModule[shortName], [permission] : event.target.checked}
       this.setState({ objectRequest: {...objectRequest, requ}})
    }

    rootCheckboxHandler = ({event, permission, shortName, module}) => {
        let { objectRequest } = this.state
        let requ = objectRequest[module.moduleId]
        requ = { ...requ, [permission] : event.target.checked}
        console.log("req", requ)
        this.setState({ objectRequest: {...objectRequest, [module.moduleId] : requ}})
    }

    /* call apis */

    componentDidMount() {
        let userId = this.props.match.params.id;
        let role = this.props.match.params.role;
        this.getUserDetailsById(userId, role);
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
                let isRead = (el.read) ? 'checked' : '';
                let isAdd = (el.create) ? 'checked' : '';
                let isEdit = (el.update) ? 'checked' : '';
                let isDelete = (el.deleted) ? 'checked' : '';
                let isDisabled = el.disabled
               
                let elmoduleReadDisabled = el.readDisbled;
                let elmoduleAddDisabled = el.createDisabled;
                let elmoduleEditDisabled = el.updateDisabled;
                let elmoduleDeleteDisabled = el.deleteDisabled;
                return <>
                {/* {!isDisabled ?  */}
                <div className="row">
                    <div className={(el.isChild ? "col-sm-12" : "col-sm-4")}>
                        <div className="checkboxMt">
                            <label for={`${el.shortName}_module`} className="checkboxtitle font-weight-bold">{el.name}</label>
                            {/* <input type="checkbox" className="form-control checkboxModule" id={`${el.shortModuleName}_module`} name="" defaultValue="1" onClick={()=>{triggleHandler(el.shortModuleName)}} defaultChecked={isAccess}/> */}
                        </div>
                        {el.isChild ? <div>
                            {/* <div className='row'>
                                <div className='col-sm-12'> */}
                            { el.childModule.map( module => {
                                 let moduleRead = (module.read) ? 'checked' : '';
                                 let moduleAdd = (module.create) ? 'checked' : '';
                                 let moduleEdit = (module.update) ? 'checked' : '';
                                 let moduleDelete = (module.deleted) ? 'checked' : '';

                                 let moduleReadDisabled = module.readDisbled;
                                 let moduleAddDisabled = module.createDisabled;
                                 let moduleEditDisabled = module.updateDisabled;
                                 let moduleDeleteDisabled = module.deleteDisabled;

                                return <div className="row align-items-center">
                                <div className="col-sm-4 titleCls" style={{paddingLeft:30, marginTop:20}}>
                                <label htmlFor={`${module.shortName}_module`} className="checkboxtitle">{module.name}</label>
                                    </div>
                                        <div className='col-sm-8'>

                                                    <div className='row align-items-center'>
                                                            <div className="col-sm-3">
                                                                  <div className="checkboxMt">
                                                                      <input type="checkbox" disabled={moduleReadDisabled} className="form-control checkboxModule permissioncheckbox" onChange={(evt) => this.childCheckBoxHandler({event: evt, permission: "read", shortName :module.shortName, module: el})} id={`${module.shortName}_view1`} name="" defaultValue="1" title="View permission" defaultChecked={moduleRead}/>
                                                                      <label for={`${module.shortName}_view1`} title="View permission"></label>
                                                                  </div>
                                                              </div>
                                                              <div className="col-sm-3">
                                                                  <div className="checkboxMt">
                                                                      <input type="checkbox" disabled={moduleAddDisabled} className="form-control checkboxModule permissioncheckbox" onChange={(evt) => this.childCheckBoxHandler({event: evt, permission: "create", shortName :module.shortName, module: el})} id={`${module.shortName}_view1`} name="" defaultValue="1" title="View permission" defaultChecked={moduleAdd}/>
                                                                      <label for={`${module.shortName}_view1`} title="View permission"></label>
                                                                  </div>
                                                              </div>
                                                              <div className="col-sm-3">
                                                                  <div className="checkboxMt">
                                                                      <input type="checkbox" disabled={moduleEditDisabled} className="form-control checkboxModule permissioncheckbox" id={`${module.shortName}_view2`} name="" defaultValue="1" title="View permission" onChange={(evt) => this.childCheckBoxHandler({event: evt, permission: "update", shortName :module.shortName, module:el})} defaultChecked={moduleEdit}/>
                                                                      <label for={`${module.shortName}_view2`} title="View permission"></label>
                                                                  </div>
                                                              </div>
                                                              <div className="col-sm-3">
                                                                  <div className="checkboxMt">
                                                                      <input type="checkbox" disabled={moduleDeleteDisabled} className="form-control checkboxModule permissioncheckbox" id={`${module.shortName}_view3`} name="" defaultValue="1" title="View permission" onChange={(evt) => this.childCheckBoxHandler({event: evt, permission: "deleted", shortName :module.shortName, module:el})} defaultChecked={moduleDelete}/>
                                                                      <label for={`${module.shortName}_view3`} title="View permission"></label>
                                                                  </div>
                                                              </div> 
                                                        </div>
                                                        
                                            </div>
                                </div>
                            })}
                                

                                {/* </div>
                                </div> */}
                            
                                
                        </div> : null}
                   
                    </div>
                  
                    {!el.isChild ? 
                    <>
                    <div className="col-sm-2">
                        <div className="checkboxMt">
                            <input 
                            type="checkbox" 
                            className="form-control checkboxModule permissioncheckbox" 
                            onChange={(evt) => this.rootCheckboxHandler({event: evt, permission: "read", shortName :el.shortName, module: el})} 
                            id={`${el.shortModuleName}_view4`} 
                            name="" 
                            defaultValue="1" 
                            title="View permission" 
                            defaultChecked={isRead}
                            disabled={elmoduleReadDisabled}
                            />
                            <label for={`${el.shortModuleName}_view4`} title="View permission"></label>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <div className="checkboxMt">
                            <input 
                            type="checkbox" 
                            className="form-control checkboxModule permissioncheckbox" 
                            onChange={(evt) => this.rootCheckboxHandler({event: evt, permission: "create", shortName :module.shortName, module: el})} 
                            id={`${el.shortModuleName}_view1`} 
                            name="" 
                            defaultValue="1" 
                            title="View permission" 
                            defaultChecked={isAdd}
                            disabled={elmoduleAddDisabled}
                            />
                            <label for={`${el.shortModuleName}_view1`} title="View permission"></label>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <div className="checkboxMt">
                            <input 
                            type="checkbox" 
                            className="form-control checkboxModule permissioncheckbox" 
                            onChange={(evt) => this.rootCheckboxHandler({event: evt, permission: "update", shortName :module.shortName, module: el})} 
                            id={`${el.shortModuleName}_view2`} 
                            name="" 
                            defaultValue="1" 
                            title="View permission" 
                            defaultChecked={isEdit}
                            disabled={elmoduleEditDisabled}
                            />
                            <label for={`${el.shortModuleName}_view2`} title="View permission"></label>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <div className="checkboxMt">
                            <input 
                            type="checkbox" 
                            className="form-control checkboxModule permissioncheckbox" 
                            onChange={(evt) => this.rootCheckboxHandler({event: evt, permission: "deleted", shortName :module.shortName, module: el})} 
                            id={`${el.shortModuleName}_view3`} 
                            name="" 
                            defaultValue="1" 
                            title="View permission" 
                            defaultChecked={isDelete}
                            disabled={elmoduleDeleteDisabled}
                            />

                            <label for={`${el.shortModuleName}_view3`} title="View permission"></label>
                        </div>
                    </div>
                    </>
                    : null
                   
               }
                </div>
                  {/* : null } */}
                </>
            });
        }
        console.log("state", this.state)
        return (
            <div>
               
                {/* **************core-container************ */}
                <div className="container-fluid">
                <div className="page-breadcrumb">
                    <div className="row">
                        <div className="col-6">
                            <div className="d-flex align-items-center">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb m-0 p-0">
                                        <li className="breadcrumb-item"><Link to="/partner-management">Partner Management</Link>
                                        </li>
                                        <li className="breadcrumb-item">Role
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
                                        
                                        <div className='row mt-3'>
                                            <div className="col-sm-12">
                                                <div className="row titleuser usermainheadbox">
                                                    <div className="col-sm-4"><h5><i className="fa fa-tasks"></i> Modules</h5></div>
                                                    <div className="col-sm-2" title="View"><h5>Read</h5></div>
                                                    <div className="col-sm-2" title="View"><h5>Add</h5></div>
                                                    <div className="col-sm-2" title="Add"><h5>Edit</h5></div>
                                                    <div className="col-sm-2" title="Edit"><h5>Delete</h5></div>
                                                    {/* <div className="col-sm-2" title="Delete"><h5><i className="fa fa-trash"></i> </h5></div> */}
                                                </div>
                                                <div className="usermainlistbox">

                                                    { modules }

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
export default Role;