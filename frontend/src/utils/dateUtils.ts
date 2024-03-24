

export const getSaturdayBefore = (year: number, month: number, date: number): Date => {
    const targetDate = new Date(year, month - 1, date);
    const dayOfWeek = targetDate.getDay(); // 0:日曜日, 1:月曜日, ..., 6:土曜日
    const lastDayOfLastMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate();
    const lastSaturday = (dayOfWeek === 6) ? targetDate.getDate() : targetDate.getDate() - dayOfWeek - 1
    if (lastSaturday < 1) { // 月をまたぐ場合
        const diff = lastDayOfLastMonth + lastSaturday;
        if (month === 0) {        // 年をまたぐ場合
            return new Date(targetDate.getFullYear() - 1, 12 - 1, diff);
        }
        else {
            return new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, diff);
        }
    }
    else {
        return new Date(targetDate.getFullYear(), targetDate.getMonth(), lastSaturday);
    }
}

export const getSaturdayAfter = (year: number, month: number, date: number): Date => {
    const targetDate = new Date(year, month - 1, date);
    const dayOfWeek = targetDate.getDay(); // 0:日曜日, 1:月曜日, ..., 6:土曜日
    const daysUntilSaturday = (dayOfWeek === 6) ? 7 : 6 - dayOfWeek;
    const lastDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
    const nextSaturday = targetDate.getDate() + daysUntilSaturday
    if (nextSaturday > lastDayOfMonth) { // 月をまたぐ場合
        const diff = nextSaturday - lastDayOfMonth;
        if (month === 12) {        // 年をまたぐ場合
            return new Date(targetDate.getFullYear() + 1, 0, diff);
        }
        else {
            return new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, diff);
        }
    }
    else {
        return new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + daysUntilSaturday);
    }
}

// 年の選択肢を生成するヘルパー関数
export const generateYearOptions = () => {
    const maxYear = new Date().getFullYear();
    const minYear = maxYear - 10;
    let years = [];
    for (let year = maxYear; year >= minYear; year--) {
        years.push(year);
    }
    return years;
};

// 月の日数を計算する関数
export const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
};

export const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes; // 総分を計算
};

export const calculateWorkingHours = (start: string, end: string, excluded: number): string => {
    const startMinutes = parseTime(start);
    const endMinutes = parseTime(end);
    const diffMinutes = endMinutes - startMinutes - excluded * 60;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = Math.abs(diffMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};




// HH:MM形式の文字列を時間（小数）に変換する関数
export function convertHHMMToHours(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
}
