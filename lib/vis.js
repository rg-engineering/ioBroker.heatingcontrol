/* eslint-disable prefer-template */
"use strict";


let parentAdapter;

//=========================================================================================
// support functions for vis
            
let TempDecreaseMode;
let ProfileType;
let UsedRooms;
let OldChoosenRoom = "none";
let ChoosenRoom = "";
let RefreshingVis = false;

// used for absolut increase/decrease temperatures
let AbsTempValueListValue = "0;1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21;22;23;24;25";
let AbsTempValueListText = "inaktiv;1°C;2°C;3°C;4°C;5°C;6°C;7°C;8°C;9°C;10°C;11°C;12°C;13°C;14°C;15°C;16°C;17°C;18°C;19°C;20°C;21°C;22°C;23°C;24°C;25°C";

// used for relative increase/decrease temperatures
let RelTempValueListValue = "0;1;2;3;4;5;6;7;8;9;10";
let RelTempDivValueListText = "inaktiv;-1°C;-2°C;-3°C;-4°C;-5°C;-6°C;-7°C;-8°C;-9°C;-10°C";
let RelTempAddValueListText = "inaktiv;+1°C;+2°C;+3°C;+4°C;+5°C;+6°C;+7°C;+8°C;+9°C;+10°C";

//used for override temperature
let OverrideTempValueListValue = "0;20;21;22;23;24;25;26;27;28;29;30";
let OverrideTempValueListText = "inaktiv;20°C;21°C;22°C;23°C;24°C;25°C;26°C;27°C;28°C;29°C;30°C";

//used for profil temperatures, configured from admin
let TempValueListValue = "12;13;14;15;16;17;18;19;20;21;22;23;24;25;26;27;28;29;30";
let TempValueListText = "12°C;13°C;14°C;15°C;16°C;17°C;18°C;19°C;20°C;21°C;22°C;23°C;24°C;25°C;26°C;27°C;28°C;29°C;30°C";


let CurrentProfile = -1;

function SetCurrentProfile(profile) {
    CurrentProfile = profile;
}

async function StartVis(parent) {

    parentAdapter = parent;

    //pittini vis
    if (parentAdapter.config.UseVisFromPittini) {

        await SetData();

        await InitRoom(); //Gewählten Raum einlesen, bei Erststart default setzen
        //ValueList Vorgabewerte anhand Profileinstellungen erzeugen
        await SetProfileValueList();//ValueList Vorgaben für Profile erzeugen
        await SetTempDecreaseModeValueLists(); //ValueList Vorgaben (Werte und Texte) für Decreasemodes erzeugen
        await SetTrigger();    //Trigger erzeugen
        await SetVis(); // Vis initialisieren
    }
}

async function SetData() {

    try {
        

        let temp = await parentAdapter.getStateAsync("info.TemperatureDecreaseMode");
        TempDecreaseMode = temp.val;
        parentAdapter.log.debug("TempDecreaseMode " + JSON.stringify(TempDecreaseMode));

        temp = await parentAdapter.getStateAsync("info.ProfileType");
        ProfileType = temp.val;
        parentAdapter.log.debug("ProfileType " + JSON.stringify(ProfileType));

        temp = await parentAdapter.getStateAsync("info.UsedRooms");
        UsedRooms = temp.val;
        parentAdapter.log.debug("UsedRooms " + JSON.stringify(UsedRooms));
    } catch (e) {
        parentAdapter.log.error("exception in SetData [" + e + "]");
    }

}



