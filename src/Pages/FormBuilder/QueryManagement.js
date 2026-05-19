// export default QueryManagement;
import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import getApiCall from "../../Services/getApiCall";
import postApiCall from "../../Services/postApiCall";
import moment from "moment";
import { useParams } from "react-router";
import CommonActionIcons from "../../Utils/CommonActionIcons";
import FilterWithButtonsCard from "../../Utils/FilterWithButtonsCard";
import CustomButton from "../../Utils/CustomButton";
import { deslugifyTransform } from "../../Utils/Helpers";
import { userDetails } from "../../Services/authenticationService";

const QueryManagement = () => {
  const { formName, formId, id } = useParams()
  const [question, setQuestion] = useState("");
  const [queryList, setQueryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [answerText, setAnswerText] = useState("");

  // 🔐 Logged-in user's ID
  const userDetailsData = userDetails();
  const currentUserId = userDetailsData?.id;

  // check if all queries are answered
  const allAnswered =
    queryList.length > 0 &&
    queryList.every((q) => q.queryStatus == "ANSWERED");

  const [showNewQueryBox, setShowNewQueryBox] = useState(false)

  const submitQuery = async () => {
    if (!question.trim()) return;

    const newQuery = {
      formId: formId,
      formValueId: id,
      query: question,
    };

    const response = await postApiCall(
      `admin/query/form/create-query`,
      newQuery
    );

    if (response.meta?.status) {
      getQueryList();
    }

    setQuestion("");
  };

  const openAnswerModal = (query) => {
    setSelectedQuery(query);
    setAnswerText(""); // reset reply box
    setShowModal(true);
  };

  // 🔄 Fetch query list
  const getQueryList = async () => {
    try {
      setLoading(true);
      const response = await getApiCall(
        `admin/query/form/get-query-list?formId=${formId}&formValueId=${id}`
      );

      if (response.meta?.status) {
        setQueryList(response.data);
        setShowNewQueryBox(false)
      }
    } catch (error) {
      console.error("Error fetching query list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      getQueryList();
    }
  }, [formId]);

//   const showAssignedToName = (item) => {
//   console.log("zzz111 item = ", item);

//   const nameFromAnswer =
//     Array.isArray(item?.answerObject) && item.answerObject.length > 0
//       ? item.answerObject[0]?.assignedToName
//       : null;

//   const finalName = nameFromAnswer || item?.assignedToName;

//   return finalName
//     ? <b>{finalName}</b>
//     : <span className="text-muted">—</span>;
// };


  // 🟦 Submit Answer (Only for Assignee)
  const submitAnswer = async () => {
    if (!answerText.trim()) return;

    const payload = {
      formId: formId,
      queryId: selectedQuery._id,
      answer: answerText,
    };

    const res = await postApiCall(`admin/query/form/answer-query`, payload);

    if (res.meta?.status) {
      setShowModal(false);
      getQueryList();
    }
  };
  const headerButtons = () => {
    return (<>
      {(queryList.length === 0 || allAnswered) && (
        <div className="d-flex gap-3 flex-wrap">
          <div className="position-relative">
            <CustomButton
              label="New Query"
              variant='danger'
              icon="bi-plus-lg"
              appendClass='text-white mx-1'
              onClick={() => setShowNewQueryBox(true)}
            />
          </div>
        </div>)
      }
    </>)
  }
  return (<>

    <div className="container-fluid">
      <div className="main-title">
        <FilterWithButtonsCard title={deslugifyTransform(formName) + ' Queries'} headerButtons={headerButtons()} />

      </div>

      {/* ADD QUERY BOX */}
      {showNewQueryBox && (
        <div className="card p-3 mb-4 shadow-sm">
          <p>Start a New Query</p>
          <Form.Control
            type="text"
            multiple={true}
            placeholder="Enter your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="d-flex gap-3 justify-content-center">
            <CustomButton
              label="Submit Query"
              variant='danger'
              icon="bi-floppy"
              appendClass='text-white mt-3'
              onClick={submitQuery}
            />
          </div>
        </div>
      )}
      {/* QUERY CARDS */}
      <div className="card pb-4 pt-4" style={{ backgroundColor: 'rgb(248 250 252)' }}>
        {queryList.length > 0 ? (
          queryList.map((item, index) => (
            <div className="col-sm-12 col-xl-12 col-md-12 mt-2" key={item._id}>
              <div className="card shadow-sm h-100">

                {/* CARD HEADER */}
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="fw-semibold text-truncate">
                    <b>Q.{index + 1} {item.queryRemark} </b>
                  </span>

                  <span
                    className={`badge ${item.queryStatus === "ANSWERED"
                      ? "badge-answered"
                      : "badge-not-answered"
                      }`}
                  >
                    {item.queryStatus}
                  </span>
                </div>

                {/* CARD BODY */}
                <div className={`card shadow-sm h-100 card-body m-4 ${item.queryStatus === "ANSWERED" ? 'answerd-card' : 'not-answerd-card'}`}>
                  {item?.answerObject?.[0]?.answer ? (<>
                    <p style={{ color: '#000' }}><b>Answer:</b></p>
                    <p className="mb-0 text-muted-answerd">
                      {item.answerObject[0].answer}
                    </p>
                  </>) : (<>
                    {showModal ?
                      <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Enter answer here..."
                        value={answerText}
                        className="text-muted-not-answerd mb-2"
                        onChange={(e) => setAnswerText(e.target.value)}
                      />
                      : <p className="text-muted-not-answerd fst-italic mb-0">
                        This query has not been answered yet.
                      </p>
                    }
                  </>)}
                </div>

                {/* CARD FOOTER */}
                <div className="card-footer d-flex justify-content-between align-items-center bg-white flex-column flex-md-row ">
                  <div className="small text-muted d-flex align-items-center justify-content-between">

                    {/* Assignee Flow */}
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person-circle mr-2 fs-4" style={{ fontSize: "20px" }} title={'Assigned By Name'}></i>
                      <b>{item.assignedByName || "—"}</b>

                      <i className="bi bi-arrow-right mx-2 fs-4" style={{ fontSize: "20px" }}></i>

                      <i className="bi bi-person-fill mr-2 fs-4" style={{ fontSize: "20px" }} title={'Assigned To Name'}></i>
                      <b>{item.assignedToName || "—"}</b>
                      {/* {showAssignedToName(item)} */}
                    </div>

                    {/* Date */}
                    <div className="d-flex align-items-center gap-2 mx-4">
                      <i className="bi bi-calendar mr-2 fs-4" style={{ fontSize: "20px" }}></i>
                      <span><b>{moment(item.createdAt).format("MMM DD, YYYY")}</b></span>
                    </div>

                  </div>



                    {/* {(item.queryStatus === "OPEN" && item.assignedToId == currentUserId)&&(<>
                  <div>
                      {showModal && <CustomButton label={'Cancel'} onClick={() => setShowModal(false)} icon={'bi-x-lg'} appendClass="text-white" />}
                      <CustomButton label={showModal ? 'Submit Answer' : 'Answer Query'} onClick={() => { showModal ? submitAnswer() : openAnswerModal(item) }} icon={showModal ? 'bi-floppy' : 'bi-reply-fill'} appendClass="text-white" />
                  </div>
                    </>)} */}
                    {(item.queryStatus === "OPEN" && ((!item?.assignedToId) || (item.assignedById == currentUserId) || (item.assignedToId == currentUserId)))&&(<>
                  <div>
                      {showModal && <CustomButton label={'Cancel'} onClick={() => setShowModal(false)} icon={'bi-x-lg'} appendClass="text-white" />}
                      <CustomButton label={showModal ? 'Submit Answer' : 'Answer Query'} onClick={() => { showModal ? submitAnswer() : openAnswerModal(item) }} icon={showModal ? 'bi-floppy' : 'bi-reply-fill'} appendClass="text-white" />
                  </div>
                    </>)}
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center text-muted py-4">
            No query found
          </div>
        )}
      </div>
    </div>
    {/* ANSWER VIEW / REPLY MODAL */}

  </>);
};

export default QueryManagement;
