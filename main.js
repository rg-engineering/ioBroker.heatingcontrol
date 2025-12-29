/* eslint-disable prefer-template */
/*
 * heatingcontrol adapter für iobroker
 *
 * Created: 30.07.2019 21:31:28
 *  Author: Rene
 * 
*/

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";


// you have to require the utils module and call adapter function
const utils = require("@iobroker/adapter-core");

//const findObjectByKey = require("./lib/support_tools.js").findObjectByKey;
const GetCurrentProfile = require("./lib/database").GetCurrentProfile;

const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');

//======================================
const CreateDatapoints = require("./lib/datapoints").CreateDatapoints;
const SetDefaults = require("./lib/datapoints").SetDefaults;
const SetCurrent = require("./lib/datapoints").SetCurrent;
const SetInfo = require("./lib/datapoints").SetInfo;
const SubscribeAllStates = require("./lib/datapoints").SubscribeAllStates;
const CheckConfiguration = require("./lib/datapoints").CheckConfiguration;
const CopyProfileAll = require("./lib/datapoints").CopyProfileAll;
const CopyProfile = require("./lib/datapoints").CopyProfile;
const CopyPeriods = require("./lib/datapoints").CopyPeriods;
const DeleteUnusedDP = require("./lib/datapoints").DeleteUnusedDP;

const CronStop = require("./lib/cronjobs").CronStop;
const StartTimer2ResetFireplaceMode = require("./lib/cronjobs").StartTimer2ResetFireplaceMode;

const CreateDatabase = require("./lib/database").CreateDatabase;
const ChangeStatus = require("./lib/database").ChangeStatus;
const SubscribeDevices = require("./lib/database").SubscribeDevices;
const CheckStateChangeDevice = require("./lib/database").CheckStateChangeDevice;
const StartStatemachine = require("./lib/database").StartStatemachine;
const GetAllRoomData = require("./lib/database").GetAllRoomData;


const StartVis = require("./lib/vis").StartVis;
const SetVis = require("./lib/vis").SetVis;
const HandleStateChangeVis = require("./lib/vis").HandleStateChangeVis;

const CreateCronJobs = require("./lib/cronjobs").CreateCronJobs;

