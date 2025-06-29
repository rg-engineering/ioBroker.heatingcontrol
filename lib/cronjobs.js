/* eslint-disable prefer-template */
"use strict";

const timeConverter = require("./support_tools.js").timeConverter;
const CheckValidTime = require("./support_tools.js").CheckValidTime;

const NumberOfPeriodsinVis = 5;

const CronJob = require("cron").CronJob;

let cronJobs = [];
let parentAdapter;

let cbChangeStatus = null;



//*******************************************************************
//
async function CreateCronJobs(adapter, currentProfile, callback, rooms) {
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
            await CreateCronJobsProfiletype1(currentProfile, rooms);
        } else if (parseInt(parentAdapter.config.ProfileType, 10) === 2) {
            await CreateCronJobsProfiletype2(currentProfile, rooms);
        } else if (parseInt(parentAdapter.config.ProfileType, 10) === 3) {
            await CreateCronJobsProfiletype3(currentProfile, rooms);
        } else {
            parentAdapter.log.warn("CreateCronJobs: unknown profile type " + parentAdapter.config.ProfileType);
        }

        //cron for heating period
        CreateCron4HeatingPeriod();

        //cron for power interruptions
        CreateCron4PowerInterruptions();


        //reset temp override (not here, but should not delete the others)

        parentAdapter.log.debug("CreateCronJobs done");

        CronStatus();
    } catch (e) {
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
        } else if (day === -1) {//Mo-Fr
            cronString += " 1-5";
        } else if (day === -2) {//Sa-So
            cronString += " 0,6";
        } else if (day === 7) { //So
            cronString += " 0";
        } else if (day > 0 && day < 7) {
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

    } catch (e) {
        parentAdapter.log.error("exception in CronCreate [" + e + "]");
    }
}

function CronStatus() {
    let n = 0;
    let length = 0;
    try {
        if (cronJobs !== undefined && cronJobs != null) {

            length = cronJobs.length;
            //parentAdapter.log.debug("cron jobs");
            for (n = 0; n < length; n++) {
                if (cronJobs[n] !== undefined && cronJobs[n] != null) {
                    parentAdapter.log.debug("cron status = " + cronJobs[n].running + " next event: " + timeConverter("DE", cronJobs[n].nextDate()));
                }
            }

            if (length > 500) {
                parentAdapter.log.warn("more then 500 cron jobs existing for this adapter, this might be a configuration error! (" + length + ")");
            } else {
                parentAdapter.log.info(length + " cron job(s) created");
            }
        }
    } catch (e) {
        parentAdapter.log.error("exception in getCronStat [" + e + "] : " + n + " of " + length);
    }
}

//*******************************************************************
//


/*
2024-06-03 06:50:58.913  - [34mdebug[39m: heatingcontrol.0 (1888) HeatingPeriod: create cron job #4 at 01.10 string: 5 0 01 9 * Europe/Berlin
2024-06-03 06:50:58.921  - [34mdebug[39m: heatingcontrol.0 (1888) HeatingPeriod: create cron job #5 at 02.06 string: 55 23 02 5 * Europe/Berlin

2024-06-03 06:50:58.982  - [34mdebug[39m: heatingcontrol.0 (1888) cron status = true next event:  1 Sep 2024 00:05:00
2024-06-03 06:50:59.009  - [34mdebug[39m: heatingcontrol.0 (1888) cron status = true next event:  2 May 2025 23:55:00

*/
function CreateCron4HeatingPeriod() {

    if (parentAdapter.config.UseFixHeatingPeriod) {
        const timezone = parentAdapter.config.timezone || "Europe/Berlin";
        parentAdapter.log.info("set cron for heating period check based on settings between " + parentAdapter.config.FixHeatingPeriodStart + " and " + parentAdapter.config.FixHeatingPeriodEnd);

        const HeatingPeriodStart = parentAdapter.config.FixHeatingPeriodStart.split(/[.,/ -]/);
        const HeatingPeriodEnd = parentAdapter.config.FixHeatingPeriodEnd.split(/[.,/ -]/);

        if (HeatingPeriodStart.length >= 2 && HeatingPeriodEnd.length >= 2) {
            try {
                //0 0 day month *
                const StartMonth = HeatingPeriodStart[1];
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

                const EndMonth = HeatingPeriodEnd[1];
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
            } catch (e) {
                parentAdapter.log.error("exception in CreateCron4HeatingPeriod [" + e + "]");
            }
        } else {
            parentAdapter.log.error("heating period not valid " + parentAdapter.config.FixHeatingPeriodStart + " / " + parentAdapter.config.FixHeatingPeriodEnd);
        }
    }
}

