"use strict";

/*
 * The answer of the message "help": what the instance answers, written for AI agents (e.g. ioBroker.pi-agent,
 * or the MCP server with send_to) and script authors. Keep it in sync with the message handler in main.js and the
 * README.
 */

/** Every command the message handler in main.js answers; write = the command changes something */
const COMMANDS = [
    { command: "help", write: false },
    { command: "saveProfile", write: false },
    { command: "loadProfile", write: true },
    { command: "deleteUnusedDP", write: true },
    { command: "listThermostats", write: false },
    { command: "listActors", write: false },
    { command: "listSensors", write: false },
    { command: "listAddTempSensors", write: false },
    { command: "getTelegramUser", write: false },
    { command: "send", write: false },
];

const HELP = `ioBroker.heatingcontrol: controls the heating room by room. The target temperature of a room comes from time
profiles (periods with a start time and a temperature) and from modes (absent, party, guests, vacation, holiday,
fireplace, open window, override); the adapter writes it into the thermostats and switches actors. An agent can
read and change the profiles, switch the modes, set a temporary temperature in a room and export or import all
profiles.

Commands (sendTo heatingcontrol.0):
- saveProfile {}: exports the profiles of all active rooms (reads only): {ProfileType, NumberOfProfiles,
  NumberOfPeriods, TemperatureDecrease, Rooms: {<room>: {profiles: {<1..n>: {<days>: {<1..periods>: {time:
  "hh:mm", Temperature}}, decrease?: {GuestIncrease, PartyDecrease, WindowOpenDecrease, AbsentDecrease,
  VacationAbsentDecrease, FireplaceModeDecrease}}}}}}. <days>: Mo_Su (ProfileType 1), Mo_Fr and Sa_Su (2) or
  Mon, Tue, Wed, Thu, Fri, Sat, Sun (3). No answer on an error.
- loadProfile <the object of saveProfile, or the same as JSON text>: overwrites all profiles of all active rooms
  (periods and decreases) and recalculates the targets. ProfileType, NumberOfProfiles, NumberOfPeriods and
  TemperatureDecrease must equal the settings, and every active room must be in it. Answer: a text; exactly
  "successfully loaded" = loaded; more text after it (e.g. " Profile type 2 not equal to 3") = nothing loaded;
  "exception in LoadProfile ..." = an error, possibly loaded in part.
- deleteUnusedDP: deletes the states of the profiles and periods the settings no longer use; answer: a text.
- listThermostats, listActors, listSensors, listAddTempSensors {room, gewerk}, getTelegramUser {telegraminstance},
  send (no function): for the settings, not for agents.

States (heatingcontrol.0.*), write them with ack false (the adapter confirms them):
- CurrentProfile: the number of the active profile (1 to NumberOfProfiles); Profiles.<p>.ProfileName: its name.
- Present, PartyNow, GuestsPresent, VacationAbsent, HolidayPresent, PublicHolidyToday, FireplaceModeActive,
  MaintenanceActive, HeatingPeriodActive: true / false switch the modes. A mode linked to another state in the
  settings (e.g. presence) follows that state.
- Rooms.<room>.TemperaturOverride (°C) together with Rooms.<room>.TemperaturOverrideTime ("hh:mm", the duration,
  must not be 00:00): a temporary target; TemperaturOverrideRemainingTime (minutes) counts down.
  Rooms.<room>.CurrentTarget, State, WindowIsOpen, CurrentTimePeriodFull, StatusLog: the current target and why.
- Profiles.<p>.<room>.<days>.Periods.<n>.time ("hh:mm", the start of the period) and .Temperature (°C); <days>:
  Mo-Su, Mo-Fr and Sa-Su, or Mon ... Sun, as set in the settings. Profiles.<p>.<room>.relative.* (change in K) or
  .absolute.* (target in °C): GuestIncrease, PartyDecrease, WindowOpenDecrease, AbsentDecrease,
  VacationAbsentDecrease, FireplaceModeDecrease.
<room> = the name of the room as in the settings, e.g. heatingcontrol.0.Rooms.Wohnzimmer.TemperaturOverride.

How to talk to the user:
- Name rooms by their names, temperatures in °C, times in local time; read CurrentProfile and the room states first.
- Profiles, modes and overrides change the heating: only on the user's request; say what changes.
- loadProfile overwrites all profiles and deleteUnusedDP deletes states: only on the user's explicit request and
  after confirmation; export with saveProfile before loadProfile, so the old profiles can be restored.`;

module.exports = {
    COMMANDS,
    HELP,
};
