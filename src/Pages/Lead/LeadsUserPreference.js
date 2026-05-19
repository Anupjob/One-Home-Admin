import React, {useEffect, useState, useRef} from 'react'

import getApiCall from "../../Services/getApiCall";
import postApiCall from "../../Services/postApiCall";
import Select from 'react-select'
import Pagination from '../../Widgets/Pagination';
import useGetRoleModule from '../../Services/useGetRoleModule';
import {toast} from "react-toastify";
import { notAllowedSpecialcharacter, onlyAllowedNumber} from '../../Components/validationUtils'
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CustomButton from '../../Utils/CustomButton';
const LeadsListing = () => {
    const beds = useRef();
    const budget = useRef();
    const finance = useRef();
    const sourceName = useRef();
    const empCode = useRef()
    const phoneNo = useRef()
    const bath = useRef()
    const carpetArea = useRef()
    const leadId = useRef()
    const stateId = useRef()
    const cityId = useRef()
    const [lists, setLists] = useState([]);
    const [stateList, setStateList] = useState([])
    const [cityList, setCityList] = useState([])
    const [request, setRequest] = useState({})
    const [leadUser, setLeadUser] = useState([])
    const [totalPage, setTotalPage] = useState(0);
    const [page, setpage] = useState(1);
    const [searchKey, setsearchKey] = useState("");
    const [toDt, setToDt] = useState("");
    const [fromDt, setfromDt] = useState("");
    const [leadValue, setLeadValue] = useState("")
    const [permission, setPermission] = useState({})
    const [mobileResponseData, setMobileResponseData] = useState()
    const [totalItems, setTotalItems] = useState(0);

    const setRequ = (obj) => {
        const {name, value} = obj;
        setRequest({...request, [name] : name != "noOfBath" &&  name != "carpetArea" && name != "noOfBeds" && name != "buyingBudget" && name != "sourcePhoneNumber" ? notAllowedSpecialcharacter(value) : onlyAllowedNumber(value)})
    };

    async function getLeadUser() {
        let response = await getApiCall('common/send-enquiry/dropdownList');
        if (response.meta.status == true) setLeadUser(response.data.map(_ => {
            return {value: _._id, label: `${_.name}_${_.mobile}_${_.email}`}
        }))
    }

    async function getLeadPrefrence(page, fromDate, toDate, searchKey) {
        let response = await getApiCall(`common/buying-preference/list?pageNo=${page}&searchKey=${searchKey}&fromDate=${fromDate}&toDate=${toDate}`);
        if (response.meta.status == true) {
            let total = Math.ceil(response.total / 10)
            setTotalPage(total >= 1 ? total : 1)
            setpage(response.pages)
            setTotalItems(response.total)
            const formattedData = response.data.map((item, index) => ({
                header: `S No: ${(index + 1) + ((page - 1) * 20)}`, // card header
                data: [
                    { label: "Location", value: item.cityName },
                    { label: "State", value: item.stateName },
                    { label: "Budget", value: item.buyingBudget },
                    { label: "Bed, Bath, Area", value: `${item.noOfBeds, item.noOfBath, item.carpetArea}` },
                    { label: "Mobile Number", value: item.sourcePhoneNumber ?? item.mobile },
                    { label: "Finance", value: item.buyingBudgetType },
                    { label: "Source", value: item.sourceName },
                    { label: "Employee Code", value: item.employmentCode },
                ],
                status: '', // card footer status
                footerId: item._id,
                url: ``,
                isAction:false
            }));
            setMobileResponseData(formattedData)
            let out = response.data.map((item, index) => {
                return <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.cityName}</td>
                    <td>{item.stateName}</td>
                    <td>{item.buyingBudget}</td>
                    <td>{item.noOfBeds} , {item.noOfBath} , {item.carpetArea} </td>
                    <td>{item.sourcePhoneNumber ?? item.mobile}</td>
                    <td>{item.buyingBudgetType}</td>
                    <td>{item.sourceName}</td>
                    <td>{item.employmentCode}</td>
                </tr>

            })
            setLists(out)
        } else {
            setLists([])
        }

    }

    async function getState() {
        let response = await getApiCall('admin/state/getAll');
        if (response.meta.status == true) setStateList(response.data.map(_ => {
            return {value: _.isoCode, label: _.name}
        }))
        setStateList(old => [{ value:"", label:"Choose States" }, ...old ])
    }

    const stateHandler = (selectedObj) => {
        if(selectedObj){
        console.log("GET STATES")
        GetCity(selectedObj);
        }
    }

    const GetCity = async (selectedObj) => {
        if(selectedObj){
        const {value, label} = selectedObj
        let response = await getApiCall(`admin/city/getAllForOption?isoCode=${value}`);
        if (response.meta.status == true) setCityList(response.data.map(_ => {
            return {value: _._id, label: _.name}
        }))
        setRequ({name: "stateId", value})
        setRequ({name: "stateName", value: label})
    }
    }

    async function leadUserHandler(selectedObj) {
        if(selectedObj){
        const {value, label} = selectedObj
        let leadMeta = label.split("_")
        setRequ({name: "leadId", value})
        setRequ({name: "name", value: leadMeta[0]})
        setRequ({name: "mobile", value: leadMeta[1]})
        setRequ({name: "email", value: leadMeta[2]})
        }
    }

    function cityHandler(selectedObj) {
        if(selectedObj){
        console.log("selectedObj",selectedObj)
        const {value, label} = selectedObj
        setRequ({name: "cityId", value})
        setRequ({name: "cityName", value: label})
        }
    }

    const paginationHandler = (page) => {
        getLeadPrefrence(page, "", "", searchKey);
    }

    function filterHandler() {
        getLeadPrefrence(1, toDt, fromDt, searchKey);
    }

    async function GetRole() {
        let Role = await useGetRoleModule("User Buying Preference");
        setPermission(Role)
        setRequest({})
        getState();
        getLeadUser();
        getLeadPrefrence(1, "", "", "")
    }

    useEffect(() => {
        GetRole()

    }, [1]);



    const submitHandler = async () => {
        let response = await postApiCall("common/buying-preference/byAdmin", {...request}, true);
        console.log("response",response);
        if (response.meta.status == true) {
            beds.current.value = ""
            budget.current.value = ""
            finance.current.value = ""
            sourceName.current.value = ""
            empCode.current.value = ""
            phoneNo.current.value = ""
            bath.current.value = ""
            carpetArea.current.value = ""
            leadId.current.clearValue();
            stateId.current.clearValue();
            cityId.current.clearValue();
            setRequest({})
            toast.success(response.meta.msg);
            getLeadPrefrence(1, "", "", "")
        }
    }

 const renderFilter = (forScreen) => (<>
 <div className='moduleList'>
         <div className="form-group">
             <input type="text" value={searchKey} className="form-control"
                 onChange={(e) => setsearchKey(e.target.value)} placeholder='Search By Name and Mobile number'/>
         </div>
         <div className="form-group">
             <input type="date" value={toDt} className="form-control"
                 onChange={(e) => setToDt(e.target.value)} placeholder='Start Date'/>
         </div>
     
         <div className="form-group">
             <input type="date" value={fromDt} className="form-control"
                 onChange={(e) => setfromDt(e.target.value)} placeholder='End Date'/>
         </div>
         <div className="form-group d-none d-md-block">
             <CustomButton
                 label="Apply"
                 
                 appendClass='text-white'
                 variant='danger'
                 iconAppendClass="me-2"
                 onClick={filterHandler}
             />
         </div>
     </div>
    </>)
    
    return (
        <>
            <div className="container-fluid">

                {permission.hasOwnProperty('moduleAccress') && !permission.moduleAccress ?
                    <div className="row text-center">
                        <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                            <div className="errer">
                                <img src="/program-error.png"/>
                                <h2>403</h2>
                                {/* <h4 className="text-danger">{permission.message}</h4> */}
                                <p>{permission.message}</p>

                            </div>
                        </div>
                    </div>
                    : (Object.keys(permission).length > 0) ? <>
                    <div className="main-title">
          <FilterWithButtonsCard title={'User Buying Preference'} filters={renderFilter()}/>
                </div>
                        {permission.moduleList.createDisabled ? null :
                            <div className="card">

                                <div className="card-body">

                                    <div className="row">
                                        <div className="col-md-2">
                                            <label className="font-weight-bold">Choose state*</label>
                                            <div className="form-group">
                                                <Select options={stateList} value={request["stateId"]} ref={stateId}
                                                        onChange={(e) => stateHandler(e)}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="font-weight-bold">Choose city*</label>
                                            <div className="form-group">
                                                <Select options={cityList} value={request['cityId']} ref={cityId}
                                                        onChange={(e) => cityHandler(e)}/>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="font-weight-bold">Choose Lead User*</label>
                                            <div className="form-group">
                                                <Select options={leadUser} value={request['leadId']} ref={leadId}
                                                        onChange={(e) => leadUserHandler(e)}/>
                                            </div>
                                        </div>
                            
                                        <div className="col-md-2">
                                            <label className="font-weight-bold">Bathroom*</label>
                                            <div className="form-group">
                                                <input type="text" className="form-control" value={request["noOfBath"]}
                                                       ref={bath} onChange={(e) => setRequ({
                                                    name: "noOfBath",
                                                    value: onlyAllowedNumber(e.target.value)
                                                })}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className="col-md-2">
                                            <label className="font-weight-bold">Carpet Area*</label>
                                            <div className="form-group">
                                                <input type="text" className="form-control"
                                                       value={request["carpetArea"]} ref={carpetArea}
                                                       onChange={(e) => setRequ({
                                                           name: "carpetArea",
                                                           value: e.target.value
                                                       })}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="font-weight-bold">Beds*</label>
                                            <div className="form-group">
                                                <input type="text" className="form-control" value={request["noOfBeds"]}
                                                       ref={beds} onChange={(e) => setRequ({
                                                    name: "noOfBeds",
                                                    value: e.target.value
                                                })}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="font-weight-bold">Budget</label>
                                            <div className="form-group">
                                                <input type="text" className="form-control"
                                                       value={request["buyingBudget"]} ref={budget}
                                                       onChange={(e) => setRequ({
                                                           name: "buyingBudget",
                                                           value: e.target.value
                                                       })}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="font-weight-bold">Choose Finance*</label>
                                            <div className="form-group">
                                                <select className="form-control" value={request["buyingBudgetType"]}
                                                        ref={finance} onChange={(e) => setRequ({
                                                    name: "buyingBudgetType",
                                                    value: e.target.value
                                                })}>
                                                    <option value="self">Self</option>
                                                    <option value="home loan">Home Loan</option>
                                                    <option value="finance">finance</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row'>

                                        <div className="col-md-2">
                                            <label className="font-weight-bold">Source Name*</label>
                                            <div className="form-group">
                                                <input type="text" className="form-control"
                                                       value={request["sourceName"]} ref={sourceName}
                                                       onChange={(e) => setRequ({
                                                           name: "sourceName",
                                                           value: e.target.value
                                                       })}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="font-weight-bold">Emp. Code</label>
                                            <div className="form-group">
                                                <input type="text" className="form-control"
                                                       value={request["employmentCode"]} ref={empCode}
                                                       onChange={(e) => setRequ({
                                                           name: "employmentCode",
                                                           value: e.target.value
                                                       })}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="font-weight-bold">Phone No*</label>
                                            <div className="form-group">
                                                <input type="text" className="form-control"
                                                       value={request["sourcePhoneNumber"]} ref={phoneNo}
                                                       onChange={(e) => setRequ({
                                                           name: "sourcePhoneNumber",
                                                           value: e.target.value
                                                       })}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <button className="btn btn-warning"
                                                        onClick={(e) => submitHandler(e)}>Add Preference
                                                </button>
                                            </div>
                                        </div>

                                    </div>

                                </div>


                            </div>}

                        <div className="d-block d-md-none">
                            <CardListMobile
                                dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                perPage={10}
                                totalItems={totalItems}
                                currentPage={page}
                                pageChangeHandler={paginationHandler}
                                handleFilter={filterHandler}
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
                                    <table className="table table-bordered" width="100%" cellSpacing="0">
                                        <thead>
                                        <tr>
                                            <th>Sl. No.</th>
                                            <th>Location</th>
                                            <th>State</th>
                                            <th>Budget</th>
                                            <th>Bed, Bath, Area</th>
                                            <th>Mobile Number</th>
                                            <th>Finance</th>
                                            <th>Source</th>
                                            <th>Employee Code</th>

                                            {/*<th>Action</th>*/}
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {lists}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination prev={page == 1 ? 1 : (page > 1) ? page - 1 : page} current={page}
                                            next={page + 1} pageCount={totalPage} handler={paginationHandler}/>
                            </div>
                        </div>
                    </> : ''}

            </div>
        </>
    )
}

export default LeadsListing