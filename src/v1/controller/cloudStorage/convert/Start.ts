import { AxiosResponse } from "axios";
import { Status } from "../../../../constants/Project";
import { ErrorCode } from "../../../../ErrorCode";
import { createWhiteboardTaskToken } from "../../../../utils/NetlessToken";
import { CloudStorageFilesDAO, CloudStorageUserFilesDAO } from "../../../../dao";
import { Controller, FastifySchema } from "../../../../types/Server";
import {
    TaskCreated,
    whiteboardCreateConversionTask,
} from "../../../utils/request/whiteboard/WhiteboardRequest";
import { FileConvertStep } from "../../../../model/cloudStorage/Constants";
import { determineType, isConverting, isConvertDone, isConvertFailed } from "./Utils";
import { parseError } from "../../../../Logger";

export const fileConvertStart: Controller<
    FileConvertStartRequest,
    FileConvertStartResponse
> = async ({ req, logger }) => {
    const { fileUUID } = req.body;
    const { userUUID } = req.user;

    try {
        const userFileInfo = await CloudStorageUserFilesDAO().findOne(["id"], {
            file_uuid: fileUUID,
            user_uuid: userUUID,
        });

        if (userFileInfo === undefined) {
            return {
                status: Status.Failed,
                code: ErrorCode.FileNotFound,
            };
        }

        const fileInfo = await CloudStorageFilesDAO().findOne(["file_url", "convert_step"], {
            file_uuid: fileUUID,
        });

        if (fileInfo === undefined) {
            return {
                status: Status.Failed,
                code: ErrorCode.FileNotFound,
            };
        }

        const { file_url: resource, convert_step } = fileInfo;

        if (isConverting(convert_step)) {
            return {
                status: Status.Failed,
                code: ErrorCode.FileConvertFailed,
            };
        }

        if (isConvertDone(convert_step)) {
            return {
                status: Status.Failed,
                code: ErrorCode.FileIsConverted,
            };
        }

        if (isConvertFailed(convert_step)) {
            return {
                status: Status.Failed,
                code: ErrorCode.FileConvertFailed,
            };
        }

        const fileType = determineType(resource);
        let result: AxiosResponse<TaskCreated>;
        if (fileType === "dynamic") {
            result = await whiteboardCreateConversionTask({
                resource,
                type: fileType,
                preview: true,
            });
        } else {
            result = await whiteboardCreateConversionTask({
                resource,
                type: fileType,
                pack: true,
            });
        }

        const taskUUID = result.data.uuid;
        const taskToken = createWhiteboardTaskToken(taskUUID);
        await CloudStorageFilesDAO().update(
            {
                task_uuid: taskUUID,
                task_token: taskToken,
                convert_step: FileConvertStep.Converting,
            },
            {
                file_uuid: fileUUID,
            },
        );

        return {
            status: Status.Success,
            data: {
                taskUUID,
                taskToken,
            },
        };
    } catch (err) {
        logger.error("request failed", parseError(err));
        return {
            status: Status.Failed,
            code: ErrorCode.CurrentProcessFailed,
        };
    }
};

interface FileConvertStartRequest {
    body: {
        fileUUID: string;
    };
}

export const fileConvertStartSchemaType: FastifySchema<FileConvertStartRequest> = {
    body: {
        type: "object",
        required: ["fileUUID"],
        properties: {
            fileUUID: {
                type: "string",
                format: "uuid-v4",
            },
        },
    },
};

interface FileConvertStartResponse {
    taskUUID: string;
    taskToken: string;
}
