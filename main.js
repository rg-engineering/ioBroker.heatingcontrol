/*
 * heatingcontrol V2 adapter für iobroker
 *
 * Created: 25.10.2020 
 *  Author: René G.

*/

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

//===================================================================================
// external imports
const utils = require("@iobroker/adapter-core");


//===================================================================================
//own imports
//support_tools
//const findObjectByKey = require("./lib/support_tools.js").findObjectByKey;
//const findObjectIdByKey = require("./lib/support_tools.js").findObjectIdByKey;
//const findObjectsByKey = require("./lib/support_tools.js").findObjectsByKey;
//const findObjectsIdByKey = require("./lib/support_tools.js").findObjectsIdByKey;
const GetSystemLanguage = require("./lib/support_tools.js").GetSystemLanguage;


//database
//const GetAllRooms = require("./lib/database").GetAllRooms;

//AdapterConfigIfc
//const GetAllFunctions = require("./lib/AdapterConfigIfc").GetAllFunctions;
//const GetAllRooms = require("./lib/AdapterConfigIfc").GetAllRooms;
const GetNewRooms = require("./lib/AdapterConfigIfc").GetNewRooms;
const GetNewThermostats = require("./lib/AdapterConfigIfc").GetNewThermostats;
const GetNewActors = require("./lib/AdapterConfigIfc").GetNewActors;
const GetNewSensors = require("./lib/AdapterConfigIfc").GetNewSensors;

//support_cron
const CronStop = require("./lib/support_cron.js").cronStop;

//===================================================================================
//globals
//let vis = null;
let SystemLanguage;

let adapter;
function startAdapter(options) {
    options = options || {};
    Object.assign(options, {
        name: "heatingcontrol",
        //#######################################
        //
        ready: function () {
            try {
                //adapter.log.debug("start");
                main();
            }
            catch (e) {
                adapter.log.error("exception catch after ready [" + e + "]");
            }
        },
        //#######################################
        //  is called when adapter shuts down
        unload: function (callback) {
            try {
                adapter && adapter.log && adapter.log.info && adapter.log.info("cleaned everything up...");
                CronStop();
                callback();
            } catch (e) {
                callback();
            }



        },
        //#######################################
        //
        SIGINT: function () {
            adapter && adapter.log && adapter.log.info && adapter.log.info("cleaned everything up...");
            CronStop();
        },
        //#######################################
        //  is called if a subscribed object changes
        //objectChange: function (id, obj) {
        //    adapter.log.debug("[OBJECT CHANGE] ==== " + id + " === " + JSON.stringify(obj));
        //},
        //#######################################
        // is called if a subscribed state changes
        stateChange: function (id, state) {
            //adapter.log.debug("[STATE CHANGE] ==== " + id + " === " + JSON.stringify(state));
            HandleStateChange(id, state);
        },
        //#######################################
        //
        message: async (obj) => {
            if (obj) {
                switch (obj.command) {
                    case "send":
                        // e.g. send email or pushover or whatever
                        adapter.log.debug("send command");

                        // Send response in callback if required
                        if (obj.callback) adapter.sendTo(obj.from, obj.command, "Message received", obj.callback);
                        break;
                    //case "listDevices":
                        //adapter.log.debug("got list devices");
                    //    await ListDevices(obj);
                    //    break;
                    case "listNewRooms":
                        await ListNewRooms(obj);
                        break;
                    case "listNewThermostats":
                        await ListNewThermostats(obj);
                        break;
                    case "listNewActors":
                        await ListNewActors(obj);
                        break;
                    case "listNewSensors":
                        await ListNewSensors(obj);
                        break;
                    //case "listRooms":
                        //adapter.log.debug("got list rooms");
                    //    await ListRooms(obj);
                    //    break;
                    //case "listFunctions":
                        //adapter.log.debug("got list rooms");
                    //    await ListFunctions(obj);
                    //    break;
                    case "Test":
                        //adapter.sendTo(obj.from, obj.command, "das ist ein Test", obj.callback);
                        break;
                    default:
                        adapter.log.error("unknown message " + obj.command);
                        break;
                }
            }
        }
    });
    adapter = new utils.Adapter(options);

    return adapter;
}

//#######################################
//
async function main() {
    try {
        SystemLanguage = await GetSystemLanguage(adapter);
        await CreateDatepoints();
        await SetDefaults();
        await SetInfo();
        await SetCurrent(); 


    }
    catch (e) {
        adapter.log.error("exception in  main [" + e + "]");
    }
}

//*******************************************************************
//
// handles state changes of subscribed states
async function HandleStateChange(id, state) {

    adapter.log.debug("### handle state change " + id + " " + JSON.stringify(state));

    try {
        adapter.log.warn("nothing handled");
    }
    catch (e) {
        adapter.log.error("exception in HandleStateChange [" + e + "]");
    }
}


