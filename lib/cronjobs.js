"use strict";

const timeConverter = require("./support_tools.js").timeConverter;
const CheckValidTime = require("./support_tools.js").CheckValidTime;

const CronJob = require("cron").CronJob;

let cronJobs = [];
let parentAdapter;

let cbChangeStatus = null;


//*******************************************************************
//
async function CreateCronJobs(adapter, currentProfile, callback) {
    try {

        parentAdapter = adapter;

        if (callback != null) {
            cbChangeStatus = callback;
        }

        parentAdapter.log.debug("start CreateCronJobs");

        //first delete all jobs
        CronStop();

        //crons for profile
        if (parseInt(parentAdapter.config.ProfileType, 10) === 1) {
            await CreateCronJobsProfiletype1(currentProfile);
        }
        else if (parseInt(parentAdapter.config.ProfileType, 10) === 2) {
            await CreateCronJobsProfiletype2(currentProfile);
        }
        else if (parseInt(parentAdapter.config.ProfileType, 10) === 3) {
            await CreateCronJobsProfiletype3(currentProfile);
        }
        else {
            parentAdapter.log.warn("CreateCronJobs: unknown profile type " + parentAdapter.config.ProfileType);
        }

        //cron for heating period
        CreateCron4HeatingPeriod();

        //reset temp override (not here, but should not delete the others)

        parentAdapter.log.debug("CreateCronJobs done");

        CronStatus();
    }
    catch (e) {
        parentAdapter.log.error("exception in CreateCronJobs [" + e + "]");
    }
}

//*******************************************************************
//
function CronStop() {
    if (cronJobs.length > 0) {
        parentAdapter.log.debug("delete " + cronJobs.length + " cron jobs");
        //cancel all cron jobs...
        const start = cronJobs.length - 1;
        for (let n = start; n >= 0; n--) {
            cronJobs[n].stop();
        }
        cronJobs = [];
    }
}
/*
function deleteCronJob( id) {

    cronJobs[id].stop();

    if (id === cronJobs.length - 1) {
        cronJobs.pop(); //remove last
    }
    else {
        delete cronJobs[id];
    }
    CronStatus();


}
*/

//*******************************************************************
//
function CronCreate(Hour, Minute, day, callback, data) {

    try {

        const timezone = parentAdapter.config.timezone || "Europe/Berlin";

        //https://crontab-generator.org/
        let cronString = "0 " + Minute + " " + Hour + " * * ";

        if (day === 0) { //every day
            cronString += "*";
        }
        else if (day === -1) {//Mo-Fr
            cronString += " 1-5";
        }
        else if (day === -2) {//Sa-So
            cronString += " 0,6";
        }
        else if (day === 7) { //So
            cronString += " 0";
        }
        else if (day > 0 && day < 7) {
            cronString += day;
        }
        const nextCron = cronJobs.length;

        parentAdapter.log.debug("create cron job #" + nextCron + " at " + Hour + ":" + Minute + " string: " + cronString + " " + timezone);

        //details see https://www.npmjs.com/package/cron
        cronJobs[nextCron] = new CronJob(cronString,
            () => callback(data),
            () => parentAdapter.log.debug("cron job stopped"), // This function is executed when the job stops
            true,
            timezone
        );

    }
    catch (e) {
        parentAdapter.log.error("exception in CronCreate [" + e + "]");
    }
}

