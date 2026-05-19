import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import swal from 'sweetalert';
import Layout from "../../Layout";
import {useNavigate} from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import Select from 'react-select';
import {FilePond, registerPlugin} from "react-filepond";
import 'filepond/dist/filepond.min.css'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import Constant from "../../Components/Constant";
import loginUser from "../../Services/loginUser";
// import {TagsInput} from "react-tag-input-component";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

let {accessToken} = loginUser();


// Register the plugins
registerPlugin(FilePondPluginImagePreview)
const PartnerAdd = (props) => {
    let id = (new URLSearchParams(window.location.search)).get("id");
    const history = useNavigate()


    const [image, setImage] = useState();
    const [data, setData] = useState({
        propertyDocument: [],
    });







    const [documentUploadShow, setDocumentUploadShow] = useState(false);
    const [documentName, setDocumentName] = useState('');
    const [documentUrl, setDocumentUrl] = useState('');
    const handleDocumentUploadClose = () => {
        setDocumentUploadShow(false);
        setDocumentName('');
        setDocumentUrl('');
    }
    const handleDocumentUploadShow = () => setDocumentUploadShow(true);
    const handleDocumentAdd = () => {
        //require name and url
        if (documentName === '' || documentUrl === '') {
            //sweet alert
            swal("Please enter document name and  Upload document");
            return;
        }
        setData({
            ...data,
            propertyDocument: [...data.propertyDocument, {
                name: documentName,
                image: documentUrl
            }]
        })
        handleDocumentUploadClose();
    };























    useEffect(() => {
        getEmenity();
    }, []);








    async function getEmenity() {
        if (id) {
            let response = await getApiCall('user/property/getDetailsById/' + id);
            let property = response.data;
            if (response.meta.msg && response.data) {
                setData({
                    propertyDocument: property.propertyDocument,
                })
            }
        }

    }


    const onChange = (e) => {
        if (!Object.keys(data).includes(e.target.name)) return;
        if (e.target.name) {
            setData({
                ...data, [e.target.name]: e.target.value
            })
        }

    }
    const Save = async (form_data) => {
        let returnData = await postApiCall('user/property/createPropertyByAdmin', form_data, true);
        if (returnData.meta.status) {
            swal({text: returnData.meta.msg, icon: "success", timer: 1500})
            // history('/properties')
        }
    }



    function removePreviewImage(index, stateName) {
        setData({...data, [stateName]: data[stateName].filter((item, i) => i !== index)})
    }


    const onSubmit = async (e) => {
        e.preventDefault()

        if (id) {
            data.id = id;
            Save(data);
        } else {
            Save(data);
        }
    }


    return (<>
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">{id ? 'Update' : 'Add New'} Property</h1>
                <Link to={"/properties"}
                      className="d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i
                    className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
            </div>


            <div className="card shadow mb-4">

                <div className="card-body">
                    <form onChange={onChange} onSubmit={onSubmit}>
                        <div className="row">

                            <div className="col-12 my-4">
                                <div className="form-group file-pond-section">
                                    <label htmlFor="exampleFormControlFile1">Property Document</label>
                                    <div className="img-preview">
                                        {data.propertyDocument.map((item, index) => {
                                            console.log('item', item)
                                            return (<div key={index}>
                                                <p>
                                                    <a className={"btn btn-link m-2"} href={item.image}
                                                       target="_blank" rel="noopener noreferrer">{item.name}</a>
                                                    <button type="button" className="btn btn-danger btn-sm"
                                                            onClick={() => {
                                                                removePreviewImage(index, 'propertyDocument')
                                                            }}>X
                                                    </button>
                                                </p>

                                            </div>)
                                        })
                                        }

                                    </div>
                                    <button type="button" className="btn btn-warning btn-sm"
                                            onClick={handleDocumentUploadShow}>Add Document
                                    </button>
                                </div>
                            </div>




                        </div>
                        <div className="form-group mt-1">
                            <button type="submit" className="btn btn-md btn-primary shadow-sm  mr-2"> Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>


        </div>


        <Modal show={documentUploadShow} onHide={handleDocumentUploadClose}>
            <Modal.Header closeButton>
                <Modal.Title>Upload New Document</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <div className="form-group file-pond-section">
                    <label htmlFor="exampleFormControlFile1">Document Name</label>
                    <input type="text" className="form-control form-control-sm" value={documentName} onChange={(e) => {
                        setDocumentName(e.target.value)
                    }
                    }/>
                </div>
                <FilePond
                    imagePreviewMaxHeight={100}
                    credits={false}
                    // allowMultiple={true}
                    // allowRevert={false}
                    name="propertyImage"
                    labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                    onprocessfile={(error, file) => {
                        if(!documentName) setDocumentName(file.filename)
                        // console.log("filenameWithoutExtension", file.filenameWithoutExtension)
                    }}
                    server={{
                        url: Constant.apiBasePath + 'user/property/upload-property-file-by-admin',
                        process: {
                            headers: {
                                authkey: accessToken
                            },
                            onload: (res) => {
                                //get file name

                                res = JSON.parse(res);
                                if (res.meta.status) {
                                    setDocumentUrl(res.data);
                                }
                            },

                        }
                    }}
                /></Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleDocumentUploadClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleDocumentAdd}>
                    Add Document
                </Button>
            </Modal.Footer>
        </Modal>

    </>)
}

export default PartnerAdd
