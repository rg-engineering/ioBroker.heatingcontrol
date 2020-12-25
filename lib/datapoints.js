
"use strict";

const GetUsedRooms = require("./database.js").GetUsedRooms;



let parentAdapter;

//*******************************************************************
//
async function CreateDatapoints(adapter) {

    parentAdapter = adapter;

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
        if (parentAdapter.config.UseActors) {
            await CreateDatapoint("ActorsOn", "state", "value", "number", "", true, false);
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

                await CreateDatapoint(key + ".CurrentTarget", "state", "value", "number", "°C", true, false);
                await CreateDatapoint(key + ".ActiveTimeSlot", "state", "value", "number", "", true, false);
                await CreateDatapoint(key + ".CurrentTimePeriodFull", "state", "value", "string", "", true, false);
                await CreateDatapoint(key + ".CurrentTimePeriod", "state", "value", "number", "", true, false);
                await CreateDatapoint(key + ".CurrentTimePeriodTime", "state", "value", "string", "", true, false);
                await CreateDatapoint(key + ".WindowIsOpen", "state", "value", "boolean", "", true, false);
                await CreateDatapoint(key + ".State", "state", "value", "string", "", true, false);
                await CreateDatapoint(key + ".TemperaturOverride", "state", "value", "number", "", true, true);
                await CreateDatapoint(key + ".TemperaturOverrideTime", "state", "value", "string", "hh:mm", true, true);
                await CreateDatapoint(key + ".StatusLog", "state", "value", "string", "", true, false);
                if (parentAdapter.config.ThermostatModeIfNoHeatingperiod == 1) {
                    await CreateDatapoint(key + ".TemperatureIfNoHeatingPeriod", "state", "value", "number", "°C", true, true);
                }
                if (parentAdapter.config.UseMinTempPerRoom) {
                    await CreateDatapoint(key + ".MinimumTemperature", "state", "value", "number", "°C", true, true);
                }
                //not used anymore
                //if (parseInt(parentAdapter.config.UseChangesFromThermostat) === 4) { //each room reparately
                //    await CreateDatapoint(key + ".ChangesFromThermostatMode", "state", "value", "number", "", true, true);
                //}
                if (parseInt(parentAdapter.config.UseChangesFromThermostat) > 1) {
                    await CreateDatapoint(key + ".ResetManual", "state", "button", "boolean", "", false, true);
                }
            }
        }

        //===================================================================================
        await CreateDatapoint("Profiles", "channel", "", "string", "", true, false);
        for (let profile = 1; profile <= parseInt(parentAdapter.config.NumberOfProfiles, 10); profile++) {
            const key = "Profiles." + profile;
            await CreateDatapoint(key, "channel", "", "string", "", true, false);


            if (parseInt(parentAdapter.config.NumberOfProfiles, 10) > profile) {
                await CreateDatapoint(key + ".CopyProfile", "state", "button", "boolean", "", false, true);
            }


            for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
                if (parentAdapter.config.rooms[room].isActive) {
                    const id = key + "." + parentAdapter.config.rooms[room].name;
                    await CreateDatapoint(id, "channel", "", "string", "", true, false);

                    let id1 = id;
                    

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
                    }
                }
            }
        }

        //===================================================================================
        //pittini vis
        if (parentAdapter.config.UseVisFromPittini) {

            await CreateDatapoint("vis", "channel", "", "string", "", true, false);
            await CreateDatapoint("vis.ProfileTypes", "channel", "", "string", "", true, false);

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
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Mon.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Tue", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Tue.Periods", "channel", "", "string", "", true, false);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Tue.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Wed", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Wed.Periods", "channel", "", "string", "", true, false);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Wed.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Thu", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Thu.Periods", "channel", "", "string", "", true, false);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Thu.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Fri", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Fri.Periods", "channel", "", "string", "", true, false);
                for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                    const id = "vis.ProfileTypes.Fri.Periods." + period;
                    await CreateStates4Period(id);
                }
                await CreateDatapoint("vis.ProfileTypes.Sat", "channel", "", "string", "", true, false);
                await CreateDatapoint("vis.ProfileTypes.Sat.Periods", "channel", "", "string", "", true, false);
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
            await CreateDatapoint("vis.TempDecreaseValues.WindowOpenDecrease", "state", "value", "number", "°C", true, true);

            await CreateDatapoint("vis.RoomValues", "channel", "", "string", "", true, false);
            await CreateDatapoint("vis.RoomValues.MinimumTemperature", "state", "value", "number", "°C", true, true);
            await CreateDatapoint("vis.RoomValues.TemperaturOverride", "state", "value", "number", "°C", true, true);
            await CreateDatapoint("vis.RoomValues.TemperaturOverrideTime", "state", "value", "string", "hh:mm", true, true);
            await CreateDatapoint("vis.RoomValues.WindowIsOpen", "state", "value", "boolean", "", true, false);
            await CreateDatapoint("vis.RoomValues.CurrentTimePeriod", "state", "value", "number", "", true, true);

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
            await CreateDatapoint("vis.OpenWindowRoomCount", "state", "value", "number", "", true, false);
        }

    }
    catch (e) {
        parentAdapter.log.error("exception in CreateDatapoints [" + e + "]");

    }

    parentAdapter.log.info("CreateDatapoints done");

}

