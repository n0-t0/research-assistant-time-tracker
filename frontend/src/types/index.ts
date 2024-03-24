export type FormData = {
    year: number;
    month: number;
    date: number;
    start_hour: string;
    end_hour: string;
    excluded_hours: number;
    description: string;
};

export type SubmitData = {
    start_time: string;
    end_time: string;
    excluded_hours: number;
    description: string;
}

export type FetchData = {
    id: number;
    start_time: string;
    end_time: string;
    excluded_hours: number;
    description: string;
}

export type DecodedData = {
    id: number;
    year: number;
    month: number;
    date: number;
    start_hour: string;
    end_hour: string;
    excluded_hours: number;
    description: string;
}
