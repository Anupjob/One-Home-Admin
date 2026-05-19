import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import Layout from "../../Layout";
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';

const AddressLocationAdd = (props) => {
    const { id } = useParams();

    const [image, setImage] = useState();
    const [data, setData] = useState({
        "latitude": null,
        "longitude": null,
        "address": "",
        "city": "",
        "state": "",
        "cityId":"",
        "stateId":"",
    });
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [permission, setPermission] = useState({})
    const history = useNavigate()

    useEffect(() => {
        async function GetRole() {
            let Role = await useGetRoleModule("categories");
            if(Role.moduleList.read === false){
                setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
            }else{
                getApiCall('admin/state/getAll').then((response) => {
            if (response.meta.msg && response.data) {
                let statesShort = response.data.sort((a, b) => a.name > b.name ? 1 : -1);
                setStates(statesShort)
            }
               });
                getEmenity()
                setPermission(Role)  
            }
        }

        GetRole()
    }, []);


    useEffect(() => {
        let state = states.find((item) => item.name === data.state);
        if (state) {
            loadCities(state.isoCode)
        }
    }, [data.state, states]);

    function loadCities(isoCode) {
        getApiCall('admin/city/getAllForOption', {
            isoCode: isoCode,
        }).then((response) => {
            if (response.meta.msg && response.data) {
                response.data.sort((a, b) => a.name.localeCompare(b.name));
                setCities(response.data)
            }
        });
    }

    function stateChange(e) {
        let isoCode = e.target.options[e.target.selectedIndex].getAttribute('isoCode');
        loadCities(isoCode)
    }


    async function getEmenity() {
        if (id) {
            let response = await getApiCall('common/location/details/' + id);
            if (response.meta.msg && response.data) {
                setData({
                    "latitude": response.data.latitude,
                    "longitude": response.data.longitude,
                    "address": response.data.address,
                    "city": response.data.city,
                    "state": response.data.state,
                    "cityId":response.data.cityId,
                    "stateId": response.data.stateId
                })
            }
        }

    }


    const onChange = (e) => {
        if(e.target.name == 'state'){
            setData({
                ...data,
                'state': JSON.parse(e.target.value).name,
                'stateId':JSON.parse(e.target.value).id
            })
        }else if(e.target.name == 'city'){
            setData({
                ...data,
                'city': JSON.parse(e.target.value).name,
                'cityId':JSON.parse(e.target.value).id
            })
        }else{
            setData({
                ...data,
                [e.target.name]: e.target.value
            })
        }
    }
    const Save = async (form_data) => {
        let returnData = await postApiCall('common/location/add', form_data, true);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            history('/address-locations')
        }
    }

    const Update = async (form_data) => {
        form_data.locationId = id;
        let returnData = await postApiCall('common/location/update/', form_data, true);
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
        if (id) {
            Update(data)
        } else {
            Save(data);
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
            <><div className="main-title">
        <h3>{id ? 'Update' : 'Add New'} Location</h3>
            </div>
                <div className="d-sm-flex align-items-center justify-content-end mb-4">
                    <Link to={"/address-locations"}
                          className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
                        className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
                </div>
                <div className="card shadow mb-4">
                    <div className="card-body">
                        <form onChange={onChange} onSubmit={onSubmit}>
                            <div className="row">
                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                    <div className="form-group">
                                        <label>Address *</label>
                                        <input type="text" name="address" className="form-control" value={data.address} required={true} />
                                    </div>
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label htmlFor="exampleFormControlSelect1">State*</label>
                                        <select name="state" value={JSON.stringify(data.state.name)} className="form-control"
                                                required={true}>
                                            <option value="">Select Type</option>
                                            {states.map((state, index) => {
                                                return <option key={index}
                                                               value={JSON.stringify({ name: state.name, id: state._id })}
                                                               isoCode={state.isoCode}>{state.name}</option>
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label htmlFor="exampleFormControlSelect1">City *</label>
                                        <select name="city" value={JSON.stringify(data.city.name)} className="form-control"
                                                required={true}>
                                            <option value="" _id={''}>Select</option>
                                            {cities.map((city, index) => {
                                                return <option key={index} _id={city._id}
                                                               value={JSON.stringify({ name: city.name, id: city._id })}>{city.name}</option>
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Latitude *</label>
                                        <input type="number" name="latitude" className="form-control" value={data.latitude} required={true} />
                                    </div>
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Longitude *</label>
                                        <input type="decimal" name="longitude" className="form-control" value={data.longitude} required={true} />
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

export default AddressLocationAdd
