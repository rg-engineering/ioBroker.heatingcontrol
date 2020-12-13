"use strict";

const GetNumberOfActiveRooms = require("./database.js").GetNumberOfActiveRooms;
const GetRoomData = require("./database.js").GetRoomData;
const GetCurrentProfile = require("./database.js").GetCurrentProfile;

const timeConverter = require("./support_tools.js").timeConverter;

let parentAdapter;

//=========================================================================================
// support functions for vis
const WindowState = []; //Fensterstatus pro Raum, Index korreliert mit Rooms[]
const WindowStateTimeStamp = [];
let OpenWindowRoomCount = 0;
let WindowClosedImg = "/vis.0/HeatingControl/images/fts_window_1w.svg";
let WindowOpenImg = "/vis.0/HeatingControl/images/fts_window_1w_open.svg";

let TempDecreaseMode;
let ProfileType;
let UsedRooms;
let OldChoosenRoom = "none";
let ChoosenRoom = "";
let RefreshingVis = false;

const AbsTempValueListValue = "0;1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21;22;23;24;25";
const AbsTempValueListText = "inaktiv;1°C;2°C;3°C;4°C;5°C;6°C;7°C;8°C;9°C;10°C;11°C;12°C;13°C;14°C;15°C;16°C;17°C;18°C;19°C;20°C;21°C;22°C;23°C;24°C;25°C";

const RelTempValueListValue = "0;1;2;3;4;5;6;7;8;9;10";
const RelTempDivValueListText = "inaktiv;-1°C;-2°C;-3°C;-4°C;-5°C;-6°C;-7°C;-8°C;-9°C;-10°C";
const RelTempAddValueListText = "inaktiv;+1°C;+2°C;+3°C;+4°C;+5°C;+6°C;+7°C;+8°C;+9°C;+10°C";

let SystemLanguage = "de";

async function StartVis(parent, language) {

    parentAdapter = parent;
    SystemLanguage = language;

    //pittini vis
    if (parentAdapter.config.UseVisFromPittini) {

        await SetData();

        await InitRoom(); //Gewählten Raum einlesen, bei Erststart default setzen
        //ValueList Vorgabewerte anhand Profileinstellungen erzeugen
        await SetProfileValueList();//ValueList Vorgaben für Profile erzeugen
        await InitWindowStates(); //Fensterstati einlesen
        await CreateWindowStatesTable();  //Fensterstati Liste erzeugen
        await SetTempDecreaseModeValueLists(); //ValueList Vorgaben (Werte und Texte) für Decreasemodes erzeugen
        await CreateCurrentTimePeriodTrigger(); //TimeperiodTrigger für aktuellen Raum wählen
        await SetTrigger();    //Trigger erzeugen
        await SetVis(); // Vis initialisieren
    }
}

async function SetData() {

    try {
        if (parentAdapter.config.PittiniPathImageWindowOpen.length != null && parentAdapter.config.PittiniPathImageWindowOpen.length > 0) {
            parentAdapter.log.debug("set image path " + parentAdapter.config.PittiniPathImageWindowOpen);
            WindowOpenImg = parentAdapter.config.PittiniPathImageWindowOpen;
        }
        if (parentAdapter.config.PittiniPathImageWindowClosed != null && parentAdapter.config.PittiniPathImageWindowClosed.length > 0) {
            parentAdapter.log.debug("set image path " + parentAdapter.config.PittiniPathImageWindowClosed);
            WindowClosedImg = parentAdapter.config.PittiniPathImageWindowClosed;
        }

        let temp = await parentAdapter.getStateAsync("info.TemperatureDecreaseMode");
        TempDecreaseMode = temp.val;
        parentAdapter.log.debug("TempDecreaseMode " + JSON.stringify(TempDecreaseMode));

        temp = await parentAdapter.getStateAsync("info.ProfileType");
        ProfileType = temp.val;
        parentAdapter.log.debug("ProfileType " + JSON.stringify(ProfileType));

        temp = await parentAdapter.getStateAsync("info.UsedRooms");
        UsedRooms = temp.val;
        parentAdapter.log.debug("UsedRooms " + JSON.stringify(UsedRooms));
    }
    catch (e) {
        parentAdapter.log.error("exception in SetData [" + e + "]");
    }

}



