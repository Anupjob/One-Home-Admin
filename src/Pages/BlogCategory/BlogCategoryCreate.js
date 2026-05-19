import React, {useEffect, useState} from 'react'
import swal from 'sweetalert';
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import {Link} from "react-router-dom";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { notAllowedSpecialcharacter } from '../../Components/validationUtils'

const BlogCategoryCreate = (props) => {
    let id = (new URLSearchParams(window.location.search)).get("id");
    const [data, setData] = useState({
        categoryName: '',
        parentId: '',
    });
    const [parentCats, setParentCats] = useState([]);
    const [image, setImage] = useState();
    const history = useNavigate()
    const [permission, setPermission] = useState({})


    async function GetRole() {
        let Role = await useGetRoleModule("blogs/categories");
        if(Role.moduleList.read === false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            setPermission(Role) 
        }  
    }


    useEffect(() => {
        getParentCats();
        getDetials()
        GetRole()
    }, []);

    function getParentCats() {
        getApiCall('common/blog/category/list', {
            type: "Root"
        })
            .then((response) => {
                if (response.meta.msg && response.data) {
                    setParentCats(response.data)
                }
            })
    }

    async function getDetials() {
        if (id) {
            console.log('id', id)
            let response = await getApiCall('common/blog/category/details/' + id);
            if (response.meta.msg && response.data) {
                setData({
                    categoryName: response.data.categoryName,
                    parentId: response.data.parentId ?? '',
                    designation: response.data.designation,
                })
            }
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
        let returnData = await postApiCall('common/blog/category/add', form_data);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            history('/blogs/categories')
        }
    }

    const Update = async (form_data) => {
        form_data.categoryId = id;
        let returnData = await postApiCall('common/blog/category/update', form_data);
        console.log('returnData', returnData)
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            // history('/amenities')
        }
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
                    (Object.keys(permission).length > 0) ? <>
<div className="main-title"><h3> Add Blog Category</h3></div>
                <div className="d-sm-flex align-items-center justify-content-end mb-4">
                   
                    <Link to={'/blogs/categories'} className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
                        className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
                </div>
                <div className="card shadow mb-4">
                    <div className="card-body">
                        <form onSubmit={onSubmit} onChange={onChange}>
                            <div className="row">
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Name </label>
                                        <input type="text" className="form-control" name="categoryName"
                                               value={data.categoryName}
                                               required={true}/>
                                    </div>
                                </div>

                                {/*<div className="col-12 col-xs-6 col-md-6 col-lg-6">*/}
                                {/*    <div className="form-group">*/}
                                {/*        <label>Select Parent Categories</label>*/}
                                {/*        <select className="form-control" name="parentId" id="" value={data.parentId}>*/}
                                {/*            <option value="">Select</option>*/}
                                {/*            {parentCats.map((parentCat) => (*/}
                                {/*                <option value={parentCat.categoryId} key={parentCat.categoryId}>{parentCat.categoryName}</option>*/}
                                {/*            ))}*/}
                                {/*        </select>*/}
                                {/*    </div>*/}
                                {/*</div>*/}


                                <div className="form-group mt30">
                                    <button type="submit" className="btn btn-md btn-warning shadow-sm  mr-2"> Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div></> : null : null }
            </div>
        </>
    )
}

export default BlogCategoryCreate
