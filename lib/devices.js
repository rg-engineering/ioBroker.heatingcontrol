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

const WindowOpenTimerId = [];
const WindowCloseTimerId = [];
const ActorOffTimerId = [];
const ActorOnTimerId = [];

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
const MaxHomematicSensorType = 2;

module.exports = {

};