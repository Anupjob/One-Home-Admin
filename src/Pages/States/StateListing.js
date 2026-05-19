import React, { useEffect, useState } from "react";
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import useGetRoleModule from "../../Services/useGetRoleModule";
import CardListMobile from "../../Utils/CardsMobileView/CardListMobile";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";

const StateListing = () => {
  const [lists, setLists] = useState([]);
  const [permission, setPermission] = useState({});
  const [mobileResponseData, setMobileResponseData] = useState()

  async function getEmenities() {
    let response = await getApiCall("admin/state/getAll");
    setLists(response.data);
    const formattedData = response.data.map((item, index) => ({
      header: `S No: ${(index + 1)}`, // card header
      data: [
        { label: "Name", value: item.name },
        { label: "ISO Code", value: item.isoCode },
        { label: "Country Code", value: item.countryCode },
      ],
      status: '', // card footer status
      footerId: item._id,
      url: ``,
      // actionButtons: actionRender(item)
    }));
    setMobileResponseData(formattedData)
  }

  async function GetRole() {
    let Role = await useGetRoleModule("states");
    if (Role.moduleList.read === false) {
      setPermission({
        moduleAccress: false,
        moduleList: {},
        message: "Module Need Some Permission...Pls contact with Your Partner",
      });
    } else {
      setPermission(Role);
    }
  }

  useEffect(() => {
    getEmenities();
    GetRole();
  }, []);

  const headerButtons = () => {
    return (
      <>
      
      </>
    )
  }

   const renderFilter = () => {
    return (
      <>
      
      </>
    )
  }

  return (
    <>
      <div className="container-fluid">
        <div className="main-title">
            <FilterWithButtonsCard filters={renderFilter()} title={'State Management'} headerButtons={headerButtons()}/>
        </div>
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
        ) : (
          <>
          <div className="d-block d-md-none">
                        <CardListMobile
                            dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                            // perPage={perPage}
                            // totalItems={totalItems}
                            // currentPage={pageNo}
                            // pageChangeHandler={pageChangeHandler}
                            handleFilter={getEmenities}
                            isAction={false}
                        />
                    </div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4 d-none d-md-block">
              {/*<Link to="/states/add" className="d-sm-inline-block btn btn-sm btn-primary shadow-sm">*/}
              {/*    Add New*/}
              {/*</Link>*/}
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
                        <th scope="col">Name</th>
                        <th scope="col">ISO Code</th>
                        <th scope="col">Country Code</th>
                        {/*<th>Action</th>*/}
                      </tr>
                    </thead>

                    <tbody>
                      {lists.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td>{item.isoCode}</td>
                            <td>{item.countryCode}</td>

                            {/*<td>*/}
                            {/*    {item.status == "DEACTIVE" ?*/}
                            {/*        <button*/}
                            {/*            onClick={UpdateStatus} value={item._id}*/}
                            {/*            isDeleted={item.isDeleted}*/}
                            {/*            className="btn btn-info btn-icon-split btn-sm  mb-1 mr-1"><span*/}
                            {/*            className="icon text-white-50"><i*/}
                            {/*            className="fas fa-exclamation-triangle"></i></span>*/}
                            {/*            <span className="text">Disable</span>*/}
                            {/*        </button>*/}
                            {/*        :*/}
                            {/*        <button className="btn btn-success btn-icon-split btn-sm mb-1 mr-1"*/}
                            {/*                onClick={UpdateStatus} value={item._id}*/}
                            {/*                isDeleted={item.isDeleted}*/}
                            {/*                status={item.status}*/}
                            {/*        >*/}
                            {/*        <span className="icon text-white-50"><i*/}
                            {/*            className="fas fa-check"></i></span>*/}
                            {/*            <span className="text">Enable</span>*/}
                            {/*        </button>*/}
                            {/*    }*/}

                            {/*    <Link to={"categories/add?id=" + item._id}*/}
                            {/*          className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">*/}
                            {/*        <span className="icon text-white-50">*/}
                            {/*            <i className="far fa-edit"></i>*/}
                            {/*        </span>*/}
                            {/*        <span className="text">Edit</span>*/}
                            {/*    </Link>*/}
                            {/*    <button onClick={UpdateStatus} value={item._id} isDeleted={1}*/}
                            {/*            className="btn btn-danger btn-icon-split btn-sm mb-1">*/}
                            {/*            <span className="icon text-white-50">*/}
                            {/*                <i className="far fa-eye"></i>*/}
                            {/*            </span>*/}
                            {/*        <span className="text">Delete</span>*/}
                            {/*    </button>*/}
                            {/*</td>*/}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default StateListing;
