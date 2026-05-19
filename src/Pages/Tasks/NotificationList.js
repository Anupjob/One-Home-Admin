import React, { useState, useEffect } from "react";
import { Form, InputGroup } from "react-bootstrap";
import moment from "moment";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";
import CustomButton from "../../Utils/CustomButton";
import NotifiocationIocn from "../../images/notification/notification-page-icon.png";
import PaginationNew from "../../Widgets/PaginationNew";
import Constant from "../../Components/Constant";
import getApiCall from "../../Services/getApiCall";
import { toast } from "react-toastify";
import postApiCall from "../../Services/postApiCall";
import { toTitleCase } from "../../Utils/Helpers";

const NotificationList = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [perPage, setPerPage] = useState(Constant.perPage);
  const [isLoaded, setIsLoaded] = useState(false);

  const [notifications, setNotifications] = useState([]);
  function pageChangeHandler(page) {
    if (isLoaded) {
      setPageNo(page);
      // getList(page);
    }
  }
  /* ---------------- FILTER ---------------- */
  const filteredNotifications = notifications.filter((n) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "read" && n.action=="READ") ||
      (activeTab === "unread" && n.action!=="READ");
    return matchesTab;
  });

  const getNotifications = async (isFilterApplied = false) => {
    let params = {
      page: pageNo,
      limit: perPage,
      sorting: 'desc',
      isPending: false,
      search: search
    }
    let response = await getApiCall(`admin/notification/get-notifications`, params);
    if (response.meta.status === true) {
      setNotifications(response.data)
      setPendingCount(response.meta.pendingActionCount || 0)
      setTotalItems(response.meta.total || 0)
      if(response.meta.pendingActionCount>0){
       handleStatusUpdate()
      }
    } else {
      // setNotifications([]); // Clear city list if no cities are found
    }
  };
  useEffect(() => {
    if(search?.length>0){
    const handler = setTimeout(() => {
      getNotifications()
    }, 2000);
    return () => clearTimeout(handler);
  }else{
    getNotifications()
  }
  }, [search])

  const groupByDate = (list) => {
  return list.reduce((acc, item) => {
    const created = moment(item.createdAt);
    let key = moment(created).format('MMM d, yyyy');

    if (created.isSame(moment(), "day")) {
      key = "Today";
    } else if (created.isSame(moment().subtract(1, "day"), "day")) {
      key = "Yesterday";
    }

    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
};

  const grouped = groupByDate(filteredNotifications);
  const timeLabel = (date) => moment(date).fromNow();

  const handleStatusUpdate = async () => {
    let payload = {
    }
    let response = await postApiCall(`admin/notification/mark-read`, payload);
    if (response.meta.status === true) {
      toast.success(response.meta.msg)
    } else {
      toast.error(response.meta.msg)
    }
  }
  return (
    <div className="container-fluid">
      <div className="main-title">
        <FilterWithButtonsCard title="Notifications" />
      </div>

      <div className="card shadow-sm">
        {/* 🔍 SEARCH */}
        <div className="card-header bg-white">
          <div className="position-relative mb-3">
            <i
              className="bi bi-search position-absolute"
              style={{
                top: "50%",
                left: "12px",
                transform: "translateY(-50%)",
                color: "#6c757d"
              }}
            />

            <Form.Control
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "38px" }}
            />
          </div>


          {/* 🔘 CUSTOM TABS */}
          {/* <div className="d-flex border rounded overflow-hidden mt-3 w-sm-100 w-md-20">
            {["unread", "read", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-fill py-2 fw-semibold border-0 ${activeTab === tab ? "text-white" : "text-dark"
                  }`}
                style={{
                  backgroundColor:
                    activeTab === tab ? "#ee5819" : "#fff",
                  transition: "0.3s",
                  borderRightColor: 'ActiveBorder',
                  border: '1px outset grey'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div> */}
        </div>

        {/* 📜 LIST */}
        <div
          className="card-body p-0"
          // style={{ maxHeight: "450px", overflowY: "auto" }}
        >
          <div className="px-3 py-2 fw-semibold text-dark" style={{
            background: "#eaecf0",
            borderBottom: "1px solid #e3e6f0"
          }}>
            You have {pendingCount} pending notifications for your review.
          </div>
          {Object.keys(grouped).length === 0 && (
            <div className="text-center text-muted py-4">
              No notifications found
            </div>
          )}

          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div
                className="px-3 py-2 fw-semibold text-dark"
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  fontColor: '#575d68',
                  background: "#fff",
                  borderBottom: "1px solid #e3e6f0"
                }}
              >
                {group}
              </div>

              {items.map((item, i) => (
                <div
                  key={i}
                  className="d-flex flex-column flex-md-row align-items-start px-3 py-3 border-bottom notification-row justify-content-between"
                >
                  {/* ICON */}
                  <div className="d-flex align-items-center justify-content-between w-100 w-md-70">
                    <div className="mr-2">
                      <img
                        src={NotifiocationIocn}
                        alt="icon"
                        width={40}
                        height={40}
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="flex-grow-1">
                      <div style={{color:'#000', fontSize:'15px', fontWeight:500}}>{toTitleCase(item.taskType)}</div>
                      <div style={{color:'#667085',fontSize:'14px', fontWeight:500 }} className="mt-1">
                        {item.message}
                      </div>
                    </div>
                  </div>
                  {/* RIGHT ACTION */}
                  <div className="d-flex align-items-center justify-content-between mt-3 mt-md-0 w-md-30">
                    <div className="mr-5" style={{color:'#667085',fontSize:'14px', fontWeight:500 }}>
                      {timeLabel(item.createdAt)}
                    </div>
                    <div style={{ width: "200px" }}>
                      <CustomButton
                        label="View"
                        updateBgColor="#242056"
                        appendClass="btn btn-sm text-white px-3 w-100"
                        to={item.cta}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="justify-content-center mt-2">
        <PaginationNew
          perPage={perPage}
          totalItems={totalItems}
          currentPage={pageNo}
          handler={pageChangeHandler}
        />
      </div>
    </div>
  );
};

export default NotificationList;