async function InitRoom() { //Gewählten Raum einlesen, bei Erststart default= erster in der Raumliste setzen

    parentAdapter.log.debug("InitRoom called ");

    try {
        let temp = await parentAdapter.getStateAsync("vis.ChoosenRoom");

        if (temp != null &&  temp !== undefined) {
            ChoosenRoom = temp.val;
        }

        if (ChoosenRoom == "") { //Wenn bei erstem Start noch kein Raum vorhanden (nach anlegen der States), verwende ersten Raum aus der Raumliste

            temp = await parentAdapter.getStateAsync("info.UsedRooms");
            if (temp != null &&  temp !== undefined) {
                const dummy = temp.val;
                if (dummy.includes(";")) { //Wenn ein semikolon in der Raumliste vorhanden ist, sind auch mehrere Räume vorhanden, davon nachfolgend den ersten extrahieren
                    ChoosenRoom = dummy.substring(0, dummy.indexOf(";")); //In Raumliste nach dem Semikolon suchen und alles links davon extrahieren
                    parentAdapter.log.debug("ChoosenRoom=" + ChoosenRoom);
                } else {
                    ChoosenRoom = dummy; //Wenn nur ein Raum in Raumliste, diesen verwenden
                }
                await parentAdapter.setStateAsync("vis.ChoosenRoom", { ack: true, val: ChoosenRoom }); //Bei Erststart ChoosenRoom auf default= erster in der Raumliste setzen
            } else {
                parentAdapter.log.error("InitRoom: could not read info.UsedRooms");
            }
        }

        await setIsActive(ChoosenRoom);

    } catch (e) {
        parentAdapter.log.error("exception in InitRoom [" + e + "]");
    }

    parentAdapter.log.debug("InitRoom done, choosen room is " + ChoosenRoom);
}



async function setIsActive(room) {
    if (room == ChoosenRoom) {
        //heatingcontrol.0.Rooms.Küche.isActive
        const isActive = await parentAdapter.getStateAsync("Rooms." + ChoosenRoom + ".isActive");
        await parentAdapter.setStateAsync("vis.isActive", { ack: true, val: isActive.val });
    }
}

async function changeIsActive(value) {

    const isActive = await parentAdapter.getStateAsync("Rooms." + ChoosenRoom + ".isActive");

    if (isActive.val != value) {
        await parentAdapter.setStateAsync("Rooms." + ChoosenRoom + ".isActive", { ack: false, val: value });
    }
}


async function SetProfileValueList() { //Einträge für Vis Profil Valuelist erstellen
    parentAdapter.log.debug("SetProfileValueList called " + parseInt(parentAdapter.config.NumberOfProfiles, 10));

    try {
        let ProfileValueListValue = "";
        let ProfileValueListText = "";

        for (let x = 1; x <= parseInt(parentAdapter.config.NumberOfProfiles, 10); x++) {
            
            ProfileValueListValue += ";" + x;

            //heatingcontrol.0.Profiles.1.ProfileName

            const profileName = await parentAdapter.getStateAsync("Profiles." + x + ".ProfileName");

            //parentAdapter.log.debug("got " + JSON.stringify(profileName) + " " + typeof profileName);

            if (profileName != null &&  profileName !== undefined) {
                ProfileValueListText += ";" + profileName.val ;
            } else {
                ProfileValueListText += ";" + x;
            }
        }

        ProfileValueListValue = ProfileValueListValue.slice(1);
        ProfileValueListText = ProfileValueListText.slice(1);

        parentAdapter.log.debug("SetProfileValueList " + ProfileValueListValue + " " + ProfileValueListText);

        await parentAdapter.setStateAsync("vis.ProfileValueListValue", { ack: true, val: ProfileValueListValue });
        await parentAdapter.setStateAsync("vis.ProfileValueListText", { ack: true, val: ProfileValueListText });
    } catch (e) {
        parentAdapter.log.error("exception in SetProfileValueList [" + e + "]");
    }
    parentAdapter.log.debug("SetProfileValueList done");
}