function CronStatus() {
    let n = 0;
    let length = 0;
    try {
        if (typeof cronJobs !== undefined && cronJobs != null) {

            length = cronJobs.length;
            //parentAdapter.log.debug("cron jobs");
            for (n = 0; n < length; n++) {
                if (typeof cronJobs[n] !== undefined && cronJobs[n] != null) {
                    parentAdapter.log.debug("cron status = " + cronJobs[n].running + " next event: " + timeConverter("DE", cronJobs[n].nextDates()));
                }
            }

            if (length > 500) {
                parentAdapter.log.warn("more then 500 cron jobs existing for this adapter, this might be a configuration error! (" + length + ")");
            }
            else {
                parentAdapter.log.info(length + " cron job(s) created");
            }
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in getCronStat [" + e + "] : " + n + " of " + length);
    }
}

//*******************************************************************
//
function CreateCron4HeatingPeriod() {

    if (parentAdapter.config.UseFixHeatingPeriod) {
        const timezone = parentAdapter.config.timezone || "Europe/Berlin";
        parentAdapter.log.info("check for heating period based on settings between " + parentAdapter.config.FixHeatingPeriodStart + " and " + parentAdapter.config.FixHeatingPeriodEnd);

        const HeatingPeriodStart = parentAdapter.config.FixHeatingPeriodStart.split(/[.,/ -]/);
        const HeatingPeriodEnd = parentAdapter.config.FixHeatingPeriodEnd.split(/[.,/ -]/);

        if (HeatingPeriodStart.length >= 2 && HeatingPeriodEnd.length >= 2) {
            try {
                //0 0 day month *
                const StartMonth = HeatingPeriodStart[1] - 1;
                const StartDate = HeatingPeriodStart[0];
                let cronString = "5 0 " + StartDate + " " + StartMonth + " *";

                let nextCron = cronJobs.length;

                parentAdapter.log.debug("HeatingPeriod: create cron job #" + nextCron + " at " + StartDate + "." + HeatingPeriodStart[1] + " string: " + cronString + " " + timezone);

                //details see https://www.npmjs.com/package/cron
                cronJobs[nextCron] = new CronJob(cronString,
                    () => StartHeatingPeriod(),
                    () => parentAdapter.log.debug("cron job HeatingPeriodStart stopped"), // This function is executed when the job stops
                    true,
                    timezone
                );

                const EndMonth = HeatingPeriodEnd[1] - 1;
                const EndDate = HeatingPeriodEnd[0];
                cronString = "55 23 " + EndDate + " " + EndMonth + " *";

                nextCron = cronJobs.length;

                parentAdapter.log.debug("HeatingPeriod: create cron job #" + nextCron + " at " + EndDate + "." + HeatingPeriodEnd[1] + " string: " + cronString + " " + timezone);

                //details see https://www.npmjs.com/package/cron
                cronJobs[nextCron] = new CronJob(cronString,
                    () => StopHeatingPeriod(),
                    () => parentAdapter.log.debug("cron job HeatingPeriodEnd stopped"), // This function is executed when the job stops
                    true,
                    timezone
                );
            }
            catch (e) {
                parentAdapter.log.error("exception in CreateCron4HeatingPeriod [" + e + "]");
            }
        }
        else {
            parentAdapter.log.error("heating period not valid " + parentAdapter.config.FixHeatingPeriodStart + " / " + parentAdapter.config.FixHeatingPeriodEnd);
        }
    }
}

function StartHeatingPeriod() {
    parentAdapter.log.info("Heating period started");
    parentAdapter.setState("HeatingPeriodActive", { ack: true, val: true });
}
function StopHeatingPeriod() {
    parentAdapter.log.info("Heating period ended");
    parentAdapter.setState("HeatingPeriodActive", { ack: true, val: false });
}


//*******************************************************************
//
async function CreateTimerList(PeriodName, currentProfile) {

    const timerList = [];

    for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
        if (parentAdapter.config.rooms[room].isActive) {

            //only per room, not global
            let LastTimeSetHour = -1;
            let LastTimeSetMinute = -1;

            for (let period = 1; period <= parentAdapter.config.NumberOfPeriods; period++) {

                const id = "Profiles." + currentProfile + "." + parentAdapter.config.rooms[room].name + "." + PeriodName + ".Periods." + period; // + ".time";

                const nextTime = await parentAdapter.getStateAsync(id + ".time");
                const nextTemperature = await parentAdapter.getStateAsync(id + ".Temperature");

                //parentAdapter.log.debug("---found time for " + parentAdapter.config.rooms[room].name + " at " + nextTime.val);
                const nextTimeVal = CheckValidTime(parentAdapter, id, nextTime.val);
                const nextTimes = nextTimeVal.split(":"); //here we get hour and minute

                let bFound = false;
                let timerListIdx = -1;
                for (let i = 0; i < timerList.length; i++) {
                    if (timerList[i].hour === parseInt(nextTimes[0]) && timerList[i].minute === parseInt(nextTimes[1])) {
                        bFound = true;
                        timerListIdx = i;
                        //parentAdapter.log.debug("already in list " + JSON.stringify(nextTime));
                    }
                }
                if (!bFound) {
                    const TimeSetHour = parseInt(nextTimes[0]);
                    const TimeSetMinute = parseInt(nextTimes[1]);

                    //see issue 13
                    if (TimeSetHour > LastTimeSetHour || (TimeSetHour === LastTimeSetHour && TimeSetMinute > LastTimeSetMinute)) {

                        LastTimeSetHour = TimeSetHour;
                        LastTimeSetMinute = TimeSetMinute;

                        //parentAdapter.log.debug("push to list " + " = " + nextTimes);

                        const values2Set = [];
                        let currentTimePeriod = -1;

                        if (PeriodName == "Mo-Su") {
                            currentTimePeriod = period;
                        }
                        else if (PeriodName == "Mo-Fr") {
                            currentTimePeriod = period;
                        }
                        else if (PeriodName == "Sa-Su") {
                            currentTimePeriod = parseInt(parentAdapter.config.NumberOfPeriods) + period;
                        }
                        else if (PeriodName == "Mon") {
                            currentTimePeriod = period;
                        }
                        else if (PeriodName == "Tue") {
                            currentTimePeriod = 1 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                        }
                        else if (PeriodName == "Wed") {
                            currentTimePeriod = 2 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                        }
                        else if (PeriodName == "Thu") {
                            currentTimePeriod = 3 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                        }
                        else if (PeriodName == "Fri") {
                            currentTimePeriod = 4 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                        }
                        else if (PeriodName == "Sat") {
                            currentTimePeriod = 5 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                        }
                        else if (PeriodName == "Sun") {
                            currentTimePeriod = 6 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                        }
                       
                        

                        values2Set.push({
                            room: parentAdapter.config.rooms[room].name,
                            target: nextTemperature.val,
                            currentTimePeriod: currentTimePeriod,
                            ActiveTimeSlot: period,
                            CurrentTimePeriodTime: parseInt(nextTimes[0]) + ":" + parseInt(nextTimes[1]),
                            CurrentTimePeriodFull: "Period " + period + " " + parseInt(nextTimes[0]) + ":" + parseInt(nextTimes[1])
                        });

                        timerList.push({
                            hour: TimeSetHour,
                            minute: TimeSetMinute,
                            day: 0,
                            Values2Set: values2Set
                        });
                    }
                    else {
                        parentAdapter.log.warn("wrong order of periods: " + TimeSetHour + ":" + TimeSetMinute + " is smaller then " + LastTimeSetHour + ":" + LastTimeSetMinute + ". Please reorder periods");
                    }
                }
                else {
                    //update ValuesToSet only for the room

                    const values2Set = timerList[timerListIdx].Values2Set;

                    //parentAdapter.log.debug("update " + JSON.stringify(values2Set));

                    values2Set.push({
                        room: parentAdapter.config.rooms[room].name,
                        target: nextTemperature.val,
                        currentTimePeriod: period,
                        ActiveTimeSlot: period,
                        CurrentTimePeriodTime: parseInt(nextTimes[0]) + ":" + parseInt(nextTimes[1]),
                        CurrentTimePeriodFull: "Period " + period + " " + parseInt(nextTimes[0]) + ":" + parseInt(nextTimes[1])
                    });


                    timerList[timerListIdx].Values2Set = values2Set;
                }
            }
        }

    }
    return timerList;

}