async function InitRoom() { //Gewählten Raum einlesen, bei Erststart default= erster in der Raumliste setzen

    parentAdapter.log.debug("InitRoom called ");

    try {
        let temp = await parentAdapter.getStateAsync("vis.ChoosenRoom");
        ChoosenRoom = temp.val;

        if (ChoosenRoom == "") { //Wenn bei erstem Start noch kein Raum vorhanden (nach anlegen der States), verwende ersten Raum aus der Raumliste

            temp = await parentAdapter.getStateAsync("info.UsedRooms");
            const dummy = temp.val;
            if (dummy.includes(";")) { //Wenn ein semikolon in der Raumliste vorhanden ist, sind auch mehrere Räume vorhanden, davon nachfolgend den ersten extrahieren
                ChoosenRoom = dummy.substring(0, dummy.indexOf(";")); //In Raumliste nach dem Semikolon suchen und alles links davon extrahieren
                parentAdapter.log.debug("ChoosenRoom=" + ChoosenRoom);
            }
            else {
                ChoosenRoom = dummy; //Wenn nur ein Raum in Raumliste, diesen verwenden
            }
            await parentAdapter.setStateAsync("vis.ChoosenRoom", { ack: true, val: ChoosenRoom }); //Bei Erststart ChoosenRoom auf default= erster in der Raumliste setzen
        }

    }
    catch (e) {
        parentAdapter.log.error("exception in InitRoom [" + e + "]");
    }

    parentAdapter.log.debug("InitRoom done, choosen room is " + ChoosenRoom);
}

async function InitWindowStates() { //Bei Programmstart alle Raum/Fensterstati einlesen
    parentAdapter.log.debug("InitWindowStates called ");
    try {
        OpenWindowRoomCount = 0;
        for (let x = 0; x < GetNumberOfActiveRooms(); x++) { //Alle Räume durchlaufen

            const theRoom = GetRoomData(x);
            const temp = await parentAdapter.getStateAsync("Rooms." + theRoom.Name + ".WindowIsOpen");

            if (temp != null && typeof temp != undefined && temp.val != undefined) {
                WindowState[x] = temp.val;

                const timestamp = temp.lc ;

                WindowStateTimeStamp[x] = timeConverter(SystemLanguage, timestamp);
            }
            else {
                WindowState[x] = theRoom.WindowIsOpen;
                WindowStateTimeStamp[x] = theRoom.WindowIsOpenChanged;
            }

            if (WindowState[x]) {
                OpenWindowRoomCount++;
            }

            parentAdapter.log.debug("windowstate " + theRoom.Name + " " + JSON.stringify(temp) + " timestamp " + WindowStateTimeStamp[x] + " " + WindowState[x]);

        }
    }
    catch (e) {
        parentAdapter.log.error("exception in InitWindowStates [" + e + "]");
    }
    parentAdapter.log.debug("InitWindowStates done ");
}

async function CreateWindowStatesTable() { // Erzeugt List mit Räumen und Fensterstatus
    parentAdapter.log.debug("CreateWindowStatesTable called ");

    try {
        let HtmlTable = "";
        OpenWindowRoomCount = 0;
        for (let x = 0; x < GetNumberOfActiveRooms(); x++) {
            const theRoom = GetRoomData(x);

            if (theRoom.hasWindowSensors) {
                if (WindowState[x] == true) {
                    HtmlTable = HtmlTable + '<div class="mdui-listitem mdui-center-v mdui-red-bg" style="height:48px;"> <img height=40px src="' + WindowOpenImg + '"&nbsp</img> ';
                    OpenWindowRoomCount++;
                }
                else {
                    HtmlTable = HtmlTable + '<div class="mdui-listitem mdui-center-v" style="height:48px;"> <img height=40px src="' + WindowClosedImg + '"&nbsp</img> ';
                }
                HtmlTable = HtmlTable + '<div class="mdui-label">' + theRoom.Name + '<div class="mdui-subtitle">seit ' + WindowStateTimeStamp[x] + "</div></div></div>";
            }
        }
        await parentAdapter.setStateAsync("vis.WindowStatesHtmlTable", { ack: true, val: HtmlTable });
        await parentAdapter.setStateAsync("vis.OpenWindowRoomCount", { ack: true, val: OpenWindowRoomCount });
        parentAdapter.log.debug(HtmlTable);
    }
    catch (e) {
        parentAdapter.log.error("exception in CreateWindowStatesTable [" + e + "]");
    }
    parentAdapter.log.debug("CreateWindowStatesTable done ");
}

