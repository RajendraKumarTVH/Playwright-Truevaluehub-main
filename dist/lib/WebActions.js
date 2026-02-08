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
exports.WebActions = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const exceljs_1 = require("exceljs");
class WebActions {
    constructor(page, context) {
        this.page = page;
        this.context = context;
    }
    delay(time) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(function (resolve) {
                setTimeout(resolve, time);
            });
        });
    }
    clickByText(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.getByText(text, { exact: true }).click(); //Matches locator with exact text and clicks
        });
    }
    clickElementJS(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.$eval(locator, (element) => element.click());
        });
    }
    readDataFromExcel(fileName, sheetName, rowNum, cellNum) {
        return __awaiter(this, void 0, void 0, function* () {
            const workbook = new exceljs_1.Workbook();
            return workbook.xlsx.readFile(`./Downloads/${fileName}`).then(function () {
                const sheet = workbook.getWorksheet(sheetName);
                if (!sheet) {
                    throw new Error(`Sheet "${sheetName}" not found in file "${fileName}".`);
                }
                return sheet.getRow(rowNum).getCell(cellNum).toString();
            });
        });
    }
    readValuesFromTextFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return node_fs_1.default.readFileSync(`${filePath}`, `utf-8`);
        });
    }
    writeDataIntoTextFile(filePath, data) {
        return __awaiter(this, void 0, void 0, function* () {
            node_fs_1.default.writeFile(filePath, data, error => {
                if (error)
                    throw error;
            });
        });
    }
    getPdfPageText(pdf, pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield pdf.getPage(pageNo);
            const tokenizedText = yield page.getTextContent();
            const pageText = tokenizedText.items.map((token) => token.str).join('');
            return pageText;
        });
    }
}
exports.WebActions = WebActions;
