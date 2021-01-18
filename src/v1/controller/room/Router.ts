import { FastifyRoutes } from "../../types/Server";
import { create, createSchemaType } from "./create";
import { schedule, scheduleSchemaType } from "./schedule";
import { list, listSchemaType } from "./list";
import { userInfo, userInfoSchemaType } from "./info/Users";
import { ordinaryInfo, OrdinaryInfoSchemaType } from "./info/Ordinary";
import { periodicInfo, periodicInfoSchemaType } from "./info/Periodic";
import { started, startedSchemaType } from "./update-status/Started";
import { cancelOrdinary, cancelOrdinarySchemaType } from "./cancel/Ordinary";
import { stopped, stoppedSchemaType } from "./update-status/Stopped";
import { join, joinSchemaType } from "./join";
import { cancelPeriodic, cancelPeriodicSchemaType } from "./cancel/Periodic";
import { periodicSubRoomInfo, periodicSubRoomInfoSchemaType } from "./info/PeriodicSubRoom";
import { paused, pausedSchemaType } from "./update-status/Paused";
import { cancelPeriodicSubRoom, cancelPeriodicSubRoomSchemaType } from "./cancel/PeriodicSubRoom";
import { recordAcquire, recordAcquireSchemaType } from "./record/Acquire";
import { recordStarted, recordStartedSchemaType } from "./record/Started";
import { recordQuery, recordQuerySchemaType } from "./record/Query";
import { recordStopped, recordStoppedSchemaType } from "./record/Stopped";
import { recordUpdateLayout, recordUpdateLayoutSchemaType } from "./record/UpdateLayout";
import { recordInfo, recordInfoSchemaType } from "./record/Info";

export const httpRoom: Readonly<FastifyRoutes[]> = Object.freeze([
    Object.freeze({
        method: "post",
        path: "room/create",
        handler: create,
        auth: true,
        schema: createSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/schedule",
        handler: schedule,
        auth: true,
        schema: scheduleSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/list/:type",
        handler: list,
        auth: true,
        schema: listSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/join",
        handler: join,
        auth: true,
        schema: joinSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/info/ordinary",
        handler: ordinaryInfo,
        auth: true,
        schema: OrdinaryInfoSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/info/periodic",
        handler: periodicInfo,
        auth: true,
        schema: periodicInfoSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/info/periodic-sub-room",
        handler: periodicSubRoomInfo,
        auth: true,
        schema: periodicSubRoomInfoSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/info/users",
        handler: userInfo,
        auth: true,
        schema: userInfoSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/update-status/started",
        handler: started,
        auth: true,
        schema: startedSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/update-status/paused",
        handler: paused,
        auth: true,
        schema: pausedSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/update-status/stopped",
        handler: stopped,
        auth: true,
        schema: stoppedSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/cancel/ordinary",
        handler: cancelOrdinary,
        auth: true,
        schema: cancelOrdinarySchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/cancel/periodic",
        handler: cancelPeriodic,
        auth: true,
        schema: cancelPeriodicSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/cancel/periodic-sub-room",
        handler: cancelPeriodicSubRoom,
        auth: true,
        schema: cancelPeriodicSubRoomSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/record/acquire",
        handler: recordAcquire,
        auth: true,
        schema: recordAcquireSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/record/started",
        handler: recordStarted,
        auth: true,
        schema: recordStartedSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/record/query",
        handler: recordQuery,
        auth: true,
        schema: recordQuerySchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/record/update-layout",
        handler: recordUpdateLayout,
        auth: true,
        schema: recordUpdateLayoutSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/record/stopped",
        handler: recordStopped,
        auth: true,
        schema: recordStoppedSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "room/record/info",
        handler: recordInfo,
        auth: true,
        schema: recordInfoSchemaType,
    }),
]);
