"use strict";


let parentAdapter=null;


//preparation for telegram, pushbullet, email ....

function StartExtendedLog(adapter) {
    parentAdapter = adapter;
}

function ErrorLog(error) {

    //parentAdapter.log.error(error);

    sendNotification(error);

}

function ActorLog(actor, target) {
    let msg = "actor " + actor.OID + " to " + target;

    if (parentAdapter.config.notificationsActor) {
        sendNotification(msg);
    }

    if (parentAdapter.config.extendedInfoLogActor) {
        parentAdapter.log.info(msg);
    }
    else {
        parentAdapter.log.debug(msg);
    }
    
}

function ThermostatLog(roomName, thermostat, target){
    let msg = roomName + " set thermostat  " + thermostat.OID_Target + " to " + target;

    if (parentAdapter.config.notificationsTemperature) {
        sendNotification(msg);
    }

    if (parentAdapter.config.extendedInfoLogTemperature) {
        parentAdapter.log.info(msg);
    }
    else {
        parentAdapter.log.debug(msg);
    }
    
}

function WindowLog(roomName, state) {

    let msg = roomName + ": Change Status WindowOpen to " + state;
    if (parentAdapter.config.notificationsWindow) {
        sendNotification(msg);
    }

    if (parentAdapter.config.extendedInfoLogWindow) {
        parentAdapter.log.info(msg);
    }
    else {
        parentAdapter.log.debug(msg);
    }
    
}


//general notfication
let TelegramTimerId = null;
let TelegramMessage = "";
let EmailTimerId = null;
let EmailMessage = "";
let PushoverTimerId = null;
let PushoverMessage = "";
let WhatsappTimerId = null;
let WhatsappMessage = "";
let SignalTimerId = null;
let SignalMessage = "";


