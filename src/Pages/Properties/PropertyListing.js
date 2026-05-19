import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import swal from "sweetalert";
import postApiCall from "../../Services/postApiCall";
import { Button } from "react-bootstrap";
import PaginationNew from "../../Widgets/PaginationNew"
import deleteApiCall from "../../Services/deleteApiCall";
import Constant from "../../Components/Constant";
import { userDetails } from "../../Services/authenticationService";
import useGetRoleModule from "../../Services/useGetRoleModule";
import axios from "axios";
import loginUser from "../../Services/loginUser";
import { TagPicker } from 'rsuite';
import { SelectPicker, Tooltip, Whisper, } from 'rsuite';
import CardListMobile from "../../Utils/CardsMobileView/CardListMobile";
import CustomButton from "../../Utils/CustomButton";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";
import CommonActionIcons from "../../Utils/CommonActionIcons";
const PropertyListing = () => {
  let { accessToken } = loginUser();

  const [lists, setLists] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(Constant.perPage);
  const [isLoaded, setIsLoaded] = useState(false);
  const [propertyListingForm, setPropertyListingForm] = useState({
    searchKey: "",
    fromDate: "",
    toDate: "",
    soldStatus: "",
  });
  const [permission, setPermission] = useState({});
  const [auctionPermission, setAuctionPermission] = useState({});
  const [partner, setPartner] = useState("")
  const [partnerArr, setPartnerArr] = useState([])
  const [hoverText,setHoverText] = useState('')
  const [mobileResponseData, setMobileResponseData] = useState()
  const [open, setOpen] = useState(false);

  const user = userDetails();

function changePropertyListingForm(e) {
    if (!e.target.name) return;
    setPropertyListingFormWithStorage({
        ...propertyListingForm,
        [e.target.name]: e.target.value,
    });
}

const onChangeFilter = (e) => {
    if (!e.target.name) return;
    setPropertyListingFormWithStorage({
        ...propertyListingForm,
        [e.target.name]: e.target.value,
    });
};
const submitFilter = (e) => {
    e.preventDefault();
    localStorage.setItem("propertyListingForm", JSON.stringify(propertyListingForm));
    console.log("Submitting Search Form:", propertyListingForm); // Debug log
    getList();
};

  async function getList() {
    let response = await postApiCall("user/property/get-all", {
      page: pageNo,
      contentPerPage: perPage,
      searchKey: propertyListingForm.searchKey,
      fromDate: propertyListingForm.fromDate,
      toDate: propertyListingForm.toDate,
      soldStatus: propertyListingForm.soldStatus,
      propertyFor: 1,
      partnerArr,
    });
    setLists(response.data);
    setTotalItems(response.total);
    setIsLoaded(true);
    const formattedData = response.data.map((item, index) => ({
      header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
      data: [
        { label: "Property Id", value: item.propertyId },
        { label: "State", value: item.stateName },
        { label: "City", value: item.cityName },
        { label: "Address", value: item.address },
        { label: "Financial Institution Name", value: item.partner.name || '-' },
        { label: "Posted Date", value: convertDate(item.createdAt) },
      ],
      status: '', // card footer status
      footerId: item._id,
      url: `/property/details/${item._id}`,
      actionButtons: actionRender(item)
    }));
    setMobileResponseData(formattedData)
  }

  async function GetRole() {
        console.log("GetRole called"); // Debug log
    let Role = await useGetRoleModule("Property Management");
    let autionRole = await useGetRoleModule("Property Management");
    if (Role.moduleList.readDisabled) {
      setPermission({
        moduleAccress: false,
        moduleList: {},
        message: "Module Need Some Permission...Pls contact with Your Partner",
      });
    } else {
      if(Role.role == "admin"){
        let partnerLis = await postApiCall("admin/partner/getPartnerUser", {}, true);
        if(partnerLis.meta.status){
            let out = partnerLis.data.map(_ => {
                return {
                  label: _.parnterName, value: _.partnerId 
                }
            })
            setPartner(<div className="w-25">
      <div className="form-group">
      <b style={{ color:'#000000'}}>Partner </b>
       <TagPicker data={out} style={{ width: 300 }} onChange={(e) => tagPickerHandler(e)}/>
    </div>
    </div>)
        }

       
      }
console.log('Role:::::::',Role)
      setAuctionPermission(autionRole);
      setPermission(Role);
    }

    // getList();
  }

  async function tagPickerHandler(e){
    setPartnerArr(e)
  }
  

 useEffect(() => {
    console.log("useEffect triggered"); // Debug log
        try {
            const storedSearchForm = localStorage.getItem("propertyListingForm");
            if (!storedSearchForm) {
                console.log("No searchForm found in localStorage"); // Debug log
            } else {
                console.log("Stored Search Form:", storedSearchForm); // Debug log
                setPropertyListingForm(JSON.parse(storedSearchForm));
            }
        } catch (error) {
            console.error("Error accessing localStorage:", error); // Debug log
        }
    // }
    GetRole();
}, []);

const setPropertyListingFormWithStorage = (updatedForm) => {
    setPropertyListingForm(updatedForm);
    localStorage.setItem("propertyListingForm", JSON.stringify(updatedForm));
    console.log("Updated Search Form:", updatedForm); // Debug log
};

  function UpdateStatus(id, status) {
    status = status == 0 ? "active" : "deactive";
    // console.log('status', status)

    postApiCall("user/property/status", {
      status: status,
      _id: id,
      // isDeleted: isDeleted
    }).then((response) => {
      if (response.meta.status) {
        swal({ text: response.meta.msg, icon: "success", timer: 1500 });
        getList();
      }
    });
  }
 
  function DeleteEvent(e) {
    let id = e.currentTarget.getAttribute("value");
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
            getList();
          }
        });
      } else {
        // swal("Your imaginary file is safe!");
      }
    });
  }

  const exportToExcel = async () => {
    try {
      const requestData = {
        searchKey: propertyListingForm.searchKey,
        fromDate: propertyListingForm.fromDate,
        toDate: propertyListingForm.toDate,
        soldStatus: propertyListingForm.soldStatus,
        propertyFor: 1
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

  function pageChangeHandler(page) {
    if (isLoaded) {
      setPageNo(page);
    }
  }

  useEffect(() => {
    getList();
  }, [pageNo]);

  function truncateText(value) {
    let truncated = value.substring(0, 50) + "...";
    return truncated;
  }

  function handleMouseOver(e){
    setHoverText(e)
  }
  // const actionRender = (item, forScreen) => (<>
  //   {permission?.moduleList
  //     ?.updateDisabled ? null : !item.status ? (
  //       <button
  //         onClick={UpdateStatus}
  //         value={item._id}
  //         isDeleted={item.isDeleted}
  //         status={item.status}
  //         className="btn btn-info btn-icon-split btn-sm  mb-1 mr-1"
  //       >
  //         <span className="icon text-white-50">
  //           <i className="fas fa-exclamation-triangle"></i>
  //         </span>
  //         {/*<span className="text">Disable</span>*/}
  //       </button>
  //     ) : (
  //     <button
  //       className="btn btn-success btn-icon-split btn-sm mb-1 mr-1"
  //       onClick={UpdateStatus}
  //       value={item._id}
  //       isDeleted={item.isDeleted}
  //       status={item.status}
  //     >
  //       <span className="icon text-white-50">
  //         <i className="fas fa-check"></i>
  //       </span>
  //       {/*<span className="text">Enable</span>*/}
  //     </button>
  //   )}

  //   {permission?.moduleList?.updateDisabled ? null : (
  //     <Link
  //       to={"/property/add?id=" + item._id}
  //       className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1"
  //     >
  //       <span className="icon text-white-50">
  //         <i className="far fa-edit"></i>
  //       </span>
  //       {/*<span className="text">Edit</span>*/}
  //     </Link>
  //   )}

  //   {permission?.moduleList?.deleteDisabled ? null : (
  //     <button
  //       onClick={DeleteEvent}
  //       value={item._id}
  //       className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1"
  //     >
  //       <span className="icon text-white-50">
  //         <i className="fa fa-trash"></i>
  //       </span>
  //       {/*<span className="text">Delete</span>*/}
  //     </button>
  //   )}
  //   <Whisper followCursor placement="left" speaker={<Tooltip>Audit Trail</Tooltip>}>
  //     <a href={`/properties/audit-trails/${item._id}`}><button className="btn btn-icon-split btn-sm mb-1 mr-1" style={{ backgroundColor: 'black' }}>
  //       <span className="icon" style={{ color: 'white' }}>
  //         <i class="fa fa-history" aria-hidden="true"></i>
  //       </span>
  //     </button></a>
  //   </Whisper>
  // </>)
  const actionRender = (item) => {
  const actions = [];

  // ENABLE / DISABLE toggle button
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: !item.status ? "activate" : "deactivate",
      label: !item.status ? "activate" : "deactivate",
      onClick: () => UpdateStatus(item._id,item.status),
      value: item._id,
      isDeleted: item.isDeleted,
      status: item.status,
    });
  }

  // EDIT BUTTON
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: "edit",
      label: "Edit",
      redirectUrl: `/property/add?id=${item._id}`,
    });
  }

  // DELETE BUTTON
  if (!permission?.moduleList?.deleteDisabled) {
    actions.push({
      type: "delete",
      label: "Delete",
      onClick: DeleteEvent,
      value: item._id
    });
  }

  // AUDIT TRAIL
  actions.push({
    type: "audit",
    label: "Audit Trail",
    redirectUrl: `/properties/audit-trails/${item._id}`,
  });

  return <CommonActionIcons actions={actions} />;
};


  const renderFilter = (forScreen) => (<>
  <div className="moduleList">
    <div className="form-group" style={{ width: forScreen == "mobile" ? '100%' : '250px' }} >
      <input
        type="text"
        className="form-control rs-input-group"
        name="searchKey"
        onChange={onChangeFilter}
        value={propertyListingForm.searchKey}
        placeholder="Search By Partner Name, Property ID, City, State, Address, Project Name"
      />
    </div>

    <div className="form-group">
      <input
        type="date"
        className="form-control rs-input-group"
        name="fromDate"
        onChange={onChangeFilter}
        placeholder="From Date"
        value={propertyListingForm.fromDate}
      />
    </div>

    <div className="form-group">
      <input
        type="date"
        className="form-control rs-input-group"
        name="toDate"
        onChange={onChangeFilter}
        placeholder="to Date"
        value={propertyListingForm.toDate}
      />
    </div>

    <div className="form-group" >
      <select
        name="soldStatus"
        value={propertyListingForm.soldStatus}
        onChange={onChangeFilter}
        className="form-control rs-input-group"
      >
        <option value="">Sold Status</option>
        <option value="YES">Yes</option>
        <option value="NO">No</option>
      </select>
    </div>
      <div className="form-group d-none d-md-block">
        <CustomButton
          label="Apply"
          
          appendClass='text-white'
          variant='danger'
          iconAppendClass="me-2"
          onClick={submitFilter}
        />
      </div>
    <div>

    </div>
    </div>
  </>)
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
                                                            to={`/property/bulk-upload`}
                                                            className="dropdown-item gap-2 py-2"
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            <i className="bi bi-upload mx-2"></i>  Bulk Upload</Link>
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
                                        to={`/property/add`}
                                    />
                                }
                            </div>
    )
  }
  return (
    <>
      <div className="container-fluid">

        {permission.hasOwnProperty("moduleAccress") &&
        !permission.moduleAccress ? (
          <div className="row text-center">
            <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
              <div className="errer">
                <img src="/program-error.png" />
                <h2>403</h2>
                {/* <h4 className="text-danger">{permission.message}</h4> */}
                <p>{permission.message}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
        <div className="main-title">
          <FilterWithButtonsCard filters={renderFilter()} title={'Property Management'} headerButtons={headerButtons()}/>
          {/* <h3>Property Management</h3> */}
        </div>
            {/* <div className="mb-4 moduleList">

            { permission?.moduleList?.createDisabled ? null : (
                  <Link
                    to="/properties/access_media"
                    className="btn btn-primary"
                  >
                    Media View
                  </Link>
                )}

                { permission?.moduleList?.createDisabled ? null : (
                  <Link
                    to="/property/bulk-doucument-upload"
                    className="btn btn-primary"
                  >
                    Bulk Document Upload
                  </Link>
                )}

                { permission?.moduleList?.createDisabled ? null : (
                  <Link
                    to="/property/bulk-image-upload"
                    className="btn btn-primary"
                  >
                    Bulk Image Upload
                  </Link>
                )}

                { permission?.moduleList?.createDisabled ? null : (
                  <Link
                    to="/property/bulk-upload"
                    className="btn btn-primary"
                  >
                    Bulk Upload
                  </Link>
                )}

                { permission?.moduleList?.createDisabled ? null : (
                  <Link
                    to="/properties/bulk-update"
                    className="btn btn-primary"
                  >
                    Bulk Update
                  </Link>
                )}

              {permission?.moduleList?.createDisabled ? null : (
                  <CustomButton
                    label=""
                    icon="bi-plus-lg"
                    appendClass='mx-2'
                    to={`/property/add`}
                  />
                // <Link
                //   to="/property/add"
                //   className="btn btn-primary"
                // >
                //   Add Property
                // </Link>
              )}

              
              <Button
                onClick={exportToExcel}
                className="btn btn-primary"
              >
                Download to Excel
              </Button>
            </div> */}

              <div className="d-block d-md-none">
                <CardListMobile
                  dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                  perPage={perPage}
                  totalItems={totalItems}
                  currentPage={pageNo}
                  pageChangeHandler={pageChangeHandler}
                  handleFilter={submitFilter}
                  isAction={true}
                >
                  <div style={{ width: '100%', marginRight: '10px' }}>
                    {renderFilter('mobile')}
                  </div>

                </CardListMobile>
              </div>
            <div className="card shadow mb-4 d-none d-md-block">
              {/*Search and Filter From*/}
              <div className="card-body">

                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Property Id</th>
                        <th>State</th>
                        <th>City</th>
                        <th>Address</th>
                        <th>Financial Institution Name</th>
                        <th>Posted Date</th>
                        {/*<th>Type Of Property</th>*/}
                        {/*<th>Feedbacks</th>*/}
                        {/* <th>Property Status</th> */}
                        {/*{user.serviceType === 2 || user.role == 'admin' ? <th>Bids</th> : ''}*/}
                        {/*{user.serviceType === 2 ? <th>Bids</th> : ''}*/}
                        {permission?.moduleList?.deleteDisabled &&
                        permission?.moduleList?.updateDisabled ? null : (
                          <th>Action</th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {lists.map((item, index) => {
                        return (
                          <tr key={index} className="border">
                            <td>{index + 1 + (pageNo - 1) * 10}</td>
                            <td>
                              <Link to={"/property/details/" + item._id}>
                                {item.propertyId}
                              </Link>
                            </td>
                            <td>{item.stateName}</td>
                            <td>{item.cityName}</td>
                            <td className="new-tooltip"  onMouseOver={()=> handleMouseOver(item.address)}>{(item.address)}
                            <span>{hoverText}</span>
                            </td>
                            <td>{item.partner ? item.partner.name : ""}</td>

                            <td>{convertDate(item.createdAt)}</td>
                            {/*<td>{item.createdAt ? }</td>*/}
                            {/*<td>{item.propertyType == 1 ? 'Residential' : 'Commercial'}</td>*/}
                            {/*<td><Link className={'btn btn-warning btn-sm'}*/}
                            {/*          to={'/properties/feedbacks/' + item._id}>Feedbacks</Link>*/}
                            {/*</td>*/}
                            {/* <td>{item.status ? "Active" : "Inactive"}</td> */}

                            {/*{user.serviceType && item.propertyFor === 2 ?*/}
                            {/*    <td><Link className={'btn btn-warning btn-sm'}*/}
                            {/*              to={'/properties/bids/' + item._id}>Bids</Link>*/}
                            {/*    </td> : ''}*/}
                            {permission?.moduleList?.deleteDisabled &&
                        permission?.moduleList?.updateDisabled ? null : (
                            <td  className="d-flex flex-row border-0">
                              {actionRender(item)}
                            </td>)}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="justify-content-center mt-2">
                    <PaginationNew
                      perPage={perPage}
                      totalItems={totalItems}
                      currentPage={pageNo}
                      handler={pageChangeHandler}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PropertyListing;
