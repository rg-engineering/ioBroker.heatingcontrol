/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */
import React, {  useRef, useState } from 'react';
import type { AdminConnection, IobTheme, ThemeName, ThemeType } from '@iobroker/adapter-react-v5';
import { I18n } from '@iobroker/adapter-react-v5';
import type { HeatingControlAdapterConfig } from "../types";

import {
    Button,
    Typography,
    Box,
    Badge,
    Tooltip,
    IconButton,
    
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

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

    const [DeleteUnusedDPResult, setDeleteUnusedDPResult] = useState<string>('');
    //const [DeleteUnusedConfigResult, setDeleteUnusedConfigResult] = useState<string>('');
    //const [contents, setContents] = useState<string>('');
    const [selectedFileName, setSelectedFileName] = useState<string>('');
    const [uploadResult, setUploadResult] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const DeleteUnusedDP = async (): Promise<void> => {
        console.log("DeleteUnusedDP pressed");

        const instance = 'heatingcontrol.' + props.instance;
        const result = await props.socket.sendTo(instance, 'deleteUnusedDP', null);

        try {
            const status = (result) ? result : '';
            if (typeof status === 'object') {
                setDeleteUnusedDPResult(JSON.stringify(status));
            } else {
                setDeleteUnusedDPResult(String(status));
            }
        } catch (err) {
            setDeleteUnusedDPResult('Error reading status ' + err);
        }
    }

    /*
    const DeleteUnusedConfig = async () => {
        console.log("DeleteUnusedConfig pressed");

        const instance = 'heatingcontrol.' + props.instance;;
        const result = await props.socket.sendTo(instance, 'deleteUnusedConfig', null);

        try {
            const status = (result) ? result : '';
            if (typeof status === 'object') {
                setDeleteUnusedConfigResult(JSON.stringify(status));
            } else {
                setDeleteUnusedConfigResult(String(status));
            }
        } catch (err) {
            setDeleteUnusedConfigResult('Error reading status');
        }
    }
    */

    // Hilfsfunktion: erzeugt und startet den Download einer JSON-Datei im Browser
    const generateFile = (filename: string, data: unknown): void => {
        try {
            const content = (typeof data === 'string') ? data : JSON.stringify(data ?? {}, null, 2);
            const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            // some browsers require the element to be in the DOM
            document.body.appendChild(a);
            a.click();
            a.remove();
            // URL freigeben
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('generateFile error', err);
        }
    };

    const DownloadProfile = async (): Promise<void> => {
        console.log("DownloadProfile pressed");

        const instance = 'heatingcontrol.' + props.instance;
        const result = await props.socket.sendTo(instance, 'saveProfile', null);

        // Ergebnis als Datei im Browser speichern
        generateFile('heatingcontrol_profile.json', result);

        console.log('profile saved ');
    }

    // Öffnet den Datei-Dialog
    const openFileDialog = ():void => {
        setUploadResult('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    }

    // Datei wurde ausgewählt -> lesen und hochladen
    const onFileChange: React.ChangeEventHandler<HTMLInputElement> =  (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) {
            setUploadResult(I18n.t('No file selected'));
            return;
        }

        // optional: nur .json erlauben
        if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
            setUploadResult(I18n.t('Please select a JSON file'));
            return;
        }

        setSelectedFileName(file.name);

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const text = typeof reader.result === 'string' ? reader.result : '';
                //setContents(text);

                // Versuchen zu parsen; wenn möglich, als Objekt senden, sonst roher Text
                let payload: unknown = text;
                try {
                    payload = JSON.parse(text);
                } catch {
                    // verbleibt roher Text
                    payload = text;
                }

                // Upload direkt nach dem Lesen
                const instance = 'heatingcontrol.' + props.instance;
                const result = await props.socket.sendTo(instance, 'loadProfile', payload);

                if (typeof result === 'object') {
                    setUploadResult(JSON.stringify(result));
                } else {
                    setUploadResult(String(result));
                }
            } catch (err: unknown) {
                console.error('File read/upload error', err);
                setUploadResult('Error reading or uploading file');
            }
        };
        reader.onerror = () => {
            console.error('FileReader error', reader.error);
            setUploadResult('Error reading file');
        };
        reader.readAsText(file);
    }

    

    return (
        <div style={{ width: 'calc(100% - 8px)', minHeight: '100%' }}>

            <Box sx={{
                width: '100%',
                background: props.theme.palette.primary.main,
                color: props.theme.palette.primary.contrastText,
                padding: '4px !important',
                borderRadius: '3px',
                marginBlockEnd: 0,
                marginBlockStart: 0,
                marginBottom: 0
            }}>
                <h5 style={{ margin: 0 }}>
                    {I18n.t('General Maintenance')}
                </h5>


            </Box>


            <div style={{ marginBottom: 12 }}>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: '100%' }}>
                    <Button
                        id='btn_deleteunusedDP'
                        onClick={() => DeleteUnusedDP()}
                        variant="contained"
                        sx={{ flexShrink: 0 }}
                    >
                        {I18n.t('DeleteUnusedDP')}
                    </Button>
                    {DeleteUnusedDPResult.length > 0 ? (
                        <Badge color="primary" id='DeleteUnusedDP_Result' sx={{ maxWidth: '20%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {DeleteUnusedDPResult}
                        </Badge>
                    ) : (null)}
                </Box>

                {/* derzeit nicht benötigt
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: '100%' }}>
                    <Button
                        id='btn_deleteunusedConfig'
                        onClick={() => DeleteUnusedConfig()}
                        variant="contained"
                        sx={{ flexShrink: 0 }}
                    >
                        {I18n.t('DeleteUnusedConfig')}
                    </Button>
                    {DeleteUnusedConfigResult.length > 0 ? (
                        <Badge color="primary" id='DeleteUnusedConfig_Result' sx={{ maxWidth: '20%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {DeleteUnusedConfigResult}
                        </Badge>
                    ) : (null)}
                </Box>
                */}

                



            </div>

            <Box sx={{
                width: '100%',
                background: props.theme.palette.primary.main,
                color: props.theme.palette.primary.contrastText,
                padding: '4px !important',
                borderRadius: '3px',
                marginBlockEnd: 0,
                marginBlockStart: 0,
                marginBottom: 0
            }}>
                <h5 style={{ margin: 0 }}>
                    {I18n.t('Profile Maintenance')}
                </h5>


            </Box>


            <div style={{ marginBottom: 12 }}>

                {/* verstecktes File-Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    style={{ display: 'none' }}
                    onChange={onFileChange}
                    id="heatingcontrol-profile-file"
                />

                <Box display="flex" alignItems="center" pr={1}>
                    <Tooltip title={I18n.t('Download profile')}>
                        <IconButton
                            color="inherit"
                            onClick={() => DownloadProfile()}
                            size="large"
                            aria-label="download-profile"
                        >
                            <CloudDownloadIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={I18n.t('Upload profile')}>
                        <IconButton
                            color="inherit"
                            onClick={() => openFileDialog()}
                            size="large"
                            aria-label="upload-profile"
                        >
                            <CloudUploadIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Anzeige des Dateinamens und Ergebnis */}
                    <Box ml={1} display="flex" flexDirection="column">
                        {selectedFileName ? (
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                {I18n.t('Selected file')}: {selectedFileName}
                            </Typography>
                        ) : null}
                        {uploadResult ? (
                            <Typography variant="body2" color="textSecondary" sx={{ wordBreak: 'break-all' }}>
                                {I18n.t('Upload result')}: {uploadResult}
                            </Typography>
                        ) : null}
                    </Box>
                </Box>

            </div>

        </div>
    );
}