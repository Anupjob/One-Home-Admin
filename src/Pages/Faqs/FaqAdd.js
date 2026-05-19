import {Link} from "react-router-dom";
import React, {useEffect, useState} from "react";
import $ from "jquery";
import postApiCall from "../../Services/postApiCall";
import swal from "sweetalert";
import getApiCall from "../../Services/getApiCall";
import useGetRoleModule from '../../Services/useGetRoleModule';
import { notAllowedSpecialcharacter } from '../../Components/validationUtils'

export default function FaqAdd(props) {

    const [pageName, setPageName] = useState('');
    const [parentPage] = useState('Faqs');
    const [parentPageUrl] = useState('/faqs');
    // const[pageId,setPageId] = useState('');
    const [Question, setQuestion] = useState('');
    const [icon, setIcon] = useState('');
    const [Answer, setAnswer] = useState('');
    const [QuestionError, setQuestionError] = useState(false);
    const [iconError, setIconError] = useState(false);
    const [answerError, setanswerError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Required *");
    const [cats, setCats] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [permission, setPermission] = useState({})


    

    useEffect(() => {
        
        let id = props.match.params.id;
        console.log('id--1', id);
        if (id !== undefined) {
            setPageName("Edit faqs");
            getApiCall('common/faq/details/'+id).then((data) => {
                console.log('data', data);
                if (data.meta.status) {
                    setInput(data.data);
                }
            })

        } else {
            setPageName("Add faqs");
        }

        async function GetRole() {
            let Role = await useGetRoleModule("FAQ");
            if(Role.moduleList.read === false){
                setPermission({moduleAccress : false, moduleList:{}, message:"Module Need Some Permission...Pls contact with Your Partner"})
            }else{
                getCats();
                setPermission(Role) 
            }  
        }

        GetRole()
        // get data with id


    }, []);


    function getCats() {
        getApiCall('common/faq/category/list', {
        })
            .then((response) => {
                if (response.meta.msg && response.data) {
                    setCats(response.data)
                }
            })
    }


    const handleChange = (e) => {
        if (e.target.id === 'question') {
            setQuestion(notAllowedSpecialcharacter(e.target.value));
        } else if (e.target.id === 'Answer') {
            setAnswer(notAllowedSpecialcharacter(e.target.value))
        }else if (e.target.id === 'categoryId') {
            setCategoryId(e.target.value)
        }
    }

    const validator = async event => {
        if ($('#banner').val() === '') {
            setQuestionError(true);
            setErrorMessage("banner Question required *");
            var $el = $('#iconImage');
            $el.wrap('<form>').closest('form').get(0).reset();
            $el.unwrap();
            return false;
        } else {
            setQuestionError(false);
            setErrorMessage("");
        }
    }

    // set input value
    const setInput = (data) => {
        setQuestion(data.question)
        setAnswer(data.answer)
        setCategoryId(data.categoryId)
    }


    // false pass when no need to return data, if true function return data {status,message,data}
    const Save = async (url, form_data) => {
        postApiCall(url, form_data)
            .then((data) => {
                if (data.meta.status) {
                    props.history(parentPageUrl)
                    swal({text: data.meta.msg, icon: "success", timer: 1500});
                }
            });
    }

    // false pass when no need to return data, if true function return data {status,message,data}
    const Update = async (url, form_data) => {
         postApiCall(url, form_data)
             .then((data) => {
                 if (data.meta.status) {
                     props.history(parentPageUrl)
                     swal({text: data.meta.msg, icon: "success", timer: 1500});
                 }
             });
    }


    const handleSubmit = async event => {
        setQuestionError(false);
        setanswerError(false);
        event.preventDefault();
        let id = props.match.params.id;
        if (id === undefined) {

            if ($('#question').val() === '') {
                setErrorMessage("question required *");
                setQuestionError(true);
                return false;
            } else {
                setErrorMessage("");
                setQuestionError(false);
            }

            if ($('#Answer').val() === '') {
                setErrorMessage("Answer required *");
                setanswerError(true);
                return false;
            } else {
                setErrorMessage("");
                setanswerError(false);
            }

            // save data into db
            Save('common/faq/create', {"question": $('#question').val(), answer: $('#Answer').val(),categoryId:categoryId});
        } else {
            Update(`common/faq/update/`, {"question": $('#question').val(), answer: $('#Answer').val(), "faqId": id, categoryId:categoryId})
        }
    }


    return <>
        
        {/* **************core-container************ */}
        <div className="container-fluid">
        { Object.keys(permission).length > 0 ? 
                permission.role == "partner" && (permission.moduleList[props.match.params.id != null ? "update" : "create"] == undefined || permission.moduleList[props.match.params.id != null ? "update" : "create"] == false) ?
                    <div className="row text-center">
                        <div className="col-sm-12 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
                            <div className="errer">
                                <img src="/program-error.png"/>
                                <h2>403</h2>
                                {/* <h4 className="text-danger">{permission.message}</h4> */}
                                <p>Module Need Some Permission</p>

                            </div>
                        </div>
                    </div>
                    :
                    (Object.keys(permission).length > 0) ? <>
        <div className="main-title">
            <h3>FAQs </h3>
                </div>
        <div className="page-breadcrumb mb-4">
            <div className="row">
                <div className="col-6 align-self-center">
                    <div className="d-flex align-items-center">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb m-0 p-0">
                                <li className="breadcrumb-item"><Link
                                    to={parentPageUrl}>{parentPage} Management</Link>
                                </li>
                                <li className="breadcrumb-item">{pageName}
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">

                            <form onSubmit={(event) => handleSubmit(event)}>
                                <div className="form-body">
                                    <div className="row">
                                        <div className="col-12 col-xs-6 col-md-6 col-lg-6">
                                            <div className="form-group">
                                                <label>Select Categories</label>
                                                <select className="form-control" name="parentId" id="categoryId" value={categoryId} onChange={(e) => handleChange(e)}>
                                                    <option value="">Select</option>
                                                    {cats.map((parentCat) => (
                                                        <option value={parentCat.categoryId} key={parentCat.categoryId}>{parentCat.categoryName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Question</label>
                                                <input type="text" className="form-control" placeholder="Question"
                                                       id="question" onChange={(e) => handleChange(e)}
                                                       value={Question}/>
                                                {(QuestionError === true) ? <div
                                                    className="invalid-feedback d-block">{errorMessage}</div> : null}
                                            </div>
                                        </div>
                                    </div>
                                    {/*row */}


                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Answer</label>
                                                <textarea className="form-control" rows="3" placeholder="Answer..."
                                                          id="Answer" onChange={(e) => handleChange(e)}
                                                          value={Answer}></textarea>
                                                {(answerError === true) ? <div
                                                    className="invalid-feedback d-block">{errorMessage}</div> : null}

                                            </div>
                                        </div>
                                    </div>
                                    {/*row */}


                                </div>
                                <div className="form-actions">
                                    <div className="">
                                        <button type="submit" className="btn btn-warning">Submit</button>
                                        {/*<button type="reset" className="btn btn-dark">Reset</button>*/}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div></> : null : null }
        </div>
    </>
}