function sendNotification(msg) {
    try {
        if (parentAdapter.config.notificationEnabled) {
            parentAdapter.log.debug("send notfications");
            if (parentAdapter.config.notificationsType == "Telegram") {

                if (parentAdapter.config.telegramWaitToSend > 0) {
                    if (TelegramTimerId == null) {
                        TelegramMessage  = msg;
                        TelegramTimerId = setTimeout(sendNotificationTelegram, parentAdapter.config.telegramWaitToSend * 1000);
                    }
                    else {
                        TelegramMessage += '\r\n' + msg;
                    }
                }
                else {
                    TelegramMessage = msg;
                    sendNotificationTelegram()
                }
            }
            else if (parentAdapter.config.notificationsType == "E-Mail") {

                if (parentAdapter.config.emailWaitToSend > 0) {
                    parentAdapter.log.debug("send notfications with delay " + parentAdapter.config.emailWaitToSend );
                    if (EmailTimerId == null) {
                        parentAdapter.log.debug("start new timer");
                        EmailMessage = msg;
                        EmailTimerId = setTimeout(sendNotificationEmail, parentAdapter.config.emailWaitToSend * 1000);
                    }
                    else {
                        parentAdapter.log.debug("timer already running");
                        EmailMessage += '\r\n' + msg;
                    }
                }
                else {
                    parentAdapter.log.debug("send notfications without delay");
                    EmailMessage = msg;
                    sendNotificationEmail()
                }
            }
            else if (parentAdapter.config.notificationsType == "Pushover") {

                if (parentAdapter.config.pushoverWaitToSend > 0) {
                    if (PushoverTimerId == null) {
                        PushoverMessage = msg;
                        PushoverTimerId = setTimeout(sendNotificationPushover, parentAdapter.config.pushoverWaitToSend * 1000);
                    }
                    else {
                        PushoverMessage += '\r\n' + msg;
                    }
                }
                else {
                    PushoverMessage = msg;
                    sendNotificationPushover()
                }

            }
            else if (parentAdapter.config.notificationsType == "WhatsApp") {

                if (parentAdapter.config.whatsappWaitToSend > 0) {
                    if (WhatsappTimerId == null) {
                        WhatsappMessage = msg;
                        WhatsappTimerId = setTimeout(sendNotificationWhatsApp, parentAdapter.config.whatsappWaitToSend * 1000);
                    }
                    else {
                        WhatsappMessage += '\r\n' + msg;
                    }
                }
                else {
                    WhatsappMessage = msg;
                    sendNotificationWhatsApp()
                }
            }
            else if (parentAdapter.config.notificationsType == "Signal") {

                if (parentAdapter.config.signalWaitToSend > 0) {
                    if (SignalTimerId == null) {
                        SignalMessage = msg;
                        SignalTimerId = setTimeout(sendNotificationSignal, parentAdapter.config.signalWaitToSend * 1000);
                    }
                    else {
                        SignalMessage += '\r\n' + msg;
                    }
                }
                else {
                    SignalMessage = msg;
                    sendNotificationSignal()
                }
            }
            else {
                parentAdapter.log.error("unknown notification type " + parentAdapter.config.notificationsType);
            }
        }
    }
    catch (e) {
        parentAdapter.log.error("exception in sendNotification [" + e + "] " + msg + " " + JSON.stringify(parentAdapter.config));
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
    clearTimeout(TelegramTimerId);
    TelegramTimerId = null;

    parentAdapter.log.debug("send notfications telegram");

    let msg = 'HeatingControl:\r\n' + TelegramMessage;

    if (parentAdapter.config.telegramUser && parentAdapter.config.telegramUser === 'allTelegramUsers') {

        parentAdapter.sendTo(
            parentAdapter.config.telegramInstance,
            'send',
            {
                text: msg,
                disable_notification: parentAdapter.config.telegramSilentNotice
            });
    } else {
        parentAdapter.sendTo(
            parentAdapter.config.telegramInstance,
            'send',
            {
                user: parentAdapter.config.telegramUser,
                text: msg,
                disable_notification: parentAdapter.config.telegramSilentNotice
            });
    }
    TelegramMessage = "";
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
    clearTimeout(EmailTimerId);
    EmailTimerId = null;

    parentAdapter.log.debug("send notfications email");

    let msg = 'HeatingControl:\r\n' + EmailMessage;

    parentAdapter.sendTo(
        parentAdapter.config.emailInstance,
        'send',
        {
            text:  msg,
            to: parentAdapter.config.emailReceiver,
            subject: 'HeatingControl',
            from: parentAdapter.config.emailSender
        });
    EmailMessage = "";
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
    clearTimeout(PushoverTimerId);
    PushoverTimerId = null;

    parentAdapter.log.debug("send notfications pushover");

    let msg = 'HeatingControl:\r\n' + PushoverMessage;

    if (parentAdapter.config.pushoverSilentNotice === 'true' || parentAdapter.config.pushoverSilentNotice === true) {
        parentAdapter.sendTo(
            parentAdapter.config.pushoverInstance,
            'send',
            {
                message:  msg,
                sound: '',
                priority: -1,
                title: 'HeatingControl',
                device: parentAdapter.config.pushoverDeviceID
            });
    } else {
        parentAdapter.sendTo(
            parentAdapter.config.pushoverInstance,
            'send',
            {
                message:  msg,
                sound: '',
                title: 'HeatingControl',
                device: parentAdapter.config.pushoverDeviceID
            });
    }
    PushoverMessage = "";
}

//WhatsApp
function sendNotificationWhatsApp() {
    /*
    "whatsappInstance": "whatsapp-cmb.0",
    "whatsappNoticeType": "longWhatsappNotice",
    "whatsappOnlyError": false,
    "whatsappWaitToSend": 0,
    */
    clearTimeout(WhatsappTimerId);
    WhatsappTimerId = null;

    parentAdapter.log.debug("send notfications whatsapp");

    let msg = 'HeatingControl:\r\n' + WhatsappMessage;

    parentAdapter.sendTo(
        parentAdapter.config.whatsappInstance,
        'send',
        {
            text:  msg
        });

    WhatsappMessage = "";
}

//signal
function sendNotificationSignal() {
    /*
    "signalInstance": "signal-cmb.0",
    "signalNoticeType": "longSignalNotice",
    "signalOnlyError": false,
    "signalWaitToSend": 0,
    */
    clearTimeout(SignalTimerId);
    SignalTimerId = null;

    parentAdapter.log.debug("send notfications signal");

    let msg = 'HeatingControl:\r\n' + SignalMessage;

    parentAdapter.sendTo(
        parentAdapter.config.signalInstance,
        'send',
        {
            text: msg
        });

    SignalMessage = "";
}








module.exports = {
    StartExtendedLog,
    ErrorLog,
    ActorLog,
    ThermostatLog,
    WindowLog
};