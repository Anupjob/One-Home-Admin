import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import {useNavigate, useParams} from 'react-router-dom'
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import {getDateTime, propertyTitle} from "../../Services/helpers";
import moment from "moment";

 
const LiveBidderList = (props) => {
    const socket = props.socket;
    const history = useNavigate();
    let {id} = useParams();

    const [lists, setLists] = useState([<tr>
        <td colspan={6} style={{textAlign: 'center'}}>No bidder</td>
    </tr>]);
    const [joinRoom, setJoinroom] = useState(false)
    const [details, setDetails] = useState()

    async function getPropertyDetailsById(id) {
        let response = await getApiCall('user/property/getDetailsById/' + id);
        if (response.meta.status) {
            setDetails(response.data);
        }


        socket.on('connect', () => console.log('socket_id => ' + socket.id));
        socket.on('get_top_bidder', (data) => {
            console.log("data", data)
            let records = ""
            if (data.meta.status == true) {
                if (data.data.length >= 1) {
                   
                    // setOpenBid(data.data[0].message)
                    // setHighestBid(data.data[data.data.length-1].message)
                    records = data.data.map((rec, i) => {
                            let status = '';
                            if (rec?.bidder?.isVerified) {
                                status = "Accepted"
                            } else if (!rec?.bidder?.isVerified && !rec?.bidder?.bidderRejectReason) {
                                status = 'Pending';
                            } else if (!rec?.bidder?.isVerified && rec?.bidder?.bidderRejectReason) {
                                status = 'Rejected';
                            }
                            let bidderId = []
                            let bidderName = []
                            let mobile = []
                            rec?.bidders.map( _ => {
                                bidderId.push(_.bidderId)
                                bidderName.push(_.name)
                                mobile.push(_.mobile)
                            })
                            return (
                                <tr>
                                    <td>{i + 1}</td>
                                    <td>{bidderId.join(",")}</td>
                                    <td>{bidderName.join(",")}</td>
                                    <td>{mobile.join(",")}</td>
                                    <td>{status}</td>
                                    <td>
                                        <Link to={"/Primary_Details/" + rec?.bidders?._id}
                                              className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
                                                    <span className="icon text-white-50">
                                                        <i className="fa fa-check"></i>
                                                    </span>
                                            <span className="text">Primary Details</span>
                                        </Link><br></br>
                                        <Link to={"/Document_Details/" + rec?.bidders?._id}
                                              className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
                                                    <span className="icon text-white-50">
                                                        <i className="far fa-user"></i>
                                                    </span>
                                            <span className="text">Support Documents</span>
                                        </Link><br></br>
                                        <Link to={"/Declarative_Documents/" + rec?.bidders?._id}
                                              className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
                                                    <span className="icon text-white-50">
                                                        <i className="fa fa-bullhorn"></i>
                                                    </span>
                                            <span className="text">Declaration Documents</span>
                                        </Link><br></br>
                                        <Link to={"/Payment_Details/" + rec?.bidders?._id}
                                              className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
                                                    <span className="icon text-white-50">
                                                        <i className="far fa-credit-card"></i>
                                                    </span>
                                            <span className="text">Payment</span>
                                        </Link><br></br>
                                       
                                       

                                    </td>
                                </tr>
                            )
                        }
                    )
                }

            } else {
                records = <tr>
                    <td colspan={6} style={{textAlign: 'center'}}>No bidder</td>
                </tr>
            }
            setLists(records);
        });

        socket.on('connect_error', (error) => {
            console.log("error",error);
            setTimeout(() => socket.connect(), 5000)
        });

        socket.on('disconnect', () => console.log({'time': 'server disconnected'}))
    }

    async function RoomJoinInit(id) {
        if (joinRoom == false) {
            await socket.on('connect', () => console.log('socket_id => ' + socket.id));
            let data = await socket.emit('join_room', {'propertyId': id});
            //console.log(data)
            setJoinroom(true)
        } else {
            console.log("room already joined")
        }
    }

    useEffect(() => {
        RoomJoinInit(id)
        getPropertyDetailsById(id)
    }, [])


    return (
        <>
            <div className="container-fluid">
                <div className="main-title">
                    <h3>Bidders</h3>
                </div>

                <div className="card shadow mb-4">
                    <div className="card-body">
                        <div class="col">
                            <div class=" mb-0 font-weight-bold text-gray-800">Auction End in Date: <strong
                                className="orangetext">{moment(details?.auctionExtendedDateTimeEpoch).utc().format('DD-MM-YYYY HH:MM:SS')}</strong>


                            </div>
                        </div>
                        <div class="col">
                            <div class="h6 mb-0 font-weight-bold text-gray-800">Time:<strong
                                className="orangetext"> {details?.auctionExtendedDateTimeEpoch ? getDateTime(details.auctionExtendedDateTimeEpoch)?.date.toLocaleTimeString() : ''}</strong>
                            </div>
                        </div>
                        <div class="col">
                            <div class="h6 mb-0 font-weight-bold text-gray-800">Property Code/Listing ID:<strong
                                className="orangetext"> {details?.propertyId}</strong></div>
                        </div>
                        <div class="col">
                            <div class="h6 mb-0 font-weight-bold text-gray-800">Property Name:<strong
                                className="orangetext"> {propertyTitle(details)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card shadow mb-4">

                    <div className="card-body">

                        <div className="table-responsive">
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                <tr>
                                    <th>Sl. No.</th>
                                    <th>Bidder ID</th>
                                    <th>Name of Bidder</th>
                                    <th>Mobile Number</th>
                                    <th>Approval</th>
                                    <th>Action</th>

                                </tr>
                                </thead>

                                <tbody>
                                {lists}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default LiveBidderList
