// import package and components
import React, { Component, useState, Suspense, lazy } from 'react';
import './App.css';
import './custom.css';
import './css/style.css'
// import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import RouteChangeLoader from './Utils/loader'; // now includes both loader logic and listener
import IsAuthenticat from './IsAuthenticat';
import Home from './Pages/home';
import OneApf from './Pages/OneApf';
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import { isMobile } from "react-device-detect";
import { io } from 'socket.io-client';
import Constant from './Components/Constant';
import AdminAccess from './AdminAccess';
import getApiCall from './Services/getApiCall';
import { decryptBody } from './Services/helpers';
import Header from './Layout/topheader';
import Layout from './Layout';
import AutoLogout from './Autologout/autoLogout';
import ScrollToTop from './Components/ScrollToTop'; 
import {userDetails } from './Services/authenticationService';
import { selectedPartnerDetails } from './Services/authenticationService';
import ChatBot from './Utils/ChatBot';
import NESLGenerateLinkForm from './Components/NESLGenerateLinkForm';

// Lazy-loaded pages/components
const WebsiteBuilder = lazy(() => import("./Pages/WebsiteBuilder"));
const Login = lazy(() => import("./Components/Login"));
const AmenitiesManagement = lazy(() => import("./Components/Amenities/AmenitiesManagement"));
const AddAmenities = lazy(() => import("./Components/Amenities/AddUpdate"));
const PropertyTypeListing = lazy(() => import("./Pages/PropertyType/PropertyTypeListing"));
const PropertyTypeAdd = lazy(() => import("./Pages/PropertyType/PropertyTypeAdd"));
const CategoryListing = lazy(() => import("./Pages/Categories/CategoryListing"));
const CategoryAdd = lazy(() => import("./Pages/Categories/CategoryAdd"));
const BlogListing = lazy(() => import("./Pages/Blogs/BlogListing"));
const BlogCreate = lazy(() => import("./Pages/Blogs/BlogCreate"));
const PropertyListing = lazy(() => import("./Pages/Properties/PropertyListing"));
const PropertyAdd = lazy(() => import("./Pages/Properties/PropertyAdd"));
const StateListing = lazy(() => import("./Pages/States/StateListing"));
const StateAdd = lazy(() => import("./Pages/States/StateAdd"));
const CityListing = lazy(() => import("./Pages/City/CityListing"));
const CityAdd = lazy(() => import("./Pages/City/CityAdd"));
const PartnerManagement = lazy(() => import("./Pages/Partner/DataManagement"));
const AddUpdatePartner = lazy(() => import("./Pages/Partner/AddUpdate"));
const AddUserPartner = lazy(() => import("./Pages/Partner/AddUserPartner"));
const UserPartnerManagement = lazy(() => import("./Pages/Partner/UserPartnerManagement"));
const UpdateUserPartner = lazy(() => import("./Pages/Partner/UpdateUserPartner"));
const PartnerAdd = lazy(() => import("./Pages/Partner/PartnerAdd"));
const Permission = lazy(() => import('./Pages/Partner/Permission'));
const Role = lazy(() => import('./Pages/Partner/Role'));
const partnerAuditTrails = lazy(() => import('./Pages/Partner/AuditTrail'));

const FaqAdd = lazy(() => import("./Pages/Faqs/FaqAdd"));
const FaqsListing = lazy(() => import("./Pages/Faqs/FaqsListing"));
const FaqsCategoryListing = lazy(() => import("./Pages/FaqsCategory/FaqsCategoryListing"));
const FaqsCategoryCreate = lazy(() => import("./Pages/FaqsCategory/FaqsCategoryCreate"));

const CustomerListing = lazy(() => import("./Pages/Customer/CustomerListing"));
const CustomerAdd = lazy(() => import("./Pages/Customer/CustomerAdd"));

const CmsListing = lazy(() => import("./Pages/cms/CmsListing"));
const CmsAdd = lazy(() => import("./Pages/cms/CmsAdd"));

const BlogCategoryListing = lazy(() => import("./Pages/BlogCategory/BlogCategoryListing"));
const BlogCategoryCreate = lazy(() => import("./Pages/BlogCategory/BlogCategoryCreate"));

