import React, { useEffect, useState, useRef } from 'react'
import swal from "sweetalert";
import postApiCall from "../../Services/postApiCall";
import axios from 'axios';
import useGetRoleModule from '../../Services/useGetRoleModule';
import { deslugifyTransform } from '../../Utils/Helpers';
import { useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';

const BulkDataUpload = ({formName, type, formId, visible, setVisible,downloaBulkAssignmentTemplate}) => {
    // const {  } = useParams();
    const [uploadFile, setUploadFile] = useState("")
    const [permission, setPermission] = useState({})
    const [uploadErrors, setUploadErrors] = useState([]);
    const [responseData, setResponseData] = useState()
     const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) handleFileReader(file);
  };
  

  // const downloadTemplate = async (e) => {
  //   e && e.preventDefault();
  //   try {
  //     const resp = await axios.get(`/bulk-assignment-template/${formId}`, { responseType: 'blob' });
  //     const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     const url = window.URL.createObjectURL(blob);
  //     // try to derive filename from headers
  //     const cd = resp.headers['content-disposition'] || '';
  //     let fileName = 'template.xlsx';
  //     const m = cd.match(/filename\*=UTF-8''([^;\n\r]+)|filename="?([^";\n\r]+)"?/);
  //     if (m) fileName = decodeURIComponent(m[1] || m[2]);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = fileName;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error('Download template error', err);
  //     swal({ text: 'Template download failed', icon: 'error' });
  //   }
  // };

  const onDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) handleFileReader(file);
  };

  const onDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };
    const handleFileReader = (file) => {
        // const file = event.target.files[0];
        console.log('file::::::',file)
        const fileName = file?.name?.toLowerCase() || '';
        if (type === 'Bulk Assignment') {
          if (fileName.endsWith('.xlsx')) {
            submitBulkImportForm(file);
            setUploadFile(file);
          } else {
            let message = "Only .xlsx files are allowed for Bulk Assignment!";
            swal({ text: message, icon: "error", dangerMode: true });
          }
        } else if(type === 'Admin Bulk Update') {
          if (fileName.endsWith('.xlsx')) {
            submitBulkImportForm(file);
            setUploadFile(file);
          }else{
            let message = "Only .xlsx files are allowed for Admin Bulk Update!";
            swal({ text: message, icon: "error", dangerMode: true });
          }
        }
        else {
          if (fileName.endsWith('.xlsx') || fileName.endsWith('.zip')) {
            submitBulkImportForm(file);
            setUploadFile(file);
          } else {
            let message = "Only .xlsx or .zip files are allowed!";
            swal({ text: message, icon: "error", dangerMode: true });
          }
        }

    }


    console.log(uploadFile);

  const submitBulkImportForm = (uploadFile) => {
    // e.preventDefault();

    const formData = new FormData();
    let url = ''
    if (type == 'Bulk Upload') {
      if (formId === '684ff0df3fc5c3489b3f65e2') {
        url = `admin/partner-user/import-new`
        formData.append("excel", uploadFile);
      }else{
        url = `admin/submit/form/upload-template/${formId}`
        formData.append("file", uploadFile);
      }
    }
    else if (type == 'Bulk Update') {
      if (formId === '684ff0df3fc5c3489b3f65e2') {
        url = `admin/partner-user/import-updates`
        formData.append("excel", uploadFile);
      }else{
        url = 'admin/submit/form/update-template'
        formData.append("file", uploadFile);
      }
    }
    else if (type == 'Bulk Image Upload') {
      url = `admin/submit/form/upload-images-zip/${formId}`
      formData.append("zip", uploadFile);
    }
    else if (type == 'Bulk Assignment') {
      url = `admin/submit/form/bulk-assignment/${formId}`
      formData.append("excel", uploadFile);
    }
    else if (type == 'Bulk Review') {
      url = `admin/submit/form/bulk-approve-reject`
      formData.append("excel", uploadFile);
    }
    else if (type == 'Admin Bulk Update') {
      url = `admin/submit/form/partial-bulk-update/${formId}`
      formData.append("excel", uploadFile);
    }
    postApiCall(url, formData).then((response) => {
      if (response.meta.status) {
        setResponseData(response)
        if (response.rowErrors?.length == 0 || response.data?.errorCount == 0) {
          swal({ text: response?.meta?.msg, icon: "success", timer: 1500 })
          // setVisible(false)
        }else{
          swal({ text: response?.meta?.msg, icon: "success", timer: 1500 })
        }
        // setUploadFile('')
        setUploadErrors(response.rowErrors)
        // if(response.data.errorCount>0){
        //     downloadBase64File(response.data.errorFile, response.data.errorFileName)
        // }
      } else {
        swal({ text: response?.meta?.msg || "Something went wrong.", icon: "error", dangerMode: true })

      }
    })
      .catch((error) => {
        swal({ text: error?.meta?.msg || "Something went wrong.", icon: "error", dangerMode: true })

      })

  }

    // console.log(uploadFile);

    async function GetRole() {
        let Role = await useGetRoleModule(deslugifyTransform(formName));
        console.log(Role.moduleList.readDisbled == true)
        if (Role.moduleList.read === false) {
            setPermission({ moduleAccress: false, moduleList: {}, message: "Module Need Some Permission...Pls contact with Your Partner" })
        } else {
            setPermission(Role)
        }
    }

    useEffect(() => {
     GetRole()
    }, [])

