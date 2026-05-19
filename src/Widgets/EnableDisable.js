import React from 'react';

const EnableDisable = (props) => {
    const {id, status, apiurl, handler, postData} = props;
   // let dynamicClass = '';
   // let btnName = "";
   // let actionStatus = '';
    if (status === 0) {
        
      //  actionStatus = 1;

    } else {
    

      //  actionStatus = 0;

   }

    return (
<span>
        {status === 0 ?
        <button 
        onClick={() => handler(apiurl, postData)}
        
            className="btn btn-info btn-icon-split btn-sm  mb-1 mr-1"><span
            className="icon text-white-50"><i
            className="fas fa-exclamation-triangle"></i></span>
        </button>
        :
        <button className="btn btn-success btn-icon-split btn-sm mb-1 mr-1"
        onClick={() => handler(apiurl, postData)}       
        >
        <span className="icon text-white-50"><i
            className="fas fa-check"></i></span>
        </button>
    }

      </span>
       )
}

export default EnableDisable
