import React, {Component} from 'react'
import {Link} from 'react-router-dom';

import swal from 'sweetalert';
import postApiCall from "../../Services/postApiCall";
import patchApiCall from "../../Services/patchApiCall";
import getApiCall from "../../Services/getApiCall";
import loginUser from "../../Services/loginUser";
import $ from 'jquery';
import Modal from "react-bootstrap/Modal";
import {FilePond} from "react-filepond";
import Constant from "../../Components/Constant";
import Button from "react-bootstrap/Button";
import {toast} from "react-toastify";
import {blobUrl} from "../../Services/helpers";
import { notAllowedSpecialcharacter, onlyAllowedNumber} from '../../Components/validationUtils'
let {accessToken} = loginUser();


class AddUpdate extends Component {

    /*..................................... default language object ............................................*/

    state = {
        name: '',
        email: '',
        mobile: '',
        plan: '',
        GST: '',
        serviceType: '',
        accountHolderName: '',
        accountType: '',
        bankName: '',
        IFSCCode: '',
        accountNumber: '',
        officerName: '',
        officerMobile: '',
        officerEmail: '',
        document: [],
        documentName: [],
        pdf: null,
        fileName: '',
        GetData: {},
        ERROR: true,
        showDocumentModal: false
    }

    handleChange = (e) => {
        // console.log(e.target)
        console.log('serviceType envent', notAllowedSpecialcharacter(e.target.value))
        let value = e.target.id != "officerMobile" && e.target.id != "accountNumber" && e.target.id != "mobile" ? notAllowedSpecialcharacter(e.target.value) : onlyAllowedNumber(e.target.value)
        this.setState({
            [e.target.id]: value
        });
        console.log(this.state.name, value)
    };

    handleImageChange = (e) => {
        // extension

        let extension = e.target.files[0].name.split('.').pop();
        if (extension !== 'pdf' && extension !== 'PDF' && extension !== 'png' && extension !== 'jpg' ) {
            alert("Only doc file is allow !");
            return false;
        } else {
            this.setState({
                [e.target.id]: e.target.files[0]
            });
        }
    }


    /*.................. Integrate API for add language...............................................*/

