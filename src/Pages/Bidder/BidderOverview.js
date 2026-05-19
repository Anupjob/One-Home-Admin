import React, { useState, useEffect } from "react";
import { Nav } from "rsuite";
import getApiCall from "../../Services/getApiCall";
import useGetRoleModule from "../../Services/useGetRoleModule";
import { blobUrl } from "../../Services/helpers";
import { formatDate } from "../../Services/helpers";
import { Document, Page, pdfjs } from "react-pdf";
import Constant from "../../Components/Constant";
import {toast, ToastContainer} from "react-toastify";
import { useParams } from "react-router";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const BidderOverview = (props) => {
  const [active, setActive] = useState("home");
  const {participationId} = useParams()
  const [overview, setOverview] = useState([]);
  const [eSignDocumentBase64, setESignDocumentBase64] = useState({ msg: null });
  const [saleCertificate, setSaleCertificate] = useState("");
  const [permission, setPermission] = useState({});
  const [paymentHistoryList, setPaymentHistory] = useState([])
  const [numPages, setNumPages] = useState(0);

  function getList() {
    // let participationId = props.match.params.id;
    getApiCall(`user/bid/bidder/details/participation/${participationId}`)
      .then((response) => {
        if (response.meta.status) {
          let bidderOverview = response.data.biddersDetailData;
          setOverview(bidderOverview)
          setPaymentHistory(response.data.orderDetails)
        } else {
          alert("page go back due to older record")
          window.history.back()
          // setOverview(response.data);
         
        }
      })
      .catch((error) => {
      //  console.log(error)
        setOverview([]);
      });
  }

  async function GetRole() {
    let Role = await useGetRoleModule("bidders");
    setPermission(Role);
    getList();
  }

  async function loadESignDocument(id, documentLink) {
    let name = overview[1]?.name.replace(" ", "_")
    let propertIds = paymentHistoryList?.propertyId
    //console.log(documentLink)
    if(id != ""){
    getApiCall("user/leegality/admin/signdoc/" + id)
      .then((response) => {
        if (response.meta.status) {
          setESignDocumentBase64(response.meta.msg);
          setSourceValue(response.meta.msg.file);
          let fetchDataModified = `data:application/pdf;base64,${response.meta.msg.file }`;
                let a = document.createElement("a");
                a.href = fetchDataModified;
                a.download = name+"_"+propertIds+"_"+'tenderdoc.pdf';
                a.click();
                toast("E-sign tender Form Downloaded")
        } else {
          setESignDocumentBase64({ msg: null });
        }
      })
      .catch((error) => {
        setESignDocumentBase64({ msg: null });
      });
    }else{
      let url = blobUrl(documentLink)
      window.open(url);
    }
  }

  async function loadSaleCertificate() {
      let bidderId = props.match.params.id;
      window.open(`${Constant.apiBasePath}common/sale/admin/letter/${bidderId}`);
      // setSaleCertificate(`${Constant.apiBasePath}common/sale/admin/letter/${bidderId}`);
  }

  const getStartingValue = () => {
    try {
      return localStorage.getItem("pdfSource");
    } catch {
      return "";
    }
  };

  const getStartingSaleCertificateValue = () => {
    try {
      return localStorage.getItem("saleCertificate");
    } catch {
      return "";
    }
  };

  const [source, setSource] = useState(getStartingValue());
 
  const clearPdfDate = () => {
    localStorage.removeItem("pdfSource");
    localStorage.removeItem("saleCertificate");
  };

  function range(count) {
    return Array(count)
      .fill(0)
      .map((_, idx) => idx);
  }

  const setSourceValue = (newValue) => {
    if (!newValue) {
      console.info("Nothing to paste");
      return;
    }

    localStorage.setItem("pdfSource", newValue);
    setSource(newValue);
  };


  const onDocumentLoadSuccess = (doc) => {
    setNumPages(doc.numPages);
  };

  useEffect(() => {
    GetRole();
  }, []);

  return (
    <>
      {permission.hasOwnProperty("moduleAccress") &&
      !permission.moduleAccress ? (
        <div className="row text-center">
          <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
            <div className="errer">
              <img src="/program-error.png" />
              <h2>403</h2>
              <p>{permission.message}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="container-fluid">
             <ToastContainer/>
          <div className="main-title">
            <h3>Bidders Ovierview</h3>
          </div>
     
     {
     overview &&  overview.map((res,i)=>{
        return(
          <div>
              <div className="row">
                  <div className="col-xl-12 col-md-12">
                    <div className="justify-content-center mt-2">
                      <div id="primary" className="card">
                      <div className="card-header">
                      <h5>Bidder {i+1}</h5>
                      </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-3 col-12 border">
                              <div className="dec-text">
                              <p>
                                <strong>Name :</strong> { paymentHistoryList?.bidderType != "COMPANY" ? res?.name : res?.nameOfAuthorizedRepresentative}
                              </p>
                              </div>
                            </div>
                            <div className="col-md-3 col-12 border">
                            <div className="dec-text">
                              <p>
                                <strong>Mobile :</strong>{" "}
                                {/* {res?.mobile} */}
                              </p>
                              </div>
                            </div>
                            <div className="col-md-3 col-12 border">
                            <div className="dec-text">
                              <p>
                                <strong>Email :</strong>{" "}
                                {res?.email}
                              </p>
                              </div>
                              </div>
                            
                            <div className="col-md-3 col-12 border">
                              <div className="dec-text">
                              <p>
                                <strong>DOB :</strong> {res?.dob}
                              </p>
                              </div>
                            </div>
                            <div className="col-md-3 col-12 border">
                             <div className="dec-text">
                              <p>
                                <strong>Father Name :</strong>{" "}
                                { paymentHistoryList?.type != "COMPANY" ? res?.fatherName : res?.fatherNameOfAuthorizedRepresentative}
                               
                              </p>
                              </div>
                            </div>
                            <div className="col-md-3 col-12 border">
                            <div className="dec-text">
                              <p>
                                <strong>PAN Number :</strong>{" "}
                                {res?.PANNumber.replace(
                                  /^.{4}/g,
                                  "XXXX"
                                )}
                              </p>
                              </div>
                            </div>
                            <div className="col-md-3 col-12 border">
                            <div className="dec-text">
                              <p>
                                <strong>Address :</strong>{" "}
                               {res?.address +" "+ res?.area +" "+res?.city+" "+ res?.state+ " " + res?.pinCode}
                              </p>
                              </div>
                            </div>
                            <div className="col-md-3 col-12 border">
                            <div className="dec-text">
                              <p>
                                <strong>Tender Form :</strong>{" "}
                                {/* <button className="btn btn-sm btn-primary" onClick={() => loadESignDocument(paymentHistoryList?.documentId, paymentHistoryList?.documentLink)} disabled={paymentHistoryList?.documentId == "" && paymentHistoryList?.documentLink == ""}>Download Tender Form</button> */}
  
                               </p>
                              </div>
                            </div>
                            <div className="col-md-3 col-12 border">
                            <div className="dec-text">
                              <p>
                                <strong>Profile Pic :</strong>{" "}
                                {/* <a className="btn btn-sm btn-primary" href={blobUrl(res?.profilePic)}>Download</a> */}
                               </p>
                              </div>
                            </div>
                            <div className="col-md-3 col-12 border">
                            <div className="dec-text">
                              <p>
                                <strong>Aadhaar Card Front View :</strong>{" "}
                                {/* { 
                                res.AadharImage ?
<a className="btn btn-sm btn-primary" href={blobUrl(res?.AadharImage)}>Download</a>
: 
<span>No Image Found</span>
                                } */}
                                
                               </p>
                              </div>
                            </div>
                            <div className="col-md-3 col-12 border">
                            <div className="dec-text">
                              <p>
                                <strong>Aadhaar Card Back View:</strong>{" "}
                                {/* {
                                  res.AadharImageBack ?
                                  <a className="btn btn-sm btn-primary" href={blobUrl(res?.AadharImageBack)}>Download</a>
                                  :
                                  <span>No Image Found</span>
                                } */}
                               
                               </p>
                              </div>
                            </div>
                            <div className="col-md-3 col-12 border">
                            <div className="dec-text">
                              <p>
                                <strong>PAN Card :</strong>{" "}
                                {/* {
                                  res.PANImage ?
                                  <a className="btn btn-sm btn-primary" href={blobUrl(res?.PANImage)}>Download</a>
                                  :
                                  <span>No Image Found</span>
                                } */}
                                </p>
                              </div>
                            </div>
                           
              

                            {/* <div className="col-md-4 col-12">
                                    <p><strong>Account Number :</strong> {overview.bidder.accountNumber}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>Bank Name :</strong> {overview.bidder.bankName}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>Account Name :</strong> {overview.bidder.accountName}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>IFSC Code :</strong> {overview.bidder.IFSCCode}</p>
                                </div>

                                <div className="col-md-4 col-12">
                                    <p><strong>Company Name :</strong> {overview.bidder.companyName}</p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>Authorized Representative :</strong> {overview.bidder.nameOfAuthorizedRepresentative}
                                    </p>
                                </div>
                                <div className="col-md-4 col-12">
                                    <p><strong>GST Number :</strong> {overview.bidder.GSTNumber}</p>
                                </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
          
                {/* <div className="row">
                  <div className="col-xl-12 col-md-12">
                    <div className="card py-2">
                    <div className="card-header">
                    <h5>KYC documents</h5>
                      </div>
                      <div className="card-body">
                        <div className="justify-content-center mt-2">
                          <div className="row">
                       
                          </div>
                          <div className="flex-wrap d-flex list-images">
                            <div className="list-images-inline">
                              
                                <img
                                  src={blobUrl(res?.AadharImage)}
                                  alt="Avatar"
                                  className="avatar"
                                />
                                <br />
                                <h6>
                                  <strong>Aadhaar Card Front View</strong>
                                </h6>
                                <p>
                                  <strong>Status : </strong>{" "}
                                  {res?.aadharStatus}
                                </p>
                                <br />
                                {res?.aadharRejectReason &&
                                res?.aadharRejectReason != "" ? (
                                  <p>
                                    <strong>Reject Reason : </strong>{" "}
                                    {res?.aadharRejectReason}
                                  </p>
                                ) : (
                                  ""
                                )}
                            </div>

                            <div className="list-images-inline">
                                <img
                                  src={blobUrl(
                                    res?.AadharImageBack
                                  )}
                                  alt="Avatar"
                                  className="avatar"
                                />
                                <br />
                                <h6>
                                  <strong>Aadhaar Card Back View</strong>
                                </h6>
                                <p>
                                  <strong>Status : </strong>{" "}
                                  {res?.aadharStatus}
                                </p>
                                <br />
                                {res?.aadharRejectReason &&
                                res?.aadharRejectReason != "" ? (
                                  <p>
                                    <strong>Reject Reason : </strong>{" "}
                                    {res?.aadharRejectReason}
                                  </p>
                                ) : (
                                  ""
                                )}
                            </div>
                            <div className="list-images-inline">
                                <img
                                  src={blobUrl(res?.PANImage)}
                                  alt="Avatar"
                                  className="avatar"
                                />
                                <br />
                                <h6>
                                  <strong>PAN Card</strong>
                                </h6>
                                <p>
                                  <strong>Status : </strong>{" "}
                                  {res?.panStatus}
                                </p>
                                <br />
                                {res?.panRejectReason &&
                                res?.panRejectReason != "" ? (
                                  <p>
                                    <strong>Reject Reason : </strong>{" "}
                                    {res?.panRejectReason}
                                  </p>
                                ) : (
                                  ""
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
            </div>
        )
      })
     }
         
        
         
                {/* <div className="row">
                  <div className="col-xl-12 col-md-12">
                    <div className="card py-2">
                    <div className="card-header">
                    <h5>Refund Bank Details</h5>
                    </div>
                      <div className="card-body">
                        <div className="justify-content-center mt-2">
                          <div className="row">

                          <div className="col-md-3 col-12">
                            <div className="dec-text">
                              <p>
                                <strong>Bank Name:</strong>{" "}
                                {paymentHistoryList?.bankName}
                              </p>
                              </div>
                            </div>

                            <div className="col-md-3 col-12">
                            <div className="dec-text">
                              <p>
                                <strong>Account Name:</strong>{" "}
                                {paymentHistoryList?.accountName}
                              </p>
                              </div>
                            </div>

                            
                            <div className="col-md-3 col-12">
                            <div className="dec-text">
                              <p>
                                <strong>Bank Account No:</strong>{" "}
                                {paymentHistoryList?.accountNumber}
                              </p>
                              </div>
                            </div>
                            <div className="col-md-3 col-12">
                            <div className="dec-text">
                              <p>
                                <strong>IFSC Code:</strong>{" "}
                                {paymentHistoryList?.IFSCCode}
                              </p>
                              </div>
                            </div>
                           
                            <div className="col-md-4 col-12">
                            <div className="dec-text">
                              <p className="mb-3">
                                <strong>Cancel Cheque</strong>{" "}
                              </p>
                              <img
                                src={blobUrl(paymentHistoryList?.cancelCheque)}
                                alt="Avatar"
                                className="avatar img-fluid"
                              />
                              </div>
                              <br />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
{/*           
                <div className="row">
                  <div className="col-xl-12 col-md-12">
                    <div className="card py-2">
                    <div className="card-header">
                    <h5>EMD Payment Details</h5>
                    </div>
                      <div className="card-body">
                        <div className="justify-content-center mt-2">
                          <div className="table-responsive">
                            <h6 style={{ marginBottom: 10 }}>Payment Status</h6>
                            <table
                              className="table table-bordered"
                              width="100%"
                              cellSpacing="0"
                            >
                              <thead>
                                <tr>
                                  
                                  <th>Amount</th>
                                  
                                  <th>Business</th>
                                  <th>Caller reference no</th>
                                  <th>Gateway</th>
                                  <th>Merchant transaction id</th>
                                  <th>Mode of payment</th>
                                  <th>Payment receive date</th>
                                  <th>Payment request date</th>
                                  <th>Payment status</th>
                                  <th>Payment type</th>
                                  <th>Product</th>
                                  <th>Prospect number</th>
                                  <th>Source app</th>
                                  <th>Status</th>
                                  <th>Transactionid</th>
                                  <th>Refund date/time</th>
                                  <th>Refund transactionid</th>
                                </tr>
                              </thead>

                              <tbody>
                            
                                <tr>
                                          
                                          <td>{paymentHistoryList?.paymentDetails?.amountPaid}</td>
                                         
                                          <td>{paymentHistoryList?.paymentDetails?.business}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.callerReferenceNo}</td>

                                          <td>{paymentHistoryList?.paymentDetails?.gateway}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.merchantTransactionId}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.modeOfPayment}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.paymentReceiveDate}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.paymentRequestDate}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.paymentStatus}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.paymentType}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.product}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.prospectNumber}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.sourceApp}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.status}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.transactionReferenceNumber}</td>
                                          <td>{paymentHistoryList?.paymentDetails?.receiptExpiryDate == "" ? "-" : paymentHistoryList?.paymentDetails?.receiptExpiryDate }</td>
                                          <td>{paymentHistoryList?.paymentDetails?.refundTransactionId == "" ? "-" : paymentHistoryList?.paymentDetails?.refundTransactionId}</td>
                                        
                                        </tr>
                                        
                              </tbody>
                            </table>
                          </div>
                       
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* <div className="card py-2">
                    <div className="card-header">
                    <div className="d-flex align-items-center justify-content-between">
                    <h5>E-sign Tender Document</h5>
              <button className="btn btn-sm btn-primary" onClick={() => loadESignDocument(paymentHistoryList?.documentId, paymentHistoryList?.documentLink)} disabled={paymentHistoryList?.documentId == "" && paymentHistoryList?.documentLink == ""}>Download E-sign Tender Document</button>
            </div> 
                    </div>
                      <div className="card-body"></div>
                      </div> */}
                      {/* <div className="card py-2">
                    <div className="card-header">
                    <div className="d-flex align-items-center justify-content-between">
                    <h5>Sale Certificate</h5>
                    <button className="btn btn-sm btn-primary" disabled={!paymentHistoryList.isHighestBidder} onClick={() => loadSaleCertificate()}>Download Sale Certificate</button>
            </div> 
                    </div>
                      <div className="card-body"></div>
                      </div>         
                 */}
        </div>
      )}
    </>
  );
};

export default BidderOverview;
