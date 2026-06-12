 
/* eslint-disable quote-props */
 
import React from 'react';

import type { AdminConnection, IobTheme, ThemeName, ThemeType } from '@iobroker/adapter-react-v5';
import { type ConfigItemPanel, JsonConfigComponent } from '@iobroker/json-config';
import type { HeatingControlAdapterConfig } from "../types";


interface SettingsProps {
    common: ioBroker.InstanceCommon;
    native: HeatingControlAdapterConfig;
    instance: number;
    adapterName: string;
    socket: AdminConnection;
    changeNative: (native: ioBroker.AdapterConfig) => void;
    themeName: ThemeName;
    themeType: ThemeType;
    theme: IobTheme;
    systemConfig: ioBroker.SystemConfigObject;
    alive: boolean;
}


const schema: ConfigItemPanel = {
    type: 'panel',
    label: 'Logging',
    items: {
        _header8: {
            newLine: true,
            type: 'header',
            label: 'Logging',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
        },
        extendedInfoLogTemperature: {
            newLine: true,
            type: 'checkbox',
            label: 'extendedInfoLogTemperature',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        extendedInfoLogActor: {
            newLine: false,
            type: 'checkbox',
            label: 'extendedInfoLogActor',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseActors) return true;",
        },
        extendedInfoLogWindow: {
            newLine: false,
            type: 'checkbox',
            label: 'extendedInfoLogWindow',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseSensors) return true;",
        },
        //=======================================================================
        _header9: {
            newLine: true,
            type: 'header',
            label: 'Notifications',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
        },
        notificationEnabled: {
            newLine: true,
            type: 'checkbox',
            label: 'notificationEnabled',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        notificationsType: {
            newLine: false,
            type: 'select',
            options: [
                {
                    label: "Telegram",
                    value: "Telegram"
                },
                {
                    label: "E-Mail",
                    value: "E-Mail"
                },
                {
                    label: "Pushover",
                    value: "Pushover"
                },
                {
                    label: "WhatsApp",
                    value: "WhatsApp"
                },
                {
                    label: "Signal",
                    value: "Signal"
                },
                {
                    label: "Discord",
                    value: "Discord"
                }
            ],
            label: 'notificationsType',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled) return true;",
        },
        notificationsTemperature: {
            newLine: true,
            type: 'checkbox',
            label: 'notificationsTemperature',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled) return true;",
        },
        notificationsActor: {
            newLine: false,
            type: 'checkbox',
            label: 'notificationsActor',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || !data.UseActors) return true;",
        },
        notificationsWindow: {
            newLine: false,
            type: 'checkbox',
            label: 'notificationsWindow',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || !data.UseSensors) return true;",
        },
        //=======================================================================
        //Telegram Settings
        telegramInstance: {
            newLine: true,
            type: 'instance',
            label: 'Telegram instance',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Telegram') return true;",
        },
        telegramUser: {
            newLine: true,
            type: 'text',
            label: 'Telegram instance',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Telegram') return true;",
        },
        telegramWaitToSend: {
            newLine: false,
            type: 'number',
            min: 0,
            max: 60,
            step: 1,
            label: 'Waiting for the send (seconds)',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Telegram') return true;",
        },
        telegramSilentNotice: {
            newLine: false,
            type: 'checkbox',
            label: 'Silent Notice',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Telegram') return true;",
        },
        //=======================================================================
        //Whatsapp Settings
        whatsappWaitToSend: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 60,
            step: 1,
            label: 'Waiting for the send (seconds)',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='WhatsApp') return true;",
        },
        //=======================================================================
        //Signal Settings
        signalInstance: {
            newLine: true,
            type: 'instance',
            label: 'Signal instance',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Signal') return true;",
        },
        signalWaitToSend: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 60,
            step: 1,
            label: 'Waiting for the send (seconds)',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Signal') return true;",
        },
        //=======================================================================
        //Pushover Settings
        pushoverInstance: {
            newLine: true,
            type: 'instance',
            label: 'Pushover instance',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Pushover') return true;",
        },
        pushoverWaitToSend: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 60,
            step: 1,
            label: 'Waiting for the send (seconds)',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Pushover') return true;",
        },
        pushoverDeviceID: {
            newLine: false,
            type: 'text',
            label: 'device ID (optional)',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Pushover') return true;",
        },
        pushoverSilentNotice: {
            newLine: false,
            type: 'checkbox',
            label: 'Silent Notice',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Pushover') return true;",
        },
        //=======================================================================
        //email Settings
        emailInstance: {
            newLine: true,
            type: 'instance',
            label: 'email instance',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='E-Mail') return true;",
        },
        emailReceiver: {
            newLine: true,
            type: 'text',
            label: 'email receiver',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='E-Mail') return true;",
        },
        emailSender: {
            newLine: false,
            type: 'text',
            label: 'email sender',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='E-Mail') return true;",
        },
        
        emailWaitToSend: {
            newLine: false,
            type: 'number',
            min: 0,
            max: 60,
            step: 1,
            label: 'Waiting for the send (seconds)',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='E-Mail') return true;",
        },
        //=======================================================================
        //discord Settings
        discordInstance: {
            newLine: true,
            type: 'instance',
            label: 'Discord instance',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Discord') return true;",
        },
        discordTarget: {
            newLine: true,
            type: 'select',
            label: 'discordTarget',
            options: [
                {
                    label: "UserTag",
                    value: "UserTag"
                },
                {
                    label: "UserId",
                    value: "UserId"
                },
                {
                    label: "ServerChannel",
                    value: "ServerChannel"
                }
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Discord') return true;",
        },
        discordUserTag: {
            newLine: false,
            type: 'text',
            label: 'DiscordUserTag',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Discord') return true;",
        },
        discordUserId: {
            newLine: false,
            type: 'text',
            label: 'discordUserId',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Discord') return true;",
        },
        discordServerId: {
            newLine: false,
            type: 'text',
            label: 'discordServerId',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Discord') return true;",
        },
        discordChannelId: {
            newLine: false,
            type: 'text',
            label: 'discordChannelId',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Discord') return true;",
        },
        discordWaitToSend: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 60,
            step: 1,
            label: 'Waiting for the send (seconds)',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled || data.notificationsType!='Discord') return true;",
        },
        useCustumizedNotifications: {
            newLine: true,
            type: 'checkbox',
            label: 'useCustumizedNotifications',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled ) return true;",
        },
        useCustumizedNotificationsWithInstanceName: {
            newLine: false,
            type: 'checkbox',
            label: 'useCustumizedNotificationsWithInstanceName',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled ) return true;",
        },
        useCustumizedNotificationsNewTargetTemp: {
            newLine: true,
            type: 'text',
            label: 'useCustumizedNotificationsNewTargetTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled ) return true;",
        },
        useCustumizedNotificationsActorOn: {
            newLine: false,
            type: 'text',
            label: 'useCustumizedNotificationsActorOn',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled ) return true;",
        },
        useCustumizedNotificationsActorOff: {
            newLine: false,
            type: 'text',
            label: 'useCustumizedNotificationsActorOff',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled ) return true;",
        },
        useCustumizedNotificationsWindowOpen: {
            newLine: false,
            type: 'text',
            label: 'useCustumizedNotificationsWindowOpen',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled ) return true;",
        },
        useCustumizedNotificationsWindowClosed: {
            newLine: false,
            type: 'text',
            label: 'useCustumizedNotificationsWindowClosed',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled ) return true;",
        },
        enableCSVLogging: {
            newLine: true,
            type: 'checkbox',
            label: 'enableCSVLogging',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        }
    },
};