const PropertyBulkUpload = lazy(() => import("./Pages/Properties/PropertyBulkUpload"));
const PropertyAuctionBulkUpload = lazy(() => import("./Pages/Properties/PropertyAuctionBulkUpload"));
const PropertyAuctionAdd = lazy(() => import("./Pages/Properties/PropertyAuctionAdd"));
const PropertyBulkUpdate = lazy(() => import("./Pages/Properties/PropertyBulkUpdate"));
const PropertyDetails = lazy(() => import("./Pages/Properties/PropertyDetails"));
const PropertyDetailsForm = lazy(() => import("./Pages/Properties/PropertyDetailsForm"));
const PropertyFeedbacks = lazy(() => import("./Pages/Properties/PropertyFeedbacks"));
const AuctionPropertyListing = lazy(() => import('./Pages/Properties/AuctionPropertyListing'));
const AuditTrails = lazy(() => import('./Pages/Properties/AuditTrail'));

const PropertyBids = lazy(() => import("./Pages/Properties/PropertyBids"));
const PropertyManagement = lazy(() => import('./Pages/Bidder/PropertyMediaManagement/Property_Managemet'));
const Access_Property = lazy(() => import('./Pages/Bidder/PropertyMediaManagement/Access_Property'));
const MediaListing = lazy(() => import('./Pages/Bidder/PropertyMediaManagement/MediaListing'));
const MediaDetails = lazy(() => import('./Pages/Bidder/PropertyMediaManagement/MediaDetails'));

const LeadsListing = lazy(() => import("./Pages/Lead/LeadsListing"));
const LeadsAdd = lazy(() => import("./Pages/Lead/LeadsAdd"));
const LeadsUserPreference = lazy(() => import('./Pages/Lead/LeadsUserPreference'));
const LeadCommunications = lazy(() => import('./Pages/Lead/LeadCommunications'));
const LeadComments = lazy(() => import("./Pages/Lead/LeadComments"));

const PLanAdd = lazy(() => import("./Pages/plans/PlanAdd"));
const PlanListing = lazy(() => import("./Pages/plans/PlanListing"));

const BidderListing = lazy(() => import("./Pages/Bidder/BidderListing"));
const BidderDetial = lazy(() => import("./Pages/Bidder/BidderDetial"));
const PrimaryDetails = lazy(() => import('./Pages/Bidder/PrimaryDetails'));
const DocumentDetails = lazy(() => import('./Pages/Bidder/DocumentDetails'));
const PaymentDetails = lazy(() => import('./Pages/Bidder/PaymentDetails'));
const DeclarativeDocuments = lazy(() => import('./Pages/Bidder/DeclarativeDocument'));
const BidderProperties = lazy(() => import("./Pages/Bidder/BidderProperties"));
const PaymentVerification = lazy(() => import("./Pages/Bidder/PaymentVerification"));
const BidderOverview = lazy(() => import('./Pages/Bidder/BidderOverview'));
const BidderAddForm = lazy(() => import('./Pages/Bidder/BidderAdd'));
const BulkUploadPayment = lazy(() => import('./Pages/Bidder/BulkUploadPayment'));
const DocumentReviewScreen = lazy(() => import('./Pages/Bidder/DocumentReviewScreen'));

const BulkImageUpload = lazy(() => import('./Pages/Properties/BulklImageUpload'));
const BulkDocumentUpload = lazy(() => import('./Pages/Properties/BulkDocumentUpload'));

const LiveBid = lazy(() => import("./Pages/LiveBid/LiveBid"));
const PropertyDetail = lazy(() => import('./Pages/LiveBid/PropertyDetail'));
const LiveBidderList = lazy(() => import("./Pages/LiveBid/LiveBidderList"));

const AddressLocationListing = lazy(() => import("./Pages/AddressLocation/AddressLocationListing"));
const AddressLocationAdd = lazy(() => import("./Pages/AddressLocation/AddAddressLocation"));

const EmdPayments = lazy(() => import("./Pages/EmdPayment/EmdPaymentList"));

