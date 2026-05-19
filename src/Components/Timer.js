import React from 'react';
// import {useTimer} from 'react-timer-hook';

export default function Timer({endDateTime, auctionType}) {
    // const time = new Date();
    // time.setSeconds(time.getSeconds() + 600); // 10 minutes timer
    // expiryTimestamp = time;
   let expiryTimestamp = new Date(endDateTime);
    expiryTimestamp.setSeconds(expiryTimestamp.getSeconds());

    // const {
    //     seconds,
    //     minutes,
    //     hours,
    //     days,
    //     isRunning,
    //     start,
    //     pause,
    //     resume,
    //     restart,
    // } = useTimer({expiryTimestamp, onExpire: () => console.warn('Bid Time Expired')});

    let Time = ""
    if(auctionType == 2){
        console.log("hours",hours)
        Time = <>{days > 1 ? `Starts In ${(days)} days` : <>Starts In <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span></>}</>
    }else{
        console.log("hours",hours)
        Time = <>{days > 1 ? `Ends In ${(days)} days` : <>Ends In <span>{hours}h</span> <span>{minutes}m</span> <span>{seconds}s</span></>}</>
    }

    return (
        <>
            {/* <span>{days}</span>:<span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span> */}
            {Time}
            {/*<span>{days} Day`s</span>:<span>{hours} Hour`s</span>:<span>{minutes} Minutes</span>:<span>{seconds} Second`s</span>*/}

        </>
    );
}
