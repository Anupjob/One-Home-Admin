// const CustomButton = ({ label, onClick, type = "button", icon, variant = "primary" }) => {
//   return (
//     <button
//       type={type}
//       className={`custom-btn btn-${variant}`}
//       onClick={onClick}
//     >
//       {icon && <i className={`bi ${icon} me-2`}></i>}
//       {label}
//     </button>
//   );
// };

// export default CustomButton;

import React from "react";
import { Link } from "react-router-dom";
import '../Utils/custumButton.css';

const CustomButton = ({
  label,
  onClick,
  type = "",
  icon,
  disabled= false,
  variant = "outline",
  appendClass = "",
  iconAppendClass = "",
  to, // <-- optional link
  updateBgColor = '#EF5713',
  btnWidth = "fit-content"
}) => {
  const content = (
    <>
      {icon && <i className={`bi ${icon} fw-bold ${iconAppendClass}`}></i>}
      {label}
    </>
  );

  if (to) {
    // If `to` prop exists → render Link
    return (
      <Link to={to} className={`custom-btn-outline btn-${variant} ${appendClass}`} style={{backgroundColor:updateBgColor}}>
        {content}
      </Link>
    );
  }

  // Else render regular button
  return (
    <button
      type={type}
      disabled={disabled}
      className={`custom-btn-outline btn-${variant} ${appendClass}` }
      onClick={onClick}
      style={{backgroundColor:disabled?"grey":updateBgColor, width: btnWidth}}
    >
      {content}
    </button>
  );
};

export default CustomButton;
