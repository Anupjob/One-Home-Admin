import React,{useState,useEffect} from 'react'
 import getApiCall from "../../Services/getApiCall";
 import { useParams } from 'react-router-dom';
 import useGetRoleModule from '../../Services/useGetRoleModule';

function PrimaryDetails() {

let{id}=useParams();




    const [detail, setDetail] = useState({

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
    const [permission, setPermission] = useState({})



    async function getDetails(data = null) {
        // let id = '6405cee74b6204245c4907c8'
        let response = await getApiCall('user/bid/get-details/' + id,);
        // if succes then add
        if (response.meta.status) {
            setDetail(response.data)
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
                    :<div className="container-fluid"> 
                        <div className="main-title">
                    <h3>Bidder’s Details - {detail.name}</h3>
                </div>
                            {/* <h4 className='h3 mb-3 mt-4 text-gray-800'>KYC Document</h4> */}
                           
                            <div id="primary" className="card">
                            <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 col-12">
                                    <p><strong>Name :</strong> {detail.name}</p>
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
                                    <p><strong>PAN Number :</strong> {detail.PANNumber.replace(/^.{4}/g, 'XXXX')}</p>
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

                                {/* <div className="col-md-4 col-12">
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
                                </div> */}

                            </div>
                            </div>
                            
                        </div>




                 </div>}
                 </>
  )
}

export default PrimaryDetails