const downloadBase64File = (e) => {
     e.preventDefault();
     const fileName = responseData.data.errorFileName
     const base64=responseData.data.errorFile
  // Convert Base64 string to a byte array
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  // Create a Blob for XLSX
  const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  // Create temp download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  a.remove();
  window.URL.revokeObjectURL(url);
};

const handleClose=()=>{
    setVisible(false)
}
const removeFile = () => {
  setUploadFile(null);
  if (inputRef.current) {
    setUploadErrors([])
    inputRef.current.value = "";
  }
};


const reUpload = (e) => {
  e.preventDefault();
  if (inputRef.current) {
    inputRef.current.value = "";
    inputRef.current.click();
  }
};

    return (
        <>
        <Modal
                    backdrop="static"
                    role="alertdialog"
                    show={visible}
                    onHide={handleClose}
                    size="xl"
                    keyboard={false}
                    dialogClassName="modal-top-right"
                >
                    <Modal.Header className="align-items-center">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Modal.Title>{deslugifyTransform(formName)} {type}</Modal.Title>
                        </div>
                              {type === 'Bulk Assignment' && (
                                <button type="button" className="btn btn-outline-primary btn-sm me-2" onClick={downloaBulkAssignmentTemplate}>
                                  Download Template
                                </button>
                              )}
                        <i
                            className="fa fa-times ms-auto"
                            role="button"
                            onClick={handleClose}
                            style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                        />
                    </Modal.Header>
        
                    <Modal.Body>
            <div className="container-fluid">
                    <div className="card shadow mb-4 mt-3">
                        <div className="card-body">
                            <form>
                                <div className="d-sm-flex align-items-center justify-content-between mb-4 mt-2">

                                </div>
                                {/* <div className="row">
                                    <div className="col-md-7 col-lg-7 col-sm-12">
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
                                            <li> Upload Zip Folder</li> 

                                        </ul>
                                    </div>
                                    <div className="col-md-3 col-lg-3 col-sm-6 mt-0">
                                        <div className="form-group">
                                            <button className="btn btn-primary btn-circle-lg" onClick={submitBulkImportForm}>{type == 'image-upload'?"Bulk Image/Document Upload":`Bulk ${deslugifyTransform(type)}`}</button>
                                        </div>
                                    </div>
                                    {responseData?.data?.errorFile&&(
                                     <div className="col-md-2 col-lg-2 col-sm-6 mt-0">
                                        <div className="form-group">
                                            <button className="btn btn-primary btn-circle-lg" onClick={downloadBase64File}>Download Errors</button>
                                        </div>
                                    </div>
                                        )}
                                    {/* <div className="col-4 col-md-3 col-lg-3 mt-0">
                                        <div className="form-group">
                                            <button className="btn btn-primary btn-circle-lg" onClick={DownloadErrorsSheet}>Download Errors</button>
                                        </div>
                                    </div> 
                                </div> */}
                                <div className="row align-items-center">
      <div className="col-md-10 col-lg-10 col-sm-12">
        {!uploadFile ? (
          <div
            className={`drop-zone ${dragActive ? "active" : ""}`}
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
            onDrop={onDrop}
            onClick={() => inputRef.current.click()}
          >
            <p className="m-0 text-center">
              <strong>Drag & Drop</strong> your file here
              <br />
              or <span className="text-primary">Click to Browse</span>
            </p>
            <input
              type="file"
              ref={inputRef}
              className="file-input"
              onChange={handleFileSelect}
              accept={type === 'Bulk Assignment' ? ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : ".xlsx,.zip,application/zip,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
            />
          </div>
        ) : (
          <div className="file-preview d-flex justify-content-between align-items-center px-3 py-2">
            <span className="file-name">{uploadFile.name}</span>
            <div>
              {/* <button className="btn btn-sm btn-outline-danger" onClick={removeFile}>
              <i class="bi bi-x"></i>
              </button> */}
               <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={removeFile}>
                                                <span aria-hidden="true">&times;</span>
                                            </button>
            </div>
          </div>
        )}

        <small className="text-muted d-block mt-1">
          {type === 'Bulk Assignment' || type === 'Admin Bulk Update' ? 'Accepted: Excel (.xlsx)' : 'Accepted: ZIP / Excel'}
        </small>
      </div>

      {responseData?.data?.errorFile && responseData?.data?.errorCount > 0 && (
        <div className="col-md-2 col-lg-2 col-sm-12 mb-3">
          <button className="btn btn-primary w-100" onClick={downloadBase64File}>
            Download Errors
          </button>
        </div>
      )}
    </div>
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
                    </div>
            </div>
            </Modal.Body>
            </Modal>
        </>
    )
}

