// src/components/MonthlyRecordsCalendar.tsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Paper, Typography, Box, Button, Grid } from '@mui/material';
import 'react-calendar/dist/Calendar.css';
import './MonthlyRecordsCalendar.css';
import axios from 'axios';
import { getSaturdayBefore, getSaturdayAfter, calculateWorkingHours } from '../utils/dateUtils';
import { FormData, DecodedData } from '../types';
import { downloadCSV } from '../utils/toCsv';

type CalendarProps = {
    records: DecodedData[];
    onRecordsUpdated: () => void;
};

// const calculateWeeklyHours = (formData: FormData[]): Map<string, number> => {
//     const weeklyHours = new Map<string, number>();
//     formData.forEach(record => {
//         const startDate = getSaturdayBefore(record.year, record.month, record.date);
//         const endDate = getSaturdayAfter(record.year, record.month, record.date);
//         const weekKey = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

//         // 時刻情報を含む完全な日付時刻文字列を生成
//         const startDateTimeStr = `${record.year}-${record.month}-${record.date} ${record.start_hour}`;
//         const endDateTimeStr = `${record.year}-${record.month}-${record.date} ${record.end_hour}`;

//         // Date オブジェクトを生成
//         const startDateTime = new Date(startDateTimeStr);
//         const endDateTime = new Date(endDateTimeStr);

//         if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
//             // 正しい Date オブジェクトが生成された場合のみ計算を実行
//             const hours = calculateWorkingHours(record.start_hour, record.end_hour, record.excluded_hours);
//             const [hour, minute] = hours.split(':').map(Number);
//             const totalMinutes = hour * 60 + minute;
//             weeklyHours.set(weekKey, (weeklyHours.get(weekKey) || 0) + totalMinutes);
//         } else {
//             console.error('Invalid date found', record);
//         }
//     });

//     return weeklyHours;
// };


