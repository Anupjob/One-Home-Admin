import axios from "axios";
import Constant from "../views/Constant";
import loginUser from "./loginUser";

// eslint-disable-next-line react-hooks/rules-of-hooks
let {accessToken} = loginUser();



 async function  useApi() {
     const api = axios.create({
         baseURL: Constant.apiBasePath,
         timeout: 1000,
         headers: {token: accessToken}
     });
    return api;
}





export default useApi;