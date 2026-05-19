import React, {useState, useEffect, useRef} from 'react'
import getApiCall from "../../Services/getApiCall";
import {useNavigate, useLocation} from 'react-router-dom';
import {FaRegCommentAlt} from 'react-icons/fa';
import Pagination from '../../Widgets/Pagination';
import {Link} from "react-router-dom";
import useGetRoleModule from '../../Services/useGetRoleModule';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CustomButton from '../../Utils/CustomButton';


function LeadCommunications() {
    const history = useNavigate();
    const location = useLocation();

    const [phone, setPhone] = useState('');
    const [search, setSearch] = useState('');
    const [toDt, setToDt] = useState("");
    const [fromDt, setfromDt] = useState("")
    const [communicationData, setCommunicationData] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [page, setpage] = useState(1);
    const [permission, setPermission] = useState({})
    const [mobileResponseData, setMobileResponseData] = useState()
    const [totalItems, setTotalItems] = useState(0);


    const paginationHandler = (page) => {
        setpage(page)
        getLeadCommunications(fromDt, toDt, search, page, "", phone);
        // getLeadCommunications("", "", "", page, "");
    }


    async function getLeadCommunications(fromDate, toDate, searchKey, page, contentPerPage, searchByPhoneEmailName = null) {

        let response = await getApiCall(`common/send-enquiry/list2?fromDate=${fromDate}&toDate=${toDate}&searchKey=${searchKey}&page=${page}&contentPerPage=${contentPerPage}&searchByPhoneEmailName=${searchByPhoneEmailName}`);
        setCommunicationData(response.data);
        setTotalPage(response.pages)
        setTotalItems(response.total)
        const formattedData = response.data.map((item, index) => ({
            header: `S No: ${(index + 1) + ((response.pages - 1) * 10)}`, // card header
            data: [
                { label: "Lead", value: item.name },
                { label: "Name", value: item.name },
                { label: "Email", value: item.email },
                { label: "Phone", value: item.mobile },
                { label: "Title", value: item?.propertyData?.propertyType || '-' },
                { label: "State", value: item?.propertyData?.stateName || '-' },
                { label: "City", value: item?.propertyData?.cityName || '-' },
                { label: "Property Address", value: item?.propertyData?.address.split('') || '-' },
                { label: "Price", value: item?.propertyData?.price || '-' },
            ],
            status: item.status, // card footer status
            footerId: item._id,
            url: ``,
            actionButtons: actionRender(item)
        }));
        setMobileResponseData(formattedData)
    }


    async function GetRole() {
        let Role = await useGetRoleModule("Leads");
        setPermission(Role)
        getLeadCommunications("", "", "", page, "");
    }


    useEffect(() => {
        GetRole();
    }, [])


    const actionRender = (item, forScreen) => (<>
        {permission?.moduleList?.updateDisabled ? null :
            <div>
                <Link to={`Leads_Comments/${item.contactUsId}`}>
                    <FaRegCommentAlt size={15} />
                </Link>
            </div>
        }
     </>)
    
        const renderFilter = (forScreen) => (<>
        <div className='moduleList'>
                                <div className="form-group">
                                    <input type="text" className="form-control" onChange={(e) => {
                                        setSearch(e.target.value)
                                    }
                                    } value={search}
                                    placeholder='Name | Phone No | Email'
                                    />

                                </div>

                                <div className="form-group">
                                    <input type="text" className="form-control"

                                               onChange={(e) => {
                                            setSearch(e.target.value)
                                        }}
                                        value={search}
                                        placeholder='Search By Preference'
                                    />

                                </div>

                                <div className="form-group">
                                    <input type="date" value={fromDt} className="form-control"
                                           onChange={(e) => setfromDt(e.target.value)} placeholder='Start Date'/>
                                </div>

                                <div className="form-group">
                                    <input type="date" value={toDt} className="form-control"
                                           onChange={(e) => setToDt(e.target.value)}  placeholder='End Date'/>
                                </div>
                            <div className="form-group d-none d-md-block">
             <CustomButton
                 label="Apply"
                 
                 appendClass='text-white'
                 variant='danger'
                 iconAppendClass="me-2"
                 onClick={getLeadCommunications(fromDt, toDt, search, page, "", phone)}
             />
         </div>
                            </div>


        </>)
    return (
        <>
            <div className='container-fluid'>
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
                    :(<>
                    <div className="main-title">
          <FilterWithButtonsCard title={'Lead Communications'} filters={renderFilter()}/>
                </div>
                        <div className="d-block d-md-none">
                            <CardListMobile
                                dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                perPage={10}
                                totalItems={totalItems}
                                currentPage={page}
                                pageChangeHandler={paginationHandler}
                                handleFilter={getLeadCommunications(fromDt, toDt, search, page, "", phone)}
                                isAction={true}
                            >
                                <div style={{ width: '100%', marginRight: '10px' }}>
                                    {renderFilter('mobile')}
                                </div>

                            </CardListMobile>
                        </div>
                <div className='card  d-none d-md-block'>
                    <div className='card-body'>
                        <div className="table-responsive mt-5">
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                <tr>
                                    <th>Lead</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Title</th>
                                    <th>State</th>
                                    <th>City</th>
                                    <th>Property Address</th>
                                    <th>Price</th>
                                    {permission.moduleList?.updateDisabled ? null : <th>Comment</th> }

                                </tr>
                                </thead>

                                <tbody>
                                {communicationData.map((item, index) => {
                                    let propertyData = item.propertyData
                                    return (

                                        <tr key={index}>
                                            <td>{(page * 10) + (index + 1) - 10}</td>
                                            <td>{item.name}</td>
                                            <td>{item.email}</td>
                                            <td>{item.mobile}</td>
                                            <td>{propertyData != undefined ? item.propertyData.propertyType : "-"}  </td>
                                            <td> {propertyData != undefined ? item.propertyData.stateName : "-"} </td>
                                            <td>{propertyData != undefined ? item.propertyData.cityName : "-"} </td>
                                            <td> {propertyData != undefined ? item.propertyData.address.split('') : "-"}</td>
                                            <td> {propertyData != undefined ? item.propertyData.price : "-"}</td>
                                            {permission.moduleList?.updateDisabled ? null : <td>
                                                {actionRender(item)}
                                                <div>
                                                    {location.state && location.state.id != null && item._id == location.state.id ? location.state.params : " "}
                                                </div>

                                            </td> }

                                        </tr>

                                    )


                                })}
                                </tbody>
                            </table>
                        </div>

                        <Pagination prev={page == 1 ? 1 : (page > 1) ? page - 1 : page} current={page}
                                    next={page + 1} pageCount={totalPage} handler={paginationHandler}/>

                    </div>

                </div> </>)}
            </div>


        </>
    )
}

export default LeadCommunications