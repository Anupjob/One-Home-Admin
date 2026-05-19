import React, {useEffect, useState} from 'react'

import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

import getApiCall from "../../Services/getApiCall";
import {Link} from "react-router-dom";
import useGetRoleModule from "../../Services/useGetRoleModule";
import { blobUrl } from "../../Services/helpers";
import { useParams } from 'react-router';

const PropertyDetails = (props) => {
    let {id} = useParams();
    const [categories, setCategories] = useState([]);
    const [categoriesOption, setCategoriesOption] = useState([]);
    const [categoriesDocs, setCategoriesDocs] = useState({});
    const [editDocument, setEditDocument] = useState([]);
    const [permission, setPermission] = useState({});

    const [data, setData] = useState({
        propertyFor: 1,
        houseTourVideo: '',
        soldStatus: '',
        "id": "",
        "propertyId": "",
        "projectName": "",
        "contactName": "",
        "mobile": "",
        "readyToMovedate": "",
        "purchaseType": "",
        "stateName": "",
        "cityName": "",
        "address": "",
        "locality": "", //locality
        "latitude": "",
        "longitude": "",
        "propertyType": '',
        "propertyTypeId": "",
        "noOfBedRooms": '',
        "noOfBathRooms": '',
        "noOfBalcones": '', // No
        "plotArea": "",
        "poojaRoom": "",
        "studyRoom": "",
        "storeRoom": '',
        "servantRoom": '',
        "floor": "", //no
        "totalFloor": "",
        "availabilityStatus": '', //no
        "powerBackup": "",
        propertyDocument: [],

        "document": [],
        "price": '',
        "description": "",
        "lift": "",
        "swimmingPool": "",
        "securityFireAlarm": "",
        "vaastuCompliant": "",
        "intercomFacility": "",
        "separateEntryForServantRoom": "",
        "noOpenDrainageAround": "",
        "pipedGas": "",
        "visitorParking": "",
        "shoppingCenter": "",
        "fitnessCenterGym": "",
        "waterDisposal": "",
        "rainWaterHarvesting": "",
        "petFriendly": "",
        "wheelChairFriendly": "",
        "maintenanceStaff": "",
        "waterStorage": "",
        "park": "",
        "coveredParking": "",
        "unCoveredParking": "",
        "maintenanceCharges": '',
        "waterCharges": '',
        "clubCharges": 0,
        "sinkingFund": 0,
        "electricityCharges": 0,
        "bidIncrementAmount": 0,
        clubHouse: "",
        waterSofteningPlant: "",
        "borrowerName": "",
        "publicationDate": "",
        "propertyInspectionDate": "",
        "propertyInspectionTime": "",
        "EMDLastPaymentDate": "",
        "auctionDate": "",
        "estimatedMarketPrice": 0,
        "noOfAuction": 0,
        "auctionStartTime": "",
        "auctionEndTime": "",
        buildingType:'',

    });



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

    async function GetRole() {
        let Role = await useGetRoleModule("Property Management");
        if (Role.moduleList.read === false) {
          setPermission({
            moduleAccress: false,
            moduleList: {},
            message: "Module Need Some Permission...Pls contact with Your Partner",
          });
        } else {
            getDetails()
        getApiCall('common/category/get-all').then((response) => {
            if (response.meta.msg && response.data) {
                let options = response.data.map((item) => {
                    return {value: item._id, label: item.title}
                })
                setCategoriesOption(options)
            }
        });
          setPermission(Role);
        }
      }

    useEffect(() => {
        GetRole()
    }, []);

    async function getDetails() {
        if (id) {
            let response = await getApiCall('user/property/getDetailsById/' + id);
            let property = response.data;
            if (response.meta.msg && response.data) {
                setData({
                    id: id,
                    propertyId: property.propertyId,
                    projectName: property.projectName,
                    contactName: property.contactName,
                    mobile: property.mobile,
                    readyToMovedate: property.readyToMovedate,
                    purchaseType: property.purchaseType,
                    stateName: property.stateName,
                    cityName: property.cityName,
                    address: property.address,
                    locality: property.locality,
                    latitude: property.latitude,
                    longitude: property.longitude,
                    propertyType: property.propertyType,
                    propertyTypeId: property.propertyTypeData?.name,
                    noOfBedRooms: property.noOfBedRooms,
                    noOfBathRooms: property.noOfBathRooms,
                    noOfBalcones: property.noOfBalcones,
                    plotArea: property.plotArea,
                    poojaRoom: property.poojaRoom,
                    soldStatus: property.soldStatus,
                    studyRoom: property.studyRoom,
                    floor: property.floor,
                    totalFloor: property.totalFloor,
                    availabilityStatus: property.availabilityStatus,


                    powerBackup: property.powerBackup,
                    document: property.document,
                    price: property.price,
                    description: property.description,
                    lift: property.lift,
                    swimmingPool: property.swimmingPool,
                    securityFireAlarm: property.securityFireAlarm,
                    vaastuCompliant: property.vaastuCompliant,
                    intercomFacility: property.intercomFacility,
                    separateEntryForServantRoom: property.separateEntryForServantRoom,
                    noOpenDrainageAround: property.noOpenDrainageAround,
                    pipedGas: property.pipedGas,
                    visitorParking: property.visitorParking,
                    shoppingCenter: property.shoppingCenter,
                    fitnessCenterGym: property.fitnessCenterGym,
                    waterDisposal: property.waterDisposal,
                    rainWaterHarvesting: property.rainWaterHarvesting,
                    petFriendly: property.petFriendly,
                    wheelChairFriendly: property.wheelChairFriendly,
                    maintenanceStaff: property.maintenanceStaff,
                    waterStorage: property.waterStorage,
                    park: property.park,
                    coveredParking: property.coveredParking,
                    unCoveredParking: property.unCoveredParking,
                    maintenanceCharges: property.maintenanceCharges,
                    waterCharges: property.waterCharges,
                    clubCharges: property.clubCharges,
                    sinkingFund: property.sinkingFund,
                    electricityCharges: property.electricityCharges,
                    // estimatedMarketPrice: property.estimatedMarketPrice,
                    bidIncrementAmount: property.bidIncrementAmount,
                    waterSofteningPlant: property.waterSofteningPlant,
                    clubHouse: property.clubHouse,
                    propertyDocument: property.propertyDocument,
                    servantRoom: property.servantRoom,
                    // buildingType : property.buildingType,
                    storeRoom: property.storeRoom,
                    houseTourVideo: property.houseTourVideo,
                    propertyFor: property.propertyFor,

                    borrowerName: property.borrowerName,
                    publicationDate: property.publicationDate,
                    propertyInspectionDate: property.propertyInspectionDate,
                    propertyInspectionTime: property.propertyInspectionTime,
                    EMDLastPaymentDate: property.EMDLastPaymentDate,
                    auctionDate: property.auctionDate,
                    estimatedMarketPrice: property.estimatedMarketPrice,
                    noOfAuction: property.noOfAuction,
                    auctionStartTime: property.auctionStartTime,
                    auctionEndTime: property.auctionEndTime,
                    auctionPropertyDocument: property.auctionPropertyDocument ? property.auctionPropertyDocument : [],
                    buildingType : property.buildingType,

                })


                if (property.propertyImages) {
                    setEditDocument(property.propertyImages);
                }


            }
        }

    }


    return (
        
        <>
            <div className="container-fluid">
            {permission.hasOwnProperty("moduleAccress") &&
        !permission.moduleAccress ? (
          <div className="row text-center">
            <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
              <div className="errer">
                <img src="/program-error.png" />
                <h2>403</h2>
                {/* <h4 className="text-danger">{permission.message}</h4> */}
                <p>{permission.message}</p>
              </div>
            </div>
          </div>
        ) : (
                <>
                <div className="main-title"><h3>Property Details </h3></div>
                <div className="row mb-4">
                    <div className='col-9 col-sm-10 col-md-10 col-lg-10'>
                    <h4>Property Details - {data.propertyId}, {data.address}</h4>
                    </div>
                    <div className='col-3 col-sm-2 col-md-2 col-lg-2 text-end'>
                    {permission?.moduleList?.updateDisabled ? null : (
                    <Link to={ (data.propertyFor !== 2 ?  "/property/add?id=" : "/property/auction/add?id=") + id }
                          className="btn btn-warning btn-sm mb-1 mr-1">
                                                    <span className="icon">
                                                        <i className="far fa-edit"></i> Edit
                                                    </span>
                    </Link>)}
                    </div>
                </div>
                <div className="card mb-2">
                    <div className="card-body">

                        <div className="row">
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Property Id</strong> : {data.propertyId}   </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Project Name</strong> : {data.projectName} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Contact Name</strong> : {data.contactName} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Contact Number</strong> : {data.mobile} </span>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Ready To Move Date</strong> : {data.readyToMovedate} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Purchase Type</strong> : {data.purchaseType} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Property Type</strong> : {data.propertyType === 1 ? 'Residential' : 'Commercial'} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Property Sub Type</strong> : {data.propertyTypeId} </span>
                            </div>


                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Property Address</strong> : {data.address} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Property City</strong> : {data.cityName} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Property State</strong> : {data.stateName} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Latitude</strong> : {data.latitude} </span>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Longitude</strong> : {data.longitude} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Address</strong> : {data.address} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Locality </strong> : {data.locality} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>No of Bedrooms</strong> : {data.noOfBedRooms} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>No of Bathrooms</strong> : {data.noOfBathRooms} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Balcony</strong> : {data.noOfBedRooms} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Plot Area</strong> : {data.plotArea} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Floor</strong> : {data.floor} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Total Floors</strong> : {data.totalFloor} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Construction Status</strong> : {data.availabilityStatus === 1 ? 'Ready to move' : 'Under construction'} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Sold Status</strong> : {data.soldStatus} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Pooja Room</strong> : {data.poojaRoom} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Study Room</strong> : {data.studyRoom} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Store Room</strong> : {data.storeRoom} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Servant Room</strong> : {data.servantRoom} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Separate Entry For Servant Room</strong> : {data.separateEntryForServantRoom} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Power Backup</strong> : {data.powerBackup} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Price</strong> : {data.price} </span>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Description</strong> : {data.description} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Lift</strong> : {data.lift} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Covered Parking</strong> : {data.coveredParking} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Uncovered Parking</strong> : {data.unCoveredParking} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Swimming Pool</strong> : {data.swimmingPool} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Security Fire Alarm</strong> : {data.securityFireAlarm} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Vastu Compliant</strong> : {data.vaastuCompliant} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Intercom Facility</strong> : {data.intercomFacility} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>No Open drainage around</strong> : {data.noOpenDrainageAround} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Piped-gas</strong> : {data.pipedGas} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Visitor Parking</strong> : {data.visitorParking} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Shopping Center</strong> : {data.shoppingCenter} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Fitness Center Gym</strong> : {data.fitnessCenterGym} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Water Disposal</strong> : {data.waterDisposal} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Rain water harvesting</strong> : {data.rainWaterHarvesting} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Pet Friendly</strong> : {data.petFriendly} </span>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Wheel Chair Friendly</strong> : {data.wheelChairFriendly} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Maintenance Staff</strong> : {data.maintenanceStaff} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Water Storage</strong> : {data.waterStorage} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Club house/ Community center</strong> : {data.clubHouse} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Water Softening plant</strong> : {data.waterSofteningPlant} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span className="heading-6"> <strong>Park</strong> : {data.park} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Monthly Maintenance Charges (in Rs)</strong> : {data.maintenanceCharges} </span>
                            </div>

                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Monthly Club charges (in Rs)</strong> : {data.clubCharges} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Monthly Sinking fund (in Rs)</strong> : {data.sinkingFund} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Monthly Electricity Charges (in Rs)</strong> : {data.electricityCharges} </span>
                            </div>
                            <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                <span
                                    className="heading-6"> <strong>Bid Increment Amount*</strong> : {data.bidIncrementAmount} </span>
                            </div>


                            {
                                data.propertyFor === 2 ?
                                    <>
                                        <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                            <span className="heading-6"> <strong>Borrowers Name</strong> : {data.borrowerName} </span>
                                        </div>
                                        <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                            <span className="heading-6"> <strong>Publication Date</strong> : {data.publicationDate} </span>
                                        </div>
                                        <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                            <span className="heading-6"> <strong>Property Inspection Date</strong> : {data.propertyInspectionDate} </span>
                                        </div>
                                        <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                            <span className="heading-6"> <strong>Property Inspection Time</strong> : {data.propertyInspectionTime} </span>
                                        </div>
                                        <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                            <span className="heading-6"> <strong>EMD Last Payment Date</strong> : {data.EMDLastPaymentDate} </span>
                                        </div>
                                        <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                            <span className="heading-6"> <strong>Auction Date</strong> : {data.auctionDate} </span>
                                        </div>
                                        <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                            <span className="heading-6"> <strong>EstimatedMarket Price</strong> : {data.estimatedMarketPrice} </span>
                                        </div>
                                        <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                            <span className="heading-6"> <strong>Auction Start Time</strong> : {data.auctionStartTime} </span>
                                        </div>
                                        <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                            <span className="heading-6"> <strong>Auction End Time</strong> : {data.auctionEndTime} </span>
                                        </div>
                                        <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                            <span className="heading-6"> <strong>Bid Increment Amount</strong> : {data.bidIncrementAmount} </span>
                                        </div>
                                        <div className="col-12 col-xs-4 col-md-4 col-lg-4 my-3">
                                            <span className="heading-6"> <strong>Number of Auctions</strong> : {data.noOfAuction} </span>
                                        </div>

                                        <div className="col-12 my-4">
                                            <div className="card shadow-none">
                                                <div className="card-header pl-0">
                                                    <h5 className="card-title mb-0">Auction Property Document</h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="img-preview">
                                                        {data.auctionPropertyDocument.map((item, index) => {
                                                            console.log('item', item)
                                                            return (<div key={index}>
                                                                <p>
                                                                    <a className={"btn btn-link m-2"} href={blobUrl(item.image)}
                                                                       target="_blank" rel="noopener noreferrer">{item.name}</a>
                                                                </p>

                                                            </div>)
                                                        })
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                    : ''
                            }

                            <div className="col-12 my-4">
                                <div className="card shadow-none">
                                    <div className="card-header pl-0">
                                        <h5 className="card-title mb-0">Property Document</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="img-preview">
                                            {data.propertyDocument.map((item, index) => {
                                                console.log('item', item)
                                                return (<div key={index}>
                                                    <p>
                                                    <a className={"btn btn-link m-2"} href={blobUrl(item.image)}
                                                           target="_blank" rel="noopener noreferrer">{item.name}</a>
                                                    </p>

                                                </div>)
                                            })
                                            }

                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="col-12">
                                <div className="card shadow-none">
                                    <div className="card-header pl-0">
                                        <h5 className="card-title mb-0">House Tour Video</h5>
                                    </div>
                                    <div className="card-body">
                                        {data.houseTourVideo ?
                                            <video width="320" height="240" controls className="preview__video">
                                                <source src={data.houseTourVideo} type="video/mp4" />
                                            </video>
                                            : ''
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 my-2">
                                <div className="card shadow-none">
                                    <div className="card-header pl-0">
                                    <h5 className="card-title mb-0"> Property Images</h5>
                                    </div>
                                    <div className="card-body">
                                        {categories.map((category, index) => {
                                            return (<div className="card my-2" key={category.value}>
                                                <div className="card-body">
                                                    <h5 className="card-title text-center">{category.label}</h5>
                                                    <div className="img-preview">
                                                        {categoriesDocs[category.value] && categoriesDocs[category.value].images.map((item, index) => (
                                                            <div className="img-preview__item" key={index}>
                                                                <img src={item} alt
                                                                     className="img-preview__image"/>
                                                            </div>))}
                                                    </div>

                                                </div>

                                            </div>)
                                        })}
                                    </div>
                                </div>

                            </div>




                        </div>


                    </div>


                </div></> )}


            </div>
        </>
    )
}

export default PropertyDetails
