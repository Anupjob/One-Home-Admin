import React, { useState } from "react";
import { Offcanvas, Button, Form } from "react-bootstrap";
import "./MobileUI.css";

const SortPopupMobile = ({ show, onClose, onApply }) => {
  const [sortBy, setSortBy] = useState("");

  const handleApply = () => {
    onApply(sortBy);
    onClose();
  };

  return (
    <Offcanvas show={show} onHide={onClose} placement="bottom" className="offcanvas-bottom">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Sort Options</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form.Group className="mb-3">
          <Form.Label>Sort By</Form.Label>
          <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Select</option>
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </Form.Select>
        </Form.Group>

        <div className="d-flex justify-content-end mt-3">
          <Button variant="primary" onClick={handleApply}>Apply</Button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default SortPopupMobile;
