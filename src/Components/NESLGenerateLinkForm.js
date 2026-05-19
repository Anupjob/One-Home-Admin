import React, { useState } from "react";
import axios from "axios";
import postApiCall from "../Services/postApiCall";

function NESLGenerateLinkForm() {
    const [transId, setTransId] = useState("");
    const [loanNo, setLoanNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [generatedData, setGeneratedData] = useState("");
    const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedData.esignLink)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));

    setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

       try {
  setLoading(true);
  setSuccessMsg("");
  setErrorMsg("");
  setGeneratedData("");

  let payload={
     transId: transId,
     loanno: loanNo,
  }
  const response = await postApiCall('common/nesl-esign/get-link',payload)
  
//   await axios.post(
//     "https://api.nesl.co.in/DDEEsignLinkAPI/request/getesignlink/loans",
//     {
//       transId: transId,
//       loanno: loanNo,
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         "x-api-key": "l9vaSNPKK0cZFDEc93oN",
//         Authorization: "Basic SUlGTEhMOlMyRmR0cWxU",
//       },
//     }
//   );

  // Axios automatically parses JSON
  const data = response.data;
if(response.meta.status){
  setSuccessMsg("Link generated successfully!");
  setGeneratedData(data || "");
}
else{
    setErrorMsg(response.meta.msg || "API Error");
}
} catch (error) {
  console.error(error);

  if (error.response) {
    // Server responded with error
    setErrorMsg(error.response.data?.message || "API Error");
  } else if (error.request) {
    // No response (CORS / network)
    setErrorMsg("No response from server (CORS or network issue)");
  } else {
    setErrorMsg(error.message);
  }
} finally {
  setLoading(false);
}
    };

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 mt-5">
                <h4 className="mb-3">Generate Link</h4>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Trans ID *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={transId}
                            onChange={(e) => setTransId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Loan Number *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={loanNo}
                            onChange={(e) => setLoanNo(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? "Generating..." : "Generate Link"}
                    </button>
                </form>

                {/* Success Message */}
                {successMsg && (
                     <div className="alert alert-success mt-3">
      {successMsg}
      <br /><br />
      <span><b>seqNo: </b></span> <span>{generatedData.seqNo}</span>
      <br />
      <span><b>Url: </b></span>
      <span>
        <a href={generatedData.esignLink} target="_blank" rel="noreferrer">
          {generatedData.esignLink}
        </a>
      </span>
      {/* Copy icon button */}
      <button 
        type="button"
        className="btn btn-sm btn-outline-primary ms-2"
        onClick={copyToClipboard}
        title={copied ? "Copied!" : "Copy URL"}
      >
        <i className={copied ? "bi bi-check-lg" : "bi bi-copy"}></i>
      </button>
    </div>
                )}

                {/* Error Message */}
                {errorMsg && (
                    <div className="alert alert-danger mt-3">
                        {errorMsg}
                    </div>
                )}
            </div>
        </div>
    );
}

export default NESLGenerateLinkForm;