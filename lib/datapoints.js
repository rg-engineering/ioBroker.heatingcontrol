
"use strict";

const GetUsedRooms = require("./database.js").GetUsedRooms;
const GetTranslation = require("./support_tools.js").GetTranslation;


let parentAdapter;
let SystemLanguage = "de";

//*******************************************************************
//
async function CreateDatapoints(adapter, language) {

    parentAdapter = adapter;
    SystemLanguage = language;



    parentAdapter.log.info("start CreateDatapoints");

    try {
        //===================================================================================
        await CreateDatapoint("LastProgramRun", "state", "value", "string", "", true, false);
        await CreateDatapoint("CurrentProfile", "state", "value", "number", "", true, true);
        await CreateDatapoint("HeatingPeriodActive", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("PublicHolidyToday", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("Present", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("PartyNow", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("GuestsPresent", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("HolidayPresent", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("VacationAbsent", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("MaintenanceActive", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("PowerInterruptionPeriodActive", "state", "value", "boolean", "", true, true);

        if (parentAdapter.config.UseActors) {
            await CreateDatapoint("ActorsOn", "state", "value", "number", "", true, false);
        }
        if (parentAdapter.config.UseFireplaceMode) {
            await CreateDatapoint("FireplaceModeActive", "state", "value", "boolean", "", true, true);
        }


        //===================================================================================
        await CreateDatapoint("info", "channel", "", "string", "", true, false);
        await CreateDatapoint("info.UsedRooms", "state", "value", "string", "", true, false);
        await CreateDatapoint("info.TemperatureDecreaseMode", "state", "value", "string", "", true, false);
        await CreateDatapoint("info.ProfileType", "state", "value", "string", "", true, false);
        await CreateDatapoint("info.NumberOfProfiles", "state", "value", "number", "", true, false);
        await CreateDatapoint("info.NumberOfPeriods", "state", "value", "number", "", true, false);
        await CreateDatapoint("info.PublicHolidayLikeSunday", "state", "value", "boolean", "", true, false);
        await CreateDatapoint("info.UseMinTempPerRoom", "state", "value", "boolean", "", true, false);
        await CreateDatapoint("info.UseFixHeatingPeriod", "state", "value", "boolean", "", true, false);
        if (parentAdapter.config.UseFixHeatingPeriod) {
            await CreateDatapoint("info.FixHeatingPeriodStart", "state", "value", "string", "", true, false);
            await CreateDatapoint("info.FixHeatingPeriodEnd", "state", "value", "string", "", true, false);
        }

        //===================================================================================
        await CreateDatapoint("Rooms", "channel", "", "string", "", true, false);
        for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
            if (parentAdapter.config.rooms[room].isActive) {

                const key = "Rooms." + parentAdapter.config.rooms[room].name;
                await CreateDatapoint(key, "channel", "", "string", "", true, false);

                await CreateDatapoint(key + ".CurrentTarget", "state", "value", "number", "°C", true, false, "current target temperature");
                await CreateDatapoint(key + ".ActiveTimeSlot", "state", "value", "number", "", true, false,"current timeslot in timeperiod");
                await CreateDatapoint(key + ".CurrentTimePeriodFull", "state", "value", "string", "", true, false, "full name of current timeperiod");
                await CreateDatapoint(key + ".CurrentTimePeriod", "state", "value", "number", "", true, false, "current overall timeperiod");
                await CreateDatapoint(key + ".CurrentTimePeriodTime", "state", "value", "string", "", true, false, "start time of current timeperiod");
                await CreateDatapoint(key + ".CurrentTimePeriodTemperature", "state", "level.temperature", "number", "°C", true, false, "target temperature of current timeperiod");
                await CreateDatapoint(key + ".WindowIsOpen", "state", "value", "boolean", "", true, false);
                await CreateDatapoint(key + ".State", "state", "value", "string", "", true, false);
                await CreateDatapoint(key + ".TemperaturOverride", "state", "level.temperature", "number", "°C", true, true);
                await CreateDatapoint(key + ".TemperaturOverrideTime", "state", "level.timer", "string", "hh:mm", true, true);
                await CreateDatapoint(key + ".TemperaturOverrideRemainingTime", "state", "value", "number", "min", true, false);
                await CreateDatapoint(key + ".StatusLog", "state", "value", "string", "", true, false);
                await CreateDatapoint(key + ".isActive", "state", "value", "boolean", "", true, true);

                if (parentAdapter.config.ThermostatModeIfNoHeatingperiod == 1) {
                    await CreateDatapoint(key + ".TemperatureIfNoHeatingPeriod", "state", "level.temperature", "number", "°C", true, true);
                }
                if (parentAdapter.config.UseMinTempPerRoom) {
                    await CreateDatapoint(key + ".MinimumTemperature", "state", "level.temperature", "number", "°C", true, true);
                }
                //not used anymore
                //if (parseInt(parentAdapter.config.UseChangesFromThermostat) === 4) { //each room reparately
                //    await CreateDatapoint(key + ".ChangesFromThermostatMode", "state", "value", "number", "", true, true);
                //}
                if (parseInt(parentAdapter.config.UseChangesFromThermostat) > 1) {
                    await CreateDatapoint(key + ".ResetManual", "state", "button", "boolean", "", false, true);
                }

                if (parentAdapter.config.UseAddTempSensors) {
                    await CreateDatapoint(key + ".TemperatureOffset", "state", "value", "number", "°C", true, true);

                }

                if (parseInt(parentAdapter.config.regulatorType) == 2) {
                    await CreateDatapoint(key + ".Regulator.HysteresisOnOffset", "state", "value", "number", "°C", true, true);
                    await CreateDatapoint(key + ".Regulator.HysteresisOffOffset", "state", "value", "number", "°C", true, true);
                }

            }
        }

        //===================================================================================
        await CreateDatapoint("Profiles", "channel", "", "string", "", true, false);
        for (let profile = 1; profile <= parseInt(parentAdapter.config.NumberOfProfiles, 10); profile++) {
            const key = "Profiles." + profile;
            await CreateDatapoint(key, "channel", "", "string", "", true, false);

            await CreateDatapoint(key + ".ProfileName", "state", "value", "string", "", true, true);

            if (parseInt(parentAdapter.config.NumberOfProfiles, 10) > profile) {
                await CreateDatapoint(key + ".CopyProfile", "state", "button", "boolean", "", false, true);
            }


            for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
                if (parentAdapter.config.rooms[room].isActive) {
                    const id = key + "." + parentAdapter.config.rooms[room].name;
                    await CreateDatapoint(id, "channel", "", "string", "", true, false);

                    let id1 = id;

                    if (parseInt(parentAdapter.config.NumberOfProfiles, 10) > profile) {
                        await CreateDatapoint(id + ".CopyProfile", "state", "button", "boolean", "", false, true);
                    }

                    if (parseInt(parentAdapter.config.ProfileType, 10) === 1) {
                        await CreateDatapoint(id1 + ".Mo-Su", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Mo-Su.Periods", "channel", "", "string", "", true, false);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Mo-Su.Periods." + period;
                            await CreateStates4Period(id);
                        }
                        
                    }
                    else if (parseInt(parentAdapter.config.ProfileType, 10) === 2) {
                        await CreateDatapoint(id1 + ".Mo-Fr", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Mo-Fr.Periods", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Mo-Fr.CopyPeriods", "state", "button", "boolean", "", false, true);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Mo-Fr.Periods." + period;
                            await CreateStates4Period(id);
                        }
                       
                        await CreateDatapoint(id1 + ".Sa-Su", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Sa-Su.Periods", "channel", "", "string", "", true, false);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Sa-Su.Periods." + period;
                            await CreateStates4Period(id);
                        }
                        
                    }
                    else if (parseInt(parentAdapter.config.ProfileType, 10) === 3) {
                        await CreateDatapoint(id1 + ".Mon", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Mon.Periods", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Mon.CopyPeriods", "state", "button", "boolean", "", false, true);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Mon.Periods." + period;
                            await CreateStates4Period(id);
                        }
                        
                        await CreateDatapoint(id1 + ".Tue", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Tue.Periods", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Tue.CopyPeriods", "state", "button", "boolean", "", false, true);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Tue.Periods." + period;
                            await CreateStates4Period(id);
                        }
                        
                        await CreateDatapoint(id1 + ".Wed", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Wed.Periods", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Wed.CopyPeriods", "state", "button", "boolean", "", false, true);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Wed.Periods." + period;
                            await CreateStates4Period(id);
                        }
                        
                        await CreateDatapoint(id1 + ".Thu", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Thu.Periods", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Thu.CopyPeriods", "state", "button", "boolean", "", false, true);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Thu.Periods." + period;
                            await CreateStates4Period(id);
                        }
                       
                        await CreateDatapoint(id1 + ".Fri", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Fri.Periods", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Fri.CopyPeriods", "state", "button", "boolean", "", false, true);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Fri.Periods." + period;
                            await CreateStates4Period(id);
                        }
                      
                        await CreateDatapoint(id1 + ".Sat", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Sat.Periods", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Sat.CopyPeriods", "state", "button", "boolean", "", false, true);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Sat.Periods." + period;
                            await CreateStates4Period(id);
                        }
                        
                        await CreateDatapoint(id1 + ".Sun", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Sun.Periods", "channel", "", "string", "", true, false);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Sun.Periods." + period;
                            await CreateStates4Period(id);
                        }
                       
                    }
                    let decreaseMode = false;
                    if (parseInt(parentAdapter.config.TemperatureDecrease) === 1) {// relative
                        id1 += ".relative";
                        decreaseMode = true;
                    }
                    else if (parseInt(parentAdapter.config.TemperatureDecrease) === 2) {// absolutue
                        id1 += ".absolute";
                        decreaseMode = true;
                    }

                    if (decreaseMode) {
                        await CreateDatapoint(id1, "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".GuestIncrease", "state", "value", "number", "°C", true, true);
                        await CreateDatapoint(id1 + ".PartyDecrease", "state", "value", "number", "°C", true, true);
                        await CreateDatapoint(id1 + ".WindowOpenDecrease", "state", "value", "number", "°C", true, true);
                        await CreateDatapoint(id1 + ".AbsentDecrease", "state", "value", "number", "°C", true, true);
                        await CreateDatapoint(id1 + ".VacationAbsentDecrease", "state", "value", "number", "°C", true, true);

                        if (parentAdapter.config.UseFireplaceMode) {
                            await CreateDatapoint(id1 + ".FireplaceModeDecrease", "state", "value", "number", "°C", true, true);
                        }

                    }
                }
            }
        }

        //===================================================================================
        //pittini vis
        if (parentAdapter.config.UseVisFromPittini) {

            await CreateDatapoint("vis", "channel", "", "string", "", true, false);
            await CreateDatapoint("vis.ProfileTypes", "channel", "", "string", "", true, false);

            if (parseInt(parentAdapter.config.NumberOfProfiles, 10) > 1) {
                await CreateDatapoint("vis.ProfileTypes.CopyProfile", "state", "button", "boolean", "", false, true);
                await CreateDatapoint("vis.ProfileTypes.CopyProfileRoom", "state", "button", "boolean", "", false, true);
            }

            if (parseInt(parentAdapter.config.ProfileType, 10) === 1) {

                await CreateDatapoint("vis.ProfileTypes.Mo-Su", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Mo-Su.Periods", "channel", "", "string", "", true, false);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Mo-Su.Periods." + period;
                    await CreateStates4Period(id);
                }
            }
            else if (parseInt(parentAdapter.config.ProfileType, 10) === 2) {
                await CreateDatapoint("vis.ProfileTypes.Mo-Fr", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Mo-Fr.Periods", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Mo-Fr.CopyPeriods", "state", "button", "boolean", "", false, true);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Mo-Fr.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Sa-Su", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Sa-Su.Periods", "channel", "", "string", "", true, false);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Sa-Su.Periods." + period;
                    await CreateStates4Period(id);
                }
            }
            else if (parseInt(parentAdapter.config.ProfileType, 10) === 3) {
                await CreateDatapoint("vis.ProfileTypes.Mon", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Mon.Periods", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Mon.CopyPeriods", "state", "button", "boolean", "", false, true);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Mon.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Tue", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Tue.Periods", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Tue.CopyPeriods", "state", "button", "boolean", "", false, true);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Tue.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Wed", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Wed.Periods", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Wed.CopyPeriods", "state", "button", "boolean", "", false, true);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Wed.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Thu", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Thu.Periods", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Thu.CopyPeriods", "state", "button", "boolean", "", false, true);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Thu.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Fri", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Fri.Periods", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Fri.CopyPeriods", "state", "button", "boolean", "", false, true);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Fri.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Sat", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Sat.Periods", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Sat.CopyPeriods", "state", "button", "boolean", "", false, true);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Sat.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Sun", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Sun.Periods", "channel", "", "string", "", true, false);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Sun.Periods." + period;
                    await CreateStates4Period(id);
                }
            }

            await CreateDatapoint("vis.TempDecreaseValues", "channel", "", "string", "", true, false);
            await CreateDatapoint("vis.TempDecreaseValues.AbsentDecrease", "state", "value", "number", "°C", true, true);
            await CreateDatapoint("vis.TempDecreaseValues.GuestIncrease", "state", "value", "number", "°C", true, true);
            await CreateDatapoint("vis.TempDecreaseValues.PartyDecrease", "state", "value", "number", "°C", true, true);
            await CreateDatapoint("vis.TempDecreaseValues.VacationAbsentDecrease", "state", "value", "number", "°C", true, true);
            if (parentAdapter.config.UseFireplaceMode) {
                await CreateDatapoint("vis.TempDecreaseValues.FireplaceModeDecrease", "state", "value", "number", "°C", true, true);
            }

            await CreateDatapoint("vis.TempDecreaseValues.WindowOpenDecrease", "state", "value", "number", "°C", true, true);

            await CreateDatapoint("vis.RoomValues", "channel", "", "string", "", true, false);
            await CreateDatapoint("vis.RoomValues.MinimumTemperature", "state", "level.temperature", "number", "°C", true, true);
            await CreateDatapoint("vis.RoomValues.TemperaturOverride", "state", "level.temperature", "number", "°C", true, true);
            await CreateDatapoint("vis.RoomValues.TemperaturOverrideTime", "state", "value", "string", "hh:mm", true, true);
            await CreateDatapoint("vis.RoomValues.WindowIsOpen", "state", "value", "boolean", "", true, false);
            await CreateDatapoint("vis.RoomValues.CurrentTimePeriod", "state", "value", "number", "", true, true);
            await CreateDatapoint("vis.RoomValues.StatusLog", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.RoomValues.TemperaturOverrideRemainingTime", "state", "value", "number", "min", true, false);

            await CreateDatapoint("vis.ChoosenRoom", "state", "value", "string", "", true, true);
            await CreateDatapoint("vis.ProfileValueListValue", "state", "value", "string", "", true, true);
            await CreateDatapoint("vis.ProfileValueListText", "state", "value", "string", "", true, true);
            await CreateDatapoint("vis.TempValueListValue", "state", "value", "string", "", true, true);
            await CreateDatapoint("vis.TempAddValueListText", "state", "value", "string", "", true, true);
            await CreateDatapoint("vis.OverrideTempValueListValue", "state", "value", "string", "", true, true);
            await CreateDatapoint("vis.OverrideTempValueListText", "state", "value", "string", "", true, true);

            await CreateDatapoint("vis.ProfileTempValueListValue", "state", "value", "string", "", true, true);
            await CreateDatapoint("vis.ProfileTempValueListText", "state", "value", "string", "", true, true);

            await CreateDatapoint("vis.TempDivValueListText", "state", "value", "string", "", true, true);
            await CreateDatapoint("vis.WindowStatesHtmlTable", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.WindowStatesHtmlTableVis2", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.OpenWindowRoomCount", "state", "value", "number", "", true, false);

            await CreateDatapoint("vis.RoomStatesHtmlTable", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.isActive", "state", "value", "boolean", "", true, false);

            //translated vis text
            //cardHzngFenster
            await CreateDatapoint("vis.translations.cardHzngFenster.WindowState", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngFenster.AllWindowsClosed", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngFenster.WindowOpen", "state", "value", "string", "", true, false);

            //cardHzngGlobals
            await CreateDatapoint("vis.translations.cardHzngGlobals.HeatingPeriodActive", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngGlobals.PublicHolidayToday", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngGlobals.Present", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngGlobals.PartyNow", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngGlobals.Guests", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngGlobals.HolidayAtHome", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngGlobals.HolidayVacation", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngGlobals.FireplaceMode", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngGlobals.MaintenanceMode", "state", "value", "string", "", true, false);

            await CreateDatapoint("vis.translations.cardHzngGlobals.General", "state", "value", "string", "", true, false);




            //cardHzngMoFrSaSo
            await CreateDatapoint("vis.translations.cardHzngMoFrSaSu.Period", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoFrSaSu.MoFr", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoFrSaSu.From", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoFrSaSu.SaSu", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoFrSaSu.ZeitenWoche", "state", "value", "string", "", true, false);

            //cardHzngMoSu
            await CreateDatapoint("vis.translations.cardHzngMoSu.Period", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSu.MoSu", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSu.From", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSu.ZeitenWoche", "state", "value", "string", "", true, false);


            //cardHzngMoSuSeparat
            await CreateDatapoint("vis.translations.cardHzngMoSuSeparat.Period", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSuSeparat.From", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSuSeparat.Monday", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSuSeparat.Tuesday", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSuSeparat.Wednesday", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSuSeparat.Thursday", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSuSeparat.Friday", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSuSeparat.Saturday", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSuSeparat.Sunday", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngMoSuSeparat.ZeitenWoche", "state", "value", "string", "", true, false);

            //cardHzngProfilParam
            await CreateDatapoint("vis.translations.cardHzngProfilParam.GuestIncrease", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.GuestTemperature", "state", "level.temperature", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.PartyDecrease", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.PartyTemperature", "state", "level.temperature", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.AbsentDecrease", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.AbsentTemperature", "state", "level.temperature", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.VacationAbsentDecrease", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.VacationAbsentTemperature", "state", "level.temperature", "string", "", true, false);

            //translation always available
            //if (parentAdapter.config.UseFireplaceMode) {
            await CreateDatapoint("vis.translations.cardHzngProfilParam.FireplaceModeDecrease", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.FireplaceModeTemperature", "state", "level.temperature", "string", "", true, false);
            //}

            await CreateDatapoint("vis.translations.cardHzngProfilParam.WindowOpenDecrease", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.WindowOpenTemperature", "state", "level.temperature", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.OverrideFor", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.OverrideTemp", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.MinimalTemperature", "state", "level.temperature", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.HintNotEnabled", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.cardHzngProfilParam.Profilparam", "state", "value", "string", "", true, false);

            //tnav
            await CreateDatapoint("vis.translations.tnav.ActiveProfile", "state", "value", "string", "", true, false);
            await CreateDatapoint("vis.translations.tnav.Room", "state", "value", "string", "", true, false);

            //cardHzngRooms
            await CreateDatapoint("vis.translations.cardHzngRooms.RoomState", "state", "value", "string", "", true, false);

            //cardDateAndTime
            await CreateDatapoint("vis.translations.cardDateAndTime.Clock", "state", "value", "string", "", true, false);

        }
        DeleteUnusedDP(true);
    }
    catch (e) {
        parentAdapter.log.error("exception in CreateDatapoints [" + e + "]");

    }

    parentAdapter.log.info("CreateDatapoints done");

}

async function CreateStates4Period(id) {
    await CreateDatapoint(id, "channel", "", "string", "", true, false);
    await CreateDatapoint(id + ".time", "state", "value", "string", "hh:mm", true, true);
    await CreateDatapoint(id + ".Temperature", "state", "level.temperature", "number", "°C", true, true);

}

async function CreateDatapoint( key, type, common_role, common_type, common_unit, common_read, common_write, common_desc) {

    const names = key.split(".");
    let idx = names.length;
    let name = key;
    if (idx > 0) {
        idx--;
        name = names[idx];
    }

    await parentAdapter.setObjectNotExistsAsync(key, {
        type: type,
        common: {
            name: name,
            role: common_role,
            type: common_type,
            unit: common_unit,
            read: common_read,
            write: common_write,
            desc: common_desc
        },
        native: { id: key }
    });

    const obj = await parentAdapter.getObjectAsync(key);

    if (obj != null) {

        if (obj.common.role != common_role
            || obj.common.type != common_type
            || obj.common.unit != common_unit
            || obj.common.read != common_read
            || obj.common.write != common_write
            || obj.common.name != name
            || obj.common.desc != common_desc
        ) {
            await parentAdapter.extendObject(key, {
                common: {
                    name: name,
                    role: common_role,
                    type: common_type,
                    unit: common_unit,
                    read: common_read,
                    write: common_write,
                    desc: common_desc
                }
            });
        }
    }
}

//*******************************************************************
//
async function SetDefaults() {

    parentAdapter.log.debug("start SetDefaults");

    try {
        //===================================================================================
        await SetDefault("LastProgramRun", "");
        await SetDefault("CurrentProfile", 1);
        await SetDefault("HeatingPeriodActive", true);
        await SetDefault("PublicHolidyToday", false);
        await SetDefault("Present", true);
        await SetDefault("PartyNow", false);
        await SetDefault("GuestsPresent", false);
        await SetDefault("HolidayPresent", false);
        await SetDefault("VacationAbsent", false);
        await SetDefault("MaintenanceActive", false);
        await SetDefault("PowerInterruptionPeriodActive", false);

        if (parentAdapter.config.UseFireplaceMode) {
            await SetDefault("FireplaceModeActive", false);
        }

        if (parentAdapter.config.UseActors) {
            await SetDefault("ActorsOn", 0);
        }

        //===================================================================================
        await SetDefault("info.UsedRooms", "");
        await SetDefault("info.TemperatureDecreaseMode", "none");
        await SetDefault("info.ProfileType", "Mo - Su");
        await SetDefault("info.NumberOfProfiles", 1);
        await SetDefault("info.NumberOfPeriods", 5);
        await SetDefault("info.PublicHolidayLikeSunday", true);
        await SetDefault("info.UseMinTempPerRoom", false);
        await SetDefault("info.UseFixHeatingPeriod", false);
        if (parentAdapter.config.UseFixHeatingPeriod) {
            await SetDefault("info.FixHeatingPeriodStart", "");
            await SetDefault("info.FixHeatingPeriodEnd", "");
            
        }

        //===================================================================================
        for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
            if (parentAdapter.config.rooms[room].isActive) {

                const key = "Rooms." + parentAdapter.config.rooms[room].name;


                await SetDefault(key + ".CurrentTarget", 20);
                await SetDefault(key + ".ActiveTimeSlot", -1);
                await SetDefault(key + ".CurrentTimePeriodFull", "");
                await SetDefault(key + ".CurrentTimePeriod", "");
                await SetDefault(key + ".CurrentTimePeriodTime", "");
                await SetDefault(key + ".CurrentTimePeriodTemperature", -99);
                await SetDefault(key + ".WindowIsOpen", false);
                await SetDefault(key + ".State", "");
                await SetDefault(key + ".TemperaturOverride", 0);
                await SetDefault(key + ".TemperaturOverrideTime", "00:00");
                await SetDefault(key + ".TemperaturOverrideRemainingTime", 0);
                await SetDefault(key + ".isActive", true);

                if (parentAdapter.config.ThermostatModeIfNoHeatingperiod == 1) {
                    await SetDefault(key + ".TemperatureIfNoHeatingPeriod", 20);
                }
                if (parentAdapter.config.UseMinTempPerRoom) {
                    await SetDefault(key + ".MinimumTemperature", 5);
                }
                //if (parseInt(parentAdapter.config.UseChangesFromThermostat) === 4) { //each room reparately
                //    await SetDefault(key + ".ChangesFromThermostatMode", 0);
                //}

                if (parentAdapter.config.UseAddTempSensors) {
                    await SetDefault(key + ".TemperatureOffset", 0);
                }

                if (parseInt(parentAdapter.config.regulatorType) == 2) {
                    await SetDefault(key + ".Regulator.HysteresisOnOffset", 0.5);
                    await SetDefault(key + ".Regulator.HysteresisOffOffset", 0.5);
                }
            }
        }

        //===================================================================================
        for (let profile = 1; profile <= parseInt(parentAdapter.config.NumberOfProfiles, 10); profile++) {
            const key = "Profiles." + profile;

            for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
                if (parentAdapter.config.rooms[room].isActive) {
                    const id = key + "." + parentAdapter.config.rooms[room].name;

                    let id1 = id;

                    if (parseInt(parentAdapter.config.ProfileType, 10) === 1) {
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Mo-Su.Periods." + period;
                            await SetDefault4Period(period,id);
                        }
                    }
                    else if (parseInt(parentAdapter.config.ProfileType, 10) === 2) {
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Mo-Fr.Periods." + period;
                            await SetDefault4Period(period, id);
                        }
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Sa-Su.Periods." + period;
                            await SetDefault4Period(period, id);
                        }
                    }
                    else if (parseInt(parentAdapter.config.ProfileType, 10) === 3) {
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Mon.Periods." + period;
                            await SetDefault4Period(period, id);
                        }
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Tue.Periods." + period;
                            await SetDefault4Period(period, id);
                        }
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Wed.Periods." + period;
                            await SetDefault4Period(period, id);
                        }
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Thu.Periods." + period;
                            await SetDefault4Period(period, id);
                        }
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Fri.Periods." + period;
                            await SetDefault4Period(period, id);
                        }
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Sat.Periods." + period;
                            await SetDefault4Period(period, id);
                        }
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Sun.Periods." + period;
                            await SetDefault4Period(period, id);
                        }
                    }
                    let decreaseMode = false;
                    let decreaseTarget;
                    if (parseInt(parentAdapter.config.TemperatureDecrease) === 1) {// relative
                        id1 += ".relative";
                        decreaseTarget = 0;
                        decreaseMode = true;
                    }
                    else if (parseInt(parentAdapter.config.TemperatureDecrease) === 2) {// absolutue
                        id1 += ".absolute";
                        decreaseTarget = 20;
                        decreaseMode = true;
                    }

                    if (decreaseMode) {

                        await SetDefault(id1 + ".GuestIncrease", decreaseTarget);
                        await SetDefault(id1 + ".PartyDecrease", decreaseTarget);
                        await SetDefault(id1 + ".WindowOpenDecrease", decreaseTarget);
                        await SetDefault(id1 + ".AbsentDecrease", decreaseTarget);
                        await SetDefault(id1 + ".VacationAbsentDecrease", decreaseTarget);

                        if (parentAdapter.config.UseFireplaceMode) {
                            await SetDefault(id1 + ".FireplaceModeDecrease", decreaseTarget);
                        }

                    }
                }
            }
        }

        //===================================================================================
        //pittini vis
        if (parentAdapter.config.UseVisFromPittini) {

            await SetDefault("vis.TempDecreaseValues.AbsentDecrease", 0);
            await SetDefault("vis.TempDecreaseValues.GuestIncrease", 0);
            await SetDefault("vis.TempDecreaseValues.PartyDecrease", 0);
            await SetDefault("vis.TempDecreaseValues.VacationAbsentDecrease", 0);

            if (parentAdapter.config.UseFireplaceMode) {
                await SetDefault("vis.TempDecreaseValues.FireplaceModeDecrease", 0);
            }

            await SetDefault("vis.TempDecreaseValues.WindowOpenDecrease", 0);

            await SetDefault("vis.RoomValues.MinimumTemperature", 5);
            await SetDefault("vis.RoomValues.TemperaturOverride", 0);
            await SetDefault("vis.RoomValues.TemperaturOverrideTime", "00:00");
            await SetDefault("vis.RoomValues.WindowIsOpen", false);
            await SetDefault("vis.RoomValues.StatusLog", "");
            await SetDefault("vis.RoomValues.CurrentTimePeriod", "");
            await SetDefault("vis.RoomValues.TemperaturOverrideRemainingTime", 0);

            await SetDefaultVisTranslatedText();
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in SetDefaults [" + e + "]");
    }

    parentAdapter.log.debug("SetDefaults done");
}




