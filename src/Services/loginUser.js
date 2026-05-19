export default function loginUser(){
    let data ={};
    let token = localStorage.getItem('loginDetails');
    data.accessToken = token;
    console.log('token::::::',token)
    // let getDetails = JSON.parse(token);
    // return  getDetails;
    return data;
}