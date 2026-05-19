import React, {useEffect, useState} from 'react'
import swal from 'sweetalert';
import '../../css/style.css';
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import {Link} from "react-router-dom";
// import {TagsInput} from "react-tag-input-component";

const LeadsAdd = (props) => {
    const [isLoding, setIsLoding] = useState(false);
    let id = (new URLSearchParams(window.location.search)).get("id");
    const [data, setData] = useState({
        categoryId: '',
        title: '',
        postBy: '',
        designation: '',
        image: '',
    });
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [image, setImage] = useState();
    const history = useNavigate()


    useEffect(() => {
        setIsLoding(true)
        getDetials()
        getCategories()
    }, []);


    function getCategories() {
        getApiCall('common/blog/category/list')
            .then((response) => {
                if (response.meta.msg && response.data) {
                    setCategories(response.data)
                }
            })
    }

    async function getDetials() {
        if (id) {
            let response = await getApiCall('common/blog/details/' + id);
            if (response.meta.msg && response.data) {
                setData(response.data)
                setTags(response.data.tags && response.data.tags.length ? response.data.tags : [])
                setIsLoding(false)
            }
        }

    }


    const onChange = (e) => {
        if (!e.target.name) return
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }
    const Save = async (form_data) => {
        let returnData = await postApiCall('common/blog/add', form_data, true);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            history('/blogs')
        }
    }

    const Update = async (form_data) => {
        let returnData = await postApiCall('common/blog/update/' + id, form_data);
        console.log('returnData', returnData)
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
        if (image) formdata.append('image', image, image.name);
        formdata.append('categoryId', data.categoryId);
        formdata.append('tags', JSON.stringify(tags));
        formdata.append('title', data.title);
        formdata.append('postBy', data.postBy);
        formdata.append('designation', data.designation);
        formdata.append('description', data.description);
        if (id) {
            Update(formdata)
        } else {
            Save(formdata);
        }
    }

    let imageUrl = image ? URL.createObjectURL(image) : data.image ? data.image : null;

    return (
        <>
            <div className="container-fluid">
            <div className="main-title"><h3> Add New Blog</h3></div>
                <div className="d-sm-flex align-items-center justify-content-end mb-4">
                    
                    <Link to={'/blogs'} className="d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                        className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
                </div>
                <div className="card shadow mb-4">
                    <div className="card-body">
                        <form onSubmit={onSubmit} onChange={onChange}>
                            <div className="row">
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Select Parent Categories</label>
                                        <select className="form-control" name="categoryId" id=""
                                                value={data.categoryId}>
                                            <option value="">Select</option>
                                            {categories.map((parentCat) => (
                                                <option value={parentCat.categoryId}
                                                        key={parentCat.categoryId}>{parentCat.categoryName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                    <div className="form-group">
                                        <label>Tags*</label>
                                        <TagsInput
                                            value={tags}
                                            onChange={setTags}
                                        />
                                    </div>

                                </div> */}

                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Header/Title </label>
                                        <input type="text" className="form-control" name="title" value={data.title}
                                               required={true}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Upload image</label>
                                        <input type="file" className="form-control" onChange={onImageSelect}
                                               required={!id}/>
                                    </div>
                                    {imageUrl ? <img src={imageUrl} alt="image" width="100px"/> : null}
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Author Name</label>
                                        <input type="text" className="form-control" name="postBy" value={data.postBy}
                                               required={true}/>
                                    </div>
                                </div>
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Author Designation</label>
                                        <input type="text" className="form-control" name="designation"
                                               value={data.designation}
                                               required={true}/>
                                    </div>
                                </div>


                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                    <div className="form-group">
                                        <label>Description/Content</label>
                                        <textarea name="description" className="form-control" rows="4"
                                                  required={true} value={data.description}></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group mt-1">
                                <button type="submit" className="btn btn-md btn-primary shadow-sm  mr-2"> Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


        </>
    )
}

export default LeadsAdd
