"use strict";

// Die ThermostatTypeTab definiert die Thermostat Typen.
// used for known hardware, all others can be set manually
const ThermostatTypeTab = [];
//Homematic
ThermostatTypeTab[0] = ["HM-TC-IT-WM-W-EU", "Wandthermostat (neu)", ".2.SET_TEMPERATURE", ".1.TEMPERATURE", "2.CONTROL_MODE"];
ThermostatTypeTab[1] = ["HM-CC-TC", "Wandthermostat (alt)", ".2.SETPOINT", ".1.TEMPERATURE", false];
ThermostatTypeTab[2] = ["HM-CC-RT-DN", "Heizkoerperthermostat(neu)", ".4.SET_TEMPERATURE", ".4.ACTUAL_TEMPERATURE", "4.CONTROL_MODE"];
ThermostatTypeTab[3] = ["HMIP-eTRV", "Heizkoerperthermostat(HMIP)", ".1.SET_POINT_TEMPERATURE", ".1.ACTUAL_TEMPERATURE", "1.CONTROL_MODE"];
ThermostatTypeTab[4] = ["HMIP-WTH", "Wandthermostat(HMIP)", ".1.SET_POINT_TEMPERATURE", ".1.ACTUAL_TEMPERATURE", "1.CONTROL_MODE"];
ThermostatTypeTab[5] = ["HMIP-WTH-2", "Wandthermostat(HMIP)", ".1.SET_POINT_TEMPERATURE", ".1.ACTUAL_TEMPERATURE", "1.CONTROL_MODE"];
ThermostatTypeTab[6] = ["HMIP-STH", "Wandthermostat(HMIP)", ".1.SET_POINT_TEMPERATURE", ".1.ACTUAL_TEMPERATURE", "1.CONTROL_MODE"];
ThermostatTypeTab[7] = ["HMIP-STHD", "Wandthermostat(HMIP)", ".1.SET_POINT_TEMPERATURE", ".1.ACTUAL_TEMPERATURE", "1.CONTROL_MODE"];
ThermostatTypeTab[8] = ["HMIP-eTRV-2", "Heizkoerperthermostat(HMIP)", ".1.SET_POINT_TEMPERATURE", ".1.ACTUAL_TEMPERATURE", "1.CONTROL_MODE"];
ThermostatTypeTab[9] = ["HMIP-eTRV-B", "Heizkoerperthermostat(HMIP)", ".1.SET_POINT_TEMPERATURE", ".1.ACTUAL_TEMPERATURE", "1.SET_POINT_MODE"];
const MaxHomematicThermostatType = 9;
//MaxCube
//const MinMaxcubeThermostatType = 10;
ThermostatTypeTab[10] = ["max! Thermostat", "Thermostat", ".setpoint", ".temp", ".mode"];
/*
MAX! Heizkörperthermostat basic
MAX! Heizkörperthermostat
MAX! Heizkörperthermostat +
MAX! Wandthermostat +
*/
//const MaxMaxcubeThermostatType = 10;

//tado with Homebridge accessories manager
//const MinTadoThermostatType = 20;
ThermostatTypeTab[20] = ["tado Thermostat", "Thermostat", ".Target-Temperature", ".Current-Temperature", ".mode"];
//id ist ham.0.RaumName.ThermostatName.
//const MaxTadoThermostatType = 20;


const ActorTypeTab = [];
const MinHomematicActorType = 0;
ActorTypeTab[0] = ["HM-LC-Sw4-PCB", "Funk-Schaltaktor 4-fach, Platine", ".STATE"];
ActorTypeTab[1] = ["HM-LC-Sw4-DR", "Funk-Schaltaktor 4-fach, Hutschienenmontage", ".STATE"];
ActorTypeTab[2] = ["HM-LC-Sw4-SM", "Funk-Schaltaktor 4-fach, Aufputzmontage", ".STATE"];
const MaxHomematicActorType = 2;


const SensorTypeTab = [];
const MinHomematicSensorType = 0;
SensorTypeTab[0] = ["HM-Sec-SC-2", "Funk-Tür-/Fensterkontakt", ".STATE"];
SensorTypeTab[1] = ["HM-Sec-SCo", "Funk-Tür-/Fensterkontakt, optisch", ".STATE"];
SensorTypeTab[2] = ["HM-Sec-RHS", "Funk-Fenster-Drehgriffkontakt", ".STATE"];
SensorTypeTab[3] = ["HM-Sec-SC", "Funk-Tür-/Fensterkontakt", ".STATE"];

const MaxHomematicSensorType = 3;


