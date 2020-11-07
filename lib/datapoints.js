
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
        await CreateDatapoint("CurrentProfile", "state", "value", "number", "", true, false);
        await CreateDatapoint("HeatingPeriodActive", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("PublicHolidyToday", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("Present", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("PartyNow", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("GuestsPresent", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("HolidayPresent", "state", "value", "boolean", "", true, true);
        await CreateDatapoint("VacationAbsent", "state", "value", "boolean", "", true, true);
        if (parentAdapter.config.UseActors) {
            await CreateDatapoint("ActorsOn", "state", "value", "number", "", true, true);
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
                if (parentAdapter.config.ThermostatModeIfNoHeatingperiod == 1) {
                    await CreateDatapoint(key + ".TemperatureIfNoHeatingPeriod", "state", "value", "number", "°C", true, true);
                }
                if (parentAdapter.config.UseMinTempPerRoom) {
                    await CreateDatapoint(key + ".MinimumTemperature", "state", "value", "number", "°C", true, true);
                }
                if (parseInt(parentAdapter.config.UseChangesFromThermostat) === 4) { //each room reparately
                    await CreateDatapoint(key + ".ChangesFromThermostatMode", "state", "value", "number", "", true, true);
                }
            }
        }

        //===================================================================================
        await CreateDatapoint("Profiles", "channel", "", "string", "", true, false);
        for (let profile = 1; profile <= parseInt(parentAdapter.config.NumberOfProfiles, 10); profile++) {
            const key = "Profiles." + profile;
            await CreateDatapoint(key, "channel", "", "string", "", true, false);
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
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Mon.Periods." + period;
                            await CreateStates4Period(id);
                        }
                        await CreateDatapoint(id1 + ".Tue", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Tue.Periods", "channel", "", "string", "", true, false);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Tue.Periods." + period;
                            await CreateStates4Period(id);
                        }
                        await CreateDatapoint(id1 + ".Wed", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Wed.Periods", "channel", "", "string", "", true, false);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Wed.Periods." + period;
                            await CreateStates4Period(id);
                        }
                        await CreateDatapoint(id1 + ".Thu", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Thu.Periods", "channel", "", "string", "", true, false);
                        for (let period = 1; period <= parseInt(parentAdapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Thu.Periods." + period;
                            await CreateStates4Period(id);
                        }
                        await CreateDatapoint(id1 + ".Fri", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Fri.Periods", "channel", "", "string", "", true, false);
                        for (let period = 1; period <= parseInt(adapter.config.NumberOfPeriods, 10); period++) {
                            const id = id1 + ".Fri.Periods." + period;
                            await CreateStates4Period(id);
                        }
                        await CreateDatapoint(id1 + ".Sat", "channel", "", "string", "", true, false);
                        await CreateDatapoint(id1 + ".Sat.Periods", "channel", "", "string", "", true, false);
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

    await parentAdapter.setObjectNotExistsAsync(key, {
        type: type,
        common: {
            name: key,
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
        ) {
            await parentAdapter.extendObject(key, {
                common: {
                    name: key,
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
                await SetDefault(key + ".WindowIsOpen",  false);
                await SetDefault(key + ".State", "");
                await SetDefault(key + ".TemperaturOverride", 0);
                await SetDefault(key + ".TemperaturOverrideTime", "00:00");
                if (parentAdapter.config.ThermostatModeIfNoHeatingperiod == 1) {
                    await SetDefault(key + ".TemperatureIfNoHeatingPeriod", 20);
                }
                if (parentAdapter.config.UseMinTempPerRoom) {
                    await SetDefault(key + ".MinimumTemperature", 20);
                }
                if (parseInt(parentAdapter.config.UseChangesFromThermostat) === 4) { //each room reparately
                    await SetDefault(key + ".ChangesFromThermostatMode", 0);
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
                    }
                }
            }
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
    if (current === null || typeof current.val == undefined) {
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
            value = nTemp.val;
        }
        else {
            const nTemp = await parentAdapter.getForeignStateAsync(path);
            if (nTemp.val > limit) {
                value = true;
            }
        }
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


module.exports = {
    CreateDatapoints,
    SetDefaults,
    SetCurrent,
    SetInfo
};