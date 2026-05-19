
import React, {useEffect, useState} from 'react'
import swal from 'sweetalert';
import Select from 'react-select';
import {FilePond,} from "react-filepond";
import Constant from "../../../Components/Constant";
import loginUser from "../../../Services/loginUser";
import {blobUrl} from "../../../Services/helpers";
import getApiCall from "../../../Services/getApiCall";
import postApiCall from "../../../Services/postApiCall";

let {accessToken} = loginUser();



const PropertyManagement = (props) => {
    let id = (new URLSearchParams(window.location.search)).get("id");
   
    const [isReady, setIsReady] = useState(true);
    const [data, setData] = useState({
         "prospectId": "",
         "address": "",
         "propertyType": "",
         "noOfBedrooms": "",
         "noOfBathroom": "",
         "halls": "",
         "noOfBalcony": "",
         
         categories: [],
         videoUrls: [],
     });
    const [videoUrls,setVideoUrls] = useState([])

    const [categories, setCategories] = useState([]);
    const [categoriesOption, setCategoriesOption] = useState([]);
    const [categoriesDocs, setCategoriesDocs] = useState({});
    const [categoryImage, setCategoryImage] = useState({});
    const [thumbail,setThumbnail] = useState('')
    const [editDocument, setEditDocument] = useState([]);
    const [documentUploadShow, setDocumentUploadShow] = useState(false);
    const [documentName, setDocumentName] = useState('');
    const [documentUrl, setDocumentUrl] = useState('');
    
    useEffect(() => {
               
                getApiCall('common/category/get-all').then((response) => {
                    if (response.meta.msg && response.data) {
                        let options = response.data.map((item) => {
                            return {value: item._id, label: item.title}
                        })
                        setCategoriesOption(options)
                    }
                });
        
           

    }, []);
    useEffect(() => {
        
        let {category, image} = categoryImage;

       let imageObject = {
        "url": image,
        "status":"pending",
        "imageThumbnail": thumbail
        }
        let cat_object = {};
        if (!category) {
             return;
        }
        if (!categoriesDocs[category.value]) {
            cat_object = {
                "title": category.label,
                "images": [imageObject]
            }

        } else {
            cat_object = {
                "title": category.label,
                "images": [...categoriesDocs[category.value].images, imageObject]
            }
        }
        setCategoriesDocs({
            ...categoriesDocs, [category.value]: cat_object
        });

    }, [thumbail])

    const handleDocumentUploadClose = () => {
        setDocumentUploadShow(false);
        setDocumentName('');
        setDocumentUrl('');
    }
    const handleDocumentAdd = () => {
        //require name and url
        if (documentName === '' || documentUrl === '') {
            //sweet alert
            swal("Please enter document name and  Upload document");
            return;
        }
        setData({
            ...data,
            propertyDocument: [...data.propertyDocument, {
                name: documentName,
                image: documentUrl
            }]
        })
        handleDocumentUploadClose();
    };

   

 useEffect(() => {
        let items = [];
        let docs = {};
        editDocument.map((item) => {
            let am = categoriesOption.find((cat) => cat.label === item.type)
            if (am) {
                items.push(am);
                // {title: 'Bedroom updated', images: Array(0)}
                docs[am.value] = {title: item.type, images: item.images}
            }
        })
        setCategories(items);
        setCategoriesDocs(docs);

    }, [editDocument, categoriesOption]);


    const onChange = (e) => {
        if (!Object.keys(data).includes(e.target.name)) return;

        switch (e.target.name) {
            case 'cityName':
                let city = '';
                if (city) {
                   
                }
                break;
            default:
                if (e.target.name) {
                    //if field type is number then only allow positive number
                    if (e.target.type === 'number' && e.target.value && !isNaN(e.target.value)) if (e.target.value < 0) return ''
                    setData({
                        ...data, [e.target.name]: e.target.value
                    })
                }
                break;


        }


    }
    const Save = async (form_data) => {
        // if (!form_data.latitude) delete form_data.latitude;
        // if (!form_data.longitude) delete form_data.longitude;
        if (!form_data.prospectId) delete form_data.prospectId;
       
        setIsReady(false)
      let returnData = await  postApiCall('user/property/media/upload', form_data, true)
                if (returnData.meta.status) {
                    setIsReady(true)
                    // swal({text: returnData.meta.msg, icon: "success", timer: 1500})
                    swal({
                        text: returnData.meta.msg, icon: "success",
                        timer: 5000
                    })
                    setData({
                        ...data, 
                        "prospectId": "",
                            "address": "",
                            categories: [],
                            videoUrls: [],
                            "propertyType": "",
                            "noOfBedrooms": "",
                            "noOfBathroom": "",
                            "halls": "",
                            "noOfBalcony": "",
                      })
                    setCategories([])
                    setVideoUrls([])
                }else{
                    // swal({
                    //     text: returnData.meta.msg, icon: "warning",
                    //     timer: 5000
                    // })
                    setData({
                        ...data, 
                        "prospectId": "",
                            "address": "",
                            categories: [],
                            videoUrls: [],
                            "propertyType": "",
                            "noOfBedrooms": "",
                            "noOfBathroom": "",
                            "halls": "",
                            "noOfBalcony": "",
                    })
                    setCategories([])
                }
          
    }

   
    function removeCategoryPreviewImage(index, categoryId) {
        if (categoriesDocs[categoryId]) {
            categoriesDocs[categoryId].images = categoriesDocs[categoryId].images.filter((item, i) => i !== index);
            setCategoriesDocs({
                ...categoriesDocs, [categoryId]: categoriesDocs[categoryId]
            });
        }

       // setData({...data, [stateName]: data[stateName].filter((item, i) => i !== index)})
    }

    function addVedioUrl(url){
        let vediopayload = {
            "url": url,
            "status": 'pending'
        }
       videoUrls.push(vediopayload)
        setVideoUrls(videoUrls)
    }

    const onSubmit = async (e) => {
        if (!isReady) return
        e.preventDefault()
        // data.document = categoriesDocs;
        //category docs convert to array and remove key
        let categoryDocs = [];
        for (const [key, value] of Object.entries(categoriesDocs)) {
            categoryDocs.push(value);
        }
        data.categories = categoryDocs;
        data.videoUrls = videoUrls;
        // delete data.buildingType;

        if (id) {
            data.id = id;
            Save(data);
        } else {
            Save(data);
        }
    }

    const generateThumbnail = async (imageurl, prospectId) => {
        let payload = {
            "imageUrl": imageurl,
            "prospectId": prospectId
        };
        let returnData = await postApiCall('common/upload/blob/admin/generateImageThumbnail', payload, true);
        
        if (returnData.meta.status) {
            return returnData.data; // Ensure this returns the thumbnail URL
        }
        return ''; // Return an empty string or a placeholder if the thumbnail generation fails
    };

    const generateCompressedImage = async (imageurl, prospectId) =>{
            let payload = {
            "imageUrl": imageurl,
            "prospectId": prospectId
        };
        let returnData = await postApiCall('common/upload/blob/admin/compressImage', payload, true);
        
        if (returnData.meta.status) {
            return returnData.data; // Ensure this returns the thumbnail URL
        }
        return '';
    }

    return (<>
        <div className="container-fluid">
            
    
            <div className="card shadow mb-4">

                <div className="card-body">
                    <form onChange={onChange} onSubmit={onSubmit} className="hide-number-input-arrow">
                        <div className="row">
                    
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Prospect Number *</label>
                                    <input type="text" name="prospectId" className="form-control"
                                           value={data.prospectId} required={true}/>
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Property Address</label>
                                    <input type="text" name="address" className="form-control" 
                                           value={data.address}/>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="">
                                    <div className="form-group">
                                        <label htmlFor="exampleFormControlSelect1">Select Categories For Property Image
                                            Upload</label>
                                        <Select
                                            value={categories}
                                            onChange={setCategories}
                                            options={categoriesOption}
                                            isMulti={true}
                                        />
                                    </div>
                                </div>
                                {categories.map((category, index) => {
                                    return (<div className="card" key={category.value}>
                                        <div className="card-body">
                                            <h5 className="card-title text-center">{category.label}</h5>
                                            <div className="img-preview">
                                                {categoriesDocs[category.value] && categoriesDocs[category.value].images.map((item, index) => (
                                                    <div className="img-preview__item" key={item}>
                                                        <img src={blobUrl(item)} alt
                                                             className="img-preview__image"/>
                                                        <button type="button" className="img-preview__remove"
                                                                onClick={() => {
                                                                    removeCategoryPreviewImage(index, category.value)
                                                                }}>X
                                                        </button>
                                                    </div>))}
                                            </div>
                                            <FilePond
    maxFileSize="20MB"
    allowFileTypeValidation={true}
    acceptedFileTypes={['image/*']}
    imagePreviewMaxHeight={100}
    credits={false}
    allowMultiple={true}
    allowRevert={false}
    name="image"
    labelIdle='Drag & Drop your files (Supported file formats: JPG, JPEG, PNG) or <span class="filepond--label-action">Browse</span>'
    server={{
        url: Constant.apiBasePath + 'common/upload/blob/admin/image',
        process: {
            headers: {
                authkey: accessToken
            },
            onload: async (res) => {
                let datas = JSON.parse(res);

                if (datas.meta.status) {
                    // Prepare the new image object
                    const newImageObject = {
                        originalImageUrl: datas.data,
                        status: "pending",
                        imageThumbnail: await generateThumbnail(datas.data, data.prospectId), // Assuming this returns the thumbnail URL
                        url: await generateCompressedImage(datas.data,data.prospectId),
                    };

                    // Update the categoriesDocs state
                    setCategoriesDocs(prevDocs => {
                        const categoryValue = category.value; // The selected category's value
                        const existingCategory = prevDocs[categoryValue];

                        // Create a new category object or update the existing one
                        return {
                            ...prevDocs,
                            [categoryValue]: {
                                title: category.label,
                                images: existingCategory ? [...existingCategory.images, newImageObject] : [newImageObject]
                            }
                        };
                    });

                } else {
                    swal("Use JPG and PNG files only");
                }
            }
        }
    }}
/>

                                        </div>

                                    </div>)
                                })}
                                  <div className="col-12">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">Upload Video</h5>
                                        <FilePond
                                            maxFileSize="500MB"
                                            allowFileTypeValidation={true}
                                            acceptedFileTypes={[
                                                'video/mp4'
                                            ]}
                                            imagePreviewMaxHeight={100}
                                            credits={false}
                                            allowMultiple={true}
                                            allowRevert={false}
                                            name="video"
                                            labelIdle='Drag & Drop  .mp4 files (Supported Video formats: MP4, MOV, AVI, WMV) or <span class="filepond--label-action">Browse</span>'
                                            server={{
                                                url: Constant.apiBasePath + 'common/upload/blob/admin/video',
                                                process: {
                                                    headers: {
                                                        authkey: accessToken
                                                    }, onload: (res) => {

                                                        res = JSON.parse(res);
                                                        if (res.meta.status) {
                                                            addVedioUrl(res.data)
                                                            
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                            </div>
                            </div>
                            <div className="col-12">
                            <label htmlFor="propertyType">Property Type</label>
                            <select id="propertyType" name="propertyType" className="form-control" value={data.propertyType || ""}>
                                <option value="">Select</option>
                                <option value="Flat/Apartment">Flat/Apartment</option>
                                <option value="Residential Land / Plot">Residential Land / Plot</option>
                                <option value="Builder Floor">Builder Floor</option>
                                <option value="Independent House/Villa">Independent House/Villa</option>
                                <option value="Farm House">Farm House</option>
                            </select>
                            </div>

{/* Space between Dropdown and Text Fields */}
<div style={{ marginBottom: '80px' }}></div>

{/* No. of Bedroom */}
<div className="col-12">
  <label htmlFor="noOfBedroom">No. of Bedroom</label>
  <input type="number" id="noOfBedroom" name="noOfBedrooms" className="form-control" 
  placeholder="Enter number of bedrooms" value={data.noOfBedrooms || ""}/>
</div>
<div style={{ marginBottom: '80px' }}></div>
{/* No. of Bathroom */}
<div className="col-12">
  <label htmlFor="noOfBathroom">No. of Bathroom</label>
  <input type="number" id="noOfBathroom" name="noOfBathroom" className="form-control" placeholder="Enter number of bathrooms" 
  value={data.noOfBathroom || ""} />
</div>
<div style={{ marginBottom: '80px' }}></div>
{/* No. of Balcony */}
<div className="col-12">
  <label htmlFor="noOfBalcony">No. of Balcony</label>
  <input type="number" id="noOfBalcony" name="noOfBalcony" className="form-control" placeholder="Enter number of balconies" 
  value={data.noOfBalcony || ""}/>
</div>
<div style={{ marginBottom: '80px' }}></div>
<div className="col-12">
  <label htmlFor="halls">Halls</label>
  <select id="halls" name="halls" className="form-control"  value={data.halls || ""}>
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>
                          
<div style={{ marginBottom: '100px' }}></div>





                        </div>
                        <div className="form-group mt-1">
                            {
                                isReady ? <button type="submit"
                                                  className="btn btn-md btn-primary shadow-sm  mr-2"> Submit</button> :
                                <></>
                            }
                        </div>
                    </form>
                </div>
            </div>

        </div>


       

    </>)
}
export default PropertyManagement