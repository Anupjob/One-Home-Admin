import React, { useEffect, memo } from "react";
import { Link } from "react-router";
import PaginationNew from "../Widgets/PaginationNew";
import './CommonTable.css';
import { toTitleCase } from './Helpers';

const CommonTable = ({
  formattedData,
  perPage,
  totalItems,
  currentPage,
  handler,
  isActionStricky,
  maxWidth = "150px",
  filters = null
}) => {

  useEffect(() => {
    const actionCells = document.querySelectorAll('.sticky-action-column');
    const statusCells = document.querySelectorAll('.sticky-status-column');
    if (!actionCells.length) return;
    const actionWidth = actionCells[0].offsetWidth;
    actionCells.forEach(cell => {
      cell.style.right = '0px';
    });
    statusCells.forEach(cell => {
      cell.style.right = `${actionWidth}px`;
    });
  }, [formattedData]);

  if (!formattedData || formattedData.length === 0) return (
    <>
    {filters &&
        <div className="card-body d-none d-md-block" style={{padding: "0px 0px 20px 0px"}}>
          <div >
            {filters}
          </div>
        </div>
      }
    <div className="text-center">No Records Found</div>
    </>
  );

  const tableHeaders = formattedData[0].data.map((col) => col.label);
  console.log('tableHeaders:::::', tableHeaders, formattedData)
  const truncateText = (text, length = 1000) => {
    if (!text) return "";
    return text.length > length ? text.slice(0, length) + "..." : text;
  };
  console.log("hhh111 formattedData111 = ", formattedData);

  return (
    <>
    
     {filters &&
        <div className="card-body d-none d-md-block" style={{padding: "0px 0px 20px 0px"}}>
          <div >
            {filters}
          </div>
        </div>
      }
     <div className="table-container-wrapper">
      <div className="table-wrapper" style={{ maxHeight: "500px", overflow: "auto" }}>
        <table
          className="table table-hover mb-0 common-table"
          style={{ whiteSpace: "nowrap" }}
        >
          <thead className="custom-table-header">
            <tr>
              {formattedData[0].data.map((header, idx) => (
                <th
                  key={idx}
                  // className={
                  //   header.label.trim() === "Status" && header.isStricky
                  //     ? "sticky-right1 sticky-status-column"
                  //     : header.isStricky
                  //       ? "sticky-first-column"
                  //       : ""
                  // }
                  className={
                    header.isStricky ? "sticky-first-column" : ""
                  }
                  style={{ fontWeight: 500 }}
                >
                  {header.label}
                </th>
              ))}

              {formattedData[0].isAction && (
                <th
                  className={
                    isActionStricky
                      ? "sticky-right sticky-action-column"
                      : ""
                  }
                  style={{ fontWeight: 500, backgroundColor: "#F3F3FA" }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {formattedData.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {item.data.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    // className={
                    //   col.label.trim() === "Status" && col.isStricky
                    //     ? "sticky-right sticky-status-column"
                    //     : col.isStricky
                    //       ? "sticky-first-column"
                    //       : ""
                    // }
                     className={
                    col.isStricky ? "sticky-first-column" : ""
                  }
                    style={{ fontWeight: 500, color: "#101828" }}
                  >
                    {col.label.trim() === "Status" ? (
                      <span
                        className={`status-badge status-${col.value?.toLowerCase()}`}
                      >
                        {col.value ? toTitleCase(col.value) : "-"}
                      </span>
                    ) : col.isImage ? (
                      <img src={col.value} height="50" width="50" alt="field" />
                    ) : col.isLink ? (
                      <Link to={col.linkUrl} style={{ textDecoration: "underline" }}>{col.value}</Link>
                    ) : (
                      <span
                        title={col.value}
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "pointer",
                          wordBreak: "break-word",
                          whiteSpace: "initial"
                        }}
                      >
                        {col.value ? truncateText(col.value) : "-"}
                      </span>
                    )}
                  </td>
                ))}

                {item.actionButtons && (
                  <td className={isActionStricky ? "sticky-right sticky-action-column" : ""}>
                    {item.actionButtons}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-wrapper">
        <PaginationNew
          perPage={perPage}
          totalItems={totalItems}
          currentPage={currentPage}
          handler={handler}
        />
      </div>
    </div>
    
    </>
   
  );
};

export default memo(CommonTable);