async function CreateStates4Period(id) {
    await CreateDatapoint(id, "channel", "", "string", "", true, false);
    await CreateDatapoint(id + ".time", "state", "value", "string", "hh:mm", true, true);
    await CreateDatapoint(id + ".Temperature", "state", "value", "number", "°C", true, true);

}

async function CreateDatapoint( key, type, common_role, common_type, common_unit, common_read, common_write) {

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
            write: common_write
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
        ) {
            await parentAdapter.extendObject(key, {
                common: {
                    name: name,
                    role: common_role,
                    type: common_type,
                    unit: common_unit,
                    read: common_read,
                    write: common_write
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
                await SetDefault(key + ".WindowIsOpen", false);
                await SetDefault(key + ".State", "");
                await SetDefault(key + ".TemperaturOverride", 0);
                await SetDefault(key + ".TemperaturOverrideTime", "00:00");
                if (parentAdapter.config.ThermostatModeIfNoHeatingperiod == 1) {
                    await SetDefault(key + ".TemperatureIfNoHeatingPeriod", 20);
                }
                if (parentAdapter.config.UseMinTempPerRoom) {
                    await SetDefault(key + ".MinimumTemperature", 5);
                }
                //if (parseInt(parentAdapter.config.UseChangesFromThermostat) === 4) { //each room reparately
                //    await SetDefault(key + ".ChangesFromThermostatMode", 0);
                //}
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
            await SetDefault("vis.TempDecreaseValues.VacationAbsentDecrease",0);
            await SetDefault("vis.TempDecreaseValues.WindowOpenDecrease", 0);

            await SetDefault("vis.RoomValues.MinimumTemperature", 5);
            await SetDefault("vis.RoomValues.TemperaturOverride", 0);
            await SetDefault("vis.RoomValues.TemperaturOverrideTime", "00:00");
            await SetDefault("vis.RoomValues.WindowIsOpen",  false);
            await SetDefault("vis.RoomValues.CurrentTimePeriod", "");
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
    if (current === null || typeof current.val == undefined) {
        await parentAdapter.setStateAsync(key, { ack: true, val: DefaultTargets[period-1][0] });
    }

    key = id + ".Temperature";

    current = await parentAdapter.getStateAsync(key);
    //set default only if nothing was set before
    if (current === null || typeof current.val == undefined) {
        await parentAdapter.setStateAsync(key, { ack: true, val: DefaultTargets[period-1][1] });
    }

}


async function SetDefault(key, value) {
    const current = await parentAdapter.getStateAsync(key);
    //set default only if nothing was set before
    if (current === null || typeof current == undefined|| typeof current.val == undefined) {
        await parentAdapter.setStateAsync(key, { ack: true, val: value });
    }
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
        await SetCurrentFromDatapoint(parentAdapter.config.Path2FeiertagAdapter, 1, null, "PublicHolidyToday");
    }
    catch (e) {
        parentAdapter.log.error("exception in SetCurrent [" + e + "]");
    }
    parentAdapter.log.info("SetCurrent done");
}

async function SetCurrentFromDatapoint(path, type, limit, id) {
    if (path.length > 0) {
        let value = false;
        if (parseInt(type) === 1) {
            const nTemp = await parentAdapter.getForeignStateAsync(path);
            parentAdapter.log.debug(id + " type ==1 ??? " + nTemp.val );
            value = nTemp.val;
        }
        else {
            const nTemp = await parentAdapter.getForeignStateAsync(path);
            parentAdapter.log.debug(id + " type !=1 ??? " + nTemp.val + " " + limit);
            if (nTemp.val > parseInt(limit)) {
                value = true;
                parentAdapter.log.info(id + " set to true");
            }
        }
        parentAdapter.log.debug(id + " set to " + value);
        await parentAdapter.setStateAsync(id, { val: value, ack: true });
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
        }
    }

    //-----------------------------------------------
    for (let profile = 1; profile <= parseInt(parentAdapter.config.NumberOfProfiles, 10); profile++) {
        const key = "Profiles." + profile;

        if (parseInt(parentAdapter.config.NumberOfProfiles, 10) > profile) {
            //heatingcontrol.0.Profiles.1.CopyProfile
            parentAdapter.subscribeStates(key + ".CopyProfile");
        }


        for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
            if (parentAdapter.config.rooms[room].isActive) {
                const id = key + "." + parentAdapter.config.rooms[room].name;

                let id1 = id;

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
                }
            }
        }
    }


    if (parentAdapter.config.Path2FeiertagAdapter !== null && typeof parentAdapter.config.Path2FeiertagAdapter !== undefined && parentAdapter.config.Path2FeiertagAdapter.length > 0) {
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


    if (parentAdapter.config.Path2PresentDP !== null && typeof parentAdapter.config.Path2PresentDP !== undefined && parentAdapter.config.Path2PresentDP.length > 0) {
        parentAdapter.subscribeForeignStates(parentAdapter.config.Path2PresentDP);
        parentAdapter.log.info("subscribe " + parentAdapter.config.Path2PresentDP);
    }
    else {
        parentAdapter.log.debug("no subscribe Path2PresentDP ");
    }

    if (parentAdapter.config.Path2VacationDP !== null && typeof parentAdapter.config.Path2VacationDP !== undefined && parentAdapter.config.Path2VacationDP.length > 0) {
        parentAdapter.subscribeForeignStates(parentAdapter.config.Path2VacationDP);
        parentAdapter.log.info("subscribe " + parentAdapter.config.Path2VacationDP);
    }
    else {
        parentAdapter.log.debug("no subscribe Path2VacationDP ");
    }

    if (parentAdapter.config.Path2HolidayPresentDP !== null && typeof parentAdapter.config.Path2HolidayPresentDP !== undefined && parentAdapter.config.Path2HolidayPresentDP.length > 0) {
        parentAdapter.subscribeForeignStates(parentAdapter.config.Path2HolidayPresentDP);
        parentAdapter.log.info("subscribe " + parentAdapter.config.Path2HolidayPresentDP);
    }
    else {
        parentAdapter.log.debug("no subscribe Path2HolidayPresentDP ");
    }

    if (parentAdapter.config.Path2GuestsPresentDP !== null && typeof parentAdapter.config.Path2GuestsPresentDP !== undefined && parentAdapter.config.Path2GuestsPresentDP.length > 0) {
        parentAdapter.subscribeForeignStates(parentAdapter.config.Path2GuestsPresentDP);
        parentAdapter.log.info("subscribe " + parentAdapter.config.Path2GuestsPresentDP);
    }
    else {
        parentAdapter.log.debug("no subscribe Path2GuestsPresentDP ");
    }

    if (parentAdapter.config.Path2PartyNowDP !== null && typeof parentAdapter.config.Path2PartyNowDP !== undefined && parentAdapter.config.Path2PartyNowDP.length > 0) {
        parentAdapter.subscribeForeignStates(parentAdapter.config.Path2PartyNowDP);
        parentAdapter.log.info("subscribe " + parentAdapter.config.Path2PartyNowDP);
    }
    else {
        parentAdapter.log.debug("no subscribe Path2PartyNowDP ");
    }

    //pittini vis
    if (parentAdapter.config.UseVisFromPittini) {
        parentAdapter.log.debug("subscribe vis DP ");
        parentAdapter.subscribeForeignStates("vis.ChoosenRoom");
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
}


async function Subscribe4Profile(id) {
    parentAdapter.subscribeStates(id + ".time");
    parentAdapter.subscribeStates(id + ".Temperature");
}


module.exports = {
    CreateDatapoints,
    SetDefaults,
    SetCurrent,
    SubscribeAllStates,
    CheckConfiguration,
    SetInfo
};