async function SetTempDecreaseModeValueLists() { //Setzt die Vorgabewerte der Valuelists je nach gewähltem DecreaseMode
    parentAdapter.log.debug("SetTempDecreaseModeValueLists called ");

    try {

        switch (TempDecreaseMode) {
            case "relative":
                if (parseInt(parentAdapter.config.VisMinDecRelTemp) > 0 && parseInt(parentAdapter.config.VisMaxDecRelTemp) > 0) {
                    RelTempValueListValue = "0;";
                    RelTempAddValueListText = "inaktiv;";
                    RelTempDivValueListText = "inaktiv;";
                    let tempValueMin = Number(parentAdapter.config.VisMinDecRelTemp);
                    const tempValueMax = Number(parentAdapter.config.VisMaxDecRelTemp);
                    if (tempValueMin >= tempValueMax) {
                        parentAdapter.log.warn("profil parameter vis limits: minimum (" + tempValueMin + "°C) has to be lower then maximum (" + tempValueMax + "°C)");
                    }
                    while (tempValueMin <= tempValueMax) {
                        RelTempValueListValue += tempValueMin + ";";
                        RelTempAddValueListText += "+" + tempValueMin + "°C;";
                        RelTempDivValueListText += "-" + tempValueMin + "°C;";
                        tempValueMin += Number(parentAdapter.config.VisStepWidthDecRelTemp);
                    }
                }
                await parentAdapter.setStateAsync("vis.TempValueListValue", { ack: true, val: RelTempValueListValue });
                await parentAdapter.setStateAsync("vis.TempAddValueListText", { ack: true, val: RelTempAddValueListText });
                await parentAdapter.setStateAsync("vis.TempDivValueListText", { ack: true, val: RelTempDivValueListText });
                break;
            case "absolute":
                if (parseInt(parentAdapter.config.VisMinDecAbsTemp) > 0 && parseInt(parentAdapter.config.VisMaxDecAbsTemp) > 0) {
                    AbsTempValueListValue = "0;";
                    AbsTempValueListText = "inaktiv;";
                    let tempValueMin = Number(parentAdapter.config.VisMinDecAbsTemp);
                    const tempValueMax = Number(parentAdapter.config.VisMaxDecAbsTemp);

                    if (tempValueMin < 4.5) {
                        parentAdapter.log.warn("profil parameter vis limits: for homematic devices minimum value is 4.5°C, current is " + tempValueMin + "°C, please change settings in admin"  );
                    }
                    if (tempValueMin >= tempValueMax) {
                        parentAdapter.log.warn("profil parameter vis limits: minimum (" + tempValueMin + "°C) has to be lower then maximum (" + tempValueMax + "°C)");
                    }
                    while (tempValueMin <= tempValueMax) {
                        AbsTempValueListValue += tempValueMin + ";";
                        AbsTempValueListText += tempValueMin + "°C;";
                        tempValueMin += Number(parentAdapter.config.VisStepWidthDecAbsTemp);
                    }
                }
                await parentAdapter.setStateAsync("vis.TempValueListValue", { ack: true, val: AbsTempValueListValue });
                await parentAdapter.setStateAsync("vis.TempAddValueListText", { ack: true, val: AbsTempValueListText });
                await parentAdapter.setStateAsync("vis.TempDivValueListText", { ack: true, val: AbsTempValueListText });
                break;
        }

        if (parseInt(parentAdapter.config.VisMinOverrideTemp) > 0 && parseInt(parentAdapter.config.VisMaxOverrideTemp) > 0) {
            OverrideTempValueListValue = "0;";
            OverrideTempValueListText = "inaktiv;";
            let tempValueMin = Number(parentAdapter.config.VisMinOverrideTemp);
            const tempValueMax = Number(parentAdapter.config.VisMaxOverrideTemp);

            if (tempValueMin < 4.5) {
                parentAdapter.log.warn("override vis limit: for homematic devices minimum value is 4.5°C, current is " + tempValueMin + "°C, please change settings in admin");
            }
            if (tempValueMin >= tempValueMax) {
                parentAdapter.log.warn("override vis limit: minimum (" + tempValueMin + "°C) has to be lower then maximum (" + tempValueMax + "°C)");
            }
            while (tempValueMin <= tempValueMax) {
                OverrideTempValueListValue += tempValueMin + ";";
                OverrideTempValueListText += tempValueMin + "°C;";
                tempValueMin += Number(parentAdapter.config.VisStepWidthOverrideTemp);
            }
        }

        await parentAdapter.setStateAsync("vis.OverrideTempValueListValue", { ack: true, val: OverrideTempValueListValue });
        await parentAdapter.setStateAsync("vis.OverrideTempValueListText", { ack: true, val: OverrideTempValueListText });

        if (parseInt(parentAdapter.config.VisMinProfilTemp) > 0 && parseInt(parentAdapter.config.VisMaxProfilTemp) > 0) {

            TempValueListValue = "";
            TempValueListText = "";
            let tempValueMin = Number(parentAdapter.config.VisMinProfilTemp);
            const tempValueMax = Number(parentAdapter.config.VisMaxProfilTemp);

            if (tempValueMin < 4.5) {
                parentAdapter.log.warn("profil parameter vis temperature: for homematic devices minimum value is 4.5°C, current is " + tempValueMin + "°C, please change settings in admin");
            }
            if (tempValueMin >= tempValueMax) {
                parentAdapter.log.warn("profil parameter vis temperature: minimum (" + tempValueMin + "°C) has to be lower then maximum (" + tempValueMax + "°C)");
            }
            while (tempValueMin <= tempValueMax ){
                TempValueListValue += tempValueMin + ";";
                TempValueListText += tempValueMin + "°C;";
                tempValueMin += Number(parentAdapter.config.VisStepWidthProfilTemp);
            }
        }

        await parentAdapter.setStateAsync("vis.ProfileTempValueListValue", { ack: true, val: TempValueListValue });
        await parentAdapter.setStateAsync("vis.ProfileTempValueListText", { ack: true, val: TempValueListText });

    } catch (e) {
        parentAdapter.log.error("exception in SetTempDecreaseModeValueLists [" + e + "]");
    }
    parentAdapter.log.debug("SetTempDecreaseModeValueLists done");
}



