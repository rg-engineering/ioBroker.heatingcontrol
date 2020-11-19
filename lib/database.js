"use strict";

const findObjectByKey = require("./support_tools.js").findObjectByKey;
//const findObjectIdByKey = require("./support_tools.js").findObjectIdByKey;
const findObjectsByKey = require("./support_tools.js").findObjectsByKey;
//const findObjectsIdByKey = require("./support_tools.js").findObjectsIdByKey;
const Check4ValidTemperature = require("./support_tools.js").Check4ValidTemperature;
const CheckValidTime = require("./support_tools.js").CheckValidTime;

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
                    TemperatureManualMode: -99,
                    CurrentTemperature: -99,
                    ReducedState: "",
                    HasActorsWithoutThermostat: HasActorsWithoutThermostat,
                    WindowCloseTimerId: null,
                    WindowOpenTimerId: null,
                    ActorOnTimerId:null,
                    ActorOffTimerId:null,
                    Present: true,
                    VacationAbsent: false,
                    HolidayPresent: false,
                    GuestsPresent: false,
                    PartyNow: false,
                    PublicHolidyToday: false,
                    OverrideTimerId:null

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
                    currentTarget: -99,
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
let alreadyChanging = false;
async function ChangeStatus(state, room, value) {

    if (alreadyChanging) {
        parentAdapter.log.warn("ChangeStatus called, while already changing ");
    }
    //to do: only one change call is allowed, put other in a list
    alreadyChanging = true;
    if (room == "all") {
        for (room = 0; room < Rooms.length; room++) {
            await ChangeStatus_Part2(state, Rooms[room].Name, value);
        }
    }
    else {
        await ChangeStatus_Part2(state, room, value);
    }
    alreadyChanging = false;
}

