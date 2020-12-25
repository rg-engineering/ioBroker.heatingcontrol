/*
 * heatingcontrol adapter für iobroker
 *
 * Created: 30.07.2019 21:31:28
 *  Author: Rene

*/

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";





// you have to require the utils module and call adapter function
const utils = require("@iobroker/adapter-core");

const findObjectByKey = require("./lib/support_tools.js").findObjectByKey;


const GetCurrentProfile = require("./lib/database").GetCurrentProfile;


//======================================
const CreateDatapoints = require("./lib/datapoints").CreateDatapoints;
const SetDefaults = require("./lib/datapoints").SetDefaults;
const SetCurrent = require("./lib/datapoints").SetCurrent;
const SetInfo = require("./lib/datapoints").SetInfo;
const SubscribeAllStates = require("./lib/datapoints").SubscribeAllStates;
const CheckConfiguration = require("./lib/datapoints").CheckConfiguration;

const CronStop = require("./lib/cronjobs").CronStop;

const CreateDatabase = require("./lib/database").CreateDatabase;
const ChangeStatus = require("./lib/database").ChangeStatus;
const SubscribeDevices = require("./lib/database").SubscribeDevices;
const CheckStateChangeDevice = require("./lib/database").CheckStateChangeDevice;
const StartStatemachine = require("./lib/database").StartStatemachine;

const StartVis = require("./lib/vis").StartVis;
const HandleStateChangeVis = require("./lib/vis").HandleStateChangeVis;

const CreateCronJobs = require("./lib/cronjobs").CreateCronJobs;

const Check4Thermostat = require("./lib/devicedetect").Check4Thermostat;
const Check4Actor = require("./lib/devicedetect").Check4Actor;
const Check4Sensor = require("./lib/devicedetect").Check4Sensor;

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
                    case "listRooms":
                        //adapter.log.debug("got list rooms");
                        await ListRooms(obj);
                        break;
                    case "listFunctions":
                        //adapter.log.debug("got list rooms");
                        await ListFunctions(obj);
                        break;
                    case "listThermostats":
                        //adapter.log.debug("got list thermostats");
                        await ListThermostats(obj);
                        break;
                    case "listActors":
                        //adapter.log.debug("got list actors");
                        await ListActors(obj);
                        break;
                    case "listSensors":
                        //adapter.log.debug("got list sensors");
                        await ListSensors(obj);
                        break;
                    case "saveProfile":
                        //adapter.log.debug("got save profile");
                        await SaveProfile(obj);
                        break;
                    case "loadProfile":
                        //adapter.log.debug("got save profile");
                        await LoadProfile(obj);
                        break;
                    case "deleteUnusedDP":
                        //adapter.log.debug("got save profile");
                        await deleteUnusedDP(obj);
                        break;
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
        adapter.log.debug("devices " + JSON.stringify(adapter.config.devices));

        //======================================
        


        SystemLanguage = await GetSystemLanguage();

        await CreateDatabase(adapter, SystemLanguage );

        await CreateDatapoints(adapter);
        await SetDefaults();
        await SetInfo();
        await SetCurrent();
        await SubscribeAllStates();
        await SubscribeDevices();
        await CheckConfiguration();


        const currentProfile = await GetCurrentProfile();
        await CreateCronJobs(adapter, currentProfile, ChangeStatus);
        //StartTestCron();

        await checkHeatingPeriod();

        await StartVis(adapter, SystemLanguage);

        await StartStatemachine();
    }
    catch (e) {
        adapter.log.error("exception in  main [" + e + "]");
    }
}

async function GetSystemLanguage() {
    let language = "de";
    const ret = await adapter.getForeignObjectAsync("system.config");

    language = ret.common.language;
    adapter.log.debug("got system language " + language);
    return language;
}

