"use strict";

const findObjectByKey = require("./support_tools.js").findObjectByKey;
//const findObjectIdByKey = require("./support_tools.js").findObjectIdByKey;
const findObjectsByKey = require("./support_tools.js").findObjectsByKey;
//const findObjectsIdByKey = require("./support_tools.js").findObjectsIdByKey;

let parentAdapter;
const ActorsWithoutThermostat = [];
const Actors = [];
const Sensors = [];
const Thermostats = [];
const Rooms = [];

//*******************************************************************
//
async function CreateDatabase(adapter) {

    parentAdapter = adapter;

    parentAdapter.log.info("start CreateDatabase");

    try {
        //create rooms
        for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
            if (parentAdapter.config.rooms[room].isActive) {

                const sensors = await GetSensorsId4Room( parentAdapter.config.rooms[room].name);
                const actors = await GetActorsId4Room( parentAdapter.config.rooms[room].name);
                const thermostats = await GetThermostatId4Room( parentAdapter.config.rooms[room].name);

                let HasActorsWithoutThermostat = false;
                if (actors.length > 0 && thermostats.length == 0) {
                    HasActorsWithoutThermostat = true;

                    for (let d = 0; d < actors.length; d++) {
                        ActorsWithoutThermostat.push({
                            name: actors[d].name,
                            id: actors[d].id,
                            room: parentAdapter.config.rooms[room].name
                        });
                    }

                }

                Rooms.push({
                    ID: room,
                    Name: parentAdapter.config.rooms[room].name,
                    WindowIsOpen: false,                    //heatingcontrol.0.Rooms.Büro.WindowIsOpen
                    TemperaturOverrideTime: "00:00",        //heatingcontrol.0.Rooms.Büro.TemperaturOverrideTime
                    TemperaturOverride: 0,                  //heatingcontrol.0.Rooms.Büro.TemperaturOverride
                    State: "unknown",                       //heatingcontrol.0.Rooms.Büro.State
                    CurrentTimePeriodTime: "00:00",         //heatingcontrol.0.Rooms.Büro.CurrentTimePeriodTime
                    CurrentTimePeriodFull: "",              //heatingcontrol.0.Rooms.Büro.CurrentTimePeriodFull
                    CurrentTimePeriod: -1,                  //heatingcontrol.0.Rooms.Büro.CurrentTimePeriod
                    CurrentTarget: -99,                     //heatingcontrol.0.Rooms.Büro.CurrentTarget
                    ActiveTimeSlot: -1,                     //heatingcontrol.0.Rooms.Büro.ActiveTimeSlot
                    MinimumTemperature: -99,                //heatingcontrol.0.vis.RoomValues.MinimumTemperature
                    CurrentProfileTarget: -99,   // target according profile, used to disable ManuMode
                    IsInOverride: false,        // override active
                    IsInReduced: false,         // somehow reduced or increased
                    IsInManual: false,          // target used from thermostat
                    ReducedState: "",
                    Sensors: sensors,           // list of sensor id's from Sensors
                    Actors: actors,             // list of actor id's from Actors
                    Thermostats: thermostats,    // list of thermostat id's from Thermostats
                    HasActorsWithoutThermostat: HasActorsWithoutThermostat,
                    WindowCloseTimerId: null,
                    WindowOpenTimerId:null
                });

            }
        }
        parentAdapter.log.debug("CreateDatabase: " + Rooms.length + " active rooms found " + JSON.stringify(Rooms));
        parentAdapter.log.debug("CreateDatabase: " + Sensors.length + " active sensors found " + JSON.stringify(Sensors));
        parentAdapter.log.debug("CreateDatabase: " + Actors.length + " active actors found " + JSON.stringify(Actors));
        parentAdapter.log.debug("CreateDatabase: " + Thermostats.length + " active thermostats found " + JSON.stringify(Thermostats));


      
    }
    catch (e) {
        parentAdapter.log.error("exception in CreateDatabase [" + e + "]");
    }




    parentAdapter.log.info("CreateDatabase done with " + Rooms.length + " rooms");
}

async function GetSensorsId4Room( room) {

    const sensors = [];
    if (parentAdapter.config.UseSensors) {
        const devices = findObjectsByKey(parentAdapter.config.devices, "room", room);

        if (devices !== null) {

            for (let d = 0; d < devices.length; d++) {

                if (devices[d].type == 3 && devices[d].isActive) {

                    Sensors.push({
                        name: devices[d].name,
                        room: room,
                        OID: devices[d].OID_Current,
                        lastState: false,
                        lastChange: ""
                    });

                    sensors.push({
                        name: devices[d].name,
                        id: Sensors.length - 1
                    });
                }
            }
        }
    }

    //adapter.log.debug("got sensors for " + room + "" + JSON.stringify(sensors) + " " + JSON.stringify(Sensors));


    return sensors;
}

