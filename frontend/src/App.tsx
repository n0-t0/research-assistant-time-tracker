// src/App.tsx
import React, { useState, useEffect } from 'react';
import { RecordForm } from './components/RecordForm';
import { MonthlyRecordsCalendar } from './components/MonthlyRecordsCalendar';
import axios from 'axios';
import { DecodedData, FetchData } from './types';
import { transformBackToFormData } from './utils/transformData';

function App() {
    const [records, setRecords] = useState<DecodedData[]>([]);

    // レコードの取得と更新
    const fetchRecordsAndUpdate = async () => {
        try {
            const response = await axios.get('http://localhost:8080/records');
            const decodedData: DecodedData[] = response.data.map((record: FetchData) =>transformBackToFormData(record));
            setRecords(decodedData);
            decodedData.forEach((record) => console.log(record));
        } catch (error) {
            console.error('レコードの取得に失敗しました', error);
        }
    };

    // 初回とレコード追加後のデータ取得
    useEffect(() => {
        fetchRecordsAndUpdate();
    }, []);

    return (
        <div>
            <h1 style={{ textAlign: 'center' }}>RA勤務記録</h1>
            <RecordForm onRecordsUpdated={fetchRecordsAndUpdate} />
            <MonthlyRecordsCalendar records={records} onRecordsUpdated={fetchRecordsAndUpdate} />
        </div>
    );
}

export default App;
