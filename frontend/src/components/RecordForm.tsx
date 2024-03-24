// src/components/RecordForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { TextField, Button, Box, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { FormData } from '../types';
import { calculateWorkingHours, convertHHMMToHours } from '../utils/dateUtils';
import { generateYearOptions, getDaysInMonth } from '../utils/dateUtils';
import { transformDataForSubmission } from '../utils/transformData';

type FormProps = {
    onRecordsUpdated: () => void;
};

export const RecordForm: React.FC<FormProps> = ({ onRecordsUpdated }) => {

    const { register, handleSubmit, watch } = useForm<FormData>();

    // 月の日数を状態として管理
    const [daysInMonth, setDaysInMonth] = useState<number[]>([]);
    const watchYear = watch('year');
    const watchMonth = watch('month');
    useEffect(() => {
        if (watchYear && watchMonth) {
            const days = Array.from({ length: getDaysInMonth(watchYear, watchMonth) }, (_, i) => i + 1);
            setDaysInMonth(days);
        }
    }, [watchYear, watchMonth]);


    // 稼働時間の計算と状態の更新
    const [operatingHours, setOperatingHours] = useState<string | null>(null);
    const watchStartTime = watch('start_hour');
    const watchEndTime = watch('end_hour');
    const watchExcludedHours = watch('excluded_hours');
    useEffect(() => {
        if (watchStartTime && watchEndTime && watchExcludedHours) {
            setOperatingHours(calculateWorkingHours(watchStartTime, watchEndTime, watchExcludedHours));
        }
    }, [watchStartTime, watchEndTime, watchExcludedHours]);


    // フォームの送信処理
    // const onSubmit = async (formData: FormData) => {
    //     const dataToSubmit = transformDataForSubmission(formData);
    //     console.log("submit", dataToSubmit);
    //     try {
    //         const response = await axios.post('http://localhost:5000/record', dataToSubmit);
    //         console.log(response.data);
    //         onRecordsUpdated();
    //     } catch (error) {
    //         console.error('記録の送信に失敗しました', error);
    //         alert('記録の送信に失敗しました');
    //     }
    // };

    // onSubmit関数内での検証ロジック
    const onSubmit = async (formData: FormData) => {
        const dataToSubmit = transformDataForSubmission(formData);

        // 日付の作成
        const date = new Date(`${formData.year}-${formData.month}-${formData.date}`);
        const dayOfWeek = date.getDay(); // 0:日曜日, 1:月曜日, ..., 6:土曜日

        // 時刻の変換
        const [startHour, startMinute] = formData.start_hour.split(':').map(Number);
        const [endHour, endMinute] = formData.end_hour.split(':').map(Number);

        // 勤務時間の計算
        let workingTimeStr = calculateWorkingHours(formData.start_hour, formData.end_hour, formData.excluded_hours);
        let workingHours = convertHHMMToHours(workingTimeStr);

        // 深夜時間帯の判定
        if ((startHour >= 22 || startHour < 5) || (endHour >= 22 || endHour < 5)) {
            alert('深夜時間帯（22:00〜05:00）の勤務は登録できません。');
            return;
        }

        // 日曜日の判定
        if (dayOfWeek === 0) {
            alert('日曜日の勤務は登録できません。');
            return;
        }

        // 1日の勤務時間が8時間を超えるかの判定
        if (workingHours > 8) {
            alert('1日の勤務時間は8時間以内にしてください。');
            return;
        }

        // 除外時間の検証
        const excludedHours = formData.excluded_hours;
        if (workingHours > 6 && excludedHours < 0.75) { // 45分は0.75時間に相当
            alert('1日6時間以上勤務する場合、45分以上の除外時間を取る必要があります。');
            return;
        }

        // 送信処理（上記の検証をパスした場合）
        try {
            const response = await axios.post('http://localhost:8080/record', dataToSubmit);
            console.log(response.data);
            onRecordsUpdated();
        } catch (error) {
            console.error('記録の送信に失敗しました', error);
            alert('記録の送信に失敗しました');
        }
    };


    // 月の選択肢
    const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <Box
            component="form"
            sx={{
                margin: 2,
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
            }}
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
        >


            <Grid container justifyContent="center">

                {/* 年の選択 */}
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="year-select-label">年</InputLabel>
                    <Select
                        labelId="year-select-label"
                        id="year-select"
                        {...register('year')}
                        label="年"
                        defaultValue={new Date().getFullYear()}
                    >
                        {generateYearOptions().map(year => (
                            <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* 月の選択 */}
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="month-select-label">月</InputLabel>
                    <Select
                        labelId="month-select-label"
                        id="month-select"
                        {...register('month')}
                        label="月"
                        defaultValue={new Date().getMonth() + 1}
                    >
                        {monthOptions.map(month => (
                            <MenuItem key={month} value={month}>{month}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* 日の選択 */}
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="day-select-label">日</InputLabel>
                    <Select
                        labelId="day-select-label"
                        id="day-select"
                        {...register('date')}
                        label="日"
                        defaultValue={new Date().getDate()}
                    >
                        {daysInMonth.map(day => (
                            <MenuItem key={day} value={day}>{day}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* 時刻の入力フィールド */}
                <TextField
                    sx={{ m: 1, minWidth: 120 }}
                    id="start_hour"
                    label="開始"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    {...register('start_hour')}
                    required
                />
                <TextField
                    sx={{ m: 1, minWidth: 120 }}
                    id="end_hour"
                    label="終了"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    {...register('end_hour')}
                    required
                />

                <TextField
                    sx={{ m: 1, minWidth: 120 }}
                    id="excluded_hours"
                    label="除外時間数"
                    type="number"
                    {...register('excluded_hours')}
                    required
                />

                <TextField
                    sx={{ m: 1, minWidth: 120 }}
                    id="description"
                    label="作業内容"
                    multiline
                    rows={1}
                    {...register('description')}
                    required
                />


                <Grid container justifyContent="center" sx={{ mt: 2 }}>
                    <TextField
                        id="operatingHours"
                        type="text"
                        label="稼働時間"
                        sx={{ m: 1, minWidth: 120 }}
                        value={operatingHours !== null ? operatingHours : ''}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <Button type="submit" variant="contained" color="primary" sx={{ m: 1 }}>
                        記録を追加
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};
