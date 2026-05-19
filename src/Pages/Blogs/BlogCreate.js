import React, {useEffect, useState, useMemo} from 'react'
import swal from 'sweetalert';
import '../../css/style.css';
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import {Link} from "react-router-dom";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { notAllowedSpecialcharacter, allowedFewSpecialcharacter } from '../../Components/validationUtils'
import {blobUrl} from "../../Services/helpers";
import Editor from '../../Utils/Editor';

const disallowedChars = /[<>;|&/\\#*%]/g;
const BlogCreate = (props) => {
    const [isLoding, setIsLoding] = useState(false);
    let splittitle = window.location.search.split('?')
    let blog_title = splittitle[1];
    const [data, setData] = useState({
        categoryId: '',
        title: '',
        postBy: '',
        designation: '',
        image: '',
        thumbnail:"",
        seoTitle:'',
        seoDescription:'',
        description:''
    });
    const [categories, setCategories] = useState([]);
    const [blog_id,setblog_id] = useState('')
    const [tags, setTags] = useState([]);
    const [image, setImage] = useState();
    const [thumbnailImage, setThumbailImage] = useState();
    const history = useNavigate()
    const [permission, setPermission] = useState({})


    useEffect(() => {
        setIsLoding(true)
        getDetials()
        getCategories()
        GetRole()
    }, []);


    async function GetRole() {
        let Role = await useGetRoleModule("blogs");
        if(Role.moduleList.read === false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            setPermission(Role)
           
        }
        
    }

    function getCategories() {
        getApiCall('common/blog/category/list')
            .then((response) => {
                if (response.meta.msg && response.data) {
                    setCategories(response.data)
                }
            })
    }

    async function getDetials() {
        if (blog_title) {
            let response = await getApiCall('common/blog/details/' + blog_title);
            if (response.meta.msg && response.data) {
                setData(response.data)
                setblog_id(response.data._id)
                setTags(response.data.tags && response.data.tags.length ? response.data.tags : [])
                setIsLoding(false)
            }
        }

    }
  
    const onChange = (e) => {
        if (!e.target.name) return
        if(e.target.name == 'postBy' || e.target.name == 'designation'){
        setData({
            ...data,
            [e.target.name]: notAllowedSpecialcharacter(e.target.value)
        })
    }
    else{
       setData({
            ...data,
            [e.target.name]: allowedFewSpecialcharacter(e.target.value)
        })  
    }
    }
    const onTagChange = (e) =>{
     let validValue = e.target.value.replace(/['"<>;|&\\#*%]/g, '');
            setTags(validValue)
       
    }
    const Save = async (form_data) => {
        let returnData = await postApiCall('common/blog/add', form_data, true);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            history('/blogs')
        }
    }

    const Update = async (form_data) => {
        let returnData = await postApiCall('common/blog/update/' + blog_id, form_data);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            // history('/amenities')
        }
    }


    function onImageSelect(e) {
        setImage(e.target.files[0])
    }

    function onThumbnailImageSelect(e) {
        setThumbailImage(e.target.files[0])
    }
    const MyCustomPlugin = (editor) => {
        editor.on('input', () => {
          const content = editor.getContent({ format: 'text' });
          let cleanedContent = content.replace(disallowedChars, '');
          if (content !== cleanedContent) {
            editor.setContent(cleanedContent, { format: 'text' });
          }
          setData({
            ...data,
            description2: cleanedContent
        })
        });
        editor.on('paste', (event) => {
            event.preventDefault();
            const clipboardData = event.clipboardData || window.clipboardData;
            let pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replace(disallowedChars, '');
            editor.insertContent(pastedData);
          });
       };

    const onSubmit = async (e) => {
        e.preventDefault()
        let formdata = new FormData();
        if (image) formdata.append('image', image, image.name);
        if (thumbnailImage) formdata.append('thumbnail', thumbnailImage, thumbnailImage.name);
        formdata.append('categoryId', data.categoryId);
        formdata.append('tags', JSON.stringify(tags));
        formdata.append('title', data.title);
        formdata.append('postBy', data.postBy);
        formdata.append('designation', data.designation);
        formdata.append('seoTitle', data.seoTitle);
        formdata.append('seoDescription', data.seoDescription);
        formdata.append('description', data.description2 ? data.description2 : data.description);
        if (blog_id) {
            Update(formdata)
        } else {
            Save(formdata);
        }
    }

    let imageUrl = image ? URL.createObjectURL(image) : data.image ? data.image : null;
    let thumbnailUrl = thumbnailImage ? URL.createObjectURL(thumbnailImage) : data.thumbnail ? data.thumbnail : null;


        const handleEditorChange = (content, editor) => {
            // console.log('Content was updated:', content);
             setData({
                ...data,
                description: content
            })
        };

console.log('re::::',data)
        return (
            <>
                <div className="container-fluid">
               
                {
                    
                Object.keys(permission).length > 0 ? 
                permission.role == "partner" && (permission.moduleList[blog_id != null ? "update" : "create"] == undefined || permission.moduleList[blog_id != null ? "update" : "create"] == false) ?
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
                    <div className="main-title"><h3> Add New Blog</h3></div>
                    <div className="d-sm-flex align-items-center justify-content-end mb-4">
                        
                        <Link to={'/blogs'} className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
                            className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
                    </div>
                    <div className="card shadow mb-4">
                        <div className="card-body">
                            <form onSubmit={onSubmit} onChange={onChange}>
                                <div className="row">
                                    <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                        <div className="form-group">
                                            <label>Select Parent Categories</label>
                                            <select className="form-control" name="categoryId" blog_id=""
                                                    value={data.categoryId}>
                                                <option value="">Select</option>
                                                {categories.map((parentCat) => (
                                                    <option value={parentCat.categoryId}
                                                            key={parentCat.categoryId}>{parentCat.categoryName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                        <div className="form-group">
                                            <label>Tags*</label>
                                            <input type="text" className="form-control"
                                                value={tags}
                                                onChange={onTagChange}
                                            />
                                        </div>

                                    </div>

                                    <div className="col-12 col-xs-12 col-md-12 col-lg-12">
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
                                                   required={!blog_id}/>
                                        </div>
                                        {imageUrl ? <img src={image?imageUrl:blobUrl(imageUrl)} alt="image" width="100px"/> : null}
                                    </div>
                                    <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                        <div className="form-group">
                                            <label>Upload thumbnail</label>
                                            <input type="file" className="form-control" onChange={onThumbnailImageSelect}
                                                   required={!blog_id}/>
                                        </div>
                                        {thumbnailUrl ? <img src={thumbnailImage?thumbnailUrl:blobUrl(thumbnailUrl)} alt="image" width="100px"/> : null}
                                    </div>
                                    <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                        <div className="form-group">
                                            <label>Author Name</label>
                                            <input type="text" className="form-control" name="postBy"
                                                   value={data.postBy}
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
                                    <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                        <div className="form-group">
                                            <label>Meta Title</label>
                                            <input type="text" className="form-control" name="seoTitle"
                                                   value={data.seoTitle}
                                                   />
                                        </div>
                                    </div>
                                    <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                        <div className="form-group">
                                            <label>Meta Description</label>
                                            <input type="text" className="form-control" name="seoDescription"
                                                   value={data.seoDescription}
                                                   />
                                        </div>
                                    </div>


                                    <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Description/Content</label>

                                            <Editor
                                                initialContent={data.description}
                                                onChange={(html) => handleEditorChange(html)}

                                            />


                                        </div>
                                    </div>
                                </div>

                                <div className="form-group mt-1">
                                    <button type="submit" className="btn btn-md btn-warning shadow-sm  mr-2"> Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div></> : null : null }
                </div>
            </>
        )
    }

    export default BlogCreate