async function GetActorsId4Room( room) {

    const actors = [];
    if (parentAdapter.config.UseActors) {
        const devices = findObjectsByKey(parentAdapter.config.devices, "room", room);

        if (devices !== null) {

            for (let d = 0; d < devices.length; d++) {

                if (devices[d].type == 2 && devices[d].isActive) {

                    Actors.push({
                        name: devices[d].name,
                        room: room,
                        OID: devices[d].OID_Target,
                        lastState: false,
                        lastChange: ""
                    });

                    actors.push({
                        name: devices[d].name,
                        id: Actors.length - 1
                    });
                }
            }
        }
    }

    //adapter.log.debug("got actors for " + room + "" + JSON.stringify(actors) + " " + JSON.stringify(Actors));
    return actors;
}

async function GetThermostatId4Room( room) {
    const thermostats = [];

    const devices = findObjectsByKey(parentAdapter.config.devices, "room", room);

    if (devices !== null) {

        for (let d = 0; d < devices.length; d++) {

            if (devices[d].type == 1 && devices[d].isActive) {

                Thermostats.push({
                    name: devices[d].name,
                    room: room,
                    OID_Target: devices[d].OID_Target,
                    OID_Current: devices[d].OID_Current,
                    lastTarget: -99,
                    lastChange: ""
                });

                thermostats.push({
                    name: devices[d].name,
                    id: Thermostats.length - 1
                });
            }
        }
    }

    //parentAdapter.log.debug("got thermostats for " + room + "" + JSON.stringify(thermostats) + " " + JSON.stringify(Thermostats));
    return thermostats;
}

//*******************************************************************
//
function GetUsedRooms() {

    let UsedRooms = "";

    for (let room = 0; room < Rooms.length; room++) {
        UsedRooms += Rooms[room].Name;
        UsedRooms += ";";
    }

    if (UsedRooms != null && UsedRooms.length > 0) {
        //remove last ;
        UsedRooms = UsedRooms.slice(0, -1);
    }

    return UsedRooms;
}

//*******************************************************************
//
async function ChangeStatus(state, room, value) {

    try {

        if (room == "all") {
            parentAdapter.log.warn("Change Status for all rooms (to do)");
        }


        const theRoom = findObjectByKey(Rooms, "Name", room);

        if (theRoom != null) {
            if (state == "Sensor") {
                let WindowOpen;
                if (typeof value == "object") {
                    WindowOpen = value.val;
                }
                else {
                    WindowOpen = value;
                }
                parentAdapter.log.debug("Change Status Sensor in " + room + " to " + WindowOpen);

                if (theRoom != null) {
                    if (theRoom.WindowIsOpen != WindowOpen) {
                        parentAdapter.log.info("Window Open in " + room + " changed to " + WindowOpen);
                    }
                    theRoom.WindowIsOpen = WindowOpen;
                }
                else {
                    parentAdapter.log.warn("Room not found");
                }
            }
            else if (state == "Profile") {
                parentAdapter.log.warn("ChangeStatus Profile not implemented yet ");
            }
            else {
                parentAdapter.log.warn("ChangeStatus not implemented yet " + state + " " + room + " value " + JSON.stringify(value));
            }

            const temperature = await CalculateRoomTemperature(theRoom);
            await SetRoomTemperature(theRoom, temperature);
            await HandleActors(theRoom);

            
        }


    }
    catch (e) {
        parentAdapter.log.error("exception in ChangeStatus [" + e + "]");
    }
}

async function CalculateRoomTemperature(room) {

    parentAdapter.log.warn("CalculateRoomTemperature not implemented for " + room.Name);
}
async function SetRoomTemperature(room, temperature) {

    parentAdapter.log.warn("SetRoomTemperature not implemented for " + room.Name + " target " + temperature);
}
async function HandleActors(room) {

    parentAdapter.log.warn("HandleActors not implemented for " + room.Name );
}

