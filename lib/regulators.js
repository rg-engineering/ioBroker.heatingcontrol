

var parentAdapter = null;

//linear
function regulator_start(adapter) {
    parentAdapter = adapter;

    parentAdapter.log.debug("regulator started");

}

async function regulator_GetStatus(room, current, target) {

    var bRet = false;
    if (parentAdapter.config.regulatorType == 1) {
        bRet = getStatus_lin(current, target);
    }
    else if (parseInt(parentAdapter.config.regulatorType) == 2) {
        bRet = await getStatus_linHyst(current, target, room);
    }
    else {
        //unknown
        parentAdapter.log.warn("unknown regulator type " + parentAdapter.config.regulatorType);
    }

    return bRet;
}


//standard simple version it it was initally until Dec 2021 / v2.7
function getStatus_lin(current, target) {
    var bRet = false;
    if (current >= target) {
        bRet = false;
    }
    else {
        bRet = true;
    }
    return bRet;
}

//new version with hysteresis v2.8 
async function getStatus_linHyst(current, target, room) {

    var bRet = room.ActorState;

    const key = "Rooms." + room.Name;
    const HysteresisOnOffset = await parentAdapter.getStateAsync(key + ".Regulator.HysteresisOnOffset");
    const HysteresisOffOffset = await parentAdapter.getStateAsync(key + ".Regulator.HysteresisOffOffset");

    if (HysteresisOnOffset != null && HysteresisOffOffset != null) {
        //if already on, check when to switch off
        if (room.ActorState) {
            if (current >= target + HysteresisOffOffset.val) {
                bRet = false;
                parentAdapter.log.debug(room.Name + " regulator to switch off " + current + ">=" + (target + HysteresisOffOffset.val));
            }
            else {
                parentAdapter.log.debug(room.Name + " regulator still not to switch off " + current + ">=" + (target + HysteresisOffOffset.val));
            }
        }
        //if still off, check when to switch on
        else {
            if (current <= target - HysteresisOnOffset.val) {
                bRet = true;
                parentAdapter.log.debug(room.Name + " regulator to switch on " + current + "<=" + (target + HysteresisOnOffset.val));
            }
            else {
                parentAdapter.log.debug(room.Name + " regulator still not to switch on " + current + "<=" + (target + HysteresisOnOffset.val));
            }
        }
    }
    else {
        parentAdapter.log.error("unknown regulator hysteresis offset " + JSON.stringify(HysteresisOnOffset) + " " + JSON.stringify(HysteresisOnOffset) + " " + key);
    }

    return bRet;
}


module.exports = {
    regulator_start,
    regulator_GetStatus

};