const NotificationListing = lazy(() => import('./Pages/NotificationManagement/NotificationListing'));
const NotificationSetting = lazy(() => import('./Pages/NotificationManagement/NotificationSetting'));
const NotificationCreateUpdate = lazy(() => import('./Pages/NotificationManagement/NotificationCreateUpdate'));

const FormBuilder = lazy(() => import('./Pages/FormBuilder/FormBuilder'));
const FormListing = lazy(() => import('./Pages/FormBuilder/FormListing'));
const CreateUpdateForms = lazy(() => import('./Pages/FormBuilder/CreateUpdateForms'));
const FormInsertdTable = lazy(() => import('./Pages/FormBuilder/FormInsertedTable'));
const BulkDataUpload = lazy(() => import('./Pages/FormBuilder/BulkDataUpload'));
const FormBuilderAuditLog = lazy(() => import("./Pages/FormBuilder/FormAuditTrail"));
const QueryManagement = lazy(() => import("./Pages/FormBuilder/QueryManagement"));

const OutputWebsitePage = lazy(() => import('./Pages/WebsiteBuilder/OutputWebsitePage'));

const TDSReviewListing = lazy(() => import('./Pages/TDS/tdsReviewListing'));

const ErrorPage = lazy(() => import('./Pages/ErrorPage'));
const PreLogin = lazy(() => import("./Components/pre-login/PreLogin"));
const WebBuilderList = lazy(() => import("./Pages/WebsiteBuilder/WebSiteBuilderList"));
const WebBuilderCreateUpdate = lazy(() => import("./Pages/WebsiteBuilder/WebSiteCreateUpdate"));
const WebBuilderPreview = lazy(() => import("./Pages/WebsiteBuilder/WebSiteBuilderPreview"));
const WorkflowListing = lazy(() => import("./Pages/WorkFlow/workflowListing"));
const WorkflowCanvas = lazy(() => import("./Pages/WorkFlow/WorkflowCanvas"));
const WorkflowTabs = lazy(() => import("./Pages/WorkFlow/WorkFlowTabs"));

const NotificationList = lazy(() => import("./Pages/Tasks/NotificationList"));
const MyPendingTaskList = lazy(() => import("./Pages/Tasks/MyPendingTask"));

const CopyPaymentPlans = lazy(() => import("./Pages/FormBuilder/DataEntryOneAPF/PaymentPlans/CopyPaymentPlans"));
const ManagePlans = lazy(() => import("./Pages/FormBuilder/DataEntryOneAPF/PaymentPlans/ManagePlans"));
const CreatePaymentPlan = lazy(() => import("./Pages/FormBuilder/DataEntryOneAPF/PaymentPlans/CreatePaymentPlan"));
const PaymentPlanSelection = lazy(() => import("./Pages/FormBuilder/DataEntryOneAPF/PaymentPlans/PaymentPlanSelection"));
const AddProjectProgress = lazy(() => import("./Pages/FormBuilder/DataEntryOneAPF/ProjectProgress/AddProjectProgress"));
const BulkUpdateProjectProgress = lazy(() => import("./Pages/FormBuilder/DataEntryOneAPF/ProjectProgress/BulkUpdate"));
const ProjectProgressGroup = lazy(() => import("./Pages/FormBuilder/DataEntryOneAPF/ProjectProgress/BulkUpdate/ProjectProgressGroup"));
const OverAllProjectProgress = lazy(() => import("./Pages/FormBuilder/DataEntryOneAPF/ProjectProgress/OverAllProjectProgress/index"));
const ForumForm = lazy(() => import("./Pages/Forum/ForumForm"));
const ForumList = lazy(() => import("./Pages/Forum/ForumList"));
const WorkFlowData = lazy(() => import("./Pages/WorkFlow/WorkFlowDataTable"));
const WorkFlowFormRender = lazy(() => import("./Pages/WorkFlow/WorkFlowFormRender"));

class App extends Component {

    // run on first render
    state = {
        time: 'fetching',
        socket: io(Constant.socketPath,{
      transports: ["websocket"], // force WebSocket
      forceNew: true,            // prevent reusing old sessions
      reconnection: true,        // auto-reconnect
      reconnectionAttempts: 5,   // retry 5 times
    //   reconnectionDelay: 2000    // wait 2s between retries
    }),
     permissions: []   // ✅ added
    }