async function SearchRoomAndFunction(roomName, gewerk) {

    let status = "to do";
    const devices = [];

    let allRooms = {};
    //get room enums first; this includes members as well
    const AllRoomsEnum = await adapter.getEnumAsync("rooms");
    allRooms = AllRoomsEnum.result;

    //find the right room with members
    let roomMembers = {};
    let roomFound = false;
    for (const e in allRooms) {

        let name = undefined;

        if (typeof allRooms[e].common.name === "string") {
            name = allRooms[e].common.name;
        }
        else if (typeof allRooms[e].common.name === "object") {
            name = allRooms[e].common.name[SystemLanguage];
        }
        else {
            adapter.log.warn("unknown type " + typeof allRooms[e].common.name + " " + JSON.stringify(allRooms[e].common.name));
        }
        //adapter.log.debug("check room " + name + " =? " + roomName );

        if (name === roomName) {
            adapter.log.debug("### room found with members " + JSON.stringify(allRooms[e].common.members));
            roomMembers = allRooms[e].common.members;
            roomFound = true;
        }
    }

    if (roomFound && roomMembers != null && roomMembers.length > 0) {

        let allFunctions = {};
        const AllFunctionsEnum = await adapter.getEnumAsync("functions");
        allFunctions = AllFunctionsEnum.result;

        //adapter.log.debug("gewerke " + JSON.stringify(allFunctions));

        //find the function / gewerk room with members
        let functionMembers = {};
        let functionFound = false;
        for (const e in allFunctions) {

            let name = undefined;

            if (typeof allFunctions[e].common.name === "string") {
                name = allFunctions[e].common.name;
            }
            else if (typeof allFunctions[e].common.name === "object") {
                name = allFunctions[e].common.name[SystemLanguage];
            }
            else {
                adapter.log.warn("unknown type " + typeof allFunctions[e].common.name + " " + JSON.stringify(allFunctions[e].common.name));
            }

            //adapter.log.debug("check function " + name + " =? " + gewerk);

            if (name === gewerk) {
                adapter.log.debug("### function found with members " + JSON.stringify(allFunctions[e].common.members));
                functionMembers = allFunctions[e].common.members;
                functionFound = true;
            }
        }

        if (functionFound && functionMembers != null && functionMembers.length > 0) {

            //now find devices in both lists (room and gewerk)
            
            for (const r in roomMembers) {

                for (const d in functionMembers) {

                    if (roomMembers[r] == functionMembers[d]) {

                        //look for it in adapter.config.devices

                        let found = findObjectByKey(adapter.config.devices, "OID_Target", roomMembers[r]);
                        adapter.log.debug("found " + JSON.stringify(found));

                        if (found ==null) {

                            found = findObjectByKey(adapter.config.devices, "OID_Current", roomMembers[r]);
                            adapter.log.debug("found " + JSON.stringify(found));

                            if (found == null) {

                                const deviceObj = await adapter.getForeignObjectAsync(roomMembers[r]);

                                devices.push({
                                    name: roomMembers[r],
                                    obj: deviceObj
                                });
                            }
                        }
                    }
                }
            }

            status = " room and function found " + JSON.stringify(devices);
        }
        else {
            if (!functionFound) {
                status = "function " + gewerk + " not found found in enum ";
            }



            else {
                status = "function " + gewerk + " has no devices ";
            }
            adapter.log.debug(status);
        }
    }
    else {
        if (!roomFound) {
            status = "room " + roomName + " not found found in enum ";
        }
        else {
            status = "room " + roomName + " has no devices ";
        }
        adapter.log.debug(status);

    }

    const returnObject = {
        devices:devices,
        status:status
    };

    return returnObject;
}


async function ListThermostats(obj) {
    adapter.log.debug("ListThermostats " + JSON.stringify(obj));

    const roomName = obj.message.room;
    const gewerk = obj.message.gewerk;

    const result = await SearchRoomAndFunction(roomName, gewerk);
    let status = "";
    const devices = [];

    if (result.devices.length > 0) {
        adapter.log.debug("ListThermostats " + JSON.stringify(result));

        let AlreadyUsed = false;
        for (const d in result.devices) {

            const resultCheck = await Check4Thermostat(adapter, result.devices[d].obj);

            adapter.log.debug("got for " + JSON.stringify(resultCheck));

            if (resultCheck.found) {

                const found = findObjectByKey(adapter.config.devices, "OID_Target", resultCheck.device.OID_Target);
                adapter.log.debug("found " + JSON.stringify(found));
                if (found == null) {
                    adapter.log.debug("push to list ");
                    devices.push(resultCheck.device);
                }
                else {
                    AlreadyUsed = true;
                    adapter.log.debug("alread used ");
                }
            }
        }

        if (devices.length > 0) {
            status = devices.length + " devices found";
        }
        else {
            if (AlreadyUsed) {
                status = "devices found, but already used";

            }
            else {
                status = "unknown devices found, please add it manually";
            }
        }
    }
    else {
        status = result.status;
    }

    const returnObject = {
        list: devices,
        status: status
    };
    adapter.sendTo(obj.from, obj.command, returnObject, obj.callback);
}

