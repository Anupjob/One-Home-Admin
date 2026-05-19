import React, { useState,useEffect } from 'react';
import getApiCall from "../../Services/getApiCall";
import postApiCall from '../../Services/postApiCall';
import moment from 'moment';

import swal from 'sweetalert';
import { FilePond } from "react-filepond";
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import Constant from "../../Components/Constant";
import loginUser from "../../Services/loginUser";
import { toast } from 'react-toastify';
import { ToWords } from 'to-words';
import axios from 'axios';
let {accessToken} = loginUser();

const PropertyDetailsForm = () => {
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [error, setError] = useState(null);
    const [address, setAddress] = useState('');
    const [categoryImage, setCategoryImage] = useState([]);
    const [isReady, setIsReady] = useState(true);
    const [data, setData] = useState({
        houseTourVideo: [],
        stateName:"",
        cityName:"",
        updatedTime: "",
        propertyType:"",
        subCategory:"",
        configuration:"",
        noOfFloor:0,
        propertyId:"",
        landArea:0,
        constructionStage: "",
        buildUpArea:""
    });

    useEffect(()=>{
        getApiCall('admin/state/getAll').then((response) => {
            if (response.meta.msg && response.data) {
                let statesShort = response.data.sort((a, b) => a.name > b.name ? 1 : -1);
                setStates(statesShort)
            }
        });

        const getLocation = () => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setLatitude(position.coords.latitude);
                  setLongitude(position.coords.longitude);
                },
                (error) => {
                  setError(error.message);
                  alert(error.message)
                }
              );
            } else {
              setError('Geolocation is not supported by your browser.');
            }
          };
      
          getLocation();
    },[])

    // inside your useEffect or async function
    useEffect(() => {
        const apiKey = Constant.googleApiKey;

        async function fetchAddress() {
            try {
                const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

                const res = await axios.get(apiUrl);

                const data = res.data; // Axios auto-parses JSON

                if (data && data.results && data.results.length > 0) {
                    setAddress(data.results[0].formatted_address);
                } else {
                    setError("No address found for the given coordinates.");
                }
            } catch (error) {
                console.error("Axios error:", error);
                setError("Error fetching address data.");
            }
        }

        if (latitude && longitude) {
            fetchAddress();
        }
    }, [latitude, longitude]);


      useEffect(() => {
        let state = states.find((item) => item.name === data.stateName);
        if (state) {
            loadCities(state.isoCode)
        }
    }, [data.stateName, states]);


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

    const onChange = (e) => {
        setData({
            ...data, [e.target.name]: e.target.value,
        })
    }
    const onSubmit = async (e)=>{
        if (!isReady) return
        e.preventDefault()
        let obj={
            "videoUrls": data.houseTourVideo,
            "imageUrls": categoryImage,
            "address": address,
            "city": data.cityName,
            "state": data.stateName,
            "latitude": latitude,
            "longitude": longitude,
            "propertyType": data.propertyType,
            "propertyCategory": data.subCategory,
            "buildingType": parseInt(data.configuration),
            "floorCount": parseInt(data.noOfFloor),
            "prospectId": data.propertyId,
            "landArea": parseInt(data.landArea),
            "constructionStage": data.constructionStage,
            "buildUpArea": parseInt(data.buildUpArea)
        }
        setIsReady(false)
        let returnData =    await postApiCall('user/property/createProperty/location-wise', obj, true)
            if (returnData.meta.status) {
                // swal({text: returnData.meta.msg, icon: "success", timer: 1500})
                swal({
                    text: returnData.meta.msg, icon: "success",
                    timer: 5000
                })
                setData({  houseTourVideo: [],
                    stateName:"",
                    cityName:"",
                    updatedTime: "",
                    propertyType:"",
                    subCategory:"",
                    configuration:"",
                    noOfFloor:0,
                    propertyId:"",
                    landArea:0,
                    constructionStage: "",
                    buildUpArea:""
                })
                // history('/properties')
            }
       
        
    }

    return (
        <>
            <div className="card-body">
                <form className=""  onChange={onChange} onSubmit={onSubmit} >
                    <div className="row">
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                            <label>Videos *</label>
                                <FilePond
                                    maxFileSize="200MB"
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
                                                const newItem = res.data
                                                const updatedItems = [...data.houseTourVideo, newItem];
                                                setData({
                                                    ...data,
                                                    houseTourVideo: updatedItems
                                                })
                                            
                                            }
                                        }
                                    }
                                }}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                            <label>Images *</label>
                                <FilePond
                                   maxFileSize="50MB"
                                   allowFileTypeValidation={true}
                                   acceptedFileTypes={['image/*']}
                                   imagePreviewMaxHeight={100}
                                   credits={false}
                                   allowMultiple={true}
                                   allowRevert={false}
                                   name="image"
                                   labelIdle='Drag & Drop your files(Supported file formats: JPG, JPEG, PNG) or <span class="filepond--label-action">Browse</span>'
                                   server={{
                                    url: Constant.apiBasePath + 'common/upload/blob/admin/image',
                                    process: {
                                        headers: {
                                            authkey: accessToken
                                        },
                                        onload: (res) => {
                                            // if file is last
                                            let data = JSON.parse(res);
                                            let cat_obj = {};

                                            if (data.meta.status) {
                                                const newItem = data.data
                                                const updatedItems = [...categoryImage, newItem];
                                                setCategoryImage(updatedItems)
                                            } else {
                                                swal("use jpg and png file only");

                                            }
                                        }

                                    }
                                }}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label>Address *</label>
                                <input type="text" name="address" className="form-control"  required={true}
                                value={address} />

                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label htmlFor="exampleFormControlSelect1">State*</label>
                                <select name="stateName" value={data.stateName} className="form-control"
                                    required={true}>
                                    <option value="">Select Type</option>
                                    {states.map((state, index) => {
                                        return <option key={index}
                                            value={state.name}
                                            isoCode={state.isoCode}>{state.name}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label htmlFor="exampleFormControlSelect1">City*</label>
                                <select name="cityName" className="form-control"  value={data.cityName} 
                                    required={true}>
                                    <option value="" _id={''}>Select</option>
                                    {cities.map((city, index) => {
                                        return <option key={index} _id={city._id}
                                            value={city.name}>{city.name}</option>
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label>Property Latitude *</label>
                                <input type="text" name="latitude" className="form-control"
                                  value={latitude}  data-name="latitude" disabled/>
                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label>Property Longitude *</label>
                                <input type="text" name="longitude" className="form-control"
                                  value={longitude}  data-name="longitude" disabled/>
                            </div>
                        </div>
                        {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label>Updated Time</label>
                                <input type="text" name="updatedTime" className="form-control"
                                 value={data.updatedTime}  required={true}    data-name="updatedTime" />
                            </div>
                        </div> */}
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label htmlFor="exampleFormControlSelect1">Property Type*</label>
                                <select name="propertyType" required={true} value={data.propertyType}
                                    className="form-control">
                                    <option value="">Select</option>
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label htmlFor="exampleFormControlSelect1">Sub Categroy*</label>
                                <select name="subCategory" required={true} value={data.subCategory}
                                    className="form-control">
                                    <option value="">Select</option>
                                    <option value="land">Land</option>
                                    <option value="apartment">Aparment</option>
                                    <option value="plot">Plot</option>
                                    <option value="floor">Floor</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label htmlFor="exampleFormControlSelect1">Configuration*</label>
                                <select name="configuration" required={true} value={data.configuration}
                                    className="form-control">
                                    <option value="">Select</option>
                                    <option value="2">2BHK</option>
                                    <option value="3">3BHK</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label>No. oF floors*</label>
                                <input type="number" name="noOfFloor" className="form-control"
                                    required={true} value={data.noOfFloor}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label>Prospect Number *</label>
                                <input type="text" name="propertyId" className="form-control"
                                    required={true} data-name="propertyId" value={data.propertyId} />
                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label>Land Area(in sq.ft)*</label>
                                <input type="number" name="landArea" className="form-control"
                                    required={true} value={data.landArea}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label htmlFor="exampleFormControlSelect1">Construction Stage*</label>
                                <select name="constructionStage" required={true} value={data.constructionStage}
                                    className="form-control">
                                    <option value="">Select</option>
                                    <option value="plinth">Plinth</option>
                                    <option value="structure">Structure</option>
                                    <option value="finishing">Finishing Complete</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                            <div className="form-group">
                                <label>Build Up Area*</label>
                                <input type="number" name="buildUpArea" className="form-control"
                                    required={true} value={data.buildUpArea}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-md btn-primary shadow-sm  mr-2" disabled={!latitude || !categoryImage.length || !data.houseTourVideo.length}> Submit</button>
                    </div>
                </form>
            </div>

        </>);
}
export default PropertyDetailsForm;
