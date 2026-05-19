import Axios from "axios";
import swal from 'sweetalert';
import Constant from "../Components/Constant";
import loginUser from "./loginUser";
import {toast} from "react-toastify";

// 1)api url 2) post parameter 3)paramter for any this return or send alert : if true then function return value
export default function getApiCall(Url, params={},isReturn=false) {
    console.log(process.env.REACT_APP_API_BASE_PATH);
    
    let {accessToken} = loginUser();
    console.log('Constant::::::',Constant,accessToken)
   return new Promise((resolve, reject) => {
       Axios.get(Constant.apiBasePath + Url, {headers: {authkey: accessToken}, params:params})
        .then(data => {
            // console.log('post api hook success', data.data);
           if(isReturn){
            if (!data.data.meta.status) {
                toast.error(data.data.meta.msg);
                // swal({text: data.data.meta.msg, icon: "warning", dangerMode: true});
            }
            resolve(data.data);
        }else{
            resolve(data.data);
        }
        })
        .catch(err => {
            if(err.response.status === 401){
                localStorage.clear();
                localStorage.clear();
                window.location.href = '/';
                return false;
            }
            // console.log('post pai error', err.response);
            // swal({text: err.message, icon: "warning", dangerMode: true});
            toast.error(err.message);

        })

   })

}


