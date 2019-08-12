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
const bDebug = false;
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


var HeizungGewerk = "Heizung";

const DefaultTargets = [];
DefaultTargets[0] = ['05:00:00', 19];
DefaultTargets[1] = ['08:00:00', 21];
DefaultTargets[2] = ['12:00:00', 21];
DefaultTargets[3] = ['16:00:00', 19];
DefaultTargets[4] = ['21:00:00', 21];

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
        objectChange: function (id, obj) {
            adapter.log.debug('[OBJECT CHANGE] ==== ' + id + ' === ' + JSON.stringify(obj));
        },
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
        await SubscribeStates();
        await CalculateNextTime();
        await CheckTemperatureChange(true);
    }
    catch (e) {
        adapter.log.error('exception in  main [' + e + ']');
    }
}

async function ListRooms(obj) {

    if (adapter.config.rooms.length === 0 || adapter.config.deleteall) {

        adapter.config.rooms.length = 0;
        var rooms = {};
        //get room enums first; this includes members as well
        const AllRoomsEnum = await adapter.getEnumAsync('rooms');
        rooms = AllRoomsEnum.result;
        adapter.log.debug("rooms " + JSON.stringify(rooms));

        for (var e in rooms) {

            adapter.config.rooms.push({
                name: rooms[e].common.name,
                isActive: true
            });


        }
    }
    adapter.log.debug('all rooms done ' + JSON.stringify(adapter.config.devices));

    adapter.sendTo(obj.from, obj.command, adapter.config.rooms, obj.callback);
}

