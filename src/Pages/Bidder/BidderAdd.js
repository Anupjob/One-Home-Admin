import React, { useState, useEffect } from 'react';
import getApiCall from "../../Services/getApiCall";
import postApiCall from '../../Services/postApiCall';
import moment from 'moment';
import swal from 'sweetalert';
import { FilePond } from "react-filepond";
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import Constant from "../../Components/Constant";
import loginUser from "../../Services/loginUser";
import { toast } from 'react-toastify';
import { ToWords } from 'to-words';
import CustomButton from '../../Utils/CustomButton';
import CreatableSelect from "react-select/creatable";
import { deslugifyTransform } from '../../Utils/Helpers';
import BidderNewAdditionForm from './BidderNewAdditionForm';

const BidderAddForm = () => {
  let { accessToken } = loginUser();
  const [formData, setFormData] = useState({
    prospectNo: '',
    auctionId: '',
    auctionDate: '',
    typeOfPayment: '',
    reservePrice: '',
    reservePayment: '',
    paymentMode: '',
    bidderMobile: '',
    bidderId: '',
    bidderEmail: '',
    bidderName: '',
    bidderPan: '',
    amount: '',
    oamount: '',
    emdAmount: '',
    transactionId: '',
    paymentDate: '',
    paymentDateTime: '',
    paymentDocUrl: '',
    tenderFormUrl: '',
    offeramount: '',
    referralSource: '',
    referralCode: '',
    referralVendorCode: '',
    referalPerson: '',
    referralPersonName: '',
    referalPersonEmailId: '',
    referalPersonPanCard: ''

  });
  const [results, setResults] = useState([]);
  const [bidderDetial, setBidderDetails] = useState([])
  const [hasbidder, setHasBidder] = useState(false)
  const [bidderError, setBidderError] = useState('')
  const [loading, setLoading] = useState(false);
  const [errorstate, setError] = useState('')
  const [selectPropspect, setSelectPropspect] = useState('')
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [typeOfData, setTypeOfData] = useState('EMD/EOI')
  const [inputValue, setInputValue] = useState("");
  const [coBidderList, setCOBidderList] = useState([])
  const [coBiddersList, setCOBiddersList] = useState([])
  const [sourceList, setSourceList] = useState([])


  const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        // can be used to override defaults for the selected locale
        name: 'Rupee',
        plural: 'Rupees',
        symbol: '₹',
      },
    },
  });

  const handleChange = async (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    if (value.length <= 0) {
      setLoading(true);
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      return
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setLoading(true);

    try {
      const response = await getApiCall(`user/property/prospectNo/${value}/details`);
      if (response.data.propertys.length) {
        const mapped = response.data.propertys.map(item => ({
          ...item,                         // keep all original item properties
          value: item._id,                 // required by react-select
          label: item.propertyId           // displayed in the dropdown
        }));

        setResults(mapped);
        // if(response.data.propertys.length==1){
        //   setTimeout(()=>handleSelectProspect(response.data.propertys[0]._id),1000)
        // }

        setLoading(false);
        setBidderError('')
      } else {
        setLoading(true);
        setBidderError('Enter Correct Prospect Number ')
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }
  const handleSelectProspect = (id) => {
    const filteredNumbers = results.filter(res => res._id === id);
    setSelectPropspect(filteredNumbers)
    setLoading(true);
    console.log('filteredNumbers:::::::', filteredNumbers)
    if (filteredNumbers?.length == 1) {
      handleSelectAction(filteredNumbers[0]?.auctionId, filteredNumbers)
    }

  }
  const handleBidderChange = async (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      bidderPan: value,
    }));
    if (value.length === 10) {
      try {
        const response = await getApiCall(`user/bid/bidder/details?panNumber=${value}`);
        if (response.data.bidderDetails) {
          setBidderDetails(response.data)
          setHasBidder(true)
          setFormData((prevData) => ({
            ...prevData,
            bidderId: response.data.bidderDetails._id,
            bidderEmail: response.data.bidderDetails.email,
            bidderName: response.data.bidderDetails.name,
            bidderPan: response.data.bidderDetails.PANNumber,
            bidderMobile: response.data.bidderDetails.mobile,
          }));
          setError('')
        } else {
          setBidderDetails([])
          setHasBidder(false)
          setError('Bidder does not exist')
          setFormData((prevData) => ({
            ...prevData,
            bidderId: '',
            bidderEmail: '',
            bidderName: '',
            bidderPan: '',
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    } else if (value.length > 10) {
      setHasBidder(false)
      return

    } else {
      setError('Enter Valid Mobile Number')
      setHasBidder(false)
    }
  }
  const handleBidderselect = async (event) => {
    setFormData((prevData) => ({
      ...prevData,
      bidderId: event._id,
      bidderEmail: event.email,
      bidderName: event.name,
      bidderMobile: event.mobile,
    }));
    setCOBiddersList(bidderDetial?.coBidders || [])
    setHasBidder(false)
  }
  const handleSelectChange = (event) => {
    const { name, value } = event.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  const handleTimeChange = (event) => {
    const { name, value } = event.target
    const formattedDateTime = moment(value).format('YYYY-MM-DD hh:mm:ss A');
    if (formattedDateTime != 'Invalid date') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        paymentDateTime: formattedDateTime
      }));
    }

  }


  const numberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  };

  const checkValidation = () => {

    if (!results.length) {
      return false
    }
    if (!formData.bidderId && typeOfData == "EMD/EOI") {
      return false
    }
    if (formData.emdAmount === '' && typeOfData == "EMD/EOI") {
      return false
    }
    if (formData.paymentMode !== "INBT") {
      if (formData.transactionId === '' || formData.paymentDateTime === '') {
        return false
      }
    }
    if (formData.typeOfPayment === '' || formData.paymentMode === '') {
      return false
    }
    if (!formData.paymentDocUrl && formData.paymentMode !== "INBT") {

      return false;
    }
    return true
  }
  const submitForm = async (e) => {
    e.preventDefault()
    const validation = checkValidation()
    try {
      let payload = {
        prospectNo: formData.prospectNo,
        auctionId: formData.auctionId,
        amount: parseInt(formData.amount),
        paymentDate: formData.paymentMode !== "INBT" ? formData.paymentDateTime : 'NA',
        transactionId: formData.paymentMode !== "INBT" ? formData.transactionId : 'NA',
        paymentMode: formData.paymentMode,
        paymentDocUrl: formData.paymentMode !== "INBT" ? formData.paymentDocUrl : 'NA',
      }
      if (!validation) {
        return
      }
      if (typeOfData == "EMD/EOI") {
        let referralDetails = {}
        if (formData.referralSource === 'iifl-employee') {
          referralDetails = {
            empCode: formData.referralCode
          }
        } else if (formData.referralSource === 'no-broker' || formData.referralSource === 'hecta' || formData.referralSource === 'nexxen-disposal-hub' || formData.referralSource === 'arclegum-management-private-limited' || formData.referralSource === 'valuetrust-capital-services-private-limited') {
          referralDetails = {
            name: formData.referalPerson,
            empCode: formData.referralVendorCode,

          }
        } else if (formData.referralSource === 'broker') {
          referralDetails = {
            name: formData.referralPersonName,
            mailId: formData.referalPersonEmailId,
            panCard: formData.referalPersonPanCard
          }
        } else if (formData.referralSource === 'self') {
          referralDetails = {}
        } else if (formData.referralSource === 'iifl-employee+broker') {
          referralDetails = {
            name: formData.referralPersonName,
            mailId: formData.referalPersonEmailId,
            panCard: formData.referalPersonPanCard,
            empCode: formData.referralSource
          }
        }

        payload = {
          ...payload,
          PANNumber: formData.bidderPan,
          coBidders: coBidderList?.map((bid) => bid.cobidderPan) || [],
          offerAmount: parseInt(formData.oamount),
          tenderFormUrl: formData.tenderFormUrl,
          referralSource: formData.referralSource,
          referralDetails: referralDetails
        }
      } else if (typeOfData == "Balance Sale Payment") {
        payload = {
          ...payload,
          installmentType: formData.paymentMode !== "INBT" ? 'SECOND_CUSTOM' : 'FULL'
        }
      }
      if (validation && formData.tenderFormUrl !== '') {
        payload["tenderFormUrl"] = formData.tenderFormUrl
      }
      let url = ''
      if (typeOfData == "EMD/EOI") {
        url = "user/transaction/manual-addition"
      } else if (typeOfData == "Balance Sale Payment") {
        url = 'user/transaction/manual-balance-sale-payment'
      }
      const response = await postApiCall(url, payload, true)

      if (response && response.meta.status) {
        toast.success(response.meta.msg)
      } else {
        toast.error(response.meta.msg)
      }
    }
    catch (error) {
      toast.error(error.message || "Something went wrong !")
    }

  }

  // Event handler for input change
  const handleInputChange = (event) => {
    // Remove non-digit characters (except commas) from the input
    const newValue = event.target.value.replace(/[^\d,]/g, '');

    // Format the number with commas
    const formattedValue = numberWithCommas(newValue.replace(/,/g, ''));


    setFormData((prevData) => ({
      ...prevData,
      emdAmount: formattedValue,
      amount: event.target.value.replace(/,/g, ''),
    }));
  };
  const handleofferChange = (event) => {
    // Remove non-digit characters (except commas) from the input
    const newValue = event.target.value.replace(/[^\d,]/g, '');

    // Format the number with commas
    const formattedValue = numberWithCommas(newValue.replace(/,/g, ''));


    setFormData((prevData) => ({
      ...prevData,
      offeramount: formattedValue,
      oamount: event.target.value.replace(/,/g, ''),
    }));
  };

  const handleReferral = (event) => {
    // Remove non-digit characters (except commas) from the input
    const value = event.target.value
    const name = event.target.name
    console.log('handleReferral:::::', value, name)
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (typeOfData == "EMD/EOI") {
      getReferralSource()
    }
  }, [typeOfData])
  const getReferralSource = async () => {
    const response = await getApiCall(`admin/builder/execute/referral-source`);
    if (response.meta.status) {
      setSourceList(response.data)
    }
    else {
      setSourceList([])
    }
  }

  useEffect(() => {
    if (typeOfData == "Balance Sale Payment" && formData.auctionId) {
      getBidderByAuctionId()
    }
  }, [formData.auctionId])
  const getBidderByAuctionId = async () => {
    try {
      const response = await getApiCall(`user/transaction/highest-bidder/${formData.auctionId}`);
      if (response.meta.status) {
        console.log('inside true:::::')
        setFormData({
          ...formData,
          bidderId: response.data.highestBidder._id,
          bidderEmail: response.data.highestBidder.email,
          bidderName: response.data.highestBidder.name,
          bidderMobile: response.data.highestBidder.mobile,
          bidderPan: response.data.highestBidder.panNumber,
        })
      }
      else {
        console.log('inside false:::::')
        setFormData({
          ...formData,
          bidderId: '',
          bidderEmail: '',
          bidderName: '',
          bidderMobile: '',
          bidderPan: '',
        })
      }
    } catch (err) {
      console.log('inside catch:::::')
      setFormData({
        ...formData,
        bidderId: '',
        bidderEmail: '',
        bidderName: '',
        bidderMobile: '',
        bidderPan: '',
      })
    }
  }
  useEffect(() => {
    if (inputValue.length >= 4) {
      const delay = setTimeout(() => {
        const syntheticEvent = {
          target: {
            name: 'prospectNo',
            value: inputValue
          },
          preventDefault: () => {
            console.log('Default prevented!');
          }
        };

        handleChange(syntheticEvent);
      }, 500);

      return () => clearTimeout(delay);
    }
  }, [inputValue]);

  const handleCleanOptions = () => {
    setSelectPropspect(null)
    setResults([])
    setFormData((prevData) => ({
      ...prevData,
      prospectNo: '',
      auctionId: '',
      auctionDate: '',
      typeOfPayment: '',
      reservePrice: '',
      reservePayment: '',
      bidderName: typeOfData == "Balance Sale Payment" ? '' : formData.bidderName,
      bidderEmail: typeOfData == "Balance Sale Payment" ? '' : formData.bidderEmail,
      bidderId: typeOfData == "Balance Sale Payment" ? '' : formData.bidderId,
      bidderMobile: typeOfData == "Balance Sale Payment" ? '' : formData.bidderMobile,
      bidderPan: typeOfData == "Balance Sale Payment" ? '' : formData.bidderPan
    }));
  }

  const handleSelectAction = (value, defaultArr = []) => {
    const filteredData = (defaultArr || selectPropspect)?.filter((item) => item.auctionId == value)
    console.log('selectPropspect:::::::', selectPropspect, value, filteredData)
    let bidStatus = '';
    if (moment(filteredData[0].auctionStartDateTimeEpoch).isBefore(moment()) && moment(filteredData[0].auctionExtendedDateTimeEpoch).isAfter(moment())) {
      bidStatus = 'EMD';
    } else if (moment(filteredData[0].auctionExtendedDateTimeEpoch).isAfter(moment())) {
      bidStatus = 'Upcoming';
    } else if (moment(filteredData[0].auctionExtendedDateTimeEpoch).isBefore(moment())) {
      bidStatus = 'EOI';
    }
    setFormData((prevData) => ({
      ...prevData,
      prospectNo: filteredData[0].propertyId,
      auctionId: filteredData[0].auctionId,
      auctionDate: filteredData[0].auctionDate,
      typeOfPayment: bidStatus,
      reservePrice: numberWithCommas("Rs " + filteredData[0].price),
      reservePayment: filteredData[0].price,
    }));
  }

  // Add new row
  const addMoreRow = () => {
    setCOBidderList([
      ...coBidderList,
      { cobidderPan: "", cobidderName: "", cobidderMobile: "", cobidderEmail: "" }
    ]);
  };

  const handleCOBidderselect = (value, index) => {
    const filteredData = coBiddersList.find((coBid) => coBid.PANNumber === value);
    console.log('filteredData:::', filteredData, value)
    // Copy the array
    const updatedList = [...coBidderList];

    // Update only the specific object at given index
    updatedList[index] = {
      ...updatedList[index], // Keep other fields intact
      cobidderId: filteredData._id,
      cobidderEmail: filteredData.email,
      cobidderName: filteredData.name,
      cobidderMobile: filteredData.mobile,
      cobidderPan: filteredData.PANNumber,
    };

    setCOBidderList(updatedList);

  };
  console.log("Remaining Co-Bidders:", coBiddersList, coBidderList);

  return (<>
    <div className="container-fluid card-body">
      <div className="main-title">
        <h3>Bidder Payment Addition</h3>
      </div>
      <form className="hide-number-input-arrow">
        <div className="row d-flex justify-content-between align-items-center flex-wrap">
          <div className="col-12 col-xs-4 col-md-4 col-lg-4">
            <div className="form-group">
              <label>Type Of List *</label>
              <select name="paymentMode" className="form-control" value={typeOfData} onChange={(e) => setTypeOfData(e.target.value)} required={true}>
                {/* <option value="">Select</option> */}
                <option value="EMD/EOI">EMD/EOI Payment</option>
                <option value="Balance Sale Payment">Balance Sale Payment</option>
                {/* <option value="Add Individual Bidder">Add Individual Bidder</option>
                <option value="Add Company Bidder">Add Company Bidder </option> */}
              </select>
            </div>
          </div>
          <div className="gap-3 d-flex flex-wrap">
            <CustomButton
              label="Upload"
              icon="bi-upload"
              appendClass='mx-2'
              to={`/payment/bulk-upload/${typeOfData == "EMD/EOI" ? "emd-eoi" : typeOfData == "Balance Sale Payment" ? "balance-sale" : ''}`}
            />
          </div>
        </div>
        {(typeOfData == "Add Individual Bidder" || typeOfData == "Add Company Bidder")?
      <BidderNewAdditionForm/>  
      :(<>
        <div className='card shadow mb-4'>
          <div className='card-header'>
            <h6>Property Details</h6>
          </div>
          <div className="card-body">
            <div className="row">

              <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                <div className="form-group">
                  <label>Select Prospect *</label>
                  <CreatableSelect
                    name='prospectNo'
                    isClearable
                    placeholder="Type to search or create..."
                    value={selectPropspect}
                    onChange={(row) => row ? handleSelectProspect(row._id) : handleCleanOptions()}
                    onInputChange={setInputValue}
                    options={results}
                  // formatCreateLabel={(input) => `Add "${input}"`}
                  />
                  <p>{bidderError}</p>
                </div>
              </div>
              <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                <div className="form-group">
                  <label>Auction Id</label>
                  <select name="projectName" className="form-control" value={formData.auctionId} onChange={(e) => handleSelectAction(e.target.value, [])} disabled={selectPropspect?.length == 1 || selectPropspect?.length == 0} required={true}>
                    {selectPropspect && selectPropspect?.map((item) => (
                      <option value={item?.auctionId}>{item.auctionId}</option>
                    ))}
                  </select>
                  {/* <input type="text" name="projectName" className="form-control"
                value={formData.auctionId} disabled required={true} /> */}
                </div>
              </div>
              {typeOfData == 'EMD/EOI' && (<>
                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label>Auction Date</label>
                    <input type="text" name="contactName" className="form-control" required={true}
                      value={formData.auctionDate} disabled />
                  </div>
                </div>
                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label>Type Of Payment</label>
                    <input type="text" name="typeOfPayment" className="form-control" required={true}
                      disabled value={formData.typeOfPayment} />
                  </div>
                </div>
                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label>Reserve Price</label>
                    <input type="text" name="readyToMovedate" className="form-control"
                      disabled value={formData.reservePrice} required={true}
                    />
                    {
                      parseInt(formData.reservePayment) > 0 ?
                        <span>{toWords.convert(parseInt(formData.reservePayment) || 0)}</span>
                        : <></>
                    }
                  </div>
                </div>
              </>)}
            </div>
          </div>
        </div>
        <div className='card shadow mb-4'>
          <div className='card-header'>
            <h6>Bidder Details</h6>
          </div>
          <div className="card-body">
            <div className='row'>
              {(typeOfData == "EMD/EOI" || typeOfData == "Balance Sale Payment") && (<>
                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label>Bidder Pan card Number * </label>
                    <input type="text" name="locality" className="form-control" required={true} disabled={typeOfData !== 'EMD/EOI'}
                      value={formData.bidderPan} onChange={handleBidderChange} />
                    <p>{errorstate}</p>
                    {
                      hasbidder ?

                        bidderDetial?.bidderDetails &&


                        <option className='bidderlist' onClick={() => handleBidderselect(bidderDetial?.bidderDetails)}>{bidderDetial?.bidderDetails.name}</option>

                        :
                        <></>

                    }
                  </div>
                </div>
                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label>Bidder email id </label>
                    <input type="email" name="longitude" className="form-control"
                      disabled value={formData.bidderEmail} required={true} />
                  </div>
                </div>
                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label>Bidder Name</label>
                    <input type="text" name="address" className="form-control" required={true}
                      disabled value={formData.bidderName} />
                  </div>
                </div>

                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label>Bidder Mobile Number</label>
                    <input type="number" name="bidderMobile" className="form-control"
                      disabled maxlength="10" required={true} value={formData.bidderMobile} />

                  </div>
                </div>
                <div className='container-fluid'>
                  <div className='row'>
                    {formData.bidderName && typeOfData == "EMD/EOI" && (<>
                      <div className='col-12'>
                        <h6 className="mb-3">Co-bidder Details</h6>
                      </div>
                      {coBidderList.map((row, index) => {
                        // Get all selected PANs except the current row’s one
                        const selectedPANs = coBidderList
                          .map(r => r.cobidderPan)
                          .filter((pan, i) => i !== index);

                        // Filter coBiddersList so current row does not show already selected PANs
                        const filteredOptions = coBiddersList.filter(
                          bid => !selectedPANs.includes(bid.PANNumber)
                        );

                        return (
                          <div className='col-12'>
                            <div className="row g-3 mb-3" key={index}>
                              {/* PAN Card No */}
                              <div className="col-md-3">
                                <label className="form-label">PAN Card No.</label>

                                <select
                                  name="referralSource"
                                  className="form-control"
                                  value={row.cobidderPan || ""}
                                  onChange={(e) => handleCOBidderselect(e.target.value, index)}
                                  required={true}
                                >
                                  <option value="">Select Bidder</option>
                                  {filteredOptions.map((bid) => (
                                    <option key={bid._id} value={bid.PANNumber}>
                                      {bid.name + " ( " + bid.PANNumber + " )"}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Co-bidder Name */}
                              <div className="col-md-3">
                                <label className="form-label">Co-bidder Name</label>
                                <input type="text" className="form-control" value={row.cobidderName} disabled />
                              </div>

                              {/* Mobile No */}
                              <div className="col-md-3">
                                <label className="form-label">Mobile No.</label>
                                <input type="text" className="form-control" value={row.cobidderMobile} disabled />
                              </div>

                              {/* Email ID */}
                              <div className="col-md-3">
                                <label className="form-label">Email ID</label>
                                <input type="email" className="form-control" value={row.cobidderEmail} disabled />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div className='col-12 mb-3'>
                        <button className="btn btn-primary" onClick={addMoreRow}
                          disabled={
                            coBidderList.length ?
                              !coBidderList[coBidderList.length - 1]?.cobidderName // last row PAN empty
                              : false
                          }
                        >
                          Add Co-Bidder
                        </button>
                      </div>
                    </>)}
                  </div>
                </div>
              </>)}
            </div>
          </div>
        </div>
        <div className='card shadow mb-4'>
          <div className='card-header'>
            <h6>Payment Details</h6>
          </div>
          <div className="card-body">
            <div className='row'>
              {typeOfData == "EMD/EOI" &&
                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label>Offer Amount* (in Rs)</label>
                    <input type="text" name="offerAmount" className="form-control" required={true}
                      value={formData.offeramount} onChange={handleofferChange}
                    />
                    {
                      parseInt(formData.oamount) > 0 ?
                        <span>{toWords.convert(parseInt(formData.oamount) || 0)}</span>
                        : <></>
                    }

                  </div>
                </div>
              }

              <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                <div className="form-group">
                  <label>Payment Mode *</label>
                  <select name="paymentMode" className="form-control" value={formData.paymentMode} onChange={handleSelectChange} required={true}>
                    <option value="">Select</option>
                    {typeOfData == 'EMD/EOI' && (<>
                      <option value="IMPS">IMPS</option>
                      <option value="Challan">Challan</option>
                    </>)}
                    <option value="NEFT">NEFT</option>
                    <option value="DD">DD</option>
                    <option value="RTGS">RTGS</option>
                    {typeOfData == 'Balance Sale Payment' && (<>
                      <option value="INBT">INBT</option>
                    </>)}
                  </select>
                </div>
              </div>
              {/* {typeOfData == 'EMD/EOI' && */}
              <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                <div className="form-group">
                  <label>{typeOfData == 'EMD/EOI' ? `EMD` : typeOfData == "Balance Sale Payment" ? 'Payment' : ''} Amount* (in Rs)</label>
                  <input type="text" name="emdAmount" className="form-control" required={true}
                    value={formData.emdAmount} onChange={handleInputChange}
                  />
                  {
                    parseInt(formData.amount) > 0 ?
                      <span>{toWords.convert(parseInt(formData.amount) || 0)}</span>
                      : <></>
                  }

                </div>
              </div>
              {formData.paymentMode !== "INBT" && (<>
                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label>Transaction ID*</label>
                    <input type="text" name="transactionId" className="form-control" required={true}
                      onChange={handleSelectChange} value={formData.transactionId} />
                  </div>
                </div>

                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label htmlFor="exampleFormControlSelect1">Payment Date *</label>
                    <input type="datetime-local" className="form-control" name="paymentDate" value={formData.paymentDate}
                      required={true} onChange={handleTimeChange} />
                  </div>
                </div>
              </>)}
            </div>
          </div>
        </div>
        {typeOfData == 'EMD/EOI' && (<>
          <div className='card shadow mb-4'>
            <div className='card-header'>
              <h6>Refferal Details</h6>
            </div>
            <div className="card-body">
              <div className='row'>
                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label htmlFor="exampleFormControlSelect1">Refferal Source *</label>
                    <select name="referralSource" className="form-control" value={formData.referralSource} onChange={handleReferral} required={true}>
                      <option value="">Select</option>
                      {sourceList.map((source) => {
                        return (
                          <option value={source.referralSource}>{deslugifyTransform(source.referralSource)}</option>
                        )
                      })}
                    </select>
                  </div>
                </div>
                {formData.referralSource == "iifl-employee" &&
                  <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                    <div className="form-group">
                      <label htmlFor="exampleFormControlSelect1">Employee Code *</label>
                      <input type="text" className="form-control" name="referralCode" value={formData.referralCode}
                        required={true} onChange={handleReferral} />
                    </div>
                  </div>
                }
                {(formData.referralSource == "no-broker" || formData.referralSource == "hecta" || formData.referralSource == "nexxen-disposal-hub" || formData.referralSource == "biddeal-value-trust") && (<>
                  <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                    <div className="form-group">
                      <label htmlFor="exampleFormControlSelect1">Enter Vendor Code *</label>
                      <input type="text" className="form-control" name="referralVendorCode" value={formData.referralVendorCode}
                        required={true} onChange={handleReferral} />
                    </div>
                  </div>
                  <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                    <div className="form-group">
                      <label htmlFor="exampleFormControlSelect1">Referrer Person Name *</label>
                      <input type="text" className="form-control" name="referalPerson" value={formData.referalPerson}
                        required={true} onChange={handleReferral} />
                    </div>
                  </div>
                </>)}
                {formData.referralSource == "broker" && (<>
                  <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                    <div className="form-group">
                      <label htmlFor="exampleFormControlSelect1">Person Name *</label>
                      <input type="text" className="form-control" name="referralPersonName" value={formData.referralPersonName}
                        required={true} onChange={handleReferral} />
                    </div>
                  </div>
                  <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                    <div className="form-group">
                      <label htmlFor="exampleFormControlSelect1">Email id *</label>
                      <input type="email" className="form-control" name="referalPersonEmailId" value={formData.referalPersonEmailId}
                        required={true} onChange={handleReferral} />
                    </div>
                  </div>
                  <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                    <div className="form-group">
                      <label htmlFor="exampleFormControlSelect1">Pancard no. *</label>
                      <input type="text" className="form-control" name="referalPersonPanCard" value={formData.referalPersonPanCard}
                        required={true} onChange={handleReferral} />
                    </div>
                  </div>
                </>)}
              </div>
            </div>
          </div>
        </>)}
        {formData.paymentMode !== 'INBT' && (<>
          <div className='card shadow mb-4'>
            <div className='card-header'>
              <h6>Document Details</h6>
            </div>
            <div className="card-body">
              <div className='row'>
                <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                  <div className="form-group">
                    <label>Payment Proof*</label>
                    <p></p>
                    <FilePond
                      maxFileSize="10MB"
                      allowFileTypeValidation={true}
                      acceptedFileTypes={['image/*']}
                      imagePreviewMaxHeight={100}
                      credits={false}
                      name="image"
                      labelIdle='Drag & Drop your files(Supported file formats: JPG, JPEG, PNG)'
                      server={{
                        url: Constant.apiBasePath + 'common/upload/blob/admin/image',
                        process: {
                          headers: {
                            authkey: accessToken
                          },
                          onload: (res) => {
                            let data = JSON.parse(res);
                            if (data.meta.status) {
                              setCategoryImage(data.data)
                              setFormData((prevData) => ({
                                ...prevData,
                                paymentDocUrl: data.data,
                              }));
                            } else {
                              swal("use jpg, png and pdf file only");

                            }
                          }

                        }
                      }}
                    />
                    <FilePond
                      maxFileSize="10MB"
                      allowFileTypeValidation={true}
                      acceptedFileTypes={['application/pdf']}
                      imagePreviewMaxHeight={100}
                      credits={false}
                      name="document"
                      labelIdle='Drag & Drop your files(Supported file formats: PDF)'
                      server={{
                        url: Constant.apiBasePath + 'common/upload/blob/admin/document',
                        process: {
                          headers: {
                            authkey: accessToken
                          },
                          onload: (res) => {
                            let data = JSON.parse(res);
                            if (data.meta.status) {
                              setCategoryImage(data.data)
                              setFormData((prevData) => ({
                                ...prevData,
                                paymentDocUrl: data.data,
                              }));
                            } else {
                              swal("use pdf file only");

                            }
                          }

                        }
                      }}
                    />
                  </div>


                </div>
                {typeOfData == "EMD/EOI" &&
                  <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                    <div className="form-group">
                      <label>Tender Form </label>
                      <p></p>
                      <FilePond
                        maxFileSize="10MB"
                        allowFileTypeValidation={true}
                        acceptedFileTypes={['application/pdf']}
                        imagePreviewMaxHeight={100}
                        credits={false}
                        name="document"
                        labelIdle='Drag & Drop your files(Supported Files Pdf) or <span class="filepond--label-action">Browse</span>'
                        onprocessfile={(error, file) => {
                          if (!documentName) setDocumentName(file.filename)
                        }}
                        server={{
                          url: Constant.apiBasePath + 'common/upload/blob/admin/document',
                          process: {
                            headers: {
                              authkey: accessToken
                            },
                            onload: (res) => {
                              res = JSON.parse(res);
                              if (res.meta.status) {
                                setDocumentUrl(res.data);
                                setFormData((prevData) => ({
                                  ...prevData,
                                  tenderFormUrl: res.data,
                                }));
                              }
                            },

                          }
                        }}
                      />
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </>)}
        <div className="card shadow mb-4">
          <div className="card-body d-flex justify-content-center">
            <button
              type="submit"
              className="btn btn-md btn-primary shadow-sm"
              disabled={!checkValidation()}
              onClick={submitForm}
            >
              Submit
            </button>
          </div>
        </div>
</>)}

      </form>
    </div>

  </>);
}

export default BidderAddForm;
