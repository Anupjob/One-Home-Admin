import React from "react";
import { Offcanvas, Button } from "react-bootstrap";
import "./MobileUI.css";

const FilterPopupMobile = ({ 
  show, 
  onClose, 
  onApply, 
  onReset, 
  children 
}) => {
  return (
    <Offcanvas   show={show}
  onHide={() => onClose(null)}
  placement="bottom"
  backdrop={true}
  scroll={false}        
  enforceFocus={false}  
  className="bottom-popup"
  >
        <div className="center-divider"></div>
      <Offcanvas.Header className="d-flex align-items-center justify-content-between" style={{color:'#1F1C57',padding:'6px 15px',fontSize:'24px',fontWeight:'600'}}>
        <Offcanvas.Title className="mb-0" >Filter</Offcanvas.Title>
        {/* Close button is automatically handled by closeButton prop */}
        <Button variant="light" onClick={() => onClose(null)} className="close-btn">
  ×
</Button>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <form>
          <div className="row g-3">
            {/* Render children in columns */}
            {React.Children.map(children, (child, index) => (
              <div className="col-12 mb-2" key={index}>
                {child}
              </div>
            ))}
          </div>
        </form>

        
      </Offcanvas.Body>
       {/* Custom footer */}
  {/* <div className="offcanvas-footer">
    <Button
      onClick={onReset}
      className="w-50 me-2"
      style={{
        backgroundColor: "#FFF0E9",
        color: "#EE5819",
        border: "none",
        height:'40px'
      }}
    >
      Reset All
    </Button>

    <Button
      onClick={onApply}
      className="w-50"
      style={{
        backgroundColor: "#EE5819",
        color: "#fff",
        border: "none",
        height:'40px'
      }}
    >
      Apply
    </Button>
  </div> */}


    </Offcanvas>
  );
};

export default FilterPopupMobile;
