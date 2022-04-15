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

function StartActors(adapter) {
    parentAdapter = adapter;
}

function setActorState(actor, value) {

    parentAdapter.setForeignState(actor.OID, value);

    if (actor.useExtHandling) {
        // maximale Default-Zeit für Versuche [ms] (kann mit Parameter überschrieben werden)

        let _HMreptime = 10000;      //10000

        // Default-Verzögerung zwischen den Versuchen [ms] (kann mit Parameter überschrieben werden)

        let _HMackwait = 2000;       //2000

        if (actor.reptime !== undefined && typeof (actor.reptime) == 'number') {

            _HMreptime = actor.reptime;
        }
        if (actor.ackwait !== undefined && typeof (actor.ackwait) == 'number') {

            _HMackwait = actor.ackwait;
        }

        actor.SetCnt = 0;

        actor.SetTimerId = setInterval(function () {

            actor.SetCnt++;

            parentAdapter.getForeignState(actor.OID, function (err, state) {
                if (state.val == value && state.ack === true) {

                    parentAdapter.log.debug('setHMStateSec ' + actor.OID + ' Success.');

                    clearInterval(actor.SetTimerId);

                } else if (actor.SetCnt * _HMackwait > _HMreptime) {

                    parentAdapter.log.error('setHMStateSec ' + actor.OID + ' no success after trial ' + actor.SetCnt + " " + JSON.stringify(state));

                    clearInterval(actor.SetTimerId);

                } else {

                    parentAdapter.log.warn('setHMStateSec ' + actor.OID + ' trial ' + actor.SetCnt);

                    setTimeout(function () {
                        parentAdapter.setForeignState(actor.OID, value);
                    }, Math.floor(Math.random() * 10) * _HMackwait / 100);
                }
            });

        }, _HMackwait);
    }

    return;

}

module.exports = {
    StartActors,
    setActorState
};