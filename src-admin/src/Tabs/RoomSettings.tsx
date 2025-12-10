/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */

import React, { useEffect, useMemo, useState } from 'react';
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
    Badge,
    Box,
    Divider,
    Typography,
    TextField,
    InputAdornment
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

import SettingThermostatsTable from '../Components/SettingThermostsTable';
import type { SettingThermostatItem } from '../Components/SettingThermostsTable';
import SettingActorsTable from '../Components/SettingActorsTable';
import type { SettingActorItem } from '../Components/SettingActorsTable';
import SettingTempSensorsTable from '../Components/SettingTempSensorsTable';
import type { SettingTempSensorItem } from '../Components/SettingTempSensorsTable';
import SettingWindowSensorsTable from '../Components/SettingWindowSensorsTable';
import type { SettingWindowSensorItem } from '../Components/SettingWindowSensorsTable';

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



export default function RoomSettings(props: SettingsProps): React.JSX.Element {

    console.log("RoomSettings render: " + JSON.stringify(props.native));

    // Hilfsfunktionen für native.rooms als Array
    const getNativeRooms = (): any[] => {
        const n = (props.native as any).rooms;
        return Array.isArray(n) ? n : [];
    };

    const findRoom = (id: string) => {
        if (!id) return undefined;
        const arr = getNativeRooms();
        return arr.find(r => r && r.id === id);
    };

    // Hilfsfunktion: Namen eines Raumes aus props.rooms ermitteln (fällt zurück auf ID)
    const getRoomNameFromProps = (id: string): string => {
        if (!id) return '';
        try {
            const room = props.rooms ? props.rooms[id] : undefined;
            if (!room) return id;
            const commonName = (room as any)?.common?.name;
            if (typeof commonName === 'string') return commonName;
            if (commonName && typeof commonName === 'object') {
                const curLanguage = props.systemConfig?.common?.language || 'de';
                return commonName[curLanguage] || commonName.de || commonName.en || id;
            }
            return id;
        } catch {
            return id;
        }
    };

    const setRoomFields = (id: string, fields: Record<string, any>) => {
        const nativeCopy: any = { ...(props.native as any) };
        const roomsArr = Array.isArray(nativeCopy.rooms) ? [...nativeCopy.rooms] : [];
        const idx = roomsArr.findIndex((r: any) => r && r.id === id);
        const roomName = getRoomNameFromProps(id);
        if (idx >= 0) {
            // existierenden Eintrag updaten, dabei auch den Namen (falls aus props verfügbar) synchronisieren
            roomsArr[idx] = { ...roomsArr[idx], name: roomName, ...fields };
        } else {
            // Falls kein Eintrag existiert: neuen mit id und name anlegen
            roomsArr.push({ id, name: roomName, ...fields });
        }
        nativeCopy.rooms = roomsArr;
        props.changeNative(nativeCopy);
        return nativeCopy;
    };

    // Lokaler State für die aktuell ausgewählte Raum-ID
    const [selectedRoom, setSelectedRoom] = useState<string>(() => (props.native as any).roomSelector ?? '');

    // Lokaler State: isActive für den aktuell ausgewählten Raum
    const [roomIsActive, setRoomIsActive] = useState<boolean>(() => {
        try {
            const cur = findRoom((props.native as any).roomSelector ?? '');
            return !!(cur && cur.isActive);
        } catch {
            return false;
        }
    });


    // Lokaler State für Thermostate des aktuell ausgewählten Raums
    const [thermostats, setThermostats] = useState<SettingThermostatItem[]>([]);
    // Lokaler State für Aktoren des aktuell ausgewählten Raums
    const [actors, setActors] = useState<SettingActorItem[]>([]);
    // Lokaler State für Fenstersensoren des aktuell ausgewählten Raums
    const [WindowSensors, setWindowSensors] = useState<SettingWindowSensorItem[]>([]);
    // Lokaler State für zusätzliche Temperatursensoren des aktuell ausgewählten Raums
    const [AdditionalSensors, setAdditionalSensors] = useState<SettingTempSensorItem[]>([]);

    // Neuer lokaler State für das TextField "WaitForTempIfWindowOpen"
    // Erlaubt leeren String (für ungesetzten Wert) oder eine ganze Zahl 0-100
    const [waitForTempIfWindowOpen, setWaitForTempIfWindowOpen] = useState<number | ''>(() => {
        const v = (props.native as any).WaitForTempIfWindowOpen;
        if (typeof v === 'number' && Number.isInteger(v)) return Math.max(0, Math.min(100, v));
        if (typeof v === 'string' && v !== '') {
            const n = parseInt(v, 10);
            if (!isNaN(n)) return Math.max(0, Math.min(100, n));
        }
        return '';
    });

    // Memoisierte und sortierte Liste der Räume aus props.rooms
    const roomsList = useMemo(() => {
        if (!props.rooms) return [] as { id: string; name: string }[];
        return Object.entries(props.rooms)
            .map(([id, room]) => {
                // Versuche, den Namen aus room.common.name zu bekommen (kann string oder object sein)
                let name = id;
                try {
                    const commonName = (room && (room as any).common && (room as any).common.name);
                    if (typeof commonName === 'string') {
                        name = commonName;
                    } else if (commonName && typeof commonName === 'object') {
                        // Falls es ein i18n-Objekt ist, nimm die Default-String-Darstellung oder die ID
                        //anpassen an Systemeinstellung
                        const curLanguage = props.systemConfig?.common?.language || 'de';
                        name = commonName[curLanguage] || commonName.de || commonName.en || id;
                        //name = commonName.de || commonName.en || id;
                    }
                } catch {
                    name = id;
                }
                return { id, name };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [props.rooms]);



    // Wenn die prop-Config von außen geändert wird, lokalen State anpassen
    useEffect(() => {
        const external = (props.native as any).roomSelector ?? '';
        if (external !== selectedRoom) {
            setSelectedRoom(external);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.native.roomSelector]);

    // Wenn sich selectedRoom oder props.native.rooms ändert, Thermostate laden
    useEffect(() => {
        if (!selectedRoom) {
            setThermostats([]);
            setActors([]);
            setWindowSensors([]);
            setAdditionalSensors([]);
            setRoomIsActive(false);
            return;
        }
        const roomCfg = findRoom(selectedRoom) ?? {};

        // isActive für aktuellen Raum laden
        setRoomIsActive(!!roomCfg.isActive);

        const list1: SettingThermostatItem[] = Array.isArray(roomCfg?.Thermostats)
            ? roomCfg.Thermostats.map((t: any) => ({
                name: t?.name ?? '',
                isActive: !!t?.isActive,
                OID_Target: t?.OID_Target ?? '',
                OID_Current: t?.OID_Current ?? '',
            }))
            : [];
        setThermostats(list1);

        const list2: SettingActorItem[] = Array.isArray(roomCfg?.Actors)
            ? roomCfg.Actors.map((t: any) => ({
                name: t?.name ?? '',
                isActive: !!t?.isActive,
                OID_Target: t?.OID_Target ?? '',

            }))
            : [];
        setActors(list2);

        const list3: SettingWindowSensorItem[] = Array.isArray(roomCfg?.WindowSensors)
            ? roomCfg.WindowSensors.map((t: any) => ({
                name: t?.name ?? '',
                isActive: !!t?.isActive,
                OID_Current: t?.OID_Current ?? '',
            }))
            : [];
        setWindowSensors(list3);

        const list4: SettingTempSensorItem[] = Array.isArray(roomCfg?.AdditionalSensors)
            ? roomCfg.AdditionalSensors.map((t: any) => ({
                name: t?.name ?? '',
                isActive: !!t?.isActive,
                OID_Current: t?.OID_Current ?? '',
            }))
            : [];
        setAdditionalSensors(list4);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRoom, props.native.rooms]);

    // Helper: Persistiert Thermostats in props.native.rooms (Array)
    const persistThermostats = (newList: SettingThermostatItem[]) => {
        if (!selectedRoom) return;
        setRoomFields(selectedRoom, { Thermostats: newList });
        setThermostats(newList);
    };

    // Helper: Persistiert Aktoren in props.native.rooms[selectedRoom].Actors
    const persistActors = (newList: SettingActorItem[]) => {
        if (!selectedRoom) return;
        setRoomFields(selectedRoom, { Actors: newList });
        setActors(newList);
    };

    // Helper: Persistiert Fenstersensoren in props.native.rooms[selectedRoom].WindowSensors
    const persistWindowSensors = (newList: SettingWindowSensorItem[]) => {
        if (!selectedRoom) return;
        setRoomFields(selectedRoom, { WindowSensors: newList });
        setWindowSensors(newList);
    };

    // Helper: Persistiert zusätzliche Temperatursensoren in props.native.rooms[selectedRoom].AdditionalSensors
    const persistAdditionalSensors = (newList: SettingTempSensorItem[]) => {
        if (!selectedRoom) return;
        setRoomFields(selectedRoom, { AdditionalSensors: newList });
        setAdditionalSensors(newList);
    };

    // Persistiert isActive für den aktuellen Raum
    const persistRoomIsActive = (checked: boolean) => {
        if (!selectedRoom) {
            // Wenn kein Raum ausgewählt ist, nichts tun
            return;
        }
        setRoomFields(selectedRoom, { isActive: !!checked });
        setRoomIsActive(!!checked);
    };

    // onChange-Handler für die Selectbox (korrekter Typ für MUI Select)
    const handleRoomChange = (event: SelectChangeEvent<string>) => {
        const value = (event.target.value as string) ?? '';
        setSelectedRoom(value);

        // Neue native Konfiguration mit dem gewählten Raum
        const newNative = {
            ...(props.native as any),
            roomSelector: value,
        } as HeatingControlAdapterConfig;

        // Persistiere die Auswahl durch changeNative
        props.changeNative(newNative);
    };

    // Änderungen an einer Thermostat-Zeile
    const updateThermostatField = (index: number, field: keyof SettingThermostatItem, value: any) => {
        const newList = thermostats.map((t, i) => i === index ? { ...t, [field]: value } : t);
        persistThermostats(newList);
    };

    const addThermostat = () => {
        const newItem: SettingThermostatItem = { name: '', isActive: false, OID_Target: '', OID_Current: '', useExtHandling: false };
        persistThermostats([...thermostats, newItem]);
    };

    const removeThermostat = (index: number) => {
        const newList = thermostats.filter((_, i) => i !== index);
        persistThermostats(newList);
    };

    // Änderungen an einer Aktor-Zeile
    const updateActorField = (index: number, field: keyof SettingActorItem, value: any) => {
        const newList = actors.map((t, i) => i === index ? { ...t, [field]: value } : t);
        persistActors(newList);
    };

    const addActor = () => {
        const newItem: SettingActorItem = { name: '', isActive: false, OID_Target: '', useExtHandling: false };
        persistActors([...actors, newItem]);
    };

    const removeActor = (index: number) => {
        const newList = actors.filter((_, i) => i !== index);
        persistActors(newList);
    };

    // Änderungen an einer Fenstersensor-Zeile
    const updateWindowSensorField = (index: number, field: keyof SettingWindowSensorItem, value: any) => {
        const newList = WindowSensors.map((t, i) => i === index ? { ...t, [field]: value } : t);
        persistWindowSensors(newList);
    };

    const addWindowSensor = () => {
        const newItem: SettingWindowSensorItem = { name: '', isActive: false, OID_Current: '', DataType: 'boolean', valueClosed: false, valueOpen: true };
        persistWindowSensors([...WindowSensors, newItem]);
    };

    const removeWindowSensor = (index: number) => {
        const newList = WindowSensors.filter((_, i) => i !== index);
        persistWindowSensors(newList);
    };

    // Änderungen an einer AdditionalSensors-Zeile
    const updateAddSensorField = (index: number, field: keyof SettingTempSensorItem, value: any) => {
        const newList = AdditionalSensors.map((t, i) => i === index ? { ...t, [field]: value } : t);
        persistAdditionalSensors(newList);
    };

    const addAddSensor = () => {
        // OID_Target entfernt, da SettingTempSensorItem diesen möglicherweise nicht besitzt
        const newItem: SettingTempSensorItem = { name: '', isActive: false, OID_Current: '' };
        persistAdditionalSensors([...AdditionalSensors, newItem]);
    };

    const removeAddSensor = (index: number) => {
        const newList = AdditionalSensors.filter((_, i) => i !== index);
        persistAdditionalSensors(newList);
    };

    // Handler für das neue TextField: nur ganze Zahlen 0-100 erlauben
    const handleWaitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Nur Ziffern zulassen
        const digits = e.target.value.replace(/\D+/g, '');
        if (digits === '') {
            setWaitForTempIfWindowOpen('');
            return;
        }
        let n = parseInt(digits, 10);
        if (isNaN(n)) {
            setWaitForTempIfWindowOpen('');
            return;
        }
        if (n > 1000) n = 1000;
        setWaitForTempIfWindowOpen(n);
    };

    const handleWaitBlur = () => {
        let val = waitForTempIfWindowOpen === '' ? 0 : Number(waitForTempIfWindowOpen);
        if (!Number.isFinite(val) || Number.isNaN(val)) val = 0;
        val = Math.round(val);
        if (val < 0) val = 0;
        if (val > 1000) val = 1000;
        setWaitForTempIfWindowOpen(val);
        const newNative = { ...(props.native as any), WaitForTempIfWindowOpen: val };
        props.changeNative(newNative);
    };

    const Check4NewThermostats = () => {
        console.log("Check4NewThermostats pressed");
    }
    const Check4NewActors = () => {
        console.log("Check4NewActors pressed");
    }
    const Check4newWindowSensors = () => {
        console.log("Check4newWindowSensors pressed");
    }
    const Check4NewAddTempSensors = () => {
        console.log("Check4NewAddTempSensors pressed");
    }

    return (
        <div style={{ width: 'calc(100% - 8px)', minHeight: '100%' }}>
            <div style={{ marginBottom: 12 }}>
                <FormControl fullWidth variant="standard">
                    <InputLabel id="room-selector-label">{I18n.t('select a room')}</InputLabel>
                    <Select
                        labelId="room-selector-label"
                        value={selectedRoom ?? ''}
                        onChange={handleRoomChange}
                        displayEmpty
                    >
                        <MenuItem value="">
                            <em>{I18n.t('no room selected')}</em>
                        </MenuItem>
                        {roomsList.map(r => (
                            <MenuItem key={r.id} value={r.id}>
                                {r.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Checkbox für isActive des aktuell ausgewählten Raums */}
                {selectedRoom ? (
                    <FormControlLabel
                        control={
                            <Checkbox
                                color="primary"
                                checked={roomIsActive}
                                onChange={(e) => persistRoomIsActive((e.target as HTMLInputElement).checked)}
                                aria-label="room active checkbox"
                            />
                        }
                        label={I18n.t('active')}
                    />
                ) : null}
            </div>


            {selectedRoom ? (
                roomIsActive ? (
                    <FormControl fullWidth variant="standard">

                        
                        <Divider>
                            <Typography component="span" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                {I18n.t('thermostats')}
                            </Typography>
                        </Divider>



                        <Box component="section" sx={{ p: 2, border: 'none' }}>
                            <Badge color="primary" id='hint_thermostats' sx={{ display: 'block', mb: 2 }}>
                                {I18n.t('hint_thermostats')}
                            </Badge>



                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: '100%' }}>
                                <Button
                                    id='btn_check4newThermostats'
                                    onClick={() => Check4NewThermostats()}
                                    variant="contained"
                                    sx={{ flexShrink: 0 }}
                                >
                                    {I18n.t('Check4NewThermostats')}
                                </Button>

                                <Badge color="primary" id='Check4NewThermostats_hint' sx={{ maxWidth: '30%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                    {I18n.t('Check4NewThermostats_hint')}
                                </Badge>
                            </Box>
                            <Box>
                                <TextField
                                    style={{ marginBottom: 16 }}
                                    id='WaitForTempIfWindowOpen'
                                    label={I18n.t('WaitForTempIfWindowOpen')}
                                    variant="standard"
                                    value={waitForTempIfWindowOpen === '' ? '' : String(waitForTempIfWindowOpen)}
                                    onChange={handleWaitChange}
                                    onBlur={handleWaitBlur}
                                    // Beschränkungen: numerisch, ganze Zahlen 0-100
                                    inputProps={{ inputMode: 'numeric', pattern: '\\d*', min: 0, max: 1000 }}
                                    // Maximal 30% der Breite einnehmen
                                    sx={{ mb: 2, maxWidth: '30%' }}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">{I18n.t('seconds') || 'Sekunden'}</InputAdornment>
                                    }}
                                />



                            </Box>
                            <SettingThermostatsTable
                                settingName={I18n.t('Thermostats')}
                                settings={thermostats}
                                onAdd={addThermostat}
                                onUpdate={updateThermostatField}
                                onRemove={removeThermostat}
                                addButtonTooltip={I18n.t('add a new thermostat')}
                            />
                        </Box>


                        <Divider>
                            <Typography component="span" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                {I18n.t('actors')}
                            </Typography>
                        </Divider>


                        <Box component="section" sx={{ p: 2, border: 'none' }}>
                            <Badge color="primary" id='hint_actors' sx={{ display: 'block', mb: 2 }}>
                                {I18n.t('hint_actors')}
                            </Badge>

                            <Badge color="primary" id='useExtHandling_hint' sx={{ display: 'block', mb: 2 }}>
                                {I18n.t('useExtHandling_hint')}
                            </Badge>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: '100%' }}>
                                <Button
                                    id='btn_check4newActors'
                                    onClick={() => Check4NewActors()}
                                    variant="contained"
                                    sx={{ flexShrink: 0 }}
                                >
                                    {I18n.t('Check4NewActors')}
                                </Button>
                                <Badge color="primary" id='Check4NewActors_hint' sx={{ maxWidth: '30%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                    {I18n.t('Check4NewActors_hint')}
                                </Badge>
                            </Box>

                            <SettingActorsTable
                                settingName={I18n.t('actors')}
                                settings={actors}
                                onAdd={addActor}
                                onUpdate={updateActorField}
                                onRemove={removeActor}
                                addButtonTooltip={I18n.t('add a new actor')}
                            />
                        </Box>

                        <Divider>
                            <Typography component="span" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                {I18n.t('window sensors')}
                            </Typography>
                        </Divider>


                        <Box component="section" sx={{ p: 2, border: 'none' }}>
                            <Badge color="primary" id='hint_sensors' sx={{ display: 'block', mb: 2 }}>
                                {I18n.t('hint_sensors')}
                            </Badge>


                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: '100%' }}>
                                <Button
                                    id='btn_check4newSensors'
                                    onClick={() => Check4newWindowSensors()}
                                    variant="contained"
                                    sx={{ flexShrink: 0 }}
                                >
                                    {I18n.t('Check4NewSensors')}
                                </Button>


                                <Badge color="primary" id='Check4NewSensors_hint' sx={{ maxWidth: '30%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                    {I18n.t('Check4NewSensors_hint')}
                                </Badge>
                            </Box>

                            <SettingWindowSensorsTable
                                settingName={I18n.t('window sensors')}
                                settings={WindowSensors}
                                onAdd={addWindowSensor}
                                onUpdate={updateWindowSensorField}
                                onRemove={removeWindowSensor}
                                addButtonTooltip={I18n.t('add a new window sensor')}
                            />
                        </Box>

                        <Divider>
                            <Typography component="span" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                {I18n.t('additional temperature sensors')}
                            </Typography>
                        </Divider>

                        <Box component="section" sx={{ p: 2, border: 'none' }}>
                            <Badge color="primary" id='hint_AddTempSensors' sx={{ display: 'block', mb: 2 }}>
                                {I18n.t('hint_AddTempSensors')}
                            </Badge>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: '100%' }}>
                                <Button
                                    id='btn_check4newAddTempSensors'
                                    onClick={() => Check4NewAddTempSensors()}
                                    variant="contained"
                                    sx={{ flexShrink: 0 }}
                                >
                                    {I18n.t('Check4NewAddTempSensors')}
                                </Button>


                                <Badge color="primary" id='Check4NewAddTempSensors_hint' sx={{ maxWidth: '30%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                    {I18n.t('Check4NewAddTempSensors_hint')}
                                </Badge>
                            </Box>

                            <SettingTempSensorsTable
                                settingName={I18n.t('additional temperature sensors')}
                                settings={AdditionalSensors}
                                onAdd={addAddSensor}
                                onUpdate={updateAddSensorField}
                                onRemove={removeAddSensor}
                                addButtonTooltip={I18n.t('add a new temperature sensor')}
                            />
                        </Box>
                    </FormControl>
                ) : (
                    <div>
                        <em>{I18n.t('room is inactive - activate to edit settings')}</em>
                    </div>
                )
            ) : (
                <div>
                    <em>{I18n.t('select a room to display settings')}</em>
                </div>
            )}

        </div>
    );
}