/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */
import React from 'react';

import type { AdminConnection, IobTheme, ThemeName, ThemeType } from '@iobroker/adapter-react-v5';
import { type ConfigItemPanel, JsonConfigComponent } from '@iobroker/json-config';
import type { HeatingControlAdapterConfig } from "../types";


//todo: ausblenden von einstellungen je nach auswahl
//todo: buttons evtl. auf neue Seite auslagern
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
    label: 'main settings',
    items: {
        //=======================================================================
        _header1: {
            newLine: true,
            type: 'header',
            label: 'GeneralSettings',
            xs: 12,
        },
        timezone: {
            newLine: true,
            type: 'text',
            label: 'timezone',
            xs: 12
        },
        //=======================================================================
        _header2: {
            newLine: true,
            type: 'header',
            label: 'DPSettings',
            xs: 12,
        },
        Path2PresentDP: {
            newLine: true,
            type: 'objectId',
            label: 'Path2PresentDP'
        },
        Path2PresentDPType: {
            newLine: false,
            type: 'select',
            label: 'Path2PresentDPType',
            options: [
                {
                    label: "boolean",
                    value: 1
                },
                {
                    label: "number",
                    value: 2
                }
            ]
        },
        Path2VacationDP: {
            newLine: true,
            type: 'objectId',
            label: 'Path2VacationDP'
        },
        Path2GuestsPresentDP: {
            newLine: true,
            type: 'objectId',
            label: 'Path2GuestsPresentDP'
        },
        Path2GuestsPresentDPType: {
            newLine: false,
            type: 'select',
            label: 'Path2GuestsPresentDPType',
            options: [
                {
                    label: "boolean",
                    value: 1
                },
                {
                    label: "number",
                    value: 2
                }
            ]
        },
        Path2GuestsPresentDPLimit: {
            newLine: false,
            type: 'number',
            min: 0,
            step: 1,
            label: 'Path2GuestsPresentDPLimit'
        },
        Path2PartyNowDP: {
            newLine: true,
            type: 'objectId',
            label: 'Path2PartyNowDP'
        },
        Path2PartyNowDPType: {
            newLine: false,
            type: 'select',
            label: 'Path2PartyNowDPType',
            options: [
                {
                    label: "boolean",
                    value: 1
                },
                {
                    label: "number",
                    value: 2
                }
            ]
        },
        Path2PartyNowDPLimit: {
            newLine: false,
            type: 'number',
            min: 0,
            step: 1,
            label: 'Path2PartyNowDPLimit'
        },
        //=======================================================================
        _header3: {
            newLine: true,
            type: 'header',
            label: 'ThermostatSettings',
            xs: 12,
        },
        UseChangesFromThermostat: {
            newLine: false,
            type: 'select',
            label: 'UseChangesFromThermostat',
            options: [
                {
                    label: "no",
                    value: 1
                },
                {
                    label: "as_override",
                    value: 2
                },
                {
                    label: "as_new_profile_setting",
                    value: 3
                },
                {
                    label: "until_next_profile_point",
                    value: 5
                }
            ]
        },
        ExtendOverride: {
            newLine: false,
            type: 'checkbox',
            label: 'ExtendOverride'
        },
        OverrideMode: {
            newLine: false,
            type: 'select',
            label: 'OverrideMode',
            options: [
                {
                    label: "timer",
                    value: 1
                },
                {
                    label: "until_next_profile_point",
                    value: 2
                }
            ]
        },
        ThermostatHandlesWindowOpen: {
            newLine: false,
            type: 'checkbox',
            label: 'ThermostatHandlesWindowOpen'
        },
        InterThermostatDelay: {
            newLine: false,
            type: 'number',
            min: 0,
            step: 1,
            label: 'InterThermostatDelay'
        },
        //=======================================================================
        _header4: {
            newLine: true,
            type: 'header',
            label: 'AdditionalTemperatureSensorSettings',
            xs: 12,
        },
        UseAddTempSensors: {
            newLine: false,
            type: 'checkbox',
            label: 'UseAddTempSensors'
        },
        hint_UseAddTempSensors: {
            newLine: true,
            type: 'text',
            readOnly: true,
            label: 'hint_UseAddTempSensors'
        },
        AddTempSensorsTempLimit: {
            newLine: false,
            type: 'number',
            min: 0,
            max: 6,
            label: 'AddTempSensorsTempLimit'
        },
        hint_AddTempSensorsTempLimit: {
            newLine: true,
            type: 'text',
            readOnly: true,
            label: 'hint_AddTempSensorsTempLimit'
        },
        AddTempSensorsMaxTimeDiff: {
            newLine: false,
            type: 'number',
            min: 0,
            max: 1000,
            label: 'AddTempSensorsMaxTimeDiff'
        },
        hint_AddTempSensorsMaxTimeDiff: {
            newLine: true,
            type: 'text',
            readOnly: true,
            label: 'hint_AddTempSensorsMaxTimeDiff'
        },
        AddTempSensorsUseEveryOffsetChange: {
            newLine: false,
            type: 'checkbox',
            label: 'AddTempSensorsUseEveryOffsetChange'
        },

        //=======================================================================
        _header5: {
            newLine: true,
            type: 'header',
            label: 'SensorSettings',
            xs: 12,
        },
        UseSensors: {
            newLine: true,
            type: 'checkbox',
            label: 'use_sensors'
        },
        SensorOpenDelay: {
            newLine: true,
            type: 'number',
            min: 0,
            step: 1,
            label: 'SensorOpenDelay'
        },
        SensorCloseDelay: {
            newLine: true,
            type: 'number',
            min: 0,
            step: 1,
            label: 'SensorCloseDelay'
        },
        //=======================================================================
        _header6: {
            newLine: true,
            type: 'header',
            label: 'ActorSettings',
            xs: 12,
        },
        UseActors: {
            newLine: true,
            type: 'checkbox',
            label: 'use_actors'
        },
        ActorBeforeOnDelay: {
            newLine: true,
            type: 'number',
            min: 0,
            step: 1,
            label: 'ActorBeforeOnDelay'
        },
        ActorBeforeOffDelay: {
            newLine: true,
            type: 'number',
            min: 0,
            step: 1,
            label: 'ActorBeforeOffDelay'
        },
        InterActorDelay: {
            newLine: true,
            type: 'number',
            min: 0,
            step: 1,
            label: 'InterActorDelay'
        },
        regulatorType: {
            newLine: false,
            type: 'select',
            label: 'regulatorType',
            options: [
                {
                    label: "linear",
                    value: 1
                },
                {
                    label: "linear Hysteresis",
                    value: 2
                }
            ]
        },
        ExtHandlingRepTime: {
            newLine: true,
            type: 'number',
            min: 0,
            step: 1,
            label: 'ExtHandlingActorRepTime'
        },
        ExtHandlingActorAckWaitTime: {
            newLine: true,
            type: 'number',
            min: 0,
            step: 1,
            label: 'ExtHandlingActorAckWaitTime'
        },
        UseActorsIfNotHeating: {
            newLine: false,
            type: 'select',
            label: 'UseActorsIfNotHeating',
            options: [
                {
                    label: "nothing",
                    value: 1
                },
                {
                    label: "off",
                    value: 2
                },
                {
                    label: "on",
                    value: 3
                }
            ]
        },
        UseActorsIfNoThermostat: {
            newLine: false,
            type: 'select',
            label: 'UseActorsIfNoThermostat',
            options: [
                {
                    label: "nothing",
                    value: 1
                },
                {
                    label: "off",
                    value: 2
                },
                {
                    label: "on",
                    value: 3
                }
            ]
        },
        //=======================================================================
        _header7: {
            newLine: true,
            type: 'header',
            label: 'VisSettings',
            xs: 12,
        },
        UseVisFromPittini: {
            newLine: true,
            type: 'checkbox',
            label: 'UseVisFromPittini'
        },
        hint_vis_from_Pittini: {
            newLine: true,
            type: 'text',
            readOnly: true,
            label: 'hint_vis_from_Pittini'
        },
        VisUseSimple: {
            newLine: true,
            type: 'checkbox',
            label: 'VisUseSimple'
        },
        PittiniPathImageWindowOpen: {
            newLine: true,
            type: 'text',
            label: 'PittiniPathImageWindowOpen'
        },
        PittiniPathImageWindowClosed: {
            newLine: false,
            type: 'text',
            label: 'PittiniPathImageWindowClosed'
        },
        VisMinProfilTemp: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 20,
            label: 'VisMinProfilTemp'
        },
        VisMaxProfilTemp: {
            newLine: false,
            type: 'number',
            min: 0,
            max: 20,
            label: 'VisMaxProfilTemp'
        },
        VisStepWidthProfilTemp: {
            newLine: false,
            type: 'select',
            options: [
                {
                    label: "0.5 °C",
                    value: 1.5
                },
                {
                    label: "1 °C",
                    value: 1
                },
                {
                    label: "2 °C",
                    value: 2
                }
            ],
            label: 'VisStepWidthProfilTemp'
        },
        VisMinDecRelTemp: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 20,
            label: 'VisMinDecRelTemp'
        },
        VisMaxDecRelTemp: {
            newLine: false,
            type: 'number',
            min: 0,
            max: 20,
            label: 'VisMaxDecRelTemp'
        },
        VisStepWidthDecRelTemp: {
            newLine: false,
            type: 'select',
            options: [
                {
                    label: "0.5 °C",
                    value: 1.5
                },
                {
                    label: "1 °C",
                    value: 1
                },
                {
                    label: "2 °C",
                    value: 2
                }
            ],
            label: 'VisStepWidthDecRelTemp'
        },
        VisMinDecAbsTemp: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 20,
            label: 'VisMinDecAbsTemp'
        },
        VisMaxDecAbsTemp: {
            newLine: false,
            type: 'number',
            min: 0,
            max: 20,
            label: 'VisMaxDecAbsTemp'
        },
        VisStepWidthDecAbsTemp: {
            newLine: false,
            type: 'select',
            options: [
                {
                    label: "0.5 °C",
                    value: 1.5
                },
                {
                    label: "1 °C",
                    value: 1
                },
                {
                    label: "2 °C",
                    value: 2
                }
            ],
            label: 'VisStepWidthDecAbsTemp'
        },
        VisMinOverrideTemp: {
            newLine: true,
            type: 'number',
            min: 3,
            max: 20,
            label: 'VisMinOverrideTemp'
        },
        VisMaxOverrideTemp: {
            newLine: false,
            type: 'number',
            min: 5,
            max: 35,
            label: 'VisMaxOverrideTemp'
        },
        VisStepWidthOverrideTemp: {
            newLine: false,
            type: 'select',
            options: [
                {
                    label: "0.5 °C",
                    value: 1.5
                },
                {
                    label: "1 °C",
                    value: 1
                },
                {
                    label: "2 °C",
                    value: 2
                }
            ],
            label: 'VisStepWidthOverrideTemp'
        },

        //=======================================================================
        _header8: {
            newLine: true,
            type: 'header',
            label: 'Logging',
            xs: 12,
        },
        extendedInfoLogTemperature: {
            newLine: true,
            type: 'checkbox',
            label: 'extendedInfoLogTemperature'
        },
        extendedInfoLogActor: {
            newLine: false,
            type: 'checkbox',
            label: 'extendedInfoLogActor'
        },
        extendedInfoLogWindow: {
            newLine: false,
            type: 'checkbox',
            label: 'extendedInfoLogWindow'
        },
        //=======================================================================
        _header9: {
            newLine: true,
            type: 'header',
            label: 'Notifications',
            xs: 12,
        },
        notificationEnabled: {
            newLine: true,
            type: 'checkbox',
            label: 'notificationEnabled'
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
            label: 'notificationsType'
        },
        notificationsTemperature: {
            newLine: true,
            type: 'checkbox',
            label: 'notificationsTemperature'
        },
        notificationsActor: {
            newLine: false,
            type: 'checkbox',
            label: 'notificationsActor'
        },
        notificationsWindow: {
            newLine: false,
            type: 'checkbox',
            label: 'notificationsWindow'
        },
        //=======================================================================
        //Telegram Settings
        telegramInstance: {
            newLine: true,
            type: 'instance',
            label: 'Telegram instance',
        },
        telegramUser: {
            newLine: false,
            type: 'text',
            label: 'Telegram instance',
        },
        telegramWaitToSend: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 20,
            step: 1,
            label: 'Waiting for the send (seconds)'
        },
        telegramSilentNotice: {
            newLine: false,
            type: 'checkbox',
            label: 'Silent Notice'
        },
        //=======================================================================
        //Whatsapp Settings
        whatsappWaitToSend: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 20,
            step: 1,
            label: 'Waiting for the send (seconds)'
        },
        //=======================================================================
        //Signal Settings
        signalInstance: {
            newLine: true,
            type: 'instance',
            label: 'Signal instance',
        },
        signalWaitToSend: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 20,
            step: 1,
            label: 'Waiting for the send (seconds)'
        },
        //=======================================================================
        //Pushover Settings
        pushoverInstance: {
            newLine: true,
            type: 'instance',
            label: 'Pushover instance',
        },
        pushoverWaitToSend: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 20,
            step: 1,
            label: 'Waiting for the send (seconds)'
        },
        pushoverDeviceID: {
            newLine: false,
            type: 'text',
            label: 'device ID (optional)'
        },
        pushoverSilentNotice: {
            newLine: false,
            type: 'checkbox',
            label: 'Silent Notice'
        },
        //=======================================================================
        //email Settings
        emailReceiver: {
            newLine: true,
            type: 'text',
            label: 'email receiver',
        },
        emailSender: {
            newLine: false,
            type: 'text',
            label: 'email sender',
        },
        emailInstance: {
            newLine: true,
            type: 'instance',
            label: 'email instance',
        },
        emailWaitToSend: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 20,
            step: 1,
            label: 'Waiting for the send (seconds)'
        },
        //=======================================================================
        //discord Settings
        discordInstance: {
            newLine: true,
            type: 'instance',
            label: 'Discord instance',
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
            ]
        },
        discordUserTag: {
            newLine: true,
            type: 'text',
            label: 'DiscordUserTag',
        },
        discordUserId: {
            newLine: true,
            type: 'text',
            label: 'discordUserId',
        },
        discordServerId: {
            newLine: true,
            type: 'text',
            label: 'discordServerId',
        },
        discordChannelId: {
            newLine: true,
            type: 'text',
            label: 'discordChannelId',
        },
        discordWaitToSend: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 20,
            step: 1,
            label: 'Waiting for the send (seconds)'
        },
        useCustumizedNotifications: {
            newLine: true,
            type: 'checkbox',
            label: 'useCustumizedNotifications'
        },
        useCustumizedNotificationsWithInstanceName: {
            newLine: true,
            type: 'checkbox',
            label: 'useCustumizedNotificationsWithInstanceName'
        },
        useCustumizedNotificationsNewTargetTemp: {
            newLine: true,
            type: 'text',
            label: 'useCustumizedNotificationsNewTargetTemp'
        },
        useCustumizedNotificationsActorOn: {
            newLine: true,
            type: 'text',
            label: 'useCustumizedNotificationsActorOn'
        },
        useCustumizedNotificationsActorOff: {
            newLine: true,
            type: 'text',
            label: 'useCustumizedNotificationsActorOff'
        },
        useCustumizedNotificationsWindowOpen: {
            newLine: true,
            type: 'text',
            label: 'useCustumizedNotificationsWindowOpen'
        },
        useCustumizedNotificationsWindowClose: {
            newLine: true,
            type: 'text',
            label: 'useCustumizedNotificationsWindowClose'
        },
        //=======================================================================
        _header10: {
            newLine: true,
            type: 'header',
            label: 'Maintenance',
            xs: 12,
        },
        btn_deleteunusedDP: {
            newLine: true,
            type: 'button',
            label: 'DeleteUnusedDP',
            onClick: async (): Promise<void> => {
                console.log("Delete unused data points clicked");
            }
        },
        btn_deleteunusedConfig: {
            newLine: true,
            type: 'button',
            label: 'DeleteUnusedConfig',
            onClick: async (): Promise<void> => {
                console.log("Delete unused config clicked");
            }
        },
        MaintenanceModeTemperature: {
            newLine: true,
            type: 'number',
            min: 20,
            max: 40,
            step: 5,
            label: 'MaintenanceModeTemperature'
        },
        enableCSVLogging: {
            newLine: true,
            type: 'checkbox',
            label: 'enableCSVLogging'
        }
    }
}


export default function MainSettings(props: SettingsProps): React.JSX.Element {


    console.log("settings: " + JSON.stringify(props.native));

    return (
        <div style={{ width: 'calc(100% - 8px)', minHeight: '100%' }}>
            <JsonConfigComponent
                common={props.common}
                socket={props.socket}
                themeName={props.themeName}
                themeType={props.themeType}
                adapterName="ai-heatingcontrol"
                instance={props.instance || 0}
                isFloatComma={props.systemConfig.common.isFloatComma}
                dateFormat={props.systemConfig.common.dateFormat}
                schema={schema}
                onChange={(params): void => {

                    console.log("MainSettings onChange " + JSON.stringify(params));

                    const native: HeatingControlAdapterConfig = JSON.parse(JSON.stringify(props.native));

                    
                    
                    props.changeNative(native);
                }}
                //data={props.native.params}
                data={props.native}
                onError={() => {}}
                theme={props.theme}
                withoutSaveButtons
            />
        </div>
    );
}
