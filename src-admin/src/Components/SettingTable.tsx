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

export type SettingItem = { name: string; isActive: boolean; OID_Target: string; OID_Current: string; };

type Props = {
    settingName: string;
    settings: SettingItem[];
    onAdd: () => void;
    onUpdate: (index: number, field: keyof SettingItem, value: any) => void;
    onRemove: (index: number) => void;
    addButtonTooltip?: string;
    useOIDTarget?: boolean;
    useOIDCurrent?: boolean;
};

//todo: ausblenden von nicht benötigten OID's
export default function SettingTable(props: Props): React.JSX.Element {
    const { settingName, settings, onAdd, onUpdate, onRemove, addButtonTooltip, useOIDTarget, useOIDCurrent } = props;

    const showTarget = !!useOIDTarget;
    const showCurrent = !!useOIDCurrent;
    const colCount = 3 + (showTarget ? 1 : 0) + (showCurrent ? 1 : 0); // name, activ, activities + optional OID-Spalten



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
                        {showTarget && <TableCell>{I18n.t('OID Target')}</TableCell>}
                        {showCurrent && <TableCell>{I18n.t('OID Current')}</TableCell>}
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
                            {showTarget && (
                            <TableCell>
                                <TextField
                                    fullWidth
                                    value={t.OID_Target}
                                    onChange={(e) => onUpdate(idx, 'OID_Target', e.target.value)}
                                    variant="standard"
                                    placeholder="javascript.0.device.target"
                                />
                            </TableCell>
                            )}

                            {showCurrent && (
                            <TableCell>
                                <TextField
                                    fullWidth
                                    value={t.OID_Current}
                                    onChange={(e) => onUpdate(idx, 'OID_Current', e.target.value)}
                                    variant="standard"
                                    placeholder="javascript.0.device.current"
                                />
                            </TableCell>
                            )}

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