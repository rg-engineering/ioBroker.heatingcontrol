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
                    case "listDevices":
                        //adapter.log.debug("got list devices");
                        await ListDevices(obj);
                        break;
                    case "listNewRooms":
                        await ListNewRooms(obj);
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
        adapter.log.warn("to do");
    }
    catch (e) {
        adapter.log.error("exception in CreateDatapoints [" + e + "]");
    }

    adapter.log.debug("CreateDatepoints done");
}

//#######################################
//
// used as interface to admin
async function ListDevices(obj) {

    const devices = null;

    adapter.sendTo(obj.from, obj.command, devices, obj.callback);

}

async function ListNewRooms(obj) {
    const rooms = null;
    try {
        //GetNewRooms();
    }
    catch (e) {
        adapter.log.error("exception in ListNewRooms [" + e + "]");
    }
    adapter.sendTo(obj.from, obj.command, rooms, obj.callback);
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