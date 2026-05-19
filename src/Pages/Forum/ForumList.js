import React, { useState, useEffect } from "react";
import getApiCall from "../../Services/getApiCall";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";
import Constant from "../../Components/Constant";
import CommonTable from "../../Utils/CommonTable";
import CommonActionIcons from "../../Utils/CommonActionIcons";
import CustomButton from "../../Utils/CustomButton";
import CardListMobile from "../../Utils/CardsMobileView/CardListMobile";
import { useNavigate } from "react-router-dom";

const ForumList = () => {
    const navigate = useNavigate();
    const [forums, setForums] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [perPage, setPerPage] = useState(Constant.perPage);
    const [filterForm, setFilterForm] = useState({ searchKey: '' });

    function pageChangeHandler(page) {
        // if (isLoaded) {
        setPageNo(page);
        // getList()
        // }
    }


    useEffect(() => {
        getList()
    }, []);

    const getList = async () => {
        let query = `?page=${pageNo}&limit=${perPage}`;
        if (filterForm.searchKey) query += `&searchKey=${filterForm.searchKey}`;
        let response = await getApiCall(`admin/apf-flow/forum/fetch-forum-list`);
        if (response.meta.status) {
            const formattedData = response.data.map((item, index) => ({
                header: `S No: ${(index + 1) + ((pageNo - 1) * perPage)}`, // card header
                data: [
                    { label: "Name", value: item.name ? item.name : "-" },
                    { label: "Type", value: item.type ? item.type : "-" },
                    { label: "Minimum User Consensus", value: item.minimumUserConsensus ? item.minimumUserConsensus : "-" },
                ],
                footerId: item._id,
                actionButtons: actionRender(item),
                isAction: true
            }));
            setForums(formattedData);
            setTotalItems(response.data.total);
        }
    }

    const handleNavigate = (item) => { 
        console.log('item:::',item)  
navigate('/user-assignment/forum-form', { state:item  })
    }
    const actionRender = (item, forScreen) => {
        const actions = [
            {
                type: "edit",
                label: "Edit",
                onClick:()=>handleNavigate(item),
                // onClick is optional since redirectUrl handles navigation
            },
        ];

        return <CommonActionIcons actions={actions} />;
    };
    const headerButtons = () => {
        return (
            <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
                {/* {permission?.moduleList?.createDisabled ? null : */}
                <CustomButton
                    label="Add"
                    variant="danger"
                    icon="bi-plus-lg"
                    appendClass='text-white mx-2'
                    to="/user-assignment/forum-form"
                />
                {/* } */}
            </div>
        )
    }

    const renderFilter = () => (
        <div className='moduleList'>
            <div className="form-group11 mb-m">
                <input type="text" className="form-control input-height-40" name="searchKey"
                    value={filterForm.searchKey || ''} onChange={(e) => setFilterForm({ ...filterForm, searchKey: e.target.value })}
                    placeholder="Search ..."
                />
            </div>
            <CustomButton
                label="Apply"
                variant='danger'
                appendClass='text-white mx-2 d-none d-md-block'
            // onClick={handleFilterClick}
            />
            {/* <CustomButton
                label="Reset"
                variant='danger'
                appendClass='text-white mx-2 d-none d-md-block'
                onClick={resetFilter}
            /> */}
        </div>
    )
    return (
        <div className="container-fluid">
            <div className="main-title">
                <FilterWithButtonsCard title="Forum List" headerButtons={headerButtons()} filters={renderFilter()} />
            </div>

            <div className="d-block d-md-none">
                <CardListMobile
                    dataList={forums?.length > 0 ? forums : []}
                    perPage={perPage}
                    totalItems={totalItems}
                    currentPage={pageNo}
                    pageChangeHandler={pageChangeHandler}
                    handleFilter={getList}
                    isAction={true}
                // onreset={resetFilter}
                >
                    {renderFilter()}
                </CardListMobile>
            </div>
            <div className="card shadow mb-4 d-none d-md-block">
                <div className="card-body">
                    <CommonTable
                        formattedData={forums?.length > 0 ? forums : []}
                        perPage={perPage}
                        totalItems={totalItems}
                        currentPage={pageNo}
                        handler={pageChangeHandler}
                        isActionStricky={true}

                    />
                </div>
            </div>
        </div>
    )
}

export default ForumList;