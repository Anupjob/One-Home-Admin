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

const BulkDocumentUpload = () => {

    const [uploadFile, setUploadFile] = useState("")
    const [uploadErrors, setUploadErrors] = useState([
        // { msg: 'Test Error 1'},
    ]);
    const [permission, setPermission] = useState({})


    const handleFileReader = (event) => {
        setUploadFile(event.target.files[0]);
}


console.log(uploadFile);

    const submitBulkImportForm = (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("zip",uploadFile);
        // formData.append('type', bulkForm.type);
        // formData.append('property_type', bulkForm.property_type);
        postApiCall('user/property/doc/zip/upload', formData).then((response) => {
    
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
        
            } else {
                
            }
        })
            .catch((error) => {
                swal({text: error.meta.msg, icon: "error", dangerMode: true})
            
            })

    }

    console.log(uploadFile);

    async function GetRole(){
        let Role = await useGetRoleModule("Auction Property");
        console.log(Role.moduleList.readDisbled == true)
        if(Role.moduleList.read === false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            setPermission(Role)
        }
    }

    useEffect(async () => {
       await GetRole()
    }, [])
    
    return (
        <>
            <div className="container-fluid">
            <div className="main-title">
        <h3> Property Bulk Document Upload</h3> 
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
                
                <div className="card shadow mb-4">
                    <div className="card-body">
                         <form onSubmit={submitBulkImportForm} >
                        <div className="d-sm-flex align-items-center justify-content-between mb-4">
                        
                </div>
                            <div className="row">
                                <div className="col-8 col-md-6 col-lg-6">
                                    <div className="form-group">
                                      
                                        <input type="file" className="form-control" onChange={handleFileReader} 
                                               id="bulkUploadFile"/>
                                    </div>
                                
                                    <ul className='doceg list-inline'>
                                    <li> Create a folder e.g., Bulk Document</li>
                                    <li> Create Sub-folder named after Property ID e.g. 872653 inside Bulk Document folder</li>
                                    <li> Create Sub-folders named Auction Documents and/or Property Documents inside Property ID folder</li> 
                                    <li> Move Auction Notice PDF file  in Auction Documents folder and Property realated files in Property Documents </li>
                                    <li> Zip Bulk Document folder</li>
                                    <li> Upload Zip Folder</li>

                                    </ul>
                                </div>
                                <div className="col-4 col-md-3 col-lg-3 mt-0">
                                    <div className="form-group"> 
                                         <button className="btn btn-primary btn-circle-lg">Upload</button>
                                    </div>
                                </div>
                            </div>
                        </form> 


                       

                    </div>
                </div> }
            </div>
        </>
    )
}

export default BulkDocumentUpload