    // Do Not remove its used for Blob File Token
    componentDidMount() {
        console.log('IsAuthenticat()::::',IsAuthenticat())
        if(!localStorage.getItem('uploadT')){
        getApiCall('common/upload/blob/token')
            .then(response => {
                localStorage.setItem('uploadT', decryptBody(response.data).token)
            })
        }

        // ✅ fetch permissions here
        if (IsAuthenticat()) {
            this.loadPermissions();
        }
    }

    // ✅ New method
    // loadPermissions = async () => {
    //     const userDetailsData = userDetails();
    //     const url = `admin/modules/list/${userDetailsData?.id}/${userDetailsData?.partnerDetails[0]?._id}/${userDetailsData?.roles?._id}`;
    //     const data = await getApiCall(url);

    //     this.setState({ permissions: data.data });
    // };
     loadPermissions = async () => {
        const userDetailsData = userDetails();
        const selectedPartnerData = selectedPartnerDetails();
        let url='';
        if (selectedPartnerData?._id) {
             url = `admin/modules/list/${userDetailsData?.id}/${selectedPartnerData?._id}/${selectedPartnerData?.roleId}`;
        }else{
             url = `admin/modules/list/${userDetailsData?.id}/${userDetailsData?.partnerDetails[0]?._id}/${userDetailsData?.roles?._id}`;
        }
        const data = await getApiCall(url);

        this.setState({ permissions: data.data });
    };

    


    render() {
        const { socket, permissions,loadPermissions  } = this.state;

        return (
            <Router>

                    <Header moduleList = {permissions}/>
                {IsAuthenticat() ? (<>
                    <RouteChangeLoader />
                    <ScrollToTop />
                    <DefaultContainer socket={socket} permission = {permissions} loadPermissions={loadPermissions} />
                <AutoLogout excludedPaths={[]} />
                {/* <ChatBot /> */}

                </>)
                    : <Routes>
                        <Route path="/" element={<PreLogin/>} />
                        <Route path="/nesl-generate-link" element={<NESLGenerateLinkForm/>}/>
                       <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                }

            </Router>
        );
    }

}


