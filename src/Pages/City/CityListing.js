import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import swal from "sweetalert";
import postApiCall from "../../Services/postApiCall";
import PaginationNew from "../../Widgets/PaginationNew";
import Constant from "../../Components/Constant";
import useGetRoleModule from "../../Services/useGetRoleModule";
import CardListMobile from "../../Utils/CardsMobileView/CardListMobile";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";
import CustomButton from "../../Utils/CustomButton";
import CommonActionIcons from "../../Utils/CommonActionIcons";

const CityListing = () => {
  const [lists, setLists] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(Constant.perPage);
  const [isLoaded, setIsLoaded] = useState(true);
  const [permission, setPermission] = useState({});
  const [mobileResponseData, setMobileResponseData] = useState()

  const [filterForm, setFilterForm] = useState({
    // status: '',
    searchKey: "",
    // 'type': '',
  });

  const onChangeFilter = (e) => {
    if (!e.target.name) return;
    setFilterForm({
      ...filterForm,
      [e.target.name]: e.target.value,
    });
  };
  const submitFilter = (e) => {
    e.preventDefault();
    getUser();
  };

  function pageChangeHandler(page) {
    setPageNo(page);
  }

  useEffect(() => {
    getUser();
  }, [pageNo]);

  async function GetRole() {
    let Role = await useGetRoleModule("cities");
    if (Role.moduleAccress) {
      setPermission(Role);
      getUser();
    }else{
        setPermission(Role)
    }
  }

  function getUser() {
    // getApiCall('admin/user/list', {
    //     page: pageNo,
    //     contentPerPage: perPage,
    //     ...filterForm
    // })
    // postApiCall('admin/city/getAll', {searchText: searchTxt, filter: filter, page: page})
    postApiCall("admin/city/getAll", {
      searchKey: filterForm.searchKey,
      filter: "",
      page: pageNo,
    })
      .then((response) => {
        if (response.meta.status) {
          setLists(response.data.docs);
           const formattedData = response.data.docs.map((item, index) => ({
                      header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
                      data: [
                          { label: "City name", value: item.name },
                          { label: "State name", value: item.stateName },
                      ],
                      status: item.status, // card footer status
                      footerId: item._id,
                      url: ``,
                      actionButtons: actionRender(item)
                  }));
                  setMobileResponseData(formattedData)
        } else {
          setLists([]);
          setMobileResponseData([])
        }
        setIsLoaded(true);
        setTotalItems(response.data.length);
      })
      .catch((error) => {
        setIsLoaded(true);
      });
  }

  useEffect(() => {
    GetRole();
  }, []);

  function UpdateStatus(e) {
    let id = e.currentTarget.getAttribute("value");
    let status = e.currentTarget.getAttribute("status");
    let isDeleted = e.currentTarget.getAttribute("isDeleted");
    status = status === "DEACTIVE" ? "active" : "deactive";
    postApiCall("user/property/status", {
      _id: id,
      status: status,
      // isDeleted: isDeleted
    }).then((response) => {
      if (response.meta.status) {
        swal({ text: response.meta.msg, icon: "success", timer: 1500 });
        getUser();
      }
    });
  }

  // const actionRender = (item, forScreen) => (<>
  //   {permission.moduleList.updateDisabled ? null : (
  //     <Link
  //       to={`/edit-city/${item._id}`}
  //       className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1"
  //     >
  //       <span className="icon text-white-50">
  //         <i className="far fa-edit"></i>
  //       </span>
  //       <span className="text">Edit</span>
  //     </Link>
  //   )}
  //  </>)
  const actionRender = (item) => {

  const actions = [];

  // Edit Icon
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: "edit",
      tooltip: "Edit City",
      icon: "far fa-edit",
      variant: "btn-primary",
      redirectUrl: `/edit-city/${item._id}`,
    });
  }

  return <CommonActionIcons actions={actions} />;
};

  
      const renderFilter = (forScreen) => (<>
      <div className="moduleList">
        <div className="form-group">
          <input
            type="text"
            onChange={onChangeFilter}
            className="form-control"
            name="searchKey"
            value={filterForm.searchKey}
            style={{width:'100%'}}
            placeholder="Search Cities...."
          />
        </div>
        <div className="form-group d-none d-md-block">
            <CustomButton
              label="Apply"
              variant='danger'

              appendClass='text-white'
              onClick={submitFilter}
            />
          </div>
        </div>
      </>)
 const headerButtons = () => {
        return (
            <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
                {permission?.moduleList?.createDisabled ? null : (<>
                    <CustomButton
                                        label="Add"
                                        variant='danger'
                                        icon="bi-plus-lg"
                                        appendClass='text-white mx-1'
                                        to="/add-city/"
                                    />
                </>)}
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
                <p>{permission.message}</p>
              </div>
            </div>
          </div>
        ) : Object.keys(permission).length > 0 ? (
          <>
          <div className="main-title">
                  <FilterWithButtonsCard filters={renderFilter()} title={'Cities'} headerButtons={headerButtons()}/>
                </div>
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
              <div className="card-body">
                <div className="table-responsive">
                  <table
                    className="table table-bordered"
                    width="100%"
                    cellSpacing="0"
                  >
                    <thead>
                      <tr>
                        <th>Sl. No.</th>
                        <th>City name</th>
                        <th>State name</th>
                        {/*<th>Status</th>*/}
                        {permission.moduleList.deleteDisabled &&
                        permission.moduleList.updateDisabled ? null : (
                          <th>Action</th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {lists.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{index + 1 + (pageNo - 1) * 10}</td>
                            <td>{item.name}</td>
                            <td>{item.stateName}</td>
                            {/*<td>{item.status ? 'Active' : 'Inactive'}</td>*/}
                            <td>
                              {/*
                                                        {permission.moduleList.updateDisabled ? null :
                                                            !item.status ?
                                                                <button
                                                                    onClick={UpdateStatus}
                                                                    value={item._id}
                                                                    status={item.status}
                                                                    className="btn btn-info btn-icon-split btn-sm  mb-1 mr-1">
                                                        <span
                                                            className="icon text-white-50"><i
                                                            className="fas fa-exclamation-triangle"></i></span>
                                                                    <span className="text">Disable</span>
                                                                </button>
                                                                :
                                                                <button
                                                                    className="btn btn-success btn-icon-split btn-sm mb-1 mr-1"
                                                                    onClick={UpdateStatus} value={item._id}
                                                                    status={item.status}
                                                                >
                                                    <span className="icon text-white-50"><i
                                                        className="fas fa-check"></i></span>
                                                                    <span className="text">Enable</span>
                                                                </button>
                                                        }
                                                        */}

                             {actionRender(item)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="overflow-auto mt-2">
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
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default CityListing;
