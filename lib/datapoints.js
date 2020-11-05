
"use strict";

let parentAdapter;

//*******************************************************************
//
async function CreateDatapoints(adapter) {

    parentAdapter = adapter;

    parentAdapter.log.debug("start CreateDatapoints");

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
        await CreateDatapoint("rooms", "channel", "", "string", "", true, false);
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
        for (let profile = 0; profile < parseInt(parentAdapter.config.NumberOfProfiles, 10); profile++) {
            const key = "Profiles." + profile;
            await CreateDatapoint(key, "channel", "", "string", "", true, false);
            for (let room = 0; room < parentAdapter.config.rooms.length; room++) {
                if (parentAdapter.config.rooms[room].isActive) {
                    const id = key + "." + parentAdapter.config.rooms[room].name;
                    await CreateDatapoint(id, "channel", "", "string", "", true, false);

                    let id1 = id;
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

                    if (parseInt(parentAdapter.config.ProfileType, 10) === 1) {

                    }


                }
            }
        }


    }
    catch (e) {
        parentAdapter.log.error("exception in CreateDatapoints [" + e + "]");

    }

    parentAdapter.log.debug("CreateDatapoints done");

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
        await SetDefault("CurrentProfile", 1);
        await SetDefault("HeatingPeriodActive", true);
        await SetDefault("PublicHolidyToday", false);
        await SetDefault("Present", true);
        await SetDefault("PartyNow", false);
        await SetDefault("GuestsPresent", false);
        await SetDefault("HolidayPresent", false);
        await SetDefault("VacationAbsent", false);

    }
    catch (e) {
        parentAdapter.log.error("exception in SetDefaults [" + e + "]");
    }

    parentAdapter.log.debug("SetDefaults done");
}

async function SetDefault(key, value) {
    const current = await parentAdapter.getStateAsync(key);
    //set default only if nothing was set before
    if (current === null || typeof current.val == undefined) {
        await parentAdapter.setStateAsync(key, { ack: true, val: value });
    }
}



module.exports = {
    CreateDatapoints,
    SetDefaults
};