import Header from "./Layout/Header";
import {Logout, userDetails} from "./Services/authenticationService";
import {useState ,useEffect} from "react";
import {ToastContainer} from 'react-toastify';
import {Link} from 'react-router-dom';
import getApiCall from "./Services/getApiCall";

export default function Layout(props) {
    const [menuData, setMenuData] = useState([]); // Store modules here
    const [open, setOpen] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState(null);

 const handleclick = async () => {
    setOpen(true);
    const userDetailsData = userDetails();
    let urlParms = userDetailsData.partnerDetails == null
        ? `?role=${userDetailsData.role}`
        : (userDetailsData.partnerDetails._id == undefined)
            ? `?role=${userDetailsData.role}`
            : `?userId=${userDetailsData?.partnerDetails._id}&role=${userDetailsData.role}`;
    try {
        const data = await getApiCall(`admin/permission/modules/partner${urlParms}`);
        let modules = [];
        if (Array.isArray(data.data.permission)) {
            modules = data.data.permission;
        } else if (data.data.permission && data.data.permission.name) {
            modules = [data.data.permission];
        } else if (data.data && data.data.name) {
            modules = [data.data];
        }
        setMenuData(modules);
        
    } catch (err) {
        
        setMenuData([]);
    }
};
 
useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        // Clean up when component unmounts
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);
    return (
        <>
            <div id="wrapper"  style={{marginTop:'57px'}}>
                <Header permissions={props.permissions}/>
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                            <ul className="navbar-nav ml-auto d-flex align-items-center justify-content-center">
                                <li style={{ textDecoration: 'none' }}>
                                    <Link to={"/properties/upload_media"}
                                        className="d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                                        Upload Media
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                        {/* Hamburger menu overlay */}
                      {open && (
                         <>
                            {/* Overlay */}
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.4)",
                zIndex: 1049
            }}
            onClick={() => setOpen(false)}
        />
                        <div className="w-75 h-100  offcanvas offcanvas-end navmenu-offcanvas bg-primary text-white d-md-none d-block" 
                        style={{ zIndex: 1050 ,position:'absolute',top:0 }}>
                            {/* Close button on the left */}
                            {/* <div className="d-flex justify-content-end postionn-absolute top-0">
                                <button className="btn btn-danger m-2 " style={{position:'absolute',zIndex:1051}} onClick={() => setOpen(false)}>X</button>
                            </div> */}
                            <div class="offcanvas-header p-3  d-flex justify-content-between border-bottom align-items-center p-2">
                            <h5  style={{fontWeight:'100'}} >Menu</h5>
                            <button type="button" class="px-2 bg-transparent rounded" onClick={() => setOpen(false)} data-bs-dismiss="offcanvas" aria-label="Close"><b>X</b></button>
                        </div>
                        <div class="offcanvas-body">
                            <ul className="list-unstyled right_menu p-2">
                                {menuData.map((module, i) => {
                                    // Check permissions for child modules
                                    let childHasPermission = false;
                                    if (module.childModule && module.childModule.length > 0) {
                                        childHasPermission = module.childModule.some(child =>
                                            child.read || child.create || child.update || child.download || child.upload || child.deleted
                                        );
                                    }
                                    // For parent modules with children
                                    if (module.isChild && childHasPermission) {
                                        return (
                                            <li className="dropdown" key={i}>
                                                <a
                                                    className="nav-link collapsed d-flex justify-content-between align-items-center"
                                                    href="#"
                                                    onClick={e => { e.preventDefault(); setOpenSubMenu(openSubMenu === i ? null : i); }}
                                                    data-toggle="collapse"
                                                    data-target={`#hm_${module.shortName}`}
                                                    aria-expanded={openSubMenu === i ? "true" : "false"}
                                                    aria-controls={`hm_${module.shortName}`}
                                                    style={{ color:'white', cursor: 'pointer' }}
                                                >
                                                    <span style={{fontSize:'13px'}}>{module.name}</span>
                                                    <span class="fa fa-angle-right" style={{color:'white'}}></span>
                                                </a>
                                                <div
                                                    id={`hm_${module.shortName}`}
                                                    className={`collapse${openSubMenu === i ? ' show' : ''}`}
                                                    aria-labelledby="headingPages"
                                                >
                                                    <div className="bg-primary shadow ml-2 px-4 collapse-inner d-flex flex-column align-items-start justify-content-center">
                                                        {module.childModule.map((childModule, index) =>
                                                            (childModule.read || childModule.create || childModule.update || childModule.download || childModule.upload || childModule.deleted) && (
                                                                <Link
                                                                    className="collapse-item py-1"
                                                                    key={`child_${i}_${index}`}
                                                                    to={`/${childModule.url}`}
                                                                    onClick={() => setOpen(false)}
                                                                    style={{ color: 'white' }}
                                                                >
                                                                    {childModule.name}
                                                                </Link>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    }
                                    // For single modules (no children)
                                    if (
                                        !module.isChild &&
                                        (module.read || module.create || module.update || module.download || module.upload || module.deleted)
                                    ) {
                                        return (
                                            <li className="nav-item " key={i}>
                                                <Link
                                                    className="nav-link d-flex justify-content-between"
                                                    to={`/${module.url}`}
                                                    onClick={() => setOpen(false)}
                                                    style={{ color: 'white', cursor: 'pointer' }}
                                                >
                                                    {/* <i className="fas fa-user-cog fa-tachometer-alt"></i> */}
                                                    <span style={{fontSize:'13px'}}>{module.name}</span>
                                                    {/* <span class="fa fa-angle-right" style={{color:'white'}}></span> */}
                                                </Link>
                                            </li>
                                        );
                                    }
                                    return null;
                                })}
                            </ul>
                            </div>
                        </div>
                        </>
)}
                        {props.children}
                    </div>
                    <footer className="sticky-footer bg-white">
                        <div className="container my-auto">
                            <div className="copyright text-center my-auto">
                                <span>Copyright &copy; IIFL 2025</span>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
            <a className="scroll-to-top rounded" href="#page-top">
                <i className="fas fa-angle-up"></i>
            </a>
            <ToastContainer />
        </>
    );
}