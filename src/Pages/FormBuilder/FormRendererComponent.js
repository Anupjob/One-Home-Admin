import React, {useRef, useState} from 'react';
import { Form } from 'react-formio';

const FormRendererComponent = ({ formSchema }) => {
   const clickedButtonRef = useRef(null);
  
  if (!formSchema) {
    return <p className="text-muted">Build a form first to preview it here.</p>;
  }

  return (
    <div className="card shadow-sm p-3">
      <Form form={formSchema} />

    </div>
  );
};

export default FormRendererComponent;
