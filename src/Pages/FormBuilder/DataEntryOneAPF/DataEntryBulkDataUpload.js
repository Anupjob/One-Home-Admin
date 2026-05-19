import React, { useEffect, useState, useRef } from 'react'
import swal from "sweetalert";
import postApiCall from "../../../Services/postApiCall";
import axios from 'axios';
import useGetRoleModule from '../../../Services/useGetRoleModule';
import { deslugifyTransform } from '../../../Utils/Helpers';
import Constant from '../../../Components/Constant';
import Modal from 'react-bootstrap/Modal';
import CustomButton from '../../../Utils/CustomButton';
import loginUser from '../../../Services/loginUser';

const DataEntryBulkDataUpload = ({
  formId,
  visible,
  setVisible,
  dataEntryId,
  projectName,
  getLists,
  activeTab,
  buildingId,
  wingId,
  idFromURL,
  type
}) => {
  let { accessToken } = loginUser();
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


  async function handleDownloadTemplate() {
    let apiUrl = Constant.apiBasePath + `admin/submit/form/template/${formId} `;
    try {
      const response = await axios({
        url: apiUrl,
        method: 'GET',
        responseType: 'blob',
        headers: {
          authkey: accessToken
        }
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + ' Template';
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }

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
    console.log('file::::::', file)
    const fileName = file?.name?.toLowerCase() || '';
    if (fileName.endsWith('.xlsx')) {
      submitBulkImportForm(file);
      setUploadFile(file);
    } else {
      let message = "Only .xlsx files are allowed !";
      swal({ text: message, icon: "error", dangerMode: true });
    }


  }


  console.log(uploadFile);

  const submitBulkImportForm = (uploadFile) => {
    // e.preventDefault();

    const formData = new FormData();
    let url = `admin/submit/form/upload-template/${formId}?dataEntryId=${idFromURL}&buildingId=${buildingId}&wingId=${wingId}`
    formData.append("file", uploadFile);

    postApiCall(url, formData).then((response) => {
      if (response.meta.status) {
        setResponseData(response)
        if (response.rowErrors?.length == 0 || response.data?.errorCount == 0) {
          swal({ text: response?.meta?.msg, icon: "success", timer: 1500 })
          // setVisible(false)
        } else {
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
    let Role = await useGetRoleModule('Data Entry');
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
    const base64 = responseData.data.errorFile
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

  const handleClose = () => {
    setVisible(false)
    removeFile()
    setUploadErrors([])
    setResponseData()
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
            <Modal.Title>{type}</Modal.Title>
          </div>

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
                <div className='d-flex justify-content-end'>
                  {responseData?.data?.errorFile && (
                    <CustomButton label='Download Errors' icon={'bi-download'} appendClass='text-white' onClick={downloadBase64File} />
                  )}
                  <CustomButton label='Download Template' icon={'bi-download'} appendClass='text-white mx-2' onClick={handleDownloadTemplate} />
                </div>
                <form>
                  <div className="d-sm-flex align-items-center justify-content-between mb-4 mt-2">
                  </div>
                  <div className="row align-items-center">
                    <div className="col-md-12 col-lg-12 col-sm-12">
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
                            accept={".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
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
                        {'Accepted: Excel (.xlsx)'}
                      </small>
                    </div>

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

export default DataEntryBulkDataUpload

