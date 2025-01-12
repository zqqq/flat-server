import {
    callback as webCallback,
    callbackSchemaType as webCallbackSchemaType,
} from "./weChat/web/Callback";
import {
    callback as mobileCallback,
    callbackSchemaType as mobileCallbackSchemaType,
} from "./weChat/mobile/Callback";
import {
    callback as githubCallback,
    callbackSchemaType as githubCallbackSchemaType,
} from "./github/Callback";
import { setAuthUUID, setAuthUUIDSchemaType } from "./SetAuthUUID";
import { login, loginSchemaType } from "./Login";
import { FastifyRoutes } from "../../../types/Server";
import { loginProcess, loginProcessSchemaType } from "./Process";

export const loginRouters: Readonly<FastifyRoutes[]> = Object.freeze([
    Object.freeze({
        method: "post",
        path: "login/set-auth-uuid",
        handler: setAuthUUID,
        auth: false,
        schema: setAuthUUIDSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "login/process",
        handler: loginProcess,
        auth: false,
        schema: loginProcessSchemaType,
    }),
    Object.freeze({
        method: "get",
        path: "login/weChat/web/callback",
        handler: webCallback,
        skipAutoHandle: true,
        auth: false,
        schema: webCallbackSchemaType,
    }),
    Object.freeze({
        method: "get",
        path: "login/weChat/mobile/callback",
        handler: mobileCallback,
        auth: false,
        schema: mobileCallbackSchemaType,
    }),
    Object.freeze({
        method: "get",
        path: "login/github/callback",
        handler: githubCallback,
        auth: false,
        schema: githubCallbackSchemaType,
    }),
    Object.freeze({
        method: "post",
        path: "login",
        auth: true,
        handler: login,
        schema: loginSchemaType,
    }),
]);