//*******************************************************************
//
async function SubscribeDevices() {

    //thermostats
    if (parentAdapter.config.UseActors) {
        for (let t = 0; t < Thermostats.length; t++) {

            if (Thermostats[t].OID_Current != null && Thermostats[t].OID_Current.length > 0) {
                parentAdapter.log.info("subscribe " + Thermostats[t].name + " " + Thermostats[t].OID_Current);
                parentAdapter.subscribeForeignStates(Thermostats[t].OID_Current);
            }
            else {
                parentAdapter.log.warn("OID Current for " + Thermostats[t].name + " not set");
            }
        }
    }
    if (parentAdapter.config.UseChangesFromThermostat > 1) {
        for (let t = 0; t < Thermostats.length; t++) {

            if (Thermostats[t].OID_Target != null && Thermostats[t].OID_Target.length > 0) {
                parentAdapter.log.info("subscribe " + Thermostats[t].name + " " + Thermostats[t].OID_Target);
                parentAdapter.subscribeForeignStates(Thermostats[t].OID_Target);
            }
            else {
                parentAdapter.log.warn("OID Target for " + Thermostats[t].name + " not set");
            }
        }
    }

    //sensors
    if (parentAdapter.config.UseSensors) {
        for (let s = 0; s < Sensors.length; s++) {
            if (Sensors[s].OID != null && Sensors[s].OID.length > 0) {
                parentAdapter.log.info("subscribe " + Sensors[s].name + " " + Sensors[s].OID);
                parentAdapter.subscribeForeignStates(Sensors[s].OID);
            }
            else {
                parentAdapter.log.warn("OID for " + Sensors[s].name + " not set");
            }
        }
    }
}

//*******************************************************************
//
async function UnsubscribeDevices() {

    //thermostats
    if (parentAdapter.config.UseChangesFromThermostat > 1) {
        for (let t = 0; t < Thermostats.length; t++) {

            if (Thermostats[t].OID_Target != null && Thermostats[t].OID_Target.length > 0) {
                parentAdapter.log.info("unsubscribe " + Thermostats[t].name + " " + Thermostats[t].OID_Target);
                parentAdapter.unsubscribeForeignStates(Thermostats[t].OID_Target);
            }
            else {
                parentAdapter.log.warn("OID Target for " + Thermostats[t].name + " not set");
            }
        }
    }
}


//*******************************************************************
//
async function CheckStateChangeDevice(id, state) {
    let bRet = false;

    if (parentAdapter.config.UseSensors) {
        const devices = findObjectsByKey(Sensors, "OID", id);

        for (let d = 0; d < devices.length; d++) {
            const room = findObjectByKey(Rooms, "Name", devices[d].room);

            if (room != null) {
                parentAdapter.log.debug("handle sensor " + room.WindowIsOpen + " " + state.val + " " + parentAdapter.config.SensorOpenDelay + " " + parentAdapter.config.SensorCloseDelay);
                parentAdapter.log.debug(" ddd " + room.WindowCloseTimerId + " " + room.WindowOpenTimerId);


                //short closed, but now still open: cancel timer
                if (room.WindowIsOpen == true && state.val == true && room.WindowCloseTimerId != null) {
                    parentAdapter.log.info("cancel Close TimerId ");
                    clearTimeout(room.WindowCloseTimerId);
                    room.WindowCloseTimerId = null;
                }
                //short opened, but now still close: cancel timer
                else if (room.WindowIsOpen == false && state.val == false && room.WindowOpenTimerId != null) {
                    parentAdapter.log.info("cancel Open TimerId ");
                    clearTimeout(room.WindowOpenTimerId);
                    room.WindowOpenTimerId = null;
                }
                //window is just opening
                else if (room.WindowIsOpen == false && state.val == true && parseInt(parentAdapter.config.SensorOpenDelay) > 0) {
                    room.WindowOpenTimerId = setTimeout(WindowOpenTimeout, parseInt(parentAdapter.config.SensorOpenDelay) * 1000, room.Name);
                    parentAdapter.log.info("sensor open delay " + parseInt(parentAdapter.config.SensorOpenDelay) * 1000 + " for " + room.Name);
                }
                //window is just closing
                else if (room.WindowIsOpen == true && state.val == false && parseInt(parentAdapter.config.SensorCloseDelay) > 0) {
                    room.WindowCloseTimerId = setTimeout(WindowCloseTimeout, parseInt(parentAdapter.config.SensorCloseDelay) * 1000, room.Name);
                    parentAdapter.log.info("sensor close delay " + parseInt(parentAdapter.config.SensorCloseDelay) * 1000 + " for " + room.Name);
                }
                else {
                    //without delay we set new state immideately
                    ChangeStatus("Sensor", devices[d].room, state);
                }
            }
            bRet = true;
        }
    }
    if (!bRet && parentAdapter.config.UseActors) {
        const devices = findObjectsByKey(Thermostats, "OID_Current", id);

        for (let d = 0; d < devices.length; d++) {
            ChangeStatus("Thermostats_Current", Thermostats[d].room, state);
            bRet = true;
        }
    }

    if (!bRet && parentAdapter.config.UseChangesFromThermostat > 1) {
        const devices = findObjectsByKey(Thermostats, "OID_Target", id);

        for (let d = 0; d < devices.length; d++) {
            ChangeStatus("Thermostats_Target", Thermostats[d].room, state);
            bRet = true;
        }
    }

    return bRet;
}