    handleSubmit = async event => {
        try {
            event.preventDefault();
            let id = this.props.match.params.id;

            if (id === undefined) {
                let metaData = {
                    'name': this.state.name,
                    'email': this.state.email,
                    'mobile': this.state.mobile,
                    'plan': this.state.plan,
                    'GST': this.state.GST,
                    'serviceType': this.state.serviceType,
                    'accountHolderName': this.state.accountHolderName,
                    'accountType': this.state.accountType,
                    'bankName': this.state.bankName,
                    'IFSCCode': this.state.IFSCCode,
                    'accountNumber': this.state.accountNumber,
                    'officerName': this.state.officerName,
                    'officerEmail': this.state.officerEmail,
                    'officerMobile': this.state.officerMobile,
                    'document': this.state.document,
                    'documentName': this.state.documentName
                }

                // let response = await Axios.post(Constant.apiBasePath + 'partner/create', metaData, { headers: { 'token': accessToken }});
                let data = await postApiCall('admin/partner/create', metaData);
                console.log('Api Response Data', data);
                if (data.meta.status) {
                    // alert();
                    toast(data.meta.msg, {type: toast.TYPE.SUCCESS})

                    // this.props.history('/partner-management');
                } else {
                    // alert(data.meta.msg);
                    return false;
                }
            } else {
                let getData = this.state.GetData;
                let metaData = {
                    'name': (this.state.name !== '') ? this.state.name : getData.name,
                    'email': (this.state.email !== '') ? this.state.email : getData.email,
                    'mobile': (this.state.mobile !== '') ? this.state.mobile : getData.mobile,
                    'plan': (this.state.plan !== '') ? this.state.plan : getData.plan,

                    'GST': (this.state.GST !== '') ? this.state.GST : getData.GST,
                    'serviceType': (this.state.serviceType !== '') ? this.state.serviceType : getData.serviceType,
                    'accountHolderName': (this.state.accountHolderName !== '') ? this.state.accountHolderName : getData.accountHolderName,
                    'accountType': (this.state.accountType !== '') ? this.state.accountType : getData.accountType,

                    'bankName': (this.state.bankName !== '') ? this.state.bankName : getData.bankName,
                    'IFSCCode': (this.state.IFSCCode !== '') ? this.state.IFSCCode : getData.IFSCCode,
                    'accountNumber': (this.state.accountNumber !== '') ? this.state.accountNumber : getData.accountNumber,
                    'officerName': (this.state.officerName !== '') ? this.state.officerName : getData.officerName,

                    // 'officerName': (this.state.officerName !== '') ? this.state.officerName : getData.officerName,
                    'officerEmail': (this.state.officerEmail !== '') ? this.state.officerEmail : getData.officerEmail,
                    'officerMobile': (this.state.officerMobile !== '') ? this.state.officerMobile : getData.officerMobile,
                    'document': (this.state.document.length > 0) ? this.state.document : getData.document,
                    'documentName': (this.state.documentName.length > 0) ? this.state.documentName : getData.documentName
                }

                let response = await patchApiCall('admin/partner/update/' + id, metaData);
                let data = response;
                if (data.meta.status) {
                    swal({text: data.meta.msg, icon: "success", timer: 1500});

                    // alert(data.meta.msg);

                    //sweet alert
                    // this.props.history('/partner-management');
                } else {
                    // toast(data.meta.msg, { type: toast.TYPE.SUCCESS})

                    // alert(data.meta.msg);
                    return false;
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    async getGetData() {

        getApiCall('admin/partner/getDataById/' + this.props.match.params.id).then(data => {
            console.log('Api Response Data', data);
            if (data.meta.status) {
                this.setState({GetData: data.data, ...data.data, ERROR: false,
                    serviceType:data.data.serviceType,
                });
            } else {
                this.setState({GetData: '', ERROR: false});
            }
        }).catch(error => ('Something Error'));

    }

    componentDidMount() {
        let id = this.props.match.params.id;
        if (id) {
            this.getGetData();
        }
    }

    uploadDocument = async () => {
        // only allow maximum 2 documents
        if (this.state.document.length >= 2)  return toast('Maximum 2 documents allowed', {type: toast.TYPE.ERROR})
        const form_data = new FormData();
        // form_data.append('itemName', this.state.fileName);
        // form_data.append('type', 'partner');
        // form_data.append('s3File', this.state.pdf, this.state.pdf.name);
        form_data.append('document', this.state.pdf, this.state.pdf.name);
        // let returnData = await Axios.post(Constant.apiBasePath + 'admin/s3/upload', form_data, { headers: { 'token': accessToken }});
        // let returnData = await postApiCall('admin/partner/s3/upload', form_data);
        let returnData = await postApiCall('common/upload/blob/admin/document', form_data);
        console.log('returnData', returnData);

        if (returnData.meta.status) {
            this.setState({
                'document': [...this.state.document, returnData.data],
                'documentName': [...this.state.documentName, this.state.fileName]
            });
            toast(returnData.meta.msg, {type: toast.TYPE.SUCCESS})
            // swal({text: , icon: "success",})
            this.setState(
                {
                    pdf: '',
                    fileName: ''
                }
            )
            window.$('#create-modal').modal('hide');
            document.getElementById('fileName').value = '';
            document.getElementById('pdf').value = '';


        } else {
            swal({text: returnData.meta.msg, icon: "warning", dangerMode: true})
        }
    };


    handleDocumentUploadClose = () => {
        // setDocumentUploadShow(false);
        // setDocumentName('');
        // setDocumentUrl('');
    }
    handleDocumentUploadShow = () => {
        // setDocumentUploadShow(true);
    }

    /*.................................end API .................................................................*/

    render() {
        const {GetData, document, documentName} = this.state;
        let name = '';
        let mobile = '';
        let email = '';
        let plan = '';
        let GST = '';

        let serviceType = '';
        let accountHolderName = '';
        let accountType = '';
        let bankName = '';
        let IFSCCode = '';

        let accountNumber = '';
        let officerName = '';
        let officerEmail = '';
        let officerMobile = '';

        let documentArr = [];
        let documentNameArr = [];

        let btnVal = 'Add';
        let heading = 'Add Partner';

        let planOptions = <>
            <option defaultValue="0" id="0">Select one</option>
            <option defaultValue="Gold" id="Gold">Gold</option>
            <option defaultValue="Silver" id="Silver">Silver</option>
            <option defaultValue="Platinum" id="Platinum">Platinum</option>
        </>
        let serviceTypes = <>
            <option value={''}>Select</option>
            <option value={1}>Property Listing</option>
            <option value={2}>Auction Property</option>
        </>

        // if (GetData.name !== undefined) {
        //     name = GetData.name;
        //     mobile = GetData.mobile;
        //     email = GetData.email;

        //     GST = GetData.GST;
        //     serviceType = GetData.serviceType;
        //     accountHolderName = GetData.accountHolderName;
        //     accountType = GetData.accountType;

        //     bankName = GetData.bankName;
        //     IFSCCode = GetData.IFSCCode;
        //     accountNumber = GetData.accountNumber;
        //     officerName = GetData.officerName;

        //     officerEmail = GetData.officerEmail;
        //     officerMobile = GetData.officerMobile;

        //   //  if (GetData.document.length > 0) {
        //      //   documentArr = GetData.document.map((el, index) => {
        //           //  return <div className='col-md-6' key={index}>
        //               //  <iframe src={blobUrl(el)} height="50" width="100"></iframe>
        //             ////</div>
        //         //});
        //     //}

        //     if (GetData.documentName.length > 0) {
        //         documentNameArr = GetData.documentName.map(el => {
        //             return <div className="col-md-6"><p>{el}</p></div>;
        //         });
        //     }

        //     btnVal = 'Update';
        //     heading = 'Update Partner';
        //     if (GetData.plan === 'Gold') {
        //         planOptions = <>
        //             <option value="Gold" id="Gold" selected>Gold</option>
        //             <option defaultValue="Silver" id="Silver">Silver</option>
        //             <option defaultValue="Platinum" id="Platinum">Platinum</option>
        //         </>
        //     } else if (GetData.plan === 'Silver') {
        //         planOptions = <>
        //             <option value="Gold" id="Gold">Gold</option>
        //             <option defaultValue="Silver" id="Silver" selected>Silver</option>
        //             <option defaultValue="Platinum" id="Platinum">Platinum</option>
        //         </>
        //     } else if (GetData.plan === 'Platinum') {
        //         planOptions = <>
        //             <option defaultValue="Gold" id="Gold">Gold</option>
        //             <option defaultValue="Silver" id="Silver">Silver</option>
        //             <option defaultValue="Platinum" id="Platinum" selected>Platinum</option>
        //         </>
        //     }


        //     if (GetData.serviceType == 1) {
        //         serviceTypes = <>
        //             <option value={''}>Select</option>
        //             <option value={1} selected>Property Listing</option>
        //             <option value={2}>Auction Property</option>
        //         </>

        //     } else if (GetData.serviceType == 2) {
        //         serviceTypes = <>
        //             <option value={''}>Select</option>
        //             <option value={1}>Property Listing</option>
        //             <option value={2} selected>Auction Property</option>
        //         </>
        //     }

        // }

       // if (document.length > 0) {
//documentArr = document.map(el => {
              //  return <div className='col-md-6'>
                //    <iframe src={el} height="50" width="100"></iframe>
               // </div>
            //});
      //  }

        if (documentName.length > 0) {
            documentNameArr = documentName.map(el => {
                return <div className="col-md-6"><p>{el}</p></div>;
            });
        }

        return (
            <div className="container-fluid">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/partner-management">Partner Management</Link></li>
                        <li className="breadcrumb-item active">{heading}</li>
                    </ol>
                </nav>
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={this.handleSubmit}>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="update" className="update">Name *</label>
                                        <input type="text" id="name" className="form-control"
                                               onChange={this.handleChange} value={this.state.name} required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="update" className="update">Email *</label>
                                        <input type="email" id="email" className="form-control"
                                               onChange={this.handleChange} value={this.state.email} required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="update" className="update">Mobile *</label>
                                        <input type="text" id="mobile" className="form-control"
                                               onChange={this.handleChange} value={this.state.mobile} required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="update" className="update">Plan *</label>
                                        <select id="plan" className='form-control'
                                                onChange={this.handleChange}>
                                            {planOptions}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="update" className="update">GST Number*</label>
                                        <input type="text" id="GST" className="form-control"
                                               onChange={this.handleChange} value={this.state.GST} required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="update" className="update">Type of Service *</label>
                                        <select id="serviceType" className='form-control'
                                                onChange={this.handleChange}>
                                            {serviceTypes}
                                        </select>

                                    </div>
                                </div>
                            </div>



                            {this.state.serviceType == 2 ? <>
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <strong>Bank Account Details for Offline EMD Payment:</strong>
                                    </div>
                                </div>

                                <div className="row mt-2">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label htmlFor="update" className="update">Account Holder Name
                                                *</label>
                                            <input type="text" id="accountHolderName" className="form-control"
                                                   onChange={this.handleChange} value={this.state.accountHolderName}
                                                   required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label htmlFor="update" className="update">Type of Account *</label>
                                            <input type="text" id="accountType" className="form-control"
                                                   onChange={this.handleChange} value={this.state.accountType}
                                                   required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label htmlFor="update" className="update">Name of Bank *</label>
                                            <input type="text" id="bankName" className="form-control"
                                                   onChange={this.handleChange} value={this.state.bankName} required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label htmlFor="update" className="update">IFSC Code *</label>
                                            <input type="text" id="IFSCCode" className="form-control"
                                                   onChange={this.handleChange} value={this.state.IFSCCode} required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label htmlFor="update" className="update">Bank Account Number
                                                *</label>
                                            <input type="text" id="accountNumber" className="form-control"
                                                   onChange={this.handleChange} value={this.state.accountNumber}
                                                   required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </> : ''}

                            <div className='row'>
                                <div className='col-md-6'>
                                    <strong>Authorized Officer Details:</strong>
                                </div>
                            </div>

                            <div className='row mt-2'>
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="update" className="update">Name *</label>
                                        <input type="text" id="officerName" className="form-control"
                                               onChange={this.handleChange} value={this.state.officerName}
                                               required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="update" className="update">Mobile *</label>
                                        <input type="text" id="officerMobile" className="form-control"
                                               onChange={this.handleChange} value={this.state.officerMobile}
                                               required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="update" className="update">Email *</label>
                                        <input type="text" id="officerEmail" className="form-control"
                                               onChange={this.handleChange} value={this.state.officerEmail}
                                               required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='row'>
                            <div className='col-12 col-sm-12'>
                                <strong>KYC Documents</strong>
                                </div>
                            </div>

                            <div className='row mt-3'>
                            <div className='col-12 col-sm-12'>
                                {(documentArr.length > 0) ? documentArr : ''}
                                </div>
                            </div>

                            <div className='row'>
                            <div className='col-12 col-sm-12'>
                                {(documentNameArr.length > 0 && documentArr.length > 0) ? documentNameArr : ''}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="update" className="update">Upload Document *</label>
                                        <div className="form-group col-md-6">
                                            <button type="button"
                                                    className="btn btn-rounded btn-outline-primary mr-3"
                                                    id="openModal" data-toggle="modal"
                                                    data-target="#create-modal"><i
                                                className="fas fa-plus"></i></button>
                                            {/* <button type="submit" className="btn btn-rounded btn-outline-primary float-right mr-3"><i className="fas fa-plus"></i></button> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-warning">{btnVal}</button>
                        </form>
                    </div>
                </div>


                <div id="create-modal" className="modal fade" role="dialog" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title">
                                    <h3>Upload KYC File</h3>
                                </div>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span
                                    aria-hidden="true">&times;</span></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="mr-sm-2" htmlFor="subCategory">Upload File *</label>
                                    <input type="file" id="pdf" className='form-control' accept='application/pdf'
                                           onChange={this.handleImageChange}/>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="emailaddress1">File Name *</label>
                                    <input type="text" id="fileName" className='form-control'
                                           onChange={this.handleChange}/>
                                </div>

                                <div className="form-group text-center">
                                    <button className="btn btn-primary" type="submit"
                                            onClick={() => this.uploadDocument()}>Upload
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* end of create modal */}
            </div>
        )
    }
}

export default AddUpdate;