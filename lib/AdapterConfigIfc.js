"use strict";

//===================================================================================
//own imports
//support_tools
const findObjectByKey = require("./support_tools.js").findObjectByKey;
//const findObjectIdByKey = require("./support_tools.js").findObjectIdByKey;
//const findObjectsByKey = require("./support_tools.js").findObjectsByKey;
//const findObjectsIdByKey = require("./support_tools.js").findObjectsIdByKey;




//#######################################
//
async function GetNewRooms(adapter, language) {
    
    const newRooms = [];

    const oRoomsEnum = await adapter.getEnumAsync("rooms");

    if (oRoomsEnum != null && typeof oRoomsEnum != undefined) {
        const RoomsEnum = oRoomsEnum.result;
        //adapter.log.debug("got enum rooms " + JSON.stringify(RoomsEnum));

        for (const e in RoomsEnum) {

            let name = undefined;

            if (typeof RoomsEnum[e].common.name === "string") {
                name = RoomsEnum[e].common.name;
            }
            else if (typeof RoomsEnum[e].common.name === "object") {
                name = RoomsEnum[e].common.name[language];
            }
            else {
                adapter.log.warn("unknown type " + typeof RoomsEnum[e].common.name + " " + JSON.stringify(RoomsEnum[e].common.name));
            }

            let AlreadyExist = false;

            const result = findObjectByKey(adapter.config.rooms, "name", name);

            if (result !== null) {
                AlreadyExist = true;
                adapter.log.debug("Listrooms room " + name + " already exist");
            }
            else {
                adapter.log.debug("Listrooms found new room " + name);
            }
        
            if (!AlreadyExist) {
                newRooms.push({
                    name: name,
                    isActive: false,    //must be enabled manually, otherwise we create too many datapoints for unused rooms
                });
            }
        }

        adapter.log.debug("got new rooms " + JSON.stringify(newRooms));
    }

    return newRooms;
}

//#######################################
//
async function GetNewThermostats(adapter, language, room) {
    adapter.log.debug("GetNewThermostats for room " + room);
    adapter.log.warn("GetNewThermostats not implemented yet");
    const newThermostats = [];

    return newThermostats;
}

//#######################################
//
async function GetNewActors(adapter, language, room) {

    adapter.log.debug("GetNewActors for room " + room);
    adapter.log.warn("GetNewActors not implemented yet");
    const newActors = [];

    return newActors;
}

//#######################################
//
async function GetNewSensors(adapter, language, room) {
    adapter.log.debug("GetNewSensors for room " + room);
    adapter.log.warn("GetNewSensors not implemented yet");
    const newSensors = [];

    return newSensors;
}

/*
//#######################################
//
function GetAllRooms(adapter) {
    const rooms = adapter.config.rooms;



    return rooms;

}
*/

/*
//#######################################
//
async function GetAllFunctions(adapter, language) {
    const enumFunctions = [];
    adapter.log.debug("start ListFunctions");
    const AllFunctionsEnum = await adapter.getEnumAsync("functions");
    //adapter.log.debug("function enums: " + JSON.stringify(AllFunctionsEnum));
    const functions = AllFunctionsEnum.result;

    for (const e1 in functions) {

        let name = undefined;

        if (typeof functions[e1].common.name === "string") {
            name = functions[e1].common.name;
        }
        else if (typeof functions[e1].common.name === "object") {
            name = functions[e1].common.name[language];
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

    return enumFunctions;

}
*/


module.exports = {
    //GetAllFunctions,
    //GetAllRooms,
    GetNewRooms,
    GetNewThermostats,
    GetNewActors,
    GetNewSensors
};