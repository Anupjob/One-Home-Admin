// // CommonActionIcons.jsx
// import React, { useState, useRef, useEffect } from "react";
// import { Link } from "react-router-dom";
// import editIcon from "../images/action-icons/edit.png";
// import deleteIcon from "../images/action-icons/delete.png";
// import viewIcon from "../images/action-icons/view.png";
// import auditIcon from "../images/action-icons/audit.png";
// import userIcon from "../images/action-icons/user-assignment.png";
// import reviewIcon from "../images/action-icons/view.png";
// import activateIcon from "../images/action-icons/activated.png";
// import deactivateIcon from "../images/action-icons/deactive.png";
// import deleteOrangeIcon from "../images/action-icons/delete-orange.png";
// import downloadIcon from "../images/action-icons/download.png";
// import queryIcon from "../images/action-icons/query.png";
// import AssigneedAvatar from "./AssigneedAvatar";
// import "./CommonActionIcons.css";


// const ICONS = {
//   edit: editIcon,
//   delete: deleteIcon,
//   view: viewIcon,
//   audit: auditIcon,
//   userAssign: userIcon,
//   review: reviewIcon,
//   activate: activateIcon,
//   deactivate: deactivateIcon,
//   deleteOrangeIcon: deleteOrangeIcon,
//   download: downloadIcon,
//   query: queryIcon
// };

// const CommonActionIcons = ({ actions = [] }) => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     if (!menuOpen) return undefined;

//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setMenuOpen(false);
//       }
//     };

//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, [menuOpen]);

//   if (!actions.length) {
//     return null;
//   }

//   const primaryActionIndex = actions.findIndex(
//     (action) => action.type === "userAssign" && action.userName
//   );
//   const selectedIndex = primaryActionIndex >= 0 ? primaryActionIndex : 0;
//   const primaryAction = actions[selectedIndex];
//   const overflowActions = actions.filter((_, idx) => idx !== selectedIndex);

//   const renderActionIcon = (action) => {
//     const isDelete = action.type === "delete";
//     if (action.type === "userAssign" && action.userName) {
//       return (
//         <AssigneedAvatar
//           user={{ name: action.userName }}
//           onChange={(value) => {
//             if (action.onChange) {
//               action.onChange(value);
//             }
//           }}
//           checked={true}
//           hideOption={true}
//         />
//       );
//     }

//     const icon = ICONS[action.type] || ICONS.userAssign;
//     return (
//       <img
//         src={isDelete ? deleteOrangeIcon : icon}
//         alt={action.label}
//         className="icon-img"
//       />
//     );
//   };

//   const handleMenuItemClick = (action) => {
//     setMenuOpen(false);
//     if (action.onClick) {
//       action.onClick();
//     }
//   };

//   return (
//     <div className="d-flex gap-2 align-items-center position-relative">
//       {primaryAction && (
//         <div className="d-inline-block">
//           {primaryAction.redirectUrl ? (
//             <Link to={primaryAction.redirectUrl} title={primaryAction.label}>
//               <button
//                 className="action-icon-btn"
//                 disabled={primaryAction.disabled}
//                 type="button"
//                 style={{border:'none'}}
//               >
//                 {renderActionIcon(primaryAction)}
//               </button>
//             </Link>
//           ) : (
//             <button
//               title={primaryAction.label}
//               className="action-icon-btn"
//               onClick={primaryAction.onClick}
//               disabled={primaryAction.disabled}
//               type="button"
//               style={{border:'none'}}
//             >
//               {renderActionIcon(primaryAction)}
//             </button>
//           )}
//         </div>
//       )}

//       {overflowActions.length > 0 && (
//         <div className="position-relative" ref={menuRef}>
//           <button
//             className="action-icon-btn"
//             type="button"
//             aria-haspopup="true"
//             aria-expanded={menuOpen}
//             onClick={() => setMenuOpen((prev) => !prev)}
//             style={{border:'none'}}
//           >
//             <span className="action-more-icon">⋮</span>
//           </button>

//           {menuOpen && (
//             <div
//               className="action-menu shadow-sm rounded bg-white border"
//               // style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 1000, minWidth: 170 }}
//               style={{
//   position: "absolute",
//   right: 0,
//   top: "calc(100% + 4px)",
//   zIndex: 9999, // increase this
//   minWidth: 170
// }}
//             >
//               {overflowActions.map((action, idx) => {
//                 const itemKey = `${action.type}-${idx}`;
//                 const itemContent = (
//                   <button
//                     type="button"
//                     className="action-menu-item d-flex align-items-center w-100 text-start px-2 py-1 border-0 bg-transparent"
//                     onClick={() => handleMenuItemClick(action)}
//                     disabled={action.disabled}
//                   >
//                     <span className="me-2">
//                       {action.type === "userAssign" && action.userName ? (
//                         <AssigneedAvatar
//                           user={{ name: action.userName }}
//                           checked={true}
//                           hideOption={true}
//                         />
//                       ) : (
//                         <img
//                           src={action.type === "delete" ? deleteOrangeIcon : ICONS[action.type]}
//                           alt={action.label}
//                           className="icon-img"
//                           style={{ width: 16, height: 16 }}
//                         />
//                       )}
//                     </span>
//                     <span>{action.label}</span>
//                   </button>
//                 );

