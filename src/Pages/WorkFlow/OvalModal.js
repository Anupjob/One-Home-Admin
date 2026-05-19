import React, { useRef, useState, useEffect } from "react";
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
const OvalModal = ({
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
    console.log('data in oval modal::::', rectOptions.filter((item)=>item.value === nodeId)[0], moduleId)
    let { accessToken } = loginUser();
    const formRef = useRef();
    const [formSchema, setFormSchema] = useState({
        display: "form",
        components: []
    });
    const [fields, setFields] = useState([])
    const [hierarchyOptions, setHierarchyOptions] = useState(hierarchyOrder)
    const [creatorOptions, setCreatorOptions] = useState([])
     const [approverOptions, setApproveOptions] = useState([])
     const [selectedtype, setSelectedType] = useState('creatorFormId')
    // Form options loaded from workflow API (fallback to empty array)
    const [formOptions, setFormOptions] = useState([]);
    
    // Per-hierarchy form selection: { h0: {label, value, formId}, h1: {...}, ... }
    const [hierarchyProjects, setHierarchyProjects] = useState({});
    
    // Per-hierarchy keys: { h0: [...], h1: [...], ... }
    const [hierarchyKeys, setHierarchyKeys] = useState({});

    // Load forms for the workflow (replace dummy data)
    useEffect(() => {
        const workflowId = '699c13dae07c26a73bf1fb89';
        getApiCall(`admin/workflow/forms-with-fields/${workflowId}`)
            .then((response) => {
                if (response.meta?.status && response.data?.forms) {
                    const opts = response.data.forms.map((f) => ({ label: f.formName, value: f.formId, formId: f.formId }));
                    setFormOptions(opts);
                }
            })
            .catch((err) => {
                console.error('Error loading workflow forms:', err);
            });
    }, []);

    // Prefill form selector from saved hierarchyData
    useEffect(() => {
        if (open && formOptions.length > 0 && rules?.hierarchyData) {
            const prefilled = {};
            hierarchyOrder.forEach((hier) => {
                const storedValue = rules.hierarchyData[hier];
                if (storedValue) {
                    // Extract form ID from stored value (e.g., "h0-formid123" -> "formid123")
                    const parts = storedValue.split('-');
                    const formId = parts.slice(1).join('-');
                    // Find form in formOptions
                    const form = formOptions.find(f => f.value === formId);
                    if (form) {
                        prefilled[hier] = form;
                    }
                }
            });
            setHierarchyProjects(prefilled);
        }
    }, [open, formOptions, rules?.hierarchyData]);

    // Load keys for prefilled forms
    useEffect(() => {
        Object.keys(hierarchyProjects).forEach((hier) => {
            const selectedForm = hierarchyProjects[hier];
            if (selectedForm?.value) {
                getApiCall(`admin/dynamic/form/keys/${selectedForm.value}`)
                    .then((response) => {
                        if (response.meta?.status && response.data?.keys) {
                            setHierarchyKeys((prev) => ({
                                ...prev,
                                [hier]: response.data.keys,
                            }));
                        }
                    })
                    .catch((err) => {
                        console.error(`Error loading keys for ${hier}:`, err);
                    });
            }
        });
    }, [hierarchyProjects]);
    const handleHierarchyFormChange = (hier, selectedOption) => {
        setHierarchyProjects((prev) => ({
            ...prev,
            [hier]: selectedOption,
        }));

        if (selectedOption && selectedOption.value) {
            getApiCall(`admin/dynamic/form/keys/${selectedOption.value}`)
                .then((response) => {
                    if (response.meta?.status && response.data?.keys) {
                        setHierarchyKeys((prev) => ({
                            ...prev,
                            [hier]: response.data.keys,
                        }));
                    }
                })
                .catch((err) => {
                    console.error(`Error loading keys for ${hier}:`, err);
                    setHierarchyKeys((prev) => ({
                        ...prev,
                        [hier]: [],
                    }));
                });
        } else {
            setHierarchyKeys((prev) => ({
                ...prev,
                [hier]: [],
            }));
        }
    };

    // Build hierarchyOptions for specific hierarchy level
    const getHierarchyOptions = (hier) => {
        const hierarchyLabels = hierarchyOrder.map((h) => ({
            label: h.toUpperCase(),
            value: h,
        }));
        const keys = hierarchyKeys[hier] || [];
        const keyOptions = keys.map((key) => ({
            label: key.label || key,
            value: key.value || key,
        }));
        return [...hierarchyLabels, ...keyOptions];
    };

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
                    if(fields?.length==0){
                    setFields(response.data.keys);
                    }
                    if(selectedtype=="creatorFormId"){
                        setCreatorOptions([...hierarchyOptions, ...response.data.keys])
                    }
                    if(selectedtype=="creatorFormId"){
                        setApproveOptions([...hierarchyOptions, ...response.data.keys])
                    }
                    // setHierarchyOptions([...hierarchyOptions, ...response.data.keys])
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

    const handleSelectFields = (selectedOptions) => {
        const selectedValues = selectedOptions
            ? selectedOptions.map((opt) => opt.value)
            : [];
        setRules((prev) => ({ ...prev, selectedFields: selectedValues }));
    };

    const handleTransferFieldProjectChange = (selectedOption) => {
        setRules((prev) => ({ ...prev, transferFieldProject: selectedOption }));
    };

    const handleHieracy = (level, option) => {
        console.log("debug111 = ",level,option);
        
        setRules((prev) => {
            const newHierarchyData = { ...prev.hierarchyData };
            if (option && option.value) {
                newHierarchyData[level] = option.value;
            } else {
                delete newHierarchyData[level];
            }
            return {
                ...prev,
                hierarchyData: newHierarchyData
            };
        });
    };

    const handleSelectChange = (selectedOption, name) => {
        if(name=="creatorFormId" || name=="approverFormId"){
            getDynamicFieldById(selectedOption?.value)
            setSelectedType(name)
        }
        
        setRules((prev) => ({ ...prev, userAssignment: {...rules.userAssignment, [name]: selectedOption?.value || ''} }));
    };

    const sanitizeProjectLabel = (label) => {
        if (!label) return '';
        return String(label).replace(/\s+/g, '');
    };

    console.log("debug111 rules = ",rules);
    

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
                    <Modal.Title>Merge Setting</Modal.Title>
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
                                {hierarchyOrder.map((hier) => {
                                    const selectedProject = hierarchyProjects[hier];
                                    const hierarchyOptionsList = getHierarchyOptions(hier);

                                    return (
                                        <div key={hier} className="col-12 mb-3">
                                            <div className="row align-items-end">
                                                {/* H0-H5 Label */}
                                                <div className="col-12 col-md-2">
                                                    <label className="fw-semibold">{hier.toUpperCase()}</label>
                                                </div>

                                                {/* Form Selector Dropdown */}
                                                <div className="col-12 col-md-4">
                                                    {/* <label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Select Form</label> */}
                                                    <CreatableSelect
                                                        name={`${hier}-form`}
                                                        isClearable
                                                        placeholder="Select form"
                                                        value={selectedProject || null}
                                                        onChange={(opt) => handleHierarchyFormChange(hier, opt)}
                                                        options={formOptions}
                                                    />
                                                </div>

                                                {/* Hierarchy Options Dropdown */}
                                                <div className="col-12 col-md-6">
                                                    {/* <label className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                                                        {hier.toUpperCase()}
                                                        {selectedProject && `-${sanitizeProjectLabel(selectedProject.label)}`}
                                                    </label> */}
                                                    <CreatableSelect
                                                        name={hier}
                                                        isClearable
                                                        placeholder={!selectedProject ? 'Select form first' :`Select or create ${hier}`}
                                                        isDisabled={!selectedProject}
                                                        value={
                                                            rules?.hierarchyData?.[hier]
                                                                ? (() => {
                                                                    const stored = rules?.hierarchyData[hier];
                                                                    const builtOptions = hierarchyOptionsList.map((item) => ({
                                                                        label: selectedProject ? `${item.label}-${sanitizeProjectLabel(selectedProject.label)}` : item.label,
                                                                        value: selectedProject ? `${item.value}-${selectedProject.value}` : item.value,
                                                                    }));
                                                                    // Find the option that matches the stored value
                                                                    const matchedOption = builtOptions.find(opt => opt.value === stored);
                                                                    return matchedOption || { label: stored, value: stored };
                                                                })()
                                                                : null
                                                        }
                                                        onChange={(option) => handleHieracy(hier, option)}
                                                        options={hierarchyOptionsList.map((item) => ({
                                                            label: selectedProject ? `${item.label}-${sanitizeProjectLabel(selectedProject.label)}` : item.label,
                                                            value: selectedProject ? `${item.value}-${selectedProject.value}` : item.value,
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
<div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">User Assignment</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-sm-12 col-xs-12 col-md-6 col-lg-6 mb-3">
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
                                <div className="col-sm-12 col-xs-12 col-md-6 col-lg-6 mb-3">
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
                                        options={[...assignData, ...creatorOptions].map((item) => ({
                                            label: item,
                                            value: item,
                                        }))}
                                    />
                                </div>
                                <div className="col-sm-12 col-xs-12 col-md-6 col-lg-6 mb-3">
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
                                <div className="col-sm-12 col-xs-12 col-md-6 col-lg-6 mb-3">
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
                                        options={[...assignData, ...approverOptions].map((item) => ({
                                            label: item,
                                            value: item,
                                        }))}
                                    />
                                </div>
                                
                            </div>
                        </div>
                    </div>
                    {/* 
                    🔹 Select Transfer Field Card
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Select Transfer Field</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {/* Select Project Dropdown */}
                                {/* <div className="col-sm-12 col-xs-12 col-md-6 col-lg-6 mb-3">
                                    <label className="fw-semibold">Select Project *</label>
                                    <CreatableSelect
                                        name="transferFieldProject"
                                        isClearable
                                        placeholder="Select project"
                                        value={rules?.transferFieldProject || null}
                                        onChange={(opt) => handleTransferFieldProjectChange(opt)}
                                        options={formOptions}
                                    />
                                </div>

                                {/* Select Field Multi-select Dropdown */}
                                {/* <div className="col-sm-12 col-xs-12 col-md-6 col-lg-6 mb-3">
                                    <label className="fw-semibold">Select Field *</label>
                                    <CreatableSelect
                                        name="prospectNo"
                                        isClearable
                                        placeholder={!rules?.transferFieldProject ? 'Select project first' : "Type to search or create..."}
                                        isDisabled={!rules?.transferFieldProject}
                                        value={rules?.selectedFields?.map((v) => ({
                                            label: v,
                                            value: v,
                                        }))}
                                        onChange={handleSelectFields}
                                        options={[...fields,'projectDocuments'].map((item) => ({
                                            label: item,
                                            value: item,
                                        }))}
                                        isMulti
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    */}

                    {/* 
                    🔹 Query Builder Card
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
                    */}
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
export default OvalModal;
