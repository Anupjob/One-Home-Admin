import React, {useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import { useParams } from 'react-router-dom';
import postApiCall from '../../Services/postApiCall';

const BidderDetial = (props) => {
   // let {id} = props.match.params;

   const location=useLocation();

   

   
   

const[active,setActive]=useState("");
   const[comments,setComments]=useState("");
   const[comment,setComment]=useState("");
   const[reasons,setReasons]=useState("");
   const[reason,setReason]=useState("");
   const [value,setValue]=useState();
   const[verificationData,setVerificationData]=useState("");
   const [toDt, setToDt] = useState("");
const[refundParticular,setrefundParticular]=useState("");
const[refundTransactionId,setrefundTransactionId]=useState("");
const[refundAmount,setrefundAmount]=useState("");
const[files,setFiles]=useState("");
const[payment,setPayment]=useState([]);
const[tab,setTab]=useState("");

    let{id}=useParams();
    const detail = {

        "firstName": "John",
        "lastName": "Karl",
        "fatherName": "Kavin Karl",
        "verifyMobile": 1,
        "dob": "1989-01-06",
        "area": "noida one",
        "secondAddress": "sector 62",
        "secondArea": "noida one",
        "secondPinCode": 201301,
        "secondCity": "Noida",
        "secondState": "Uttar Pradesh",
        "profilePic": "https://iifldev.s3.ap-south-1.amazonaws.com/bid/profilePic/profilePic_1678102241000.png",
        "PANImage": "https://iifldev.s3.ap-south-1.amazonaws.com/bid/PAN/PANImage_1678102240928.png",
        "AadharImage": "https://iifldev.s3.ap-south-1.amazonaws.com/bid/AadharImage/AadharImage_1678102241004.png",
        "AadharImageBack": "https://iifldev.s3.ap-south-1.amazonaws.com/bid/AadharImage/AadharImage_1678102241004.png",
        "addressProff": "https://iifldev.s3.ap-south-1.amazonaws.com/bid/addressProff/addressProff_1678102240867.png",
        "bankName": "IDFC Bank",
        "accountName": "John",
        "IFSCCode": "IDFC6876776",
        "cancelCheque": "https://iifldev.s3.ap-south-1.amazonaws.com/cheque/cancel/cancelCheque_1678102241079.png",
        "typeOfCompany": "",
        "companyName": "",
        "nameOfAuthorizedRepresentative": "",
        "GSTNumber": "",
        "GSTRegistrationCertificate": "",
        "termCondition": 1,
        "status": 1,
        "isSameAsCorrespondence": true,
        "_id": "6405cee74b6204245c4907c8",
        "userId": "63bbccb3d4c3025ba8dda670",
        "propertyId": "6405984c8a471c105b704e27",
        "type": "self",
        "mobile": 9879879879,
        "email": "john@mailinator.com",
        "PANNumber": "PKUJH9876J",
        "address": "sector 62",
        "pinCode": 201301,
        "city": "Noida",
        "state": "Uttar Pradesh",
        "accountNumber": 987757655765766400,
        "createdAt": "2023-03-06T11:30:47.506Z",
        "__v": 0

    };

    

    // {


    //     "cancelCheque": "https://iifldev.s3.ap-south-1.amazonaws.com/cheque/cancel/cancelCheque_1678102241079.png",
    //     "typeOfCompany": "",

    //     "GSTRegistrationCertificate": "",
    //     "termCondition": 1,
    //     "status": 1,
    //     "isSameAsCorrespondence": true,
    //     "_id": "6405cee74b6204245c4907c8",
    //     "userId": "63bbccb3d4c3025ba8dda670",
    //     "propertyId": "6405984c8a471c105b704e27",
    // "area": "noida one",
    // "secondAddress": "sector 62",
    // "secondArea": "noida one",
    // "secondPinCode": 201301,
    // "secondCity": "Noida",
    // "secondState": "Uttar Pradesh",
    // "type": "self",

    //     "createdAt": "2023-03-06T11:30:47.506Z",
    //     "__v": 0
    // }

    async function getDetails(data = null) {
        // let id = '6405cee74b6204245c4907c8'
if(props.location.state?.Id===1)
{
    setActive("#support")
}
        
        let response = await getApiCall('user/bid/get-details/' + id,);
        // if succes then add
        if (response.meta.status) {
            //setDetail(response.data)
        }
        // console.log('response', response)
    }

    useEffect(() => {
        getDetails();
    }, []);




    async function setApproved()
    {

        const data={
            "bidId":id,
            "aadharStatus":"APPROVED"
            
        }
        const response=await postApiCall("user/bid/status", data,true)
        
        if(response.meta.status==true)
        {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }


    async function getApproved()
    {

        const data={
            "bidId":id,
            "aadharBackStatus":"APPROVED"
            
        }
        const response=await postApiCall("user/bid/status", data,true)
        
        if(response.meta.status==true)
        {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }





    async function get_Approved()
    {

        const data={
            "bidId":id,
            "panStatus":"APPROVED"
            
        }
        const response=await postApiCall("user/bid/status", data,true)
        
        if(response.meta.status==true)
        {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }







    async function set_Approved()
    {

        const data={
            "bidId":id,
            "addressStatus":"APPROVED"
            
        }
        const response=await postApiCall("user/bid/status", data,true)
        
        if(response.meta.status==true)
        {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }


    async function getRejected()
    {

        const data={
            "bidId":id,
            "aadharStatus":"Rejected",
            "aadharRejectReason":comments
            
        }
        const response=await postApiCall("user/bid/status", data,true)
        
        if(response.meta.status==true)
        {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }





    
    async function setRejected()
    {

        const data={
            "bidId":id,
            "aadharBackStatus":"Rejected",
            "aadharBackRejectReason":comment
            
        }
        const response=await postApiCall("user/bid/status", data,true)
        
        if(response.meta.status==true)
        {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    } 






    async function get_Rejected()
    {

        const data={
            "bidId":id,
            "panStatus":"Rejected",
            "panRejectReason":reasons
            
        }
        const response=await postApiCall("user/bid/status", data,true)
        
        if(response.meta.status==true)
        {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }




    async function set_Rejected()
    {

        const data={
            "bidId":id,
            "addressStatus":"Rejected",
            "addressRejectReason":reason
            
        }
        const response=await postApiCall("user/bid/status", data,true)
        
        if(response.meta.status==true)
        {
            swal({text: response.meta.msg, icon: "success", timer: 1500})
        }


    }








    async function setVerification()
    {

        if(value==="true")
        {
            const data={
                "bidId":id,
                "isVerified":value,   
            }
            const response=await postApiCall("user/bid/status/bid", data,true)
            
            if(response.meta.status==true)
            {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
            }

        }

        else
        {
            swal({text: "use to click only submit button if you approved", icon: "error", timer: 1500})

        }

    }



    async function setVerificationRejected()
    {

        if(value==="false")
        {
            const data={
                "bidId":id,
                "isVerified":value, 
                "bidderRejectReason": verificationData 
            }
            const response=await postApiCall("user/bid/status/bid", data,true)
            
            if(response.meta.status==true)
            {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
            }

        }

        else
        {

            swal({text: "use to click only reject button if you reject", icon: "error", timer: 1500})
        }

    }



async function verifyPayment(){
    let response = await getApiCall('user/transaction/list/'+ id,);
    setPayment(response.data);
}

async function paymentTransaction(){
const formData=new FormData();
formData.append("myFile",files,files.name);

const data={
"orderId":'6447674a34a24fe679c7cf5d',
"refundParticular":refundParticular,
"refundDate":toDt,
"refundTransactionId":refundTransactionId,
"refundAmount":refundAmount,
"refundImage":formData
}

let response = await postApiCall("user/transaction/refund",data);



}









    return (
        <>
            <div className="container-fluid">
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h3 mb-0 text-gray-800">Bidder’s Details - {detail.firstName} {detail.lastName}</h1>
                    {/*<Link to="/cms/add" className="d-sm-inline-block btn btn-sm btn-primary shadow-sm">*/}
                    {/*    Add New*/}
                    {/*</Link>*/}
                </div>

                <div className="card shadow mb-4">
                    {/*<div className="card-header">*/}
                    {/*    <div className="card-title">Bidder’s Details - {detail.firstName} {detail.lastName}</div>*/}
                    {/*</div>*/}

                    
                    <div className="card-body">

                    <ul  id="tabs"role="tablist" className="nav nav-tabs nav-pills mb-2">
                        <li class="nav-item ">
                            <a id="tab-B" href="#primary" className="nav-link " data-toggle="tab" role="tab">Primary Details</a>
                        </li>
                        <li class="nav-item">
                        <a id="tab-A" href="#support"   className={active=="#support" ? "nav-link active" :"nav-link"} data-toggle="tab" role="tab">Support Documents</a>
                        </li>
                        <li class="nav-item">
                        <a id="tab-C" href= "#declaration" className="nav-link " data-toggle="tab" role="tab">Declaration Documents</a>
                        </li>
                        <li class="nav-item">
                        <a id="tab-D" href="#payment" className="nav-link " data-toggle="tab" role="tab"  onClick={()=>verifyPayment()}>Payment</a>
                        </li>
                        <li class="nav-item">
                        <a id="tab-E" href="#verification" className="nav-link " data-toggle="tab" role="tab">Verification</a>
                        </li>
                    </ul>
                    <div id="content" class="tab-content" role="tablist">
                        <div id="primary" class="tab-pane fade show active" role="tabpanel" aria-labelledby="tab-A">
                            {/* <h4 className='h3 mb-3 mt-4 text-gray-800'>KYC Document</h4> */}
                            <div className="row">
                                <div className="col-md-4 col-12">
                                    <p><strong>Name :</strong> {detail.firstName} {detail.lastName}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>Father Name :</strong> {detail.fatherName}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>DOB :</strong> {detail.dob}</p>
                                </div>


                                <div className="col-md-4 col-12">
                                    <p><strong>Area :</strong> {detail.area}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>Mobile :</strong> {detail.mobile}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>Email :</strong> {detail.email}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>PAN Number :</strong> {detail.PANNumber}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>Address :</strong> {detail.address}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>Pin Code :</strong> {detail.pinCode}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>City :</strong> {detail.city}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>State :</strong> {detail.state}</p>
                                </div>

                                <div className="col-md-4 col-12">
                                    <p><strong>Account Number :</strong> {detail.accountNumber}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>Bank Name :</strong> {detail.bankName}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>Account Name :</strong> {detail.accountName}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>IFSC Code :</strong> {detail.IFSCCode}</p>
                                </div>

                                <div className="col-md-4 col-12">
                                    <p><strong>Company Name :</strong> {detail.companyName}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>Authorized Representative :</strong> {detail.nameOfAuthorizedRepresentative}
                                    </p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>GST Number :</strong> {detail.GSTNumber}</p>
                                </div>

                            </div>
                            <hr/>
                            
                        </div>
                        <div id="support" class="tab-pane fade" role="tabpanel" aria-labelledby="tab-B">
                            <h4 className='h3 mb-3 mt-4 text-gray-800'>KYC Document</h4>
                            <div className="row">
                                <div className="col-md-6 col-12">
                                    <div className='documentStatus'>
                                        <div>
                                        <img src={detail.AadharImage} alt="Avatar"
                                            className="avatar" width={100}/>
                                        <p>Adhar Card</p>
                                        </div>
                                        <div className='statusbtns'>
                                            <button className='btn approve' onClick={()=>setApproved()}><i className='fa fa-check'></i></button>
                                            <button className='btn reject' data-toggle="modal" data-target="#exampleModal" ><i className='fa fa-times'></i></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 col-12">
                                    <div className='documentStatus'>
                                        <div>
                                        <img src={detail.profilePic} alt="Avatar"
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
                                        <img src={detail.AadharImage} alt="Avatar"
                                        className="avatar" width={100}/>
                                        <p>Adhar Card</p>
                                        </div>
                                        <div className='statusbtns'>
                                            <button className='btn approve'><i className='fa fa-check'></i></button>
                                            <button className='btn reject' id="flexRadioDefault2" data-toggle="modal" data-target="#exampleModal"><i className='fa fa-times'></i></button>
                                        </div>
                                    </div>
                                    
                                </div> */}
                                <div className="col-md-6 col-12">
                                    <div className='documentStatus'>
                                        <div>
                                        <img src={detail.AadharImageBack} alt="Avatar"
                                        className="avatar" width={100}/>
                                        <p>Adhar Card Back</p>
                                        </div>
                                        <div className='statusbtns'>
                                            <button className='btn approve' onClick={()=>getApproved()}><i className='fa fa-check'></i></button>
                                            <button className='btn reject' data-toggle="modal" data-target="#exModal"><i className='fa fa-times'></i></button>
                                        </div>
                                    </div>
                                    
                                </div>
                                <div className="col-md-6 col-12">
                                    <div className='documentStatus'>
                                        <div>
                                        <img src={detail.PANImage} alt="Avatar"
                                        className="avatar" width={100}/>
                                        <p>PAN Card</p>
                                        </div>
                                        <div className='statusbtns'>
                                            <button className='btn approve' onClick={()=>get_Approved()}><i className='fa fa-check'></i></button>
                                            <button className='btn reject' data-toggle="modal" data-target="#expModal"><i className='fa fa-times'></i></button>
                                        </div>
                                    </div>
                                    
                                </div>
                                <div className="col-md-6 col-12">
                                    <div className='documentStatus'>
                                        <div>
                                        <img src={detail.addressProff} alt="Avatar"
                                        className="avatar" width={100}/>
                                        <p>Address Proof</p>
                                        </div>
                                        <div className='statusbtns'>
                                            <button className='btn approve' onClick={()=>set_Approved()}><i className='fa fa-check'></i></button>
                                            <button className='btn reject' data-toggle="modal" data-target="#exmModal"><i className='fa fa-times'></i></button>
                                        </div>
                                    </div>
                                    
                                </div>

                            </div>
                            <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog" role="document">
                                    <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title text-gray-800" id="exampleModalLongTitle">Rejection Reason</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <div className="form-group">
                                            <label>Comments *</label>
                                            <textarea className="form-control" placeholder='Type here....' onChange={(e)=>setComments(e.target.value)}></textarea>
                                            
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-md btn-primary shadow-sm" onClick={()=>getRejected()}>Submit</button>
                                    </div>
                                    </div>
                                </div>
                                </div>
                        </div>





                        <div class="modal fade" id="exModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog" role="document">
                                    <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title text-gray-800" id="exampleModalLongTitle">Rejection Reason</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <div className="form-group">
                                            <label>Comments *</label>
                                            <textarea className="form-control" placeholder='Type here....' onChange={(e)=>setComment(e.target.value)}></textarea>
                                            
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-md btn-primary shadow-sm" onClick={()=>setRejected()}>Submit</button>
                                    </div>
                                    </div>
                                </div>
                                </div>








                                <div class="modal fade" id="expModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog" role="document">
                                    <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title text-gray-800" id="exampleModalLongTitle">Rejection Reason</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <div className="form-group">
                                            <label>Comments *</label>
                                            <textarea className="form-control" placeholder='Type here....' onChange={(e)=>setReasons(e.target.value)}></textarea>
                                            
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-md btn-primary shadow-sm" onClick={()=>get_Rejected()}>Submit</button>
                                    </div>
                                    </div>
                                </div>
                                </div>




                                <div class="modal fade" id="exmModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog" role="document">
                                    <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title text-gray-800" id="exampleModalLongTitle">Rejection Reason</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <div className="form-group">
                                            <label>Comments *</label>
                                            <textarea className="form-control" placeholder='Type here....' onChange={(e)=>setReason(e.target.value)}></textarea>
                                            
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-md btn-primary shadow-sm" onClick={()=>set_Rejected()}>Submit</button>
                                    </div>
                                    </div>
                                </div>
                                </div>






                                <div class="modal fade" id="verificationModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog" role="document">
                                    <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title text-gray-800" id="exampleModalLongTitle">Rejection Reason</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <div className="form-group">
                                            <label>Comments *</label>
                                            <textarea className="form-control" placeholder='Type here....' onChange={(e)=>setVerificationData(e.target.value)}></textarea>
                                            
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-md btn-primary shadow-sm" onClick={()=>setVerificationRejected()}>Submit</button>
                                    </div>
                                    </div>
                                </div>
                                </div>







                        
















                       















                        <div id="declaration" class="tab-pane fade" role="tabpanel" aria-labelledby="tab-C">
                            <h4 className='h3 mb-3 mt-4 text-gray-800'>Tender & Bid Declaration Docs</h4>
                            <div className='row'>
                                <div className='col-md-3'>
                                    <div className='pdfBox'>
                                        <img src='../../assets/images/pdficon.png'></img>
                                        <a href='#' download target='_blank' rel="noopener noreferrer"><span>Bid Declaration Form</span></a>
                                    </div>
                                </div>
                                <div className='col-md-3'>
                                    <div className='pdfBox'>
                                        <img src='../../assets/images/pdficon.png'></img>
                                        <a href='#' download target='_blank' rel="noopener noreferrer"><span>Tendor Form</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="payment" class="tab-pane fade" role="tabpanel" aria-labelledby="tab-D">
                            <h4 className='h3 mb-3 mt-4 text-gray-800'>Payment Status</h4>
                            <div className="table-responsive">
                                <table className="table table-bordered" width="100%" cellSpacing="0">
                                    <thead>
                                    <tr>
                                        <th>Particular</th>
                                        <th>Date</th>
                                        <th>Transaction ID</th>
                                        <th>Amount</th>
                                        <th>Screenshot</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                        <tr>
                                            <td>EMD Payment</td>
                                            <td>{ }</td>
                                            <td>TI12321321</td>
                                            <td>{}</td>
                                            <td><img style={{width:"50px"}} src='../../assets/images/no_image.png'></img></td>
                                            <td>Paid</td>
                                            <td><button type="submit" className="btn btn-md btn-primary shadow-sm" data-toggle="modal" data-target="#refundModal">Refund</button></td>
                                            <div class="modal fade" id="refundModal" tabindex="-1" role="dialog" aria-labelledby="refundModalLabel" aria-hidden="true">
                                                <div class="modal-dialog" role="document">
                                                    <div class="modal-content">
                                                    <div class="modal-header">
                                                        <h5 class="modal-title text-gray-800" id="refundModalLongTitle">Make Payment</h5>
                                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                        </button>
                                                    </div>
                                                    <div class="modal-body">
                                                        <div class="row">
                                                            <div class="col-sm-6">
                                                                <div class="form-group">
                                                                    <input type="text" name=" " class="form-control" placeholder="Particular" value={refundParticular} onChange={(e)=>setrefundParticular(e.target.value)}/>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-6">
                                                            <div class="form-group">
                                                                <input type="date" name=" " class="form-control " placeholder="Select Date" value={toDt}  onChange={(e) => setToDt(e.target.value)}/>
                                                            </div>
                                                            </div>
                                                            <div class="col-sm-6">
                                                            <div class="form-group">
                                                                <input type="text" name=" " class="form-control" placeholder="Enter Transaction ID" value={refundTransactionId} onChange={(e)=>setrefundTransactionId(e.target.value)}/>
                                                            </div>
                                                            </div>
                                                            <div class="col-sm-6">
                                                            <div class="form-group">
                                                                <input type="text" name=" " class="form-control" placeholder="Enter Amount" value={refundAmount} onChange={(e)=>setrefundAmount(e.target.value)}/>
                                                            </div>
                                                            </div>
                                                            
                                                            
                                                            <div class="col-sm-6">
                                                                <div class="form-group">
                                                                    <label>Upload Screenshot</label>
                                                                    <input type="file" name="company_logo" id="fileupload2"    class="inputfile inputfile-4" data-multiple-caption="{count} files selected" onChange={(e)=>setFiles(e.target.files[0])} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-md btn-primary shadow-sm" onClick={()=>paymentTransaction()}>Submit</button>
                                                    </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <h4 className='h3 mb-3 mt-4 text-gray-800'>Refund Bank Account Details</h4>
                            <div className="row">
                                <div className="col-md-12 col-12">
                                    <p><strong>Bank Account No:</strong> 545454545454545</p>
                                </div>
                                <div className="col-md-12 col-12">
                                    <p><strong>IFSC Code:</strong> SBI455455</p>
                                </div>
                                <div className="col-md-12 col-12">
                                    <p><strong>Bank Name:</strong> SBI</p>
                                </div>
                            </div>

                        </div>
                        <div id="verification" class="tab-pane fade" role="tabpanel" aria-labelledby="tab-E">
                            <h4 className='h3 mb-3 mt-4 text-gray-800'>Verify & Approve</h4>
                            <form>
                                <div className="form-group">
                                    <label>Verification</label>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="flexRadioDefault" value={true}  id="flexRadioDefault1" onChange={(e)=>setValue(e.target.value)}/>
                                            <label class="form-check-label" for="flexRadioDefault1">Admit</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="flexRadioDefault"  value={false} id="flexRadioDefault2"   onChange={(e)=>setValue(e.target.value)} />
                                            <label class="form-check-label" for="flexRadioDefault2">Reject</label>
                                        </div>
                                </div>
                                <div className="form-group mt-1">
                                    <button type="button" className="btn btn-md btn-primary shadow-sm"  onClick={()=>setVerification()}> Submit
                </button>

                <button type="button" className="btn btn-md btn-primary shadow-sm ml-2" data-toggle="modal" data-target="#verificationModal" > Rejected
                </button>
                                </div>
                            </form>
                        </div>
                    </div>

                        

                    </div>

                </div>


            </div>
        </>
    )
}

export default BidderDetial
