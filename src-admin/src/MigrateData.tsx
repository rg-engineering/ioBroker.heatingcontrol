/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */
import type { RoomConfig } from "./types";

type RoomsMap = Record<string, any> | null;
type SystemConfig = any;

export default class LegacyMigrator {
    /**
     * Führt die komplette Migration aus (ersetzt UpdateDataFromOldVersion).
     * - native: das aktuelle native-Objekt (wird verändert)
     * - rooms: enums/rooms aus state
     * - systemConfig: systemConfig aus state
     * - getIsChanged: Funktion aus App zum Bestimmen, ob native geändert wurde
     * - setState: Callback, um setState in App aufzurufen (teilweises state-Objekt)
     */
    static migrate(
        native: any,
        rooms: RoomsMap,
        systemConfig: SystemConfig,
        getIsChanged: (native: any) => boolean,
        setState: (s: Partial<any>) => void
    ): void {
        if (native === undefined || native === null) {
            return;
        }
        // 1) Entferne ungültige Räume
        try {
            const res = this.removeRoomsWithMissingId(native, rooms);
            native = res.native;
            if (res.removed > 0) {
                setState({ native, changed: getIsChanged(native) });
            }
        } catch (err) {
            // Fehler protokollieren, aber Migration fortsetzen
            // Aufrufer kann loggen
            console.warn("migrate exception ignored " + err);
        }

        // 2) Migriere alte devices falls vorhanden
        try {
            if (Array.isArray(native.devices) && native.devices.length > 0) {
                let overallChanged = false;
                for (const device of native.devices) {
                    try {

                        console.debug("migrate " + JSON.stringify(device));

                        const didChange = this.migrateSingleDevice(native, device, rooms, systemConfig);
                        if (didChange) {
                            overallChanged = true;
                        }
                    } catch {
                        // einzelnes device überspringen
                        console.warn("migrate exception " );
                    }
                }
                if (overallChanged) {
                    // native.device löschen, damit beim nächsten Start nicht nochmal migriert wird
                    delete native.devices;
                    setState({ native, changed: getIsChanged(native) });
                }

                

            }
        } catch (err) {
            // ignore
            console.warn("migrate exception ignored " + err);
        }
    }

    private static removeRoomsWithMissingId(native: any, rooms: RoomsMap): { native: any; removed: number } {
        native = native || {};
        if (!native.rooms || !Array.isArray(native.rooms)) {
            return { native, removed: 0 };
        }

        const availableRooms = rooms || {};
        const originalLength = native.rooms.length;

        native.rooms = native.rooms.filter((r: RoomConfig ) => {
            if (r == null) {
                return false
            };
            const id = (r as any).id;
            if (id === undefined || id === null) {
                return false;
            }
            const idStr = String(id).trim();
            if (idStr === '') {
                return false
            };
            return Object.prototype.hasOwnProperty.call(availableRooms, idStr);
        });

        const removed = Math.max(0, originalLength - native.rooms.length);
        return { native, removed };
    }

    private static migrateSingleDevice(native: any, device: any, rooms: RoomsMap, systemConfig: SystemConfig): boolean {
        const findRes = this.findRoomIdForDevice(device, rooms, systemConfig);
        if (!findRes.matched) {
            return false
        };

        const { roomID, roomName } = findRes;

        this.ensureNativeRoomsArrayExists(native);

        const roomChanged = this.addOrUpdateRoomEntry(native, roomID, roomName);

        let deviceChanged = false;
        try {
            if (device?.type === 1) {
                deviceChanged = this.addThermostatFromDevice(native, device, roomID);
            } else if (device?.type === 2) {
                deviceChanged = this.addActorFromDevice(native, device, roomID);
            } else if (device?.type === 3) {
                deviceChanged = this.addWindowSensorFromDevice(native, device, roomID);
            } else if (device?.type === 4) {
                deviceChanged = this.addAddTempSensorFromDevice(native, device, roomID);
            }
        } catch {
            // ignore individual device errors
            console.warn("migrate exception in migrateSingleDevice ");
        }

        return roomChanged || deviceChanged;
    }

    private static findRoomIdForDevice(device: any, rooms: RoomsMap, systemConfig: SystemConfig): { matched: boolean; roomID: string; roomName: string; curLanguage: string } {
        let roomID = '';
        let roomName = '';
        let matched = false;
        let curLanguage = 'de';

        try {
            const deviceRoomRaw = device?.room;
            const localRooms = rooms || {};
            curLanguage = systemConfig?.common?.language || 'de';

            if (deviceRoomRaw !== undefined && deviceRoomRaw !== null) {
                const deviceRoom = String(deviceRoomRaw).trim().toLowerCase();

                for (const id of Object.keys(localRooms)) {
                    const enumObj = localRooms[id];
                    if (!enumObj || !enumObj.common) {
                        continue;
                    }
                    const commonName = enumObj.common.name;

                    if (typeof commonName === 'string') {
                        roomName = commonName;
                    } else if (commonName && typeof commonName === 'object') {
                        roomName =
                            commonName[curLanguage] ||
                            commonName.de ||
                            Object.values(commonName)[0] ||
                            '';
                    }

                    if (roomName && String(roomName).trim().toLowerCase() === deviceRoom) {
                        matched = true;
                        roomID = id;
                        break;
                    }
                }
            }
        } catch {
            // ignore
        }

        return { matched, roomID, roomName, curLanguage };
    }

    private static ensureNativeRoomsArrayExists(native: any): void {
        if (!native.rooms || !Array.isArray(native.rooms)) {
            native.rooms = [];
        }
    }