//To be change in to default router
const DefaultContainer = (props) =>
(
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
        <Layout permissions={props.permission}>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Navigate to={"/home"} replace />} />
                    {/* Admin/Protected Routes */}
                    <Route path="/home" element={<AdminAccess><Home permissions={props.permission} getModuleData={props.loadPermissions} /></AdminAccess>} />
                    <Route path="/home/one-apf" element={<AdminAccess><OneApf permissions={props.permission} /></AdminAccess>} />
                    <Route path="/home/one-apf/:formName/:formId" element={<AdminAccess><OneApf permissions={props.permission} /></AdminAccess>} />
                    <Route path="/WebsiteBuilder" element={<AdminAccess><WebsiteBuilder /></AdminAccess>} />
                    <Route path="/amenities" element={<AdminAccess><AmenitiesManagement /></AdminAccess>} />
                    <Route path="/amenities/add" element={<AdminAccess><AddAmenities /></AdminAccess>} />
                    <Route path="/customers" element={<AdminAccess><CustomerListing /></AdminAccess>} />
                    <Route path="/customers/add" element={<AdminAccess><CustomerAdd /></AdminAccess>} />
                    <Route path="/property-types" element={<AdminAccess><PropertyTypeListing /></AdminAccess>} />
                    <Route path="/property-types/add" element={<AdminAccess><PropertyTypeAdd /></AdminAccess>} />
                    <Route path="/properties" element={<AdminAccess><PropertyListing /></AdminAccess>} />
                    <Route path="/properties/auction" element={<AdminAccess><AuctionPropertyListing /></AdminAccess>} />
                    <Route path="/property/add" element={<AdminAccess><PropertyAdd /></AdminAccess>} />
                    <Route path="/property/details/:id" element={<AdminAccess><PropertyDetails /></AdminAccess>} />
                    <Route path="/property/auction/add" element={<AdminAccess><PropertyAuctionAdd /></AdminAccess>} />
                    <Route path="/properties/bids/:id" element={<AdminAccess><PropertyBids /></AdminAccess>} />
                    <Route path="/properties/feedbacks/:id" element={<AdminAccess><PropertyFeedbacks /></AdminAccess>} />
                    <Route path="/properties/feedbacks" element={<AdminAccess><PropertyFeedbacks /></AdminAccess>} />
                    <Route path="/properties/audit-trails/:id" element={<AdminAccess><AuditTrails /></AdminAccess>} />
                    <Route path="/properties/bulk-update" element={<AdminAccess><PropertyBulkUpdate /></AdminAccess>} />
                    <Route path="/property/bulk-upload" element={<AdminAccess><PropertyBulkUpload /></AdminAccess>} />
                    <Route path="/property/auction-bulk-upload" element={<AdminAccess><PropertyAuctionBulkUpload /></AdminAccess>} />
                    <Route path="/property/bulk-image-upload" element={<AdminAccess><BulkImageUpload /></AdminAccess>} />
                    <Route path="/property/bulk-doucument-upload" element={<AdminAccess><BulkDocumentUpload /></AdminAccess>} />
                    <Route path="/properties/upload_media" element={<AdminAccess><PropertyManagement /></AdminAccess>} />
                    <Route path="/properties/access_media" element={<AdminAccess><MediaListing /></AdminAccess>} />
                    <Route path="/properties/media_list" element={<AdminAccess><MediaListing /></AdminAccess>} />
                    <Route path="/property/media_detail/:id" element={<AdminAccess><MediaDetails /></AdminAccess>} />
                    <Route path="/leads" element={<AdminAccess><LeadsListing /></AdminAccess>} />
                    <Route path="/leads_preference" element={<AdminAccess><LeadsUserPreference /></AdminAccess>} />
                    <Route path="/leads_communications" element={<AdminAccess><LeadCommunications /></AdminAccess>} />
                    <Route path="/states" element={<AdminAccess><StateListing /></AdminAccess>} />
                    <Route path="/cities" element={<AdminAccess><CityListing /></AdminAccess>} />
                    <Route path="/edit-city/:id" element={<AdminAccess><CityAdd /></AdminAccess>} />
                    <Route path="/add-city" element={<AdminAccess><CityAdd /></AdminAccess>} />
                    <Route path="/states/add" element={<AdminAccess><StateAdd /></AdminAccess>} />
                    <Route path="/address-locations" element={<AdminAccess><AddressLocationListing /></AdminAccess>} />
                    <Route path="/address-locations/add" element={<AdminAccess><AddressLocationAdd /></AdminAccess>} />
                    <Route path="/address-locations/edit/:id" element={<AdminAccess><AddressLocationAdd /></AdminAccess>} />
                    <Route path="/categories" element={<AdminAccess><CategoryListing /></AdminAccess>} />
                    <Route path="/categories/add" element={<AdminAccess><CategoryAdd /></AdminAccess>} />
                    <Route path="/blogs" element={<AdminAccess><BlogListing /></AdminAccess>} />
                    <Route path="/blogs/add" element={<AdminAccess><BlogCreate /></AdminAccess>} />
                    <Route path="/blogs/blogs/add?" element={<AdminAccess><BlogCreate /></AdminAccess>} />
                    <Route path="/blogs/categories" element={<AdminAccess><BlogCategoryListing /></AdminAccess>} />
                    <Route path="/blogs/categories/add" element={<AdminAccess><BlogCategoryCreate /></AdminAccess>} />
                    <Route path="/cms" element={<AdminAccess><CmsListing /></AdminAccess>} />
                    <Route path="/cms/add" element={<AdminAccess><CmsAdd /></AdminAccess>} />
                    <Route path="/partner-management" element={<AdminAccess><PartnerManagement /></AdminAccess>} />
                    <Route path="/Permission/:id" element={<AdminAccess><Permission /></AdminAccess>} />
                    <Route path="/create-partner" element={<AdminAccess><AddUpdatePartner /></AdminAccess>} />
                    <Route path="/edit-partner/:id" element={<AdminAccess><AddUpdatePartner /></AdminAccess>} />
                    <Route path="/partner-users/:id/:name" element={<AdminAccess><UserPartnerManagement /></AdminAccess>} />
                    <Route path="/add-user-partner/:id/:name" element={<AdminAccess><AddUserPartner /></AdminAccess>} />
                    <Route path="/edit-user-partner/:id" element={<AdminAccess><UpdateUserPartner /></AdminAccess>} />
                    <Route path="/role/:id/:role" element={<AdminAccess><Role /></AdminAccess>} />
                    <Route path="/partner-user-audit-trail/:id" element={<AdminAccess><partnerAuditTrails /></AdminAccess>} />
                    {/* FAQs */}
                    <Route path="/faqs" element={<AdminAccess><FaqsListing /></AdminAccess>} />
                    <Route path="/faqs/addFaqs" element={<AdminAccess><FaqAdd /></AdminAccess>} />
                    <Route path="/faqs/editFaqs/:id" element={<AdminAccess><FaqAdd /></AdminAccess>} />
                    <Route path="/faqs/categories" element={<AdminAccess><FaqsCategoryListing /></AdminAccess>} />
                    <Route path="/faqs/categories/add" element={<AdminAccess><FaqsCategoryCreate /></AdminAccess>} />

                    {/* Plans */}
                    <Route path="/plans" element={<AdminAccess><PlanListing /></AdminAccess>} />
                    <Route path="/plans/add" element={<AdminAccess><PLanAdd /></AdminAccess>} />

                    {/* Bidders */}
                    <Route path="/bidders/detail/:id" element={<AdminAccess><BidderDetial /></AdminAccess>} />
                    <Route path="/bidder/add" element={<AdminAccess><BidderAddForm /></AdminAccess>} />
                    <Route path="/bidders" element={<AdminAccess><BidderListing /></AdminAccess>} />
                    <Route path="/bidder/bidder_overviews/:participationId" element={<AdminAccess><BidderOverview /></AdminAccess>} />
                    <Route path="/bidders/properties/:bidderId" element={<AdminAccess><BidderProperties /></AdminAccess>} />
                    <Route path="/live_bid" element={<AdminAccess socket={props.socket}><LiveBid /></AdminAccess>} />
                    <Route path="/Property_Details/:id" element={<AdminAccess socket={props.socket}><PropertyDetail /></AdminAccess>} />
                    <Route path="/Leads_Comments/:id" element={<AdminAccess><LeadComments /></AdminAccess>} />
                    <Route path="/liveBidderList/:id" element={<AdminAccess socket={props.socket}><LiveBidderList /></AdminAccess>} />

                    {/* Primary, Document, Payment Details */}
                    <Route path="/Primary_Details/:id" element={<AdminAccess><PrimaryDetails /></AdminAccess>} />
                    <Route path="/Document_Details/:id" element={<AdminAccess><DocumentDetails /></AdminAccess>} />
                    <Route path="/Payment_Details/:id" element={<AdminAccess><PaymentDetails /></AdminAccess>} />
                    <Route path="/Payment_Verification/:id" element={<AdminAccess><PaymentVerification /></AdminAccess>} />
                    <Route path="/Declarative_Documents/:id" element={<AdminAccess><DeclarativeDocuments /></AdminAccess>} />
                    <Route path="/emd-payments" element={<AdminAccess><EmdPayments /></AdminAccess>} />

                    {/* Notifications */}
                    <Route path="/notification-management" element={<AdminAccess><NotificationListing /></AdminAccess>} />
                    <Route path="/notification-settings/:partnerId" element={<AdminAccess><NotificationSetting /></AdminAccess>} />
                    <Route path="/create-update-notification" element={<AdminAccess><NotificationCreateUpdate /></AdminAccess>} />

                    {/* Forms */}
                    <Route path="/form-builder" element={<AdminAccess><FormBuilder /></AdminAccess>} />
                    <Route path="/form-builder/:formId" element={<AdminAccess><FormBuilder /></AdminAccess>} />
                    <Route path="/form-listing" element={<AdminAccess><FormListing /></AdminAccess>} />
                    <Route path="/forms-list/:formName/:formId" element={<AdminAccess><FormInsertdTable /></AdminAccess>} />
                    <Route path="/create-update-from/:formName/:formId/:type" element={<AdminAccess><CreateUpdateForms /></AdminAccess>} />
                    <Route path="/tds-review-listing" element={<AdminAccess><TDSReviewListing /></AdminAccess>} />
                    <Route path="/tds_review/:id" element={<AdminAccess><DocumentReviewScreen /></AdminAccess>} />
                    <Route path="/formData/bulk-upload/:formName/:type/:formId" element={<AdminAccess><BulkDataUpload /></AdminAccess>} />
                    <Route path="/formData/audit-trails/:formName/:formId/:id" element={<AdminAccess><FormBuilderAuditLog /></AdminAccess>} />
                    <Route path="/formData/:formName/queries/:formId/:id" element={<AdminAccess><QueryManagement /></AdminAccess>} />

                    {/* Website & Payments */}
                    <Route path="/website/output" element={<AdminAccess><OutputWebsitePage /></AdminAccess>} />
                    <Route path="/payment/bulk-upload/:type" element={<AdminAccess><BulkUploadPayment /></AdminAccess>} />
                    <Route path="/website/list" element={<AdminAccess><WebBuilderList /></AdminAccess>} />
                    <Route path="/website/create-update-web-builder/:webId/:type" element={<AdminAccess><WebBuilderCreateUpdate /></AdminAccess>} />
                    <Route path="/website/create-update-web-builder/:type" element={<AdminAccess><WebBuilderCreateUpdate /></AdminAccess>} />
                    <Route path="/website/:webName" element={<AdminAccess><WebBuilderPreview /></AdminAccess>} />
                    {/* Continue with remaining routes in same pattern */}
                    <Route path="/workflow_listings" element={<AdminAccess><WorkflowListing /></AdminAccess>} />
                    <Route path="/workflow_design/:type" element={<AdminAccess><WorkflowCanvas /></AdminAccess>} />
                    <Route path="/workflow_data/:wofId" element={<AdminAccess><WorkFlowData /></AdminAccess>} />
                    <Route path="/workflow_form_render/:wofId/:instanceId" element={<AdminAccess><WorkFlowFormRender /></AdminAccess>} />
                    <Route path="/workflow_tabs/:wofId" element={<AdminAccess><WorkflowTabs permissions={props.permission} getModuleData={props.loadPermissions}/></AdminAccess>} />

                    <Route path="/notificationList" element={<AdminAccess><NotificationList /></AdminAccess>} />
                    <Route path="/my-tasks" element={<AdminAccess><MyPendingTaskList /></AdminAccess>} />

                    {/* ONE APF Data Entry Payment Plan*/}
                    <Route path="/copy-payment-plans" element={<AdminAccess><CopyPaymentPlans /></AdminAccess>} />
                    <Route path="/manage-payment-plans" element={<AdminAccess><ManagePlans /></AdminAccess>} />
                    <Route path="/selection-payment-plans" element={<AdminAccess><PaymentPlanSelection /></AdminAccess>} />
                    <Route path="/manage-payment-plans/:type" element={<AdminAccess><CreatePaymentPlan /></AdminAccess>} />
                    <Route path="/one-apf/project-progress/:type" element={<AdminAccess><AddProjectProgress /></AdminAccess>} />
                    <Route path="/one-apf/project-progress/bulk-update" element={<AdminAccess><BulkUpdateProjectProgress /></AdminAccess>} />
                    <Route path="/one-apf/project-progress/group" element={<AdminAccess><ProjectProgressGroup /></AdminAccess>} />
                    <Route path="/one-apf/project-progress/over-all-progress" element={<AdminAccess><OverAllProjectProgress /></AdminAccess>} />

                    <Route path="/user-assignment/forum-form" element={<AdminAccess><ForumForm /></AdminAccess>} />
                    <Route path="/user-assignment/forum-list" element={<AdminAccess><ForumList /></AdminAccess>} />

                    {/* Default redirect */}
                    {/* Catch-all 404 */}
                    <Route path="*" element={<ErrorPage />} />
                </Routes>

            </Suspense>
        </Layout>
    </DndProvider>
)



export default App;