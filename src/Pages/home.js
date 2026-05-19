import Layout from "../Layout";
import getApiCall from "../Services/getApiCall";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userDetails } from "../Services/authenticationService";
import '../css/homepostlogin.css';
import Modal from 'react-bootstrap/Modal';
import IconSelector from "./FormBuilder/IconSelector";
import postApiCall from "../Services/postApiCall";
import { toast } from "react-toastify";
import RefreshIcon from '../img/refresh.svg'

export default function Dashboard({permissions,getModuleData}) {
  // const [permissions, setPermissions] = useState([]);
  const [showIconModal, setShowIconModal] = useState(false);
  const user = userDetails();
  console.log('user::::::',user)
  const [data, setData] = useState({
    moduleId:'',
    icon:''
  })

  // colours to use for card icon bg, bullet and title text
  const colorPalette = ['#CE1179', '#326212', '#082E6D', '#AD4973', '#519115', '#ED8600', '#253858', '#C65941', '#EBAD42', '#4A90E2'];
  const getColor = idx => colorPalette[idx % colorPalette.length];
  // useEffect(() => {
  //   getModuleData();
  // }, []);

  // async function getModuleData() {
  //   const url = `admin/modules/list33/${user?.id}/${user?.partnerDetails[0]?._id}/${user?.roles?._id}`;
  //   try {
  //     const res = await getApiCall(url);
  //     setPermissions(res.data || []);
  //   } catch (error) {
  //     console.error("Error fetching modules:", error);
  //   }
  // }

  // Split modules
  const standaloneModules = permissions?.filter(
    (mod) => !Array.isArray(mod.modules) || mod.modules.length === 0
  );

  const folderModules = permissions?.filter(
    (mod) => Array.isArray(mod.modules) && mod.modules.length > 0
  );
  const [selectedTab, setSelectedTab] = useState('All Modules');
  const tabs = ['All Modules', ...(folderModules || []).map(f => f.displayName)];

  const handleEdit =(module)=>{
    setShowIconModal(true)
    setData(prev=>({...prev, moduleId:module._id, icon:module.icon}))
  }

  async function updateModuleIcon(icon) {
    let body = {
      icon
    }
    const url = `admin/modules/update-icon/${data?.moduleId}`;
    try {
      const res = await postApiCall(url, body);
      if (res.meta.status) {
        toast.success(res.meta.msg)
        setShowIconModal(false);
        getModuleData()
      }
      else {
        toast.error(res.meta.msg)
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }

  const getIconClass = (icon) => {
  if (!icon) return "bi bi-box-arrow-up-right";

  // already full class e.g. "bi bi-alarm"
  if (icon.includes("bi ")) return icon;

  // icon name only e.g. "alarm" OR "bi-alarm"
  return icon.startsWith("bi-") ? `bi ${icon}` : `bi bi-${icon}`;
  };

  return (
      <div className="container-fluid">
        {/* <div className="main-title">
          <h1>Start, Explore, or Manage </h1>
          <h2>Access everything you need in one place — pick what fits your flow.</h2>
        </div> */}

        {/* Tabs (chips) */}
        <div className="module-tabs mb-3" style={{marginTop:"15px"}}>
          {tabs.map((t) => (
            <button
              key={t}
              className={`chip ${t === selectedTab ? 'chip-active' : ''}`}
              onClick={() => setSelectedTab(t)}
              style={{ marginRight: 2 }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content for selected tab */}
        {selectedTab === 'All Modules' ? (
          <>
            {/* Single module grid containing standalone modules followed immediately by folder children */}
            <div className="module-grid">
              {standaloneModules?.map((mod, i) => {
                const color = getColor(i);
                return (
                <div key={`standalone-${i}`} className="module-card">
                  {user?.role?.toLowerCase() === 'admin' && (
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(mod)}
                      title="Edit Module"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  )}
                  <Link to={mod.url} state={{displayName: mod.displayName}}>
                    <div
                      className={`cardicon bi ${getIconClass(mod.icon)}`}
                      style={{ backgroundColor: color }}
                    ></div>
                    <div className="module-card-title" style={{ color }}>
                      {mod.displayName}
                    </div>
                    <div className="divider"></div>
                    <div className="d-flex justify-content-end align-items-center bullet-text ">
                        {mod.assignedTaskCount>0&&(<>
                        <div
                          className="d-inline-flex align-items-center gap-3 px-2"
                          style={{
                            backgroundColor: "#FFF7ED", // warning light bg
                            color: "#0F172B",           // warning text color
                            borderRadius: "15px",
                            fontSize: "14px",
                            fontWeight: "500",
                            height: '25px',
                            width: '52px',
                          }}
                        >
                          <img src={RefreshIcon} alt="logout" className="mr-2" />
                          <span className="mx-0-">{mod.assignedTaskCount}</span>
                        </div>
                        </>)}
                          </div>
                    {/* <div className="bullet-text">
                      {/* <span className="bullet" style={{ backgroundColor: color }}></span>
                      <span style={{ color }}>{mod.displayName}</span> 
                    </div> */}
                  </Link>
                </div>
                );
              })}

              {folderModules?.flatMap((folder) =>
                folder.modules.map((child, j) => {
                  const color = getColor(j);
                  return (
                  <div key={`folderchild-${folder.displayName}-${j}`} className="module-card">
                    {user?.role?.toLowerCase() === 'admin' && (
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(child)}
                        title="Edit Module"
                      >
                        <i className="bi bi-pencil" style={{ color: '#fff' }}></i>
                      </button>
                    )}
                    <Link to={child.url} state={{displayName: child.displayName}}>
                      <div
                        className={`cardicon bi ${getIconClass(child.icon)}`}
                        style={{ backgroundColor: color }}
                      ></div>
                      <div className="module-card-title" style={{ color }}>
                        {child.displayName}
                      </div>
                      <div className="divider"></div>
                      <div className="d-flex justify-content-between align-items-center bullet-text ">
                            <div>
                            <span className="bullet" style={{ backgroundColor: color }}></span>
                            {/* <span style={{ color }}>{child.displayName} 111</span> */}
                            <span style={{ color }}>{folder.name}</span>
                            </div>
                            {child.assignedTaskCount>0&&(<>
                            <div
                          className="d-inline-flex align-items-center gap-3 px-2"
                          style={{
                            backgroundColor: "#FFF7ED", // warning light bg
                            color: "#0F172B",           // warning text color
                            borderRadius: "15px",
                            fontSize: "14px",
                            fontWeight: "500",
                            height: '25px',
                            width: '52px'
                          }}
                        >
                          <img src={RefreshIcon} alt="logout" className="mr-2" />
                          <span className="mx-0-">{child.assignedTaskCount}</span>
                        </div>
                        </>)}
                          </div>
                      {/* <div className="bullet-text">
                        <span className="bullet" style={{ backgroundColor: color }}></span>
                        {/* <span style={{ color }}>{child.displayName}</span>
                        <span style={{ color }}>{folder.name}</span>
                      </div> */}
                    </Link>
                  </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          // Find matching folder and show only its children
          (() => {
            const folder = (folderModules || []).find(f => f.displayName === selectedTab);
            if (!folder) return null;
            return (
              <div className="folder-section">
                {/* <h2 className="folder-title">{folder.displayName}</h2> */}
                <div className="module-grid">
                  {folder.modules.map((child, j) => {
                    const color = getColor(j);
                    return (
                      <div key={j} className="module-card">
                        {user?.role?.toLowerCase() === 'admin' && (
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(child)}
                            title="Edit Module"
                          >
                            <i className="bi bi-pencil" style={{ color: '#fff' }}></i>
                          </button>
                        )}
                        <Link to={child.url} state={{displayName: child.displayName}}>
                          <div
                            className={`cardicon bi ${getIconClass(child.icon)}`}
                            style={{ backgroundColor: color }}
                          ></div>
                          <div className="module-card-title" style={{ color }}>
                            {child.displayName}
                          </div>
                          <div className="divider"></div>
                          <div className="d-flex justify-content-between align-items-center bullet-text ">
                            <div>
                            <span className="bullet" style={{ backgroundColor: color }}></span>
                            {/* <span style={{ color }}>{child.displayName} 111</span> */}
                            <span style={{ color }}>{folder.name}</span>
                            </div>
                            {child.assignedTaskCount>0&&(<>
                            <div
                          className="d-inline-flex align-items-center gap-3 px-2"
                          style={{
                            backgroundColor: "#FFF7ED", // warning light bg
                            color: "#0F172B",           // warning text color
                            borderRadius: "15px",
                            fontSize: "14px",
                            fontWeight: "500",
                            height: '25px',
                            width: '52px'
                          }}
                        >
                          <img src={RefreshIcon} alt="logout" className="mr-2" />
                          <span className="mx-0-">{child.assignedTaskCount}</span>
                        </div>
                         </>)}
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()
        )}

        {/* Optional "Add Module" */}
        {/* <h2 className="folder-title">Add Module</h2>
        <div className="module-grid">
          <div className="module-card">
            <Link to="/form-listing" className="add-module-link">
            <div className="cardicon bi bi-plus"></div>
              Add Module
            </Link>
          </div>
        </div> */}

         <Modal
          show={showIconModal}
          onHide={() => setShowIconModal(false)}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Select Icon</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <IconSelector
              selectedIcon={data.icon}
              onSelect={(icon) => {
                updateModuleIcon(icon)
              }}
            />
          </Modal.Body>
        </Modal>
      </div>
  );
}
