import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import Layout from "../../Layout";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import putApiCall from "../../Services/putApiCall";
import patchApiCall from "../../Services/patchApiCall";
import { notAllowedSpecialcharacter, onlyAllowedNumber} from '../../Components/validationUtils'
import { useNavigate } from 'react-router';

const PLanAdd = (props) => {
    let id = (new URLSearchParams(window.location.search)).get("id");

    const [image, setImage] = useState();
    const [data, setData] = useState({
        "name": "",
        "maxLimit":'' ,
        "validity": '',
        "charges":''
    });
    const history = useNavigate()


    useEffect(() => {
        getEmenity()
    }, []);

    async function getEmenity() {
        if (id) {
            let response = await getApiCall('admin/plan/getDataById/' + id);
            console.log('response', response)
            if (response.meta.msg && response.data) {
                setData({
                    name: response.data.name,
                    maxLimit: response.data.maxLimit,
                    validity: response.data.validity,
                    charges: response.data.charges
                })
            }
        }

    }


    const onChange = (e) => {
        let value = e.target.type == "text" ? notAllowedSpecialcharacter(e.target.value) : onlyAllowedNumber(e.target.value)
        setData({
            ...data,
            [e.target.name]: value
        })
    }
    const Save = async (form_data) => {
        let returnData = await postApiCall('admin/plan/create', form_data, true);
        console.log('returnData', returnData)
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            history('/plans')
        }
    }

    const Update = async (form_data) => {
        let returnData = await patchApiCall('admin/plan/update/' + id, form_data, true);
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
                    <h3>{id ? 'Update' : 'Add New'} Plan</h3>
                </div>
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <nav aria-label="breadcrumb">
                                <ol className="breadcrumb m-0 p-0">
                                    <li className="breadcrumb-item">{id ? 'Update' : 'Add New'} Plan
                                    </li>
                                </ol>
                            </nav>
                    <Link to={"/plans"}
                          className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
                        className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
                </div>


                <div className="card shadow mb-4">
                    <div className="card-body">
                        <form onChange={onChange} onSubmit={onSubmit}>
                            <div className="row">
                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input type="text" name="name" className="form-control" value={data.name}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                    <div className="form-group">
                                        <label>Max Limit</label>
                                        <input type="number" name="maxLimit" className="form-control" value={data.maxLimit}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                    <div className="form-group">
                                        <label>Validity</label>
                                        <input type="number" name="validity" className="form-control" value={data.validity}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                    <div className="form-group">
                                        <label>Charges</label>
                                        <input type="number" name="charges" className="form-control" value={data.charges}/>
                                    </div>
                                </div>

                            </div>
                            <div className="form-group mt-1">
                                <button type="submit" className="btn btn-md btn-warning shadow-sm mr-2"> Submit</button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>

        </>
    )
}

export default PLanAdd
