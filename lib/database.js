"use strict";

const findObjectByKey = require("./support_tools.js").findObjectByKey;
const findObjectIdByKey = require("./support_tools.js").findObjectIdByKey;
const findObjectsByKey = require("./support_tools.js").findObjectsByKey;
const findObjectsIdByKey = require("./support_tools.js").findObjectsIdByKey;


const ActorsWithoutThermostat = [];
const Actors = [];
const Sensors = [];
const Thermostats = [];
const Rooms = [];

//adapter.config.rooms
//      - name
//      - isActive

//adapter.config.devices
//      - name
//      - isActive
//      - room
//      - type   1=thermostat, 2=actor, 3=sensor
//      - OID_Target
//      - OID_Current


//*******************************************************************
//
async function CreateDatabase(adapter) {
    adapter.log.info("start CreateDatabase");

    try {
        //create rooms
        for (let room = 0; room < adapter.config.rooms.length; room++) {
            if (adapter.config.rooms[room].isActive) {

                const sensors = await GetSensorsId4Room(adapter, adapter.config.rooms[room].name);
                const actors = await GetActorsId4Room(adapter, adapter.config.rooms[room].name);
                const thermostats = await GetThermostatId4Room(adapter, adapter.config.rooms[room].name);

                let HasActorsWithoutThermostat = false;
                if (actors.length > 0 && thermostats.length == 0) {
                    HasActorsWithoutThermostat = true;

                    for (let d = 0; d < actors.length; d++) {
                        ActorsWithoutThermostat.push({
                            name: actors[d].name,
                            id: actors[d].id,
                            room: adapter.config.rooms[room].name
                        });
                    }

                }

                Rooms.push({
                    ID: room,
                    Name: adapter.config.rooms[room].name,
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
                    IsInOverride: false,
                    IsInReduced: false,
                    IsInManual: false,
                    ReducedState: "",
                    Sensors: sensors,           // list of sensor id's from Sensors
                    Actors: actors,             // list of actor id's from Actors
                    Thermostats: thermostats,    // list of thermostat id's from Thermostats
                    HasActorsWithoutThermostat: HasActorsWithoutThermostat
                });

                

            }
        }
        adapter.log.debug("CreateDatabase: " + Rooms.length + " active rooms found " + JSON.stringify(Rooms));

        adapter.log.debug("CreateDatabase: " + Sensors.length + " active sensors found " + JSON.stringify(Sensors));
        adapter.log.debug("CreateDatabase: " + Actors.length + " active actors found " + JSON.stringify(Actors));
        adapter.log.debug("CreateDatabase: " + Thermostats.length + " active thermostats found " + JSON.stringify(Thermostats));


      
    }
    catch (e) {
        adapter.log.error("CreateDatabase in  main [" + e + "]");
    }




    adapter.log.info("CreateDatabase done with " + Rooms.length + " rooms");
}

async function GetSensorsId4Room(adapter, room) {

    const sensors = [];
    if (adapter.config.UseSensors) {
        const devices = findObjectsByKey(adapter.config.devices, "room", room);

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

async function GetActorsId4Room(adapter, room) {

    const actors = [];
    if (adapter.config.UseActors) {
        const devices = findObjectsByKey(adapter.config.devices, "room", room);

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

async function GetThermostatId4Room(adapter, room) {
    const thermostats = [];

    const devices = findObjectsByKey(adapter.config.devices, "room", room);

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

    //adapter.log.debug("got thermostats for " + room + "" + JSON.stringify(thermostats) + " " + JSON.stringify(Thermostats));
    return thermostats;
}






module.exports = {
    CreateDatabase
};