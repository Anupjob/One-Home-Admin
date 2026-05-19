import React, { useState, useEffect, useMemo } from 'react';
import FormBuilderComponent from './FormBuilderComponent';
import FormRendererComponent from './FormRendererComponent';
import { useLocation, useParams } from 'react-router-dom';
import 'formiojs/dist/formio.full.min.css';
import getApiCall from '../../Services/getApiCall';
import postApiCall from '../../Services/postApiCall';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import IconSelector from "./IconSelector";
import Editor from '../../Utils/Editor';
import CustomMultiSelect from '../../Pages/Reusable/CustomMultiSelect.jsx';
import { useformBuilderStore } from '../../Store/formBuilderStore';
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import ReusableSelect from '../../Pages/Reusable/ReusableSelect';
import { Box, TextField, Typography, Tab, Tabs } from "@mui/material";
import CustomButton from '../../Utils/CustomButton.js';

const FormBuilder = () => {
  const location = useLocation();
  const { formId } = useParams();
  const params = new URLSearchParams(location.search);
  const isPreview = params.has('preview');
  const isEdit = params.has('edit');
  const hierarchyOrder = ["h0", "h1", "h2", "h3", "h4", "h5"];
  // const [hierarchyOptions, setHierarchyOptions] = useState(hierarchyOrder)
  // const [selectedHierarchyValue, setSelectedHierarchyValue] = useState(null);
  // const [selectedHierarchy, setSelectedHierarchy] = useState(null);
  const [formHierarchy, setFormHierarchy] = useState('');
  const [open, setOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    parentName: '',
    orderNumber: '',
    icon: "bi-alarm",
    pdfTemplate: '',
    dataCreator: {
      assignmentType: 'MANUAL',
      automaticLogic: null
    },
    dataApprover: {
      assignmentType: 'MANUAL',
      automaticLogic: null
    },
    formFieldUniqueKey: '',
    searchableFields: [],
    dateFilterFields: [],
    dropdownFilterFields: [],
    multiSelectFilterFields: [],
    tableHeaderSetting: [],
    notificationEnable: false,
    formHierarchy: '',
    tatReportKeys: [],
    tatReportName: '',
    enableRejectAction: false,
  });


  console.log('formData::::::::::::::', formData)

  const [formSchema, setFormSchema] = useState({
    display: "form",
    components: []
  });

  const [reportValue, setReportValue] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(formData.icon || "bi-alarm");

  // report format management state
  const [newReportName, setNewReportName] = useState('');
  const [newReportFile, setNewReportFile] = useState(null);
  const [newReportError, setNewReportError] = useState('');
  const [reportFormats, setReportFormats] = useState([]);
  const fileInputRef = React.useRef(null);
  const [tabValue, setTabValue] = React.useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((values) => ({ ...values, [name]: value }));
  };

  const handleFormChange = (updatedSchema) => {
    setFormSchema(updatedSchema);
  };




  const handleIconSelect = (icon) => {
    console.log('icon:::::', icon)
    // setSelectedIcon(icon);
    setFormData({ ...formData, icon });
  };

  const handleReportChange = (event) => {
    const val = event.target.value;
    setReportValue(val);
    setFormData({ ...formData, tatReportName: val });
    console.log("Input Report value:", val);
  };

  // report format handlers
  const handleNewReportNameChange = (e) => {
    setNewReportName(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // validate mime type or extension
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      if (!allowedTypes.includes(file.type)) {
        setNewReportError('Only .doc or .docx files are allowed');
        setNewReportFile(null);
      } else {
        setNewReportFile(file);
        setNewReportError('');
      }
    }
  };

  // helper to upload a single file and return the URL
  const uploadReportFile = async (file) => {
    try {
      const form = new FormData();
      form.append('document', file, file.name);
      const result = await postApiCall('common/upload/blob/admin/document', form, true);
      let blogToken = localStorage.getItem('uploadT');
      if (result?.meta?.status) {
        return result.data + (blogToken || '');
      } else {
        throw new Error(result.meta.msg || 'Upload failed');
      }
    } catch (err) {
      console.error('file upload error', err);
      throw err;
    }
  };

  const handleAddReportFormat = async () => {
    if (newReportName && newReportFile && !newReportError) {
      try {
        // const url = await uploadReportFile(newReportFile);
        // Get file extension
        const fileExtension = newReportFile.name.endsWith('.docx') ? '.docx' : '.doc';
        const documentLinkWithExtension = fileExtension;
        // Store format with name, fileName, and documentLink
        setReportFormats(prev => [...prev, {
          name: newReportName,
          fileName: newReportFile.name,
          documentLink: documentLinkWithExtension
        }]);
        setNewReportName('');
        setNewReportFile(null);
        setNewReportError('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        setNewReportError('Upload failed. Please try again.');
      }
    }
  };

  const handleDeleteReportFormat = async (index) => {
    const template = reportFormats[index];
    if (template._id) {
      // Call delete API for saved templates (using POST as per backend)
      try {
        await postApiCall(`admin/dynamic/form/delete-docx-template/${formId}/${template._id}`, {}, true);
        // Remove from state after successful delete
        setReportFormats(prev => prev.filter((_, i) => i !== index));
      } catch (err) {
        console.error('Failed to delete template:', err);
        // Optionally show error message
      }
    } else {
      // Remove unsaved templates directly
      setReportFormats(prev => prev.filter((_, i) => i !== index));
    }
  };


  const getFormDataById = () => {
    getApiCall(`admin/dynamic/form/details/${formId}`)
      .then((response) => {
        if (response.meta.status) {
          setFormSchema({
            display: "form",
            components: response.data.moduleFormData
          });
          // Parse formHierarchy (could be object or JSON string) and set both local state and formData
          let parsedFormHierarchy = '';
          try {
            if (typeof response.data.formHierarchy === 'string' && response.data.formHierarchy) {
              parsedFormHierarchy = JSON.parse(response.data.formHierarchy);
            } else {
              parsedFormHierarchy = response.data.formHierarchy || '';
            }
          } catch (err) {
            parsedFormHierarchy = '';
          }

          setFormData({
            name: response.data.name,
            parentName: response.data.parentName,
            orderNumber: response.data.orderNumber,
            pdfTemplate: response.data.pdfTemplate,
            icon: response.data.icon,
            dataCreator: {
              assignmentType: response.data.dataCreationAssignProcess,
              automaticLogic: response.data.dataCreationAssignMethod
            },
            dataApprover: {
              assignmentType: response.data.dataApprovalAssignProcess,
              automaticLogic: response.data.dataApprovalAssignMethod
            },
            formFieldUniqueKey: response.data.formFieldUniqueKey,
            searchableFields: response.data.searchableFields || [],
            dateFilterFields: response.data.dateFilterFields || [],
            dropdownFilterFields: response.data.dropdownFilterFields || [],
            multiSelectFilterFields: response.data.multiSelectFilterFields || [],
            tableHeaderSetting: response.data.tableHeaderSetting || [],
            notificationEnable: response.data.notificationEnable || false,
            formHierarchy: parsedFormHierarchy,
            tatReportKeys: response.data.tatReportKeys || [],
            tatReportName: response.data.tatReportName || '',
            docxTemplates: response.data.docxTemplates || [],
            enableRejectAction: response.data.enableRejectAction ?? false

          });
          setFormHierarchy(parsedFormHierarchy);
          // Load existing docxTemplates into state
          setReportFormats(response.data.docxTemplates || []);
        }
      })
      .catch((error) => {
        console.error("Error loading form data:", error);
      });
  };

  const handlePreview = () => {
    setPreviewModal(true);
  };

  const handleClose = (value) => {
    setOpen(false);
  };


  const handleClosePreview = () => {
    setPreviewModal(false);
  };

  const handleFormSetting = () => {
    setOpen(true);
  };



  useEffect(() => {
    if (formId) {
      getFormDataById();
    } else {
      setOpen(true);
    }
  }, [formId]);

  const handleEditorChange = (content, editor) => {
    setFormData({
      ...formData,
      pdfTemplate: content
    });
  };

  // Handler to update specific hierarchy field
  // const handleHieracyChange = (hier) => (selectedOption) => {
  //     console.log(`Selected for ${hier}:`, selectedOption);

  //     setFormHierarchy(prev => ({
  //         ...prev,
  //         [hier]: selectedOption ? selectedOption.value : null
  //     }));
  //     setFormData(prev => ({
  //         ...prev,
  //         formHierarchy: {
  //             ...prev.formHierarchy,
  //             [hier]: selectedOption ? selectedOption.value : null
  //         }
  //     }));

  //     // Log the value
  //     if (selectedOption) {
  //         console.log("Value:", selectedOption.value);
  //         console.log("Label:", selectedOption.label);
  //     }
  // };

  const handleHieracyChange = (hier) => (selectedOption) => {
    setFormHierarchy(prev => {
      const updated = { ...prev };
      if (!selectedOption) {
        delete updated[hier];
      } else {
        updated[hier] = selectedOption.value;
      }
      return updated;
    });

    setFormData(prev => {
      const updatedHierarchy = { ...prev.formHierarchy };
      if (!selectedOption) {
        delete updatedHierarchy[hier];
      } else {
        updatedHierarchy[hier] = selectedOption.value;
      }
      return {
        ...prev,
        formHierarchy: updatedHierarchy
      };
    });
  };


  const getFormFields = (schema, allowedTypes = null, notAllowedTypes = null) => {
    const leafFields = [];
    const matchedFields = [];

    const extract = (comp) => {
      // If component has nested components → go deeper
      if (comp.components && comp.components.length > 0) {
        comp.components.forEach(extract);
        return;
      }

      // Columns structure → each column has .components array
      if (comp.columns && comp.columns.length > 0) {
        comp.columns.forEach(col => col.components.forEach(extract));
        return;
      }

      // Rows structure → rows is array of arrays
      if (comp.rows && comp.rows.length > 0) {
        comp.rows.forEach(row =>
          row.forEach(cell => {
            if (cell.components) {
              cell.components.forEach(extract);
            }
          })
        );
        return;
      }

      // Datagrid → comp.components is inside each row
      if (comp.type === "datagrid" && comp.components) {
        comp.components.forEach(extract);
        return;
      }

      // Tables
      if (comp.type === "table" && comp.rows) {
        comp.rows.forEach(row =>
          row.forEach(cell => {
            if (cell.components) {
              cell.components.forEach(extract);
            }
          })
        );
        return;
      }

      // If here → component is LEAF (actual input)
      if (comp.key && comp.label) {
        const field = {
          label: comp.label,
          key: comp.key,
          type: comp.type,
        };
        if (notAllowedTypes && notAllowedTypes.includes(comp.type)) {
          return;
        }

        leafFields.push(field);
        if (allowedTypes && allowedTypes.includes(comp.type)) {
          matchedFields.push(field);
        }
      }
    };

    // Start recursion
    (schema.components || []).forEach(extract);

    // No filter → all leaf fields
    if (!allowedTypes) return leafFields;

    // If matching types found → return only those
    if (matchedFields.length > 0) return matchedFields;

    // No matched → return all leaf fields
    return leafFields;
  };

  // Memoized options
  const hierarchyOptionsLists = useMemo(() => {
    const hierarchyOptionWithoutKey = hierarchyOrder;
    const keyOptions = getFormFields(formSchema, null, null);

    return [
      ...hierarchyOptionWithoutKey.map((hier) => ({
        label: hier,
        // append 'Name' suffix for API value
        value: `${hier}Name`,
      })),
      ...keyOptions.map((key) => ({
        label: key.label,
        // append 'Name' suffix for API value
        value: `${key.key}`,
      }))
    ];
  }, [hierarchyOrder, formSchema]);

  return (
    <div className="container-fluid">
      <div className="row">
        {!isPreview && (
          <>
            <div className="main-title">
              <h3>Form Creation</h3>
            </div>

            <div className="col-md-12">
              <FormBuilderComponent
                handleChange={handleFormChange}
                formSchema={formSchema}
                formData={formData}
                isEdit={isEdit}
                formId={formId}
                handlePreview={handlePreview}
                handleFormSetting={handleFormSetting}
                docxTemplates={reportFormats} // added report formats
              />
            </div>
          </>
        )}
      </div>

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
            <div
              className='selected_icon'
              onClick={() => setShowIconModal(true)}
              onMouseEnter={() => setShowEdit(true)}
              onMouseLeave={() => setShowEdit(false)}
            >
              <i className={`bi bi-${formData.icon || 'file-fill'} fs-4 text-dark`} />
              {showEdit && (
                <i className="bi bi-pencil-fill icon-edit-overlay" />
              )}
            </div>
            <Modal.Title>Form Setting</Modal.Title>
          </div>
          <i
            className="fa fa-times ms-auto"
            role="button"
            onClick={handleClose}
            style={{ fontSize: '1.2rem', cursor: 'pointer' }}
          />
        </Modal.Header>

        <Modal
          show={showIconModal}
          onHide={() => setShowIconModal(false)}
          size="md"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Select Icon</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <IconSelector
              selectedIcon={formData.icon}
              onSelect={(icon) => {
                handleIconSelect(icon);
                setShowIconModal(false);
              }}
            />
          </Modal.Body>
        </Modal>

        <Modal.Body>
          <div className='container-fluid'>
            <Tabs
              value={tabValue}
              onChange={(event, newValue) => setTabValue(newValue)}
              TabIndicatorProps={{ style: { display: "none" } }} // remove underline
              variant="fullWidth"
              sx={{
                backgroundColor: "#e0e0e0",
                borderRadius: "10px",
                padding: "5px",
                minHeight: "auto",
                marginTop: "10px",
              }}
            >
              {[
                "Basic Information",
                "Data Setting",
                "Table Setting",
              ].map((label, index) => (
                <Tab
                  key={index}
                  label={label}
                  // {...a11yProps(index)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    borderRadius: "8px",
                    minHeight: "40px",
                    margin: "0 4px",
                    color: "#555",
                    backgroundColor: "#e0e0e0",
                    transition: "all 0.3s ease",

                    // ✅ Selected tab
                    "&.Mui-selected": {
                      backgroundColor: "#fff",
                      color: "#000",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    },

                    // ✅ Hover
                    "&:hover": {
                      backgroundColor: "#d6d6d6",
                    },
                  }}
                />
              ))}
            </Tabs>
            {tabValue === 0 && (<>
            
              <div className="card shadow-sm border-0 mb-4 my-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Basic Information</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="form-group col-md-5">
                      <label>Form Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Enter form name"
                        value={formData.name}
                        required
                        disabled={isEdit}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-5">
                      <label>Parent Name</label>
                      <input
                        type="text"
                        name="parentName"
                        className="form-control"
                        placeholder="Enter parent name"
                        value={formData.parentName}
                        required
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-2">
                      <label>Order Number</label>
                      <input
                        type="number"
                        name="orderNumber"
                        className="form-control"
                        placeholder="Enter order number"
                        value={formData.orderNumber}
                        required
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Reject Enable</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="form-group col-md-6">
                      {/* <label>Assignment Type​</label> */}
                      <select
                        name="creatorAssignmentType"
                        className="form-control"
                        value={(formData?.enableRejectAction ?? false).toString()} // ✅ fix
                        onChange={(e) => {
                          const value = e.target.value === "true";

                          setFormData({
                            ...formData,
                            enableRejectAction: value
                          });
                        }}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Notification Enable</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="form-group col-md-6">
                      {/* <label>Assignment Type​</label> */}
                      <select
                        type="text"
                        name="creatorAssignmentType"
                        className="form-control"
                        placeholder="Enter order number"
                        value={formData?.notificationEnable}
                        required
                        onChange={(e) => {
                          const value = e.target.value
                          setFormData({
                            ...formData,
                            notificationEnable: value
                          })
                        }
                        }
                      >
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            {/* </TabPanel> */}
            </>)}
            {tabValue === 1 && (<>
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Data Assignment</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="form-group col-md-6">
                      <label>Creator Assignment</label>
                      <select
                        type="text"
                        name="creatorAssignmentType"
                        className="form-control"
                        placeholder="Enter order number"
                        value={formData.dataCreator.automaticLogic ? (formData?.dataCreator?.assignmentType + " (" + formData?.dataCreator?.automaticLogic + ")") : formData.dataCreator.assignmentType}
                        required
                        onChange={(e) => {
                          const value = e.target.value;

                          const main = value.split(" ")[0] || "";

                          // safer regex (won’t crash if no match)
                          const match = value.match(/\((.*?)\)/);
                          const sub = match ? match[1] : "";

                          setFormData({
                            ...formData,
                            dataCreator: {
                              assignmentType: main,
                              automaticLogic: value === "MANUAL" ? "" : sub,
                            },
                          });
                        }}
                      >
                        <option value={'MANUAL'}>Manual</option>
                        <option value={'AUTOMATIC (LOAD_BASED)'}>Automatic (Load Based)</option>
                        <option value={'AUTOMATIC (ROUND_ROBIN)'}>Automatic (Round Robin)</option>
                      </select>
                    </div>
                    <div className="form-group col-md-6">
                      <label>Approver Assignment</label>
                      <select
                        type="text"
                        name="approverAssignmentType"
                        className="form-control"
                        placeholder="Enter order number"
                        value={formData.dataApprover.automaticLogic ? (formData?.dataApprover?.assignmentType + " (" + formData?.dataApprover?.automaticLogic + ")") : formData.dataApprover.assignmentType}
                        required
                        onChange={(e) => {
                          const value = e.target.value;

                          const main = value.split(" ")[0] || "";

                          // safer regex (won’t crash if no match)
                          const match = value.match(/\((.*?)\)/);
                          const sub = match ? match[1] : "";

                          setFormData({
                            ...formData,
                            dataApprover: {
                              assignmentType: main,
                              automaticLogic: value === "MANUAL" ? "" : sub,
                            },
                          });
                        }}

                      >
                        <option value={'MANUAL'}>Manual</option>
                        <option value={'AUTOMATIC (LOAD_BASED)'}>Automatic (Load Based)</option>
                        <option value={'AUTOMATIC (ROUND_ROBIN)'}>Automatic (Round Robin)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Status Reports </h5>
                </div>
                <div className="card-body">
                  <div className='row'>
                    <div className="form-group col-md-6">
                      <Box sx={{ width: "100%" }}>
                        <Typography
                          variant="body2"
                          sx={{ mb: 0.5, fontWeight: 500, color: "text.secondary" }}
                        >
                          Report Name
                        </Typography>

                        <TextField
                          hiddenLabel
                          fullWidth
                          variant="outlined"
                          value={reportValue || formData.tatReportName}
                          onChange={handleReportChange}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "40px",
                            },
                            "& input": {
                              padding: "10px 14px",
                            },
                          }}
                        />
                      </Box>
                    </div>
                  </div>
                  <div className="row">
                    <div className="form-group col-md-12">
                      <div>
                        <CustomMultiSelect
                          label="Download status Report"
                          placeholder=""
                          options={getFormFields(formSchema, null, null)}
                          value={getFormFields(formSchema, null, null).filter(opt =>
                            formData.tatReportKeys?.includes(opt.key)
                          )}
                          onChange={(event, newVal) => {
                            const keys = newVal.map(item => item.key);
                            setFormData({ ...formData, tatReportKeys: keys });
                          }}
                          getOptionLabel={(option) => option.label}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              <div className="card shadow-sm border-0 mb-4 my-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Hierarchy Configuration</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {hierarchyOrder.map((hier) => (
                      <div key={hier} className="col-12 col-xs-4 col-md-4 col-lg-4 mb-3">
                        <label className="fw-semibold">{hier}</label>
                        <Select
                          name={hier}
                          isClearable
                          placeholder={`Select ${hier}`}
                          // use the option object that matches stored value so label renders correctly
                          value={hierarchyOptionsLists.find(opt => opt.value === formHierarchy[hier]) || null}
                          onChange={handleHieracyChange(hier)}
                          options={hierarchyOptionsLists}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>)}
            {tabValue === 2 && (<>
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Table  Setting</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="form-group col-md-12">
                      {/* <label>Assignment Type​</label> */}
                      <CustomMultiSelect
                        label="Table Setting"
                        placeholder=""
                        options={getFormFields(formSchema, null, null)}
                        value={getFormFields(formSchema, null, null).filter(opt =>
                          formData.tableHeaderSetting?.includes(opt.key)
                        )}
                        onChange={(event, newVal) => {
                          const keys = newVal.map(item => item.key);
                          setFormData({ ...formData, tableHeaderSetting: keys });
                        }}
                        getOptionLabel={(option) => option.label}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Filter</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="form-group col-md-12">
                      <div>
                        <CustomMultiSelect
                          label="Search Filter"
                          placeholder=""
                          options={getFormFields(formSchema, null, ['date', 'datetime', 'file'])}
                          value={getFormFields(formSchema, null, ['date', 'datetime', 'file']).filter(opt =>
                            formData.searchableFields?.includes(opt.key)
                          )}
                          onChange={(event, newVal) => {
                            const keys = newVal.map(item => item.key);
                            setFormData({ ...formData, searchableFields: keys });
                          }}
                          getOptionLabel={(option) => option.label}
                        />

                      </div>
                    </div>

                    <div className="form-group col-md-12">
                      <div>
                        <CustomMultiSelect
                          label="Dropdown Filter"
                          placeholder=""
                          options={getFormFields(formSchema, null, ['date', 'datetime'])}
                          value={getFormFields(formSchema, null, ['date', 'datetime']).filter(opt =>
                            formData.dropdownFilterFields?.includes(opt.key)
                          )}
                          onChange={(event, newVal) => {
                            const keys = newVal.map(item => item.key);
                            setFormData({ ...formData, dropdownFilterFields: keys });
                          }}
                          getOptionLabel={(option) => option.label}
                        />
                      </div>
                    </div>

                    <div className="form-group col-md-12">
                      <div>
                        <CustomMultiSelect
                          label="Date Range Filter"
                          placeholder=""
                          options={getFormFields(formSchema, null, null)}
                          value={getFormFields(formSchema, null, null).filter(opt =>
                            formData.dateFilterFields?.includes(opt.key)
                          )}
                          onChange={(event, newVal) => {
                            const keys = newVal.map(item => item.key);
                            setFormData({ ...formData, dateFilterFields: keys });
                          }}
                          getOptionLabel={(option) => option.label}
                        />
                      </div>
                    </div>

                    <div className="form-group col-md-12">
                      <div>
                        <CustomMultiSelect
                          label="Multi-Select Filter"
                          placeholder=""
                          options={getFormFields(formSchema, null, ['date', 'datetime'])}
                          value={getFormFields(formSchema, null, ['date', 'datetime']).filter(opt =>
                            formData.multiSelectFilterFields?.includes(opt.key)
                          )}
                          onChange={(event, newVal) => {
                            const keys = newVal.map(item => item.key);
                            setFormData({ ...formData, multiSelectFilterFields: keys });
                          }}
                          getOptionLabel={(option) => option.label}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              {/* ------------------------------------ */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Unique Key</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="form-group col-md-6">
                      {/* <label>Assignment Type​</label> */}
                      <select
                        type="text"
                        name="creatorAssignmentType"
                        className="form-control"
                        placeholder="Enter order number"
                        value={formData?.formFieldUniqueKey}
                        required
                        onChange={(e) => {
                          const value = e.target.value
                          setFormData({
                            ...formData,
                            formFieldUniqueKey: value
                          })
                        }
                        }
                      >
                        <option value={''}>Select</option>
                        {getFormFields(formSchema, null, ["file"]).map((item) => (
                          <option value={item.key}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div style={{margin:"30px 20px"}}>
              <h5>PDF Report Format Manager</h5>
              <p>Upload DOCX templates for your PDF report formats</p>
            </div> */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Add New Report Format</h5>
                  
                </div>
                <div className="card-body">
                  <div className='row'>
                    <div className='col-md-4'>
                      <label>Report Format Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="eg. Monthly Sales Report"
                        value={newReportName}
                        onChange={handleNewReportNameChange}
                      />
                    </div>
                    {/* <div className='col-md-6'>
                    <label>DOCX Template</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="form-control"
                      accept=".doc,.docx"
                      onChange={handleFileUpload}
                    />
                    {newReportFile && (
                      <small className="text-secondary">{newReportFile.name}</small>
                    )}
                    {newReportError && (
                      <div className="text-danger mt-1">{newReportError}</div>
                    )}
                  </div> */}
                    <div className="col-md-6">
                      <label className="mb-2">DOCX Template</label>

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".doc,.docx"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />

                      {/* Custom Upload Box */}
                      <div
                        className="d-flex align-items-center justify-content-center text-center"
                        style={{
                          border: "1px dashed #ced4da",
                          borderRadius: "8px",
                          cursor: "pointer",
                          backgroundColor: "#fafafa",
                          height: "35px",
                          gap: "8px"
                        }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <i className="bi bi-upload fs-3 text-primary"></i>
                        <span className="text-muted">Drop or click to upload</span>
                      </div>

                      {/* Selected File Name */}
                      {newReportFile && (
                        <small className="text-secondary d-block mt-2">
                          {newReportFile.name}
                        </small>
                      )}
                      {!newReportError && !newReportFile && (
                        <div className="text-danger mt-1">Please upload a valid DOCX file.</div>
                      )}
                      {/* Error */}
                      {newReportError && (
                        <div className="text-danger mt-1">{newReportError}</div>
                      )}
                    </div>
                    <div className='col-md-2 d-flex align-items-center'>
                      <CustomButton 
                      label={'Submit'}
                      icon={'save'}
                      onClick={handleAddReportFormat}
                      appendClass='text-white'
                      disabled={!newReportName || !newReportFile || !!newReportError}
                      />
</div>
                  </div>

                  <div className='row mt-3'>
                    <div className='col-md-12'>
                      {/* <h5>Uploaded Report Formats ({reportFormats.length})</h5> */}
                      {reportFormats.length === 0 ? (
                        <div className="d-flex flex-column justify-content-center align-items-center text-muted py-4">
                          <i className="bi bi-file-earmark-excel fs-3 mb-2"></i>
                          <span>No report formats uploaded yet</span>
                        </div>
                      ) : (
                        <table className="table table-bordered table-hover mb-0 common-table">
                          <thead className="bg-primary text-white">
                            <th>Report Name</th>
                            <th>File Name</th>
                            <th>Action</th>
                          </thead>
                          <tbody>
                            {reportFormats.map((rf, idx) => (
                              <tr key={idx}>
                                <td>{rf.name}</td>
                                <td>{rf.fileName}</td>
                                <td>
                                  <i
                                    className="bi bi-trash text-danger fs-5"
                                    role="button"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleDeleteReportFormat(idx)}
                                  ></i>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        // <ul className="list-group border-0">
                        //   {reportFormats.map((rf, idx) => (
                        //     <li
                        //       key={idx}
                        //       className="list-group-item d-flex justify-content-between align-items-center border-0"
                        //     >
                        //       <span>
                        //         {rf.name} ({rf.fileName})
                        //       </span>

                        //       <i
                        //         className="bi bi-trash text-danger fs-5"
                        //         role="button"
                        //         style={{ cursor: "pointer" }}
                        //         onClick={() => handleDeleteReportFormat(idx)}
                        //       ></i>
                        //     </li>
                        //   ))}
                        // </ul>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Uploaded Report Formats ({reportFormats.length})</h5>
              </div>
              <div className="card-body">
                <div className='row'>
                  

                </div>

              </div>
            </div> */}
            </>)}

            {/* 🔹 Hierarchy Configuration Card */}







            {/* ------------- filter start ---------------- */}


            {/* <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Html For PDF</h5>
              </div>
              <div className="card-body">
                <div className='row'>
                  <div className='col-md-12'>
                    <Editor
                      initialContent={formData.pdfTemplate}
                      onChange={(html) => handleEditorChange(html)}

                    />
                  </div>
                </div>
              </div>
            </div> */}

          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => handleClose('save')} appearance="primary">
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        role="alertdialog"
        show={previewModal}
        onHide={handleClosePreview}
        size="xl"
        fullscreen={true}
      >
        <Modal.Header>
          <Modal.Title>Form Preview</Modal.Title>
          <i
            className="fa fa-times ms-auto"
            role="button"
            onClick={handleClosePreview}
            style={{ fontSize: '1.2rem', cursor: 'pointer' }}
          ></i>
        </Modal.Header>

        <Modal.Body>
          {formSchema && (
            <div className="col-md-12">
              <FormRendererComponent formSchema={formSchema} />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FormBuilder;
