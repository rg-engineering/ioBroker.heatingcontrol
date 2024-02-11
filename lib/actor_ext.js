/**

siehe https://forum.iobroker.net/topic/53725/gel%C3%B6st-gelegentlich-fehler-bei-homematic/6

Danke grrfield

 * Setzt sicher einen State und überprüft die Ausführung.

 * Überprüft nach _HMAckWait (2000 ms), ob der Befehl erfolgreich war. 

 * Bei Mißerfolg wird der Befehl mit setState() jeweils nach _HMAckWait und  

 * einem zufälligen Anteil so oft wiederholt, bis er ausgeführt wurde

 * oder bis die Zeit HM_reptime (10000 ms) abgelaufen ist.

 */




"use strict";

let parentAdapter;
let ErrorLog;

function StartActors(adapter, errorlog) {
    parentAdapter = adapter;
    ErrorLog = errorlog;
}

async function setActorState(actor, value) {

    try {

        let OID = "";
        if (actor.OID != null &&  actor.OID !== undefined) {
            OID = actor.OID;
        }
        else if (actor.OID_Target != null &&  actor.OID_Target !== undefined) {
            OID = actor.OID_Target;
        }
        parentAdapter.log.debug("setHMStateSec: set " + actor.name + " " + OID + " to " + value);

        await parentAdapter.setForeignStateAsync(OID, { ack: false, val: value });

        if (actor.useExtHandling) {
            // maximale Default-Zeit für Versuche [ms] (kann mit Parameter überschrieben werden)
            let _HMreptime = 10000;      //10000

            // Default-Verzögerung zwischen den Versuchen [ms] (kann mit Parameter überschrieben werden)
            let _HMackwait = 2000;       //2000

            if (actor.reptime !== undefined && typeof (actor.reptime) == "number") {

                _HMreptime = actor.reptime;
            }
            if (actor.ackwait !== undefined && typeof (actor.ackwait) == "number") {

                _HMackwait = actor.ackwait;
            }

            actor.SetCnt = 0;
            if (actor.ExtSetTimerId == null) {
                actor.ExtSetTimerId = setInterval(function () {

                    actor.SetCnt++;

                    parentAdapter.getForeignState(OID, function (err, state) {

                        //fix exception based on sentry logging
                        if (err) {
                            parentAdapter.log.error("setActorState error " + actor.name + " " + err);
                        }
                        else {

                            if (state.val == value && state.ack === true) {

                                parentAdapter.log.debug("setHMStateSec " + OID + " Success.");

                                clearInterval(actor.ExtSetTimerId);
                                actor.ExtSetTimerId = null;

                            } else if (actor.SetCnt * _HMackwait > _HMreptime) {

                                let reason = "unknown reason ";

                                if (state.val != value) {
                                    reason = " value not set: should " + value + " but is " + state.val;
                                }
                                else if (state.ack !== true) {
                                    reason = " ack not set!";
                                }

                                //HeatingControl: extended Actor Handling: zigbee.0.54ef4410007011e9.local_temperature zigbee.0.54ef4410007011e9.occupied_heating_setpoint no success after trial 6 because ack not set! {"val":18,"ack":false,"ts":1707579651073,"q":0,"from":"system.adapter.heatingcontrol.0","user":"system.user.admin","lc":1707579640948}


                                //extended Actor Handling: Aktor1_2 - javascript.0.Aktor1_2 no success after trial 6 because ack not set! { "val": true, "ack": false, "ts": 1707645876201, "q": 0, "from": "system.adapter.heatingcontrol.0", "user": "system.user.admin", "lc": 1707645866167 }



                                const msg = "extended Actor Handling: " + actor.name + " - " + OID + " no success after trial " + actor.SetCnt + " because " + reason + " " + JSON.stringify(state);

                                parentAdapter.log.error(msg);

                                ErrorLog(msg);

                                clearInterval(actor.ExtSetTimerId);
                                actor.ExtSetTimerId = null;

                            } else {

                                parentAdapter.log.warn("extended Actor Handling: " + actor.name + " " + OID + " trial " + actor.SetCnt);

                                setTimeout(function () {
                                    parentAdapter.setForeignState(OID, { ack: false, val: value });
                                }, Math.floor(Math.random() * 10) * _HMackwait / 100);
                            }
                        }
                    });

                }, _HMackwait);
            }
            else {
                parentAdapter.log.warn("interval time already running " + actor.name);
            }
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in setActorState [" + e + "] " + JSON.stringify(actor));
    }

    return;
}

module.exports = {
    StartActors,
    setActorState
};