import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import Layout from "../../Layout";
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';


export default  function PaymentVerification  (props) {
    let { id } = useParams();

    const [data, setData] = useState({
        "isVerified": '',
        "bidderRejectReason": ''
    });
    const [bidder, setBidder] = useState({});
    const history = useNavigate()

    const [isReady, setIsReady] = useState(true);
    const [permission, setPermission] = useState({})


    async function GetRole() {
        // parnent module permissions
        let Role = await useGetRoleModule("bidders");
        setPermission(Role)
        getBidderDetails();
    }


    useEffect(() => {
        GetRole();
    }, [])


    useEffect(() => {
        if (isReady) return null;
        const timer = setTimeout(() => {
            setIsReady(true)
        },10000)
        return () => {
            clearTimeout(timer)
        }
    }, [isReady]);

    

    async function getBidderDetails(data = null) {
        let response = await getApiCall('user/bid/get-details/' + id,);
        if (response.meta.status) {
            setBidder(response.data)
        }
    }


    const onChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }



    const onSubmit = async (e) => {
        e.preventDefault()
        data.bidId = id;
        setIsReady(false)
        let returnData = await postApiCall('user/bid/status/bid', data, true);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            history.goBack();
            setIsReady(true)
        }else  {
            setIsReady(true)
        }

    }

    function goBack() {
        history.goBack();
    }
    return (
        <>
        {permission.hasOwnProperty('moduleAccress') && !permission.moduleAccress && permission.moduleList?.updateDisabled ?
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
            <div className="container-fluid">
                <div className="main-title">
                    <h3>Bidder Payment Verification - {bidder.firstName} {bidder.lastName}</h3>
                </div>
                <div className="d-sm-flex align-items-center justify-content-end mb-4">
                    <button onClick={goBack}
                          className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
                        className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</button>
                </div>


                <div className="card shadow mb-4">
                    <div className="card-body">
                        <form onChange={onChange} onSubmit={onSubmit}>
                            <div className="row">
                                <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                    <div className="form-group">
                                        <label>Verification</label>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="isVerified"
                                                   id="flexRadioDefault1" value={true}/>
                                            <label className="form-check-label"
                                                   htmlFor="flexRadioDefault1">Approved</label>
                                        </div>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="isVerified"
                                                   id="flexRadioDefault2" value={false} />
                                            <label className="form-check-label"
                                                   htmlFor="flexRadioDefault2">Reject</label>
                                        </div>
                                    </div>

                                    {data.isVerified != 'false' ? '' :
                                    <div className="form-group">
                                        <label>Reject Reason</label>
                                        <textarea  name="bidderRejectReason" className="form-control" value={data.bidderRejectReason}/>
                                    </div>
                                    }



                                </div>
                            </div>
                            <div className="form-group mt-1">
                                <button type="submit" className="btn btn-md btn-warning shadow-sm mr-2" disabled={!isReady}> Submit</button>
                            </div>
                        </form>
                    </div>
                </div>


            </div>}

        </>
    )
}

