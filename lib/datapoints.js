
"use strict";

//*******************************************************************
//
async function CreateDatapoints(adapter) {
    adapter.log.debug("start CreateDatapoints");

    try {
        //===================================================================================
        await CreateDatapoint(adapter,"LastProgramRun", "state", "value", "string", "", true, false);
        await CreateDatapoint(adapter,"CurrentProfile", "state", "value", "number", "", true, false);
        await CreateDatapoint(adapter,"HeatingPeriodActive", "state", "value", "boolean", "", true, true);
        await CreateDatapoint(adapter,"PublicHolidyToday", "state", "value", "boolean", "", true, true);
        await CreateDatapoint(adapter,"Present", "state", "value", "boolean", "", true, true);
        await CreateDatapoint(adapter,"PartyNow", "state", "value", "boolean", "", true, true);
        await CreateDatapoint(adapter,"GuestsPresent", "state", "value", "boolean", "", true, true);
        await CreateDatapoint(adapter,"HolidayPresent", "state", "value", "boolean", "", true, true);
        await CreateDatapoint(adapter,"VacationAbsent", "state", "value", "boolean", "", true, true);
        if (adapter.config.UseActors) {
            await CreateDatapoint(adapter,"ActorsOn", "state", "value", "number", "", true, true);
        }

        //===================================================================================
        await CreateDatapoint(adapter,"info", "channel", "", "string", "", true, false);
        await CreateDatapoint(adapter,"info.UsedRooms", "state", "value", "string", "", true, false);
        await CreateDatapoint(adapter,"info.TemperatureDecreaseMode", "state", "value", "string", "", true, false);
        await CreateDatapoint(adapter,"info.ProfileType", "state", "value", "string", "", true, false);
        await CreateDatapoint(adapter,"info.NumberOfProfiles", "state", "value", "number", "", true, false);
        await CreateDatapoint(adapter,"info.NumberOfPeriods", "state", "value", "number", "", true, false);
        await CreateDatapoint(adapter,"info.PublicHolidayLikeSunday", "state", "value", "boolean", "", true, false);
        await CreateDatapoint(adapter,"info.UseMinTempPerRoom", "state", "value", "boolean", "", true, false);
        await CreateDatapoint(adapter,"info.UseFixHeatingPeriod", "state", "value", "boolean", "", true, false);
        if (adapter.config.UseFixHeatingPeriod) {
            await CreateDatapoint(adapter,"info.FixHeatingPeriodStart", "state", "value", "string", "", true, false);
            await CreateDatapoint(adapter,"info.FixHeatingPeriodEnd", "state", "value", "string", "", true, false);
        }

        //===================================================================================
        await CreateDatapoint(adapter,"rooms", "channel", "", "string", "", true, false);
        for (let room = 0; room < adapter.config.rooms.length; room++) {
            if (adapter.config.rooms[room].isActive) {

                const key = "Rooms." + adapter.config.rooms[room].name;
                await CreateDatapoint(adapter,key, "channel", "", "string", "", true, false);

                await CreateDatapoint(adapter,key + ".CurrentTarget", "state", "value", "number", "°C", true, false);
                await CreateDatapoint(adapter,key + ".ActiveTimeSlot", "state", "value", "number", "", true, false);
                await CreateDatapoint(adapter,key + ".CurrentTimePeriodFull", "state", "value", "string", "", true, false);
                await CreateDatapoint(adapter,key + ".CurrentTimePeriod", "state", "value", "number", "", true, false);
                await CreateDatapoint(adapter,key + ".CurrentTimePeriodTime", "state", "value", "string", "", true, false);
                await CreateDatapoint(adapter,key + ".WindowIsOpen", "state", "value", "boolean", "", true, false);
                await CreateDatapoint(adapter,key + ".State", "state", "value", "string", "", true, false);
                await CreateDatapoint(adapter,key + ".TemperaturOverride", "state", "value", "number", "", true, true);
                await CreateDatapoint(adapter,key + ".TemperaturOverrideTime", "state", "value", "string", "hh:mm", true, true);
                if (adapter.config.ThermostatModeIfNoHeatingperiod == 1) {
                    await CreateDatapoint(adapter,key + ".TemperatureIfNoHeatingPeriod", "state", "value", "number", "°C", true, true);
                }
                if (adapter.config.UseMinTempPerRoom) {
                    await CreateDatapoint(adapter,key + ".MinimumTemperature", "state", "value", "number", "°C", true, true);
                }
                if (parseInt(adapter.config.UseChangesFromThermostat) === 4) { //each room reparately
                    await CreateDatapoint(adapter,key + ".ChangesFromThermostatMode", "state", "value", "number", "", true, true);
                }
            }
        }

        //===================================================================================
        await CreateDatapoint(adapter,"Profiles", "channel", "", "string", "", true, false);
        for (let profile = 0; profile < parseInt(adapter.config.NumberOfProfiles, 10); profile++) {
            const key = "Profiles." + profile;
            await CreateDatapoint(adapter,key, "channel", "", "string", "", true, false);
            for (let room = 0; room < adapter.config.rooms.length; room++) {
                if (adapter.config.rooms[room].isActive) {
                    const id = key + "." + adapter.config.rooms[room].name;
                    await CreateDatapoint(adapter,id, "channel", "", "string", "", true, false);

                    let id1 = id;
                    let decreaseMode = false;
                    if (parseInt(adapter.config.TemperatureDecrease) === 1) {// relative
                        id1 += ".relative";
                        decreaseMode = true;
                    }
                    else if (parseInt(adapter.config.TemperatureDecrease) === 2) {// absolutue
                        id1 += ".absolute";
                        decreaseMode = true;
                    }

                    if (decreaseMode) {
                        await CreateDatapoint(adapter,id1, "channel", "", "string", "", true, false);
                        await CreateDatapoint(adapter,id1 + ".GuestIncrease", "state", "value", "number", "°C", true, true);
                        await CreateDatapoint(adapter,id1 + ".PartyDecrease", "state", "value", "number", "°C", true, true);
                        await CreateDatapoint(adapter,id1 + ".WindowOpenDecrease", "state", "value", "number", "°C", true, true);
                        await CreateDatapoint(adapter,id1 + ".AbsentDecrease", "state", "value", "number", "°C", true, true);
                        await CreateDatapoint(adapter,id1 + ".VacationAbsentDecrease", "state", "value", "number", "°C", true, true);
                    }

                    if (parseInt(adapter.config.ProfileType, 10) === 1) {

                    }


                }
            }
        }


    }
    catch (e) {
        adapter.log.error("exception in CreateDatapoints [" + e + "]");

    }

    adapter.log.debug("CreateDatapoints done");

}

