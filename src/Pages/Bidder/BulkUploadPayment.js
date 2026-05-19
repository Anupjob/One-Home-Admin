import React, { useEffect, useState } from 'react'
import swal from "sweetalert";
import postApiCall from "../../Services/postApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { deslugifyTransform } from '../../Utils/Helpers';
import { useParams } from 'react-router-dom';
import CustomButton from '../../Utils/CustomButton';
import axios from 'axios';
import Constant from '../../Components/Constant';
import loginUser from '../../Services/loginUser';

const BulkUploadPayment = () => {
    let { accessToken } = loginUser();
    const { type } = useParams();
    const [uploadFile, setUploadFile] = useState("")
    const [permission, setPermission] = useState({})
    const [uploadErrors, setUploadErrors] = useState([]);
    const [typeOfData, setTypeOfData] = useState(type)
    const handleFileReader = (event) => {
        const file = event.target.files[0];
        if (file && file.name.endsWith('.xlsx')) {
            setUploadFile(file);
        } else {
            swal({ text: 'Only .xlsx files are allowed!', icon: "error", dangerMode: true })
            event.target.value = ''; // reset file input

        }

    }


    console.log(uploadFile);

    const submitBulkImportForm = (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("excel", uploadFile);
            let url = ''
            if (type == 'emd-eoi') {
                url = 'user/transaction/bulk/emd-eoi'
            }
            else if (type == 'balance-sale') {
                url = 'user/transaction/bulk/balance-sale'
            }
            postApiCall(url, formData).then((response) => {
                if (response.meta.status) {
                    if (response.data.successful?.length > 0) {
                        swal({ text: response.meta.msg, icon: "success", timer: 1500 })
                    }
                    setUploadFile('')
                    if (response.data.failed?.length > 0) {
                        setUploadErrors(response.data.failed)
                    }
                } else {
                    swal({ text: response.meta.msg, icon: "error", dangerMode: true })
                }
            })
                .catch((error) => {
                    console.log('response.data:::::', error)
                    // swal({ text: error.meta.msg, icon: "error", dangerMode: true })
                    //  setUploadErrors(error.data.failed)

                })
        }
        catch (err) {
            console.log('err.data:::::', err)
        }

    }

    console.log(uploadFile);

    async function GetRole() {
        let Role = await useGetRoleModule('bidders');
        setPermission(Role)
    }

    useEffect(() => {
     GetRole()
    }, [])

    const handleDownloadTemplate = async () => {
        try {
            let endPath = ''
            if (typeOfData == "emd-eoi") {
                endPath = 'user/transaction/template/emd-eoi'
            }
            else if (typeOfData == "balance-sale") {
                endPath = 'user/transaction/template/balance-sale'
            }
            const response = await axios({
                url: Constant.apiBasePath + endPath,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                }
            });
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = deslugifyTransform(typeOfData) + '.xlsx';
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <>
            <div className="container-fluid">
                {permission.hasOwnProperty('moduleAccress') && !permission.moduleAccress ?
                    <div className="row text-center">
                        <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                            <div className="errer">
                                <img src="/program-error.png" />
                                <h2>403</h2>
                                {/* <h4 className="text-danger">{permission.message}</h4> */}
                                <p>{permission.message}</p>

                            </div>
                        </div>
                    </div>
                    : (<>
                        <div className="main-title d-flex justify-content-between align-items-center flex-wrap">
                            {/* Left Side: Title */}
                            <h3 className="mb-2 mb-md-0">{deslugifyTransform(type)} Payment Bulk Upload</h3>

                            {/* Right Side: Action Buttons */}
                            <div className="d-flex gap-3 flex-wrap">
                                <div className="position-relative">
                                    <CustomButton
                                        label="Download Template"
                                        icon="bi-download"
                                        onClick={handleDownloadTemplate}
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="card shadow mb-4">
                            <div className="card-body">
                                <form onSubmit={submitBulkImportForm} >
                                    <div className="d-sm-flex align-items-center justify-content-between mb-4">

                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 col-lg-4 col-xs-12">
                                            <select name="paymentMode" className="form-control" value={typeOfData} onChange={(e) => setTypeOfData(e.target.value)} required={true}>
                                                {/* <option value="">Select</option> */}
                                                <option value="emd-eoi">EMD/EOI Payment</option>
                                                <option value="balance-sale">Balance Sale Payment</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 col-lg-4  col-xs-12">
                                            <div className="form-group">

                                                <input type="file" className="form-control" onChange={handleFileReader}
                                                    id="bulkUploadFile" />
                                            </div>

                                            <ul className='doceg list-inline'>
                                                {/* <li> Create a folder e.g., Bulk Document</li>
                                            <li> Create Sub-folder named after Property ID e.g. 872653 inside Bulk Document folder</li>
                                            <li> Create Sub-folders named Auction Documents and/or Property Documents inside Property ID folder</li>
                                            <li> Move Auction Notice PDF file  in Auction Documents folder and Property realated files in Property Documents </li>
                                            <li> Zip Bulk Document folder</li>
                                            <li> Upload Zip Folder</li> */}

                                            </ul>
                                        </div>
                                        <div className="col-md-3 col-lg-3 mt-0  col-xs-12">
                                            <div className="form-group">
                                                <button className="btn btn-primary btn-circle-lg">Upload</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {uploadErrors != undefined &&
                                    uploadErrors.map((error, index) => {
                                        return <>
                                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                                <strong>{`row-${error.row + ': ' + error.error}`}</strong>
                                                <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                        </>
                                    })
                                }


                            </div>
                        </div>   </>)}
            </div>
        </>
    )
}

export default BulkUploadPayment