async function ListActors(obj) {
    adapter.log.debug("ListActors " + JSON.stringify(obj));

    const roomName = obj.message.room;
    const gewerk = obj.message.gewerk;

    const result = await SearchRoomAndFunction(roomName, gewerk);
    let status = "";
    const devices = [];

    if (result.devices.length > 0) {
        adapter.log.debug("ListActors " + JSON.stringify(result));

        let AlreadyUsed = false;
        for (const d in result.devices) {

            const resultCheck = await Check4Actor(adapter, result.devices[d].obj);

            adapter.log.debug("got for " + JSON.stringify(resultCheck));

            if (resultCheck.found) {
                const found = findObjectByKey(adapter.config.devices, "OID", resultCheck.device.OID);
                adapter.log.debug("found " + JSON.stringify(found));
                if (found == null) {
                    adapter.log.debug("push to list ");
                    devices.push(resultCheck.device);
                }
                else {
                    AlreadyUsed = true;
                    adapter.log.debug("alread used ");
                }
            }
        }

        if (devices.length > 0) {
            status = devices.length + " devices found";
        }
        else {
            if (AlreadyUsed) {
                status = "devices found, but already used";

            }
            else {
                status = "unknown devices found, please add it manually";
            }
        }
    }
    else {
        status = result.status;
    }


    const returnObject = {
        list: devices,
        status: status
    };

    adapter.sendTo(obj.from, obj.command, returnObject, obj.callback);
}

async function ListSensors(obj) {
    adapter.log.debug("ListSensors " + JSON.stringify(obj));

    const roomName = obj.message.room;
    const gewerk = obj.message.gewerk;

    const result = await SearchRoomAndFunction(roomName, gewerk);
    let status = "";
    const devices = [];

    if (result.devices.length > 0) {
        adapter.log.debug("ListSensors " + JSON.stringify(result));

        let AlreadyUsed = false;
        for (const d in result.devices) {

            const resultCheck = await Check4Sensor(adapter, result.devices[d].obj);

            adapter.log.debug("got for " + JSON.stringify(resultCheck));

            if (resultCheck.found) {
                const found = findObjectByKey(adapter.config.devices, "OID", resultCheck.device.OID);

                adapter.log.debug("found " + JSON.stringify(found));

                if (found == null) {
                    adapter.log.debug("push to list ");
                    devices.push(resultCheck.device);
                }
                else {
                    AlreadyUsed = true;
                    adapter.log.debug("alread used ");
                }
            }
        }

        if (devices.length > 0) {
            status = devices.length + " devices found";
        }
        else {
            if (AlreadyUsed) {
                status = "devices found, but already used";

            }
            else {
                status = "unknown devices found, please add it manually";
            }
        }
    }
    else {
        status = result.status;
    }


    const returnObject = {
        list: devices,
        status: status,
        room: roomName
    };

    adapter.sendTo(obj.from, obj.command, returnObject, obj.callback);
}

async function ListRooms(obj) {

    adapter.log.debug("ListRooms " + JSON.stringify(obj));

    let rooms = {};
    //get room enums first; this includes members as well
    const AllRoomsEnum = await adapter.getEnumAsync("rooms");
    rooms = AllRoomsEnum.result;
    adapter.log.debug("rooms " + JSON.stringify(rooms));

    const language = await GetSystemLanguage();
    let newRooms = 0;
    for (const e in rooms) {

        let name = undefined;

        if (typeof rooms[e].common.name === "string") {
            name = rooms[e].common.name;
        }
        else if (typeof rooms[e].common.name === "object") {
            name = rooms[e].common.name.de;

            name = rooms[e].common.name[language];
            //adapter.log.warn("room name " + name + " " + JSON.stringify(rooms[e].common.name));
        }
        else {
            adapter.log.warn("unknown type " + typeof rooms[e].common.name + " " + JSON.stringify(rooms[e].common.name));
        }

        const roomdata = findObjectByKey(adapter.config.rooms, "name", name);

        if (roomdata !== null) {
           
            adapter.log.debug("Listrooms room " + name + " already exist");
        }
        else {
            adapter.log.debug("Listrooms found new room " + name);

            newRooms++;
            adapter.config.rooms.push({
                name: name,
                isActive: false    //must be enabled manually, otherwise we create too many datapoints for unused rooms 
            });
        }
    }

    adapter.log.debug("all rooms done with " + newRooms + " new rooms :" + JSON.stringify(adapter.config.rooms));

    const returnObject = {
        list: adapter.config.rooms,
        newRooms: newRooms
    };

    adapter.sendTo(obj.from, obj.command, returnObject, obj.callback);
}