const Check4Thermostat = require("./lib/devicedetect").Check4Thermostat;
const Check4Actor = require("./lib/devicedetect").Check4Actor;
const Check4Sensor = require("./lib/devicedetect").Check4Sensor;
const Check4TempSensor = require("./lib/devicedetect").Check4TempSensor;

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
            } catch (e) {
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
                adapter.log.error("exception catch after unload [" + e + "]");
                callback();
            }
        },
        //#######################################
        //
        //SIGINT: function () {
        //    adapter && adapter.log && adapter.log.info && adapter.log.info("cleaned everything up...");
        //    CronStop();
        //},
        //#######################################
        //  is called if a subscribed object changes
        //objectChange: function (id, obj) {
        //    adapter.log.debug("[OBJECT CHANGE] ==== " + id + " === " + JSON.stringify(obj));
        //},
        //#######################################
        // is called if a subscribed state changes
        //stateChange: function (id, state) {
        //HandleStateChange(id, state);
        //},
        stateChange: async (id, state) => {
            await HandleStateChange(id, state);
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
                        if (obj.callback) {
                            adapter.sendTo(obj.from, obj.command, "Message received", obj.callback);
                        }
                        break;
                    case "listRooms":
                        adapter.log.debug("got list rooms: not implemented");
                        //await ListRooms(obj);
                        break;
                    case "listFunctions":
                        adapter.log.debug("got list functions: not implemented");
                        //await ListFunctions(obj);
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
                    case "listAddTempSensors":
                        //adapter.log.debug("got list sensors");
                        await ListAddTempSensors(obj);
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
                    case "getTelegramUser":
                        await GetTelegramUser(obj);
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

        //adapter.log.debug("devices " + JSON.stringify(adapter.config.devices));

        //======================================

        const dataDir = join(utils.getAbsoluteDefaultDataDir(), 'files', 'heatingcontrol', 'data');

        try {
            // create directory
            if (!existsSync(dataDir)) {
                adapter.log.info(`Creating data directory at ${dataDir}`);
                mkdirSync(dataDir, { recursive: true });
            }
        } catch (err) {
            adapter.log.error(`Could not create Storage directory: ${err} on ${dataDir}`);

        }

        SystemLanguage = await GetSystemLanguage();

        await CreateDatabase(adapter, SystemLanguage );

        await CreateDatapoints(adapter, SystemLanguage);
        await SetDefaults();
        await SetInfo();
        await SetCurrent();
        await SubscribeAllStates();
        await SubscribeDevices();
        await CheckConfiguration();

        await checkHeatingPeriod();

        const currentProfile = await GetCurrentProfile();
        const rooms = GetAllRoomData();
        await CreateCronJobs(adapter, currentProfile, ChangeStatus, rooms);
        //StartTestCron();

        await StartVis(adapter);

        await StartStatemachine();
    } catch (e) {
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



async function SearchRoomAndFunction(roomID, functionID) {

    adapter.log.debug("search for devices in " + roomID + " and " + functionID);

    // Enums laden
    const AllRoomsEnum = await adapter.getEnumAsync("rooms");
    //adapter.log.info("all rooms " + JSON.stringify(AllRoomsEnum));
    const AllFunctionsEnum = await adapter.getEnumAsync("functions");
    //adapter.log.info("all functions " + JSON.stringify(AllFunctionsEnum));

    // Members auslesen
    const roomMembers = AllRoomsEnum.result[roomID]?.common?.members || [];
    adapter.log.debug("room members " + JSON.stringify(roomMembers));
    const functionMembers = AllFunctionsEnum.result[functionID]?.common?.members || [];
    adapter.log.debug("function members " + JSON.stringify(functionMembers));

    // Schnittmenge bilden
    const devicesInRoomWithFunction = roomMembers.filter(id =>
        functionMembers.includes(id)
    );

    adapter.log.info("device(s) found for room and function " + JSON.stringify(devicesInRoomWithFunction));

    return devicesInRoomWithFunction;
}

function GetRoomId(roomId2find) {

    let roomIdFound = -1;

    for (let r = 0; r < adapter.config.rooms.length; r++) {

        const roomId = adapter.config.rooms[r].id;

        if (roomId == roomId2find) {
            roomIdFound = r;
            adapter.log.debug("Raum gefunden, id " + roomIdFound + " for " + roomId2find);
            break;
        }
    }
    return roomIdFound;
}


async function ListThermostats(obj) {
    adapter.log.debug("ListThermostats " + JSON.stringify(obj));

    const roomID = obj.message.room;
    const functionID = obj.message.gewerk;
    let status = "nothing found";
    const devices = [];

    //hole alle Geräte, die im Raum und in Funktion member sind
    const devicesInRoomWithFunction = await SearchRoomAndFunction(roomID, functionID);
    const roomIdInList = GetRoomId(roomID);

    if (devicesInRoomWithFunction !== undefined && devicesInRoomWithFunction.length > 0) {
        status = devicesInRoomWithFunction.length + " devices found ";

        for (const id of devicesInRoomWithFunction) {

            // 🔍 Check: OID bereits in Thermostat-Liste?
            const alreadyUsed = adapter.config.rooms[roomIdInList].Thermostats.some(t =>
                t.OID_Target === id || t.OID_Current === id
            );

            //wenn OID bereits als Thermostat verwendet wird, dann überspringen
            if (alreadyUsed) {
                adapter.log.debug(`Überspringe ${id} (bereits in Thermostat-Liste)`);
                continue;
            }

            try {
                //hole das Object 
                const deviceObj = await adapter.getForeignObjectAsync(id);

                //und prüfe, ob das Object ein bekanntes Thermostat ist
                const resultCheck = await Check4Thermostat(adapter, deviceObj);
                //Achtung: hier kommen die OID's zurück!!


                if (deviceObj && resultCheck.found) {
                    devices.push(resultCheck.device);
                }
            } catch (err) {
                adapter.log.warn(`Objekt ${id} konnte nicht geladen werden: ${err}`);
            }
        }

        if (devices.length == 0) {
            status = "no new thermostats found";
        } else {
            status = devices.length + " new thermostat(s) found";
        }

        adapter.log.info(`new thermostat(s) : ${devices.length} ` + JSON.stringify(devices));

    }

    const returnObject = {
        list: devices,
        status: status
    };
    adapter.sendTo(obj.from, obj.command, returnObject, obj.callback);
}




async function ListActors(obj) {
    adapter.log.debug("ListActors " + JSON.stringify(obj));

    const roomID = obj.message.room;
    const functionID = obj.message.gewerk;
    let status = "nothing found";
    const devices = [];

    //hole alle Geräte, die im Raum und in Funktion member sind
    const devicesInRoomWithFunction = await SearchRoomAndFunction(roomID, functionID);
    const roomIdInList = GetRoomId(roomID);

    if (devicesInRoomWithFunction !== undefined && devicesInRoomWithFunction.length > 0) {
        status = devicesInRoomWithFunction.length + " devices found ";

        for (const id of devicesInRoomWithFunction) {

            // 🔍 Check: OID bereits in Thermostat-Liste?
            const alreadyUsed = adapter.config.rooms[roomIdInList].Actors.some(t =>
                t.OID_Target === id 
            );

            //wenn OID bereits als Thermostat verwendet wird, dann überspringen
            if (alreadyUsed) {
                adapter.log.debug(`Überspringe ${id} (bereits in Aktor-Liste)`);
                continue;
            }

            try {
                //hole das Object 
                const deviceObj = await adapter.getForeignObjectAsync(id);

                //und prüfe, ob das Object ein bekanntes Thermostat ist
                const resultCheck = await Check4Actor(adapter, deviceObj);
                //Achtung: hier kommen die OID's zurück!!


                if (deviceObj && resultCheck.found) {
                    devices.push(resultCheck.device);
                }
            } catch (err) {
                adapter.log.warn(`Objekt ${id} konnte nicht geladen werden: ${err}`);
            }
        }

        if (devices.length == 0) {
            status = "no new actor found";
        } else {
            status = devices.length + " new actor(s) found";
        }

        adapter.log.info(`new actors(s) : ${devices.length} ` + JSON.stringify(devices));

    }
    


    const returnObject = {
        list: devices,
        status: status
    };

    adapter.sendTo(obj.from, obj.command, returnObject, obj.callback);
}

async function ListSensors(obj) {
    adapter.log.debug("ListSensors " + JSON.stringify(obj));

    const roomID = obj.message.room;
    const functionID = obj.message.gewerk;
    let status = "nothing found";
    const devices = [];

    //hole alle Geräte, die im Raum und in Funktion member sind
    const devicesInRoomWithFunction = await SearchRoomAndFunction(roomID, functionID);
    const roomIdInList = GetRoomId(roomID);

    if (devicesInRoomWithFunction !== undefined && devicesInRoomWithFunction.length > 0) {
        status = devicesInRoomWithFunction.length + " devices found ";

        for (const id of devicesInRoomWithFunction) {

            // 🔍 Check: OID bereits in Thermostat-Liste?
            const alreadyUsed = adapter.config.rooms[roomIdInList].WindowSensors.some(t =>
                t.OID_Current === id
            );

            //wenn OID bereits als Thermostat verwendet wird, dann überspringen
            if (alreadyUsed) {
                adapter.log.debug(`Überspringe ${id} (bereits in Sensor-Liste)`);
                continue;
            }

            try {
                //hole das Object 
                const deviceObj = await adapter.getForeignObjectAsync(id);

                //und prüfe, ob das Object ein bekanntes Thermostat ist
                const resultCheck = await Check4Sensor(adapter, deviceObj);
                //Achtung: hier kommen die OID's zurück!!


                if (deviceObj && resultCheck.found) {
                    devices.push(resultCheck.device);
                }
            } catch (err) {
                adapter.log.warn(`Objekt ${id} konnte nicht geladen werden: ${err}`);
            }
        }

        if (devices.length == 0) {
            status = "no new sensor found";
        } else {
            status = devices.length + " new sensor(s) found";
        }

        adapter.log.info(`new sensor(s) : ${devices.length} ` + JSON.stringify(devices));

    }

    const returnObject = {
        list: devices,
        status: status
    };

    adapter.sendTo(obj.from, obj.command, returnObject, obj.callback);
}

async function ListAddTempSensors(obj) {
    adapter.log.debug("ListAddTempSensors " + JSON.stringify(obj));

    const roomID = obj.message.room;
    const functionID = obj.message.gewerk;
    let status = "nothing found";
    const devices = [];

    //hole alle Geräte, die im Raum und in Funktion member sind
    const devicesInRoomWithFunction = await SearchRoomAndFunction(roomID, functionID);
    const roomIdInList = GetRoomId(roomID);

    if (devicesInRoomWithFunction !== undefined && devicesInRoomWithFunction.length > 0) {
        status = devicesInRoomWithFunction.length + " devices found ";

        for (const id of devicesInRoomWithFunction) {

            // 🔍 Check: OID bereits in Thermostat-Liste?
            const alreadyUsed = adapter.config.rooms[roomIdInList].AdditionalTemperatureSensors.some(t =>
                t.OID_Current === id
            );

            //wenn OID bereits als Thermostat verwendet wird, dann überspringen
            if (alreadyUsed) {
                adapter.log.debug(`Überspringe ${id} (bereits in AddTempertureSensor-Liste)`);
                continue;
            }

            try {
                //hole das Object 
                const deviceObj = await adapter.getForeignObjectAsync(id);

                //und prüfe, ob das Object ein bekanntes Thermostat ist
                const resultCheck = await Check4TempSensor(adapter, deviceObj);
                //Achtung: hier kommen die OID's zurück!!


                if (deviceObj && resultCheck.found) {
                    devices.push(resultCheck.device);
                }
            } catch (err) {
                adapter.log.warn(`Objekt ${id} konnte nicht geladen werden: ${err}`);
            }
        }

        if (devices.length == 0) {
            status = "no new additional temperature sensor found";
        } else {
            status = devices.length + " new additional temperature sensor(s) found";
        }

        adapter.log.info(`new additional temperature sensor(s) : ${devices.length} ` + JSON.stringify(devices));

    }

    const returnObject = {
        list: devices,
        status: status
    };

    adapter.sendTo(obj.from, obj.command, returnObject, obj.callback);
}

let lastIdAcked = "";

async function HandleStateChange(id, state) {
    try {

        let handled = false;
        const ids = id.split("."); 

        if (state  ) {

            if (state.ack !== true) {
                //handle only, if not ack'ed
                adapter.log.debug("### handle state change !ack " + id + " " + JSON.stringify(state));

                //my own datapoints?
                if (ids[0] == "heatingcontrol") {
                    handled = await HandleStateChangeGeneral(id, state);
                }

                //external datapoints (e.g. present)
                if (!handled) {
                    handled = await HandleStateChangeExternal(id, state);
                }

                //devices, hm-rpc sends with ack=true
                if (!handled) {
                    handled = await HandleStateChangeDevices(id, state);
                }

                if (handled) {
                    //adapter.log.info("### ack for " + id);
                    lastIdAcked = id;
                    // ### ack for heatingcontrol.0.Rooms.Wohnzimmer.StatusLog
                    // ### ack for javascript.0.Target1


                    if (ids[0] == "heatingcontrol") {
                        adapter.setForeignState(id, { ack: true });
                    }

                } else {
                    adapter.log.warn("!!! Statechange not handled " + id + " " + JSON.stringify(state));
                }
            } else {

                //adapter.log.info("### last id acked " + lastIdAcked);

                if (lastIdAcked != id) {

                    lastIdAcked = "";

                    adapter.log.debug("### handle state change acked " + id + " " + JSON.stringify(state));

                    if (ids[0] == "heatingcontrol") {
                        handled = true; //my own are handled only with ack = false
                    }

                    //external datapoints (e.g. present)
                    if (!handled) {
                        handled = await HandleStateChangeExternal(id, state);
                    }

                    //devices, hm-rpc sends with ack=true
                    if (!handled) {
                        handled = await HandleStateChangeDevices(id, state);
                    }

                    if (!handled) {
                        adapter.log.warn("!!! Statechange not handled " + id + " " + JSON.stringify(state));
                    }
                }
            }
        }
    } catch (e) {
        adapter.log.error("exception in HandleStateChange [" + e + "]");
    }
}

async function HandleStateChangeGeneral(id, state) {
    let bRet = false;
    adapter.log.debug("HandleStateChangeGeneral " + id);

    try {
        const ids = id.split(".");

        //heatingcontrol.0.vis.ProfileTypes.CopyProfile

        if (ids[2] === "vis" && ids[4] === "CopyProfile") {

            const currentProfile = await GetCurrentProfile();
            adapter.log.debug("copy profile for vis cur. Profile " + currentProfile);

            await CopyProfileAll(currentProfile);

            //vis update 
            if (adapter.config.UseVisFromPittini) {
                await SetVis();
            }
            bRet = true;
        }
        if (ids[2] === "vis" && ids[4] === "CopyProfileRoom") {

            const currentRoom = await GetCurrentRoom();
            const currentProfile = await GetCurrentProfile();
            adapter.log.debug("copy profile for vis " + currentRoom + " cur. Profile " + currentProfile);

            await CopyProfile(currentRoom, currentProfile);

            //vis update 
            if (adapter.config.UseVisFromPittini) {
                await SetVis();
            }
            bRet = true;
        } else if (ids[2] === "vis" && ids[5] === "CopyPeriods") {
            //heatingcontrol.0.vis.ProfileTypes.Mo-Fr.CopyPeriods
            const currentProfile = await GetCurrentProfile();
            const currentRoom = await GetCurrentRoom();
            adapter.log.debug("copy periods for vis " + currentRoom + " cur. Profile " + currentProfile);
            await CopyPeriods(currentRoom, ids[4], currentProfile);
            //vis update xxx
            if (adapter.config.UseVisFromPittini) {
                await SetVis();
            }

            //adapter.log.error("copy from vis");
            bRet = true;
        } else if (ids[2] === "vis"
            //heatingcontrol.0.vis.ChoosenRoom 

            //|| ids[4] === "ActiveTimeSlot"
            //|| ids[4] === "CurrentTimePeriod"
            //heatingcontrol.0.Rooms.Wohnzimmer.WindowIsOpen
            //|| ids[4] === "WindowIsOpen"
            //heatingcontrol.0.Rooms.Sauna.StatusLog
            //|| ids[4] === "StatusLog"
            || ids[3] === "ProfileTypes"
            || ids[3] === "RoomValues"
            //heatingcontrol.0.Profiles.1.ProfileName
            || ids[4] === "ProfileName"
            || ids[3] === "TempDecreaseValues") {
            if (adapter.config.UseVisFromPittini) {
                bRet = await HandleStateChangeVis(id, state);
            }
        } else if (ids[2] == "CurrentProfile") {
            //heatingcontrol.0.CurrentProfile
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);

            //handle exception reported by sentry
            if (adapter.config.UseVisFromPittini) {
                await HandleStateChangeVis(id, state);
            }

        } else if (ids[2] == "HeatingPeriodActive") {
            //heatingcontrol.0.HeatingPeriodActive
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        } else if (ids[2] == "PublicHolidyToday") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        } else if (ids[2] == "Present") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        } else if (ids[2] == "PartyNow") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        } else if (ids[2] == "GuestsPresent") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        } else if (ids[2] == "HolidayPresent") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        } else if (ids[2] == "VacationAbsent") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        } else if (ids[2] == "MaintenanceActive") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        } else if (ids[2] == "FireplaceModeActive") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
            if (state.val) {
                StartTimer2ResetFireplaceMode();
            }
        } else if (ids[2] == "PowerInterruptionPeriodActive") {
            bRet = true;
            ChangeStatus(ids[2], "all", state.val);
        } else if (ids[4] == "TemperaturOverride") {
            //heatingcontrol.0.Rooms.Küche.TemperaturOverride
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        } else if (ids[4] == "TemperaturOverrideTime") {
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        } else if (ids[4] == "TemperatureIfNoHeatingPeriod") {
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        } else if (ids[4] == "MinimumTemperature") {
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        } else if (ids[4] == "ResetManual") {
            //heatingcontrol.0.Rooms.Wohnzimmer.ResetManual
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        } else if (ids[4] == "TemperatureOffset") {
            //heatingcontrol.0.Rooms.Wohnzimmer.TemperatureOffset
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        } else if (ids[4] == "isActive") {
            //heatingcontrol.0.Rooms.Wohnzimmer.isActive 
            bRet = true;
            ChangeStatus(ids[4], ids[3], state.val);
        } else if (ids[2] == "Profiles") {

            //heatingcontrol.0.Profiles.1.Küche.Mo-Su.Periods.1.Temperature
            bRet = true;

            //heatingcontrol.0.Profiles.1.CopyProfile
            //heatingcontrol.0.Profiles.1.Wohnzimmer.CopyProfile
            //heatingcontrol.0.Profiles.1.Wohnzimmer.Fri.CopyPeriods
            if (ids[4] == "CopyProfile") {

                await CopyProfileAll(parseInt(ids[3]));

                //vis update xxx
                if (adapter.config.UseVisFromPittini) {
                    await SetVis();
                }
            } else if (ids[5] == "CopyProfile") {

                await CopyProfile(ids[4], parseInt(ids[3]));
                //vis update xxx
                if (adapter.config.UseVisFromPittini) {
                    await SetVis();
                }
            } else if (ids[6] == "CopyPeriods") {

                const currentProfile = await GetCurrentProfile();
                await CopyPeriods(ids[4], ids[5], currentProfile);
                //vis update xxx
                if (adapter.config.UseVisFromPittini) {
                    await SetVis();
                }
            } else {
                ChangeStatus(ids[2], ids[4], state.val);
            }
        }
    } catch (e) {
        adapter.log.error("exception in HandleStateChangeGeneral [" + e + "]");
    }
    return bRet;
}

