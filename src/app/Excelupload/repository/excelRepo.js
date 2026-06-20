const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const xlsx = require('xlsx');
const Exceljs = require('exceljs');

// Need Catalog DB Connection
function excelRepo(fastify) {

    async function uploadExcelData({ body }) {
        const file = body?.excelfile;
        if (!file) {
            throw CustomError.create({
                httpCode: StatusCodes.BAD_REQUEST,
                message: 'No file uploaded',
                property: 'excelfile',
                code: 'NO_FILE_UPLOADED'
            });
        }

        const buffer = await file.toBuffer();
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(sheet);
        const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        const headers = rows[0];

        return { headers, data: json };
    }


    async function exportExcel({
        data = [],
        columns = [],
        sheetName = "Sheet1"
    }) {
        if (!columns.length) {
            throw new Error("Columns configuration is required");
        }

        const workbook = new Exceljs.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        // Set columns (header, key, width)
        worksheet.columns = columns.map(col => ({
            header: col.header,
            key: col.key,
            width: col.width || 30
        }));

        // Style Header Row (Row 1)
        const headerRow = worksheet.getRow(1);

        headerRow.eachCell(cell => {
            cell.font = {
                bold: true,
                color: { argb: "00000000" } // white text
            };

            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb:  "FFD9E1F2" } // blue background
            };

            cell.alignment = {
                vertical: "middle",
                horizontal: "center"
            };

            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });

        // Add rows with formatting
        data.forEach(item => {
            const row = {};

            columns.forEach(col => {
                let value = item?.[col.key];

                // Default fallback
                if (value === undefined || value === null) {
                    value = col.default || "";
                }

                // Custom formatter (important )
                if (col.formatter && typeof col.formatter === "function") {
                    value = col.formatter(value, item);
                }

                row[col.key] = value;
            });

            worksheet.addRow(row);
        });

        // Auto column width (optional override)
        worksheet.columns.forEach(col => {
            let maxLength = col.header.length;

            col.eachCell({ includeEmpty: true }, cell => {
                const val = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, val.length);
            });

            col.width = Math.min(maxLength + 2, 40);
        });

        return workbook;
    }

    return {
        uploadExcelData,
        exportExcel
    };
}

module.exports = excelRepo;
