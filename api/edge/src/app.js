"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// src/app.ts
var express_1 = require("express");
var routes_1 = require("../build-tsoa/routes");
exports.app = (0, express_1.default)();
// Use body parser to read sent json payloads
exports.app.use((0, express_1.urlencoded)({
    extended: true,
}));
exports.app.use((0, express_1.json)());
(0, routes_1.RegisterRoutes)(exports.app);
