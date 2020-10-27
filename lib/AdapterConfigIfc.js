"use strict";

function GetConfigParam(adapter,name) {

    let ret;



    return ret;



}

/*
function GetAllRooms(adapter) {
    const rooms = adapter.config.rooms;



    return rooms;

}
*/

/*
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
    GetConfigParam,
    //GetAllFunctions,
    //GetAllRooms
};