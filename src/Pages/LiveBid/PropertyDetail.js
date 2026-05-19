import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import getApiCall from '../../Services/getApiCall';
// import Timer from "../../Components/Timer";
import { formatDate, getDateTime, propertyTitle } from "../../Services/helpers";
import axios from "axios";
import Constant from "../../Components/Constant";
import loginUser from "../../Services/loginUser";
import { toast } from 'react-toastify';
import moment from 'moment';
import CustomButton from '../../Utils/CustomButton';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import ReusableAccordion from '../../Utils/Accordion/ReusableAccordion.jsx';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router';
import '../../css/propertyDetails.css';


function PropertyDetail(props) {
  let { accessToken } = loginUser();

  const socket = props.socket;
  const history = useNavigate();
  const [details, setDetails] = useState()
  const [bid, setBids] = useState([]);
  const [mobileBids, setMobileBids] = useState([]);
  const [isFound, setIsFound] = useState(true);
  const [openBid, setOpenBid] = useState("NA")
  const [highestBid, setHighestBid] = useState("")
  const [isFullBSPaidBid, setIsFullBSPaidBid] = useState(false)
  const [isHighestBidderId, setIsHighestBidderId] = useState('')
  const [isHighestBidder, setIsHighestBidder] = useState('')
  const [isEOIBidder, setIsEOIBidder] = useState('')
  const [propertyReservePrice, setPropertyReservePrice] = useState('')
  const [financialInstituteName, setFinancialInstituteName] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [joinRoom, setJoinroom] = useState(false);
  const [connected, setConnected] = useState(socket.connected)
  const [time, setTimmer] = useState({})
  const [bidder, setBidder] = useState([])
  const [bidderforMobile, setBidderforMobile] = useState([])
  const [reservePriceForMobile, setReservePriceForMobile] = useState([])
  const [hblFileName, setHblFileName] = useState("")
  const [auctionId, setAuctionId] = useState('');
  const [hoverText, setHoverText] = useState('')
  const [open, setOpen] = useState(false);

  let { id } = useParams();

  async function getbidderDetails(id) {
    let data = await getApiCall(`user/property/${id}/bidders/list`);
    let records = []
    if (data.meta.status == true) {
      setFinancialInstituteName(data.data.partnerData.name)
      if (data.data.propertyBidderDetails.length >= 1) {
        setIsFullBSPaidBid(data.data.propertyBidderDetails.filter((bidder) => bidder.isFullBSPaid == true)?.length > 0 ? true : false)
        setIsHighestBidderId(data.data.propertyBidderDetails.filter((bidder) => bidder.isHighestBidder == true)[0]?._id || '')
        records = data.data.propertyBidderDetails.map((item, index) => {
          let status = '';
          if (item?.isVerified) {
            status = "Accepted"
          } else if (!item?.isVerified && !item?.bidderRejectReason) {
            status = 'Pending';
          } else if (!item?.isVerified && item?.bidderRejectReason) {
            status = 'Rejected';
          }

          setAuctionId(data.data.propertyDetails.auctionId)
          setHblFileName(`${data.data.propertyDetails.auctionId}_${data.data.propertyDetails.propertyId}_hbl`)
          return <tr key={index}>
            <td>{(index + 1)}</td>
            <td>{item?.bidderId?.createdAt ? item?.bidderId?.createdAt?.split("T")[0] : 'NA'}</td>
            {/* <td>{item.participationId !== undefined ? item.participationId : "-"}</td> */}
            <td><a href={`/bidder/bidder_overviews/${item.participationId}`}>{item.participationId !== undefined ? item.participationId : "-"}</a></td>
            <td>{item?.bidderId?.type}</td>
            <td>{item?.bidderId?.type != "COMPANY" ? item?.bidderId?.name : item?.bidderId?.companyName}</td>
            <td>{item?.bidderId?.email}</td>
            {/* <td>{item.bidderId.mobile}</td> */}
            <td>{item.totalPaidAmount}</td>
            <td>{data.data.propertyDetails.price}</td>
            <td>{item.isSigned == true ? "Done" : "Pending"}</td>
            <td>Success</td>

          </tr>
        })
        setBidder(previous => [...previous, records]);
        setBidderforMobile(data.data.propertyBidderDetails);
        setReservePriceForMobile(data.data.propertyDetails.price);
      } else {
        records = <tr><td colspan={15} style={{ textAlign: 'center' }}>No Records</td></tr>
        setBidder(previous => [...previous, records]);
      }
    } else {
      records = <tr><td colspan={15} style={{ textAlign: 'center' }}>No Records</td></tr>
      setBidder(previous => [...previous, records]);
    }

  }
  async function getPropertyDetailsById(id) {
    setIsFound(false)
    let response = await getApiCall('user/property/getDetailsById/' + id);
    if (response.meta.status) {
      setDetails(response.data);
    }
  }
  function RoomJoinInit(id) {
    if (!joinRoom) {
      // wait until socket is connected, then emit
      if (socket.connected) {
        socket.emit('join_room', { propertyId: id });
        setJoinroom(true);
      } else {
        // attach one-time listener for connect
        socket.once('connect', () => {
          socket.emit('join_room', { propertyId: id });
          setJoinroom(true);
        });
      }
    }
  }

  function truncateText(value) {
    let truncated = value.length < 50 ? value : value.substring(0, 50) + "...";
    return truncated;
  }

  function handleMouseOver(e) {
    if (e.length < 50) {
      return
    }
    setHoverText(e)
  }
  function renderBidList() {
    history(`/liveBidderList/${id}`)
  }
  async function downloadExcel() {
    let response = await getApiCall(`user/bid/bidder/letter/644cd52378fa9a3ef4981d20`);
    if (response.meta.status) {
      // console.log(response.data)
      var csvString = response.data;
      var universalBOM = "\uFEFF";
      var a = window.document.createElement('a');
      a.setAttribute('href', 'data:text/csv; charset=utf-8,' + encodeURIComponent(universalBOM + csvString));
      a.setAttribute('download', 'exportLeadList.csv');
      window.document.body.appendChild(a);
      a.click();
      // window.location.reload();
    }

  }

  async function downloadPDF2() {
    let response = await getApiCall(`user/bid/bidder/letter/644cd52378fa9a3ef4981d20`);
    if (response.meta.status) {
      var pdfData = response.data;
      // Create a Blob from the PDF data
      var blob = new Blob([pdfData], { type: 'application/pdf' });

      // Create a temporary link element to trigger the download
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'exportLeadList.pdf';
      document.body.appendChild(link);
      link.click();
      // document.body.removeChild(link);
    }
  }

  async function downloadPDF3() {
    let response = await getApiCall(`user/bid/bidder/letter/644cd52378fa9a3ef4981d20`);
    if (response instanceof Blob) {
      // Create a temporary link element to trigger the download
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(response);
      link.download = 'exportLeadList.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  async function goBackPage() {
    // window.location.href = '/live_bid';
    history('/live_bid', { checkGoback: true });
  }

  async function downloadPDF() {
    try {
      const config = {
        headers: {
          authkey: accessToken
        },
        responseType: 'blob'
      };
      const response = await axios.get(Constant.apiBasePath + 'user/bid/bidder/letter/' + details?._id, config);
      const pdfData = response.data;

      // Create a Blob from the PDF data
      const blob = new Blob([pdfData], { type: 'application/pdf' });

      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = hblFileName + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // Handle any errors
      console.error('Error downloading PDF:', error);
    }
  }


  useEffect(() => {
    // --- socket handlers ---
    if (!socket.connected) {
      socket.connect();
    }
    const handleConnect = () => {
      console.log("Connected ✅");
      RoomJoinInit(id); // join when connected
    };

    const handleDisconnect = () => {
      console.log("Disconnected ❌");
    };



    // --- fetch property + bidder details once ---
    getPropertyDetailsById(id);
    getbidderDetails(id);

    // --- attach socket listeners ---
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("get_chat_admin", updateBids);

    // --- cleanup ---
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("get_chat_admin", updateBids);
      socket.disconnect();
    };
  }, [id]);

  const updateBids = (data) => {
    console.log("data::::::::bids:::::", data);
    let records = "";

    if (data?.meta?.status) {
      let items = data?.data || [];

      items = items.filter((item) => item.isPrebid === false);
      console.log("items123 = ", items);
       const recordsForMobileBids = items.map((rec, index) => {
          return {
            amount: rec.message,
            bidderId: rec.bidder.bidderId,
            time: getBidDate(rec.createdAt)
          };
        });

      if (items.length >= 1) {
        setOpenBid(items[items.length - 1].message);
        setHighestBid(items[0]?.message);
        setIsHighestBidder(items[0]?.bid?.isHighestBidder);
        setIsEOIBidder(items[0]?.bid?.isEoi);
        setPropertyReservePrice(items[0]?.bid?.offerAmount);
        setPropertyAddress(items[0]?.properties?.address);

        records = items.map((rec, index) => (
          <tr key={`${rec.bidder.bidderId}_${index}`}>
            <td>{rec.message}</td>
            <td>{rec.bidder.bidderId ?? "-"}</td>
            <td>{getBidDate(rec.createdAt)}</td>
          </tr>
        ));
       
        setMobileBids(recordsForMobileBids);
        setBids(records);
        setIsFound(true);
      } else {
        records = (
          <tr>
            <td>No bid</td>
          </tr>
        );
        setBids(records);
        setIsFound(false);
      }
    } else {
      records = (
        <tr>
          <td>No bid</td>
        </tr>
      );
      setBids(records);
      setIsFound(false);
    }
  };
  function getBidDate(dateString) {
    const date = new Date(dateString);
    const formatDate = date.toLocaleDateString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return formatDate
  }

  async function loadSaleCertificate() {
    let bidderId = isHighestBidderId; //to be ask 
    try {
      const config = {
        headers: {
          authkey: accessToken
        },
        responseType: 'blob'
      };
      // const response = await axios.get(Constant.apiBasePath + `admin/sale/letter/${bidderId}`, config);
      const response = await axios.get(Constant.apiBasePath + `admin/sale/letter/v2/${bidderId}`, config);
      //  let response = await getApiCall(`admin/sale/letter/686e57b5dae23b9aa9cb6797`);

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sale_Certificate_${auctionId}_${moment(new Date()).format('DD-MM-YYYY')}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Download successfully');
    } catch (error) {
      toast.error(error?.message || 'An unexpected error occurred during dowload.');
      console.error('Download failed:', error);
    }
    // window.open(`${Constant.apiBasePath}admin/sale/letter/${bidderId}`);
    // setSaleCertificate(`${Constant.apiBasePath}common/sale/admin/letter/${bidderId}`);
  }

  async function downloadBidderHBL() {
    try {
      const config = {
        headers: {
          authkey: accessToken
        },
        responseType: 'blob'
      };
      const response = await axios.get(Constant.apiBasePath + 'user/bid/bidder/letter/singlePage/' + details?._id, config);
      const pdfData = response.data;

      // Create a Blob from the PDF data
      const blob = new Blob([pdfData], { type: 'application/pdf' });

      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = hblFileName + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // Handle any errors
      console.error('Error downloading PDF:', error);
    }
  }
  console.log('isFullBSPaidBid::::::', isFullBSPaidBid, details?.soldStatus, isHighestBidder)
  const headerButtons = () => {
    return (
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between">
        <div className='mt-2'>
          <b><span>NIT Ref No. </span>{"  :-  "}
            {financialInstituteName + " Vs " + details?.borrowerName}
          </b>
          <p></p>
        </div>
        <div className="position-relative d-flex justify-content-end w-sm-auto">
          {(details?.isAwarded ||
            (isFullBSPaidBid &&
              details?.soldStatus === "YES" &&
              isHighestBidder)) && (
              <CustomButton
                label=""
                icon="bi-download"
                appendClass="bg-transparent mx-2"
                onClick={() => setOpen(!open)}
              />
            )}

          {open && (<>
            <div className="user-backdrop" onClick={() => setOpen(false)}></div>
            <div
              className="user-dropdown show shadow"
              style={{
                display: "block",
                position: "absolute",
                top: "105%",
                right: 0,
                minWidth: "220px",
                borderRadius: "10px",
                padding: "0"
              }}
            >
              <>
                {/* */}
                {details?.isAwarded &&
                  <div className="border-bottom">
                    <Link
                      className="dropdown-item gap-2 py-2"
                      onClick={() => { downloadBidderHBL(); setOpen(false) }}
                    >
                      <i className="bi bi-download mx-2"></i>  Download HBL
                    </Link>
                  </div>
                }
                {details?.isAwarded &&
                  <div className="border-bottom">
                    <Link
                      className="dropdown-item gap-2 py-2"
                      onClick={() => { downloadPDF(); setOpen(false) }}
                    >
                      <i className="bi bi-download mx-2"></i>  Download HBL Report
                    </Link>
                  </div>
                }

                {isFullBSPaidBid && details?.soldStatus == "YES" && isHighestBidder &&
                  <div className="border-bottom">
                    <Link
                      className="dropdown-item gap-2 py-2"
                      onClick={() => { loadSaleCertificate(); setOpen(false) }}
                    >
                      <i className="bi bi-download mx-2"></i>   Download Sale Certificate
                    </Link>
                  </div>
                }
              </>
            </div>
          </>)}
        </div>
      </div>
    )
  }

  function formatRupee(num) {
  if (num == null || !num) return "";
  // Convert number to string
  let x = num.toString();
  // Last 3 digits
  let lastThree = x.substring(x.length - 3);
  // Other digits before last 3
  let otherNumbers = x.substring(0, x.length - 3);
  // Add commas to the other numbers (Indian grouping)
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
    otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  }
  return "₹" + otherNumbers + lastThree;
}


  return (
    <>
      <div className="propertyDetails container-fluid">
        <div className="main-title">
          <FilterWithButtonsCard
            title={
              <div className="d-flex align-items-center gap-2">
                <span
                  onClick={() => goBackPage()}
                  style={{ cursor: "pointer", marginRight: "8px" }}
                >
                  <i
                    className="bi bi-arrow-left-circle"
                    style={{ color: '#EF5713', fontSize: '22px' }}
                  ></i>
                </span>

                <h3 className="m-0">Auction Details</h3>
              </div>
            }




            headerButtons={<>{headerButtons()}</>} />

        </div>
      
        {/* <div className="main-title">
                    <h3>Auction Details</h3>
                </div> */}
        {/* <div className="d-flex flex-row justify-content-between w-100">
                    <div className=' text-left'>
                        <button type="submit" className="btn btn-warning" onClick={() => goBackPage()}>Go
                            Back
                        </button>
                    </div>
                    <div className='text-left'>
                    <b><span>NIT Ref No. </span>{"  :-  "}
                    {financialInstituteName + " Vs " + details?.borrowerName} 
                    </b>  
                   <p></p>
                    </div>
                    <div className='d-flex flex-row justify-content-between' style={{ width: '28%'}}>
                    <button className="btn btn-primary" type={"button"}
                            onClick={() => downloadBidderHBL()} disabled={details?.isAwarded === true ? false : true}
                            >HBL 
                        </button>
                    <button className="btn btn-primary" style={{ border: '1px solid'}} type={"button"}
                            onClick={() => downloadPDF()} disabled={details?.isAwarded === true ? false : true}
                            >HBL Report
                        </button>
                    <button className="btn btn-primary" style={{ border: '1px solid'}} disabled={!isFullBSPaidBid && details?.soldStatus == "NO" && isHighestBidder} onClick={() => loadSaleCertificate()}>Download Sale Certificate</button>
                    </div>
                    
                </div> */}

        <div className="card h-100 py-2 mt-2 web-view">
          <div className="card-body">
            <div className='d-flex flex-row justify-content-between'>
              <div style={{ width: '120%', marginTop: '0.75rem' }}>
                <div className="">
                  {
                    isFound ?
                      <div className="table-responsive" style={{ maxHeight: '320px' }}>
                        <div className="col-md-12 col-12" style={{ background: "#242056", textAlign: 'center', height: '2rem' }}>
                          <div className="dec-text">
                            <p>
                              <strong style={{ color: '#fff', fontSize: '14px' }}>Bid Summary</strong>
                            </p>
                          </div>
                        </div>
                        <table className="table table-bordered table-striped">
                          <thead>
                            <tr>
                              <th scope="col">Amount</th>
                              <th scope="col">Bidders ID</th>
                              <th scope="col">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bid}
                          </tbody>
                        </table>

                      </div>
                      : <>
                        <h5 className={'text-center'}>No Bid Found</h5>
                      </>
                  }

                </div>
              </div>
              <div className="card-body">
                <div className="row" style={{ fontSize: '12px' }}>
                  <div className="col-md-12 col-12" style={{ background: "#242056", textAlign: 'center', height: '2rem' }}>
                    <div className="dec-text">
                      <p style={{ marginTop: '0.3rem' }}>
                        <strong style={{ color: '#fff', fontSize: '14px' }}>Property Details</strong>
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong>Prospect Number :</strong>
                        {details?.prospectId}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong>Property Title :</strong>{" "}
                        {propertyTitle(details)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong>Property Address :</strong>{" "}
                        <td className="new-tooltip1" onMouseOver={() => handleMouseOver(details?.address)}>{details?.address && truncateText(details?.address)}
                          {
                            details?.address?.length > 50 ?
                              <span>{hoverText}</span>
                              : <></>
                          }

                        </td>
                      </p>
                    </div>
                  </div>

                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong>Borrower Name:</strong>
                        {details?.borrowerName}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong>Institution Name:</strong>{" "}
                        {financialInstituteName}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong>Location:</strong>{" "}
                        {details?.cityName} {", "}  {details?.stateName}
                      </p>
                    </div>
                  </div>

                  <div className="col-md-12 col-12" style={{ background: "#242056", textAlign: 'center', height: '2rem' }}>
                    <div className="dec-text">
                      <p style={{ marginTop: '0.3rem' }}>
                        <strong style={{ color: '#fff', fontSize: '14px' }}>Price</strong>
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong>Reserve Price :</strong>{" "}
                        {details?.price}
                      </p>
                    </div>
                  </div>

                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong>Bid Closing Amount :</strong>{" "}
                        {highestBid}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong>Bid Increment Amount:</strong>{" "}
                        {details?.bidIncrementAmount}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-12 col-12" style={{ background: "#242056", textAlign: 'center', height: '2rem' }}>
                    <div className="dec-text">
                      <p style={{ marginTop: '0.3rem' }}>
                        <strong style={{ color: '#fff', fontSize: '14px' }}>Auction Dates</strong>
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong>Auction Date:</strong>{" "}
                        {details?.auctionStartDateTimeEpoch ? getDateTime(details.auctionStartDateTimeEpoch)?.date.toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong> Auction Start Time to Auction End Time:</strong>{" "}
                        {details?.auctionStartTime + '-' + details?.auctionEndTime}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 border">
                    <div className="dec-text">
                      <p>
                        <strong>EMD Submition Date:</strong>{" "}
                        {details?.EMDLastPaymentDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>


            </div>

            <div style={{ background: "#242056", textAlign: 'center', height: '2rem' }}>
              <div className="dec-text">
                <p >
                  <strong style={{ color: '#fff' }}>Bidders</strong>
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered" width="100%" cellSpacing="0" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(0,0,0,.05)' }}>
                    <th>S No.</th>
                    <th>Registration Date</th>
                    <th>Participation ID</th>
                    <th>Bidder Type</th>
                    <th>Bidder Name</th>
                    <th>Bidder Email</th>
                    {/* <th>Bidder Mobile</th> */}
                    <th>EMD Amount</th>
                    <th>Reserve Price</th>
                    <th>E-sign Status</th>
                    <th>Payment Status</th>

                  </tr>
                </thead>

                <tbody>
                  {bidder}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      </div>

        <div className="accordion-mobile-view">
        <ReusableAccordion title="Bid Summary">
          <div style={{ marginTop: '0.75rem' }}>
            <div className="">
              {
                isFound ?
                  <>
                    {mobileBids?.map((bid, index) => (
                      <div className='summary-card'>
                        <div key={index} className='summary-item'>
                          <div className='summary-fr'>
                            <div>
                              <div className='summary-fr-title'>Amount</div>
                              <div className='summary-fr-amount'>
                                {
                                  index === 0 ? (
                                    <span className='summary-fr-amount-badge-highest'>
                                      Highest
                                    </span>
                                  ) : null
                                }
                                {formatRupee(bid.amount)}</div>
                               
                            </div>

                            <div>
                              <div className='summary-fr-title'>Bidder ID</div>
                              <div className='summary-fr-bidderId'>{bid.bidderId}</div>
                            </div>
                          </div>
                          <div class="bid-summary-custom-divider"></div>
                          <div className='summary-sr'>
                            <div className='summary-fr-title'>Time</div>
                            <div>{bid.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                  : <>
                    <h5 className={'text-center'}>No Bid Found</h5>
                  </>
              }

            </div>
          </div>
        </ReusableAccordion>
        <ReusableAccordion title="Property Details">
          <div style={{ marginTop: '0.75rem' }}>
            <div className="">
              <>
                <div>
                  <div className='summary-sr'>
                    <p className='summary-fr-title'>Prospect Number</p>
                    <p>{details?.prospectId}</p>
                  </div>
                  <hr />
                  <div className='summary-sr'>
                    <p className='summary-fr-title'>Property Title</p>
                    <p>{propertyTitle(details)}</p>
                  </div>
                  <hr />

                  <div className='summary-sr'>
                    <p className='summary-fr-title'>Property Address</p>
                    <p>
                        <td className="new-tooltip1" onMouseOver={() => handleMouseOver(details?.address)}>{details?.address && truncateText(details?.address)}
                          {
                            details?.address?.length > 50 ?
                              <span>{hoverText}</span>
                              : <></>
                          }

                        </td>
                      </p>
                  </div>
                  <hr />

                  <div className='summary-sr'>
                    <p className='summary-fr-title'>Borrower Name</p>
                    <p>
                      {details?.borrowerName}</p>
                  </div>
                  <hr />

                  <div className='summary-sr'>
                    <p className='summary-fr-title'>Institution Name</p>
                    <p>
                      {financialInstituteName}</p>
                  </div>
                  <hr />

                  <div className='summary-sr'>
                    <p className='summary-fr-title'>Location</p>
                    <p>
                      {details?.cityName} {", "}  {details?.stateName}</p>
                  </div>
                </div>
              </>
            </div>
          </div>
        </ReusableAccordion>
        <ReusableAccordion title="Price">
          <div style={{ marginTop: '0.75rem' }}>
            <div className="">
              <>
                <div>
                  <div className='summary-sr'>
                    <p className='summary-fr-title'>Reserve Price</p>
                    <p>{formatRupee(details?.price)}</p>
                  </div>
                  <hr />
                  <div className='summary-sr'>
                    <p className='summary-fr-title'>Bid Closing Amount</p>
                    <p className='summary-fr-bid-closing-amount'>{formatRupee(highestBid)}</p>
                  </div>
                  <hr />
                  
                  <div className='summary-sr'>
                    <p className='summary-fr-title'>Bid Increment Amount</p>
                    <p>{formatRupee(details?.bidIncrementAmount)}</p>
                  </div>
                </div>
              </>
            </div>
          </div>
        </ReusableAccordion>
        <ReusableAccordion title="Auction Dates">
          <div style={{ marginTop: '0.75rem' }}>
            <div className="">
              <>
                <div>
                  <div className='summary-sr'>
                    <p className='summary-fr-title'>Auction Date</p>
                    <p>{details?.auctionStartDateTimeEpoch ? getDateTime(details.auctionStartDateTimeEpoch)?.date.toLocaleDateString() : ''}</p>
                  </div>
                  <hr />
                  <div className='summary-sr'>
                    <p className='summary-fr-title'>Auction Start Time to Auction End Time</p>
                    <p>{details?.auctionStartTime + '-' + details?.auctionEndTime}</p>
                  </div>
                  <hr />
                  
                  <div className='summary-sr'>
                    <p className='summary-fr-title'>EMD submission Date</p>
                    <p>{details?.EMDLastPaymentDate}</p>
                  </div>
                </div>
              </>
            </div>
          </div>
        </ReusableAccordion>
         <ReusableAccordion title="Bidders">
          <div style={{ marginTop: '0.75rem' }}>
            <div className="">
                  <>
                    {bidderforMobile?.map((bidder, index) => (
                      <div className='bidder-summary-card'>
                        <div key={index} className='summary-item'>
                          <div className='bidder-summary-fr'>
                            <div className='bidder-card-header'>
                              <Avatar>
                                <PersonIcon />
                              </Avatar>
                              <div>
                                <div className='bidder-summary-fr-title'>{bidder?.bidderId?.type != "COMPANY" ? bidder?.bidderId?.name : bidder?.bidderId?.companyName}</div>
                                <div><a href={`/bidder/bidder_overviews/${bidder.participationId}`}>{bidder.participationId !== undefined ? bidder.participationId : "-"}</a></div>
                              </div>
                            </div>
                           
                            <div><span className='summary-fr-amount-badge'>Done</span></div>
                          </div>

                          <div className='bidder-summary-mr'>
                            <div>
                            <p className='summary-fr-title'>Registration Date</p>
                            <p>{bidder?.bidderId?.createdAt ? bidder?.bidderId?.createdAt?.split("T")[0] : 'NA'}</p>
                            </div>
                            <div>
                            <p className='summary-fr-title'>Bidder Type</p>
                            <p>{bidder?.bidderId?.type}</p>
                            </div>
                          </div>
                            <div class="custom-divider"></div>

                          <div className='bidder-summary-sr'>
                            <p className='summary-fr-title'>Email</p>
                            <p>{bidder?.bidderId?.email}</p>
                          </div>
                          <div class="custom-divider"></div>

                          <div className='bidder-summary-mr'>
                            <div>
                            <p className='summary-fr-title'>Emd Amount</p>
                            <p>{formatRupee(bidder?.totalPaidAmount)}</p>
                            </div>
                            <div>
                            <p className='summary-fr-title'>Reserve Price</p>
                            <p>{formatRupee(reservePriceForMobile)}</p>
                            </div>
                          </div>
                            <div class="custom-divider"></div>

                            <div className='bidder-summary-sr'>
                            <p className='summary-fr-title'>status</p>
                            <p>
                              <span className='summary-fr-amount-badge'>E-sign: {bidder.isSigned == true ? "Done" : "Pending"}</span>
                              <span className='summary-fr-amount-badge'>Payment: Success</span>
                            </p>
                          </div>
                          
                          <button class="outline-btn"><a  href={`/bidder/bidder_overviews/${bidder.participationId}`}>View Full Details</a></button>
                        </div>
                      </div>
                    ))}
                  </>
            </div>
          </div>
        </ReusableAccordion>
        </div>
    </>
  )
}

export default PropertyDetail