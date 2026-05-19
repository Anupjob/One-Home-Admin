import React from "react";
import { Button } from "react-bootstrap";
import { FaInbox } from "react-icons/fa";
import "./NoDataFound.css";

const NoData = ({ message = "No Data Found", onRetry }) => {
  return (
    <div className="no-data-container text-center">
      <div className="no-data-icon">
        <FaInbox size={50} color="#EE5819" />
      </div>
      <h5 className="mt-3">{message}</h5>
      <p className="text-muted small">Try adjusting your filters or search again.</p>
      {onRetry && (
        <Button 
          variant="primary" 
          className="retry-btn mt-2" 
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  );
};

export default NoData;
