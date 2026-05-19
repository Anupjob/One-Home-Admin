import React from "react";
import { useState, useEffect } from "react";
import FilterWithButtonsCard from "../../../../Utils/FilterWithButtonsCard";
import CustomButton from "../../../../Utils/CustomButton";
import { useLocation, useNavigate } from "react-router-dom";
import PaginationNew from "../../../../Widgets/PaginationNew";
import CommonActionIcons from "../../../../Utils/CommonActionIcons";
import getApiCall from "../../../../Services/getApiCall";


const ManagePlans = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state;
    const [paymentPlanList, setPaymentPlanList] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);

    const handler = () => {

    }
    useEffect(() => {
        getPaymentPlans()
        // If no data (like after refresh), go back to PageA
        if (!data) {
            //   navigate('/', { replace: true });

        }
        else {
            // getLists()
        }
    }, [data]);
    console.log('data::::', data)
    //  const getLists = (formId, buildingId = '', wingId = '', from = '') => {
    //     getApiCall(`admin/apf-flow/hierarchical-data?formId=${data.formId}&dataEntryId=${data.idFromURL}&buildingId=${data.buildingId}&wingId=${wingId}&page=${pageNo}&limit=${perPage}`)
    //       .then((response) => {
    //         if (response.meta.status) {
    //           let type="Update PropertyInfo"
    //           if(formId==="68c3fd5fe42fa16a3856a89c"){
    //             type="Edit Unit"
    //           }
    //           else if(formId==="68c3e8824a3b18b0efee2019"){
    //             type="Edit Wing"
    //           }
    //           if (from == 'paymentPlan') {
    //             type="paymentPlan"
    //               setWingsList(formattingTableData(response,type, formId))
    //           }
    //           else if (buildingId && wingId) {

    //             setUnitsLists(formattingTableData(response, type, formId) || [])
    //           }
    //           else if (buildingId) {
    //             projectInfoResponse?.forEach((building) => {
    //               if (building._id === buildingId) {
    //                 building.wings = response?.data?.items || []
    //               }
    //             });
    //             setProjectInfoResponse([...projectInfoResponse])
    //           }
    //           else if (formId == "696887e9d3a31d4279a1efce") {
    //             setBuildingList(response?.data?.items || []);
    //             setProjectInfoResponse(response?.data?.items || [])
    //           } else {

    //             setUnitsLists(formattingTableData(response, type, formId) || [])
    //           }
    //         }
    //         else {
    //           if (from == 'paymentPlan') {
    //             console.log('from:::::', from)
    //             setWingsList([])
    //           }
    //           else if (buildingId && wingId) {  
    //             setUnitsLists([])
    //           }
    //           else if(buildingId){  
    //             projectInfoResponse?.forEach((building) => {
    //               if (building._id === buildingId) { 
    //                 building.wings = []
    //               }
    //             });
    //             setProjectInfoResponse([...projectInfoResponse])
    //           }else if (formId == "696887e9d3a31d4279a1efce") {   
    //             setBuildingList([]);
    //             setProjectInfoResponse([])
    //           } else {  
    //             setUnitsLists([])
    //           }
    //         }
    //       })
    //       .catch((error) => {
    //         console.error("Error loading form data:", error);
    //       });
    //   }
    const handleNavigateToCreate = () => {
        navigate(`/selection-payment-plans`, { state: data });
    }
    const headerButtons = () => {
        return (
            <div className="d-flex gap-3 flex-wrap">
                <CustomButton
                    label="Create Payment Plan"
                    variant='danger'
                    icon="bi-plus-lg"
                    appendClass='text-white mx-1'
                    onClick={handleNavigateToCreate}
                // to={`/create-update-from/${slugifyTransform(formName)}/${formId}/add`}
                />
            </div>
        )
    }
    const handleEditPaymentPlan=(item)=>{
        navigate(`/manage-payment-plans/update`, { state: { ...data,...item } });
    }
    const actionRender = async (item,) => {
        console.log('renderaction::::', item)
        const actions = [];
        // Always allow edit

        actions.push({
            type: "edit",
            label: "Edit",
              onClick: () => { handleEditPaymentPlan(item) },
        });

        actions.push({
            type: "delete",
            label: "Delete",
            // onClick: ()=>{},
        });


        return <CommonActionIcons actions={actions} />;
    };

    const getPaymentPlans = async () => {
        if (!data?.dataEntryId) return;

        try {
            const params = new URLSearchParams();

            // property-specific params
            if (data.activeTab === "building" && data.buildingId) {
                params.append("buildingId", data.buildingId);
                // if wing id is provided in data.ID for building tab
                if (data.ID) params.append("wingId", data.ID);
            } else if (data.activeTab === "plot" && data.ID) {
                params.append("plotId", data.ID);
            } else if (data.activeTab === "bunglow" && data.ID) {
                params.append("bunglowId", data.ID);
            }

            // include pagination if needed
            // if (pageNo) params.append("page", pageNo);
            // if (perPage) params.append("limit", perPage);

            const queryString = params.toString();
            const url = `admin/apf-flow/fetch-payment-plan/${data.dataEntryId}${queryString ? `?${queryString}` : ""}`;

            const response = await getApiCall(url);
            if (response?.meta?.status) {
                setPaymentPlanList(response.data || []);
                // try to set totalItems from meta if available
                if (response.meta.total !== undefined) {
                    setTotalItems(response.meta.total);
                } else if (Array.isArray(response.data)) {
                    setTotalItems(response.data.length);
                } else {
                    setTotalItems(0);
                }
            } else {
                setPaymentPlanList([]);
                setTotalItems(0);
            }
        } catch (error) {
            console.error("Error fetching payment plans:", error);
            setPaymentPlanList([]);
            setTotalItems(0);
        }
    }
    return (
        <div className="container-fluid p-4">
            <div className="row">
                <div className="col-12">
                    <FilterWithButtonsCard
                        title="Manage Payment Plans"
                        headerButtons={headerButtons()}
                    >
                        {/* Table or list of payment plans would go here */}
                    </FilterWithButtonsCard>
                </div>
            </div>
            <div className="card mt-3">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <small className="mb-0">Property Type</small>
                            <p className="fw-bold">{data.activeTab || '-'}</p>
                        </div>
                        {data.activeTab == "building" ? (<>
                            <div className="col-md-4">
                                <small className="mb-0">Building Name</small>
                                <p className="text-muted">{data.buildingName || '-'}</p>
                            </div>

                            <div className="col-md-4">
                                <small className="mb-0">Wing Name</small>
                                <p className="text-muted">{data.wingName || '-'}</p>
                            </div>
                        </>)
                            : (<>
                                <div className="col-md-4">
                                    <small className="mb-0">Unit No.</small>
                                    <p className="text-muted">{data.unitNo || '-'}</p>
                                </div>
                            </>)}
                    </div>
                </div>
            </div>
            <div className="card mt-3">
                <div className="card-body">
                    {paymentPlanList?.length > 0 ? (
                        <div className="table-container-wrapper">
                            <div className="table-wrapper">
                                <table className="table table-bordered" width="100%" cellSpacing="0" style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                    <thead style={{ backgroundColor: "#FCFCFD" }}>
                                        <tr>
                                            <th>
                                                Payment Plan Name
                                            </th>
                                            <th>
                                                Plan Type
                                            </th>
                                            <th>
                                                Builder Subvention
                                            </th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentPlanList.map((item, rowIndex) => (
                                            <tr>
                                                <td>{item.planName || '-'}</td>
                                                <td>{item.planType || '-'}</td>
                                                <td>{item.builderSubvention || '-'}</td>
                                                <td>
                                                    {actionRender(item)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                            <div className="pagination-wrapper">
                                <PaginationNew
                                    perPage={perPage}
                                    totalItems={totalItems}
                                    currentPage={pageNo}
                                    handler={handler}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={`card shadow-sm h-100 card-body not-answerd-card`} >
                            <p className="text-muted-not-answerd fst-italic mb-0" style={{ height: `200px`, textAlign: 'center', paddingTop: '80px' }}>
                                No Record Found !
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagePlans;