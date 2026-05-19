import React from 'react'

const DeleteBtn = ({id, handler}) => {
    return (
        <button  id={id}  onClick={() => handler()} 
            className="btn btn-danger btn-icon-split btn-sm mb-1">
            <span className="icon text-white-50">
                <i className="far fa-eye"></i>
            </span>
        </button>
    )
}

export default DeleteBtn