async function GetCurrentRoom() {

    let sRet = "undefined";

    const temp = await adapter.getStateAsync("vis.ChoosenRoom");

    if (temp != null &&  temp !== undefined) {
        sRet = temp.val;
    } else {
        adapter.log.error("could not read vis.ChoosenRoom " + JSON.stringify(temp));
    }

    return sRet;

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
                } else {
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
                } else {
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
                } else {
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
                await adapter.setStateAsync("PublicHolidyToday", { val: state.val, ack: false }); //ack = false!!
                bRet = true;
            }
        }
    } catch (e) {
        adapter.log.error("exception in HandleStateChangeExternal [" + e + "]");
    }

    return bRet;
}


async function HandleStateChangeDevices(id, state) {
    let bRet = false;
    adapter.log.debug("HandleStateChangeDevices " + id);
    try {
        bRet = await CheckStateChangeDevice(id, state);
    } catch (e) {
        adapter.log.error("exception in HandleStateChangeDevices [" + e + "]");
    }
    return bRet;
}



async function checkHeatingPeriod() {

    if (adapter.config.UseFixHeatingPeriod) {
        adapter.log.info("initial check for heating period based on settings between " + adapter.config.FixHeatingPeriodStart + " and " + adapter.config.FixHeatingPeriodEnd);
        try {
            
            let isHeatingPeriod = false;

            if (adapter.config.FixHeatingPeriodStart.length > 0 && adapter.config.FixHeatingPeriodEnd.length > 0) {
                const StartPeriod = adapter.config.FixHeatingPeriodStart.split(/[.,/ -]/);
                const EndPeriod = adapter.config.FixHeatingPeriodEnd.split(/[.,/ -]/);


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
                        } else {
                            //else decrease Start year
                            StartDate.setFullYear(StartDate.getFullYear() - 1);
                            adapter.log.debug("corrected Start " + StartDate.toDateString());
                        }
                    }

                    if (now >= StartDate && now <= EndDate) {
                        adapter.log.debug("we are in period");
                        isHeatingPeriod = true;
                    } else {
                        adapter.log.debug("we are not in period, after start " + StartDate.toDateString() + " and before end " + EndDate.toDateString());
                        isHeatingPeriod = false;
                    }
                }
            }

            adapter.log.info("heating period is " + JSON.stringify(isHeatingPeriod));

            await adapter.setStateAsync("HeatingPeriodActive", { ack: false, val: isHeatingPeriod });
        } catch (e) {
            adapter.log.error("exception catch in checkHeatingPeriod [" + e + "] ");
        }
    }
}