async function SetCurrentTimePeriod(room, period) {

    if (room == ChoosenRoom) {
        parentAdapter.log.debug("HandleStateChanges CurrentTimePeriod " + period);
        if (RefreshingVis === false) {
            await parentAdapter.setStateAsync("vis.RoomValues." + "CurrentTimePeriod", { ack: true, val: period});//Wenn Änderung des akuellen Zeitslots im aktuell gewählten Raum
        }
    }
}


async function SetTrigger() {
    parentAdapter.log.debug("Set trigger");
    parentAdapter.subscribeStates("vis.ChoosenRoom");

    try {
        parentAdapter.subscribeStates("vis.RoomValues.MinimumTemperature");
        parentAdapter.subscribeStates("vis.RoomValues.TemperaturOverride");
        parentAdapter.subscribeStates("vis.RoomValues.TemperaturOverrideTime");

        parentAdapter.subscribeStates("vis.TempDecreaseValues.AbsentDecrease");
        parentAdapter.subscribeStates("vis.TempDecreaseValues.GuestIncrease");
        parentAdapter.subscribeStates("vis.TempDecreaseValues.PartyDecrease");
        parentAdapter.subscribeStates("vis.TempDecreaseValues.VacationAbsentDecrease");
        parentAdapter.subscribeStates("vis.TempDecreaseValues.WindowOpenDecrease");

        if (parentAdapter.config.UseFireplaceMode) {
            parentAdapter.subscribeStates("vis.TempDecreaseValues.FireplaceModeDecrease");
        }

        switch (ProfileType) { //Trigger für Vis Zeit und Temperatur je nach Profiltyp
            default:
                parentAdapter.log.error("unknown profile type " + ProfileType);
                break;
            case "Mo - Su": //Version1 Alle Tage zusammen
                for (let x = 1; x <= parseInt(parentAdapter.config.NumberOfPeriods); x++) {
                    parentAdapter.subscribeStates("vis.ProfileTypes.Mo-Su.Periods." + x + ".Temperature");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Mo-Su.Periods." + x + ".time");
                }
                break;
            case "Mo - Fr / Sa - Su": //Version2
                for (let x = 1; x <= parseInt(parentAdapter.config.NumberOfPeriods); x++) {
                    parentAdapter.subscribeStates("vis.ProfileTypes.Mo-Fr.Periods." + x + ".Temperature");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Mo-Fr.Periods." + x + ".time");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Sa-Su.Periods." + x + ".Temperature");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Sa-Su.Periods." + x + ".time");
                }
                break;
            case "every Day": //Version3
                for (let x = 1; x <= parseInt(parentAdapter.config.NumberOfPeriods); x++) {
                    parentAdapter.subscribeStates("vis.ProfileTypes.Mon.Periods." + x + ".Temperature");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Mon.Periods." + x + ".time");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Tue.Periods." + x + ".Temperature");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Tue.Periods." + x + ".time");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Wed.Periods." + x + ".Temperature");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Wed.Periods." + x + ".time");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Thu.Periods." + x + ".Temperature");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Thu.Periods." + x + ".time");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Fri.Periods." + x + ".Temperature");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Fri.Periods." + x + ".time");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Sat.Periods." + x + ".Temperature");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Sat.Periods." + x + ".time");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Sun.Periods." + x + ".Temperature");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Sun.Periods." + x + ".time");
                }
                break;
        }
    } catch (e) {
        parentAdapter.log.error("exception in SetTrigger [" + e + "]");
    }
    parentAdapter.log.debug("Set trigger done");
}

