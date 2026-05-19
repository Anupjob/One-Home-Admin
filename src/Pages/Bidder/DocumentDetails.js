import React, {useState, useEffect} from 'react'
import postApiCall from '../../Services/postApiCall';
import swal from "sweetalert";
import { useParams } from 'react-router-dom';
import getApiCall from '../../Services/getApiCall';
import {blobUrl} from "../../Services/helpers";
import useGetRoleModule from '../../Services/useGetRoleModule';


function DocumentDetails() {


    let {id} = useParams();

    const [isUpdated, setIsUpdated] = useState(false);


    const [disable, isDisabled] = useState(false)

    const [disabled, setDisabled] = useState(false)
    const [permission, setPermission] = useState({})


    const [details, setDetails] = useState({
        // "firstName": "Johnas",
        // "lastName": "kavins",
        // "fatherName": "kavins martin",
        // "otpVerified": true,
        // "verifyMobile": 1,
        // "dob": "1993-04-01",
        // "area": "Noida One",
        // "secondAddress": "Sector 62",
        // "secondArea": "Noida One",
        // "secondPinCode": 201301,
        // "secondCity": "Noida",
        // "secondState": "Uttar Pradesh",
        "profilePic": "",
        "profileStatus": "",
        "PANImage": "",
        "panStatus": "",
        "AadharImage": "",
        "aadharStatus": "",
        "AadharImageBack": "",
        "aadharBackStatus": "",
        "addressProff": "",
        "addressStatus": "",
        // "bankName": "IDFC",
        // "accountName": "Johnas",
        // "IFSCCode": "IDFC7687987",
        // "cancelCheque": "https://stgonehomeuat.blob.core.windows.net/uat-documents/cancelCheque-1682688954421-945470-dummy%20aadhar.png",
        // "typeOfCompany": "",
        // "companyName": "",
        // "nameOfAuthorizedRepresentative": "",
        // "GSTNumber": "",
        // "GSTRegistrationCertificate": "",
        // "termCondition": 0,
        // "status": 1,
        // "isSameAsCorrespondence": true,
        // "isVerified": false,
        // "isPrimaryBidder": true,
        // "isHighestBidder": true,
        // "highestBidAmount": 2280000,
        // "isBidAwarded": false,
        // "_id": "644bcbbbd75b3e1d8053b33d",
        // "userId": "63bbccb3d4c3025ba8dda670",
        // "propertyId": "644bc9a0676e572698598ee8",
        // "type": "self",
        // "mobile": 7687987676,
        // "email": "johnas@mailinator.com",
        // "PANNumber": "JHYGT7687J",
        // "address": "Sector 62",
        // "pinCode": 201301,
        // "city": "Noida",
        // "state": "Uttar Pradesh",
        // "accountNumber": 98798787989898,
        // "otp": 3155,
        // "bidderId": "B0000033",
        // "createdAt": "2023-04-28T13:35:55.302Z",
        // "__v": 0,
        "aadharRejectReason": "",
        "aadharBackRejectReason": "",
        "addressRejectReason": "",
        "panRejectReason": ""
    });

    const [comments, setComments] = useState("");
    const [comment, setComment] = useState("");
    const [reasons, setReasons] = useState("");
    const [reason, setReason] = useState("");
    const [aadharBackRejectReason, setAadharBackRejectReason] = useState('');


    async function getDetails(data = null) {
        // let id = '6405cee74b6204245c4907c8'
        let response = await getApiCall('user/bid/get-details/' + id);
        // if succes then add
        if (response.meta.status) {
            setDetails(response.data)
        }
        // console.log('response', response)
    }


    async function GetRole() {
        // parnent module permissions
        let Role = await useGetRoleModule("bidders");
        setPermission(Role)
        getDetails();
    }


    useEffect(() => {
        GetRole();
    }, []) 
  

    useEffect(() => {
        getDetails();
    }, [isUpdated]);


    async function aadharApprove() {

        const data = {
            "bidId": id,
            "aadharStatus": "APPROVED"
        }
        const response = await postApiCall("user/bid/status", data, true)
        setIsUpdated(!isUpdated)
        if (response.meta.status == true) {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }


    async function aadharBackApprove() {

        const data = {
            "bidId": id,
            "aadharBackStatus": "APPROVED"

        }
        const response = await postApiCall("user/bid/status", data, true)
        setIsUpdated(!isUpdated)

        if (response.meta.status == true) {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }


    async function panApprove() {

        const data = {
            "bidId": id,
            "panStatus": "APPROVED"

        }
        const response = await postApiCall("user/bid/status", data, true)
        setIsUpdated(!isUpdated)

        if (response.meta.status == true) {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }


    async function addressApprove() {

        const data = {
            "bidId": id,
            "addressStatus": "APPROVED"

        }
        const response = await postApiCall("user/bid/status", data, true)
        setIsUpdated(!isUpdated)

        if (response.meta.status == true) {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }


    async function setRejected() {


        const data = {
            "bidId": id,
            "aadharStatus": "Rejected",
            "aadharRejectReason": comment

        }
        const response = await postApiCall("user/bid/status", data, true)
        setIsUpdated(!isUpdated)


        if (response.meta.status == true) {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }


    async function submitAadharBackRes() {

        const data = {
            "bidId": id,
            "aadharBackStatus": "Rejected",
            "aadharBackRejectReason": details.aadharBackRejectReason

        }
        const response = await postApiCall("user/bid/status", data, true)
        setIsUpdated(!isUpdated)

        if (response.meta.status == true) {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }


    async function setAadharRejectReason() {

        const data = {
            "bidId": id,
            "panStatus": "Rejected",
            "aadharRejectReason": reasons

        }
        const response = await postApiCall("user/bid/status", data, true)
        setIsUpdated(!isUpdated)
        if (response.meta.status == true) {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }

    async function get_Rejected() {

        const data = {
            "bidId": id,
            "panStatus": "Rejected",
            "panRejectReason": reasons

        }
        const response = await postApiCall("user/bid/status", data, true)
        setIsUpdated(!isUpdated)

        if (response.meta.status == true) {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }


    async function set_Rejected() {

        const data = {
            "bidId": id,
            "addressStatus": "Rejected",
            "addressRejectReason": reason

        }
        const response = await postApiCall("user/bid/status", data, true)
        setIsUpdated(!isUpdated)

        if (response.meta.status == true) {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }


    return (
        <>
        {permission.hasOwnProperty('moduleAccress') && !permission.moduleAccress ?
           <div className="row text-center">
               <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                   <div className="errer">
                       <img src="/program-error.png"/>
                       <h2>403</h2>
                       {/* <h4 className="text-danger">{permission.message}</h4> */}
                       <p>{permission.message}</p>

                   </div>
               </div>
           </div>
           :<div className='container-fluid'>
             <div className="main-title">
                    <h3>Bidder’s Details
                        - {details.firstName} {details.lastName}</h3>
                </div>
           <div className='card'>
           <div className='card-header'>
           <h5 className='card-title text-gray-600'>KYC Document</h5>
           </div>
                <div className='card-body'>
                <div className="row">
                    <div className="col-md-6 col-12">
                        <div className='documentStatus'>
                            <div className={'mb-4'}>
                                <img src={blobUrl(details.AadharImage)} alt="Avatar"
                                     className="avatar" width={310}/><br/>
                                <h5><strong>Aadhaar Card</strong></h5>
                                <span><strong>Status : </strong> {details.aadharStatus}</span>
                                <br/>
                                {details.aadharRejectReason && details.aadharRejectReason != '' ? <span><strong>Reject Reason : </strong> {details.aadharRejectReason}</span> : ''}
                            </div>
                            {/*<div className={`statusbtns ${details.aadharStatus != 'PENDING' ? 'd-none' : ''}`}>
                                <button className='btn approve'
                                        onClick={() => aadharApprove()} ><i
                                    className='fa fa-check'></i></button>
                                <button className='btn reject'
                                        data-toggle="modal" data-target="#exampleModal"><i
                                    className='fa fa-times'></i></button>
                            </div>*/}
                        </div>
                    </div>
                    <div className="col-md-6 col-12">
                        <div className='documentStatus'>
                            <div>
                                <img src={blobUrl(details.profilePic)} alt="Avatar"
                                     className="avatar" width={100}/>
                                <p>Profile Picture</p>
                            </div>
                            {/* <div className='statusbtns'>
                                            <button className='btn approve'><i className='fa fa-check'></i></button>
                                            <button className='btn reject' data-toggle="modal" data-target="#exampleModal"><i className='fa fa-times'></i></button>
                                        </div> */}
                        </div>

                    </div>
                    {/* <div className="col-md-6 col-12">
                                    <div className='documentStatus'>
                                        <div>
                                        <img src={details.AadharImage} alt="Avatar"
                                        className="avatar" width={100}/>
                                        <p>Adhar Card</p>
                                        </div>
                                        <div className='statusbtns'>
                                            <button className='btn approve'><i className='fa fa-check'></i></button>
                                            <button className='btn reject' id="flexRadioDefault2" data-toggle="modal" data-target="#exampleModal"><i className='fa fa-times'></i></button>
                                        </div>
                                    </div>

                                </div> */}


                    <div className="modal fade" id="exampleModal" tabindex="-1" role="dialog"
                         aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title text-gray-800" id="exampleModalLongTitle">Rejection
                                        Reason</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Comments *</label>
                                        <textarea className="form-control" placeholder='Type here....'
                                                  defaultValue={details.aadharRejectReason}
                                                  onChange={(e) => setComment(e.target.value)}></textarea>

                                    </div>
                                </div>
                                <div className="modal-footer">
                                    {(details?.aadharStatus == "REJECTED") ? '' :
                                        <button type="button" className="btn btn-md btn-primary shadow-sm"
                                                data-dismiss="modal" aria-label="Close"
                                                onClick={() => setRejected()}>Submit
                                        </button>}
                                </div>
                            </div>
                        </div>
                    </div>





                    <div className="modal fade" id="expModal" tabindex="-1" role="dialog"
                         aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title text-gray-800" id="exampleModalLongTitle">Rejection
                                        Reason</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Comments *</label>
                                        <textarea className="form-control" placeholder='Type here....'
                                                  defaultValue={details.panRejectReason ?? reasons}
                                                  onChange={(e) => setReasons(e.target.value)}></textarea>

                                    </div>
                                </div>
                                <div className="modal-footer">
                                    {(details?.panStatus == "REJECTED") ? '' :
                                        <button type="button" className="btn btn-md btn-primary shadow-sm"
                                                data-dismiss="modal" aria-label="Close"
                                                onClick={() => get_Rejected()}>Submit</button>}

                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="modal fade" id="exmModal" tabindex="-1" role="dialog"
                         aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title text-gray-800" id="exampleModalLongTitle">Rejection
                                        Reason</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Comments *</label>
                                        <textarea className="form-control" placeholder='Type here....'
                                                  defaultValue={details.addressRejectReason ?? reasons}
                                                  onChange={(e) => setReason(e.target.value)}></textarea>

                                    </div>
                                </div>
                                <div className="modal-footer">
                                    {(details?.addressStatus == "REJECTED") ? '' :
                                        <button type="button" className="btn btn-md btn-primary shadow-sm"
                                                data-dismiss="modal" aria-label="Close"
                                                onClick={() => set_Rejected()}>Submit
                                        </button>}

                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="col-md-6 col-12">
                        <div className='documentStatus'>
                            <div>
                                <img src={blobUrl(details.AadharImageBack)} alt="Avatar"
                                     className="avatar" width={310}/>
                                <p></p>
                                <h5><strong>Aadhaar Card Back</strong></h5>
                                <span><strong>Status : </strong> {details.aadharBackStatus}</span>
                                <br/>
                                {details.aadharBackRejectReason && details.aadharBackRejectReason != '' ? <span><strong>Reject Reason : </strong> {details.aadharBackRejectReason}</span> : ''}
                            </div>
                            {/*<div className={`statusbtns ${details.aadharBackStatus != 'PENDING' ? 'd-none' : ''}`} >
                                <button disabled={details.aadharBackStatus == "APPROVED"} className='btn approve'
                                        onClick={() => aadharBackApprove()}><i
                                    className='fa fa-check'></i></button>
                                <button disabled={details.aadharBackStatus == "APPROVED"} className='btn reject'
                                        data-toggle="modal" data-target="#exModal"><i
                                    className='fa fa-times'></i></button>
                            </div>*/}
                        </div>
                    {/*        Modal*/}
                        <div className="modal fade" id="exModal" tabIndex="-1" role="dialog"
                             aria-labelledby="exampleModalLabel"
                             aria-hidden="true">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title text-gray-800" id="exampleModalLongTitle">Rejection
                                            Reason</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label>Comments *</label>
                                            <textarea className="form-control" placeholder='Type here....'
                                                      defaultValue={details.aadharBackRejectReason ?? aadharBackRejectReason}
                                                      onChange={(e) => setAadharRejectReason(e.target.value)}></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        {(details?.aadharBackStatus == "REJECTED") ? '' :
                                            <button type="button" className="btn btn-md btn-primary shadow-sm"
                                                    data-dismiss="modal" aria-label="Close"
                                                    onClick={() => submitAadharBackRes()}>Submit</button>}

                                    </div>
                                </div>
                            </div>
                        </div>
                    {/*        Modal end*/}

                    </div>
                    </div>





                    <div className="col-md-6 col-12">
                        <div className='documentStatus'>
                            <div>
                                <img src={blobUrl(details.PANImage)} alt="Avatar"
                                     className="avatar" width={310}/>
                                <h5><strong>PAN Card</strong></h5>
                                <span><strong>Status : </strong> {details.panStatus}</span>
                                <br/>
                                {details.panRejectReason && details.panRejectReason && details.panRejectReason != '' ? <span><strong>Reject Reason : </strong> {details.panRejectReason}</span> : ''}
                            </div>
                            {/*<div className={`statusbtns ${details.panStatus != 'PENDING' ? 'd-none' : ''}`} >
                                <button disabled-1={details.aadharBackStatus == "APPROVED"} className='btn approve'
                                        onClick={() => panApprove()}><i className='fa fa-check'></i></button>
                                <button disabled-1={details.aadharBackStatus == "APPROVED"} className='btn reject'
                                        data-toggle="modal" data-target="#expModal"><i
                                    className='fa fa-times'></i></button>
                            </div>*/}
                        </div>

                    </div>
                  
                </div>
            </div>


        </div>}</>
    )
}

export default DocumentDetails