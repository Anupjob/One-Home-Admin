import React, {useState, useEffect, useRef} from 'react'
import getApiCall from "../../Services/getApiCall";
import {useNavigate, useLocation} from 'react-router-dom';
import {FaRegCommentAlt} from 'react-icons/fa';
import Pagination from '../../Widgets/Pagination';


function LeadCommunications() {
    const history = useNavigate();
    const location = useLocation();

    const [phone, setPhone] = useState('');
    const [search, setSearch] = useState('');
    const [toDt, setToDt] = useState("");
    const [fromDt, setfromDt] = useState("")
    const [communicationData, setCommunicationData] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [page, setpage] = useState(1);


    const paginationHandler = (page) => {
        setpage(page)
        getLeadCommunications("", "", "", page, "");
    }


    async function getLeadCommunications(fromDate, toDate, searchKey, page, contentPerPage, searchByPhoneEmailName=null) {

        let response = await getApiCall(`common/send-enquiry/list2?fromDate=${fromDate} & toDate=${toDate}&searchKey=${searchKey}&page=${page}&contentPerPage=${contentPerPage}&searchByPhoneEmailName=${searchByPhoneEmailName}`);
        setCommunicationData(response.data);
        setTotalPage(response.pages)
    }


    useEffect(() => {
        getLeadCommunications("", "", "", page, "");
    }, [])


    return (
        <>
            <div className='container-fluid'>
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h3 mb-0 text-gray-800">Lead Communications</h1>
                </div>

                <div className='card mb-2'>
                    <div className='card-body'>

                        <div className='row'>
                            <div className='col col-md-3'>
                                <label className="font-weight-bold">Name | Phone No | Email</label>
                                <div className="form-group">
                                    <input type="text" className="form-control" onChange={(e) => {
                                        setSearch(e.target.value)
                                    }
                                    } value={search}/>

                                </div>
                            </div>


                            <div className='col col-md-3'>
                                <label className="font-weight-bold">Search By Preference</label>
                                <div className="form-group">
                                    <input type="text" className="form-control"

                                    //        onChange={(e) => {
                                    //     setSearch(e.target.value)
                                    // }}
                                           // value={search}
                                    />

                                </div>
                            </div>

                            <div className='col col-md-2'>
                                <label className="font-weight-bold">Start Date</label>
                                <div className="form-group">
                                    <input type="date" value={toDt} className="form-control"
                                           onChange={(e) => setToDt(e.target.value)}/>
                                </div>
                            </div>

                            <div className='col col-md-2'>
                                <label className="font-weight-bold">End Date</label>
                                <div className="form-group">
                                    <input type="date" value={fromDt} className="form-control"
                                           onChange={(e) => setfromDt(e.target.value)}/>
                                </div>
                            </div>


                            <div className='col col-md-2'>
                                <div className="form-group mt30">
                                    <button className='btn btn-warning'
                                            onClick={(e) => {
                                                getLeadCommunications(fromDt, toDt, search, page, "", phone);
                                            }
                                            }
                                    >Search
                                    </button>
                                </div>
                            </div>


                        </div>

                        <div className="table-responsive mt-5">
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                <tr>
                                    <th>Lead</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Title</th>
                                    <th>State</th>
                                    <th>City</th>
                                    <th>Property Address</th>
                                    <th>Price</th>
                                    <th>Status</th>

                                </tr>
                                </thead>

                                <tbody>
                                {communicationData.map((item, index) => {
                                    return (

                                        <tr key={index}>
                                            <td>{(page*10) +(index + 1)-10}</td>
                                            <td>{item.name}</td>
                                            <td>{item.email}</td>
                                            <td>{item.mobile}</td>
                                            <td>{item.propertyData.propertyType}  </td>
                                            <td> {item.propertyData.stateName} </td>
                                            <td>{item.propertyData.cityName} </td>
                                            <td> {item.propertyData.address.split('')}</td>
                                            <td> {item.propertyData.price}</td>
                                            <td>
                                                <div>
                                                    <FaRegCommentAlt size={15}
                                                                     onClick={() => history(`Leads_Comments/${item._id}`)}/>
                                                </div>
                                                <div>
                                                    {location.state && location.state.id != null && item._id == location.state.id ? location.state.params : " "}
                                                </div>

                                            </td>

                                        </tr>

                                    )


                                })}
                                </tbody>
                            </table>
                        </div>

                        <Pagination prev={page == 1 ? 1 : (page > 1) ? page - 1 : page} current={page}
                                    next={page + 1} pageCount={totalPage} handler={paginationHandler}/>

                    </div>

                </div>
            </div>


        </>
    )
}

export default LeadCommunications