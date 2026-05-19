import React from 'react'

const Pagination = ({prev,current,next,pageCount,handler}) => {
    let buttonArr = []
    for(let i = 0; i < pageCount; i++){
        buttonArr.push(<button type="button" className="btn btn-secondary" onClick={()=>handler(i+1)}>{i+1}</button>)
    }
    return (
       <div >
       {(pageCount > 1) ? 
        <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
            <div className="btn-group mr-2 overflow-auto"  role="group" aria-label="First group">
               {buttonArr}
            </div>
            <div className="btn-group mr-2 mt-1" role="group" aria-label="Second group" >
                <button type="button" className="btn btn-primary disabled">Total pages : {pageCount}</button>
            </div>
        </div>
         :null} 
        </div>
      
    )
}

export default Pagination
