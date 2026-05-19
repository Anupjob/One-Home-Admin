import Axios from "axios";
import swal from 'sweetalert';
import Constant from "../Components/Constant";
import loginUser from "./loginUser";
import {toast} from "react-toastify";

export default function putApiCall(Url, bodyData, isReturn) {
    let { accessToken } = loginUser();
    return new Promise((resolve, reject) => {
        Axios.put(Constant.apiBasePath + Url,bodyData,{ headers: { authkey: accessToken }})
            .then(data => {
                // console.log('Put api service success',  data.data.meta);
                if(!data.data.meta.status){
                    swal({ text: data.data.meta.msg, icon: "warning", dangerMode: true });
                }
                return resolve(data.data);
            })
            .catch(err => {
                if(err.response.status === 401){
                    localStorage.clear();
                    localStorage.clear();
                    window.location.href = '/';
                    return false;
                }
               
                // swal({ text: err.message, icon: "warning", dangerMode: true });
                //error toast msg
                if(err.response.data.error.message != undefined){
                    toast.error(err.response.data.error.message);
                }else{
                toast.error(err.message);
                }
            })
    })

}