async function SetProfileValueList() { //Einträge für Vis Profil Valuelist erstellen
    parentAdapter.log.debug("SetProfileValueList called " + parseInt(parentAdapter.config.NumberOfProfiles, 10));

    try {
        let ProfileValueListValue = "";
        let ProfileValueListText = "";

        for (let x = 1; x <= parseInt(parentAdapter.config.NumberOfProfiles, 10); x++) {
            parentAdapter.log.debug("SetProfileValueList x= " + x);
            ProfileValueListValue = ProfileValueListValue + ";" + x;
            ProfileValueListText = ProfileValueListText + ";" + x;
        }

        parentAdapter.log.debug("SetProfileValueList " + ProfileValueListValue);

        ProfileValueListValue = ProfileValueListValue.slice(1);
        ProfileValueListText = ProfileValueListText.slice(1);

        await parentAdapter.setStateAsync("vis.ProfileValueListValue", { ack: true, val: ProfileValueListValue });
        await parentAdapter.setStateAsync("vis.ProfileValueListText", { ack: true, val: ProfileValueListText });
    }
    catch (e) {
        parentAdapter.log.error("exception in SetProfileValueList [" + e + "]");
    }
    parentAdapter.log.debug("SetProfileValueList done");
}


async function SetTempDecreaseModeValueLists() { //Setzt die Vorgabewerte der Valuelists je nach gewähltem DecreaseMode
    parentAdapter.log.debug("SetTempDecreaseModeValueLists called " + AbsTempValueListText + " " + RelTempDivValueListText);
    try {
        switch (TempDecreaseMode) {
            case "relative":
                await parentAdapter.setStateAsync("vis.TempValueListValue", { ack: true, val: RelTempValueListValue });
                await parentAdapter.setStateAsync("vis.TempAddValueListText", { ack: true, val: RelTempAddValueListText });
                await parentAdapter.setStateAsync("vis.TempDivValueListText", { ack: true, val: RelTempDivValueListText });
                break;
            case "absolute":
                await parentAdapter.setStateAsync("vis.TempValueListValue", { ack: true, val: AbsTempValueListValue });
                await parentAdapter.setStateAsync("vis.TempAddValueListText", { ack: true, val: AbsTempValueListText });
                await parentAdapter.setStateAsync("vis.TempDivValueListText", { ack: true, val: AbsTempValueListText });
                break;
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in SetTempDecreaseModeValueLists [" + e + "]");
    }
    parentAdapter.log.debug("SetTempDecreaseModeValueLists done");
}

async function CreateCurrentTimePeriodTrigger() {

    parentAdapter.log.debug("CreateCurrentTimePeriodTrigger called");
    try {
        parentAdapter.log.debug("reaching CreateCurrentTimePeriodTrigger - Oldroom= " + OldChoosenRoom + " ChoosenRoom= " + ChoosenRoom);
        if (OldChoosenRoom != "none" && OldChoosenRoom != "") { //Wenn kein Oldroom angegeben kein unsubscribe machen
            parentAdapter.unsubscribeStates("Rooms." + OldChoosenRoom + ".ActiveTimeSlot"); //Trigger auf vorherigen Raum löschen
            parentAdapter.log.debug("Trigger für Raum " + OldChoosenRoom + " gelöscht, und für Raum " + ChoosenRoom + " gesetzt.");

        }

        parentAdapter.subscribeStates("Rooms." + ChoosenRoom + ".ActiveTimeSlot");
    }
    catch (e) {
        parentAdapter.log.error("exception in CreateCurrentTimePeriodTrigger [" + e + "]");
    }
    parentAdapter.log.debug("CreateCurrentTimePeriodTrigger done");
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

        
        const Rooms = UsedRooms.split(";");
        for (let x = 0; x <= Rooms.length - 1; x++) {
            const id = "Rooms." + Rooms[x] + ".WindowIsOpen";
            parentAdapter.log.debug("subscribe " + id);

            //heatingcontrol.0.Rooms.Wohnzimmer.WindowIsOpen
            // subscribe Rooms.Wohnzimmer.WindowIsOpen
            parentAdapter.subscribeStates(id); //Wenn Fensterstatus sich ändert
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
                    parentAdapter.subscribeStates("vis.ProfileTypes.Sa-So.Periods." + x + ".Temperature");
                    parentAdapter.subscribeStates("vis.ProfileTypes.Sa-So.Periods." + x + ".time");
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
    }
    catch (e) {
        parentAdapter.log.error("exception in SetTrigger [" + e + "]");
    }
    parentAdapter.log.debug("Set trigger done");
}

async function SetVis() { // Vis Daten durch Adapterdaten ersetzen bei Umschaltung Raum oder Profil

    parentAdapter.log.debug("SetVis called");
    try {
        const CurrentProfile = await GetCurrentProfile();

        RefreshingVis = true; //Um zu vermeiden dass es ne Schleife gibt wo die Vis Aktualisierung bei Raumwechsel als Änderung gewertet wird
        let temp;
        switch (ProfileType) { //Profiltyp abhängige Zeit und Temperaturwerte setzen
            default:
                parentAdapter.log.error("unknown profile type" + ProfileType);
                break;
            case "Mo - Su":
                for (let x = 1; x <= parseInt(parentAdapter.config.NumberOfPeriods); x++) {
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Mo-Su.Periods." + x + ".Temperature");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Mo-Su.Periods." + x + ".Temperature", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Mo-Su.Periods." + x + ".time");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Mo-Su.Periods." + x + ".time", { ack: true, val: temp.val });
                }
                break;
            case "Mo - Fr / Sa - Su":
                for (let x = 1; x <= parseInt(parentAdapter.config.NumberOfPeriods); x++) {
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Mo-Fr.Periods." + x + ".Temperature");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Mo-Fr.Periods." + x + ".Temperature", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Mo-Fr.Periods." + x + ".time");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Mo-Fr.Periods." + x + ".time", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Sa-So.Periods." + x + ".Temperature");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Sa-So.Periods." + x + ".Temperature", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Sa-So.Periods." + x + ".time");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Sa-So.Periods." + x + ".time", { ack: true, val: temp.val });
                }
                break;
            case "every Day":
                for (let x = 1; x <= parseInt(parentAdapter.config.NumberOfPeriods); x++) {
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Mon.Periods." + x + ".Temperature");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Mon.Periods." + x + ".Temperature", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Mon.Periods." + x + ".time");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Mon.Periods." + x + ".time", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Tue.Periods." + x + ".Temperature");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Tue.Periods." + x + ".Temperature", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Tue.Periods." + x + ".time");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Tue.Periods." + x + ".time", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Wed.Periods." + x + ".Temperature");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Wed.Periods." + x + ".Temperature", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Wed.Periods." + x + ".time");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Wed.Periods." + x + ".time", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Thu.Periods." + x + ".Temperature");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Thu.Periods." + x + ".Temperature", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Thu.Periods." + x + ".time");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Thu.Periods." + x + ".time", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Fri.Periods." + x + ".Temperature");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Fri.Periods." + x + ".Temperature", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Fri.Periods." + x + ".time");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Fri.Periods." + x + ".time", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Sat.Periods." + x + ".Temperature");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Sat.Periods." + x + ".Temperature", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Sat.Periods." + x + ".time");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Sat.Periods." + x + ".time", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Sun.Periods." + x + ".Temperature");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Sun.Periods." + x + ".Temperature", { ack: true, val: temp.val });
                    temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + "Sun.Periods." + x + ".time");
                    await parentAdapter.setStateAsync("vis.ProfileTypes.Sun.Periods." + x + ".time", { ack: true, val: temp.val });
                }
                break;
        }
        //DecreaseMode Werte setzen
        temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + TempDecreaseMode + "." + "AbsentDecrease");
        await parentAdapter.setStateAsync("vis.TempDecreaseValues." + "AbsentDecrease", { ack: true, val: temp.val });
        temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + TempDecreaseMode + "." + "GuestIncrease");
        await parentAdapter.setStateAsync("vis.TempDecreaseValues." + "GuestIncrease", { ack: true, val: temp.val });
        temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + TempDecreaseMode + "." + "PartyDecrease");
        await parentAdapter.setStateAsync("vis.TempDecreaseValues." + "PartyDecrease", { ack: true, val: temp.val });
        temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + TempDecreaseMode + "." + "VacationAbsentDecrease");
        await parentAdapter.setStateAsync("vis.TempDecreaseValues." + "VacationAbsentDecrease", { ack: true, val: temp.val });
        temp = await parentAdapter.getStateAsync("Profiles." + CurrentProfile + "." + ChoosenRoom + "." + TempDecreaseMode + "." + "WindowOpenDecrease");
        await parentAdapter.setStateAsync("vis.TempDecreaseValues." + "WindowOpenDecrease", { ack: true, val: temp.val });

        //Raum Werte setzen
        if (parentAdapter.config.UseMinTempPerRoom) {
            temp = await parentAdapter.getStateAsync("Rooms." + ChoosenRoom + "." + "MinimumTemperature");
            await parentAdapter.setStateAsync("vis.RoomValues.MinimumTemperature", { ack: true, val: temp.val });
        }
        else {
            await parentAdapter.setStateAsync("vis.RoomValues.MinimumTemperature", { ack: true, val: 0 });
            parentAdapter.log.debug("MinimumTemp skipping entry and showing 0");
        }

        temp = await parentAdapter.getStateAsync("Rooms." + ChoosenRoom + "." + "TemperaturOverride");
        await parentAdapter.setStateAsync("vis.RoomValues.TemperaturOverride", { ack: true, val: temp.val });
        temp = await parentAdapter.getStateAsync("Rooms." + ChoosenRoom + "." + "TemperaturOverrideTime");
        await parentAdapter.setStateAsync("vis.RoomValues.TemperaturOverrideTime", { ack: true, val: temp.val });
        temp = await parentAdapter.getStateAsync("Rooms." + ChoosenRoom + "." + "WindowIsOpen");
        await parentAdapter.setStateAsync("vis.RoomValues.WindowIsOpen", { ack: true, val: temp.val });
        temp = await parentAdapter.getStateAsync("Rooms." + ChoosenRoom + "." + "ActiveTimeSlot");
        await parentAdapter.setStateAsync("vis.RoomValues.CurrentTimePeriod", { ack: true, val: temp.val });


        RefreshingVis = false;
    }
    catch (e) {
        parentAdapter.log.error("exception in SetVis [" + e + "]");
    }

    parentAdapter.log.debug("SetVis done");
}

