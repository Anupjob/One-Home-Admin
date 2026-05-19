import React, {useEffect, useState} from 'react'
import {Link, useLocation} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import patchApiCall from "../../Services/patchApiCall";
import Constant from "../../Components/Constant";
import postApiCall from '../../Services/postApiCall';
import PaginationNew from "../../Widgets/PaginationNew";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { DateRangePicker, Stack} from 'rsuite';
import "rsuite/dist/rsuite.css";
import moment from 'moment'
import loginUser from "../../Services/loginUser";
import { SelectPicker, Tooltip, Whisper } from 'rsuite';
import { toast } from 'react-toastify';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CustomButton from '../../Utils/CustomButton';
import CommonActionIcons from '../../Utils/CommonActionIcons';
import { isMobile } from "react-device-detect";

const BidderListing = () => {
    let {accessToken} = loginUser();

    const [lists, setLists] = useState([]);
    const [filterForm, setFilterForm] = useState({ searchKey: '', bidderStatus:"", partnerName: "", startDate:null, endDate:null, isExcelDownload: false});
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState({})
    const [partner, setPartner] = useState("")
    const [partnerArr, setPartnerArr] = useState([])
    const [selectedRowId, setSelectedRowId] = useState(null)
    const [openModalOfferAmount, setOpenModalOfferAmount] = useState(false)
    const [openModalLessOneLac, setModalLessOneLac] = useState(false)
    const [mobileResponseData, setMobileResponseData] = useState()
    const [offerAmount, setOfferAmount] = useState({
        bidderId:'',
        old:0,
        new:0
    })

    const [lessOneLac, setLessOneLac] = useState({
        bidderId:'',
        old:'',
        new:''
    })
  const [dateRange, setDateRange] = useState(null);
    function pageChangeHandler(page) {
        // if (isLoaded) {
        setPageNo(page);
        // getList()
        // }
    }

    const location = useLocation();
    const myparam = location.state?.params;


    async function GetRole() {
        let Role = await useGetRoleModule("bidders");
        setPermission(Role)

        let partnerLis = await postApiCall("admin/partner/getPartnerUser", {}, true);
        if(partnerLis.meta.status){
            let out = partnerLis.data.map(_ => {
                return {
                  label: _.parnterName, value: _.parnterName 
                }
            })
            if(Role.role == "admin"){
                setPartner(<div className="col-12 col-xs-3 col-md-3 col-lg-3">
              <div className="form-group">
                <label htmlFor="exampleFormControlSelect1"> <b style={{ color:'#000000'}}>Partner</b></label>
                <SelectPicker data={out} style={{ width: 300 }} onChange={(e) => tagPickerHandler(e)}/>
            </div>
            </div>)
              }
        }



        getList();
    }

    
    async function tagPickerHandler(e){
        // console.log(e)
        setFilterForm({
            ...filterForm,
            ["partnerName"]: e
        })
      }

    useEffect(() => {
        GetRole();
    }, [])

    useEffect(() => {
        getList();
    }, [pageNo])


    const onChangeFilter = (e) => {
        if (!e.target.name) return
        setFilterForm({
            ...filterForm,
            [e.target.name]: e.target.value
        })
    }

    const dateRangeHandler = (e) => {
        if(e){
            let startDate = e[0]
            let endDate = e[1]
            startDate = moment(startDate).format('YYYY/MM/DD');
            endDate = moment(endDate).format('YYYY/MM/DD');
            setFilterForm({
                ...filterForm,
                startDate,
                endDate
            })
                  setDateRange(e)
        }else{
            setFilterForm({
                ...filterForm,
                startDate:"",
                endDate:""
            })
                  setDateRange(null)
          //  console.log("DATE RANGE CLEARED")
        }
    }

    const submitFilter = (e) => {
        e.preventDefault();
        getList();
    }
    useEffect(() => {
        getList();
    }, [])

   

    function getList(isFiltered = false) {

        filterForm.contentPerPage = perPage
        filterForm.page = pageNo
        const clearFilteredParam = {searchKey: '', bidderStatus:"", partnerName: "", startDate:null, endDate:null, isExcelDownload: false, contentPerPage:perPage, page:1}
        const filteredParam = {...filterForm,}
        getApiCall('user/bid/bidder/list', isFiltered?clearFilteredParam:filterForm).then((response) => {
            if (response.meta.status) {
                setLists(response.data)
                setTotalItems(response.total)
                const formattedData = response.data.map((item, index) => ({
                    header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
                    data: [
                        { label: "Bidder Name", value: item.bidder.type !== "COMPANY" ? item.bidder.name: item.bidder.companyName },
                        { label: "Bidder Email ID", value: item.bidder.email },
                        { label: "Bidder Phone", value: item.bidder.mobile },
                        { label: "Auction ID", value: item.propertyDetails.auctionId },
                        { label: "Auction Date", value: item.propertyDetails.auctionDate },
                        { label: "E-sign", value: item.isSigned ? 'Done':'Pending'},
                        { label: "Reserve Price", value: item.propertyDetails.price},
                        { label: "Offer Amount", value: item.offerAmount },
                        { label: "BS <1 Lac", value: item.noBalanceSalePaymentLimit?'Yes':'No' },
                        { label: "Bidder Status", value: item.propertyDetails.auctionEndDateTimeEpoch >   moment().valueOf() ? "-" : item.isBidAwarded === true ? "Win" : item.isParticipatedInAuction === true ? "Lost" : "Not Participated" },
                        { label: "Referral Details", value: item?.referrerInfo?.source === 'self'
                                                ? '-'
                                                : item?.referrerInfo?.source === 'broker'
                                                    ? `${item?.referrerInfo?.referrerDetails?.name || ''} - ${item?.referrerInfo?.referrerDetails?.mailId || ''}`
                                                    : item?.referrerInfo?.source === 'iifl-employee'
                                                    ? item?.referrerInfo?.referrerDetails?.empCode || ''
                                                    : `${(item?.referrerInfo?.referrerDetails?.name || '') + ' - ' + (item?.referrerInfo?.source || '')}`
                                             }
                    ],
                    status: item.isSigned ? 'Done':'Pending', // card footer status
                    footerId: item.auctionId,
                    url: ``,
                    actionButtons: actionRender(item)
                }));
                setMobileResponseData(formattedData)
            } else {
                setLists([])
                setMobileResponseData([])
                setTotalItems(0)
            }
        })
            .catch((error) => {
                setLists([])
                setTotalItems(0)
            })

    }

    function search() {
        filterForm.contentPerPage = perPage
        filterForm.page = 1

        getApiCall('user/bid/bidder/list', filterForm).then((response) => {
            if (response.meta.status) {
                setLists(response.data)
                setTotalItems(response.total)
            } else {
                setLists([])
                setTotalItems(0)
            }
        })
            .catch((error) => {
                setLists([])
                setTotalItems(0)
            })

    }


    async function downloadList(e) {
        e.preventDefault();
        // Download to export
        const response = await axios({
            url: Constant.apiBasePath + 'user/bid/bidder/list',
            method: 'GET',
            responseType: 'blob',
            headers: {
                authkey: accessToken
            },
            params: {...filterForm, isExcelDownload: true}
        });
        // getApiCall('user/bid/bidder/list', )
        //     .then((response) => {
                const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'bidder.xlsx';
            document.body.appendChild(link);
            link.click();
            // URL.revokeObjectURL(url)
            // })


        // let data = filterForm
        // data.exportData = 1;
        // getList(data)
    }


    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');
        let status = e.currentTarget.getAttribute('status');
        let isDeleted = e.currentTarget.getAttribute('isDeleted');
        status = status === "DEACTIVE" ? "ACTIVE" : "DEACTIVE"
        if (isDeleted) status = "DELETE"
        patchApiCall('common/static/page/changeStatus', {
            'pageId': id,
            status: status,
            // isDeleted: isDeleted
        }).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getList();
            }
        });
    }

    const sourceName =(data)=>{
        if(!data){
            return '-';
        }
        if(data && data.source === 'iifl-employee'){
            return 'IIFL EMPLOYEE'
        }else if( data.source === 'no-broker'){
            return 'NO BROKER'
        }else if(data.source === 'nexxen-disposal-hub'){
            return 'NEXXEN DISPOSAL HUB'
        }else if(data.source === 'hecta'){
            return 'HECTA   '
        }else if(data.source === 'broker'){
            return 'BROKER'
        }else{
            return 'SELF'
        }
    }

    const handleCloseOfferAmount=()=>{
        setOpenModalOfferAmount(false)
    }
    const handleLessOneLac=()=>{
        setModalLessOneLac(false)
    }

    const handleClickedOfferAmount=(row)=>{
        setOpenModalOfferAmount(true)
        setOfferAmount({
            bidderId:row._id,
            old:row.offerAmount,
            new:row.offerAmount
        })
    }

    const handleClickedLessOneLac=(row)=>{
        setModalLessOneLac(true)
        setLessOneLac({
            bidderId:row._id,
            old:row.noBalanceSalePaymentLimit,
            new:row.noBalanceSalePaymentLimit
        })
    }

    const handleUpdateOfferAmount=async()=>{
        console.log('offerAmount::::::::::',offerAmount)
        if (!offerAmount?.new) {
            toast.error('Plesae input new offer amount !!');
            return;
        }
        else{
            let payload = {
               bidderBidId:offerAmount.bidderId, 
                newOfferAmount:offerAmount.new, 
                reservePrice:offerAmount.old
                            }
                const response = await postApiCall('user/bid/bidder/updateOfferAmount', payload, true)
                console.log('response:::::::::',response)
            
                if (response && response.meta.status) {
                  toast.success(response.meta.msg)
                  handleCloseOfferAmount()
                  getList()
                } else {
                  toast.error(response.msg)
                }
        }

    }

    const handleUpdateLessOneLac=async()=>{
        let payload = {
            bidderBidId:lessOneLac.bidderId,
            allowLessThanOneLakhPayment:true
              }
            const response = await postApiCall('user/bid/bidder/allowLessThanOneLakhPayment', payload, true)
        
            if (response && response.meta.status) {
              toast.success(response.meta.msg)
              handleLessOneLac()
              getList()
            } else {
              toast.error(response.msg)
            }
    }

    // const actionRender = (item, forScreen) => (<>
    //     {selectedRowId !== item._id ?
    //         <Whisper followCursor placement="left" speaker={<Tooltip>Edit</Tooltip>}>
    //             <button
    //                 onClick={() => setSelectedRowId(item._id)}
    //                 className={"btn btn-primary btn-icon-split btn-sm mb-1 mr-1"}
    //             >
    //                 <span className="icon text-white-50">
    //                     <i className="far fa-edit"></i>
    //                 </span>
    //                 {/*<span className="text">Edit</span>*/}
    //             </button>
    //         </Whisper>

    //         : <Whisper followCursor placement="left" speaker={<Tooltip>Cancel</Tooltip>}>
    //             <button
    //                 onClick={() => setSelectedRowId(null)}
    //                 className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1"
    //             >
    //                 <span className="icon text-white-50">
    //                     <i className="far fa-times-circle"></i>
    //                 </span>
    //                 {/*<span className="text">Edit</span>*/}
    //             </button>
    //         </Whisper>
    //     }
    // </>)
