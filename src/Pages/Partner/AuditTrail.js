import React, { useEffect, useState } from "react";
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
import { DateRangePicker, Stack} from 'rsuite';
import "rsuite/dist/rsuite.css";
import getApiCall from "../../Services/getApiCall";
import { SelectPicker, Tooltip, Whisper, } from 'rsuite';


const AuditTrail = (props) => {
    let id = props.match.params.id;
  let { accessToken } = loginUser();


  const [lists, setLists] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(Constant.perPage);
  const [isLoaded, setIsLoaded] = useState(false);
  const [partnerList, setPartnerList] = useState([])
  const [searchForm, setSearchForm] = useState({
    searchKey: "",
    fromDate: "",
    toDate: "",
    soldStatus: "",
    stateName: "",
    cityName: "",
  });
  const [permission, setPermission] = useState({});
  const [auctionPermission, setAuctionPermission] = useState({});
  const [partnerArr, setPartnerArr] = useState([])
  const [partnerUserDetails, setPartnerUserDetails] = useState([])
  

  const user = userDetails();

  function changeSearchForm(e) {
    if (!e.target.name) return;
    setSearchForm({
      ...searchForm,
      [e.target.name]: e.target.value,
    });
  }

  const onChangeFilter = (e) => {
    if (!e.target.name) return;
    setSearchForm({
      ...searchForm,
      [e.target.name]: e.target.value,
    });
  };
  const submitFilter = (e) => {
    e.preventDefault();
    getList(1);
    // getEmenities()
  };

  async function getList(page) {
    let response = await getApiCall("admin/partner/audit/"+id, {
      page: page,
      contentPerPage: perPage,
    }, true);

    let propertyResponse = await getApiCall('admin/partner/getUserDetailsById?id=' + id);
    setPartnerUserDetails(propertyResponse.data)
    setLists(response.data);
    setTotalItems(response.total);
    setIsLoaded(true);

  }

  async function tagPickerHandler(e){
    setPartnerArr(e)
  }

  async function GetRole() {
    let Role = await useGetRoleModule("properties/auction");
    if (Role.moduleList.read === false) {
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
            setPartnerList(out)
        //     setPartner(<div className="col-12 col-xs-3 col-md-3 col-lg-3">
        //     <div className="form-group">
        //       <label htmlFor="exampleFormControlSelect1">
        //         Partner
        //       </label>
        //      <TagPicker data={out} style={{ width: 300 }} onChange={(e) => tagPickerHandler(e)}/>
        //   </div>
        //   </div>)
        }
       
      }
      
      setPermission(Role);
    }

    // getList();
  }

  useEffect(() => {
    GetRole();
  }, []);



  function UpdateStatus(e) {
    let id = e.currentTarget.getAttribute("value");
    let status = e.currentTarget.getAttribute("status");
    let isDeleted = e.currentTarget.getAttribute("isDeleted");
    // console.log('status', status)
    // status = status === 1 ? "active" : "deactive"
    status = status == 0 ? "active" : "deactive";
    // console.log('status', status)

    postApiCall("user/property/status", {
      status: status,
      _id: id,
      // isDeleted: isDeleted
    }).then((response) => {
      if (response.meta.status) {
        swal({ text: response.meta.msg, icon: "success", timer: 1500 });
        getList(1);
      }
    });
  }


  const exportToExcel = async () => {
    try {
      const requestData = {
        searchKey: searchForm.searchKey,
        fromDate: searchForm.fromDate,
        toDate: searchForm.toDate,
        soldStatus: searchForm.soldStatus,
        propertyFor: 2,
        partnerArr,
        stateName: searchForm.stateName,
        cityName: searchForm.cityName,
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

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [day, month, year].join("-");
  }

  const dateRangeHandler = (e) => {
    if(e){
   
        let fromDate = e[0]
        let toDate = e[1]
        fromDate = moment(fromDate).format('YYYY/MM/DD');
        toDate = moment(toDate).format('YYYY/MM/DD');
        setSearchForm({
          ...searchForm,
          fromDate,
          toDate
        });

    }else{
      setSearchForm({
            ...searchForm,
            fromDate:"",
            toDate:""
        })
        console.log("DATE RANGE CLEARED")
    }
}

  function pageChangeHandler(page) {
    if (isLoaded) {
      setPageNo(page);
      // getList(page);
    }
  }

  useEffect(() => {
    getList(pageNo);
  }, [pageNo]);

  return (
    <>
      <div className="container-fluid">
        <div className="main-title">
          <h3>User Audit Trail</h3>
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

            <div className="card shadow mb-4">
              {/*Search and Filter From*/}
              <div className="card-body">
                {partnerUserDetails != null ? 
                <table className="table table-bordered">
                    <tr>
                       <td><b>Name:</b> {partnerUserDetails.name}</td>
                    </tr>
                    <tr>
                       <td><b>Email:</b> {partnerUserDetails.email}</td>
                    </tr>
                    <tr>
                       <td><b>Username:</b> {partnerUserDetails.username}</td>
                    </tr>
                    <tr>
                       <td><b>Employee code:</b> {partnerUserDetails.employee_code}</td>
                    </tr>
                </table> : null }

                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Sl. No.</th>
                        <th>Username</th>
                        <th>Date and Time</th>
                        <th>Change description</th>
                        <th>Change Details</th>
                        <th>Computer IP</th>
                      
                      </tr>
                    </thead>

                    <tbody>
                      {
                      lists.length > 0 ?
                      lists.map((item, index) => {
                        // let objects = Object.keys(item.changeRequest)
                        // let chsange = objects.map(_ => {
                        //     return <>
                        //     <p><b>{_} : </b>{item.changeRequest[_]}</p>
                        //     </>
                        // })
                        let changes = []
                        if(item.changeRequest != undefined){
                        for (const [key, value] of Object.entries(item.changeRequest)) {
                            changes.push(<p>{`${key}: ${value}`}</p>)
                          }
                        }else{
                            changes.push("-")
                        }

                        let updtAt1 = new Date(item.updatedAt).toISOString()
                        let DtAt = updtAt1.split("T")[0].split("-")
                        let tmAt = updtAt1.split("T")[1].split(":")
                        return (
                          <tr key={index}>
                            <td>{index + 1 + (pageNo - 1) * 10}</td>
                            <td>{item.partnerUser.name}</td>
                            <td>{moment(item.updatedAt).format('DD-MM-YYYY, h:mm:ss')}</td>
                            <td>{item.auditType}</td>
                            <td>{changes}</td>
                            <td>{item.ipAddress}</td>
                            
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
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AuditTrail;