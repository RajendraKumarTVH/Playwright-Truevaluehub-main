"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const msnodesqlv8_1 = __importDefault(require("mssql/msnodesqlv8"));
const connectionString = 'server=.;Database=jason;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}';
const query = 'SELECT TOP 10 * FROM MaterialMaster';
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield msnodesqlv8_1.default.connect(connectionString);
            const result = yield pool.request().query(query);
            console.log(result.recordset);
            yield pool.close();
        }
        catch (err) {
            console.error('Database connection error:', err);
        }
    });
}
testConnection();
