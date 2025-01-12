import { PeriodicStatus, RoomStatus, RoomType, Week } from "../../../../model/room/Constants";
import { Periodic } from "../Types";
import { Status } from "../../../../constants/Project";
import { Controller, FastifySchema } from "../../../../types/Server";
import { v4 } from "uuid";
import { differenceInCalendarDays, toDate } from "date-fns/fp";
import { getConnection } from "typeorm";
import cryptoRandomString from "crypto-random-string";
import { whiteboardCreateRoom } from "../../../utils/request/whiteboard/WhiteboardRequest";
import { ErrorCode } from "../../../../ErrorCode";
import {
    RoomDAO,
    RoomPeriodicConfigDAO,
    RoomPeriodicDAO,
    RoomPeriodicUserDAO,
    RoomUserDAO,
} from "../../../../dao";
import { calculatePeriodicDates } from "../utils/Periodic";
import { checkBeginAndEndTime } from "../utils/CheckTime";
import { parseError } from "../../../../Logger";

export const createPeriodic: Controller<CreatePeriodicRequest, CreatePeriodicResponse> = async ({
    req,
    logger,
}) => {
    const { title, type, beginTime, endTime, periodic } = req.body;
    const { userUUID } = req.user;

    if (!checkBeginAndEndTime(beginTime, endTime)) {
        return {
            status: Status.Failed,
            code: ErrorCode.ParamsCheckFailed,
        };
    }

    // check periodic.endTime
    {
        if (periodic.endTime) {
            // beginTime(day) > periodic.endTime(day)
            if (differenceInCalendarDays(beginTime)(periodic.endTime) < 0) {
                return {
                    status: Status.Failed,
                    code: ErrorCode.ParamsCheckFailed,
                };
            }
        }
    }

    try {
        const dates = calculatePeriodicDates(beginTime, endTime, periodic);

        const periodicUUID = v4();

        const roomData = dates.map(({ start, end }) => {
            return {
                periodic_uuid: periodicUUID,
                fake_room_uuid: v4(),
                room_status: RoomStatus.Idle,
                begin_time: start,
                end_time: end,
            };
        });

        await getConnection().transaction(async t => {
            const commands: Promise<unknown>[] = [];

            commands.push(RoomPeriodicDAO(t).insert(roomData));

            commands.push(
                RoomPeriodicConfigDAO(t).insert({
                    owner_uuid: userUUID,
                    periodic_status: PeriodicStatus.Idle,
                    title,
                    room_origin_begin_time: toDate(beginTime),
                    room_origin_end_time: toDate(endTime),
                    weeks: periodic.weeks.join(","),
                    rate: periodic.rate || 0,
                    end_time: periodic.endTime
                        ? toDate(periodic.endTime)
                        : dates[dates.length - 1].start,
                    room_type: type,
                    periodic_uuid: periodicUUID,
                }),
            );

            commands.push(
                RoomPeriodicUserDAO(t).insert({
                    periodic_uuid: periodicUUID,
                    user_uuid: userUUID,
                }),
            );

            // take the first lesson of the periodic room
            {
                commands.push(
                    RoomDAO(t).insert({
                        periodic_uuid: periodicUUID,
                        owner_uuid: userUUID,
                        title,
                        room_type: type,
                        room_status: RoomStatus.Idle,
                        room_uuid: roomData[0].fake_room_uuid,
                        whiteboard_room_uuid: await whiteboardCreateRoom(),
                        begin_time: roomData[0].begin_time,
                        end_time: roomData[0].end_time,
                    }),
                );

                commands.push(
                    RoomUserDAO(t).insert({
                        room_uuid: roomData[0].fake_room_uuid,
                        user_uuid: userUUID,
                        rtc_uid: cryptoRandomString({ length: 6, type: "numeric" }),
                    }),
                );
            }

            await Promise.all(commands);
        });

        return {
            status: Status.Success,
            data: {},
        };
    } catch (err) {
        logger.error("request failed", parseError(err));
        return {
            status: Status.Failed,
            code: ErrorCode.CurrentProcessFailed,
        };
    }
};

interface CreatePeriodicRequest {
    body: {
        title: string;
        type: RoomType;
        beginTime: number;
        endTime: number;
        periodic: Periodic;
    };
}

export const createPeriodicSchemaType: FastifySchema<CreatePeriodicRequest> = {
    body: {
        type: "object",
        required: ["title", "type", "beginTime", "endTime", "periodic"],
        properties: {
            title: {
                type: "string",
                maxLength: 50,
            },
            type: {
                type: "string",
                eq: [RoomType.OneToOne, RoomType.SmallClass, RoomType.BigClass],
            },
            beginTime: {
                type: "integer",
                format: "unix-timestamp",
            },
            endTime: {
                type: "integer",
                format: "unix-timestamp",
            },
            periodic: {
                type: "object",
                required: ["weeks"],
                properties: {
                    weeks: {
                        type: "array",
                        uniqueItems: true,
                        items: {
                            type: "integer",
                            enum: [
                                Week.Monday,
                                Week.Tuesday,
                                Week.Wednesday,
                                Week.Thursday,
                                Week.Friday,
                                Week.Saturday,
                                Week.Sunday,
                            ],
                        },
                        maxItems: 7,
                        minItems: 1,
                    },
                    rate: {
                        type: "integer",
                        maximum: 50,
                        minimum: 1,
                        nullable: true,
                    },
                    endTime: {
                        type: "integer",
                        format: "unix-timestamp",
                        nullable: true,
                    },
                },
                oneOf: [
                    {
                        required: ["endTime"],
                    },
                    {
                        required: ["rate"],
                    },
                ],
            },
        },
    },
};

interface CreatePeriodicResponse {}