async function ChangeStatus_Part2(state, room, value) {

    try {
        const theRoom = findObjectByKey(Rooms, "Name", room);

        let val;
        if (typeof value == "object") {
            val = value.val;
        }
        else {
            val = value;
        }
        parentAdapter.log.debug("ChangeStatus " + val + " type " + typeof value + " org " + JSON.stringify(value)); 
        //ChangeStatus undefined type object org { "room": "Küche", "target": 22, "currentPeriod": 3 }

        let changed = false;
        let handleActors = false;
        if (theRoom != null) {
            if (state == "Sensor") {
                if (theRoom.WindowIsOpen != val) {
                    changed = true;
                }
                theRoom.WindowIsOpen = val;
                parentAdapter.log.debug("Change Status WindowOpen in " + theRoom.Name + " to " + val);
            }
            else if (state == "Thermostats_Current") {
                parentAdapter.log.debug("Change Status current temperature in " + theRoom.Name + " to " + val);
                theRoom.CurrentTemperature = val;
                handleActors = true;
            }
            else if (state == "Profile") {
                parentAdapter.log.warn("ChangeStatus Profile not implemented yet ");
            }
            else if (state == "TemperaturOverride" || state == "TemperaturOverrideTime") {
                parentAdapter.log.warn("ChangeStatus Override ");
                await CheckOverride(theRoom);
                changed = true;
            }
            else if (state == "StopOveride") {
                theRoom.IsInOverride = false;
                theRoom.overrideTemp = 0;
                theRoom.State = "normal";
                changed = true;
            }
            else if (state == "ProfilPoint") {
                if (typeof value.target !== undefined && !isNaN(value.target)) { //this comes from cron job
                    theRoom.CurrentProfileTarget = Check4ValidTemperature(parentAdapter, value.target);
                    theRoom.CurrentTimePeriod = value.currentTimePeriod;
                    theRoom.ActiveTimeSlot = value.ActiveTimeSlot;
                    theRoom.CurrentTimePeriodTime = value.CurrentTimePeriodTime;
                    theRoom.CurrentTimePeriodFull = value.CurrentTimePeriodFull;
                    parentAdapter.log.debug("ChangeStatus by cron Profilepoint in " + theRoom.Name + " target " + theRoom.CurrentProfileTarget);
                    changed = true;
                }
                else if (val == -99) { //=-99 just triggers recalculation
                    parentAdapter.log.debug("ChangeStatus Profilepoint in " + theRoom.Name + " just recalc");
                    changed = true;
                }
                else {
                    //initial when adapter starts
                    parentAdapter.log.warn("ChangeStatus Profilepoint in " + theRoom.Name + " target " + val);
                    theRoom.CurrentProfileTarget = Check4ValidTemperature(parentAdapter, val);
                    changed = true;
                }
                
            }
            else if (state == "Present") {
                if (theRoom.Present != val) {
                    changed = true;
                }
                theRoom.Present = val;
                parentAdapter.log.debug("Change Status Present in " + theRoom.Name + " to " + val);
            }
            else if (state == "VacationAbsent") {
                if (theRoom.VacationAbsent != val) {
                    changed = true;
                }
                theRoom.VacationAbsent = val;
                parentAdapter.log.debug("Change Status VacationAbsent in " + theRoom.Name + " to " + val);
            }
            else if (state == "HolidayPresent") {
                if (theRoom.HolidayPresent != val) {
                    changed = true;
                }
                theRoom.HolidayPresent = val;
                parentAdapter.log.debug("Change Status HolidayPresent in " + theRoom.Name + " to " + val);
            }
            else if (state == "GuestsPresent") {
                if (theRoom.GuestsPresent != val) {
                    changed = true;
                }
                theRoom.GuestsPresent = val;
                parentAdapter.log.debug("Change Status GuestsPresent in " + theRoom.Name + " to " + val);
            }
            else if (state == "PartyNow") {
                if (theRoom.PartyNow != val) {
                    changed = true;
                }
                theRoom.PartyNow = val;
                parentAdapter.log.debug("Change Status PartyNow in " + theRoom.Name + " to " + val);
            }
            else if (state == "PublicHolidyToday") {
                if (theRoom.PublicHolidyToday != val) {
                    changed = true;
                }
                theRoom.PublicHolidyToday = val;
                parentAdapter.log.debug("Change Status PublicHolidyToday in " + theRoom.Name + " to " + val);
            }
            else {
                parentAdapter.log.warn("ChangeStatus not implemented yet " + state + " " + theRoom.Name + " value " + JSON.stringify(value));
            }

            if (changed) {
                const temperature = await CalculateRoomTemperature(theRoom);
                await SetRoomTemperature(theRoom, temperature);
                handleActors = true;
            }

            if (handleActors) {
                await HandleActors(theRoom);
                await CheckAllActors();
                await UpdateDPs(theRoom);
            }
        }
        else {
            parentAdapter.log.warn("ChangeStatus: room " + room + " not found");
        }

    }
    catch (e) {
        parentAdapter.log.error("exception in ChangeStatus [" + e + "]");
    }
}

