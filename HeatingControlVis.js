//Mapping Skript zum Adapter HeatingControl V 0.3.19 oder höher
// Skriptversion 1.0.5 Stand 23.3.2020 - https://github.com/Pittini/iobroker-heatingcontrol-vis



class HeatingControlVis {

    //==========================================================================================================================
    log(level, msg) {
        if (level == "E") {
            this.adapter.log.error("vis: " + msg);
        }
        else {
            this.adapter.log.debug("vis: " + msg);
        }
    }


    constructor(adapter) {
        this.adapter = adapter;

        this.log("D","constructor called");

        this.Init();
    }

    async Init() {

        this.log("D","init called");

        this.language = "de";

        //    const praefix = "javascript.0.vis.HeatingControl."; //Grundpfad für Script DPs
        //    const hcpraefix = "heatingcontrol.0."; //Pfad zu HeatingControlDatenpunkten

        this.praefix = "vis."; //Grundpfad für Script DPs
        this.hcpraefix = ""; //Pfad zu HeatingControlDatenpunkten

        this.WindowClosedImg = "/vis.0/HeatingControl/images/fts_window_1w.svg";
        this.WindowOpenImg = "/vis.0/HeatingControl/images/fts_window_1w_open.svg";

        this.AbsTempValueListValue = "0;1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21;22;23;24;25";
        this.AbsTempValueListText = "inaktiv;1°C;2°C;3°C;4°C;5°C;6°C;7°C;8°C;9°C;10°C;11°C;12°C;13°C;14°C;15°C;16°C;17°C;18°C;19°C;20°C;21°C;22°C;23°C;24°C;25°C";

        this.RelTempValueListValue = "0;1;2;3;4;5;6;7;8;9;10";
        this.RelTempDivValueListText = "inaktiv;-1°C;-2°C;-3°C;-4°C;-5°C;-6°C;-7°C;-8°C;-9°C;-10°C";
        this.RelTempAddValueListText = "inaktiv;+1°C;+2°C;+3°C;+4°C;+5°C;+6°C;+7°C;+8°C;+9°C;+10°C";

        //Ab hier nichts mehr ändern
        this.RefreshingVis = false;
        this.ChoosenRoom = "";
        this.OldChoosenRoom = "";

        //HeatingControl Werte einlesen bei Scriptstart
        //Infobereich
        let temp = await this.GetValue(this.hcpraefix + "info.NumberOfProfiles");
        this.NumberOfProfiles = temp;
        this.log("D","NumberOfProfiles " + JSON.stringify(this.NumberOfProfiles));
        temp = await this.GetValue(this.hcpraefix + "info.UsedRooms");
        this.UsedRooms = temp;
        this.log("D","UsedRooms " + JSON.stringify(this.UsedRooms));
        temp = await this.GetValue(this.hcpraefix + "info.NumberOfPeriods");
        this.NumberOfPeriods = temp;
        this.log("D","NumberOfPeriods " + JSON.stringify(this.NumberOfPeriods));
        temp = await this.GetValue(this.hcpraefix + "info.ProfileType");
        this.ProfileType = temp;
        this.log("D","ProfileType " + JSON.stringify(this.ProfileType));
        temp = await this.GetValue(this.hcpraefix + "info.TemperatureDecreaseMode");
        this.TempDecreaseMode = temp;
        this.log("D","TempDecreaseMode " + JSON.stringify(this.TempDecreaseMode));

        //this.log("D","111");

        // Currently not in use, disabled
        // this.TemperatureDecreaseMode = getState(hcpraefix + "info.TemperatureDecreaseMode").val;
        // this.PublicHolidayLikeSunday = getState(hcpraefix + "info.PublicHolidayLikeSunday").val;

        // Main Root Bereich
        temp = await this.GetValue(this.hcpraefix + "CurrentProfile");
        this.CurrentProfile = temp - 1;
        this.log("D","123 " + JSON.stringify(this.UsedRooms));
        //RoomsBereich
        this.Rooms = this.UsedRooms.split(";"); //Raumliste in Array wandeln für Fensterüberwachung

        this.log("D","rooms" + JSON.stringify(this.Rooms));

        this.WindowState = []; //Fensterstatus pro Raum, Index korreliert mit Rooms[]
        this.WindowStateTimeStamp = [];
        this.OpenWindowRoomCount = 0;

        // Einmalig beim Programmstart alle States erzeugen, sofern nicht schon geschehen
        this.states = [];
        let y = 0;

        this.log("D","Profiltype " + this.ProfileType);

        //States für Zeit/Temp Einstellung
        switch (this.ProfileType) {
            default:
                this.log("E", "unknown profile type " + this.ProfileType);
                break;
            //Dps erzeugen für alle ProfilType Varianten
            //V1 Alle Tage zusammen
            case "Mo - Su":
                y = 0;
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    this.states[y] = { id: this.praefix + "ProfileTypes.Mo-Su.Periods." + x + ".Temperature", initial: 20, forceCreation: false, common: { read: true, write: true, name: "target temperature", type: "number", def: 20 } };
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Mo-Su.Periods." + x + ".time", initial: "00:00", forceCreation: false, common: { read: true, write: true, name: "period from", type: "string", def: "00:00" } };
                    y++;
                }
                break;

            //V2 Mo-Fr / Sa-So
            case "Mo - Fr / Sa - Su":
                y = 0;
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    this.states[y] = { id: this.praefix + "ProfileTypes.Mo-Fr.Periods." + x + ".Temperature", initial: 20, forceCreation: false, common: { read: true, write: true, name: "target temperature", type: "number", def: 20 } };
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Mo-Fr.Periods." + x + ".time", initial: "00:00", forceCreation: false, common: { read: true, write: true, name: "period from", type: "string", def: "00:00" } };
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Sa-So.Periods." + x + ".Temperature", initial: 20, forceCreation: false, common: { read: true, write: true, name: "target temperature", type: "number", def: 20 } };
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Sa-So.Periods." + x + ".time", initial: "00:00", forceCreation: false, common: { read: true, write: true, name: "period from", type: "string", def: "00:00" } };
                    y++;
                }
                break;

