import React,{ useState, useEffect } from 'react'
import axios from "axios";
import Constant from "../../Components/Constant";
import loginUser from "../../Services/loginUser";
import {useParams} from "react-router-dom";
import useGetRoleModule from '../../Services/useGetRoleModule';
import getApiCall from '../../Services/getApiCall';




function DeclarativeDocument() {
    //get id from prams
    const prams = useParams();
    const id = prams.id;
    let {accessToken} = loginUser();
    const [permission, setPermission] = useState({})

    
    async function GetRole() {
        // parnent module permissions
        let Role = await useGetRoleModule("bidders");
        setPermission(Role)
    }

    async function getDetails(data = null) {
        // let id = '6405cee74b6204245c4907c8'
        let response = await getApiCall('user/bid/get-details/' + id,);
        // if succes then add
        if (response.meta.status) {
            // setDetails(response.data)
            console.log(response)
        }
        // console.log('response', response)
    }


    useEffect(() => {
        GetRole();
        getDetails()
    }, [])

    const Download = async () => {
        try {
            const response = await axios({
                url: Constant.apiBasePath + 'admin/decleration/bidder/'+id,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                }
            });
            console.log(response.data);
            // if (!response.meta.status ) {
            //     alert(response.meta.msg);
            //     return ''
            // }

            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'download.pdf';
            document.body.appendChild(link);
            link.click();
            // Clean up the URL object when the download is complete
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    };

    return (<>
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
        <div className='container-fluid'>
            <div className="main-title">
                <h3>Declaration Documents</h3>
            </div>

            <div className='card'>
                <div className='card-header'>
                <h4 className='card-title'>Tender & Bid Declaration Docs</h4>
                </div>
                <div className='card-body'>
                <div className='row'>
                    <div className='col-md-3'>
                        <div className='pdfBox'>
                            <img src='../../assets/images/pdficon.png'></img>
                            <button className="btn btn-link" onClick={Download} ><span>Bid Declaration Form</span></button>
                        </div>
                    </div>
                    <div className='col-md-3'>
                        <div className='pdfBox'>
                            <img src='../../assets/images/pdficon.png'></img>
                            <a><span>Tendor Form</span>
                            </a>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

        </div> }</>
    )
}

export default DeclarativeDocument