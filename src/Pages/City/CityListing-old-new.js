import {Link} from "react-router-dom";
import {useEffect, useState} from "react";

import $ from 'jquery';
import EnableDisable from "../../Widgets/EnableDisable";
import Pagination from "../../Widgets/Pagination";
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";


const CityListing = () => {
    const [allCities, setCities] = useState([]);
    // const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(0);
    const [next, setNext] = useState(0);
    const [previous, setprevious] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const [searchBoxText, setSearchBoxText] = useState('')
    const [tableData, setTableData] = useState([])
    const [isFilterError, setFilterError] = useState(false);
    const [stateList, setStateList] = useState([]);
    const [isCityError, setCityError] = useState(false);
    const [isStatesError, setStatesError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('Required *');

    /*
    *
    * @params page : page of pagination
    * @params filter: filter query
    * if filter '' and page 1 it runs default
    * */
    const CALLAPI = async (page, filter) => {
        let searchTxt = $('#searchTxt').val()
        postApiCall('admin/city/getAll', {searchText: searchTxt, filter: filter, page: page})
            .then(data => {
                console.log('data from api admin/city/getAll', data,);
                if (data.meta.status) {

                    // let pagination = data.pagination;

                    //    setTotal(pagination.Total);
                    // setCurrent(pagination.curr);
                    // setNext(pagination.next);
                    // setprevious(pagination.prev);
                    // setTotalPage(pagination.length);
                    setCities(data.data.docs);
                    console.log('City Data Sets', data.data.docs);

                    setLoading(true);
                }
            })
            .catch(err => {
                console.log('data from api Erro', err);

                // if (err.response === undefined) {
                //     swal({ text: "API OFFLINE", icon: "warning", dangerMode: true });
                //     setLoading(false);
                //     return false;
                // }
                // let API_MESSAGE = err.response.data;
                // if (err.response.status === 400) {
                //     setLoading(false);
                //     swal({ text: API_MESSAGE.message, icon: "warning", dangerMode: true });
                // } else {
                //
                //     let data = <tr><td colSpan="4"><p className="text-center">{API_MESSAGE.message}</p></td></tr>
                //     if ($('#searchTxt').val() !== '') {
                //         setTableData(data);
                //         setLoading(false);
                //     }
                // }
            })
    }

    useEffect(() => {
        // get all active states list
        async function GetActiveStateList() {
            // await Axios.get(Constant.apiBasePath + 'admin/state/getAll', { headers: { authkey: getAccessToken } })

            getApiCall('admin/state/getAll')
                .then(data => {
                    if (data.meta.status) {
                        // if(stateList.length === 0){
                        let allStatesList = data.data.map((state) => {
                            return <option value={state._id} key={state._id}>{state.state}</option>
                        })
                        setStateList(allStatesList);
                    }

                })
                .catch(err => {
                    console.log('Error data from api admin/state/getAll', err);

                    // if (err.response === undefined) {
                    //     swal({ text: "API OFFLINE", icon: "warning", dangerMode: true });
                    //     return false;
                    // }
                    // let API_MESSAGE = err.response.data;
                    // if (err.response.status === 400) {
                    //     swal({ text: API_MESSAGE.message, icon: "warning", dangerMode: true });
                    // } else {
                    //     swal({ text: API_MESSAGE.message, icon: "warning", dangerMode: true });
                    // }
                })
        }

        if (isFilterError === false && isLoading === false) {
            console.log("useEffect");
            CALLAPI(1, '');
            GetActiveStateList();
        }

    }, []);

    // search Handler
    const searchHandler = (event) => {
        setSearchBoxText(event.target.value);
        CALLAPI(1, '');
    }

    // filter Handler
    const filterHandler = (event) => {
        // setSearchBoxText(event.target.value);
        //CALLAPI(1);
        let selectedValue = parseInt($('#filter').val());
        if (selectedValue === 2) {
            setFilterError(true);
            return false;

        } else if (selectedValue === 3) {
            setFilterError(false);
            CALLAPI(1, '');
        } else {
            console.log(selectedValue);
            setFilterError(false);
            CALLAPI(1, selectedValue);
        }
    }

    // pagination handler
    const paginationHandler = (page) => {
        let selectedValue = parseInt($('#filter').val());
        console.log(selectedValue);
        if (selectedValue === 2) {
            CALLAPI(page, 0);
        } else {
            CALLAPI(page, selectedValue);
        }
    }

    // update status handler
    const StatusHandler = async (url, postData) => {
        let data = await postApiCall(url, postData, true);
        console.log(data.status);
        if (data.status === "Success") {
            CALLAPI(1, '');
        }
    }

    let renderAllCities = '';
    console.log('allCities', allCities);

    if (isLoading === true) {
        if (allCities.length > 0) {
            // console.log(allCities);
            renderAllCities = allCities.map((city, index) => {
                let sNo = (current === 1) ? index + 1 : index + 1 + (current * 10 - 10);
                return <tr key={city._id}>
                    <th scope="row">{sNo}</th>
                    <td>{city.name}</td>
                    <td>{city.stateName}</td>
                    <td>{(city.status === 0) ? <span className="text-danger">Deactive</span> :
                        <span className="text-success">Active</span>}</td>
                    <td><EnableDisable id={city._id} status={city.status} apiurl={`admin/city/update/${city._id}/`}
                                       handler={StatusHandler}/>
                        <Link to={`/edit-city/${city._id}`}>
                            <button className="btn btn-secondary custom-round-icon"><i className="ti-pencil"></i>
                            </button>
                        </Link>
                    </td>
                </tr>;
            })
            setTableData(renderAllCities)
            setLoading(false);
        }
    }


    return (
        <>
            <div className="container-fluid">
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 className="h3 mb-0 text-gray-800">City Management</h1>
                    {/*<Link to="/property/add" className="d-sm-inline-block btn btn-sm btn-primary shadow-sm">*/}
                    {/*    Add New*/}
                    {/*</Link>*/}
                </div>
                <div className="card my-3">
                    <div className="card-body">
                        <h4 className="card-title">Filter</h4>
                        <h6 className="card-subtitle">Choose Enable/Disable
                        </h6>
                        <div className="row">
                            <div className="col-6">
                                <form className="mt-4">
                                    <div className="input-group">
                                        <select className="custom-select" id="filter">
                                            <option value="2">Choose...</option>
                                            <option value="1">Enable</option>
                                            <option value="0">Disable</option>
                                            <option value="3">Reset filter</option>
                                        </select>
                                        <div className="input-group-append">
                                            <button className="btn btn-primary" type="button"
                                                    onClick={(event) => filterHandler(event)}>Filter
                                            </button>
                                        </div>
                                        {(isFilterError) ?
                                            <div className="invalid-feedback d-block">{errorMessage}</div> : null}
                                    </div>

                                </form>
                            </div>

                        </div>

                    </div>
                    {/*end card-body */}

                </div>

                <div className="card shadow mb-4">
                    <div className="card-body">
                        <div className="card-body">
                            <div className="row">
                                <div className="form-group col-md-8 float-right">
                                    <input type="text" id="searchTxt" className="form-control col-6 float-right"
                                           defaultValue={searchBoxText} placeholder="Search by city name..."
                                           onChange={(event) => searchHandler(event)}/>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive mb-3">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th scope="col">Serial number</th>
                                    <th scope="col">City name</th>
                                    <th scope="col">State name</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Actions</th>
                                </tr>
                                </thead>
                                <tbody>{tableData}</tbody>
                            </table>
                            <Pagination prev={previous} current={current} next={next} pageCount={totalPage}
                                        handler={paginationHandler}/>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default CityListing