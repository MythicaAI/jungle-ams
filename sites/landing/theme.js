"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
// theme.ts
var styles_1 = require("@mui/joy/styles");
exports.theme = (0, styles_1.extendTheme)({
    colorSchemes: {
        dark: {
            palette: {
                primary: {
                    solidBg: '#00f0ff',
                    solidHoverBg: '#00c0cc',
                },
                background: {
                    surface: '#111',
                    body: '#0a0a0a',
                },
            },
        },
    },
});
