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
const SQLHelper_1 = __importDefault(require("./utils/SQLHelper"));
const mssql_1 = __importDefault(require("mssql"));
function testSQL() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Example 1: simple query
            const employees = yield SQLHelper_1.default.query('SELECT TOP 5 * FROM tblMaterialMaster');
            console.log('Employees:', employees);
            // Example 2: parameterized query
            const employee = yield SQLHelper_1.default.query('SELECT * FROM tblMaterialMaster WHERE MaterialName = @id', { id: { type: mssql_1.default.NVarChar, value: 'Steel Sheet' } });
            console.log('Employee with MaterialName 1:', employee);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            // Close pool when done
            yield SQLHelper_1.default.close();
        }
    });
}
testSQL();
