export function notAllowedSpecialcharacter(value){
    let validValue = value.replace(/['"<>:;|&/\\#*%]/g, '');
return validValue;
}

export function onlyAllowedNumber(value){
    if(value.includes(',')){
        return value
    }
    let validValue = value.replace(/[^0-9]/g,"");
    return validValue
}

export function allowedFewSpecialcharacter(value){
    let validValue = value.replace(/['"<>;|&\\#*%]/g, '');
return validValue;
}