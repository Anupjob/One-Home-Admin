import React, { useState, useEffect } from "react";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";
import CommonTable from "../../Utils/CommonTable";
import CardListMobile from "../../Utils/CardsMobileView/CardListMobile";
import getApiCall from "../../Services/getApiCall";
import CustomButton from "../../Utils/CustomButton";
import useGetRoleModule from "../../Services/useGetRoleModule";
import CommonActionIcons from "../../Utils/CommonActionIcons";
import { useParams, useLocation } from "react-router-dom";
import { toTitleCase } from "../../Utils/Helpers";

const WorkFlowDataTable = () => {
  const { wofId } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const workflowName = params.get('workflowName');
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


// const formatKey = (key) => {
//   return key
//     .replace(/([A-Z])/g, " $1")
//     .replace(/\b\w/g, (c) => c.toUpperCase());
// };

// const transformData = (data) => {
//   if (!Array.isArray(data)) return { headers: [], rows: [] };

//   const headersSet = new Set();

//   const rows = data.map((item) => {
//     const flat = {
//       ID: item._id,
//       status: item.status,
//       ...item.formResponses
//     };

//     Object.keys(flat).forEach((key) => headersSet.add(key));

//     return flat;
//   });

//   const headers = Array.from(headersSet);

//   const finalRows = rows.map((row) =>
//     headers.map((key) => {
//       const value = row[key];

//       if (Array.isArray(value)) {
//         return value.length ? value.join(", ") : "—";
//       }

//       if (typeof value === "object" && value !== null) {
//         return JSON.stringify(value);
//       }

//       return value || "—";
//     })
//   );

//   return { headers, rows: finalRows };
// };



// const transformData = (data) => {
//   if (!Array.isArray(data)) return { headers: [], rows: [] };

//   const headersSet = new Set();

//   // 🔥 FLATTEN ANY VALUE SAFELY
//   const normalizeValue = (value) => {
//     if (value === null || value === undefined || value === "") return "—";

//     if (Array.isArray(value)) {
//       return value.length
//         ? value
//             .map((v) =>
//               typeof v === "object" ? JSON.stringify(v) : v
//             )
//             .join(", ")
//         : "—";
//     }

//     if (typeof value === "object") {
//       return JSON.stringify(value); // deep object safe
//     }

//     return value;
//   };

//   // 🔥 BUILD FLATTENED ROWS
//   const rows = data.map((item) => {
//     const flat = {
//       ID: item._id,
//       status: item.status,
//       ...item.formResponses,
//     };

//     Object.keys(flat).forEach((key) => headersSet.add(key));

//     const cleaned = {};

//     Object.keys(flat).forEach((key) => {
//       cleaned[key] = normalizeValue(flat[key]);
//     });

//     return cleaned;
//   });

//   const headers = Array.from(headersSet);

//   return { headers, rows };
// };
    function formatLabel(key) {
        return key
            .replace(/([A-Z])/g, ' $1')   // insert space before capital letters
            .replace(/^./, str => str.toUpperCase()); // capitalize first letter
    }
    function prepareDynamicTable(dataList, isTableSetting) {
        if (!dataList || dataList.length === 0) {
            return { headers: [], rows: [] };
        }

        const allFieldKeys = new Set();
        const arrayFieldMap = {};

        const isPrimitiveArray = (arr) =>
            Array.isArray(arr) && arr.every(v => typeof v !== "object");

        // STEP 1: Collect all keys and detect arrays
        dataList.forEach(entry => {
            const formFields = entry?.formResponses || {};

            Object.keys(formFields).forEach(key => {
                if (key === "rolePermission") {
                    const rpArray = formFields[key] || [];
                    rpArray.forEach(rp => {
                        Object.keys(rp).forEach(rpKey => {
                            if (rpKey !== "partnerId" && rpKey !== "roleId") {
                                if (Array.isArray(rp[rpKey])) {
                                    arrayFieldMap[rpKey] = true;
                                }
                                allFieldKeys.add(rpKey);
                            }
                        });
                    });
                } else if (key !== "permission") {
                    if (Array.isArray(formFields[key])) {
                        arrayFieldMap[key] = true;
                    } else {
                        allFieldKeys.add(key);
                    }
                }
            });
        });

        const baseKeys = allFieldKeys;

        // STEP 2: Generate expanded headers
        let expandedHeaders = [];

        baseKeys.forEach(key => {
            if (arrayFieldMap[key]) {
                let isPrimitive = false;

                for (const entry of dataList) {
                    const arr = entry.formResponses?.[key];
                    if (isPrimitiveArray(arr)) {
                        isPrimitive = true;
                        break;
                    }
                }

                if (isPrimitive) {
                    expandedHeaders.push(key);
                } else {
                    let sample = null;

                    // 🔥 NEW: Support array-inside-array
                    dataList.forEach(entry => {
                        const arr = entry.formResponses?.[key];

                        if (Array.isArray(arr) && Array.isArray(arr[0])) {
                            sample = arr[0][0];           // TAKE FIRST ROW → FIRST OBJECT
                        } else if (Array.isArray(arr)) {
                            sample = arr[0];
                        }
                    });

                    if (sample && typeof sample === "object") {
                        Object.keys(sample).forEach(subKey => {
                            expandedHeaders.push(`${key}_${subKey}`);
                        });
                    } else {
                        expandedHeaders.push(key);
                    }
                }
            } else {
                expandedHeaders.push(key);
            }
        });

        expandedHeaders.push("Status", "ID", "isPdfExists");
        // STEP 3: Build rows
        const rows = [];

        dataList.forEach(entry => {
            const formFields = entry.formResponses || {};
            const rolePermissionArray = formFields.rolePermission || [];

            const pushRow = (rp = null) => {
                const row = {};

                expandedHeaders.forEach(header => {
                    if (header === "Status") {
                        row[header] = entry.status=="DATA_ENTRY_PENDING"?"PENDING": entry.workflowStatus|| "-";
                        return;
                    }
                    if (header === "ID") {
                        row[header] = entry._id || "-";
                        return;
                    }
                     if (header === "isPdfExists") {
                        row[header] = entry.pdfTemplateExist || "-";
                        return;
                    }

                    const parts = header.split("_");
                    const key = parts[0];
                    const subKey = parts[1];

                    const value = formFields[key];

                    // 🔥 NEW: ARRAY INSIDE ARRAY SUPPORT
                    if (Array.isArray(value) && Array.isArray(value[0])) {
                        const obj = value[0][0];
                        row[header] = obj?.[subKey] ?? "-";
                        return;
                    }

                    // CASE 1: primitive array
                    if (isPrimitiveArray(value)) {
                        row[header] = value.join(", ");
                        return;
                    }

                    // CASE 2: array of objects
                    if (Array.isArray(value) && typeof value[0] === "object") {
                        row[header] = value[0][subKey] ?? "-";
                        return;
                    }

                    // CASE 3: rolePermission match
                    if (rp && rp.hasOwnProperty(header)) {
                        row[header] = rp[header] ?? "-";
                        return;
                    }

                    // CASE 4: normal field
                    row[header] = formFields[header] !== undefined ? formFields[header] : "-";
                });

                // copy approval/creation display names from the original entry so they are available on the generated row
                row.dataApprovalAssigneName = entry.dataApprovalAssigneName ?? entry.dataApprovalAssigneeName ?? entry.dataApprovalAssigne?.name ?? '-';
                row.dataCreationAssigneName = entry.dataCreationAssigneName ?? entry.dataCreationAssigneeName ?? entry.dataCreationAssigne?.name ?? '-';
                row.dataCreationAssignedById = entry.dataCreationAssignedById ?? '';

                rows.push(row);
            };

            if (Array.isArray(rolePermissionArray) && rolePermissionArray.length > 0) {
                rolePermissionArray.forEach(rp => pushRow(rp));
            } else {
                pushRow();
            }
        });

        return {
            headers: expandedHeaders,
            rows
        };
    }
  function getList({ page = pageNo, search = searchKey } = {}) {
    let params = {
      contentPerPage: perPage,
      page,
      searchKey: search
    }

    getApiCall(`admin/workflow-instance/list/${wofId}`, params).then((response) => {
      if (response.meta.status) {
        setWorkflows(response.data)
        setTotalItems(response.total)
        const submissions = response?.data || [];
         const { headers, rows } = prepareDynamicTable(submissions);
        // const formattedData = response.data.map((item, index) => ({
        //   header: `S No: ${(index + 1) + ((pageNo - 1) * 20)}`, // card header
        //   data: [
        //     { label: "Name", value: item.name },
        //     { label: "Created", value: new Date(item.createdAt).toLocaleString() },
        //   ],
        //   status: '', // card footer status
        //   footerId: item._id,
        //   url: ``,
        //   actionButtons: actionRender(item),
        //   isAction: actionRender(item, index, true)
        // }));
        console.log('headers:::::::', headers,'rows:::', rows)

         const formattedData = rows.map((item, index) => ({
                    header: `S No: ${(index + 1) + ((pageNo - 1) * perPage)}`,
                    data: headers
                        .filter((key) => key !== "ID" && key !== "isPdfExists" && key !== "dataCreationAssignedById")
                        .reduce((acc, key, i) => {
                            // For first item only
                            if (i === 0) {
                                acc.push({
                                    label: formatLabel(key),
                                    value: item[key] ?? '-',
                                    isLink: true,
                                    linkUrl: `/workflow_form_render/${wofId}/${item.ID}?action=view&workflowName=${workflowName}`,
                                    isStricky: true
                                });
                                return acc;
                            }
        
                            // When we reach the Status column, insert Approved By and Created By before it
                            if (key === 'Status') {
                                // acc.push({
                                //     label: 'Approved By',
                                //     value: item.dataApprovalAssigneName ?? '-',
                                // });
                                // acc.push({
                                //     label: 'Created By',
                                //     value: item.dataCreationAssigneName ?? '-',
                                // });
        
                                acc.push({
                                    label: formatLabel(key),
                                    value: item[key] ?? '-',
                                    isStricky: true
                                });
        
                                return acc;
                            }
        
                            // For remaining items
                            acc.push({
                                label: formatLabel(key),
                                value: item[key] ?? "-"
                            });
        
                            return acc;
                        }, []),
                    status: item.Status,
                    footerId: item._id,
                    // actionButtons: actionRender(item, index, false),
                    // isAction: actionRender(item, index, true)
                }));
        
        setMobileResponseData(formattedData)
         setTotalItems(response.pagination.total)
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

  const downloadExcelSheet = () => {

  }

  const actionRender = async (item, index, forLength = false) => {
    const actions = [];
    const editUrl = `/workflow_form_render/${wofId}/${item.ID}?action=edit&workflowName=${workflowName}`;
    const viewUrl = `/workflow_form_render/${wofId}/${item.ID}?action=view&workflowName=${workflowName}`;
    console.log('isPdfExists', item)
    // ⭐ EDIT BUTTON RULES
    // Always allow edit
    if (!permission?.moduleList?.updateDisabled) {
      actions.push({
        type: "edit",
        label: "Edit",
        redirectUrl: editUrl,
      });
    }
     if (!permission?.moduleList?.readDisabled) {
      actions.push({
        type: "view",
        label: "View",
        redirectUrl: viewUrl,
      });
    }
    return <CommonActionIcons actions={actions} />;
  }
  const handleReset = () => {
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
          onClick={() => getList({ page: 1, search: searchKey })}
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
  const headerButtons = () => {
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
            label="View Workflow"
            variant="danger"
            icon="bi-eye"
            appendClass='text-white mx-2'
            to={`/workflow_design/view?wofId=${wofId}`}
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
          <div className="main-title"> <FilterWithButtonsCard title={toTitleCase(workflowName)} headerButtons={headerButtons()} /></div>

          {/* <div className="main-title"><h3>WorkFlow Dashboard</h3></div> */}


          <div className="d-block d-md-none">
            <CardListMobile
              dataList={mobileResponseData?.length > 0 ? mobileResponseData : []}
              perPage={perPage}
              totalItems={totalItems}
              currentPage={pageNo}
              // pageChangeHandler={pageChangeHandler}
              handleFilter={() => getList({ page: 1, search: searchKey })}
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
                handler={() => getList({ page: 1, search: searchKey })}
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
};

export default WorkFlowDataTable;