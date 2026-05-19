import React, { useEffect, useState } from 'react'
import swal from 'sweetalert';
import '../../css/style.css';
import { useNavigate, useLocation } from "react-router";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";
import { Link } from "react-router-dom";
import useGetRoleModule from '../../Services/useGetRoleModule';

import { notAllowedSpecialcharacter } from '../../Components/validationUtils'
import Select from "react-select";
import Editor from '../../Utils/Editor';

const NotificationCreateUpdate = (props) => {
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const notificationId = queryParams.get('notificationId');
    const { notificationTemplateId, partnerId } = location.state || {};
    console.log('location.state:::::::', location.state)
    const [isLoding, setIsLoding] = useState(false);
    let splittitle = window.location.search.split('?')
    const [data, setData] = useState({
        notificationTriggerEventName: "",
        templateType: "CRON",
        notificationTitle: "",
        notificationFrequency: 0,
        notificationDate: "",
        notificationFrequencyInterval: "",
        notificationFrequencyType: "",
        email: {},
        sms: {}
    });
    console.log('data::::::::', data)
    const [templateMode, setTemplateMode] = useState([{ label: 'SMS', value: 'sms' }, { label: 'Email', value: 'email' }, { label: 'App', value: 'app' }]);
    const [notiTrigger, setNotiTrigger] = useState([]);
    const [blog_id, setblog_id] = useState('')
    const history = useNavigate()
    const [permission, setPermission] = useState({})
    const [selectedOptions, setSelectedOptions] = useState([]);
    console.log('selectedOptions:::::', selectedOptions)
    const increase = () => {
        setData((values) => ({ ...values, notificationFrequency: values.notificationFrequency + 1 }));
    };

    const decrease = () => {
        setData((values) => ({ ...values, notificationFrequency: values.notificationFrequency - 1 }));
    };

    const handleChangeFrequency = (e) => {
        const value = parseInt(e.target.value, 10);
        setData((values) => ({ ...values, notificationFrequency: isNaN(value) || value < 1 ? 1 : value }));
    };


    const handleChange = (selected) => {
        setSelectedOptions(selected || []);
    };

    useEffect(() => {
        setIsLoding(true)
        GetRole()
    }, []);

    useEffect(() => {
        if (notificationTemplateId) {
            getNotificationDetail(notificationTemplateId)
        }
    }, [notificationTemplateId])

    async function GetRole() {
        let Role = await useGetRoleModule("blogs");
        if (Role.moduleList.read === false) {
            setPermission({ moduleAccress: false, moduleList: {}, message: "Module Need Some Permission...Pls contact with Your Partner" })
        } else {
            setPermission(Role)
            getList()
        }

    }

    async function getList() {
        let response = await getApiCall('admin/notification-management/getNotificationTriggerEvents');
        if (response.data) {
            setNotiTrigger(response.data)
        }
        else {
            setNotiTrigger([])
        }
    }

    async function getNotificationDetail(notificationTemplateId) {
        let response = await getApiCall(`admin/notification-management/listNotificationDetailsById?notificationTemplateId=${notificationTemplateId}`);
        if (response?.data?.length > 0) {
            setData({
                notificationTriggerEventName: response?.data[0]?.notificationTriggerEventName,
                templateType: response?.data[0]?.templateType,
                notificationTitle: response?.data[0]?.notificationTitle,
                notificationFrequency: response?.data[0]?.notificationFrequency,
                notificationDate: response?.data[0]?.notificationDate,
                notificationFrequencyInterval: response?.data[0]?.notificationFrequencyInterval,
                notificationFrequencyType: response?.data[0]?.notificationFrequencyType,
                email: response?.data[0]?.email,
                sms: response?.data[0]?.sms
            })
            let options = []
            if (Object.keys(response?.data[0]?.email)?.length > 0) {
                options.push({ label: 'Email', value: 'email' })
            }
            if (Object.keys(response?.data[0]?.sms)?.length > 0) {
                options.push({ label: 'SMS', value: 'sms' })
            }
            setSelectedOptions(options)
        }
    }

    const onChange = (e) => {
        if (!e.target.name) return
        setData({
            ...data,
            [e.target.name]: notAllowedSpecialcharacter(e.target.value)
        })
    }
    const Save = async (payload) => {
        let returnData = await postApiCall('admin/notification-management/createNotificationTemplate', payload, true);
        if (returnData.meta.status) {
            let respoPayload = {
                partnerId: partnerId,
                notificationTemplateId: returnData.meta?.id,
                notificationStatus: 1
            }
            let responseData = await postApiCall('admin/notification-management/createNotification ', respoPayload, true);
            if (responseData.meta.status) {
                swal({ text: responseData.meta.msg, icon: "success", timer: 1500 })
                history(`/notification-settings/${partnerId}`)
            }
        }
    }

    const Update = async (payload) => {
        payload["notificationTemplateId"] = notificationTemplateId
        let returnData = await postApiCall('admin/notification-management/editNotificationTemplate', payload, true);
        if (returnData.meta.status) {
            swal({ text: returnData.meta.msg, icon: "success", timer: 1500 })
            history(`/notification-settings/${partnerId}`)
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        let payload = {
            ...data,
            notificationFrequency: Math.abs(data.notificationFrequency), // removes negative sign
            notificationFrequencyInterval: 'days',
            notificationFrequencyType: data.notificationFrequency <= 0 ? 'pre' : 'post'
        }
        if (notificationTemplateId) {
            Update(payload)
        } else {
            Save(payload);
        }
    }


    return (
        <>
            <div className="container-fluid">

                {

                    Object.keys(permission).length > 0 ?
                        permission.role == "partner" && (permission.moduleList[blog_id != null ? "update" : "create"] == undefined || permission.moduleList[blog_id != null ? "update" : "create"] == false) ?
                            <div className="row text-center">
                                <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                                    <div className="errer">
                                        <img src="/program-error.png" />
                                        <h2>403</h2>
                                        {/* <h4 className="text-danger">{permission.message}</h4> */}
                                        <p>Module Need Some Permission</p>

                                    </div>
                                </div>
                            </div>
                            :
                            (Object.keys(permission).length > 0) ? <>
                                <div className="main-title"><h3> Create New Notifiaction</h3></div>
                                <div className="d-sm-flex align-items-center justify-content-end mb-4">

                                    <Link to={`/notification-settings/${partnerId}`} className="d-sm-inline-block btn btn-sm btn-warning shadow-sm"><i
                                        className="fas fa-chevron-left fa-sm text-white-50  mr-1"></i> Back</Link>
                                </div>
                                <div className="card shadow mb-4">
                                    <div className="card-header mx-1">
                                        <h6 className="card-title mb-0">Basic Details</h6>
                                        <p className="card-title mb-0">A little description about the page/action</p>
                                    </div>
                                    <div className="card-body">

                                        <div className="row">

                                            <div className="col-12 col-xs-12 col-md-3 col-lg-3">
                                                <div className="form-group">
                                                    <label>Notification Name </label>
                                                    <input type="text" className="form-control" name="notificationTitle" value={data.notificationTitle} placeholder='Enter Notification Name'
                                                        required={true} onChange={onChange} />
                                                </div>
                                            </div>
                                            <div className="col-12 col-xs-3 col-md-3 col-lg-3">
                                                <div className="form-group">
                                                    <label>Template Mode</label>
                                                    <Select
                                                        options={templateMode}
                                                        isMulti
                                                        closeMenuOnSelect={false}
                                                        hideSelectedOptions={false}
                                                        value={selectedOptions}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12 col-xs-3 col-md-3 col-lg-3">
                                                <div className="form-group">
                                                    <label>Notification Trigger</label>
                                                    <select className="form-control" name="notificationTriggerEventName" blog_id=""
                                                        value={data.notificationTriggerEventName} onChange={(e) => setData((values) => ({
                                                            ...values, notificationTriggerEventName: e.target.value
                                                        }))}>
                                                        <option value="">Select</option>
                                                        {notiTrigger.map((trigger) => (
                                                            <option value={trigger.value}
                                                                key={trigger.value}>{trigger.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                            </div>
                                            <div className="col-12 col-xs-3 col-md-3 col-lg-3">
                                                <div className="form-group" >
                                                    <label>Frequency</label>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <button className="btn btn-md btn-warning mr-2" onClick={decrease}>
                                                            −
                                                        </button>
                                                        <input
                                                            type="number"
                                                            className="form-control text-center"
                                                            style={{ width: "80px" }}
                                                            value={data.notificationFrequency}
                                                            onChange={handleChangeFrequency}

                                                        />
                                                        <button className="btn btn-md btn-warning mx-2" onClick={increase}>
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>



                                    </div>

                                </div>
                                {selectedOptions.some(opt => opt.value === 'sms') &&
                                    <div className="card shadow mb-4">
                                        <div className="card-header mx-1">
                                            <h6 className="card-title mb-0">SMS Details *</h6>
                                            <p className="card-title mb-0">A little description about the page/action</p>
                                        </div>
                                        <div className="card-body">

                                            <div className="row">

                                                <div className="col-12 col-xs-12 col-md-3 col-lg-3">
                                                    <div className="form-group">
                                                        <label>SMS Template  ID</label>
                                                        <input type="text" className="form-control" name="smsTemplateId" value={data.sms.smsTemplateId} placeholder='Enter Template ID'
                                                            required={true}
                                                            onChange={(e) => setData((values) => ({
                                                                ...values, sms: {
                                                                    ...values.sms,
                                                                    smsTemplateId: e.target.value
                                                                }
                                                            }))} />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                                    <div className="form-group">
                                                        <label>Your message</label>
                                                        <Editor
                                                            initialContent={data.sms.smsContent}
                                                            onChange={(html) => {
                                                                setData((values) => ({
                                                                    ...values,
                                                                    sms: {
                                                                        ...values.sms,
                                                                        smsContent: html
                                                                    }
                                                                }));
                                                            }}

                                                        />
                                                    </div>
                                                </div>
                                            </div>



                                        </div>

                                    </div>
                                }
                                {selectedOptions.some(opt => opt.value === 'email') &&
                                    <div className="card shadow mb-4">
                                        <div className="card-body">

                                            <div className="row">

                                                <div className="col-12 col-xs-12 col-md-3 col-lg-3">
                                                    <div className="form-group">
                                                        <label>Email Subject * </label>
                                                        <input type="text" className="form-control" name="emailSubject" value={data.email.emailSubject} placeholder='Enter Template ID'
                                                            required={true}
                                                            onChange={(e) => setData((values) => ({
                                                                ...values, email: {
                                                                    ...values.email,
                                                                    emailSubject: e.target.value
                                                                }
                                                            }))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                                    <div className="form-group">
                                                        <label>Your message</label>
                                                        <Editor
                                                            initialContent={data.email.emailBody}
                                                            onChange={(html) => {
                                                                setData((values) => ({
                                                                    ...values,
                                                                    email: {
                                                                        ...values.email,
                                                                        emailBody: html
                                                                    }
                                                                }));
                                                            }}

                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-xs-12 col-md-3 col-lg-3">
                                                    <div className="form-group">
                                                        <label>Email Signature * </label>
                                                        <input type="text" className="form-control" name="emailSignature" value={data.email.emailSignature} placeholder='Enter Email Signature'
                                                            required={true}
                                                            onChange={(e) => setData((values) => ({
                                                                ...values, email: {
                                                                    ...values.email,
                                                                    emailSignature: e.target.value
                                                                }
                                                            }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>



                                        </div>

                                    </div>
                                }
                                {selectedOptions.some(opt => opt.value === 'app') &&
                                    <div className="card shadow mb-4">
                                        <div className="card-body">

                                            <div className="row">

                                                <div className="col-12 col-xs-12 col-md-3 col-lg-3">
                                                    <div className="form-group">
                                                        <label>App Subject * </label>
                                                        <input type="text" className="form-control" name="title" value={data.title} placeholder='Enter Template ID'
                                                            required={true}
                                                            onChange={(e) => setData((values) => ({
                                                                ...values, app: {
                                                                    ...values.app,
                                                                    appTemplateId: e.target.value
                                                                }
                                                            }))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-xs-12 col-md-12 col-lg-12">
                                                    <div className="form-group">
                                                        <label>Your message</label>
                                                        <Editor
                                                            initialContent={data.app.appContent}
                                                            onChange={(html) => {
                                                                setData((values) => ({
                                                                    ...values,
                                                                    app: {
                                                                        ...values.app,
                                                                        appContent: html
                                                                    }
                                                                }));
                                                            }}

                                                        />

                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                }
                                <div className="card shadow mb-4">
                                    <div className="form-group mt-1">
                                        <div className="card-body">
                                            <button type="submit" className="btn btn-md btn-warning shadow-sm  mr-2" onClick={onSubmit}> Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </> : null : null}
            </div>
        </>
    )
}

export default NotificationCreateUpdate
