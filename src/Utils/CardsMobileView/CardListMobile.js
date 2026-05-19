import React, { useState } from "react";
import CardComponentMobile from "./CardComponentMobile";
import { Pagination, Button, Form } from "react-bootstrap";
import "./MobileUI.css";
import PaginationNew from "../../Widgets/PaginationNew";
import FilterPopupMobile from "./FilterPopupMobile";
import SortPopupMobile from "./SortPopupMobile";
import NoData from "./NoDataFound";

const CardListMobile = ({ 
  dataList, 
  perPage, 
  totalItems, 
  currentPage, 
  pageChangeHandler, 
  handleFilter, 
  isAction, 
  onreset,
  children,
}) => {
  console.log('children:::::',children)
  const [popupType, setPopupType] = useState(null); 
  const [filteredData, setFilteredData] = useState(dataList);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isApply, setIsApply] = useState(false)
// console.log('dataList::::::',dataList, pages, currentPage)
  // Convert object {key: val} → [{label, value}]
  // const formatDataFields = (item) =>
  //   Object.entries(item.data).map(([key, value]) => ({
  //     label: key,
  //     value: value,
  //   }));

  // Filtering + Searching
  const handleFilterApply = (e) => {
    handleFilter(e)
    setPopupType(null);
    setIsApply(true)
  };

  // Sorting
  const handleSortApply = (sortBy) => {
    let sorted = [...filteredData];
    if (sortBy === "name") sorted.sort((a, b) => a.header.localeCompare(b.header));
    if (sortBy === "status") sorted.sort((a, b) => a.status.localeCompare(b.status));
    setFilteredData(sorted);
    setPopupType(null);
  };

  // Toggle popup
  const handleIconClick = (type) => {
    setPopupType(popupType === type ? null : type);
  };
  console.log('poptype::::::', popupType)
const handleReset=(e)=>{
  if(onreset){
  onreset(e);
  }
  setPopupType(null);
  setIsApply(false)
}
  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* Top Filter Bar */}
      <div className="top-fixed-bar" 
      style={{ position: 'sticky', top: 0, zIndex: 100, padding: '12px 0px'}}>
        <div className="serch-filter-container">
          <div className="flex-grow-1">
            <div className="position-relative" style={{ width: '100%' }}>
              <i
                className="bi bi-search position-absolute"
                style={{
                  left: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              ></i>
              <input 
                type="text"
                placeholder="Search..."
                className="form-control"
                style={{textIndent: "12px", paddingRight: "2.5rem", fontSize: "12px", height: "36px", borderRadius: '8px', borderColor: isApply ? '#EE5819' : '#344054'}}
                value={searchValue}
                onClick={()=>setPopupType('filter')}
              />
            </div>
          </div>
          <div className="icon-container">
            <i className={`${isApply?'bi-funnel-fill':'bi bi-funnel'} fs-1 icon-design`}  onClick={() => handleIconClick("filter")}></i>
          </div>
        </div>
      </div>

      {/* Cards */}
      {dataList.map((item, idx) => (
        <CardComponentMobile
          key={idx}
          header={item.header}
         data={item.data}
         url={item.url}
          status={item.status}
          actionButtons={item.actionButtons}
          onDelete={() => alert("Delete " + item.header)}
          onEdit={() => alert("Edit " + item.header)}
          onAudit={() => alert("Audit " + item.header)}
          onApprove={() => alert("Approve " + item.header)}
          isAction={item.isAction || isAction}
        />
      ))}

      {dataList?.length==0&&<NoData/>}

      {/* Pagination (parent-controlled) */}
      <div className="d-flex justify-content-center mt-2">
        <PaginationNew
          perPage={perPage}
          totalItems={totalItems}
          currentPage={currentPage}
          handler={pageChangeHandler}
        />
      </div>

      {/* Bottom Popup */}
      {popupType && (<>
        {popupType === "filter" && (
          <FilterPopupMobile 
          show={popupType === "filter"} 
          onClose={handleIconClick} 
          onApply={handleFilterApply}
          onReset={handleReset}
          children={children}/>)}
          {popupType === "sort" && (
            <SortPopupMobile show={popupType === "sort"} onClose={handleIconClick} onApply={handleFilterApply} />
          )}
      </>)}
    </div>
  );
};

export default CardListMobile;