const actionRender = (item) => {
  const actions = [];

  // EDIT / CANCEL toggle action
  if (selectedRowId !== item._id || isMobile) {
    actions.push({
      type: "edit",
      label: "Edit",
      tooltip: "Edit",
      onClick: () => {isMobile?handleClickedLessOneLac(item):setSelectedRowId(item._id)},
    });
  } else {
    actions.push({
      type: "deactivate",
      label: "Cancel",
      tooltip: "Cancel",
      onClick: () => setSelectedRowId(null),
    });
  }

  return <CommonActionIcons actions={actions} />;
};
const handleReset=()=>{
    setDateRange(null)
    setFilterForm({...filterForm, searchKey: '', bidderStatus:"", partnerName: "", startDate:null, endDate:null, isExcelDownload: false});
    getList(true)
}
    const renderFilter = (forScreen) => (
    <>
    <div className='moduleList'>
        <div className="form-group">
            <input type="text" className="form-control rs-input-group" name="searchKey"
                defaultValue={filterForm.searchKey}
                onChange={onChangeFilter}
                placeholder="Search by Bidder Name,Property ID,Auction ID,Property State, Property City" />
        </div>

        <div className="form-group">
            <DateRangePicker value={dateRange} onChange={(e) => dateRangeHandler(e)}  style={{width:'100%'}}/>
        </div>

        <div className="form-group">
            <select className="form-control rs-input-group" name="bidderStatus"
                defaultValue={filterForm.bidderStatus}
                onChange={onChangeFilter}
                >
                <option value="">Select</option>
                <option value="WIN">Win</option>
                <option value="LOST">Lost</option>
                <option value="NP">Not Participated</option>
            </select>
        </div>
            <div className="form-group d-none d-md-block">

                <CustomButton
                    label="Apply"
                    
                    appendClass='text-white'
                    variant='danger'
                    iconAppendClass="me-2"
                    onClick={submitFilter}
                />
            </div>      
        </div>
    </>)

    const headerButtons = () => {
        return (
            <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
                {permission?.moduleList?.downloadDisabled ? null : (<>
                    <CustomButton
                        label=""
                        icon="bi-download"
                        appendClass='bg-transparent'
                        iconAppendClass="me-2"
                        onClick={downloadList}
                    />
                </>)}
            </div>
        )
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
                    : <div className="container-fluid">
                    <div className="main-title">
                        <FilterWithButtonsCard filters={renderFilter()} title={'Bidders'} headerButtons={headerButtons()} />

                    </div>
                    <div>
                    {/*<Link to="/cms/add" className="d-sm-inline-block btn btn-sm btn-primary shadow-sm">*/}
                    {/*    Add New*/}
                    {/*</Link>*/}
                    
                    </div>
                    <div className="d-block d-md-none">
                        <CardListMobile
                            dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                            perPage={perPage}
                            totalItems={totalItems}
                            currentPage={pageNo}
                            pageChangeHandler={pageChangeHandler}
                            handleFilter={submitFilter}
                            isAction={true}
                            onreset={handleReset}
                        >
                            <div style={{ width: '100%', marginRight: '10px' }}>
                              {renderFilter('mobile')}
                            </div>

                        </CardListMobile>
                    </div>
                <div className="card shadow d-none d-md-block">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered" width="100%" cellSpacing="0" style={{display: 'block', overflowX: 'auto', whiteSpace: 'nowrap'}}>
                                <thead>
                                <tr>
                                    {/* <th>Sl. No.</th> */}
                                    {/* <th>Date of registration</th>
                                    <th>Participation ID</th> */}
                                    {/* <th>Bidder Type</th> */}
                                    <th>Bidder Name</th>
                                    <th>Bidder Email ID</th>
                                    <th>Bidder Phone</th>
                                    {/* <th>Financial Institution Name</th> */}
                                    {/* <th>Property ID</th> */}
                                    <th>Auction Id</th>
                                    <th>Auction Date</th>
                                    <th>E-sign</th>
                                    {/* <th>Auction Status</th> */}
                                    {/* <th>EMD payment amount</th>
                                    
                                    <th>Property State</th>
                                    <th>Property City</th> */}
                                    <th>Reserve Price</th>
                                    <th>Offer Amount</th>
                                    <th>{'BS <1 Lac'}</th>
                                    <th>Bidder Status</th>
                                    <th>Referral Details</th>
                                    {/* <th>Referral Source</th>
                                    <th>Referral Code</th>
                                    <th>Referee Details</th>
                                    <th>Sale Status</th> */}
                                    {/* <th>TDS Status</th> */}
                                    {permission?.moduleList?.updateDisabled ? null : (<>
                                    <th className="sticky-action-column">Action</th>
                                    </>)}
                                    {/* <th>Sold/HBL Date</th> */}
                                </tr>
                                </thead>

                                <tbody>
                                {
                                    lists.length > 0 ? lists.map((item, index) => {
                                        let curr = moment().valueOf();
                                        let status = '';
                                        if (item?.isVerified) {
                                            status = "Accepted"
                                        } else if (!item?.isVerified && !item?.bidderRejectReason) {
                                            status = 'Pending';
                                        } else if (!item?.isVerified && item?.bidderRejectReason) {
                                            status = 'Rejected';
                                        }
                                        return <tr key={index}>
                                            {/* <td>{(index + 1) + ((pageNo - 1) * 10)}</td> */}
                                            {/* <td>{item?.bidder?.createdAt ? item?.bidder?.createdAt.split("T")[0]: 'NA'}</td>
                                            <td>{item.order.participationId !== undefined ? item.order.participationId : "-"}</td> */}
                                            {/* <td><a href={`/bidder/bidder_overviews/${item.order.participationId}`}>{item.order.participationId !== undefined ? item.order.participationId : "-"}</a></td> */}
                                            {/* <td>{item.bidder.type}</td> */}
                                            <td>{item.bidder.type != "COMPANY" ? item.bidder.name: item.bidder.companyName}</td>
                                            <td>{item.bidder.email}</td>
                                            <td>{item.bidder.mobile}</td>
                                            {/* <td>{item.partner.name}</td> */}
                                            {/* <td>{item.propertyDetails.propertyId}</td> */}
                                            <td>{item.propertyDetails.auctionId}</td>
                                            <td>{item.propertyDetails.auctionDate}</td>
                                            <td>{item.isSigned ? 'Done':'Pending'}</td>
                                            {/* <td>{item.propertyDetails.auctionStatus}</td> */}
                                          
                                            {/* <td>{item.order.amount}</td>
                                            
                                            <td>{item.propertyDetails.stateName}</td>
                                            <td>{item.propertyDetails.cityName}</td> */}
                                            <td>{item.propertyDetails.price}</td>
                                            <td style={{color:selectedRowId == item._id?'#EF5713':'', cursor:selectedRowId == item._id&&'pointer'}} onClick={()=>selectedRowId == item._id&&handleClickedOfferAmount(item)}>{item.offerAmount}</td>
                                            <td style={{color:selectedRowId == item._id && item.isBidAwarded === true?'#EF5713':'', cursor:selectedRowId == item._id &&item.isBidAwarded === true&&'pointer'}} onClick={()=>selectedRowId == item._id&&item.isBidAwarded === true&&handleClickedLessOneLac(item)}>{item.noBalanceSalePaymentLimit?'Yes':'No'}</td>
                                            <td>{item.propertyDetails.auctionEndDateTimeEpoch > curr ? "-" : item.isBidAwarded === true ? "Win" : item.isParticipatedInAuction === true ? "Lost" : "Not Participated"}</td>
                                            <td>
                                            {
                                                item?.referrerInfo?.source === 'self'
                                                ? '-'
                                                : item?.referrerInfo?.source === 'broker'
                                                    ? `${item?.referrerInfo?.referrerDetails?.name || ''} - ${item?.referrerInfo?.referrerDetails?.mailId || ''}`
                                                    : item?.referrerInfo?.source === 'iifl-employee'
                                                    ? item?.referrerInfo?.referrerDetails?.empCode || ''
                                                    : `${(item?.referrerInfo?.referrerDetails?.name || '') + ' - ' + (item?.referrerInfo?.source || '')}`
                                            }
                                            </td>
                                            {/* <td>{sourceName(item?.referrerInfo)}</td>
                                            
                                            <td>{item?.referrerInfo?.source === 'self' || item?.referrerInfo?.source === 'iifl-employee' ? '-' : item?.referrerInfo?.source === 'broker' ? item?.referrerInfo?.referrerDetails?.mailId +' , ' +item?.referrerInfo?.referrerDetails?.panCard : item?.referrerInfo?.referrerDetails?.name}</td>
                                            <td>{item?.propertyDetails?.soldStatus == "YES" ? 'Sold' : item?.propertyDetails?.soldStatus == "NO" && item?.propertyDetails?.isAwarded ? 'HBL' : 'UNSOLD'  }</td> */}
                                            {/* <td>{item?.tdsStatus || '-'  }</td> */}
                                            
                                            {permission?.moduleList?.updateDisabled ? null : (<>
                                            <td className="sticky-action-column">
                                           {actionRender(item)}
                                            
                              {/* )} */}
                              {/* <Whisper followCursor placement="left" speaker={<Tooltip>Audit Trail</Tooltip>}>
                              <a href={`/properties/audit-trails/${item._id}`}><button className="btn btn-icon-split btn-sm mb-1 ml-1" style={{backgroundColor: 'black'}}>
                                <span className="icon" style={{color: 'white'}}>
                                   <i class="fa fa-history" aria-hidden="true"></i>
                                </span>
                              </button></a>
                              </Whisper> */}
                                            </td>
                                            </>)}
                                        </tr>
                                    }) : <tr><td colspan={15} style={{textAlign: 'center'}}>No Records</td></tr>
                                }
                                </tbody>
                            </table>

                            <div className="justify-content-center  mt-2">
                                <PaginationNew perPage={perPage} totalItems={totalItems}
                                               currentPage={pageNo} 
                                               handler={pageChangeHandler}/>
                            </div>
                        </div>
                    </div>
                </div>


            </div> }
            <Modal show={openModalOfferAmount} onHide={handleCloseOfferAmount}>
            <Modal.Header closeButton>
                <Modal.Title>Update Offer Amount</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <div className="form-group file-pond-section">
                    <label htmlFor="exampleFormControlFile1">Old Offer Amount</label>
                    <input type="number" className="form-control form-control-sm" value={offerAmount.old}
                           disabled/>
                </div>
                <div className="form-group file-pond-section">
                    <label htmlFor="exampleFormControlFile1">New Offer Amount</label>
                    <input type="number" className="form-control form-control-sm" value={offerAmount.new} min={offerAmount.old}
                           onChange={(e) => {
                               setOfferAmount((values)=>({...values,new:e.target.value}))
                           }
                           }/>
                </div>
               </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleUpdateOfferAmount}>
                Update
                </Button>
            </Modal.Footer>
        </Modal>

        <Modal show={openModalLessOneLac} onHide={handleLessOneLac}>
            <Modal.Header closeButton>
                <Modal.Title>{'Update BS <1 Lac Status'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <div className="form-group file-pond-section">
                    <label htmlFor="exampleFormControlFile1">Old Status</label>
                    <input type="text" className="form-control form-control-sm" value={lessOneLac.old?'Yes':'No'}
                           disabled/>
                </div>
                <div className="form-group file-pond-section">
                    <label htmlFor="exampleFormControlFile1">New Status</label>
                <select name="paymentMode" className="form-control" value={lessOneLac.new} onChange={(e)=>setLessOneLac((values)=>({...values,new:e.target.value}))} required={true}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
                </div>
               </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleUpdateLessOneLac}>
                    Update
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    )
}

export default BidderListing
