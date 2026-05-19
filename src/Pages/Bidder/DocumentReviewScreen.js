import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { Document, Page, pdfjs } from 'react-pdf';
import 'pdfjs-dist/web/pdf_viewer.css';
import getApiCall from '../../Services/getApiCall';
import postApiCall from '../../Services/postApiCall';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import moment from 'moment';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
const DocumentReviewScreen = () => {
  let blogToken = localStorage.getItem('uploadT')
  let { id } = useParams();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comment, setComment] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(800); // default fallback
  const containerRef = useRef();
  const [documentUrl, setDocumentUrl] = useState('')
  const [docStatus, setDocStatus] = useState('')
  const [responseData, setResponseData] = useState()

  const handleCloseApprove = () => {
    console.log("Approved with comment:", comment);
    setShowApproveModal(false);
    setComment('');
  };

  const handleCloseReject = () => {
    console.log("Rejected with comment:", comment);
    setShowRejectModal(false);
    setComment('');
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Dynamically set PDF width based on container
  useEffect(() => {
    getBidderDoc()
    const handleResize = () => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, []);

  function isPDF(url) {
    return url.toLowerCase().endsWith('.pdf');
  }

  async function getBidderDoc() {
    try {
      getApiCall(`user/bid/tds/details/${id}`).then((response) => {
        console.log('response::::::', response)
        if (response.meta.status) {
          if (isPDF(response.data.tdsDocument)) {
            setDocumentUrl(response.data.tdsDocument)
            setDocStatus(response.data.tdsStatus || '')
            setResponseData(response.data)
          }
          else {
            toast.error('Only pdf document acceptable !')
          }
        }
        else {
          setDocumentUrl('')
          toast.error(response.meta.msg)
        }

      })
    } catch (error) {
      setDocumentUrl('')
      toast.error(error?.message)
    }

  }
  async function handleStatusUpdate(status) {
    let payload = {
      bidderBidId: id,
      tdsStatus: status, // APPROVED OR REJECTED
      tdsRejectionReason: comment // if rejected this is mendatory
    }
    postApiCall('user/bid/tds/status', payload)
      .then(data => {
        if (data.meta.status) {

          toast.success(data.meta.msg)
          handleCloseApprove()
          handleCloseReject()
          getBidderDoc()
        }
        else {
          toast.error(data.meta.msg)
        }
      })
      .catch(err => {
        toast.error(err.message)
      })
  }

  const handleDownload = async (url) => {
try {
  const response = await fetch(url, { mode: 'cors' });
  const blob = await response.blob();

  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'TDS_Document.pdf'; // <-- Set your custom file name here
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} catch (error) {
  console.error("Download failed:", error);
  alert("Failed to download PDF file.");
}

};


  console.log('documentUrl::::::::', documentUrl, docStatus)
  return (
    <div className="container-fluid">
      <div className="main-title d-flex justify-content-between align-items-center flex-wrap">
  {/* Left Side: Title */}
  <h3 className="mb-2 mb-md-0">TDS Review</h3>

  {/* Right Side: Action Buttons */}
  <div className="d-flex gap-3 flex-wrap">
    {docStatus === 'PENDING' && (
      <>
        <Button variant="success" onClick={() => setShowApproveModal(true)}>
          <i className="fa fa-check me-2"></i>
          Approve
        </Button>
        <Button variant="danger" onClick={() => setShowRejectModal(true)}>
          <i className="fa fa-close me-2"></i>
          Reject
        </Button>
      </>
    )}

    {(docStatus === 'REJECTED' || docStatus === 'APPROVED') && (
      <div
        className={`d-flex align-items-center fs-15 ${
          docStatus === 'APPROVED' ? 'text-success' : 'text-danger'
        }`}
      >
        {docStatus === 'REJECTED' ? (
          <i className="bi bi-x-circle-fill me-2"></i>
        ) : (
          <i className="fa fa-check me-2"></i>
        )}
        {docStatus === 'REJECTED' ? 'Rejected' : 'Approved'}&nbsp;by&nbsp;
        <b>{responseData?.tdsRejectedByPartnerUserName || ''}</b>
        &nbsp;Dated&nbsp;
        <b>
          {moment(
            docStatus === 'REJECTED'
              ? responseData?.tdsRejectionDate
              : responseData?.tdsApprovalDate
          ).format('DD-MM-YYYY')}
        </b>
      </div>
    )}

    {documentUrl && isPDF(documentUrl) && (
      <Button
        variant="primary"
        className='mx-2'
        onClick={() => handleDownload(documentUrl + blogToken)}
      >
        <i className="bi bi-download me-2" />
        Download
      </Button>
    )}
  </div>
</div>

      <div >
       
        
      </div>


      {/* PDF Viewer Area with Overlay Buttons */}
      <div
        className="border rounded shadow-sm bg-light position-relative"
        style={{ height: '72vh', width: '100%' }}
        ref={containerRef}
      >
        {/* 📌 Zoom Buttons - Fixed */}
        <div
          className="position-absolute d-flex gap-2"
          style={{ bottom: '30px', right: '10px', zIndex: 10 }}
        >
          <Button
            size="sm"
            variant="light"
            className="border"
            onClick={() => setPageWidth((w) => w - 100)}
          >
            <i className="bi bi-zoom-out" /> Zoom Out
          </Button>
          <Button
            size="sm"
            variant="light"
            className="border"
            onClick={() => {
              if (containerRef.current) {
                setPageWidth(containerRef.current.offsetWidth);
              }
            }}
          >
            <i className="bi bi-search" /> Reset
          </Button>
          <Button
            size="sm"
            variant="light"
            className="border"
            onClick={() => setPageWidth((w) => w + 100)}
          >
            <i className="bi bi-zoom-in" /> Zoom In
          </Button>
        </div>

        {/* 🧾 Scrollable PDF content only */}
        <div style={{ overflowY: 'auto', height: '100%',  overflowX: 'hidden' }}>
          {documentUrl?.trim() ? (
            <Document
              file={documentUrl+blogToken}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={console.error}
            >
              {Array.from(new Array(numPages), (_, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} width={pageWidth} />
              ))}
            </Document>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',         // Full viewport height
              fontSize: '20px',
              color: '#888',
              textAlign: 'center'
            }}>
              📄 No document found or invalid file URL.
            </div>
          )}

        </div>
      </div>


      {/* Action Buttons */}
      
      {/* Approve Modal */}
      <Modal show={showApproveModal} centered onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Comment (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter approval comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="mx-2 my-2" onClick={() => handleCloseApprove()}>Cancel</Button>
          <Button variant="success" className="mx-2 my-2" onClick={() => handleStatusUpdate('APPROVED')}>Approve</Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal centered show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Comment (Required)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter reason for rejection..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="mx-2 my-2" onClick={() => handleCloseReject()}>Cancel</Button>
          <Button
            className="mx-2 my-2"
            variant="danger"
            onClick={() => handleStatusUpdate('REJECTED')}
            disabled={!comment.trim()}
          >
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DocumentReviewScreen;
