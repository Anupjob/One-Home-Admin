import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import swal from 'sweetalert';
import $ from 'jquery';

import EnableDisable from "../../Widgets/EnableDisable";
import DeleteBtn from "../../Widgets/DeleteBtn";
import Pagination from "../../Widgets/Pagination";
import getApiCall from "../../Services/getApiCall";
import patchApiCall from "../../Services/patchApiCall";
import deleteApiCall from "../../Services/deleteApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CommonActionIcons from '../../Utils/CommonActionIcons';

const FaqsListing = () => {

    const [allData, setAllData] = useState('');
    // const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(0);
    const [next, setNext] = useState(0);
    const [previous, setprevious] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const [searchBoxText, setSearchBoxText] = useState('')
    const [tableData, setTableData] = useState([])
    const [isFilterError, setFilterError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('Required *');
    const [pageName] = useState("FAQs");
    const [pageUrl] = useState("/faqs");
    const [permission, setPermission] = useState({})
    const [mobileResponseData, setMobileResponseData] = useState()

    /*
    *
    * @params page : page of pagination
    * @params filter: filter query
    * if filter '' and page 1 it runs default
    * */
//    const actionRender = (item, forScreen) => (<>
//     {permission?.moduleList?.updateDisabled ? null :
//         <EnableDisable id={item._id} status={(item.status === 'ACTIVE') ? 1 : 0}
//             apiurl="common/faq/changeStatus" postitem={{
//                 status: !(item.status === 'ACTIVE') ? 1 : 0 ? 'active' : 'deactive',
//                 faqId: item.faqId
//             }} handler={StatusHandler} />}




//     {permission?.moduleList?.updateDisabled ? null :
//         <Link to={`/faqs/editFaqs/${item.faqId}`}
//             className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
//             <span className="icon text-white-50">
//                 <i className="far fa-edit"></i>
//             </span>
//         </Link>}

//     {permission?.moduleList?.deleteDisabled ? null :
//         <DeleteBtn id={item.faqId}
//                                    handler={() => DeleteHandler(`common/faq/delete/${item.faqId}`, {})}/> }
//  </>)
   const actionRender = (item) => {
  const actions = [];

  // Enable / Disable Action
  if (!permission?.moduleList?.updateDisabled) {
    const isActive = item?.status === "ACTIVE";

    actions.push({
      type: isActive ? "deactivate" : "activate",
      label: isActive ? "Disable" : "Enable",
      variant: isActive ? "btn-info" : "btn-success",
      icon: isActive ? "fas fa-exclamation-triangle" : "fas fa-check",
      tooltip: isActive ? "Disable FAQ" : "Enable FAQ",
      onClick: ()=>StatusHandler('common/faq/changeStatus',{
            status: isActive ? "deactive" : "active",
            faqId: item.faqId,
          }),
    });
  }

  // Edit Action
  if (!permission?.moduleList?.updateDisabled) {
    actions.push({
      type: "edit",
      label: "Edit",
      tooltip: "Edit FAQ",
      icon: "far fa-edit",
      variant: "btn-primary",
      redirectUrl: `/faqs/editFaqs/${item.faqId}`,
    });
  }

  // Delete Action
  if (!permission?.moduleList?.deleteDisabled) {
    actions.push({
      type: "delete",
      label: "Delete",
      tooltip: "Delete FAQ",
      icon: "fa fa-trash",
      variant: "btn-danger",
      onClick: () =>
        DeleteHandler(`common/faq/delete/${item.faqId}`, {}),
    });
  }

  return <CommonActionIcons actions={actions} />;
};

    const CALLAPI = async (page, filter) => {
        let searchTxt = $('#searchTxt').val()
        // getApiCall('admin/faqs/getAll/' + page, {
        getApiCall('common/faq/list', {
            searchText: searchTxt,
            filter: filter
        })
            .then(data => {
                if (data.meta.status) {
                    // let pagination = data.data.pagination;
                    //    setTotal(pagination.Total);
                    // setCurrent(pagination.curr);
                    // setNext(pagination.next);
                    // setprevious(pagination.prev);
                    // setTotalPage(pagination.total);
                    setAllData(data.data);
                    setLoading(true);
                    const formattedData = data.data.map((item, index) => ({
                        header: `S No: ${(index + 1) + ((current) * 20)}`, // card header
                        data: [
                            { label: "Title", value: item.question },
                            { label: "Description", value: item.answer.substring(1, 183) },
                        ],
                        status: '', // card footer status
                        footerId: item._id,
                        url: ``,
                        actionButtons: actionRender(item)
                    }));
                    setMobileResponseData(formattedData)
                }
            })
            .catch(err => {
                console.log('err:::::',err)
                if (err.response === undefined) {
                    swal({text: "API OFFLINE", icon: "warning", dangerMode: true});
                    setLoading(false);
                    return false;
                }
                let API_MESSAGE = err.response.data;
                if (err.response.status === 400) {
                    setLoading(false);
                    swal({text: API_MESSAGE.message, icon: "warning", dangerMode: true});
                } else {
                    console.log(err.response.status);
                    let data = <tr>
                        <td colSpan="5"><p className="text-center">{API_MESSAGE.message}</p></td>
                    </tr>
                    setTableData(data);
                    setLoading(false);
                }
            })
    }

    // useEffect(() => {
    //     if (isFilterError === false) {
    //         GetRole()
    //     }
    //     return () => {
    //     }
    // }, [isLoading, isFilterError]);

    async function GetRole() {
        let Role = await useGetRoleModule("faq");
        if(Role.moduleList.read === false){
            setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
        }else{
            setPermission(Role)
            CALLAPI(1, '');
        }
        
    }

    useEffect(() => {
        GetRole()
    }, []);

    // pagination handler
    const paginationHandler = (page) => {
        let selectedValue = parseInt($('#filter').val());
        if (selectedValue === 2) {
            CALLAPI(page, '');
        } else {
            CALLAPI(page, selectedValue);
        }
    }


    // update status handler 
    const StatusHandler = async (url, postData) => {
        // console.log('called', url, postData)
        let data = await patchApiCall(url, postData);
        if (data.meta.status) {
            // CALLAPI(1, '');
            swal({text: data.meta.msg, icon: "success", timer: 1500});
            window.location.reload();
        }
    }

    const DeleteHandler = async (url, postData) => {
        deleteApiCall(url, postData)
            .then(data => {
                if (data.meta.status) {
                    swal({text: data.meta.msg, icon: "success", timer: 1500});
                    CALLAPI(1, '');
                }
            })
    }

    let renderAllData = '';
    if (isLoading === true) {
        if (allData.length > 0) {
            // console.log(allData);
            renderAllData = allData.map((data, index) => {
                let sNo = (current === 1) ? index + 1 : index + 1 + (current * 10);
                let status = (data.status === 'ACTIVE') ? 1 : 0;
                console.log(data.question, data.status, status)

                return <tr key={data._id}>
                    <th scope="row">{sNo}</th>
                    <td>{data.question}</td>
                    <td>{(data.answer.length > 180) ? `${data.answer.substring(1, 183)}...` : data.answer}</td>
                    {permission.moduleList.deleteDisabled && permission?.moduleList?.updateDisabled ? null : <td  style={{ whiteSpace: 'nowrap' }} >
                   {actionRender(data)}
                        
                                                </td>}
                </tr>;
            })
            setTableData(renderAllData)
            setLoading(false);
        }
    }

     const renderFilter = () => {
        return(
            <></>
        )
    }

    const headerButtons = () => {
        return(
            <></>
        )
    }

    return (
        <div>
            {/* navigation */}
           
            {/* **************core-container************ */}
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
                    :
                    (Object.keys(permission).length > 0) ?
                <>
            <div className="main-title">
            {/* <h3>FAQs </h3> */}
            <FilterWithButtonsCard filters={renderFilter()} title={'FAQs'} headerButtons={headerButtons()}/>
        

                </div>
            {/* <div className="page-breadcrumb">
                <div className="row">
                    <div className="col-12 align-self-center">
                        <div className="d-sm-flex align-items-center justify-content-between mb-4">

                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb m-0 p-0">
                                    <li className="breadcrumb-item"><Link to={pageUrl}>{pageName} Management</Link>
                                    </li>
                                </ol>
                            </nav>
                            {permission.moduleList.createDisabled ? null :
                            <Link to="/faqs/addFaqs">
                                            <button type="submit"
                                                    className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
                                                className="fas fa-plus"></i> Create
                                            </button>
                                        </Link>}
                        </div>

                    </div>
                </div>
            </div> */}
            <div className="d-block d-md-none">
                        <CardListMobile
                            dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                            perPage={1}
                            totalItems={totalPage}
                            currentPage={current}
                            // pageChangeHandler={pageChangeHandler}
                            // handleFilter={getList}
                            isAction={true}
                        >
                            
                        </CardListMobile>
                    </div>
                <div className="row d-none d-md-block">
                    <div className="col-12">

                       <div className="card shadow mb-4 d-none d-md-block">
              {/*Search and Filter From*/}
              <div className="card-body">

                <div className="table-responsive">
                           
                            <div className="table-responsive mb-3">
                                <table className="table table-bordered">
                                    <thead>
                                    <tr>
                                        <th scope="col">SNo.</th>
                                        <th scope="col">Title</th>
                                        <th scope="col">Description</th>
                                        {permission.moduleList.deleteDisabled && permission?.moduleList?.updateDisabled ? null : <th scope="col">Actions</th> }
                                    </tr>
                                    </thead>
                                    <tbody>{tableData}</tbody>
                                </table>
                                <Pagination prev={previous} current={current} next={next} pageCount={totalPage}
                                            handler={paginationHandler}/>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div></> : null}
            </div>
        </div>
    )
}

export default FaqsListing
