import { LogoutApi } from "./logoutApiCall";
import getApiCall from "./getApiCall";
export async function Logout() {
    // confirm the user wants to logout
    if (window.confirm("Are you sure you want to logout?")) {
       const response= await LogoutApi("logoutButton")
       if(response){
        localStorage.clear();
        localStorage.clear();
        window.location.href = '/';
       }
    }

}

export function userDetails() {
    let data = localStorage.getItem('userDetails');
    data = JSON.parse(data);
    return data;
}
export function selectedPartnerDetails() {
    let data = localStorage.getItem('selectedPartner');
    data = JSON.parse(data);
    return data;
}
export async function permissonTypeList() {
    let responseData = await getApiCall('admin/configuration/details/permissionTypes');
    let data = []
    if (responseData.meta.status) {
        data = responseData.data
    }
    console.log('responseData::::::',responseData)
    return data;
}
