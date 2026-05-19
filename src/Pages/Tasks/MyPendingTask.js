import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import Constant from "../../Components/Constant";
import useGetRoleModule from '../../Services/useGetRoleModule';
import CustomButton from '../../Utils/CustomButton.js';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import { toast } from 'react-toastify';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard.js';
import CommonActionIcons from '../../Utils/CommonActionIcons.js';
import CommonTable from '../../Utils/CommonTable.js';
import postApiCall from '../../Services/postApiCall.js';
import { deslugifyTransform, toTitleCase } from '../../Utils/Helpers.js';

const MyPendingTask = () => {
    const history = useNavigate()
    const { formId, formName } = useParams();
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [isLoaded, setIsLoaded] = useState(true);
    const [permission, setPermission] = useState([])
    const [search, setSearch] = useState('')
    const [mobileResponseData, setMobileResponseData] = useState()
    const [filterData, setFilterData] = useState({})
    function pageChangeHandler(page) {
        if (isLoaded) {
            setPageNo(page);
        }
    }

    useEffect(() => {
        if (pageNo > 1 || search?.length > 0) {
            console.log("console111 222");
            getList();
        }
    }, [pageNo])
    function convertDate(date) {
        let d = new Date(date);
        let month = "" + (d.getMonth() + 1);
        let day = "" + d.getDate();
        let year = d.getFullYear();

        if (month?.length < 2) month = "0" + month;
        if (day?.length < 2) day = "0" + day;
        return [day, month, year].join("-");
    }
    async function getList(isFilterApplied = false) {
        let response = await getApiCall('admin/notification/get-notifications', {
            page: pageNo,
            limit: perPage,
            sorting: 'desc',
            isPending: true,
            search: isFilterApplied ? 'r' : search
        });

        if (response.meta.status) {
            const formattedData = response.data.map((item, index) => ({
                header: `S No: ${(index + 1) + ((pageNo - 1) * perPage)}`,
                data: [
                    { label: "Task ID", value: item.taskId },
                    { label: "Assigned To", value: item.assignedToName },
                    { label: "Assigned By", value: item?.assignedByName },
                    { label: "Assigned Date", value: convertDate(item.assignedDate) },
                    { label: "Form Name", value: item.formName },
                    { label: "Task Type", value: toTitleCase(item.taskType) },
                ],
                status: item.Status,
                footerId: item._id,
                actionButtons: actionRender(item, index, false),
                isAction: actionRender(item, index, true)
            }));

            setMobileResponseData(formattedData);
        }
    }

    useEffect(() => {
        getList();
    }, []);
    const handleStatusUpdate = async (row) => {
      let payload = {
        notificationId: row._id,
      }
      let response = await postApiCall(`admin/notification/mark-read`, payload);
      if (response.meta.status === true) {
        history(row.cta)
        toast.success(response.meta.msg)
      } else {
        toast.error(response.meta.msg)
      }
    }
    const actionRender = async (item, index, forLength = false) => {
        const actions = []
            actions.push({
                type: "view",
                label: "View",
                redirectUrl: item.cta,
                // onClick: ()=>handleStatusUpdate(item),
            });

        if (forLength) {
            return actions?.length > 0 ? true : false
        }
        return <CommonActionIcons actions={actions} />;
    };
    const handleReset=()=>{
        setSearch('')
        getList(true)
    }
    const renderFilter = (forScreen) => (<>
        <div className="moduleList">
            <div className="form-group" >
                <input
                    type="text"
                    className="form-control"
                    name="searchKey" style={{ width: '100%' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search My Task..."
                />
            </div>
            <div className="form-group d-none d-md-block">
                <CustomButton
                    label="Apply"
                    appendClass='text-white'
                    variant='danger'
                    iconAppendClass="me-2"
                    onClick={()=>getList()}
                />
                {/* <CustomButton
                    label="Reset"
                    appendClass='text-white'
                    variant='danger'
                    iconAppendClass="me-2"
                    onClick={handleReset}
                /> */}
            </div>
        </div>
    </>)

    return (

        <>
            <div className="container-fluid">
                        {/* <div className="main-title"><h3> {deslugifyTransform(formName)}</h3></div> */}
                        <div className="main-title">
                            <FilterWithButtonsCard filters={renderFilter()} title={'My Tasks'} />

                        </div>
                        <div className="d-block d-md-none">
                            <CardListMobile
                                dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                perPage={perPage}
                                totalItems={totalItems}
                                currentPage={pageNo}
                                pageChangeHandler={pageChangeHandler}
                                handleFilter={getList}
                                isAction={true}
                            onreset={handleReset}
                            >
                                {renderFilter()}
                            </CardListMobile>
                        </div>
                        <div className="card shadow mb-4 d-none d-md-block">
                            <div className="card-body">
                                <CommonTable
                                    formattedData={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                    perPage={perPage}
                                    totalItems={totalItems}
                                    currentPage={pageNo}
                                    handler={pageChangeHandler}
                                />

                            </div>
                        </div>

            </div>
        </>
    )
}

export default MyPendingTask;
