// components/WorkflowTable.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useGetRoleModule from '../../Services/useGetRoleModule';
import getApiCall from '../../Services/getApiCall';
import CardListMobile from '../../Utils/CardsMobileView/CardListMobile';
import FilterWithButtonsCard from '../../Utils/FilterWithButtonsCard';
import CustomButton from '../../Utils/CustomButton';
import CommonTable from '../../Utils/CommonTable';
import CommonActionIcons from '../../Utils/CommonActionIcons';

export default function WorkflowListing() {
  const [workflows, setWorkflows] = useState([]);
  const [permission, setPermission] = useState({})
  const [pageNo, setPageNo] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchKey, setSearchKey] = useState('')
  const [totalItems, setTotalItems] = useState(0);
  const [mobileResponseData, setMobileResponseData] = useState()

  useEffect(() => {
GetRole()
  }, []);

 async function GetRole() {
        let Role = await useGetRoleModule('Workflow');
        if (Role.moduleList.read === false) {
            setPermission({ moduleAccress: false, moduleList: {}, message: "Module Need Some Permission...Pls contact with Your Partner" })
        } else {
            setPermission(Role)
            getList({ page: 1, search: '' });
        }

    }


  function getList({ page = pageNo, search = searchKey } = {}) {
    let params = {
      contentPerPage: perPage,
      page,
      searchKey: search
    }

    getApiCall('admin/workflow/list', params).then((response) => {
      if (response.meta.status) {
        setWorkflows(response.data)
        setTotalItems(response.total)
        const formattedData = response.data.map((item, index) => ({
                    header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
                    data: [
                        { label: "S.N.", value: index + 1 },
                        { label: "Name", value: <Link style={{ textDecoration: "underline" }} to={`/workflow_design/edit?wofId=${item._id}`}>
                                                                    {item.name? item.name : "-"}
                                                   </Link> },
                        { label: "Created", value: new Date(item.createdAt).toLocaleString() },
                        { label: "Updated", value: new Date(item.updatedAt).toLocaleString() },
                    ],
                    status: '', // card footer status
                    footerId: item._id,
                    url: ``,
                    actionButtons: actionRender(item),
                    isAction: actionRender(item, index, true)
                }));
                setMobileResponseData(formattedData)
      } else {
        setWorkflows([])
        setTotalItems(0)
      }
    })
      .catch((error) => {
        setWorkflows([])
        setTotalItems(0)
      })

  }

const downloadExcelSheet = () =>{

}

  const actionRender = async(item, index, forLength = false) => {
        const actions = [];
        const workflowDataUrl = `/workflow_data/${item._id}?workflowName=${item.slug}`;
        console.log('isPdfExists', item)
          if(!permission?.moduleList?.readDisabled){
            actions.push({
                type: "view",
                label: "Workflow Data",
                redirectUrl: workflowDataUrl,
            });
          }
            return <CommonActionIcons actions={actions} />;
          }
const handleReset=()=>{
  setSearchKey('')
  getList({ page: 1, search: '' });
}
  const renderFilter = (forScreen) => (<>
     <div className="moduleList">
      <div className="form-group">
        <input type="text" className="form-control" name="searchKey"
          value={searchKey} onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Search ..."
        />
      </div>
       <div className="form-group d-none d-md-block">
                            <CustomButton
                          label="Apply"
                          
                          appendClass='text-white'
                          variant='danger'
                          iconAppendClass="me-2"
                          onClick={()=>getList({ page: 1, search: searchKey })}
                      />
                          </div>
                           <div className="form-group d-none d-md-block">
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
  const headerButtons=()=>{
    return (
      <div className="d-flex gap-3 flex-wrap justify-content-end mb-2">
        {permission?.moduleList?.downloadDisabled ? null : (<>
          <CustomButton
            label=""
            disabled={mobileResponseData?.length == 0}
            icon="bi-download"
            appendClass='bg-transparent mx-2'
            onClick={downloadExcelSheet}
          />
        </>)}
        {permission?.moduleList?.createDisabled ? null :
          <CustomButton
            label="Add"
            variant="danger"
            icon="bi-plus-lg"
            appendClass='text-white mx-2'
            to={`/workflow_design/add`}
          />
        }
      </div>
    )
  }
  return (
    <div className="container-fluid">
                    {permission.hasOwnProperty("moduleAccress") &&
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
         <div className="main-title"> <FilterWithButtonsCard title={'WorkFlow Dashboard'} headerButtons={headerButtons()}/></div>

                                {/* <div className="main-title"><h3>WorkFlow Dashboard</h3></div> */}
    
                       
                                        <div className="d-block d-md-none">
                                <CardListMobile
                                    dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                    perPage={perPage}
                                    totalItems={totalItems}
                                    currentPage={pageNo}
                                    // pageChangeHandler={pageChangeHandler}
                                    handleFilter={()=>getList({ page: 1, search: searchKey })}
                                    isAction={true}
                                    onreset={handleReset}
                                >
                                    <div style={{ width: '100%', marginRight: '10px' }}>
                                        {renderFilter('mobile')}
                                    </div>

                                </CardListMobile>
                            </div>
                            <div className="card shadow mb-4 d-none d-md-block">
                            <div className="card-body">
                            <CommonTable
                                    formattedData={mobileResponseData?.length > 0 ? mobileResponseData : []}
                                    perPage={perPage}
                                    totalItems={totalItems}
                                    currentPage={pageNo}
                                    handler={()=>getList({ page: 1, search: searchKey })}
                                    isActionStricky={true}
                                    filters={renderFilter()}
                                />
                             
                                
                                        {/* <div className="table-responsive d-none d-md-block">
    <table className="table table-striped mt-4">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Created</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {workflows.map((wf, ind) => (
          <tr key={ind+1}>
            <td>{ind+1}</td>
            <td>{wf.name}</td>
            <td>{new Date(wf.createdAt).toLocaleString()}</td>
            {permission?.moduleList?.updateDisabled && permission?.moduleList?.approveDisabled && permission?.moduleList?.rejectDisabled && permission?.moduleList?.downloadDisabled ? null : <td>

              {actionRender(wf)}
             
            </td>}
          </tr>
        ))}
      </tbody>
    </table>
    </div> */}
    </div>
    </div>
    </>}
    </div>
      );
}
