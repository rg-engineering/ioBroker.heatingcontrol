"use strict";

const GetTranslation = require("./support_tools.js").GetTranslation;


let parentAdapter = null;
let SystemLanguage = "de";


//preparation for telegram, pushbullet, email ....

function StartExtendedLog(adapter) {
    parentAdapter = adapter;
}


function SetSystemLanguage(language) {
    SystemLanguage = language;
}

function ErrorLog(error) {

    //parentAdapter.log.error(error);

    sendNotification(error);

}

function ActorLog(actor, target) {

    const msgtext = GetTranslation(parentAdapter, "set actor", SystemLanguage);

    //let msg = "set actor " + actor.name + " to " + target;

    let msg = actor.name + " " + msgtext + " " + target;

    if (parentAdapter.config.useCustumizedNotifications) {
        if (target) {
            if (parentAdapter.config.useCustumizedNotificationsActorOn.length > 0) {
                msg = actor.name + " " + parentAdapter.config.useCustumizedNotificationsActorOn;
            }
        }
        else {
            if (parentAdapter.config.useCustumizedNotificationsActorOff.length > 0) {
                msg = actor.name + " " + parentAdapter.config.useCustumizedNotificationsActorOff;
            }
        }
    }

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

function ThermostatLog(roomName, thermostat, target) {

    const msgtext = GetTranslation(parentAdapter, "set thermostat", SystemLanguage);

    //let msg = roomName + ": set thermostat  " + thermostat.name + " to " + target;
    let msg = roomName + ": " + thermostat.name + " " + msgtext + " " + target + "°C";

    if (parentAdapter.config.useCustumizedNotifications) {

        if (parentAdapter.config.useCustumizedNotificationsNewTargetTemp.length > 0) {
            msg = roomName + ": " + thermostat.name + " " + parentAdapter.config.useCustumizedNotificationsNewTargetTemp + " " + target + "°C";
        }
    }

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

    const msgtext = GetTranslation(parentAdapter, "change window state", SystemLanguage);

    //let msg = roomName + ": change Status WindowOpen to " + state;
    let msg = roomName + ": "  + msgtext + " " + state;

    if (parentAdapter.config.useCustumizedNotifications) {
        if (state) {
            if (parentAdapter.config.useCustumizedNotificationsWindowOpen.length > 0) {
                msg = roomName + ": " + parentAdapter.config.useCustumizedNotificationsWindowOpen;
            }
        }
        else {
            if (parentAdapter.config.useCustumizedNotificationsWindowClose.length > 0) {
                msg = roomName + ": " + parentAdapter.config.useCustumizedNotificationsWindowClose;
            }
        }
    }

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
let DiscordTimerId = null;
let DiscordMessage = "";


function sendNotification(msg) {
    try {
        if (parentAdapter.config.notificationEnabled) {
            parentAdapter.log.debug("send notfications " + parentAdapter.config.notificationsType);
            if (parentAdapter.config.notificationsType == "Telegram") {

                if (parentAdapter.config.telegramWaitToSend > 0) {
                    if (TelegramTimerId == null) {
                        TelegramMessage  = msg;
                        TelegramTimerId = setTimeout(sendNotificationTelegram, parentAdapter.config.telegramWaitToSend * 1000);
                    }
                    else {
                        TelegramMessage += "\r\n" + msg;
                    }
                }
                else {
                    TelegramMessage = msg;
                    sendNotificationTelegram();
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
                        EmailMessage += "\r\n" + msg;
                    }
                }
                else {
                    parentAdapter.log.debug("send notfications without delay");
                    EmailMessage = msg;
                    sendNotificationEmail();
                }
            }
            else if (parentAdapter.config.notificationsType == "Pushover") {

                if (parentAdapter.config.pushoverWaitToSend > 0) {
                    if (PushoverTimerId == null) {
                        PushoverMessage = msg;
                        PushoverTimerId = setTimeout(sendNotificationPushover, parentAdapter.config.pushoverWaitToSend * 1000);
                    }
                    else {
                        PushoverMessage += "\r\n" + msg;
                    }
                }
                else {
                    PushoverMessage = msg;
                    sendNotificationPushover();
                }

            }
            else if (parentAdapter.config.notificationsType == "WhatsApp") {

                if (parentAdapter.config.whatsappWaitToSend > 0) {
                    if (WhatsappTimerId == null) {
                        WhatsappMessage = msg;
                        WhatsappTimerId = setTimeout(sendNotificationWhatsApp, parentAdapter.config.whatsappWaitToSend * 1000);
                    }
                    else {
                        WhatsappMessage += "\r\n" + msg;
                    }
                }
                else {
                    WhatsappMessage = msg;
                    sendNotificationWhatsApp();
                }
            }
            else if (parentAdapter.config.notificationsType == "Signal") {

                if (parentAdapter.config.signalWaitToSend > 0) {
                    if (SignalTimerId == null) {
                        SignalMessage = msg;
                        SignalTimerId = setTimeout(sendNotificationSignal, parentAdapter.config.signalWaitToSend * 1000);
                    }
                    else {
                        SignalMessage += "\r\n" + msg;
                    }
                }
                else {
                    SignalMessage = msg;
                    sendNotificationSignal();
                }
            }
            else if (parentAdapter.config.notificationsType == "Discord") {

                if (parentAdapter.config.discordWaitToSend > 0) {
                    if (DiscordTimerId == null) {
                        DiscordMessage = msg;
                        DiscordTimerId = setTimeout(sendNotificationDiscord, parentAdapter.config.discordWaitToSend * 1000);
                    }
                    else {
                        DiscordMessage += "\r\n" + msg;
                    }
                }
                else {
                    DiscordMessage = msg;
                    sendNotificationDiscord();
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

    parentAdapter.log.debug("send notfications telegram to " + parentAdapter.config.telegramUser + " " + parentAdapter.config.telegramSilentNotice + " " + TelegramMessage);

    if (parentAdapter.config.telegramInstance != null && parentAdapter.config.telegramInstance.length > 1) {
        let msg = "";
        if (parentAdapter.config.useCustumizedNotifications && parentAdapter.config.useCustumizedNotificationsWithInstanceName) {
            msg += "HeatingControl:\r\n";
        }
        else {
            msg += "HeatingControl:\r\n";
        }

        msg += TelegramMessage;

        if (parentAdapter.config.telegramUser && parentAdapter.config.telegramUser === "allTelegramUsers") {

            parentAdapter.sendTo(
                parentAdapter.config.telegramInstance,
                "send",
                {
                    text: msg,
                    disable_notification: parentAdapter.config.telegramSilentNotice
                });
        } else {
            parentAdapter.sendTo(
                parentAdapter.config.telegramInstance,
                "send",
                {
                    chatId: parentAdapter.config.telegramUser,
                    //user: parentAdapter.config.telegramUser,
                    text: msg,
                    disable_notification: parentAdapter.config.telegramSilentNotice
                });
        }
    }
    else {
        parentAdapter.log.error("no telegram instance configured"); 
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

    if (parentAdapter.config.emailInstance != null && parentAdapter.config.emailInstance.length > 1) {

        let msg = "";
        if (parentAdapter.config.useCustumizedNotifications && parentAdapter.config.useCustumizedNotificationsWithInstanceName) {
            msg += "HeatingControl:\r\n";
        }
        else {
            msg += "HeatingControl:\r\n";
        }

        msg += EmailMessage;

        parentAdapter.sendTo(
            parentAdapter.config.emailInstance,
            "send",
            {
                text: msg,
                to: parentAdapter.config.emailReceiver,
                subject: "HeatingControl",
                from: parentAdapter.config.emailSender
            });
    }
    else {
        parentAdapter.log.error("no email instance configured"); 
    }
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

    if (parentAdapter.config.pushoverInstance != null && parentAdapter.config.pushoverInstance.length > 1) {

        let msg = "";
        if (parentAdapter.config.useCustumizedNotifications && parentAdapter.config.useCustumizedNotificationsWithInstanceName) {
            msg += "HeatingControl:\r\n";
        }
        else {
            msg += "HeatingControl:\r\n";
        }

        msg += PushoverMessage;

        if (parentAdapter.config.pushoverSilentNotice === "true" || parentAdapter.config.pushoverSilentNotice === true) {
            parentAdapter.sendTo(
                parentAdapter.config.pushoverInstance,
                "send",
                {
                    message: msg,
                    sound: "",
                    priority: -1,
                    title: "HeatingControl",
                    device: parentAdapter.config.pushoverDeviceID
                });
        } else {
            parentAdapter.sendTo(
                parentAdapter.config.pushoverInstance,
                "send",
                {
                    message: msg,
                    sound: "",
                    title: "HeatingControl",
                    device: parentAdapter.config.pushoverDeviceID
                });
        }
    }
    else {
        parentAdapter.log.error("no pushover instance configured");
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

    if (parentAdapter.config.whatsappInstance != null && parentAdapter.config.whatsappInstance.length > 1) {

        let msg = "";
        if (parentAdapter.config.useCustumizedNotifications && parentAdapter.config.useCustumizedNotificationsWithInstanceName) {
            msg += "HeatingControl:\r\n";
        }
        else {
            msg += "HeatingControl:\r\n";
        }

        msg += WhatsappMessage;

        parentAdapter.sendTo(
            parentAdapter.config.whatsappInstance,
            "send",
            {
                text: msg
            });
    }
    else {
        parentAdapter.log.error("no whatsapp instance configured");
    }
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

    if (parentAdapter.config.signalInstance != null && parentAdapter.config.signalInstance.length > 1) {

        let msg = "";
        if (parentAdapter.config.useCustumizedNotifications && parentAdapter.config.useCustumizedNotificationsWithInstanceName) {
            msg += "HeatingControl:\r\n";
        }
        else {
            msg += "HeatingControl:\r\n";
        }

        msg += SignalMessage;

        parentAdapter.sendTo(
            parentAdapter.config.signalInstance,
            "send",
            {
                text: msg
            });
    }
    else {
        parentAdapter.log.error("no signal instance configured");
    }
    SignalMessage = "";
}

//discord
function sendNotificationDiscord() {
    /*
    "discordInstance": "",
    "discordUserTag": "",
    "discordWaitToSend": 0,
    */
    clearTimeout(DiscordTimerId);
    DiscordTimerId = null;

    parentAdapter.log.debug("send notfications discord");

    if (parentAdapter.config.discordInstance != null && parentAdapter.config.discordInstance.length > 1) {

        let msg = "";
        if (parentAdapter.config.useCustumizedNotifications && parentAdapter.config.useCustumizedNotificationsWithInstanceName) {
            msg += "HeatingControl:\r\n";
        }
        else {
            msg += "HeatingControl:\r\n";
        }

        msg += DiscordMessage;

        //	content needs to be a string or a MessageOptions object

        if (parentAdapter.config.discordTarget == "UserTag") {
            if (parentAdapter.config.discordUserTag != null && parentAdapter.config.discordUserTag.length > 1) {
                parentAdapter.sendTo(

                    parentAdapter.config.discordInstance,
                    "sendMessage",
                    {
                        userTag: parentAdapter.config.discordUserTag,
                        //oder
                        //userId: '490222742801481728',
                        //oder
                        //serverId: '813364154118963251',
                        //channelId: '813364154559102998',
                        content: msg,
                        //emoji: '😎',

                    });
            }
            else {
                parentAdapter.log.error("no discord userTage configured");
            }
        }
        else if (parentAdapter.config.discordTarget == "UserId") {
            if (parentAdapter.config.discordUserId != null && parentAdapter.config.discordUserId.length > 1) {
                parentAdapter.sendTo(
                    parentAdapter.config.discordInstance,
                    "sendMessage",
                    {
                        //userTag: parentAdapter.config.discordUserTag,
                        //oder
                        userId: parentAdapter.config.discordUserId,
                        //oder
                        //serverId: '813364154118963251',
                        //channelId: '813364154559102998',
                        content: msg,
                        //emoji: '😎',

                    });
            }
            else {
                parentAdapter.log.error("no discord userId configured");
            }
        }
        else if (parentAdapter.config.discordTarget == "ServerChannel") {
            if (parentAdapter.config.discordServerId != null && parentAdapter.config.discordServerId.length > 1
                && parentAdapter.config.discordChannelId != null && parentAdapter.config.discordChannelId.length > 1) {
                parentAdapter.sendTo(
                    parentAdapter.config.discordInstance,
                    "sendMessage",
                    {
                        //userTag: parentAdapter.config.discordUserTag,
                        //oder
                        //userId: parentAdapter.config.discordUserId,
                        //oder
                        serverId: parentAdapter.config.discordServerId,
                        channelId: parentAdapter.config.discordChannelId,
                        content: msg,
                        //emoji: '😎',

                    });
            }
            else {
                parentAdapter.log.error("no discord channel or server ID configured");
            }
        }
        else {
            parentAdapter.log.error("discord unknown target");
        }
    }
    else {
        parentAdapter.log.error("no discord instance configured");
    }
    DiscordMessage = "";
}






module.exports = {
    StartExtendedLog,
    ErrorLog,
    ActorLog,
    ThermostatLog,
    WindowLog,
    SetSystemLanguage
};