"use strict";


let parentAdapter;


//preparation for telegram, pushbullet, email ....

function StartExtendedLog(adapter) {
    parentAdapter = adapter;
}

function ErrorLog(error) {
    
    parentAdapter.log.error(error);
    
    sendNotification();
}

function ActorLog(actor, target) {
    if (parentAdapter.config.extendedInfoLogActor) {
        parentAdapter.log.debug("actor " + actor.OID + " to " + target);
    }
    else {
        parentAdapter.log.debug("actor " + actor.OID + " to " + target);
    }
    sendNotification();
}

function ThermostatLog(roomName, thermostat, target){

    if (parentAdapter.config.extendedInfoLogTemperature) {
        parentAdapter.log.info(roomName + " set thermostat target " + thermostat.OID_Target + " to " + target);
    }
    else {
        parentAdapter.log.debug(roomName + " set thermostat target " + thermostat.OID_Target + " to " + target);
    }
    sendNotification();
}

function WindowLog(roomName, state) {

    if (parentAdapter.config.extendedInfoLogWindow) {
        parentAdapter.log.info(roomName + "Change Status WindowOpen in " + " to " + state);
    }
    else {
        parentAdapter.log.debug(roomName + "Change Status WindowOpen in " + " to " + state);
    }
    sendNotification();
}


//general notfication
function sendNotification() {
    if (parentAdapter.config.notificationEnabled) {
        if (parentAdapter.config.notificationsType == "Telegram") {
            sendNotificationTelegram()
        }
        else if (parentAdapter.config.notificationsType == "E-Mail") {
            sendNotificationEmail()
        }
        else if (parentAdapter.config.notificationsType == "Pushover") {
            sendNotificationPushover()
        }
        else if (parentAdapter.config.notificationsType == "WhatsApp") {
            sendNotificationWhatsApp()
        }
        else if (parentAdapter.config.notificationsType == "Signal") {
            sendNotificationSignal()
        }
        else {
            parentAdapter.log.error("unknown notification type " + parentAdapter.config.notificationsType);
        }
    }
}


//telegram
function sendNotificationTelegram() {
    /*
    "telegramInstance": "telegram.0",
    "telegramNoticeType": "longTelegramNotice",
    "telegramUser": "All Receiver",
    "telegramSilentNotice": false,
    "telegramOnlyError": false,
    "telegramWaitToSend": 0,
    */
}

//email
function sendNotificationEmail() {
    /*
    "emailReceiver": "xxx@xxx.com",
    "emailSender": "xxx@xxx.com",
    "emailInstance": "email.0",
    "emailNoticeType": "longEmailNotice",
    "emailOnlyError": false,
    "emailWaitToSend": 0
     */
}

//pushover
function sendNotificationPushover() {
    /*
    "pushoverInstance": "pushover.0",
    "pushoverNoticeType": "longPushoverNotice",
    "pushoverSilentNotice": false,
    "pushoverDeviceID": "",
    "pushoverOnlyError": false,
    "pushoverWaitToSend": 0,
    */
}

//WhatsApp
function sendNotificationWhatsApp() {
    /*
    "whatsappInstance": "whatsapp-cmb.0",
    "whatsappNoticeType": "longWhatsappNotice",
    "whatsappOnlyError": false,
    "whatsappWaitToSend": 0,
    */
}

//signal
function sendNotificationSignal() {
    /*
    "signalInstance": "signal-cmb.0",
    "signalNoticeType": "longSignalNotice",
    "signalOnlyError": false,
    "signalWaitToSend": 0,
    */
}








module.exports = {
    StartExtendedLog,
    ErrorLog,
    ActorLog,
    ThermostatLog,
    WindowLog
};