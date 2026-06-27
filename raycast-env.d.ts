/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** API Token - Your BetterStack API token */
  "apiToken": string,
  /** Team Id - Your BetterStack team Id. Find it in the URL when viewing your on-call schedule: uptime.betterstack.com/team/t{id}/oncalls */
  "teamId"?: string,
  /** Requester Email - Default e-mail used when creating incidents */
  "requesterEmail"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `on-call-schedule` command */
  export type OnCallSchedule = ExtensionPreferences & {}
  /** Preferences accessible in the `create-incident` command */
  export type CreateIncident = ExtensionPreferences & {}
  /** Preferences accessible in the `incidents` command */
  export type Incidents = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `on-call-schedule` command */
  export type OnCallSchedule = {}
  /** Arguments passed to the `create-incident` command */
  export type CreateIncident = {}
  /** Arguments passed to the `incidents` command */
  export type Incidents = {}
}

