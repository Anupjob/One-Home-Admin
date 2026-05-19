export default  function IsAuthenticat(){
    let token = localStorage.getItem('loginDetails');
    if(token === null){
         return false;
    }else{
        return true;
    }
}

