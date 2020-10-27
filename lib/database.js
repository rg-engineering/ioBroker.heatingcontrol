"use strict";

let Rooms = [];
let Thermostats = [];
let Sensors = [];
let Actors = [];

//#######################################
//
function CreateRoom(name) {

    Rooms.push(
        {
            name: name,
            isActive: true,
            thermostats: [], //Liste der ID's
            sensors: [],  //Liste der ID's
            actors: [],   //Liste der ID's
            CurrentTarget: -99,
            CurrentProfileIdx: -1,
            WindowIsOpen: false,


        }

    );

}




//#######################################
//
// thermostats
function CreateTermostat(name) {

    Thermostats.push(
        {
            name: name,
            roomId: roomID,
            isActive: true,
            OID_Target: OID_Target,
            OID_Current: OID_Current,


        }

    );

}

function GetThermostats4Room(roomName) {
}

//#######################################
//
// sensors
function CreateSensor(name) {

    Sensors.push(
        {
            name: name,
            roomId: roomID,
            isActive: true,
            OID_Current: OID_Current,
        }

    );

}

function GetSensors4Room(roomName) {
}

//#######################################
//
// actors
function CreateActor(name) {

    Actors.push(
        {
            name: name,
            roomId: roomID,
            isActive: true,
            OID_Target: OID_Target,
        }

    );

}

function GetActors4Room(roomName) {
}


module.exports = {
    CreateRoom,
    CreateTermostat,
    GetThermostats4Room,
    CreateSensor,
    GetSensors4Room,
    CreateActor,
    GetActors4Room

};