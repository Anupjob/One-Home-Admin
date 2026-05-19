import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import Constant from "../../Components/Constant";
import PaginationNew from "../../Widgets/PaginationNew";
import axios from 'axios';
import useGetRoleModule from '../../Services/useGetRoleModule';
import loginUser from '../../Services/loginUser';
import CustomButton from '../../Utils/CustomButton';

const WebSiteBuilderList = () => {
    const { webId } = useParams();
    let { accessToken } = loginUser();
    const [lists, setLists] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState([])
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false);

    function pageChangeHandler(page) {
        if (isLoaded) {
            setPageNo(page);
        }
    }

    useEffect(() => {
        if (pageNo > 1 || search?.length > 0) {
            getList();
        }
    }, [pageNo, search])

    const flattenObject = (obj, prefix = '') => {
        return Object.keys(obj).reduce((acc, key) => {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(acc, flattenObject(value, newKey));
            } else {
                acc[newKey] = value;
            }
            return acc;
        }, {});
    }


    async function getList() {
        let response
        if (search != '') {
            response = await getApiCall('admin/web-builder/list', {
                page: pageNo,
                contentPerPage: perPage,
                searchKey: search
            });
        } else {
            response = await getApiCall('admin/web-builder/list', {
                page: pageNo,
                contentPerPage: perPage,
            });
        }
        const submissions = response?.data || [];
        setLists(submissions);    // raw
        setTotalItems(response.total)
    }
    async function GetRole() {
        let Role = await useGetRoleModule('bidders');
        if (Role.moduleList.read === false) {
            setPermission({ moduleAccress: false, moduleList: {}, message: "Module Need Some Permission...Pls contact with Your Partner" })
        } else {
            setPermission(Role)
            getList();
        }
        // const FilteredData = permissionData.formFields.permission.filter((item, index)=>item.label.includes('Auctions'))[0]?.actions || []
        //     setPermission(FilteredData)
        //      getList();

    }

    useEffect(() => {
        GetRole()
    }, []);


    const handleChange = (e) => {
        setSearch(e)
    }

    async function downloadExcelSheet() {
        try {
            const response = await axios({
                url: Constant.apiBasePath + `admin/submit/form/list/${webId}?isExcelDownload=true`,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                }
            });
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download =  'websiteBuilderList.xlsx';
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    }
    async function downloadDataZip() {
        try {
            const response = await axios({
                url: Constant.apiBasePath + `admin/submit/form/list/${webId}?isPdfDownload=true`,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                }
            });
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download =  'websiteBuilderList.zip';
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    }

    async function downloadTemplate() {
        try {
            const response = await axios({
                url: Constant.apiBasePath + `admin/submit/form/template/${webId} `,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    authkey: accessToken
                }
            });
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Template.xlsx';
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    }

    const handleDownload = async (id) => {
        try {

            const response = await axios({
                url: Constant.apiBasePath + `admin/submit/form/download/${webId}/${id}`,
                method: "GET", // Changed to POST
                responseType: "blob",
                headers: {
                    authkey: accessToken,
                    "Content-Type": "application/json", // Added content type for POST request
                },
            });

            const url = URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = `ResponsePdf${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            // Clean up the URL object when the download is complete
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    }

    console.log('re:::::',permission)
    return (

        <>
            <div className="container-fluid">
                {!permission.hasOwnProperty("moduleAccress") &&
                    !permission.moduleAccress ?
                    <div className="row text-center">
                        <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                            <div className="errer">
                                <img src="/program-error.png" />
                                <h2>403</h2>
                                {/* <h4 className="text-danger">{permission.message}</h4> */}
                                <p>{permission?.message}</p>

                            </div>
                        </div>
                    </div>
                    :
                    // permission?.moduleList?.readDisabled ?
                    <>
                        {/* <div className="main-title"><h3> {deslugifyTransform(formName)}</h3></div> */}
                        <div className="main-title d-flex justify-content-between align-items-center flex-wrap">
                            {/* Left Side: Title */}
                            <h3 className="mb-2 mb-md-0">Web Builder List</h3>

                            {/* Right Side: Action Buttons */}
                            <div className="d-flex gap-3 flex-wrap">
                                <div className="position-relative">
                                    <CustomButton
                                        label=""
                                        icon="bi-upload"
                                        // appendClass='dropdown-toggle'
                                        iconAppendClass="me-2 text-white"
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
                                           
                                        </div>
                                    </>)}
                                </div>
                                {permission?.moduleList?.downloadDisabled ? null : (<>
                                    <CustomButton
                                        label=""
                                        disabled={lists?.length == 0}
                                        icon="bi-download"
                                        appendClass='mx-2 text-white'
                                        onClick={downloadExcelSheet}
                                    />
                                    <CustomButton
                                        label="Download Report Zip"
                                        icon="bi-download"
                                        // appendClass='dropdown-toggle'
                                        appendClass='mx-2 text-white'
                                        onClick={downloadDataZip}
                                    />
                                </>)}
                                {permission?.moduleList?.createDisabled ? null :
                                    <CustomButton
                                        label="Add"
                                        icon="bi-plus-lg"
                                        appendClass='mx-2 text-white'
                                        to={`/website/create-update-web-builder/add`}
                                    />
                                }
                            </div>
                        </div>

                        <div className="card shadow mb-4">
                            <div className="card-body">
                                <div className='row'>
                                    <div className="col-12 col-xs-3 col-md-3 col-lg-3">
                                        <div className="form-group">
                                            <input type="text" className="form-control" name="searchKey"
                                                value={search} onChange={(e) => handleChange(e.target.value)}
                                                placeholder="Search ..."
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-xs-9 col-md-9 col-lg-9 d-sm-flex align-items-center justify-content-end">

                                    </div>
                                </div>
                                <div className="table-responsive">
                                    {lists?.length > 0 ? (
                                        <table className="table table-bordered" width="100%" cellSpacing="0">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Url</th>
                                                    <th>Status</th>
                                                    {permission?.length == 0 ? null : lists?.length > 0 && <th>Action</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lists.map((row, i) => (
                                                    <tr key={i}>
                                                        <td key={row._id}>
                                                            {row.name}
                                                        </td>
                                                        <td key={row._id}>
                                                            <Link
                                                                    title={row.url}
                                                                    to={`/website/${row.url}`}
                                                                    className=""
                                                                >
                                                                   {row.url}

                                                                </Link>
                                                           
                                                        </td>
                                                        <td key={row._id}>
                                                            {row.status}
                                                        </td>

                                                        {permission?.moduleList?.updateDisabled && permission?.moduleList?.approveDisabled && permission?.moduleList?.rejectDisabled && permission?.moduleList?.downloadDisabled ? null : <td>

                                                            {permission?.moduleList?.updateDisabled ? null :
                                                                (row.status == "DRAFT" || row.status == "REJECTED") &&
                                                                <Link
                                                                    title='Edit'
                                                                    to={`/website/create-update-web-builder/${row._id}/${row["status"] == "DRAFT" || row["status"] == "REJECTED" ? "edit" : row["status"] == "SUBMITTED" ? "forApproval" : "view"}`}
                                                                    className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1"
                                                                >
                                                                    <span className="icon text-white-50">
                                                                        <i className="far fa-edit"></i>
                                                                    </span>

                                                                </Link>
                                                            }
                                                            {permission?.moduleList?.approveDisabled || permission?.moduleList?.rejectDisabled ? null :
                                                                row.status == "SUBMITTED" && <Link
                                                                    title='Review'
                                                                    to={`/website/create-update-web-builder/${row._id}/${row["status"] == "DRAFT" || row["status"] == "REJECTED" ? "edit" : row["status"] == "SUBMITTED" ? "forApproval" : "view"}?id=${row["ID"]}`}
                                                                    className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1"
                                                                >
                                                                    <span className="icon text-white-50">
                                                                        <i class="bi bi-clipboard-check"></i>
                                                                    </span>

                                                                </Link>
                                                            }
                                                            {permission?.moduleList?.download ? null :
                                                                row.status == "APPROVED" && row.isPdfTemplateExists && <button
                                                                    title='Download'
                                                                    className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1"
                                                                    onClick={() => handleDownload(row["ID"])}
                                                                >
                                                                    <span className="icon text-white-50">
                                                                        <i className="fa fa-download"></i>
                                                                    </span>

                                                                </button>
                                                            }
                                                        </td>}
                                                    </tr>
                                                ))}


                                            </tbody>
                                        </table>
                                    ) : (
                                        <div
                                            className="d-flex justify-content-center align-items-center"
                                            style={{ height: '50vh' }}
                                        >
                                            <h4 className="text-muted">No data found</h4>
                                        </div>
                                    )}
                                    <div className="justify-content-center mt-2">
                                        <PaginationNew perPage={perPage} totalItems={totalItems}
                                            currentPage={pageNo}
                                            handler={pageChangeHandler} />
                                    </div>
                                </div>
                            </div>
                        </div></>
                    // : null
                }


            </div>
        </>
    )
}

export default WebSiteBuilderList;
