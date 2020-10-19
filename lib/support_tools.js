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


module.exports = { IsLater, IsEarlier, IsEqual, findObjectsIdByKey, findObjectIdByKey, findObjectsByKey, findObjectByKey };