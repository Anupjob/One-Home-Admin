import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { userDetails } from "../Services/authenticationService";
import getApiCall from "../Services/getApiCall";
import Tooltip from "./Tooltip"; // Merged JS + CSS
import '../css/leftbar.css';

export default function Header({permissions}) {
  const [sidebarShow, setSidebarShow] = useState(false);
  // const [permissions, setPermissions] = useState([]);
  const [activeItemId, setActiveItemId] = useState(null);
  const [activeParentId, setActiveParentId] = useState(null);
  const [tooltip, setTooltip] = useState({ text: "", position: null });

  const sidebarToggle = () => setSidebarShow(!sidebarShow);

  // const renderSideHeader = async () => {
  //   const userDetailsData = userDetails();
  //   const url = `admin/modules/list11/${userDetailsData?.id}/${userDetailsData?.partnerDetails[0]?._id}/${userDetailsData?.roles?._id}`;
  //   const data = await getApiCall(url);
  //   setPermissions(data.data);
  // };

  // useEffect(() => {
  //   renderSideHeader();
  // }, []);

  const location = useLocation();

useEffect(() => {
  const path = location.pathname;

  permissions.forEach((module, i) => {
    if (module.modules?.length > 0) {
      module.modules.forEach((childModule, index) => {
        if (childModule.url === path) {
          setActiveItemId(`${i}-${index}`);
          setActiveParentId(i);
        }
      });
    } else {
      if (module.url === path) {
        setActiveItemId(`link-${i}`);
        setActiveParentId(null);
      }
    }
  });

  if (path === "/home") {
    setActiveItemId("dashboard");
    setActiveParentId(null);
  }
}, [location.pathname, permissions]);

  const showTooltip = (event, text) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      text,
      position: {
        top: rect.top + window.scrollY + rect.height / 2 - 15,
        left: rect.right + 12
      },
    });
  };

  const hideTooltip = () => {
    setTooltip({ text: "", position: null });
  };

  const getIconClass = (icon) => {
  if (!icon) return "bi bi-box-arrow-up-right";

  // already full class e.g. "bi bi-alarm"
  if (icon.includes("bi ")) return icon;

  // icon name only e.g. "alarm" OR "bi-alarm"
  return icon.startsWith("bi-") ? `bi ${icon}` : `bi bi-${icon}`;
  };

  return (
    <div className={`leftbar ${!sidebarShow ? "short" : "full"}`} id="accordionSidebar">
      <div className="toggler" onClick={sidebarToggle}>
        <img src="/sidebar_toggle.png" alt="Toggle" />
      </div>

      <Link
        className={`${sidebarShow?'module':'module-mob'} ${activeItemId === "dashboard" ? "active" : ""}`}
        to="/home"
        onClick={() => {
          setActiveItemId("dashboard");
          setActiveParentId(null);
          document.querySelectorAll('.collapse.show').forEach(menu => menu.classList.remove('show'));
        }}
        onMouseEnter={(e) => !sidebarShow && showTooltip(e, "Home")}
        onMouseLeave={hideTooltip}
      >
        <i className="bi bi-house-door-fill"></i>
        <span className={sidebarShow?"module_name":"module_name_mob"}>Home</span>
      </Link>

      {permissions.map((module, i) => {
        const collapseId = `collapse-${i}-${module.displayName.replace(/\s+/g, "-")}`;
        const isActiveParent = activeParentId === i;

        if (!sidebarShow) {
          // Short Mode: Only children as modules
          if (module?.modules?.length > 0) {
            return module.modules.map((childModule, index) => {
              const isActiveChild = location.pathname === childModule.url;
              return (
                <Link
                  key={`short-child-${i}-${index}`}
                  to={childModule.url}
                  className={`module-mob ${isActiveChild ? "active" : ""}`}
                  onClick={() => {
                    setActiveItemId(`short-${i}-${index}`);
                    setActiveParentId(null);
                  }}
                  onMouseEnter={(e) => showTooltip(e, childModule.displayName)}
                  onMouseLeave={hideTooltip}
                >
                 <i className={`bi ${getIconClass(childModule.icon)}`}></i>
                 <span className="module_name_mob">{childModule.displayName}</span>
                </Link>
              );
            });
          } else {
            const isActiveLink = location.pathname === module.url;
            return (
              <Link
                key={`short-link-${i}`}
                to={module.url}
                className={`module-mob ${isActiveLink ? "active" : ""}`}
                onClick={() => {
                  setActiveItemId(`short-link-${i}`);
                  setActiveParentId(null);
                }}
                onMouseEnter={(e) => showTooltip(e, module.displayName)}
                onMouseLeave={hideTooltip}
              >
               <i className={`bi ${getIconClass(module.icon)}`}></i>
               <span className="module_name_mob">{module.displayName}</span>
              </Link>
            );
          }
        } else {
          // Full Mode: Show folders and children
          if (module?.modules?.length > 0) {
            return (
              <div className="folder" key={`folder-${i}`}>
                <a
                  className={`module fl collapsed ${isActiveParent ? "active" : ""}`}
                  href={`#${collapseId}`}
                  data-toggle="collapse"
                  data-target={`#${collapseId}`}
                  aria-expanded="false"
                  aria-controls={collapseId}
                  onMouseEnter={(e) => showTooltip(e, module.displayName)}
                  onMouseLeave={hideTooltip}
                >
                  <i className="bi bi-folder"></i>
                  {sidebarShow && <span className="module_name">{module.displayName}</span>}
                </a>

                <div
                  id={collapseId}
                  className="collapse"
                  data-parent="#accordionSidebar"
                  aria-labelledby={`heading-${collapseId}`}
                >
                  {module.modules.map((childModule, index) => {
                    const isActiveChild = activeItemId === `${i}-${index}`;
                    return (
                      <Link
                        key={`child_${i}_${index}`}
                        to={childModule.url}
                        className={`module ${isActiveChild ? "active" : ""}`}
                        onClick={() => {
                          setActiveItemId(`${i}-${index}`);
                          setActiveParentId(i);
                        }}
                        onMouseEnter={(e) => showTooltip(e, childModule.displayName)}
                        onMouseLeave={hideTooltip}
                      >
                       <i className={`bi ${getIconClass(childModule.icon)}`}></i>
                        {sidebarShow && <span className="module_name">{childModule.displayName}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          } else {
            const isActiveLink = activeItemId === `link-${i}`;
            return (
              <Link
                key={`link-${i}`}
                to={module.url}
                className={`module ${isActiveLink ? "active" : ""}`}
                onClick={() => {
                  setActiveItemId(`link-${i}`);
                  setActiveParentId(null);
                  document.querySelectorAll('.collapse.show').forEach(menu => menu.classList.remove('show'));
                }}
                onMouseEnter={(e) => showTooltip(e, module.displayName)}
                onMouseLeave={hideTooltip}
              >
               <i className={`bi ${getIconClass(module.icon)}`}></i>
                {sidebarShow && <span className="module_name">{module.displayName}</span>}
              </Link>
            );
          }
        }
      })}
     
                                {/* <Link className="nav-link" to={`/workflow_listings`}>
                                     <i className="bi bi-box-arrow-up-right"></i>
                                    <span>WorkFlow Management</span></Link> */}
      {/* Tooltip shown only in short sidebar mode */}
      {tooltip.text && !sidebarShow && <Tooltip text={tooltip.text} position={tooltip.position} />}
    </div>
  );
}