export default function Logging(props: SettingsProps): React.JSX.Element {
    return (
        <div style={{ width: 'calc(100% - 8px)', minHeight: '100%' }}>
            <JsonConfigComponent
                common={props.common}
                socket={props.socket}
                themeName={props.themeName}
                themeType={props.themeType}
                adapterName="heatingcontrol"
                instance={props.instance || 0}
                isFloatComma={props.systemConfig.common.isFloatComma}
                dateFormat={props.systemConfig.common.dateFormat}
                schema={schema}
                onChange={(params): void => {

                    const native: HeatingControlAdapterConfig = JSON.parse(JSON.stringify(props.native));

                    native.extendedInfoLogTemperature = params.extendedInfoLogTemperature;
                    native.extendedInfoLogActor = params.extendedInfoLogActor;
                    native.extendedInfoLogWindow = params.extendedInfoLogWindow;

                    native.notificationEnabled = params.notificationEnabled;
                    native.notificationsType = params.notificationsType;
                    native.notificationsTemperature = params.notificationsTemperature;
                    native.notificationsActor = params.notificationsActor;
                    native.notificationsWindow = params.notificationsWindow;

                    native.telegramInstance = params.telegramInstance;
                    native.telegramUser = params.telegramUser;
                    native.telegramWaitToSend = params.telegramWaitToSend;
                    native.telegramSilentNotice = params.telegramSilentNotice;

                    native.whatsappWaitToSend = params.whatsappWaitToSend;

                    native.signalInstance = params.signalInstance;
                    native.signalWaitToSend = params.signalWaitToSend;

                    native.pushoverInstance = params.pushoverInstance;
                    native.pushoverWaitToSend = params.pushoverWaitToSend;
                    native.pushoverDeviceID = params.pushoverDeviceID;
                    native.pushoverSilentNotice = params.pushoverSilentNotice;

                    native.emailReceiver = params.emailReceiver;
                    native.emailSender = params.emailSender;
                    native.emailInstance = params.emailInstance;
                    native.emailWaitToSend = params.emailWaitToSend;

                    native.discordInstance = params.discordInstance;
                    native.discordTarget = params.discordTarget;
                    native.discordUserTag = params.discordUserTag;
                    native.discordUserId = params.discordUserId;
                    native.discordServerId = params.discordServerId;
                    native.discordChannelId = params.discordChannelId;
                    native.discordWaitToSend = params.discordWaitToSend;

                    native.useCustumizedNotifications = params.useCustumizedNotifications;
                    native.useCustumizedNotificationsWithInstanceName = params.useCustumizedNotificationsWithInstanceName;
                    native.useCustumizedNotificationsNewTargetTemp = params.useCustumizedNotificationsNewTargetTemp;
                    native.useCustumizedNotificationsActorOn = params.useCustumizedNotificationsActorOn;
                    native.useCustumizedNotificationsActorOff = params.useCustumizedNotificationsActorOff;
                    native.useCustumizedNotificationsWindowOpen = params.useCustumizedNotificationsWindowOpen;
                    native.useCustumizedNotificationsWindowClosed = params.useCustumizedNotificationsWindowClosed;
                    native.enableCSVLogging = params.enableCSVLogging;

                    props.changeNative(native);
                }}
                data={props.native}
                onError={() => {}}
                theme={props.theme}
                withoutSaveButtons
            />
        </div>
    );
}
