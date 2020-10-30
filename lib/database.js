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
            id: ID, //ID in adapter.config.rooms
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
            id: ID, //ID in adapter.config.devices
            roomId: roomID,
            currentTarget: -99


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
            id: ID, //ID in adapter.config.devices
            roomId: roomID,
            currentState:false
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
            id: ID, //ID in adapter.config.devices
            roomId: roomID,
           currentState: false
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