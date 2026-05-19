import React from "react";
import { Button, Card, Form, Row, Col } from "react-bootstrap";
import './filterWithButtonCard.css';

const FilterWithButtonsCard = ({
  title = "Card Title",
  showUpload = false,
  showDownload = false,
  showAdd = false,
  onUpload,
  onDownload,
  onAdd,
  filters = null,
  headerButtons,       // array of filter components
  onFilterClick
}) => {
  console.log('filters:::::', filters)

  return (
    <>
    <div className="new-custom-card-header ">
      <div className="title">{title}</div>

     {/* <h5 className="mb-0 fw-bold header-title">{title}</h5> */}
        <div className="header-buttons">{headerButtons}</div>
    </div>

     {filters &&
        <div className="card-body d-none d-md-block">
          <div >
            {filters}
          </div>
        </div>
      }
   
         {/* <div className="card shadow-sm border-0">
      <div className="card-header custom-card-header">
        <h5 className="mb-0 fw-bold header-title">{title}</h5>
        <div className="header-buttons">{headerButtons}</div>
      </div>
      {filters &&
        <div className="card-body d-none d-md-block">
          <div >
            {filters}
          </div>
        </div>
      }
    </div> */}
    </>
   
  );
};

export default FilterWithButtonsCard;