const TempSensorTypeTab = [];
const MinHomematicTempSensorType = 0;
TempSensorTypeTab[0] = ["HM-WDS30-TO", "Funk-Temperatursensor", ".1.TEMPERATURE"];
TempSensorTypeTab[1] = ["HM-WDS30-OT2-SM-2", "Differenz-Temperatur-Sensor", ".1.TEMPERATURE"];
TempSensorTypeTab[2] = ["HM-WDS10-TH-O", "Funk-Temperatur-/Luftfeuchtesensor", ".1.TEMPERATURE"];
TempSensorTypeTab[3] = ["HM-WDS40-TH-I-2", "Funk-Innensensor ITH", ".1.TEMPERATURE"];

const MaxHomematicTempSensorType = 3;


async function Check4Thermostat(adapter, deviceObj) {

    let found = false;
    const device = {};
    let supportedRT = -1;
    for (let x1 = 0; x1 <= MaxHomematicThermostatType; x1++) {
        if (deviceObj.native != null) {
            adapter.log.debug("check " + deviceObj.native.PARENT_TYPE + " === " + ThermostatTypeTab[x1][0]);
            if (deviceObj.native.PARENT_TYPE === ThermostatTypeTab[x1][0]) {

                found = true;
                supportedRT = x1;
                adapter.log.debug("Thermostat found " + JSON.stringify(deviceObj));

            }
        }
        else {
            adapter.log.error("wrong device found " + JSON.stringify(deviceObj));
            adapter.log.info("please configure manually! ");
        }
    }

    if (found) {

        const sName = deviceObj.common.name.split(":")[0];
        const oOID = deviceObj._id.split(".");
        const sOID = oOID[0] + "." + oOID[1] + "." + oOID[2];

        device.Name = sName;
        device.OID_Target= sOID + ThermostatTypeTab[supportedRT][2];
        device.OID_Current= sOID + ThermostatTypeTab[supportedRT][3];
    }

    const returnObject = {
        found: found,
        device: device
    };

    return returnObject;

}

async function Check4Actor(adapter, deviceObj) {

    let found = false;
    const device = {};
    let supportedActor = -1;
    for (let x2 = MinHomematicActorType; x2 <= MaxHomematicActorType; x2++) {
        adapter.log.debug("check " + deviceObj.native.PARENT_TYPE + " === " + ActorTypeTab[x2][0]);
        if (deviceObj.native.PARENT_TYPE === ActorTypeTab[x2][0]) {

            found = true;
            supportedActor = x2;
            adapter.log.debug("Actor found " + JSON.stringify(deviceObj));

        }
    }

    if (found) {
        const sName = deviceObj.common.name;
        device.Name = sName;
        device.OID = deviceObj._id + ActorTypeTab[supportedActor][2];
    }

    const returnObject = {
        found: found,
        device: device
    };

    return returnObject;

}

async function Check4Sensor(adapter, deviceObj) {

    let found = false;
    const device = {};
    let supportedSensor = -1;
    for (let x3 = MinHomematicSensorType; x3 <= MaxHomematicSensorType; x3++) {
        adapter.log.debug("check " + deviceObj.native.PARENT_TYPE + " === " + SensorTypeTab[x3][0]);
        if (deviceObj.native.PARENT_TYPE === SensorTypeTab[x3][0]) {

            found = true;
            supportedSensor = x3;
            adapter.log.debug("Sensor found " + JSON.stringify(deviceObj));

        }
    }

    if (found) {
        const sName = deviceObj.common.name;
        device.Name = sName;
        device.OID = deviceObj._id + SensorTypeTab[supportedSensor][2];
    }

    const returnObject = {
        found: found,
        device: device
    };

    return returnObject;

}

async function Check4TempSensor(adapter, deviceObj) {

    let found = false;
    const device = {};
    let supportedSensor = -1;
    for (let x3 = MinHomematicTempSensorType; x3 <= MaxHomematicTempSensorType; x3++) {
        adapter.log.debug("check " + deviceObj.native.PARENT_TYPE + " === " + TempSensorTypeTab[x3][0]);
        if (deviceObj.native.PARENT_TYPE === TempSensorTypeTab[x3][0]) {

            found = true;
            supportedSensor = x3;
            adapter.log.debug("TempSensor found " + JSON.stringify(deviceObj));

        }
    }

    if (found) {
        const sName = deviceObj.common.name;
        device.Name = sName;
        device.OID = deviceObj._id + TempSensorTypeTab[supportedSensor][2];
    }

    const returnObject = {
        found: found,
        device: device
    };

    return returnObject;

}


module.exports = {
    Check4Thermostat,
    Check4Actor,
    Check4Sensor,
    Check4TempSensor
    
};