async function ListFunctions(obj) {

    adapter.log.debug("### start ListFunctions");

    const enumFunctions = [];
    
    const AllFunctionsEnum = await adapter.getEnumAsync("functions");
    //adapter.log.debug("function enums: " + JSON.stringify(AllFunctionsEnum));
    const functions = AllFunctionsEnum.result;

    for (const e1 in functions) {

        let name = undefined;

        if (typeof functions[e1].common.name === "string") {
            name = functions[e1].common.name;
        }
        else if (typeof functions[e1].common.name === "object") {
            name = functions[e1].common.name[SystemLanguage];
        }
        else {
            adapter.log.warn("unknown type " + typeof functions[e1].common.name + " " + JSON.stringify(functions[e1].common.name));
        }

        enumFunctions.push({
            name: name
        }
        );

    }
    adapter.log.debug("all functions done " + JSON.stringify(enumFunctions));

    adapter.sendTo(obj.from, obj.command, enumFunctions, obj.callback);
}

async function HandleStateChange(id, state) {
    try {
        if ( state && state.ack !== true) {
            //handle only, if not ack'ed
            adapter.log.debug("### handle state change " + id + " " + JSON.stringify(state));

            let handled = false;
            const ids = id.split("."); //

            //my own datapoints?
            if (ids[0] == "heatingcontrol") {
                handled = await HandleStateChangeGeneral(id, state);
            }

            //external datapoints (e.g. present)
            if (!handled) {
                handled = await HandleStateChangeExternal(id, state);
            }

            //devices
            if (!handled) {
                handled = await HandleStateChangeDevices(id, state);
            }

            if (!handled) {
                adapter.log.warn("Statechange " + id + " not handled");
            }
            else {
                await adapter.setStateAsync(id, { ack: true });
            }
        }
    }
    catch (e) {
        adapter.log.error("exception in HandleStateChange [" + e + "]");
    }
}

async function HandleStateChangeGeneral(id, state) {
    let bRet = false;
    adapter.log.debug("HandleStateChangeGeneral " + id);

    try {
        const ids = id.split(".");

        //heatingcontrol.0.vis.ChoosenRoom 
        if (ids[2] === "vis"
            || ids[4] === "ActiveTimeSlot"
            || ids[4] === "CurrentTimePeriod"
            //heatingcontrol.0.Rooms.Wohnzimmer.WindowIsOpen
            || ids[4] === "WindowIsOpen"
            || ids[3] === "ProfileTypes"
            || ids[3] === "RoomValues"
            || ids[3] === "TempDecreaseValues") {
            bRet = await HandleStateChangeVis(id, state);
        }
        //heatingcontrol.0.CurrentProfile
        else if (ids[2] == "CurrentProfile") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
            HandleStateChangeVis(id, state);
        }
        //heatingcontrol.0.GuestsPresent
        else if (ids[2] == "HeatingPeriodActive") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        }
        else if (ids[2] == "PublicHolidyToday") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        }
        else if (ids[2] == "Present") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        }
        else if (ids[2] == "PartyNow") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        }
        else if (ids[2] == "GuestsPresent") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        }
        else if (ids[2] == "HolidayPresent") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        }
        else if (ids[2] == "VacationAbsent") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        }
        //heatingcontrol.0.Rooms.Küche.TemperaturOverride
        else if (ids[4] == "TemperaturOverride") {
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        }
        else if (ids[4] == "TemperaturOverrideTime") {
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        }
        else if (ids[4] == "TemperatureIfNoHeatingPeriod") {
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        }
        else if (ids[4] == "MinimumTemperature") {
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        }
        //heatingcontrol.0.Rooms.Wohnzimmer.ResetManual
        else if (ids[4] == "ResetManual") {
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        }
        //heatingcontrol.0.Profiles.1.Küche.Mo-Su.Periods.1.Temperature 
        else if (ids[2] == "Profiles") {
            bRet = true;

            //heatingcontrol.0.Profiles.1.CopyProfile
            //heatingcontrol.0.Profiles.1.Wohnzimmer.CopyProfile
            //heatingcontrol.0.Profiles.1.Wohnzimmer.Fri.CopyPeriods
            if (ids[4] == "CopyProfile")  {
                ChangeStatus(ids[4], "all", ids[3]);
            }
            else if (ids[5] == "CopyProfile") {
                ChangeStatus(ids[5], ids[4], ids[3]);
            }
            else if (ids[6] == "CopyPeriods") {
                ChangeStatus(ids[6], ids[4], ids[5]);
            }
            else {
                ChangeStatus(ids[2], ids[4], state.val);
            }
        }
    }
    catch (e) {
        adapter.log.error("exception in HandleStateChangeGeneral [" + e + "]");
    }
    return bRet;
}