/*
 
 exception in SaveProfile [TypeError: Cannot read properties of null (reading 'val')]
 Mo-Fr / Sa-So
 absolut
 4 Perioden

  
 */


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

                const roomName = adapter.config.rooms[room].name || adapter.config.rooms[room].Name;

                adapter.log.debug("saving for " + roomName);

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

                            adapter.log.debug("saving " + id);

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

                    } else if (parseInt(adapter.config.ProfileType, 10) === 2) {

                        const periods2Save = {
                            Mo_Fr: {},
                            Sa_Su: {}
                        };

                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Mo-Fr.Periods." + period;

                            adapter.log.debug("saving " + id);

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

                            adapter.log.debug("saving " + id);

                            const Time = await adapter.getStateAsync(id + ".time");
                            const Temperature = await adapter.getStateAsync(id + ".Temperature");


                            const period2Save = {
                                time: Time.val,
                                Temperature: Temperature.val
                            };

                            periods2Save.Sa_Su[period] = period2Save;

                        }

                        room2Save.profiles[profile] = periods2Save;
                    } else if (parseInt(adapter.config.ProfileType, 10) === 3) {


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
                            adapter.log.debug("saving " + id);
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
                            adapter.log.debug("saving " + id);
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
                            adapter.log.debug("saving " + id);
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
                            adapter.log.debug("saving " + id);
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
                            adapter.log.debug("saving " + id);
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
                            adapter.log.debug("saving " + id);
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
                            adapter.log.debug("saving " + id);
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
                    } else if (parseInt(adapter.config.TemperatureDecrease) === 2) {// absolutue
                        id1 += ".absolute";
                        decreaseMode = true;
                    }

                    profile2Save.TemperatureDecrease = parseInt(adapter.config.TemperatureDecrease);
                    if (decreaseMode) {

                        adapter.log.debug("saving " + id1);

                        const GuestIncrease = await adapter.getStateAsync(id1 + ".GuestIncrease");
                        const PartyDecrease = await adapter.getStateAsync(id1 + ".PartyDecrease");
                        const WindowOpenDecrease = await adapter.getStateAsync(id1 + ".WindowOpenDecrease");
                        const AbsentDecrease = await adapter.getStateAsync(id1 + ".AbsentDecrease");
                        const VacationAbsentDecrease = await adapter.getStateAsync(id1 + ".VacationAbsentDecrease");
                        let FireplaceModeDecrease = 0;
                        if (adapter.config.UseFireplaceMode) {
                            FireplaceModeDecrease = await adapter.getStateAsync(id1 + ".FireplaceModeDecrease");
                        }
                        const decrease = {
                            GuestIncrease: GuestIncrease.val,
                            PartyDecrease: PartyDecrease.val,
                            WindowOpenDecrease: WindowOpenDecrease.val,
                            AbsentDecrease: AbsentDecrease.val,
                            VacationAbsentDecrease: VacationAbsentDecrease.val,
                            FireplaceModeDecrease: FireplaceModeDecrease.val
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

    } catch (e) {
        adapter.log.error("exception in SaveProfile [" + e + "]");
    }
}