async function SetVis() {
    parentAdapter.log.debug("SetVis called");

    try {
        RefreshingVis = true;
        const periods = parseInt(parentAdapter.config.NumberOfPeriods, 10);

        switch (ProfileType) {

            case "Mo - Su":
                for (let x = 1; x <= periods; x++) {
                    await parentAdapter.setStateAsync(
                        `vis.ProfileTypes.Mo-Su.Periods.${x}.Temperature`,
                        { ack: true, val: await getStateValOrZero(`Profiles.${CurrentProfile}.${ChoosenRoom}.Mo-Su.Periods.${x}.Temperature`) }
                    );
                    await parentAdapter.setStateAsync(
                        `vis.ProfileTypes.Mo-Su.Periods.${x}.time`,
                        { ack: true, val: await getStateValOrZero(`Profiles.${CurrentProfile}.${ChoosenRoom}.Mo-Su.Periods.${x}.time`) }
                    );
                }
                break;

            case "Mo - Fr / Sa - Su":
                for (let x = 1; x <= periods; x++) {
                    for (const day of ["Mo-Fr", "Sa-Su"]) {
                        await parentAdapter.setStateAsync(
                            `vis.ProfileTypes.${day}.Periods.${x}.Temperature`,
                            { ack: true, val: await getStateValOrZero(`Profiles.${CurrentProfile}.${ChoosenRoom}.${day}.Periods.${x}.Temperature`) }
                        );
                        await parentAdapter.setStateAsync(
                            `vis.ProfileTypes.${day}.Periods.${x}.time`,
                            { ack: true, val: await getStateValOrZero(`Profiles.${CurrentProfile}.${ChoosenRoom}.${day}.Periods.${x}.time`) }
                        );
                    }
                }
                break;

            case "every Day":
                {
                    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                    for (let x = 1; x <= periods; x++) {
                        for (const day of days) {
                            await parentAdapter.setStateAsync(
                                `vis.ProfileTypes.${day}.Periods.${x}.Temperature`,
                                { ack: true, val: await getStateValOrZero(`Profiles.${CurrentProfile}.${ChoosenRoom}.${day}.Periods.${x}.Temperature`) }
                            );
                            await parentAdapter.setStateAsync(
                                `vis.ProfileTypes.${day}.Periods.${x}.time`,
                                { ack: true, val: await getStateValOrZero(`Profiles.${CurrentProfile}.${ChoosenRoom}.${day}.Periods.${x}.time`) }
                            );
                        }
                    }
                }
                break;

            default:
                parentAdapter.log.error("SetVis: unknown profile type " + ProfileType);
        }

        if (parentAdapter.config.UseFireplaceMode) {
            await parentAdapter.setStateAsync(
                "vis.TempDecreaseValues.FireplaceModeDecrease",
                { ack: true, val: await getStateValOrZero(`Profiles.${CurrentProfile}.${ChoosenRoom}.${TempDecreaseMode}.FireplaceModeDecrease`) }
            );
        }

        await parentAdapter.setStateAsync(
            "vis.RoomValues.MinimumTemperature",
            { ack: true, val: parentAdapter.config.UseMinTempPerRoom
                ? await getStateValOrZero(`Rooms.${ChoosenRoom}.MinimumTemperature`)
                : 0 }
        );

        const roomStates = [
            "TemperaturOverride",
            "TemperaturOverrideTime",
            "WindowIsOpen",
            "StatusLog",
            "TemperaturOverrideRemainingTime",
            "CurrentTimePeriod"
        ];

        for (const state of roomStates) {
            await parentAdapter.setStateAsync(
                `vis.RoomValues.${state}`,
                { ack: true, val: await getStateValOrZero(`Rooms.${ChoosenRoom}.${state}`) }
            );
        }

        const decreaseStates = [
            "AbsentDecrease",
            "GuestIncrease",
            "PartyDecrease",
            "VacationAbsentDecrease",
            "WindowOpenDecrease"
        ];

        for (const state of decreaseStates) {
            await parentAdapter.setStateAsync(
                `vis.TempDecreaseValues.${state}`,
                { ack: true, val: await getStateValOrZero(`Profiles.${CurrentProfile}.${ChoosenRoom}.${TempDecreaseMode}.${state}`) }
            );
        }

        await setIsActive(ChoosenRoom);
        RefreshingVis = false;

    } catch (e) {
        parentAdapter.log.error("exception in SetVis [" + e + "]");
    }

    parentAdapter.log.debug("SetVis done");
}

