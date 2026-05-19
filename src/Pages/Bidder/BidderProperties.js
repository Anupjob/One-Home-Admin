import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import postApiCall from "../../Services/postApiCall";
import PaginationNew from "../../Widgets/PaginationNew";
import deleteApiCall from "../../Services/deleteApiCall";
import Constant from "../../Components/Constant";
import {userDetails} from "../../Services/authenticationService";
import useGetRoleModule from '../../Services/useGetRoleModule';
import axios from "axios";
import loginUser from "../../Services/loginUser";
import RefundModal from "./RefundModal";

const PropertyListing = () => {
    let {accessToken} = loginUser();

    const [lists, setLists] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(false);
    const [searchForm, setSearchForm] = useState({
        searchKey: '',
        fromDate: '',
        toDate: '',
        soldStatus: '',
    });
    const [permission, setPermission] = useState({})
    const [auctionPermission, setAuctionPermission] = useState({})

    const user = userDetails();
    const {bidderId} = useParams()

    function changeSearchForm(e) {
        if (!e.target.name) return;
        setSearchForm({
            ...searchForm,
            [e.target.name]: e.target.value
        })
    }

    const onChangeFilter = (e) => {
        if (!e.target.name) return
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


    async function getList() {
        let response = await getApiCall('user/bid/get-bid-details/'+bidderId);
        setLists(response.data)
        setTotalItems(response.total)
        setIsLoaded(true);
    }

    async function GetRole() {

        let Role = await useGetRoleModule("Auction Property");
        let autionRole = await useGetRoleModule("Auction Property");
     //   console.log("autionRole", autionRole, Role)
        setAuctionPermission(autionRole)
        setPermission(Role)
        // getList();
    }

    useEffect(() => {
        GetRole()
    }, []);


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
                swal({text: response.meta.msg, icon: "success", timer: 1500})
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
                        swal({text: response.meta.msg, icon: "success", timer: 1500})
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


    return (
        <>
            <div className="container-fluid">
                <div className="main-title">
                    <h3>Bidder Bids</h3>
                </div>

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
                    :
                    <>


                        <div className="card shadow mb-4">
                            {/*Search and Filter From*/}
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                        <tr>
                                            <th>Sl. No.</th>
                                            <th>Property Id</th>
                                            <th>Payment Status</th>
                                            <th>Payment Particular</th>
                                            <th>Payment Mode</th>
                                            <th>Payment Transaction ID</th>
                                            <th>Payment Amount</th>
                                            {/*<th>Payment Screenshot</th>*/}
                                            <th>Payment Date</th>
                                            <th>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            lists.map((item, index) => {
                                                return <tr key={index}>
                                                    <td>{(index + 1) + ((pageNo - 1) * 10)}</td>
                                                    <td>
                                                        <Link
                                                            to={'/property/details/' + item?.property?._id}>{item?.property?.propertyId}</Link>
                                                    </td>
                                                    <td>{item.order?.paymentStatus}</td>
                                                    <td>{item.order?.paymentFor == 1 ? 'EMD Payment' : ''} </td>
                                                    <td>{item.order?.paymentMode ? item.order.paymentMode != 1 ? 'Online' : 'Offline' : '-'} </td>
                                                    <td>{item.order?.transactionId ? item.order?.transactionId :  '-'}</td>
                                                    <td>{item.order?.amount}</td>
                                                    {/*<td><img style={{width: "50px"}}*/}
                                                    {/*         src='../../assets/images/no_image.png'></img></td>*/}
                                                    {/*<td></td>*/}
                                                    <td> {item.order?.createdAt}</td>
                                                    <td>
                                                        {item.order?.paymentStatus == 'COMPLETED' ? <RefundModal bidData={item} callback={getList} /> : '-' }
                                                    </td>


                                                </tr>

                                            })
                                        }

                                        </tbody>

                                    </table>
                                    <div className="justify-content-center mt-2">
                                        <PaginationNew perPage={perPage} totalItems={totalItems} currentPage={pageNo}
                                                       handler={pageChangeHandler}/>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </>}


            </div>
        </>
    )
}

export default PropertyListing