import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logout, userDetails, selectedPartnerDetails } from "../Services/authenticationService";
import getApiCall from "../Services/getApiCall";
import '../css/topheader.css';
import logoutIcon from '../img/logout.svg';
import taskIcon from '../img/my-task.svg';
import IsAuthenticat from '../IsAuthenticat';
import { useLocation } from 'react-router-dom';
import Login from '../Components/Login';
import { Dropdown } from 'react-bootstrap';
import NotifiocationIocn from '../images/notification/notification-page-icon.png'
import CustomButton from '../Utils/CustomButton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import postApiCall from '../Services/postApiCall';
import { toTitleCase } from '../Utils/Helpers';
import { useUserDetailsStore } from '../Store/userDetailsStore';
import {
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Divider } from '@mui/material';
import Select from 'react-select';

export default function TopHeaderWithMenu() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [openFolders, setOpenFolders] = useState({});
  const [dataFetched, setDataFetched] = useState(false); // ✅ ensures single API call
  const [modalKey, setModalKey] = useState(0);
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [results, setResults] = useState([]);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // API / filter call
  useEffect(() => {
    if (debouncedSearch.length >= 3) {
      handleSearch(debouncedSearch);
    } else {
      setResults([]);
    }
  }, [debouncedSearch]);

  const handleSearch = async (query) => {
    const userDetailsData = userDetails();
    const selectedPartnerData = selectedPartnerDetails();
    let url = '';
    if (selectedPartnerData?._id) {
      url = `admin/modules/list/${userDetailsData?.id}/${selectedPartnerData?._id}/${selectedPartnerData?.roleId}?searchKey=${query}`;
    } else {
      url = `admin/modules/list/${userDetailsData?.id}/${userDetailsData?.partnerDetails[0]?._id}/${userDetailsData?.roles?._id}?searchKey=${query}`;
    }
    const data = await getApiCall(url);

    setResults(data.data);
  };
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // const [selectedPartnerValue, setSelectedPartnerValue] = useState(userDetails()?.partnerDetails[0]?._id || ''); // Default to first partner
  const selectedPartnerValue = useUserDetailsStore((state) => state.selectedPartnerValue);
  const setSelectedPartnerValue = useUserDetailsStore((state) => state.setSelectedPartnerValue);
  const getNotifications = async () => {
    let params = {
      page: 1,
      limit: 10,
      sorting: 'desc',
      isPending: false,
    }
    let response = await getApiCall(`admin/notification/get-notifications`, params);
    if (response.meta.status === true) {
      setNotifications(response.data)
      setPendingCount(response.meta.pendingActionCount || 0)
    } else {
      // setNotifications([]); // Clear city list if no cities are found
    }
  };
  const handleStatusUpdate = async (row) => {
    if (row.action !== "READ") {
      let payload = {
        notificationId: row._id,
      }
      let response = await postApiCall(`admin/notification/mark-read`, payload);
      if (response.meta.status === true) {
        getNotifications()
        window.location.href = row.cta;
        toast.success(response.meta.msg)
      } else {
        toast.error(response.meta.msg)
      }
    }
    else {
      window.location.href = row.cta;
    }
  }

  const hideHeader = location.pathname === "/login";
  const partnerDetails = userDetails()?.partnerDetails || [];
  const hasOnePartner = partnerDetails.length === 1;

  const toggleMenu = async () => {
    if (window.innerWidth < 768) {
      if (!dataFetched) {
        const user = userDetails();
        const url = `admin/modules/list/${user?.id}/${user?.partnerDetails[0]?._id}/${user?.roles?._id}`;
        const res = await getApiCall(url);
        setPermissions(res.data || []);
        setDataFetched(true);
      }
      setMenuOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (IsAuthenticat()) {
      getNotifications()
    }
  }, [])
  const toggleFolder = (index) => {
    if (window.innerWidth < 768) {
      setOpenFolders((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    }
  };
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const postApiByUrl = async (partner) => {
    try {
      const response = await postApiCall(
        `admin/switch-partner/${partner?._id}/${partner?.roleId}`
      );

      return response; // return full response
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const changeLocalStorage = async (data) => {
    localStorage.setItem('loginDetails', data.token);
    localStorage.setItem('userDetails', JSON.stringify(data));
  }


  const handlePartnerChange = async (event) => {
    setSelectedPartnerValue(event.target.value);
    const selectedPartner = userDetails().partnerDetails.find(partner => partner._id === event.target.value);
    console.log("iii partner id id = ", event.target.value);
    console.log("iii selectedPartner id = ", selectedPartner);
    const addPartnerResponse = await postApiByUrl(selectedPartner);
    console.log("iii addPartnerResponse = ", addPartnerResponse);
    if (addPartnerResponse?.meta?.status) {
      localStorage.setItem('selectedPartner', JSON.stringify(selectedPartner));
      await changeLocalStorage(addPartnerResponse?.data);
      window.location.href = '/';
      // navigate('/');

    }

    // if (selectedPartner) {
    //   const updatedUserDetails = {
    //     ...userDetails(),
    //     partnerDetails: [selectedPartner]
    //   };
    //   setUserDetails(updatedUserDetails);
    // }
  };
  return (
    <>
      {
        !hideHeader &&

        <header className="header">
          {
            IsAuthenticat() ?
              hasOnePartner ? (
                <>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
{/* <Link to="/home">
                    <img src="/logo.png" alt="LOGO" className="logo" />
                  </Link>
                  <Divider
                    orientation="vertical"
                    flexItem
                     sx={{
                            borderColor: '#d8d8d8',
                            borderWidth: '1px',
                            alignSelf: 'center',
                            height: '22px',
                            marginTop: '5px',
                            mx: 2,
                            '@media (max-width:600px)': {
                              marginLeft: "4px",
                              marginRight: "0px",
                            }
                          }}
                  /> */}
                  <div style={{ display: 'flex', alignItems: 'center',marginTop:'5px' }}>
                    {partnerDetails.map((item) => (
                      <MenuItem
                        key={item._id}
                        selected={selectedPartnerValue === item._id}
                        onClick={() => handlePartnerChange({ target: { value: item._id } })}
                        sx={{
                          // margin: '5px',
                          borderRadius: '6px',
                          padding: '8px 5px',
                          color: '#363636',
                          fontWeight: 700,
                           backgroundColor: 'transparent !important',
                          // '&:hover': {
                          //   backgroundColor: '#f5f5f5',
                          // },
                          // '&.Mui-selected': {
                          //   backgroundColor: '#fff4ed',
                          //   color: '#000',
                          //   border: '1px solid #ffe0cc',
                          // },
                          // '&.Mui-selected:hover': {
                          //   backgroundColor: '#fff4ed',
                          // },
                          // '&.Mui-focusVisible': {
                          //   backgroundColor: '#fff4ed',
                          // },
                        }}
                      >
                        <Avatar
                          variant="square"
                          sx={{
                            width: 20,
                            height: 20,
                            mr: 1,
                            fontSize: 14,
                            borderRadius: '7px',
                            backgroundColor:
                              selectedPartnerValue === item._id
                                ? '#FF6900'
                                : '#dbdcdf',
                            color: selectedPartnerValue === item._id
                              ? '#fff'
                              : '#363636',
                          }}
                        >
                          {item.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <span  className="partner-name-span"
                          style={{
                            flexGrow: 1,
                            fontSize: '14px',
                            // maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          {item.name}
                        </span>
                      </MenuItem>
                    ))}
                  </div>
                </div>
                  
                </>

              ) : (
                <>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {/* <Link to="/home">
                      <img src="/logo.png" alt="LOGO" className="logo" />
                    </Link>
                        <Divider
                          orientation="vertical"
                          flexItem
                          sx={{
                            borderColor: '#d8d8d8',
                            borderWidth: '1px',
                            alignSelf: 'center',
                            height: '22px',
                            marginTop: '5px',
                            mx: 2,
                            '@media (max-width:600px)': {
                              marginLeft: "4px",
                              marginRight: "0px",
                            }
                          }}
                        /> */}
                    <div style={{ display: 'flex', alignItems: 'center',marginTop:'5px' }}>
                      {partnerDetails.filter(item => item._id === selectedPartnerValue).map((item) => (
                        <MenuItem
                          key={item._id}
                          selected={true}
                          // onClick={() => handlePartnerChange({ target: { value: item._id } })}
                          onClick={handleMenuClick}
                          sx={{
                            borderRadius: '6px',
                            padding: '8px 5px',
                            color: '#363636',
                            fontWeight: 700,
                            backgroundColor: 'transparent !important',

                            // '&:hover': {
                            //   backgroundColor: '#f5f5f5',
                            // },
                            // '&.Mui-selected': {
                            //   backgroundColor: '#fff4ed',
                            //   color: '#000',
                            //   border: '1px solid #ffe0cc',
                            // },
                            // '&.Mui-selected:hover': {
                            //   backgroundColor: '#fff4ed',
                            // },
                            // '&.Mui-focusVisible': {
                            //   backgroundColor: '#fff4ed',
                            // },
                          }}
                        >
                          <Avatar
                            variant="square"
                            sx={{
                              width: 20,
                              height: 20,
                              mr: 1,
                              fontSize: 14,
                              borderRadius: '7px',
                              backgroundColor:
                                selectedPartnerValue === item._id
                                  ? '#FF6900'
                                  : '#dbdcdf',
                              color: selectedPartnerValue === item._id
                                ? '#fff'
                                : '#363636',
                            }}
                          >
                            {item.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <span className="partner-name-span"                            style={{
                              flexGrow: 1,
                              fontSize: '14px',
                              // maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                            }}
                          >
                            {item.name}
                          </span>
                        </MenuItem>
                      ))}
                    </div>
                    {openMenu ? <KeyboardArrowUpIcon style={{ marginTop: '5px', cursor: 'pointer',color:'#d8d8d8' }}  /> : <KeyboardArrowDownIcon style={{ marginTop: '5px', cursor: 'pointer',color:'#d8d8d8' }} onClick={handleMenuClick} />}
                  </div>
                </>
              )
              :
              <Link to="/home">
                <img src="/logo.png" alt="LOGO" className="logo" />
              </Link>

          }
          {IsAuthenticat() && (<>
          <div className="position-relative" style={{ width: "50%" }}>
            <i
                className="bi bi-search position-absolute"
                style={{
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "12px",
                }}
            />

            <input
                type="text"
                className="form-control input-height-40"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                style={{
                    textIndent: "12px",
                    paddingRight: "2.5rem",
                    fontSize: "12px",
                    height: "30px",
                }}
            />

            {search && (
                <i
                    className="bi bi-x-lg position-absolute"
                    style={{
                        right: "0.5rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                    }}
                    onClick={() => {
                        setSearch("");
                        setResults([]);
                    }}
                />
            )}

        
            {results.length > 0 && (
                <ul
                    className="list-group position-absolute w-100"
                    style={{
                        top: "100%",
                        zIndex: 10,
                        maxHeight: "300px",
                        overflowY: "auto",
                    }}
                >
                 
                    {results.flatMap((item) => {
                      // if has children
                      if (item.modules && item.modules.length > 0) {
                        return( 
                          item.modules.map((child) => (
                            <li
                              key={child.id}
                              className='d-flex justify-content-between align-items-center list-group-item list-group-item-action'
                              onClick={() => {
                                setSearch('');
                                navigate(child.url,{state:{displayName:child.displayName}})
                                setResults([]);
                              }}
                            >
                              {child.displayName}
                                <i className="bi bi-arrow-up-right"></i>
                            </li>
                          
                          ))
                        );
                      }

                      return(
                        <li
                            key={item.id}
                            className='d-flex justify-content-between align-items-center list-group-item list-group-item-action'
                            onClick={() => {
                                setSearch('');
                                navigate(item.url,{state:{displayName:item.displayName}})
                                setResults([]);
                            }}
                        > {item.displayName} <i className="bi bi-arrow-up-right"></i></li>
                         
                    )})}
                </ul>
            )}
        </div>
        </>)}
          <div className='right-div'>
            {
              !IsAuthenticat() &&
              // <button type="button"
              // className={"btn btn-warning  btn-block"}
              // onClick={handleLoginClick}> Login
              // </button>
              <button type="button" className={"btn btn-warning  btn-block"} data-toggle="modal" data-target="#exampleModalLong">
                Login
              </button>
            }
            {IsAuthenticat() && (<>
              <Dropdown align="end">

                {/* 🔔 Custom Toggle (NO caret) */}
                <Dropdown.Toggle
                  as="span"
                  className="position-relative"
                  style={{ cursor: "pointer" }}
                >
                  <i
                    className={`bi bi-bell${pendingCount > 0 ? "-fill" : ""}`}
                    style={{
                      fontSize: "22px",
                      color: pendingCount > 0 ? "#ee5819" : "#6c757d"
                    }}
                  />

                  {pendingCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger text-white" style={{ left: 16 }}>
                      {pendingCount}
                    </span>
                  )}
                </Dropdown.Toggle>

                {/* Dropdown Menu */}
                <Dropdown.Menu style={{ width: "400px", padding: '8px 10px !important;' }} className='mt-3'>
                  <div style={{ maxHeight: '80vh', overflowY: 'scroll' }}>
                    {notifications.slice(0).length ? (
                      notifications.slice(0).map((item, i) => (
                        <Dropdown.Item
                          key={i}
                          className="d-flex noti-dropdown-item align-items-start px-3 py-2"
                          style={{ whiteSpace: "normal" }}
                          onClick={() => handleStatusUpdate(item)}
                        >
                          {/* Fixed icon column */}
                          <div style={{ textAlign: "center" }}>
                            <img src={NotifiocationIocn}
                              width={40}
                              height={40}
                            />

                          </div>

                          {/* Content */}
                          <div className="flex-grow-1" style={{ paddingLeft: '10px' }}>
                            <div style={{ color: '#000', fontSize: '15px', fontWeight: 500 }}>{toTitleCase(item.taskType)}</div>
                            <div style={{ color: '#667085', fontSize: '14px', fontWeight: 500 }} className="mt-1">{item.message}</div>
                          </div>
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item>
                        <div className='mt-4' style={{ color: '#000', fontSize: '15px', textAlign: 'center', height: '50px' }}>No notifications</div>
                      </Dropdown.Item>
                    )}
                  </div>
                  <Dropdown.Item className="text-center py-2">
                    <CustomButton label={'View All'} variant='danger' appendClass='text-white full-width' to={'/notificationList'} />

                  </Dropdown.Item>
                </Dropdown.Menu>

              </Dropdown>
            </>)}
            {/* {IsAuthenticat() && (
        <div>
            <Link to={"/properties/upload_media"}
                className="d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                Upload Media
            </Link>
        </div>
      )} */}

            {IsAuthenticat() && (

              <div className="user-icon">
                <i className="bi bi-person-circle" onClick={() => setUserMenuOpen(!userMenuOpen)}></i>
                <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'} mobile-menu-icon`} onClick={toggleMenu}></i>
              </div>
            )}
          </div>
          {menuOpen && <div className="mobile-backdrop" onClick={() => setMenuOpen(false)}></div>}

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="mobile-menu">
              {permissions.map((module, i) => (
                <div key={i} className="menu-item">
                  {module.modules?.length > 0 ? (
                    <>
                      <div
                        className="folder-name"
                        onClick={() => toggleFolder(i)}
                        style={{ cursor: 'pointer' }}
                      >
                        {module.displayName}
                        <i className={`bi ${openFolders[i] ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ float: 'right', paddingLeft: '10px' }}></i>
                      </div>
                      {openFolders[i] && (
                        <div className="child-links">
                          {module.modules.map((child, j) => (
                            <Link key={j} to={child.url} onClick={() => setMenuOpen(false)}>
                              {child.displayName}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link to={module.url} onClick={() => setMenuOpen(false)}>
                      {module.displayName}
                    </Link>
                  )}
                </div>

              ))}
              <Link to="/form-listing" onClick={() => setMenuOpen(false)} className="add-module">
                Add Module
              </Link>
            </div>
          )}
          {userMenuOpen && (
            <>
              <div className="user-backdrop" onClick={() => setUserMenuOpen(false)}></div>
              <div className="user-dropdown">
                <div className="dropdown_item d-flex align-items-center">
                  <i className="bi bi-person-circle"></i>
                  <div className='p-2'>
                    <div style={{ fontWeight: 600 }}>{userDetails().name}</div>
                    <div className="small" style={{ color: '#667085' }}>{userDetails().mobile}</div>
                    <div className="small" style={{ color: '#667085' }}>{userDetails().email}</div>
                  </div>
                </div>

                <Link to="/my-tasks" onClick={() => { setUserMenuOpen(false) }} className="dropdown_item">  <img src={taskIcon} alt="logout" />My Tasks</Link>
                {/* <Link to="#" onClick={() => { setUserMenuOpen(false);}} className="dropdown_item">  <img src={logoutIcon} alt="logout" />Profile</Link> */}
                <Link to="#" onClick={() => { setUserMenuOpen(false); Logout(); }} className="dropdown_item">  <img src={logoutIcon} alt="logout" />Logout</Link>
              </div>
            </>
          )}
        </header>
      }

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        MenuListProps={{ autoFocusItem: false }}
        sx={{ zIndex: 9999, width: '290px' }}
        anchorReference="anchorPosition"
        anchorPosition={{ top: 55, left: 165 }}
        PaperProps={{
          sx: {
            width: '290px',
            borderRadius: '6px',   // 👈 fixed menu width
          },
        }}
      >
        {userDetails()?.partnerDetails?.map((item) => (
          <MenuItem
            key={item._id}
            selected={selectedPartnerValue === item._id} // ✅ MUI way
            onClick={() =>
              handlePartnerChange({ target: { value: item._id } })
            }
            sx={{
              margin: '5px',
              borderRadius: '6px',
              padding: '8px 5px',
              // default state
              color: '#363636',

              // hover state
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },

              // selected state
              '&.Mui-selected': {
                backgroundColor: '#fff4ed',
                color: '#000',
                border: '1px solid #ffe0cc',

              },

              // selected + hover
              '&.Mui-selected:hover': {
                backgroundColor: '#fff4ed',
              },

              // remove focus gray
              '&.Mui-focusVisible': {
                backgroundColor: '#fff4ed',
              },
            }}
          >
            <Avatar
              variant="square"
              sx={{
                width: 20,
                height: 20,
                mr: 1,
                fontSize: 14,
                borderRadius: '7px',
                backgroundColor:
                  selectedPartnerValue === item._id
                    ? '#FF6900'
                    : '#dbdcdf',
                color: selectedPartnerValue === item._id
                  ? '#fff'
                  : '#363636',
              }}
            >
              {item.name.charAt(0).toUpperCase()}
            </Avatar>
            <span
              className="partner-name-span"
              style={{
                flexGrow: 1,
                fontSize: '14px',
                maxWidth: '180px',       // 👈 limit width
                overflow: 'hidden',      // 👈 hide extra text
                textOverflow: 'ellipsis',// 👈 show ...
                whiteSpace: 'nowrap',    // 👈 single line
                display: 'block',        // 👈 required for ellipsis
              }}
            >
              {item.name}
            </span>

            {/* <span style={{ flexGrow: 1,fontSize: "14px" }}>{item.name}</span> */}

            {selectedPartnerValue === item._id && (
              <CheckCircleIcon sx={{ ml: 1, color: '#FF6900', height: 20, width: 20 }} />
            )}
          </MenuItem>
        ))}
      </Menu>

      {/* // modal here */}

      {/* <div className="modal fade" id="exampleModalLong" tabindex="-1" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
  <div className="modal-dialog modal-lg" role="document">
    <div className="modal-content">
     
      <div className="modal-body" style={{padding:"0px"}}>
        <button type="button btn-lg" className="close modal-close-btn" data-dismiss="modal" aria-label="Close"  onClick={() => setModalKey((k) => k + 1)}>
          <span aria-hidden="true" style={{fontSize:"40px",fontWeight:'100'}}>&times;</span>
        </button>
       <Login modalKey={modalKey}/>
      </div>
     
    </div>
  </div>
</div> */}

      <div className="modal fade fixed-modal customModal" id="exampleModalLong" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-body">
              <button type="button btn-lg" className="close modal-close-btn" data-dismiss="modal" aria-label="Close" onClick={() => setModalKey((k) => k + 1)}>
                <span aria-hidden="true" style={{ fontSize: "40px", fontWeight: '100' }}>&times;</span>
              </button>
              <Login modalKey={modalKey} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
