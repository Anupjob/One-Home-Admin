import React, {useEffect, useState} from 'react'
import swal from 'sweetalert';
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import {Link, useParams} from "react-router-dom";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { notAllowedSpecialcharacter } from '../../Components/validationUtils'

const CityAdd = (props) => {
    // let id = (new URLSearchParams(window.location.search)).get("id");
    //get id form prams
    const {id} = useParams();
    const [states, setStates] = useState([]);

    const [data, setData] = useState({
        // categoryName: '',
        _id: '',
        name: '',
        cityNameAlias: '',
        stateCode: '',
    });
    const history = useNavigate()
    const [permission, setPermission] = useState({})

    useEffect(() => {
        async function GetRole() {
            let Role = await useGetRoleModule("cities");
            if(Role.moduleList?.read === false){
                setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
            }else{
                getApiCall('admin/state/getAll').then((response) => {
                    if (response.meta.msg && response.data) {
                        let statesShort = response.data.sort((a, b) => a.name > b.name ? 1 : -1);
                        setStates(statesShort)
                    }
                });
                getDetials()
                setPermission(Role) 
            }  
        }
    
        GetRole()


    }, []);


    function getDetials() {
        if (id) {
            getApiCall('admin/city/get/' + id).then((response) => {
                if (response.meta.msg) {
                    setData(response.data)
                }
            });
        }

    }


    const onChange = (e) => {
        if (!e.target.name) return
        setData({
            ...data,
            [e.target.name]: notAllowedSpecialcharacter(e.target.value)
        })
    }
    const Save = async (form_data) => {
        let returnData = await postApiCall('admin/city/add', form_data);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            history('/cities')
        }
    }

    const Update = async (form_data) => {
        let returnData = await postApiCall('admin/city/update', form_data);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            // history('/amenities')
        }
    }


    const onSubmit = async (e) => {
        e.preventDefault()
        let fData = {};
        fData.name = data.name;
        fData.cityNameAlias = data.cityNameAlias;
        fData.stateCode = data.stateCode;
        if (id) {
            Update({
                _id: id,
                ...fData
            })
        } else {
            Save(fData);
        }
    }


    return (
        <>
            <div className="container-fluid">
            { Object.keys(permission).length > 0 ? 
                permission.role == "partner" && (permission.moduleList[id != null ? "update" : "create"] == undefined || permission.moduleList[id != null ? "update" : "create"] == false) ?
                    <div className="row text-center">
                        <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                            <div className="errer">
                                <img src="/program-error.png"/>
                                <h2>403</h2>
                                {/* <h4 className="text-danger">{permission.message}</h4> */}
                                <p>Module Need Some Permission</p>

                            </div>
                        </div>
                    </div>
                    :
                    <>
            <div className="main-title">
                <h3>{id ? `Update City -  ${data.name}` : 'Add City'}</h3>
            </div>
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <nav aria-label="breadcrumb">
                                <ol className="breadcrumb m-0 p-0">
                                    <li className="breadcrumb-item">{id ? `Update City -  ${data.name}` : 'Add City'}
                                    </li>
                                </ol>
                            </nav>
                    <Link to={'/cities'} className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
                        className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
                </div>
                <div className="card shadow mb-4">
                    <div className="card-body">
                        <form onSubmit={onSubmit} onChange={onChange}>
                            <div className="row">
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Name </label>
                                        <input type="text" className="form-control" name="name"
                                               value={data.name}
                                               required={true}
                                        />
                                    </div>
                                </div>


                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Alias Name </label>
                                        <input type="text" className="form-control" name="cityNameAlias"
                                               value={data.cityNameAlias}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                    <div className="form-group">
                                        <label htmlFor="exampleFormControlSelect1">State*</label>
                                        <select name="stateCode" value={data.stateCode} className="form-control"
                                                required={true}>
                                            <option value="">Select Type</option>
                                            {states.map((state, index) => {
                                                return <option key={index}
                                                               value={state.isoCode}
                                                               isoCode={state.isoCode}>{state.name}</option>
                                            })}
                                        </select>
                                    </div>
                                </div>


                            </div>
                            <div className="row">
                                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                    <div className="form-group mt-1">
                                        <button type="submit" className="btn btn-md btn-warning shadow-sm  mr-2"> Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div></> : null }
            </div>
        </>
    )
}

export default CityAdd
