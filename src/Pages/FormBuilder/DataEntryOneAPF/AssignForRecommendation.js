import React, { useState, useRef } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Form } from 'react-formio';
import CustomButton from '../../../Utils/CustomButton';

const AssignForRecommendation = ({
    open,
    setOpen,
    accessToken,
    apiBasePath,
    projectName,
    handleSubmit,
    formRef,
    formSchema

}) => {

  const [responseData, setResponseData] = useState({});
  // Close modal
  const handleClose = () => setOpen(false);
  return (
      <Modal size='lg' show={open} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Recommendation</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <div className="container-fluid">
          <Form
                ref={formRef}
                submission={{ data: { ...responseData?.formFields, accessToken, apiBasePath: apiBasePath, projectName: projectName || '' } }}
                form={formSchema}
              />
    </div>
        </Modal.Body>
        <Modal.Footer>
            <CustomButton label={'Submit'} appendClass='text-white' onClick={()=>handleSubmit('recommendation')}/>
        </Modal.Footer>
      </Modal>
  );
};

export default AssignForRecommendation;