async function CreateCronJobsProfiletype1( currentProfile) {
    parentAdapter.log.info("start create cron jobs for profile type 1 (Mo - Su)");

    const timerList = await CreateTimerList("Mo-Su", currentProfile);
    
    parentAdapter.log.debug("cron jobs created " + JSON.stringify(timerList));
    /*
    cron jobs created[
        { "hour": 4, "minute": 0, "day": 0, "Values2Set": [{ "room": "Wohnzimmer", "target": 17 }] },
        { "hour": 8, "minute": 0, "day": 0, "Values2Set": [{ "room": "Wohnzimmer", "target": 21 }, { "room": "Küche", "target": 21 }] },
        { "hour": 12, "minute": 0, "day": 0, "Values2Set": [{ "room": "Wohnzimmer", "target": 21 }, { "room": "Küche", "target": 21 }] },
        { "hour": 16, "minute": 0, "day": 0, "Values2Set": [{ "room": "Wohnzimmer", "target": 19 }, { "room": "Küche", "target": 19 }] },
        { "hour": 21, "minute": 0, "day": 0, "Values2Set": [{ "room": "Wohnzimmer", "target": 21 }, { "room": "Küche", "target": 21 }] },
        { "hour": 5, "minute": 0, "day": 0, "Values2Set": [{ "room": "Küche", "target": 19 }] }]
        */

    //now create cron jobs..
    for (let i = 0; i < timerList.length; i++) {
        CronCreate( timerList[i].hour, timerList[i].minute, 0, ChangeStatus, timerList[i].Values2Set);
    }
}