//#######################################
//
// create all necessary datapaoints
// will be called at ecery start of adapter
async function CreateDatepoints() {

    adapter.log.debug("start CreateDatepoints");

    try {
        //===================================================================================
        await CreateDatepoint("LastProgramRun", "state", "value", "string", "", true, false);
        await CreateDatepoint("CurrentProfile", "state", "value", "number", "", true, false);
        await CreateDatepoint("HeatingPeriodActive", "state", "value", "boolean", "", true, true);
        await CreateDatepoint("PublicHolidyToday", "state", "value", "boolean", "", true, true);
        await CreateDatepoint("Present", "state", "value", "boolean", "", true, true);
        await CreateDatepoint("PartyNow", "state", "value", "boolean", "", true, true);
        await CreateDatepoint("GuestsPresent", "state", "value", "boolean", "", true, true);
        await CreateDatepoint("HolidayPresent", "state", "value", "boolean", "", true, true);
        await CreateDatepoint("VacationAbsent", "state", "value", "boolean", "", true, true);
        if (adapter.config.UseActors) {
            await CreateDatepoint("ActorsOn", "state", "value", "number", "", true, true);
        }

        //===================================================================================
        await CreateDatepoint("info", "channel", "", "string", "", true, false);
        await CreateDatepoint("info.UsedRooms", "state", "value", "string", "", true, false);
        await CreateDatepoint("info.TemperatureDecreaseMode", "state", "value", "string", "", true, false);
        await CreateDatepoint("info.ProfileType", "state", "value", "string", "", true, false);
        await CreateDatepoint("info.NumberOfProfiles", "state", "value", "number", "", true, false);
        await CreateDatepoint("info.NumberOfPeriods", "state", "value", "number", "", true, false);
        await CreateDatepoint("info.PublicHolidayLikeSunday", "state", "value", "boolean", "", true, false);
        await CreateDatepoint("info.UseMinTempPerRoom", "state", "value", "boolean", "", true, false);
        await CreateDatepoint("info.UseFixHeatingPeriod", "state", "value", "boolean", "", true, false);
        if (adapter.config.UseFixHeatingPeriod) {
            await CreateDatepoint("info.FixHeatingPeriodStart", "state", "value", "string", "", true, false);
            await CreateDatepoint("info.FixHeatingPeriodEnd", "state", "value", "string", "", true, false);
        }

        //===================================================================================
        await CreateDatepoint("rooms", "channel", "", "string", "", true, false);
        for (let room = 0; room < adapter.config.rooms.length; room++) {
            if (adapter.config.rooms[room].isActive) {

                const key = "Rooms." + adapter.config.rooms[room].name;
                await CreateDatepoint(key, "channel", "", "string", "", true, false);

                await CreateDatepoint(key + ".CurrentTarget", "state", "value", "number", "°C", true, false);
                await CreateDatepoint(key + ".ActiveTimeSlot", "state", "value", "number", "", true, false);
                await CreateDatepoint(key + ".CurrentTimePeriodFull", "state", "value", "string", "", true, false);
                await CreateDatepoint(key + ".CurrentTimePeriod", "state", "value", "number", "", true, false);
                await CreateDatepoint(key + ".CurrentTimePeriodTime", "state", "value", "string", "", true, false);
                await CreateDatepoint(key + ".WindowIsOpen", "state", "value", "boolean", "", true, false);
                await CreateDatepoint(key + ".State", "state", "value", "string", "", true, false);
                await CreateDatepoint(key + ".TemperaturOverride", "state", "value", "number", "", true, true);
                await CreateDatepoint(key + ".TemperaturOverrideTime", "state", "value", "string", "hh:mm", true, true);
                if (adapter.config.ThermostatModeIfNoHeatingperiod == 1) {
                    await CreateDatepoint(key + ".TemperatureIfNoHeatingPeriod", "state", "value", "number", "°C", true, true);
                }
                if (adapter.config.UseMinTempPerRoom) {
                    await CreateDatepoint(key + ".MinimumTemperature", "state", "value", "number", "°C", true, true);
                }
                if (parseInt(adapter.config.UseChangesFromThermostat) === 4) { //each room reparately
                    await CreateDatepoint(key + ".ChangesFromThermostatMode", "state", "value", "number", "", true, true);
                }
            }
        }

        //===================================================================================
        await CreateDatepoint("Profiles", "channel", "", "string", "", true, false);
        for (let profile = 0; profile < parseInt(adapter.config.NumberOfProfiles, 10); profile++) {
            const key = "Profiles." + profile;
            await CreateDatepoint(key, "channel", "", "string", "", true, false);
            for (let room = 0; room < adapter.config.rooms.length; room++) {
                if (adapter.config.rooms[room].isActive) {
                    const id = key + "." + adapter.config.rooms[room].name;
                    await CreateDatepoint(id, "channel", "", "string", "", true, false);

                    let id1 = id;
                    let decreaseMode = false;
                    if (parseInt(adapter.config.TemperatureDecrease) === 1) {// relative
                        id1 += ".relative";
                        decreaseMode = true;
                    }
                    else if (parseInt(adapter.config.TemperatureDecrease) === 2) {// absolutue
                        id1 += ".absolute";
                        decreaseMode = true;
                    }

                    if (decreaseMode) {
                        await CreateDatepoint(id1, "channel", "", "string", "", true, false);
                        await CreateDatepoint(id1 + ".GuestIncrease", "state", "value", "number", "°C", true, true);
                        await CreateDatepoint(id1 + ".PartyDecrease", "state", "value", "number", "°C", true, true);
                        await CreateDatepoint(id1 + ".WindowOpenDecrease", "state", "value", "number", "°C", true, true);
                        await CreateDatepoint(id1 + ".AbsentDecrease", "state", "value", "number", "°C", true, true);
                        await CreateDatepoint(id1 + ".VacationAbsentDecrease", "state", "value", "number", "°C", true, true);
                    }

                    if (parseInt(adapter.config.ProfileType, 10) === 1) {

                    }


                }
            }
        }


    }
    catch (e) {
        adapter.log.error("exception in CreateDatapoints [" + e + "]");
    }

    adapter.log.debug("CreateDatepoints done");
}