export default BulkDataUpload

// <!DOCTYPE html>

// <html lang="en">

// <head>

// <meta charset="UTF-8">

// <title>Property Valuation Report</title>

// <style>

//   table {

//     table-layout: fixed;

//     width: 100%;

//   }

//   table td {

//     word-wrap: break-word;

//     overflow-wrap: break-word;

//     white-space: normal;

//   }

// </style>

// </head>

// <body style="font-family: Arial, sans-serif; font-size: 10px; color: #333; line-height: 1.4;">

// <h1 style="text-align: center; font-size: 18px; color: #0056b3; margin-bottom: 10px;">PROPERTY VALUATION REPORT</h1>

// <div style="font-size: 13px; font-weight: bold; color: #0056b3; border-bottom: 2px solid #0056b3; margin-top: 18px; margin-bottom: 5px; padding-bottom: 4px;">SECTION 1: Basic Details</div>

// <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: fixed;">

//     <tr style="background-color: #f0f8ff;"> <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word; width:33%;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Valuer Report Serial / Reference No.</span> <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{ReferenceNo}}</span> </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word; width:33%;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Prospect No.</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{prospectNo}}</span>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word; width:33%;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Customer Name</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{customerName}}</span>

//         </td>

//     </tr>

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Date of Report Submission</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{dateOfReportSubmission}}</span>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Date of Site Visit</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{dateOfSiteVisit}}</span>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Vendor Code</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{vendorCode}}</span>

//         </td>

//     </tr>

//     <tr style="background-color: #f0f8ff;"> <td colspan="3" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Vendor Name</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{vendorName}}</span>

//         </td>

//     </tr>

// </table>

// <div style="font-size: 13px; font-weight: bold; color: #0056b3; border-bottom: 2px solid #0056b3; margin-top: 18px; margin-bottom: 5px; padding-bottom: 4px;">SECTION 2: Property Details</div>

// <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: fixed;">

//     <!-- Row 1: 2 columns -> full width using colspan=2 -->

//     <tr style="background-color: #f0f8ff;">

//         <td colspan="2" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Legal Address</div>

//             <div style="font-style: italic;">{{legalAddress}}</div>

//         </td>

//         <td colspan="1" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Address on Site</div>

//             <div style="font-style: italic;">{{address}}</div>

//         </td>

//     </tr>

//     <!-- Row 2: 3 columns normal -->

//     <tr>

//         <td colspan="1" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">City</div>

//             <div style="font-style: italic;">{{city}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">State</div>

//             <div style="font-style: italic;">{{state}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Pincode</div>

//             <div style="font-style: italic;">{{pincode}}</div>

//         </td>

//     </tr>

//     <!-- Row 3: 3 columns normal -->

//     <tr style="background-color: #f0f8ff;">

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Nearby Landmark</div>

//             <div style="font-style: italic;">{{nearbyLandmark}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Latitude</div>

//             <div style="font-style: italic;">{{latitude}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Longitude</div>

//             <div style="font-style: italic;">{{longitude}}</div>

//         </td>

//     </tr>

//     <!-- Row 4: 3 columns normal -->

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Property Type</div>

//             <div style="font-style: italic;">{{propertyType}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Accommodation / Configuration</div>

//             <div style="font-style: italic;">{{accommodationConfiguration}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Type of Structure</div>

//             <div style="font-style: italic;">{{typeOfStructure}}</div>

//         </td>

//     </tr>

//     <!-- Row 5: 3 columns normal -->

//     <tr style="background-color: #f0f8ff;">

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Property Usage at site</div>

//             <div style="font-style: italic;">{{propertyUsageAtSite}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Occupancy</div>

