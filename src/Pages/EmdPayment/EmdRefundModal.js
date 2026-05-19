import React, { useState } from "react";
import postApiCall from "../../Services/postApiCall";
import { Modal, Button } from "rsuite";
import RemindIcon from "@rsuite/icons/legacy/Remind";
import Loader from 'rsuite/Loader';

export default function EmdRefundModal(props) {
    let { bidData, callback } = props;
    const [process, setProcess] = useState(false)
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
   
    function submitRefund() {
        setProcess(true)
        postApiCall("admin/refund/" + bidData._id, {}, true)
            .then((res) => {
                //console.log("REFUND INITALTED FOR ID :", bidData._id);
                if (res.meta.status) {
                    alert("Refund Submitted Successfully");
                    callback();
                    handleClose();
                }
            })
            .catch((err) =>  {
                console.log(err)
                setProcess(false)
            });
    }

    return (
        <>
            <Button variant="primary" onClick={handleOpen}>
                Refund
            </Button>

            <Modal
                backdrop="static"
                role="alertdialog"
                open={open}
                onClose={handleClose}
                size="xs"
            >
                {/* {console.log(process)} */}
                {process === false ? <>
                <Modal.Body>
                    <RemindIcon style={{ color: "#ffb300", fontSize: 24 }} /> 
                    <span style={{paddingLeft: 10}}>Are you sure you want to refund?</span>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={submitRefund} appearance="primary">
                        Yes
                    </Button>
                    <Button onClick={handleClose} appearance="subtle">
                        No
                    </Button>
                </Modal.Footer></>
                : <>
                <Modal.Body>
                    <div style={{textAlign : 'center'}}>
                        <div className="">
                            <Loader size="lg" content="" />
                        </div>
                        <div className="text-enter">
                            <p>Please wait.</p>
                            <p>It'll just take a moment</p>
                        </div>
                    </div>
                    
                </Modal.Body>
              </> }
            </Modal>
        </>
    );
}