function StartHeatingPeriod() {
    parentAdapter.log.info("Heating period started");
    parentAdapter.setState("HeatingPeriodActive", { ack: false, val: true });
}
function StopHeatingPeriod() {
    parentAdapter.log.info("Heating period ended");
    parentAdapter.setState("HeatingPeriodActive", { ack: false, val: false });
}



//*******************************************************************
//
function CreateCron4PowerInterruptions() {

    const timezone = parentAdapter.config.timezone || "Europe/Berlin";

    if (parentAdapter.config.PowerInterruptions != null && parentAdapter.config.PowerInterruptions.length > 0) {
        parentAdapter.log.info("set cron for Power Interruptions " + parentAdapter.config.PowerInterruptions.length + " " + JSON.stringify(parentAdapter.config.PowerInterruptions));


        for (let i = 0; i < parentAdapter.config.PowerInterruptions.length; i++) {


            if (parentAdapter.config.PowerInterruptions[i].active == true) {

                const StartPi = parentAdapter.config.PowerInterruptions[i].Start.split(/[:.,/ -]/);
                const EndPi = parentAdapter.config.PowerInterruptions[i].End.split(/[:.,/ -]/);


                parentAdapter.log.debug("StartPI " + JSON.stringify(StartPi) + " EndPI " + JSON.stringify(EndPi));

                if (StartPi.length >= 2 && EndPi.length >= 2) {
                    try {
                        //0 0 day month *
                        const StartHour = StartPi[0];
                        const StartMinute = StartPi[1];
                        let cronString = StartMinute + " " + StartHour + " * * *";

                        let nextCron = cronJobs.length;

                        parentAdapter.log.debug("HeatingPeriod: create cron job #" + nextCron + " at " + StartHour + ":" + StartMinute + " string: " + cronString + " " + timezone);

                        //details see https://www.npmjs.com/package/cron
                        cronJobs[nextCron] = new CronJob(cronString,
                            () => StartPowerInterruption(),
                            () => parentAdapter.log.debug("cron job StartPowerInterruption stopped"), // This function is executed when the job stops
                            true,
                            timezone
                        );

                        const EndHour = EndPi[0];
                        const EndMinute = EndPi[1];
                        cronString = EndMinute + " " + EndHour + " * * *";

                        nextCron = cronJobs.length;

                        parentAdapter.log.debug("HeatingPeriod: create cron job #" + nextCron + " at " + EndHour + ":" + EndMinute + " string: " + cronString + " " + timezone);

                        //details see https://www.npmjs.com/package/cron
                        cronJobs[nextCron] = new CronJob(cronString,
                            () => StopPowerInterruption(),
                            () => parentAdapter.log.debug("cron job StopPowerInterruption stopped"), // This function is executed when the job stops
                            true,
                            timezone
                        );
                    } catch (e) {
                        parentAdapter.log.error("exception in CreateCron4PowerInterruptions [" + e + "]");
                    }
                } else {
                    parentAdapter.log.error("power interruption period not valid " + parentAdapter.config.PowerInterruptions[i].Start + " / " + parentAdapter.config.PowerInterruptions[i].End);
                }
            }
        }
    }
}

function StartPowerInterruption() {
    parentAdapter.log.info("Power Interruption period started");
    parentAdapter.setState("PowerInterruptionPeriodActive", { ack: false, val: true });
}
function StopPowerInterruption() {
    parentAdapter.log.info("Power Interruption period ended");
    parentAdapter.setState("PowerInterruptionPeriodActive", { ack: false, val: false });
}

//*******************************************************************
//
let cronFireplaceModeId = -1;

function StartTimer2ResetFireplaceMode() {
    parentAdapter.log.debug("start StartTimer2ResetFireplaceMode");
    try {

        if (parentAdapter.config.UseFireplaceModeResetAt != null) {
            const timezone = parentAdapter.config.timezone || "Europe/Berlin";
            const UseFireplaceModeResetAt = parentAdapter.config.UseFireplaceModeResetAt.split(/[:.,/ -]/);
            const Hour = UseFireplaceModeResetAt[0];
            const Minute = UseFireplaceModeResetAt[1];

            const cronString = Minute + " " + Hour + " * * *";

            if (Hour >= 0 && Hour < 24 && Minute >= 0 && Minute < 60) {
                const nextCron = cronJobs.length;

                parentAdapter.log.debug("create cron job to reset FireplaceMode " + nextCron + " at " + Hour + ":" + Minute + " string: " + cronString + " " + timezone);

                //details see https://www.npmjs.com/package/cron
                cronJobs[nextCron] = new CronJob(cronString,
                    () => StopFireplaceMode(),
                    () => parentAdapter.log.debug("cron job stopped"), // This function is executed when the job stops
                    true,
                    timezone
                );

                cronFireplaceModeId = nextCron;
                CronStatus();
            } else {
                parentAdapter.log.error("wrong configuraton for time to reset fireplace mode: " + parentAdapter.config.UseFireplaceModeResetAt + " = " + Hour + ":" + Minute);
            }
        } else {
            parentAdapter.log.error("wrong configuraton (2) for time to reset fireplace mode: " + parentAdapter.config.UseFireplaceModeResetAt);
        }

    } catch (e) {
        parentAdapter.log.error("exception in StartTimer2ResetFireplaceMode [" + e + "]  ");
    }
}
function StopFireplaceMode() {
    parentAdapter.log.info("FireplaceMode ended");
    parentAdapter.setState("FireplaceModeActive", { ack: false, val: false });

    cronJobs[cronFireplaceModeId].stop();
}


