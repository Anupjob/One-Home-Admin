import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom';
import $ from 'jquery';
import postApiCall from "../../Services/postApiCall";
import getApiCall from "../../Services/getApiCall";

const FaqAdd = (props) => {
    //state variables
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


    const handleChange = (e) => {
        if (e.target.id === 'question') {
            setQuestion(e.target.value);
        } else if (e.target.id === 'Answer') {
            setAnswer(e.target.value)
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
    }


    // false pass when no need to return data, if true function return data {status,message,data}
    const Save = async (url, form_data) => {
        await postApiCall(url, form_data, false);
    }

    // false pass when no need to return data, if true function return data {status,message,data}
    const Update = async (url, form_data) => {
        await postApiCall(url, form_data, false);
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
            Save('admin/faqs/create', {"question": $('#question').val(), answer: $('#Answer').val()});
        } else {
            Update(`admin/faqs/update/${id}`, {"question": $('#question').val(), answer: $('#Answer').val()})
        }
    }

    useEffect(() => {
        let id = props.match.params.id;
        let token = localStorage.getItem('loginDetails');
        let getDetails = JSON.parse(token);

        // get data with id
        const GetData = async (id) => {
            let returnData = await getApiCall(`admin/faqs/get/${id}`);
            setInput(returnData.data)
        }

        if (id !== undefined) {
            setPageName("Edit faqs");
            GetData(id, getDetails.accessToken);

        } else {
            setPageName("Add faqs");
        }

        return () => {
        }
    }, [props]);

    return (
        <div>
            <div className="page-breadcrumb">
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
            {/* **************core-container************ */}
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card mt-3">
                            <div className="card-body">

                                <form onSubmit={(event) => handleSubmit(event)}>
                                    <div className="form-body">
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
                                                <div class="form-group">
                                                    <label>Answer</label>
                                                    <textarea class="form-control" rows="3" placeholder="Answer..."
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
                                            <button type="submit" className="btn btn-info">Submit</button>
                                            <button type="reset" className="btn btn-dark">Reset</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default FaqAdd
