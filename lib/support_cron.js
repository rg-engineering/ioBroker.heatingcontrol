"use strict";

//===================================================================================
// external imports
const CronJob = require("cron").CronJob;


//===================================================================================
//globals
let cronJobs = [];


//#######################################
// cron fucntions


function CronCreate(adapter,Hour, Minute, day, callback) {

    try {

        const timezone = adapter.config.timezone || "Europe/Berlin";

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

        adapter.log.debug("create cron job #" + nextCron + " at " + Hour + ":" + Minute + " string: " + cronString + " " + timezone);

        //details see https://www.npmjs.com/package/cron
        cronJobs[nextCron] = new CronJob(cronString,
            () => callback,
            () => adapter.log.debug("cron job stopped"), // This function is executed when the job stops
            true,
            timezone
        );

    }
    catch (e) {
        adapter.log.error("exception in CronCreate [" + e + "]");
    }
}


function getCronStat(adapter) {
    let n = 0;
    let length = 0;
    try {
        if (typeof cronJobs !== undefined && cronJobs != null) {

            length = cronJobs.length;
            //adapter.log.debug("cron jobs");
            for (n = 0; n < length; n++) {
                if (typeof cronJobs[n] !== undefined && cronJobs[n] != null) {
                    adapter.log.debug("cron status = " + cronJobs[n].running + " next event: " + timeConverter(cronJobs[n].nextDates()));
                }
            }

            if (length > 500) {
                adapter.log.warn("more then 500 cron jobs existing for this adapter, this might be a configuration error! (" + length + ")");
            }
            else {
                adapter.log.info(length + " cron job(s) created");
            }
        }
    }
    catch (e) {
        adapter.log.error("exception in getCronStat [" + e + "] : " + n + " of " + length);
    }
}

function deleteCronJob(id) {

    cronJobs[id].stop();

    if (id === cronJobs.length - 1) {
        cronJobs.pop(); //remove last
    }
    else {
        delete cronJobs[id];
    }
    getCronStat();


}

function CronStop(adapter) {
    if (cronJobs.length > 0) {
        adapter.log.debug("delete " + cronJobs.length + " cron jobs");
        //cancel all cron jobs...
        const start = cronJobs.length - 1;
        for (let n = start; n >= 0; n--) {
            //adapter.log.debug("stop cron job " + n);
            cronJobs[n].stop();
        }
        cronJobs = [];
    }
}



module.exports = {
    CronCreate,
    getCronStat,
    deleteCronJob,
    CronStop
};