//*******************************************************************
//
async function CreateTimerList(PeriodName, currentProfile, rooms) {

    const timerList = [];

    for (let room = 0; room < rooms.length; room++) {

        //only per room, not global
        let LastTimeSetHour = -1;
        let LastTimeSetMinute = -1;

        //parentAdapter.log.warn("create timer list " + rooms[room].Name + " public holiday " + rooms[room].PublicHolidyToday);

        //public holiday or holiday at home
        if (PeriodName == "Mo-Fr" && rooms[room].PublicHolidyToday && parentAdapter.config.PublicHolidayLikeSunday === true) {
            PeriodName = "Sa-Su";
            parentAdapter.log.debug(rooms[room].Name + " week end profile used for public holiday");
        } else if (PeriodName == "Mo-Fr" && rooms[room].HolidayPresent && parentAdapter.config.HolidayPresentLikeSunday === true) {
            PeriodName = "Sa-Su";
            parentAdapter.log.debug(rooms[room].Name + " week end profile used for holiday at home");
        } else if (PeriodName == "Mon" || PeriodName == "Tue" || PeriodName == "Wed" || PeriodName == "Thu" || PeriodName == "Fri" || PeriodName == "Sat") {
            if (rooms[room].PublicHolidyToday && parentAdapter.config.PublicHolidayLikeSunday === true) {
                PeriodName = "Sun";
                parentAdapter.log.debug(rooms[room].Name + " sunday profile used for public holiday");
            } else if (rooms[room].HolidayPresent && parentAdapter.config.HolidayPresentLikeSunday === true) {
                PeriodName = "Sun";
                parentAdapter.log.debug(rooms[room].Name + " sunday profile used for holiday at home");
            }
        }

        for (let period = 1; period <= parentAdapter.config.NumberOfPeriods; period++) {

            const id = "Profiles." + currentProfile + "." + rooms[room].Name + "." + PeriodName + ".Periods." + period; // + ".time";

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

            const TimeSetHour = parseInt(nextTimes[0]);
            const TimeSetMinute = parseInt(nextTimes[1]);

            let currentTimePeriod = -1;

            if (PeriodName == "Mo-Su") {
                currentTimePeriod = period;
            } else if (PeriodName == "Mo-Fr") {
                currentTimePeriod = period;
            } else if (PeriodName == "Sa-Su") {
                //currentTimePeriod = parseInt(parentAdapter.config.NumberOfPeriods) + period;
                currentTimePeriod = NumberOfPeriodsinVis + period;
            } else if (PeriodName == "Mon") {
                currentTimePeriod = period;
            } else if (PeriodName == "Tue") {
                //currentTimePeriod = 1 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                currentTimePeriod = 1 * NumberOfPeriodsinVis + period;
            } else if (PeriodName == "Wed") {
                //currentTimePeriod = 2 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                currentTimePeriod = 2 * NumberOfPeriodsinVis + period;
            } else if (PeriodName == "Thu") {
                //currentTimePeriod = 3 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                currentTimePeriod = 3 * NumberOfPeriodsinVis + period;
            } else if (PeriodName == "Fri") {
                //currentTimePeriod = 4 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                currentTimePeriod = 4 * NumberOfPeriodsinVis + period;
            } else if (PeriodName == "Sat") {
                //currentTimePeriod = 5 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                currentTimePeriod = 5 * NumberOfPeriodsinVis + period;
            } else if (PeriodName == "Sun") {
                //currentTimePeriod = 6 * parseInt(parentAdapter.config.NumberOfPeriods) + period;
                currentTimePeriod = 6 * NumberOfPeriodsinVis + period;
            }


            if (!bFound) {

                //see issue 13
                if (TimeSetHour > LastTimeSetHour || (TimeSetHour === LastTimeSetHour && TimeSetMinute > LastTimeSetMinute)) {

                    LastTimeSetHour = TimeSetHour;
                    LastTimeSetMinute = TimeSetMinute;

                    //parentAdapter.log.debug("push to list " + " = " + nextTimes);

                    const values2Set = [];

                    const CurrentTimePeriodTime = ("0" + TimeSetHour).slice(-2) + ":" + ("0" + TimeSetMinute).slice(-2);
                    const CurrentTimePeriodFull = "Period " + period + " " + CurrentTimePeriodTime;

                    values2Set.push({
                        room: rooms[room].Name,
                        target: nextTemperature.val,
                        currentTimePeriod: currentTimePeriod,
                        ActiveTimeSlot: period,
                        CurrentTimePeriodTime: CurrentTimePeriodTime,
                        CurrentTimePeriodFull: CurrentTimePeriodFull
                    });

                    timerList.push({
                        hour: TimeSetHour,
                        minute: TimeSetMinute,
                        day: 0,
                        Values2Set: values2Set
                    });
                } else {
                    parentAdapter.log.warn("wrong order of periods in " + rooms[room].Name + " : " + TimeSetHour + ":" + TimeSetMinute + " is smaller then " + LastTimeSetHour + ":" + LastTimeSetMinute + ". Please reorder periods");
                }
            } else {
                //update ValuesToSet only for the room

                const values2Set = timerList[timerListIdx].Values2Set;

                //parentAdapter.log.debug("update " + JSON.stringify(values2Set));

                const CurrentTimePeriodTime = ("0" + TimeSetHour).slice(-2) + ":" + ("0" + TimeSetMinute).slice(-2);
                const CurrentTimePeriodFull = "Period " + period + " " + CurrentTimePeriodTime;

                values2Set.push({
                    room: rooms[room].Name,
                    target: nextTemperature.val,
                    currentTimePeriod: currentTimePeriod,
                    ActiveTimeSlot: period,
                    CurrentTimePeriodTime: CurrentTimePeriodTime,
                    CurrentTimePeriodFull: CurrentTimePeriodFull
                });


                timerList[timerListIdx].Values2Set = values2Set;
            }
        }
    }
    return timerList;
}

