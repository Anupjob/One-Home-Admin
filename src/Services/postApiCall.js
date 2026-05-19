import Axios from "axios";
import swal from 'sweetalert';
import Constant from "../Components/Constant";
import loginUser from "./loginUser";
import {toast} from "react-toastify";

// 1)api url 2) post parameter 3)paramter for any this return or send alert : if true then function return value
export default function postApiCall(Url, bodyData, isReturn){
    let {accessToken} = loginUser();
   return Axios.post(Constant.apiBasePath + Url,bodyData,{ headers: { authkey: accessToken }})
        .then(data => {
            // console.log('post api hook success',  data.data.meta);
            if(isReturn == undefined){
              //  console.log(isReturn)
            if(!data.data.meta.status){
                toast.error(data.data.meta.msg);
            }
            return data.data;
        }else{
            if(!data.data.meta.status){
                toast.error(data.data.meta.msg);
            }
            return data.data;
        }

        })
        .catch(err => {
            if(err.response.status === 401){
                localStorage.clear();
                localStorage.clear();
                window.location.href = '/';
                return false;
            }
            // console.log('post api error',err);
            // swal({ text: err.message, icon: "warning", dangerMode: true });
            if(err.data.error.message != undefined){
                toast.error(err.data.error.message);
            }else{
            toast.error(err.message);
            }

        })
     
}


