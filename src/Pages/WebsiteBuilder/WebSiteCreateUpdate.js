import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import getApiCall from '../../Services/getApiCall';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Dashboard from '../WebsiteBuilder';
import postApiCall from '../../Services/postApiCall';
import { toast } from 'react-toastify';
import { slugifyTransform } from '../../Utils/Helpers';

const WebSiteCreateUpdate = () => {
    const navigate = useNavigate()
    const location = useLocation();
    const { type,webId } = useParams();
    console.log('webId',webId, type)
    const params = new URLSearchParams(location.search);
    const isPreview = params.has('preview');
    const isEdit = params.has('edit');

    const [layout, setLayout] = useState([]);
    const [widgets, setWidgets] = useState([]);
    const [mode, setMode] = useState("edit");
    const [settingsWidgetId, setSettingsWidgetId] = useState(null);

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((values) => ({ ...values, [name]: value }));
    };

    const getFormDataById = () => {
        getApiCall(`admin/web-builder/details/${webId}`)
            .then((response) => {
                if (response.meta.status) {
                    setFormData({
                        name: response.data.name,
                    });
                    setLayout( response.data.layout)
                    setWidgets( response.data.widgets)
                }
            })
            .catch((error) => {
                console.error("Error loading form data:", error);
            });
    };

    const handleClose = (value) => {
        setOpen(false);
    };

    useEffect(() => {
        if (webId) {
            getFormDataById();
        } else {
            setOpen(true);
        }
    }, [webId]);

    const handleFormSetting=()=>{
        setOpen(true)
    }

    const handleSubmit = async () => {
        let payload = {
            name: formData.name,
            description: formData.name,
            url:slugifyTransform(formData.name),
            layout,
            widgets,
            builderFor: 'admin'
        };
        let response = {}
        if (type == "edit") {
            response = await postApiCall(`admin/web-builder/update/${webId}`, payload, true)
        }
        else {
            response = await postApiCall('admin/web-builder/add', payload, true)
        }
        if (response && response.meta.status) {
            toast.success(response.meta.msg)
            // setResponseId(response?.data)
            navigate(-1)
            // if(type == PUBLISHED){
            // history('/form-listing');
            // }
            
        } else {
            toast.error(response.meta.msg)
        }


    }
    
    return (
        <div className="container-fluid">
            <div className="row">
                {!isPreview && (
                    <>
                        <div className="main-title d-flex justify-content-between align-items-center flex-wrap col-md-12">
                            <h3 className="mb-2 mb-md-0">Website Creation</h3>
                            <div class="d-flex ">
        <button class="btn btn-primary mx-1" onClick={()=>handleFormSetting()}><i class="bi bi-gear"></i></button>
        <button class="btn btn-success mx-1" onClick={()=>handleSubmit('PUBLISHED')}><i class="fa fa-save"></i> Save</button>
      </div>
                        </div>

                        <div className="col-md-12">
                            <Dashboard
                                layout={layout}
                                setLayout={setLayout}
                                widgets={widgets}
                                setWidgets={setWidgets}
                                mode={mode}
                                setMode={setMode}
                                settingsWidgetId={settingsWidgetId}
                                setSettingsWidgetId={setSettingsWidgetId}
                            />
                        </div>
                    </>
                )}
            </div>

            <Modal
                backdrop="static"
                role="alertdialog"
                show={open}
                onHide={handleClose}
                size="lg"
                keyboard={false}
                dialogClassName="modal-top-right"
            >
                <Modal.Header className="align-items-center">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Modal.Title>Website Setting</Modal.Title>
                    </div>
                    <i
                        className="fa fa-times ms-auto"
                        role="button"
                        onClick={handleClose}
                        style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                    />
                </Modal.Header>

                <Modal.Body>
                    <div>
                        <div className="row">
                            <div className="form-group col-md-5">
                                <label>Web Site Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Enter form name"
                                    value={formData.name}
                                    required
                                    disabled={isEdit}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={() => handleClose('save')} appearance="primary">
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default WebSiteCreateUpdate;
