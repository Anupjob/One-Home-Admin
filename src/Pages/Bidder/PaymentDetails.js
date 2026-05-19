import React, {useState, useEffect} from 'react'
import swal from "sweetalert";
import getApiCall from '../../Services/getApiCall';
import { useParams } from 'react-router-dom';
import moment from "moment";
import {formatDate} from "../../Services/helpers";
import useGetRoleModule from '../../Services/useGetRoleModule';
import postApiCall from '../../Services/postApiCall';
import {toast} from "react-toastify";

function PaymentDetails() {

    let {id} = useParams();


    const [refundParticular, setrefundParticular] = useState("");
    const [refundTransactionId, setrefundTransactionId] = useState("");
    const [refundAmount, setrefundAmount] = useState("");
    const [files, setFiles] = useState("");
    const [toDt, setToDt] = useState("");
    const [payment, setPayment] = useState([]);
    const [permission, setPermission] = useState({})


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
        "firstName": "",
        "lastName": "",
        "fatherName": "",
        "verifyMobile": 0,
        "dob": "",
        "area": "",
        "secondAddress": "",
        "secondArea": "",
        "secondPinCode": "",
        "secondCity": "",
        "secondState": "",
        "profilePic": "",
        "PANImage": "",
        "AadharImage": "",
        "AadharImageBack": "",
        "addressProff": "",
        "bankName": "",
        "accountName": "",
        "IFSCCode": "",
        "cancelCheque": "",
        "typeOfCompany": "",
        "companyName": "",
        "nameOfAuthorizedRepresentative": "",
        "GSTNumber": "",
        "GSTRegistrationCertificate": "",
        "termCondition": 0,
        "status": 0,
        "isSameAsCorrespondence": false,
        "_id": "",
        "userId": "",
        "propertyId": "",
        "type": "",
        "mobile": 0,
        "email": "",
        "PANNumber": "",
        "address": "",
        "pinCode": 0,
        "city": "",
        "state": "",
        "accountNumber": 0,
    });


    async function verifyPayment() {
        let response = await getApiCall('user/transaction/list/' + id,);
        if (response.meta.status == true) {
            setPayment(response.data); console.log("sxxx",response.data);
        } else {
            setPayment("");
        }
    }


    async function getDetails(data = null) {
        // let id = '6405cee74b6204245c4907c8'
        let response = await getApiCall('user/bid/get-details/' + id,);
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
        verifyPayment()
        getDetails();
    }


    useEffect(() => {
        GetRole();
    }, [])


    async function paymentTransaction() {
        const formData = new FormData();
        formData.append("myFile", files, files.name);

        console.log(formData);

        const data = {
            "orderId": '6447674a34a24fe679c7cf5d',
            "refundParticular": refundParticular,
            "refundDate": toDt,
            "refundTransactionId": refundTransactionId,
            "refundAmount": refundAmount,
            "refundImage": formData
        }

        let response = await postApiCall("user/transaction/refund", data);


    }

    async function paymentRefund(item){
        if(window.confirm("Are you sure you want to refund payment..!!")){
            console.log("REFUND INITATED")
            let response = await postApiCall(`admin/refund/${item._id}`, {}, true)
            if(!response.meta.status) toast.error(response.data.Head.Description)
            else toast.success(response.data.Head.Description)
          
        }else{
            console.log("REFUND CANCELLED")
        }
    }


    return (<>
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
           :
        <div id="payment" className='container-fluid'> 
        <div className="main-title">
                <h3>Bidder’s Details - {details.firstName} {details.lastName}</h3>
            </div>
            {/* <div className="d-sm-flex align-items-center justify-content-between mb-4 container-fluid"> */}
                {/*<Link to="/cms/add" className="d-sm-inline-block btn btn-sm btn-primary shadow-sm">*/}
                {/*    Add New*/}
                {/*</Link>*/}
            {/* </div> */}
<div className='card mb-4'>
    <div className='card-header'><h5 className='card-title'>Payment Status</h5></div>
    <div className='card-body'>

    
            
            <div className="table-responsive">
                <table className="table table-bordered" width="100%" cellSpacing="0">
                    <thead>
                    <tr>
                        <th>Particular</th>
                        <th>Date</th>
                        <th>Payment Mode</th>
                        <th>Transaction ID</th>
                        <th>Amount</th>
                        <th>Screenshot</th>
                        <th>Status</th>
                        {permission.moduleList?.updateDisabled ? null : <th>Action</th>}
                    </tr>
                    </thead>

                    <tbody>
                    {(payment.length > 0)? payment.map((item, index) => {
                        let paymentMode = '-'
                        if (item.paymentMode == 1) {
                            paymentMode = 'Offline'
                        } else if (item.paymentMode == 2) {
                            paymentMode = 'Online'
                        }
                        return (
                            <tr>
                                <td>{item.paymentFor == 1 ? 'EMD Payment' : 'EOI Payment'}</td>
                                {/*<td>{moment(item?.createdAt).utc().format('DD-MM-YYYY HH:MM:SS')}   </td>*/}
                                <td>{formatDate(item?.createdAt)}   </td>
                                <td>{paymentMode}</td>
                                <td>{item.transactionId ? item.transactionId :  '-'}</td>
                                <td>{item.amount}</td>
                                <td><img style={{width: "50px"}} src='../../assets/images/no_image.png'></img></td>
                                <td>{item.paymentStatus}</td>
                                <td>{permission.moduleList?.updateDisabled ? null : (item.bidderBids.isBidAwarded)?"": 
                                    <button type="button" className="btn btn-md btn-primary shadow-sm" onClick={() => paymentRefund(item)}>Refund</button>
                                }</td> 

                            </tr>
                        )
                    }):""}
                    </tbody>
                </table>
                </div>
</div>
</div>
<div className='card'>
    <div className='card-header'><h5 className='card-title'>Refund Bank Account Details</h5></div>
    <div className='card-body'>
                <div className="row">
                    <div className="col-md-12 col-12">
                        <p><strong>Bank Account No:</strong> {details.accountNumber}</p>
                    </div>
                    <div className="col-md-12 col-12">
                        <p><strong>IFSC Code:</strong> {details.IFSCCode}</p>
                    </div>
                    <div className="col-md-12 col-12">
                        <p><strong>Bank Name:</strong> {details.bankName}</p>
                    </div>
                </div>

                </div>
</div>
            </div>}</>
      
    )
}

export default PaymentDetails