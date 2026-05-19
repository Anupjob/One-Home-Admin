import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { Form } from 'react-formio';
import getApiCall from "../../Services/getApiCall";
import { useParams } from "react-router";
import "./WorkflowFormTabs.css"; // custom CSS
import CustomButton from "../../Utils/CustomButton";
import Modal from 'react-bootstrap/Modal';
import CreatableSelect from "react-select/creatable";
import Button from 'react-bootstrap/Button';
import 'formiojs/dist/formio.full.min.css';
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";

const WorkflowFormTabs = () => {
  const { wofId } = useParams();
  const [workflowData, setWorkflowData] = useState({});
  const [key, setKey] = useState('');
  const [open, setOpen] = useState(false);
  const [assignUser, setAssignUser] = useState('')
  const [userList, setUserList] = useState([])
  const [formSchema, setFormSchema] = useState({
    display: "form",
    components: []
  });

  const getWorkFlowDataById = () => {
    getApiCall(`admin/workflow/details/${wofId}`)
      .then((response) => {
        if (response.meta.status) {
          setWorkflowData(response.data);
          const firstForm = response.data.formConnections[0];
          setKey(firstForm?.formName);
          if (firstForm?.formId) {
            getFormDataById(firstForm.formId)
            geAssignUserList(firstForm.formId)
          };
        }
      })
      .catch((error) => console.error("Error loading workflow data:", error));
  };
    const geAssignUserList = (formId) => {
    getApiCall(`admin/submit/form/get-eligible-users?formId=${formId}&type=approve`)
      .then((response) => {
        if (response.meta.status) {
          setUserList(response.data)
        }
      })
      .catch((error) => console.error("Error loading workflow data:", error));
  };

  const getFormDataById = (formId) => {
    if (!formId) return;
    getApiCall(`admin/dynamic/form/details/${formId}`)
      .then((response) => {
        if (response.meta.status) {
          setFormSchema({
            display: "form",
            components: [...response.data.moduleFormData]
          });
        }
      })
      .catch((error) => console.error("Error loading form schema:", error));
  };

  useEffect(() => {
    getWorkFlowDataById();
  }, []);

  const handleTabSelect = (formName, formId) => {
    setKey(formName);
    getFormDataById(formId);
  };

  const handleSubmit=()=>{
setOpen(true)
  }
  const handleClose = () => {
        setOpen(false)
    }

     const handleChange = (value) => {
       setAssignUser(value)
    };
  return (
    <div className="workflow-tabs-container">
      <div className="main-title">
      <FilterWithButtonsCard title="One APF" />
      </div>
        {/* 
          <h5 className="form-title">{workflowData?.formConnections[0].formName}</h5>
              <Form form={formSchema} /> */}
              <div className="card shadow-sm border-0">
  {/* 🔹 Card Header */}
  <div className="card-header bg-light">
    <h5 className="form-title mb-4">
      {workflowData?.formConnections?.[0]?.formName || "Form Title"}
    </h5>
  </div>

  {/* 🔹 Card Body */}
  <div className="card-body">

    {/* Form Section */}
    <Form form={formSchema} />
  </div>

  {/* 🔹 Card Footer */}
  <div className="card-footer bg-light text-center">
     
   <CustomButton
              label="Approve"
              icon="bi-check-lg"
              appendClass='btn btn-success mx-2'
              onClick={handleSubmit}
            />
            <CustomButton
              label="Reject"
              icon="bi-x-lg"
              appendClass='btn btn-danger mx-2'
              onClick={handleSubmit}
            />
            <CustomButton
              label="Submit"
              icon="bi-floppy"
              appendClass='mx-2'
              onClick={handleSubmit}
            />
  </div>
</div>

            {/* </div> */}
      {/* <Tabs
        activeKey={key}
        onSelect={(k) => {
          const selectedModule = workflowData.formConnections.find(m => m.formName === k);
          if (selectedModule) handleTabSelect(k, selectedModule.formId);
        }}
        className="mb-3 workflow-tabs"
      >
        {workflowData?.formConnections?.map((module) => (
          <Tab eventKey={module.formName} title={module.formName} key={module.nodeId}>
            <div className="tab-content-wrapper">
              <h5 className="form-title">{module.formName}</h5>
              <Form form={formSchema} />
            </div>
          </Tab>
        ))}
      </Tabs> */}
      <Modal
                backdrop="static"
                role="alertdialog"
                show={open}
                onHide={handleClose}
                size="lg"
                keyboard={false}
                dialogClassName="modal-top-right"
            >
                <Modal.Header className="align-items-center">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Modal.Title>Assignment</Modal.Title>
                    </div>
                    <i
                        className="fa fa-times ms-auto"
                        role="button"
                        onClick={handleClose}
                        style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                    />
                </Modal.Header>

                <Modal.Body>
                    <div className='container-fluid'>
                        <div className="row">
                            <div className="form-group col-md-5">
                                <label>Users List</label>
                                 <CreatableSelect
                                        name="prospectNo"
                                        isClearable
                                        placeholder="Type to search or create..."
                                        value={assignUser}
                                        onChange={handleChange}
                                        // options={userList.map((item) => ({
                                        //     label: item.name,
                                        //     value: item._id,
                                        // }))}
                                        // isMulti
                                    />
                            </div>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={() => handleClose('save')} appearance="primary">
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
    </div>
  );
};

export default WorkflowFormTabs;
