import { DecodedData } from "@/types";

export const convertToCSV = (records: DecodedData[]) => {
    const csvRows = [];
    const headers = ['Year', 'Month', 'Date', 'Start Hour', 'End Hour', 'Excluded Hours', 'Description'];
    csvRows.push(headers.join(','));
    for (const record of records) {
        const row = [
            record.year,
            record.month,
            record.date,
            record.start_hour,
            record.end_hour,
            record.excluded_hours,
            record.description.replace(/"/g, '""') // クォート内のクォートをエスケープ
        ];
        csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
};

export const downloadCSV = (records: DecodedData[]) => {
    const csvData = convertToCSV(records);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'records.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
