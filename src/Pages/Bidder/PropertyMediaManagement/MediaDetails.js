import React, { useEffect, useRef, useState } from 'react'
import postApiCall from '../../../Services/postApiCall';
import { blobUrl } from "../../../Services/helpers";
import { useParams } from 'react-router';
import swal from 'sweetalert';

const MediaDetails = (props) => {
    let {id} = useParams();
    const [images, setImages] = useState([])
    const [videos, setVideos] = useState([])
    const [activeTab, setActiveTab] = useState('All')
    const [selectCategory, setSelectedCategory] = useState('All')
    const [selectedAllImage, setSelectedAllImage] = useState([])
    const [pendingImages, setpendingImages] = useState([])
    const [approvedImages, setapprovedImages] = useState([])
    const [rejectedImages, setrejectedImages] = useState([])
    const [bannerImages, setBannerImages] = useState([])
    const [pendingVideos, setPendingVideos] = useState([])
    const [approvedVideos, setApprovedVideos] = useState([])
    const [rejectedVideos, setRejectedVideos] = useState([])
    const [selectedImage, setSelectedImage] = useState('')
    const [selectedVideo, setSelectedVideo] = useState('')
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        getMediaDetailById();
    }, [])

    async function getMediaDetailById() {
        let response = await postApiCall('admin/media-management/getMediaDetailsById', { id: id })
        if (response.meta.status) {
            setMedia(response.data);
        }
    }

    function setMedia(data) {
        const newCategory = data.categories;
        const merged = newCategory.reduce((acc, obj) => {
            // If the title already exists in the accumulator, merge the images
            if (acc[obj.title]) {
              acc[obj.title].images = [...new Set([...acc[obj.title].images, ...obj.images])];
            } else {
              // If the title doesn't exist, add the object to the accumulator
              acc[obj.title] = { ...obj };
            }
            return acc;
          }, {});
       const optimisedArray = Object.values(merged);


        setImages(optimisedArray)
        if (data.videoUrls.length) {
            setVideos(data.videoUrls)
            let pendingvideos = data.videoUrls.filter((obj) => obj.status == 'pending')
            let approvevideos = data.videoUrls.filter((obj) => obj.status == 'approved')
            let rejectedvideos = data.videoUrls.filter((obj) => obj.status == 'rejected')
            setSelectedVideo(data.videoUrls[0])
            setPendingVideos(pendingvideos)
            setApprovedVideos(approvevideos)
            setRejectedVideos(rejectedvideos)
        }
        arrangeImages(optimisedArray)

    }
    function arrangeImages(data) {
        let images = [];
        let pendingImages = [];
        let approvedImages = [];
        let rejectedImages = [];
        let bannerImages = [];
        data.map((res) => {
            res.images.length && res.images.map((obj) => {
                if (obj.status === 'pending' && obj.url != '') {
                    pendingImages.push(obj)
                } else if (obj.status === 'approved' && obj.url != '') {
                    approvedImages.push(obj)
                } else if (obj.status == 'rejected' && obj.url != '') {
                    rejectedImages.push(obj)
                }
                if (obj.isBannerImage == true && obj.url != ''){
                    bannerImages.push(obj)
                }
                images.push(obj)
            })

        })
        if(pendingImages.length){
            setSelectedImage(pendingImages[0]) //change logic
        }else if(approvedImages.length && !pendingImages.length && !rejectedImages.length){
            setSelectedImage(approvedImages[0]) //change logic
     
        }else if(rejectedImages.length && !pendingImages.length && approvedImages.length){
            setSelectedImage(rejectedImages[0]) //change logic
     
        }
        setSelectedAllImage(images)
        setpendingImages(pendingImages)
        setapprovedImages(approvedImages)
        setrejectedImages(rejectedImages)
        setBannerImages(bannerImages)
    }

    const onCategoryChange = (type) => {
        setSelectedCategory(type)
        if (type != 'All') {
            let categoryImage = images.filter((obj) => obj.title === type)
            arrangeImages(categoryImage)
        } else {
            arrangeImages(images)
        }

    }
    function changePayload(data, status) {
        let mediaData = [];
        let newobj = {
            "mediaId": "",
            "status": ""
        }
        data.map((res) => {
            newobj = {
                "mediaId": res._id,
                "status": status
            }
            mediaData.push(newobj)
        })
        return mediaData
    }
    const aproveRejectImage = async (type) => {
        let payload = {};
        if (type == 'Approve') {
            if (selectedImages.length > 1) {
                let mainArray = changePayload(selectedImages, 'approved')
                payload = {
                    "isVideoStatusUpdate": false,
                    "mediaUpdateArray": mainArray
                }
            } else {
                payload = {
                    "isVideoStatusUpdate": false,
                    "mediaId": selectedImage._id,
                    "status": "approved"
                }
            }


        } else {
            if (selectedImages.length >1) {
                let mainArray = changePayload(selectedImages, 'rejected')
                payload = {
                    "isVideoStatusUpdate": false,
                    "mediaUpdateArray": mainArray
                }
            } else {
                payload = {
                    "isVideoStatusUpdate": false,
                    "mediaId": selectedImage._id,
                    "status": "rejected"
                }
            }

        }
        if (selectedImages.length > 1) {
            let response = await postApiCall('admin/media-management/bulkUpdateMediaStatus', payload, true)
            if (response.meta.status) {
                setSelectedImages([])
                setSelectedVideos([])
                getMediaDetailById();
                swal({ text: response.meta.msg, icon: "success" });
            } else {
                swal({ text: response.meta.msg, icon: "warning", dangerMode: true });
            }
        } else {
            let response = await postApiCall('admin/media-management/updateMediaStatus', payload, true)
            if (response.meta.status) {
                setSelectedImages([])
                setSelectedVideos([])
                getMediaDetailById();
                swal({ text: response.meta.msg, icon: "success" });
            } else {
                swal({ text: response.meta.msg, icon: "warning", dangerMode: true });
            }
        }

    }
    const markAsBannerImage = async (markBannerImage) => {
        let payload = {};
        
        if(selectedImages.length>0){
            payload = {
                "markAsBannerImage": markBannerImage,
                "imageId": selectedImages[0]._id,
            }
        }else {
            payload = {
                "markAsBannerImage": markBannerImage,
                "imageId": selectedImage._id,
            }
        }
            let response = await postApiCall('admin/media-management/markAsBannerImage', payload, true)
            if (response.meta.status) {
                setSelectedImages([])
                getMediaDetailById();
                swal({ text: response.meta.message, icon: "success" });
            } else {
                swal({ text: response.meta.message, icon: "warning", dangerMode: true });
            }
         

    }
    const aproveRejectVedio = async (type) => {
        let payload = {};
        if (type == 'Approve') {
            payload = {
                "isVideoStatusUpdate": true,
                "mediaId": selectedVideo._id,
                "status": "approved"
            }

        } else {
            payload = {
                "isVideoStatusUpdate": true,
                "mediaId": selectedVideo._id,
                "status": "rejected"
            }
        }
        let response = await postApiCall('admin/media-management/updateMediaStatus', payload, true)
        if (response.meta.status) {
            setSelectedImages([])
            setSelectedVideos([])
            getMediaDetailById();
            swal({ text: response.meta.msg, icon: "success" });
        } else {
            swal({ text: response.meta.msg, icon: "warning", dangerMode: true });
        }

    }
    const scrollRight = () => {
        containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    };

    const scrollLeft = () => {
        containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    };

    const handleSelectImage = (image) => {
        if (selectedImages.includes(image)) {
            setSelectedImages(selectedImages.filter((img) => img !== image));
        } else {
            setSelectedImages([...selectedImages, image]);
        }
    };

    const handleSelectVideo = (video) => {
        if (selectedVideos.includes(video)) {
            setSelectedVideos(selectedVideos.filter((img) => img !== video));
        } else {
            setSelectedVideos([...selectedVideos, video]);
        }
    }
    const isSelected = (image) => selectedImages.includes(image);
    const isvideoSelected = (video) => selectedVideos.includes(video);
    const setActivedTab = (type) => {
        setActiveTab(type)
        if (type === 'All') {
            images.length ? setSelectedImage(images[0]) : <></>
            videos.length ? setSelectedVideo(videos[0].url) : <></>
        } else if (type == 'Pending') {
            pendingImages.length ? setSelectedImage(pendingImages[0]) : <></>
            pendingVideos.length ? setSelectedVideo(pendingVideos[0].url) : <></>
        } else if (type == 'Approved') {
            approvedImages.length ? setSelectedImage(approvedImages[0]) : <></>
            approvedVideos.length ? setSelectedVideo(approvedVideos[0].url) : <></>
        } else if (type == 'Rejected') {
            rejectedImages.length ? setSelectedImage(rejectedImages[0]) : <></>
            rejectedVideos.length ? setSelectedVideo(rejectedVideos[0].url) : <></>
        }
    }
    return (
        <div>
      
              <div className="main-title">
          <h3>&nbsp; Media Details &nbsp;( {id} )</h3>
        </div>
            {
                images.length ?
                    <div className="containers122">
                     
                        <div className="header112">
                            <h4>Images</h4>
                            {/* <label><img src="Tooltip.jpg" /></label> */}
                        </div>
                        <hr className='hrclass'/>
                        <div className="set">
                            <div className="section-tabs" style={{ zIndex: 1}}>
                                <div className={selectCategory == 'All' ? 'section-tab active' : 'section-tab'} onClick={() => onCategoryChange('All')}>All</div>
                                {
                                    images.length && images.map((res) => {
                                        return (
                                            <div className={selectCategory == res.title ? 'section-tab active' : 'section-tab'} onClick={() => onCategoryChange(res.title)}>{res.title}</div>
                                        )
                                    })
                                }

                            </div>

                            {
                                (activeTab == 'All' && images.length > 0) ||
                                    (activeTab == 'Pending' && pendingImages.length > 0) ||
                                    (activeTab == 'Approved' && approvedImages.length > 0) ||
                                    (activeTab == 'Rejected' && rejectedImages.length > 0) ?
                                    <div className="right1">
                                        <button className="section-tab" onClick={() => markAsBannerImage(true)}>Make Banner Image</button>
                                        <button className="section-tab" onClick={() => aproveRejectImage('Approve')}>Approve</button>
                                        <button className="section-tab" onClick={() => aproveRejectImage('Reject')}>Reject</button>
                                    </div>
                                    : <></>
                            }

                        </div>
                      
                        {
                            (activeTab == 'All' && images.length > 0) ||
                                (activeTab == 'Pending' && pendingImages.length > 0) ||
                                (activeTab == 'Approved' && approvedImages.length > 0) ||
                                (activeTab == 'Rejected' && rejectedImages.length > 0) ?
                                <div style={{ display: 'flex', justifyContent: 'center',marginTop:'-35px' }}>
                                    <img src={blobUrl(selectedImage?.url)} className='selectedImage' style={{
                                        marginLeft: '-160px',
                                        marginTop: '10px', // Add space below the button
                                        maxHeight: '300px', // Adjust the max height as needed
                                        objectFit: 'contain' // Ensures the image is scaled properly without distorting its aspect ratio
                                      }} />
                                </div>
                                : <></>

                        }
                        <div className="rejected-image">
                            <hr  className='hrclass'/>
                            <h5>Pending Images</h5>
                            <div className="scroll-wrapper">
                            {
                                    pendingImages.length > 10?
                                    <button onClick={()=> scrollLeft()} className="scroll-btn prev">
                                    ❮
                                  </button>
                                :<></>
                                }
                          
                         
                                <div className="image-container" ref={containerRef}>
                                    {
                                        pendingImages.length && (activeTab == 'Pending' || activeTab == 'All') ?
                                            pendingImages.map((res, index) => {
                                                return (
                                                    <>
                                                        <div key={index}
                                                            className={`image-item ${isSelected(res) ? 'selected' : ''}`}>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    name="imageSelect"
                                                                    value={res}
                                                                    checked={isSelected(res)}
                                                                    onChange={() => handleSelectImage(res)}
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className='image-container_in'>
                                                            <img src={blobUrl(res?.url)} className='preview__video_media' onClick={() => setSelectedImage(res)} />
                                                            {/* <div class="overlay_img"></div> */}
                                                            {
                                                                selectedImage?._id == res?._id ?
                                                                    <img src="../../assets/images/eye.png" alt="Foreground Image 1" class="foreground-image" />
                                                                    : <></>
                                                            }
                                                        </div>
                                                    </>
                                                )
                                            })
                                            : <>No Pending Images Available</>
                                    }
                                </div>
                                {
                                    pendingImages.length > 10?
                                    <button onClick={()=> scrollRight()} className="scroll-btn next" style={{ left: "98%"}}>
                                    ❯
                                  </button>
                                :<></>
                                }
                          
                            </div>
                            </div>

                        <hr  className='hrclass'/>
                        <div className="rejected-image">
                            <h5>Approved Images</h5>
                            <div className="scroll-wrapper">
                                {
                                    approvedImages.length > 10 ?
                                    <button onClick={()=> scrollLeft()} className="scroll-btn prev">
                                    ❮
                                  </button>
                                  :
                                  <></>

                                }
                         
                                <div className="image-container" ref={containerRef}>

                                    {
                                        approvedImages.length && (activeTab == 'Approved' || activeTab == 'All') ?
                                            approvedImages.map((res, index) => {
                                                return (
                                                    <>
                                                        <div key={index}
                                                            className={`image-item ${isSelected(res) ? 'selected' : ''}`}>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    name="imageSelect"
                                                                    value={res}
                                                                    checked={isSelected(res)}
                                                                    onChange={() => handleSelectImage(res)}
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className='image-container_in'>
                                                            <img src={blobUrl(res?.url)} className='preview__video_media' onClick={() => setSelectedImage(res)} />
                                                            {
                                                                selectedImage?._id == res?._id ?
                                                                    <>
                                                                        <img src="../../assets/images/eye.png" alt="Foreground Image 1" class="foreground-image" />
                                                                    </>
                                                                    : <></>
                                                            }
                                                        </div>
                                                    </>
                                                )
                                            })
                                            : <>No Approved Images</>
                                    }
                                </div>
                                {
                                     approvedImages.length > 10 ?
                                     <button onClick={()=> scrollRight()} className="scroll-btn next" style={{ left: "98%"}}>
                                     ❯
                                   </button>
                                   :
                                   <></>
                                }
                          
                            </div>

                        </div>

                        <hr  className='hrclass'/>
                        <div className="rejected-image">
                            <h5>Rejected Images</h5>
                            <div className="scroll-wrapper">
                            {
                                    rejectedImages.length > 10 ?
                                    <button onClick={()=>scrollLeft()} className="scroll-btn prev">
                                    ❮
                                  </button>
                                  :
                                  <></>

                                }
                                <div className="image-container" ref={containerRef}>

                                    {
                                        rejectedImages.length && (activeTab == 'Rejected' || activeTab == 'All') ?
                                            rejectedImages.map((res, index) => {
                                                return (
                                                    <>
                                                        <div key={index}
                                                            className={`image-item ${isSelected(res) ? 'selected' : ''}`}>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    name="imageSelect"
                                                                    value={res}
                                                                    checked={isSelected(res)}
                                                                    onChange={() => handleSelectImage(res)}
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className='image-container_in'>
                                                            <img src={blobUrl(res?.url)} className='preview__video_media' onClick={() => setSelectedImage(res)} />
                                                            {
                                                                selectedImage?._id == res?._id ?
                                                                    <>
                                                                        <div class="overlay_img"></div>
                                                                        <img src="../../assets/images/eye.png" alt="Foreground Image 1" class="foreground-image" />
                                                                    </>
                                                                    : <></>
                                                            }
                                                        </div>
                                                    </>
                                                )
                                            })
                                            : <>No Rejected Images Available</>
                                    }
                                </div>
                                {
                                     rejectedImages.length > 10 ?
                                     <button onClick={()=> scrollRight()} className="scroll-btn next" style={{ left: "98%"}}>
                                     ❯
                                   </button>
                                   :
                                   <></>
                                }
                          
                            </div>
                        </div>

                        <hr  className='hrclass'/>
                        <div className="rejected-image">
                            <h5>Banner Images</h5>
                            <div className="scroll-wrapper">
                            {
                                    bannerImages.length > 10 ?
                                    <button onClick={()=>scrollLeft()} className="scroll-btn prev">
                                    ❮
                                  </button>
                                  :
                                  <></>

                                }
                                <div className="image-container">

                                    {
                                        bannerImages.length && (activeTab == 'Rejected' || activeTab == 'All') ?
                                            bannerImages.map((res, index) => {
                                                return (
                                                    <>
                                                        <div key={index}
                                                            className={`image-item ${isSelected(res) ? 'selected' : ''}`}>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    name="imageSelect"
                                                                    value={res}
                                                                    checked={isSelected(res)}
                                                                    onChange={() => handleSelectImage(res)}
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className='image-container_in'>
                                                            <img src={blobUrl(res?.url)} className='preview__video_media' onClick={() => setSelectedImage(res)} />
                                                            {
                                                                selectedImage?._id == res?._id ?
                                                                    <>
                                                                        {/* <div class="overlay_img"></div> */}
                                                                        <img src="../../assets/images/eye.png" alt="Foreground Image 1" class="foreground-image" />
                                                                    </>
                                                                    : <></>
                                                            }
                                                        </div>
                                                    </>
                                                )
                                            })
                                            : <>No Banner Images Available</>
                                    }
                                </div>
                                {
                                     rejectedImages.length > 10 ?
                                     <button onClick={()=> scrollRight()} className="scroll-btn next" style={{ left: "98%"}}>
                                     ❯
                                   </button>
                                   :
                                   <></>
                                }
                          
                            </div>
                        </div>

                    </div>
                    : <></>
            }
            {
                (activeTab == 'All' && videos.length > 0) ||
                    (activeTab == 'Pending' && pendingVideos.length > 0) ||
                    (activeTab == 'Approved' && approvedVideos.length > 0) ||
                    (activeTab == 'Rejected' && rejectedVideos.length > 0) ?
                    <div className="containers12">
                        <div className="header112">
                            <h4>Videos</h4>
                            {/* <label><img src="Tooltip.jpg" /></label> */}
                        </div>
                        <hr  className='hrclass'/>
                       <div>
                       {

(activeTab == 'All' && videos.length > 0) ||
    (activeTab == 'Pending' && pendingVideos.length > 0) ||
    (activeTab == 'Approved' && approvedVideos.length > 0) ||
    (activeTab == 'Rejected' && rejectedVideos.length > 0) ?
    <div className="right1">
        <button className="section-tab" onClick={() => aproveRejectVedio('Approve')} >Approve</button>
        <button className="section-tab" onClick={() => aproveRejectVedio('Reject')} >Reject</button>
    </div>
    : <></>
}
                        </div>
                        {
                             <div style={{ display: 'flex', justifyContent: 'center',marginTop: '-52px' }}>
                                   <video  key={selectedVideo?.url}  width="320" height="240" controls className='selectedVideo'>
                                        <source src={blobUrl(selectedVideo?.url)} type="video/mp4" />
                                    </video>
                                </div>
                         
                        }
                        <hr  className='hrclass'/>
                               <div>
                                    <h5>Pending Videos</h5>
                                </div>
                       
                         <div className="scroll-wrapper">
                     
                                <div className="image-container" ref={containerRef}>
                                    {
                                        pendingVideos.length && (activeTab == 'Pending' || activeTab == 'All') ?
                                        pendingVideos.map((res, index) => {
                                                return (
                                                    <>
                                                        <div key={index}
                                                            className={`image-item1 ${isSelected(res) ? 'selected' : ''}`}>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    name="vedioSelect"
                                                                    value={res}
                                                                    checked={isvideoSelected(res)}
                                                                    onChange={() => handleSelectVideo(res)}
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className='image-container_in'>
                                                        {res?.url ? 
                                                     <>
                                                    <video width="100" height="100" className="preview__video_media1" onClick={() => setSelectedVideo(res)}>
                                                        <source src={blobUrl(res?.url)} type="video/mp4" />
                                                    </video>
                                                    </>
                                                    :
                                                    <>                                                    
                                                    <video width="100" height="100" controls className="preview__video_media1"  onClick={() => setSelectedVideo(res)}>
                                                    <source src={blobUrl(res?.url)} type="video/mp4" />
                                                </video>
                                                </>
                                        }
                                                            {
                                                                selectedVideo._id == res._id ?
                                                                    <img src="../../assets/images/eye.png" alt="Foreground Image 1" class="foreground-image1" />
                                                                    : <></>
                                                            }
                                                        </div>
                                                    </>
                                                )
                                            })
                                            : <>No Pending Images Available</>
                                    }
                                </div>
                             
                            </div>
                
                        <hr  className='hrclass'/>
                        {
                            (activeTab == 'All' || activeTab == 'Approved') ?
                                <div>
                                    <h5>Approved Videos</h5>
                                </div>
                                : <></>
                        }
                         <div className="scroll-wrapper">
                     
                     <div className="image-container" ref={containerRef}>
                         {
                             approvedVideos.length  ?
                             approvedVideos.map((res, index) => {
                                     return (
                                         <>
                                             <div key={index}
                                                 className={`image-item1 ${isSelected(res) ? 'selected' : ''}`}>
                                                 <label>
                                                     <input
                                                         type="checkbox"
                                                         name="vedioSelect"
                                                         value={res}
                                                         checked={isvideoSelected(res)}
                                                         onChange={() => handleSelectVideo(res)}
                                                     />
                                                 </label>
                                             </div>
                                             <div className='image-container_in'>
                                             {res?.url ? 
                                          <>
                                         <video width="100" height="100" className="preview__video_media1" onClick={() => setSelectedVideo(res)}>
                                             <source src={blobUrl(res?.url)} type="video/mp4" />
                                         </video>
                                         </>
                                         :
                                         <>                                                    
                                         <video width="100" height="100" controls className="preview__video_media1"  onClick={() => setSelectedVideo(res)}>
                                         <source src={blobUrl(res?.url)} type="video/mp4" />
                                     </video>
                                     </>
                             }
                                                 {
                                                     selectedVideo?._id == res?._id ?
                                                         <img src="../../assets/images/eye.png" alt="Foreground Image 1" class="foreground-image1" />
                                                         : <></>
                                                 }
                                             </div>
                                         </>
                                     )
                                 })
                                 : <>No Approved Images Available</>
                         }
                     </div>
                  
                 </div>
                        <hr  className='hrclass'/>
                        {
                            (activeTab == 'All' || activeTab == 'Rejected') ?
                                <div className="approve-image">
                                    <h5>Rejected Videos</h5>
                                    <div className="scroll-wrapper">
                     
                     <div className="image-container" ref={containerRef}>
                         {
                             rejectedVideos.length  ?
                             rejectedVideos.map((res, index) => {
                                     return (
                                         <>
                                             <div key={index}
                                                 className={`image-item1 ${isSelected(res) ? 'selected' : ''}`}>
                                                 <label>
                                                     <input
                                                         type="checkbox"
                                                         name="vedioSelect"
                                                         value={res}
                                                         checked={isvideoSelected(res)}
                                                         onChange={() => handleSelectVideo(res)}
                                                     />
                                                 </label>
                                             </div>
                                             <div className='image-container_in'>
                                             {res?.url ? 
                                          <>
                                         <video width="100" height="100" className="preview__video_media1" onClick={() => setSelectedVideo(res)}>
                                             <source src={blobUrl(res?.url)} type="video/mp4" />
                                         </video>
                                         </>
                                         :
                                         <>                                                    
                                         <video width="100" height="100" controls className="preview__video_media1"  onClick={() => setSelectedVideo(res)}>
                                         <source src={blobUrl(res?.url)} type="video/mp4" />
                                     </video>
                                     </>
                             }
                                                 {
                                                     selectedVideo?._id == res?._id ?
                                                         <img src="../../assets/images/eye.png" alt="Foreground Image 1" class="foreground-image1" />
                                                         : <></>
                                                 }
                                             </div>
                                         </>
                                     )
                                 })
                                 : <>No Rejected Images Available</>
                         }
                     </div>
                  
                 </div>

                                </div>
                                : <></>
                        }
                    </div>
                    : <></>
            }

        </div>
    )
}
export default MediaDetails