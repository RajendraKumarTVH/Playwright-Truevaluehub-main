"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDotNetConnectionString = parseDotNetConnectionString;
function parseDotNetConnectionString(conn) {
    const parts = conn.split(';').filter(Boolean);
    const map = {};
    for (const part of parts) {
        const [key, value] = part.split('=');
        map[key.trim().toLowerCase()] = value === null || value === void 0 ? void 0 : value.trim();
    }
    return {
        server: map['data source'],
        database: map['initial catalog'],
        user: map['uid'],
        password: map['password']
    };
}