async function getStateValOrZero(id) {
    const state = await parentAdapter.getStateAsync(id);
    return state && state.val != null ? state.val : 0;
}


//==========================================================================================================================

async function SetStatuslog(room, status) {
    if (ChoosenRoom.length > 0 && room == ChoosenRoom) {
        const id = "vis.RoomValues.StatusLog";
        await parentAdapter.setStateAsync(id, { ack: true, val: status });
    }
}

async function SetTemperaturOverrideRemainingTime(room, value) {
    if (ChoosenRoom.length > 0 && room == ChoosenRoom) {
        const id = "vis.RoomValues.TemperaturOverrideRemainingTime";
        await parentAdapter.setStateAsync(id, { ack: true, val: value });
    }
}


//==========================================================================================================================
async function SetTimeTempValue(ProfileDays, What, ScriptDpVal, Period) { //Werte vom Vis, Bereich Zeit/Temperatur, in AdapterDPs schreiben
    if (RefreshingVis === false) {
        parentAdapter.log.debug( typeof (ScriptDpVal));

        //const CurrentProfile = await GetCurrentProfile();
        const id =  "Profiles." + CurrentProfile + "." + ChoosenRoom + "." + ProfileDays + ".Periods." + Period + "." + What;
        parentAdapter.log.debug( "SetTimeTempValue: " + id + " set to " + ScriptDpVal);

        //kein ack, sonst wird es nicht direkt übernommen
        await parentAdapter.setStateAsync(id, { ack: false, val: ScriptDpVal });
    }
}

//==========================================================================================================================
async function SetDecreaseValue(What, ScriptDpVal) {//Werte vom Vis, Bereich Absenkungen, in AdapterDPs schreiben
    if (RefreshingVis === false) {

        //const CurrentProfile = await GetCurrentProfile();
        const id =  "Profiles." + CurrentProfile + "." + ChoosenRoom + "." + TempDecreaseMode + "." + What;
        parentAdapter.log.debug("SetDecreaseValue: " + id + " set to " + ScriptDpVal);
        //kein ack, sonst wird es nicht direkt übernommen
        await parentAdapter.setStateAsync(id, { ack: false, val: ScriptDpVal });
    }
}

//==========================================================================================================================
async function SetRoomValue(What, ScriptDpVal) {
    if (RefreshingVis === false) {
        // this.log("Reaching SetRoomValue");
        const id = "Rooms." + ChoosenRoom + "." + What;
        parentAdapter.log.debug("SetRoomValue: " + id + " set to " + ScriptDpVal);
        //kein ack, sonst wird es nicht direkt übernommen
        await parentAdapter.setStateAsync(id, { ack: false, val: ScriptDpVal });
    }
}


async function SetStateChangeVis(id, state) {
    parentAdapter.log.debug("SetStateChangeVis " + id + " " + state);
}

