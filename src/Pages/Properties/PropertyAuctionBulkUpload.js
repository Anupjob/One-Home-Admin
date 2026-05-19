import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import Layout from "../../Layout";
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import postApiCall from "../../Services/postApiCall";
import {Button, Modal} from "react-bootstrap";
import PaginationNew from "../../Widgets/PaginationNew";
import putApiCall from "../../Services/putApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';
import {toast, ToastContainer} from "react-toastify";

const PropertyAuctionBulkUpload = () => {

    const [bulkFile, setBulkFile] = useState();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadErrors, setUploadErrors] = useState([]);
    const [permission, setPermission] = useState({})

    const handleBulkFile = (e) => {
        setBulkFile(e.target.files[0]);
        // setIsUploading(false);
    }
    const submitBulkImportForm = (e) => {
        e.preventDefault();
        if(bulkFile){
        setIsUploading(true);
        let formData = new FormData();
        formData.append('excel', bulkFile);
        // formData.append('type', bulkForm.type);
        // formData.append('property_type', bulkForm.property_type);
        postApiCall('user/property/uploadAuctionProperty', formData).then((response) => {
            setUploadErrors([])
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 3000})
                setIsUploading(false);
                document.getElementById('bulkUploadFile').value = '';
                setBulkFile('');
                setUploadErrors(response.rowErrors)

            } else {
                // swal({text: response.meta.msg, icon: "error", dangerMode: true})
                setUploadErrors(response.rowErrors)
                setIsUploading(false);
            }
        })
            .catch((error) => {
                // console.log(error)
                swal({text: error.meta.msg, icon: "error", dangerMode: true})
                setIsUploading(false);
            })
        }else{
            toast("please excel file")
            return false
        }
    }

    async function GetRole(){
        let Role = await useGetRoleModule("Auction Property");
        if(Role.moduleList.read == false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            setPermission(Role)
        }
            
    }

    useEffect(() => {
         GetRole()
    }, [])


    return (
        <>
            <div className="container-fluid">
            <div className="main-title">
        <h3> Auction Property Bulk Upload</h3> 
            </div>
            <ToastContainer/>
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
                <div className="card shadow mb-4">
                    <div className="card-body">
                        <form onSubmit={submitBulkImportForm} >
                        <div className="d-sm-flex align-items-center justify-content-between mb-4">
                        <div className="form-group">
                                        <a className="btn btn-warning btn-sm" href="/property-auction.xlsx">Download Sample</a>
                                    </div>
                </div>
                { permission?.moduleList?.disabledCreate ? null : (
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="form-group">
                                        {/*<label>File</label>*/}
                                        <input type="file" className="form-control" onChange={handleBulkFile}
                                               id="bulkUploadFile"/>
                                    </div>
                                </div>
                                <div className="col-md-3 mt-0">
                                    <div className="form-group">
                                        {isUploading ? <button className="btn btn-primary btn-circle-lg" disabled={true}>Uploading</button> : <button className="btn btn-primary btn-circle-lg">Upload</button>}
                                    </div>
                                </div>
                            </div>)}
                        </form>

                        {uploadErrors != undefined &&
                            uploadErrors.map((error, index) => {
                                return <>
                                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                        <strong>{error.msg}</strong>
                                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                </>
                            })
                        }

                    </div>
                </div> }
            </div>
        </>
    )
}

export default PropertyAuctionBulkUpload
