import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import swal from 'sweetalert';
import '../../css/style.css';
import Layout from "../../Layout";
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { notAllowedSpecialcharacter } from '../../Components/validationUtils'

const AddAmenities = (props) => {
    let id = (new URLSearchParams(window.location.search)).get("id");


    const [data, setData] = useState({
        name: ''
    });
    const history = useNavigate()

    const [file, setFile] = useState('');
    const [permission, setPermission] = useState({})


     async function GetRole() {
        let Role = await useGetRoleModule('Amenities');
        console.log('Role:::::::::::',Role)
       if (Role?.permission && (!Array.isArray(Role.permission.actions) || !Role?.permission?.actions.includes('read'))) {
            setPermission({ moduleAccress: false, accessList: [], message: "Module Need Some Permission...Pls contact with Your Partner" })
        } else {
            setPermission({ moduleAccress: true, accessList: Role?.permission?.actions, message: "Module Need Some Permission...Pls contact with Your Partner" })
            getEmenity()
        }
        // const FilteredData = permissionData.formFields.permission.filter((item, index)=>item.label.includes('Auctions'))[0]?.actions || []
        //     setPermission(FilteredData)
            //  getList();

    }
    useEffect(() => {
         
        GetRole()
    }, []);

    async function getEmenity() {
        if (id) {
            let response = await getApiCall('common/amenity/details/' + id);
            if (response.meta.msg && response.data) {
                setData({
                    name: response.data.name,
                })
            }
        }

    }


    const onChange = (e) => {
        // setData({
        //     [e.target.name]: e.target.value
        // })
        setData({
            name: notAllowedSpecialcharacter(e.target.value)
        })
    }
    const Save = async (form_data) => {
        let returnData = await postApiCall('common/amenity/add', form_data, true);
        // console.log('returnData',returnData)
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1000})
            history('/amenities')
        }
    }

    const Update = async (form_data) => {
        let returnData = await postApiCall('common/amenity/update', form_data, true);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1000})
            // history('/amenities')
        }
    }


    const onSubmit = async (e) => {
        e.preventDefault()
        let form_data = new FormData();
        form_data.append('name', data.name);
        form_data.append('amenityImg', file);
        if (!form_data.get('name')) return alert('Please Enter name')

        if (id) {
            form_data.append('amenityId', id);
            Update(form_data)
        } else {
            Save(form_data);
        }
    }


    return (
        <>
            <div className="container-fluid">
            {permission?.accessList?.length==0 || (!Array.isArray(permission?.accessList) &&
  (permission?.accessList?.includes('create') || permission?.accessList?.includes('update')))? 
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
                    <h3> {id ? 'Update' : 'Add New'} Amenity</h3>
                </div>
                <div className="d-sm-flex align-items-center justify-content-end mb-4">
                    <Link to={"/amenities"}
                          className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
                        className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
                </div>


                <div className="card shadow mb-4">

                    <div className="card-body">
                        <form onSubmit={onSubmit}>
                            <div className="row">
                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                    <div className="form-group">
                                        <label>Amenity Name</label>
                                        <input type="text" name="name" className="form-control" value={data.name}  onChange={onChange}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                    <div className="form-group">
                                        <label>Image</label>
                                        <input type="file" name="file" className="form-control"
                                               onChange={(e) => setFile(e.target.files[0])}
                                               required={id ? false : true}/>
                                    </div>
                                    {/*<div className="form-group">*/}
                                    {/*    <img src={data.amenityImg} alt="" style={{width: '100px'}}/>    */}
                                    {/*</div>*/}
                                </div>
                            </div>
                            <div className="form-group mt-1">
                                <button type="submit" className="btn btn-md btn-warning shadow-sm  mr-2"> Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div></> }


            </div>

        </>
    )
}

export default AddAmenities