async function LoadProfile(obj) {
    adapter.log.warn("!!!LoadProfile called:  " + JSON.stringify(obj));

    let retText = "successfully loaded";
    try {


        // Robust: prüfen ob obj.message bereits ein JSON-Objekt ist oder ein string, ggf. parsen
        let profile2Load = null;

        if (obj && obj.message !== undefined && obj.message !== null) {
            if (typeof obj.message === "string") {
                try {
                    profile2Load = JSON.parse(obj.message);
                } catch (err) {
                    adapter.log.error("LoadProfile: Cannot parse obj.message string: " + err);
                    retText = "Cannot parse profile JSON: " + err;
                    adapter.sendTo(obj.from, obj.command, retText, obj.callback);
                    return;
                }
            } else {
                profile2Load = obj.message;
            }

        } else {
            adapter.log.error("LoadProfile: obj.message is missing or null");
            retText = "obj.message is missing or null";
            adapter.sendTo(obj.from, obj.command, retText, obj.callback);
            return;
        }




        

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
        } else {
            //load now



            for (let room = 0; room < adapter.config.rooms.length; room++) {
                if (adapter.config.rooms[room].isActive) {

                    const roomName = adapter.config.rooms[room].name || adapter.config.rooms[room].Name;

                    for (let profile = 1; profile <= parseInt(adapter.config.NumberOfProfiles, 10); profile++) {
                        const key = "Profiles." + profile;

                        const id = key + "." + roomName;

                        let id1 = id;

                        if (parseInt(adapter.config.ProfileType, 10) === 1) {

                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Mo-Su.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Mo_Su[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Mo_Su[period].Temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });
                            }
                        } else if (parseInt(adapter.config.ProfileType, 10) === 2) {

                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Mo-Fr.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Mo_Fr[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Mo_Fr[period].Temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Sa-Su.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Sa_Su[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Sa_Su[period].Temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });
                            }
                        } else if (parseInt(adapter.config.ProfileType, 10) === 3) {

                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Mon.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Mon[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Mon[period].Temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Tue.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Tue[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Tue[period].Temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Wed.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Wed[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Wed[period].Temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Thu.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Thu[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Thu[period].Temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });
                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Fri.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Fri[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Fri[period].Temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Sat.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Sat[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Sat[period].Temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }
                            for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                                const id = id1 + ".Sun.Periods." + period;

                                const Time = profile2Load.Rooms[roomName].profiles[profile].Sun[period].time;
                                const Temperature = profile2Load.Rooms[roomName].profiles[profile].Sun[period].Temperature;

                                await adapter.setStateAsync(id + ".time", { ack: true, val: Time });
                                await adapter.setStateAsync(id + ".Temperature", { ack: true, val: Temperature });

                            }

                        }
                        let decreaseMode = false;
                        if (parseInt(adapter.config.TemperatureDecrease) === 1) {// relative
                            id1 += ".relative";
                            decreaseMode = true;
                        } else if (parseInt(adapter.config.TemperatureDecrease) === 2) {// absolutue
                            id1 += ".absolute";
                            decreaseMode = true;
                        }


                        if (decreaseMode) {

                            const GuestIncrease = profile2Load.Rooms[roomName].profiles[profile].decrease.GuestIncrease;
                            const PartyDecrease = profile2Load.Rooms[roomName].profiles[profile].decrease.PartyDecrease;
                            const WindowOpenDecrease = profile2Load.Rooms[roomName].profiles[profile].decrease.WindowOpenDecrease;
                            const AbsentDecrease = profile2Load.Rooms[roomName].profiles[profile].decrease.AbsentDecrease;
                            const VacationAbsentDecrease = profile2Load.Rooms[roomName].profiles[profile].decrease.VacationAbsentDecrease;
                            const FireplaceModeDecrease = profile2Load.Rooms[roomName].profiles[profile].decrease.FireplaceModeDecrease;

                            

                            await adapter.setStateAsync(id1 + ".GuestIncrease", { ack: true, val: GuestIncrease });
                            await adapter.setStateAsync(id1 + ".PartyDecrease", { ack: true, val: PartyDecrease });
                            await adapter.setStateAsync(id1 + ".WindowOpenDecrease", { ack: true, val: WindowOpenDecrease });
                            await adapter.setStateAsync(id1 + ".AbsentDecrease", { ack: true, val: AbsentDecrease });
                            await adapter.setStateAsync(id1 + ".VacationAbsentDecrease", { ack: true, val: VacationAbsentDecrease });
                            if (adapter.config.UseFireplaceMode) {
                                await adapter.setStateAsync(id1 + ".FireplaceModeDecrease", { ack: true, val: FireplaceModeDecrease });
                            }
                        }
                    }
                }
            }

            adapter.log.warn("LoadProfile done " + retText);

            ChangeStatus("Profiles", "all", null);
        }
    } catch (e) {
        retText = "exception in LoadProfile [" + e + "]";
        adapter.log.error(retText);

    }

    adapter.sendTo(obj.from, obj.command, retText, obj.callback);
}
    
