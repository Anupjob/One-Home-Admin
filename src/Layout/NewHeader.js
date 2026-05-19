import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {Logout, userDetails} from "../Services/authenticationService";
import getApiCall from "../Services/getApiCall";

export default function Header(props) {
    const [sidebarShow, setSidebarShow] = useState(false);
    const [sideHeader, setSideHeader] = useState([])

    const sidebarToggle = () => {
        setSidebarShow(!sidebarShow);
    }

    const renderSideHeader = async () => {
        const userDetailsData = userDetails()
        let urlParms = userDetailsData.partnerDetails == null ? `?role=${userDetailsData.role}` : (userDetailsData.partnerDetails._id == undefined) ? `?role=${userDetailsData.role}` : `?userId=${userDetailsData?.partnerDetails._id}&role=${userDetailsData.role}`
        getApiCall(`admin/permission/modules/partner${urlParms}`).then((data) => {
            let sideHeaderEle = []
            const {panel, permission} = data.data
            for (let i = 0; i < permission.length; i++) {
                let module = permission[i];
                let arrr = []
                for (let j = 0; j < module.childModule.length; j++) {
                    let ele = module.childModule[j]
                    if (ele.read || ele.create || ele.update || ele.download || ele.upload || ele.deleted) arrr.push(true)
                    else arrr.push(false)
                }
                if (module.isChild) {
                    // render child elelement or nested child dropdown
                    if (arrr.includes(true)) {   // check child element permission allowed then show
                        sideHeaderEle.push(<li className="nav-item" key={i}>
                            <a className="nav-link collapsed" href="#" data-toggle="collapse"
                               data-target={`#${module.shortName}`} aria-expanded="true"
                               aria-controls={`${module.shortName}`}>
                                <i className="fas fa-fw fa-folder"></i> <span>{module.name}</span>
                                <div id={module.shortName} className="collapse" aria-labelledby="headingPages">
                                <div className="bg-primary py-2 collapse-inner rounded">
                                    {module.childModule.map((childModule, index) => {
                                        return <Link className="collapse-item" key={`child_${i}_${index}`}
                                                     to={`/${childModule.url}`}>{childModule.name}</Link>
                                    })}

                                </div>
                            </div>
                            </a>

                        </li>)
                    }
                } else {
                    // render without child element or single element
                    //check role admin or partner or patner users
                    let role = userDetailsData.role;
                    let roleUserId = userDetailsData.partnerDetails._id
                    let roleUserName = userDetailsData.name
                    if (module.url === "partner-management" && role === "partner") {
                       if (module.read || module.create || module.update || module.download || module.upload || module.deleted) {
                            sideHeaderEle.push(<li className="nav-item" >
                                <Link className="nav-link" to={`/partner-users/${roleUserId}/${roleUserName}`}>
                                    <i className="fas fa-user-cog fa-tachometer-alt"></i>
                                    <span>{module.name}</span></Link>
                            </li>)
                        }
                    } else if (module.url === "partner-management" && (role === "partner_user" || role === "partner_admin" || role === "partner_supervisor")) {
                        // ignoring partner management for partner user
                    } else {

                        if (module.read || module.create || module.update || module.download || module.upload || module.deleted) {
                            sideHeaderEle.push(<li className="nav-item">
                                <Link className="nav-link" to={`/${module.url}`}>
                                    <i className="fas fa-user-cog fa-tachometer-alt"></i>
                                    <span>{module.name}</span></Link>
                            </li>)
                        }
                    }

                }


            }
            setSideHeader(sideHeaderEle)
        })

    }

    useEffect(async () => {
        renderSideHeader()
    }, []);


    return (
        <div className="sidebar__inner bg-primary">
            <ul className={`navbar-nav  sidebar sidebar-dark accordion ${!sidebarShow ? '' : 'toggled'}`}
                id="accordionSidebar">

                <hr className="sidebar-divider my-0"/>

                {/* <li className="nav-item active">
                <Link className="nav-link" to={'/dashboard'}>
                    <i className="fas fa-fw fa-tachometer-alt"></i>
                    <span>Dashboard</span></Link>
            </li> */}


                {sideHeader.length >= 1 ? sideHeader : null}
                <li className="nav-item">
                                <Link className="nav-link" to={`/form-listing`}>
                                    <i className="fas fa-user-cog fa-tachometer-alt"></i>
                                    <span>Form Builder</span></Link>
                            </li>
                {/* <li className="nav-item">
                                <Link className="nav-link" to={`/notification-management`}>
                                    <i className="fas fa-user-cog fa-tachometer-alt"></i>
                                    <span>Notification Management</span></Link>
                            </li> */}
                {/* <li className="nav-item">
                <Link className="nav-link" to={'/customers'}>
                    <i className="fas fa-user-cog fa-tachometer-alt"></i>
                    <span>Customer Management</span></Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to={'/partner-management'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>Partner Management</span>
                </Link>
            </li>

            <li className="nav-item">
                <Link to={'/amenities'} className="nav-link">
                    <i className="fas fa-bezier-curve"></i>
                    <span>Amenities Management</span>
                </Link>
            </li>

            <hr className="sidebar-divider"/>
            <span className="ml-1 base-color">Property Management</span>
            <li className="nav-item">
                <Link className="nav-link" to={'/property/bulk-upload'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>Property - Bulk Upload</span>
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to={'/property/auction-bulk-upload'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>Auction Property - Bulk Upload</span>
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to={'/property/auction-bulk-upload'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>Property - Bulk Image Upload</span>
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to={'/property/auction-bulk-upload'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>Property - Bulk Document Upload</span>
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to={'/properties'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>Manage Properties</span>
                </Link>
            </li>

            <li className="nav-item">
                <Link className="nav-link" to={'/categories'}>
                    <i className="fas fa-grip-horizontal"></i>
                    <span>Category Management</span>
                </Link>

            </li>
            <li className="nav-item">
                <Link to={'/property-types'} className="nav-link">
                    <i className="fas fa-bezier-curve"></i>
                    <span>Property Type</span>
                </Link>
            </li>

            <hr className="sidebar-divider"/>
            <span className="ml-1 base-color">Lead Management</span>
            <li className="nav-item">
                <Link className="nav-link" to={'/leads'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>Leads</span>
                </Link>
                <Link className="nav-link" to={'/leads_preference'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>User Buying Preference</span>
                </Link>
            </li>


            <hr className="sidebar-divider"/>
            <span className="ml-1 base-color">FAQ</span>
            <li className="nav-item">
                <Link className="nav-link" to={'/faqs'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>FAQ</span>
                </Link>
                <Link className="nav-link" to={'/faqs/categories'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>FAQ Categories</span>
                </Link>

            </li>


            <li className="nav-item">
                <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapsePages"
                   aria-expanded="true" aria-controls="collapsePages">
                    <i className="fas fa-fw fa-folder"></i>
                    <span>Pages</span>
                </a>
                <div id="collapsePages" className="collapse" aria-labelledby="headingPages"
                >
                    <div className="bg-white py-2 collapse-inner rounded">
                        <Link className="collapse-item" to="/cms">CMS Management</Link>
                    </div>
                </div>
            </li>
            <li className="nav-item">
                <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#blogsPages"
                   aria-expanded="true" aria-controls="blogsPages">
                    <i className="fas fa-fw fa-folder"></i>
                    <span>Blog</span>
                </a>
                <div id="blogsPages" className="collapse" aria-labelledby="headingPages">
                    <div className="bg-white py-2 collapse-inner rounded">
                        <Link className="collapse-item" to={'/blogs'}>Blog</Link>
                        <Link className="collapse-item" to={'/blogs/categories'}>Blog Category</Link>
                    </div>
                </div>
            </li>

            <li className="nav-item">
                <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#locationColl"
                   aria-expanded="true" aria-controls="locationColl">
                    <i className="fas fa-fw fa-folder"></i>
                    <span>Location</span>
                </a>
                <div id="locationColl" className="collapse" aria-labelledby="headingPages">
                    <div className="bg-white py-2 collapse-inner rounded">
                        <Link className="collapse-item" to={'/states'}>States</Link>
                        <Link className="collapse-item" to="/cities">Cities</Link>
                    </div>
                </div>
            </li>

            <li className="nav-item">
                <Link className="nav-link" to={'/'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>Live Bid</span>
                </Link>
            </li>

            <li className="nav-item">
                <Link className="nav-link" to={'/plans'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>Subscription Management</span>
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to={'/bidders'}>
                    <i className="fas fa-fw fa-cog"></i>
                    <span>Bidders</span>
                </Link>
            </li> */}


                <hr className="sidebar-divider d-none d-md-block"/>

                <div className="text-center d-none d-md-inline">
                    <button className="rounded-circle border-0" id="sidebarToggle" onClick={sidebarToggle}></button>
                </div>

            </ul>
        </div>
    )
}