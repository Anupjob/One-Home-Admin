import Layout from "../Layout";

export default function Customers() {
    return <>
        <div className="container-fluid">
        <div className="main-title">
        <h3>Customer Management</h3>
            </div>
            <div className="d-sm-flex align-items-center justify-content-end mb-4">
                
                <a href="#" className="btn btn-sm btn-warning shadow-sm"><i
                    className="fas fa-download fa-sm text-white-50 mr-1"></i> Download the customer data</a>
            </div>


            
            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                            <thead>
                            <tr>
                                <th>Sl. No.</th>
                                <th>Name</th>
                                <th>Contact number</th>
                                <th>Email ID</th>
                                <th>City</th>
                                <th>Registered from date</th>
                                <th>Auction history</th>
                                <th>Action</th>
                            </tr>
                            </thead>

                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>Praveen Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>praveen@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Arun Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>arun@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Keshav Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>keshav@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Harsh Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>harsh@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Babneet Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>babneet@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>6</td>
                                <td>Praveen Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>praveen@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>7</td>
                                <td>Arun Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>arun@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>8</td>
                                <td>Keshav Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>keshav@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>9</td>
                                <td>Harsh Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>harsh@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>10</td>
                                <td>Babneet Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>babneet@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>11</td>
                                <td>Praveen Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>praveen@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>12</td>
                                <td>Arun Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>arun@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>13</td>
                                <td>Keshav Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>keshav@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>14</td>
                                <td>Harsh Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>harsh@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            <tr>
                                <td>15</td>
                                <td>Babneet Kumar</td>
                                <td>+91 90 0000 0000</td>
                                <td>babneet@gmail.com</td>
                                <td>Delhi</td>
                                <td>1, Sep 2022</td>
                                <td><a href="view-auction-history.html" className="btn btn-primary btn-sm">
                                    <i className="fas fa-eye"></i></a></td>
                                <td>
                                    <a href="#" className="btn btn-success btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-check"></i> 
                                        </span>
                                        <span className="text">Enable</span>
                                    </a>
                                    <a href="#" className="btn btn-primary btn-icon-split btn-sm  mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-exclamation-triangle"></i>
                                        </span>
                                        <span className="text">Disable</span>
                                    </a>

                                    <a href="#" className="btn btn-danger btn-icon-split btn-sm mb-1 mr-1">
                                        <span className="icon text-white-50">
                                            <i className="fas fa-trash"></i>
                                        </span>
                                        <span className="text">Delete</span>
                                    </a></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


        </div>

    </>
}