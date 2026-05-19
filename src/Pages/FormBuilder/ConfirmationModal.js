import React, { useState, useEffect } from 'react';
import CreatableSelect from "react-select/creatable";
import getApiCall from '../../Services/getApiCall';

const ConfirmationModal = ({ 
  show,
   onClose, 
   onConfirm,
   comment, 
   setComment=()=>{}, 
   title, 
   message,
   firstButton= "Confirm",
   secondButton="Cancel",
   isAlert=false,
   formId,
  selectedButton,
  selectedOption,
  setSelectedOption,
  setSelectionType,
  selectionType
  }) => {
const [negativeOptions, setNegativeOptions] = useState([])
  // const [comment, setComment] = useState('');
useEffect(() => {
  if (show) {
    setComment('');
  }
}, [show]);
  if (!show) return null;

async function getNegativeFeedbackList() {
    let responseData = await getApiCall('admin/configuration/details/npaNegativeFeedbackReasons');
    let data = []
    if (responseData.meta.status) {
      setNegativeOptions(responseData?.data?.value?.map((item) => ({ label: item, value: item })))
    }
}
  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">{title || 'Confirmation'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className='container-fluid'>
          <div className="modal-body" style={{height:'auto'}}>

            {/* 
            <div className="mb-3">
              <label htmlFor="yesNoSelect" className="form-label">Please select</label>
              <select
                id="yesNoSelect"
                className="form-select"
                value={dropdownValue}
                onChange={(e) => setDropdownValue(e.target.value)}
              >
                <option value="">-- Select --</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div> */}
            {isAlert?
            <div className='d-flex justify-content-start align-items-center' style={{minHeight:'100px'}}>
            <b>{comment}</b>
            </div>
          :(<>

         <>
  {/* ✅ Radio Buttons */}
  {(formId=="683ef3f2f676296479d29224"&& selectedButton=="APPROVED")&&(
    <div className='mt-2'>
      <label className="fw-semibold">
        Feedback *
      </label>
    
  <div className="mb-3 gap-2">
    <label className="me-3 fw-semibold">
      <input
        type="radio"
        name="feedbackType"
        value="positive"
        checked={selectionType === "positive"}
        onChange={(e) => {
          setSelectionType(e.target.value);
          setSelectedOption(null);
        }}
      />{" "}
      Positive
    </label>

    <label className="fw-semibold mx-2">
      <input
        type="radio"
        name="feedbackType"
        value="negative"
        className='mx-2'
        checked={selectionType === "negative"}
        onChange={(e) => {
          setSelectionType(e.target.value);
          setSelectedOption(null);
          getNegativeFeedbackList()
        }}
      />{" "}
      Negative
    </label>
  </div>
  </div>
)}
  {/* ✅ Conditional Dropdown */}
  {selectionType === "negative" && (
    <div className="mb-3">
      <label className="fw-semibold">
        Select Reason *
      </label>
      <CreatableSelect
        isClearable
        placeholder="Search..."
        options={
          negativeOptions
        }
        value={selectedOption}
        onChange={(option) => setSelectedOption(option)}
        isMulti={true}
      />
    </div>
  )}
</>
            <b>{'Kindly provide your comments'}</b>

            <div className="mb-3">
              {/* <label htmlFor="commentBox" className="form-label">Comments</label> */}
              <textarea
                id="commentBox"
                className="form-control"
                placeholder='Comments...'
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            </>)}
          </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{secondButton}</button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={selectionType=="negative"?(!comment ||!selectedOption|| selectedOption?.length==0 ): !comment} // disable if not selected
            >
              {firstButton}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