//==========================================================================================================================
async function SetWindowState() { //Fenster offenstatus für einzelnen Raum/Fenster festlegen
    const state =  "Rooms." + ChoosenRoom + "." + "WindowIsOpen";
    parentAdapter.log.debug( "Reaching SetWindowState for " + state);
    const temp = await parentAdapter.getStateAsync(state);
    await parentAdapter.setStateAsync( "vis.RoomValues." + "WindowIsOpen", { ack: true, val: temp.val });
}

//==========================================================================================================================
async function SetTimeTempValue(ProfileDays, What, ScriptDpVal, Period) { //Werte vom Vis, Bereich Zeit/Temperatur, in AdapterDPs schreiben
    if (RefreshingVis === false) {
        parentAdapter.log.debug( typeof (ScriptDpVal));

        const CurrentProfile = await GetCurrentProfile();
        const id =  "Profiles." + CurrentProfile + "." + ChoosenRoom + "." + ProfileDays + ".Periods." + Period + "." + What;
        parentAdapter.log.debug( "SetTimeTempValue: " + id + " set to " + ScriptDpVal);

        //kein ack, sonst wird es nicht direkt übernommen
        await parentAdapter.setStateAsync(id, { ack: false, val: ScriptDpVal });
    }
}

//==========================================================================================================================
async function SetDecreaseValue(What, ScriptDpVal) {//Werte vom Vis, Bereich Absenkungen, in AdapterDPs schreiben
    if (RefreshingVis === false) {

        const CurrentProfile = await GetCurrentProfile();
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

//==========================================================================================================================
async function HandleStateChangeVis(id, state) {

    let bRet = true;
    parentAdapter.log.debug("HandleStateChanges " + id + " with " + state.val + " refreshVis " + RefreshingVis);

    if (parentAdapter.config.UseVisFromPittini) {
        const ids = id.split(".");

        //HandleStateChangeVis not handled heatingcontrol.0.CurrentProfile
        if (ids[2] == "CurrentProfile") {
            parentAdapter.log.debug("HandleStateChanges Currentprofile " + state.val);
            await SetVis();
        }
        //heatingcontrol.0.vis.ChoosenRoom 
        else if (ids[3] == "ChoosenRoom") {
            OldChoosenRoom = ChoosenRoom;
            ChoosenRoom = state.val;

            parentAdapter.log.debug("HandleStateChanges ChoosenRoom; old " + OldChoosenRoom + " new " + ChoosenRoom);
            await SetVis();
            await CreateCurrentTimePeriodTrigger(); // wieder ein olvalue //Sonderfall - Um die aktuelle Periode anzeigen zu können muss ein wechselnder Trigger auf den aktuellen Raum im HC Rooms Zweig gesetzt und bei wechsel wieder gelöscht werden
        }
        //heatingcontrol.0.Rooms.Schlafzimmer.ActiveTimeSlot
        else if (ids[4] === "ActiveTimeSlot") {
            parentAdapter.log.debug("HandleStateChanges ActiveTimeSlot " + state.val);
            if (RefreshingVis === false) {
                await parentAdapter.setStateAsync("vis.RoomValues." + "CurrentTimePeriod", { ack: true, val: state.val });//Wenn Änderung des akuellen Zeitslots im aktuell gewählten Raum
            }
        }
        
        else if (ids[4] == "WindowIsOpen") {
            parentAdapter.log.debug("HandleStateChanges WindowIsOpen " + state.val);
            //Raum suchen 
            const curRoom = ids[3];
            const Rooms = UsedRooms.split(";");

            for (let i = 0; i < Rooms.length; i++) {

                if (Rooms[i] == curRoom) {
                   
                    WindowState[i] = state.val;
                    const timestamp = state.lc;

                    WindowStateTimeStamp[i] = timeConverter(timestamp);
                    await SetWindowState();
                    await CreateWindowStatesTable();
                    //parentAdapter.log.debug(WindowState[i]);
                }
            }
        }
        
        //HeatingControl.0.vis.ProfileTypes.Mon.Periods.0.Temperature
        else if (ids[3] === "ProfileTypes") {
            if (ids[7] === "time") {
                parentAdapter.log.debug("HandleStateChanges time " + ids[4] + " " + state.val + " " + ids[6]);
                if (RefreshingVis === false) {
                    await SetTimeTempValue(ids[4], "time", state.val, ids[6]);
                }
            }
            else if (ids[7] === "Temperature") {
                parentAdapter.log.debug("HandleStateChanges Temperature " + ids[4] + " " + state.val + " " + ids[6]);
                if (RefreshingVis === false) {
                    await SetTimeTempValue(ids[4], "Temperature", state.val, ids[6]);
                }
            }
        }
        else if (ids[3] === "TempDecreaseValues") {
            parentAdapter.log.debug("HandleStateChanges TempDecreaseValues " + " with " + state.val);
            if (ids[4] === "AbsentDecrease") {
                if (RefreshingVis === false) {
                    await SetDecreaseValue("AbsentDecrease", state.val);
                }
            }
            else if (ids[4] === "GuestIncrease") {
                if (RefreshingVis === false) {
                    await SetDecreaseValue("GuestIncrease", state.val);
                }
            }
            else if (ids[4] === "PartyDecrease") {
                if (RefreshingVis === false) {
                    await SetDecreaseValue("PartyDecrease", state.val);
                }
            }
            else if (ids[4] === "VacationAbsentDecrease") {
                if (RefreshingVis === false) {
                    await SetDecreaseValue("VacationAbsentDecrease", state.val);
                }
            }
            else if (ids[4] === "WindowOpenDecrease") {
                if (RefreshingVis === false) {
                    await SetDecreaseValue("WindowOpenDecrease", state.val);
                }
            }
        }
        else if (ids[3] === "RoomValues") {

            parentAdapter.log.debug("HandleStateChanges RoomValues " + id + " " + state.val);

            if (ids[4] === "MinimumTemperature") {
                parentAdapter.log.debug("HandleStateChanges MinimumTemperature ");
                if (RefreshingVis === false) {
                    await SetRoomValue("MinimumTemperature", state.val);
                }
            }
            else if (ids[4] === "TemperaturOverride") {
                parentAdapter.log.debug("HandleStateChanges TemperaturOverride ");
                if (RefreshingVis === false) {
                    await SetRoomValue("TemperaturOverride", state.val);
                }
            }
            else if (ids[4] === "TemperaturOverrideTime") {
                parentAdapter.log.debug("HandleStateChanges TemperaturOverrideTime ");
                if (RefreshingVis === false) {
                    await SetRoomValue("TemperaturOverrideTime", state.val);
                }
            }
        }
        else {
            parentAdapter.log.error("HandleStateChangeVis not handled " + id);
            bRet = false;
        }
    }
    return bRet;
}



module.exports = {
    StartVis,
    HandleStateChangeVis
};