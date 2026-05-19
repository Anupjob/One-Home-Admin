import React, { useEffect, useState } from 'react'
import postApiCall from '../../../Services/postApiCall';
import moment from 'moment';
import { DateRangePicker } from "rsuite";
import 'rsuite/dist/rsuite.min.css';
import { Link } from 'react-router-dom';
import getApiCall from '../../../Services/getApiCall';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Constant from "../../../Components/Constant";
import axios from "axios";
import loginUser from '../../../Services/loginUser';
import PaginationNew from "../../../Widgets/PaginationNew";
import "rsuite/dist/rsuite.css";

const MediaListing = () => {
  let { accessToken } = loginUser();
  let [payload, setpayload] = useState({})
  const [mediaList, setMedialist] = useState([])
  const [noOfProperties, setProperties] = useState('')
  const [noVideo, setNoVideo] = useState('')
  const [noImage, setNoImage] = useState('')
  const [totalPendingDocuments, settotalPendingDocuments] = useState('')
  const [searchMedia, setSearchMedia] = useState('')
  const [startDate, setstartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hoverText, setHoverText] = useState('')
  const [documentUploadShow, setdocumentUploadShow] = useState(false)
  const [prospectId, setProsecptId] = useState('')
  const [newprospectid, setNewProsecptId] = useState('')
  const [results, setResults] = useState([])
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(Constant.perPage);
  const [pageNo, setPageNo] = useState(1);
  const [downloadButton,setDownloadButton] = useState(false)
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    if(startDate != '' && endDate !=''){
      getListData({
        page: pageNo,
        searchKey: searchMedia,
        contentPerPage: perPage,
        dateRange: {
          "start": startDate,
          "end": endDate
        },
      });
    }else{
      getListData({
        page: pageNo,
        searchKey: searchMedia,
        contentPerPage: perPage,
      });
    }
  
  }, [pageNo])

  useEffect(() => {
    payload = {
      searchKey: searchMedia,
      page: pageNo,
      contentPerPage: perPage,
    }
    if (searchMedia != '' && startDate != '' && endDate != '') {
      payload = {
        searchKey: searchMedia,
        dateRange: {
          "start": startDate,
          "end": endDate
        },
        page: pageNo,
        contentPerPage: perPage,
      }
    } else if (searchMedia === '' && startDate != '' && endDate != '') {
      payload = {
        dateRange: {
          "start": startDate,
          "end": endDate
        },
        page: pageNo,
        contentPerPage: perPage,
      }
    } else if (searchMedia != '' && startDate != '' && endDate != '') {
      payload = {
        searchKey: searchMedia,
        dateRange: {
          "start": startDate,
          "end": endDate
        },
        page: pageNo,
        contentPerPage: perPage,

      }
    }
    setpayload(payload)
    getListData(payload)
  }, [searchMedia, startDate, endDate])


  function pageChangeHandler(page) {
    setPageNo(page);

  }

  async function getListData(datapayload) {
    //  console.log(datapayload)
    let response = await postApiCall('admin/media-management/getMediaList', datapayload, true)
    if (response.meta.status) {
      setProperties(response.data.totalProperties)
      setNoVideo(response.data.totalVideosCount)
      setNoImage(response.data.totalImagesCount)
      settotalPendingDocuments(response.data.pendingStatus)
      setMedialist(response.data.propertyMediaData)
      setTotalItems(response.data.total)
    }
  }

  const dateRangeHandler = (value) => {
console.log('dathandler:::::', value)

    if (value) {
      let sDate = value[0];
      let eDate = value[1];
      const parsedDate = moment(sDate);
      const parseEndDate = moment(eDate)
      const newDate = parsedDate.utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');
      const endDate = parseEndDate.utc().endOf('day').subtract(1, 'second').format('YYYY-MM-DDTHH:mm:ss[Z]');

      setstartDate(newDate);
      setEndDate(endDate);
      setDateRange(value)
    } else {
      setstartDate("");
      setEndDate("");
      setDateRange(null)
      //console.log("DATE RANGE CLEARED");
    }
  };
  async function downloadMediaList() {
    try {
      const response = await axios({
        url: Constant.apiBasePath + 'admin/media-management/downloadPropertyMediaExcel',
        method: 'GET',
        responseType: 'blob',
        headers: {
          authkey: accessToken
        }
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mediaList.xlsx';
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDocumentAdd() {
    let payload = {
      "oldProspectId": prospectId,
      "newProspectId": newprospectid

    }
    let response = await postApiCall('admin/media-management/updateProspectId', payload, true)
    if (response.meta.status) {
      getListData({
        page: pageNo,
        contentPerPage: perPage,
      });
    }
    setdocumentUploadShow(false)
  }

  function selectSort(type, order) {
    if (Object.entries(payload).length > 0) {
      payload.sortBy = type;
      payload.orderSort = order
    } else {
      payload = {
        "sortBy": type,
        "orderSort": order,

      }

    }
    getListData(payload)
  }
  function truncateText(value) {
    if(value){
    let truncated = value?.length < 50 ? value : value.substring(0, 50) + "...";
    return truncated;
    }else{
      return ''
    }
  }
  function handleMouseOver(e) {
    if (e?.length < 50) {
      return
    }
    setHoverText(e)
  }
  const onChangeInput = async (e) => {
    setNewProsecptId(e.target.value)
    let value = e.target.value
    const response = await getApiCall(`user/property/prospectNo/${value}/details`);
    if (response.data.propertys.length) {
      setResults(response.data.propertys);

    } else {
      setResults([])
    }
  }
  const onSelectItem = (res) => {
    setNewProsecptId(res.propertyId)
    setResults([])
  }
  return (
    <>
      <div className='container-fluid'>
        <div className="main-title">
          <h3>Media Management</h3>
        </div>
        <div className="card shadow mb-4">
          <div className="card-body">
            <div className="controls">
              <input type="text" placeholder="Search by Prospect ID,Address" style={{ width: '250px' }}
                onChange={(e) => setSearchMedia(e.target.value)}
              />
              <DateRangePicker placeholder="Select Date Range" value={dateRange} onChange={dateRangeHandler} style={{width: '250px', padding:'10px'}} />
              <button className="btn download listclass" onClick={downloadMediaList} onMouseOver={()=> setDownloadButton(true)} onMouseLeave={()=> setDownloadButton(false)}>
              {
                downloadButton ?
                <img src="../../assets/images/download_icon_white.png" className='mb-1' /> 
                :
                <img src="../../assets/images/download_Icon.jpg" className='mb-1' /> 
              }
                
                Download Excel</button>
            </div>
            <div className="stats">
              <div className="stat-card" style={{ marginLeft: '0px' }}>
                <h2>{noOfProperties}</h2>
                <p>No. of Properties</p>
              </div>
              <div className="stat-card">
                <h2>{noVideo}</h2>
                <p>No. of videos uploaded</p>
              </div>
              <div className="stat-card">
                <h2>{noImage}</h2>
                <p>No. of images uploaded</p>
              </div>
              <div className="stat-card" style={{ marginRight: '0px' }}>
                <h2>{totalPendingDocuments}</h2>
                <p>No. of Action Required</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-bordered" style={{ tableLayout: 'fixed',textAlign:'center'}}>
                <thead>
                  {
                      mediaList.length > 0 ? 
<tr>
                    <th style={{ width:'80px'}}>S No.</th>
                    <th style={{ width:'100px'}}>
                      Prospect no.
                    </th>
                    <th style={{ width:'350px'}} >
                      Property Address

                    </th>
                    <th style={{ width:'180px'}}>Media Uploaded
                      <div className='sortingImage'>
                        <img src="../../assets/images/sort_up_Icon.jpg" onClick={() => selectSort('totalMedia', 'desc')} />
                        <img src="../../assets/images/sort_down_Icon.jpg" onClick={() => selectSort('totalMedia', 'asc')} />
                      </div>
                    </th>
                    <th style={{ width:'150px'}}>Media Pending
                      <div className='sortingImage'>
                        <img src="../../assets/images/sort_up_Icon.jpg" onClick={() => selectSort('pendingMediaCount', 'desc')} />
                        <img src="../../assets/images/sort_down_Icon.jpg" onClick={() => selectSort('pendingMediaCount', 'asc')} />
                      </div>
                    </th>
                    <th style={{ width:'150px'}}>Upload Date
                      <div className='sortingImage'>
                        <img src="../../assets/images/sort_up_Icon.jpg" onClick={() => selectSort('createdAt', 'desc')} />
                        <img src="../../assets/images/sort_down_Icon.jpg" onClick={() => selectSort('createdAt', 'asc')} />
                      </div>
                    </th>
                    <th>
                      Action
                    </th>
                  </tr>
                  :<tr></tr>
                  }
                  
                </thead>
                <tbody className='mediaTable'>
                  {
                    mediaList.length > 0 ? mediaList.map((item, index) => {
                      return <tr key={index}>
                        <td>{(index + 1) + ((pageNo - 1) * 20)}</td>
                        <td >
                          <Link to={"/property/media_detail/" + item.prospectId} >
                            {item.prospectId}
                          </Link> 
                          </td>
                        <td className="new-tooltip" onMouseOver={() => handleMouseOver(item?.address)}>{truncateText(item?.address)}
                          {
                            item?.address?.length > 50 ?
                              <span>{hoverText}</span>
                              : <></>
                          }
                        </td>
                        <td>{(item.totalMedia)}</td>
                        <td>{(item.pendingMediaCount)}</td>
                        <td>{moment(item.createdAt).format('DD/MM/YYYY')}</td>
                        <td>  
                          <button
                                  className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1"
                                  onClick={()=> {setdocumentUploadShow(true); setProsecptId(item.prospectId); setNewProsecptId(item.prospectId) }}
                                  
                                >
                                  <span className="icon text-white-50">
                                    <i className="far fa-edit"></i>
                                  </span>
                                </button>
                          </td>
                      </tr>
                    })
                      :
                      <tr>
                        <td colSpan={12} style={{ textAlign: 'center' }}>No records</td>
                      </tr>
                  }
                  <div className="justify-content-center mt-2">
                    <PaginationNew perPage={perPage} totalItems={totalItems}
                      currentPage={pageNo}
                      handler={pageChangeHandler} />
                  </div>

                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Modal show={documentUploadShow} >
        <Modal.Header closeButton>
          <Modal.Title>Upload New Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <div className="form-group file-pond-section">
            <label htmlFor="exampleFormControlFile1">Enter Prospect No</label>
            <input type="text" className="form-control form-control-sm" value={newprospectid} onChange={(e) => {
              onChangeInput(e)
            }
            } />
            {
              results.length ?
                <ul className="results-list">
                  {results.map((res) => (
                    <li onClick={() => onSelectItem(res)}>{res.propertyId}</li>
                  ))}
                </ul>
                : <></>
            }
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setdocumentUploadShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDocumentAdd}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default MediaListing
