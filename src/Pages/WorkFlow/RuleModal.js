import React, { useRef, useState, useEffect, memo } from "react";
import Modal from 'react-bootstrap/Modal';
import { Form } from 'react-formio';
import loginUser from "../../Services/loginUser";
import Constant from "../../Components/Constant";
import getApiCall from "../../Services/getApiCall";
import Button from 'react-bootstrap/Button';
import 'formiojs/dist/formio.full.min.css';
import { QueryBuilder, Field, RuleGroupType, formatQuery } from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";
import CreatableSelect from "react-select/creatable";
const assignData = ['dataCreationAssigneId','dataApprovalAssigneId']
const hierarchyOrder = ["h0", "h1", "h2", "h3", "h4", "h5"];
const assignTypeOption=["Single", "Multi"]
const RuleModal = ({
    open,
    setOpen,
    moduleId,
    nodeId,
    rules,
    setRules,
    nodes=[]
}) => {
    const rectOptions = nodes
  .filter(node => node.type === "rect")
  .map(node => ({
    label: node.data.label,     // visible text
    value: node.data.formId,    // stored value
  }));
    console.log('data in rule modal::::', rectOptions.filter((item)=>item.value === nodeId)[0], nodeId)
    let { accessToken } = loginUser();
    const formRef = useRef();
    const [formSchema, setFormSchema] = useState({
        display: "form",
        components: []
    });
    const [fields, setFields] = useState([])
    // hierarchyOptions will be objects { label, value }
    const [hierarchyOptions, setHierarchyOptions] = useState(
        hierarchyOrder.map((h) => ({ label: h.toUpperCase(), value: h }))
    )
    const [creatorOptions, setCreatorOptions] = useState([])
     const [approverOptions, setApproveOptions] = useState([])
     const [selectedtype, setSelectedType] = useState('creatorFormId')

    //   const mongoQuery = formatQuery(rules, "mongodb"); // Converts query to MongoDB format
    useEffect(() => {
        getFormDataById()
        getDynamicFieldById(nodeId)
    }, [moduleId]);
    const getFormDataById = () => {
        getApiCall(`admin/dynamic/form/details/${moduleId}`)
            .then((response) => {
                if (response.meta.status) {
                    setFormSchema({
                        display: "form",
                        components: [...response.data.moduleFormData]
                    });
                }
            })
            .catch((error) => {
                console.error("Error loading form schema:", error);
            });
    };
    const getDynamicFieldById = (nodeId) => {
        getApiCall(`admin/dynamic/form/keys/${nodeId}`)
            .then((response) => {
                    if (response.meta.status) {
                    const keys = response.data.keys || [];
                    if (fields?.length == 0) {
                        setFields(keys);
                    }

                    // build options: H0..H5 as labels with values h0..h5, then previous form keys
                    const baseOptions = hierarchyOrder.map((h) => ({ label: h.toUpperCase(), value: h }));
                    const prevOptions = keys.map((k) => ({ label: k, value: k }));
                    const combined = [...baseOptions, ...prevOptions];

                    setHierarchyOptions(combined);

                    // update creator/approver selects to include both hierarchy + previous form keys
                    setCreatorOptions(combined);
                    setApproveOptions(combined);
                }
            })
            .catch((error) => {
                console.error("Error loading form schema:", error);
            });
    };
    const handleClose = (value) => {
        if (value == "save") {
            //             const formio = formRef.current.formio;
            //   const submissionData = formio.submission?.data || {};
            //   console.log('permissionObject:::::', submissionData)


            // setRules(rules)
        }
        else{
            
        }
        setOpen(false)
    }

    const handleQueryChange = (query) => {
        console.log('query:::::', query)
        setRules((prev) => ({ ...prev, ...query, mongoQuery: formatQuery(query, "mongodb") }));
    };

    // Store only values from multi-select
    const handleSelectFields = (selectedOptions) => {
        const selectedValues = selectedOptions
            ? selectedOptions.map((opt) => opt.value)
            : [];
        setRules((prev) => ({ ...prev, selectedFields: selectedValues }));
    };

    const handleHieracy = (level, option) => {
        const value = option ? option.value : null;
        setRules((prev) => ({
            ...prev,
            hierarchyData: { ...rules.hierarchyData, [level]: value }
        }));
    };

    const handleSelectChange = (selectedOption, name) => {
        if(name=="creatorFormId" || name=="approverFormId"){
            getDynamicFieldById(selectedOption?.value)
            setSelectedType(name)
        }
        
        setRules((prev) => ({ ...prev, userAssignment: {...rules.userAssignment, [name]: selectedOption?.value || ''} }));
    };

    console.log('rules in modal::::', rules);


    const mongoQuery = formatQuery(rules, "mongodb");
    return (
        <Modal
            backdrop="static"
            role="alertdialog"
            show={open}
            onHide={handleClose}
            size="xl"
            keyboard={false}
            dialogClassName="modal-top-right"
        >
            <Modal.Header className="align-items-center">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Modal.Title>Rule Setting</Modal.Title>
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

                    {/* 🔹 Hierarchy Configuration Card */}
                    <div className="card shadow-sm border-0 mb-4 my-4">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Hierarchy Configuration</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {hierarchyOrder.map((hier) => (
                                    <div key={hier} className="col-12 col-xs-4 col-md-4 col-lg-4 mb-3">
                                        <label className="fw-semibold">{hier.toUpperCase()}</label>
                                        <CreatableSelect
                                            name={hier}
                                            isClearable
                                            placeholder={`Select or create ${hier.toUpperCase()}`}
                                            value={
                                                (() => {
                                                    const v = rules?.hierarchyData?.[hier];
                                                    if (!v) return null;
                                                    const found = hierarchyOptions.find((o) => o.value === v);
                                                    return found || { label: v, value: v };
                                                })()
                                            }
                                            onChange={(option) => handleHieracy(hier, option)}
                                            options={hierarchyOptions}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
<div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">User Assignment</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-sm-12 col-xs-12 col-md-4 col-lg-4 mb-3">
                                    <label className="fw-semibold">Select Creator FormId *</label>
                                    <CreatableSelect
                                        name="creatorFormId"
                                        isClearable
                                        placeholder="Type to search or create..."
                                        value={rules?.userAssignment?.creatorFormId ? rectOptions.filter((item)=>item.value === rules.userAssignment.creatorFormId).length>0 ? rectOptions.filter((item)=>item.value === rules.userAssignment.creatorFormId)[0] : '' : ''}
                                        onChange={(selectedOptions) => handleSelectChange(selectedOptions, "creatorFormId")}
                                        options={rectOptions}
                                    />
                                </div>
                                <div className="col-sm-12 col-xs-12 col-md-4 col-lg-4 mb-3">
                                    <label className="fw-semibold">Select Creator User *</label>
                                    <CreatableSelect
                                        name="creatorUserKey"
                                        isClearable
                                        placeholder="Type to search or create..."
                                        value={{
                                            label: rules?.userAssignment?.creatorUserKey,
                                            value: rules?.userAssignment?.creatorUserKey,
                                        } || ''}
                                        onChange={(selectedOptions) => handleSelectChange(selectedOptions, "creatorUserKey")}
                                        options={[...assignData.map(a=>({label:a,value:a})), ...creatorOptions]}
                                    />
                                </div>
                                 <div className="col-sm-12 col-xs-12 col-md-4 col-lg-4 mb-3">
                                    <label className="fw-semibold">Select Creator User  Type *</label>
                                    <CreatableSelect
                                        name="creatorAssignmentType"
                                        isClearable
                                        placeholder="Type to search or create..."
                                        value={{
                                            label: rules?.userAssignment?.creatorAssignmentType,
                                            value: rules?.userAssignment?.creatorAssignmentType,
                                        } || ''}
                                        onChange={(selectedOptions) => handleSelectChange(selectedOptions, "creatorAssignmentType")}
                                        options={assignTypeOption.map(a=>({label:a,value:a}))}
                                    />
                                </div>
                                <div className="col-sm-12 col-xs-12 col-md-4 col-lg-4 mb-3">
                                    <label className="fw-semibold">Select Approval FormId *</label>
                                    <CreatableSelect
                                        name="approverFormId"
                                        isClearable
                                        placeholder="Type to search or create..."
                                        value={rules?.userAssignment?.approverFormId ? rectOptions.filter((item)=>item.value === rules.userAssignment.approverFormId).length>0 ? (rectOptions.filter((item)=>item.value === rules.userAssignment.approverFormId)[0]) : '' : ''}
                                        onChange={(selectedOptions) => handleSelectChange(selectedOptions, "approverFormId")}
                                        options={rectOptions}
                                    />
                                </div>
                                <div className="col-sm-12 col-xs-12 col-md-4 col-lg-4 mb-3">
                                    <label className="fw-semibold">Select Approval User *</label>
                                    <CreatableSelect
                                        name="approverUserKey"
                                        isClearable
                                        placeholder="Type to search or create..."
                                        value={{
                                            label: rules?.userAssignment?.approverUserKey,
                                            value: rules?.userAssignment?.approverUserKey,
                                        } || ''}
                                        onChange={(selectedOptions) => handleSelectChange(selectedOptions, "approverUserKey")}
                                        options={[...assignData.map(a => ({ label: a, value: a })), ...approverOptions, ...(nodeId === '69ccb63d6229ecfe1284b6ca'
                                            ? [{ label: 'forumId', value: 'forumId' }]
                                            : [])]}
                                    />
                                </div>
                                 <div className="col-sm-12 col-xs-12 col-md-4 col-lg-4 mb-3">
                                    <label className="fw-semibold">Select Approval User  Type *</label>
                                    <CreatableSelect
                                        name="approverAssignmentType"
                                        isClearable
                                        placeholder="Type to search or create..."
                                        value={{
                                            label: rules?.userAssignment?.approverAssignmentType,
                                            value: rules?.userAssignment?.approverAssignmentType,
                                        } || ''}
                                        onChange={(selectedOptions) => handleSelectChange(selectedOptions, "approverAssignmentType")}
                                        options={assignTypeOption.map(a=>({label:a,value:a}))}
                                    />
                                </div>
                                
                            </div>
                        </div>
                    </div>
                    {/* 🔹 Select Field Card */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Select Transfer Field</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-sm-12 col-xs-12 col-md-12 col-lg-12 mb-3">
                                    <label className="fw-semibold">Select Field *</label>
                                    <CreatableSelect
                                        name="prospectNo"
                                        isClearable
                                        placeholder="Type to search or create..."
                                        value={rules?.selectedFields?.map((v) => ({
                                            label: v,
                                            value: v,
                                        }))}
                                        onChange={handleSelectFields}
                                        options={[...fields,'projectDocuments',...(nodeId == '69ccb63d6229ecfe1284b6ca' ? ['forumId'] : [])].map((item) => ({
                                            label: item,
                                            value: item,
                                        }))}
                                        isMulti
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Query Builder Card */}
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Query Builder</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-12">
                                    <QueryBuilder
                                        fields={fields}
                                        query={rules}
                                        onQueryChange={handleQueryChange}
                                    />
                                    <h5 className="mt-3 fw-semibold">MongoDB Query:</h5>
                                    <pre className="bg-light p-2 rounded border">
                                        {JSON.stringify(mongoQuery, null, 2)}
                                    </pre>
                                </div>
                            </div>
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
    )
}
export default memo(RuleModal);
