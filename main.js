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
const utils = require('@iobroker/adapter-core');
const CronJob = require('cron').CronJob;


//========================================================================
//this must be false for production use! set it to true when you use static data for debuggung purpose only
//const bDebug = false;
//========================================================================

//structure for devices:
//    * RoomName
//    * IsActive
//    * List of Thermostats
//    * List of Actors
//    * List of Sensors


//structure for hardware (thermostats, sensors, actors):
//    * Name
//    * IsActive
//    * getValueID
//    * setValueID


// Die ThermostatTypeTab definiert die Thermostat Typen.
// used for known hardware, all others can be set manually
const ThermostatTypeTab = [];
//Homematic
ThermostatTypeTab[0] = ['HM-TC-IT-WM-W-EU', 'Wandthermostat (neu)', '.2.SET_TEMPERATURE', '.1.TEMPERATURE', '2.CONTROL_MODE'];
ThermostatTypeTab[1] = ['HM-CC-TC',             'Wandthermostat (alt)',         '.2.SETPOINT',                   '.1.TEMPERATURE',            false               ];
ThermostatTypeTab[2] = ['HM-CC-RT-DN',          'Heizkoerperthermostat(neu)',   '.4.SET_TEMPERATURE',            '.4.ACTUAL_TEMPERATURE',     '4.CONTROL_MODE'    ];
ThermostatTypeTab[3] = ['HMIP-eTRV',            'Heizkoerperthermostat(HMIP)',  '.1.SET_POINT_TEMPERATURE',      '.1.ACTUAL_TEMPERATURE',     '1.CONTROL_MODE'    ];
ThermostatTypeTab[4] = ['HMIP-WTH',             'Wandthermostat(HMIP)',         '.1.SET_POINT_TEMPERATURE',      '.1.ACTUAL_TEMPERATURE',     '1.CONTROL_MODE'    ];
ThermostatTypeTab[5] = ['HMIP-WTH-2',           'Wandthermostat(HMIP)',         '.1.SET_POINT_TEMPERATURE',      '.1.ACTUAL_TEMPERATURE',     '1.CONTROL_MODE'    ];
ThermostatTypeTab[6] = ['HMIP-STH',             'Wandthermostat(HMIP)',         '.1.SET_POINT_TEMPERATURE',      '.1.ACTUAL_TEMPERATURE',     '1.CONTROL_MODE'    ];
ThermostatTypeTab[7] = ['HMIP-STHD',            'Wandthermostat(HMIP)',         '.1.SET_POINT_TEMPERATURE',      '.1.ACTUAL_TEMPERATURE',     '1.CONTROL_MODE'    ];
ThermostatTypeTab[8] = ['HMIP-eTRV-2',          'Heizkoerperthermostat(HMIP)',  '.1.SET_POINT_TEMPERATURE',      '.1.ACTUAL_TEMPERATURE',     '1.CONTROL_MODE'    ];
ThermostatTypeTab[9] = ['HMIP-eTRV-B',          'Heizkoerperthermostat(HMIP)',  '.1.SET_POINT_TEMPERATURE',      '.1.ACTUAL_TEMPERATURE',     '1.SET_POINT_MODE'  ];
const MaxHomematicThermostatType = 9;
//MaxCube
const MinMaxcubeThermostatType = 10;
ThermostatTypeTab[10] = ['max! Thermostat', 'Thermostat', '.setpoint', '.temp', '.mode'];
/*
MAX! Heizkörperthermostat basic
MAX! Heizkörperthermostat
MAX! Heizkörperthermostat +
MAX! Wandthermostat +
*/
const MaxMaxcubeThermostatType = 10;

//tado with Homebridge accessories manager
const MinTadoThermostatType = 20;
ThermostatTypeTab[20] = ['tado Thermostat', 'Thermostat', '.Target-Temperature', '.Current-Temperature', '.mode'];
//id ist ham.0.RaumName.ThermostatName.
const MaxTadoThermostatType = 20;




const ActorTypeTab = [];
const MinHomematicActorType = 0;
ActorTypeTab[0] = ['HM-LC-Sw4-PCB', 'Funk-Schaltaktor 4-fach, Platine',             '.STATE'    ];
ActorTypeTab[1] = ['HM-LC-Sw4-DR', 'Funk-Schaltaktor 4-fach, Hutschienenmontage',   '.STATE'    ];
ActorTypeTab[2] = ['HM-LC-Sw4-SM', 'Funk-Schaltaktor 4-fach, Aufputzmontage',       '.STATE'    ];
const MaxHomematicActorType = 2;


const SensorTypeTab = [];
const MinHomematicSensorType = 0;
SensorTypeTab[0] = ['HM-Sec-SC-2', 'Funk-Tür-/Fensterkontakt', '.STATE'];
SensorTypeTab[1] = ['HM-Sec-SCo', 'Funk-Tür-/Fensterkontakt, optisch', '.STATE'];
SensorTypeTab[2] = ['HM-Sec-RHS', 'Funk-Fenster-Drehgriffkontakt', '.STATE'];
const MaxHomematicSensorType = 2;




const DefaultTargets = [];
DefaultTargets[0] = ['05:00', 19];
DefaultTargets[1] = ['08:00', 21];
DefaultTargets[2] = ['12:00', 21];
DefaultTargets[3] = ['16:00', 19];
DefaultTargets[4] = ['21:00', 21];


let SystemDateFormat = "DD.MM.YYYY";


let ActorsWithoutThermostat = [];
let lastSetTemperature = [];

