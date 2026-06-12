/* eslint-disable prefer-template */
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
        Path2FeiertagAdapter: {
            newLine: true,
            type: 'objectId',
            label: 'Path2FeiertagAdapter',
            "xs": 12,
            "sm": 4,
            "md": 4,
            "lg": 4,
            "xl": 4
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
        Path2HolidayPresentDP: {
            newLine: true,
            type: 'objectId',
            label: 'Path2HolidayPresentDP',
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
        WindowOpenHasPriorityOverThermostat: {
            newLine: false,
            type: 'checkbox',
            label: 'WindowOpenHasPriorityOverThermostat',
            "xs": 12,
            "sm": 4,
            "md": 4,
            "lg": 4,
            "xl": 4
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
            newLine: true,
            type: 'staticText',
            text: 'hint_UseAddTempSensors',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
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
            newLine: true,
            type: 'staticText',
            text: 'hint_AddTempSensorsTempLimit',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12,
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
            newLine: true,
            type: 'staticText',
            text: 'hint_AddTempSensorsMaxTimeDiff',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12,
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
        ExtHandlingActorRepTime: {
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
        UseValveProtection: {
            newLine: true,
            type: 'checkbox',
            label: 'UseValveProtection',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        ValveProtectionInterval: {
            newLine: false,
            type: 'number',
            min: 1,
            max: 365,
            step: 1,
            label: 'ValveProtectionInterval',
            hidden: "if (!data.UseValveProtection) return true;",
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        ValveProtectionTime: {
            newLine: false,
            type: 'text',
            label: 'ValveProtectionTime',
            hidden: "if (!data.UseValveProtection) return true;",
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        ValveProtectionWaitTime: {
            newLine: false,
            type: 'number',
            min: 1,
            max: 600,
            step: 1,
            label: 'ValveProtectionWaitTime',
            hidden: "if (!data.UseValveProtection) return true;",
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        ValveProtectionCloseTemp: {
            newLine: false,
            type: 'number',
            min: 1,
            max: 30,
            step: 0.5,
            label: 'ValveProtectionCloseTemp',
            hidden: "if (!data.UseValveProtection) return true;",
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
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
                    native.WindowOpenHasPriorityOverThermostat = params.WindowOpenHasPriorityOverThermostat;
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
                    native.ExtHandlingActorRepTime = params.ExtHandlingActorRepTime;
                    native.ExtHandlingActorAckWaitTime = params.ExtHandlingActorAckWaitTime;
                    native.UseActorsIfNotHeating = params.UseActorsIfNotHeating;
                    native.UseActorsIfNoThermostat = params.UseActorsIfNoThermostat;



                    native.MaintenanceModeTemperature = params.MaintenanceModeTemperature;
                    native.UseValveProtection = params.UseValveProtection;
                    native.ValveProtectionInterval = params.ValveProtectionInterval;
                    native.ValveProtectionTime = params.ValveProtectionTime;
                    native.ValveProtectionWaitTime = params.ValveProtectionWaitTime;
                    native.ValveProtectionCloseTemp = params.ValveProtectionCloseTemp;


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
