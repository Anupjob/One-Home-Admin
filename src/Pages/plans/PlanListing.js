import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import swal from "sweetalert";
import patchApiCall from "../../Services/patchApiCall";
import postApiCall from "../../Services/postApiCall";
import deleteApiCall from "../../Services/deleteApiCall";

const PlanListing = () => {
    const [lists, setLists] = useState([]);

    async function getEmenities() {
        let response = await postApiCall('admin/plan/getData');
        // console.log('response', response)
        setLists(response.data)
    }

    useEffect(() => {
        getEmenities();
    }, []);


    function UpdateStatus(e) {
        let id = e.currentTarget.getAttribute('value');
        let status = e.currentTarget.getAttribute('status');

        if (status == 1) {
            status = 0;
        }else{
            status = 1;

        }

        patchApiCall('admin/plan/changeStatus/'+id, {
            status: status,
        }).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getEmenities();
            }
        });
    }
    function Delete(e) {
        let id = e.currentTarget.getAttribute('value');
        deleteApiCall('admin/plan/delete/'+id).then((response) => {
            if (response.meta.status) {
                swal({text: response.meta.msg, icon: "success", timer: 1500})
                getEmenities();
            }
        });
    }


    return (
        <>
            <div className="container-fluid">
            <div className="main-title">
                    <h3>Plans</h3>
                </div>
                <div className="d-sm-flex align-items-center justify-content-end mb-4">
                   
                    <Link to="/plans/add" className="d-sm-inline-block btn btn-sm btn-warning shadow-sm">
                        Add New
                    </Link>
                </div>
                <div className="card shadow mb-4">
                    <div className="card-body">

                        <div className="table-responsive">
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                <tr>
                                    <th>Sl. No.</th>
                                    <th>Name</th>
                                    <th>Max Limit</th>
                                    <th>Validity</th>
                                    <th>Charges</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    lists.map((item, index) => {
                                        return <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{item.maxLimit}</td>
                                            <td>{item.validity}</td>
                                            <td>{item.charges}</td>
                                            <td>{item.status ? 'Active' : 'Inactive'}</td>
                                            <td>
                                                {item.status === 0 ?
                                                    <button
                                                        onClick={UpdateStatus} value={item._id}
                                                        status={item.status}
                                                        isDeleted={item.isDeleted}
                                                        className="btn btn-info btn-icon-split btn-sm  mb-1 mr-1"><span
                                                        className="icon text-white-50"><i
                                                        className="fas fa-exclamation-triangle"></i></span>
                                                        <span className="text">Disable</span>
                                                    </button>
                                                    :
                                                    <button className="btn btn-success btn-icon-split btn-sm mb-1 mr-1"
                                                            onClick={UpdateStatus} value={item._id}
                                                            isDeleted={item.isDeleted}
                                                            status={item.status}
                                                    >
                                                    <span className="icon text-white-50"><i
                                                        className="fas fa-check"></i></span>
                                                        <span className="text">Enable</span>
                                                    </button>
                                                }


                                                <Link to={"plans/add?id=" + item._id}
                                                      className="btn btn-primary btn-icon-split btn-sm mb-1 mr-1">
                                                    <span className="icon text-white-50">
                                                        <i className="far fa-edit"></i>
                                                    </span>
                                                    <span className="text">Edit</span>
                                                </Link>
                                                <button onClick={Delete} value={item._id}
                                                        className="btn btn-danger btn-icon-split btn-sm mb-1">
                                                        <span className="icon text-white-50">
                                                            <i className="far fa-eye"></i>
                                                        </span>
                                                    <span className="text">Delete</span>
                                                </button>
                                            </td>
                                        </tr>

                                    })
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default PlanListing