async function HandleStateChangeExternal(id, state) {
    let bRet = false;
    //adapter.log.debug("HandleStateChangeExternal " + id);

    try {
        if (adapter.config.Path2PresentDP.length > 0) {
            if (id.includes(adapter.config.Path2PresentDP)) {
                let present = false;
                if (parseInt(adapter.config.Path2PresentDPType) === 1) {
                    present = state.val;
                }
                else {
                    if (state.val > parseInt(adapter.config.Path2PresentDPLimit)) {
                        present = true;
                    }
                }
                //heatingcontrol.0.Present
                await adapter.setStateAsync("Present", { val: present, ack: false });
                bRet = true;
            }
        }

        if (adapter.config.Path2VacationDP.length > 0) {
            if (id.includes(adapter.config.Path2VacationDP)) {
                //heatingcontrol.0.VacationAbsent
                await adapter.setStateAsync("VacationAbsent", { val: state.val, ack: false });
                bRet = true;
            }
        }

        if (adapter.config.Path2HolidayPresentDP.length > 0) {
            if (id.includes(adapter.config.Path2HolidayPresentDP)) {
                //heatingcontrol.0.HolidayPresent
                await adapter.setStateAsync("HolidayPresent", { val: state.val, ack: false });
                bRet = true;
            }
        }

        if (adapter.config.Path2GuestsPresentDP.length > 0) {
            if (id.includes(adapter.config.Path2GuestsPresentDP)) {  
                let guestpresent = false;
                if (parseInt(adapter.config.Path2GuestsPresentDPType) === 1) {
                    guestpresent = state.val;
                }
                else {
                    if (state.val > parseInt(adapter.config.Path2GuestsPresentDPLimit)) {
                        guestpresent = true;
                    }
                }
                //heatingcontrol.0.GuestsPresent
                await adapter.setStateAsync("GuestsPresent", { val: guestpresent, ack: false });
                bRet = true;
            }
        }

        if (adapter.config.Path2PartyNowDP.length > 0) {
            if (id.includes(adapter.config.Path2PartyNowDP)) {
                let partynow = false;
                if (parseInt(adapter.config.Path2PartyNowDPType) === 1) {
                    partynow = state.val;
                }
                else {
                    if (state.val > parseInt(adapter.config.Path2PartyNowDPLimit)) {
                        partynow = true;
                    }
                }
                //heatingcontrol.0.PartyNow
                await adapter.setStateAsync("PartyNow", { val: partynow, ack: false });
                bRet = true;
            }
        }

        if (adapter.config.Path2FeiertagAdapter.length > 0) {
            if (id.includes(adapter.config.Path2FeiertagAdapter)) {
                //heatingcontrol.0.PublicHolidyToday
                await adapter.setStateAsync("PublicHolidyToday", { val: state.val, ack: true });
                bRet = true;
            }
        }
    }
    catch (e) {
        adapter.log.error("exception in HandleStateChangeExternal [" + e + "]");
    }

    return bRet;
}


async function HandleStateChangeDevices(id, state) {
    let bRet = false;
    //adapter.log.debug("HandleStateChangeDevices " + id);
    try {
        bRet = CheckStateChangeDevice(id, state);
    }
    catch (e) {
        adapter.log.error("exception in HandleStateChangeDevices [" + e + "]");
    }
    return bRet;
}



