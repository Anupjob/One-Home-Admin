import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import swal from "sweetalert";
import postApiCall from "../../Services/postApiCall";
import { Button } from "react-bootstrap";
import PaginationNew from "../../Widgets/PaginationNew";
import deleteApiCall from "../../Services/deleteApiCall";
import Constant from "../../Components/Constant";
import { userDetails } from "../../Services/authenticationService";
import useGetRoleModule from "../../Services/useGetRoleModule";
import axios from "axios";
import loginUser from "../../Services/loginUser";
import { TagPicker } from 'rsuite';
import moment from 'moment'
import { DateRangePicker, Stack } from 'rsuite';
import "rsuite/dist/rsuite.css";
import getApiCall from "../../Services/getApiCall";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";
import { SelectPicker, Tooltip, Whisper, } from 'rsuite';
import CardListMobile from "../../Utils/CardsMobileView/CardListMobile";
import CustomButton from "../../Utils/CustomButton";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";
import CommonActionIcons from "../../Utils/CommonActionIcons";
import CommonTable from "../../Utils/CommonTable";
import ReusableSelect from "../../Pages/Reusable/ReusableSelect";

const customStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: "30px",
    height: "30px",
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: "30px",
    padding: "0 6px",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: "30px",
  }),
  placeholder: (provided) => ({
    ...provided,
    whiteSpace: "nowrap",     // prevent wrapping
    overflow: "hidden",       // hide overflow
    textOverflow: "ellipsis", // add ...
  }),
};
const AuctionPropertyListing = () => {
  let { accessToken } = loginUser();


  const [lists, setLists] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(Constant.perPage);
  const [isLoaded, setIsLoaded] = useState(false);
  const [partnerList, setPartnerList] = useState([])
  const [auctionPropertyListingForm, setAuctionPropertyListingForm] = useState({
    searchKey: "",
    fromDate: "",
    toDate: "",
    soldStatus: "",
    stateName: [],
    cityName: [],
    propertyStatus: []
  });
  const [permission, setPermission] = useState({});
  const [auctionPermission, setAuctionPermission] = useState({});
  const [partnerArr, setPartnerArr] = useState([])
  const [stateList, setStateList] = useState([])
  const [cityList, setCityList] = useState([])
  const [partner, setPartner] = useState("")
  const [hoverText, setHoverText] = useState('')
  const [mobileResponseData, setMobileResponseData] = useState()
  const searchTimeoutRef = useRef(null);
  const propertyStatuses = [
    { label: 'AUCTION_DUE', value: 'AUCTION_DUE' },
    { label: 'NOT_FOR_SALE', value: 'NOT_FOR_SALE' },
    { label: 'ONGOING(Saleable)', value: 'ONGOING(Saleable)' },
    { label: 'EOI(Saleable)', value: 'EOI(Saleable)' },
    { label: 'CANCELLED', value: 'CANCELLED' },
    { label: 'SOLD', value: 'SOLD' },
    { label: 'HBL', value: 'HBL' },
    { label: 'SOLD_MANUAL', value: 'SOLD_MANUAL' },
    { label: 'CANCELLED+SUCCESSFULL', value: 'CANCELLED+SUCCESSFULL' }
  ];
  const soldStatusOptions = [
    // { label: "Select Sold Status", value: "" },
    { label: "Yes", value: "YES" },
    { label: "No", value: "NO" }
];
  const [open, setOpen] = useState(false);
  const user = userDetails();

  // On Page Load: Clear localStorage if the page is refreshed
  useEffect(() => {
    // if (performance?.navigation?.type === 1) {

    //   localStorage.removeItem("auctionPropertyListingForm");
    // }
    GetRole();
    getState();
  }, []);

  const handleFilterClick = (searchValue = null, formState = null) => {
    setPageNo(1);
    getList(1, searchValue, formState);
  };

  const stateHandler = (selectedState) => {
    // console.log("Selected State:", selectedState); // Debug log
    let newForm;
    if (selectedState) {
      newForm = { ...auctionPropertyListingForm, stateName: selectedState, cityName: [] }; // Reset cityName when state changes
      setAuctionPropertyListingForm(newForm);
      const selectedStateCode = selectedState.map((state) => state.value);
      if (selectedStateCode) {
        // console.log("Fetching cities for state:", selectedStateObj); // Debug log
        GetCity(selectedStateCode); // Pass isoCode to GetCity
      }
    } else {
      newForm = { ...auctionPropertyListingForm, stateName: [], cityName: [] };
      setAuctionPropertyListingForm(newForm);
      setCityList([]); // Clear city list if no state is selected
    }
    setTimeout(() => handleFilterClick(null, newForm), 50);
  };

  const cityHandler = (selectedCity) => {
    const newForm = {
      ...auctionPropertyListingForm,
      cityName: selectedCity || []
    };
    setAuctionPropertyListingForm(newForm);
    setTimeout(() => handleFilterClick(null, newForm), 50);
  };


  function changeSearchForm(e) {
    if (!e.target.name) return;
    setAuctionPropertyListingForm({
      ...auctionPropertyListingForm,
      [e.target.name]: e.target.value,
    });
  }

  const onChangeFilter = (e) => {
    if (!e.target.name) return;
    setAuctionPropertyListingForm({
      ...auctionPropertyListingForm,
      [e.target.name]: e.target.value,
    });
  };


  async function getList(page = 1, searchValue = null, formState = null) {
    // Use passed values if provided, otherwise use state values
    const effectiveForm = formState || auctionPropertyListingForm;
    const effectiveSearch = searchValue !== null ? searchValue : effectiveForm?.searchKey;
    
    let response = await postApiCall("user/property/get-all", {
      page: page,
      contentPerPage: Constant.perPage,
      searchKey: effectiveSearch?.trim() || "",
      fromDate: effectiveForm?.fromDate || "",
      toDate: effectiveForm?.toDate || "",
      soldStatus: effectiveForm?.soldStatus || "",
      propertyFor: 2,
      partnerArr: Array.isArray(partnerArr) ? partnerArr : [],
      stateName: Array.isArray(effectiveForm?.stateName) ? effectiveForm.stateName.map((state) => state?.label || "") : [],
      cityName: Array.isArray(effectiveForm?.cityName) ? effectiveForm.cityName.map((city) => city?.label || "") : [],
      propertyStatus: Array.isArray(effectiveForm?.propertyStatus) ? effectiveForm.propertyStatus.map((status) => status?.value || status?.label || "") : [],
    }, true);
    

    setLists(response.data);
    setTotalItems(response.total);
    setIsLoaded(true);
    getState()
     const formattedData = response.data.map((item, index) => ({
      header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
      data: [
        { label: "Sl. No.", value: index + 1 + (pageNo - 1) * perPage },
        { label: "Auction Id", value: item.auctionId, isLink: true, linkUrl: `/property/details/${item._id}` },
        { label: "Property Id", value: item.propertyId },
        { label: "Address / Location", value: item?.address },
        { label: "Auction Date", value: convertDate(item.auctionStartDateTime) },
        { label: "Upload Date", value: convertDate(item.createdAt) },
        { label: "Property Status", value: item.propertyStatus ? item.propertyStatus : "-" },
      ],
      status: item.propertyStatus, // card footer status
      footerId: item._id,
      url: `/property/details/${item._id}`,
      isAction: true,
      actionButtons: actionRender(item)
    }));
    setMobileResponseData(formattedData)
  }

  async function tagPickerHandler(e) {
    setPartnerArr(e)
  }

  async function GetRole() {
    let Role = await useGetRoleModule("Auction Property");
    if (Role.moduleList.read === false) {
      setPermission({
        moduleAccress: false,
        moduleList: {},
        message: "Module Need Some Permission...Pls contact with Your Partner",
      });
    } else {
      if (Role.role == "admin") {
        let partnerLis = await postApiCall("admin/partner/getPartnerUser", {}, true);
        if (partnerLis.meta.status) {
          let out = partnerLis.data.map(_ => {
            return {
              label: _.parnterName, value: _.partnerId
            }
          })
          setPartnerList(out)
          setPartner(<div className="w-10 ml-2">
            <div className="form-group">

              <TagPicker placeholder="Select Tags" data={out} style={{ width: 300 }} onChange={(e) => tagPickerHandler(e)} />
            </div>
          </div>)
        }

      }

      setPermission(Role);
    }

    getList();
  }

  useEffect(() => {
    GetRole();
  }, []);
  console.log('setPermission::::', permission)
  const GetCity = async (isoCode) => {
    // console.log("Fetching cities for isoCode:", isoCode); // Debug log
    if (isoCode) {
      let response = await getApiCall(`admin/city/getAllForOption?isoCode=${isoCode}`);
      console.log("API Response for cities:", response); // Debug log
      if (response.meta.status === true) {
        console.log("Fetched Cities:", response.data); // Debug log
        setCityList(response.data.map((_) => {
          return { value: _.name, label: _.name }; // Use city name as both value and label
        }));
      } else {
        console.log("No cities found for isoCode:", isoCode); // Debug log
        setCityList([]); // Clear city list if no cities are found
      }
    }
  };
  // Get State
  async function getState() {
    let response = await getApiCall('admin/state/getAll');
    if (response.meta.status === true) {
      setStateList(response.data.map((_) => {
        return { value: _.isoCode, label: _.name }; // Use isoCode as value and state name as label
      }));
    }
  }

  // Restore State and City on Page Load
  useEffect(() => {
    const storedAuctionPropertyListingForm = localStorage.getItem("auctionPropertyListingForm");
    if (storedAuctionPropertyListingForm) {
      const parsedForm = JSON.parse(storedAuctionPropertyListingForm);
      setAuctionPropertyListingForm(parsedForm);

      if (parsedForm.stateName) {
        const selectedState = stateList.find(
          (state) => state.value === parsedForm.stateName
        );
        if (selectedState) {
          GetCity(selectedState.value);
        }
      }
    }
  }, [stateList]);

  // Submit Filter
  const submitFilter = (e) => {
    e?.preventDefault();
    localStorage.setItem("auctionPropertyListingForm", JSON.stringify(auctionPropertyListingForm));
    console.log("set data", auctionPropertyListingForm)
    getList(1);
  };


  function UpdateStatus(id, status) {
    status = status == 0 ? "active" : "deactive";

    postApiCall("user/property/status", {
      status: status,
      _id: id,
    }).then((response) => {
      if (response.meta.status) {
        swal({ text: response.meta.msg, icon: "success", timer: 1500 });
        getList(1);
      }
    });
  }

  function DeleteEvent(id) {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        deleteApiCall("user/property/delete/" + id, {}).then((response) => {
          if (response.meta.status) {
            swal({ text: response.meta.msg, icon: "success", timer: 1500 });
            getList(1);
          }
        });
      } else {
      }
    });
  }

  const exportToExcel = async () => {
    try {
      const requestData = {
        searchKey: auctionPropertyListingForm.searchKey,
        fromDate: auctionPropertyListingForm.fromDate,
        toDate: auctionPropertyListingForm.toDate,
        soldStatus: auctionPropertyListingForm.soldStatus,
        propertyFor: 2,
        partnerArr,
        stateName: auctionPropertyListingForm.stateName,
        cityName: auctionPropertyListingForm.cityName,
      };

      const response = await axios({
        url: Constant.apiBasePath + "user/property/download",
        method: "POST", // Changed to POST
        responseType: "blob",
        headers: {
          authkey: accessToken,
          "Content-Type": "application/json", // Added content type for POST request
        },
        data: JSON.stringify(requestData), // Send data in the request body
      });

      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "properties.xlsx";
      document.body.appendChild(link);
      link.click();
      // Clean up the URL object when the download is complete
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  function convertDate(date) {
    let d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    let year = d.getFullYear();

    if (month?.length < 2) month = "0" + month;
    if (day?.length < 2) day = "0" + day;
    return [day, month, year].join("-");
  }

  const dateRangeHandler = (e) => {
    let newForm;
    if (e) {
      let fromDate = e[0]
      let toDate = e[1]
      fromDate = moment(fromDate).format('YYYY/MM/DD');
      toDate = moment(toDate).format('YYYY/MM/DD');
      newForm = {
        ...auctionPropertyListingForm,
        fromDate,
        toDate
      };
      setAuctionPropertyListingForm(newForm);
    } else {
      newForm = {
        ...auctionPropertyListingForm,
        fromDate: "",
        toDate: ""
      };
      setAuctionPropertyListingForm(newForm);
    }
    setTimeout(() => handleFilterClick(null, newForm), 50);
  }
   

  function pageChangeHandler(page) {
    if (isLoaded) {
      setPageNo(page);
    }
  }
  function truncateText(value) {
    let truncated = value?.length < 50 ? value : value?.substring(0, 50) + "...";
    return truncated;
  }

  function handleMouseOver(e) {
    if (e?.length < 50) {
      return
    }
    setHoverText(e)
  }
  useEffect(() => {
    getList(pageNo);
  }, [pageNo]);

  const handleProStatusSeletion = (values) => {
    const newForm = {
      ...auctionPropertyListingForm,
      propertyStatus: values
    };
    setAuctionPropertyListingForm(newForm);
    setTimeout(() => handleFilterClick(null, newForm), 50);
  }
  const Option = (props) => {
    return (
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null} // avoid React warning
          style={{ marginRight: 8 }}
        />
        {props.label}
      </components.Option>
    );
  };

  const ValueContainer = ({ children, ...props }) => {
    const selected = props.getValue();
    const count = selected.length;

    return (
      <components.ValueContainer {...props}>
        {count > 0 ? `${count} selected` : props.selectProps.placeholder}
      </components.ValueContainer>
    );
  };

 
  
  
  
  const actionRender = (item) => {
  const actions = [];

  // Enable / Disable based on item.status
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
    type: !item.status ? "activate" : "deactivate",
      label: !item.status ? "Enable" : "Disable",
      onClick: () => UpdateStatus(item._id, item.status),
      value: item._id,
      status: item.status,
    });
  }

  // Edit (go to Auction Add screen)
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: "edit",
      label: "Edit",
      redirectUrl: `/property/auction/add?id=${item._id}`,
      className: "btn btn-primary btn-icon-split btn-sm mb-1 mr-1",
      icon: "far fa-edit",
    });
  }

  // Delete Action
  if (!permission?.moduleList?.deleteDisabled) {
    actions.push({
      type: "delete",
      label: "Delete",
      onClick: () => DeleteEvent(item._id),
      value: item._id,
      className: "btn btn-danger btn-icon-split btn-sm mb-1",
      icon: "fa fa-trash",
    });
  }

  // Audit Trail Button with Tooltip + black theme
  actions.push({
    type: "audit",
    label: "Audit Trail",
    redirectUrl: `/properties/audit-trails/${item._id}`,
    className: "btn btn-icon-split btn-sm mb-1 ml-1",
    icon: "fa fa-history",
    tooltip: "Audit Trail",
    style: { backgroundColor: "black", color: "white" },
  });

  return <CommonActionIcons actions={actions} />;
};

  const renderFilter = (forScreen) => (
        <>
            <div
                className='moduleList111'
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{width:'290px'}}>
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
                        <input type="text" className="form-control input-height-40" name="searchKey"
                            value={auctionPropertyListingForm.searchKey} onChange={(e) => {
                                const value = e.target.value;
                                setAuctionPropertyListingForm({ ...auctionPropertyListingForm, searchKey: value });
                                clearTimeout(searchTimeoutRef.current);
                                if (value.length >= 3) {
                                    searchTimeoutRef.current = setTimeout(() => {
                                        handleFilterClick(value);
                                    }, 500);
                                } else if (value.length === 0) {
                                    handleFilterClick(value);
                                }
                            }}
                            placeholder="Search By Partner Name, Property ID, City, State, Address, Project Name"
                            style={{ textIndent: "12px", paddingRight: "2.5rem", fontSize: "12px", height: "30px" }}
                        />
                        {auctionPropertyListingForm.searchKey && (
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
                                    setAuctionPropertyListingForm({ ...auctionPropertyListingForm, searchKey: '' });
                                    clearTimeout(searchTimeoutRef.current); 
                                    handleFilterClick('');
                                }}
                            ></i>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    <div className='mb-m' style={{borderRadius:'8px'}}>
                        <DateRangePicker
                            style={{ width: "100%", height: '32px' }}
                            className="input-height-40"
                            value={
                                auctionPropertyListingForm.fromDate && auctionPropertyListingForm.toDate
                                    ? [new Date(auctionPropertyListingForm.fromDate), new Date(auctionPropertyListingForm.toDate)]
                                    : null
                            }
                            onChange={(val) => { dateRangeHandler(val); }}
                            placeholder="Select Date Range"
                        />
                    </div>

          <div className='mb-m' style={{ borderRadius: '8px', width: '150px' }}>
            <ReusableSelect
              style={customStyles}
              className="mui-input-40"
              options={stateList || []}
              placeholder={"Select State"}
              isMulti={true}
              value={auctionPropertyListingForm.stateName}
              onChange={stateHandler}
            />
          </div>

                   
          <div className='mb-m' style={{ borderRadius: '8px', width: '150px' }}>
            <ReusableSelect
              className="mui-input-40"
              options={cityList || []}
              placeholder={"Select City"}
              isMulti={true}
              value={auctionPropertyListingForm.cityName}
              onChange={cityHandler}
              style={{ width: '150px' }}
            />
          </div>

                    {/* <div className='mb-m' style={{borderRadius:'8px'}}>
                        <select
                            name="soldStatus"
                            value={auctionPropertyListingForm.soldStatus}
                            className="form-control rs-input-group"
                            onChange={(e) => {
                                setAuctionPropertyListingForm({ ...auctionPropertyListingForm, soldStatus: e.target.value });
                                setTimeout(() => handleFilterClick(), 50);
                            }}
                            style={{ color: "#858796", height: '32px', borderRadius: '8px' }}
                        >
                            <option value="">Select Sold Status</option>
                            <option value="YES">Yes</option>
                            <option value="NO">No</option>
                        </select>
                    </div> */}
          <div className='mb-m' style={{ borderRadius: '8px', width: '150px' }}>
            {/* <ReusableSelect
              className="mui-input-40"
              options={soldStatusOptions || []}
              placeholder={"soldStatus"}
              isMulti={false}
              value={auctionPropertyListingForm.soldStatus}
              onChange={(e) => {
                setAuctionPropertyListingForm({ ...auctionPropertyListingForm, soldStatus: e.target.value });
              }}
              style={{ width: '150px' }}
            /> */}
            <ReusableSelect
    className="mui-input-40"
    options={soldStatusOptions || []}
    placeholder={"soldStatus"}
    isMulti={false}
    value={soldStatusOptions.find(
        (option) => option.value === auctionPropertyListingForm.soldStatus
    )}
    onChange={(selectedOption) => {
        const newForm = {
            ...auctionPropertyListingForm,
            soldStatus: selectedOption?.value || ""
        };
        setAuctionPropertyListingForm(newForm);
        setTimeout(() => handleFilterClick(null, newForm), 50);
    }}
    style={{ width: '150px' }}
