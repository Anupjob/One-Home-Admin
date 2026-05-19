import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom';
import getApiCall from "../../Services/getApiCall";
import postApiCall from "../../Services/postApiCall";

function LeadComments() {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const history = useNavigate();
    let {id} = useParams();


    async function submit() {
        if (!comment) {
            alert("Comment required..!!")
            return false;
        }
        let response = await postApiCall("common/send-enquiry/comment", {
            contactUsId: id,
            comment: comment
        }, true);
        if (response.meta.status) {
            alert(response.meta.msg)
            getList();
        } else {
            alert(response.meta.msg)
        }
    }


    async function getList() {
        let response = await getApiCall(`common/send-enquiry/details/` + id);
        setComments(response.data.comments);
    }


    useEffect(() => {
        getList();
    }, [])


    return (
        <div className='container-fluid'>
            <h3> Lead Communications </h3>
            <div className='form-group mt-5'>
                <textarea id="comments" name="comments" rows="4" cols="50" placeholder='Enter Comments'
                          style={{width: "500px", border: 'none'}}
                          onChange={(e) => setComment(e.target.value)}>{comment}</textarea>
            </div>
            <div>
                <button type="submit" className="btn btn-info" onClick={() => submit()}>Submit</button>
            </div>

            <div className="table-responsive mt-4">
                <table className="table table-bordered" width="100%" cellSpacing="0">
                    <thead>
                    <tr>
                        <th>Comments</th>
                    </tr>
                    </thead>

                    <tbody>
                    {comments.map((item, index) => {
                        return <tr key={index}>
                            <td>{item}</td>
                        </tr>
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default LeadComments