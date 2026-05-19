import Constant from "../Components/Constant";
const CryptoJS = require("crypto-js");

export function decryptBody(data) {
    const iv = CryptoJS.lib.WordArray.random(16); // 128 bits
    let bytes = CryptoJS.AES.decrypt(data, Constant.HHH, {iv});
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

export function blobUrl(url) {
    let token = localStorage.getItem('uploadT')
    // return url + decryptBody(localStorage.getItem('token'));
    // console.log('uploadT', localStorage.getItem('uploadT'))
    url = url ? url : '/no.jpg'
    return token ? url + token : url;
}

export function getDateTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return {
        date,
        year,
        month,
        day,
        hours,
        minutes,
        seconds
    };
}

export function removeTags(str) {
    return str.replace(/<[^>]*>?/gm, '');
}

export function shortText(str) {
    str = removeTags(str)
    if (str.length > 50) {
        str = str.substring(0, 50) + '...';
    }
    return str;
}

export function formatDate(dateString) {
    const options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
}

export function propertyTitle(property) {
    let name = ''
    if (!property?.projectName) {
        let bhk = property?.noOfBedRooms > 0 ? `${property?.noOfBedRooms} + BHK` : ""
        name += bhk + property?.propertyTypeData?.name + ' ' + property?.locality
    }
    if (property?.projectName) {
        let bhk = property?.noOfBedRooms > 0 ? `${property?.noOfBedRooms} + BHK` : ""
        name += bhk + property?.projectName + ', ' + property?.locality
    }
    return name

}
