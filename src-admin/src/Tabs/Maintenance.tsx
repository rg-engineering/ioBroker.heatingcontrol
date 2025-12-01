/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */



import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AdminConnection, IobTheme, ThemeName, ThemeType } from '@iobroker/adapter-react-v5';
import { I18n } from '@iobroker/adapter-react-v5';
import type { HeatingControlAdapterConfig } from "../types";

import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox,
    FormControlLabel,
    Button,
    Stack,
    Typography
} from '@mui/material';


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
    rooms?: Record<string, ioBroker.EnumObject>;
    alive: boolean;
}



export default function Maintenance(props: SettingsProps): React.JSX.Element {

    console.log("Maintenance render: " + JSON.stringify(props.native));

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

   
    

    return (
        <div style={{ width: 'calc(100% - 8px)', minHeight: '100%' }}>
            <div style={{ marginBottom: 12 }}>

                



            </div>
        </div>
    );
}