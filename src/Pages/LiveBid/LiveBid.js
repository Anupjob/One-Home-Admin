import React, { useEffect, useState } from "react";
import axios from "axios";
import Constant from "../../../src/Components/Constant";
import { getAccessToken } from "../../../src/Services/AccessToken";
import postApiCall from "../../Services/postApiCall";
import { useNavigate ,useLocation } from "react-router-dom";
import { blobUrl } from "../../Services/helpers";
import Pagination from "../../Widgets/Pagination";
// import Timer from "../../Components/Timer";
import { Link } from "react-router-dom";
import PaginationNew from "../../Widgets/PaginationNew";
import useGetRoleModule from "../../Services/useGetRoleModule";
import { Loader, Placeholder } from "rsuite";
import moment from "moment";
import { DateRangePicker, Stack, SelectPicker } from "rsuite";
import "rsuite/dist/rsuite.css";
import { toast, ToastContainer } from "react-toastify";
import FileDownloadIcon from '@rsuite/icons/FileDownload';
import { Checkbox } from 'rsuite';
import CardListMobile from "../../Utils/CardsMobileView/CardListMobile";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";
import CustomButton from "../../Utils/CustomButton";

export default function LiveBid(props) {
  const socket = props.socket;
  const [getProperties, setProperties] = useState([]);
  const [searchProperty, setSearchProperty] = useState("");
  const [auctionFilter, setAuctionFilter] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);

  const [connected, setConnected] = useState(socket.connected)
  const [pageNo, setPageNo] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(Constant.perPage);
  const [isLoaded, setIsLoaded] = useState(true);
  const [permission, setPermission] = useState({});
  const [startDate, setstartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [partner, setPartner] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [pastFilter, setpastFilter] = useState("")
  const [latestBid,setLatestBid] = useState('');
  const [joinRoom, setJoinroom] = useState(false);
  const [mobileResponseData, setMobileResponseData] = useState()
  const history = useNavigate();
   const [data, setData] = useState();

   const location = useLocation();
   const checkGoback = location.state?.checkGoback || false; 

   React.useEffect(() => {
    if (checkGoback) {
      console.log('Value received:', checkGoback);

      // Retrieve values from localStorage
      const storedSearchProperty = localStorage.getItem("searchProperty") || "";
      const storedStartDate = localStorage.getItem("startDate") || "";
      const storedEndDate = localStorage.getItem("endDate") || "";

      // Bind the retrieved values
      setSearchProperty(storedSearchProperty);
      setstartDate(storedStartDate);
      setEndDate(storedEndDate);

      // Trigger the search with the retrieved values
      getBidList(1, storedStartDate, storedEndDate, storedSearchProperty);
    }
}, [checkGoback]);

  async function GetRole() {
    let Role = await useGetRoleModule("Auctions");
    setPermission(Role);
    getBidList(1, "", "", searchProperty);

    let partnerLis = await postApiCall(
      "admin/partner/getPartnerUser",
      {},
      true
    );
    if (partnerLis.meta.status) {
      let out = partnerLis.data.map((_) => {
        return {
          label: _.parnterName || '',
          value: _.partnerId,
        };
      });
      if (Role.role == "admin") {
        setPartner(
          <div>
            <div className="form-group">
              <label htmlFor="exampleFormControlSelect1">Partner</label>
              <SelectPicker
                data={out}
                style={{ width: 250 }}
                onChange={(e) => tagPickerHandler(e)}
              />
            </div>
          </div>);
      }
    }
  }

  async function tagPickerHandler(e) {
    setSelectedPartner(e);
  }

  async function pastFilterHandler(e) {
    getBidList(1, "", "", "", e);
    // setpastFilter(e);
  }


  useEffect(() => {
    let tab_id = localStorage.getItem("auctionFilter");
    if (tab_id) {
      setAuctionFilter(+tab_id);
    }
    if(auctionFilter === 1){
      getProperties &&  getProperties.map((el)=>{
        RoomJoinInit(el._id)
      })
    }
 
  }, []);

  // useEffect(()=>{
  //     getProperties &&  getProperties.map((el)=>{
  //       RoomJoinInit(el._id)
  //     })

  //   function updateBids(data) {
  //     let sameArrayGetProperties = getProperties.length >=1 ? getProperties : []
  //     if (data.meta.status == true) {
  //         let items = data.data
  //         items = items ? items.filter((item) => {
  //             return item.isPrebid == false
  //         }) : []
  //         if (items.length >= 1) {
  //          let index =  sameArrayGetProperties.findIndex((obj)=> obj._id === items[0].propertyId)
  //         if(index != -1){
  //           sameArrayGetProperties[index].latestBid = items[0].message
  //         }
  //           setLatestBid(items[0].message)
  //         } else {
  //            setLatestBid('No Bid')
  //         }
  //     }
  // }
  //   function addConnect(){
  //     setConnected(true)
  //   }
  //   function updateConnection(){
  //     setConnected(false)
  //   }
  //   socket.timeout(5000).on('get_chat_admin',updateBids);
  //   return () => {
  //       socket.off('connect', addConnect);
  //      socket.off('disconnect', updateConnection);
  //     socket.off('get_chat_admin', updateBids);
      
  //   };
  // },[auctionFilter])

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


  const dateRangeHandler = (e) => {
    if (e) {
      let sDate = e[0];
      let eDate = e[1];
      setstartDate(moment(sDate).format("YYYY/MM/DD"));
      setEndDate(moment(eDate).format("YYYY/MM/DD"));
    } else {
      setstartDate("");
      setEndDate("");
      //console.log("DATE RANGE CLEARED");
    }
  };

  useEffect(() => {
    GetRole();
    getBidList(1, "", "", searchProperty);
    localStorage.setItem("auctionFilter", auctionFilter);

    return () => {
      setProperties("");
    };
  }, [auctionFilter]);

  async function getBidList(page, fromDate, toDate, searchKey, pastFilter = "") {
    setIsLoaded(false);

    let metaData = {
      auctionFilter: auctionFilter,
      propertyFor: 2,
      contentPerPage: Constant.perPage,
      page,
      searchKey,
      fromDate: startDate,
      toDate: endDate,
      partnerArr: selectedPartner != null ? [selectedPartner] : [],
      pastFilter: pastFilter
    };
     // Retrieve values from localStorage
     localStorage.setItem("searchProperty",searchKey);
    localStorage.setItem("startDate",startDate);
localStorage.setItem("endDate",endDate);

    let token = getAccessToken();
    let response = await axios.post(
      Constant.apiBasePath + `user/property/get-all`,
      metaData,
      { headers: { authkey: token } }
    );
    setData(response.data);
    setProperties(Array.isArray(response.data.data) ? response.data.data : []);
    setTotalItems(response.data.total);
    setIsLoaded(true);
    const formattedData = response.data.data.map((item, index) => {
      const baseData = [
        { label: "Auction ID", value: item.auctionId },
        { label: "NIT Ref No.", value: `${item?.partner?.name} Vs ${item?.borrowerName}` },
        { label: "Prospect No.", value: item.propertyId },
        { label: "Auction Date", value: item.auctionDate },
        { label: "Reserve Price", value: (item.price).toLocaleString('en-IN', { style: 'decimal' }) },
        { label: "No. of Bidders", value: item.noOfBidders }
      ];

      // 👉 Adding Last Bid When auctionFilter is not 2
      if (auctionFilter !== 2) {
        baseData.push({ label: "Last Bid", value: (item.highestBidAmount).toLocaleString('en-IN', { style: 'decimal' }) || "—" });
      }

      return {
        header: `S No: ${(index + 1) + ((pageNo - 1) * Constant.perPage)}`,
        data: baseData,
        status: "",
        footerId: item.auctionId,
        url: `/Property_Details/${item._id}`
      };
    });

    setMobileResponseData(formattedData);

}
  useEffect(() => {
    getBidList(pageNo, "", "", searchProperty);
  }, [pageNo]);

  function pageChangeHandler(page) {
    setPageNo(page);
  }

  const paginationHandler = (page) => {
    getBidList(page, "", "", "");
  };

  async function searchAuction() {
    const data = {
      propertyFor: 2,
      auctionFilter: auctionFilter,
      searchKey: searchProperty,
    };
    getBidList(1, "", "", searchProperty);

  }

  async function downloadSummery() {

    let metaData = {
      searchKey: searchProperty,
      fromDate: startDate,
      toDate: endDate,
      partnerArr: selectedPartner != null ? [selectedPartner] : [],

    };
    let token = getAccessToken();
    //   let response = await axios.post(
    //   Constant.apiBasePath + `user/property/auction/summary`,
    //   metaData,
    //   { headers: { authkey: token } }
    // );
    const response = await axios({
      url: Constant.apiBasePath + "user/property/auction/summary",
      method: "POST", // Changed to POST
      responseType: "blob",
      headers: {
        authkey: token,
        "Content-Type": "application/json", // Added content type for POST request
      },
      data: JSON.stringify(metaData), // Send data in the request body
    });

    if (response.status) {
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Auction summary.xlsx";
      document.body.appendChild(link);
      link.click();
      // Clean up the URL object when the download is complete
      URL.revokeObjectURL(url);
    }

  }

  const CheckboxHandler = (e) => {
    console.log(e)
  }

  const closingBid = (bidvalue) => {
    if (!bidvalue?.length) {
      return ""
    }
    const hasNotTrueIsBid = bidvalue.findIndex(obj => obj.isHighestBidder);
    if (hasNotTrueIsBid != -1) {
      return (bidvalue[hasNotTrueIsBid].highestBidAmount).toLocaleString('en-IN', { style: 'decimal' })
    } else {
      return ""
    }

  }

  // let propertyList = [];
  // if (isLoaded) {
  //   if (getProperties.length > 0) {
  //     propertyList = getProperties.map((el, index) => {
  //       return (
  //         <div className="propertyList" key={index}>

  //             <div className="row no-gutters align-items-center">
  //             {auctionFilter == 3 || auctionFilter == 2 ? 
  //               <div className="col-auto"><Checkbox value={el._id} onChange={(value, checked, event) => CheckboxHandler(value, checked, event)}/></div>
  //              : null}
  //               <Link to={"/Property_Details/" + el._id}><div className="col-auto  mr-3">
  //                 <div className="orangetext text-center">
  //                   {" "}
  //                   {/* {auctionFilter == 1 ? "live" : ""}{" "} */}
  //                 </div>
  //                 <Link
  //                   className="orangetext"
  //                   to={"/property/details/" + el._id}
  //                 >
  //                   {/* <img
  //                     alt=""
  //                     src={
  //                       el?.propertyImages?.length
  //                         ? blobUrl(el.propertyImages[0].images[0])
  //                         : "../../assets/images/download.jpg"
  //                     }
  //                   /> */}
  //                 </Link>
  //               </div></Link>

  //               <div className="col time">

  //                 {auctionFilter == 1 || auctionFilter == 2 ? (

  //                   <Timer endDateTime={el.auctionExtendedDateTimeEpoch} auctionType={auctionFilter}/>
  //                 ) : (
  //                   ""
  //                 )}
  //                 <h5>
  //                   {" "}
  //                   Property Id :{" "}
  //                   <Link
  //                     className="orangetext"
  //                     to={"/Property_Details/" + el._id}
  //                   >
  //                     {el.propertyId}{" "}
  //                   </Link>
  //                 </h5>
  //                 <h5>
  //                   {" "}
  //                   Auction Id :{" "}
  //                   <Link
  //                     className="orangetext"
  //                     to={"/Property_Details/" + el._id}
  //                   >
  //                     {el.auctionId}
  //                   </Link>
  //                 </h5>
  //                 {/* <h5>
  //                   <Link
  //                     className="orangetext"
  //                     to={"/Property_Details/" + el._id}
  //                   >
  //                     {" "}
  //                     {+el.noOfBedRooms > 0 ? `${el.noOfBedRooms} BHK` : ""}{" "}
  //                     {el.buildingType === 1 ? "Residential" : "Commercial"}{" "}
  //                   </Link>{" "}
  //                 </h5>

  //                 <p>{el.locality}</p> */}
  //                   <h5>NIT Reference No. : {el?.partner?.bankName} Vs {el?.borrowerName}</h5>

  //                 <Link
  //                     className="orangetext"
  //                     to={"/Property_Details/" + el._id}
  //                   ><button className="btn btn-sm btn-warning">Click here to view more</button></Link>

  //               </div>
  //               <div className="col-auto  mr-3">
  //                 <h6 className="orangetext">Start Date - {el.auctionDate}</h6>
  //                 <p className="openingbidtext">
  //                   {auctionFilter == 2
  //                     ? "Closing Bid (RP) N/A "
  //                     : "Closing Bid (RP)" + "  "+ closingBid(el.bidderBids)}

  //                 </p>

  //                 <h4>
  //                 Reserve Price :{" "}
  //                   <span className="orangetext h5"> Rs. {el.price}</span>
  //                 </h4>
  //                 <p>No. of bidders : {el.totalBidders === undefined ? 0 : el.totalBidders}</p>
  //                 {auctionFilter === 1 && auctionFilter === 3 ? <p>No. of participants : {el.totalBidders === undefined ? 0 : el.totalBidders - el.notParticipatedBidders}</p> : null}
  //               </div>
  //             </div>

  //         </div>

  //       );
  //     });
  //   } else {
  //     propertyList = (
  //       <div className="propertyList">
  //         <div className="orangetext text-center">
  //           {" "}
  //           <h4>No Data Found</h4>{" "}
  //         </div>
  //       </div>
  //     );
  //   }
  // } else {
  //   propertyList = (
  //     <div className="propertyList">
  //       <div>
  //         <Placeholder.Paragraph rows={8} />
  //         <Loader backdrop content="loading..." size="lg" vertical />
  //       </div>
  //       {/* <div className="orangetext text-center"> <h4>Loading...</h4> </div> */}
  //     </div>
  //   );
  // }

  const headerButtons = () => {
    return (
      <>  
              <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
                                <div className="position-relative">
                                    <CustomButton
                                        label=""
                                        icon="bi-download"
                                        appendClass='bg-transparent'
                                        iconAppendClass="me-2"
                                        onClick={downloadSummery}
                                    />
                                    </div>
                                    </div>
      </>
    )
  }

  const submitFilter = (e) => {
  e?.preventDefault();
  searchAuction();
};

  const renderFilter = () => {
    return (
      <>
      <div className="moduleList">
                <div  className="form-group d-none d-md-block">
                <input
                  type="text"
                  className="form-control rs-input-group b-0"
                  placeholder="Search by Auction ID,Property ID"
                  aria-label="Search by Auction ID,PropertyID"
                  aria-describedby="basic-addon2"
                  value={searchProperty} 
                  style={{ width:'100%' }}
                  onChange={(e) => setSearchProperty(e.target.value)}
                />
                </div>
                  <div className="form-group d-none d-md-block">
                  <DateRangePicker  value={
                                startDate && endDate
                                    ? [new Date(startDate), new Date(endDate)]
                                    : null
                            } // Bind the startDate and endDate states
                   onChange={(e) => dateRangeHandler(e)} style={{width:"100%"}}/>
                </div>
              
                <div className=" form-group d-none d-md-block">
                   <CustomButton
                      label="Apply"
                      variant="danger"
                      appendClass='text-white'
                      onClick={(e) => submitFilter(e)}
                  />
              </div>

                </div>
      </>
    )
  }
  const handleReset=(e)=>{
submitFilter(e)
setSearchProperty('')
setstartDate(null)
setEndDate(null)
}
  return (
    <>
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
      ) : (<>
        <div className="container-fluid">
          <ToastContainer />
          <div className="main-title">
           <FilterWithButtonsCard filters={renderFilter()} title={'Auction Management'} headerButtons={headerButtons()}/>

          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchAuction();
            }}
          >
            {/* <div className="d-flex flex-row justify-content-sm-between">

              <div className="moduleList">
                <div  className="form-group d-none d-md-block">
                <input
                  type="text"
                  className="form-control mt-1 rs-input-group b-0"
                  placeholder="Search by Auction ID,Property ID"
                  aria-label="Search by Auction ID,PropertyID"
                  aria-describedby="basic-addon2"
                  value={searchProperty} 
                  style={{ width:'250px' }}
                  onChange={(e) => setSearchProperty(e.target.value)}
                />
                </div>
                  <div className="form-group d-none d-md-block">
                <div className="field mt-1">
                  <DateRangePicker  value={
                                startDate && endDate
                                    ? [new Date(startDate), new Date(endDate)]
                                    : null
                            } // Bind the startDate and endDate states
                   onChange={(e) => dateRangeHandler(e)} />
                </div>
                </div>
              
                <div className="d-none d-md-block">
                  <button type="submit" className="btn btn-primary mt-1">
                    Search
                  </button>
                </div>
              </div>

              <FilterWithButtonsCard filters={renderFilter()} title={'Property Management'} headerButtons={headerButtons()}/>

              <div >
                <button type="button" className="btn btn-primary" onClick={() => downloadSummery()}>
                  <FileDownloadIcon /> Auction summary
                </button>
              </div>
            </div> */}

          </form>
          <div>
            <br />

        <ul
              id="tabs"
              role="tablist"
              className="nav nav-tabs nav-pills mb-2"
            >
              <li className="nav-item">
                <a
                  id="tab-A"
                  href="#ongoing"
                  className={`nav-link ${auctionFilter == 1 ? "active" : ""}`}
                  data-toggle="tab"
                  role="tab"
                  onClick={() => {setAuctionFilter(1);setJoinroom(false)}}
                >
                  Live Auctions<span>({data?.ongoingProperty})</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  id="tab-B"
                  href="#upcoming"
                  className={`nav-link ${auctionFilter == 2 ? "active" : ""}`}
                  data-toggle="tab"
                  role="tab"
                  onClick={() => setAuctionFilter(2)}
                >
                  Live Events <span>({data?.upcomingProperty})</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  id="tab-C"
                  href="#past"
                  className={`nav-link ${auctionFilter == 3 ? "active" : ""}`}
                  data-toggle="tab"
                  role="tab"
                  onClick={() => setAuctionFilter(3)}
                >
                  Completed Auctions <span>({data?.pastProperty})</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  id="tab-D"
                  href="#unsold"
                  className={`nav-link ${auctionFilter == 4 ? "active" : ""}`}
                  data-toggle="tab"
                  role="tab"
                  onClick={() => setAuctionFilter(4)}
                >
                  Unsold <span>({data?.unsoldProperty})</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  id="tab-D"
                  href="#unsold"
                  className={`nav-link ${auctionFilter == 5 ? "active" : ""}`}
                  data-toggle="tab"
                  role="tab"
                  onClick={() => setAuctionFilter(5)}
                >
                  Sold <span>({data?.soldProperty})</span>
                </a>
              </li>

            </ul>
              <div className="d-block d-md-none">
                <CardListMobile
                  dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                  perPage={perPage}
                  totalItems={totalItems}
                  currentPage={pageNo}
                  pageChangeHandler={pageChangeHandler}
                  handleFilter={searchAuction}
                  isAction={true}
                  onreset={handleReset}

                >
                  <div style={{ width: '100%', marginRight: '10px' }}>
                    <label>Search</label>
                    <input
                      type="text"
                      className="form-control mt-1 rs-input-group b-0"
                      placeholder="Search by Auction ID,Property ID"
                      aria-label="Search by Auction ID,PropertyID"
                      aria-describedby="basic-addon2"
                      value={searchProperty}
                      onChange={(e) => setSearchProperty(e.target.value)}
                    />
                  </div>

                  <div className="field mt-1">
                    <label>Date Range</label>
                    <DateRangePicker value={
                      startDate && endDate
                        ? [new Date(startDate), new Date(endDate)]
                        : null
                    } // Bind the startDate and endDate states
                      onChange={(e) => dateRangeHandler(e)} style={{ width: "100%" }} />
                  </div>

                </CardListMobile>
              </div>
            <div id="content" className="tab-content d-none d-md-block" role="tablist">
              <div
                id="ongoing"
                className="card tab-pane fade show active"
                role="tabpanel"
                aria-labelledby="tab-A"
              >
                <div className="row">
                  <div className="col-xl-12 col-md-12">
                    <div className="card h-100 py-2">
                      <div className="card-body">
                        {/* {auctionFilter === 3 ?
                          <><div className="row">

                            <div className="col col-3">
                           
                              <div className="form-group d-flex align-items-center">
                                <SelectPicker
                                  data={[{ label: "HBD", value: 1 }, { label: "Sold", value: 2 }, { label: "Unsuccessful Auctions", value: 3 }]}
                                  style={{ width: 300 }}
                                  placeholder="Auctions Status"
                                  onChange={(e) => pastFilterHandler(e)}
                                />
                              </div>
                            </div>
                            <div className="col col-4" style={{ marginTop: 3 }}>
                              <button className="btn  btn-primary">Download HBL</button>
                            </div>
                          </div>
                          </> : null} */}

                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>S No.</th>
                                <th>Auction ID</th>
                                <th>NIT Ref No.</th>
                                <th>Prospect No.</th>
                                <th>Auction Date</th>
                                <th>Reserve Price</th>
                                <th>No. of Bidders</th>
                                {/* <th>Property Status</th> */}
                                {
                                  auctionFilter != 2
                                  ?
                                  <th>Last Bid</th>
                                  :<></>
                                }
                               
                              </tr>
                            </thead>
                            <tbody>
                              {
                                getProperties.length > 0 && getProperties.map((el, index) => {
                                  return <tr key={el._id}>
                                    <td>{(index + 1) + ((pageNo - 1) * Constant.perPage)}</td>
                                    <td> <Link
                       className=""
                       to={"/Property_Details/" + el._id}
                     >
                      {el.auctionId}
                   </Link></td>
                                    <td> {el?.partner?.name} Vs {el?.borrowerName}</td>
                                    <td>    <Link
                    className=""
                    to={"/property/details/" + el._id}
                  > {el.propertyId}</Link></td>
                                 
                                    <td> {el.auctionDate} </td>
                                    <td style={{ textAlign: 'end' }}>{(el.price).toLocaleString('en-IN', { style: 'decimal' })}</td>
                                    <td> {el.noOfBidders === undefined ? 0 : el.noOfBidders}</td>
                                    {/* <td> {el.propertyStatus ? el.propertyStatus : ''}</td> */}
                                    {
                                  auctionFilter != 2
                                  ?
                                  <td style={{ textAlign: 'end' }}>{(el.highestBidAmount).toLocaleString('en-IN', { style: 'decimal' })}</td>
                                  :<></>
                                }
                                  </tr>
                                })
                              }
                            </tbody>

                          </table>
                        </div>

                        <div className="justify-content-center mt-2">
                          <PaginationNew
                            perPage={perPage}
                            totalItems={totalItems}
                            currentPage={pageNo}
                            handler={pageChangeHandler}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div
                id="upcoming"
                className="card tab-pane fade"
                role="tabpanel"
                aria-labelledby="tab-B"
              >
                <div className="row">
                  <div className="col-xl-12 col-md-12 mb-4">
                    <div className="card h-100 py-2">
                      <div className="card-body">
                        {propertyList}
                        <div className="justify-content-center mt-2">
                          <PaginationNew
                            perPage={perPage}
                            totalItems={totalItems}
                            currentPage={pageNo}
                            handler={pageChangeHandler}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                id="past"
                className="card tab-pane fade"
                role="tabpanel"
                aria-labelledby="tab-C"
              >
                <div className="row">
                  <div className="col-xl-12 col-md-12 mb-4">
                    <div className="card h-100 py-2">
                      <div className="card-body">
                        
                        {propertyList}
                        <div className="justify-content-center mt-2">
                          <PaginationNew
                            perPage={perPage}
                            totalItems={totalItems}
                            currentPage={pageNo}
                            handler={pageChangeHandler}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                id="unsold"
                className="card tab-pane fade"
                role="tabpanel"
                aria-labelledby="tab-D"
              >
                <div className="row">
                  <div className="col-xl-12 col-md-12 mb-4">
                    <div className="card h-100 py-2">
                      <div className="card-body">
                        {propertyList}
                        <div className="justify-content-center mt-2">
                          <PaginationNew
                            perPage={perPage}
                            totalItems={totalItems}
                            currentPage={pageNo}
                            handler={pageChangeHandler}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>

            {/*  <div className="propertyDetails mt-4">
                    <h1 className="h3 mb-0 text-gray-800">Property Details</h1>
                    <div className="card h-100 py-2 mt-2">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-xl-12 col-md-12 mb-4">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col-auto mr-3">
                                            <i className="fas fa-calendar-check fa-2x text-gray-300"></i>
                                        </div>
                                        <div className="col">
                                            <div className="h4 mb-0 font-weight-bold text-gray-800">Auction End in Date: <strong className="orangetext">19-Oct-2022</strong> Time <strong className="orangetext">02:00:00 Hrs</strong></div>
                                        </div>
                                    </div>
                                    <hr></hr>
                                </div>
                                <div className="col-xl-6 col-md-6 mb-4">
                                    <div className="row no-gutters align-items-center">
                                    <div className="col">
                                        <div className="h6 mb-0 font-weight-bold text-gray-800">Property Code/Listing ID:</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-md-6 mb-4">
                                <div className="row no-gutters align-items-center">
                                    <div className="col">
                                        <div className="h6 mb-0 font-weight-bold text-gray-800">Property Title:</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-md-6 mb-4">
                                <div className="row no-gutters align-items-center">
                                    <div className="col">
                                        <div className="h6 mb-0 font-weight-bold text-gray-800">Opening Bid: </div>
                                    </div>
                                </div>
                            </div>
                           <div className="col-xl-6 col-md-6 mb-4">
                                <div className="row no-gutters align-items-center">
                                    <div className="col">
                                        <div className="h6 mb-0 font-weight-bold text-gray-800">Highest Bid:</div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-12 col-md-6 mb-4">
                                <div className="card border-left-primary shadow h-100 py-2">
                                    <div className="card-body">
                                        <div className="row no-gutters align-items-center">
                                            <div className="col-auto  mr-3">
                                            <div className="h6 mb-0 font-weight-bold text-gray-800">Enter Opening Bid Amount:</div>
                                            </div>
                                            <div className="col mr-3">
                                                <input type="text" className="form-control" placeholder="Enter Amount" value=""/>
                                            </div>
                                            <div className="col">
                                            <button type="submit" className="btn btn-info">Start Bid</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xl-6 col-md-6 mb-4">
                                <div className="table-responsive mb-3">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Amount</th>
                                                    <th scope="col">Bidders ID</th>
                                                    <th scope="col">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Rs. 34,35,000</td>
                                                    <td>BID2345</td>
                                                    <td>6:20 PM</td>
                                                </tr>
                                                <tr>
                                                    <td>Rs. 34,35,000</td>
                                                    <td>BID2345</td>
                                                    <td>6:20 PM</td>

                                                </tr>
                                                <tr>
                                                    <td>Rs. 34,35,000</td>
                                                    <td>BID2345</td>
                                                    <td>6:20 PM</td>
                                                </tr>
                                                <tr>
                                                    <td>Rs. 34,35,000</td>
                                                    <td>BID2345</td>
                                                    <td>6:20 PM</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                    </div>
                                        {/* <div className="row no-gutters align-items-center">
                                            <div className="col-auto mr-3">
                                                <h4 className="pricetext">Rs. 34,35,000</h4>
                                            </div>
                                            <div className="col">
                                                <div className="h6 mb-0 font-weight-bold text-gray-800">Highest Bid:</div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
    </div> */}
          </div>
        </div>
     </> )}
    </>
  );
}
