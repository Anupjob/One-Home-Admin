import React, { useEffect, useState } from "react";
import { Modal, Button, Dropdown, Spinner } from "react-bootstrap";
import getApiCall from "../../Services/getApiCall";
import postApiCall from "../../Services/postApiCall";
import moment from "moment/moment";
import { toast } from "react-toastify";
import { userDetails } from "../../Services/authenticationService";
import ReusableSelect from "../Reusable/ReusableSelect";
import CommonTable from "../../Utils/CommonTable";
import CardListMobile from "../../Utils/CardsMobileView/CardListMobile";

const UserAssignmentModal = ({ show, handleClose, data, formId, formCreator, formApprover, reloadList, permission }) => {
  const userDetailsData = userDetails();
  const [userData, setUserData] = useState({ createUsers: [], approveUsers: [] });
  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  console.log('data::::::', data, userDetailsData)
  const [assignmentData, setAssignmentData] = useState([
    {
      userCategory: "Creator",
      assignedTo: data?.dataCreationAssigneName || "",
      assignmentType: formCreator || '--',
      assignmentStatus: data?.dataCreationAssigneName == "UNASSIGNED" ? "Pending" : data?.dataCreationAssigneName ? "Completed" : "-",
      assignedBy: data?.dataCreationAssignedById ? data?.dataCreationAssignedByName || "--" : formCreator == "MANUAL" ? '--' : 'System',
      assignedDate: data?.dataCreationAssignedDate ? moment(data?.dataCreationAssignedDate).format("DD-MM-YYYY") : "--",
      isEditable: (data.status == "APPROVED" || data.status == "SUBMITTED" || data?.dataCreationAssignedDate) ? false : true,
      assignedUserId: ''
    },
    {
      userCategory: "Approver",
      assignedTo: data?.dataApprovalAssigneName || "",
      assignmentType: formApprover || '-',
      assignmentStatus: data?.dataApprovalAssigneName == "UNASSIGNED" ? "Pending" : data?.dataApprovalAssigneName ? "Completed" : "-",
      assignedBy: data?.dataApprovalAssignedById ? data?.dataApprovalAssignedByName || "--" : formApprover == "MANUAL" ? '--' : 'System',
      assignedDate: data?.dataApprovalAssignedDate ? moment(data?.dataApprovalAssignedDate).format("DD-MM-YYYY") : "--",
      isEditable: (data.status == "APPROVED" || data?.dataApprovalAssignedDate) ? false : true,
      assignedUserId: ''
    },
  ]);

  // ✅ Fetch eligible users dynamically
  const getAssignUserList = async () => {
    try {
      setLoading(true);
      let params = convertToQueryParams(userDetailsData.roles.formFields)
      const queryString = new URLSearchParams(params).toString();
      const response = await getApiCall(
        `admin/submit/form/get-eligible-users?formId=${formId}&type=approve&${queryString}`
      );

      if (response.meta?.status) {
        const createUsers = response.data.createUsers || [];
        const approveUsers = response.data.approveUsers || [];
        setUserData({ createUsers, approveUsers });
      }
    } catch (error) {
      console.error("Error fetching eligible users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId && show) {
      getAssignUserList();
    }
  }, [formId]);

  const handleSelect = (rowIndex, user) => {
    console.log('rowIndex::::::', rowIndex, user)
    const updatedData = [...assignmentData];
    updatedData[rowIndex].assignedTo = user.name;
    updatedData[rowIndex].assignmentStatus = "Pending";
    updatedData[rowIndex].assignedBy = userDetailsData.name;
    updatedData[rowIndex].assignedDate = new Date().toLocaleDateString("en-IN");
    updatedData[rowIndex].assignedUserId = user._id;
    handleSubmitAssigne(updatedData)
    setAssignmentData(updatedData);

    // if (onAssign) onAssign(user);
  };

  const getUsersByCategory = (category) => {
    if (category === "Creator") return userData.createUsers;
    if (category === "Approver") return userData.approveUsers;
    return [];
  };
  console.log('UserAsssss:::::', assignmentData)
  const handleSubmitAssigne = async (assignmentData) => {
    try {
      setLoadingButton(true);
      let payload = {
        taskId: data._id,
        formId: formId,
        userId: data.dataCreationAssigneName == "UNASSIGNED" ? assignmentData[0]?.assignedUserId : data.dataApprovalAssigneName == "UNASSIGNED" && assignmentData[1]?.assignedUserId,
        type: data.dataCreationAssigneName == "UNASSIGNED" ? "create" : data.dataApprovalAssigneName == "UNASSIGNED" && "approve"
      }
      const response = await postApiCall(`admin/submit/form/assign-user`, payload);

      if (response.meta?.status) {
        reloadList()
        toast.success(response.meta.msg)
        handleClose()
      }
    } catch (error) {
      console.error("Error fetching eligible users:", error);
    } finally {
      setLoadingButton(false);
    }
  }
  function convertToQueryParams(data) {
    const converted = convertHierarchy(data);
    const params = {};

    Object.keys(converted).forEach(key => {
      if (Array.isArray(converted[key]) && converted[key].length > 0) {
        params[key] = converted[key];
      }
    });

    return params;
  }
  function convertHierarchy(data) {
    const result = {
      roleName: data.roleName
    };

    Object.keys(data).forEach(key => {
      if (key.startsWith("h") && key.endsWith("Name")) {
        const level = key.replace("Name", ""); // h0Name → h0
        result[level] = data[key];
      }
    });

    return result;
  }
  return (
    <Modal show={show} onHide={handleClose} centered size="xl">
      <Modal.Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Modal.Title>User Assignment</Modal.Title>
        </div>
        <i
          className="fa fa-times ms-auto"
          role="button"
          onClick={handleClose}
          style={{ fontSize: '1.2rem', cursor: 'pointer' }}
        />
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading users...</p>
          </div>
        ) : (<>
        <div className="d-block d-md-none">
                            <CardListMobile
                                dataList={assignmentData.map((item, index) => ({
                  header: ``,
                  data: [
                    { label: "User Category", value: item.userCategory },
                    {
                      label: "Assigned To", value: item.isEditable && !permission?.moduleList?.usereditDisabled ? (
                        <ReusableSelect
                          style={{ width: "100%" }}
                          options={getUsersByCategory(item.userCategory).map((user) => ({
                            label: user.name,
                            value: user._id,
                          }))}
                          isMulti={false}
                          placeholder={`Select ${item.userCategory}`}
                          value={
                            item.assignedTo
                              ? {
                                label: item.assignedTo, // If only name stored, convert to correct format
                                value: getUsersByCategory(item.userCategory)
                                  .find((u) => u.name === item.assignedTo)?._id,
                              }
                              : null
                          }
                          onChange={(selected) => {
                            if (selected) {
                              handleSelect(index, {
                                _id: selected.value,
                                name: selected.label,
                              });
                            }
                          }}
                        />
                      ) : (
                        item.assignedTo
                      )
                    },
                    { label: "Assignment Type", value: item?.assignmentType || '-' },
                    { label: "Assignment Status", value: item.assignmentStatus },
                    { label: "Assigned By", value: item.assignedBy },
                    { label: "Assigned Date", value: item?.assignedDate || '-' },
                  ],
                }))}
                perPage={2}
                totalItems={2}
                currentPage={0}
                handler
                // maxWidth="0px"
                                isAction={false}
                            >
                            </CardListMobile>
                        </div>
          <div className="card shadow mb-4 d-none d-md-block">
            <div className="card-body">
              <CommonTable
                formattedData={assignmentData.map((item, index) => ({
                  header: ``,
                  data: [
                    { label: "User Category", value: item.userCategory },
                    {
                      label: "Assigned To", value: item.isEditable && !permission?.moduleList?.usereditDisabled ? (
                        <ReusableSelect
                          style={{ width: "100%" }}
                          options={getUsersByCategory(item.userCategory).map((user) => ({
                            label: user.name,
                            value: user._id,
                          }))}
                          isMulti={false}
                          placeholder={`Select ${item.userCategory}`}
                          value={
                            item.assignedTo
                              ? {
                                label: item.assignedTo, // If only name stored, convert to correct format
                                value: getUsersByCategory(item.userCategory)
                                  .find((u) => u.name === item.assignedTo)?._id,
                              }
                              : null
                          }
                          onChange={(selected) => {
                            if (selected) {
                              handleSelect(index, {
                                _id: selected.value,
                                name: selected.label,
                              });
                            }
                          }}
                        />
                      ) : (
                        item.assignedTo
                      )
                    },
                    { label: "Assignment Type", value: item?.assignmentType || '-' },
                    { label: "Assignment Status", value: item.assignmentStatus },
                    { label: "Assigned By", value: item.assignedBy },
                    { label: "Assigned Date", value: item?.assignedDate || '-' },
                  ],
                }))}
                perPage={2}
                totalItems={2}
                currentPage={0}
                handler
                maxWidth="300px"
              />

            </div>
          </div>

        </>)}
      </Modal.Body>

    </Modal>
  );
};

export default UserAssignmentModal;