async function CalculateRoomTemperature(room) {

    parentAdapter.log.info("CalculateRoomTemperature for " + room.Name);

    let Temp2Set = 20;
    room.IsInReduced = false;

    if (room.State == "normal") {
        Temp2Set = room.CurrentProfileTarget;

        parentAdapter.log.debug(room.Name + " normal mode: target " + Temp2Set);

       
        if (room.WindowIsOpen) {
            const preTemp2Set = await GetReducedTemperature(room.Name, Temp2Set, "WindowOpenDecrease");
            if (preTemp2Set != Temp2Set) {
                Temp2Set = preTemp2Set;
                room.ReducedState = "WindowOpen";
                room.IsInReduced = true;
            }
        }
        else if (!room.Present) {
            const preTemp2Set = await GetReducedTemperature(room.Name, Temp2Set, "AbsentDecrease");
            if (preTemp2Set != Temp2Set) {
                Temp2Set = preTemp2Set; room.ReducedState = "Absent";
                room.IsInReduced = true;
            }
        }
        else if (room.VacationAbsent) {
            const preTemp2Set = await GetReducedTemperature(room.Name, Temp2Set, "VacationAbsentDecrease");
            if (preTemp2Set != Temp2Set) {
                Temp2Set = preTemp2Set; room.ReducedState = "VacationAbsent";
                room.IsInReduced = true;
            }
        }
        else if (room.HolidayPresent) {


        }
        else if (room.GuestsPresent) {
            const preTemp2Set = await GetReducedTemperature(room.Name, Temp2Set, "PartyDecrease");
            if (preTemp2Set != Temp2Set) {
                Temp2Set = preTemp2Set; room.ReducedState = "Party";
                room.IsInReduced = true;
            }
        }
        else if (room.PartyNow) {
            const preTemp2Set = await GetReducedTemperature(room.Name, Temp2Set, "WindowOpenDecrease");
            if (preTemp2Set != Temp2Set) {
                Temp2Set = preTemp2Set; room.ReducedState = "WindowOpen";
                room.IsInReduced = true;
            }
        }
        else if (room.PublicHolidyToday) {
        }
        parentAdapter.log.debug(room.Name + " normal mode (incl. reduced): target " + Temp2Set);

    }
    else if (room.State == "override") {

        Temp2Set = room.TemperaturOverride;

        if (room.WindowIsOpen) {
            const preTemp2Set = await GetReducedTemperature(room.Name, Temp2Set, "WindowOpenDecrease");
            if (preTemp2Set != Temp2Set) {
                Temp2Set = preTemp2Set; room.ReducedState = "WindowOpen";
                room.IsInReduced = true;
            }
        }
    }
    else if (room.State == "manual") {

        Temp2Set = room.TemperatureManualMode;

        if (room.WindowIsOpen) {
            const preTemp2Set = await GetReducedTemperature(room.Name, Temp2Set, "WindowOpenDecrease");
            if (preTemp2Set != Temp2Set) {
                Temp2Set = preTemp2Set; room.ReducedState = "WindowOpen";
                room.IsInReduced = true;
            }
        }
    }
    else {
        parentAdapter.log.warn(room.Name + " not supported room stata " + room.State);
        
    }


    Temp2Set=CheckMinTemp(room.Name, Temp2Set);

    return Temp2Set;


}

