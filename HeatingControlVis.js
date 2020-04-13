//Mapping Skript zum Adapter HeatingControl V 0.3.19 oder höher
// Skriptversion 1.0.5 Stand 23.3.2020 - https://github.com/Pittini/iobroker-heatingcontrol-vis



class HeatingControlVis {

    //==========================================================================================================================
    log(msg) {
        this.adapter.log.debug(msg);
    }


    constructor(adapter) {
        this.adapter = adapter;

        this.log("constructor called");

        this.Init();
    }

    async Init() {

        this.log("init called");

        //    const praefix = "javascript.0.vis.HeatingControl."; //Grundpfad für Script DPs
        //    const hcpraefix = "heatingcontrol.0."; //Pfad zu HeatingControlDatenpunkten

        this.praefix = "vis."; //Grundpfad für Script DPs
        this.hcpraefix = ""; //Pfad zu HeatingControlDatenpunkten

        this.logging = true; //Logmeldungen an/ab schalten
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

        //HeatingControl Werte einlesen bei Scriptstart
        //Infobereich
        let temp = await this.adapter.getStateAsync(this.hcpraefix + "info.NumberOfProfiles");
        this.NumberOfProfiles = temp.val;
        this.log("NumberOfProfiles " + JSON.stringify(this.NumberOfProfiles));
        temp = await this.adapter.getStateAsync(this.hcpraefix + "info.UsedRooms");
        this.UsedRooms = temp.val;
        this.log("UsedRooms " + JSON.stringify(this.UsedRooms));
        temp = await this.adapter.getStateAsync(this.hcpraefix + "info.NumberOfPeriods");
        this.NumberOfPeriods = temp.val;
        this.log("NumberOfPeriods " + JSON.stringify(this.NumberOfPeriods));
        temp = await this.adapter.getStateAsync(this.hcpraefix + "info.ProfileType");
        this.ProfileType = temp.val;
        this.log("ProfileType " + JSON.stringify(this.ProfileType));
        temp = await this.adapter.getStateAsync(this.hcpraefix + "info.TemperatureDecreaseMode");
        this.TempDecreaseMode = temp.val;
        this.log("TempDecreaseMode " + JSON.stringify(this.TempDecreaseMode));

        this.log("111");

        // Currently not in use, disabled
        // this.TemperatureDecreaseMode = getState(hcpraefix + "info.TemperatureDecreaseMode").val;
        // this.PublicHolidayLikeSunday = getState(hcpraefix + "info.PublicHolidayLikeSunday").val;

        // Main Root Bereich
        temp = await this.adapter.getStateAsync(this.hcpraefix + "CurrentProfile");
        this.CurrentProfile = temp.val - 1;
        this.log("123 " + JSON.stringify(this.UsedRooms));
        //RoomsBereich
        this.Rooms = this.UsedRooms.split(";"); //Raumliste in Array wandeln für Fensterüberwachung

        this.log("rooms" + JSON.stringify(this.Rooms));

        this.WindowState = []; //Fensterstatus pro Raum, Index korreliert mit Rooms[]
        this.WindowStateTimeStamp = [];
        this.OpenWindowRoomCount = 0;

        // Einmalig beim Programmstart alle States erzeugen, sofern nicht schon geschehen
        this.states = [];
        let y = 0;

        this.log("Profiltype " + this.ProfileType);

        //States für Zeit/Temp Einstellung
        switch (this.ProfileType) {
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

        this.log("init done");

        this.main();
    }

    //==========================================================================================================================
    async CreateStates() {
        this.log("CreateStates called");

        //Alle States anlegen, Main aufrufen wenn fertig
        this.log("222 " + this.states.length);
        //this.states.forEach(function (state) {
        for (let i = 0; i < this.states.length; i++) {
            this.log("creating " + this.states[i].id);

            await this.adapter.setObjectNotExistsAsync(this.states[i].id, {
                type: "state",
                common: this.states[i].common,
                val: this.states[i].initial
            });

            
        }

        this.log("CreateStates done");
    }
    //==========================================================================================================================
    async main() {

        this.log("main called");

        await this.InitRoom(); //Gewählten Raum einlesen, bei Erststart default setzen

        await this.InitWindowStates(); //Fensterstati einlesen

        await this.CreateWindowStatesTable(); //Fensterstati Liste erzeugen

        //ValueList Vorgabewerte anhand Profileinstellungen erzeugen
        await this.SetProfileValueList(); //ValueList Vorgaben für Profile erzeugen

        await this.SetTempDecreaseModeValueLists();//ValueList Vorgaben (Werte und Texte) für Decreasemodes erzeugen

        await this.CreateCurrentTimePeriodTrigger("none"); //TimeperiodTrigger für aktuellen Raum wählen

        await this.SetTrigger();    //Trigger erzeugen

        await this.SetVis(); // Vis initialisieren

        this.log("main done");
    }

    //==========================================================================================================================
    async InitRoom() { //Gewählten Raum einlesen, bei Erststart default= erster in der Raumliste setzen

        this.log("InitRoom called ");
        let temp = await this.adapter.getStateAsync(this.praefix + "ChoosenRoom");
        this.ChoosenRoom = temp.val;


        if (this.ChoosenRoom == "") { //Wenn bei erstem Start noch kein Raum vorhanden (nach anlegen der States), verwende ersten Raum aus der Raumliste

            temp = await this.adapter.getStateAsync("heatingcontrol.0.info.UsedRooms");
            const dummy = temp.val;
            if (dummy.includes(";")) { //Wenn ein semikolon in der Raumliste vorhanden ist, sind auch mehrere Räume vorhanden, davon nachfolgend den ersten extrahieren
                this.ChoosenRoom = dummy.substring(0, dummy.indexOf(";")); //In Raumliste nach dem Semikolon suchen und alles links davon extrahieren
                if (this.logging) this.log("ChoosenRoom=" + this.ChoosenRoom);
            }
            else {
                this.ChoosenRoom = dummy; //Wenn nur ein Raum in Raumliste, diesen verwenden
            }
            await this.adapter.setStateAsync(this.praefix + "ChoosenRoom", this.ChoosenRoom); //Bei Erststart ChoosenRoom auf default= erster in der Raumliste setzen
        }
        this.log("InitRoom done, choosen room is " + this.ChoosenRoom);
    }

    //==========================================================================================================================
    TimeConverter(UNIX_timestamp) {
        const a = new Date(UNIX_timestamp * 1000);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const year = a.getFullYear();
        const month = months[a.getMonth()];
        const date = a.getDate();
        const hour = a.getHours();
        const min = a.getMinutes();
        const sec = a.getSeconds();
        const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    }

    //==========================================================================================================================
    async InitWindowStates() { //Bei Programmstart alle Raum/Fensterstati einlesen
        this.log("InitWindowStates called ");
        for (let x = 0; x <= this.Rooms.length - 1; x++) { //Alle Räume durchlaufen

            let temp = await this.adapter.getStateAsync(this.hcpraefix + "Rooms." + this.Rooms[x] + ".WindowIsOpen");
            this.WindowState[x] = temp.val;

            temp = await this.adapter.getStateAsync(this.hcpraefix + "Rooms." + this.Rooms[x] + ".WindowIsOpen");
            const timestamp = temp.lc/1000.0;

            this.WindowStateTimeStamp[x] = this.TimeConverter(timestamp);
            this.log("timestamp " + timestamp + " = " + this.WindowStateTimeStamp[x] );

            //this.WindowStateTimeStamp[x] = formatDate(timestamp, "TT.MM.JJJJ SS:mm:ss");
        }
        this.log("InitWindowStates done ");
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
        this.log("CreateWindowStatesTable called ");
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
        if (this.logging) this.log(HtmlTable);

        this.log("CreateWindowStatesTable done ");
    }

    //==========================================================================================================================
    SetTimeTempValue(ProfileDays, What, ScriptDpVal, Period) { //Werte vom Vis, Bereich Zeit/Temperatur, in AdapterDPs schreiben
        if (this.RefreshingVis == false) {
            this.log(typeof (ScriptDpVal));
            if (this.logging) this.log("Reaching SetTimeTempValue");
            if (this.logging) this.log("SetTimeTempValue: " + this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + ProfileDays + ".Periods." + Period + "." + What + " set to " + ScriptDpVal);
            this.adapter.setState(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + ProfileDays + ".Periods." + Period + "." + What, ScriptDpVal);
        }
    }

    //==========================================================================================================================
    SetDecreaseValue(What, ScriptDpVal) {//Werte vom Vis, Bereich Absenkungen, in AdapterDPs schreiben
        if (this.RefreshingVis == false) {
            if (this.logging) this.log("Reaching SetDecreaseValue");
            if (this.logging) this.log("SetDecreasValue: " + this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + What + " set to " + ScriptDpVal);
            this.adapter.setState(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + What, ScriptDpVal);
        }
    }

    //==========================================================================================================================
    SetRoomValue(What, ScriptDpVal) {
        if (this.RefreshingVis == false) {
            if (this.logging) this.log("Reaching SetDecreaseValue");
            if (this.logging) this.log("SetRoomValue: " + this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + What + " set to " + ScriptDpVal);
            this.adapter.setState(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + What, ScriptDpVal);
        }
    }

    //==========================================================================================================================
    SetWindowState() { //Fenster offenstatus für einzelnen Raum/Fenster festlegen
        if (this.logging) this.log("Reaching SetWindowState");
        this.adapter.setState(this.praefix + "RoomValues." + "WindowIsOpen", this.adapter.setState(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "WindowIsOpen").val);
    }

    //==========================================================================================================================
    async SetVis() { // Vis Daten durch Adapterdaten ersetzen bei Umschaltung Raum oder Profil

        this.log("SetVis called");

        if (this.logging) this.log("Reaching SetVis");
        this.RefreshingVis = true; //Um zu vermeiden dass es ne Schleife gibt wo die Vis Aktualisierung bei Raumwechsel als Änderung gewertet wird
        let temp;
        switch (this.ProfileType) { //Profiltyp abhängige Zeit und Temperaturwerte setzen
            case "Mo - Su":
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mo-Su.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mo-Su.Periods." + x + ".Temperature", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mo-Su.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mo-Su.Periods." + x + ".time", temp.val);
                }
                break;
            case "Mo - Fr / Sa - Su":
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mo-Fr.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mo-Fr.Periods." + x + ".Temperature", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mo-Fr.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mo-Fr.Periods." + x + ".time", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sa-So.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sa-So.Periods." + x + ".Temperature", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sa-So.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sa-So.Periods." + x + ".time", temp.val);
                }
                break;
            case "every Day":
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mon.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mon.Periods." + x + ".Temperature", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Mon.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Mon.Periods." + x + ".time", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Tue.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Tue.Periods." + x + ".Temperature", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Tue.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Tue.Periods." + x + ".time", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Wed.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Wed.Periods." + x + ".Temperature", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Wed.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Wed.Periods." + x + ".time", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Thu.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Thu.Periods." + x + ".Temperature", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Thu.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Thu.Periods." + x + ".time", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Fri.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Fri.Periods." + x + ".Temperature", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Fri.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Fri.Periods." + x + ".time", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sat.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sat.Periods." + x + ".Temperature", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sat.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sat.Periods." + x + ".time", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sun.Periods." + x + ".Temperature");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sun.Periods." + x + ".Temperature", temp.val);
                    temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + "Sun.Periods." + x + ".time");
                    await this.adapter.setStateAsync(this.praefix + "ProfileTypes.Sun.Periods." + x + ".time", temp.val);
                }
                break;
        }
        //DecreaseMode Werte setzen
        temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + "AbsentDecrease");
        await this.adapter.setStateAsync(this.praefix + "TempDecreaseValues." + "AbsentDecrease", temp.val);
        temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + "GuestIncrease");
        await this.adapter.setStateAsync(this.praefix + "TempDecreaseValues." + "GuestIncrease", temp.val);
        temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + "PartyDecrease");
        await this.adapter.setStateAsync(this.praefix + "TempDecreaseValues." + "PartyDecrease", temp.val);
        temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + "VacationAbsentDecrease");
        await this.adapter.setStateAsync(this.praefix + "TempDecreaseValues." + "VacationAbsentDecrease", temp.val);
        temp = await this.adapter.getStateAsync(this.hcpraefix + "Profiles." + this.CurrentProfile + "." + this.ChoosenRoom + "." + this.TempDecreaseMode + "." + "WindowOpenDecrease");
        await this.adapter.setStateAsync(this.praefix + "TempDecreaseValues." + "WindowOpenDecrease", temp.val);

        //Raum Werte setzen
        
        temp = await this.adapter.getStateAsync(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "MinimumTemperature");
        if (temp != null && temp.val != 0 ) { //Prüfen ob Minimum Temp Null ist

            temp = await this.adapter.getStateAsync(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "MinimumTemperature");
            await this.adapter.setStateAsync(this.praefix + "RoomValues." + "MinimumTemperature", temp.val);
        }
        else {
            await this.adapter.setStateAsync(this.praefix + "RoomValues." + "MinimumTemperature", 0);
            this.log("MinimumTemp=Null, skipping entry and showing 0");
        }

        temp = await this.adapter.getStateAsync(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "TemperaturOverride");
        await this.adapter.setStateAsync(this.praefix + "RoomValues." + "TemperaturOverride", temp.val);
        temp = await this.adapter.getStateAsync(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "TemperaturOverrideTime");
        await this.adapter.setStateAsync(this.praefix + "RoomValues." + "TemperaturOverrideTime", temp.val);
        temp = await this.adapter.getStateAsync(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "WindowIsOpen")
        await this.adapter.setStateAsync(this.praefix + "RoomValues." + "WindowIsOpen", temp.val);
        temp = await this.adapter.getStateAsync(this.hcpraefix + "Rooms." + this.ChoosenRoom + "." + "ActiveTimeSlot")
        await this.adapter.setStateAsync(this.praefix + "RoomValues." + "CurrentTimePeriod", temp.val);

        setTimeout(function () { // Timeout setzt refresh status wieder zurück
            this.RefreshingVis = false;
        }, 250);
        this.log("SetVis done");
    }

    //==========================================================================================================================
    async SetTempDecreaseModeValueLists() { //Setzt die Vorgabewerte der Valuelists je nach gewähltem DecreaseMode
        this.log("SetTempDecreaseModeValueLists called");

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
        this.log("SetTempDecreaseModeValueLists done");
    }

    //==========================================================================================================================
    async SetProfileValueList() { //Einträge für Vis Profil Valuelist erstellen
        this.log("SetProfileValueList called ");

        let ProfileValueListValue = "";
        let ProfileValueListText = "";

        for (let x = 1; x <= this.NumberOfProfiles; x++) {
            ProfileValueListValue = ProfileValueListValue + ";" + x;
            ProfileValueListText = ProfileValueListText + ";" + x;
        }
        ProfileValueListValue = ProfileValueListValue.slice(1);
        ProfileValueListText = ProfileValueListText.slice(1);

        await this.adapter.setStateAsync(this.praefix+".ProfileValueListValue", ProfileValueListValue);
        await this.adapter.setStateAsync(this.praefix + ".ProfileValueListText", ProfileValueListText);

        this.log("SetProfileValueList done");
    }

    //==========================================================================================================================
    async CreateCurrentTimePeriodTrigger(OldRoom) {

        this.log("CreateCurrentTimePeriodTrigger called");

        if (this.logging) this.log("reaching CreateCurrentTimePeriodTrigger - Oldroom= " + OldRoom + " ChoosenRoom= " + this.ChoosenRoom);
        if (OldRoom != "none") { //Wenn kein Oldroom angegeben kein unsubscribe machen
            if (this.adapter.unsubscribe(this.hcpraefix + "Rooms." + OldRoom + ".ActiveTimeSlot")) { //Trigger auf vorherigen Raum löschen
                if (this.logging) this.log("Trigger für Raum " + OldRoom + " gelöscht, und für Raum " + this.ChoosenRoom + " gesetzt.");
            }
        }

        //wieder rein
        /*
        on(this.hcpraefix + "Rooms." + this.ChoosenRoom + ".ActiveTimeSlot", function (dp) { //Neuen Trigger setzen
            if (this.RefreshingVis == false) this.adapter.setState(this.praefix + "RoomValues." + "CurrentTimePeriod", dp.state.val);//Wenn Änderung des akuellen Zeitslots im aktuell gewählten Raum
        });
        */

        this.log("CreateCurrentTimePeriodTrigger done");
    }

    //==========================================================================================================================
    async SetTrigger() {
        //wieder rein
        /*

        // !!!!!!!!!
        // Änderungen im admin führen zum restart, und neu einlesen, deshalb hier nicht notwendig

        //Trigger für HC Info Daten aus Admin
        on(this.hcpraefix + "info.NumberOfProfiles", function (dp) { //Wenn Anzahl der Profile im Admin geändert
            this.NumberOfProfiles = dp.state.val;
            this.SetProfileValueList();
        });
        on(this.hcpraefix + "info.NumberOfPeriods", function (dp) { //Wenn Anzahl der Perioden im Admin geändert
            this.NumberOfPeriods = dp.state.val - 1;
        });
        on(this.hcpraefix + "info.ProfileType", function (dp) { //Wenn Änderung Profiltyp im Admin
            this.ProfileType = dp.state.val;
        });
        on(this.hcpraefix + "info.TemperatureDecreaseMode", function (dp) { //Wenn Änderung des DecreaseModes im Admin
            this.TempDecreaseMode = dp.state.val;
        });
        on(this.hcpraefix + "info.UsedRooms", function (dp) { //Wenn Änderung der UsedRooms im Admin
            this.UsedRooms = dp.state.val;
        });

        // Currently not in use, disabled
        
        //on(hcpraefix + "info.PublicHolidayLikeSunday", function (dp) { //Wenn 
        //    PublicHolidayLikeSunday = dp.state.val;
        //});
        

        //Trigger HC Main Root
        on(this.hcpraefix + "CurrentProfile", function (dp) { //Wenn Änderung des Profils
            this.CurrentProfile = dp.state.val - 1;
            this.SetVis();
        });

        //Trigger Script Dps
        //Root
        on(this.praefix + "ChoosenRoom", function (dp) { //Wenn Änderung des Raums
            this.ChoosenRoom = dp.state.val;
            this.SetVis();
            this.CreateCurrentTimePeriodTrigger(dp.oldState.val); //Sonderfall - Um die aktuelle Periode anzeigen zu können muss ein wechselnder Trigger auf den aktuellen Raum im HC Rooms Zweig gesetzt und bei wechsel wieder gelöscht werden
        });

        //Trigger für RaumDPs
        on(this.praefix + "RoomValues." + "MinimumTemperature", function (dp) { //Wenn 
            if (this.RefreshingVis == false) this.SetRoomValue("MinimumTemperature", dp.state.val);
        });
        on(this.praefix + "RoomValues." + "TemperaturOverride", function (dp) { //Wenn 
            if (this.RefreshingVis == false) this.SetRoomValue("TemperaturOverride", dp.state.val);
        });
        on(this.praefix + "RoomValues." + "TemperaturOverrideTime", function (dp) { //Wenn 
            if (this.RefreshingVis == false) this.SetRoomValue("TemperaturOverrideTime", dp.state.val);
        });

        //Trigger für alle Fenster Stati
        for (let x = 0; x <= this.UsedRooms.split(";").length - 1; x++) {
            if (this.logging) this.log(x + " " + this.Rooms[x]);
            on(this.hcpraefix + "Rooms." + this.Rooms[x] + ".WindowIsOpen", function (dp) { //Wenn Fensterstatus sich ändert
                this.WindowState[x] = dp.state.val;
                this.WindowStateTimeStamp[x] = formatDate(dp.state.lc, "TT.MM.JJJJ SS:mm:ss");
                this.SetWindowState();
                this.CreateWindowStatesTable();
                if (this.logging) this.log(this.WindowState[x]);
            });
        }

        //Trigger für DecreaseModes
        on(this.praefix + "TempDecreaseValues." + "AbsentDecrease", function (dp) { //Wenn 
            if (this.RefreshingVis == false) this.SetDecreaseValue("AbsentDecrease", dp.state.val);
        });
        on(this.praefix + "TempDecreaseValues." + "GuestIncrease", function (dp) { //Wenn 
            if (this.RefreshingVis == false) this.SetDecreaseValue("GuestIncrease", dp.state.val);
        });
        on(this.praefix + "TempDecreaseValues." + "PartyDecrease", function (dp) { //Wenn 
            if (this.RefreshingVis == false) this.SetDecreaseValue("PartyDecrease", dp.state.val);
        });
        on(this.praefix + "TempDecreaseValues." + "VacationAbsentDecrease", function (dp) { //Wenn 
            if (this.RefreshingVis == false) this.SetDecreaseValue("VacationAbsentDecrease", dp.state.val);
        });
        on(this.praefix + "TempDecreaseValues." + "WindowOpenDecrease", function (dp) { //Wenn 
            if (this.RefreshingVis == false) this.SetDecreaseValue("WindowOpenDecrease", dp.state.val);
        });

        switch (this.ProfileType) { //Trigger für Vis Zeit und Temperatur je nach Profiltyp
            case "Mo - Su": //Version1 Alle Tage zusammen
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    on(this.praefix + "ProfileTypes.Mo-Su.Periods." + x + ".Temperature", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Mo-Su", "Temperature", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Mo-Su.Periods." + x + ".time", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Mo-Su", "time", dp.state.val, x);
                    });
                }
                break;
            case "Mo - Fr / Sa - Su": //Version2
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    on(this.praefix + "ProfileTypes.Mo-Fr.Periods." + x + ".Temperature", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Mo-Fr", "Temperature", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Mo-Fr.Periods." + x + ".time", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Mo-Fr", "time", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Sa-So.Periods." + x + ".Temperature", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Sa-So", "Temperature", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Sa-So.Periods." + x + ".time", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Sa-So", "time", dp.state.val, x);
                    });
                }
                break;
            case "every Day": //Version3
                for (let x = 0; x <= this.NumberOfPeriods - 1; x++) {
                    on(this.praefix + "ProfileTypes.Mon.Periods." + x + ".Temperature", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Mon", "Temperature", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Mon.Periods." + x + ".time", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Mon", "time", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Tue.Periods." + x + ".Temperature", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Tue", "Temperature", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Tue.Periods." + x + ".time", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Tue", "time", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Wed.Periods." + x + ".Temperature", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Wed", "Temperature", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Wed.Periods." + x + ".time", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Wed", "time", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Thu.Periods." + x + ".Temperature", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Thu", "Temperature", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Thu.Periods." + x + ".time", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Thu", "time", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Fri.Periods." + x + ".Temperature", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Fri", "Temperature", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Fri.Periods." + x + ".time", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Fri", "time", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Sat.Periods." + x + ".Temperature", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Sat", "Temperature", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Sat.Periods." + x + ".time", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Sat", "time", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Sun.Periods." + x + ".Temperature", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Sun", "Temperature", dp.state.val, x);
                    });
                    on(this.praefix + "ProfileTypes.Sun.Periods." + x + ".time", function (dp) { //Wenn 
                        if (this.RefreshingVis == false) this.SetTimeTempValue("Sun", "time", dp.state.val, x);
                    });
                }
                break;
        }
    */
    }

    

}

module.exports = HeatingControlVis;