async function CreateDatepoint(key,type,common_role,common_type,common_unit,common_read,common_write ) {
    
    await adapter.setObjectNotExistsAsync(key, {
        type: type,
        common: {
            name: key,
            role: common_role,
            type: common_type,
            unit: common_unit,
            read: common_read,
            write: common_write
        },
        native: { id: key }
    });

    const obj = await adapter.getObjectAsync(key);

    if (obj != null) {

        if (obj.common.role != common_role
            || obj.common.type != common_type
            || obj.common.unit != common_unit
            || obj.common.read != common_read
            || obj.common.write != common_write
        ) {
            await adapter.extendObject(key, {
                common: {
                    name: key,
                    role: common_role,
                    type: common_type,
                    unit: common_unit,
                    read: common_read,
                    write: common_write
                }
            });
        }
    }

}
//#######################################
//
async function SetDefaults() {

    adapter.log.debug("start SetDefaults");

    try {
        await SetDefault("CurrentProfile", 1);
        await SetDefault("HeatingPeriodActive", true);
        await SetDefault("PublicHolidyToday", false);
        await SetDefault("Present",  true);
        await SetDefault("PartyNow", false);
        await SetDefault("GuestsPresent", false);
        await SetDefault("HolidayPresent", false);
        await SetDefault("VacationAbsent", false);
        
    }
    catch (e) {
        adapter.log.error("exception in SetDefaults [" + e + "]");
    }

    adapter.log.debug("SetDefaults done");
}

async function SetDefault(key, value) {
    const current = await adapter.getStateAsync(key);
    //set default only if nothing was set before
    if (current === null || typeof current.val == undefined) {
        await adapter.setStateAsync(key, { ack: true, val: value });
    }
}

/*
//#######################################
//
async function ListDevices(obj) {

    const devices = null;

    adapter.sendTo(obj.from, obj.command, devices, obj.callback);

}
*/


//#######################################
//
async function ListNewRooms(obj) {
    const rooms = null;
    try {
        await GetNewRooms(adapter, SystemLanguage);
    }
    catch (e) {
        adapter.log.error("exception in ListNewRooms [" + e + "]");
    }
    adapter.sendTo(obj.from, obj.command, rooms, obj.callback);
}

//#######################################
//
async function ListNewThermostats(obj) {
    const thermostats = null;
    const room = obj.room;

    try {
        await GetNewThermostats(adapter, SystemLanguage, room);
    }
    catch (e) {
        adapter.log.error("exception in ListNewThermostats [" + e + "]");
    }
    adapter.sendTo(obj.from, obj.command, thermostats, obj.callback);
}

//#######################################
//
async function ListNewActors(obj) {
    const actors = null;
    const room = obj.room;
    try {
        await GetNewActors(adapter, SystemLanguage, room);
    }
    catch (e) {
        adapter.log.error("exception in ListNewActors [" + e + "]");
    }
    adapter.sendTo(obj.from, obj.command, actors, obj.callback);
}

//#######################################
//
async function ListNewSensors(obj) {
    const sensors = null;
    const room = obj.room;
    try {
        await GetNewSensors(adapter, SystemLanguage, room);
    }
    catch (e) {
        adapter.log.error("exception in ListNewSensors [" + e + "]");
    }
    adapter.sendTo(obj.from, obj.command, sensors, obj.callback);
}

/*
async function ListRooms(obj) {
    const rooms = null;
    try {
        GetAllRooms();
    }
    catch (e) {
        adapter.log.error("exception in ListRooms [" + e + "]");
    }
    adapter.sendTo(obj.from, obj.command, rooms, obj.callback);
}
*/

/*
async function ListFunctions(obj) {
    let functions = null;
    try {
        functions = await GetAllFunctions(adapter, SystemLanguage);
    }
    catch (e) {
        adapter.log.error("exception in ListFunctions [" + e + "]");
    }
    adapter.sendTo(obj.from, obj.command, functions, obj.callback);
}
*/

// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}