async function GetReducedTemperature(room, target, parameter) {

    try {
        let decreaseMode = false;
        const currentProfile = await GetCurrentProfile();
        let id = "Profiles." + currentProfile + "." + room;
        if (parseInt(parentAdapter.config.TemperatureDecrease) === 1) {// relative
            id += ".relative";
            decreaseMode = true;
        }
        else if (parseInt(parentAdapter.config.TemperatureDecrease) === 2) {// absolutue
            id += ".absolute";
            decreaseMode = true;
        }

        if (decreaseMode) {
            id += "." + parameter;

            parentAdapter.log.debug("checking reduced temp with " + id);

            const reducedTemp = await parentAdapter.getStateAsync(id);
            parentAdapter.log.debug("got " + JSON.stringify(reducedTemp));

            if (typeof reducedTemp !== undefined && reducedTemp !== null && reducedTemp.val !== null) {

                if (parseInt(parentAdapter.config.TemperatureDecrease) === 1) {// relative
                    target -= reducedTemp.val;
                }
                else if (parseInt(parentAdapter.config.TemperatureDecrease) === 2) {// absolutue
                    target = reducedTemp.val;
                }
            }
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in GetReducedTemperature [" + e + "]");
    }
    return target;
}

async function CheckMinTemp(room, target) {

    try {
        if (parentAdapter.config.UseMinTempPerRoom) {

            const id = "Rooms." + room + ".MinimumTemperature";

            parentAdapter.log.debug("checking min temp with " + id);
            const minTemp = await parentAdapter.getStateAsync(id);
            parentAdapter.log.debug("got " + JSON.stringify(minTemp));

            if (typeof minTemp !== undefined && minTemp !== null && minTemp.val !== null && target < minTemp.val) {
                parentAdapter.log.info("target " + target + " lower then minimum " + minTemp.val + " : setting to min");
                target = minTemp.val;
            }
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in CheckMinTemp [" + e + "]");
    }
    return target;
}

//*******************************************************************
//
async function CheckOverride(room) {

    const id = "Rooms." + room.Name;
    const overrideTemp = await parentAdapter.getStateAsync(id + ".TemperaturOverride");
    const overrideTime = await parentAdapter.getStateAsync(id + ".TemperaturOverrideTime");

    if (overrideTemp != null && overrideTime != null) {
        const temperature = Check4ValidTemperature(parentAdapter,overrideTemp.val);
        const time = CheckValidTime(parentAdapter,"override",overrideTime.val);

        const times = time.split(":");
        if (temperature > 0 && (parseInt(times[0]) > 0 || parseInt(times[1]) > 0)) {

            if (room.OverrideTimerId == null) {
               

                const timeout = parseInt(times[0]) * 60 *60 + parseInt(times[1]*60);
                parentAdapter.log.debug(room.Name + " start override for " + timeout + "sec");

                room.OverrideTimerId = setTimeout(OverrideTimeout, timeout * 1000, room.Name);

                room.State = "override";
                room.IsInOverride = true;
                room.TemperaturOverride = temperature;
                room.overrideTime = time;
               
            }
            else {
                room.State = "override";
                room.IsInOverride = true;
                room.TemperaturOverride = temperature;
                room.overrideTime = time;
                parentAdapter.log.debug(room.Name + " is already in override");
            }
        }
        else {

            if (room.OverrideTimerId != null) {
                parentAdapter.log.debug(room.Name + " stop override");
                clearTimeout(room.OverrideTimerId);
                room.OverrideTimerId = null;
            }

            room.State = "normal";
            room.IsInOverride = false;
            room.TemperaturOverride = 0;
        }
    }
}


async function OverrideTimeout(roomName) {

    try {

        const room = findObjectByKey(Rooms, "Name", roomName);
        if (room != null) {
            parentAdapter.log.debug("override timeout (finished) for " + room.Name);

            if (room.OverrideTimerId) {
                clearTimeout(room.OverrideTimerId);
                room.OverrideTimerId = null;
            }

            await ChangeStatus("StopOveride", room.Name, true);
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in OverrideTimeout [" + e + "] " + roomName);
    }
}

//*******************************************************************
//
async function GetCurrentProfile() {

    parentAdapter.log.debug("get current profile");
    let currentProfile = 1;

    try {
        const id = "CurrentProfile";
        const curProfile = await parentAdapter.getStateAsync(id);


        if (curProfile != null) {
            currentProfile = curProfile.val;

            if (currentProfile < 1 || currentProfile > parseInt(parentAdapter.config.NumberOfProfiles, 10)) {
                currentProfile = 1;
            }
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in GetCurrentProfile [" + e + "]");
    }
    parentAdapter.log.debug("profile " + currentProfile);
    return currentProfile;
}


//*******************************************************************
//
async function UpdateDPs(room) {

    parentAdapter.log.info("UpdateDPs  for " + room.Name);

    const id = "Rooms." + room.Name;
    await parentAdapter.setStateAsync(id + ".CurrentTarget", { val: room.CurrentTarget, ack: true });
    await parentAdapter.setStateAsync(id + ".ActiveTimeSlot", { val: room.ActiveTimeSlot, ack: true });
    await parentAdapter.setStateAsync(id + ".CurrentTimePeriodFull", { val: room.CurrentTimePeriodFull, ack: true });
    await parentAdapter.setStateAsync(id + ".CurrentTimePeriod", { val: room.CurrentTimePeriod, ack: true });
    await parentAdapter.setStateAsync(id + ".CurrentTimePeriodTime", { val: room.CurrentTimePeriodTime, ack: true });
    await parentAdapter.setStateAsync(id + ".WindowIsOpen", { val: room.WindowIsOpen, ack: true });

    let state = room.State;
    if (room.IsInReduced) {
        state += " " + room.ReducedState;
    }

    await parentAdapter.setStateAsync(id + ".State", { val: state, ack: true });
    if (!room.IsInOverride) {
        await parentAdapter.setStateAsync(id + ".TemperaturOverride", { val: 0, ack: true });
    }
    /*
    await parentAdapter.setStateAsync(id + ".TemperaturOverrideTime", { val: room.CurrentTarget, ack: true });
    */

    const now = new Date();
    const datestring = ("0" + now.getDate()).slice(-2) + "." + ("0" + (now.getMonth() + 1)).slice(-2) + "." +
        now.getFullYear() + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2);
    await parentAdapter.setStateAsync("LastProgramRun", { val: datestring, ack: true });


}

//*******************************************************************
//
async function SetRoomTemperature(room, temperature) {

    parentAdapter.log.info("SetRoomTemperature started for " + room.Name + " target " + temperature);

    try {
        const target = Check4ValidTemperature(parentAdapter, temperature);
        const thermostats = findObjectsByKey(Thermostats, "room", room.Name);

        if (thermostats != null) {
            for (let d = 0; d < thermostats.length; d++) {

                const current = await parentAdapter.getForeignStateAsync(thermostats[0].OID_Target);

                if (current != null && current.val != target) {

                    parentAdapter.log.debug(room.Name + " set thermostat target " + thermostats[d].OID_Target + " to " + target);
                    await parentAdapter.setForeignStateAsync(thermostats[d].OID_Target, target);
                    room.CurrentTarget = target;
                    thermostats[d].lastTarget = thermostats[d].currentTarget;
                    thermostats[d].currentTarget = target;
                }
                else {
                    parentAdapter.log.debug(room.Name + " nothing to do to for " + thermostats[d].OID_Target + " , target " + target + " is already set " + current.val);
                }
            }
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in SetRoomTemperature [" + e + "] ");
    }

}

//*******************************************************************
//
async function HandleActors(room) {
    parentAdapter.log.info("HandleActors for " + room.Name);
    try {
        if (parentAdapter.config.UseActors) {
            const actors = findObjectsByKey(Actors, "room", room.Name);
            const thermostats = findObjectsByKey(Thermostats, "room", room.Name);

            if (actors != null && actors.length > 0 && thermostats != null && thermostats.length>0) {

                parentAdapter.log.debug("HandleActors " + room.Name + " " + JSON.stringify(actors) + " " + JSON.stringify(thermostats));

                const current = await parentAdapter.getForeignStateAsync(thermostats[0].OID_Current);
                const target = await parentAdapter.getForeignStateAsync(thermostats[0].OID_Target);

                if (current != null && target != null) {

                    let value2set;
                    if (current.val >= target.val) {
                        value2set = false;
                    }
                    else {
                        value2set = true;
                    }

                    parentAdapter.log.debug("HandleActors: " + room.Name + " " + " got current " + current.val + " target " + target.val + " = " + value2set);

                    for (let d = 0; d < actors.length; d++) {
                        const valueSet = await parentAdapter.getForeignStateAsync(actors[d].OID);
                        if (valueSet != null && value2set != valueSet.val) {

                            if (value2set == false) {
                                if (parseInt(parentAdapter.config.ActorBeforeOffDelay) > 0) {
                                    if (room.ActorOnTimerId) {
                                        clearTimeout(room.ActorOnTimerId);
                                        room.ActorOnTimerId = null;
                                        parentAdapter.log.debug(room.Name + " cancel actor on delay");
                                    }
                                    else {
                                        if (room.ActorOffTimerId == null) {
                                            room.ActorOffTimerId = setTimeout(ActorOffTimeout, parseInt(parentAdapter.config.ActorBeforeOffDelay) * 1000, room.Name);
                                            parentAdapter.log.info(room.Name + " actor before off delay " + parseInt(parentAdapter.config.ActorBeforeOffDelay) * 1000 + " for " + room.Name);
                                        }
                                    }
                                }
                                else {
                                    await parentAdapter.setForeignStateAsync(actors[d].OID, false);
                                }
                            }
                            else if (value2set == true) {
                                if (parseInt(parentAdapter.config.ActorBeforeOnDelay) > 0) {
                                    if (room.ActorOffTimerId) {
                                        clearTimeout(room.ActorOffTimerId);
                                        room.ActorOffTimerId = null;
                                        parentAdapter.log.debug(room.Name + " cancel actor off delay");
                                    }
                                    else {
                                        if (room.ActorOnTimerId == null) {
                                            room.ActorOnTimerId = setTimeout(ActorOnTimeout, parseInt(parentAdapter.config.ActorBeforeOnDelay) * 1000, room.Name);
                                            parentAdapter.log.info(room.Name + " actor before on delay " + parseInt(parentAdapter.config.ActorBeforeOnDelay) * 1000 + " for " + room.Name);
                                        }
                                    }
                                }
                                else {
                                    await parentAdapter.setForeignStateAsync(actors[d].OID, true);
                                }
                            }
                        }
                        else {
                            parentAdapter.log.debug("HandleActors: " + room.Name + " nothing to do " + valueSet.val + " == " + value2set);
                        }
                    }
                }
                else {
                    parentAdapter.log.warn("HandleActors: could not read current or target temperature on " + thermostats[0].name);
                }
            }
            else {
                parentAdapter.log.debug("HandleActors: no actors and/or no thermostats in " + room.Name);
            }
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in HandleActors [" + e + "] ");
    }
}

async function ActorOnTimeout(roomName) {
    try {
        const room = findObjectByKey(Rooms, "Name", roomName);
        if (room != null) {
            parentAdapter.log.debug("Actor on timeout for " + room.Name);

            if (room.ActorOnTimerId) {
                clearTimeout(room.ActorOnTimerId);
                room.ActorOnTimerId = null;
            }

            const actors = findObjectsByKey(Actors, "room", room.Name);
            for (let d = 0; d < actors.length; d++) {
                await parentAdapter.setForeignStateAsync(actors[d].OID, true);
            }
        }
        await CheckAllActors();
    }
    catch (e) {
        parentAdapter.log.error("exception in ActorOnTimeout [" + e + "] " + roomName);
    }
}

async function ActorOffTimeout(roomName) {
    try {
        const room = findObjectByKey(Rooms, "Name", roomName);
        if (room != null) {
            parentAdapter.log.debug("Actor off timeout for " + room.Name);

            if (room.ActorOffTimerId) {
                clearTimeout(room.ActorOffTimerId);
                room.ActorOffTimerId = null;
            }

            const actors = findObjectsByKey(Actors, "room", room.Name);
            for (let d = 0; d < actors.length; d++) {
                await parentAdapter.setForeignStateAsync(actors[d].OID, false);
            }
        }
        await CheckAllActors();
    }
    catch (e) {
        parentAdapter.log.error("exception in ActorOffTimeout [" + e + "] " + roomName);
    }
}


//*******************************************************************
//
async function SubscribeDevices() {

    parentAdapter.log.info("subscribe devices start");

    //thermostats
    if (parentAdapter.config.UseActors) {
        parentAdapter.log.info("subscribe thermostats current " + Thermostats.length);
        for (let t = 0; t < Thermostats.length; t++) {

            if (Thermostats[t].OID_Current != null && Thermostats[t].OID_Current.length > 0) {
                parentAdapter.log.info("subscribe thermostat current " + Thermostats[t].name + " " + Thermostats[t].OID_Current);
                parentAdapter.subscribeForeignStates(Thermostats[t].OID_Current);
            }
            else {
                parentAdapter.log.warn("OID Current for " + Thermostats[t].name + " not set");
            }
        }
    }
    if (parentAdapter.config.UseChangesFromThermostat > 1) {
        parentAdapter.log.info("subscribe thermostats target " + Thermostats.length);
        for (let t = 0; t < Thermostats.length; t++) {

            if (Thermostats[t].OID_Target != null && Thermostats[t].OID_Target.length > 0) {
                parentAdapter.log.info("subscribe thermostat target " + Thermostats[t].name + " " + Thermostats[t].OID_Target);
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
                parentAdapter.log.info("subscribe sensor " + Sensors[s].name + " " + Sensors[s].OID);
                parentAdapter.subscribeForeignStates(Sensors[s].OID);
            }
            else {
                parentAdapter.log.warn("OID for " + Sensors[s].name + " not set");
            }
        }
    }
    parentAdapter.log.info("subscribe devices done");
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
                    await ChangeStatus("Sensor", devices[d].room, state);
                }
            }
            bRet = true;
        }
    }
    if (!bRet && parentAdapter.config.UseActors) {
        const devices = findObjectsByKey(Thermostats, "OID_Current", id);

        for (let d = 0; d < devices.length; d++) {
            await ChangeStatus("Thermostats_Current", Thermostats[d].room, state);
            bRet = true;
        }
    }

    if (!bRet && parentAdapter.config.UseChangesFromThermostat > 1) {
        const devices = findObjectsByKey(Thermostats, "OID_Target", id);

        for (let d = 0; d < devices.length; d++) {
            await ChangeStatus("Thermostats_Target", Thermostats[d].room, state);
            bRet = true;
        }
    }

    return bRet;
}

async function WindowOpenTimeout(roomName) {

    try {

        const room = findObjectByKey(Rooms, "Name", roomName);
        if (room != null) {
            parentAdapter.log.debug("Window open timeout for " + room.Name);

            if (room.WindowOpenTimerId) {
                clearTimeout(room.WindowOpenTimerId);
                room.WindowOpenTimerId = null;
            }

            await ChangeStatus("Sensor", room.Name, true);
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in WindowOpenTimeout [" + e + "] " + roomName);
    }
}

async function WindowCloseTimeout(roomName) {
    try {
        const room = findObjectByKey(Rooms, "Name", roomName);
        if (room != null) {

            parentAdapter.log.debug("Window close timeout for " + room.Name);

            if (room.WindowCloseTimerId) {
                clearTimeout(room.WindowCloseTimerId);
                room.WindowCloseTimerId = null;
            }

            await ChangeStatus("Sensor", room.Name, false);
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
        //initial states for rooms
        for (let room = 0; room < Rooms.length; room++) {
            Rooms[room].State = "normal";
            Rooms[room].WindowIsOpen = false;
            Rooms[room].IsInOverride = false;
            Rooms[room].IsInReduced = false;
            Rooms[room].IsInManual = false;
        }
        //all sensors
        await CheckAllSensor();
        //all actors
        await CheckAllActors();
        //external states
        await CheckExternalStates();
        //current profile point
        await GetAllCurrentProfilePoint();

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
            await ChangeStatus("Sensor", Sensors[s].room, value);
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

    await ChangeStatus("Present", "all", Present);
    await ChangeStatus("VacationAbsent", "all", VacationAbsent);
    await ChangeStatus("HolidayPresent", "all", HolidayPresent);
    await ChangeStatus("GuestsPresent", "all", GuestsPresent);
    await ChangeStatus("PartyNow", "all", PartyNow);
    await ChangeStatus("PublicHolidyToday", "all", PublicHolidyToday);
}

//*******************************************************************
//
async function GetAllCurrentProfilePoint() {
    parentAdapter.log.info("calculate current profile point for all rooms");

    const currentProfile = await GetCurrentProfile();

    for (let room = 0; room < Rooms.length; room++) {
        await GetCurrentProfilePoint(Rooms[room], currentProfile);
        await ChangeStatus("ProfilPoint", Rooms[room].Name, -99);
    }
}

async function GetCurrentProfilePoint(room, currentProfile) {

    if (parseInt(parentAdapter.config.ProfileType, 10) === 1) {
        await GetCurrentProfilePointType1(room, currentProfile);
    }
    else if (parseInt(parentAdapter.config.ProfileType, 10) === 2) {
        await GetCurrentProfilePointType2(room, currentProfile);
    }
    else if (parseInt(parentAdapter.config.ProfileType, 10) === 3) {
        await GetCurrentProfilePointType3(room, currentProfile);
    }
    else {
        parentAdapter.log.warn("GetCurrentProfilePoint: unknown profile type " + parentAdapter.config.ProfileType);
    }
}

async function GetCurrentProfilePointType1(room, currentProfile) {
    parentAdapter.log.info("start calculate current profile point for profile type 1 (Mo - Su)");

    const now = new Date();

    const id = "Profiles." + currentProfile + "." + room.Name + ".Mo-Su.Periods.1.time";
    const firstTimeVal = await parentAdapter.getStateAsync(id);

    if (firstTimeVal != null) {
        const firstTime = firstTimeVal.val.split(":");

        if (firstTime.length >= 2) {
            //check current time before first profile point of the day
            if (now.getHours() < parseInt(firstTime[0])
                || (now.getHours() == parseInt(firstTime[0]) && now.getMinutes() < parseInt(firstTime[1]))) {

                now.setDate(now.getDate() - 1);
                now.setHours(23);
                now.setMinutes(59);
                parentAdapter.log.warn("last profile point from yesterday used");
            }

            for (let period = 1; period <= parentAdapter.config.NumberOfPeriods; period++) {
                const id = "Profiles." + currentProfile + "." + room.Name + ".Mo-Su.Periods." + period;
                const nextTimeVal = await parentAdapter.getStateAsync(id + ".time");
                const nextTempVal = await parentAdapter.getStateAsync(id + ".Temperature");

                if (nextTimeVal != null && nextTempVal != null) {
                    const nextTime = nextTimeVal.val.split(":");

                    if (nextTime.length >= 2) {

                        if (now.getHours() > parseInt(nextTime[0])
                            || (now.getHours() == parseInt(nextTime[0]) && now.getMinutes() > parseInt(nextTime[1]))) {

                            room.ActiveTimeSlot = period;
                            room.CurrentTimePeriodTime = nextTime[0] + ":" + nextTime[1];
                            room.CurrentTimePeriodFull = "Period " + period + " " + room.CurrentTimePeriodTime;
                            room.CurrentTimePeriod = period;
                            room.CurrentProfileTarget = Check4ValidTemperature(parentAdapter, nextTempVal.val);
                        }
                    }
                    else {
                        parentAdapter.log.warn(room.Name + " GetCurrentProfilePointType1: invalid time setting profile point " + period + " (" + nextTimeVal.val + ")");
                    }
                }
                else {
                    parentAdapter.log.warn(room.Name + " GetCurrentProfilePointType1: profile point " + id + " not found");
                }
            }
            parentAdapter.log.debug(room.Name + " found profile point at " + room.CurrentTimePeriodFull + " with " + room.CurrentProfileTarget);
        }
        else {
            parentAdapter.log.warn(room.Name + " GetCurrentProfilePointType1: invalid time setting profile point 1 (" + firstTimeVal.val + ")");
        }
    }
    else {
        parentAdapter.log.warn(room.Name + " GetCurrentProfilePointType1: first profile point time value not found " + id);
    }

}

async function GetCurrentProfilePointType2(room, currentProfile) {
    parentAdapter.log.info("start calculate current profile point for profile type 2 (Mo-Fr / Sa - Su)");
    parentAdapter.log.warn("not implemented yet");
}

async function GetCurrentProfilePointType3(room, currentProfile) {
    parentAdapter.log.info("start calculate current profile point for profile type 3 (ery day)");
    parentAdapter.log.warn("not implemented yet");
}


module.exports = {
    CreateDatabase,
    GetUsedRooms,
    ChangeStatus,
    SubscribeDevices,
    UnsubscribeDevices,
    CheckStateChangeDevice,
    StartStatemachine,
    GetCurrentProfile
};