async function checkHeatingPeriod() {

    if (adapter.config.UseFixHeatingPeriod) {
        adapter.log.info("initial check for heating period based on settings between " + adapter.config.FixHeatingPeriodStart + " and " + adapter.config.FixHeatingPeriodEnd);

        const HeatingPeriodStart = adapter.config.FixHeatingPeriodStart.split(/[.,/ -]/);
        const HeatingPeriodEnd = adapter.config.FixHeatingPeriodEnd.split(/[.,/ -]/);

        let isHeatingPeriod = false;
        if (HeatingPeriodStart.length >= 2 && HeatingPeriodEnd.length >= 2) {

            const StartDate = new Date();
            StartDate.setDate(parseInt(HeatingPeriodStart[0]));
            StartDate.setMonth(parseInt(HeatingPeriodStart[1]) - 1);
            adapter.log.debug("Start " + StartDate.toDateString());

            const EndDate = new Date();
            EndDate.setDate(parseInt(HeatingPeriodEnd[0]));
            EndDate.setMonth(parseInt(HeatingPeriodEnd[1]) - 1);
            adapter.log.debug("End " + EndDate.toDateString());

            if (EndDate < StartDate) {
                EndDate.setFullYear(EndDate.getFullYear() + 1);
                adapter.log.debug("corrected End " + EndDate.toDateString());
            }

            const now = new Date();

            if (now >= StartDate && now <= EndDate) {
                adapter.log.debug("we are in period");
                isHeatingPeriod = true;
            }
            else {
                adapter.log.debug("we are not in period, after start " + StartDate.toDateString() + " and before end " + EndDate.toDateString());
                isHeatingPeriod = false;
            }
        }

        adapter.log.info("heating period is " + JSON.stringify(isHeatingPeriod));

        await adapter.setStateAsync("HeatingPeriodActive", { ack: true, val: isHeatingPeriod });
    }
}






//*******************************************************************
//
async function deleteUnusedDP(obj) {

    const result = "not implemented yet";

    adapter.sendTo(obj.from, obj.command, result, obj.callback);
}



