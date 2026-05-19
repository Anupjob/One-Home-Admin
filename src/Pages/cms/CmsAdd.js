import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import Layout from "../../Layout";
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';
import Editor from '../../Utils/Editor';


const CmsAdd = (props) => {
    let id = (new URLSearchParams(window.location.search)).get("id");

    const [image, setImage] = useState();
    const [data, setData] = useState({
        'title': '',
        'url': '',
        'description': '',
        'description2': ''
    });
    const history = useNavigate()
    const [permission, setPermission] = useState({})

    async function GetRole() {
        let Role = await useGetRoleModule("cms");
        if(Role.moduleList.read === false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            getEmenity()
            setPermission(Role) 
        }  
    }

    useEffect(() => {
        GetRole()
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
            if (data.description2) {
                data.description = data.description2
                delete data.description2
            }
            Update(data)
        } else {
            Save(data);
        }
    }


    const handleEditorChange = (content, editor) => {
        console.log('Content was updated:', content);
        setData({
            ...data,
            description2: content
        })
    };

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
                    (Object.keys(permission).length > 0) ? <>
            <div className="main-title">
            <h3>{id ? 'Update' : 'Add New'} Website Content</h3>
                </div>
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <nav aria-label="breadcrumb">
                                <ol className="breadcrumb m-0 p-0">
                                    <li className="breadcrumb-item">{id ? 'Update' : 'Add New'} Website Content
                                    </li>
                                </ol>
                            </nav>
                    <Link to={"/cms"}
                          className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
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
                                        <Editor
                                            initialContent={data.description}
                                            onChange={(html) => handleEditorChange(html)}
                                        />


                                    </div>
                                </div>
                            </div>
                            <div className="form-group mt-1">
                                <button type="submit" className="btn btn-md btn-warning shadow-sm mr-2"> Submit</button>
                            </div>
                        </form>
                    </div>
                </div></> : null : null }


            </div>

        </>
    )
}

export default CmsAdd
