import React, { useEffect, useState } from "react";
import PaginationNew from "../../Widgets/PaginationNew";
import Constant from "../../Components/Constant";
import useGetRoleModule from "../../Services/useGetRoleModule";
import { useParams, useLocation } from "react-router";
import moment from 'moment'
import getApiCall from "../../Services/getApiCall";
import { deslugifyTransform } from "../../Utils/Helpers";
import "../../css/formAuditTrail.css";
import CommonTable from "../../Utils/CommonTable";
import CardListMobile from "../../Utils/CardsMobileView/CardListMobile";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";


const FormAuditTrail = (props) => {
  const {formName, formId, id} = useParams()
  const location = useLocation();
  const {displayName} = location.state || {};
  const [lists, setLists] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(Constant.perPage);
  const [isLoaded, setIsLoaded] = useState(false);
  const [permission, setPermission] = useState({});
  const [auctionPermission, setAuctionPermission] = useState({});
  const [partnerArr, setPartnerArr] = useState([])
  const [propertyDetails, setPropertydetails] = useState([])

  async function getList(page) {
    let response = await getApiCall(`admin/submit/form/audit?formId=${formId}&formValueId=${id}`, {
      page: page,
      contentPerPage: perPage,
    }, true);
  const formattedData = response.data.map((item, index) => ({
                header: `S No: ${(index + 1) + ((pageNo - 1) * perPage)}`,
                data: [
                    { label: "Date/Time", value: moment(item?.createdAt).format('DD-MM-YYYY h:mm:ss') },
                    { label: "Operation", value: item?.operation || '-' },
                    { label: "Field Name", value: item?.fieldName || '-' },
                    { label: "Previous Value", value: formatValue(item?.previousValue) },
                    { label: "New Value", value: formatValue(item?.newValue) },
                    { label: "Remarks", value: item?.remarks || '-' },
                     { label: "Done By", value: item?.doneBy || '-' },
                    { label: "Email", value: item?.email || '-'},
                ],
                status: item.Status,
                footerId: item._id,
                actionButtons:false,
                isAction: false
            }));

            setLists(formattedData);
    // setLists(response.data);
    setTotalItems(response.total);
    setIsLoaded(true);

  }

  async function GetRole() {
    let Role = await useGetRoleModule(deslugifyTransform(formName));
      setPermission(Role);
    // getList();
  }

  useEffect(() => {
    GetRole();
  }, []);


  function pageChangeHandler(page) {
    if (isLoaded) {
      setPageNo(page);
      // getList(page);
    }
  }

  const formatValue = (val) => {
  // null | undefined
  if (val === null || val === undefined) return "-";
  // empty string
  if (typeof val === "string" && val.trim() === "") return "-";
  // number → show
  if (typeof val === "number") return val;
  // non-empty string → show
  if (typeof val === "string") return val;
  // empty array → "-"
  if (Array.isArray(val)) {
    return val.length > 0 ? JSON.stringify(val) : "-";
  }
  // empty object → "-"
  if (typeof val === "object") {
    return Object.keys(val).length > 0 ? JSON.stringify(val) : "-";
  }
  return "-";
  };

  useEffect(() => {
    getList(pageNo);
  }, [pageNo]);

  return (
    <>
      <div className="container-fluid">
        <div className="main-title">
          <FilterWithButtonsCard title={`${deslugifyTransform(displayName || formName)} Audit Trail`}/>
          {/* <h3>{deslugifyTransform(formName)} Audit Trail</h3> */}
        </div>

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

  <div className="d-block d-md-none">
                            <CardListMobile
                                dataList={lists?.length > 0 ? lists : []}
                                perPage={perPage}
                                totalItems={totalItems}
                                currentPage={pageNo}
                                pageChangeHandler={pageChangeHandler}
                                isAction={false}
                            >
                            </CardListMobile>
                        </div>
                        <div className="card shadow mb-4 d-none d-md-block">
                            <div className="card-body">
                                <CommonTable
                                    formattedData={lists?.length > 0 ? lists : []}
                                    perPage={perPage}
                                    totalItems={totalItems}
                                    currentPage={pageNo}
                                    handler={pageChangeHandler}
                                />

                            </div>
                        </div>
            {/* <div className="card shadow mb-4">
              {/*Search and Filter From*
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Date/Time</th>
                        <th>Operation</th>
                        <th>Field Name</th>
                        <th>Previous Value</th>
                        <th>New Value</th>
                        <th>Remarks</th>
                        <th>Done By</th>
                        <th>Email</th>
                      
                      </tr>
                    </thead>

                    <tbody>
                      {
                      lists.length > 0 ?
                      lists.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{moment(item?.createdAt).format('DD-MM-YYYY h:mm:ss')}</td>
                            <td>{item?.operation || '-'}</td>
                            <td>{item?.fieldName || '-'}</td>
                            {/* <td>{item?.previousValue || '-'}</td> *
                            {/* <td>{item?.newValue || '-'}</td> *
                            <td><span  className="table-cell-ellipsis">{formatValue(item?.previousValue)}</span></td>
                            <td><span  className="table-cell-ellipsis">{formatValue(item?.newValue)}</span></td>
                            <td>{item?.remarks || '-'}</td>
                            <td>{item?.doneBy || '-'}</td>
                            <td>{item?.email || '-'}</td>
                            
                            </tr>
                          )})
                            : <tr><td colSpan={12} style={{textAlign: 'center'}}>No records</td></tr>}
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
            </div> */}
          </>
        )}
      </div>
    </>
  );
};

export default FormAuditTrail;