            //V3 Jeder Tag getrennt
            case "every Day":
                y = 0;
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    this.states[y] = { id: this.praefix + "ProfileTypes.Mon.Periods." + x + ".Temperature", initial: 20, forceCreation: false, common: { read: true, write: true, name: "target temperature", type: "number", def: 20 } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Mon.Periods." + x + ".time", initial: "00:00", forceCreation: false, common: { read: true, write: true, name: "period from", type: "string", def: "00:00" } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Tue.Periods." + x + ".Temperature", initial: 20, forceCreation: false, common: { read: true, write: true, name: "target temperature", type: "number", def: 20 } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Tue.Periods." + x + ".time", initial: "00:00", forceCreation: false, common: { read: true, write: true, name: "period from", type: "string", def: "00:00" } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Wed.Periods." + x + ".Temperature", initial: 20, forceCreation: false, common: { read: true, write: true, name: "target temperature", type: "number", def: 20 } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Wed.Periods." + x + ".time", initial: "00:00", forceCreation: false, common: { read: true, write: true, name: "period from", type: "string", def: "00:00" } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Thu.Periods." + x + ".Temperature", initial: 20, forceCreation: false, common: { read: true, write: true, name: "target temperature", type: "number", def: 20 } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Thu.Periods." + x + ".time", initial: "00:00", forceCreation: false, common: { read: true, write: true, name: "period from", type: "string", def: "00:00" } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Fri.Periods." + x + ".Temperature", initial: 20, forceCreation: false, common: { read: true, write: true, name: "target temperature", type: "number", def: 20 } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Fri.Periods." + x + ".time", initial: "00:00", forceCreation: false, common: { read: true, write: true, name: "period from", type: "string", def: "00:00" } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Sat.Periods." + x + ".Temperature", initial: 20, forceCreation: false, common: { read: true, write: true, name: "target temperature", type: "number", def: 20 } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Sat.Periods." + x + ".time", initial: "00:00", forceCreation: false, common: { read: true, write: true, name: "period from", type: "string", def: "00:00" } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Sun.Periods." + x + ".Temperature", initial: 20, forceCreation: false, common: { read: true, write: true, name: "target temperature", type: "number", def: 20 } }; // 
                    y++;
                    this.states[y] = { id: this.praefix + "ProfileTypes.Sun.Periods." + x + ".time", initial: "00:00", forceCreation: false, common: { read: true, write: true, name: "period from", type: "string", def: "00:00" } }; // 
                    y++;
                }
                break;
        }

        //States für Profileinstellungen
        this.states[y] = { id: this.praefix + "TempDecreaseValues." + "AbsentDecrease", initial: 0, forceCreation: false, common: { read: true, write: true, name: "AbsentDecrease", type: "number", def: 0 } }; // 
        y++;
        this.states[y] = { id: this.praefix + "TempDecreaseValues." + "GuestIncrease", initial: 0, forceCreation: false, common: { read: true, write: true, name: "GuestIncrease", type: "number", def: 0 } }; // 
        y++;
        this.states[y] = { id: this.praefix + "TempDecreaseValues." + "PartyDecrease", initial: 0, forceCreation: false, common: { read: true, write: true, name: "PartyDecrease", type: "number", def: 0 } }; // 
        y++;
        this.states[y] = { id: this.praefix + "TempDecreaseValues." + "VacationAbsentDecrease", initial: 0, forceCreation: false, common: { read: true, write: true, name: "VacationAbsentDecrease", type: "number", def: 0 } }; // 
        y++;
        this.states[y] = { id: this.praefix + "TempDecreaseValues." + "WindowOpenDecrease", initial: 0, forceCreation: false, common: { read: true, write: true, name: "WindowOpenDecrease", type: "number", def: 0 } }; // 
        y++;

        //States für Raumeinstellungen
        this.states[y] = { id: this.praefix + "RoomValues." + "MinimumTemperature", initial: 0, forceCreation: false, common: { read: true, write: true, name: "MinimumTemperature", type: "number", def: 0 } }; // 
        y++;
        this.states[y] = { id: this.praefix + "RoomValues." + "TemperaturOverride", initial: 0, forceCreation: false, common: { read: true, write: true, name: "TemperaturOverride", type: "number", def: 20 } }; // 
        y++;
        this.states[y] = { id: this.praefix + "RoomValues." + "TemperaturOverrideTime", initial: "00:00", forceCreation: false, common: { read: true, write: true, name: "TemperaturOverrideTime", type: "string", def: "00:00" } }; // 
        y++;
        this.states[y] = { id: this.praefix + "RoomValues." + "WindowIsOpen", initial: false, forceCreation: false, common: { read: true, write: true, name: "Fenster geöffnet?", type: "boolean", def: false } }; // 
        y++;
        this.states[y] = { id: this.praefix + "RoomValues." + "CurrentTimePeriod", initial: 0, forceCreation: false, common: { read: true, write: true, name: "Aktiver Zeit Slot", type: "number", def: 0 } }; // 
        y++;

        //Hilfs Datenpunkte
        this.states[y] = { id: this.praefix + "ChoosenRoom", initial: "", forceCreation: false, common: { read: true, write: true, name: "In Vis gewählter Raum", type: "string", def: "" } }; // Welcher Raum wurde in Vis gewählt
        y++;
        this.states[y] = { id: this.praefix + "ProfileValueListValue", initial: "", forceCreation: false, common: { read: true, write: true, name: "Vorgabe für ProfilValueList Werte", type: "string", def: "" } }; //
        y++;
        this.states[y] = { id: this.praefix + "ProfileValueListText", initial: "", forceCreation: false, common: { read: true, write: true, name: "Vorgabe für ProfilValueList Text", type: "string", def: "" } }; //
        y++;
        this.states[y] = { id: this.praefix + "TempValueListValue", initial: "", forceCreation: false, common: { read: true, write: true, name: "Vorgabe für TemperaturValueList Wert", type: "string", def: "" } }; //
        y++;
        this.states[y] = { id: this.praefix + "TempAddValueListText", initial: "", forceCreation: false, common: { read: true, write: true, name: "Vorgabe für TemperaturValueList Text", type: "string", def: "" } }; //
        y++;
        this.states[y] = { id: this.praefix + "TempDivValueListText", initial: "", forceCreation: false, common: { read: true, write: true, name: "Vorgabe für TemperaturValueList Text", type: "string", def: "" } }; //
        y++;
        this.states[y] = { id: this.praefix + "WindowStatesHtmlTable", initial: "", forceCreation: false, common: { read: true, write: true, name: "Tabellarische Übersicht der geöffneten Fenster", type: "string", def: "" } }; //
        y++;
        this.states[y] = { id: this.praefix + "OpenWindowRoomCount", initial: 0, forceCreation: false, common: { read: true, write: true, name: "In wievielen Räumen sind Fenster geöffnet", type: "number", def: 0 } }; //

        await this.CreateStates();

        this.log("D","init done");

        this.main();
    }

    //==========================================================================================================================
    SetLanguage(lang) {
        this.language = lang;
    }

    //==========================================================================================================================
    async CreateStates() {
        this.log("D","CreateStates called");

        //Alle States anlegen, Main aufrufen wenn fertig
        this.log("222 " + this.states.length);
        //this.states.forEach(function (state) {
        for (let i = 0; i < this.states.length; i++) {
            this.log("D","creating " + this.states[i].id);

            await this.adapter.setObjectNotExistsAsync(this.states[i].id, {
                type: "state",
                common: this.states[i].common,
                val: this.states[i].initial
            });
        }

        this.log("D","CreateStates done");
    }
    //==========================================================================================================================
    async main() {

        this.log("D","main called");

        await this.InitRoom(); //Gewählten Raum einlesen, bei Erststart default setzen

        await this.InitWindowStates(); //Fensterstati einlesen

        await this.CreateWindowStatesTable(); //Fensterstati Liste erzeugen

        //ValueList Vorgabewerte anhand Profileinstellungen erzeugen
        await this.SetProfileValueList(); //ValueList Vorgaben für Profile erzeugen

        await this.SetTempDecreaseModeValueLists();//ValueList Vorgaben (Werte und Texte) für Decreasemodes erzeugen

        this.OldChoosenRoom = "none";
        await this.CreateCurrentTimePeriodTrigger(); //TimeperiodTrigger für aktuellen Raum wählen

        await this.SetTrigger();    //Trigger erzeugen

        await this.SetVis(); // Vis initialisieren

        this.log("D","main done");
    }

    //==========================================================================================================================
    async InitRoom() { //Gewählten Raum einlesen, bei Erststart default= erster in der Raumliste setzen

        this.log("D","InitRoom called ");
        let temp = await this.GetValue(this.praefix + "ChoosenRoom");
        this.ChoosenRoom = temp;


        if (this.ChoosenRoom == "") { //Wenn bei erstem Start noch kein Raum vorhanden (nach anlegen der States), verwende ersten Raum aus der Raumliste

            temp = await this.GetValue(this.hcpraefix + "info.UsedRooms");
            const dummy = temp;
            if (dummy.includes(";")) { //Wenn ein semikolon in der Raumliste vorhanden ist, sind auch mehrere Räume vorhanden, davon nachfolgend den ersten extrahieren
                this.ChoosenRoom = dummy.substring(0, dummy.indexOf(";")); //In Raumliste nach dem Semikolon suchen und alles links davon extrahieren
                this.log("D","ChoosenRoom=" + this.ChoosenRoom);
            }
            else {
                this.ChoosenRoom = dummy; //Wenn nur ein Raum in Raumliste, diesen verwenden
            }
            await this.adapter.setStateAsync(this.praefix + "ChoosenRoom", this.ChoosenRoom); //Bei Erststart ChoosenRoom auf default= erster in der Raumliste setzen
        }
        this.log("D","InitRoom done, choosen room is " + this.ChoosenRoom);
    }

    //==========================================================================================================================
    TimeConverter(UNIX_timestamp) {

        const a = new Date(UNIX_timestamp * 1000);

        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        if (this.language === "de") {
            months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
        }
        
        const year = a.getFullYear();
        const month = months[a.getMonth()];
        const date = ("0" + a.getDate()).slice(-2);
        const hour = ("0" + a.getHours()).slice(-2);
        const min = ("0" + a.getMinutes()).slice(-2);
        const sec = ("0" + a.getSeconds()).slice(-2);
        const time = date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
        return time;
    }

    //==========================================================================================================================
    async InitWindowStates() { //Bei Programmstart alle Raum/Fensterstati einlesen
        this.log("D","InitWindowStates called ");
        for (let x = 0; x < this.Rooms.length; x++) { //Alle Räume durchlaufen

            //here we need object instead of value only...
            const temp = await this.GetValueObject(this.hcpraefix + "Rooms." + this.Rooms[x] + ".WindowIsOpen");
            this.WindowState[x] = temp;

            this.log("D", "windowstate " + this.Rooms[x] + " " + JSON.stringify(temp));

            //temp = await this.GetValue(this.hcpraefix + "Rooms." + this.Rooms[x] + ".WindowIsOpen");
            const timestamp = temp.lc/1000.0;

            this.WindowStateTimeStamp[x] = this.TimeConverter(timestamp);
            this.log("D","timestamp " + timestamp + " = " + this.WindowStateTimeStamp[x] );

            //this.WindowStateTimeStamp[x] = formatDate(timestamp, "TT.MM.JJJJ SS:mm:ss");
        }
        this.log("D","InitWindowStates done ");
    }
    /*
    //Einfache html Table
    [{"Title": "first", "Value": 1, "_Description": "Value1"}, {"Title": "second", "Value": 2, "_Description": "Value2"}]
    function CreateWindowStatesTable() {
        let HtmlTable = '<div><table width="260px" border="0">'
        OpenWindowRoomCount = 0;
        for (let x = 0; x <= Rooms.length - 1; x++) {
            if (WindowState[x] == true) {
                HtmlTable = HtmlTable + "<tr bgcolor='#ff0000'><td>" + '<img height=40px src="' + WindowOpenImg + '"&nbsp</img>' + "</td><td height=40px>" + Rooms[x] + "</td><td height=40px>" + "auf" + "</td></tr>"
                OpenWindowRoomCount++;
            }
            else {
                HtmlTable = HtmlTable + "<tr><td height=40px>" + '<img height=40px src="' + WindowClosedImg + '"&nbsp</img>' + "</td><td height=40px>" + Rooms[x] + "</td><td height=40px>" + "zu" + "</td></tr>"
            };
        };
        HtmlTable = HtmlTable + "</table></div>"
        log(HtmlTable)
    
        setState(praefix + "OpenWindowRoomCount", OpenWindowRoomCount);
        setState(praefix + "WindowStatesHtmlTable", HtmlTable)
    
    }
    */
    
    //==========================================================================================================================
    async CreateWindowStatesTable() { // Erzeugt List mit Räumen und Fensterstatus
        this.log("D","CreateWindowStatesTable called ");
        let HtmlTable = "";
        this.OpenWindowRoomCount = 0;
        for (let x = 0; x <= this.Rooms.length - 1; x++) {
            if (this.WindowState[x] == true) {
                HtmlTable = HtmlTable + '<div class="mdui-listitem mdui-center-v mdui-red-bg" style="height:48px;"> <img height=40px src="' + this.WindowOpenImg + '"&nbsp</img> ';
                this.OpenWindowRoomCount++;
            }
            else {
                HtmlTable = HtmlTable + '<div class="mdui-listitem mdui-center-v" style="height:48px;"> <img height=40px src="' + this.WindowClosedImg + '"&nbsp</img> ';
            }
            HtmlTable = HtmlTable + '<div class="mdui-label">' + this.Rooms[x] + '<div class="mdui-subtitle">seit ' + this.WindowStateTimeStamp[x] + "</div></div></div>";
        }
        await this.adapter.setStateAsync(this.praefix + "WindowStatesHtmlTable", HtmlTable);
        await this.adapter.setStateAsync(this.praefix + "OpenWindowRoomCount", this.OpenWindowRoomCount);
        this.log("D",HtmlTable);

        this.log("D","CreateWindowStatesTable done ");
    }

    //==========================================================================================================================
    async SetTimeTempValue(ProfileDays, What, ScriptDpVal, Period) { //Werte vom Vis, Bereich Zeit/Temperatur, in AdapterDPs schreiben
        if (this.RefreshingVis === false) {
            this.log("D",typeof (ScriptDpVal));
            //this.log("Reaching SetTimeTempValue");
            this.log("D","SetTimeTempValue: " + this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + ProfileDays + ".Periods." + Period + "." + What + " set to " + ScriptDpVal);

            await this.adapter.setStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + ProfileDays + ".Periods." + Period + "." + What, ScriptDpVal);
        }
    }

    //==========================================================================================================================
    async SetDecreaseValue(What, ScriptDpVal) {//Werte vom Vis, Bereich Absenkungen, in AdapterDPs schreiben
        if (this.RefreshingVis === false) {
            //this.log("Reaching SetDecreaseValue");
            this.log("D","SetDecreaseValue: " + this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + What + " set to " + ScriptDpVal);
            await this.adapter.setStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + What, ScriptDpVal);
        }
    }

    //==========================================================================================================================
    async SetRoomValue(What, ScriptDpVal) {
        if (this.RefreshingVis === false) {
            // this.log("Reaching SetRoomValue");
            this.log("D","SetRoomValue: " + this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + What + " set to " + ScriptDpVal);
            await this.adapter.setStateAsync(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + What, ScriptDpVal);
        }
    }

    //==========================================================================================================================
    async SetWindowState() { //Fenster offenstatus für einzelnen Raum/Fenster festlegen
        const state = this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "WindowIsOpen";
        this.log("D","Reaching SetWindowState for " + state);
        const temp = await this.GetValue(state);
        await this.adapter.setStateAsync(this.praefix + "RoomValues." + "WindowIsOpen", temp);
    }

    //==========================================================================================================================
    async GetValue(path) {

        let ret = 0;
        const result = await this.adapter.getStateAsync(path);

        if (result != null && typeof result != undefined && typeof result.val != undefined) {
            ret = result.val;
        }
        else {
            this.log("E","error: for " + path + " got " + JSON.stringify(result));
        }
        return ret;

    }

    async GetValueObject(path) {

        let ret = 0;
        const result = await this.adapter.getStateAsync(path);

        if (result != null && typeof result != undefined && typeof result.val != undefined) {
            ret = result;
        }
        else {
            this.log("E", "error: for " + path + " got " + JSON.stringify(result));
        }
        return ret;

    }
    //==========================================================================================================================
    async SetVis() { // Vis Daten durch Adapterdaten ersetzen bei Umschaltung Raum oder Profil

        this.log("D","SetVis called");

        this.log("D","Reaching SetVis");
        this.RefreshingVis = true; //Um zu vermeiden dass es ne Schleife gibt wo die Vis Aktualisierung bei Raumwechsel als Änderung gewertet wird
        let temp;
        switch (this.ProfileType) { //Profiltyp abhängige Zeit und Temperaturwerte setzen
            default:
                this.log("E", "unknown profile type" + this.ProfileType);
                break;
            case "Mo - Su":
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mo-Su.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mo-Su.Periods." + x + ".Temperature", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mo-Su.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mo-Su.Periods." + x + ".time", temp);
                }
                break;
            case "Mo - Fr / Sa - Su":
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mo-Fr.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mo-Fr.Periods." + x + ".Temperature", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mo-Fr.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mo-Fr.Periods." + x + ".time", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sa-So.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sa-So.Periods." + x + ".Temperature", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sa-So.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sa-So.Periods." + x + ".time", temp);
                }
                break;
            case "every Day":
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mon.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mon.Periods." + x + ".Temperature", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mon.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mon.Periods." + x + ".time", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Tue.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Tue.Periods." + x + ".Temperature", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Tue.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Tue.Periods." + x + ".time", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Wed.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Wed.Periods." + x + ".Temperature", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Wed.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Wed.Periods." + x + ".time", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Thu.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Thu.Periods." + x + ".Temperature", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Thu.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Thu.Periods." + x + ".time", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Fri.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Fri.Periods." + x + ".Temperature", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Fri.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Fri.Periods." + x + ".time", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sat.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sat.Periods." + x + ".Temperature", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sat.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sat.Periods." + x + ".time", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sun.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sun.Periods." + x + ".Temperature", temp);
                    temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sun.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sun.Periods." + x + ".time", temp);
                }
                break;
        }
        //DecreaseMode Werte setzen
        temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + "AbsentDecrease");
        await this.adapter.setStateAsync(this.praefix + "TempDecreaseValues." + "AbsentDecrease", temp);
        temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + "GuestIncrease");
        await this.adapter.setStateAsync(this.praefix + "TempDecreaseValues." + "GuestIncrease", temp);
        temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + "PartyDecrease");
        await this.adapter.setStateAsync(this.praefix + "TempDecreaseValues." + "PartyDecrease", temp);
        temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + "VacationAbsentDecrease");
        await this.adapter.setStateAsync(this.praefix + "TempDecreaseValues." + "VacationAbsentDecrease", temp);
        temp = await this.GetValue(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + "WindowOpenDecrease");
        await this.adapter.setStateAsync(this.praefix + "TempDecreaseValues." + "WindowOpenDecrease", temp);

        //Raum Werte setzen
        
        temp = await this.GetValue(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "MinimumTemperature");
        if (temp != 0 ) { //Prüfen ob Minimum Temp Null ist

            temp = await this.GetValue(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "MinimumTemperature");
            await this.adapter.setStateAsync(this.praefix + "RoomValues." + "MinimumTemperature", temp);
        }
        else {
            await this.adapter.setStateAsync(this.praefix + "RoomValues." + "MinimumTemperature", 0);
            this.log("D","MinimumTemp=Null, skipping entry and showing 0");
        }

        temp = await this.GetValue(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "TemperaturOverride");
        await this.adapter.setStateAsync(this.praefix + "RoomValues." + "TemperaturOverride", temp);
        temp = await this.GetValue(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "TemperaturOverrideTime");
        await this.adapter.setStateAsync(this.praefix + "RoomValues." + "TemperaturOverrideTime", temp);
        temp = await this.GetValue(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "WindowIsOpen");
        await this.adapter.setStateAsync(this.praefix + "RoomValues." + "WindowIsOpen", temp);
        temp = await this.GetValue(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "ActiveTimeSlot");
        await this.adapter.setStateAsync(this.praefix + "RoomValues." + "CurrentTimePeriod", temp);


        this.RefreshingVis = false;

        /*
        setTimeout(function () { // Timeout setzt refresh status wieder zurück
            this.RefreshingVis = false;
        }, 250);
        */
        this.log("D","SetVis done");
    }

    //==========================================================================================================================
    async SetTempDecreaseModeValueLists() { //Setzt die Vorgabewerte der Valuelists je nach gewähltem DecreaseMode
        this.log("D","SetTempDecreaseModeValueLists called " + this.AbsTempValueListText + " " + this.RelTempDivValueListText);

        switch (this.TempDecreaseMode) {
            case "relative":
                await this.adapter.setStateAsync(this.praefix + "TempValueListValue", this.RelTempValueListValue);
                await this.adapter.setStateAsync(this.praefix + "TempAddValueListText", this.RelTempAddValueListText);
                await this.adapter.setStateAsync(this.praefix + "TempDivValueListText", this.RelTempDivValueListText);
                break;
            case "absolute":
                await this.adapter.setStateAsync(this.praefix + "TempValueListValue", this.AbsTempValueListValue);
                await this.adapter.setStateAsync(this.praefix + "TempAddValueListText", this.AbsTempValueListText);
                await this.adapter.setStateAsync(this.praefix + "TempDivValueListText", this.AbsTempValueListText);
                break;
        }
        this.log("D","SetTempDecreaseModeValueLists done");
    }

    //==========================================================================================================================
    async SetProfileValueList() { //Einträge für Vis Profil Valuelist erstellen
        this.log("D","SetProfileValueList called " + this.NumberOfProfiles);

        let ProfileValueListValue = "";
        let ProfileValueListText = "";

        for (let x = 1; x <= this.NumberOfProfiles; x++) {
            this.log("D","SetProfileValueList x= " + x);
            ProfileValueListValue = ProfileValueListValue + ";" + x;
            ProfileValueListText = ProfileValueListText + ";" + x;
        }

        this.log("D","SetProfileValueList " + ProfileValueListValue);

        ProfileValueListValue = ProfileValueListValue.slice(1);
        ProfileValueListText = ProfileValueListText.slice(1);

        await this.adapter.setStateAsync(this.praefix + "ProfileValueListValue", ProfileValueListValue);
        await this.adapter.setStateAsync(this.praefix + "ProfileValueListText", ProfileValueListText);

        this.log("D","SetProfileValueList done");
    }

    //==========================================================================================================================
    async CreateCurrentTimePeriodTrigger() {

        this.log("D","CreateCurrentTimePeriodTrigger called");

        this.log("D","reaching CreateCurrentTimePeriodTrigger - Oldroom= " + this.OldChoosenRoom + " ChoosenRoom= " + this.ChoosenRoom);
        if (this.OldChoosenRoom != "none" && this.OldChoosenRoom != "") { //Wenn kein Oldroom angegeben kein unsubscribe machen
            this.adapter.unsubscribeStates(this.hcpraefix + "Rooms." + this.OldChoosenRoom + ".ActiveTimeSlot"); //Trigger auf vorherigen Raum löschen
            this.log("D","Trigger für Raum " + this.OldChoosenRoom + " gelöscht, und für Raum " + this.ChoosenRoom + " gesetzt.");

        }

        this.adapter.subscribeStates(this.hcpraefix + "Rooms." + this.ChoosenRoom + ".ActiveTimeSlot");
        //ist unten in HandleStates
        /*
        on(this.hcpraefix + "Rooms." + this.ChoosenRoom + ".ActiveTimeSlot", function (dp) { //Neuen Trigger setzen
            if (this.RefreshingVis == false) this.adapter.setState(this.praefix + "RoomValues." + "CurrentTimePeriod", dp.state.val);//Wenn Änderung des akuellen Zeitslots im aktuell gewählten Raum
        });
        */

        this.log("D","CreateCurrentTimePeriodTrigger done");
    }

    //==========================================================================================================================
    async SetTrigger() {
        this.adapter.subscribeStates(this.praefix + "ChoosenRoom");

        this.adapter.subscribeStates(this.praefix + "RoomValues." + "MinimumTemperature");
        this.adapter.subscribeStates(this.praefix + "RoomValues." + "TemperaturOverride");
        this.adapter.subscribeStates(this.praefix + "RoomValues." + "TemperaturOverrideTime");

        this.adapter.subscribeStates(this.praefix + "TempDecreaseValues." + "AbsentDecrease");
        this.adapter.subscribeStates(this.praefix + "TempDecreaseValues." + "GuestIncrease");
        this.adapter.subscribeStates(this.praefix + "TempDecreaseValues." + "PartyDecrease");
        this.adapter.subscribeStates(this.praefix + "TempDecreaseValues." + "VacationAbsentDecrease");
        this.adapter.subscribeStates(this.praefix + "TempDecreaseValues." + "WindowOpenDecrease");

        const Rooms = this.UsedRooms.split(";");
        for (let x = 0; x <= Rooms.length - 1; x++) {
            this.log("D",x + " " + Rooms[x]);
            this.adapter.subscribeStates(this.hcpraefix + "Rooms." + Rooms[x] + ".WindowIsOpen"); //Wenn Fensterstatus sich ändert
        }

        switch (this.ProfileType) { //Trigger für Vis Zeit und Temperatur je nach Profiltyp
            default:
                this.log("E", "unknown profile type " + this.ProfileType);
                break;
            case "Mo - Su": //Version1 Alle Tage zusammen
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Mo-Su.Periods." + x + ".Temperature");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Mo-Su.Periods." + x + ".time");
                }
                break;
            case "Mo - Fr / Sa - Su": //Version2
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Mo-Fr.Periods." + x + ".Temperature");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Mo-Fr.Periods." + x + ".time");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Sa-So.Periods." + x + ".Temperature");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Sa-So.Periods." + x + ".time");
                }
                break;
            case "every Day": //Version3
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Mon.Periods." + x + ".Temperature");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Mon.Periods." + x + ".time");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Tue.Periods." + x + ".Temperature");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Tue.Periods." + x + ".time");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Wed.Periods." + x + ".Temperature");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Wed.Periods." + x + ".time");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Thu.Periods." + x + ".Temperature");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Thu.Periods." + x + ".time");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Fri.Periods." + x + ".Temperature");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Fri.Periods." + x + ".time");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Sat.Periods." + x + ".Temperature");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Sat.Periods." + x + ".time");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Sun.Periods." + x + ".Temperature");
                    this.adapter.subscribeStates(this.praefix + "ProfileTypes.Sun.Periods." + x + ".time");
                }
                break;
        }
    }

    //==========================================================================================================================
    async HandleStateChanges(id, state) {

        let bRet = true;
        this.log("D","HandleStateChanges " + id + " with " + state.val + " refreshVis " + this.RefreshingVis);

        const ids = id.split(".");

        if (ids[3] === "ChoosenRoom") {

            this.OldChoosenRoom = this.ChoosenRoom;
            this.ChoosenRoom = state.val;

            this.log("D","HandleStateChanges ChoosenRoom; old " + this.OldChoosenRoom + " new " + this.ChoosenRoom);
            await this.SetVis();
            await this.CreateCurrentTimePeriodTrigger(); // wieder ein olvalue //Sonderfall - Um die aktuelle Periode anzeigen zu können muss ein wechselnder Trigger auf den aktuellen Raum im HC Rooms Zweig gesetzt und bei wechsel wieder gelöscht werden
        }
        //heatingcontrol.0.Rooms.Schlafzimmer.ActiveTimeSlot
        else if (ids[4] === "ActiveTimeSlot") {
            this.log("D","HandleStateChanges ActiveTimeSlot " + state.val);
            if (this.RefreshingVis === false) {
                await this.adapter.setStateAsync(this.praefix + "RoomValues." + "CurrentTimePeriod", state.val);//Wenn Änderung des akuellen Zeitslots im aktuell gewählten Raum
            }
        }
        else if (ids[4] == "WindowIsOpen") {
            this.log("D","HandleStateChanges WindowIsOpen " + state.val);
            //Raum suchen 
            const curRoom = ids[3];
            const Rooms = this.UsedRooms.split(";");

            for (let i = 0; i < Rooms.length; i++) {

                if (Rooms[i] == curRoom) {
                    this.log("D","HandleStateChanges WindowIsOpen room found ");
                    this.WindowState[i] = state.val;
                    const timestamp = state.lc / 1000.0;

                    this.WindowStateTimeStamp[i] = this.TimeConverter(timestamp);
                    await this.SetWindowState();
                    await this.CreateWindowStatesTable();
                    this.log("D",this.WindowState[i]);
                }
            }
        }
        //HeatingControl.0.vis.ProfileTypes.Mon.Periods.0.Temperature
        else if (ids[3] === "ProfileTypes") {
            if (ids[7] === "time") {
                this.log("D","HandleStateChanges time " + ids[4] + " " + state.val + " " + ids[6]);
                if (this.RefreshingVis === false) {
                    await this.SetTimeTempValue(ids[4], "time", state.val, ids[6]);
                }
            }
            else if (ids[7] === "Temperature") {
                this.log("D","HandleStateChanges Temperature " + ids[4] + " " + state.val + " " + ids[6]);
                if (this.RefreshingVis === false) {
                    await this.SetTimeTempValue(ids[4], "Temperature", state.val, ids[6]);
                }
            }
        }
        else if (ids[3] === "TempDecreaseValues") {
            this.log("D","HandleStateChanges TempDecreaseValues " + " with " + state.val);
            if (ids[4] === "AbsentDecrease") {
                if (this.RefreshingVis === false) {
                    await this.SetDecreaseValue("AbsentDecrease", state.val);
                }
            }
            else if (ids[4] === "GuestIncrease") {
                if (this.RefreshingVis === false) {
                    await this.SetDecreaseValue("GuestIncrease", state.val);
                }
            }
            else if (ids[4] === "PartyDecrease") {
                if (this.RefreshingVis === false) {
                    await this.SetDecreaseValue("PartyDecrease", state.val);
                }
            }
            else if (ids[4] === "VacationAbsentDecrease") {
                if (this.RefreshingVis === false) {
                    await this.SetDecreaseValue("VacationAbsentDecrease", state.val);
                }
            }
            else if (ids[4] === "WindowOpenDecrease") {
                if (this.RefreshingVis === false) {
                    await this.SetDecreaseValue("WindowOpenDecrease", state.val);
                }
            }
        }
        else if (ids[3] === "RoomValues") {

            this.log("D","HandleStateChanges RoomValues " + id + " " + state.val);

            if (ids[4] === "MinimumTemperature") {
                this.log("D","HandleStateChanges MinimumTemperature " );
                if (this.RefreshingVis === false) {
                    await this.SetRoomValue("MinimumTemperature", state.val);
                }
            }
            else if (ids[4] === "TemperaturOverride") {
                this.log("D","HandleStateChanges TemperaturOverride ");
                if (this.RefreshingVis === false) {
                    await this.SetRoomValue("TemperaturOverride", state.val);
                }
            }
            else if (ids[4] === "TemperaturOverrideTime") {
                this.log("D","HandleStateChanges TemperaturOverrideTime ");
                if (this.RefreshingVis === false) {
                    await this.SetRoomValue("TemperaturOverrideTime", state.val);
                }
            }
        }
        else {
            this.log("D","HandleStateChanges not handled " + id);
            bRet = false;
        }

        return bRet;
    }

    //==========================================================================================================================
    async Change_CurrentProfile(newProfile) {
        this.CurrentProfile = newProfile;
        await this.SetVis();
    }
    
    //==========================================================================================================================

}

module.exports = HeatingControlVis;
