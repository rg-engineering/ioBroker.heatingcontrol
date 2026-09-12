 
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
    label: 'VisSettings',
    items: {
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
            newLine: true,
            type: 'staticText',
            text: 'hint_vis_from_Pittini',
            "xs": 12,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
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
                    value: 0.5
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
                    value: 0.5
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
                    value: 0.5
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
                    value: 0.5
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
    },
};


export default function VisSettings(props: SettingsProps): React.JSX.Element {
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
