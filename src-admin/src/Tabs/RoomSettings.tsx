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

} from '@mui/material';

import SettingTable from '../Components/SettingTable';
import type { SettingItem } from '../Components/SettingTable';
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
    const [thermostats, setThermostats] = useState<SettingItem[]>([]);
    // Lokaler State für Aktoren des aktuell ausgewählten Raums
    const [actors, setActors] = useState<SettingItem[]>([]);
    // Lokaler State für Fenstersensoren des aktuell ausgewählten Raums
    const [WindowSensors, setWindowSensors] = useState<SettingItem[]>([]);


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
            setRoomIsActive(false);
            return;
        }
        const roomCfg = findRoom(selectedRoom) ?? {};

        // isActive für aktuellen Raum laden
        setRoomIsActive(!!roomCfg.isActive);

        const list1: SettingItem[] = Array.isArray(roomCfg?.Thermostats)
            ? roomCfg.Thermostats.map((t: any) => ({
                name: t?.name ?? '',
                isActive: !!t?.isActive,
                OID_Target: t?.OID_Target ?? '',
                OID_Current: t?.OID_Current ?? '',
            }))
            : [];
        setThermostats(list1);

        const list2: SettingItem[] = Array.isArray(roomCfg?.Actors)
            ? roomCfg.Actors.map((t: any) => ({
                name: t?.name ?? '',
                isActive: !!t?.isActive,
                OID_Target: t?.OID_Target ?? '',
                OID_Current: t?.OID_Current ?? '',
            }))
            : [];
        setActors(list2);

        const list3: SettingItem[] = Array.isArray(roomCfg?.WindowSensors)
            ? roomCfg.WindowSensors.map((t: any) => ({
                name: t?.name ?? '',
                isActive: !!t?.isActive,
                OID_Target: t?.OID_Target ?? '',
                OID_Current: t?.OID_Current ?? '',
            }))
            : [];
        setWindowSensors(list3);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRoom, props.native.rooms]);

    // Helper: Persistiert Thermostats in props.native.rooms (Array)
    const persistThermostats = (newList: SettingItem[]) => {
        if (!selectedRoom) return;
        setRoomFields(selectedRoom, { Thermostats: newList });
        setThermostats(newList);
    };

    // Helper: Persistiert Aktoren in props.native.rooms[selectedRoom].Actors
    const persistActors = (newList: SettingItem[]) => {
        if (!selectedRoom) return;
        setRoomFields(selectedRoom, { Actors: newList });
        setActors(newList);
    };

    // Helper: Persistiert Fenstersensoren in props.native.rooms[selectedRoom].WindowSensors
    const persistWindowSensors = (newList: SettingItem[]) => {
        if (!selectedRoom) return;
        setRoomFields(selectedRoom, { WindowSensors: newList });
        setWindowSensors(newList);
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

    // onChange-Handler für die Selectbox
    const handleRoomChange = (event: React.ChangeEvent<{ value: unknown }>) => {
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
    const updateThermostatField = (index: number, field: keyof SettingItem, value: any) => {
        const newList = thermostats.map((t, i) => i === index ? { ...t, [field]: value } : t);
        persistThermostats(newList);
    };

    const addThermostat = () => {
        const newItem: SettingItem = { name: '', isActive: false, OID_Target: '', OID_Current: '' };
        persistThermostats([...thermostats, newItem]);
    };

    const removeThermostat = (index: number) => {
        const newList = thermostats.filter((_, i) => i !== index);
        persistThermostats(newList);
    };

    // Änderungen an einer Aktor-Zeile
    const updateActorField = (index: number, field: keyof SettingItem, value: any) => {
        const newList = actors.map((t, i) => i === index ? { ...t, [field]: value } : t);
        persistActors(newList);
    };

    const addActor = () => {
        const newItem: SettingItem = { name: '', isActive: false, OID_Target: '', OID_Current: '' };
        persistActors([...actors, newItem]);
    };

    const removeActor = (index: number) => {
        const newList = actors.filter((_, i) => i !== index);
        persistActors(newList);
    };

    // Änderungen an einer Fenstersensor-Zeile
    const updateWindowSensorField = (index: number, field: keyof SettingItem, value: any) => {
        const newList = WindowSensors.map((t, i) => i === index ? { ...t, [field]: value } : t);
        persistWindowSensors(newList);
    };

    const addWindowSensor = () => {
        const newItem: SettingItem = { name: '', isActive: false, OID_Target: '', OID_Current: '' };
        persistWindowSensors([...WindowSensors, newItem]);
    };

    const removeWindowSensor = (index: number) => {
        const newList = WindowSensors.filter((_, i) => i !== index);
        persistWindowSensors(newList);
    };

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
                                onChange={(e) => persistRoomIsActive(e.target.checked)}
                                inputProps={{ 'aria-label': 'room active checkbox' }}
                            />
                        }
                        label={I18n.t('active')}
                    />
                ) : null}
            </div>

            {/* Tabelle für Thermostate */}
            {selectedRoom ? (
                roomIsActive ? (
                <SettingTable
                    settingName={I18n.t('Thermostats')}
                    settings={thermostats}
                    onAdd={addThermostat}
                    onUpdate={updateThermostatField}
                    onRemove={removeThermostat}
                    addButtonTooltip={I18n.t('add a new thermostat')}
                    useOIDTarget={true}
                    useOIDCurrent={true}
                    />
                ) : (
                    <div>
                        <em>{I18n.t('room is inactive - activate to edit thermostat settings')}</em>
                    </div>
                )
            ) : (
                <div>
                    <em>{I18n.t('select a room to display thermostat settings')}</em>
                </div>
            )}


            {/* Tabelle für Aktoren */}
            {selectedRoom ? (
                roomIsActive ? (
                <SettingTable
                    settingName={I18n.t('actors')}
                    settings={actors}
                    onAdd={addActor}
                    onUpdate={updateActorField}
                    onRemove={removeActor}
                    addButtonTooltip={I18n.t('add a new actor')}
                    useOIDTarget={true}
                    useOIDCurrent={false}
                    />
                ) : (
                    <div>
                        <em>{I18n.t('room is inactive - activate to edit actor settings')}</em>
                    </div>
                )
            ) : (
                <div>
                        <em>{I18n.t('select a room to display actor settings')}</em>
                </div>
            )}

            {/* Tabelle für FensterSensoren */}
            {selectedRoom ? (
                roomIsActive ? (
                <SettingTable
                    settingName={I18n.t('window sensors')}
                    settings={WindowSensors}
                    onAdd={addWindowSensor}
                    onUpdate={updateWindowSensorField}
                    onRemove={removeWindowSensor}
                    addButtonTooltip={I18n.t('add a new window sensor')}
                    useOIDTarget={false}
                    useOIDCurrent={true}
                    />
                ) : (
                    <div>
                        <em>{I18n.t('room is inactive - activate to edit window sensor settings')}</em>
                    </div>
                )
            ) : (
                <div>
                        <em>{I18n.t('select a room to display window sensor settings')}</em>
                </div>
            )}

        </div>
    );
}