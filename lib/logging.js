"use strict";


let parentAdapter;


//preparation for telegram, pushbullet, email ....

function StartExtendedLog(adapter) {
    parentAdapter = adapter;
}

function ActorLog(actor, target) {
    if (parentAdapter.config.extendedInfoLogActor) {
        parentAdapter.log.debug("actor " + actor.OID + " to " + target);
    }
    else {
        parentAdapter.log.debug("actor " + actor.OID + " to " + target);
    }
}

function ThermostatLog(roomName, thermostat, target){

    if (parentAdapter.config.extendedInfoLogTemperature) {
        parentAdapter.log.info(roomName + " set thermostat target " + thermostat.OID_Target + " to " + target);
    }
    else {
        parentAdapter.log.debug(roomName + " set thermostat target " + thermostat.OID_Target + " to " + target);
    }
}

function WindowLog(roomName, state) {

    if (parentAdapter.config.extendedInfoLogWindow) {
        parentAdapter.log.info(roomName + "Change Status WindowOpen in " + " to " + state);
    }
    else {
        parentAdapter.log.debug(roomName + "Change Status WindowOpen in " + " to " + state);
    }
}

module.exports = {
    StartExtendedLog,
    ActorLog,
    ThermostatLog,
    WindowLog
};