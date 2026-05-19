import React, {useState} from 'react';
import { FormBuilder } from 'react-formio';
import { toast } from 'react-toastify';
import postApiCall from '../../Services/postApiCall';
import putApiCall from '../../Services/putApiCall';
import { useNavigate } from 'react-router-dom';
import { useformBuilderStore } from '../../Store/formBuilderStore';

const FormBuilderComponent = ({ formSchema, handleChange, formData, isEdit, formId, handlePreview, handleFormSetting, docxTemplates = [] }) => {

   const [responseId, setResponseId] = useState('')
   const searchFiltervalue = useformBuilderStore((state) => state.searchFiltervalue);
   const drapdownFiltervalue = useformBuilderStore((state) => state.drapdownFiltervalue);
   const dateRangeFiltervalue = useformBuilderStore((state) => state.dateRangeFiltervalue);
   const multiSelectfiltervalue = useformBuilderStore((state) => state.multiSelectfiltervalue);

  const history = useNavigate();
    // console.log('Form Submission Payload FormRendererComponent:', formSchema);
    const checkValidation = () => {
      if (!formData.name) {
        return false
      }
      if (!formData.orderNumber) {
        return false
      }
      return true
    }
    
// Convert label to a camelCase key (basic slugify)
const labelToKey = (label = '') => {
  return label
    .replace(/[^a-zA-Z0-9 ]/g, '')         // remove non-alphanumeric
    .trim()
    .split(' ')
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
};

const generateUniqueId = () => `uid_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const updateKeysBasedOnLabel = (components = []) => {
    return components.map((comp) => {
      const newComp = { ...comp };

      if (!comp.uniqueId) {
        if (comp.label) {
          newComp.key = labelToKey(comp.label);
        }
        newComp.uniqueId = generateUniqueId();
      }

      // Recursively handle nested structures
      if (Array.isArray(comp.components)) {
        newComp.components = updateKeysBasedOnLabel(comp.components);
      }

      if (Array.isArray(comp.columns)) {
        newComp.columns = comp.columns.map((col) => ({
          ...col,
          components: updateKeysBasedOnLabel(col.components || []),
        }));
      }

      if (Array.isArray(comp.rows)) {
        newComp.rows = comp.rows.map((row) =>
          row.map((col) => ({
            ...col,
            components: updateKeysBasedOnLabel(col.components || []),
          }))
        );
      }

      return newComp;
    });
  };

  
      const handleSubmit = async (type) => {
        const searchableFields = searchFiltervalue.map(item => item.key);
        const dateFilterFields = dateRangeFiltervalue.map(item => item.key);
        const dropdownFilterFields = drapdownFiltervalue.map(item => item.key);
        const multiSelectFilterFields = multiSelectfiltervalue.map(item => item.key);
        const validation = checkValidation()
        if (!validation) {
           toast.error('Please input form name and order number !')
          return
        }

        const hasPrefill =
          (searchFiltervalue?.length > 0) ||
          (dateRangeFiltervalue?.length > 0) ||
          (drapdownFiltervalue?.length > 0) ||
          (multiSelectfiltervalue?.length > 0);

        let payload = {
          name: formData.name,
          // url: formData.url,
          moduleFormData:  updateKeysBasedOnLabel(formSchema.components),
          status: type,
          pdfTemplate: formData.pdfTemplate,
          parentName:formData.parentName,
          orderNumber: formData.orderNumber,
          icon: formData.icon,
          searchableFields:formData.searchableFields,
          dateFilterFields:formData.dateFilterFields,
          dropdownFilterFields:formData.dropdownFilterFields,
          multiSelectFilterFields:formData.multiSelectFilterFields,
          dataCreationAssignProcess:formData.dataCreator.assignmentType,
          dataCreationAssignMethod:formData?.dataCreator?.automaticLogic,
          dataApprovalAssignProcess:formData.dataApprover.assignmentType,
          dataApprovalAssignMethod:formData?.dataApprover?.automaticLogic,
          formFieldUniqueKey: formData.formFieldUniqueKey,
          tableHeaderSetting: formData.tableHeaderSetting,
          notificationEnable: formData.notificationEnable,
          formHierarchy: formData.formHierarchy,
          tatReportKeys: formData.tatReportKeys,
          tatReportName: formData.tatReportName,
          // attach docxTemplates array as provided by parent
          docxTemplates: docxTemplates.map(r => ({ name: r.name, documentLink: r.documentLink || '' })),

          enableRejectAction: formData.enableRejectAction ?? false,
          // ...(hasPrefill && {
          //   filterPrefillValues: {
          //     searchableFields: searchFiltervalue,
          //     dateFilterFields: dateRangeFiltervalue,
          //     dropdownFilterFields: drapdownFiltervalue,
          //     multiSelectFilterFields: multiSelectfiltervalue
          //   }
          // })
        };
        
        try {
          let response = null;
          
          if(isEdit || responseId){
            console.log("formId or responseId", payload);
            console.log("ddd111 searchFilterVAlue = ", searchFiltervalue);
            console.log("ddd111 drapdownFiltervalue = ", drapdownFiltervalue);
            console.log("ddd111 dateRangeFiltervalue = ", dateRangeFiltervalue);
            console.log("ddd111 multiSelectfiltervalue = ", multiSelectfiltervalue);
            response = await postApiCall(`admin/dynamic/form/update/${formId || responseId}`, payload, true)
          }
          else{
            response = await postApiCall('admin/dynamic/form/add', payload, true)
          }
          
          // Handle response
          if (response && response.meta && response.meta.status) {
            toast.success(response.meta.msg || 'Form saved successfully!')
            setResponseId(response?.data)
          } else {
            // Show error message from backend
            const errorMsg = response?.meta?.msg || 'Failed to save form. Please try again.';
            toast.error(errorMsg);
            console.error('API Error:', errorMsg);
          }
        } catch (error) {
          // Handle network or other errors
          const errorMsg = error?.message || 'An error occurred while saving the form. Please try again.';
          toast.error(errorMsg);
          console.error('Error submitting form:', error);
        }
      };


  return (
  <div className="card create_form shadow-sm p-3">
    <div className="create_form_button">
        <button className="btn btn-danger mx-1" onClick={()=>handlePreview()}><i className="fa fa-eye"></i></button>
        <button className="btn btn-primary mx-1" onClick={()=>handleFormSetting()}><i className="fa fa-gear"></i></button>
        <button className="btn btn-success mx-1" onClick={()=>handleSubmit('PUBLISHED')}><i className="fa fa-save"></i> Save</button>
      </div>
        <FormBuilder
          form={formSchema}
          onChange={(updatedSchema) => {
            console.log("updated schema = ",updatedSchema);
            
            // updatedSchema might be components only
            const finalSchema = {
              display: "form",
              components: updatedSchema.components || updatedSchema
            };
            handleChange(finalSchema);
          }}
        />
  </div>
  );
};

export default FormBuilderComponent;
