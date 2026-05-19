import postApiCall from "./postApiCall";
export const LogoutApi =async(type)=>{
        try{
 let response = await postApiCall("admin/logout", {logoutMode:type}, true);
        if(response.meta.status){
                return true
        }
        else{
                return false    
        }
}
catch(error){
        return false  
}
}