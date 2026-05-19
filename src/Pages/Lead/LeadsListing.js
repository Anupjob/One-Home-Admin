import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import postApiCall from "../../Services/postApiCall";
import deleteApiCall from "../../Services/deleteApiCall";
import Pagination from '../../Widgets/Pagination';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
// Import React FilePond
import {FilePond, File, registerPlugin} from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import Constant from "../../Components/Constant";
import loginUser from "../../Services/loginUser";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { notAllowedSpecialcharacter, onlyAllowedNumber} from '../../Components/validationUtils'
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CustomButton from '../../Utils/CustomButton';

let {accessToken} = loginUser();


const LeadsListing = () => {
    const [lists, setLists] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [page, setpage] = useState(1);
    const [searchKey, setsearchKey] = useState("");
    const [toDt, setToDt] = useState("");
    const [fromDt, setfromDt] = useState("");

    const [name, setName] = useState("")
    const [mobile, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [prospectNumber, setprospectNumber] = useState("")
    const [message, setMessage] = useState("")
    
    const [documentUploadShow, setDocumentUploadShow] = useState(false);
    const [files, setFiles] = useState([])
    const [permission, setPermission] = useState({})
    const [mobileResponseData, setMobileResponseData] = useState()
    const [totalItems, setTotalItems] = useState(0);
    const handleDocumentUploadClose = () => {
        setDocumentUploadShow(false);
        setFiles([])
        getList(1, "", "", "")
    }

    async function getList(page, fromDate, toDate, searchKey) {
        let response = await getApiCall(`common/send-enquiry/list2?page=${page}&contentPerPage=10&searchKey=${searchKey}&fromDate=${fromDate}&toDate=${toDate}`);
        if (response.meta.status == true) {
            let total = Math.ceil(response.total / 10)
            setTotalPage(total >= 1 ? total : 1)
            setpage(response.pages)
            setTotalItems(response.total)
            const formattedData = response.data.map((item, index) => ({
                header: `S No: ${(index + 1) + ((page - 1) * 10)}`, // card header
                data: [
                    { label: "Name", value: item.name },
                    { label: "Phone", value: item.mobile },
                    { label: "Email", value: item.email },
                    { label: "Message", value: item.message },
                    { label: "Prospect Number", value: item?.propertyData?.propertyId },
                    { label: "Source", value: item.source },
                    { label: "Date", value: new Date(item.createdAt).toLocaleDateString("en-US") },
                ],
                status: '', // card footer status
                footerId: item._id,
                url: ``,
                isAction:false
            }));
            setMobileResponseData(formattedData)
            let out = response.data.map((item, index) => {
                return <tr key={index}>
                    <td>{(index + 1) + ((page - 1) * 10)}</td>
                    <td>{item.name}</td>
                    <td>{item.mobile}</td>
                    <td>{item.email}</td>
                    <td>{item.message}</td>
                    <td>{item?.propertyData?.propertyId}</td>
                    <td>{item.source}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString("en-US")}</td>
                </tr>

            })
            setLists(out)
        } else {
            setLists([])
        }

    }

    async function GetRole() {
        let Role = await useGetRoleModule("leads");
        setPermission(Role)
        unsetInput();
        getList(1, "", "", "");
    }

    useEffect(() => {
        GetRole()

    }, []);

    // pagination handler
    const paginationHandler = (page) => {
        getList(page, "", "", searchKey);
    }

    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');
        let status = e.currentTarget.getAttribute('status');
        status = status === "DEACTIVE" ? "ACTIVE" : "DEACTIVE"
        patchApiCall('common/blog/changeStatus/' + id, {
            status: status,
        }).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getList(page, "", "", searchKey);
            }
        });
    }

    function DeleteEvent(e) {
        let id = e.currentTarget.getAttribute('value');
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                deleteApiCall('common/blog/delete/' + id, {}).then((response) => {
                    if (response.meta.status) {
                        swal({text: response.meta.msg, icon: "success", timer: 1500})
                        getList(page, "", "", searchKey);
                    }
                });
            } else {
                // swal("Your imaginary file is safe!");
            }
        });

    }

    function unsetInput() {
        setName("")
        setPhone("")
        setEmail("")
        setprospectNumber("")
        setMessage("")
    }

    async function addLead() {
        if (name == "") {
            alert("Name required..!!")
            return false;
        } else if (mobile == "") {
            alert("Phone required..!!")
            return false;
        } else if (email == "") {
            alert("Email required..!!")
            return false;
        }
        //phone must be 10 digit
        if (mobile.length != 10) {
            alert("Phone must be 10 digit..!!")
            return false;
        }
        // email must be valid
        // email must be valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Email must be valid..!!")
            return false
        }
        let response = await postApiCall("common/send-enquiry/byAdmin", {name, email, mobile, prospectNumber,message}, true);
        if (response.meta.status) {
            alert(response.meta.msg)
            unsetInput();
            getList(1, "", "", "");
        } else {
            alert(response.meta.msg)
        }
    }

    function filterHandler() {
        getList(1, toDt, fromDt, searchKey);
    }

    async function downloadExcel() {
        //let response = await getApiCall(`common/send-enquiry/dropdownList?exportData=1&pageNo=${page}&searchKey=${searchKey}&fromDate=${fromDt}&toDate=${toDt}`);
        let response = await getApiCall('admin/lead/download');
        if (response.meta.status) {
            // console.log(response.data)
            var csvString = response.data;
            var universalBOM = "\uFEFF";
            var a = window.document.createElement('a');
            a.setAttribute('href', 'data:text/csv; charset=utf-8,' + encodeURIComponent(universalBOM + csvString));
            a.setAttribute('download', 'exportLeadList.csv');
            window.document.body.appendChild(a);
            a.click();
            // window.location.reload();
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
          const headerButtons=()=>{
    return(
        <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
            <div className="position-relative">
                <CustomButton
                    label=""
                    icon="bi-download"
                    appendClass='bg-transparent'
                    iconAppendClass="me-2"
                    onClick={downloadExcel}
                />
            </div>
        </div>
    )}
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
          <FilterWithButtonsCard title={'Leads'} filters={renderFilter()} headerButtons={headerButtons()}/>
                </div>
                        {permission.moduleList.createDisabled ? null :
                            <div className="card">
                                {/*<div className="card-header">*/}
                                {/*    <div className="cart-title">Leads</div>*/}
                                {/*</div>*/}
                                <div className="card-body">

                                    <div className="row">
                                        <div className="col-md-2">
                                            <label><b style={{color:'#000000'}}>Name*</b></label>
                                            <div className="form-group">
                                                <input type="text" className="form-control" value={name}
                                                       onChange={(e) => setName(notAllowedSpecialcharacter(e.target.value))}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <label><b style={{color:'#000000'}}>Phone*</b></label>
                                            <div className="form-group">
                                                <input type="text" className="form-control" value={mobile}
                                                       onChange={(e) => setPhone(onlyAllowedNumber(e.target.value))}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <label><b style={{color:'#000000'}}>Email*</b></label>
                                            <div className="form-group">
                                                <input type="email" className="form-control" value={email}
                                                       onChange={(e) => setEmail(notAllowedSpecialcharacter(e.target.value))} required={true}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <label><b style={{color:'#000000'}} >Prospect Number*</b></label>
                                            <div className="form-group">
                                                <input type="prospectNumber" className="form-control" value={prospectNumber}
                                                       onChange={(e) => setprospectNumber(notAllowedSpecialcharacter(e.target.value))} required={true}/>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <label style={{color:'#000000'}}><b>Message*</b></label>
                                            <div className="form-group">
                                                <input type="message" className="form-control" value={message}
                                                       onChange={(e) => setMessage(notAllowedSpecialcharacter(e.target.value))} required={true}/>
                                            </div>
                                        </div>

                                        
                                        
                                        <div className="col-md-6">
                                            <div className="form-group mt30">
                                                <button className="btn btn-md btn-warning" type={"button"}
                                                        onClick={() => setDocumentUploadShow(true)}>Bulk Upload
                                                </button>
                                                <button className="btn btn-md btn-primary ml-2" onClick={(e) => addLead()}>Add  
                                                </button>


                                            </div>
                                        </div>

                                    </div>

                                </div>


                            </div>}

                        <div className="d-block d-md-none">
                              <div className="form-group mt30 d-flex justify-content-end">
                                            <button className="btn btn-md btn-primary" type={"button"}
                                                    onClick={() => downloadExcel()}>Download
                                            </button>
                                        </div>
                            <CardListMobile
                                dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                perPage={10}
                                totalItems={totalItems}
                                currentPage={page}
                                pageChangeHandler={paginationHandler}
                                handleFilter={filterHandler}
                                isAction={false}
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
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                            <th>Message</th>
                                            <th>Prospect Number</th>
                                            <th>Source</th>
                                            <th>Date</th>
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
                    </> : ''

                }
                <Modal show={documentUploadShow} onHide={handleDocumentUploadClose} size="lg">


                    <Modal.Header >
                        <Modal.Title style={{ fontSize: 15 }}>Upload New Document</Modal.Title>
                        <button type="button" className="btn-close" aria-label="Close" onClick={handleDocumentUploadClose}>
                            {/* Replace the default close icon with your custom icon or element */}
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </Modal.Header>

                    <Modal.Body style={{display: 'flex', flexDirection: 'column'}}>
                        <div style={{marginBottom: 12}}>
                            <a className="btn btn-warning btn-sm float-right" href="/lead-bulk-upload.xlsx">Download
                                Sample</a>
                        </div>

                        <div className="">
                            <FilePond
                                files={files}
                                onupdatefiles={setFiles}
                                allowMultiple={true}
                                maxFiles={1}
                                credits={false}

                                name="excel"
                                acceptedFileTypes={['application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']}
                                labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                                server={{
                                    url: Constant.apiBasePath + 'common/send-enquiry/uploadLeadExcel',
                                    process: {
                                        headers: {
                                            authkey: accessToken
                                        },
                                        onload: (res) => {
                                            console.log(res)
                                        },
                                    }
                                }}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>

            </div>
        </>
    )
}

export default LeadsListing
