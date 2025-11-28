/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */
//ist das gleiche interface wie in adapter-config.d.ts
export interface RoomConfig {
    isActive: boolean;
    Name: string; //translated names from enum in ioBroker
    id: string, //id from enum in ioBroker
    Actors: ActorConfig[];
    WindowSensors: WindowSensorConfig[];
    Thermostats: ThermostatConfig[];
}

export interface HeatingControlParametersTyped {

    //not used yet
    testParam1: string,
    testParam2: boolean
}


export interface HeatingControlAdapterConfig extends ioBroker.AdapterConfig {
    /** Configuration of the adapter */

    //not used yet
    params: HeatingControlParametersTyped;


    rooms: RoomConfig[];
    roomSelector: string;

    //just temporary to copy from GUI to room config
    isActive: boolean;
    RoomThermostats: ThermostatConfig[];
    RoomWindowSensors: WindowSensorConfig[];
    RoomActors: ActorConfig[];

}

