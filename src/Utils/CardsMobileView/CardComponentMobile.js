import React, { useState } from "react";
import "./MobileUI.css";
import { useNavigate } from "react-router";
import { Link } from "react-router";

const CardComponentMobile = ({
  header,
  data,
  status,
  onDelete,
  onEdit,
  onAudit,
  onApprove,
  isAction,
  url,
  actionButtons
}) => {
  const [expandedFields, setExpandedFields] = useState({});
  const navigation = useNavigate()
  const getStatusColor = () => {
    switch (status) {
      case "Approved":
      case "Done":
        return "bg-success text-white";
      case "Pending":
        return "bg-warning text-dark";
      case "Rejected":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  // Split fields into rows of 3
  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const rows = chunkArray(data, 2);
  const statusField = data?.find((field) => field.label?.trim() === "Status");
  const prospectField = data?.find((field) => field.label?.trim() === "Prospect No");
  const linkField = data?.find(field => field.isLink && field.linkUrl);

  console.log('rows:::::111',rows, data)
 
  const truncateText = (text, length = 1000) => {
    if (!text) return "";
    return text.length > length ? text.slice(0, length) + "..." : text;
  };
  const toggleExpand = (rowIdx, fieldIdx) => {
    setExpandedFields((prev) => ({
      ...prev,
      [`${rowIdx}-${fieldIdx}`]: !prev[`${rowIdx}-${fieldIdx}`],
    }));
  };
  
  const handleCard = () => {
  if (linkField?.linkUrl) {
    navigation(linkField.linkUrl); // priority to field link
  } else if (url) {
    navigation(url); // fallback
  }
};

console.log("dddd111= ",data);
console.log("dddd prospectField = ",prospectField);
console.log("sss111 rows = ",rows);



  return (
    <div className="card card-custom mb-3"
      // onClick={() => {
      //   if (url || linkField?.linkUrl) handleCard();
      // }}
    >
      {/* Header */}
      <div className="card-header card-custom-header">
        {isAction &&
          <div className="d-flex justify-content-between align-items-center">
            <div className="idtxt">{prospectField?.value ? prospectField?.value : rows[0]?.[0]?.value || ''}</div>

            <div className="card-footer-icons">
              {actionButtons}
            </div>
          </div>

        }
      </div>

      {/* Body */}
      <div
        className="card-body card-custom-body"
         onClick={() => {
        if (url || linkField?.linkUrl) handleCard();
      }}
      >
        {statusField && (
          <span className={`status-badge status-${statusField.value?.toLowerCase()}`} style={{ margin: "2px 2px 10px -8px" }}>
            {statusField?.value?.toLowerCase()?.replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        )}
        {rows.map((row, rowIdx) => (
          <div className="row card-field" key={rowIdx}>
            {row.map((field, fieldIdx) => {
              // ✅ Hide first item (rows[0][0])
              if (rowIdx === 0 && fieldIdx === 0) {
                return null;
              }
              if (rowIdx >= 3) return null;
              if (field.label?.trim() === "Status") {
                return null; // Status badge moved to footer
              }
              return (
                <div className="col-12" key={fieldIdx} style={{ marginBottom: '10px' }} >
                  <span className="label">{field.label} : </span>
                  {/* <br /> */}
                  {field.isImage ? (
                    <img
                      src={field.value}
                      height="50px"
                      width="50px"
                      alt="field"
                    />
                  ) : field.isLink ? (
                    <Link to={field.linkUrl}
                      onClick={(e) => e.stopPropagation()}
                    >{field.value}</Link>
                  ) : (
                    <span
                      className="value"
                      title={field.value}

                      onClick={() => toggleExpand(rowIdx, fieldIdx)}
                    >
                      {expandedFields[`${rowIdx}-${fieldIdx}`]
                        ? field.value
                        : truncateText(field.value)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardComponentMobile;