//             <div style="font-style: italic;">{{occupancy}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Age of Property</div>

//             <div style="font-style: italic;">{{ageOfProperty}}</div>

//         </td>

//     </tr>

//     <!-- Row 6: 3 columns normal -->

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Property Completion Status</div>

//             <div style="font-style: italic;">{{propertyCompletionStatus}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Stage of construction (%)</div>

//             <div style="font-style: italic;">{{stageOfConstructionIn}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Marketability</div>

//             <div style="font-style: italic;">{{marketability}}</div>

//         </td>

//     </tr>

//     <!-- Row 7: 3 columns normal -->

//     <tr style="background-color: #f0f8ff;">

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Number of floors in the building</div>

//             <div style="font-style: italic;">{{noOfFloors}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Property Located on Floor*</div>

//             <div style="font-style: italic;">{{propertyLocatedOnFloor}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Front Side Road Width (Feet)</div>

//             <div style="font-style: italic;">{{frontSideRoadWidthInFeet}}</div>

//         </td>

//     </tr>

//     <!-- Row 8: 3 columns normal -->

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Property Demarcated at site</div>

//             <div style="font-style: italic;">{{plotDemarcatedAtSite}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Property Identifiable at site</div>

//             <div style="font-style: italic;">{{propertyIdentifiableAtSite}}</div>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Reason For Identification</div>

//             <div style="font-style: italic;">{{reasonIdentification}}</div>

//         </td>

//     </tr>

//     <!-- Row 9: 2 columns -> full width using colspan -->

//     <tr style="background-color: #f0f8ff;">

//         <td colspan="2" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Valuer verified property via online govt website?</div>

//             <div style="font-style: italic;">{{hasTheValuerVerifiedThePropertyBasedOnOnlineGovtWebsite}}</div>

//         </td>

//         <td colspan="1" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Clarification for Yes/No</div>

//             <div style="font-style: italic;">{{clarificationForYesNo}}</div>

//         </td>

//     </tr>

//     <!-- Row 10: 2 columns -> full width using colspan -->

//     <tr>

//         <td colspan="2" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">Actual & Online Address Match</div>

//             <div style="font-style: italic;">{{actualOnlineAddressMatch}}</div>

//         </td>

//         <td colspan="1" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; display: block;">If No, mention corrected address</div>

//             <div style="font-style: italic;">{{ifNoMentionTheCorrectAddressOfProperty}}</div>

//         </td>

//     </tr>

// </table>

// <div style="font-size: 13px; font-weight: bold; color: #0056b3; border-bottom: 2px solid #0056b3; margin-top: 18px; margin-bottom: 5px; padding-bottom: 4px;">SECTION 3: Boundaries (as per actual)</div>

// <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: fixed;">

//     <tr style="background-color: #f0f8ff;"> <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">North</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{north}}</span>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">West</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{west}}</span>

//         </td>

//     </tr>

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">East</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{east}}</span>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">South</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{south}}</span>

//         </td>

//     </tr>

// </table>

// <div style="font-size: 13px; font-weight: bold; color: #0056b3; border-bottom: 2px solid #0056b3; margin-top: 18px; margin-bottom: 5px; padding-bottom: 4px;">SECTION 4: Valuation Calculation</div>

// <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: fixed;">

//     <tr style="background-color: #d1e5ff;"> <td colspan="3" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #0056b3; font-size: 10px; margin-bottom: 3px; display: block;">Sub-section 1: Fair Market Value</span>

//         </td>

//     </tr>

//     <tr>

//         <td colspan="3" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Area Type</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{areaType}}</span>

//         </td>

//     </tr>

//     <tr style="background-color: #f0f8ff;"> <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Land Area (Sqft)</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{landarea}}</span></td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Land Rate (Sqft)</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{landrate}}</span></td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Land Value (Rs)</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{landvalue}}</span></td>

//     </tr>

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Built-up Area (Sqft)</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{builtuparea}}</span></td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Built-up Rate</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{builtuprate}}</span></td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Built-up Value (Rs)</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{builtupvalue}}</span></td>

//     </tr>

//     <tr style="background-color: #f0f8ff;"> <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Carpet Area</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{CarpetArea}}</span></td>

//         <td colspan="2" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Carpet Rate</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{CarpetAreaRate}}</span></td>

//     </tr>

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Built-Up Area</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{builtupArea}}</span></td>

//         <td colspan="2" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Built-Up Rate</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{builtupAreaRate}}</span></td>

//     </tr>

//     <tr style="background-color: #f0f8ff;"> <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Super Built-Up Area</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{SuperBuiltupArea}}</span></td>