//*******************************************************************
//
async function SaveProfile(obj) {

    adapter.log.debug("SaveProfile called " + JSON.stringify(obj));

    try {
        const profile2Save = {
            ProfileType: adapter.config.ProfileType,
            NumberOfProfiles: parseInt(adapter.config.NumberOfProfiles),
            NumberOfPeriods: parseInt(adapter.config.NumberOfPeriods),
            Rooms: {}
        };
        //adapter.log.debug("profile2Save " + JSON.stringify(profile2Save));

       
        //adapter.log.debug("room2Save " + JSON.stringify(room2Save));

        for (let room = 0; room < adapter.config.rooms.length; room++) {
            if (adapter.config.rooms[room].isActive) {

                const roomName = adapter.config.rooms[room].name;

                const room2Save = {
                    profiles: {}
                };

                for (let profile = 1; profile <= parseInt(adapter.config.NumberOfProfiles, 10); profile++) {
                    const key = "Profiles." + profile;

                    const id = key + "." + roomName;

                    let id1 = id;

                    if (parseInt(adapter.config.ProfileType, 10) === 1) {

                        const periods2Save = {
                            Mo_Su: {}
                        };
                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Mo-Su.Periods." + period;

                            const Time = await adapter.getStateAsync(id + ".time");
                            const Temperature = await adapter.getStateAsync(id + ".Temperature");


                            const period2Save = {
                                time: Time.val,
                                Temperature: Temperature.val
                            };
                            //adapter.log.debug("period2Save " + JSON.stringify(period2Save));
                            periods2Save.Mo_Su[period] = period2Save;

                        }
                        //adapter.log.debug("periods2Save " + JSON.stringify(periods2Save));
                        room2Save.profiles[profile] = periods2Save;

                    }
                    else if (parseInt(adapter.config.ProfileType, 10) === 2) {

                        const periods2Save = {
                            Mo_Fr: {},
                            Sa_Su: {}
                        };

                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Mo-Fr.Periods." + period;

                            const Time = await adapter.getStateAsync(id + ".time");
                            const Temperature = await adapter.getStateAsync(id + ".Temperature");

                            const period2Save = {
                                time: Time.val,
                                Temperature: Temperature.val
                            };

                            periods2Save.Mo_Fr[period] = period2Save;
                        }
                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Sa-Su.Periods." + period;

                            const Time = await adapter.getStateAsync(id + ".time");
                            const Temperature = await adapter.getStateAsync(id + ".Temperature");


                            const period2Save = {
                                time: Time.val,
                                Temperature: Temperature.val
                            };

                            periods2Save.Sa_Su[period] = period2Save;

                        }

                        room2Save.profiles[profile] = periods2Save;
                    }
                    else if (parseInt(adapter.config.ProfileType, 10) === 3) {


                        const periods2Save = {
                            Mon: {},
                            Tue: {},
                            Wed: {},
                            Thu: {},
                            Fri: {},
                            Sat: {},
                            Sun: {}
                        };

                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Mon.Periods." + period;
                            const Time = await adapter.getStateAsync(id + ".time");
                            const Temperature = await adapter.getStateAsync(id + ".Temperature");
    


                            const period2Save = {
                                time: Time.val,
                                Temperature: Temperature.val
                            };

                            periods2Save.Mon[period] = period2Save;

                        }
                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Tue.Periods." + period;
                            const Time = await adapter.getStateAsync(id + ".time");
                            const Temperature = await adapter.getStateAsync(id + ".Temperature");


                            const period2Save = {
                                time: Time.val,
                                Temperature: Temperature.val
                            };

                            periods2Save.Tue[period] = period2Save;

                        }
                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Wed.Periods." + period;
                            const Time = await adapter.getStateAsync(id + ".time");
                            const Temperature = await adapter.getStateAsync(id + ".Temperature");


                            const period2Save = {
                                time: Time.val,
                                Temperature: Temperature.val
                            };

                            periods2Save.Wed[period] = period2Save;

                        }
                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Thu.Periods." + period;
                            const Time = await adapter.getStateAsync(id + ".time");
                            const Temperature = await adapter.getStateAsync(id + ".Temperature");


                            const period2Save = {
                                time: Time.val,
                                Temperature: Temperature.val
                            };

                            periods2Save.Thu[period] = period2Save;
                        }
                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Fri.Periods." + period;
                            const Time = await adapter.getStateAsync(id + ".time");
                            const Temperature = await adapter.getStateAsync(id + ".Temperature");


                            const period2Save = {
                                time: Time.val,
                                Temperature: Temperature.val
                            };

                            periods2Save.Fri[period] = period2Save;

                        }
                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Sat.Periods." + period;
                            const Time = await adapter.getStateAsync(id + ".time");
                            const Temperature = await adapter.getStateAsync(id + ".Temperature");


                            const period2Save = {
                                time: Time.val,
                                Temperature: Temperature.val
                            };

                            periods2Save.Sat[period] = period2Save;

                        }
                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Sun.Periods." + period;

                            const Time = await adapter.getStateAsync(id + ".time");
                            const Temperature = await adapter.getStateAsync(id + ".Temperature");


                            const period2Save = {
                                time: Time.val,
                                Temperature: Temperature.val
                            };

                            periods2Save.Sun[period] = period2Save;
                        }

                        room2Save.profiles[profile] = periods2Save;
                    }
                    let decreaseMode = false;
                    if (parseInt(adapter.config.TemperatureDecrease) === 1) {// relative
                        id1 += ".relative";
                        decreaseMode = true;
                    }
                    else if (parseInt(adapter.config.TemperatureDecrease) === 2) {// absolutue
                        id1 += ".absolute";
                        decreaseMode = true;
                    }

                    profile2Save.TemperatureDecrease = parseInt(adapter.config.TemperatureDecrease);
                    if (decreaseMode) {

                        const GuestIncrease = await adapter.getStateAsync(id1 + ".GuestIncrease");
                        const PartyDecrease = await adapter.getStateAsync(id1 + ".PartyDecrease");
                        const WindowOpenDecrease = await adapter.getStateAsync(id1 + ".WindowOpenDecrease");
                        const AbsentDecrease = await adapter.getStateAsync(id1 + ".AbsentDecrease");
                        const VacationAbsentDecrease = await adapter.getStateAsync(id1 + ".VacationAbsentDecrease");

                        const decrease = {
                            GuestIncrease: GuestIncrease.val,
                            PartyDecrease: PartyDecrease.val,
                            WindowOpenDecrease: WindowOpenDecrease.val,
                            AbsentDecrease: AbsentDecrease.val,
                            VacationAbsentDecrease: VacationAbsentDecrease.val
                        };
                        adapter.log.debug("decrease " + JSON.stringify(decrease));
                        room2Save.profiles[profile].decrease = decrease;
                        adapter.log.debug("room2Save " + JSON.stringify(room2Save));

                    }
                }
                

                profile2Save.Rooms[roomName] = room2Save;

                adapter.log.debug("profile2Save " + JSON.stringify(profile2Save));
            }

        }
        adapter.sendTo(obj.from, obj.command, profile2Save, obj.callback);

    }
    catch (e) {
        adapter.log.error("exception in SaveProfile [" + e + "]");
    }
}