async function CreateDatapoint(adapter, key, type, common_role, common_type, common_unit, common_read, common_write) {

    await adapter.setObjectNotExistsAsync(key, {
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

    const obj = await adapter.getObjectAsync(key);

    if (obj != null) {

        if (obj.common.role != common_role
            || obj.common.type != common_type
            || obj.common.unit != common_unit
            || obj.common.read != common_read
            || obj.common.write != common_write
        ) {
            await adapter.extendObject(key, {
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
async function SetDefaults(adapter) {

    adapter.log.debug("start SetDefaults");

    try {
        await SetDefault(adapter,"CurrentProfile", 1);
        await SetDefault(adapter,"HeatingPeriodActive", true);
        await SetDefault(adapter,"PublicHolidyToday", false);
        await SetDefault(adapter,"Present", true);
        await SetDefault(adapter,"PartyNow", false);
        await SetDefault(adapter,"GuestsPresent", false);
        await SetDefault(adapter,"HolidayPresent", false);
        await SetDefault(adapter,"VacationAbsent", false);

    }
    catch (e) {
        adapter.log.error("exception in SetDefaults [" + e + "]");
    }

    adapter.log.debug("SetDefaults done");
}

async function SetDefault(adapter,key, value) {
    const current = await adapter.getStateAsync(key);
    //set default only if nothing was set before
    if (current === null || typeof current.val == undefined) {
        await adapter.setStateAsync(key, { ack: true, val: value });
    }
}



module.exports = {
    CreateDatapoints,
    SetDefaults
};