/>
          </div>

                   
                    <div className='mb-m' style={{ borderRadius: '8px', width: '150px' }}>
            <ReusableSelect
              className="mui-input-40"
              options={propertyStatuses || []}
              placeholder={"Select Property Status"}
              isMulti={true}
              value={auctionPropertyListingForm.propertyStatus}
              onChange={handleProStatusSeletion}
              styles={customStyles}
            />
          </div>
                </div>
            </div>
        </>
    )
 
  const headerButtons=()=>{
    return(
<div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
                                <div className="position-relative">
                                    <CustomButton
                                        label=""
                                        icon="bi-upload"
                                        appendClass='bg-transparent'
                                        iconAppendClass="me-2"
                                        onClick={() => setOpen(!open)}
                                    />
                                    {open && (<>
                                        <div className="user-backdrop" onClick={() => setOpen(false)}></div>
                                        <div
                                            className="user-dropdown show shadow"
                                            style={{
                                                display: "block",
                                                position: "absolute",
                                                top: "105%",
                                                left: 0,
                                                minWidth: "220px",
                                                borderRadius: "10px",
                                                padding: "0"
                                            }}
                                        >
                                            {!permission?.moduleList?.uploadDisabled && (
                                                <>
                                                    {/* */}
                                                      <div className="border-bottom">
                                                        <Link
                                                            to={`/properties/access_media`}
                                                            className="dropdown-item gap-2 py-2"
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            <i className="bi bi-eye mx-2"></i>   Media View</Link>
                                                    </div>
                                                    <div className="border-bottom">
                                                        <Link
                                                            to={`/property/bulk-doucument-upload`}
                                                            className="dropdown-item gap-2 py-2"
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            <i className="bi bi-upload mx-2"></i>  Bulk Document Upload</Link>
                                                    </div>
                                                    <div className="border-bottom">
                                                        <Link
                                                            to={`/property/bulk-image-upload`}
                                                            className="dropdown-item gap-2 py-2"
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            <i className="bi bi-upload mx-2"></i>  Bulk Image Upload</Link>
                                                    </div>
                                                    <div className="border-bottom">
                                                        <Link
                                                            to={`/property/auction-bulk-upload`}
                                                            className="dropdown-item gap-2 py-2"
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            <i className="bi bi-upload mx-2"></i>  Bulk Auction Upload</Link>
                                                    </div>
                                                    <div className="border-bottom">
                                                        <Link
                                                            to={`/properties/bulk-update`}
                                                            className="dropdown-item gap-2 py-2"
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            <i className="bi bi-arrow-repeat mx-2"></i>  Bulk Update</Link>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </>)}
                                </div>
                                {permission?.moduleList?.downloadDisabled ? null :(<>
                                    <CustomButton
                                        label=""
                                        disabled={lists?.length == 0}
                                        icon="bi-download"
                                        appendClass='bg-transparent mx-2'
                                        onClick={exportToExcel}
                                    />
                               </>) }
                                {permission?.moduleList?.createDisabled ? null :
                                    <CustomButton
                                        label="Add"
                                        variant="danger"
                                        icon="bi-plus-lg"
                                      appendClass='text-white mx-2'
                                        to={`/property/auction/add`}
                                    />
                                }
                            </div>
    )
  }
  const handleReset=(e)=>{
setAuctionPropertyListingForm({
      searchKey: "",
    fromDate: "",
    toDate: "",
    soldStatus: "",
    stateName: [],
    cityName: [],
    propertyStatus: []
});
setPageNo(1);
getList(1);
}

  return (
    <>
      <div className="container-fluid">

        {permission?.moduleList?.read ? (
          <div className="row text-center">
            <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
              <div className="errer">
                <img src="/program-error.png" />
                <h2>403</h2>
                <p>{permission.message}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <FilterWithButtonsCard title={'Auction Property Management'} headerButtons={headerButtons()}  />
            {/* <div className="main-title">
              <h3></h3>
            </div> */}


            <div className="d-block d-md-none">
              <CardListMobile
                dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                perPage={perPage}
                totalItems={totalItems}
                currentPage={pageNo}
                pageChangeHandler={pageChangeHandler}
                handleFilter={handleFilterClick}
                isAction={true}
                onreset={handleReset}
              />
            </div>
            <div className="card shadow mb-4 d-none d-md-block">
              <div className="card-body">
                <CommonTable
                  formattedData={mobileResponseData?.length > 0 ? mobileResponseData : []}
                  perPage={perPage}
                  totalItems={totalItems}
                  currentPage={pageNo}
                  handler={pageChangeHandler}
                  isActionStricky={true}
                  filters={renderFilter()}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AuctionPropertyListing;
