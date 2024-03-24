import { FetchData, FormData, SubmitData, DecodedData } from '../types';

export const transformBackToFormData = (data: FetchData): DecodedData => {
    const id = data.id;
    const startDateTime = new Date(data.start_time);
    const endDateTime = new Date(data.end_time);
    const year = startDateTime.getFullYear();
    const month = startDateTime.getMonth() + 1; // JavaScriptのDateオブジェクトは月を0から数えるため
    const date = startDateTime.getDate();
    const start_hour = `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`;
    const end_hour = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;
    const excluded_hours = data.excluded_hours;
    const description = data.description;

    return {
        id,
        year,
        month,
        date,
        start_hour,
        end_hour,
        excluded_hours,
        description
    };
};


export const transformDataForSubmission = (data: FormData): SubmitData => {
    const { year, month, date, start_hour, end_hour, excluded_hours, description } = data;
    const start_time = (new Date(year, month - 1, date + 1)).toISOString().split('T')[0] + 'T' + start_hour + ':00';
    const end_time = (new Date(year, month - 1, date + 1)).toISOString().split('T')[0] + 'T' + end_hour + ':00';

    return {
        start_time,
        end_time,
        excluded_hours,
        description
    };
};
