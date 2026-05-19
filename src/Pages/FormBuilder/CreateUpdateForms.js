import React from 'react';
import { useParams, useLocation } from 'react-router-dom';


import ModuleForms from './ModuleForms.js';
// import { T } from 'react-querybuilder/dist/index-ByIV7_Fn.js';

const CreateUpdateForms = () => {
  const { formId, formName, type} = useParams();
  const location = useLocation();
  console.log('location.state::::', location.state)
  const {displayName} = location.state || {};
  return(
 <ModuleForms formId={formId} formName={formName} type={type} displayName={displayName}/>
);
};

export default CreateUpdateForms;