function ChangeStatus(data) {
    parentAdapter.log.warn("ChangeStatus fired with " + JSON.stringify(data));

    //changeStatus fired with [{"room":"Wohnzimmer","target":21},{"room":"Küche","target":21}]

    for (let i = 0; i < data.length; i++) {

        if (cbChangeStatus != null) {
            cbChangeStatus("ProfilPoint", data[i].room, data[i]);
        }
    }
}

async function CreateCronJobsProfiletype2(currentProfile) {
    parentAdapter.log.info("start create cron jobs for profile type 2 (Mo-Fr / Sa - Su)");

    const timerList1 = await CreateTimerList("Mo-Fr", currentProfile);
    const timerList2 = await CreateTimerList("Sa-Su", currentProfile);

    parentAdapter.log.debug("cron jobs created " + JSON.stringify(timerList1) + " " + JSON.stringify(timerList2));

    //now create cron jobs..
    for (let i = 0; i < timerList1.length; i++) {
        CronCreate(timerList1[i].hour, timerList1[i].minute, -1, ChangeStatus, timerList1[i].Values2Set);
    }
    for (let i = 0; i < timerList2.length; i++) {
        CronCreate(timerList2[i].hour, timerList2[i].minute, -2, ChangeStatus, timerList2[i].Values2Set);
    }
}
async function CreateCronJobsProfiletype3(currentProfile) {
    parentAdapter.log.info("start create cron jobs for profile type 3 (ery day)");

    const timerList1 = await CreateTimerList("Mon", currentProfile);
    const timerList2 = await CreateTimerList("Tue", currentProfile);
    const timerList3 = await CreateTimerList("Wed", currentProfile);
    const timerList4 = await CreateTimerList("Thu", currentProfile);
    const timerList5 = await CreateTimerList("Fri", currentProfile);
    const timerList6 = await CreateTimerList("Sat", currentProfile);
    const timerList7 = await CreateTimerList("Sun", currentProfile);

    parentAdapter.log.debug("cron jobs created " + JSON.stringify(timerList1) + " " + JSON.stringify(timerList2) + " " + JSON.stringify(timerList3) + " " + JSON.stringify(timerList4) + " " + JSON.stringify(timerList5) + " " + JSON.stringify(timerList6) + " " + JSON.stringify(timerList7));

    //now create cron jobs..
    for (let i = 0; i < timerList1.length; i++) {
        CronCreate(timerList1[i].hour, timerList1[i].minute, 1, ChangeStatus, timerList1[i].Values2Set);
    }
    for (let i = 0; i < timerList2.length; i++) {
        CronCreate(timerList2[i].hour, timerList2[i].minute, 2, ChangeStatus, timerList2[i].Values2Set);
    }
    for (let i = 0; i < timerList3.length; i++) {
        CronCreate(timerList3[i].hour, timerList3[i].minute, 3, ChangeStatus, timerList3[i].Values2Set);
    }
    for (let i = 0; i < timerList4.length; i++) {
        CronCreate(timerList4[i].hour, timerList4[i].minute, 4, ChangeStatus, timerList4[i].Values2Set);
    }
    for (let i = 0; i < timerList5.length; i++) {
        CronCreate(timerList5[i].hour, timerList5[i].minute, 5, ChangeStatus, timerList5[i].Values2Set);
    }
    for (let i = 0; i < timerList6.length; i++) {
        CronCreate(timerList6[i].hour, timerList6[i].minute, 6, ChangeStatus, timerList6[i].Values2Set);
    }
    for (let i = 0; i < timerList7.length; i++) {
        CronCreate(timerList7[i].hour, timerList7[i].minute, 7, ChangeStatus, timerList7[i].Values2Set);
    }
}

module.exports = {
    CreateCronJobs,
    CronStop
};