//                 return action.redirectUrl ? (
//                   <Link
//                     key={itemKey}
//                     to={action.redirectUrl}
//                     className="d-block text-decoration-none text-dark"
//                   >
//                     {itemContent}
//                   </Link>
//                 ) : (
//                   <div key={itemKey}>{itemContent}</div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CommonActionIcons;


import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";

import editIcon from "../images/action-icons/edit.png";
import deleteIcon from "../images/action-icons/delete.png";
import viewIcon from "../images/action-icons/view.png";
import auditIcon from "../images/action-icons/audit.png";
import userIcon from "../images/action-icons/user-assignment.png";
import reviewIcon from "../images/action-icons/view.png";
import activateIcon from "../images/action-icons/activated.png";
import deactivateIcon from "../images/action-icons/deactive.png";
import deleteOrangeIcon from "../images/action-icons/delete-orange.png";
import downloadIcon from "../images/action-icons/download.png";
import queryIcon from "../images/action-icons/query.png";

import AssigneedAvatar from "./AssigneedAvatar";
import Divider from "@mui/material/Divider";
import "./CommonActionIcons.css";

const ICONS = {
  edit: editIcon,
  delete: deleteIcon,
  view: viewIcon,
  audit: auditIcon,
  userAssign: userIcon,
  review: reviewIcon,
  activate: activateIcon,
  deactivate: deactivateIcon,
  deleteOrangeIcon: deleteOrangeIcon,
  download: downloadIcon,
  query: queryIcon
};

const CommonActionIcons = ({ actions = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (!actions.length) return null;

  const primaryActionIndex = actions.findIndex(
    (action) => action.type === "userAssign" && action.userName
  );

  const selectedIndex = primaryActionIndex >= 0 ? primaryActionIndex : 0;
  const primaryAction = actions[selectedIndex];
  const overflowActions = actions.filter((_, idx) => idx !== selectedIndex);

  const renderActionIcon = (action) => {
    const isDelete = action.type === "delete";

    if (action.type === "userAssign" && action.userName) {
      return (
        <AssigneedAvatar
          user={{ name: action.userName }}
          checked={true}
          hideOption={true}
        />
      );
    }

    const icon = ICONS[action.type] || ICONS.userAssign;

    return (
      <img
        src={isDelete ? deleteOrangeIcon : icon}
        alt={action.label}
        className="icon-img"
      />
    );
  };

  const handleMenuToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.right - 170
    });

    setMenuOpen((prev) => !prev);
  };

  const handleMenuItemClick = (action) => {
    setMenuOpen(false);
    action.onClick && action.onClick();
  };

  return (
    <div className="d-flex gap-2 align-items-center">
      {/* Primary Action */}
      {primaryAction && (
        <div>
          {primaryAction.redirectUrl ? (
            <Link to={primaryAction.redirectUrl} state={{ displayName: primaryAction.displayName || "" }}>
              <button className="action-icon-btn" style={{ border: "none" }}>
                {renderActionIcon(primaryAction)}
              </button>
            </Link>
          ) : (
            <button
              className="action-icon-btn"
              onClick={primaryAction.onClick}
              style={{ border: "none" }}
            >
              {renderActionIcon(primaryAction)}
            </button>
          )}
        </div>
      )}

      {/* Three Dot Menu */}
      {overflowActions.length > 0 && (
        <>
          <button
            ref={buttonRef}
            className="action-icon-btn"
            onClick={handleMenuToggle}
            style={{ border: "none" }}
          >
            <span className="action-more-icon">⋮</span>
          </button>

          {menuOpen &&
            createPortal(
              <div
                ref={menuRef}
                className="action-menu shadow-sm rounded border"
                style={{
                  position: "fixed",
                  top: menuPosition.top,
                  left: menuPosition.left,
                  zIndex: 9999,
                  minWidth: 170,
                  background: "#fff"
                }}
              >
                {overflowActions.map((action, idx) => {
                  const item = (
                    <>
                      <button
                      key={idx}
                      className="action-menu-item d-flex align-items-center w-100 px-2 py-2 border-0 bg-transparent"
                      onClick={() => handleMenuItemClick(action)}
                    >
                      <span className="me-2">
                        {action.type === "userAssign" && action.userName ? (
                          <AssigneedAvatar
                            user={{ name: action.userName }}
                            checked={true}
                            hideOption={true}
                          />
                        ) : (
                          <img
                            src={
                              action.type === "delete"
                                ? deleteOrangeIcon
                                : ICONS[action.type]
                            }
                            alt={action.label}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </span>
                      <span className="mx-2">{action.label}</span>
                    </button>
                     <Divider/>

                    </>
                  
                  );

                  return action.redirectUrl ? (
                    <>
                    <Link
                      key={idx}
                      to={action.redirectUrl}
                      className="text-decoration-none text-dark"
                      state={{displayName: action.displayName || ""}}
                    >
                      {item}
                    </Link>
                     {/* Divider */}
                     {/* <Divider/> */}
                    </>
                    
                  ) : (
                    item
                  );
                })}
              </div>,
              document.body
            )}
        </>
      )}
    </div>
  );
};

export default CommonActionIcons;