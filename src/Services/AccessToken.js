
    function getAccessToken() {
        // let token = localStorage.getItem('loginDetails');
        // let getDetails = JSON.parse(token);
        // return  getDetails;
        return localStorage.getItem('loginDetails');
    }

    module.exports = {
        'getAccessToken': getAccessToken
    }