//         <td colspan="2" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Super Built-Up Rate</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{SuperBuiltupRate}}</span></td>

//     </tr>

//     <tr>

//         <td colspan="3" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word; background-color: #fffacd; text-align: center; font-size: 12px; font-weight: bold;"> <span style="font-weight: bold; color: #cc5500; font-size: 10px; margin-bottom: 3px; display: block;">TOTAL FAIR MARKET VALUE (Rs)</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{totalValueRs}}</span>

//         </td>

//     </tr>

//     <tr style="background-color: #d1e5ff;"> <td colspan="3" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #0056b3; font-size: 10px; margin-bottom: 3px; display: block;">Sub-section 2: Realisable Value</span>

//         </td>

//     </tr>

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Percentage</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{percentageOfMarketValue}}</span></td>

//         <td colspan="2" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Realisable Value (Rs)</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{realisableValue}}</span></td>

//     </tr>

//     <tr style="background-color: #d1e5ff;"> <td colspan="3" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #0056b3; font-size: 10px; margin-bottom: 3px; display: block;">Sub-section 3: Distress Value</span>

//         </td>

//     </tr>

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Percentage</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{pctMarketValueDistress}}</span></td>

//         <td colspan="2" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Distress Value (Rs)</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{distressValue}}</span></td>

//     </tr>

//     <tr style="background-color: #d1e5ff;"> <td colspan="3" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #0056b3; font-size: 10px; margin-bottom: 3px; display: block;">Sub-section 4: Govt. Value</span>

//         </td>

//     </tr>

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Govt. Guideline Rate</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{govtrate}}</span></td>

//         <td colspan="2" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;"><span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Govt. Guideline Value</span><span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{govtValue}}</span></td>

//     </tr>

// </table>

// <div style="font-size: 13px; font-weight: bold; color: #0056b3; border-bottom: 2px solid #0056b3; margin-top: 18px; margin-bottom: 5px; padding-bottom: 4px;">SECTION 5: Remarks on Property and its Value</div>

// <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: fixed;">

//     <tr style="background-color: #f0f8ff;"> <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word; background-color: #ffffe0; min-height: 80px;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Remarks on Property and its Value</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{remarksOnPropertyAndItsValue}}</span>

//         </td>

//     </tr>

// </table>

// <div style="font-size: 13px; font-weight: bold; color: #0056b3; border-bottom: 2px solid #0056b3; margin-top: 18px; margin-bottom: 5px; padding-bottom: 4px;">SECTION 6: Details of Approved Valuer</div>

// <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: fixed;">

//     <tr style="background-color: #f0f8ff;"> <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Approver Valuer Under</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{approvedValuerUnder}}</span>

//         </td>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Others (Please Specify)</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{approvedValueothers}}</span>

//         </td>

//     </tr>

//     <tr>

//         <td colspan="2" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word;>

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Approved Valuer Registration number </span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #444;">{{approvedValuerRegistrationNumber}}</span>

//         </td>

//     </tr

//     <tr>

//         <td colspan="2" style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word; min-height:50px; max-height:200px; text-align:center; background:#f7f7f7;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;"> Approved Valuer Sign / Stamp</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #777;">[Image: {{approvedValuerSignStamp}}</span>

//         </td>

//     </tr>

// </table>

// <div style="font-size: 13px; font-weight: bold; color: #0056b3; border-bottom: 2px solid #0056b3; margin-top: 18px; margin-bottom: 5px; padding-bottom: 4px;">SECTION 7: Property Pictures</div>

// <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: fixed;">

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word; min-height:50px; max-height:200px; text-align:center; background:#f7f7f7;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Property Picture (Front / Road / Boundaries)</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #777;">[Image: {{propertyPictureFrontRoadSideBoundariesEtc}}]</span>

//         </td>

//     </tr>

// </table>

// <div style="font-size: 13px; font-weight: bold; color: #0056b3; border-bottom: 2px solid #0056b3; margin-top: 18px; margin-bottom: 5px; padding-bottom: 4px;">SECTION 8: Location Map</div>

// <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: fixed;">

//     <tr>

//         <td style="border: 1px solid #999; padding: 6px; vertical-align: top; word-wrap: break-word; min-height:50px; max-height:200px; text-align:center; background:#f7f7f7;">

//             <span style="font-weight: bold; color: #333; font-size: 10px; margin-bottom: 3px; display: block;">Location Map</span>

//             <span style="font-style: italic; min-height: 12px; display: block; color: #777;">[Image: {{locationMap}}]</span>

//         </td>

//     </tr>

// </table>

// </body>

// </html>

 