/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */
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
    label: 'ProfileSettings',
    items: {
        //=======================================================================
        _header1: {
            newLine: true,
            type: 'header',
            label: 'GeneralProfileSettings',
            xs: 12,
        },
        /* muss woanders hin verschoben werden 
        btn_save_profile: {
            newLine: true,
            type: 'button',
            label: 'btn_save_profile',
            onClick: async (): Promise<void> => {
                console.log("save profile clicked");
            }
        },
        btn_load_profile: {
            newLine: true,
            type: 'button',
            label: 'btn_load_profile',
            onClick: async (): Promise<void> => {
                console.log("upload profile clicked");
            }
        },
        */
        ProfileType: {
            newLine: true,
            type: 'select',
            label: 'ProfileType',
            options: [
                {
                    label: "Mo-So",
                    value: 1
                },
                {
                    label: "Mo-Fr + Sa-So",
                    value: 2
                },
                {
                    label: "every Day",
                    value: 3
                }
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        NumberOfProfiles: {
            newLine: false,
            type: 'number',
            min: 1,
            max: 10,
            step: 1,
            label: 'NumberOfProfiles',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        NumberOfPeriods: {
            newLine: false,
            type: 'number',
            min: 1,
            max: 10,
            step: 1,
            label: 'NumberOfPeriods',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        TemperatureDecrease: {
            newLine: true,
            type: 'select',
            label: 'TemperatureDecrease',
            options: [
                {
                    label: "relative",
                    value: 1
                },
                {
                    label: "absolute",
                    value: 2
                },
                {
                    label: "no lowering",
                    value: 3
                }
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        PublicHolidayLikeSunday: {
            newLine: false,
            type: 'checkbox',
            label: 'PublicHolidayLikeSunday',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        HolidayPresentLikeSunday: {
            newLine: false,
            type: 'checkbox',
            label: 'HolidayPresentLikeSunday',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        UseMinTempPerRoom: {
            newLine: true,
            type: 'checkbox',
            label: 'UseMinTempPerRoom',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        UseFireplaceMode: {
            newLine: true,
            type: 'checkbox',
            label: 'UseFireplaceMode',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        UseFireplaceModeResetAt: {
            newLine: false,
            type: 'text',
            label: 'UseFireplaceModeResetAt',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        //=======================================================================
        _header2: {
            newLine: true,
            type: 'header',
            label: 'HeatingperiodSettings',
            xs: 12,
        },
        UseFixHeatingPeriod: {
            newLine: true,
            type: 'checkbox',
            label: 'UseFireplaceMode',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        FixHeatingPeriodStart: {
            newLine: false,
            type: 'text',
            label: 'FixHeatingPeriodStart',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        FixHeatingPeriodEnd: {
            newLine: false,
            type: 'text',
            label: 'FixHeatingPeriodEnd',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        ThermostatModeIfNoHeatingperiod: {
            newLine: true,
            type: 'select',
            label: 'ThermostatModeIfNoHeatingperiod',
            options: [
                {
                    label: "fixTempPerRoom",
                    value: 1
                },
                {
                    label: "fixTempForAll",
                    value: 2
                },
                {
                    label: "nothing",
                    value: 3
                }
            ],
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        FixTempIfNoHeatingPeriod: {
            newLine: false,
            type: 'number',
            min: 1,
            max: 30,
            step: 1,
            label: 'FixTempIfNoHeatingPeriod',
            "xs": 12,
            "sm": 2,
            "md": 2,
            "lg": 2,
            "xl": 2,
        },
        //=======================================================================
        _header3: {
            newLine: true,
            type: 'header',
            label: 'Power Interruptions',
            xs: 12,
        },
        PowerInterruptions: {
            newLine: true,
            type: 'table',
            label: 'Power Interruptions',
            showSecondAddAt: 5,
            noDelete: false,
            items: [
                {
                    "type": "checkbox",
                    "attr": "active",
                    "width": "5% ",
                    "title": "PIactive",
                    "tooltip": "enable PI",
                    "filter": false,
                    "sort": false,
                    "default": false
                },
                {
                    "type": "text",
                    "attr": "Start",
                    "width": "20% ",
                    "title": "StartPI",
                    "tooltip": "start of PI",
                    "filter": false,
                    "sort": false,
                    "default": "00:00"
                },
                {
                    "type": "text",
                    "attr": "End",
                    "width": "20% ",
                    "title": "EndPI",
                    "tooltip": "end of PI",
                    "filter": false,
                    "sort": false,
                    "default": "00:00"
                }
            ]
        }
    },
};

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

                    console.log("ProfileSettings onChange " + JSON.stringify(params));

                    const native: HeatingControlAdapterConfig = JSON.parse(JSON.stringify(props.native));

                    native.ProfileType = params.ProfileType;
                    native.NumberOfProfiles = params.NumberOfProfiles;
                    native.NumberOfPeriods = params.NumberOfPeriods;
                    native.TemperatureDecrease = params.TemperatureDecrease;
                    native.PublicHolidayLikeSunday = params.PublicHolidayLikeSunday;
                    native.HolidayPresentLikeSunday = params.HolidayPresentLikeSunday;
                    native.UseMinTempPerRoom = params.UseMinTempPerRoom;
                    native.UseFireplaceMode = params.UseFireplaceMode;
                    native.UseFireplaceModeResetAt = params.UseFireplaceModeResetAt;
                    native.UseFixHeatingPeriod = params.UseFixHeatingPeriod;
                    native.FixHeatingPeriodStart = params.FixHeatingPeriodStart;
                    native.FixHeatingPeriodEnd = params.FixHeatingPeriodEnd;
                    native.ThermostatModeIfNoHeatingperiod = params.ThermostatModeIfNoHeatingperiod;
                    native.FixTempIfNoHeatingPeriod = params.FixTempIfNoHeatingPeriod;
                    native.PowerInterruptions = params.PowerInterruptions;
                    
                    
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
