import Axios from "axios";
import swal from 'sweetalert';
import Constant from "../Components/Constant";
import loginUser from "./loginUser";
import {toast} from "react-toastify";

export default function deleteApiCall(Url, bodyData ={}, isReturn) {
    let { accessToken } = loginUser();
    return new Promise((resolve, reject) => {
        Axios.get(Constant.apiBasePath + Url, { headers: { authkey: accessToken },
        params:bodyData
        })
            .then(data => {
                // console.log('Delete api call service success',  data.data.meta);
                if(!data.data.meta.status){
                    // swal({ text: data.data.meta.msg, icon: "warning", dangerMode: true });
                    toast.error(data.data.meta.msg);
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
                // console.log('post pai error',err.response);
                // swal({ text: err.message, icon: "warning", dangerMode: true });
                toast.error(err.message);

            })
    })

}