function WindowOpenTimeout(roomName) {

    try {

        const room = findObjectByKey(Rooms, "Name", roomName);
        if (room != null) {
            parentAdapter.log.debug("Window open timeout for " + room.Name);

            if (room.WindowOpenTimerId) {
                clearTimeout(room.WindowOpenTimerId);
                room.WindowOpenTimerId = null;
            }

            ChangeStatus("Sensor", room.Name, true);
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in WindowOpenTimeout [" + e + "] " + roomName);
    }
}

function WindowCloseTimeout(roomName) {
    try {
        const room = findObjectByKey(Rooms, "Name", roomName);
        if (room != null) {

            parentAdapter.log.debug("Window close timeout for " + room.Name);

            if (room.WindowCloseTimerId) {
                clearTimeout(room.WindowCloseTimerId);
                room.WindowCloseTimerId = null;
            }

            ChangeStatus("Sensor", room.Name, false);
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in WindowCloseTimeout [" + e + "] " + roomName);
    }
}


//*******************************************************************
//
async function StartStatemachine() {
    parentAdapter.log.info("start statemachine");

    try {
        //all sensors
        await CheckAllSensor();
        //all actors
        await CheckAllActors();
        //external states
        await CheckExternalStates();
        //current profile point
        //initial states for rooms

        parentAdapter.log.info("statemachine started");
    }
    catch (e) {
        parentAdapter.log.error("exception in StartStatemachine [" + e + "]");
    }
}
//*******************************************************************
//
async function CheckAllSensor() {
    if (parentAdapter.config.UseSensors) {
        parentAdapter.log.debug("check all active sensors");
        for (let s = 0; s < Sensors.length; s++) {
            const value = await parentAdapter.getForeignStateAsync(Sensors[s].OID);
            ChangeStatus("Sensor", Sensors[s].room, value);
        }
    }
}

//*******************************************************************
//
async function CheckAllActors() {
    try {
        if (parentAdapter.config.UseActors) {
            parentAdapter.log.info("checking all actors");
            let actorsOn = 0;
            let noOfActors = 0;
            for (let i = 0; i < Actors.length; i++) {

                if (Actors[i].OID.length > 1) {

                    noOfActors++;
                    const current = await parentAdapter.getForeignStateAsync(Actors[i].OID);

                    if (current !== null && typeof current !== undefined) {
                        if (current.val) {
                            actorsOn++;
                        }
                        Actors[i].lastState = current.val;
                    }
                }
            }

            parentAdapter.log.info(actorsOn + " actors are on of " + noOfActors);
            await parentAdapter.setStateAsync("ActorsOn", { val: actorsOn, ack: true });
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in CheckAllActors [" + e + "]");
    }
}

//*******************************************************************
//
async function CheckExternalStates() {
    parentAdapter.log.info("checking external states");
    const Present = await parentAdapter.getStateAsync("Present");
    const VacationAbsent = await parentAdapter.getStateAsync("VacationAbsent");
    const HolidayPresent = await parentAdapter.getStateAsync("HolidayPresent");
    const GuestsPresent = await parentAdapter.getStateAsync("GuestsPresent");
    const PartyNow = await parentAdapter.getStateAsync("PartyNow");
    const PublicHolidyToday = await parentAdapter.getStateAsync("PublicHolidyToday");

    ChangeStatus("Present", "all", Present);
    ChangeStatus("VacationAbsent", "all", VacationAbsent);
    ChangeStatus("HolidayPresent", "all", HolidayPresent);
    ChangeStatus("GuestsPresent", "all", GuestsPresent);
    ChangeStatus("PartyNow", "all", PartyNow);
    ChangeStatus("PublicHolidyToday", "all", PublicHolidyToday);
}


module.exports = {
    CreateDatabase,
    GetUsedRooms,
    ChangeStatus,
    SubscribeDevices,
    UnsubscribeDevices,
    CheckStateChangeDevice,
    StartStatemachine
};