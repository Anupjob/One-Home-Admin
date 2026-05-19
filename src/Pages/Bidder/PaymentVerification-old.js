import React,{useState,useEffect} from 'react'
import { useParams } from 'react-router-dom';
import postApiCall from '../../Services/postApiCall';
import swal from "sweetalert";
import getApiCall from '../../Services/getApiCall';


function DeclarativeDocument() {

    const[verificationData,setVerificationData]=useState("");
    const [value,setValue]=useState();
    
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


    const [details, setDetails] = useState({
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
        "AadharImageBack": "",
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

    });




    async function getDetails(data = null) {
        // let id = '6405cee74b6204245c4907c8'
        let response = await getApiCall('user/bid/get-details/' + id,);
        // if succes then add
        if (response.meta.status) {
            setDetails(response.data)
        }
        // console.log('response', response)
    }


    useEffect(() => {
        getDetails();
    }, []);


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
            
            if(response.meta.status == true)
            {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
            }

        }
        else
        {
            swal({text: "use to click only reject button if you reject", icon: "error", timer: 1500})
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




  return (
    <div className='ml-2'>

<div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h3 mb-0 text-gray-800">Bidder’s Details - {details.firstName} {details.lastName}</h1>
                    {/*<Link to="/cms/add" className="d-sm-inline-block btn btn-sm btn-primary shadow-sm">*/}
                    {/*    Add New*/}
                    {/*</Link>*/}
                </div>
                            <h4 className='h3 mb-3 mt-4 text-gray-800'>Verify & Approve</h4>
                            <form>
                                <div className="form-group">
                                    <label>Verification</label>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="flexRadioDefault"   id="flexRadioDefault1" value={true} onChange={(e)=>setValue(e.target.value)}/>
                                            <label class="form-check-label" for="flexRadioDefault1">Admit</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="flexRadioDefault"   id="flexRadioDefault2"  value={false} onChange={(e)=>setValue(e.target.value)}  />
                                            <label class="form-check-label" for="flexRadioDefault2">Reject</label>
                                        </div>
                                </div>
                                <div className="form-group mt-1">
                                    <button type="button" className="btn btn-md btn-primary shadow-sm" onClick={()=>setVerification()}> Submit
                </button>

                <button type="button" className="btn btn-md btn-primary shadow-sm ml-2" data-toggle="modal" data-target="#verificationModal" > Rejected
                </button>



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


                                </div>
                            </form>
                        </div>
                
  )
}

export default DeclarativeDocument