async function deleteUnusedDP(obj) {

    const result = await DeleteUnusedDP(false);

    adapter.sendTo(obj.from, obj.command, result, obj.callback);
}

async function GetTelegramUser(obj) {
    if (obj && obj.message) {

        adapter.log.debug("telegram-instance: " + JSON.stringify(obj));
        /*
        telegram - instance: { "command": "getTelegramUser", "message": { "telegraminstance": "telegram.0" }, "from": "system.adapter.admin.0", "callback": { "message": { "telegraminstance": "telegram.0" }, "id": 144, "ack": false, "time": 1665936632067 }, "_id": 57898782 }
        */

        const inst = obj.message.telegraminstance ? obj.message.telegraminstance : "telegram.0";
        adapter.log.debug("telegram-instance: " + inst);
        adapter.getForeignState(inst + ".communicate.users", (err, state) => {
            err && adapter.log.error(err);
            if (state && state.val) {
                try {

                    //just for test
                    const value = JSON.parse(state.val);
                    adapter.log.debug("telegram-instance got: " + JSON.stringify(value));
                    const allUsers = [];

                    for (const user in value) {

                        const userID = user;
                        let userName = "";
                        let firstName = "";
                        for (const userdata in value[user]) {
                            userName = value[user]["userName"];
                            firstName = value[user]["firstName"];

                            adapter.log.debug("telegram-instance userdata " + JSON.stringify(userdata) + " " + JSON.stringify(value[user][userdata])); 

                        }

                        const nextUser = {
                            id: userID,
                            userName: userName,
                            firstName: firstName
                        };

                        adapter.log.debug("telegram-instance push: " + JSON.stringify(nextUser) + " " + JSON.stringify(value[user]));

                        allUsers.push(nextUser);

                    }




                    adapter.sendTo(obj.from, obj.command, allUsers, obj.callback);
                } catch (err) {
                    err && adapter.log.error(err);
                    adapter.log.error("Cannot parse stored user IDs from Telegram!");
                }
            }
        });
    }
}


// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}



