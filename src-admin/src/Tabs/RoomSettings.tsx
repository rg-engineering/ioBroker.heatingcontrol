/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */

import React, { useEffect, useMemo, useState } from 'react';
import type { AdminConnection, IobTheme, ThemeName, ThemeType } from '@iobroker/adapter-react-v5';
import { I18n } from '@iobroker/adapter-react-v5';
import type { HeatingControlAdapterConfig, RoomConfig } from "../types";

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
    TextField
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
    functions?: Record<string, ioBroker.EnumObject>;
    alive: boolean;
}



export default function RoomSettings(props: SettingsProps): React.JSX.Element {

    console.log("RoomSettings render: " + JSON.stringify(props.native));

    // Hilfsfunktionen für native.rooms als Array
    const getNativeRooms = (): RoomConfig[]  => {
        const n = props.native.rooms;
        return Array.isArray(n) ? n : [];
    };

    const findRoom = (id: string): RoomConfig | undefined => {
        if (!id) {
            return undefined;
        }
        const arr = getNativeRooms();
        return arr.find(r => r && r.id === id);
    };


    // Hilfsfunktion: Namen eines Raumes aus props.rooms ermitteln (fällt zurück auf ID)
    const getRoomNameFromProps = (id: string): string => {
        if (!id) {
            return '';
        }
        try {
            const room = props.rooms ? props.rooms[id] : undefined;
            if (!room) {
                return id;
            }
            const commonName = (room as any)?.common?.name;
            if (typeof commonName === 'string') {
                return commonName;
            }
            if (commonName && typeof commonName === 'object') {
                const curLanguage = props.systemConfig?.common?.language || 'de';
                return commonName[curLanguage] || commonName.de || commonName.en || id;
            }
            return id;
        } catch {
            return id;
        }
    };

    const setRoomFields = (id: string, fields: Record<string, any>): boolean => {
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
    const [selectedFunction, setSelectedFunction] = useState<string>(() => (props.native as any).functionSelector ?? '');

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
        if (typeof v === 'number' && Number.isInteger(v)) {
            return Math.max(0, Math.min(100, v));
        }
        if (typeof v === 'string' && v !== '') {
            const n = parseInt(v, 10);
            if (!isNaN(n)) {
                return Math.max(0, Math.min(100, n));
            }
        }
        return '';
    });

    // Neuer lokaler State für Ergebnis / Status von Check4NewThermostats
    const [checkThermostatsResult, setCheckThermostatsResult] = useState<string>('');
    const [checkActorsResult, setCheckActorsResult] = useState<string>('');
    const [checkSensorsResult, setCheckSensorsResult] = useState<string>('');
    const [checkAddTempSensorsResult, setCheckAddTempSensorsResult] = useState<string>('');

    // Memoisierte und sortierte Liste der Räume aus props.rooms
    const roomsList = useMemo(() => {
        if (!props.rooms) {
            return [] as { id: string; name: string }[];
        }
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

    // Memoisierte und sortierte Liste der Funktionen aus props.rooms
    const functionsList = useMemo(() => {
        if (!props.functions) {
            return [] as { id: string; name: string }[];
        }
        return Object.entries(props.functions)
            .map(([id, fkt]) => {
                // Versuche, den Namen aus function.common.name zu bekommen (kann string oder object sein)
                let name = id;
                try {
                    const commonName = (fkt && (fkt as any).common && (fkt as any).common.name);
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
    }, [props.functions]);



    // Wenn die prop-Config von außen geändert wird, lokalen State anpassen
    useEffect(() => {
        const external = (props.native as any).roomSelector ?? '';
        if (external !== selectedRoom) {
            setSelectedRoom(external);
        }
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
        const roomCfg = findRoom(selectedRoom);

        if (roomCfg === undefined) {
            return;
        }
        // isActive für aktuellen Raum laden
        setRoomIsActive(!!roomCfg.isActive);

        const list1: SettingThermostatItem[] = Array.isArray(roomCfg?.Thermostats)
            ? roomCfg.Thermostats.map((t: any) => ({
                name: t?.name ?? '',
                isActive: !!t?.isActive,
                OID_Target: t?.OID_Target ?? '',
                OID_Current: t?.OID_Current ?? '',
                useExtHandling: t?.useExtHandling ?? false
            }))
            : [];
        setThermostats(list1);

        const list2: SettingActorItem[] = Array.isArray(roomCfg?.Actors)
            ? roomCfg.Actors.map((t: any) => ({
                name: t?.name ?? '',
                isActive: !!t?.isActive,
                OID_Target: t?.OID_Target ?? '',
                useExtHandling: t?.useExtHandling ?? false

            }))
            : [];
        setActors(list2);

        const list3: SettingWindowSensorItem[] = Array.isArray(roomCfg?.WindowSensors)
            ? roomCfg.WindowSensors.map((t: any) => ({
                name: t?.name ?? '',
                isActive: !!t?.isActive,
                OID_Current: t?.OID_Current ?? '',
                DataType: t?.DataType ?? 'boolean',
                valueOpen: t?.valueOpen ?? 'true',
                valueClosed: t?.valueClosed ?? 'false',
            }))
            : [];
        setWindowSensors(list3);

        const list4: SettingTempSensorItem[] = Array.isArray(roomCfg?.AdditionalTemperatureSensors)
            ? roomCfg.AdditionalTemperatureSensors.map((t: any) => ({
                name: t?.name ?? '',
                isActive: !!t?.isActive,
                OID_Current: t?.OID_Current ?? '',
            }))
            : [];
        setAdditionalSensors(list4);

    }, [selectedRoom, props.native.rooms]);

    // Helper: Persistiert Thermostats in props.native.rooms (Array)
    const persistThermostats = (newList: SettingThermostatItem[]):void => {
        if (!selectedRoom) {
            return;
        }
        setRoomFields(selectedRoom, { Thermostats: newList });
        setThermostats(newList);
    };

    // Helper: Persistiert Aktoren in props.native.rooms[selectedRoom].Actors
    const persistActors = (newList: SettingActorItem[]):void => {
        if (!selectedRoom) {
            return;
        }
        setRoomFields(selectedRoom, { Actors: newList });
        setActors(newList);
    };

    // Helper: Persistiert Fenstersensoren in props.native.rooms[selectedRoom].WindowSensors
    const persistWindowSensors = (newList: SettingWindowSensorItem[]):void => {
        if (!selectedRoom) {
            return;
        }
        setRoomFields(selectedRoom, { WindowSensors: newList });
        setWindowSensors(newList);
    };

    // Helper: Persistiert zusätzliche Temperatursensoren in props.native.rooms[selectedRoom].AdditionalSensors
    const persistAdditionalSensors = (newList: SettingTempSensorItem[]):void => {
        if (!selectedRoom) {
            return;
        }
        setRoomFields(selectedRoom, { AdditionalSensors: newList });
        setAdditionalSensors(newList);
    };

    // Persistiert isActive für den aktuellen Raum
    const persistRoomIsActive = (checked: boolean):void => {
        if (!selectedRoom) {
            // Wenn kein Raum ausgewählt ist, nichts tun
            return;
        }
        setRoomFields(selectedRoom, { isActive: !!checked });
        setRoomIsActive(!!checked);
    };

    // onChange-Handler für die Selectbox (korrekter Typ für MUI Select)
    const handleRoomChange = (event: SelectChangeEvent<string>):void => {
        const value = event.target.value ?? '';
        setSelectedRoom(value);

        setCheckThermostatsResult("");
        setCheckActorsResult("");
        setCheckSensorsResult("");
        setCheckAddTempSensorsResult("");

        // Neue native Konfiguration mit dem gewählten Raum
        const newNative = {
            ...(props.native as any),
            roomSelector: value,
        } as HeatingControlAdapterConfig;

        // Persistiere die Auswahl durch changeNative
        props.changeNative(newNative);
    };

    // onChange-Handler für die Selectbox (korrekter Typ für MUI Select)
    const handleFunctionChange = (event: SelectChangeEvent<string>):void => {
        const value = event.target.value ?? '';
        setSelectedFunction(value);
    };

    // Änderungen an einer Thermostat-Zeile
    const updateThermostatField = (index: number, field: keyof SettingThermostatItem, value: any):void => {
        const newList = thermostats.map((t, i) => i === index ? { ...t, [field]: value } : t);
        persistThermostats(newList);
    };

    const addThermostat = ():void => {
        const newItem: SettingThermostatItem = { name: '', isActive: false, OID_Target: '', OID_Current: '', useExtHandling: false };
        persistThermostats([...thermostats, newItem]);
    };

    const removeThermostat = (index: number):void => {
        const newList = thermostats.filter((_, i) => i !== index);
        persistThermostats(newList);
    };

    // Änderungen an einer Aktor-Zeile
    const updateActorField = (index: number, field: keyof SettingActorItem, value: any):void => {
        const newList = actors.map((t, i) => i === index ? { ...t, [field]: value } : t);
        persistActors(newList);
    };

    const addActor = ():void => {
        const newItem: SettingActorItem = { name: '', isActive: false, OID_Target: '', useExtHandling: false };
        persistActors([...actors, newItem]);
    };

    const removeActor = (index: number):void => {
        const newList = actors.filter((_, i) => i !== index);
        persistActors(newList);
    };

    // Änderungen an einer Fenstersensor-Zeile
    const updateWindowSensorField = (index: number, field: keyof SettingWindowSensorItem, value: any):void => {
        const newList = WindowSensors.map((t, i) => i === index ? { ...t, [field]: value } : t);
        persistWindowSensors(newList);
    };

    const addWindowSensor = ():void => {
        const newItem: SettingWindowSensorItem = { name: '', isActive: false, OID_Current: '', DataType: 'boolean', valueClosed: false, valueOpen: true };
        persistWindowSensors([...WindowSensors, newItem]);
    };

    const removeWindowSensor = (index: number):void => {
        const newList = WindowSensors.filter((_, i) => i !== index);
        persistWindowSensors(newList);
    };

    // Änderungen an einer AdditionalSensors-Zeile
    const updateAddSensorField = (index: number, field: keyof SettingTempSensorItem, value: any):void => {
        const newList = AdditionalSensors.map((t, i) => i === index ? { ...t, [field]: value } : t);
        persistAdditionalSensors(newList);
    };

    const addAddSensor = ():void => {
        // OID_Target entfernt, da SettingTempSensorItem diesen möglicherweise nicht besitzt
        const newItem: SettingTempSensorItem = { name: '', isActive: false, OID_Current: '' };
        persistAdditionalSensors([...AdditionalSensors, newItem]);
    };

    const removeAddSensor = (index: number):void => {
        const newList = AdditionalSensors.filter((_, i) => i !== index);
        persistAdditionalSensors(newList);
    };

    // Handler für das neue TextField: nur ganze Zahlen 0-100 erlauben
    const handleWaitChange = (e: React.ChangeEvent<HTMLInputElement>):void => {
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
        if (n > 1000) {
            n = 1000;
        }
        setWaitForTempIfWindowOpen(n);
    };

    const handleWaitBlur = ():void => {
        let val = waitForTempIfWindowOpen === '' ? 0 : Number(waitForTempIfWindowOpen);
        if (!Number.isFinite(val) || Number.isNaN(val)) {
            val = 0;
        }
        val = Math.round(val);
        if (val < 0) {
            val = 0;
        }
        if (val > 1000) {
            val = 1000;
        }
        setWaitForTempIfWindowOpen(val);
        const newNative = { ...(props.native as any), WaitForTempIfWindowOpen: val };
        props.changeNative(newNative);
    };

    const Check4NewThermostats = async (): Promise<void> => {
        console.log("Check4NewThermostats pressed");

        const data = {
            room: selectedRoom,
            gewerk: selectedFunction
        };
        const instance = 'heatingcontrol.' + props.instance;;
        const newDevices = await props.socket.sendTo(instance, 'listThermostats', data);

        console.log("got new thermostats " + JSON.stringify(newDevices));

        // Setze den Status/Text in den neuen State (wenn vorhanden)
        try {
            const status = (newDevices && newDevices.status) ? newDevices.status : '';
            if (typeof status === 'object') {
                setCheckThermostatsResult(JSON.stringify(status));
            } else {
                setCheckThermostatsResult(String(status));
            }
        } catch (err) {
            setCheckThermostatsResult('Error reading status ' + err);
        }

        try {
            const devices: any[] = (newDevices && Array.isArray(newDevices.list)) ? newDevices.list : [];
            if (devices.length === 0) {
                console.log("No devices returned from listThermostats");
                return;
            }

            // Sammlung vorhandener OIDs (Target + Current)
            const existingOids = new Set<string>();
            thermostats.forEach(t => {
                if (t?.OID_Target) {
                    existingOids.add(String(t.OID_Target));
                }
                if (t?.OID_Current) {
                    existingOids.add(String(t.OID_Current));
                }
            });
            console.log("existing oids: " + JSON.stringify(existingOids));

            // Filtere neue Geräte, vermeide Duplikate gegenüber vorhandenen OIDs
            const toAddMap = new Map<string, SettingThermostatItem>();
            devices.forEach(d => {
                const oidTarget = d?.OID_Target  ?? '';
                const oidCurrent = d?.OID_Current  ?? '';
                // mindestens eine OID erforderlich
                if (!oidTarget && !oidCurrent) {
                    console.log("has no oidCurrent or oidTarget");
                    return;
                }
                // wenn eine der OIDs bereits existiert, überspringen
                if ((oidTarget && existingOids.has(String(oidTarget))) || (oidCurrent && existingOids.has(String(oidCurrent)))) {
                    console.log("OID already used");
                    return;
                }
                // Schlüssel zur Vermeidung von Duplikaten innerhalb der gefundenen Geräte: kombination aus OIDs oder Name
                const key = (oidTarget || '') + '|' + (oidCurrent || '') + '|' + (d?.name ?? '');
                if (toAddMap.has(key)) {
                    return;
                }
                const item: SettingThermostatItem = {
                    name: d?.Name ?? '',
                    isActive: true,
                    OID_Target: oidTarget ?? '',
                    OID_Current: oidCurrent ?? '',
                } as SettingThermostatItem;
                toAddMap.set(key, item);
            });

            const toAdd = Array.from(toAddMap.values());
            if (toAdd.length === 0) {
                console.log("No new thermostats to add after filtering duplicates.");
                return;
            }

            const newList = [...thermostats, ...toAdd];
            persistThermostats(newList);
            console.log(`Added ${toAdd.length} new thermostats to the settings.`);
        } catch (err) {
            console.error("Error processing new thermostats:", err);
        }

    }


    const Check4NewActors = async (): Promise<void> => {
        console.log("Check4NewActors pressed");

        const data = {
            room: selectedRoom,
            gewerk: selectedFunction
        };
        const instance = 'heatingcontrol.' + props.instance;;
        const newDevices = await props.socket.sendTo(instance, 'listActors', data);

        console.log("got new actors  " + JSON.stringify(newDevices));

        // Setze den Status/Text in den neuen State (wenn vorhanden)
        try {
            const status = (newDevices && newDevices.status) ? newDevices.status : '';
            if (typeof status === 'object') {
                setCheckActorsResult(JSON.stringify(status));
            } else {
                setCheckActorsResult(String(status));
            }
        } catch (err) {
            setCheckActorsResult('Error reading status ' + err);
        }

        try {
            const devices: any[] = (newDevices && Array.isArray(newDevices.list)) ? newDevices.list : [];
            if (devices.length === 0) {
                console.log("No devices returned from listActors");
                return;
            }

            // Sammlung vorhandener OIDs (Target + Current)
            const existingOids = new Set<string>();
            actors.forEach(t => {
                if (t?.OID_Target) {
                    existingOids.add(String(t.OID_Target));
                }
                
            });
            console.log("existing oids: " + JSON.stringify(existingOids));

            // Filtere neue Geräte, vermeide Duplikate gegenüber vorhandenen OIDs
            const toAddMap = new Map<string, SettingActorItem>();
            devices.forEach(d => {
                const oidTarget = d?.OID_Target ?? d?.oidTarget ?? d?.oid_target ?? '';
               
                // Für Actor ist mindestens die Target-OID erforderlich
                if (!oidTarget) {
                    console.log("has no oidTarget");
                    return;
                }
                // wenn die OID bereits existiert, überspringen
                if (existingOids.has(String(oidTarget))) {
                    console.log("OID already used");
                    return;
                }

                // Key nur aus OID_Target und Name bilden (Actors haben kein oidCurrent)
                const key = (oidTarget || '') + '|' + (d?.name ?? '');

                if (toAddMap.has(key)) {
                    return;
                }
                const item: SettingActorItem = {
                    name: d?.Name ?? '',
                    isActive: true,
                    OID_Target: oidTarget ?? '',
                    
                } as SettingActorItem;
                toAddMap.set(key, item);
            });

            const toAdd = Array.from(toAddMap.values());
            if (toAdd.length === 0) {
                console.log("No new actors to add after filtering duplicates.");
                return;
            }

            const newList = [...actors, ...toAdd];
            persistActors(newList);
            console.log(`Added ${toAdd.length} new actors to the settings.`);
        } catch (err) {
            console.error("Error processing new actors:", err);
        }

    }
    const Check4newWindowSensors = async (): Promise<void> => {
        console.log("Check4newWindowSensors pressed");

        const data = {
            room: selectedRoom,
            gewerk: selectedFunction
        };
        const instance = 'heatingcontrol.' + props.instance;;
        const newDevices = await props.socket.sendTo(instance, 'listSensors', data);

        console.log("got new sensors " + JSON.stringify(newDevices));

        // Setze den Status/Text in den neuen State (wenn vorhanden)
        try {
            const status = (newDevices && newDevices.status) ? newDevices.status : '';
            if (typeof status === 'object') {
                setCheckSensorsResult(JSON.stringify(status));
            } else {
                setCheckSensorsResult(String(status));
            }
        } catch (err) {
            setCheckSensorsResult('Error reading status ' + err);
        }

        try {
            const devices: any[] = (newDevices && Array.isArray(newDevices.list)) ? newDevices.list : [];
            if (devices.length === 0) {
                console.log("No devices returned from listSensors");
                return;
            }

            // Sammlung vorhandener OIDs (Target + Current)
            const existingOids = new Set<string>();
            WindowSensors.forEach(t => {
                if (t?.OID_Current) {
                    existingOids.add(String(t.OID_Current));
                }

            });
            console.log("existing oids: " + JSON.stringify(existingOids));

            // Filtere neue Geräte, vermeide Duplikate gegenüber vorhandenen OIDs
            const toAddMap = new Map<string, SettingWindowSensorItem>();
            devices.forEach(d => {
                const oidCurrent = d?.OID_Current ?? '';

                // Für Sensoren ist mindestens die Current-OID erforderlich
                if (!oidCurrent) {
                    console.log("has no oidCurrent");
                    return;
                }
                // wenn die OID bereits existiert, überspringen
                if (existingOids.has(String(oidCurrent))) {
                    
                    console.log("OID already used");
                    return;
                }

                // Key nur aus OID_Current und Name bilden 
                const key = (oidCurrent || '') + '|' + (d?.name ?? '');

                if (toAddMap.has(key)) {
                    return;
                }
                const item: SettingWindowSensorItem = {
                    name: d?.Name ?? '',
                    isActive: true,
                    OID_Current: oidCurrent ?? '',

                } as SettingWindowSensorItem;
                toAddMap.set(key, item);
            });

            const toAdd = Array.from(toAddMap.values());
            if (toAdd.length === 0) {
                console.log("No new sensors to add after filtering duplicates.");
                return;
            }

            const newList = [...WindowSensors, ...toAdd];
            persistWindowSensors(newList);
            console.log(`Added ${toAdd.length} new sensors to the settings.`);
        } catch (err) {
            console.error("Error processing new sensors:", err);
        }

    }
    const Check4NewAddTempSensors = async (): Promise<void>  => {
        console.log("Check4NewAddTempSensors pressed");

        const data = {
            room: selectedRoom,
            gewerk: selectedFunction
        };
        const instance = 'heatingcontrol.' + props.instance;;
        const newDevices = await props.socket.sendTo(instance, 'listAddTempSensors', data);

        console.log("got new additional sensors " + JSON.stringify(newDevices));

        // Setze den Status/Text in den neuen State (wenn vorhanden)
        try {
            const status = (newDevices && newDevices.status) ? newDevices.status : '';
            if (typeof status === 'object') {
                setCheckAddTempSensorsResult(JSON.stringify(status));
            } else {
                setCheckAddTempSensorsResult(String(status));
            }
        } catch (err) {
            setCheckAddTempSensorsResult('Error reading status ' + err);
        }

        try {
            const devices: any[] = (newDevices && Array.isArray(newDevices.list)) ? newDevices.list : [];
            if (devices.length === 0) {
                console.log("No devices returned from listAddTempSensors");
                return;
            }

            // Sammlung vorhandener OIDs (Target + Current)
            const existingOids = new Set<string>();
            AdditionalSensors.forEach(t => {
                if (t?.OID_Current) {
                    existingOids.add(String(t.OID_Current));
                }

            });
            console.log("existing oids: " + JSON.stringify(existingOids));


            // Filtere neue Geräte, vermeide Duplikate gegenüber vorhandenen OIDs
            const toAddMap = new Map<string, SettingTempSensorItem>();
            devices.forEach(d => {
                const oidCurrent = d?.OID_Current  ?? '';

                // Für Sensoren ist mindestens die Current-OID erforderlich
                if (!oidCurrent) {
                    console.log("has no oidCurrent");
                    return;
                }
                // wenn die OID bereits existiert, überspringen
                if (existingOids.has(String(oidCurrent))) {
                    console.log("OID already used");
                    return;
                }

                // Key nur aus OID_Current und Name bilden 
                const key = (oidCurrent || '') + '|' + (d?.name ?? '');

                if (toAddMap.has(key)) {
                    return;
                }
                const item: SettingTempSensorItem = {
                    name: d?.Name ?? '',
                    isActive: true,
                    OID_Current: oidCurrent ?? '',

                } as SettingTempSensorItem;
                toAddMap.set(key, item);
            });

            const toAdd = Array.from(toAddMap.values());
            if (toAdd.length === 0) {
                console.log("No new additional temperature sensor to add after filtering duplicates.");
                return;
            }

            const newList = [...AdditionalSensors, ...toAdd];
            persistAdditionalSensors(newList);
            console.log(`Added ${toAdd.length} new additional temperature sensor to the settings.`);
        } catch (err) {
            console.error("Error processing new additional temperature sensor:", err);
        }
    }

    return (
        <div style={{ width: 'calc(100% - 8px)', minHeight: '100%' }}>
            <div style={{ marginBottom: 12 }}>
                <FormControl variant="standard" sx={{ minWidth: '40%',  maxWidth: '60%' }} >
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

            <div style={{ marginBottom: 12 }}>
                <FormControl variant="standard" sx={{ minWidth: '40%', maxWidth: '60%' }}>
                    <InputLabel id="function-selector-label">{I18n.t('select a function')}</InputLabel>
                    <Select
                        labelId="function-selector-label"
                        value={selectedFunction ?? ''}
                        onChange={handleFunctionChange}
                        displayEmpty
                    >
                        <MenuItem value="">
                            <em>{I18n.t('no function selected')}</em>
                        </MenuItem>
                        {functionsList.map(r => (
                            <MenuItem key={r.id} value={r.id}>
                                {r.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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


                                {checkThermostatsResult.length>0 ? (

                                    <Badge color="primary" id='Check4NewThermostats_Result' sx={{ maxWidth: '20%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                        {checkThermostatsResult}
                                    </Badge>

                                    
                                ): (null)}

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
                                    sx={{ mb: 2, maxWidth: '30%' }}
                                    /* MUI-Typing: einige Slot-Namen / Shapes sind in den @mui/material-Typen nicht
                                       exakt wie in der Doku (oder können je nach Minor-Version fehlen).
                                       Sicherer Weg: die slot-Objekte an `any` zu casten, damit TypeScript nicht meckert,
                                       während die Laufzeit-API von MUI korrekt genutzt wird. */
                                    slots={({} as any)
                                    }
                                    slotProps={
                                        {
                                            input: { inputProps: { inputMode: 'numeric', pattern: '\\d*', min: 0, max: 1000 } },
                                            endDecorator: { children: I18n.t('seconds') },
                                        } as any
                                    }
                                />

                            </Box>

                            

                            <SettingThermostatsTable
                                settingName={I18n.t('Thermostats')}
                                settings={thermostats}
                                socket={props.socket}
                                theme={props.theme}
                                themeName={props.themeName}
                                themeType={props.themeType}
                                onAdd={addThermostat}
                                onUpdate={updateThermostatField}
                                onRemove={removeThermostat}
                                addButtonTooltip={I18n.t('add a new thermostat')}
                            />
                        </Box>

                        {props.native.UseActors ? (
                            <div>
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

                                        {checkActorsResult.length > 0 ? (

                                            <Badge color="primary" id='Check4NewActors_Result' sx={{ maxWidth: '20%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                                {checkActorsResult}
                                            </Badge>


                                        ) : (null)}


                                        <Badge color="primary" id='Check4NewActors_hint' sx={{ maxWidth: '30%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                            {I18n.t('Check4NewActors_hint')}
                                        </Badge>
                                    </Box>

                                    <SettingActorsTable
                                        settingName={I18n.t('actors')}
                                        settings={actors}
                                        socket={props.socket}
                                        theme={props.theme}
                                        themeName={props.themeName}
                                        themeType={props.themeType}
                                        onAdd={addActor}
                                        onUpdate={updateActorField}
                                        onRemove={removeActor}
                                        addButtonTooltip={I18n.t('add a new actor')}
                                    />
                                </Box>
                            </div>
                        ) : (
                            null
                        )}

                        {props.native.UseSensors ? (
                            <div>
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

                                        {checkSensorsResult.length > 0 ? (

                                            <Badge color="primary" id='Check4NewSensors_Result' sx={{ maxWidth: '20%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                                {checkSensorsResult}
                                            </Badge>


                                        ) : (null)}

                                        <Badge color="primary" id='Check4NewSensors_hint' sx={{ maxWidth: '30%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                            {I18n.t('Check4NewSensors_hint')}
                                        </Badge>
                                    </Box>

                                    <SettingWindowSensorsTable
                                        settingName={I18n.t('window sensors')}
                                        settings={WindowSensors}
                                        socket={props.socket}
                                        theme={props.theme}
                                        themeName={props.themeName}
                                        themeType={props.themeType}
                                        onAdd={addWindowSensor}
                                        onUpdate={updateWindowSensorField}
                                        onRemove={removeWindowSensor}
                                        addButtonTooltip={I18n.t('add a new window sensor')}
                                    />
                                </Box>
                            </div>
                        ) : (
                            null
                        )}

                        {props.native.UseAddTempSensors ? (
                            <div>
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

                                        {checkAddTempSensorsResult.length > 0 ? (

                                            <Badge color="primary" id='Check4NewAddTempSensors_Result' sx={{ maxWidth: '20%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                                {checkAddTempSensorsResult}
                                            </Badge>


                                        ) : (null)}

                                        <Badge color="primary" id='Check4NewAddTempSensors_hint' sx={{ maxWidth: '30%', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                            {I18n.t('Check4NewAddTempSensors_hint')}
                                        </Badge>
                                    </Box>

                                    <SettingTempSensorsTable
                                        settingName={I18n.t('additional temperature sensors')}
                                        settings={AdditionalSensors}
                                        socket={props.socket}
                                        theme={props.theme}
                                        themeName={props.themeName}
                                        themeType={props.themeType}
                                        onAdd={addAddSensor}
                                        onUpdate={updateAddSensorField}
                                        onRemove={removeAddSensor}
                                        addButtonTooltip={I18n.t('add a new temperature sensor')}
                                    />
                                </Box>
                            </div>
                        ) : (
                            null
                        )}
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