import React, { useState } from 'react'
import getApiCall from "../../../Services/getApiCall";
import {blobUrl} from "../../../Services/helpers";

const Access_Property = () => {
const [prospectId, setProspectId] = useState('');
const [categoriesData,setCategoriesData] = useState([]);
const [noData,setNoData] = useState(false);
{/* <h3>Check Your Prospect No. !</h3> */}
  
const submitForImage = ()=>{
    setCategoriesData([])
    getApiCall(`user/property/media/${prospectId}`).then((response) => {
        if (response.meta.status && response.data) {
            let options = response.data.propertyMedias;
            setCategoriesData(options)
        }
        else{
            setNoData(true)
        }
    });
}
    return (
        <div>
            <div className="col-12 col-xs-4 col-md-4 col-lg-4">
                <div className="form-group">
                    <label>Prospect Number *</label>
                    <input type="text" name="prospectId" className="form-control" onChange={(e)=> setProspectId(e.target.value)}
                        value={prospectId} required={true} />
                </div>
            </div>
            <button type="submit"
                className="btn btn-md btn-primary shadow-sm  ml-2" onClick={()=>submitForImage()}> Submit</button>
{
    categoriesData.length ?
    <>
    <div className="col-12 my-2">
    <div className="card shadow-none">
        <div className="card-header pl-0">
        <h5 className="card-title mb-0"> Property Images</h5>
        </div>
        <div className="card-body">
        {categoriesData.map((res)=>{
            return (
                res.categories.map((category, index) => {
                    return (<div className="card my-2" key={category.title}>
                        <div className="card-body">
                            <h5 className="card-title text-center">{category.title}</h5>
                            <div className="img-preview">
                                {category.images.map((item, index) => (
                                    <div className="img-preview__access" key={index}>
                                        <img src={blobUrl(item)} alt
                                             className="img-preview__image"/>
                                              {/* <a className={"btn btn-link m-2"} href={blobUrl(item)}
                                   target="_blank"></a> */}
                                    </div>))}
                            </div>

                        </div>

                    </div>)
                })
            )
        })
    }
      
        </div>
    </div>

</div>
    <div className="col-12">
    <div className="card shadow-none">
        <div className="card-header pl-0">
            <h5 className="card-title mb-0">House Tour Video</h5>
        </div>
        <div className="card-body">
        {categoriesData.map((res)=>{
            return(
                res.videoUrls?.length && res.videoUrls.map((vedioRes)=>{
                    return(
                        <video width="320" height="240" controls className="preview__video">
                                                        <source src={blobUrl(vedioRes)} type="video/mp4" />
                                                       
                                                    </video>
                    )
                })
            )
        })
                                            
                                        }
        </div>
    </div>
</div>
</>

    : noData ?
    <>
    <h6>Check your Prospect Id</h6></>
    :<></>
}
        </div>
    )
}
export default Access_Property
