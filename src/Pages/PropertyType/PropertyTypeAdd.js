import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import Layout from "../../Layout";
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { notAllowedSpecialcharacter } from '../../Components/validationUtils'

const PropertyTypeAdd = (props) => {
    let id = (new URLSearchParams(window.location.search)).get("id");

    const [image, setImage] = useState();
    const [data, setData] = useState({
        name: '',
        'type': '',
    });
    const history = useNavigate()
    const [permission, setPermission] = useState({})

    useEffect(() => {
        async function GetRole() {
        let Role = await useGetRoleModule("categories");
        if(Role.moduleList.read === false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            getEmenity()
            setPermission(Role)  
        }
    }

    GetRole()
    }, []);

    async function getEmenity() {
        if (id) {
            let response = await getApiCall('common/amenity/details/' + id);
            console.log('Detials', response)
            if (response.meta.msg && response.data) {
                setData({
                    name: response.data.name,
                })
            }
        }

    }


    const onChange = (e) => {
        setData({
            ...data,
            [e.target.name]: notAllowedSpecialcharacter(e.target.value)
        })
    }
    const Save = async (form_data) => {
        let returnData = await postApiCall('common/property-type/create', form_data, true);
        console.log('returnData', returnData)
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            history('/property-types')
        }
    }

    const Update = async (form_data) => {
        let returnData = await postApiCall('common/amenity/update', form_data, true);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            // history('/amenities')
        }
    }


    function onImageSelect(e) {
        setImage(e.target.files[0])
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        let formdata = new FormData();

        console.log('states', data)
        formdata.append('icon',image);
        formdata.append('name',data.name);
        formdata.append('type',data.type);
        if (id) {
            // Update(formdata)
        } else {
            Save(formdata);
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
                    : <>
            <div className="main-title">
                    <h3>{id ? 'Update' : 'Add New'} Property Type</h3>
                </div>
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <nav aria-label="breadcrumb">
                                <ol className="breadcrumb m-0 p-0">
                                    <li className="breadcrumb-item">{id ? 'Update' : 'Add New'} Property Type
                                    </li>
                                </ol>
                            </nav>
                    <Link to={"/property-types"}
                          className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
                        className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
                </div>


                <div className="card shadow mb-4">

                    <div className="card-body">
                        <form onChange={onChange} onSubmit={onSubmit}>
                            <div className="row">
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Enter name</label>
                                        <input type="text" name="name" className="form-control" value={data.name}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label htmlFor="exampleFormControlSelect1">Type</label>
                                        <select name="type" value={data.type} className="form-control">
                                            <option value="">Select Type</option>
                                            <option value="1">Residential</option>
                                            <option value="2">Commercial</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label htmlFor="exampleFormControlFile1">Icon</label>
                                        <input type="file" onChange={onImageSelect} className="form-control-file" id="exampleFormControlFile1"/>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group mt-1">
                                <button type="submit" className="btn btn-md btn-warning shadow-sm  mr-2"> Submit</button>
                            </div>
                        </form>
                    </div>
                </div></> : null }


            </div>

        </>
    )
}

export default PropertyTypeAdd