let adapter;
function startAdapter(options) {
    options = options || {};
    Object.assign(options, {
        name: 'heatingcontrol',
        //#######################################
        //
        ready: function () {
            try {
                //adapter.log.debug('start');
                main();
            }
            catch (e) {
                adapter.log.error('exception catch after ready [' + e + ']');
            }
        },
        //#######################################
        //  is called when adapter shuts down
        unload: function (callback) {
            try {
                adapter && adapter.log && adapter.log.info && adapter.log.info('cleaned everything up...');
                CronStop();
                callback();
            } catch (e) {
                callback();
            }

            

        },
        //#######################################
        //
        SIGINT: function () {
            adapter && adapter.log && adapter.log.info && adapter.log.info('cleaned everything up...');
            CronStop();
        },
        //#######################################
        //  is called if a subscribed object changes
        //objectChange: function (id, obj) {
        //    adapter.log.debug('[OBJECT CHANGE] ==== ' + id + ' === ' + JSON.stringify(obj));
        //},
        //#######################################
        // is called if a subscribed state changes
        stateChange: function (id, state) {
            //adapter.log.debug('[STATE CHANGE] ==== ' + id + ' === ' + JSON.stringify(state));
            HandleStateChange(id, state);
        },
        //#######################################
        //
        message: async (obj) => {
            if (obj) {
                switch (obj.command) {
                    case 'send':
                        // e.g. send email or pushover or whatever
                        adapter.log.debug('send command');

                        // Send response in callback if required
                        if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
                        break;
                    case 'listDevices':
                        //adapter.log.debug('got list devices');
                        await ListDevices(obj);
                        break;
                    case 'listRooms':
                        //adapter.log.debug('got list rooms');
                        await ListRooms(obj);
                        break;
                    case 'listFunctions':
                        //adapter.log.debug('got list rooms');
                        await ListFunctions(obj);
                        break;
                    case 'Test':
                        //adapter.sendTo(obj.from, obj.command, "das ist ein Test", obj.callback);
                        break;
                    default:
                        adapter.log.error('unknown message ' + obj.command);
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
        await CreateDatepoints();
        
        SystemDateFormat = await GetSystemDateformat();

        SearchActorsWithoutThermostat();

        await checkHeatingPeriod();

        await CalculateNextTime();

        //need to check all WindowSensors per Room
        await CheckAllWindowSensors();

        await CheckAllActors();

        await CheckAllExternalStates();

        await CheckTemperatureChange();

        await SubscribeStates();
    }
    catch (e) {
        adapter.log.error('exception in  main [' + e + ']');
    }
}


async function GetSystemLanguage() {
    let language = "de";
    let ret = await adapter.getForeignObjectAsync('system.config');

    language = ret.common.language;

    return language;
}

async function GetSystemDateformat() {
    let dateformat = "DD.MM.YYYY";
    let ret = await adapter.getForeignObjectAsync('system.config');

    dateformat = ret.common.dateFormat;

    adapter.log.debug('system date format ' + dateformat);

    return dateformat;
}

async function ListRooms(obj) {

    adapter.log.debug("ListRooms " + JSON.stringify(obj));

    if (adapter.config.deleteall) {
        adapter.log.info("ListRooms: delete all rooms and start new search");
        adapter.config.rooms.length = 0;
    }

    let search4new = false;

    if (obj.message) { //search4new
        adapter.log.info("ListRooms: search for new rooms");
        search4new = true;
    }


    let newRooms = 0;

    if (adapter.config.rooms.length === 0 || search4new) {


        var rooms = {};
        //get room enums first; this includes members as well
        const AllRoomsEnum = await adapter.getEnumAsync('rooms');
        rooms = AllRoomsEnum.result;
        adapter.log.debug("rooms " + JSON.stringify(rooms));

        let language = await GetSystemLanguage();

        for (let e in rooms) {

            let name = "undefined";

            if (typeof rooms[e].common.name === 'string') {
                name = rooms[e].common.name;
            }
            else if (typeof rooms[e].common.name === 'object') {
                name = rooms[e].common.name.de;

                name = rooms[e].common.name[language];
                //adapter.log.warn("room name " + name + " " + JSON.stringify(rooms[e].common.name));
            }
            else {
                adapter.log.warn("unknown type " + typeof rooms[e].common.name + " " + JSON.stringify(rooms[e].common.name));
            }

            let AlreadyExist = false;

            if (search4new) { //check already exist

                let roomdata = findObjectByKey(adapter.config.rooms, "name", name);

                if (roomdata !== null) {
                    AlreadyExist = true;
                    adapter.log.debug('Listrooms room ' + name + " already exist");
                }
                else {

                    adapter.log.debug('Listrooms found new room ' + name);
                }
            }

            if (!AlreadyExist) {
                newRooms++;
                adapter.config.rooms.push({
                    name: name,
                    isActive: false,    //must be enabled manually, otherwise we create too many datapoints for unused rooms
                    WindowIsOpen: false,
                    TempOverride: false,
                    TempOverrideDue: ''
                });
            }

        }
    }
    adapter.log.debug('all rooms done with ' + newRooms + " new rooms :" + JSON.stringify(adapter.config.rooms));

    var returnObject = {
        list: adapter.config.rooms,
        newRooms: newRooms
    };


    adapter.sendTo(obj.from, obj.command, returnObject , obj.callback);
}




async function ListFunctions(obj) {

    let enumFunctions = [];
    adapter.log.debug('### start ListFunctions');
    const AllFunctionsEnum = await adapter.getEnumAsync('functions');
    adapter.log.debug("function enums: " + JSON.stringify(AllFunctionsEnum));
    let functions = AllFunctionsEnum.result;

    let language = await GetSystemLanguage();

    for (let e1 in functions) {

        let name = "undefined";

        if (typeof functions[e1].common.name === 'string') {
            name = functions[e1].common.name;
        }
        else if (typeof functions[e1].common.name === 'object') {
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
    adapter.log.debug('all functions done ' + JSON.stringify(enumFunctions));

    adapter.sendTo(obj.from, obj.command, enumFunctions, obj.callback);
}



//#######################################
//
// used as interface to admin
async function ListDevices(obj) {

    if (adapter.config.devices === null || typeof adapter.config.devices === 'undefined' || adapter.config.devices.length === 0 || adapter.config.deleteall) {

        adapter.log.info('create new device list ' + JSON.stringify(adapter.config.devices));

        if (adapter.config.devices !== null && typeof adapter.config.devices !== 'undefined' ) {
            
            adapter.config.devices.length = 0;
        }

        
        //use for test but comment it out for real life
        //AddTestData();

        let rooms = {};
        //get room enums first; this includes members as well
        const AllRoomsEnum = await adapter.getEnumAsync('rooms');
        rooms = AllRoomsEnum.result;
        

        let functions = {};
        const AllFunctionsEnum = await adapter.getEnumAsync('functions');
        adapter.log.debug("function enums: " + JSON.stringify(AllFunctionsEnum));
        functions = AllFunctionsEnum.result;
        

        let HeatingMember = [];
        for (let e1 in functions) {

            if (functions[e1].common.name === adapter.config.Gewerk ) {
                var ids1 = functions[e1].common.members;
                for (var n1 in ids1) {
                    
                    HeatingMember.push({
                        id: ids1[n1]
                    });
                }
            }
        }
        adapter.log.debug("heating member: " + JSON.stringify(HeatingMember));

        let NextID = 1;
        for (let e in rooms) {

            let ids = rooms[e].common.members;
            for (let n in ids) {

                let adapterObj;

                adapterObj = await adapter.getForeignObjectAsync(ids[n]);

                if (adapterObj && adapterObj.native) {

                    //***********************************
                    var IsInHeatingList = findObjectIdByKey(HeatingMember, 'id', adapterObj._id);

                    if (IsInHeatingList > -1) {

                        var supportedRT = -1;
                        //adapter.log.debug("check thermostat for homematic");
                        var IsInDeviceList = false;
                        for (let x1 = 0; x1 <= MaxHomematicThermostatType; x1++) {
                            //adapter.log.debug("check " + adapterObj.native.PARENT_TYPE + " === " + ThermostatTypeTab[x1][0]);
                            if (adapterObj.native.PARENT_TYPE === ThermostatTypeTab[x1][0]) {
                                supportedRT = x1;

                                adapter.log.debug("Thermostat found " + JSON.stringify(adapterObj));

                                /*
                                 * heatingcontrol.0 Thermostat found {"_id":"hm-rpc.0.JEQ0080886.1","type":"channel","common":{"name":"RT_Gaeste:1"},"native":{"ADDRESS":"JEQ0080886:1","AES_ACTIVE":0,"DIRECTION":1,"FLAGS":1,"INDEX":1,"LINK_SOURCE_ROLES":"WEATHER_TH","LINK_TARGET_ROLES":"","PARAMSETS":["LINK","MASTER","VALUES"],"PARENT":"JEQ0080886","PARENT_TYPE":"HM-CC-TC","TYPE":"WEATHER","VERSION":15},"from":"system.adapter.hm-rega.0","user":"system.user.admin","ts":1565456984587,"acl":{"object":1636,"owner":"system.user.admin","ownerGroup":"system.group.administrator"}}
                                 */

                                let sName = adapterObj.common.name.split(':')[0];

                                let oOID = adapterObj._id.split('.');
                                let sOID = oOID[0] + "." + oOID[1] + "." + oOID[2];

                                IsInDeviceList = findObjectIdByKey(adapter.config.devices, 'name', sName);
                                if (IsInDeviceList === -1) {

                                    adapter.config.devices.push({
                                        id: NextID++,
                                        name: sName,
                                        isActive: true,
                                        room: rooms[e].common.name,
                                        type: 1, //thermostats
                                        OID_Target: sOID + ThermostatTypeTab[supportedRT][2],
                                        OID_Current: sOID + ThermostatTypeTab[supportedRT][3]
                                    });
                                    

                                }
                            }
                        }

                        var supportedActor = -1;
                        //adapter.log.debug("check actor for homematic");
                        for (let x2 = MinHomematicActorType; x2 <= MaxHomematicActorType; x2++) {
                            //adapter.log.debug("check " + adapterObj.native.PARENT_TYPE + " === " + ActorTypeTab[x2][0]);
                            if (adapterObj.native.PARENT_TYPE === ActorTypeTab[x2][0]) {
                                supportedActor = x2;

                                adapter.log.debug("Actor found " + JSON.stringify(adapterObj));

                                /*
                                 * Actor found {"_id":"hm-rpc.0.LEQ0900578.3","type":"channel","common":{"name":"HK_Aktor_KG_Gast","role":"switch"},"native":{"ADDRESS":"LEQ0900578:3","AES_ACTIVE":0,"DIRECTION":2,"FLAGS":1,"INDEX":3,"LINK_SOURCE_ROLES":"","LINK_TARGET_ROLES":"SWITCH WCS_TIPTRONIC_SENSOR WEATHER_CS","PARAMSETS":["LINK","MASTER","VALUES"],"PARENT":"LEQ0900578","PARENT_TYPE":"HM-LC-Sw4-DR","TYPE":"SWITCH","VERSION":26},"from":"system.adapter.hm-rega.0","user":"system.user.admin","ts":1565456990633,"acl":{"object":1636,"owner":"system.user.admin","ownerGroup":"system.group.administrator"}}
                                 */
                                let sName = adapterObj.common.name;
                                //adapter.log.debug("#111");
                                IsInDeviceList = findObjectIdByKey(adapter.config.devices, 'name', sName);
                                //adapter.log.debug("#222");

                                if (IsInDeviceList === -1) {
                                    //adapter.log.debug("#333 " + NextID);
                                    adapter.config.devices.push({
                                        id: NextID++,
                                        name: sName,
                                        isActive: true,
                                        room: rooms[e].common.name,
                                        type: 2, //actors
                                        OID_Target: adapterObj._id + ActorTypeTab[supportedActor][2]
                                    });
                                    //adapter.log.debug("#444");
                                }
                            }
                        }

                        var supportedSensor = -1;
                        //adapter.log.debug("check sensor for homematic");
                        for (let x3 = MinHomematicSensorType; x3 <= MaxHomematicSensorType; x3++) {
                            //adapter.log.debug("check " + adapterObj.native.PARENT_TYPE + " === " + SensorTypeTab[x3][0]);
                            if (adapterObj.native.PARENT_TYPE === SensorTypeTab[x3][0]) {
                                supportedSensor = x3;

                                adapter.log.debug("Sensor found " + JSON.stringify(adapterObj));
                                let sName = adapterObj.common.name;
                                IsInDeviceList = findObjectIdByKey(adapter.config.devices, 'name', sName);
                                if (IsInDeviceList === -1) {
                                    adapter.config.devices.push({
                                        id: NextID++,
                                        name: adapterObj.common.name,
                                        isActive: true,
                                        room: rooms[e].common.name,
                                        type: 3, //sensors
                                        OID_Current: adapterObj._id + SensorTypeTab[supportedSensor][2]
                                    });
                                }


                            }
                        }

                        if (supportedSensor === -1 && supportedActor === -1 && supportedRT === -1) {
                            adapter.log.warn("device not found " + JSON.stringify(adapterObj));

                        }
                    }
                }
            }
        }
    }

    

    if (adapter.config.devices === null || typeof adapter.config.devices === 'undefined' || adapter.config.devices.length === 0) {

        let room = "Office";

        if (adapter.config.rooms !== null && typeof adapter.config.rooms !== 'undefined' && adapter.config.rooms.length > 0) {
            room = adapter.config.rooms[0].name;
        }

        adapter.config.devices.push({
            id: 0,
            name: "TestThermostat",
            isActive: false,
            room: room,
            type: 1, 
            OID_Current: "Test_OID"
        });


        adapter.log.warn(' device list is empty, add dummy device ' + JSON.stringify(adapter.config.devices));

    }
    else {
        adapter.log.debug('all rooms done ' + JSON.stringify(adapter.config.devices));

    }

    adapter.sendTo(obj.from, obj.command, adapter.config.devices, obj.callback);
}


//#######################################
//
// just for testing without real data
function AddTestData() {
    //test data
    adapter.config.devices.push({
        id: 1,
        name: "RT_WoZi",
        isActive: true,
        room: "Wohnzimmer",
        type: 1, //thermostats
        OID_Target: "hm-rpc.0.IEQ0067957.2.SETPOINT",
        OID_Current: "hm-rpc.0.IEQ0067957.1.TEMPERATURE"
    });

    adapter.config.devices.push({
        id: 2,
        name: "RT_WoZi2",
        isActive: true,
        room: "Wohnzimmer",
        type: 1, //thermostats
        OID_Target: "hm-rpc.0.IEQ0067958.2.SETPOINT",
        OID_Current: "hm-rpc.0.IEQ0067958.1.TEMPERATURE"
    });

    adapter.config.devices.push({
        id: 3,
        name: "HK_Aktor_EG_WoZi",
        isActive: true,
        room: "Wohnzimmer",
        type: 2, //heating actor
        OID_Target: "hm-rpc.0.IEQ0383091.3.STATE"
    });

    adapter.config.devices.push({
        id: 4,
        name: "Tuer1_WoZi",
        isActive: true,
        room: "Wohnzimmer",
        type: 3, //window sensor
        OID_Current: "hm-rpc.0.LEQ1509665.1.STATE"
    });

    adapter.config.devices.push({
        id: 5,
        name: "Tuer2_WoZi",
        isActive: true,
        room: "Wohnzimmer",
        type: 3, //window sensor
        OID_Current: "hm-rpc.0.LEQ1509666.1.STATE"
    });

    adapter.config.devices.push({
        id: 6,
        name: "Tuer3_WoZi",
        isActive: true,
        room: "Wohnzimmer",
        type: 3, //window sensor
        OID_Current: "hm-rpc.0.LEQ1509667.1.STATE"
    });

    adapter.config.devices.push({
        id: 7,
        name: "Fenster_WoZi",
        isActive: true,
        room: "Wohnzimmer",
        type: 3, //window sensor
        OID_Current: "hm-rpc.0.LEQ1509668.1.STATE"
    });
}





async function CreateStates4Period(id, period) {

    //adapter.log.debug('add state ' + id + '.time');
    await adapter.setObjectNotExistsAsync(id + '.time', {
        type: 'state',
        common: {
            name: 'period from',
            type: 'date',
            role: 'profile',
            unit: '',
            read: true,
            write: true
        },
        native: { id: id + '.time' }
    });

    const nextTime = await adapter.getStateAsync(id + '.time');
    //set default only if nothing was set before
    if (nextTime === null && period < DefaultTargets.length) {
        //adapter.log.debug('set default for ' +id + '.time');
        //we set a default value
        await adapter.setStateAsync(id + '.time', { ack: true, val: DefaultTargets[period][0] });
    }
    //we want to be informed when this is changed by vis or others
    adapter.subscribeStates(id + '.time');


    //adapter.log.debug('add state ' + id + '.Temperature');
    await adapter.setObjectNotExistsAsync(id + '.Temperature', {
        type: 'state',
        common: {
            name: 'target temperature',
            type: 'number',
            role: 'profile',
            unit: '°C',
            read: true,
            write: true
        },
        native: { id: id + '.Temperature' }
    });

    const nextTemp = await adapter.getStateAsync(id + '.Temperature');
    //set default only if nothing was set before
    if (nextTemp === null && period < DefaultTargets.length) {
        //adapter.log.debug('set default for ' + id + '.Temperature');
        await adapter.setStateAsync(id + '.Temperature', { ack: true, val: DefaultTargets[period][1] });
    }
    //we want to be informed when this is changed by vis or others
    adapter.subscribeStates(id + '.Temperature');
}


//#######################################
//
// create all necessary datapaoints
// will be called at ecery start of adapter
async function CreateDatepoints() {

    adapter.log.debug('start CreateDatepoints');

    try {
        await adapter.setObjectNotExistsAsync('LastProgramRun', {
            type: 'state',
            common: {
                name: 'LastProgramRun',
                type: 'date',
                role: 'history',
                unit: '',
                read: true,
                write: false
            },
            native: { id: 'LastProgramRun' }
        });

        await adapter.setObjectNotExistsAsync('CurrentProfile', {
            type: 'state',
            common: {
                name: 'CurrentProfile',
                type: 'number',
                role: 'history',
                unit: '',
                read: true,
                write: true
            },
            native: { id: 'CurrentProfile' }
        });

        const currentprofile = await adapter.getStateAsync('CurrentProfile');
        //set default only if nothing was set before
        if (currentprofile === null) {
            await adapter.setStateAsync('CurrentProfile', { ack: true, val: 1 });
        }
        

        let mode = "";
        await adapter.setObjectNotExistsAsync('TemperatureDecreaseMode', {
            type: 'state',
            common: {
                name: 'TemperatureDecreaseMode',
                type: 'string',
                role: 'history',
                unit: '',
                read: true,
                write: false
            },
            native: { id: 'TemperatureDecreaseMode' }
        });


        switch (parseInt(adapter.config.TemperatureDecrease)) {
            case 1:
                mode = "relative";
                break;
            case 2:
                mode = "absolute";
                break;
            case 3:
                mode = "none";
                break;
            default:
                mode = "unknown";
                break;
        }

        await adapter.setStateAsync('TemperatureDecreaseMode', { ack: true, val: mode});



        await adapter.setObjectNotExistsAsync('HeatingPeriodActive', {
            type: 'state',
            common: {
                name: 'HeatingPeriodActive',
                type: 'boolean',
                role: 'history',
                unit: '',
                read: true,
                write: true
            },
            native: { id: 'HeatingPeriodActive' }
        });
        const heatingperidactive = await adapter.getStateAsync('HeatingPeriodActive');
        //set default only if nothing was set before
        if (heatingperidactive === null) {
            await adapter.setStateAsync('HeatingPeriodActive', { ack: true, val: true });
        }

        await adapter.setObjectNotExistsAsync('PublicHolidyToday', {
            type: 'state',
            common: {
                name: 'PublicHolidyToday',
                type: 'boolean',
                role: 'history',
                unit: '',
                read: true,
                write: true
            },
            native: { id: 'PublicHolidyToday' }
        });


        await adapter.setObjectNotExistsAsync('Present', {
            type: 'state',
            common: {
                name: 'Present',
                type: 'boolean',
                role: 'history',
                unit: '',
                read: true,
                write: true
            },
            native: { id: 'Present' }
        });
        

        await adapter.setObjectNotExistsAsync('PartyNow', {
            type: 'state',
            common: {
                name: 'PartyNow',
                type: 'boolean',
                role: 'history',
                unit: '',
                read: true,
                write: true
            },
            native: { id: 'PartyNow' }
        });
        

        await adapter.setObjectNotExistsAsync('GuestsPresent', {
            type: 'state',
            common: {
                name: 'GuestsPresent',
                type: 'boolean',
                role: 'history',
                unit: '',
                read: true,
                write: true
            },
            native: { id: 'GuestsPresent' }
        });
        

        await adapter.setObjectNotExistsAsync('HolidayPresent', {
            type: 'state',
            common: {
                name: 'HolidayPresent',
                type: 'boolean',
                role: 'history',
                unit: '',
                read: true,
                write: true
            },
            native: { id: 'HolidayPresent' }
        });
        

        await adapter.setObjectNotExistsAsync('VacationAbsent', {
            type: 'state',
            common: {
                name: 'VacationAbsent',
                type: 'boolean',
                role: 'history',
                unit: '',
                read: true,
                write: true
            },
            native: { id: 'VacationAbsent' }
        });
        

        if (adapter.config.UseActors) {
            await adapter.setObjectNotExistsAsync('ActorsOn', {
                type: 'state',
                common: {
                    name: 'HowManyActorsOn',
                    type: 'number',
                    role: 'history',
                    unit: '',
                    read: true,
                    write: false
                },
                native: { id: 'ActorsOn' }
            });

        }


        //all room related
        for (let room = 0; room < adapter.config.rooms.length; room++) {

            if (adapter.config.rooms[room].isActive) {

                let id1 = "Rooms." + adapter.config.rooms[room].name;

                adapter.log.debug("create data points for " + adapter.config.rooms[room].name);


                 
                //===============================================================================
                //ab hier verschoben
                await adapter.setObjectNotExistsAsync(id1 + '.CurrentTimePeriodFull', {
                    type: 'state',
                    common: {
                        name: 'CurrentTimePeriodFull',
                        type: 'string',
                        role: 'history',
                        unit: '',
                        read: true,
                        write: false
                    },
                    native: { id: 'CurrentTimePeriod' }
                });

                await adapter.setObjectNotExistsAsync(id1 + '.CurrentTimePeriod', {
                    type: 'state',
                    common: {
                        name: 'CurrentTimePeriod',
                        type: 'number',
                        role: 'history',
                        unit: '',
                        read: true,
                        write: false
                    },
                    native: { id: 'CurrentTimePeriod' }
                });

                await adapter.setObjectNotExistsAsync(id1 + '.CurrentTimePeriodTime', {
                    type: 'state',
                    common: {
                        name: 'CurrentTimePeriodTime',
                        type: 'string',
                        role: 'history',
                        unit: '',
                        read: true,
                        write: false
                    },
                    native: { id: 'CurrentTimePeriodTime' }
                });


                await adapter.setObjectNotExistsAsync(id1 + '.WindowIsOpen', {
                    type: 'state',
                    common: {
                        name: 'WindowIsOpen',
                        type: 'boolean',
                        role: 'history',
                        unit: '',
                        read: true,
                        write: false
                    },
                    native: { id: 'WindowIsOpen' }
                });

                await adapter.setObjectNotExistsAsync(id1 + '.State', {
                    type: 'state',
                    common: {
                        name: 'State',
                        type: 'string',
                        role: 'history',
                        unit: '',
                        read: true,
                        write: false
                    },
                    native: { id: 'State' }
                });

                //manuell temperature setting

                await adapter.setObjectNotExistsAsync(id1 + '.TemperaturOverride', {
                    type: 'state',
                    common: {
                        name: 'TemperaturOverride',
                        type: 'float',
                        role: 'history',
                        unit: '°C',
                        read: true,
                        write: true
                    },
                    native: { id: 'TemperaturOverride' }
                });
                //const temperaturoverride = await adapter.getStateAsync(id1 + '.TemperaturOverride');
                //set default only if nothing was set before
                //if (temperaturoverride === null) {

                //set always to 0
                await adapter.setStateAsync(id1 + '.TemperaturOverride', { ack: true, val: 0 });
                //}
                adapter.subscribeStates(id1 + '.TemperaturOverride');


                await adapter.setObjectNotExistsAsync(id1 + '.TemperaturOverrideTime', {
                    type: 'state',
                    common: {
                        name: 'TemperaturOverrideTime',
                        type: 'string',
                        role: 'history',
                        unit: 'hh:mm',
                        read: true,
                        write: true
                    },
                    native: { id: 'TemperaturOverrideTime' }
                });
                const temperaturoverridetime = await adapter.getStateAsync(id1 + '.TemperaturOverrideTime');
                //set default only if nothing was set before
                if (temperaturoverridetime === null) {
                    await adapter.setStateAsync(id1 + '.TemperaturOverrideTime', { ack: true, val: "00:00" });
                }
                adapter.subscribeStates(id1 + '.TemperaturOverrideTime');

            }
        }
        //bis hierhin verschoben
        //===============================================================================


        // all profile related 
        for (let profile = 0; profile < parseInt(adapter.config.NumberOfProfiles, 10); profile++) {
            adapter.log.debug('rooms ' + adapter.config.rooms.length);

            for (let room = 0; room < adapter.config.rooms.length; room++) {

                if (adapter.config.rooms[room].isActive) {

                    let id1 = "Profiles." + profile + "." + adapter.config.rooms[room].name;

                    if (parseInt(adapter.config.TemperatureDecrease) === 1) {// relative

                        adapter.log.debug("create data profile points for " + adapter.config.rooms[room].name);

                        await adapter.setObjectNotExistsAsync(id1 + '.relative.GuestIncrease', {
                            type: 'state',
                            common: {
                                name: 'GuestIncrease',
                                type: 'float',
                                role: 'history',
                                unit: '°C',
                                read: true,
                                write: true
                            },
                            native: { id: 'GuestIncrease' }
                        });

                        const guestincrease = await adapter.getStateAsync(id1 + '.relative.GuestIncrease');
                        //set default only if nothing was set before
                        if (guestincrease === null) {
                            await adapter.setStateAsync(id1 + '.relative.GuestIncrease', { ack: true, val: 0 });
                        }
                        adapter.subscribeStates(id1 + '.relative.GuestIncrease');


                        await adapter.setObjectNotExistsAsync(id1 + '.relative.PartyDecrease', {
                            type: 'state',
                            common: {
                                name: 'PartyDecrease',
                                type: 'float',
                                role: 'history',
                                unit: '°C',
                                read: true,
                                write: true
                            },
                            native: { id: 'PartyDecrease' }
                        });
                        const partydecrease = await adapter.getStateAsync(id1 + '.relative.PartyDecrease');
                        //set default only if nothing was set before
                        if (partydecrease === null) {
                            await adapter.setStateAsync(id1 + '.relative.PartyDecrease', { ack: true, val: 0 });
                        }
                        adapter.subscribeStates(id1 + '.relative.PartyDecrease');

                        await adapter.setObjectNotExistsAsync(id1 + '.relative.WindowOpenDecrease', {
                            type: 'state',
                            common: {
                                name: 'WindowOpenDecrease',
                                type: 'float',
                                role: 'history',
                                unit: '°C',
                                read: true,
                                write: true
                            },
                            native: { id: 'WindowOpenDecrease' }
                        });
                        const windowopendecrease = await adapter.getStateAsync(id1 + '.relative.WindowOpenDecrease');
                        //set default only if nothing was set before
                        if (windowopendecrease === null) {
                            await adapter.setStateAsync(id1 + '.relative.WindowOpenDecrease', { ack: true, val: 0 });
                        }
                        adapter.subscribeStates(id1 + '.relative.WindowOpenDecrease');


                        await adapter.setObjectNotExistsAsync(id1 + '.relative.AbsentDecrease', {
                            type: 'state',
                            common: {
                                name: 'AbsentDecrease',
                                type: 'float',
                                role: 'history',
                                unit: '°C',
                                read: true,
                                write: true
                            },
                            native: { id: 'AbsentDecrease' }
                        });
                        const absentdecrease = await adapter.getStateAsync(id1 + '.relative.AbsentDecrease');
                        //set default only if nothing was set before
                        if (absentdecrease === null) {
                            await adapter.setStateAsync(id1 + '.relative.AbsentDecrease', { ack: true, val: 0 });
                        }
                        adapter.subscribeStates(id1 + '.relative.AbsentDecrease');

                        await adapter.setObjectNotExistsAsync(id1 + '.relative.VacationAbsentDecrease', {
                            type: 'state',
                            common: {
                                name: 'VacationAbsentDecrease',
                                type: 'float',
                                role: 'history',
                                unit: '°C',
                                read: true,
                                write: true
                            },
                            native: { id: 'VacationAbsentDecrease' }
                        });

                        const vacationabsentdecrease = await adapter.getStateAsync(id1 + '.relative.VacationAbsentDecrease');
                        //set default only if nothing was set before
                        if (vacationabsentdecrease === null) {
                            await adapter.setStateAsync(id1 + '.relative.VacationAbsentDecrease', { ack: true, val: 0 });
                        }
                        adapter.subscribeStates(id1 + '.relative.VacationAbsentDecrease');
                        

                    }
                    else if (parseInt(adapter.config.TemperatureDecrease) === 2) {// absolutue

                        adapter.log.debug("create data profile points (absolute) for " + adapter.config.rooms[room].name);

                        await adapter.setObjectNotExistsAsync(id1 + '.absolute.GuestIncrease', {
                            type: 'state',
                            common: {
                                name: 'GuestIncrease',
                                type: 'float',
                                role: 'history',
                                unit: '°C',
                                read: true,
                                write: true
                            },
                            native: { id: 'GuestIncrease' }
                        });

                        const reducedtemperature = await adapter.getStateAsync(id1 + '.absolute.GuestIncrease');
                        //set default only if nothing was set before
                        if (reducedtemperature === null) {
                            await adapter.setStateAsync(id1 + '.absolute.GuestIncrease', { ack: true, val: 0 });
                        }
                        adapter.subscribeStates(id1 + '.absolute.GuestIncrease');

                        await adapter.setObjectNotExistsAsync(id1 + '.absolute.PartyDecrease', {
                            type: 'state',
                            common: {
                                name: 'PartyDecrease',
                                type: 'float',
                                role: 'history',
                                unit: '°C',
                                read: true,
                                write: true
                            },
                            native: { id: 'PartyDecrease' }
                        });

                        const partydecrease = await adapter.getStateAsync(id1 + '.absolute.PartyDecrease');
                        //set default only if nothing was set before
                        if (partydecrease === null) {
                            await adapter.setStateAsync(id1 + '.absolute.PartyDecrease', { ack: true, val: 0 });
                        }
                        adapter.subscribeStates(id1 + '.absolute.PartyDecrease');

                        await adapter.setObjectNotExistsAsync(id1 + '.absolute.WindowOpenDecrease', {
                            type: 'state',
                            common: {
                                name: 'WindowOpenDecrease',
                                type: 'float',
                                role: 'history',
                                unit: '°C',
                                read: true,
                                write: true
                            },
                            native: { id: 'WindowOpenDecrease' }
                        });

                        const windowopendecrease = await adapter.getStateAsync(id1 + '.absolute.WindowOpenDecrease');
                        //set default only if nothing was set before
                        if (windowopendecrease === null) {
                            await adapter.setStateAsync(id1 + '.absolute.WindowOpenDecrease', { ack: true, val: 0 });
                        }
                        adapter.subscribeStates(id1 + '.absolute.WindowOpenDecrease');

                        await adapter.setObjectNotExistsAsync(id1 + '.absolute.AbsentDecrease', {
                            type: 'state',
                            common: {
                                name: 'AbsentDecrease',
                                type: 'float',
                                role: 'history',
                                unit: '°C',
                                read: true,
                                write: true
                            },
                            native: { id: 'AbsentDecrease' }
                        });

                        const absentdecrease = await adapter.getStateAsync(id1 + '.absolute.AbsentDecrease');
                        //set default only if nothing was set before
                        if (absentdecrease === null) {
                            await adapter.setStateAsync(id1 + '.absolute.AbsentDecrease', { ack: true, val: 0 });
                        }
                        adapter.subscribeStates(id1 + '.absolute.AbsentDecrease');

                        await adapter.setObjectNotExistsAsync(id1 + '.absolute.VacationAbsentDecrease', {
                            type: 'state',
                            common: {
                                name: 'VacationAbsentDecrease',
                                type: 'float',
                                role: 'history',
                                unit: '°C',
                                read: true,
                                write: true
                            },
                            native: { id: 'VacationAbsentDecrease' }
                        });

                        const vacationabsentdecrease = await adapter.getStateAsync(id1 + '.absolute.VacationAbsentDecrease');
                        //set default only if nothing was set before
                        if (vacationabsentdecrease === null) {
                            await adapter.setStateAsync(id1 + '.absolute.VacationAbsentDecrease', { ack: true, val: 0 });
                        }
                        adapter.subscribeStates(id1 + '.absolute.VacationAbsentDecrease');

                    }
                    else {
                        adapter.log.info("no temperature degrease configured " + adapter.config.TemperatureDecrease);
                    }
                    

                    adapter.log.debug('room ' + adapter.config.rooms[room].name + ' with ' + parseInt(adapter.config.NumberOfPeriods, 10) + " periods");


                    //Profile for Monday - Sunday
                    if (parseInt(adapter.config.ProfileType, 10) === 1) {
                        adapter.log.debug('Profile Type  Mo-So, profiles ' + parseInt(adapter.config.NumberOfProfiles, 10));

                        for (let period = 0; period < parseInt(adapter.config.NumberOfPeriods, 10); period++) {

                            let id = id1 + ".Mo-Su.Periods." + period;

                            adapter.log.debug('add state ' + id + " max " + DefaultTargets.length);

                            CreateStates4Period(id, period);


                        }
                    }

                    //Profile for Monday - Friday + Sa/Su
                    else if (parseInt(adapter.config.ProfileType, 10) === 2) {
                        adapter.log.debug('Profile Type  Mo-FR + Sa-So, profiles ' + parseInt(adapter.config.NumberOfProfiles, 10));

                        for (let period = 0; period < parseInt(adapter.config.NumberOfPeriods, 10); period++) {

                            let id = id1 + ".Mo-Fr.Periods." + period;

                            adapter.log.debug('add state ' + id + " max " + DefaultTargets.length);
                            CreateStates4Period(id, period);

                        }
                        for (let period = 0; period < parseInt(adapter.config.NumberOfPeriods, 10); period++) {

                            let id = id1 + ".Sa-So.Periods." + period;

                            adapter.log.debug('add state ' + id + " max " + DefaultTargets.length);
                            CreateStates4Period(id, period);

                        }
                    }

                    //Profile for every day separately
                    else if (parseInt(adapter.config.ProfileType, 10) === 3) {
                        adapter.log.debug('Profile Type  every day, profiles ' + parseInt(adapter.config.NumberOfProfiles, 10));

                        for (let period = 0; period < parseInt(adapter.config.NumberOfPeriods, 10); period++) {

                            let id = id1 + ".Mon.Periods." + period;
                            adapter.log.debug('add state ' + id + " max " + DefaultTargets.length);
                            CreateStates4Period(id, period);

                            id = id1 + ".Tue.Periods." + period;
                            adapter.log.debug('add state ' + id + " max " + DefaultTargets.length);
                            CreateStates4Period(id, period);

                            id = id1 + ".Wed.Periods." + period;
                            adapter.log.debug('add state ' + id + " max " + DefaultTargets.length);
                            CreateStates4Period(id, period);

                            id = id1 + ".Thu.Periods." + period;
                            adapter.log.debug('add state ' + id + " max " + DefaultTargets.length);
                            CreateStates4Period(id, period);

                            id = id1 + ".Fri.Periods." + period;
                            adapter.log.debug('add state ' + id + " max " + DefaultTargets.length);
                            CreateStates4Period(id, period);

                            id = id1 + ".Sat.Periods." + period;
                            adapter.log.debug('add state ' + id + " max " + DefaultTargets.length);
                            CreateStates4Period(id, period);

                            id = id1 + ".Sun.Periods." + period;
                            adapter.log.debug('add state ' + id + " max " + DefaultTargets.length);
                            CreateStates4Period(id, period);

                        }

                    }
                    else {
                        adapter.log.warn('not implemented yet, profile type is ' + parseInt(adapter.config.ProfileType, 10));
                    }
                }
                else {
                    adapter.log.debug("not active.... " + adapter.config.rooms[room].name);
                }
            }
        }
    }
    catch (e) {
        adapter.log.error('exception in CreateDatapoints [' + e + ']');
    }

    adapter.log.debug('CreateDatepoints done');
}

//#######################################
//
// subscribe thermostate states to be informed when target or current is changed
function SubscribeStates(callback) {

    //if we need to handle actors, then subscribe on current and target temperature
    adapter.log.debug('#start subscribtion ');

    try {

        adapter.subscribeStates('CurrentProfile');
        adapter.subscribeStates('HeatingPeriodActive');
        adapter.subscribeStates('PublicHolidyToday');
        adapter.subscribeStates('Present');
        adapter.subscribeStates('PartyNow');
        adapter.subscribeStates('GuestsPresent');
        adapter.subscribeStates('HolidayPresent');
        adapter.subscribeStates('VacationAbsent');



        if (adapter.config.Path2FeiertagAdapter !== null && typeof adapter.config.Path2FeiertagAdapter !== 'undefined' && adapter.config.Path2FeiertagAdapter.length > 0) {
            var names = adapter.config.Path2FeiertagAdapter.split('.');

            if (names.length === 2) {
                //feiertage.0.heute.boolean
                adapter.subscribeForeignStates(adapter.config.Path2FeiertagAdapter + ".heute.boolean");

                adapter.log.info('subscribe ' + adapter.config.Path2FeiertagAdapter + '.heute.boolean');
            }
            else {
                adapter.subscribeForeignStates(adapter.config.Path2FeiertagAdapter);

                adapter.log.info('subscribe ' + adapter.config.Path2FeiertagAdapter);
            }
        }
        else {
            adapter.log.debug('no subscribe Path2FeiertagAdapter ');
        }
        if (adapter.config.Path2PresentDP !== null && typeof adapter.config.Path2PresentDP !== 'undefined' && adapter.config.Path2PresentDP.length > 0) {
            adapter.subscribeForeignStates(adapter.config.Path2PresentDP);
            adapter.log.info('subscribe ' + adapter.config.Path2PresentDP);
        }
        else {
            adapter.log.debug('no subscribe Path2PresentDP ');
        }

        if (adapter.config.Path2VacationDP !== null && typeof adapter.config.Path2VacationDP !== 'undefined' && adapter.config.Path2VacationDP.length > 0) {
            adapter.subscribeForeignStates(adapter.config.Path2VacationDP);
            adapter.log.info('subscribe ' + adapter.config.Path2VacationDP);
        }
        else {
            adapter.log.debug('no subscribe Path2VacationDP ');
        }

        if (adapter.config.Path2HolidayPresentDP !== null && typeof adapter.config.Path2HolidayPresentDP !== 'undefined' && adapter.config.Path2HolidayPresentDP.length > 0) {
            adapter.subscribeForeignStates(adapter.config.Path2HolidayPresentDP);
            adapter.log.info('subscribe ' + adapter.config.Path2HolidayPresentDP);
        }
        else {
            adapter.log.debug('no subscribe Path2HolidayPresentDP ');
        }

        if (adapter.config.Path2GuestsPresentDP !== null && typeof adapter.config.Path2GuestsPresentDP !== 'undefined' && adapter.config.Path2GuestsPresentDP.length > 0) {
            adapter.subscribeForeignStates(adapter.config.Path2GuestsPresentDP);
            adapter.log.info('subscribe ' + adapter.config.Path2GuestsPresentDP);
        }
        else {
            adapter.log.debug('no subscribe Path2GuestsPresentDP ');
        }

        if (adapter.config.Path2PartyNowDP !== null && typeof adapter.config.Path2PartyNowDP !== 'undefined' && adapter.config.Path2PartyNowDP.length > 0) {
            adapter.subscribeForeignStates(adapter.config.Path2PartyNowDP);
            adapter.log.info('subscribe ' + adapter.config.Path2PartyNowDP);
        }
        else {
            adapter.log.debug('no subscribe Path2PartyNowDP ');
        }

        if (adapter.config.devices === null || typeof adapter.config.devices === 'undefined') {
            adapter.log.warn("no devices available for subscription");
            return;
        }

        if (adapter.config.rooms === null || typeof adapter.config.rooms === 'undefined') {
            adapter.log.warn("no rooms available for subscription");
            return;
        }

        for (let i = 0; i < adapter.config.devices.length; i++) {
            //here we need to check whether room ist really active; we subscribe only for active rooms
            let room = adapter.config.devices[i].room;
           
            if (adapter.config.devices[i].isActive) { //check only active devices

                let roomdata = findObjectByKey(adapter.config.rooms, "name", room);
                //adapter.log.debug('room ' + JSON.stringify(roomdata));

                if (roomdata !== null && roomdata.isActive) {
                    if (adapter.config.UseActors) {
                        if (adapter.config.devices[i].type === 1) { //thermostat
                            adapter.log.info('subscribe ' + adapter.config.devices[i].room + ' ' + adapter.config.devices[i].OID_Target + ' / ' + adapter.config.devices[i].OID_Current);

                            adapter.subscribeForeignStates(adapter.config.devices[i].OID_Target);
                            adapter.subscribeForeignStates(adapter.config.devices[i].OID_Current);

                            if (adapter.config.devices[i].OID_Target === adapter.config.devices[i].OID_Current) {
                                adapter.log.warn('configuration error thermostat for ' + adapter.config.devices[i].room + ': OID target should be different to OID current!');
                            }
                        }
                    }

                    if (adapter.config.UseSensors) {
                        if (adapter.config.devices[i].type === 3) { //sensor
                            adapter.log.info('subscribe ' + adapter.config.devices[i].room + ' ' + adapter.config.devices[i].OID_Current);
                            adapter.subscribeForeignStates(adapter.config.devices[i].OID_Current);
                        }
                    }
                }
                else {
                    adapter.log.debug('room not active or not available ' + JSON.stringify(roomdata));
                }
            }
            else {
                adapter.log.debug('device not active ');
            }
        }

        adapter.log.debug('#subscribtion finished');
    }
    catch (e) {
        adapter.log.error('exception in SubscribeStates [' + e + ']');
    }
    if (callback) callback();
}

//*******************************************************************
//
// handles state changes of subscribed states

let LastStateChangeID = "";
let LastStateVal = 1;

async function HandleStateChange(id, state) {

    adapter.log.debug("### handle state change " + id + " " + JSON.stringify(state));

    try {

        if (state && state.ack !== true) {
            //first set ack flag
            await adapter.setStateAsync(id, { ack: true });
        }

        if (id !== LastStateChangeID || state.val !== LastStateVal) {

            adapter.log.debug("### " + id + " " + LastStateChangeID + " " + state.val + " " + LastStateVal);


            let bHandled = false;
            LastStateChangeID = id;
            LastStateVal = state.val;

            if (adapter.config.Path2PresentDP.length > 0) {

                if (id.includes(adapter.config.Path2PresentDP)) {

                    let present = false;
                    if (parseInt(adapter.config.Path2PresentDPType) === 1) {
                        
                        const nTemp = await adapter.getForeignStateAsync(id);

                        //adapter.log.debug("ZZZ check bool " + JSON.stringify(nTemp));

                        present = nTemp.val;
                    }
                    else {
                        
                        const nTemp = await adapter.getForeignStateAsync(id);

                        //adapter.log.debug("ZZZ check number " + JSON.stringify(nTemp));

                        if (nTemp.val > 0) {
                            present = true;
                        }
                        
                    }
                    //heatingcontrol.0.Present
                    await adapter.setStateAsync("Present", { val: present, ack: true });
                    bHandled = true;
                }
            }

            if (adapter.config.Path2VacationDP.length > 0) {

                if (id.includes(adapter.config.Path2VacationDP)) {
                    const present = await adapter.getForeignStateAsync(id);

                    //heatingcontrol.0.VacationAbsent
                    await adapter.setStateAsync("VacationAbsent", { val: present.val, ack: true });
                    bHandled = true;
                }
            }

            if (adapter.config.Path2HolidayPresentDP.length > 0) {

                if (id.includes(adapter.config.Path2HolidayPresentDP)) {
                    const present = await adapter.getForeignStateAsync(id);

                    //heatingcontrol.0.HolidayPresent
                    await adapter.setStateAsync("HolidayPresent", { val: present.val, ack: true });
                    bHandled = true;
                }
            }

            if (adapter.config.Path2GuestsPresentDP.length > 0) {

                if (id.includes(adapter.config.Path2GuestsPresentDP)) {
                    const guestpresent = await adapter.getForeignStateAsync(id);

                    //heatingcontrol.0.GuestsPresent
                    await adapter.setStateAsync("GuestsPresent", { val: guestpresent.val, ack: true });
                    bHandled = true;
                }
            }

            if (adapter.config.Path2PartyNowDP.length > 0) {

                if (id.includes(adapter.config.Path2PartyNowDP)) {
                    const partynow = await adapter.getForeignStateAsync(id);

                    //heatingcontrol.0.PartyNow
                    await adapter.setStateAsync("PartyNow", { val: partynow.val, ack: true });
                    bHandled = true;
                }
            }

            if (adapter.config.Path2FeiertagAdapter.length > 0) {

                if (id.includes(adapter.config.Path2FeiertagAdapter)) {

                    const PublicHoliday = await adapter.getForeignStateAsync(id);

                    //heatingcontrol.0.PublicHolidyToday
                    adapter.log.info("public holiday today is " + PublicHoliday.val);

                    await adapter.setStateAsync("PublicHolidyToday", { val: PublicHoliday.val, ack: true });
                    bHandled = true;
                }
            }
            let ret = false;

            //## handle state change heatingcontrol.0.GuestsPresent {"val":false,"ack":false,"ts":1568137512204,"q":0,"from":"system.adapter.admin.0","user":"system.user.admin","lc":1568137512204}
            if (!bHandled) {
                ret = await HandleStateChangeGeneral(id, state);
                if (ret) {
                    bHandled = true;
                    adapter.log.debug("### 111 handled");
                }
                else {
                    adapter.log.debug("### 111 not handled yet");
                }
            }
            if (!bHandled) {
                //## handle state change hm - rpc.0.IEQ0067581.1.TEMPERATURE { "val": 23.4, "ack": true, "ts": 1568137725283, "q": 0, "from": "system.adapter.hm-rpc.0", "user": "system.user.admin", "lc": 1568137443749 }
                ret = await HandleStateChangeDevices(id, state);
                if (ret) {
                    bHandled = true;
                    adapter.log.debug("### 222 handled");
                }
                else {
                    adapter.log.debug("### 222 not handled yet");
                }
            }



            if (!bHandled) {
                adapter.log.debug("### not handled " + id + " " + JSON.stringify(state));
            }
            else {
                adapter.log.debug("### all StateChange handled ");
            }

        }
        else {
            adapter.log.debug("### state change already handled: " + LastStateVal + " / " + state.val + " /// " + id + " / " + LastStateChangeID);
        }
    }
    catch (e) {
        adapter.log.error('exception in HandleStateChange [' + e + ']');
    }
}

//*******************************************************************
//
// handles state changes of subscribed states
async function HandleStateChangeGeneral(id, state) {
    let bRet = false;

    var ids = id.split('.'); //

    if (ids[2] === "CurrentProfile") {

        if (state.val > parseInt(adapter.config.NumberOfProfiles,10)) {
            await adapter.setStateAsync(id, { ack: true, val: parseInt(adapter.config.NumberOfProfiles,10)  });
        }
        if (state.val < 1 ) {
            await adapter.setStateAsync(id, { ack: true, val: 1 });
        }
        bRet = true;
    }


    //heatingcontrol.0.Profiles.0.Arbeitszimmer.Mo-Su.Periods.0.Temperature
    if (ids[8] === "Temperature") {
        await CheckTemperatureChange(ids[4]);
        bRet = true;
    }

    //not handled heatingcontrol.0.Profiles.0.Arbeitszimmer.Mo-Fr.Periods.0.time 
    if (ids[8] === "time") { 

        if (CheckValidTime(id, state)) {

            let values = state.val.split(':');

            let hour = 0;
            let minute = 0;
            //let second = 0;

            if (values[0] && values[0] >= 0 && values[0] < 24) {
                hour = parseInt(values[0]);

            }
            if (values[1] && values[1] >= 0 && values[1] < 60) {
                minute = parseInt(values[1]);

            }
            //if (values[2] && values[2] >= 0 && values[2] < 60) {
            //    second = parseInt(values[2]);

            //}
            if (hour < 10) {
                hour = "0" + hour;
            }
            if (minute < 10) {
                minute = "0" + minute;
            }
            //if (second < 10) {
            //    second = "0" + second;
            //}
            //let sTime = hour + ":" + minute + ":" + second;
            let sTime = hour + ":" + minute;

            await adapter.setStateAsync(id, { ack: true, val: sTime });
            bRet = true;

            await CalculateNextTime();

            //see issue 21: need to check temperature aswell
            await CheckTemperatureChange(ids[4]);
        }
        
    }
    if (ids[2] === "GuestsPresent") {
         await CheckTemperatureChange();
        bRet = true;
    }
    if (ids[2] === "HeatingPeriodActive") {
        await CheckTemperatureChange();
        bRet = true;
    }
    if (ids[2] === "HolidayPresent") {
        await CheckTemperatureChange();
        bRet = true;
    }
    if (ids[2] === "PartyNow") {
        await CheckTemperatureChange();
        bRet = true;
    }
    if (ids[2] === "Present") {
        await CheckTemperatureChange();
        bRet = true;
    }
    if (ids[2] === "PublicHolidyToday") {
        await CheckTemperatureChange();
        bRet = true;
    }
    if (ids[2] === "VacationAbsent") {
        await CheckTemperatureChange();
        bRet = true;
    }

    if (ids[5] === "AbsentDecrease" || ids[6] === "AbsentDecrease") {
        await CheckTemperatureChange();
        bRet = true;
    }

    //heatingcontrol.0.Profiles.0.Arbeitszimmer.relative.GuestIncrease
    if (ids[5] === "GuestIncrease" || ids[6] === "GuestIncrease") {
        await CheckTemperatureChange();
        bRet = true;
    }
    if (ids[5] === "PartyDecrease" || ids[6] === "PartyDecrease") {
        await CheckTemperatureChange();
        bRet = true;
    }
    if (ids[5] === "WindowOpenDecrease" || ids[6] === "WindowOpenDecrease") {
        await CheckTemperatureChange();
        bRet = true;
    }
    if (ids[5] === "VacationAbsentDecrease" || ids[6] === "VacationAbsentDecrease") {
        await CheckTemperatureChange();
        bRet = true;
    }

    //heatingcontrol.0.Rooms.Arbeitszimmer.TemperaturOverride
    if (ids[4] === "TemperaturOverride") {
        await StartTemperaturOverride(ids[3] );
        bRet = true;
    }
    if (ids[4] === "TemperaturOverrideTime") {

        if (CheckValidTime(id, state)) {

            let values = state.val.split(':');

            let hour = 0;
            let minute = 0;
            //let second = 0;

            if (values[0] && values[0] >= 0 && values[0] < 24) {
                hour = parseInt(values[0]);

            }
            if (values[1] && values[1] >= 0 && values[1] < 60) {
                minute = parseInt(values[1]);

            }
            //if (values[2] && values[2] >= 0 && values[2] < 60) {
            //    second = parseInt(values[2]);

            //}
            if (hour < 10) {
                hour = "0" + hour;
            }
            if (minute < 10) {
                minute = "0" + minute;
            }
            //if (second < 10) {
            //    second = "0" + second;
            //}
            //let sTime = hour + ":" + minute + ":" + second;
            let sTime = hour + ":" + minute;

            await adapter.setStateAsync(id, { ack: true, val: sTime });



            await StartTemperaturOverride(ids[3]);
            bRet = true;
        }
    }

    if (ids[7] === "time" || ids[2] ==="CurrentProfile") {
        await CalculateNextTime();
        bRet = true;
    }

    

    return bRet;
}

//*******************************************************************
//
// handles state changes of subscribed states
// * find the room
// * check if with actor handling; if so then check if target is different to current
async function HandleStateChangeDevices(id, state) {

    let bRet = false;

    adapter.log.debug('handle id ' + id + " state " + JSON.stringify(state));

    let devicetype = - 1;

     //hier könnten mehrere devices kommen
    let devices = findObjectsByKey(adapter.config.devices, 'OID_Target', id);
    if (devices.length > 0) {
        devicetype = 1; //it was OID_Target
    }
    else {
        devices = findObjectsByKey(adapter.config.devices, 'OID_Current', id);
        if (devices.length > 0) {
            devicetype = 2; //it was OID_Current
        }
    }

    if (devices.length > 0) {

        adapter.log.debug("### handle devices  " + JSON.stringify(devices));

        for (var d = 0; d < devices.length; d++) {

            //adapter.log.debug("device type " + devicetype);

            if (devices[d].type === 1) {//thermostat

                //adapter.log.debug("thermostat got ");
                const HeatingPeriodActive = await adapter.getStateAsync("HeatingPeriodActive");

                //adapter.log.debug("got heatingperiodactivr " + JSON.stringify(HeatingPeriodActive));

                if (HeatingPeriodActive.val) {

                    //adapter.log.debug("we are in heating period");
                    if (devicetype === 1) { //it was target of thermostat
                        bRet = true;
                        //adapter.log.debug("ask  " + devices[d].OID_Current);
                        const current = await adapter.getForeignStateAsync(devices[d].OID_Current);
                        //adapter.log.debug("we got current " + current.val + " " + JSON.stringify(devices[d]));
                        //await HandleActors(device.id, parseFloat(current.val), parseFloat(state.val));
                        await HandleActors(devices[d].room, parseFloat(current.val), parseFloat(state.val));
                    }
                    else {

                        if (devicetype === 2) { //it was current of thermostat
                            bRet = true;
                            //adapter.log.debug("ask  " + devices[d].OID_Target);
                            const target = await adapter.getForeignStateAsync(devices[d].OID_Target);
                            //adapter.log.debug("we got target " + target.val + " " + JSON.stringify(devices[d]));
                            //await HandleActors(device.id, parseFloat(state.val), parseFloat(target.val));
                            await HandleActors(devices[d].room, parseFloat(state.val), parseFloat(target.val));
                        }
                        else {
                            adapter.log.warn('wrong device type ');
                        }
                    }
                }
                else {
                    adapter.log.warn('handling actors out of heating period not implemented yet');
                }
            }
            else if (devices[d].type === 2) {//actor
                //nothing to do
            }
            else if (devices[d].type === 3) {//sensor

                let roomID = findObjectIdByKey(adapter.config.rooms, 'name', devices[d].room);

                const windowIsOpen = await CheckWindowSensors(roomID);

                if (adapter.config.SensorDelay > 0) {
                    //nur wenn offen, verzögern
                    if (windowIsOpen) {
                        adapter.log.debug('sensor delay ' + adapter.config.SensorDelay * 1000);
                        let timerId = setTimeout(function (room) {
                            //adapter.log.debug('fired');

                            CheckTemperatureChange(room);

                        }, adapter.config.SensorDelay * 1000, devices[d].room);

                    }
                    else {
                        //wenn zu, dann sofort 
                        CheckTemperatureChange(devices[d].room);

                        //und falls timer noch rennt; abbrechen

                    }
                }
                //version ohne delay
                else {
                    CheckTemperatureChange(devices[d].room);
                }

            }
        }
    }
    else {
        adapter.log.warn('device not found ' + id);
    }

    return bRet;

}

async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

//*******************************************************************
//
//handles actors based on current and target temperature
//to do: better control; right now it's just on / off without hystheresis or similar
async function HandleActors(room, current, target) {

    //adapter.log.debug('#### ' + deviceID + ' ' + current + ' ' + target);
    //let room = adapter.config.devices[deviceID].room;

    adapter.log.info('handle actors ' + room + " current " + current + " target " + target);
    //var oactorsOn = await adapter.getStateAsync("ActorsOn");

    //var actorsOn = oactorsOn.val;

    var toUpdate = false;
    //Temperatur größer als Zieltemp: dann Aktor aus; sonst an
    if (current > target) {
        //find all actors for that room and set them
        for (let i = 0; i < adapter.config.devices.length; i++) {

            if (adapter.config.devices[i].room === room && adapter.config.devices[i].type === 2) {

                let currentState = await adapter.getForeignStateAsync(adapter.config.devices[i].OID_Target);
                if (currentState.val !== false) {
                    //actorsOn++;
                    toUpdate = true;
                    await adapter.setForeignStateAsync(adapter.config.devices[i].OID_Target, false);
                    adapter.log.debug('room ' + room + " actor " + adapter.config.devices[i].OID_Target + " off");
                }
                else {
                    adapter.log.debug('room ' + room + " actor " + adapter.config.devices[i].OID_Target + " nothing to do");
                }
            }
        }

    }
    else if (current < target) {

        //find all actors for that room and set them
        for (let i = 0; i < adapter.config.devices.length; i++) {

            if (adapter.config.devices[i].room === room && adapter.config.devices[i].type === 2) {

                let currentState = await adapter.getForeignStateAsync(adapter.config.devices[i].OID_Target);
                if (currentState.val !== true) {
                    //actorsOn--;
                    toUpdate = true;
                    await adapter.setForeignStateAsync(adapter.config.devices[i].OID_Target, true);
                    adapter.log.debug('room ' + room + " actor " + adapter.config.devices[i].OID_Target + " on");
                }
                else {
                    adapter.log.debug('room ' + room + " actor " + adapter.config.devices[i].OID_Target + " nothing to do");
                }
            }
        }
    }

    if (toUpdate) {
        await CheckAllActors();
    }
    /*
    if (actorsOn < 0) {
        actorsOn = 0;
    }
    await adapter.setStateAsync("ActorsOn", { val: actorsOn, ack: true });
    */
}


async function HandleThermostat(oid, temperature) {

    let currentTarget = await adapter.getForeignStateAsync(oid);

    if (currentTarget.val !== temperature) {
        await adapter.setForeignStateAsync(oid, temperature);
        adapter.log.debug("thermostat " + oid + " to " + temperature);
    }
    else {
        adapter.log.debug("thermostat " + oid + " nothing to do, already " + currentTarget.val );
    }
}


//*******************************************************************
//
// find a object in array by key and value
// returns the object
function findObjectByKey(array, key, value) {
    if (array !== null && typeof array !== 'undefined') {
        for (let i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return array[i];
            }
        }
    }
    return null;
}

    //*******************************************************************
    //
    // find a object in array by key and value
    // returns the object
    function findObjectsByKey(array, key, value) {

        let ret = [];

        if (array !== null && typeof array !== 'undefined') {
            for (let i = 0; i < array.length; i++) {
                if (array[i][key] === value) {
                    ret.push(array[i]);
                }
            }
        }
        return ret;
    }


//*******************************************************************
//
// find a object in array by key and value
// returns index number
    function findObjectIdByKey(array, key, value) {

        if (array !== null && typeof array !== 'undefined') {

            for (let i = 0; i < array.length; i++) {
                if (array[i][key] === value) {
                    return i;
                }
            }
        }
        return -1;
    }


//*******************************************************************
//
// find all objects in array by key and value
// returns index number array
function findObjectsIdByKey(array, key, value) {

    let ret = [];

    if (array !== null && typeof array !== 'undefined') {

        for (let i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                ret.push(i);  
            }
        }
    }
    return ret;
}




//#######################################
// cron fucntions
function CronStop() {
    if (cronJobs.length > 0) {
        adapter.log.debug("delete " + cronJobs.length + " cron jobs");
        //cancel all cron jobs...
        var start = cronJobs.length - 1;
        for (let n = start; n >= 0; n--) {
            //adapter.log.debug("stop cron job " + n);
            cronJobs[n].stop();
        }
        cronJobs=[];
    }
}

function CreateCron4HeatingPeriod() {

    if (adapter.config.UseFixHeatingPeriod) {
        const timezone = adapter.config.timezone || 'Europe/Berlin';
        adapter.log.info("check for heating period based on settings between " + adapter.config.FixHeatingPeriodStart + " and " + adapter.config.FixHeatingPeriodEnd);

        const HeatingPeriodStart = adapter.config.FixHeatingPeriodStart.split(/[.,\/ -]/);
        const HeatingPeriodEnd = adapter.config.FixHeatingPeriodEnd.split(/[.,\/ -]/);


        try {
            //0 0 day month *
            const StartMonth = HeatingPeriodStart[1] - 1;
            let cronString = "5 0 " + HeatingPeriodStart[0] + " " + StartMonth + " *";

            let nextCron = cronJobs.length;

            adapter.log.debug("HeatingPeriod: create cron job #" + nextCron + " at " + HeatingPeriodStart[0] + "." + HeatingPeriodStart[1] + " string: " + cronString + " " + timezone);

            //details see https://www.npmjs.com/package/cron
            cronJobs[nextCron] = new CronJob(cronString,
                () => StartHeatingPeriod(),
                () => adapter.log.debug('cron job stopped'), // This function is executed when the job stops
                true,
                timezone
            );

            const EndMonth = HeatingPeriodEnd[1] - 1;
            cronString = "55 23 " + HeatingPeriodEnd[0] + " " + EndMonth + " *";

            nextCron = cronJobs.length;

            adapter.log.debug("HeatingPeriod: create cron job #" + nextCron + " at " + HeatingPeriodEnd[0] + "." + HeatingPeriodEnd[1] + " string: " + cronString + " " + timezone);

            //details see https://www.npmjs.com/package/cron
            cronJobs[nextCron] = new CronJob(cronString,
                () => StopHeatingPeriod(),
                () => adapter.log.debug('cron job stopped'), // This function is executed when the job stops
                true,
                timezone
            );
        }
        catch (e) {
            adapter.log.error('exception in CreateCron4HeatingPeriod [' + e + ']');
        }
    }

}


function CreateCron4ResetTempOverride(due, roomID) {
    const timezone = adapter.config.timezone || 'Europe/Berlin';

    try {

        //46 18 5 9 Europe / Berlin 

        let cronString = due.getMinutes() + " " + due.getHours() + " " + due.getDate() + " " + due.getMonth() + " *";

        let nextCron = cronJobs.length;

        adapter.log.debug("CreateCron4ResetTempOverride: create cron job #" + nextCron + " at " + due + " string: " + cronString + " " + timezone);

        //details see https://www.npmjs.com/package/cron
        cronJobs[nextCron] = new CronJob(cronString,
            () => StopTempOverride(roomID, nextCron),
            () => adapter.log.debug('cron job stopped'), // This function is executed when the job stops
            true,
            timezone
        );
        //adapter.log.debug("CreateCron4ResetTempOverride " + due);

        getCronStat();
    }
    catch (e) {
        adapter.log.error('exception in CreateCron4ResetTempOverride [' + e + ']');
    }

}


function StopTempOverride(roomID, cronjobID) {
    adapter.log.info("Stop Temperatur Override " + adapter.config.rooms[roomID].name);

    //cron job beenden
    if (cronjobID >= 0) {
        deleteCronJob(cronjobID);
    }
    const id = 'CurrentProfile';

    adapter.getState(id, function (err, obj) {
        if (err) {
            adapter.log.error(err);
        } else {
            

            const idPreset = "Rooms."  + adapter.config.rooms[roomID].name + ".TemperaturOverride";

            adapter.log.info("### " + idPreset);

            adapter.setState(idPreset, { ack: true, val: 0 });

            adapter.config.rooms[roomID].TempOverride = false;

            CheckTemperatureChange();
        }
    });
}

function StartHeatingPeriod() {
    adapter.setState('HeatingPeriodActive', { ack: true, val: true });    
}
function StopHeatingPeriod() {
    adapter.setState('HeatingPeriodActive', { ack: true, val: false });
}
let cronJobs = [];

function CronCreate(Hour, Minute, day) {
    const timezone = adapter.config.timezone || 'Europe/Berlin';

    //https://crontab-generator.org/
    let cronString = '0 ' + Minute + ' ' + Hour + ' * * ';

    if (day === 0) { //every day
        cronString += '*';
    }
    else if (day === -1) {//Mo-Fr
        cronString += ' 1-5';
    }
    else if (day === -2) {//Sa-So
        cronString += ' 0,6';
    }
    else if (day > 0 && day < 8) {
        cronString += day;
    }
    const nextCron = cronJobs.length;

    adapter.log.debug("create cron job #" + nextCron + " at " + Hour + ":" + Minute + " string: " + cronString + " " + timezone);

    //details see https://www.npmjs.com/package/cron
    cronJobs[nextCron] = new CronJob(cronString,
        () => CheckTemperatureChange(),
        () => adapter.log.debug('cron job stopped'), // This function is executed when the job stops
        true,
        timezone
    );

    
}

function getCronStat() {

    //adapter.log.debug("cron jobs");
    for (let n = 0; n < cronJobs.length; n++) {

        if (typeof cronJobs[n] !== 'undefined') {
            adapter.log.debug('[INFO] ' + '      status = ' + cronJobs[n].running + ' next event: ' + timeConverter(cronJobs[n].nextDates()));
        }
    }

    if (cronJobs.length > 100) {
        adapter.log.warn("more then 100 cron jobs existing for this adapter, this might be a configuration error!");
    }

}

function deleteCronJob(id) {

    cronJobs[id].stop();

    if (id === cronJobs.length-1) {
        cronJobs.pop(); //remove last
    }
    else {
        delete cronJobs[id];
    }
    getCronStat();


}


function timeConverter(time) {

    const a = new Date(time);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    let date = a.getDate();
    date = date < 10 ? ' ' + date : date;
    let hour = a.getHours();
    hour = hour < 10 ? '0' + hour : hour;
    let min = a.getMinutes();
    min = min < 10 ? '0' + min : min;
    let sec = a.getSeconds();
    sec = sec < 10 ? '0' + sec : sec;

    var sRet = "";
    //if (timeonly) {
    //    sRet = hour + ':' + min + ':' + sec;
    //}
    //else {
    sRet = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    //}

    return sRet;
}


//#######################################
//
// we fill a list with all time stamps and start cron jobs
// this must be calles when
//  * adapter starts
//  * everytime a time value is changed
//  
async function CalculateNextTime() {

    try {
        adapter.log.debug("start CalculateNextTime, profile type " + parseInt(adapter.config.ProfileType, 10));

        CronStop();

        let timerList = [];

        let currentProfile = await GetCurrentProfile();

        let ActiveRomms = 0;
        var room = 0;
        var period = 0;
        var i = 0;
        if (parseInt(adapter.config.ProfileType, 10) === 1) {

            for (room = 0; room < adapter.config.rooms.length; room++) {

                if (adapter.config.rooms[room].isActive) {

                    //only per room, not global
                    let LastTimeSetHour = -1;
                    let LastTimeSetMinute = -1;

                    ActiveRomms++;

                    for (period = 0; period < adapter.config.NumberOfPeriods; period++) {
                        const id = "Profiles." + currentProfile + "." + adapter.config.rooms[room].name + ".Mo-Su.Periods." + period + '.time';

                        //adapter.log.debug("check time for " + adapter.config.rooms[room].name + " " + id);

                        const nextTime = await adapter.getStateAsync(id);
                        

                        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        if (CheckValidTime(id,nextTime)) {
                            adapter.log.debug("---found time for " + adapter.config.rooms[room].name + " at " + JSON.stringify(nextTime) + " " + nextTime.val);
                            let nextTimes = nextTime.val.split(':'); //here we get hour and minute

                            //add to list if not already there
                            let bFound = false;
                            for (i = 0; i < timerList.length; i++) {
                                if (timerList[i].hour === parseInt(nextTimes[0]) && timerList[i].minute === parseInt(nextTimes[1])) {
                                    bFound = true;
                                    //adapter.log.debug("already in list " + JSON.stringify(nextTime));
                                }
                            }
                            if (!bFound) {

                                let TimeSetHour = parseInt(nextTimes[0]);
                                let TimeSetMinute = parseInt(nextTimes[1]);

                                //see issue 13
                                if (TimeSetHour > LastTimeSetHour || (TimeSetHour === LastTimeSetHour && TimeSetMinute > LastTimeSetMinute)) {

                                    LastTimeSetHour = TimeSetHour;
                                    LastTimeSetMinute = TimeSetMinute;

                                    adapter.log.debug("push to list " + " = " + nextTimes);
                                    timerList.push({
                                        hour: TimeSetHour,
                                        minute: TimeSetMinute,
                                        day: 0
                                    });
                                }
                                else {
                                    adapter.log.warn("wrong order of periods: " + TimeSetHour + ":" + TimeSetMinute + " is smaller then " + LastTimeSetHour + ":" + LastTimeSetMinute + ". Please reorder periods");
                                }
                            }
                        }
                    }
                }
            }



        }
        else if (parseInt(adapter.config.ProfileType, 10) === 2) {

            for (room = 0; room < adapter.config.rooms.length; room++) {

                if (adapter.config.rooms[room].isActive) {

                    //only per room, not global
                    let LastTimeSetHour = -1;
                    let LastTimeSetMinute = -1;

                    ActiveRomms++;

                    adapter.log.debug("setting Mo - Fr");
                    for (period = 0; period < adapter.config.NumberOfPeriods; period++) {
                        const id = "Profiles." + currentProfile + "." + adapter.config.rooms[room].name + ".Mo-Fr.Periods." + period + '.time';

                        //adapter.log.debug("check time for " + adapter.config.rooms[room].name + " " + id);

                        const nextTime = await adapter.getStateAsync(id);

                        
                        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        if (CheckValidTime(id,nextTime)) {
                            adapter.log.debug("---1 found time for " + adapter.config.rooms[room].name + " at " + JSON.stringify(nextTime) + " " + nextTime.val);
                            let nextTimes = nextTime.val.split(':'); //here we get hour and minute

                            //add to list if not already there
                            let bFound = false;
                            for (i = 0; i < timerList.length; i++) {
                                if (timerList[i].hour === parseInt(nextTimes[0]) && timerList[i].minute === parseInt(nextTimes[1]) && timerList[i].day === -1) {
                                    bFound = true;
                                    //adapter.log.debug("already in list " + JSON.stringify(nextTime));
                                }
                            }
                            if (!bFound) {

                                let TimeSetHour = parseInt(nextTimes[0]);
                                let TimeSetMinute = parseInt(nextTimes[1]);

                                //see issue 13
                                if (TimeSetHour > LastTimeSetHour || (TimeSetHour === LastTimeSetHour && TimeSetMinute > LastTimeSetMinute)) {

                                    LastTimeSetHour = TimeSetHour;
                                    LastTimeSetMinute = TimeSetMinute;

                                    adapter.log.debug("push to list " + " = " + nextTimes);
                                    timerList.push({
                                        hour: parseInt(nextTimes[0]),
                                        minute: parseInt(nextTimes[1]),
                                        day: -1
                                    });
                                }
                                else {
                                    adapter.log.warn("wrong order of periods: " + TimeSetHour + ":" + TimeSetMinute + " is smaller then " + LastTimeSetHour + ":" + LastTimeSetMinute + ". Please reorder periods");
                                }
                            }
                        }
                    }

                    //only per room, not global
                    LastTimeSetHour = -1;
                    LastTimeSetMinute = -1;

                    adapter.log.debug("setting Sa - Su");
                    for (period = 0; period < adapter.config.NumberOfPeriods; period++) {
                        const id = "Profiles." + currentProfile + "." + adapter.config.rooms[room].name + ".Sa-So.Periods." + period + '.time';

                        //adapter.log.debug("check time for " + adapter.config.rooms[room].name + " " + id);

                        const nextTime = await adapter.getStateAsync(id);
                        


                        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        if (CheckValidTime(id,nextTime)) {
                            adapter.log.debug("---2 found time for " + adapter.config.rooms[room].name + " at " + JSON.stringify(nextTime) + " " + nextTime.val);
                            let nextTimes = nextTime.val.split(':'); //here we get hour and minute

                            //add to list if not already there
                            let bFound = false;
                            for (i = 0; i < timerList.length; i++) {
                                if (timerList[i].hour === parseInt(nextTimes[0]) && timerList[i].minute === parseInt(nextTimes[1]) && timerList[i].day === -2) {
                                    bFound = true;
                                    //adapter.log.debug("already in list " + JSON.stringify(nextTime));
                                }
                            }
                            if (!bFound) {
                                let TimeSetHour = parseInt(nextTimes[0]);
                                let TimeSetMinute = parseInt(nextTimes[1]);

                                //see issue 13
                                if (TimeSetHour > LastTimeSetHour || (TimeSetHour === LastTimeSetHour && TimeSetMinute > LastTimeSetMinute)) {
                                    adapter.log.debug("push to list " + " = " + nextTimes);

                                    LastTimeSetHour = TimeSetHour;
                                    LastTimeSetMinute = TimeSetMinute;

                                    timerList.push({
                                        hour: parseInt(nextTimes[0]),
                                        minute: parseInt(nextTimes[1]),
                                        day: -2
                                    });
                                }
                                else {
                                    adapter.log.warn("wrong order of periods: " + TimeSetHour + ":" + TimeSetMinute + " is smaller then " + LastTimeSetHour + ":" + LastTimeSetMinute + ". Please reorder periods");
                                }
                            }
                        }
                    }
                }
            }
        }
        else if (parseInt(adapter.config.ProfileType, 10) === 3) {
            for (room = 0; room < adapter.config.rooms.length; room++) {
                var sday;
                if (adapter.config.rooms[room].isActive) {

                    ActiveRomms++;

                    for (var day = 1; day <= 7; day++)

                        switch (day) {
                            case 1: sday = "Mon"; break;
                            case 2: sday = "Tue"; break;
                            case 3: sday = "Wed"; break;
                            case 4: sday = "Thu"; break;
                            case 5: sday = "Fri"; break;
                            case 6: sday = "Sat"; break;
                            case 7: sday = "Sun"; break;
                        }

                    //only per room, not global
                    let LastTimeSetHour = -1;
                    let LastTimeSetMinute = -1;

                    adapter.log.debug("setting " + sday);

                    for (period = 0; period < adapter.config.NumberOfPeriods; period++) {
                        const id = "Profiles." + currentProfile + "." + adapter.config.rooms[room].name + "." + sday + ".Periods." + period + '.time';

                        //adapter.log.debug("check time for " + adapter.config.rooms[room].name + " " + id);

                        const nextTime = await adapter.getStateAsync(id);
                        

                        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        if (CheckValidTime(id,nextTime)) {
                            adapter.log.debug("---found time for " + adapter.config.rooms[room].name + " at " + JSON.stringify(nextTime) + " " + nextTime.val);
                            let nextTimes = nextTime.val.split(':'); //here we get hour and minute

                            //add to list if not already there
                            let bFound = false;
                            for (i = 0; i < timerList.length; i++) {
                                if (timerList[i].hour === parseInt(nextTimes[0]) && timerList[i].minute === parseInt(nextTimes[1]) && timerList[i].day === day) {
                                    bFound = true;
                                    //adapter.log.debug("already in list " + JSON.stringify(nextTime));
                                }
                            }
                            if (!bFound) {
                                let TimeSetHour = parseInt(nextTimes[0]);
                                let TimeSetMinute = parseInt(nextTimes[1]);

                                //see issue 13
                                if (TimeSetHour > LastTimeSetHour || (TimeSetHour === LastTimeSetHour && TimeSetMinute > LastTimeSetMinute)) {
                                    adapter.log.debug("push to list " + " = " + nextTimes);

                                    LastTimeSetHour = TimeSetHour;
                                    LastTimeSetMinute = TimeSetMinute;

                                    timerList.push({
                                        hour: parseInt(nextTimes[0]),
                                        minute: parseInt(nextTimes[1]),
                                        day: day
                                    });
                                }
                                else {
                                    adapter.log.warn("wrong order of periods: " + TimeSetHour + ":" + TimeSetMinute + " is smaller then " + LastTimeSetHour + ":" + LastTimeSetMinute + ". Please reorder periods");
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            adapter.log.warn('CalculateNextTime: not implemented yet, profile type is ' + adapter.config.ProfileType);
        }


        if (ActiveRomms === 0) {
            adapter.log.warn('CalculateNextTime: no active rooms found. Please activate at least one room!');
        }


        CreateCron4HeatingPeriod();

        //and now start all cron jobs
        for (var m = 0; m < timerList.length; m++) {
            CronCreate(timerList[m].hour, timerList[m].minute, timerList[m].day);
        }

        getCronStat();
    }
    catch (e) {
        adapter.log.error('exception in CalculateNextTime[' + e + ']');
    }
}

function CheckValidTime(id, nextTime) {

    let bRet = true;
    try {
        if (nextTime === 'null' || typeof nextTime === 'undefined') {
            adapter.log.error("nextTime not found for " + id);
            bRet = false;
        }
        else if (typeof nextTime !== 'object') {
            adapter.log.error("nextTime  should be a object but is " + typeof nextTime + " for " + id);
            bRet = false;
        }
        else if (typeof nextTime.val !== 'string') {
            adapter.log.error("nextTime.val  should be a string but is " + typeof nextTime.val + " for " + id);
            bRet = false;
        }
        else if (nextTime.val.length < 3) {
            adapter.log.error("nextTime not long enough for " + id);
            bRet = false;
        }
        else if (!nextTime.val.includes(':')) {
            adapter.log.error("nextTime ':' missing for " + id);
            bRet = false;
        }


    }
    catch (e) {
        adapter.log.error('exception in CheckValidTime [' + e + '] for ' + id + " " + JSON.stringify(nextTime));
        bRet = false;
    }
    return bRet;

}


async function GetCurrentProfile() {

    adapter.log.debug('get profile');

    const id = 'CurrentProfile';
    let curProfile = await adapter.getStateAsync(id);
    let currentProfile = curProfile.val;

    if (currentProfile > 0 && currentProfile <= parseInt(adapter.config.NumberOfProfiles,10)) {
        currentProfile--; //zero based!!
    }
    else {
        currentProfile = 0;
    }
    adapter.log.debug('profile ' + currentProfile);
    return currentProfile;
}

//#######################################
//
// this is called by cron
// so we need to find out what needs to be changed and change it
//normally it's a temperature target value
async function CheckTemperatureChange(room2check) {

    if (adapter.config.devices === null || typeof adapter.config.devices === 'undefined') {
        adapter.log.warn("no devices available for checkTempChange");
        return;
    }

    let onlyOneRoom = false;
    if (typeof room2check !== 'undefined' && room2check.length > 0) {
        adapter.log.debug("room to check is " + room2check);
        onlyOneRoom = true;
    }


    try {
        adapter.log.info('calculating new target temperatures');

        const now = new Date();

        var datestring = ("0" + now.getDate()).slice(-2) + "." + ("0" + (now.getMonth() + 1)).slice(-2) + "." +
            now.getFullYear() + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2);


        adapter.setStateAsync('LastProgramRun', { ack: true, val: datestring });

        //first we need some information
        const HeatingPeriodActive = await adapter.getStateAsync("HeatingPeriodActive");

        if (HeatingPeriodActive.val) {

            let temp = await adapter.getStateAsync("GuestsPresent");
            const GuestsPresent = temp.val;

            temp = await adapter.getStateAsync("HolidayPresent");
            const HolidayPresent = temp.val;

            temp = await adapter.getStateAsync("PartyNow");
            const PartyNow = temp.val;

            temp = await adapter.getStateAsync("Present");
            const Present = temp.val;

            let PublicHolidyToday = false;

            if (adapter.config.PublicHolidayLikeSunday === true) {

                temp = await adapter.getStateAsync("PublicHolidyToday");
                PublicHolidyToday = temp.val;

            }


            temp = await adapter.getStateAsync("VacationAbsent");
            const VacationAbsent = temp.val;

            adapter.log.debug("profile type " + adapter.config.ProfileType);

            const currentProfile = await GetCurrentProfile();
            for (var room = 0; room < adapter.config.rooms.length; room++) {

                if (!onlyOneRoom || adapter.config.rooms[room].name === room2check) {


                    if (adapter.config.rooms[room].isActive) {
                        adapter.log.debug("check room " + adapter.config.rooms[room].name);

                        let RoomState = "";

                        //reset in separate cron job!!
                        if (adapter.config.rooms[room].TempOverride) {
                            adapter.log.debug("room " + adapter.config.rooms[room].name + " still in override until " + adapter.config.rooms[room].TempOverrideDue);

                            RoomState = "override";
                            let id = "Rooms." + adapter.config.rooms[room].name + ".State";
                            await adapter.setStateAsync(id, { ack: true, val: RoomState });

                            break;
                        }

                        let AbsentDecrease = 0;
                        let GuestIncrease = 0;
                        let PartyDecrease = 0;
                        let WindowOpenDecrease = 0;
                        let VacationAbsentDecrease = 0;

                        let ReducedTemperature = 0;

                        let WindowOpen = adapter.config.rooms[room].WindowIsOpen;

                        let idPreset = "Profiles." + currentProfile + "." + adapter.config.rooms[room].name + ".";

                        if (parseInt(adapter.config.TemperatureDecrease) === 1) {

                            //and we need some information per room

                            if (WindowOpen) {
                                let temp4 = await adapter.getStateAsync(idPreset + "relative.WindowOpenDecrease");
                                adapter.log.debug("WindowOpenDecrease " + JSON.stringify(temp4));
                                if (temp4 !== null && temp4.val !== 0) {
                                    RoomState += "window open / ";
                                    WindowOpenDecrease = temp4.val;
                                }
                                //else {
                                //    adapter.log.warn("WindowOpenDecrease not defined");
                                //}
                            }
                            else if (VacationAbsent) {
                                let temp5 = await adapter.getStateAsync(idPreset + "relative.VacationAbsentDecrease");
                                adapter.log.debug("VacationAbsentDecrease " + JSON.stringify(temp5));
                                if (temp5 !== null && temp5.val !== 0) {
                                    RoomState += "vacation absent / ";
                                    VacationAbsentDecrease = temp5.val;
                                }
                                //else {
                                //    adapter.log.warn("VacationAbsentDecrease not defined");
                                //}
                            }

                            else if (PartyNow) {
                                let temp3 = await adapter.getStateAsync(idPreset + "relative.PartyDecrease");
                                adapter.log.debug("PartyDecrease " + JSON.stringify(temp3));
                                if (temp3 !== null && temp3.val !== 0) {
                                    RoomState += "party / ";
                                    PartyDecrease = temp3.val;
                                }
                                //else {
                                //    adapter.log.warn("PartyDecrease not defined");
                                //}
                            }
                            else if (!Present) {
                                let temp1 = await adapter.getStateAsync(idPreset + "relative.AbsentDecrease");
                                adapter.log.debug("AbsentDecrease " + JSON.stringify(temp1));
                                if (temp1 !== null && temp1.val !== 0) {
                                    RoomState += "not present / ";
                                    AbsentDecrease = temp1.val;
                                }
                                //else {
                                //    adapter.log.warn("AbsentDecrease not defined");
                                //}
                            }
                            else if (GuestsPresent) {
                                let temp2 = await adapter.getStateAsync(idPreset + "relative.GuestIncrease");
                                adapter.log.debug("GuestIncrease " + JSON.stringify(temp2));
                                if (temp2 !== null && temp2.val !== 0) {
                                    RoomState += "guests present / ";
                                    GuestIncrease = temp2.val;
                                }
                                //else {
                                //    adapter.log.warn("GuestIncrease not defined");
                                //}
                            }
                        }
                        else if (parseInt(adapter.config.TemperatureDecrease) === 2) {

                            if (WindowOpen) {
                                let temp6 = await adapter.getStateAsync(idPreset + "absolute.WindowOpenDecrease");
                                adapter.log.debug("WindowOpenDecrease " + JSON.stringify(temp6));
                                if (temp6 !== null && temp6.val !== 0) {
                                    ReducedTemperature = temp6.val;
                                    RoomState += "window open / ";
                                }
                                //else {
                                //adapter.log.warn("WindowOpenDecrease not defined");
                                //}
                            }
                            else if (VacationAbsent) {
                                let temp6 = await adapter.getStateAsync(idPreset + "absolute.VacationAbsentDecrease");
                                adapter.log.debug("VacationAbsentDecrease " + JSON.stringify(temp6));
                                if (temp6 !== null && temp6.val !== 0) {
                                    ReducedTemperature = temp6.val;
                                    RoomState += "vacation absent / ";
                                }
                                //else {
                                //adapter.log.warn("VacationAbsentDecrease not defined");
                                //}
                            }
                            else if (PartyNow) {
                                let temp6 = await adapter.getStateAsync(idPreset + "absolute.PartyDecrease");
                                adapter.log.debug("PartyDecrease " + JSON.stringify(temp6));
                                if (temp6 !== null && temp6.val !== 0) {
                                    ReducedTemperature = temp6.val;
                                    RoomState += "party / ";
                                }
                                //else {
                                //adapter.log.warn("PartyDecrease not defined");
                                //}
                            }

                            else if (!Present) {
                                let temp6 = await adapter.getStateAsync(idPreset + "absolute.AbsentDecrease");
                                adapter.log.debug("AbsentDecrease " + JSON.stringify(temp6));
                                if (temp6 !== null && temp6.val !== 0) {
                                    ReducedTemperature = temp6.val;
                                    RoomState += "not present / ";
                                }
                                //else {
                                //adapter.log.warn("AbsentDecrease not defined");
                                //}
                            }

                            else if (GuestsPresent) {
                                let temp6 = await adapter.getStateAsync(idPreset + "absolute.GuestIncrease");
                                adapter.log.debug("GuestIncrease " + JSON.stringify(temp6));
                                if (temp6 !== null && temp6.val !== 0) {
                                    ReducedTemperature = temp6.val;
                                    RoomState += "guests / ";
                                }
                                //else {
                                //adapter.log.warn("GuestIncrease not defined");
                                //}
                            }
                        }

                        let currentPeriod = -1;
                        let nextTemperature = -99;
                        let sNextTime;
                        //var period;

                        let ret = await FindNextPeriod(room, now, currentProfile);

                        currentPeriod = ret.currentPeriod;
                        nextTemperature = ret.nextTemperature;
                        sNextTime = ret.sNextTime;

                        if (currentPeriod === -2) {
                            // passiert auch zwischen 0:00 Uhr und ersten profilpunkt
                            //yesterrday 23.59
                            adapter.log.debug("search in yesterday (1) " + now.toLocaleString()); 
                            var ts = Math.round(now.getTime() / 1000);
                            var tsYesterday = ts - (24 * 3600);
                            let yesterday = new Date(tsYesterday * 1000);
                            yesterday.setHours(23);
                            yesterday.setMinutes(59);
                            adapter.log.debug("search in yesterday (2) " + yesterday.toLocaleString());
                            ret = await FindNextPeriod(room, yesterday, currentProfile);

                            currentPeriod = ret.currentPeriod;
                            nextTemperature = ret.nextTemperature;
                            sNextTime = ret.sNextTime;
                        }

                        if (currentPeriod === -2) {// also yesterday not found
                            if (typeof lastSetTemperature[room] !== 'undefined') {
                                nextTemperature = lastSetTemperature[room];
                                currentPeriod = -1;
                            }
                            else {
                                adapter.log.error("### current period not found and no previous temperature available ");
                                RoomState = "error: current period not found";
                                currentPeriod = -2;
                            }
                        }

                        if (currentPeriod > -2) {
                            lastSetTemperature[room] = nextTemperature;

                            //find devices for rooms

                            adapter.log.debug("### current > 1 " + currentPeriod + " " + parseInt(adapter.config.TemperatureDecrease));

                            let nextSetTemperature = nextTemperature;

                            if (parseInt(adapter.config.TemperatureDecrease) === 1) {
                                nextSetTemperature = nextTemperature - AbsentDecrease + GuestIncrease - PartyDecrease - VacationAbsentDecrease - WindowOpenDecrease;
                                adapter.log.debug("### new target temp " + nextTemperature + " " + AbsentDecrease + " " + GuestIncrease + " " + PartyDecrease + " " + VacationAbsentDecrease + " " + WindowOpenDecrease);
                            }
                            else if (parseInt(adapter.config.TemperatureDecrease) === 2) {

                                if (ReducedTemperature > 0) {

                                    nextSetTemperature = ReducedTemperature;
                                    adapter.log.info("setting to reduced/increased temperature in " + adapter.config.rooms[room].name + " to " + nextSetTemperature);

                                    if (nextTemperature > nextSetTemperature) {
                                        RoomState += " reduced";
                                    }
                                    else {
                                        RoomState += " increased";
                                    }
                                }
                                else {
                                    adapter.log.debug("### new target temp" + nextTemperature);
                                }
                            }
                            else {
                                adapter.log.debug("### without decrease; new target temp " + nextSetTemperature);
                            }

                            for (let ii = 0; ii < adapter.config.devices.length; ii++) {

                                if (adapter.config.devices[ii].type === 1 && adapter.config.devices[ii].room === adapter.config.rooms[room].name && adapter.config.devices[ii].isActive) {

                                    adapter.log.info('room ' + adapter.config.rooms[room].name + " Thermostat " + adapter.config.devices[ii].name + " target is " + nextSetTemperature);

                                    //adapter.log.debug("*4 " + state);
                                    //await adapter.setForeignStateAsync(adapter.config.devices[ii].OID_Target, nextSetTemperature);
                                    await HandleThermostat(adapter.config.devices[ii].OID_Target, nextSetTemperature);

                                }
                            }

                            if (currentPeriod > -1) {
                                const currenttime = sNextTime[0] + ":" + sNextTime[1];
                                const timePeriod = "Period " + currentPeriod + " : " + currenttime;
                                let id3 = "Rooms." + adapter.config.rooms[room].name + ".CurrentTimePeriodFull";
                                await adapter.setStateAsync(id3, { ack: true, val: timePeriod });

                                id3 = "Rooms." + adapter.config.rooms[room].name + ".CurrentTimePeriod";
                                await adapter.setStateAsync(id3, { ack: true, val: currentPeriod });

                                id3 = "Rooms." + adapter.config.rooms[room].name + ".CurrentTimePeriodTime";
                                await adapter.setStateAsync(id3, { ack: true, val: currenttime });
                            }
                        }
                        else {
                            adapter.log.error("### current period not found ");
                            RoomState = "error: current period not found";
                            //sollte nicht mehr passieren
                        }

                        if (RoomState === "") {
                            RoomState = "normal";
                        }


                        let id = "Rooms." + adapter.config.rooms[room].name + ".State";
                        await adapter.setStateAsync(id, { ack: true, val: RoomState });

                    }
                }
            }
        }
        else {
            adapter.log.debug("nothing to do: no heating period (certain temp todo)");
            var RoomState = "no heating period";

            for (var r = 0; r < adapter.config.rooms.length; r++) {
                if (adapter.config.rooms[r].isActive) {
                    let id = "Rooms." + adapter.config.rooms[r].name + ".State";
                    await adapter.setStateAsync(id, { ack: true, val: RoomState });
                }
            }
        }

        await HandleActorsGeneral(HeatingPeriodActive.val);

        getCronStat();
    }
    catch (e) {
        adapter.log.error('exception in CheckTemperatureChange [' + e + ']');
    }
}

async function FindNextPeriod(room, now, currentProfile) {
    adapter.log.debug("FindNextPeriod for " + now.toLocaleString() + " in " + adapter.config.rooms[room].name);

    let nextTemperature = -99;
    let currentPeriod = -2;
    let period;
    let sNextTime;

    if (parseInt(adapter.config.ProfileType, 10) === 1) {

        for (period = 0; period < parseInt(adapter.config.NumberOfPeriods, 10); period++) {
            const id = "Profiles." + currentProfile + "." + adapter.config.rooms[room].name + ".Mo-Su.Periods." + period + '.time';
            adapter.log.debug("check ID " + id);

            const nextTime = await adapter.getStateAsync(id);
            //adapter.log.debug("##found time for " + adapter.config.rooms[room].name + " at " + JSON.stringify(nextTime) + " " + nextTime.val);

            let nextTimes = nextTime.val.split(':'); //here we get hour and minute

            //adapter.log.debug("# " + JSON.stringify(nextTimes) + " " + now.getHours() + " " + now.getMinutes());

            //hier Zeitraum prüfen, dann kann das ganze auch bei Änderung aufgerufen werden

            if (now.getHours() > parseInt(nextTimes[0])
                || (now.getHours() === parseInt(nextTimes[0]) && now.getMinutes() >= parseInt(nextTimes[1]))) {

                const id2 = "Profiles." + currentProfile + "." + adapter.config.rooms[room].name + ".Mo-Su.Periods." + period + '.Temperature';

                let temp6 = await adapter.getStateAsync(id2);

                nextTemperature = Check4ValidTemmperature(temp6.val);

                adapter.log.debug("check time for " + adapter.config.rooms[room].name + " " + id + " " + nextTemperature);
                currentPeriod = period;
                sNextTime = nextTimes;

            }

        }
    }
    else if (parseInt(adapter.config.ProfileType, 10) === 2) {

        let daysname = "";
        if (now.getDay() > 0 && now.getDay() < 6) {
            daysname = "Mo-Fr";
        }
        else {
            daysname = "Sa-So";
        }

        if (PublicHolidyToday && adapter.config.PublicHolidayLikeSunday) {
            daysname = "Sa-So";
            RoomState += "public holiday / ";
        }

        if (HolidayPresent) {
            daysname = "Sa-So";
            RoomState += "holiday present / ";
        }

        for (period = 0; period < parseInt(adapter.config.NumberOfPeriods, 10); period++) {
            const id = "Profiles." + currentProfile + "." + adapter.config.rooms[room].name + "." + daysname + ".Periods." + period + '.time';
            adapter.log.debug("check ID " + id);

            const nextTime = await adapter.getStateAsync(id);
            //adapter.log.debug("##found time for " + adapter.config.rooms[room].name + " at " + JSON.stringify(nextTime) + " " + nextTime.val);

            let nextTimes = nextTime.val.split(':'); //here we get hour and minute

            //adapter.log.debug("# " + JSON.stringify(nextTimes) + " " + now.getHours() + " " + now.getMinutes());

            //hier Zeitraum prüfen, dann kann das ganze auch bei Änderung aufgerufen werden

            if (now.getHours() > parseInt(nextTimes[0])
                || (now.getHours() === parseInt(nextTimes[0]) && now.getMinutes() >= parseInt(nextTimes[1]))) {

                const id2 = "Profiles." + currentProfile + "." + adapter.config.rooms[room].name + "." + daysname + ".Periods." + period + '.Temperature';

                let temp6 = await adapter.getStateAsync(id2);
                nextTemperature = Check4ValidTemmperature(temp6.val);

                adapter.log.debug("check time for " + adapter.config.rooms[room].name + " " + id + " " + nextTemperature);
                currentPeriod = period;
                sNextTime = nextTimes;

            }

        }
    }
    else if (parseInt(adapter.config.ProfileType, 10) === 3) {

        let daysname = "";
        switch (now.getDay()) {
            case 1: daysname = "Mon"; break;
            case 2: daysname = "Tue"; break;
            case 3: daysname = "Wed"; break;
            case 4: daysname = "Thu"; break;
            case 5: daysname = "Fri"; break;
            case 6: daysname = "Sat"; break;
            case 0: daysname = "Sun"; break;
        }

        if (PublicHolidyToday && adapter.config.PublicHolidayLikeSunday) {
            daysname = "Sun";
            RoomState += "public holiday / ";
        }

        if (HolidayPresent) {
            daysname = "Sun";
            RoomState += "holiday present / ";
        }

        for (period = 0; period < parseInt(adapter.config.NumberOfPeriods, 10); period++) {

            const id = "Profiles." + currentProfile + "." + adapter.config.rooms[room].name + "." + daysname + ".Periods." + period + '.time';

            adapter.log.debug("check ID " + id);

            const nextTime = await adapter.getStateAsync(id);
            //adapter.log.debug("##found time for " + adapter.config.rooms[room].name + " at " + JSON.stringify(nextTime) + " " + nextTime.val);

            let nextTimes = nextTime.val.split(':'); //here we get hour and minute

            //adapter.log.debug("# " + JSON.stringify(nextTimes) + " " + now.getHours() + " " + now.getMinutes());

            //hier Zeitraum prüfen, dann kann das ganze auch bei Änderung aufgerufen werden

            if (now.getHours() > parseInt(nextTimes[0])
                || (now.getHours() === parseInt(nextTimes[0]) && now.getMinutes() >= parseInt(nextTimes[1]))) {

                const id2 = "Profiles." + currentProfile + "." + adapter.config.rooms[room].name + "." + daysname + ".Periods." + period + '.Temperature';

                let temp6 = await adapter.getStateAsync(id2);
                nextTemperature = Check4ValidTemmperature(temp6.val);

                adapter.log.debug("check time for " + adapter.config.rooms[room].name + " " + id + " " + nextTemperature);
                currentPeriod = period;
                sNextTime = nextTimes;
            }
        }
    }
    else {
        //adapter.log.warn("profile type != 1 not implemented yet");
        adapter.log.warn('FindNextPeriod: profile not implemented yet, profile type is ' + parseInt(adapter.config.ProfileType, 10));
    }

    let ret = {
        currentPeriod: currentPeriod,
        nextTemperature: nextTemperature,
        sNextTime: sNextTime
    };


    adapter.log.debug(adapter.config.rooms[room].name + " found period " + currentPeriod + " with " + nextTemperature + " on " + sNextTime);


    return ret;
}


async function StartTemperaturOverride(room) {

    adapter.log.info("change temperature override for room " + room);

    try {
        let roomID = findObjectIdByKey(adapter.config.rooms, 'name', room);

        
        if (roomID > -1) {
            let idPreset = "Rooms." + room + ".";
            let nextSetTemperatureVal = await adapter.getStateAsync(idPreset + "TemperaturOverride");
            let nextSetTemperature = nextSetTemperatureVal.val;

            let OverrideTimeVal = await adapter.getStateAsync(idPreset + "TemperaturOverrideTime");
            let OverrideTime = OverrideTimeVal.val.split(":");

            if (adapter.config.rooms[roomID].TempOverride && nextSetTemperature === 0) {
                // we want to cancel override

                StopTempOverride(roomID, -1);
            }


            else if (nextSetTemperature > 0) {
                if (OverrideTime[0] > 0 || OverrideTime[1] > 0) {

                    let now = new Date();
                    //adapter.log.debug("### " + OverrideTimeVal.val + " " + JSON.stringify(OverrideTime) + " " + JSON.stringify(now));
                    if (OverrideTime[0] > 0) {
                        now.setHours(now.getHours() + parseInt(OverrideTime[0]));
                        //adapter.log.debug("---1 " + JSON.stringify(now));
                    }
                    if (OverrideTime[1] > 0) {
                        now.setMinutes(now.getMinutes() + parseInt(OverrideTime[1]));
                        //adapter.log.debug("---2 " + JSON.stringify(now));
                    }

                    adapter.config.rooms[roomID].TempOverrideDue = now;
                    //adapter.log.debug("override " + nextSetTemperature + " due " + JSON.stringify(now));


                    if (adapter.config.rooms[roomID].TempOverride) {
                        adapter.log.warn("already in override " + room);
                    }

                    adapter.config.rooms[roomID].TempOverride = true;

                    let id = "Rooms." + adapter.config.rooms[roomID].name + ".State";
                    await adapter.setStateAsync(id, { ack: true, val: "override" });


                    //create cron to reset
                    CreateCron4ResetTempOverride(now, roomID);

                    for (let ii = 0; ii < adapter.config.devices.length; ii++) {

                        if (adapter.config.devices[ii].type === 1 && adapter.config.devices[ii].room === room && adapter.config.devices[ii].isActive) {

                            adapter.log.info('room ' + room + " Thermostat " + adapter.config.devices[ii].name + " set to " + nextSetTemperature);

                            //adapter.log.debug("*4 " + state);
                            //await adapter.setForeignStateAsync(adapter.config.devices[ii].OID_Target, nextSetTemperature);
                            await HandleThermostat(adapter.config.devices[ii].OID_Target, nextSetTemperature);
                        }
                    }
                }
                else {
                    adapter.log.warn("override time not valid: " + OverrideTimeVal.val);
                }
            }
            else {
                adapter.log.warn("override temperature not valid: " + nextSetTemperature);
            }
        }
        else {
            adapter.log.warn("room not valid: " + room);
        }
    }
    catch (e) {
        adapter.log.error('exception in StartTemperaturOverride [' + e + ']');
    }

}



async function HandleActorsGeneral(HeatingPeriodActive) {
    if (adapter.config.UseActors) {

        //if no heating period and actors should be set to on or off
        if (!HeatingPeriodActive && adapter.config.UseActorsIfNotHeating > 1) {
            let target = false;
            if (parseInt(adapter.config.UseActorsIfNotHeating) === 2) {
                target = false;
            }
            else if (parseInt(adapter.config.UseActorsIfNotHeating) === 3) {
                target = true;
            }
            else {
                adapter.log.warn("HandleActorsGeneral: unknown target value: " + parseInt(adapter.config.UseActorsIfNotHeating));
            }

            for (let device = 0; device < adapter.config.devices.length; device++) {
                if (adapter.config.devices[device].type === 2) {
                    //check current state and set only if changed

                    let currentState = await adapter.getForeignStateAsync(adapter.config.devices[device].OID_Target);
                    if (currentState.val !== target) {

                        await adapter.setForeignStateAsync(adapter.config.devices[device].OID_Target, target);
                        adapter.log.debug(" actor " + adapter.config.devices[device].OID_Target + " to " + target);
                    }
                    else {
                        adapter.log.debug(" actor " + adapter.config.devices[device].OID_Target + " nothing to do");
                    }
                }
            }
        }

        
        //if we are in heating period but room has no thermostat
        if (HeatingPeriodActive && parseInt(adapter.config.UseActorsIfNoThermostat) > 1) {
            if (typeof ActorsWithoutThermostat !== 'undefined' && ActorsWithoutThermostat.length > 0) {
                let target = false;
                if (parseInt(adapter.config.UseActorsIfNoThermostat) === 2) {
                    target = false;
                }
                else if (parseInt(adapter.config.UseActorsIfNoThermostat) === 3) {
                    target = true;
                }
                else {
                    adapter.log.warn("HandleActorsGeneral: unknown target value: " + parseInt(adapter.config.UseActorsIfNoThermostat));
                }

                adapter.log.info("HandleActorsGeneral: setting actuators without thermostats to " + target);

                for (let d = 0; d < ActorsWithoutThermostat.length; d++) {
                    //prüfen, ob state schon target entspricht
                    let currentState = await adapter.getForeignStateAsync(ActorsWithoutThermostat[d].oid);
                    if (currentState.val !== target) {
                        
                        await adapter.setForeignStateAsync(ActorsWithoutThermostat[d].oid, target);
                        adapter.log.debug(" actor " + ActorsWithoutThermostat[d].oid + " to " + target);
                    }
                    else {
                        adapter.log.debug(" actor " + ActorsWithoutThermostat[d].oid + " nothing to do");
                    }
                }
            }
        }
    }
}

function Check4ValidTemmperature(temperature) {

    if (isNaN(temperature)) {

        adapter.log.warn("try to convert " + temperature + " to a number");

        return parseInt(temperature);
    }
    else {
        return temperature;
    }

}

async function checkHeatingPeriod() {

    if (adapter.config.UseFixHeatingPeriod) {
        adapter.log.info("initial check for heating period based on settings between " + adapter.config.FixHeatingPeriodStart + " and " + adapter.config.FixHeatingPeriodEnd);

        const HeatingPeriodStart = adapter.config.FixHeatingPeriodStart.split(/[.,\/ -]/);
        const HeatingPeriodEnd = adapter.config.FixHeatingPeriodEnd.split(/[.,\/ -]/);

        const StartMonth = HeatingPeriodStart[1] - 1;
        const StartDay = HeatingPeriodStart[0];
        const EndMonth = HeatingPeriodEnd[1] - 1;
        const EndDay = HeatingPeriodEnd[0];

        let Today = new Date();

        let isHeatingPeriod = false;

        //somewhere in spring 
        if (Today.getMonth() > EndMonth || (Today.getMonth() === EndMonth && Today.getDate() > EndDay)) {
            isHeatingPeriod = false;
        }
        else {
            isHeatingPeriod = true;
        }

        if (isHeatingPeriod === false) {
            //somewhere in autumn
            if (Today.getMonth() > StartMonth || (Today.getMonth() === StartMonth && Today.getDate() > StartDay)) {
                isHeatingPeriod = true;
            }
        }
        adapter.log.info("heating period is " + JSON.stringify(isHeatingPeriod));

        await adapter.setStateAsync('HeatingPeriodActive', { ack: true, val: isHeatingPeriod });  
    }
}

async function CheckAllWindowSensors() {

    if (adapter.config.UseSensors) {
        //adapter.log.debug("Check all sensors in " + JSON.stringify(adapter.config.devices));
        for (let i = 0; i < adapter.config.rooms.length; i++) {

            if (adapter.config.rooms[i].isActive) {
                await CheckWindowSensors(i);
            }
        }
    }
}

async function CheckAllActors() {

    if (adapter.config.UseActors) {
        adapter.log.info("checking all actors");
        //adapter.log.debug("Check all actors in " + JSON.stringify(adapter.config.devices));
        let actorsOn = 0;
        let noOfActors = 0;
        for (let i = 0; i < adapter.config.devices.length; i++) {

            if (adapter.config.devices[i].isActive && adapter.config.devices[i].type === 2) {

                noOfActors++;
                let current = await adapter.getForeignStateAsync(adapter.config.devices[i].OID_Target);

                if (current !== null && typeof current !== 'undefined') {
                    if (current.val) {
                        actorsOn++;
                    }
                }
            }
        }

        adapter.log.info(actorsOn + " actors are on of " + noOfActors);
        await adapter.setStateAsync("ActorsOn", { val: actorsOn, ack: true } );
    }
}



async function CheckAllExternalStates() {

    adapter.log.info("checking all external states");
    //get value from other adapter if configured
    //"Path2FeiertagAdapter": "",
    adapter.log.debug("checking Path2FeiertagAdapter");
    if (adapter.config.Path2FeiertagAdapter.length > 0) {

        var names = adapter.config.Path2FeiertagAdapter.split('.');

        let PublicHolidayId = "";
        if (names.length === 2) {
            //feiertage.0.heute.boolean
            PublicHolidayId = adapter.config.Path2FeiertagAdapter + ".heute.boolean";
        }
        else {
            PublicHolidayId = adapter.config.Path2FeiertagAdapter;
        }

        const PublicHoliday = await adapter.getForeignStateAsync(PublicHolidayId);

        //adapter.log.debug("### 4444 " + PublicHoliday.val);

        if (PublicHoliday !== null && typeof PublicHoliday !== 'undefined') {
            //heatingcontrol.0.PublicHolidyToday
            adapter.log.info("setting PublicHolidyToday to " + PublicHoliday.val);
            await adapter.setStateAsync("PublicHolidyToday", { val: PublicHoliday.val, ack: true });
        }
        else {
            adapter.log.debug('CheckAllExternalStates (set default): ' + PublicHolidayId + ' not found');
            await adapter.setStateAsync("PublicHolidyToday", { val: false, ack: true });
        }
    }
    else {
        const publicholidaytoday = await adapter.getStateAsync('PublicHolidyToday');
        //set default only if nothing was set before
        if (publicholidaytoday === null) {
            await adapter.setStateAsync('PublicHolidyToday', { ack: true, val: false });
        }
    }

    //"Path2PresentDP": "",
    //"Path2PresentDPType": 1
    adapter.log.debug("checking Path2PresentDP");
    if (adapter.config.Path2PresentDP.length > 0) {

        let present = null;
        if (parseInt(adapter.config.Path2PresentDPType) === 1) {

            const nTemp = await adapter.getForeignStateAsync(adapter.config.Path2PresentDP);

            adapter.log.debug("got Present (1) " + JSON.stringify(nTemp));

            if (nTemp !== null && typeof nTemp !== 'undefined') {
                present = nTemp.val;
            }
        }
        else {

            const nTemp = await adapter.getForeignStateAsync(adapter.config.Path2PresentDP);

            adapter.log.debug("got Present (2) " + JSON.stringify(nTemp));

            if (nTemp !== null && typeof nTemp !== 'undefined') {
                if (nTemp.val > 0) {
                    present = true;
                }
            }
        }

        if (present !== null && typeof present !== 'undefined') {
            //heatingcontrol.0.Present
            adapter.log.info("setting Present to " + present);
            await adapter.setStateAsync("Present", { val: present, ack: true });
        }
        else {
            adapter.log.warn('CheckAllExternalStates (set default): ' + adapter.config.Path2PresentDP + ' not found');
            await adapter.setStateAsync("Present", { val: false, ack: true });
        }
    }
    else {
        const present = await adapter.getStateAsync('Present');
        //set default only if nothing was set before
        if (present === null) {
            await adapter.setStateAsync('Present', { ack: true, val: false });
        }
    }

    //"Path2VacationDP": "",
    adapter.log.debug("checking Path2VacationDP");
    if (adapter.config.Path2VacationDP.length > 0) {

        const vacation = await adapter.getForeignStateAsync(adapter.config.Path2VacationDP);

        if (vacation !== null && typeof vacation !== 'undefined') {
            //heatingcontrol.0.VacationAbsent
            adapter.log.info("setting VacationAbsent to " + vacation.val);
            await adapter.setStateAsync("VacationAbsent", { val: vacation.val, ack: true });
        }
        else {
            adapter.log.warn('CheckAllExternalStates (set default): ' + adapter.config.Path2VacationDP + ' not found');
            await adapter.setStateAsync("VacationAbsent", { val: false, ack: true });
        }
    }
    else {
        const vacation = await adapter.getStateAsync('VacationAbsent');
        //set default only if nothing was set before
        if (vacation === null) {
            await adapter.setStateAsync('VacationAbsent', { ack: true, val: false });
        }
    }

    //"Path2GuestsPresentDP": "",
    adapter.log.debug("checking Path2GuestsPresentDP");
    if (adapter.config.Path2GuestsPresentDP.length > 0) {

        const guestspresent = await adapter.getForeignStateAsync(adapter.config.Path2GuestsPresentDP);

        if (guestspresent !== null && typeof guestspresent !== 'undefined') {
            //heatingcontrol.0.GuestsPresent
            adapter.log.info("setting GuestsPresent to " + guestspresent.val);
            await adapter.setStateAsync("GuestsPresent", { val: guestspresent.val, ack: true });
        }
        else {
            adapter.log.warn('CheckAllExternalStates (set default): ' + adapter.config.Path2GuestsPresentDP + ' not found');
            await adapter.setStateAsync("GuestsPresent", { val: false, ack: true });
        }
    }
    else {
        const guestspresent = await adapter.getStateAsync('GuestsPresent');
        //set default only if nothing was set before
        if (guestspresent === null) {
            await adapter.setStateAsync('GuestsPresent', { ack: true, val: false });
        }
    }

    //"Path2PartyNowDP": "",
    adapter.log.debug("checking Path2PartyNowDP");
    if (adapter.config.Path2PartyNowDP.length > 0) {

        const partynow = await adapter.getForeignStateAsync(adapter.config.Path2PartyNowDP);

        if (partynow !== null && typeof partynow !== 'undefined') {
            //heatingcontrol.0.PartyNow
            adapter.log.info("setting PartyNow to " + partynow.val);
            await adapter.setStateAsync("PartyNow", { val: partynow.val, ack: true });
        }
        else {
            adapter.log.warn('CheckAllExternalStates (set default): ' + adapter.config.Path2PartyNowDP + ' not found');
            await adapter.setStateAsync("PartyNow", { val: false, ack: true });
        }
    }
    else {
        const partynow = await adapter.getStateAsync('PartyNow');
        //set default only if nothing was set before
        if (partynow === null) {
            await adapter.setStateAsync('PartyNow', { ack: true, val: false });
        }
    }


    //"Path2HolidayPresentDP": "",
    adapter.log.debug("checking Path2HolidayPresentDP");
    if (adapter.config.Path2HolidayPresentDP.length > 0) {

        const holidaypresent = await adapter.getForeignStateAsync(adapter.config.Path2HolidayPresentDP);

        if (holidaypresent !== null && typeof holidaypresent !== 'undefined') {
            //heatingcontrol.0.HolidayPresent
            adapter.log.info("setting HolidayPresent to " + holidaypresent.val);
            await adapter.setStateAsync("HolidayPresent", { val: holidaypresent.val, ack: true });
        }
        else {
            adapter.log.warn('CheckAllExternalStates (set default): ' + adapter.config.Path2HolidayPresentDP + ' not found');
            await adapter.setStateAsync("HolidayPresent", { val: false, ack: true });
        }
    }
    else {
        const holidaypresent = await adapter.getStateAsync('HolidayPresent');
        //set default only if nothing was set before
        if (holidaypresent === null) {
            await adapter.setStateAsync('HolidayPresent', { ack: true, val: false });
        }
    }

    adapter.log.info("external states checked, done");
}




async function CheckWindowSensors(roomID) {

    let state2Set = false;

    try {
        if (adapter.config.UseSensors) {
            let roomName = adapter.config.rooms[roomID].name;

            adapter.log.debug("Check sensors for " + roomName);


            for (let i = 0; i < adapter.config.devices.length; i++) {

                //adapter.log.debug("---check sensor with OID " + adapter.config.devices[i].OID_Current);

                if (adapter.config.devices[i].isActive && adapter.config.devices[i].type === 3) {

                    if (adapter.config.devices[i].room === roomName) {

                        //adapter.log.debug("found sensor with OID " + adapter.config.devices[i].OID_Current);

                        const state = await adapter.getForeignStateAsync(adapter.config.devices[i].OID_Current);

                        adapter.log.debug("got sensor state " + JSON.stringify(state) + " from " + adapter.config.devices[i].OID_Current);

                        if (state !== null && typeof state !== 'undefined') {
                            if (state.val) {
                                adapter.log.info(roomName + " window open on " + adapter.config.devices[i].name);
                                state2Set = true;
                            }
                        }
                        else {
                            adapter.log.warn(roomName + " no valid result from " + adapter.config.devices[i].OID_Current);

                        }
                    }
                }
            }

            adapter.config.rooms[roomID].WindowIsOpen = state2Set;

            let id = "Rooms." + adapter.config.rooms[roomID].name + ".WindowIsOpen";
            await adapter.setStateAsync(id, { ack: true, val: state2Set });

        }
    }
    catch (e) {
        adapter.log.error('exception in CheckWindowSensors [' + e + ']');
    }

    return state2Set;
}

function SearchActorsWithoutThermostat() {
    //ActorsWithoutThermostat
    try {
        if (adapter.config.UseActors && parseInt(adapter.config.UseActorsIfNoThermostat) > 1) {
            adapter.log.info('searching actuators without thermostats');

            for (let room = 0; room < adapter.config.rooms.length; room++) {

                if (adapter.config.rooms[room].isActive) {
                    let bHasThermostat = false;
                    let bHasActors = false;
                    let devices = findObjectsByKey(adapter.config.devices, 'room', adapter.config.rooms[room].name);

                    if (devices !== null) {

                        for (let d = 0; d < devices.length; d++) {
                            if (devices[d].type === 1 && devices[d].isActive) { // thermostat
                                bHasThermostat = true;
                                adapter.log.debug("found thermostat " + devices[d].name + " for " + adapter.config.rooms[room].name);
                            }
                            if (devices[d].type === 2 && devices[d].isActive) { // actor
                                bHasActors = true;
                                adapter.log.debug("found actor " + devices[d].name + " for " + adapter.config.rooms[room].name);
                            }
                        }

                        if (!bHasThermostat && bHasActors) {
                            for (let d = 0; d < devices.length; d++) {

                                if (devices[d].type === 2 && devices[d].isActive) { // actor

                                    adapter.log.debug("push actor " + devices[d].name + " to list");

                                    ActorsWithoutThermostat.push({
                                        name: devices[d].name,
                                        oid: devices[d].OID_Target
                                    });
                                }
                            }
                        }
                    }
                }
            }
            adapter.log.debug('found actuators without thermostats: ' + JSON.stringify(ActorsWithoutThermostat));
        }
    }
    catch (e) {
        adapter.log.error('exception in SearchActorsWithoutThermostat [' + e + ']');
    }
}

// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
} 