const DefaultTargets = [];
DefaultTargets[0] = ["05:00", 21];
DefaultTargets[1] = ["08:00", 23];
DefaultTargets[2] = ["12:00", 22];
DefaultTargets[3] = ["16:00", 21];
DefaultTargets[4] = ["21:00", 19];

async function SetDefault4Period(period, id){

    let key = id + ".time";

    let current = await parentAdapter.getStateAsync(key);
    //set default only if nothing was set before
    if (current === null ||  current.val === undefined) {
        await parentAdapter.setStateAsync(key, { ack: true, val: DefaultTargets[period-1][0] });
    }

    key = id + ".Temperature";

    current = await parentAdapter.getStateAsync(key);
    //set default only if nothing was set before
    if (current === null ||  current.val === undefined) {
        await parentAdapter.setStateAsync(key, { ack: true, val: DefaultTargets[period-1][1] });
    }

}


async function SetDefault(key, value) {
    const current = await parentAdapter.getStateAsync(key);
    //set default only if nothing was set before
    if (current === null ||  current === undefined ||  current.val === undefined) {
        parentAdapter.log.info("set default " + key + " to " + value);
        await parentAdapter.setStateAsync(key, { ack: true, val: value });
    }
}


async function SetDefaultVisTranslatedText() {
    //cardHzngFenster
    await parentAdapter.setStateAsync("vis.translations.cardHzngFenster.WindowState", { ack: true, val: GetTranslation(parentAdapter, "WindowState", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngFenster.AllWindowsClosed", { ack: true, val: GetTranslation(parentAdapter, "AllWindowsClosed", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngFenster.WindowOpen", { ack: true, val: GetTranslation(parentAdapter, "WindowOpen", SystemLanguage) });

    //cardHzngGlobals
    await parentAdapter.setStateAsync("vis.translations.cardHzngGlobals.HeatingPeriodActive", { ack: true, val: GetTranslation(parentAdapter,"HeatingPeriodActive", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngGlobals.PublicHolidayToday", { ack: true, val: GetTranslation(parentAdapter,"PublicHolidayToday", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngGlobals.Present", { ack: true, val: GetTranslation(parentAdapter,"Present", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngGlobals.PartyNow", { ack: true, val: GetTranslation(parentAdapter,"PartyNow", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngGlobals.Guests", { ack: true, val: GetTranslation(parentAdapter,"Guests", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngGlobals.HolidayAtHome", { ack: true, val: GetTranslation(parentAdapter,"HolidayAtHome", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngGlobals.HolidayVacation", { ack: true, val: GetTranslation(parentAdapter,"HolidayVacation", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngGlobals.FireplaceMode", { ack: true, val: GetTranslation(parentAdapter, "FireplaceMode", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngGlobals.MaintenanceMode", { ack: true, val: GetTranslation(parentAdapter, "MaintenanceMode", SystemLanguage) });

    

    await parentAdapter.setStateAsync("vis.translations.cardHzngGlobals.General", { ack: true, val: GetTranslation(parentAdapter, "General", SystemLanguage) });


    //cardHzngMoFrSaSo
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoFrSaSu.Period", { ack: true, val: GetTranslation(parentAdapter,"Period", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoFrSaSu.MoFr", { ack: true, val: GetTranslation(parentAdapter,"MoFr", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoFrSaSu.From", { ack: true, val: GetTranslation(parentAdapter,"From", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoFrSaSu.SaSu", { ack: true, val: GetTranslation(parentAdapter,"SaSu", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoFrSaSu.ZeitenWoche", { ack: true, val: GetTranslation(parentAdapter, "ZeitenWoche", SystemLanguage) });

    //cardHzngMoSu
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSu.Period", { ack: true, val: GetTranslation(parentAdapter,"Period", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSu.MoSu", { ack: true, val: GetTranslation(parentAdapter,"MoSu", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSu.From", { ack: true, val: GetTranslation(parentAdapter, "From", SystemLanguage) }); await CreateDatapoint("vis.translations.cardHzngMoSu.ZeitenWoche", "state", "value", "string", "", true, false);
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSu.ZeitenWoche", { ack: true, val: GetTranslation(parentAdapter, "ZeitenWoche", SystemLanguage) });

    //cardHzngMoSuSeparat
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSuSeparat.Period", { ack: true, val: GetTranslation(parentAdapter,"Period", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSuSeparat.From", { ack: true, val: GetTranslation(parentAdapter,"From", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSuSeparat.Monday", { ack: true, val: GetTranslation(parentAdapter,"Monday", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSuSeparat.Tuesday", { ack: true, val: GetTranslation(parentAdapter,"Tuesday", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSuSeparat.Wednesday", { ack: true, val: GetTranslation(parentAdapter,"Wednesday", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSuSeparat.Thursday", { ack: true, val: GetTranslation(parentAdapter,"Thursday", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSuSeparat.Friday", { ack: true, val: GetTranslation(parentAdapter,"Friday", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSuSeparat.Saturday", { ack: true, val: GetTranslation(parentAdapter,"Saturday", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSuSeparat.Sunday", { ack: true, val: GetTranslation(parentAdapter,"Sunday", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngMoSuSeparat.ZeitenWoche", { ack: true, val: GetTranslation(parentAdapter, "ZeitenWoche", SystemLanguage) });

    //cardHzngProfilParam
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.GuestIncrease", { ack: true, val: GetTranslation(parentAdapter,"GuestIncrease", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.GuestTemperature", { ack: true, val: GetTranslation(parentAdapter,"GuestTemperature", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.PartyDecrease", { ack: true, val: GetTranslation(parentAdapter,"PartyDecrease", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.PartyTemperature", { ack: true, val: GetTranslation(parentAdapter,"PartyTemperature", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.AbsentDecrease", { ack: true, val: GetTranslation(parentAdapter,"AbsentDecrease", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.AbsentTemperature", { ack: true, val: GetTranslation(parentAdapter,"AbsentTemperature", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.VacationAbsentDecrease", { ack: true, val: GetTranslation(parentAdapter,"VacationAbsentDecrease", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.VacationAbsentTemperature", { ack: true, val: GetTranslation(parentAdapter,"VacationAbsentTemperature", SystemLanguage)});

    //translation always available
    //if (parentAdapter.config.UseFireplaceMode) {
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.FireplaceModeDecrease", { ack: true, val: GetTranslation(parentAdapter, "FireplaceModeDecrease", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.FireplaceModeTemperature", { ack: true, val: GetTranslation(parentAdapter, "FireplaceModeTemperature", SystemLanguage) });
    //}

    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.WindowOpenDecrease", { ack: true, val: GetTranslation(parentAdapter, "WindowOpenDecrease", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.WindowOpenTemperature", { ack: true, val: GetTranslation(parentAdapter,"WindowOpenTemperature", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.OverrideFor", { ack: true, val: GetTranslation(parentAdapter,"OverrideFor", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.OverrideTemp", { ack: true, val: GetTranslation(parentAdapter,"OverrideTemp", SystemLanguage)});
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.MinimalTemperature", { ack: true, val: GetTranslation(parentAdapter,"MinimalTemperature", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.HintNotEnabled", { ack: true, val: GetTranslation(parentAdapter, "HintNotEnabled", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.cardHzngProfilParam.Profilparam", { ack: true, val: GetTranslation(parentAdapter, "Profilparam", SystemLanguage) });


    //tnav
    await parentAdapter.setStateAsync("vis.translations.tnav.ActiveProfile", { ack: true, val: GetTranslation(parentAdapter, "ActiveProfile", SystemLanguage) });
    await parentAdapter.setStateAsync("vis.translations.tnav.Room", { ack: true, val: GetTranslation(parentAdapter, "room", SystemLanguage) });

    //cardHzngRooms
    await parentAdapter.setStateAsync("vis.translations.cardHzngRooms.RoomState", { ack: true, val: GetTranslation(parentAdapter, "RoomState", SystemLanguage) });

    //cardDateAndTime
    await parentAdapter.setStateAsync("vis.translations.cardDateAndTime.Clock", { ack: true, val: GetTranslation(parentAdapter, "clock", SystemLanguage) });
}

//*******************************************************************
//
async function SetCurrent() {
    parentAdapter.log.info("start SetCurrent");
    try {
        await SetCurrentFromDatapoint(parentAdapter.config.Path2PresentDP, parentAdapter.config.Path2PresentDPType, parentAdapter.config.Path2PresentDPLimit, "Present");
        await SetCurrentFromDatapoint(parentAdapter.config.Path2VacationDP, 1, null, "VacationAbsent");
        await SetCurrentFromDatapoint(parentAdapter.config.Path2HolidayPresentDP, 1, null, "HolidayPresent");
        await SetCurrentFromDatapoint(parentAdapter.config.Path2GuestsPresentDP, parentAdapter.config.Path2GuestsPresentDPType, parentAdapter.config.Path2GuestsPresentDPLimit, "GuestsPresent");
        await SetCurrentFromDatapoint(parentAdapter.config.Path2PartyNowDP, parentAdapter.config.Path2PartyNowDPType, parentAdapter.config.Path2PartyNowDPLimit, "PartyNow");

        let path2Feiertag = null;
        if (parentAdapter.config.Path2FeiertagAdapter !== null &&  parentAdapter.config.Path2FeiertagAdapter !== undefined && parentAdapter.config.Path2FeiertagAdapter.length > 0) {
            const names = parentAdapter.config.Path2FeiertagAdapter.split(".");
            if (names.length === 2) {
                //feiertage.0.heute.boolean
                path2Feiertag= parentAdapter.config.Path2FeiertagAdapter + ".heute.boolean";
            }
            else {
                path2Feiertag=parentAdapter.config.Path2FeiertagAdapter;
            }
        }
        await SetCurrentFromDatapoint(path2Feiertag, 1, null, "PublicHolidyToday");

        for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
            if (parentAdapter.config.rooms[room].isActive) {

                const key = "Rooms." + parentAdapter.config.rooms[room].name;
                await parentAdapter.setStateAsync(key + ".TemperaturOverrideRemainingTime",  { val: 0, ack: true });
            }
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in SetCurrent [" + e + "]");
    }
    parentAdapter.log.info("SetCurrent done");
}

async function SetCurrentFromDatapoint(path, type, limit, id) {
    try {
        if (path != null && path.length > 0) {
            let value = false;
            const nTemp = await parentAdapter.getForeignStateAsync(path);
            if (nTemp != null) {
                if (parseInt(type) === 1) {
                    parentAdapter.log.debug(id + " type ==1 ??? " + nTemp.val);
                    value = nTemp.val;
                }
                else {
                    parentAdapter.log.debug(id + " type !=1 ??? " + nTemp.val + " " + limit);
                    if (nTemp.val > parseInt(limit)) {
                        value = true;
                        parentAdapter.log.info(id + " set to true");
                    }
                }
                parentAdapter.log.debug(id + " set to " + value);
                await parentAdapter.setStateAsync(id, { val: value, ack: true });
            }
            else {
                parentAdapter.log.error("SetCurrentFromDatapoint: could not read " + path);
            }
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in SetCurrentFromDatapoint [" + e + "] " + path);
    }
}



//*******************************************************************
//
async function SetInfo() {
    parentAdapter.log.info("start SetInfo");
    //-----------------------------------------------
    await parentAdapter.setStateAsync("info.UsedRooms", { ack: true, val: GetUsedRooms() });

    //-----------------------------------------------
    let mode = "";
    switch (parseInt(parentAdapter.config.TemperatureDecrease)) {
        case 1:
            mode = "relative";
            break;
        case 2:
            mode = "absolute";
            break;
        case 3:
            mode = "none";
            break;
        default:
            mode = "unknown";
            break;
    }
    await parentAdapter.setStateAsync("info.TemperatureDecreaseMode", { ack: true, val: mode });

    //-----------------------------------------------
    let ProfileType = "";
    switch (parseInt(parentAdapter.config.ProfileType)) {
        case 1:
            ProfileType = "Mo - Su";
            //ProfileType = "Mo-Su";
            break;
        case 2:
            ProfileType = "Mo - Fr / Sa - Su";
            //ProfileType = "Mo-Fr / Sa-Su";
            break;
        case 3:
            ProfileType = "every Day";
            break;
        default:
            ProfileType = "unknown";
            break;
    }
    await parentAdapter.setStateAsync("info.ProfileType", { ack: true, val: ProfileType });

    //-----------------------------------------------
    await parentAdapter.setStateAsync("info.NumberOfProfiles", { ack: true, val: parseInt(parentAdapter.config.NumberOfProfiles) });
    
    //-----------------------------------------------
    await parentAdapter.setStateAsync("info.NumberOfPeriods", { ack: true, val: parseInt(parentAdapter.config.NumberOfPeriods) });
    
    //-----------------------------------------------
    await parentAdapter.setStateAsync("info.PublicHolidayLikeSunday", { ack: true, val: parentAdapter.config.PublicHolidayLikeSunday });
    
    //-----------------------------------------------
    await parentAdapter.setStateAsync("info.UseMinTempPerRoom", { ack: true, val: parentAdapter.config.UseMinTempPerRoom });
    
    //-----------------------------------------------
    await parentAdapter.setStateAsync("info.UseFixHeatingPeriod", { ack: true, val: parentAdapter.config.UseFixHeatingPeriod });
    

    //-----------------------------------------------
    if (parentAdapter.config.UseFixHeatingPeriod) {
        await parentAdapter.setStateAsync("info.FixHeatingPeriodStart", { ack: true, val: parentAdapter.config.FixHeatingPeriodStart });
        await parentAdapter.setStateAsync("info.FixHeatingPeriodEnd", { ack: true, val: parentAdapter.config.FixHeatingPeriodEnd });
    }
    
    parentAdapter.log.info("SetInfo done");
}

//*******************************************************************
//
async function SubscribeAllStates() {

    //-----------------------------------------------
    parentAdapter.subscribeStates("CurrentProfile");
    parentAdapter.subscribeStates("HeatingPeriodActive");
    parentAdapter.subscribeStates("PublicHolidyToday");
    parentAdapter.subscribeStates("Present");
    parentAdapter.subscribeStates("PartyNow");
    parentAdapter.subscribeStates("GuestsPresent");
    parentAdapter.subscribeStates("HolidayPresent");
    parentAdapter.subscribeStates("VacationAbsent");
    parentAdapter.subscribeStates("MaintenanceActive");
    parentAdapter.subscribeStates("PowerInterruptionPeriodActive");

    if (parentAdapter.config.UseFireplaceMode) {
        parentAdapter.subscribeStates("FireplaceModeActive");
    }

    //-----------------------------------------------
    for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
        if (parentAdapter.config.rooms[room].isActive) {

            const key = "Rooms." + parentAdapter.config.rooms[room].name;

            parentAdapter.subscribeStates(key + ".TemperaturOverride");
            parentAdapter.subscribeStates(key + ".TemperaturOverrideTime");
            if (parentAdapter.config.ThermostatModeIfNoHeatingperiod == 1) {
                parentAdapter.subscribeStates(key + ".TemperatureIfNoHeatingPeriod");
            }
            if (parentAdapter.config.UseMinTempPerRoom) {
                parentAdapter.subscribeStates(key + ".MinimumTemperature");
            }
            //if (parseInt(parentAdapter.config.UseChangesFromThermostat) === 4) { //each room reparately
            //    parentAdapter.subscribeStates(key + ".ChangesFromThermostatMode");
            //}
            if (parseInt(parentAdapter.config.UseChangesFromThermostat) > 1) {
                parentAdapter.subscribeStates(key + ".ResetManual");
            }

            if (parentAdapter.config.UseAddTempSensors) {
                parentAdapter.subscribeStates(key + ".TemperatureOffset");
            }
            parentAdapter.subscribeStates(key + ".isActive");
        }
    }

    //-----------------------------------------------
    for (let profile = 1; profile <= parseInt(parentAdapter.config.NumberOfProfiles, 10); profile++) {
        const key = "Profiles." + profile;

        parentAdapter.subscribeStates(key + ".ProfileName");

        if (parseInt(parentAdapter.config.NumberOfProfiles, 10) > profile) {
            //heatingcontrol.0.Profiles.1.CopyProfile
            parentAdapter.subscribeStates(key + ".CopyProfile");
        }


        for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
            if (parentAdapter.config.rooms[room].isActive) {
                const id = key + "." + parentAdapter.config.rooms[room].name;

                let id1 = id;

                

                if (parseInt(parentAdapter.config.NumberOfProfiles, 10) > profile) {
                    parentAdapter.subscribeStates(id + ".CopyProfile");
                }

                if (parseInt(parentAdapter.config.ProfileType, 10) === 1) {

                    for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                        const id = id1 + ".Mo-Su.Periods." + period;
                        await Subscribe4Profile(id);
                    }
                }
                else if (parseInt(parentAdapter.config.ProfileType, 10) === 2) {

                    parentAdapter.subscribeStates(id1 + ".Mo-Fr.CopyPeriods");

                    for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                        const id = id1 + ".Mo-Fr.Periods." + period;
                        await Subscribe4Profile(id);
                    }
                    for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                        const id = id1 + ".Sa-Su.Periods." + period;
                        await Subscribe4Profile(id);
                    }
                }
                else if (parseInt(parentAdapter.config.ProfileType, 10) === 3) {
                    parentAdapter.subscribeStates(id1 + ".Mon.CopyPeriods");
                    for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                        const id = id1 + ".Mon.Periods." + period;
                        await Subscribe4Profile(id);
                    }
                    parentAdapter.subscribeStates(id1 + ".Tue.CopyPeriods");
                    for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                        const id = id1 + ".Tue.Periods." + period;
                        await Subscribe4Profile(id);
                    }
                    parentAdapter.subscribeStates(id1 + ".Wed.CopyPeriods");
                    for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                        const id = id1 + ".Wed.Periods." + period;
                        await Subscribe4Profile(id);
                    }
                    parentAdapter.subscribeStates(id1 + ".Thu.CopyPeriods");
                    for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                        const id = id1 + ".Thu.Periods." + period;
                        await Subscribe4Profile(id);
                    }
                    parentAdapter.subscribeStates(id1 + ".Fri.CopyPeriods");
                    for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                        const id = id1 + ".Fri.Periods." + period;
                        await Subscribe4Profile(id);
                    }
                    parentAdapter.subscribeStates(id1 + ".Sat.CopyPeriods");
                    for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                        const id = id1 + ".Sat.Periods." + period;
                        await Subscribe4Profile(id);
                    }
                    for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                        const id = id1 + ".Sun.Periods." + period;
                        await Subscribe4Profile(id);
                    }
                }
                let decreaseMode = false;
                if (parseInt(parentAdapter.config.TemperatureDecrease) === 1) {// relative
                    id1 += ".relative";
                    decreaseMode = true;
                }
                else if (parseInt(parentAdapter.config.TemperatureDecrease) === 2) {// absolutue
                    id1 += ".absolute";
                    decreaseMode = true;
                }

                if (decreaseMode) {

                    await parentAdapter.subscribeStates(id1 + ".GuestIncrease");
                    await parentAdapter.subscribeStates(id1 + ".PartyDecrease");
                    await parentAdapter.subscribeStates(id1 + ".WindowOpenDecrease");
                    await parentAdapter.subscribeStates(id1 + ".AbsentDecrease");
                    await parentAdapter.subscribeStates(id1 + ".VacationAbsentDecrease");
                    if (parentAdapter.config.UseFireplaceMode) {
                        await parentAdapter.subscribeStates(id1 + ".FireplaceModeDecrease");
                    }
                }
            }
        }
    }


    if (parentAdapter.config.Path2FeiertagAdapter !== null && parentAdapter.config.Path2FeiertagAdapter !== undefined && parentAdapter.config.Path2FeiertagAdapter.length > 0) {
        const names = parentAdapter.config.Path2FeiertagAdapter.split(".");

        if (names.length === 2) {
            //feiertage.0.heute.boolean
            parentAdapter.subscribeForeignStates(parentAdapter.config.Path2FeiertagAdapter + ".heute.boolean");
            parentAdapter.log.debug("subscribe " + parentAdapter.config.Path2FeiertagAdapter + ".heute.boolean");
        }
        else {
            parentAdapter.subscribeForeignStates(parentAdapter.config.Path2FeiertagAdapter);
            parentAdapter.log.info("subscribe " + parentAdapter.config.Path2FeiertagAdapter);
        }
    }
    else {
        parentAdapter.log.debug("no subscribe Path2FeiertagAdapter ");
    }


    if (parentAdapter.config.Path2PresentDP !== null &&  parentAdapter.config.Path2PresentDP !== undefined && parentAdapter.config.Path2PresentDP.length > 0) {
        parentAdapter.subscribeForeignStates(parentAdapter.config.Path2PresentDP);
        parentAdapter.log.info("subscribe " + parentAdapter.config.Path2PresentDP);
    }
    else {
        parentAdapter.log.debug("no subscribe Path2PresentDP ");
    }

    if (parentAdapter.config.Path2VacationDP !== null &&  parentAdapter.config.Path2VacationDP !== undefined && parentAdapter.config.Path2VacationDP.length > 0) {
        parentAdapter.subscribeForeignStates(parentAdapter.config.Path2VacationDP);
        parentAdapter.log.info("subscribe " + parentAdapter.config.Path2VacationDP);
    }
    else {
        parentAdapter.log.debug("no subscribe Path2VacationDP ");
    }

    if (parentAdapter.config.Path2HolidayPresentDP !== null &&  parentAdapter.config.Path2HolidayPresentDP !== undefined && parentAdapter.config.Path2HolidayPresentDP.length > 0) {
        parentAdapter.subscribeForeignStates(parentAdapter.config.Path2HolidayPresentDP);
        parentAdapter.log.info("subscribe " + parentAdapter.config.Path2HolidayPresentDP);
    }
    else {
        parentAdapter.log.debug("no subscribe Path2HolidayPresentDP ");
    }

    if (parentAdapter.config.Path2GuestsPresentDP !== null &&  parentAdapter.config.Path2GuestsPresentDP !== undefined && parentAdapter.config.Path2GuestsPresentDP.length > 0) {
        parentAdapter.subscribeForeignStates(parentAdapter.config.Path2GuestsPresentDP);
        parentAdapter.log.info("subscribe " + parentAdapter.config.Path2GuestsPresentDP);
    }
    else {
        parentAdapter.log.debug("no subscribe Path2GuestsPresentDP ");
    }

    if (parentAdapter.config.Path2PartyNowDP !== null &&  parentAdapter.config.Path2PartyNowDP !== undefined && parentAdapter.config.Path2PartyNowDP.length > 0) {
        parentAdapter.subscribeForeignStates(parentAdapter.config.Path2PartyNowDP);
        parentAdapter.log.info("subscribe " + parentAdapter.config.Path2PartyNowDP);
    }
    else {
        parentAdapter.log.debug("no subscribe Path2PartyNowDP ");
    }

    //pittini vis
    if (parentAdapter.config.UseVisFromPittini) {
        parentAdapter.log.debug("subscribe vis DP ");
        parentAdapter.subscribeStates("vis.ChoosenRoom");
        parentAdapter.subscribeStates("vis.isActive");

        if (parseInt(parentAdapter.config.NumberOfProfiles, 10) > 1) {
            parentAdapter.subscribeStates("vis.ProfileTypes.CopyProfile");
            parentAdapter.subscribeStates("vis.ProfileTypes.CopyProfileRoom");
        }

        if (parseInt(parentAdapter.config.ProfileType, 10) === 2) {
            parentAdapter.subscribeStates("vis.ProfileTypes.Mo-Fr.CopyPeriods");
        }
        else if (parseInt(parentAdapter.config.ProfileType, 10) === 3) {
            parentAdapter.subscribeStates("vis.ProfileTypes.Mon.CopyPeriods");
            parentAdapter.subscribeStates("vis.ProfileTypes.Tue.CopyPeriods");
            parentAdapter.subscribeStates("vis.ProfileTypes.Wed.CopyPeriods");
            parentAdapter.subscribeStates("vis.ProfileTypes.Thu.CopyPeriods");
            parentAdapter.subscribeStates("vis.ProfileTypes.Fri.CopyPeriods");
            parentAdapter.subscribeStates("vis.ProfileTypes.Sat.CopyPeriods");
        }
    }
}


async function CheckConfiguration() {
    if (parentAdapter.config.Path2FeiertagAdapter.split(".")[0].includes("heatingcontrol")) {
        parentAdapter.log.error("error in configuration for Path2FeiertagAdapter! data point should not point to itself. use external data points or leave it blank");
    }

    if (parentAdapter.config.Path2PresentDP.split(".")[0].includes("heatingcontrol")) {
        parentAdapter.log.error("error in configuration for Path2PresentDP! data point should not point to itself. use external data points or leave it blank");
    }

    if (parentAdapter.config.Path2VacationDP.split(".")[0].includes("heatingcontrol")) {
        parentAdapter.log.error("error in configuration for Path2VacationDP! data point should not point to itself. use external data points or leave it blank");
    }

    if (parentAdapter.config.Path2HolidayPresentDP.split(".")[0].includes("heatingcontrol")) {
        parentAdapter.log.error("error in configuration for Path2HolidayPresentDP! data point should not point to itself. use external data points or leave it blank");
    }

    if (parentAdapter.config.Path2GuestsPresentDP.split(".")[0].includes("heatingcontrol")) {
        parentAdapter.log.error("error in configuration for Path2GuestsPresentDP! data point should not point to itself. use external data points or leave it blank");
    }

    if (parentAdapter.config.Path2PartyNowDP.split(".")[0].includes("heatingcontrol")) {
        parentAdapter.log.error("error in configuration for Path2PartyNowDP! data point should not point to itself. use external data points or leave it blank");
    }

    if (parentAdapter.config.ThermostatHandlesWindowOpen && parseInt(parentAdapter.config.SensorOpenDelay) > 0) {
        parentAdapter.log.error("error in configuration: if option 'Thermostat handles window open' is enabled then SensorOpenDelay must be 0 ");
    }

}


async function Subscribe4Profile(id) {
    parentAdapter.subscribeStates(id + ".time");
    parentAdapter.subscribeStates(id + ".Temperature");
}


//=================================================================================================
//

async function CopyProfilePart(orgProfile, newProfile, room, orgProfilePart, newProfilePart, Period) {

    try {
        let id = "Profiles." + orgProfile + "." + room + "." + orgProfilePart + ".Periods." + Period;

        const temp = await parentAdapter.getStateAsync(id + ".Temperature");
        const time = await parentAdapter.getStateAsync(id + ".time");

        if (temp != null && time != null) {
            id = "Profiles." + newProfile + "." + room + "." + newProfilePart + ".Periods." + Period;

            parentAdapter.log.debug("copy " + temp.val + " " + time.val + " to " + id);

            await parentAdapter.setStateAsync(id + ".Temperature", { ack: true, val: temp.val });
            await parentAdapter.setStateAsync(id + ".time", { ack: true, val: time.val });
        }
        else {
            parentAdapter.log.error("CopyProfile: could not read " + id + " " + JSON.stringify(temp) + " " + JSON.stringify(time));
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in CopyProfilePart [" + e + "]");
    }
}

async function CopyProfileAll(orgProfile) {

    parentAdapter.log.debug("CopyProfileAll, orgProfil " + orgProfile);

    for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
        if (parentAdapter.config.rooms[room].isActive) {
            await CopyProfile(parentAdapter.config.rooms[room].name, orgProfile);
        }
    }

    //profile name
    //heatingcontrol.0.Profiles.1.ProfileName
    let key = "Profiles." + orgProfile + ".ProfileName";
    const name = await parentAdapter.getStateAsync(key);
    let newName = "";
    if (name != null && name != null && name.val.length>0) {
        newName = "CopyOf" + name.val;
    }
    else {
        newName = "CopyOfProfile" + orgProfile;
    }
    const newProfile = parseInt(orgProfile) + 1;
    key = "Profiles." + newProfile + ".ProfileName";

    parentAdapter.log.debug("copy " + newName + " to " + key);

    await parentAdapter.setStateAsync(key, { ack: true, val: newName });
}


async function CopyProfile(room, orgProfile) {

    let profilePart = "";
    const newProfile = parseInt(orgProfile) + 1;

    parentAdapter.log.info("CopyProfile, from " + orgProfile + " to " + newProfile + " profile " + " in " + room);

    if (parseInt(parentAdapter.config.ProfileType, 10) === 1) {
        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
            profilePart = "Mo-Su";
            await CopyProfilePart(orgProfile, newProfile, room, profilePart, profilePart, period);
        }
    }
    else if (parseInt(parentAdapter.config.ProfileType, 10) === 2) {

        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
            profilePart = "Mo-Fr";
            await CopyProfilePart(orgProfile, newProfile, room, profilePart, profilePart, period);
            profilePart = "Sa-Su";
            await CopyProfilePart(orgProfile, newProfile, room, profilePart, profilePart, period);
        }
    }
    else if (parseInt(parentAdapter.config.ProfileType, 10) === 3) {

        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
            profilePart = "Mon";
            await CopyProfilePart(orgProfile, newProfile, room, profilePart, profilePart, period);
            profilePart = "Tue";
            await CopyProfilePart(orgProfile, newProfile, room, profilePart, profilePart, period);
            profilePart = "Wed";
            await CopyProfilePart(orgProfile, newProfile, room, profilePart, profilePart, period);
            profilePart = "Thu";
            await CopyProfilePart(orgProfile, newProfile, room, profilePart, profilePart, period);
            profilePart = "Fri";
            await CopyProfilePart(orgProfile, newProfile, room, profilePart, profilePart, period);
            profilePart = "Sat";
            await CopyProfilePart(orgProfile, newProfile, room, profilePart, profilePart, period);
            profilePart = "Sun";
            await CopyProfilePart(orgProfile, newProfile, room, profilePart, profilePart, period);
        }
    }
    else {
        parentAdapter.log.warn("CopyProfile: unknown profile type " + parentAdapter.config.ProfileType);
    }

    //decrease values
    if (parseInt(parentAdapter.config.TemperatureDecrease) == 1) {
        await CopyDecreaseValues(orgProfile, newProfile, room, "relative");
    }
    else if (parseInt(parentAdapter.config.TemperatureDecrease) == 2) {
        await CopyDecreaseValues(orgProfile, newProfile, room, "absolute");
    }
}

async function CopyDecreaseValue(orgId, newId) {
    const value = await parentAdapter.getStateAsync(orgId);
    try {
        if (value != null && value != null) {
            parentAdapter.log.debug("copy " + value.val + " to " + newId);

            await parentAdapter.setStateAsync(newId, { ack: true, val: value.val });
        }
        else {
            parentAdapter.log.error("CopyDecreaseValue: could not read " + orgId + " " + JSON.stringify(value));
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in CopyDecreaseValue [" + e + "]" + orgId + " to " + newId);
    }
}

async function CopyDecreaseValues(orgProfile, newProfile, room, type) {

    try {
        //heatingcontrol.0.Profiles.1.Test.absolute.AbsentDecrease
        let orgId = "Profiles." + orgProfile + "." + room + "." + type + ".AbsentDecrease";
        let newId = "Profiles." + newProfile + "." + room + "." + type + ".AbsentDecrease";
        await CopyDecreaseValue(orgId, newId);
        //heatingcontrol.0.Profiles.1.Test.absolute.GuestIncrease
        orgId = "Profiles." + orgProfile + "." + room + "." + type + ".GuestIncrease";
        newId = "Profiles." + newProfile + "." + room + "." + type + ".GuestIncrease";
        await CopyDecreaseValue(orgId, newId);
        //heatingcontrol.0.Profiles.1.Test.absolute.PartyDecrease
        orgId = "Profiles." + orgProfile + "." + room + "." + type + ".PartyDecrease";
        newId = "Profiles." + newProfile + "." + room + "." + type + ".PartyDecrease";
        await CopyDecreaseValue(orgId, newId);
        //heatingcontrol.0.Profiles.1.Test.absolute.VacationAbsentDecrease
        orgId = "Profiles." + orgProfile + "." + room + "." + type + ".VacationAbsentDecrease";
        newId = "Profiles." + newProfile + "." + room + "." + type + ".VacationAbsentDecrease";
        await CopyDecreaseValue(orgId, newId);
        orgId = "Profiles." + orgProfile + "." + room + "." + type + ".FireplaceModeDecrease";
        newId = "Profiles." + newProfile + "." + room + "." + type + ".FireplaceModeDecrease";
        await CopyDecreaseValue(orgId, newId);

        //heatingcontrol.0.Profiles.1.Test.absolute.WindowOpenDecrease
        orgId = "Profiles." + orgProfile + "." + room + "." + type + ".WindowOpenDecrease";
        newId = "Profiles." + newProfile + "." + room + "." + type + ".WindowOpenDecrease";
        await CopyDecreaseValue(orgId, newId);

    }
    catch (e) {
        parentAdapter.log.error("exception in CopyDecreaseValues [" + e + "]");
    }

}

async function CopyPeriods(room, orgProfilePart, currentProfile) {

    let newProfilePart = orgProfilePart;
    if (parseInt(parentAdapter.config.ProfileType, 10) === 1) {
        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
            newProfilePart = "Mo-Su";
            await CopyProfilePart(currentProfile, currentProfile, room, orgProfilePart, newProfilePart, period);
        }
    }
    else if (parseInt(parentAdapter.config.ProfileType, 10) === 2) {
        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
            if (orgProfilePart == "Mo-Fr") {
                newProfilePart = "Sa-Su";
                await CopyProfilePart(currentProfile, currentProfile, room, orgProfilePart, newProfilePart, period);
            }
        }
    }
    else if (parseInt(parentAdapter.config.ProfileType, 10) === 3) {
        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
            if (orgProfilePart == "Mon") {
                newProfilePart = "Tue";
            }
            else if (orgProfilePart == "Tue") {
                newProfilePart = "Wed";
            }
            else if (orgProfilePart == "Wed") {
                newProfilePart = "Thu";
            }
            else if (orgProfilePart == "Thu") {
                newProfilePart = "Fri";
            }
            else if (orgProfilePart == "Fri") {
                newProfilePart = "Sat";
            }
            else if (orgProfilePart == "Sat") {
                newProfilePart = "Sun";
            }
            else if (orgProfilePart == "Sun") {
                newProfilePart = "Sun";
            }
            await CopyProfilePart(currentProfile, currentProfile, room, orgProfilePart, newProfilePart, period);
        }
    }
    else {
        parentAdapter.log.warn("CopyProfile: unknown profile type " + parentAdapter.config.ProfileType);
    }
}


//*******************************************************************
//

async function DeleteUnusedDP(checkOnly) {
    parentAdapter.log.info("delete unused DP's ");

    const profileType = parseInt(parentAdapter.config.ProfileType, 10);
    const decreaseMode = parseInt(parentAdapter.config.TemperatureDecrease);
    let result = "unknown";
    let deleted = 0;

    const states2delete = [];
    const channel2delete = [];


    const objects = await parentAdapter.getAdapterObjectsAsync();

    for (const o in objects) {
        const parts = o.split(".");
        if (parts[2] == "Profiles") {

            const profilNumber = parseInt(parts[3]);
            //delete profile 0
            //delete profiles with number > noOfProfiles
            if (profilNumber == 0 || profilNumber > parseInt(parentAdapter.config.NumberOfProfiles, 10)) {
                if (objects[o].type == "state") {
                    if (checkOnly) {
                        parentAdapter.log.info("state " + o + " could be deleted");
                    }
                    else {
                        parentAdapter.log.info("delete state " + o);
                        states2delete.push(o);
                    }
                    deleted++;
                }
                else if (objects[o].type == "channel") {
                    if (checkOnly) {
                        parentAdapter.log.info("channel " + o + " could be deleted");
                    }
                    else {
                        parentAdapter.log.info("delete channel " + o);
                        channel2delete.push(o);
                    }
                    deleted++;
                }
                else {
                    parentAdapter.log.info("delete  " + o);
                }
            }

            //delete unused periods
            if (parts[6] == "Periods") {
                if (Number(parts[7]) > Number(parentAdapter.config.NumberOfPeriods)) {
                    if (objects[o].type == "state") {
                        if (checkOnly) {
                            parentAdapter.log.info("state " + o + " could be deleted");
                        }
                        else {
                            parentAdapter.log.info("delete state " + o);
                            states2delete.push(o);
                        }
                        deleted++;
                    }
                    else if (objects[o].type == "channel") {
                        if (checkOnly) {
                            parentAdapter.log.info("channel " + o + " could be deleted");
                        }
                        else {
                            parentAdapter.log.info("delete channel " + o);
                            channel2delete.push(o);
                        }
                        deleted++;
                    }
                    else {
                        parentAdapter.log.info("delete  " + o);
                    }
                }
            }

            //delete unused profil types
            if (profileType == 1 && (
                parts[5] == "Mo-Fr"
                || parts[5] == "Sa-Su"
                || parts[5] == "Mon"
                || parts[5] == "Tue"
                || parts[5] == "Wed"
                || parts[5] == "Thu"
                || parts[5] == "Fri"
                || parts[5] == "Sat"
                || parts[5] == "Sun"
            )) {
                if (objects[o].type == "state") {
                    if (checkOnly) {
                        parentAdapter.log.info("state " + o + " could be deleted");
                    }
                    else {
                        parentAdapter.log.info("delete state " + o);
                        states2delete.push(o);
                    }
                    deleted++;
                }
                else if (objects[o].type == "channel") {
                    if (checkOnly) {
                        parentAdapter.log.info("channel " + o + " could be deleted");
                    }
                    else {
                        parentAdapter.log.info("delete channel " + o);
                        channel2delete.push(o);
                    }
                    deleted++;
                }
                else {
                    parentAdapter.log.info("delete  " + o);
                }
            }

            if (profileType == 2 && (
                parts[5] == "Mo-Su"
                || parts[5] == "Mon"
                || parts[5] == "Tue"
                || parts[5] == "Wed"
                || parts[5] == "Thu"
                || parts[5] == "Fri"
                || parts[5] == "Sat"
                || parts[5] == "Sun"
            )) {
                if (objects[o].type == "state") {
                    if (checkOnly) {
                        parentAdapter.log.info("state " + o + " could be deleted");
                    }
                    else {
                        parentAdapter.log.info("delete state " + o);
                        states2delete.push(o);
                    }
                    deleted++;
                }
                else if (objects[o].type == "channel") {
                    if (checkOnly) {
                        parentAdapter.log.info("channel " + o + " could be deleted");
                    }
                    else {
                        parentAdapter.log.info("delete channel " + o);
                        channel2delete.push(o);
                    }
                    deleted++;
                }
                else {
                    parentAdapter.log.info("delete  " + o);
                }
            }
            if (profileType == 3 && (
                parts[5] == "Mo-Fr"
                || parts[5] == "Sa-Su"
                || parts[5] == "Mo-Su"
            )) {
                if (objects[o].type == "state") {
                    if (checkOnly) {
                        parentAdapter.log.info("state " + o + " could be deleted");
                    }
                    else {
                        parentAdapter.log.info("delete state " + o);
                        states2delete.push(o);
                    }
                    deleted++;
                }
                else if (objects[o].type == "channel") {
                    if (checkOnly) {
                        parentAdapter.log.info("channel " + o + " could be deleted");
                    }
                    else {
                        parentAdapter.log.info("delete channel " + o);
                        channel2delete.push(o);
                    }
                    deleted++;
                }
                else {
                    parentAdapter.log.info("delete  " + o);
                }
            }
            //delete unused decrese mode values

            if (decreaseMode == 1) {
                if (parts[5] == "absolute") {
                    if (objects[o].type == "state") {
                        if (checkOnly) {
                            parentAdapter.log.info("state " + o + " could be deleted");
                        }
                        else {
                            parentAdapter.log.info("delete state " + o);
                            states2delete.push(o);
                        }
                        deleted++;
                    }
                    else if (objects[o].type == "channel") {
                        if (checkOnly) {
                            parentAdapter.log.info("channel " + o + " could be deleted");
                        }
                        else {
                            parentAdapter.log.info("delete channel " + o);
                            channel2delete.push(o);
                        }
                        deleted++;
                    }
                    else {
                        parentAdapter.log.info("delete  " + o);
                    }
                }
            }

            else if (decreaseMode == 2) {
                if (parts[5] == "relative") {
                    if (objects[o].type == "state") {
                        if (checkOnly) {
                            parentAdapter.log.info("state " + o + " could be deleted");
                        }
                        else {
                            parentAdapter.log.info("delete state " + o);
                            states2delete.push(o);
                        }
                        deleted++;
                    }
                    else if (objects[o].type == "channel") {
                        if (checkOnly) {
                            parentAdapter.log.info("channel " + o + " could be deleted");
                        }
                        else {
                            parentAdapter.log.info("delete channel " + o);
                            channel2delete.push(o);
                        }
                        deleted++;
                    }
                    else {
                        parentAdapter.log.info("delete  " + o);
                    }
                }
            }
            else {
                if (parts[5] == "relative" || parts[5] == "absolute") {
                    if (objects[o].type == "state") {
                        if (checkOnly) {
                            parentAdapter.log.info("state " + o + " could be deleted");
                        }
                        else {
                            parentAdapter.log.info("delete state " + o);
                            states2delete.push(o);
                        }
                        deleted++;
                    }
                    else if (objects[o].type == "channel") {
                        if (checkOnly) {
                            parentAdapter.log.info("channel " + o + " could be deleted");
                        }
                        else {
                            parentAdapter.log.info("delete channel " + o);
                            channel2delete.push(o);
                        }
                        deleted++;
                    }
                    else {
                        parentAdapter.log.info("delete  " + o);
                    }
                }
            }
        }
    }

    if (checkOnly) {
        result = deleted + " objects could be deleted";

        if (deleted > 0) {
            parentAdapter.log.warn(deleted + " objects could be deleted, please use maintanance function in admin");
        }
    }
    else { 
        states2delete.sort(function (a, b) {
            return b.length - a.length;
        });
        parentAdapter.log.debug("states 2 delete " + JSON.stringify(states2delete));

        for (let s = 0; s < states2delete.length; s++) {
            await parentAdapter.delObject(states2delete[s]);
        }


        channel2delete.sort(function (a, b) {
            return b.length - a.length;
        });
        parentAdapter.log.debug("channels 2 delete " + JSON.stringify(channel2delete));

        for (let c = 0; c < channel2delete.length; c++) {
            await parentAdapter.delObject(channel2delete[c]);
        }
        result = deleted + " objects deleted";
    }

    return result;
}




module.exports = {
    CreateDatapoints,
    SetDefaults,
    SetCurrent,
    SubscribeAllStates,
    CheckConfiguration,
    SetInfo,
    CopyPeriods,
    CopyProfile,
    CopyProfileAll,
    DeleteUnusedDP
};