const calculateWeeklyHours = (formData: FormData[]): Map<string, number> => {
    const weeklyHours = new Map<string, number>();
    formData.forEach(record => {
        const startDate = getSaturdayBefore(record.year, record.month, record.date);
        const endDate = getSaturdayAfter(record.year, record.month, record.date);

        // startDateとendDateをフォーマットする
        const format = (date: Date) => `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
        const formattedStartDate = format(startDate);
        const formattedEndDate = format(endDate);

        const weekKey = `${formattedStartDate} - ${formattedEndDate}`;

        // 時刻情報を含む完全な日付時刻文字列を生成
        const startDateTimeStr = `${record.year}-${record.month}-${record.date} ${record.start_hour}`;
        const endDateTimeStr = `${record.year}-${record.month}-${record.date} ${record.end_hour}`;

        // Date オブジェクトを生成
        const startDateTime = new Date(startDateTimeStr);
        const endDateTime = new Date(endDateTimeStr);

        if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
            // 正しい Date オブジェクトが生成された場合のみ計算を実行
            const hours = calculateWorkingHours(record.start_hour, record.end_hour, record.excluded_hours);
            const [hour, minute] = hours.split(':').map(Number);
            const totalMinutes = hour * 60 + minute;
            weeklyHours.set(weekKey, (weeklyHours.get(weekKey) || 0) + totalMinutes);
        } else {
            console.error('Invalid date found', record);
        }
    });

    return weeklyHours;
};



export const MonthlyRecordsCalendar: React.FC<CalendarProps> = ({ records, onRecordsUpdated }) => {

    console.log(records);

    // カレンダーのタイルに表示する内容を定義
    const tileContent = ({ date, view }) => {
        // 月ビューの時のみ記録を表示
        if (view === 'month') {
            const dayRecords = records.filter(record => {
                const recordDate = new Date(record.year, record.month - 1, record.date)
                return date.toDateString() === recordDate.toDateString();
            });

            return (
                dayRecords.length === 0 ? <div style={{ height: '4em' }}></div> :
                    <ul style={{
                        listStyle: 'none', padding: '0', margin: '0', fontSize: '0.75em', width: '100%'
                    }}>
                        {dayRecords.map((record, index) => (
                            <li key={index}>
                                <div>{`${record.start_hour} - ${record.end_hour}`}</div>
                                <div>{`${record.description}`}</div>
                            </li>
                        ))}
                    </ul>
            );
        }
    };

    const deleteRecord = async (recordId: number) => {
        console.log('delete', recordId);
        try {
            const response = await axios.delete(`http://localhost:8080/record/${recordId}`);
            console.log(response.data);
            onRecordsUpdated();
        } catch (error) {
            console.error('レコードの削除に失敗しました', error);
        }
    };


    const [selectedDate, setSelectedDate] = useState<Date | null>(null);




    return (
        <Box sx={{
            display: 'flex', justifyContent: 'center', flexDirection: 'column'
        }}>

            <Grid container
                direction="row"
                justifyContent="center"
            >
                <Paper sx={{
                    p: 2, mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'left',
                    maxHeight: '600px', minWidth: '200px',
                    overflow: 'auto'
                }}>
                    <Typography variant="h6" gutterBottom>
                        レコード一覧
                    </Typography>

                    {records.sort((a, b) => {
                        if (a.year !== b.year) {
                            return a.year - b.year;
                        }
                        // まず月で比較
                        if (a.month !== b.month) {
                            return a.month - b.month;
                        }
                        // 月が同じ場合は日で比較
                        if (a.date !== b.date) {
                            return a.date - b.date;
                        }
                        // 日が同じ場合は開始時刻で比較
                        const aStartHour = parseInt(a.start_hour.split(':')[0], 10);
                        const aStartMinute = parseInt(a.start_hour.split(':')[1], 10);
                        const bStartHour = parseInt(b.start_hour.split(':')[0], 10);
                        const bStartMinute = parseInt(b.start_hour.split(':')[1], 10);

                        if (aStartHour !== bStartHour) {
                            return aStartHour - bStartHour;
                        }
                        return aStartMinute - bStartMinute;
                    }).map((record) => {
                        // 選択された日付とレコードの日付が一致するかをチェック
                        const isSelected = selectedDate &&
                            selectedDate.getFullYear() === record.year &&
                            selectedDate.getMonth() + 1 === record.month &&
                            selectedDate.getDate() === record.date;

                        // isSelectedに基づいてスタイルを変更
                        const recordStyle = isSelected ? { backgroundColor: '#bde0fe' } : {};

                        const displayDate = `${record.month.toString().padStart(2, '0')}/${record.date.toString().padStart(2, '0')}`;
                        const startTime = record.start_hour;
                        const endTime = record.end_hour;
                        const workingHours = calculateWorkingHours(record.start_hour, record.end_hour, record.excluded_hours);

                        return (
                            <div key={record.id} style={recordStyle}>
                                <Button variant="contained" color="error" onClick={() => deleteRecord(record.id)} sx={{
                                    fontSize: '0.75em', minWidth: 'auto', padding: '0 0.5em', height: '2.5em', margin: '0.5em'
                                }}>
                                    削除
                                </Button>
                                {/* {`${record.month}/${record.date}: ${record.start_hour} - ${record.end_hour}:  実働 ${calculateWorkingHours(record.start_hour, record.end_hour, record.excluded_hours)}`} */}
                                {`${displayDate}: ${startTime}-${endTime}: ${workingHours} 時間 `}
                            </div>
                        );
                    })}
                </Paper>

                <Paper sx={{
                    p: 2, mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', maxHeight: '600px', minWidth: '600px',
                }}>
                    <Calendar
                        tileContent={tileContent}
                        onClickDay={(value: Date) => setSelectedDate(value)}
                    />

                </Paper>
                <Paper sx={{
                    p: 2, mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', maxHeight: '600px', minWidth: '200px',
                }}>
                    <Typography variant="h6" gutterBottom>
                        週計
                    </Typography>
                    {
                        Array.from(calculateWeeklyHours(records).entries()).map(([weekKey, minutes], index) => {
                            const hours = Math.floor(minutes / 60);
                            const remainingMinutes = minutes % 60;

                            const formattedTime = `${hours.toString().padStart(2, '0')} h ${remainingMinutes.toString().padStart(2, '0')} m`;

                            return (
                                <Typography key={index} variant="body2" sx={{ fontSize: '0.75em', margin: '0.5em' }}>
                                    {`${weekKey}: 計${formattedTime}`}
                                </Typography>
                            );
                        })
                    }
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        エクスポート
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => downloadCSV(records)}
                        sx={{ m: 1 }}
                    >
                        CSVで書き出し
                    </Button>
                </Paper>
            </Grid>
        </Box>
    );
};

export default MonthlyRecordsCalendar;