//#######################################
//
// used as interface to admin
async function ListDevices(obj) {

    if (adapter.config.devices.length === 0 || adapter.config.deleteall) {

        adapter.config.devices.length = 0;

        //use for test but comment it out for real life
        //AddTestData();

        let rooms = {};
        //get room enums first; this includes members as well
        const AllRoomsEnum = await adapter.getEnumAsync('rooms');
        rooms = AllRoomsEnum.result;

        let functions = {};
        const AllFunctionsEnum = await adapter.getEnumAsync('functions');
        //adapter.log.debug("function enums: " + JSON.stringify(AllFunctionsEnum));
        functions = AllFunctionsEnum.result;

        let HeatingMember = [];
        for (var e1 in functions) {

            if (functions[e1].common.name === HeizungGewerk) {
                var ids1 = functions[e1].common.members;
                for (var n1 in ids1) {

                    HeatingMember.push({
                        id: ids1[n1]
                    });
                }
            }
        }
        adapter.log.debug("heating member: " + JSON.stringify(HeatingMember));

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
                        adapter.log.debug("check thermostat for homematic");
                        var IsInDeviceList = false;
                        for (var x1 = 0; x1 <= MaxHomematicThermostatType; x1++) {
                            adapter.log.debug("check " + adapterObj.native.PARENT_TYPE + " === " + ThermostatTypeTab[x1][0]);
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
                                        id: adapter.config.devices.length + 1,
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
                        adapter.log.debug("check actor for homematic");
                        for (var x2 = MinHomematicActorType; x2 <= MaxHomematicActorType; x2++) {
                            adapter.log.debug("check " + adapterObj.native.PARENT_TYPE + " === " + ActorTypeTab[x2][0]);
                            if (adapterObj.native.PARENT_TYPE === ActorTypeTab[x2][0]) {
                                supportedActor = x2;

                                adapter.log.debug("Actor found " + JSON.stringify(adapterObj));

                                /*
                                 * Actor found {"_id":"hm-rpc.0.LEQ0900578.3","type":"channel","common":{"name":"HK_Aktor_KG_Gast","role":"switch"},"native":{"ADDRESS":"LEQ0900578:3","AES_ACTIVE":0,"DIRECTION":2,"FLAGS":1,"INDEX":3,"LINK_SOURCE_ROLES":"","LINK_TARGET_ROLES":"SWITCH WCS_TIPTRONIC_SENSOR WEATHER_CS","PARAMSETS":["LINK","MASTER","VALUES"],"PARENT":"LEQ0900578","PARENT_TYPE":"HM-LC-Sw4-DR","TYPE":"SWITCH","VERSION":26},"from":"system.adapter.hm-rega.0","user":"system.user.admin","ts":1565456990633,"acl":{"object":1636,"owner":"system.user.admin","ownerGroup":"system.group.administrator"}}
                                 */
                                let sName = adapterObj.common.name;
                                IsInDeviceList = findObjectIdByKey(adapter.config.devices, 'name', sName);
                                if (IsInDeviceList === -1) {
                                    adapter.config.devices.push({
                                        id: adapter.config.devices.length + 1,
                                        name: sName,
                                        isActive: true,
                                        room: rooms[e].common.name,
                                        type: 2, //actors
                                        OID_Target: adapterObj._id + ActorTypeTab[supportedActor][2]
                                    });
                                }
                            }
                        }

                        var supportedSensor = -1;
                        adapter.log.debug("check sensor for homematic");
                        for (var x3 = MinHomematicSensorType; x3 <= MaxHomematicSensorType; x3++) {
                            adapter.log.debug("check " + adapterObj.native.PARENT_TYPE + " === " + SensorTypeTab[x3][0]);
                            if (adapterObj.native.PARENT_TYPE === SensorTypeTab[x3][0]) {
                                supportedSensor = x3;

                                adapter.log.debug("Sensor found " + JSON.stringify(adapterObj));
                                let sName = adapterObj.common.name;
                                IsInDeviceList = findObjectIdByKey(adapter.config.devices, 'name', sName);
                                if (IsInDeviceList === -1) {
                                    adapter.config.devices.push({
                                        id: adapter.config.devices.length + 1,
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

    adapter.log.debug('all rooms done ' + JSON.stringify(adapter.config.devices));

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


//#######################################
//
// create all necessary datapaoints
// will be called at ecery start of adapter
async function CreateDatepoints() {

    adapter.log.debug('CreateDatepoints');

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
    adapter.subscribeStates('CurrentProfile');

    await adapter.setObjectNotExistsAsync('HeatingPeriodActive', {
        type: 'state',
        common: {
            name: 'HeatingPeriodActive',
            type: 'bool',
            role: 'history',
            unit: '',
            read: true,
            write: true
        },
        native: { id: 'HeatingPeriodActive' }
    });
    adapter.subscribeStates('HeatingPeriodActive');

    await adapter.setObjectNotExistsAsync('PublicHolidyToday', {
        type: 'state',
        common: {
            name: 'PublicHolidyToday',
            type: 'bool',
            role: 'history',
            unit: '',
            read: true,
            write: true
        },
        native: { id: 'PublicHolidyToday' }
    });
    adapter.subscribeStates('PublicHolidyToday');

    await adapter.setObjectNotExistsAsync('Present', {
        type: 'state',
        common: {
            name: 'Present',
            type: 'bool',
            role: 'history',
            unit: '',
            read: true,
            write: true
        },
        native: { id: 'Present' }
    });
    adapter.subscribeStates('Present');

    await adapter.setObjectNotExistsAsync('PartyNow', {
        type: 'state',
        common: {
            name: 'PartyNow',
            type: 'bool',
            role: 'history',
            unit: '',
            read: true,
            write: true
        },
        native: { id: 'PartyNow' }
    });
    adapter.subscribeStates('PartyNow');

    await adapter.setObjectNotExistsAsync('GuestsPresent', {
        type: 'state',
        common: {
            name: 'GuestsPresent',
            type: 'bool',
            role: 'history',
            unit: '',
            read: true,
            write: true
        },
        native: { id: 'GuestsPresent' }
    });
    adapter.subscribeStates('GuestsPresent');

    await adapter.setObjectNotExistsAsync('HolidayPresent', {
        type: 'state',
        common: {
            name: 'HolidayPresent',
            type: 'bool',
            role: 'history',
            unit: '',
            read: true,
            write: true
        },
        native: { id: 'HolidayPresent' }
    });
    adapter.subscribeStates('HolidayPresent');

    await adapter.setObjectNotExistsAsync('VacationAbsent', {
        type: 'state',
        common: {
            name: 'VacationAbsent',
            type: 'bool',
            role: 'history',
            unit: '',
            read: true,
            write: true
        },
        native: { id: 'VacationAbsent' }
    });
    adapter.subscribeStates('VacationAbsent');

    if (parseInt(adapter.config.ProfileType, 10) === 1) {
        adapter.log.debug('Profile Type  Mo-So, profiles ' + parseInt(adapter.config.NumberOfProfiles, 10));

        for (var profile = 0; profile < parseInt(adapter.config.NumberOfProfiles, 10); profile++) {
            adapter.log.debug('rooms ' + adapter.config.devices.length);

            for (var rooms = 0; rooms < adapter.config.devices.length; rooms++) {

                let id1 = "Profiles." + profile + "." + adapter.config.devices[rooms].room;


                await adapter.setObjectNotExistsAsync(id1 + '.GuestIncrease', {
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
                adapter.subscribeStates(id1 + '.GuestIncrease');

                await adapter.setObjectNotExistsAsync(id1 + '.PartyDecrease', {
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
                adapter.subscribeStates(id1 + '.PartyDecrease');

                await adapter.setObjectNotExistsAsync(id1 + '.AbsentDecrease', {
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
                adapter.subscribeStates(id1 + '.AbsentDecrease');

                await adapter.setObjectNotExistsAsync(id1 + '.VacationAbsentDecrease', {
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
                adapter.subscribeStates(id1 + '.VacationAbsentDecrease');

                await adapter.setObjectNotExistsAsync(id1 + '.HolidayPresentLikePublicHoliday', {
                    type: 'state',
                    common: {
                        name: 'HolidayPresentLikePublicHoliday',
                        type: 'bool',
                        role: 'history',
                        unit: '',
                        read: true,
                        write: true
                    },
                    native: { id: 'HolidayPresentLikePublicHoliday' }
                });
                adapter.subscribeStates(id1 + '.HolidayPresentLikePublicHoliday');

                await adapter.setObjectNotExistsAsync(id1 + '.CurrentTimePeriod', {
                    type: 'state',
                    common: {
                        name: 'CurrentTimePeriod',
                        type: 'string',
                        role: 'history',
                        unit: '',
                        read: true,
                        write: false
                    },
                    native: { id: 'CurrentTimePeriod' }
                });
                adapter.log.debug('room ' + adapter.config.devices[rooms].room + ' with ' + parseInt(adapter.config.NumberOfPeriods, 10) + " periods");

                for (var period = 0; period < parseInt(adapter.config.NumberOfPeriods, 10); period++) {

                    let id = id1 + ".Periods." + period;

                    adapter.log.debug('add state ' + id + " max " + DefaultTargets.length);

                    await adapter.setObjectNotExistsAsync(id + '.time', {
                        type: 'state',
                        common: {
                            name: 'period until',
                            type: 'date',
                            role: 'profile',
                            unit: '',
                            read: true,
                            write: true
                        },
                        native: { id: id + '.time' }
                    });

                    //we want to be informed when this is changed by vis or others
                    adapter.subscribeStates(id + '.time');

                    const nextTime = await adapter.getStateAsync(id + '.time');
                    //set default only if nothing was set before
                    if (nextTime === null && period < DefaultTargets.length) {
                        //we set a default value
                        await adapter.setStateAsync(id + '.time', { ack: true, val: DefaultTargets[period][0] });
                    }

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

                    //we want to be informed when this is changed by vis or others
                    adapter.subscribeStates(id + '.Temperature');

                    const nextTemp = await adapter.getStateAsync(id + '.Temperature');
                    //set default only if nothing was set before
                    if (nextTemp === null && period < DefaultTargets.length) {
                        await adapter.setStateAsync(id + '.Temperature', { ack: true, val: DefaultTargets[period][1] });
                    }
                }
            }
        }
    }
    else {
        adapter.log.warn('not implemented yet, profile type is ' + parseInt(adapter.config.ProfileType, 10));
    }
}

//#######################################
//
// subscribe thermostate states to be informed when target or current is changed
function SubscribeStates(callback) {

    //if we need to handle actors, then subscribe on current and target temperature
    adapter.log.debug('#start subscribtion ');
    if (adapter.config.UseActors) {

        for (var rooms = 0; rooms < adapter.config.devices.length; rooms++) {

            adapter.log.debug('check ' + adapter.config.devices[rooms].room + " : " + adapter.config.devices[rooms].thermostat);

            if (adapter.config.devices[rooms].thermostat && adapter.config.devices[rooms].thermostat !== null) {

                //hm-rpc.0.IEQ0067581.2.SETPOINT
                //hm-rpc.0.IEQ0067581.1.TEMPERATURE

                //hm-rpc.0.JEQ00808862.SETPOINT hm-rpc.0.JEQ00808861.TEMPERATURE
                
                var state1 = adapter.config.PathThermostats + adapter.config.devices[rooms].thermostat + ThermostatTypeTab[adapter.config.devices[rooms].thermostatTypeID][2];
                var state2 = adapter.config.PathThermostats + adapter.config.devices[rooms].thermostat + ThermostatTypeTab[adapter.config.devices[rooms].thermostatTypeID][3];

                adapter.log.debug('subscribe ' + adapter.config.devices[rooms].thermostat + " " + state1 + " " + state2);

                adapter.subscribeForeignStates(state1);
                adapter.subscribeForeignStates(state2);
                
            }
        }
    }
    adapter.log.debug('#subscribtion finished');

    if (callback) callback();
}

//*******************************************************************
//
// handles state changes of subscribed states
async function HandleStateChange(id, state) {


    adapter.log.debug("### handle state change " + id + " " + JSON.stringify(state));

    let bHandled = false;

    if (state && state.ack !== true) {
        //first set ack flag
        await adapter.setStateAsync(id, { ack: true });

        if (HandleStateChangeGeneral(id, state)) {
            bHandled = true;
        }
    }
    if (HandleStateChangeActors(id, state)) {
        bHandled = true;
    }

    if (!bHandled) {
        adapter.log.debug("### not handled " + id + " " + JSON.stringify(state));
    }
    else {
        adapter.log.debug("### all handled ");
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
    }

    if (ids[7] === "time") {
        let values = state.val.split(':');

        let hour = 0;
        let minute = 0;
        let second = 0;

        if (values[0] && values[0] >= 0 && values[0] < 24) {
            hour = parseInt(values[0]);
            
        }
        if (values[1] && values[1] >= 0 && values[1] < 60) {
            minute = parseInt(values[1]);
            
        }
        if (values[2] && values[2] >= 0 && values[2] < 60) {
            second = parseInt(values[2]);
            
        }
        if (hour < 10) {
            hour = "0" + hour;
        }
        if (minute < 10) {
            minute = "0" + minute;
        }
        if (second < 10) {
            second = "0" + second;
        }
        let sTime = hour + ":" + minute + ":" + second;

        await adapter.setStateAsync(id, { ack: true, val: sTime });
    }

    if (ids[2] === "GuestsPresent") {
        //ßßß
    }
    if (ids[2] === "HeatingPeriodActive") {
         //ßßß
    }
    if (ids[2] === "HolidayPresent") {
         //ßßß
    }
    if (ids[2] === "PartyNow") {
         //ßßß
    }
    if (ids[2] === "Present") {
         //ßßß
    }
    if (ids[2] === "PublicHolidyToday") {
         //ßßß
    }
    if (ids[2] === "VacationAbsent") {
         //ßßß
    }

    
    if (ids[5] === "AbsentDecrease") {
         //ßßß
    }
    if (ids[5] === "GuestIncrease") {
         //ßßß
    }
    if (ids[5] === "HolidayPresentLikePublicHoliday") {
         //ßßß
    }
    if (ids[5] === "PartyDecrease") {
         //ßßß
    }
    if (ids[5] === "VacationAbsentDecrease") {
         //ßßß
    }


    if (ids[7] === "time" || ids[2] ==="CurrentProfile") {
        await CalculateNextTime();
        bRet = true;
    }

    if (ids[7] === "temperature") {
        bRet = true;
    }

    return bRet;
}

//*******************************************************************
//
// handles state changes of subscribed states
// * find the room
// * check if with actor handling; if so then check if target is different to current
async function HandleStateChangeActors(id, state) {

    let bRet = false;

    if (adapter.config.UseActors) {

        //first we need some information
        const HeatingPeriodActive = await adapter.getStateAsync("HeatingPeriodActive");

        if (HeatingPeriodActive) {

            var ids = id.split('.'); //

            const deviceID = findObjectIdByKey(adapter.config.devices, 'thermostat', ids[2]);
            if (deviceID > -1) {

                //target or current temperature change from Thermostat

                var check = "." + ids[3] + "." + ids[4];
                if (check === ThermostatTypeTab[adapter.config.devices[deviceID].thermostatTypeID][3]) { // got current temperature
                    //adapter.log.debug('room ' + adapter.config.devices[deviceID].room + " new current temp " + state.val);

                    var state1 = adapter.config.PathThermostats + adapter.config.devices[deviceID].thermostat + ThermostatTypeTab[adapter.config.devices[deviceID].thermostatTypeID][2];
                    const target = await adapter.getForeignStateAsync(state1);
                    await HandleActors(deviceID, parseFloat(state.val), parseFloat(target.val));

                }
                else if (check === ThermostatTypeTab[adapter.config.devices[deviceID].thermostatTypeID][2]) { // got target temperature
                    //adapter.log.debug('room ' + adapter.config.devices[deviceID].room + " new target temp " + state.val);
                    //this is manuell set

                    var state2 = adapter.config.PathThermostats + adapter.config.devices[deviceID].thermostat + ThermostatTypeTab[adapter.config.devices[deviceID].thermostatTypeID][3];
                    const current = await adapter.getForeignStateAsync(state2);
                    await HandleActors(deviceID, parseFloat(current.val), parseFloat(state.val));
                }
                else {
                    adapter.log.debug('room ' + adapter.config.devices[deviceID].room + " not found " + check + " " + ThermostatTypeTab[adapter.config.devices[deviceID].thermostatTypeID][3]);
                }
                bRet = true;
            }
        }
        else {
            adapter.log.warn('handling actors out of heating period not implemented yet'); 
        }
    }

    return bRet;

}

//*******************************************************************
//
//handles actors based on current and target temperature
//to do: better control; right now it's just on / off without hystheresis or similar
async function HandleActors(deviceID, current, target) {

    adapter.log.debug('handle actors ' + adapter.config.devices[deviceID].room  + " current " + current + " target " + target);

    //Temperatur größer als Zieltemp: dann Aktor aus; sonst an
    if (current > target) {
        //nur, wenn Aktor an ist
        if (adapter.config.devices[deviceID].actor1 && adapter.config.devices[deviceID].actor1!==null) {
            const state = adapter.config.PathActors + adapter.config.devices[deviceID].actor1 + ActorTypeTab[adapter.config.devices[deviceID].actor1TypeID][2];
            await adapter.setForeignStateAsync(state, false);
            adapter.log.debug('room ' + adapter.config.devices[deviceID].room + " actor1 off " + state);
        }
        if (adapter.config.devices[deviceID].actor2 && adapter.config.devices[deviceID].actor2 !== null) {
            const state = adapter.config.PathActors + adapter.config.devices[deviceID].actor2 + ActorTypeTab[adapter.config.devices[deviceID].actor2TypeID][2];
            await adapter.setForeignStateAsync(state, false);
            adapter.log.debug('room ' + adapter.config.devices[deviceID].room + " actor2 off " + state);
        }
    }
    else if (current < target) {
        if (adapter.config.devices[deviceID].actor1 && adapter.config.devices[deviceID].actor1 !== null) {
            const state = adapter.config.PathActors + adapter.config.devices[deviceID].actor1 + ActorTypeTab[adapter.config.devices[deviceID].actor1TypeID][2];
            await adapter.setForeignStateAsync(state, true);
            adapter.log.debug('room ' + adapter.config.devices[deviceID].room + " actor1 on " + state);
        }
        if (adapter.config.devices[deviceID].actor2 && adapter.config.devices[deviceID].actor2 !== null) {
            const state = adapter.config.PathActors + adapter.config.devices[deviceID].actor2 + ActorTypeTab[adapter.config.devices[deviceID].actor1TypeID][2];
            await adapter.setForeignStateAsync(state, true);
            adapter.log.debug('room ' + adapter.config.devices[deviceID].room + " actor2 on " + state);
        }
    }
}


//*******************************************************************
//
// find thermostats of room
// returns the object
function findThermostats4Rooms(room) {


    return null;

}

//*******************************************************************
//
// find actors of room
// returns the object
function findActors4Rooms(room) {


    return null;

}


//*******************************************************************
//
// find sensors of room
// returns the object
function findSensors4Rooms(room) {


    return null;

}

//*******************************************************************
//
// add a new room if not already exists
function addRoom(room) {


}

//*******************************************************************
//
// add a new thermostat of room if not already exists
function addThermostat(room, thermostat) {


}

//*******************************************************************
//
// add a new actor of room if not already exists
function addActor(room, actor) {


}

//*******************************************************************
//
// add a new sensor of room if not already exists
function addSensor(room, sensor) {


}

//*******************************************************************
//
// find a object in array by key and value
// returns the object
function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}

//*******************************************************************
//
// find a object in array by key and value
// returns index number
function findObjectIdByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return i;
        }
    }
    return -1;
}







//#######################################
// cron fucntions
function CronStop() {
    if (cronJobs.length > 0) {
        adapter.log.debug("delete " + cronJobs.length + " cron jobs");
        //cancel all cron jobs...
        var start = cronJobs.length - 1;
        for (var n = start; n >= 0; n--) {
            //adapter.log.debug("stop cron job " + n);
            cronJobs[n].stop();
        }
        cronJobs=[];
    }
}




let cronJobs = [];

function CronCreate(Hour, Minute) {
    const timezone = adapter.config.timezone || 'Europe/Berlin';

    //https://crontab-generator.org/
    const cronString = '0 ' + Minute + ' ' + Hour + ' * * * ';

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

    adapter.log.debug("cron jobs");
    for (var n = 0; n < cronJobs.length; n++) {

        adapter.log.debug('[INFO] ' + '      status = ' + cronJobs[n].running + ' next event: ' + timeConverter(cronJobs[n].nextDates()));

    }
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
        sRet = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec
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

    adapter.log.debug("start CalculateNextTime");

    CronStop();

    let timerList = [];

    adapter.log.debug("profile type " + parseInt(adapter.config.ProfileType, 10));

    if (parseInt(adapter.config.ProfileType, 10) === 1) {

        const currentProfile = await GetCurrentProfile();

        for (var rooms = 0; rooms < adapter.config.devices.length; rooms++) {
            for (var period = 0; period < adapter.config.NumberOfPeriods; period++) {
                const id = "Profiles." + currentProfile + "." + adapter.config.devices[rooms].room + ".Periods." + period + '.time';

                adapter.log.debug("check time for " + adapter.config.devices[rooms].room + " " + id);

                /*
                adapter.getState(id, function (err, states) {
                    if (err) {
                        adapter.log.error("error in  CalculateNextTime " + err);
                    } else {
                        adapter.log.debug("found time for  at " + JSON.stringify(states));
                    }
                });
                */

                const nextTime = await adapter.getStateAsync(id);
                adapter.log.debug("---found time for " + adapter.config.devices[rooms].room + " at " + JSON.stringify(nextTime) + " " + nextTime.val);

                let nextTimes = nextTime.val.split(':'); //here we get hour and minute

                //add to list if not already there
                let bFound = false;
                for (var i = 0; i < timerList.length; i++) {
                    if (timerList[i].hour === parseInt(nextTimes[0]) && timerList[i].minute === parseInt(nextTimes[1])) {
                        bFound = true;
                        adapter.log.debug("already in list " + JSON.stringify(nextTime));
                    }
                }
                if (!bFound) {
                    adapter.log.debug("push to list " + " = " + nextTimes);
                    timerList.push({
                        hour: parseInt(nextTimes[0]),
                        minute: parseInt(nextTimes[1])
                    });
                }

            }
        }
        

        //and now start all cron jobs
        for (var m = 0; m < timerList.length; m++) {
            CronCreate(timerList[m].hour, timerList[m].minute);
        }

        getCronStat();
    }
    else {
        adapter.log.warn('CalculateNextTime: not implemented yet, profile type is ' + adapter.config.ProfileType);
    }
}

async function GetCurrentProfile() {

    adapter.log.debug('get profile');

    const id = 'CurrentProfile';
    let currentProfile = await adapter.getStateAsync(id);
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
async function CheckTemperatureChange(CheckOurOnly=false) {

    adapter.log.debug('CheckTemperatureChange is called');

    const now = new Date();
    adapter.setStateAsync('LastProgramRun', { ack: true, val: now.toLocaleString() });


    //first we need some information
    const HeatingPeriodActive = await adapter.getStateAsync("HeatingPeriodActive");

    if (HeatingPeriodActive) {

        const GuestsPresent = await adapter.getStateAsync("GuestsPresent");

        const HolidayPresent = await adapter.getStateAsync("HolidayPresent");
        const PartyNow = await adapter.getStateAsync("PartyNow");
        const Present = await adapter.getStateAsync("Present");
        const PublicHolidyToday = await adapter.getStateAsync("PublicHolidyToday");
        const VacationAbsent = await adapter.getStateAsync("VacationAbsent");

        adapter.log.debug("profile type " + adapter.config.ProfileType);

        if (parseInt(adapter.config.ProfileType, 10) === 1) {

            const currentProfile = await GetCurrentProfile();

            for (var rooms = 0; rooms < adapter.config.devices.length; rooms++) {

                adapter.log.debug("check room " + adapter.config.devices[rooms].room );

                //and we need some information per room
                let AbsentDecrease = 0;
                if (!Present) {
                    AbsentDecrease = await adapter.getStateAsync("AbsentDecrease");
                }
                let GuestIncrease = 0;
                if (GuestsPresent) {
                    GuestIncrease = await adapter.getStateAsync("GuestIncrease");
                }
                let PartyDecrease = 0;
                if (PartyNow) {
                    PartyDecrease = await adapter.getStateAsync("PartyDecrease");
                }
                let VacationAbsentDecrease = 0;
                if (VacationAbsent) {
                    VacationAbsentDecrease = await adapter.getStateAsync("VacationAbsentDecrease");
                }

                //in dem Modus (Mo - So) nicht notwendig
                //const HolidayPresentLikePublicHoliday = await adapter.getStateAsync("HolidayPresentLikePublicHoliday");

                adapter.log.debug("number of periods  " + adapter.config.NumberOfPeriods);

                for (var period = 0; period < parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                    const id = "Profiles." + currentProfile + "." + adapter.config.devices[rooms].room + ".Periods." + period + '.time';

                    adapter.log.debug("check time for " + adapter.config.devices[rooms].room + " " + id);

                    const nextTime = await adapter.getStateAsync(id);
                    //adapter.log.debug("##found time for " + adapter.config.devices[rooms].room + " at " + JSON.stringify(nextTime) + " " + nextTime.val);

                    let nextTimes = nextTime.val.split(':'); //here we get hour and minute

                    //adapter.log.debug("# " + JSON.stringify(nextTimes) + " " + now.getHours() + " " + now.getMinutes());


                    //hier Zeitraum prüfen, dann kann das ganze auch bei Änderung aufgerufen werden
                    //to do
                    if ((CheckOurOnly === true && now.getHours() === parseInt(nextTimes[0]))
                        || (now.getHours() === parseInt(nextTimes[0]) && now.getMinutes() === parseInt(nextTimes[1]))) {

                        adapter.log.debug("###111" );

                        if (adapter.config.devices[rooms].thermostat && adapter.config.devices[rooms].thermostat !== null) {

                            //adapter.log.debug("*1 ");
                            const id2 = "Profiles." + currentProfile + "." + adapter.config.devices[rooms].room + ".Periods." + period + '.Temperature';
                            //adapter.log.debug("*2 " + id2);
                            /*
                            heatingcontrol.0.Profiles.0.Wohnzimmer.Periods.0.Temperature
                                             Profiles.0.Wohnzimmer.Periods.1.Temperature
                            heatingcontrol.0.Profiles.0.Wohnzimmer.Periods.1.Temperature
                            */
                            const nextTemperature = await adapter.getStateAsync(id2);
                            //adapter.log.debug("*3 " + adapter.config.devices[rooms].room + " " + adapter.config.devices[rooms].thermostat + " TypeID " + adapter.config.devices[rooms].thermostatTypeID);

                            //oder alternativ priorisieren???
                            let nextSetTemperature = nextTemperature.val - AbsentDecrease + GuestIncrease - PartyDecrease - VacationAbsentDecrease;

                            //adapter.log.debug("*3 " + adapter.config.PathThermostats + " " + adapter.config.devices[rooms].thermostat + " " + ThermostatTypeTab[adapter.config.devices[rooms].thermostatTypeID][2]);
                            var state = 20;
                            if (adapter.config.devices[rooms].thermostatTypeID >= 0 && adapter.config.devices[rooms].thermostatTypeID <= MaxHomematicThermostatType) {
                                //Homematic
                                state = adapter.config.PathThermostats + adapter.config.devices[rooms].thermostat + ThermostatTypeTab[adapter.config.devices[rooms].thermostatTypeID][2];
                            }
                            else if (adapter.config.devices[rooms].thermostatTypeID >= MinMaxcubeThermostatType && adapter.config.devices[rooms].thermostatTypeID <= MaxMaxcubeThermostatType) {
                                //max!Cube
                                state = adapter.config.PathThermostats + "devices." + adapter.config.devices[rooms].thermostat + ThermostatTypeTab[adapter.config.devices[rooms].thermostatTypeID][2];
                            }
                            else if (adapter.config.devices[rooms].thermostatTypeID >= MinTadoThermostatType && adapter.config.devices[rooms].thermostatTypeID <= MaxTadoThermostatType) {
                                //tado
                                adapter.log.warn("tado not implemented yet 111");
                            }
                            else {
                                adapter.log.warn("ThermostatType not implemented yet");
                            }
                            //adapter.log.debug("*4 " + state);
                            if (state !== 20) {
                                await adapter.setForeignStateAsync(state, nextSetTemperature);
                            }

                            adapter.log.debug('room ' + adapter.config.devices[rooms].room + " Thermostate " + state + " set to " + nextSetTemperature);

                            const timePeriod = "Period " + period + " : " + nextTime.val;
                            const id3 = "Profiles." + currentProfile + "." + adapter.config.devices[rooms].room + ".CurrentTimePeriod";
                            await adapter.setStateAsync(id3, { ack: true, val: timePeriod });
                        }
                    }
                }
            }
        }
        else {
            adapter.log.warn("profile type != 1 not implemented yet");
        }
    }
    else {
        adapter.log.debug("nothing to do: no heating period"); 
    }

    await HandleActorsGeneral(HeatingPeriodActive);

    getCronStat();
}


async function HandleActorsGeneral(HeatingPeriodActive) {
    if (adapter.config.UseActors) {

        var room;
        //if no heating period and acturs should be set to on or off
        if (!HeatingPeriodActive && adapter.config.UseActorsIfNotHeating > 1) {

            let target = adapter.config.UseActorsIfNotHeating === 2 ? false : true;

            for (room = 0; room < adapter.config.devices.length; room++) {

                if (adapter.config.devices[room].actor1 && adapter.config.devices[room].actor1 !== null) {
                    const state = adapter.config.PathActors + adapter.config.devices[room].actor1 + ActorTypeTab[adapter.config.devices[room].actor1TypeID][2];
                    await adapter.setForeignStateAsync(state, target);
                    adapter.log.debug('room ' + adapter.config.devices[room].room + " actor1 " + target + " " + state);
                }
                if (adapter.config.devices[room].actor2 && adapter.config.devices[room].actor2 !== null) {
                    const state = adapter.config.PathActors + adapter.config.devices[room].actor2 + ActorTypeTab[adapter.config.devices[room].actor2TypeID][2];
                    await adapter.setForeignStateAsync(state, target);
                    adapter.log.debug('room ' + adapter.config.devices[room].room + " actor2 " + target + " " + state);
                }
            }
        }


        //if we are in heating period but room has no thermostat
        if (HeatingPeriodActive && adapter.config.UseActorsIfNoThermostat > 1) {

            let target = adapter.config.UseActorsIfNoThermostat === 2 ? false : true;

            for (room = 0; room < adapter.config.devices.length; room++) {

                if (adapter.config.devices[room].thermostat === null) {
                    if (adapter.config.devices[room].actor1 && adapter.config.devices[room].actor1 !== null) {
                        const state = adapter.config.PathActors + adapter.config.devices[room].actor1 + ActorTypeTab[adapter.config.devices[room].actor1TypeID][2];
                        await adapter.setForeignStateAsync(state, target);
                        adapter.log.debug('room ' + adapter.config.devices[room].room + " actor1 " + target + " " + state);
                    }
                    if (adapter.config.devices[room].actor2 && adapter.config.devices[room].actor2 !== null) {
                        const state = adapter.config.PathActors + adapter.config.devices[room].actor2 + ActorTypeTab[adapter.config.devices[room].actor2TypeID][2];
                        await adapter.setForeignStateAsync(state, target);
                        adapter.log.debug('room ' + adapter.config.devices[room].room + " actor2 " + target + " " + state);
                    }
                }
            }
        }
    }
}


// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
} 



