import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import swal from 'sweetalert';
import Layout from "../../Layout";
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import putApiCall from "../../Services/putApiCall";
import Select from 'react-select';
import {FilePond, registerPlugin} from "react-filepond";
import 'filepond/dist/filepond.min.css'
import FilePondPluginFileValidateype from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import Constant from "../../Components/Constant";
import loginUser from "../../Services/loginUser";
// import {TagsInput} from "react-tag-input-component";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {blobUrl} from "../../Services/helpers";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { notAllowedSpecialcharacter, onlyAllowedNumber } from '../../Components/validationUtils'

let {accessToken} = loginUser();


registerPlugin(FilePondPluginImagePreview)
registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginFileValidateSize);
const PropertyAuctionAdd = (props) => {
    let id = (new URLSearchParams(window.location.search)).get("id");
    const history = useNavigate()
    const minDate = new Date().toISOString().split("T")[0];
    const [isReady, setIsReady] = useState(true);

    const [image, setImage] = useState();
    const [pricePerSquarFit, setPricePerSquarFit] = useState(null);
    const [data, setData] = useState({
        "id": "",
        "propertyId": "",
        "prospectId": "",
        "projectName": "",
        "contactName": "",
        "mobile": "",
        // "readyToMovedate": "",
        // "purchaseType": "",
        "stateName": "",
        "cityName": "",
        cityId: '',
        "address": "",
        "locality": "", //locality
        "latitude": "",
        "longitude": "",
       // "propertyType": '',
        "propertyTypeId": "",
        "noOfBedRooms": '',
        "noOfBathRooms": '',
        "noOfBalcones": '', // No
        "plotArea": "",
        // "poojaRoom": "NO",
        // "studyRoom": "NO",
        // "storeRoom": 'NO',
        // "servantRoom": 'NO',
        "floor": "", //no
        "totalFloor": "",
        "availabilityStatus": '', //no
        // "powerBackup": "NO",
        propertyDocument: [],
        auctionPropertyDocument: [],

        "document": [], // no
        "price": '',
        "description": "",
        "lift": "NO",
        // "swimmingPool": "NO",
        // "securityFireAlarm": "NO",
        // "vaastuCompliant": "NO",
        // "intercomFacility": "NO",
        // "separateEntryForServantRoom": "NO",
        // "noOpenDrainageAround": "NO",
        // "pipedGas": "NO",
        // "visitorParking": "NO",
        // "shoppingCenter": "NO",
        // "fitnessCenterGym": "NO",
        // "waterDisposal": "NO",
        // "rainWaterHarvesting": "NO",
        // "petFriendly": "NO",
        // "wheelChairFriendly": "NO",
        // "maintenanceStaff": "NO",
        // "waterStorage": "NO",
        // "park": "NO",
        "coveredParking": "",
        "unCoveredParking": "NO",
        "maintenanceCharges": '',
        // "waterCharges": '',
        // "clubCharges": 0,
        // "sinkingFund": 0,
        // "electricityCharges": 0,
        "borrowerName": "",
        "publicationDate": "",
        "propertyInspectionDate": "",
        "propertyInspectionTime": "",
        "EMDLastPaymentDate": "",
        "auctionDate": "",
        "estimatedMarketPrice": 0,
        "bidIncrementAmount": 0,
        "noOfAuction": 0,
        "auctionStartTime": "",
        "auctionEndTime": "",
        clubHouse: "NO",
        // waterSofteningPlant: "NO",
        buildingType: '',
        houseTourVideo: '',
        propertyBranchAddress:"",
        disperseAmount: 0,
        areaType: "",
        houseNo:"",
        possessionType:"",
        litigation:"",
    });


    const [categories, setCategories] = useState([]);
    const [categoriesOption, setCategoriesOption] = useState([]);
    const [categoriesDocs, setCategoriesDocs] = useState({});
    const [categoryImage, setCategoryImage] = useState({});


    const [propertyTypes, setPropertyTypes] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);


    const [editDocument, setEditDocument] = useState([]);


    const [auctionDocumentUploadShow, setAuctionDocumentUploadShow] = useState(false);
    const [auctionDocumentName, setAuctionDocumentName] = useState('');
    const [auctionDocumentUrl, setAuctionDocumentUrl] = useState('');

    const [documentUploadShow, setDocumentUploadShow] = useState(false);
    const [documentName, setDocumentName] = useState('');
    const [documentUrl, setDocumentUrl] = useState('');
    const [permission, setPermission] = useState({})

    useEffect(() => {
        let {category, image} = categoryImage;
        let cat_object = {};
        if (!category) {
            return;
        }
        if (!categoriesDocs[category.value]) {
            cat_object = {
                "title": category.label,
                "images": [image]
            }

        } else {
            cat_object = {
                "title": category.label,
                "images": [...categoriesDocs[category.value].images, image]
            }
        }
        setCategoriesDocs({
            ...categoriesDocs, [category.value]: cat_object
        });

    }, [categoryImage])


    const handleDocumentUploadClose = () => {
        setDocumentUploadShow(false);
        setDocumentName('');
        setDocumentUrl('');
    }
    const handleDocumentUploadShow = () => setDocumentUploadShow(true);
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


    const handleAuctionDocumentUploadClose = () => {
        setAuctionDocumentUploadShow(false);
        setAuctionDocumentName('');
        setAuctionDocumentUrl('');
    }
    const handleAuctionDocumentUploadShow = () => setAuctionDocumentUploadShow(true);
    const handleAuctionDocumentAdd = () => {
        //require name and url
        if (auctionDocumentName === '' || auctionDocumentUrl === '') {
            //sweet alert
            swal("Please enter document name and  Upload document");
            return;
        }
        setData({
            ...data,
            auctionPropertyDocument: [...data.auctionPropertyDocument, {
                name: auctionDocumentName,
                image: auctionDocumentUrl
            }]
        })
        handleAuctionDocumentUploadClose();
    };


    useEffect(() => {

        async function GetRole() {
            let Role = await useGetRoleModule("Auction Property");
            console.log(Role)
            if(Role.moduleList.read === false){
                setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
            }else{
               
                getApiCall('common/category/get-all',{},true).then((response) => {
                    if (response.meta.msg && response.data) {
                        let options = response.data.map((item) => {
                            return {value: item._id, label: item.title}
                        })
                        setCategoriesOption(options)
                    }
                });
        
                // States
                getApiCall('admin/state/getAll').then((response) => {
                    if (response.meta.msg && response.data) {
                        response.data.sort((a, b) => a.name.localeCompare(b.name));
                        setStates(response.data)
                    }
                });

                getEmenity();
                console.log("Role",Role.role)
                setPermission({...Role, role: Role.role === "admin" ? Role.role : "partner"})  
            }
        }
        GetRole()

    }, []);

    useEffect(() => {
        if (data.plotArea && data.price) {
            let pricePerSquarFit = data.price / data.plotArea;
            setPricePerSquarFit(pricePerSquarFit.toFixed(2));
        }

    }, [data.plotArea, data.price])

    useEffect(() => {
        getApiCall('common/property-type/get-all', {type: data.buildingType}).then((response) => {
            if (response.meta.msg && response.data) {
                setPropertyTypes(response.data)
            }
        });

    }, [data.buildingType]);

    useEffect(() => {
        let state = states.find((item) => item.name === data.stateName);
        if (state) {
            loadCities(state.isoCode)
        }
    }, [data.stateName, states]);


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


    async function getEmenity() {
        if (id) {
            let response = await getApiCall('user/property/getDetailsById/' + id);
            let property = response.data;
            if (response.meta.msg && response.data) {
                setData({
                    id: id,
                    propertyId: property.propertyId,
                    prospectId: property.prospectId,
                    projectName: property.projectName,
                    contactName: property.contactName,
                    mobile: property.mobile,
                    // readyToMovedate: property.readyToMovedate,
                    // purchaseType: property.purchaseType,
                    stateName: property.stateName,
                    cityName: property.cityName,
                    cityId: property.cityId,
                    address: property.address,
                    locality: property.locality,
                    latitude: property.latitude,
                    longitude: property.longitude,
                   // propertyType: property.propertyType,
                   buildingType:property.buildingType,
                    propertyTypeId: property.propertyTypeId,
                    noOfBedRooms: property.noOfBedRooms,
                    noOfBathRooms: property.noOfBathRooms,
                    noOfBalcones: property.noOfBalcones,
                    plotArea: property.plotArea,
                    // poojaRoom: property.poojaRoom,
                    soldStatus: property.soldStatus,
                    // studyRoom: property.studyRoom,
                    floor: property.floor,
                    totalFloor: property.totalFloor,
                    availabilityStatus: property.availabilityStatus,
                    // powerBackup: property.powerBackup,
                    document: property.document,
                    price: property.price,
                    description: property.description,
                    lift: property.lift,
                    // swimmingPool: property.swimmingPool,
                    // securityFireAlarm: property.securityFireAlarm,
                    // vaastuCompliant: property.vaastuCompliant,
                    // intercomFacility: property.intercomFacility,
                    // separateEntryForServantRoom: property.separateEntryForServantRoom,
                    // noOpenDrainageAround: property.noOpenDrainageAround,
                    // pipedGas: property.pipedGas,
                    // visitorParking: property.visitorParking,
                    // shoppingCenter: property.shoppingCenter,
                    // fitnessCenterGym: property.fitnessCenterGym,
                    // waterDisposal: property.waterDisposal,
                    // rainWaterHarvesting: property.rainWaterHarvesting,
                    // petFriendly: property.petFriendly,
                    // wheelChairFriendly: property.wheelChairFriendly,
                    // maintenanceStaff: property.maintenanceStaff,
                    // waterStorage: property.waterStorage,
                    // park: property.park,
                    coveredParking: property.coveredParking,
                    unCoveredParking: property.unCoveredParking,
                    maintenanceCharges: property.maintenanceCharges,
                    // waterCharges: property.waterCharges,
                    // clubCharges: property.clubCharges,
                    // sinkingFund: property.sinkingFund,
                    // electricityCharges: property.electricityCharges,
                    borrowerName: property.borrowerName,
                    publicationDate: property.publicationDate,
                    propertyInspectionDate: property.propertyInspectionDate,
                    propertyInspectionTime: property.propertyInspectionTime,
                    EMDLastPaymentDate: property.EMDLastPaymentDate,
                    auctionDate: property.auctionDate,
                    estimatedMarketPrice: property.estimatedMarketPrice ? property.estimatedMarketPrice : 0,
                    bidIncrementAmount: property.bidIncrementAmount,
                    noOfAuction: property.noOfAuction,
                    auctionStartTime: property.auctionStartTime,
                    auctionEndTime: property.auctionEndTime,
                    // waterSofteningPlant: property.waterSofteningPlant,
                    clubHouse: property.clubHouse,
                    propertyDocument: property.propertyDocument,
                    auctionPropertyDocument: property.auctionPropertyDocument ? property.auctionPropertyDocument : [],
                    // servantRoom: property.servantRoom,
                    // storeRoom: property.storeRoom,
                    houseTourVideo: property.houseTourVideo,
                    propertyBranchAddress: property?.propertyBranchAddress,
                    disperseAmount: property?.disperseAmount,
                    areaType: property?.areaType,
                    houseNo: property?.houseNo,
                    possessionType: property?.possessionType,
                    litigation: property?.litigation,

                })


                if (property.propertyImages) {
                    setEditDocument(property.propertyImages);
                }


            }
        }

    }

    // on change city name find city id and update state
    useEffect(() => {
        if (data.cityName) {
            let city = cities.find((item) => item.name === data.cityName);
            if (city) {
                setData({
                    ...data, cityId: city._id
                })
            }
        }
    }, [data.cityName, cities]);


    const onChange = (e) => {
    
        if (!Object.keys(data).includes(e.target.name)) return;
        switch (e.target.name) {
            case 'cityName':
                let city = cities.find((item) => item.name === e.target.value);
                if (city) {
                    setData({
                        ...data, [e.target.name]: e.target.value, cityId: city._id
                    })
                }
                break;
            default:
                let evt = e.target.getAttribute('data-name')
                let value = e.target.type == 'date' ||  e.target.type == 'time' ? e.target.value : evt != null ? onlyAllowedNumber(e.target.value) : notAllowedSpecialcharacter(e.target.value)
                setData({...data, [e.target.name]: value})
                break;


        }


    }

    const Save = async (form_data) => {
        console.log(form_data)
        const inputTimestamp = Date.parse(data.auctionDate);
        const minTimestamp = Date.parse(data.EMDLastPaymentDate);

        if (!(inputTimestamp >= minTimestamp)) {
            alert("Please enter Auction Date greater than or equal to " + data.EMDLastPaymentDate);
            return false;
        }
        const startDateTime = new Date();
        const endDateTime = new Date();

        const currentDate = new Date();
        const startDate = new Date(`${currentDate.toDateString()} ${data.auctionStartTime}`);
        const endDate = new Date(`${currentDate.toDateString()} ${data.auctionEndTime}`);

        if (endDate.getTime() <= startDate.getTime()) {
            alert("The auction end time must be after the start time.");
            return;
        }

        // if(!form_data.latitude) delete form_data.latitude;
        // if(!form_data.longitude) delete form_data.longitude;
        if (!form_data.propertyId) delete form_data.propertyId;
        if (!form_data.noOfBalcones) delete form_data.noOfBalcones;
        if (!form_data.maintenanceCharges) delete form_data.maintenanceCharges;
        if (!form_data.waterCharges) delete form_data.waterCharges;
        if (!form_data.projectName) delete form_data.projectName;
        // if (!form_data.readyToMovedate) delete form_data.readyToMovedate;
        if (!form_data.houseTourVideo) delete form_data.houseTourVideo;

        setIsReady(false)
        // postApiCall('user/property/createAuctionPropertyByAdmin', form_data, true)
        postApiCall('user/property/auction/add', form_data, true)
            .then((returnData) => {
                setIsReady(true)
                if (returnData.meta.status) {
                    swal({
                        text: returnData.meta.msg, icon: "success",
                    }).then(() => history('/properties/auction'))
                    
                }else{
                    swal({ text: returnData.meta.msg, icon: "warning", dangerMode: true });
                }
            })
            .catch(() => {
                setIsReady(true)
            })
    }

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


    function onImageSelect(e) {
        setImage(e.target.files[0])
    }

    function removePreviewImage(index, stateName) {
        setData({...data, [stateName]: data[stateName].filter((item, i) => i !== index)})
    }

    function removeCategoryPreviewImage(index, categoryId) {
        if (categoriesDocs[categoryId]) {
            categoriesDocs[categoryId].images = categoriesDocs[categoryId].images.filter((item, i) => i !== index);
            setCategoriesDocs({
                ...categoriesDocs, [categoryId]: categoriesDocs[categoryId]
            });
        }

        //setData({...data, [stateName]: data[stateName].filter((item, i) => i !== index)})
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        // data.document = categoriesDocs;
        //category docs convert to array and remove key
        let categoryDocs = [];
        for (const [key, value] of Object.entries(categoriesDocs)) {
            categoryDocs.push(value);
        }
        data.document = categoryDocs;
       // delete data.buildingType;

        if (id) {
            data.id = id;
            Save(data);
        } else {
            Save(data);
        }
    }


    return (<>
        <div className="container-fluid">
        { permission?.moduleList?.updateDisabled ?
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
            <>
            <div className="main-title"><h3> {id ? 'Update' : 'Add New'} Auction Property</h3></div>
            <div className="d-sm-flex align-items-center justify-content-end mb-4">
                
                <Link to={"/properties/auction"}
                      className="d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                    className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
            </div>
            <div className="card shadow mb-4">

                <div className="card-body">
                    <form onChange={onChange} onSubmit={onSubmit} className="hide-number-input-arrow">
                        <div className="row">
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Property Id *</label>
                                    <input type="text" name="propertyId" className="form-control"
                                           value={data.propertyId} required={true} />
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Prospect Number *</label>
                                    <input type="text" name="prospectId" className="form-control"
                                           value={data.prospectId} required={true} />
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Project Name</label>
                                    <input type="text" name="projectName" className="form-control"
                                           value={data.projectName}/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Contact Name*</label>
                                    <input type="text" name="contactName" className="form-control" required={true}
                                           value={data.contactName} data-name="contactName"/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Contact Mobile Number*</label>
                                    <input type="text" name="mobile" className="form-control" required={true}
                                           value={data.mobile} data-name="mobile"/>
                                </div>
                            </div>
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Ready To Move Date</label>
                                    <input type="date" name="readyToMovedate" className="form-control"
                                           min={id != null ? "" : minDate}
                                           value={data.readyToMovedate}/>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Purchase Type</label>
                                    <select name="purchaseType" className="form-control" value={data.purchaseType}>
                                        <option value="">Select</option>
                                        <option>Resale</option>
                                        <option>New Booking</option>
                                    </select>
                                </div>
                            </div> */}


                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Property Type*</label>
                                    <select name="buildingType" value={data.buildingType} className="form-control"
                                            required={true}>
                                        <option value="">Select Type</option>
                                        <option value="1">Residential</option>
                                        <option value="2">Commercial</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Property Sub Type*</label>
                                    <select name="propertyTypeId" value={data.propertyTypeId} required={true}
                                            className="form-control">
                                        <option value="">Select Sub Type</option>
                                        {propertyTypes.map((propertyType, index) => {
                                            return <option key={index}
                                                           value={propertyType._id}>{propertyType.name}</option>
                                        })}
                                    </select>
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
                                    <select name="cityName" value={data.cityName} className="form-control"
                                            required={true}>
                                        <option value="">Select Type</option>
                                        {cities.map((city, index) => {
                                            return <option key={index}
                                                           value={city.name}>{city.name}</option>
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Property Latitude *</label>
                                    <input type="text" name="latitude" className="form-control"
                                           value={data.latitude} data-name="latitude"/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Property Longitude *</label>
                                    <input type="text" name="longitude" className="form-control"
                                           value={data.longitude} data-name="longitude"/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>House No/flat no/Building Name</label>
                                    <input type="text" name="houseNo" className="form-control"
                                           value={data.houseNo}/>
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Property Address*</label>
                                    <input type="text" name="address" className="form-control" required={true}
                                           value={data.address}/>
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Locality *</label>
                                    <input type="text" name="locality" className="form-control" required={true}
                                           value={data.locality}/>
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>No of Bedrooms*</label>
                                    <input type="text" name="noOfBedRooms" className="form-control" data-name="noOfBedRooms" required={true}
                                           value={data.noOfBedRooms} />
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>No of Bathrooms*</label>
                                    <input type="text" name="noOfBathRooms" className="form-control" data-name="noOfBathRooms" required={true}
                                           value={data.noOfBathRooms}/>
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Balcony</label>
                                    <input type="text" className="form-control" name="noOfBalcones"
                                           value={data.noOfBalcones} data-name="noOfBalcones"/>
                                </div>
                            </div>


                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Floor</label>
                                    <input type="text" name="floor" className="form-control" data-name="floor" value={data.floor}/>
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Total Floors</label>
                                    <input type="text" name="totalFloor" className="form-control" 
                                           value={data.totalFloor} data-name="totalFloor"/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Completion Status*</label>
                                    <select name="availabilityStatus" value={data.availabilityStatus} required={true}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="1">Ready to move</option>
                                        <option value="2">under construction</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Possession Type*</label>
                                    <input type="text" name="possessionType" className="form-control" required={true}
                                           value={data.possessionType}/>
                                    {/* <select name="possessionType" value={data.possessionType} className="form-control" required>
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select> */}
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Encumbrances and/or Litigation*</label>
                                    <input type="text" name="litigation" className="form-control" required={true}
                                           value={data.litigation}/>
                                    {/* <select name="litigation" value={data.litigation} className="form-control" required>
                                        <option value="">Select</option>
                                        <option value="Symbolic">Symbolic</option>
                                        <option value="Physical">Physical</option>
                                    </select> */}
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Sold Status</label>
                                    <select name="soldStatus" value={data.soldStatus} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div>
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Pooja Room</label>
                                    <select name="poojaRoom" value={data.poojaRoom} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Study Room</label>
                                    <select name="studyRoom" value={data.studyRoom} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Store Room</label>
                                    <select name="storeRoom" value={data.storeRoom} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Servant Room</label>
                                    <select name="servantRoom" value={data.servantRoom} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {
                                // data.servantRoom == 'YES' ?
                                //     <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                //         <div className="form-group">
                                //             <label htmlFor="exampleFormControlSelect1">Separate Entry For Servant
                                //                 Room</label>
                                //             <select name="separateEntryForServantRoom"
                                //                     value={data.separateEntryForServantRoom} className="form-control">
                                //                 <option value="">Select</option>
                                //                 <option value="YES">Yes</option>
                                //                 <option value="NO">No</option>
                                //             </select>
                                //         </div>
                                //     </div>
                                //     : null
                            }


                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Power Backup</label>
                                    <select name="powerBackup" value={data.powerBackup} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}

                             <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Area Type*</label>
                                    <select name="areaType" value={data.areaType} className="form-control" required>
                                        <option value="">Select</option>
                                        <option value="Super area">Super area</option>
                                        <option value="Builtup area">Builtup area</option>
                                        <option value="Carpet area">Carpet area</option>
                                        <option value="Plot area">Plot area</option>
                                        <option value="Land Area">Land Area</option>
                                        <option value="Saleable Area">Saleable Area</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Plot Area *</label>
                                    <input type="text" name="plotArea" className="form-control" required={true}
                                           value={data.plotArea} data-name="plotArea"/>
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Reserve Price*</label>
                                    <input type="text" name="price" className="form-control" value={data.price}
                                           required={true} data-name="price"/>
                                </div>
                            </div>
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Price Per Square Fit</label>
                                    <input disabled={true} className="form-control" value={pricePerSquarFit}/>
                                </div>
                            </div> */}

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Disburse Amount*</label>
                                    <input type="number" name="disperseAmount" className="form-control" value={data.disperseAmount}
                                           required={true}/>
                                </div>
                            </div>

                            
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Description*</label>
                                    <input type="text" name="description" className="form-control"
                                           value={data.description} required={true}/>
                                </div>
                            </div>


                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Lift</label>
                                    <select name="lift" value={data.lift} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Covered Parking *</label>
                                    <input type="text" name="coveredParking" className="form-control" required={true}
                                           value={data.coveredParking}/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Uncovered Parking *</label>
                                    <input type="text" name="unCoveredParking" className="form-control" required={true}
                                           value={data.unCoveredParking}/>
                                </div>
                            </div>


                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Swimming Pool</label>
                                    <select name="swimmingPool" value={data.swimmingPool} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Security Fire Alarm</label>
                                    <select name="securityFireAlarm" value={data.securityFireAlarm}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Vastu Compliant</label>
                                    <select name="vaastuCompliant" value={data.vaastuCompliant}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Intercom Facility</label>
                                    <select name="intercomFacility" value={data.intercomFacility}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}

                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">No Open drainage around</label>
                                    <select name="noOpenDrainageAround" value={data.noOpenDrainageAround}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Piped-gas</label>
                                    <select name="pipedGas" value={data.pipedGas} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Visitor Parking</label>
                                    <select name="visitorParking" value={data.visitorParking}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Shopping Center</label>
                                    <select name="shoppingCenter" value={data.shoppingCenter}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Fitness Center Gym</label>
                                    <select name="fitnessCenterGym" value={data.fitnessCenterGym}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Water Disposal</label>
                                    <select name="waterDisposal" value={data.waterDisposal}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Rain water harvesting</label>
                                    <select name="rainWaterHarvesting" value={data.rainWaterHarvesting}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Pet Friendly</label>
                                    <select name="petFriendly" value={data.petFriendly} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Wheel Chair Friendly</label>
                                    <select name="wheelChairFriendly" value={data.wheelChairFriendly}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Maintenance Staff</label>
                                    <select name="maintenanceStaff" value={data.maintenanceStaff}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Water Storage</label>
                                    <select name="waterStorage" value={data.waterStorage} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Club house/ Community center</label>
                                    <select name="clubHouse" value={data.clubHouse} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div>
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Water Softening plant</label>
                                    <select name="waterSofteningPlant" value={data.waterSofteningPlant}
                                            className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label htmlFor="exampleFormControlSelect1">Park</label>
                                    <select name="park" value={data.park} className="form-control">
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                </div>
                            </div> */}

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Pending Dues</label>
                                    <input type="text" name="maintenanceCharges" className="form-control"
                                           value={data.maintenanceCharges} data-name="maintenanceCharges"/>
                                </div>
                            </div>
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Monthly Water Charges (in Rs)</label>
                                    <input type="number" name="waterCharges" className="form-control"
                                           value={data.waterCharges}/>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Monthly Club charges (in Rs)</label>
                                    <input type="number" name="clubCharges" className="form-control"
                                           value={data.clubCharges}/>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Monthly Sinking fund (in Rs)</label>
                                    <input type="number" name="sinkingFund" className="form-control"
                                           value={data.sinkingFund}/>
                                </div>
                            </div> */}
                            {/* <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Monthly Electricity Charges (in Rs)</label>
                                    <input type="number" name="electricityCharges" className="form-control"
                                           value={data.electricityCharges}/>
                                </div>
                            </div> */}
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Borrowers Name* <i class="fa fa-info-circle" data-toggle="tooltip" title="Borrower names are multiple it should be entered as comma separated." data-placement="top" style={{fontSize:14}}></i></label>
                                    <input type="text" name="borrowerName" className="form-control"
                                           value={data.borrowerName}/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Publication Date*</label>
                                    <input type="date" name="publicationDate" className="form-control" required={true}
                                           value={data.publicationDate}/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Property Inspection Date*</label>
                                    <input type="date" name="propertyInspectionDate" className="form-control"
                                           required={true}
                                           value={data.propertyInspectionDate}/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Property Inspection Time*</label>
                                    <input type="time" name="propertyInspectionTime" className="form-control"
                                           required={true}
                                           value={data.propertyInspectionTime}/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>EMD Last Payment Date*</label>
                                    <input type="date" name="EMDLastPaymentDate" className="form-control"
                                           required={true}
                                           value={data.EMDLastPaymentDate}/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Auction Date*</label>
                                    <input type="date" name="auctionDate" className="form-control"
                                           value={data.auctionDate}/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Estimated Market Price</label>
                                    <input type="number" name="estimatedMarketPrice" className="form-control"
                                           value={data.estimatedMarketPrice}/>
                                </div>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Auction Start Time*</label>
                                    <input type="time" name="auctionStartTime" className="form-control" required={true}
                                           value={data.auctionStartTime}/>
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Auction End Time*</label>
                                    <input type="time" name="auctionEndTime" className="form-control" required={true}
                                           value={data.auctionEndTime}/>
                                </div>
                            </div>


                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Bid Increment Amount*</label>
                                    <input type="text" name="bidIncrementAmount" className="form-control"
                                           required={true}
                                           value={data.bidIncrementAmount} data-name="bidIncrementAmount" />
                                </div>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                                <div className="form-group">
                                    <label>Number of Auctions *</label>
                                    <input type="text" name="noOfAuction" className="form-control" required={true}
                                           value={data.noOfAuction} data-name="noOfAuction"/>
                                </div>
                            </div>

                            <div className="col-12 col-xs-8 col-md-8 col-lg-8">
                                <div className="form-group">
                                    <label>Property Branch address field*</label>
                                    <input type="text" name="propertyBranchAddress" className="form-control" required={true} value={data.propertyBranchAddress}/>
                                </div>  
                            </div>


                            <div className="col-12 my-4">
                                <div className="form-group file-pond-section">
                                    <label htmlFor="exampleFormControlFile1">Property Document</label>
                                    <div className="img-preview">
                                        {data.propertyDocument.map((item, index) => {
                                            // console.log('item', item)
                                            return (<div key={index}>
                                                <p>
                                                    <a className={"btn btn-link m-2"} href={item.image}
                                                       target="_blank" rel="noopener noreferrer">{item.name}</a>
                                                    <button type="button" className="btn btn-danger btn-sm"
                                                            onClick={() => {
                                                                removePreviewImage(index, 'propertyDocument')
                                                            }}>X
                                                    </button>
                                                </p>

                                            </div>)
                                        })
                                        }

                                    </div>
                                    <button type="button" className="btn btn-primary btn-sm"
                                            onClick={handleDocumentUploadShow}>Add Document
                                    </button>
                                </div>
                            </div>
                            <div className="col-12 my-4">
                                <div className="form-group file-pond-section">
                                    <label htmlFor="exampleFormControlFile1">Auction Property Document</label>
                                    <div className="img-preview">
                                        {data.auctionPropertyDocument.map((item, index) => {
                                            // console.log('item', item)
                                            return (<div key={index}>
                                                <p>
                                                    <a className={"btn btn-link m-2"} href={item.image}
                                                       target="_blank" rel="noopener noreferrer">{item.name}</a>
                                                    <button type="button" className="btn btn-danger btn-sm"
                                                            onClick={() => {
                                                                removePreviewImage(index, 'auctionPropertyDocument')
                                                            }}>X
                                                    </button>
                                                </p>

                                            </div>)
                                        })
                                        }

                                    </div>
                                    <button type="button" className="btn btn-primary btn-sm"
                                            onClick={handleAuctionDocumentUploadShow}>Add Document
                                    </button>
                                </div>
                            </div>


                            <div className="col-12">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title text-center">House Tour Video</h5>
                                        {data.houseTourVideo ?
                                            <video width="320" height="240" controls className="preview__video">
                                                <source src={blobUrl(data.houseTourVideo)} type="video/mp4"/>
                                            </video>
                                            : ''
                                        }
                                        <FilePond
                                            maxFileSize="200MB"
                                            allowFileTypeValidation={true}
                                            acceptedFileTypes={[
                                                'video/mp4'
                                            ]}
                                            imagePreviewMaxHeight={100}
                                            credits={false}
                                            // allowMultiple={true}
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
                                                            console.log('res', res.data)
                                                            setData({
                                                                ...data,
                                                                houseTourVideo: res.data
                                                            });
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
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
                                                    <div className="img-preview__item" key={index}>
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
                                                maxFileSize="50MB"
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
                                                        onload: (res) => {
                                                            // if file is last
                                                            let data = JSON.parse(res);
                                                            let cat_obj = {};

                                                            if (data.meta.status) {
                                                                // when category Image Update use-effect catch the state change, and update setCategory State
                                                                setCategoryImage({
                                                                    category: category,
                                                                    image: data.data
                                                                })
                                                                // this code is not working for multiple images
                                                                // console.log('category.value', category.value)
                                                                // if (!categoriesDocs[category.value]) {
                                                                //     console.log('!categoriesDocs[category.value]', data.data)
                                                                //     cat_obj = {
                                                                //         "title": category.label,
                                                                //         "images": [data.data]
                                                                //     }
                                                                //
                                                                // } else {
                                                                //     cat_obj = {
                                                                //         "title": category.label,
                                                                //         "images": [...categoriesDocs[category.value].images, data.data]
                                                                //     }
                                                                // }
                                                                // setCategoriesDocs({
                                                                //     ...categoriesDocs, [category.value]: cat_obj
                                                                // });
                                                            }
                                                        }
                                                    }
                                                }}


                                            />
                                        </div>

                                    </div>)
                                })}
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
            </div></>}


        </div>
                        


        <Modal show={documentUploadShow} onHide={handleDocumentUploadClose}>
            <Modal.Header closeButton>
                <Modal.Title>Upload New Document</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <div className="form-group file-pond-section">
                    <label htmlFor="exampleFormControlFile1">Document Name</label>
                    <input type="text" className="form-control form-control-sm" value={documentName} onChange={(e) => {
                        setDocumentName(e.target.value)
                    }
                    }/>
                </div>
                <FilePond
                    maxFileSize="50MB"
                    allowFileTypeValidation={true}
                    acceptedFileTypes={['application/pdf']}
                    imagePreviewMaxHeight={100}
                    credits={false}
                    // allowMultiple={true}
                    // allowRevert={false}
                    name="document"
                    labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                    onprocessfile={(error, file) => {
                        if (!documentName) setDocumentName(file.filename)
                        // console.log("filenameWithoutExtension", file.filenameWithoutExtension)
                    }}
                    server={{
                        url: Constant.apiBasePath + 'common/upload/blob/admin/document',
                        process: {
                            headers: {
                                authkey: accessToken
                            },
                            onload: (res) => {
                                //get file name

                                res = JSON.parse(res);
                                if (res.meta.status) {
                                    setDocumentUrl(res.data);
                                }
                            },

                        }
                    }}
                /></Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleDocumentUploadClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleDocumentAdd}>
                    Add Document
                </Button>
            </Modal.Footer>
        </Modal>

        <Modal show={auctionDocumentUploadShow} onHide={handleDocumentUploadClose}>
            <Modal.Header closeButton>
                <Modal.Title>Upload New Auction Document</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <div className="form-group file-pond-section">
                    <label htmlFor="exampleFormControlFile1">Document Name</label>
                    <input type="text" className="form-control form-control-sm" value={auctionDocumentName}
                           onChange={(e) => {
                               setAuctionDocumentName(e.target.value)
                           }
                           }/>
                </div>
                <FilePond
                    maxFileSize="50MB"
                    allowFileTypeValidation={true}
                    acceptedFileTypes={['application/pdf']}
                    imagePreviewMaxHeight={100}
                    credits={false}
                    // allowMultiple={true}
                    // allowRevert={false}
                    name="document"
                    labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                    onprocessfile={(error, file) => {
                        if (!auctionDocumentName) setAuctionDocumentName(file.filename)
                        // console.log("filenameWithoutExtension", file.filenameWithoutExtension)
                    }}
                    server={{
                        url: Constant.apiBasePath + 'common/upload/blob/admin/document',
                        process: {
                            headers: {
                                authkey: accessToken
                            },
                            onload: (res) => {
                                //get file name
                                res = JSON.parse(res);
                                if (res.meta.status) {
                                    setAuctionDocumentUrl(res.data);
                                }
                            },

                        }
                    }}
                /></Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleAuctionDocumentUploadClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleAuctionDocumentAdd}>
                    Add Document
                </Button>
            </Modal.Footer>
        </Modal>


    </>)
}

export default PropertyAuctionAdd
