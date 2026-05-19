import React, { useEffect, useState } from 'react'
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import postApiCall from "../../Services/postApiCall";
import { Button, Modal } from "react-bootstrap";
import PaginationNew from "../../Widgets/PaginationNew";
import deleteApiCall from "../../Services/deleteApiCall";
import Constant from "../../Components/Constant";
import { userDetails } from "../../Services/authenticationService";
import useGetRoleModule from '../../Services/useGetRoleModule';
import axios from "axios";
import loginUser from "../../Services/loginUser";
import { formatDate } from "../../Services/helpers";
// import RefundModal from "../Bidder/RefundModal";
import EmdRefundModal from "./EmdRefundModal";
import moment from 'moment';
import { DateRangePicker } from 'rsuite';
import './payment.css'
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import "rsuite/dist/rsuite.css";
import CustomButton from '../../Utils/CustomButton';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';

const EmdPayments = () => {
    let { accessToken } = loginUser();

    const [lists, setLists] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isRefund, setIsRefund] = useState(false);
    const [searchForm, setSearchForm] = useState({
        searchKey: '',
        paymentStatus: '',
        paymentType: "",
        isExcelDownload: false,
        paymentDate: '',
        startDate:'',
        endDate:''
    });
    const [permission, setPermission] = useState({})
    const [auctionPermission, setAuctionPermission] = useState({})
    const [mobileResponseData, setMobileResponseData] = useState([])
    const [dateRange, setDateRange] = useState(null);
    const user = userDetails();

    function changeSearchForm(e) {
        if (!e.target.name) return;
        setSearchForm({
            ...searchForm,
            [e.target.name]: e.target.value
        })
    }

    const onChangeFilter = (e) => {
        if (!e.target.name) return
      //  console.log(e.target.value)
        setSearchForm({
            ...searchForm,
            [e.target.name]: e.target.value
        })
    }
    const submitFilter = (e) => {
        e.preventDefault();
        getList()
        // getEmenities()
    }

    const dateRangeHandler = (e) => {
        if(e){
            let startDate = e[0]
            let endDate = e[1]
            startDate = moment(startDate).format('YYYY/MM/DD');
            endDate = moment(endDate).format('YYYY/MM/DD');
            setSearchForm({
                ...searchForm,
                startDate,
                endDate
            })
            setDateRange(e)
        }else{
            setSearchForm({
                ...searchForm,
                startDate:"",
                endDate:""
            })
            setDateRange(null)
          //  console.log("DATE RANGE CLEARED")
        }
    }
    async function getList(isRefund=false) {
        let url = "user/transaction/list"
        if(isRefund){
            url = "user/transaction/refund/pending-list"
        }
        
        console.clear()
        let response = await getApiCall(url, {
            'page': pageNo,
            'contentPerPage': perPage,
            'searchKey': searchForm.searchKey,
            'paymentStatus': searchForm.paymentStatus,
            "paymentFor": searchForm.paymentFor == "" ? "" : searchForm.paymentFor,
            "paymentDate": searchForm.paymentDate == '' ? '': searchForm.paymentDate,
            "isExcelDownload": searchForm.isExcelDownload == "" ? false : searchForm.isExcelDownload,
            startAuctionDate:searchForm.startDate, 
            endAuctionDate:searchForm.endDate
        });
        if (response.meta.status) {
            const curr = moment().valueOf();

            const records = response.data.map((item, i) => {
                // console.log(item.propertyDetails?.auctionEndDateTimeEpoch , curr, i)
                if (item.paymentStatus == 'COMPLETED') {

                    if (item?.bidderBids?.isBidAwarded) {
                        /**
                         * Highest Bidder : Bidder status as H1 or win
                         */
                        return { ...item, refundShown: false }
                    } else if (item.paymentFor == 3) {
                        /**
                         * Highest Bidder payment of Balance 75% of Sale Amount is not received in 30 days
                         */
                        return { ...item, refundShown: false }
                    }
                    // else if(item.propertyDetails == undefined || item.propertyDetails.isForfeit == true){
                    //     /**
                    //      * Sole Bidder means # Bidders who paid EMD is equal to 1 : Bidder status : Not Participated
                    //      */
                    //     return { ...item, refundShown: false}
                    // }
                    // else if(item.propertyDetails == undefined || item.propertyDetails.auctionStatus != "COMPLETED"){

                    else if (item.propertyDetails == undefined || item.propertyDetails.auctionEndDateTimeEpoch > curr) {
                        /**
                         *  auction completed
                         */
                        // console.log("less")
                        return { ...item, refundShown: false }
                    }
                    else {
                        return { ...item, refundShown: true }
                    }

                } else {
                    //payment status not completed
                    return { ...item, refundShown: false }
                }

            })
            // setLists(response.data)
            setLists(records)
            const formattedData = records.map((item, index) => ({
                header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
                data: [
                    { label: "Prospect No.", value: item.prospectNo },
                    { label: "Auction Id", value: item?.propertyDetails?.auctionId },
                    { label: "Auction Date", value: item?.propertyDetails?.auctionDate !== '' ? (item?.propertyDetails?.auctionDate) : "-" },
                    { label: "Borrowers Name", value: item?.propertyDetails?.borrowerName },
                    { label: "Reserve Price", value: item?.propertyDetails?.price },
                    { label: "Bidder Name", value: item.bidder.length > 0 ? item.bidder.map(b => b.name).join(", ") : "-" },
                    { label: "Payment Amount", value: item.amount || '-' },
                    { label: "Payment Date", value: item.paymentMode == 1 ? "-" : item.paymentDetails?.paymentReceiveDate?.split(" ")[0] || '-' },
                    { label: "Payment Mode", value: item.paymentDetails?.modeOfPayment || '-' },
                    {
                        label: "Payment Type", value: item.paymentStatus != "REJECTED" ? item.paymentFor === 1 && item?.bidderBids?.isFullEmdPaid ? "EOI" : item.paymentFor === 1 && !item?.bidderBids?.isFullEmdPaid ? "Partial_EOI" :
                            item.paymentFor === 2 && item?.bidderBids?.isFullEmdPaid ? "EMD" : item.paymentFor === 2 && !item?.bidderBids?.isFullEmdPaid ? "Partial_EMD" : item.paymentFor === 3 && item?.bidderBids?.isFullEmdPaid && !item?.bidderBids?.isFullBSPaid ? "Partial Balance Sale" : 'Balance Sale Amount' : 'NA' || '-'
                    },
                    {
                        label: "Payment Status", value:
                            item.paymentStatus !== "REJECTED"
                                ? item?.paymentStatus.replace(/\b[a-z]/g, (x) => x.toUpperCase())
                                + (item.paymentStatus === "REFUNDED"
                                    ? ` (${item.refundDate || "-"})`
                                    : "")
                                : "Failed"
                    },
                    {
                        label: "Bidder Tagging", value: item.propertyDetails.auctionStatus === 'COMPLETED' ?
                            item?.bidderBids?.isBidAwarded == true || item.paymentFor === 3 ? "H1"
                                : item?.bidderBids?.isParticipatedInAuction == false ? "Not Partcipated" : "Lost"
                            : new Date(item?.propertyDetails?.auctionDate) < new Date() && item.paymentFor === 2 && item?.bidderBids?.isParticipatedInAuction == false ? 'Non Partcipated' : '-'
                    },

                ],
                status: item.paymentStatus, // card footer status
                footerId: item._id,
                url: ``,
                actionButtons: actionRender(item)
            }));
                setMobileResponseData(formattedData)
        } else {
            setLists([])
            setMobileResponseData([])
        }
        setTotalItems(response.total)
        setIsLoaded(true);
    }

    async function refundDisableCondition(date) {
        var today = new Date();
        var givenDate = new Date(date);

        if (givenDate < today) {
            return false;
        } else if (givenDate > today) {
            return true;
        } else {
            return false;
        }

    }

    async function exportPayment() {
        console.log("primary")
    }

    async function GetRole() {

        let Role = await useGetRoleModule("Payment Management");
        // let autionRole = await useGetRoleModule("property/auction-bulk-upload");
        if (Role.moduleList.read === false) {
            setPermission({ moduleAccress: false, moduleList: {}, message: "Module Need Some Permission...Pls contact with Your Partner" })
        } else {
            setPermission(Role)
        }

        // getList();
    }

    useEffect(() => {
        GetRole()
    }, []);


    async function downloadList(e) {
        e.preventDefault();
        // Download to export
        const response = await axios({
            url: Constant.apiBasePath + 'user/transaction/list',
            method: 'GET',
            responseType: 'blob',
            headers: {
                authkey: accessToken
            },
            params: { ...searchForm, isExcelDownload: true }
        });
        // getApiCall('user/bid/bidder/list', )
        //     .then((response) => {
        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'payment.csv';
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
        // console.log('status', status)
        // status = status === 1 ? "active" : "deactive"
        status = status == 0 ? "active" : "deactive"
        // console.log('status', status)

        postApiCall('user/property/status', {
            status: status,
            "_id": id,
            // isDeleted: isDeleted
        }).then((response) => {
            if (response.meta.status) {
                swal({ text: response.meta.msg, icon: "success", timer: 1500 })
                getList();
            }
        });
    }


    function DeleteEvent(e) {
        let id = e.currentTarget.getAttribute('value');
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                deleteApiCall('user/property/delete/' + id, {}).then((response) => {
                    if (response.meta.status) {
                        swal({ text: response.meta.msg, icon: "success", timer: 1500 })
                        getList();
                    }
                });
            } else {
                // swal("Your imaginary file is safe!");
            }
        });

    }

    const exportToExcel = async () => {
        try {
            const response = await axios({
                url: Constant.apiBasePath + 'user/property/download',
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                }
            });

            // const contentDispositionHeader = response.headers['content-disposition'];
            // const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            // const fileNameMatch = fileNameRegex.exec(contentDispositionHeader);
            // const suggestedFileName = fileNameMatch[1].replace(/['"]/g, '');

            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'properties.xlsx';
            document.body.appendChild(link);
            link.click();
            // Clean up the URL object when the download is complete
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    };

    function convertDate(date) {
        let d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;
        return [day, month, year,].join('-');
    }

    function pageChangeHandler(page) {
        if (isLoaded) {
            setPageNo(page);
        }
    }



    useEffect(() => {
        getList()
    }, [pageNo])

    const actionRender = (item, forScreen) => (<>
       {(item.refundShown && !item.isEoi && (item.paymentDetails !== null || item.paymentDetails !== undefined) && (item.paymentDetails && item.paymentDetails.callerReferenceNo !== '') && item.propertyBiddersCount > 1) || (item.allow_refund && item.paymentStatus !== 'REFUNDED') || (isRefund) ? <EmdRefundModal bidData={item} callback={getList} /> : "-"}
  </>)
  
    const renderFilter = (forScreen) => (<>
    <div className='moduleList'>
        
            <div className="form-group">
                <input type="text" className="form-control input-height-40" name="searchKey"
                    value={searchForm.searchKey}
                    onChange={onChangeFilter}
                    placeholder="Search By Name, Prospect, Auction ..."
                />
            </div>
        
        
            <div className="form-group">
                <select name="paymentStatus" value={searchForm.paymentStatus}
                    className="form-control input-height-40"
                    onChange={onChangeFilter}
                >
                    <option value="">Payment Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REFUNDED">Refunded</option>
                    <option value="REJECTED">Failed</option>
                </select>
            </div>


        
            <div className="form-group">
                <select name="paymentFor" value={searchForm.paymentFor}
                    className="form-control input-height-40"
                    onChange={onChangeFilter}
                >
                    <option value="">Payment Type</option>
                    <option value="2">EMD</option>
                    <option value="1">EOI</option>
                    <option value="3">Balance Sale Amount</option>
                    <option value="Refund">Refund</option>
                </select>
            </div>

      
            <div className="form-group">

                <DateRangePicker placeholder="Select Auction date" value={dateRange} onChange={(e) => dateRangeHandler(e)} style={{width:'100%'}}/>
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
      const headerButtons=()=>{
    return(
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
 <label className="toggle mx-2">
      <input
        type="checkbox"
        checked={isRefund}
        onChange={() => { getList(!isRefund);setIsRefund(!isRefund)}}
      />
      <span className="slider"></span>
      <span className="toggle-text">Refund</span>
    </label>
                </div>
    )
}
const handleReset=()=>{
   setSearchForm({
        searchKey: '',
        paymentStatus: '',
        paymentType: "",
        isExcelDownload: false,
        paymentDate: '',
        startDate:'',
        endDate:''
    });
    setDateRange(null)
}
    return (
        <>
            <div className="container-fluid">

                {permission.hasOwnProperty('moduleAccress') && !permission.moduleAccress ?

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
                    :
                    <>
                <div className="main-title">
                  <FilterWithButtonsCard filters={renderFilter()} title={'Payment Management'} headerButtons={headerButtons()}/>
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
                   <div className="card shadow mb-4 d-none d-md-block" >
                            {/*Search and Filter From*/}
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>S.No.</th>
                                                <th>Prospect No.</th>
                                                <th>Auction ID</th>
                                                <th>Auction Date</th>
                                                <th>Borrowers Name</th>
                                                <th>Reserve Price</th>
                                                <th>Bidder Name</th>
                                                <th>Payment Amount</th>
                                                <th>Payment Date</th>
                                                <th>Payment Mode</th>
                                                <th>Payment Type</th>
                                                <th>Payment Status</th>
                                                <th>Bidder Tagging</th>
                                                {/* <th>Property Status</th> */}
                                                {permission?.moduleList?.update === false ? null :
                                                    <th>Action</th>}
                                            </tr>
                            
                                        </thead>

                                        <tbody>

                                            {
                                                lists.length > 0 ? lists.map((item, index) => {
                                                    const bidderNames = item.bidder.map(b => b.name).join(", ");
                                                    return <tr key={index}>
                                                        <td>{(index + 1) + ((pageNo - 1) * perPage)}</td>
                                                        <td>{item.prospectNo}</td>
                                                        <td>{item?.propertyDetails?.auctionId}</td>
                                                        <td>{item?.propertyDetails?.auctionDate !== '' ? (item?.propertyDetails?.auctionDate) : "-"}</td>
                                                        <td>{item?.propertyDetails?.borrowerName}</td>
                                                        <td>{item?.propertyDetails?.price}</td>
                                                        <td>{item.bidder.length > 0 ? bidderNames : "-"}</td>
                                                        <td>{item.amount}</td>
                                                        <td>{item.paymentMode == 1 ? "-" : item.paymentDetails?.paymentReceiveDate?.split(" ")[0]}</td>
                                                        <td>{item.paymentDetails?.modeOfPayment}</td>
                                                        <td>{item.paymentStatus != "REJECTED" ? item.paymentFor === 1 && item?.bidderBids?.isFullEmdPaid ? "EOI" : item.paymentFor === 1 && !item?.bidderBids?.isFullEmdPaid ? "Partial_EOI" :
                                                            item.paymentFor === 2 && item?.bidderBids?.isFullEmdPaid ? "EMD" : item.paymentFor === 2 && !item?.bidderBids?.isFullEmdPaid ? "Partial_EMD" : item.paymentFor === 3 && item?.bidderBids?.isFullEmdPaid && !item?.bidderBids?.isFullBSPaid ? "Partial Balance Sale" : 'Balance Sale Amount': 'NA'}</td>
                                                        <td>{item.paymentStatus != "REJECTED" ? item?.paymentStatus.replace(/\b[a-z]/g, (x) => x.toUpperCase()) : "Failed"}
                                                            {item.paymentStatus === 'REFUNDED' ? " " + item.refundDate : ''}
                                                        </td>
                                                        {/* ? represent if and : represent else*/}
                                                        <td>{item.propertyDetails.auctionStatus === 'COMPLETED' ?
                                                            item?.bidderBids?.isBidAwarded == true || item.paymentFor === 3 ? "H1"
                                                                : item?.bidderBids?.isParticipatedInAuction == false ? "Not Partcipated" : "Lost"
                                                            : new Date(item?.propertyDetails?.auctionDate) < new Date() && item.paymentFor === 2 && item?.bidderBids?.isParticipatedInAuction == false ? 'Non Partcipated' : '-'}</td>
                                                        {/* <td>{item?.propertyDetails?.propertyStatus}</td> */}
                                                        {permission?.moduleList?.createDisabled ? null : <td>
                                                            {/* { item.paymentStatus == 'COMPLETED' ? item.bidderBids?.isBidAwarded == false ? <EmdRefundModal bidData={item} callback={getList} /> : "-" : item.paymentStatus == "REFUNDED" ? "-" : "-" } */}
                                                            {actionRender(item)}
                                                        </td>}
                                                    </tr>

                                                }) : <tr>
                                                    <td colSpan={12} style={{ textAlign: 'center' }}>No records</td>
                                                </tr>
                                            }

                                        </tbody>

                                    </table>


                                </div>
                                <div className="justify-content-center mt-3 d-flex">
                                    <PaginationNew perPage={perPage} totalItems={totalItems} currentPage={pageNo}
                                        handler={pageChangeHandler} />
                                </div>
                            </div>
                        </div>
                    </>}


            </div>
        </>
    )
}

export default EmdPayments