    private static addOrUpdateRoomEntry(native: any, roomID: string, roomName: string): boolean {
        try {
            const exists = (native.rooms as any[]).some((r: any) => String(r.id) === String(roomID));
            if (!exists) {
                const newRoomEntry: RoomConfig = {
                    id: roomID,
                    isActive: true,
                    name: roomName,
                    Actors: [],
                    WindowSensors: [],
                    Thermostats: [],
                    AdditionalTemperatureSensors: [],
                } as any;
                native.rooms.push(newRoomEntry);
                return true;
            } else {
                const idx = (native.rooms as any[]).findIndex((r: any) => String(r.id) === String(roomID));
                if (idx !== -1) {
                    const existingRoom = native.rooms[idx];
                    let changed = false;
                    if (!existingRoom.isActive) {
                        existingRoom.isActive = true; changed = true;
                    }
                    if (existingRoom.name !== roomName) {
                        existingRoom.name = roomName; changed = true;
                    }
                    return changed;
                }
            }
        } catch {
            // ignore
        }
        return false;
    }

    private static addThermostatFromDevice(native: any, device: any, roomID: string): boolean {
        try {
            const roomsArray = Array.isArray(native.rooms) ? native.rooms : [];
            const idx = roomsArray.findIndex((r: any) => String(r.id) === String(roomID));
            if (idx === -1) {
                return false;
            }
            const room = roomsArray[idx];
            if (!Array.isArray(room.Thermostats)) {
                room.Thermostats = [];
            }
            const cfg = {
                name: device.name ?? '',
                isActive: !!device.isActive,
                OID_Target: device.OID_Target ?? device.OIDTarget ?? '',
                OID_Current: device.OID_Current ?? device.OIDCurrent ?? '',
                useExtHandling: !!device.useExtHandling,
            };

            const exists = (room.Thermostats as any[]).some((t: any) =>
                (t.OID_Target && cfg.OID_Target && t.OID_Target === cfg.OID_Target) ||
                (t.OID_Current && cfg.OID_Current && t.OID_CURRENT === cfg.OID_Current) ||
                (t.name && cfg.name && t.name === cfg.name)
            );
            if (!exists) {
                room.Thermostats.push(cfg);
                return true;
            }
        } catch {
            // ignore
        }
        return false;
    }

    private static addActorFromDevice(native: any, device: any, roomID: string): boolean {
        try {
            const roomsArray = Array.isArray(native.rooms) ? native.rooms : [];
            const idx = roomsArray.findIndex((r: any) => String(r.id) === String(roomID));
            if (idx === -1) {
                return false;
            }
            const room = roomsArray[idx];
            if (!Array.isArray(room.Actors)) {
                room.Actors = [];
            }

            const cfg = {
                name: device.name ?? '',
                isActive: !!device.isActive,
                OID_Target: device.OID_Target ?? device.OIDTarget ?? '',
                useExtHandling: !!device.useExtHandling,
            };

            const exists = (room.Actors as any[]).some((a: any) =>
                (a.OID_Target && cfg.OID_Target && a.OID_Target === cfg.OID_Target) ||
                (a.name && cfg.name && a.name === cfg.name)
            );
            if (!exists) {
                room.Actors.push(cfg);
                return true;
            }
        } catch {
            // ignore
        }
        return false;
    }

    private static addWindowSensorFromDevice(native: any, device: any, roomID: string): boolean {
        try {
            const roomsArray = Array.isArray(native.rooms) ? native.rooms : [];
            const idx = roomsArray.findIndex((r: any) => String(r.id) === String(roomID));
            if (idx === -1) {
                return false;
            }
            const room = roomsArray[idx];
            if (!Array.isArray(room.WindowSensors)) {
                room.WindowSensors = [];
            }

            //Datatype kann boolean, number oder string sein
            //valueClosed, valueOpen sind strings

            const cfg = {
                name: device.name ?? '',
                isActive: !!device.isActive,
                OID_Current: device.OID_Current ?? device.OIDCurrent ?? '',
                DataType: device.DataType ?? 'boolean',
                valueClosed: device.valueClosed ?? false,
                valueOpen: device.valueOpen ?? true,
            };

            const exists = (room.WindowSensors as any[]).some((s: any) =>
                (s.OID_Current && cfg.OID_Current && s.OID_Current === cfg.OID_Current) ||
                (s.name && cfg.name && s.name === cfg.name)
            );
            if (!exists) {
                room.WindowSensors.push(cfg);
                return true;
            }
        } catch {
            // ignore
        }
        return false;
    }

    private static addAddTempSensorFromDevice(native: any, device: any, roomID: string): boolean {
        try {
            const roomsArray = Array.isArray(native.rooms) ? native.rooms : [];
            const idx = roomsArray.findIndex((r: any) => String(r.id) === String(roomID));
            if (idx === -1) {
                return false;
            }
            const room = roomsArray[idx];
            if (!Array.isArray(room.AdditionalTemperatureSensors)) {
                room.AdditionalTemperatureSensors = [];
            }

            const cfg = {
                name: device.name ?? '',
                isActive: !!device.isActive,
                OID_Current: device.OID_CURRENT ?? device.OID_Current ?? device.OIDCurrent ?? '',
            };

            const exists = (room.AdditionalTemperatureSensors as any[]).some((s: any) =>
                (s.OID_Current && cfg.OID_Current && s.OID_Current === cfg.OID_Current) ||
                (s.name && cfg.name && s.name === cfg.name)
            );
            if (!exists) {
                room.AdditionalTemperatureSensors.push(cfg);
                return true;
            }
        } catch {
            // ignore
        }
        return false;
    }
}