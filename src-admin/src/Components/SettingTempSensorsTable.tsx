/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    TextField,
    IconButton,
    Tooltip,
} from '@mui/material';

import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { I18n } from '@iobroker/adapter-react-v5';
import type { AdminConnection, IobTheme, ThemeName, ThemeType } from '@iobroker/adapter-react-v5';
import SelectOID from './SelectOID';

export type SettingTempSensorItem = {
    name: string;
    isActive: boolean;
    OID_Current: string;
};

type Props = {
    settingName: string;
    settings: SettingTempSensorItem[];
    socket: AdminConnection;
    theme: IobTheme;
    themeName: ThemeName;
    themeType: ThemeType;
    onAdd: () => void;
    onUpdate: (index: number, field: keyof SettingTempSensorItem, value: any) => void;
    onRemove: (index: number) => void;
    addButtonTooltip?: string;

};


export default function SettingTempSensorsTable(props: Props): React.JSX.Element {
    const { settingName, settings, onAdd, onUpdate, onRemove, addButtonTooltip } = props;


    const colCount = 4;



    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 500 }}>{settingName}:</div>
                <Tooltip title={addButtonTooltip ?? I18n.t('add new device')}>
                    <IconButton size="small" onClick={onAdd}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
            </div>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>{I18n.t('name')}</TableCell>
                        <TableCell>{I18n.t('activ')}</TableCell>
                        <TableCell>{I18n.t('OID Current')}</TableCell>
                        <TableCell>{I18n.t('activities')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {settings.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={colCount} style={{ fontStyle: 'italic' }}>{I18n.t('nothing configured')}</TableCell>
                        </TableRow>
                    ) : settings.map((t, idx) => (
                        <TableRow key={idx}>
                            <TableCell>
                                <TextField
                                    fullWidth
                                    value={t.name}
                                    onChange={(e) => onUpdate(idx, 'name', e.target.value)}
                                    variant="standard"
                                    placeholder={I18n.t('name')}
                                />
                            </TableCell>
                            <TableCell>
                                <Checkbox
                                    checked={!!t.isActive}
                                    onChange={(e) => onUpdate(idx, 'isActive', e.target.checked)}
                                />
                            </TableCell>
                            
                            <TableCell>

                                <SelectOID
                                    settingName={I18n.t('OID Current')}
                                    socket={props.socket}
                                    theme={props.theme}
                                    themeName={props.themeName}
                                    themeType={props.themeType}
                                    Value={t.OID_Current}
                                    onChange={(value) => onUpdate(idx, 'OID_Current', value)}
                                />

                            </TableCell>



                            <TableCell>
                                <Tooltip title={I18n.t('Delete device')}>
                                    <IconButton size="small" onClick={() => onRemove(idx)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}