async function LoadProfile(obj) {
    adapter.log.warn("LoadProfile called " + JSON.stringify(obj));

    let retText = "successfully loaded";
    try {
        const profile2Load = JSON.parse(obj.message);

        adapter.log.debug("got data " + JSON.stringify(profile2Load));

        //first do some checks
        let ready2load = true;
        
        if (profile2Load.ProfileType != adapter.config.ProfileType) {
            ready2load = false;
            retText += " Profile type " + profile2Load.ProfileType + " not equal to " + adapter.config.ProfileType;
        }
        if (profile2Load.NumberOfProfiles != adapter.config.NumberOfProfiles) {
            ready2load = false;
            retText += " number of profiles  " + profile2Load.NumberOfProfiles + " not equal to " + adapter.config.NumberOfProfiles;
        }
        if (profile2Load.NumberOfPeriods != adapter.config.NumberOfPeriods) {
            ready2load = false;
            retText += " number of periods  " + profile2Load.NumberOfPeriods + " not equal to " + adapter.config.NumberOfPeriods;
        }
        if (profile2Load.TemperatureDecrease != adapter.config.TemperatureDecrease) {
            ready2load = false;
            retText += " TemperatureDecrease  " + profile2Load.TemperatureDecrease + " not equal to " + adapter.config.TemperatureDecrease;
        }
        if (!ready2load) {
            adapter.log.error("could not load profile " + retText);
        }
        else {
            //load now



            for (let room = 0; room < adapter.config.rooms.length; room++) {
                if (adapter.config.rooms[room].isActive) {

                    const roomName = adapter.config.rooms[room].name;

                    for (let profile = 1; profile <= parseInt(adapter.config.NumberOfProfiles, 10); profile++) {
                        const key = "Profiles." + profile;

                        const id = key + "." + roomName;

                        let id1 = id;

                        if (parseInt(adapter.config.ProfileType, 10) === 1) {

                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Mo-Su.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Mo_Su[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Mo_Su[period].temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });
                            }
                        }
                        else if (parseInt(adapter.config.ProfileType, 10) === 2) {

                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Mo-Fr.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Mo_Fr[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Mo_Fr[period].temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Sa-Su.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Sa_Su[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Sa_Su[period].temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });
                            }
                        }
                        else if (parseInt(adapter.config.ProfileType, 10) === 3) {

                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Mon.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Mon[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Mon[period].temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Tue.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Tue[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Tue[period].temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Wed.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Wed[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Wed[period].temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Thu.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Thu[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Thu[period].temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });
                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Fri.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Fri[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Fri[period].temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Sat.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Sat[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Sat[period].temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Sun.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Sun[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Sun[period].temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }

                        }
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

                            const GuestIncrease = profile2Load.Rooms[roomName].profiles[profile].decrease.GuestIncrease;
                            const PartyDecrease = profile2Load.Rooms[roomName].profiles[profile].decrease.PartyDecrease;
                            const WindowOpenDecrease = profile2Load.Rooms[roomName].profiles[profile].decrease.WindowOpenDecrease;
                            const AbsentDecrease = profile2Load.Rooms[roomName].profiles[profile].decrease.AbsentDecrease;
                            const VacationAbsentDecrease = profile2Load.Rooms[roomName].profiles[profile].decrease.VacationAbsentDecrease;

                            await adapter.setStateAsync(id1 + ".GuestIncrease", { ack: true, val: GuestIncrease });
                            await adapter.setStateAsync(id1 + ".PartyDecrease", { ack: true, val: PartyDecrease });
                            await adapter.setStateAsync(id1 + ".WindowOpenDecrease", { ack: true, val: WindowOpenDecrease });
                            await adapter.setStateAsync(id1 + ".AbsentDecrease", { ack: true, val: AbsentDecrease });
                            await adapter.setStateAsync(id1 + ".VacationAbsentDecrease", { ack: true, val: VacationAbsentDecrease });

                        }
                    }
                }
            }

            adapter.log.warn("LoadProfile done " + retText);

            ChangeStatus("Profiles", "all", null);
        }
    }
    catch (e) {
        retText = "exception in LoadProfile [" + e + "]";
        adapter.log.error(retText);

    }

    adapter.sendTo(obj.from, obj.command, retText, obj.callback);
}
    


// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}



