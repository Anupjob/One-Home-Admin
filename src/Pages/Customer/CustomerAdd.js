import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import Layout from "../../Layout";
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";

const CustomerAdd = (props) => {
    let id = (new URLSearchParams(window.location.search)).get("id");

    const [image, setImage] = useState();
    const [isReady, setIsReady] = useState(true);

    const [data, setData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        countryCode: '',
        mobile: '',
        notificationStatus: '',
    });
    const history = useNavigate()


    useEffect(() => {
        getDetials()
    }, []);

    async function getDetials() {
        if (id) {
            let response = await getApiCall('admin/user/details/' + id);
            if (response.meta.msg && response.data) {
                setData({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    password: response.data.password,
                    countryCode: response.data.countryCode,
                    mobile: response.data.mobile,
                    notificationStatus: response.data.notificationStatus,
                })
            }
        }

    }


    const onChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }
    const Save = (form_data) => {
        // let returnData = await postApiCall('admin/user/add', form_data);
        // if (returnData.meta.status) {
        //     swal({text: returnData.meta.msg, icon: "success", timer: 1500})
        //     history('/customers')
        // }

        setIsReady(false)
        postApiCall('admin/user/add', form_data, true)
            .then((returnData) => {
                setIsReady(true)
                if (returnData.meta.status) {
                    // swal({text: returnData.meta.msg, icon: "success", timer: 1500})
                    swal({
                        text: returnData.meta.msg, icon: "success",
                        timer: 1000
                    })
                    // history('/properties')
                }
            })
            .catch(() => {
                setIsReady(true)
            })

    }

    const Update = (form_data) => {
        form_data._id = id;

        setIsReady(false)
        postApiCall('admin/user/add', form_data, true)
            .then((returnData) => {
                setIsReady(true)
                if (returnData.meta.status) {
                    // swal({text: returnData.meta.msg, icon: "success", timer: 1500})
                    swal({
                        text: returnData.meta.msg, icon: "success",
                        timer: 1000
                    })
                    // history('/properties')
                }
            })
            .catch(() => {
                setIsReady(true)
            })

        // let returnData = await postApiCall('', form_data, true);
        // if (returnData.meta.status) {
        //     swal({text: returnData.meta.msg, icon: "success", timer: 1500})
        //     // history('/amenities')
        // }
    }


    function onImageSelect(e) {
        setImage(e.target.files[0])
    }

    const onSubmit = async (e) => {
        if (!isReady) return

        e.preventDefault()
        let formdata = new FormData();

        // formdata.append('icon',image);
        // formdata.append('title',data.name);
        // formdata.append('type',data.type);
        if (id) {
            Update(data)
        } else {
            Save(data);
        }
    }


    return (
        <>
            <div className="container-fluid">
                <div className="main-title">
                    <h3>{id ? 'Update' : 'Add New'} Category</h3>
                </div>
                <div className="d-sm-flex align-items-center justify-content-end mb-4">
                    <Link to={"/customers"}
                          className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
                        className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
                </div>


                <div className="card shadow mb-4">
                    <div className="card-body">
                        <form onChange={onChange} onSubmit={onSubmit}>
                            <div className="row">
                                {/*// firstName:'',*/}
                                {/*// lastName:'',*/}
                                {/*// email:'',*/}
                                {/*// password:'',*/}
                                {/*// countryCode:'',*/}
                                {/*// mobile:'',*/}
                                {/*// notificationStatus:'', // select Yes-1 or No-0    */}

                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" name="firstName" className="form-control"
                                               value={data.firstName}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" name="lastName" className="form-control"
                                               value={data.lastName}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="text" name="email" className="form-control" value={data.email}/>
                                    </div>
                                </div>
                                {/*<div className="col-12 col-xs-6 col-md-6 col-lg-6">*/}
                                {/*    <div className="form-group">*/}
                                {/*        <label>Password</label>*/}
                                {/*        <input type="text" name="password" className="form-control"/>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Country Code</label>
                                        <input type="text" name="countryCode" className="form-control"
                                               value={data.countryCode}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Mobile</label>
                                        <input type="text" name="mobile" className="form-control" value={data.mobile}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Notification Status</label>
                                        <select name="notificationStatus" className="form-control"
                                                value={data.notificationStatus}>
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group mt-1">
                                {
                                    isReady ? <button type="submit"
                                                      className="btn btn-md btn-primary shadow-sm  mr-2"> Submit</button> :
                                        <button type="button"
                                                className="btn btn-md btn-secondary shadow-sm  mr-2"> Submitting..</button>
                                }

                            </div>
                        </form>
                    </div>
                </div>


            </div>

        </>
    )
}

export default CustomerAdd