async function CreateCronJobsProfiletype1( currentProfile, rooms) {
    parentAdapter.log.info("start create cron jobs for profile type 1 (Mo - Su)");

    const timerList = await CreateTimerList("Mo-Su", currentProfile, rooms);
    
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
    parentAdapter.log.debug("ChangeStatus fired with " + JSON.stringify(data));

    //changeStatus fired with [{"room":"Wohnzimmer","target":21},{"room":"Küche","target":21}]

    for (let i = 0; i < data.length; i++) {

        if (cbChangeStatus != null) {
            cbChangeStatus("ProfilPoint", data[i].room, data[i]);
        }
    }
}

async function CreateCronJobsProfiletype2(currentProfile, rooms) {
    parentAdapter.log.info("start create cron jobs for profile type 2 (Mo-Fr / Sa - Su)");

    const timerList1 = await CreateTimerList("Mo-Fr", currentProfile, rooms);
    const timerList2 = await CreateTimerList("Sa-Su", currentProfile, rooms);

    parentAdapter.log.debug("cron jobs created " + JSON.stringify(timerList1) + " " + JSON.stringify(timerList2));

    //now create cron jobs..
    for (let i = 0; i < timerList1.length; i++) {
        CronCreate(timerList1[i].hour, timerList1[i].minute, -1, ChangeStatus, timerList1[i].Values2Set);
    }
    for (let i = 0; i < timerList2.length; i++) {
        CronCreate(timerList2[i].hour, timerList2[i].minute, -2, ChangeStatus, timerList2[i].Values2Set);
    }
}
async function CreateCronJobsProfiletype3(currentProfile, rooms) {
    parentAdapter.log.info("start create cron jobs for profile type 3 (every day)");

    const timerList1 = await CreateTimerList("Mon", currentProfile, rooms);
    const timerList2 = await CreateTimerList("Tue", currentProfile, rooms);
    const timerList3 = await CreateTimerList("Wed", currentProfile, rooms);
    const timerList4 = await CreateTimerList("Thu", currentProfile, rooms);
    const timerList5 = await CreateTimerList("Fri", currentProfile, rooms);
    const timerList6 = await CreateTimerList("Sat", currentProfile, rooms);
    const timerList7 = await CreateTimerList("Sun", currentProfile, rooms);

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
    CronStop,
    NumberOfPeriodsinVis,
    StartTimer2ResetFireplaceMode
};