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
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
        },
        timezone: {
            newLine: true,
            type: 'text',
            label: 'timezone',
            "xs": 4,
            "sm": 4,
            "md": 4,
            "lg": 4,
            "xl": 4
        },
        //=======================================================================
        _header2: {
            newLine: true,
            type: 'header',
            label: 'DPSettings',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
        },
        Path2PresentDP: {
            newLine: true,
            type: 'objectId',
            label: 'Path2PresentDP',
            "xs": 12,
            "sm": 4,
            "md": 4,
            "lg": 4,
            "xl": 4
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
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        Path2VacationDP: {
            newLine: true,
            type: 'objectId',
            label: 'Path2VacationDP',
            "xs": 12,
            "sm": 4,
            "md": 4,
            "lg": 4,
            "xl": 4
        },
        Path2GuestsPresentDP: {
            newLine: true,
            type: 'objectId',
            label: 'Path2GuestsPresentDP',
            "xs": 12,
            "sm": 4,
            "md": 4,
            "lg": 4,
            "xl": 4
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
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        Path2GuestsPresentDPLimit: {
            newLine: false,
            type: 'number',
            min: 0,
            step: 1,
            label: 'Path2GuestsPresentDPLimit',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        Path2PartyNowDP: {
            newLine: true,
            type: 'objectId',
            label: 'Path2PartyNowDP',
            "xs": 12,
            "sm": 4,
            "md": 4,
            "lg": 4,
            "xl": 4
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
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        Path2PartyNowDPLimit: {
            newLine: false,
            type: 'number',
            min: 0,
            step: 1,
            label: 'Path2PartyNowDPLimit',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        //=======================================================================
        _header3: {
            newLine: true,
            type: 'header',
            label: 'ThermostatSettings',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
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
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        ExtendOverride: {
            newLine: true,
            type: 'checkbox',
            label: 'ExtendOverride',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
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
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        ThermostatHandlesWindowOpen: {
            newLine: true,
            type: 'checkbox',
            label: 'ThermostatHandlesWindowOpen',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        InterThermostatDelay: {
            newLine: false,
            type: 'number',
            min: 0,
            step: 1,
            label: 'InterThermostatDelay',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        //=======================================================================
        _header4: {
            newLine: true,
            type: 'header',
            label: 'AdditionalTemperatureSensorSettings',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
        },
        UseAddTempSensors: {
            newLine: true,
            type: 'checkbox',
            label: 'UseAddTempSensors',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        hint_UseAddTempSensors: {
            newLine: false,
            type: 'text',
            readOnly: true,
            label: 'hint_UseAddTempSensors',
            "xs": 12,
            "sm": 10,
            "md": 10,
            "lg": 10,
            "xl": 10
        },
        AddTempSensorsTempLimit: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 6,
            label: 'AddTempSensorsTempLimit',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseAddTempSensors) return true;",
        },
        hint_AddTempSensorsTempLimit: {
            newLine: false,
            type: 'text',
            readOnly: true,
            label: 'hint_AddTempSensorsTempLimit',
            "xs": 12,
            "sm": 10,
            "md": 10,
            "lg": 10,
            "xl": 10,
            "hidden": "if (!data.UseAddTempSensors) return true;",
        },
        AddTempSensorsMaxTimeDiff: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 1000,
            label: 'AddTempSensorsMaxTimeDiff',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseAddTempSensors) return true;",
        },
        hint_AddTempSensorsMaxTimeDiff: {
            newLine: false,
            type: 'text',
            readOnly: true,
            label: 'hint_AddTempSensorsMaxTimeDiff',
            "xs": 12,
            "sm": 10,
            "md": 10,
            "lg": 10,
            "xl": 10,
            "hidden": "if (!data.UseAddTempSensors) return true;",
        },
        AddTempSensorsUseEveryOffsetChange: {
            newLine: true,
            type: 'checkbox',
            label: 'AddTempSensorsUseEveryOffsetChange',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseAddTempSensors) return true;",
        },

        //=======================================================================
        _header5: {
            newLine: true,
            type: 'header',
            label: 'SensorSettings',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
        },
        UseSensors: {
            newLine: true,
            type: 'checkbox',
            label: 'use_sensors',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        SensorOpenDelay: {
            newLine: true,
            type: 'number',
            min: 0,
            step: 1,
            label: 'SensorOpenDelay',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseSensors) return true;",
        },
        SensorCloseDelay: {
            newLine: false,
            type: 'number',
            min: 0,
            step: 1,
            label: 'SensorCloseDelay',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseSensors) return true;",
        },
        //=======================================================================
        _header6: {
            newLine: true,
            type: 'header',
            label: 'ActorSettings',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
        },
        UseActors: {
            newLine: true,
            type: 'checkbox',
            label: 'use_actors',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        ActorBeforeOnDelay: {
            newLine: true,
            type: 'number',
            min: 0,
            step: 1,
            label: 'ActorBeforeOnDelay',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseActors) return true;",
        },
        ActorBeforeOffDelay: {
            newLine: false,
            type: 'number',
            min: 0,
            step: 1,
            label: 'ActorBeforeOffDelay',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseActors) return true;",
        },
        InterActorDelay: {
            newLine: false,
            type: 'number',
            min: 0,
            step: 1,
            label: 'InterActorDelay',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseActors) return true;",
        },
        regulatorType: {
            newLine: true,
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
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseActors) return true;",
        },
        ExtHandlingRepTime: {
            newLine: true,
            type: 'number',
            min: 0,
            step: 1,
            label: 'ExtHandlingActorRepTime',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseActors) return true;",
        },
        ExtHandlingActorAckWaitTime: {
            newLine: false,
            type: 'number',
            min: 0,
            step: 1,
            label: 'ExtHandlingActorAckWaitTime',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseActors) return true;",
        },
        UseActorsIfNotHeating: {
            newLine: true,
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
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseActors) return true;",
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
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseActors) return true;",
        },
        //=======================================================================
        _header7: {
            newLine: true,
            type: 'header',
            label: 'VisSettings',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
        },
        UseVisFromPittini: {
            newLine: true,
            type: 'checkbox',
            label: 'UseVisFromPittini',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        hint_vis_from_Pittini: {
            newLine: false,
            type: 'text',
            readOnly: true,
            label: 'hint_vis_from_Pittini',
            "xs": 12,
            "sm": 10,
            "md": 10,
            "lg": 10,
            "xl": 10
        },
        VisUseSimple: {
            newLine: true,
            type: 'checkbox',
            label: 'VisUseSimple',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
        },
        PittiniPathImageWindowOpen: {
            newLine: true,
            type: 'text',
            label: 'PittiniPathImageWindowOpen',
            "xs": 12,
            "sm": 4,
            "md": 4,
            "lg": 4,
            "xl": 4,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
        },
        PittiniPathImageWindowClosed: {
            newLine: false,
            type: 'text',
            label: 'PittiniPathImageWindowClosed',
            "xs": 12,
            "sm": 4,
            "md": 4,
            "lg": 4,
            "xl": 4,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
        },
        VisMinProfilTemp: {
            newLine: true,
            type: 'number',
            min: 0,
            max: 20,
            label: 'VisMinProfilTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
        },
        VisMaxProfilTemp: {
            newLine: false,
            type: 'number',
            min: 10,
            max: 30,
            label: 'VisMaxProfilTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
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
            label: 'VisStepWidthProfilTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
        },
        VisMinDecRelTemp: {
            newLine: true,
            type: 'number',
            min: 1,
            max: 10,
            label: 'VisMinDecRelTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
        },
        VisMaxDecRelTemp: {
            newLine: false,
            type: 'number',
            min: 2,
            max: 20,
            label: 'VisMaxDecRelTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
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
            label: 'VisStepWidthDecRelTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
        },
        VisMinDecAbsTemp: {
            newLine: true,
            type: 'number',
            min: 3,
            max: 20,
            label: 'VisMinDecAbsTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
        },
        VisMaxDecAbsTemp: {
            newLine: false,
            type: 'number',
            min: 5,
            max: 30,
            label: 'VisMaxDecAbsTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
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
            label: 'VisStepWidthDecAbsTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
        },
        VisMinOverrideTemp: {
            newLine: true,
            type: 'number',
            min: 3,
            max: 25,
            label: 'VisMinOverrideTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
        },
        VisMaxOverrideTemp: {
            newLine: false,
            type: 'number',
            min: 5,
            max: 35,
            label: 'VisMaxOverrideTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
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
            label: 'VisStepWidthOverrideTemp',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.UseVisFromPittini && !data.VisUseSimple ) return true;",
        },

        //=======================================================================
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
        useCustumizedNotificationsWindowClose: {
            newLine: false,
            type: 'text',
            label: 'useCustumizedNotificationsWindowClose',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
            "hidden": "if (!data.notificationEnabled ) return true;",
        },
        //=======================================================================
        _header10: {
            newLine: true,
            type: 'header',
            label: 'Maintenance',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
        },

        /* müssen verschoben werden auf eigene Seite
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
        */
        MaintenanceModeTemperature: {
            newLine: true,
            type: 'number',
            min: 20,
            max: 40,
            step: 5,
            label: 'MaintenanceModeTemperature',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2
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
                adapterName="heatingcontrol"
                instance={props.instance || 0}
                isFloatComma={props.systemConfig.common.isFloatComma}
                dateFormat={props.systemConfig.common.dateFormat}
                schema={schema}
                onChange={(params): void => {

                    console.log("MainSettings onChange params: " + JSON.stringify(params));

                    const native: HeatingControlAdapterConfig = JSON.parse(JSON.stringify(props.native));
                    //console.log("MainSettings onChange native: " + JSON.stringify(native));

                    native.timezone = params.timezone;

                    native.Path2PresentDP = params.Path2PresentDP;
                    native.Path2PresentDPType = params.Path2PresentDPType;
                    native.Path2VacationDP = params.Path2VacationDP;
                    native.Path2GuestsPresentDP = params.Path2GuestsPresentDP;
                    native.Path2GuestsPresentDPType = params.Path2GuestsPresentDPType;
                    native.Path2GuestsPresentDPLimit = params.Path2GuestsPresentDPLimit;
                    native.Path2PartyNowDP = params.Path2PartyNowDP;
                    native.Path2PartyNowDPType = params.Path2PartyNowDPType;
                    native.Path2PartyNowDPLimit = params.Path2PartyNowDPLimit;

                    native.UseChangesFromThermostat = params.UseChangesFromThermostat;
                    native.ExtendOverride = params.ExtendOverride;
                    native.OverrideMode = params.OverrideMode;
                    native.ThermostatHandlesWindowOpen = params.ThermostatHandlesWindowOpen;
                    native.InterThermostatDelay = params.InterThermostatDelay;

                    native.UseAddTempSensors = params.UseAddTempSensors;
                    native.AddTempSensorsTempLimit = params.AddTempSensorsTempLimit;
                    native.AddTempSensorsMaxTimeDiff = params.AddTempSensorsMaxTimeDiff;
                    native.AddTempSensorsUseEveryOffsetChange = params.AddTempSensorsUseEveryOffsetChange;

                    native.UseSensors = params.UseSensors;
                    native.SensorOpenDelay = params.SensorOpenDelay;
                    native.SensorCloseDelay = params.SensorCloseDelay;

                    native.UseActors = params.UseActors;
                    native.ActorBeforeOnDelay = params.ActorBeforeOnDelay;
                    native.ActorBeforeOffDelay = params.ActorBeforeOffDelay;
                    native.InterActorDelay = params.InterActorDelay;
                    native.regulatorType = params.regulatorType;
                    native.ExtHandlingRepTime = params.ExtHandlingRepTime;
                    native.ExtHandlingActorAckWaitTime = params.ExtHandlingActorAckWaitTime;
                    native.UseActorsIfNotHeating = params.UseActorsIfNotHeating;
                    native.UseActorsIfNoThermostat = params.UseActorsIfNoThermostat;

                    native.UseVisFromPittini = params.UseVisFromPittini;
                    native.VisUseSimple = params.VisUseSimple;
                    native.PittiniPathImageWindowOpen = params.PittiniPathImageWindowOpen;
                    native.PittiniPathImageWindowClosed = params.PittiniPathImageWindowClosed;
                    native.VisMinProfilTemp = params.VisMinProfilTemp;
                    native.VisMaxProfilTemp = params.VisMaxProfilTemp;
                    native.VisStepWidthProfilTemp = params.VisStepWidthProfilTemp;
                    native.VisMinDecRelTemp = params.VisMinDecRelTemp;
                    native.VisMaxDecRelTemp = params.VisMaxDecRelTemp;
                    native.VisStepWidthDecRelTemp = params.VisStepWidthDecRelTemp;
                    native.VisMinDecAbsTemp = params.VisMinDecAbsTemp;
                    native.VisMaxDecAbsTemp = params.VisMaxDecAbsTemp;
                    native.VisStepWidthDecAbsTemp = params.VisStepWidthDecAbsTemp;
                    native.VisMinOverrideTemp = params.VisMinOverrideTemp;
                    native.VisMaxOverrideTemp = params.VisMaxOverrideTemp;
                    native.VisStepWidthOverrideTemp = params.VisStepWidthOverrideTemp;

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
                    native.useCustumizedNotificationsWindowClosed = params.useCustumizedNotificationsWindowClose;

                    native.MaintenanceModeTemperature = params.MaintenanceModeTemperature;
                    native.enableCSVLogging = params.enableCSVLogging;
                    
                    
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
