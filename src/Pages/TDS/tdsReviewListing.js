import React, {useEffect, useState} from 'react'
import {Link, useLocation} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import Constant from "../../Components/Constant";
import PaginationNew from "../../Widgets/PaginationNew";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { DateRangePicker, Stack} from 'rsuite';
import "rsuite/dist/rsuite.css";
import moment from 'moment'
import loginUser from "../../Services/loginUser";
import { Tooltip, Whisper } from 'rsuite';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import CustomButton from '../../Utils/CustomButton';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CommonActionIcons from '../../Utils/CommonActionIcons';

const TDSReviewListing = () => {
    let {accessToken} = loginUser();

    const [lists, setLists] = useState([]);
    const [filterForm, setFilterForm] = useState({ searchKey: '', startDate:null, endDate:null, tdsStatus:'All'});
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [permission, setPermission] = useState({})
    const [mobileResponseData, setMobileResponseData] = useState()
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
        let Role = await useGetRoleModule("TDS Review");
        setPermission(Role)
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
             setDateRange(e)
          //  console.log("DATE RANGE CLEARED")
        }
    }

    const submitFilter = (e) => {
        e.preventDefault();
        search();
    }
    useEffect(() => {
        getList();
    }, [])

   

    function getList() {
        filterForm.contentPerPage = perPage
        filterForm.page = pageNo

        getApiCall('user/bid/bidder/list', filterForm).then((response) => {
            if (response.meta.status) {
                setLists(response.data)
                setTotalItems(response.total)
                const formattedData = response.data.map((item, index) => ({
                    header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
                    data: [
                        { label: "Prospect No.", value: item.propertyDetails.prospectId },
                        { label: "Auction Id", value: item.propertyDetails.auctionId },
                        { label: "Auction Date", value: item.propertyDetails.auctionDate },
                        { label: "Bidder Name", value: item.bidder.name },
                        { label: "TDS Status", value: item?.tdsStatus || '-' },
                    ],
                    status: item.tdsStatus, // card footer status
                    footerId: item._id,
                    url: ``,
                    actionButtons: actionRender(item)
                }));
                setMobileResponseData(formattedData)
            } else {
                setLists([])
                setMobileResponseData()
                setTotalItems(0)
            }
        })
            .catch((error) => {
                setLists([])
                setMobileResponseData()
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
                const formattedData = response.data.map((item, index) => ({
                    header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
                    data: [
                        { label: "Prospect No.", value: item.propertyDetails.prospectId },
                        { label: "Auction Id", value: item.propertyDetails.auctionId },
                        { label: "Auction Date", value: item.propertyDetails.auctionDate },
                        { label: "Bidder Name", value: item.bidder.name },
                        { label: "TDS Status", value: item?.tdsStatus || '-' },
                    ],
                    status: item.tdsStatus, // card footer status
                    footerId: item._id,
                    url: ``,
                    actionButtons: actionRender(item)
                }));
                setMobileResponseData(formattedData)
            } else {
                setLists([])
                setMobileResponseData()
                setTotalItems(0)
            }
        })
            .catch((error) => {
                setLists([])
                setMobileResponseData()
                setTotalItems(0)
            })

    }

//     const actionRender = (item, forScreen) => (<>
//         {item.tdsStatus && (<>
//             <Whisper followCursor placement="left" speaker={<Tooltip>TDS Preview</Tooltip>}>
//                 <Link
//                     title='Document Preview'
//                     to={`/tds_review/${item._id}`}
//                     className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1"
//                 >
//                     <span className="icon text-white-50">
//                         <i className="bi bi-eye"></i>
//                     </span>

//                 </Link>


//             </Whisper>
//         </>)}
//   </>)
const actionRender = (item) => {
  const actions = [];

  // EDIT / CANCEL toggle action
  if (item.tdsStatus) {
    actions.push({
      type: "view",
      label: "View",
      redirectUrl: `/tds_review/${item._id}`,
      className: "btn btn-primary btn-icon-split btn-sm mb-1 mr-1",
      icon: "far fa-edit",
    });
  }

  return <CommonActionIcons actions={actions} />;
};
  const headerButtons = () => {
   return (<>
   <div className="card shadow d-none d-md-block">
                    <div className="card-body">
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
              </div>
              </div>
   </>)
};
  
  const renderFilter = (forScreen) => (<>
    {/* Search Field */}
      
    <div className="moduleList">

       
        <div className="form-group">
          <input
            type="text"
            className="form-control input-height-40"
            name="searchKey"
            defaultValue={filterForm.searchKey}
            onChange={onChangeFilter}
            placeholder="Search by Bidder Name, Property ID, Auction ID, Property State, Property City"
          />
        </div>
     

      {/* Date Range Picker */}
      
        <div className="form-group">
          <DateRangePicker placeholder="Filter By Auction Date " value={dateRange} onChange={(e) => dateRangeHandler(e)} style={{width:"100%"}}/>
        </div>
      

      {/* TDS Status */}
      
        <div className="form-group">
          <select
            className="form-control input-height-40"
            name="tdsStatus"
            defaultValue={filterForm.tdsStatus}
            onChange={onChangeFilter}
          >
            <option value="All">TDS Status</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      
      {/* Submit Button */}
              <div className="form-group d-none d-md-block">
                  <CustomButton
                      label="Apply"
                      
                      variant="danger"
                      appendClass='text-white'
                      iconAppendClass="me-2"
                      onClick={submitFilter}
                  />
              </div>

    </div>


    
    
  </>)
  const handleReset=()=>{
    setFilterForm({ searchKey: '', startDate:null, endDate:null, tdsStatus:'All'});
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
                    {/* <h3>TDS Review List</h3> */}
                    <FilterWithButtonsCard filters={renderFilter()} title={'TDS Review List'} headerButtons={headerButtons()}/>
                    
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
                >
                  <div style={{ width: '100%', marginRight: '10px' }}>
                    {renderFilter('mobile')}
                  </div>

                </CardListMobile>
              </div>
                <div className="card shadow d-none d-md-block">
                    <div className="card-body">
                        {/* <form onSubmit={submitFilter}>
  <div className="container-fluid px-0">
    <div className="row align-items-end">

      {renderFilter()}
      <div className="col-md-2 d-flex align-items-center mb-3">
        <button type="submit" className="btn btn-primary w-100">
          Apply
        </button>
      </div>

    </div>
  </div>
</form> */}
                       
                        <div className="table-responsive">
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                <tr>
                                    <th>Prospect No.</th>
                                    <th>Auction Id</th>
                                    <th>Auction Date</th>
                                    <th>Bidder Name</th>
                                    <th>TDS Status</th>
                                    {permission?.moduleList?.updateDisabled ? null : (<>
                                    <th>Action</th>
                                    </>)}
                                    {/* <th>Sold/HBL Date</th> */}
                                </tr>
                                </thead>

                                <tbody>
                                {
                                    lists.length > 0 ? lists.map((item, index) => {
                                        return <tr key={index}>
                                            <td>{item.propertyDetails.prospectId}</td>
                                            <td>{item.propertyDetails.auctionId}</td>
                                            <td>{item.propertyDetails.auctionDate}</td>
                                            <td>{item.bidder.name}</td>
                                            <td>{item?.tdsStatus || '-'  }</td>
                                            
                                            {permission?.moduleList?.approvedDisabled ? null : (<>
                                            <td>
                                           
                                                {actionRender(item)}
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
        </>
    )
}

export default TDSReviewListing;
