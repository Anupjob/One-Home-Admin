import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import postApiCall from "../../Services/postApiCall";
import {FilePond, registerPlugin} from "react-filepond";
import Constant from "../../Components/Constant";
import swal from "sweetalert";
import loginUser from "../../Services/loginUser";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

export default function RefundModal(props) {
    let {bidData, callback} = props;
    const [show, setShow] = useState(false);

    const [refundParticular, setrefundParticular] = useState("");
    const [refundTransactionId, setrefundTransactionId] = useState("");
    const [refundAmount, setrefundAmount] = useState("");
    const [files, setFiles] = useState("");
    const [toDt, setToDt] = useState("");
    const [payment, setPayment] = useState([]);
    let {accessToken} = loginUser();


// Register the plugins
    registerPlugin(FilePondPluginImagePreview)
    registerPlugin(FilePondPluginFileValidateType);
    registerPlugin(FilePondPluginFileValidateSize);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    function submitRefund() {
        if (refundParticular === "") {
            alert("Please Enter Particular");
            return;
        }
        if (toDt === "") {
            alert("Please Select Date");
            return;
        }
        if (refundTransactionId === "") {
            alert("Please Enter Transaction ID");
            return;
        }
        // if (refundAmount === "") {
        //     alert("Please Enter Amount");
        //     return;
        // }
        // if (files === "") {
        //     alert("Please Upload Screenshot");
        //     return;
        // }

        const data = {
            "orderId": bidData.order._id,
            "refundParticular": refundParticular,
            "refundDate": toDt,
            "refundTransactionId": refundTransactionId,
            "refundAmount": bidData.order?.amount,
            "refundImage": files
        }

        postApiCall("user/transaction/refund", data).then((res) => {
            console.log(res);
            if (res.meta.status) {
                alert("Refund Submitted Successfully");
                callback();
                handleClose();
            }
        }).catch((err) => {
            console.log(err);
        })


    }


    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Refund
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>Refund of Property - {bidData.property.propertyId}</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <div className="row">
                        <div className="col-sm-6">
                            <div className="form-group">
                                <input type="text" name=" " className="form-control"
                                       placeholder="Particular" value={refundParticular}
                                       onChange={(e) => setrefundParticular(e.target.value)}/>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="form-group">
                                <input type="date" name=" " className="form-control "
                                       placeholder="Select Date" value={toDt}
                                       onChange={(e) => setToDt(e.target.value)}/>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="form-group">
                                <input type="text" name=" " className="form-control"
                                       placeholder="Enter Transaction ID"
                                       value={refundTransactionId}
                                       onChange={(e) => setrefundTransactionId(e.target.value)}/>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="form-group">
                                <input type="text" className="form-control"
                                       placeholder="Enter Amount" value={bidData.order?.amount}
                                       readOnly={true}
                                       onChange={(e) => setrefundAmount(e.target.value)}/>
                            </div>
                        </div>


                        <div className="col-12">
                            <FilePond
                                maxFileSize="50MB"
                                allowFileTypeValidation={true}
                                acceptedFileTypes={['image/*']}
                                imagePreviewMaxHeight={100}
                                credits={false}
                                allowMultiple={true}
                                allowRevert={false}
                                name="image"
                                labelIdle='Drag & Drop your files(Supported file formats: JPG, JPEG, PNG) or <span class="filepond--label-action">Browse</span>'
                                server={{
                                    url: Constant.apiBasePath + 'common/upload/blob/admin/image',
                                    process: {
                                        headers: {
                                            authkey: accessToken
                                        },
                                        onload: (res) => {
                                            let data = JSON.parse(res);
                                            if (data.meta.status) {
                                                setFiles(data.data)
                                            } else {
                                                swal("use jpg and png file only");
                                            }
                                        }

                                    }
                                }}
                            />
                        </div>
                    </div>


                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={submitRefund}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
