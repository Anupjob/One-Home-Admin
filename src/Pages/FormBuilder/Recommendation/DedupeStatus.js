import React from "react";
import moment from "moment";

const DedupeStatus = ({recommendationData}) => {            
  return (<>
      <div className="card">
        <div className="card-body">
            <div className="row">
                <div className="col-md-3">
                     <label className="form-label">User Name</label>
                     <p>{recommendationData?.duplicateProjects?.userName || ""}</p>
                </div>
                <div className="col-md-3">
                  <label className="form-label">User Role</label>
                    <p className="fw-bold fs-2">Regional Technical Manager</p>
                </div>
                 <div className="col-md-3">
                  <label className="form-label">Date / Time</label>
                    <p>{moment(recommendationData?.duplicateProjects?.dateTime)
  .format('DD/MM/YYYY hh:mm A')|| ""}</p>
                </div>
                 <div className="col-md-3">
                  <label className="form-label">Status</label>
                    <p>Dedupe {recommendationData?.duplicateProjects?.status}</p>
                </div>
                 <div className="col-md-12">
                  <label className="form-label">Remark</label>
                    <p>{recommendationData?.duplicateProjects?.remarks}</p>
                </div>
            </div>
         
          </div>
          </div>
  </>);
};

export default DedupeStatus;