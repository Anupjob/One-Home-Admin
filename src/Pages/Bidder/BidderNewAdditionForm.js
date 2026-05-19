import React, { useState, useEffect } from "react";
import getApiCall from "../../Services/getApiCall";

export default function RegistrationForm() {
  const [userType, setUserType] = useState("INDIVIDUAL");

  const [formData, setFormData] = useState({
    mobile: "",
    email: "",
    name: "",
    PANNumber: "",
    aadharNumber: "",
    address: "",
    area: "",
    city: "",
    state: "",
    pinCode: "",
    dob: "",
    fatherName: "",
    gender: "",
    stateCode: "",
    // company
    typeOfCompany: "",
    companyName: "",
    nameOfAuthorizedRepresentative: "",
    fatherNameOfAuthorizedRepresentative: "",
    incorporationDate: "",
    companyPanNumber: "",
    companyEmail: "",
    companyMobile: "",
  });
  const [stateList, setStateList] = useState([])
  const [cityList, setCityList] = useState([])

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if(name == "state"){
      GetCity(value)
    }
    setFormData({ ...formData, [name]: value });
  };

  const GetCity = async (isoCode) => {
    // console.log("Fetching cities for isoCode:", isoCode); // Debug log
    if (isoCode) {
      let response = await getApiCall(`admin/city/getAllForOption?isoCode=${isoCode}`);
      if (response.meta.status === true) {
        setCityList(response.data.map((_) => {
          return { value: _.name, label: _.name }; // Use city name as both value and label
        }));
      } else {
        setCityList([]); // Clear city list if no cities are found
      }
    }
  };
  // Get State
  async function getState() {
    let response = await getApiCall('admin/state/getAll');
    if (response.meta.status === true) {
      setStateList(response.data.map((_) => {
        return { value: _.isoCode, label: _.name }; // Use isoCode as value and state name as label
      }));
    }
  }

  useEffect(() => {
    getState()
  }, [])
  return (
    <>
      <div className="card mb-4">
        <div className="card-header">User Type</div>
        <div className="card-body">
          <div className="row">
            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
              <select
                className="form-control"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="COMPANY">Company</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Common Info */}
      <div className="card mb-4">
        <div className="card-header">Contact Information</div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Mobile</label>
              <input
                type="text"
                name="mobile"
                className="form-control"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

        <div className="card mb-4">
          <div className="card-header">Individual Information</div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">PAN Number</label>
                <input
                  type="text"
                  name="PANNumber"
                  className="form-control"
                  value={formData.PANNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Aadhar Number</label>
                <input
                  type="text"
                  name="aadharNumber"
                  className="form-control"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Area</label>
                <input
                  type="text"
                  name="area"
                  className="form-control"
                  value={formData.area}
                  onChange={handleChange}
                />
              </div>
               <div className="col-md-4">
                <label className="form-label">State</label>
                <select
                  className="form-control"
                  value={formData.state}
                  name="state"
                  onChange={handleChange}
                >
                  <option value="">Select State</option>
                  {stateList.map((state) => {
                    return (<>
                      <option value={state.value}>{state.label}</option>
                    </>)
                  })}

                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">City</label>
                <select
                  className="form-control"
                  value={formData.city}
                  name="city"
                  onChange={handleChange}
                >
                  <option value="">Select City</option>
                  {cityList.map((city) => {
                    return (<>
                      <option value={city.value}>{city.label}</option>
                    </>)
                  })}

                </select>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Pin Code</label>
                <input
                  type="text"
                  name="pinCode"
                  className="form-control"
                  value={formData.pinCode}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  className="form-control"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  className="form-control"
                  value={formData.fatherName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

      {/* COMPANY SECTION */}
      {userType === "COMPANY" && (
        <div className="card mb-4">
          <div className="card-header">Company Information</div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Type of Company</label>
                <input
                  type="text"
                  name="typeOfCompany"
                  className="form-control"
                  value={formData.typeOfCompany}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  className="form-control"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Authorized Representative</label>
                <input
                  type="text"
                  name="nameOfAuthorizedRepresentative"
                  className="form-control"
                  value={formData.nameOfAuthorizedRepresentative}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Father's Name of Representative</label>
                <input
                  type="text"
                  name="fatherNameOfAuthorizedRepresentative"
                  className="form-control"
                  value={formData.fatherNameOfAuthorizedRepresentative}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Incorporation Date</label>
                <input
                  type="date"
                  name="incorporationDate"
                  className="form-control"
                  value={formData.incorporationDate}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Company PAN</label>
                <input
                  type="text"
                  name="companyPanNumber"
                  className="form-control"
                  value={formData.companyPanNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Company Email</label>
                <input
                  type="email"
                  name="companyEmail"
                  className="form-control"
                  value={formData.companyEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Company Mobile</label>
                <input
                  type="text"
                  name="companyMobile"
                  className="form-control"
                  value={formData.companyMobile}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="btn btn-primary">Submit</button>
    </>
  );
}
