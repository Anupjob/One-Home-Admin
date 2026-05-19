import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import Layout from "../../Layout";
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { notAllowedSpecialcharacter } from '../../Components/validationUtils'

const CategoryAdd = (props) => {
    let id = (new URLSearchParams(window.location.search)).get("id");

    const [image, setImage] = useState();
    const [data, setData] = useState({
        name: '',
        'type': '',
    });
    const history = useNavigate()
    const [permission, setPermission] = useState({})

    async function GetRole() {
        let Role = await useGetRoleModule("categories");
        if(Role.moduleList.read === false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            setPermission(Role)
           
        }
        
    }


    useEffect(() => {
        getEmenity()
        GetRole()
    }, []);

    async function getEmenity() {
        if (id) {
            let response = await getApiCall('common/category/details/' + id);
            if (response.meta.msg && response.data) {
                setData({
                    name: response.data.title,
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
        let returnData = await postApiCall('common/category/add', form_data, true);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            history('/categories')
        }
    }

    const Update = async (form_data) => {
        let returnData = await postApiCall('common/category/update/' +id, form_data, true);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            // history('/amenities')
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        let formdata = new FormData();

        // formdata.append('icon',image);
        // formdata.append('title',data.name);
        // formdata.append('type',data.type);
        if (id) {
            Update({
                title:data.name,
            })
        } else {
            Save({
                title:data.name,
            });
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
        <h3>{id ? 'Update' : 'Add New'} Category</h3> 
            </div>
                <div className="d-sm-flex align-items-center justify-content-end mb-4">
                    <Link to={"/categories"}
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
                            </div>
                            <div className="form-group mt-1">
                                <button type="submit" className="btn btn-md btn-warning shadow-sm mr-2"> Submit</button>
                            </div>
                        </form>
                    </div>
                </div></> : null }


            </div>

        </>
    )
}

export default CategoryAdd
