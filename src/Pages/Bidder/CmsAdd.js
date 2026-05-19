import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import Layout from "../../Layout";
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";

const CmsAdd = (props) => {
    let id = (new URLSearchParams(window.location.search)).get("id");

    const [image, setImage] = useState();
    const [data, setData] = useState({
        'title': '',
        'url': '',
        'description': '',
    });
    const history = useNavigate()


    useEffect(() => {
        getEmenity()
    }, []);

    async function getEmenity() {
        if (id) {
            let response = await getApiCall('common/static/page/details/' + id);
            if (response.meta.status) {
                setData({
                    title: response.data.title,
                    url: response.data.url,
                    description: response.data.description,
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
    const Save = async (form_data) => {
        let returnData = await postApiCall('common/static/page/create', form_data, true);
        console.log('returnData', returnData)
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            history('/cms')
        }
    }

    const Update = async (form_data) => {
        let returnData = await postApiCall('common/static/page/update', form_data, true);
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
            data.pageId = id
            Update(data)
        } else {
            Save(data);
        }
    }


    return (
        <>
            <div className="container-fluid">
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h3 mb-0 text-gray-800">{id ? 'Update' : 'Add New'} CMS</h1>
                    <Link to={"/cms"}
                          className="d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
                </div>


                <div className="card shadow mb-4">
                    <div className="card-body">
                        <form onChange={onChange} onSubmit={onSubmit}>
                            <div className="row">
                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input type="text" name="title" className="form-control" value={data.title}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                    <div className="form-group">
                                        <label>URL</label>
                                        <input type="text" name="url" className="form-control" value={data.url}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea className="form-control" name="description"  cols="30" rows="10">{data.description}</textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group mt-1">
                                <button type="submit" className="btn btn-md btn-primary shadow-sm mr-2"> Submit</button>
                            </div>
                        </form>
                    </div>
                </div>


            </div>

        </>
    )
}

export default CmsAdd
