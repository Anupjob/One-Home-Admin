import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import Layout from "../../Layout";
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import postApiCall from "../../Services/postApiCall";
import {Button, Modal} from "react-bootstrap";
import PaginationNew from "../../Widgets/PaginationNew";

const PropertyFeedbacks = (props) => {
    const {id} = props.match.params;
    const [property, setProperty] = useState({});
    const [lists, setLists] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(50);
    const [isLoaded, setIsLoaded] = useState(false);
    const [searchForm, setSearchForm] = useState({
        searchKey: '',
        startDate: '',
        endDate: '',
        auctionStatus: ''
    });


    function changeSearchForm(e) {
        if (!e.target.name) return;
        setSearchForm({
            ...searchForm,
            [e.target.name]: e.target.value
        })
    }

    function submitSearchForm(e) {
        e.preventDefault();
        getList();
    }

    async function getList() {
        let query = {
            'page': pageNo,
            'contentPerPage': perPage,
            'searchKey': searchForm.searchKey,
        }
        // if (id) query.propertyId = id;
        let response = await getApiCall('common/feedback/list', query);
        // console.log(response)
        setLists(response.data)
        setTotalItems(response.total)
        // setProperty(response.data.propertyDetails)
        setIsLoaded(true);
    }


    useEffect(() => {
        getList();
    }, []);


    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');
        let status = e.currentTarget.getAttribute('status');
        let isDeleted = e.currentTarget.getAttribute('isDeleted');
        status = status === "DEACTIVE" ? "active" : "deactive"
        postApiCall('user/property/status', {
            status: status,
            "_id": id,
            // isDeleted: isDeleted
        }).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getList();
            }
        });
    }

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    const [isUploading, setIsUploading] = useState(false);

    // on change form


    function pageChangeHandler(page) {
        if (isLoaded) {
            setPageNo(page);
            getList()
        }
    }

    return (
        <>
            <div className="container-fluid">
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h3 mb-0 text-gray-800">Property Feedbacks {id ? ' - ' + id : ''}  </h1>
                    <Link to="/properties" className="d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                        Back
                    </Link>
                </div>


                <div className="card shadow mb-4">
                    <div className="card-header py-3">
                        <h6 className="m-0 font-weight-bold text-primary text-center card-title">Search and Filter</h6>
                        <form onSubmit={submitSearchForm} onChange={changeSearchForm}>
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Search</label>
                                        <input type="text" className="form-control" name="searchKey"
                                               value={searchForm.searchKey}/>
                                    </div>
                                </div>
                                {/*<div className="col-md-3">*/}
                                {/*    <div className="form-group">*/}
                                {/*        <label>Start Date</label>*/}
                                {/*        <input type="date" className="form-control" name="startDate"*/}
                                {/*               value={searchForm.startDate}/>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                {/*<div className="col-md-3">*/}
                                {/*    <div className="form-group">*/}
                                {/*        <label>End Date</label>*/}
                                {/*        <input type="date" className="form-control" name="endDate"*/}
                                {/*               value={searchForm.endDate}/>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                {/*<div className="col-md-3">*/}
                                {/*    <div className="form-group">*/}
                                {/*        <label>Auction Status</label>*/}
                                {/*        <select name="auctionStatus" className="form-control" value={searchForm.auctionStatus} >*/}
                                {/*            <option value="">Select</option>*/}
                                {/*            <option >Upcoming</option>*/}
                                {/*            <option >Live</option>*/}
                                {/*            <option >Past</option>*/}
                                {/*        </select>*/}
                                {/*    </div>*/}
                                {/*</div>*/}

                                <div className="col-md-3 mt-4">
                                    <div className="form-group">
                                        <button className="btn btn-primary btn-circle-lg"
                                                onClick={() => getList()}>Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                <tr>
                                    <th>Sl. No.</th>
                                    <th>Property Id</th>
                                    <td>Name</td>
                                    <td>Status</td>
                                    {/*<td>Created At</td>*/}

                                </tr>
                                </thead>

                                <tbody>
                                {
                                    lists.map((item, index) => {
                                        return <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.propertyId}</td>
                                            <td>{item.name}</td>
                                            <td>{item.status}</td>
                                            {/*<td>{item.createdAt}</td>*/}
                                        </tr>

                                    })
                                }
                                <div className="justify-content-center mt-2">
                                    <PaginationNew perPage={perPage} totalItems={totalItems} currentPage={pageNo}
                                                   handler={pageChangeHandler}/>
                                </div>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PropertyFeedbacks
