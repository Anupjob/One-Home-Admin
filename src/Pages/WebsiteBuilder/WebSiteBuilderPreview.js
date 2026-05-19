import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import getApiCall from '../../Services/getApiCall';
import Dashboard from '../WebsiteBuilder';
import { deslugifyTransform } from '../../Utils/Helpers';

const WebSiteBuilderPreview = () => {
    const location = useLocation();
    const {webName } = useParams();
    const params = new URLSearchParams(location.search);
    const isPreview = params.has('preview');
    const [layout, setLayout] = useState([]);
    const [widgets, setWidgets] = useState([]);
    const [mode, setMode] = useState("preview");
    const [settingsWidgetId, setSettingsWidgetId] = useState(null);


    const getFormDataById = () => {
        getApiCall(`admin/web-builder/details/slug/${webName}`)
            .then((response) => {
                if (response.meta.status) {
                    setLayout(response.data.layout)
                    setWidgets(response.data.widgets)
                }
            })
            .catch((error) => {
                console.error("Error loading form data:", error);
            });
    };


    useEffect(() => {
        getFormDataById();
    }, [webName]);

    return (
        <div className="container-fluid">
            <div className="row">
                {!isPreview && (
                    <>
                        <div className="main-title d-flex justify-content-between align-items-center flex-wrap col-md-12">
                            <h3 className="mb-2 mb-md-0">{deslugifyTransform(webName)}</h3>
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
                                pageFor={'webPreview'}
                            />
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default WebSiteBuilderPreview;
