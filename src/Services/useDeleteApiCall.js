import Axios from "axios";
import swal from 'sweetalert';
import Constant from "../Components/Constant";
import loginUser from "./loginUser";

export default function useDeleteApiCall(Url) {
    let { accessToken } = loginUser();
    return new Promise((resolve, reject) => {
        Axios.delete(Constant.apiBasePath + Url, { headers: { token: accessToken } })
            .then(data => {
                data = data.data;
                console.log(data.status);
                if (data.status === 'Success') {
                   swal({ text: "Successfully deleted..", icon: "success", timer: 1500})
                        .then(() => {
                            window.location.reload();
                        })
                }
            })
            .catch(err => {
                console.log(err);
                if (err.response === undefined) {
                    swal({ text: "API OFFLINE", icon: "warning", dangerMode: true });
                    return false;
                }
                let API_MESSAGE = err.response.data;
                if (err.response.status === 400) {
                    swal({ text: API_MESSAGE.message, icon: "warning", dangerMode: true });
                } else {
                    swal({ text: API_MESSAGE.message, icon: "warning", dangerMode: true });
                }
            })
    })

}


