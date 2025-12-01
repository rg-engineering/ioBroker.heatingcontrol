/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */
//ist das gleiche interface wie in adapter-config.d.ts
export interface RoomConfig {
    isActive: boolean;
    Name: string; //translated names from enum in ioBroker
    id: string, //id from enum in ioBroker
    Actors: ActorConfig[];
    WindowSensors: SensorConfig[];
    Thermostats: ThermostatConfig[];
    RoomAdditionalSensors: SensorConfig[];
}


export interface powerInterruptions {
    active: boolean,
    Start: string,
    End: string
}
export interface HeatingControlAdapterConfig extends ioBroker.AdapterConfig {
    /** Configuration of the adapter */


    //main settings
    timezone: string;

    Path2PresentDP: string;
    Path2PresentDPType: number;
    Path2VacationDP: string;
    Path2GuestsPresentDP: string;
    Path2GuestsPresentDPType: number;
    Path2GuestsPresentDPLimit: number;
    Path2PartyNowDP: string;
    Path2PartyNowDPType: number;
    Path2PartyNowDPLimit: number;

    UseChangesFromThermostat: number;
    ExtendOverride: boolean;
    OverrideMode: number;
    ThermostatHandlesWindowOpen: boolean;
    InterThermostatDelay: number;

    UseAddTempSensors: boolean;
    AddTempSensorsTempLimit: number;
    AddTempSensorsMaxTimeDiff: number;
    AddTempSensorsUseEveryOffsetChange: boolean;

    UseSensors: boolean;
    SensorOpenDelay: number;
    SensorCloseDelay: number;

    UseActors: boolean;
    ActorBeforeOnDelay: number;
    ActorBeforeOffDelay: number;
    InterActorDelay: number;
    regulatorType: number;
    ExtHandlingRepTime: number;
    ExtHandlingActorAckWaitTime: number;
    UseActorsIfNotHeating: number;
    UseActorsIfNoThermostat: number;

    UseVisFromPittini: boolean;
    VisUseSimple: boolean;
    PittiniPathImageWindowOpen: string;
    PittiniPathImageWindowClosed: string;
    VisMinProfilTemp: number;
    VisMaxProfilTemp: number;
    VisStepWidthProfilTemp: number;
    VisMinDecRelTemp: number;
    VisMaxDecRelTemp: number;
    VisStepWidthDecRelTemp: number;
    VisMinDecAbsTemp: number;
    VisMaxDecAbsTemp: number;
    VisStepWidthDecAbsTemp: number;
    VisMinOverrideTemp: number;
    VisMaxOverrideTemp: number;
    VisStepWidthOverrideTemp: number;

    extendedInfoLogTemperature: boolean;
    extendedInfoLogActor: boolean;
    extendedInfoLogWindow: boolean;

    notificationEnabled: boolean;
    notificationsType: number;
    notificationsTemperature: boolean;
    notificationsActor: boolean;
    notificationsWindow: boolean;

    telegramInstance: string;
    telegramUser: string;
    telegramWaitToSend: number;
    telegramSilentNotice: boolean;

    whatsappWaitToSend: number;

    signalInstance: string;
    signalWaitToSend: number;

    pushoverInstance: string;
    pushoverWaitToSend: number;
    pushoverDeviceID: string;
    pushoverSilentNotice: boolean;

    emailReceiver: string;
    emailSender: string;
    emailInstance: string;
    emailWaitToSend: number;

    discordInstance: string;
    discordTarget: number;
    discordUserTag: string;
    discordUserId: string;
    discordServerId: string;
    discordChannelId: string;
    discordWaitToSend: number;

    useCustumizedNotifications: boolean;
    useCustumizedNotificationsWithInstanceName: boolean;
    useCustumizedNotificationsNewTargetTemp: string;
    useCustumizedNotificationsActorOn: string;
    useCustumizedNotificationsActorOff: string;
    useCustumizedNotificationsWindowOpen: string;
    useCustumizedNotificationsWindowClosed: string;

    MaintenanceModeTemperature: number;
    enableCSVLogging: boolean;

    //pofile settings
    ProfileType: number;
    NumberOfProfiles: number;
    NumberOfPeriods: number;
    TemperatureDecrease: number;
    PublicHolidayLikeSunday: boolean;
    HolidayPresentLikeSunday: boolean;
    UseMinTempPerRoom: boolean;
    UseFireplaceMode: boolean;
    UseFireplaceModeResetAt: Date;
    UseFixHeatingPeriod: boolean;
    FixHeatingPeriodStart: string;
    FixHeatingPeriodEnd: string;
    ThermostatModeIfNoHeatingperiod: number;
    FixTempIfNoHeatingPeriod: number;
    PowerInterruptions: powerInterruptions[];


    //room settings
    rooms: RoomConfig[];
    roomSelector: string;

    //just temporary to copy from GUI to room config
    isActive: boolean;
    RoomThermostats: ThermostatConfig[];
    RoomWindowSensors: SensorConfig[];
    RoomActors: ActorConfig[];
    RoomAdditionalSensors: SensorConfig[];

}

