import React, { useState } from "react";
import styles from "./ContactForm.module.css"; // custom css module

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    privacy: false,
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Validate inputs
  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid Email";
    }
    if (!formData.phone) {
      newErrors.phone = "Phone Number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone Number must be 10 digits";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    if (!formData.privacy) newErrors.privacy = "You must agree to privacy policy";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log("Form Submitted", formData);
      alert("Form Submitted Successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
        privacy: false,
      });
    }
  };

  return (
      <div className={`container mt-4 w-751 ${styles.wMd75 }`}>
          <form className={`p-4 shadow1 rounded ${styles.formBox}`} onSubmit={handleSubmit}>

              {/* First + Last Name in one row */}
              <div className="row">
                  <div className="col-md-6 mb-3">
                      <label className={`form-label ${styles.leftLabel}`}>First Name</label>
                      <input
                          type="text"
                          className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                      />
                      <div className="invalid-feedback">{errors.firstName}</div>
                  </div>

                  <div className="col-md-6 mb-3">
                      <label className={`form-label ${styles.leftLabel}`}>Last Name</label>
                      <input
                          type="text"
                          className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                      />
                      <div className="invalid-feedback">{errors.lastName}</div>
                  </div>
              </div>


              {/* Email */}
              <div className="mb-3">
                  <label className={`form-label ${styles.leftLabel}`}>Email</label>
                  <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.email}</div>
              </div>

              {/* Phone */}
              <div className="mb-3">
                  <label className={`form-label ${styles.leftLabel}`}>Phone Number</label>
                  <input
                      type="tel"
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.phone}</div>
              </div>

              {/* Message */}
              <div className="mb-3">
                  <label className={`form-label ${styles.leftLabel}`}>Message</label>
                  <textarea
                      rows="4"
                      className={`form-control ${errors.message ? "is-invalid" : ""}`}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                  ></textarea>
                  <div className="invalid-feedback">{errors.message}</div>
              </div>

              {/* Privacy Policy */}
              <div className="form-check mb-3" style={{ textAlign: "left" }}>
                  <input
                      type="checkbox"
                      className={`form-check-input ${errors.privacy ? "is-invalid" : ""}`}
                      name="privacy"
                      checked={formData.privacy}
                      onChange={handleChange}
                      id="privacyCheck"
                  />
                  <label className="form-check-label" htmlFor="privacyCheck">
                      I agree to the Privacy Policy
                  </label>
                  <div className="invalid-feedback d-block">{errors.privacy}</div>
              </div>


              <button type="submit" className="btn w-20">
                  Submit
              </button>
          </form>
      </div>
  );
};

export default ContactForm;
