import React, {useEffect, useState} from 'react'
import {Link, useLocation} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import Constant from "../../Components/Constant";
import postApiCall from '../../Services/postApiCall';
import PaginationNew from "../../Widgets/PaginationNew";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { DateRangePicker, Stack} from 'rsuite';
import "rsuite/dist/rsuite.css";

const BidderListing = () => {
    const [lists, setLists] = useState([]);
    const [filterForm, setFilterForm] = useState({
        searchKey: '',
        highestBidAmount: '',
    });
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState({})

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
        getList();
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
        console.log(e)
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

        getApiCall('user/bid/getBidListForAdmin', filterForm).then((response) => {
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

    function search() {
        filterForm.contentPerPage = perPage
        filterForm.page = 1

        getApiCall('user/bid/getBidListForAdmin', filterForm).then((response) => {
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


    function downloadList(e) {
        e.preventDefault();
        // Download to export
        getApiCall('user/bid/getBidListForAdmin', {exportData: 1})
            .then((response) => {
                if (response.meta.status) {
                    var csvString = response.data;
                    var universalBOM = "\uFEFF";
                    var a = window.document.createElement('a');
                    a.setAttribute('href', 'data:text/csv; charset=utf-8,' + encodeURIComponent(universalBOM + csvString));
                    a.setAttribute('download', 'bidders.csv');
                    window.document.body.appendChild(a);
                    a.click();
                    window.location.reload();
                }
            })


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
                    <h3>Bidders</h3>
                </div>
                
               
                    <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h3 mb-0 text-gray-800">Bidders</h1>
                    {/*<Link to="/cms/add" className="d-sm-inline-block btn btn-sm btn-primary shadow-sm">*/}
                    {/*    Add New*/}
                    {/*</Link>*/}
                    <button type="button" onClick={downloadList}
                            className="btn btn-sm btn-warning shadow-sm  mr-2"> Download List
                    </button>

                </div>

                <div className="card shadow mb-4">
                    <div className="card-header">
                        <div className="card-title">Search and Filters</div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={submitFilter} onChange={onChangeFilter}>
                            <div className="row">
                                <div className="col-12 col-xs-3 col-md-4 col-lg-4">
                                    <div className="form-group">
                                        <label>Search </label>
                                        <input type="text" className="form-control" name="searchKey"
                                               value={filterForm.searchKey}
                                               placeholder="Search by Name, Mobile Number, Email"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-xs-3 col-md-3 col-lg-3">
                                    <div className="form-group">
                                        <label>Highest Bid</label>
                                        <select className="form-control" name="highestBidAmount"
                                                value={filterForm.HighestBidAmount}>
                                            <option value="">Select</option>
                                            <option value="1">low to high</option>
                                            <option value="-1">high to low</option>

                                        </select>
                                    </div>
                                </div>

                                <div className="col-12 col-xs-3 col-md-4 col-lg-4">
                                  <div className="field">
                                     <p>Date Time Range</p>
                                     <DateRangePicker onChange={(e) => dateRangeHandler(e)}/>
                                     </div>
                                </div>


                                <div className="col-12 col-xs-3 col-md-3 col-lg-3 mt-1">
                                    <div className="form-group mt-4">
                                        <label> </label>
                                        <button type="submit" className="btn btn-md btn-warning shadow-sm  mr-2"> Search
                                            & Filter
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </form>
                    </div>

                    <div className="card-body">
                        <div className="row">
                            <div className="col"></div>
                        </div>

                        <div className="card-header"></div>
                        <div className="table-responsive">
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                <tr>
                                    <th>Sl. No.</th>
                                    <th>Bidder ID</th>
                                    <th>Name of Bidder</th>
                                    <th>Mobile Number</th>
                                    <th>Approval</th>
                                    {permission.moduleList?.updateDisabled ? null : <th>Action</th> }
                                </tr>
                                </thead>

                                <tbody>
                                {
                                    lists.map((item, index) => {
                                        let status = '';
                                        if (item?.isVerified) {
                                            status = "Accepted"
                                        } else if (!item?.isVerified && !item?.bidderRejectReason) {
                                            status = 'Pending';
                                        } else if (!item?.isVerified && item?.bidderRejectReason) {
                                            status = 'Rejected';
                                        }
                                        return <tr key={index}>
                                            <td>{(index + 1) + ((pageNo - 1) * 10)}</td>

                                            <td>{item._id}</td>
                                            <td>{item.name}</td>
                                            <td>{item.mobile}</td>
                                            <th>{status}</th>
                                            {permission.moduleList?.updateDisabled ? null : <td>
                                                {/*<Link to={"Primary_Details/" + item._id}*/}
                                                {/*      className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">*/}
                                                {/*    <span className="icon text-white-50">*/}
                                                {/*        <i className="far fa-eye"></i>*/}
                                                {/*    </span>*/}
                                                {/*    <span className="text">View</span>*/}
                                                {/*</Link><br></br>*/}

                                                <Link to={"Primary_Details/" + item._id}
                                                      className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
                                                    <span className="icon text-white-50">
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                    <span className="text">Primary Details</span>
                                                </Link><br></br>
                                                <Link to={"Document_Details/" + item._id}
                                                      className="btn btn-warning btn-icon-split btn-sm mb-1 mr-1">
                                                    <span className="icon text-white-50">
                                                        <i className="far fa-user"></i>
                                                    </span>
                                                    <span className="text">Support Documents</span>
                                                </Link><br></br>
                                                <Link to={"Declarative_Documents/" + item._id}
                                                      className="btn btn-info btn-icon-split btn-sm mb-1 mr-1">
                                                    <span className="icon text-white-50">
                                                        <i className="fa fa-bullhorn"></i>
                                                    </span>
                                                    <span className="text">Declaration Documents</span>
                                                </Link><br></br>
                                                <Link to={"Payment_Details/" + item._id}
                                                      className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
                                                    <span className="icon text-white-50">
                                                        <i className="far fa-credit-card"></i>
                                                    </span>
                                                    <span className="text">Payment</span>
                                                </Link><br></br>
                                                
                                                {/* <Link to={"/bidders/properties/" + item._id}
                                                      className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
                                                    <span className="icon text-white-50">
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                                    <span className="text">Bids</span>
                                                </Link> */}



                                                {/*{item.status == "DEACTIVE" ?*/}
                                                {/*    <button*/}
                                                {/*        onClick={UpdateStatus} value={item.pageId}*/}
                                                {/*        isDeleted={item.isDeleted}*/}
                                                {/*        className="btn btn-info btn-icon-split btn-sm  mb-1 mr-1"><span*/}
                                                {/*        className="icon text-white-50"><i*/}
                                                {/*        className="fas fa-exclamation-triangle"></i></span>*/}
                                                {/*        <span className="text">Disable</span>*/}
                                                {/*    </button>*/}
                                                {/*    :*/}
                                                {/*    <button className="btn btn-success btn-icon-split btn-sm mb-1 mr-1"*/}
                                                {/*            onClick={UpdateStatus} value={item.pageId}*/}
                                                {/*            isDeleted={item.isDeleted}*/}
                                                {/*            status={item.status}*/}
                                                {/*    >*/}
                                                {/*    <span className="icon text-white-50"><i*/}
                                                {/*        className="fas fa-check"></i></span>*/}
                                                {/*        <span className="text">Enable</span>*/}
                                                {/*    </button>*/}
                                                {/*}*/}


                                                {/*<Link to={"cms/add?id=" + item.pageId}*/}
                                                {/*      className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">*/}
                                                {/*    <span className="icon text-white-50">*/}
                                                {/*        <i className="far fa-edit"></i>*/}
                                                {/*    </span>*/}
                                                {/*    <span className="text">Edit</span>*/}
                                                {/*</Link>*/}
                                                {/*<button onClick={UpdateStatus} value={item.pageId} isDeleted={1}*/}
                                                {/*        className="btn btn-danger btn-icon-split btn-sm mb-1">*/}
                                                {/*        <span className="icon text-white-50">*/}
                                                {/*            <i className="far fa-eye"></i>*/}
                                                {/*        </span>*/}
                                                {/*    <span className="text">Delete</span>*/}
                                                {/*</button>*/}
                                            </td>}
                                        </tr>

                                    })
                                }
                                </tbody>
                            </table>

                            <div className="justify-content-center mt-2">
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

export default BidderListing
