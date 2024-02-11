"use strict";

const heatingcontrolDictionary = require("./vis_words.js").heatingcontrolDictionary;

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
    if (array !== null &&  array !== undefined) {
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

    if (array !== null &&  array !== undefined) {
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

    if (array !== null &&  array !== undefined) {

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

    if (array !== null &&  array !== undefined) {

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
    else if (SystemLanguage === "en") {
        months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    }
    else {
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }

    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const sdate = date < 10 ? " " + date.toString() : date.toString();
    const hour = a.getHours();
    const shour = hour < 10 ? "0" + hour.toString() : hour.toString();
    const min = a.getMinutes();
    const smin = min < 10 ? "0" + min.toString() : min.toString();
    const sec = a.getSeconds();
    const ssec = sec < 10 ? "0" + sec.toString() : sec.toString();

    let sRet = "";
    if (timeonly) {
        sRet = shour + ":" + smin + ":" + ssec;
    }
    else {
        sRet = sdate + " " + month + " " + year.toString() + " " + shour + ":" + smin + ":" + ssec;
    }

    return sRet;
}

function CheckValidTime(adapter, id, time) {

    let sRet = "00:00";
    try {
        if (time === "null" ||  time === undefined) {
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

        if (temperature == null) {
            adapter.log.warn("target temperature is 'null' ");
        }

        if (typeof temperature == "object") {
            adapter.log.warn("target temperature is an object, value: " + JSON.stringify(temperature));
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


function IsSummerTime(adapter, sStartDate, sEndDate) {

    let ret = false;
    try {

        adapter.log.debug("check in time " + sStartDate + " " + sEndDate);

        if (sStartDate.length > 0 && sEndDate.length > 0) {
            const StartPeriod = sStartDate.split(/[.,/ -]/);
            const EndPeriod = sEndDate.split(/[.,/ -]/);

            if (StartPeriod.length >= 2 && EndPeriod.length >= 2) {

                const StartDate = new Date();
                StartDate.setDate(parseInt(StartPeriod[0]));
                StartDate.setMonth(parseInt(StartPeriod[1]) - 1);
                adapter.log.debug("Start " + StartDate.toDateString());

                const EndDate = new Date();
                EndDate.setDate(parseInt(EndPeriod[0]));
                EndDate.setMonth(parseInt(EndPeriod[1]) - 1);
                adapter.log.debug("End " + EndDate.toDateString());

                const now = new Date();

                //bei Jahreswechsel
                if (EndDate < StartDate) {
                    if (now > EndDate) {
                        //end already past, increase end year
                        EndDate.setFullYear(EndDate.getFullYear() + 1);
                        adapter.log.debug("corrected End " + EndDate.toDateString());
                    }
                    else {
                        //else decrease Start year
                        StartDate.setFullYear(StartDate.getFullYear() - 1);
                        adapter.log.debug("corrected Start " + StartDate.toDateString());
                    }
                }

                if (now >= StartDate && now <= EndDate) {
                    adapter.log.debug("we are in period");
                    ret = true;
                }
                else {
                    adapter.log.debug("we are not in period, after start " + StartDate.toDateString() + " and before end " + EndDate.toDateString());
                    ret = false;
                }
            }
        }
    }
    catch (e) {
        adapter.log.error("exception catch in IsSummerTime [" + e + "] ");
    }
    return ret;
}



function GetTranslation(adapter,text, systemLang) {

    let translated = text;

    if (heatingcontrolDictionary[text]) {
        translated = heatingcontrolDictionary[text][systemLang] || heatingcontrolDictionary[text].en;
    }

   
    return translated;
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
    Check4ValidTemperature,
    IsSummerTime,
    GetTranslation
};