import React, { useState } from "react";

const PasswordInput = ({ label, placeholder, value, onChange, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group highlight-group">
        <input
          type={show ? "text" : "password"}
          className="form-control"
          value={value}
          onChange={onChange}
          placeholder={placeholder || ''}
        />
        <span
          className="input-group-text login-country-code"
          style={{ cursor: "pointer" }}
          onClick={() => setShow(!show)}
        >
          <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}></i>
        </span>
      </div>
       <small className="text-danger">{error}</small>
    </div>
  );
};

export default PasswordInput;