//==========================================================================================================================
async function HandleStateChangeVis(id, state) {

    let bRet = true;
    //parentAdapter.log.debug("HandleStateChanges vis " + id + " with " + state.val + " refreshVis " + RefreshingVis);

    try {
        if (parentAdapter.config.UseVisFromPittini) {
            const ids = id.split(".");

            //heatingcontrol.0.Profiles.1.ProfileName
            if (ids[4] == "ProfileName") {
                await SetProfileValueList();
            } else if (ids[2] == "CurrentProfile") {
                //HandleStateChangeVis not handled heatingcontrol.0.CurrentProfile
                parentAdapter.log.debug("HandleStateChanges Currentprofile " + state.val);
                await SetVis();
            } else if (ids[3] == "ChoosenRoom") {
                //heatingcontrol.0.vis.ChoosenRoom 
                OldChoosenRoom = ChoosenRoom;
                ChoosenRoom = state.val;

                parentAdapter.log.debug("HandleStateChanges ChoosenRoom; old " + OldChoosenRoom + " new " + ChoosenRoom);
                await SetVis();
                //await CreateCurrentTimePeriodTrigger(); // wieder ein olvalue //Sonderfall - Um die aktuelle Periode anzeigen zu können muss ein wechselnder Trigger auf den aktuellen Raum im HC Rooms Zweig gesetzt und bei wechsel wieder gelöscht werden
            } else if (ids[3] == "isActive") {
                await changeIsActive(state.val);
                parentAdapter.log.debug("HandleStateChanges isActive to " + state.val);
            } else if (ids[3] === "ProfileTypes") {
                //HeatingControl.0.vis.ProfileTypes.Mon.Periods.0.Temperature
                if (ids[7] === "time") {
                    parentAdapter.log.debug("HandleStateChanges time " + ids[4] + " " + state.val + " " + ids[6]);
                    if (RefreshingVis === false) {
                        await SetTimeTempValue(ids[4], "time", state.val, ids[6]);
                    }
                } else if (ids[7] === "Temperature") {
                    parentAdapter.log.debug("HandleStateChanges Temperature " + ids[4] + " " + state.val + " " + ids[6]);
                    if (RefreshingVis === false) {
                        await SetTimeTempValue(ids[4], "Temperature", state.val, ids[6]);
                    }
                }
            } else if (ids[3] === "TempDecreaseValues") {
                parentAdapter.log.debug("HandleStateChanges TempDecreaseValues " + " with " + state.val);
                if (ids[4] === "AbsentDecrease") {
                    if (RefreshingVis === false) {
                        await SetDecreaseValue("AbsentDecrease", state.val);
                    }
                } else if (ids[4] === "GuestIncrease") {
                    if (RefreshingVis === false) {
                        await SetDecreaseValue("GuestIncrease", state.val);
                    }
                } else if (ids[4] === "PartyDecrease") {
                    if (RefreshingVis === false) {
                        await SetDecreaseValue("PartyDecrease", state.val);
                    }
                } else if (ids[4] === "VacationAbsentDecrease") {
                    if (RefreshingVis === false) {
                        await SetDecreaseValue("VacationAbsentDecrease", state.val);
                    }
                } else if (ids[4] === "WindowOpenDecrease") {
                    if (RefreshingVis === false) {
                        await SetDecreaseValue("WindowOpenDecrease", state.val);
                    }
                } else if (ids[4] === "FireplaceModeDecrease") {
                    if (RefreshingVis === false) {
                        await SetDecreaseValue("FireplaceModeDecrease", state.val);
                    }
                }
            } else if (ids[3] === "RoomValues") {

                parentAdapter.log.debug("HandleStateChanges RoomValues " + id + " " + state.val);

                if (ids[4] === "MinimumTemperature") {
                    parentAdapter.log.debug("HandleStateChanges MinimumTemperature ");
                    if (RefreshingVis === false) {
                        await SetRoomValue("MinimumTemperature", state.val);
                    }
                } else if (ids[4] === "TemperaturOverride") {
                    parentAdapter.log.debug("HandleStateChanges TemperaturOverride ");
                    if (RefreshingVis === false) {
                        await SetRoomValue("TemperaturOverride", state.val);
                    }
                } else if (ids[4] === "TemperaturOverrideTime") {
                    parentAdapter.log.debug("HandleStateChanges TemperaturOverrideTime ");
                    if (RefreshingVis === false) {
                        await SetRoomValue("TemperaturOverrideTime", state.val);
                    }
                }
            } else {
                parentAdapter.log.error("HandleStateChangeVis not handled " + id);
                bRet = false;
            }
        }
    } catch (e) {

        parentAdapter.log.error("exception in HandleStateChangeVis [" + e + "]");

    }
    return bRet;
}



module.exports = {
    StartVis,
    SetCurrentProfile,
    SetCurrentTimePeriod,
    SetStatuslog,
    SetTemperaturOverrideRemainingTime,
    HandleStateChangeVis,
    SetStateChangeVis,
    SetVis
};
