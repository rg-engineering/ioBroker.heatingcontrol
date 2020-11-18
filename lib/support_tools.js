"use strict";

/**
 * @param {string} timeVal
 * @param {string} timeLimit
 */
function IsLater(adapter, timeVal, timeLimit) {

    let ret = false;
    try {
        adapter.log.debug("check IsLater : " + timeVal + " " + timeLimit);

        if (typeof timeVal === "string" && typeof timeLimit === "string") {
            const valIn = timeVal.split(":");
            const valLimits = timeLimit.split(":");

            if (valIn.length > 1 && valLimits.length > 1) {

                if (parseInt(valIn[0]) > parseInt(valLimits[0])
                    || (parseInt(valIn[0]) == parseInt(valLimits[0]) && parseInt(valIn[1]) > parseInt(valLimits[1]))) {
                    ret = true;
                    adapter.log.debug("yes, IsLater : " + timeVal + " " + timeLimit);
                }
            }
            else {
                adapter.log.error("string does not contain : " + timeVal + " " + timeLimit);
            }
        }
        else {
            adapter.log.error("not a string " + typeof timeVal + " " + typeof timeLimit);
        }
    }
    catch (e) {
        adapter.log.error("exception in IsLater [" + e + "]");
    }
    return ret;
}

/**
 * @param {string } timeVal
 * @param {string } [timeLimit]
 */
function IsEarlier(adapter, timeVal, timeLimit) {

    let ret = false;
    try {
        adapter.log.debug("check IsEarlier : " + timeVal + " " + timeLimit);

        if (typeof timeVal === "string" && typeof timeLimit === "string") {
            const valIn = timeVal.split(":");
            const valLimits = timeLimit.split(":");

            if (valIn.length > 1 && valLimits.length > 1) {

                if (parseInt(valIn[0]) < parseInt(valLimits[0])
                    || (parseInt(valIn[0]) == parseInt(valLimits[0]) && parseInt(valIn[1]) < parseInt(valLimits[1]))) {
                    ret = true;
                    adapter.log.debug("yes, IsEarlier : " + timeVal + " " + timeLimit);
                }
            }
            else {
                adapter.log.error("string does not contain : " + timeVal + " " + timeLimit);
            }
        }
        else {
            adapter.log.error("not a string " + typeof timeVal + " " + typeof timeLimit);
        }
    }
    catch (e) {
        adapter.log.error("exception in IsEarlier [" + e + "]");
    }
    return ret;
}

/**
 * @param {string} timeVal
 * @param {string} timeLimit
 */
function IsEqual(adapter, timeVal, timeLimit) {

    let ret = false;
    try {
        adapter.log.debug("check IsEqual : " + timeVal + " " + timeLimit);

        if (typeof timeVal === "string" && typeof timeLimit === "string") {
            const valIn = timeVal.split(":");
            const valLimits = timeLimit.split(":");

            if (valIn.length > 1 && valLimits.length > 1) {

                if (parseInt(valIn[0]) === parseInt(valLimits[0]) && parseInt(valIn[1]) === parseInt(valLimits[1])) {
                    ret = true;
                    adapter.log.debug("yes, IsEqual : " + timeVal + " " + timeLimit);
                }
            }
            else {
                adapter.log.error("string does not contain : " + timeVal + " " + timeLimit);
            }
        }
        else {
            adapter.log.error("not a string " + typeof timeVal + " " + typeof timeLimit);
        }
    }
    catch (e) {
        adapter.log.error("exception in IsEqual [" + e + "]");
    }
    return ret;
}

//*******************************************************************
//
// find a object in array by key and value
// returns the object
function findObjectByKey(array, key, value) {
    if (array !== null && typeof array !== undefined) {
        for (let i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return array[i];
            }
        }
    }
    return null;
}

//*******************************************************************
//
// find a object in array by key and value
// returns the object
function findObjectsByKey(array, key, value) {

    const ret = [];

    if (array !== null && typeof array !== undefined) {
        for (let i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                ret.push(array[i]);
            }
        }
    }
    return ret;
}


//*******************************************************************
//
// find a object in array by key and value
// returns index number
function findObjectIdByKey(array, key, value) {


    //array.filter(d => d.key == value);

    if (array !== null && typeof array !== undefined) {

        for (let i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return i;
            }
        }
    }
    return -1;
}


//*******************************************************************
//
// find all objects in array by key and value
// returns index number array
function findObjectsIdByKey(array, key, value) {

    const ret = [];

    if (array !== null && typeof array !== undefined) {

        for (let i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                ret.push(i);
            }
        }
    }
    return ret;
}


function timeConverter(SystemLanguage,time, timeonly = false) {

    let a;
    if (time != null) {
        a = new Date(time);
    }
    else {
        a = new Date();
    }
    let months;

    if (SystemLanguage === "de") {
        months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    }
    else {
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    let date = a.getDate();
    date = date < 10 ? " " + date : date;
    let hour = a.getHours();
    hour = hour < 10 ? "0" + hour : hour;
    let min = a.getMinutes();
    min = min < 10 ? "0" + min : min;
    let sec = a.getSeconds();
    sec = sec < 10 ? "0" + sec : sec;

    let sRet = "";
    if (timeonly) {
        sRet = hour + ":" + min + ":" + sec;
    }
    else {
        sRet = date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
    }

    return sRet;
}

function CheckValidTime(adapter, id, time) {

    let sRet = "00:00";
    try {
        if (time === "null" || typeof time === undefined) {
            adapter.log.error("time value not found for " + id);

        }
        else if (typeof time !== "string") {
            adapter.log.error("time should be a string but is " + typeof time.val + " for " + id);

        }
        else if (time.length < 3) {
            adapter.log.error("time not long enough for " + id);

        }
        else if (!time.includes(":")) {
            adapter.log.error("time ':' missing for " + id);
        }
        else {
            const times = time.split(":");
            sRet = "0" + times[0].slice(-2) + ":" + "0" + times[1].slice(-2);
        }

    }
    catch (e) {
        adapter.log.error("exception in CheckValidTime [" + e + "] for " + id + " " + JSON.stringify(time));

    }
    return sRet;

}


function Check4ValidTemperature(adapter, temperature) {

    try {

        if (typeof temperature == "object") {
            adapter.log.warn("target temperature is object " + JSON.stringify(temperature));
        }

        if (isNaN(temperature) || typeof temperature === "string") {

            adapter.log.debug("try to convert " + temperature + " to a number");
            return Number(temperature);
        }
        else {
            return temperature;
        }

    }
    catch (e) {
        adapter.log.error("exception in Check4ValidTemperature [" + e + "]");
        return 0;
    }

}

module.exports = {
    IsLater,
    IsEarlier,
    IsEqual,
    findObjectsIdByKey,
    findObjectIdByKey,
    findObjectsByKey,
    findObjectByKey,
    timeConverter,
    CheckValidTime,
    Check4ValidTemperature
};