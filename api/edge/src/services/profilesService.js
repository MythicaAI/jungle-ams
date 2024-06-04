"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesService = void 0;
var ProfilesService = /** @class */ (function () {
    function ProfilesService() {
    }
    ProfilesService.prototype.get = function (id, name) {
        return {
            id: id,
            email: "jane@doe.com",
            name: name !== null && name !== void 0 ? name : "Jane Doe",
            status: "Happy",
            phoneNumbers: [],
        };
    };
    ProfilesService.prototype.create = function (params) {
        return __assign({ id: "" }, params);
    };
    return ProfilesService;
}());
exports.ProfilesService = ProfilesService;
