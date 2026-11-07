import moment from 'moment';

export const timestampInMilliseconds = ( value: number | string | null | undefined ): number | null => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }

    const numericTimestamp = Number(value);
    if (Number.isFinite(numericTimestamp)) {
        return numericTimestamp;
    }

    const parsedTimestamp = Date.parse(value);
    return Number.isNaN(parsedTimestamp) ? null : parsedTimestamp;
};


// festività nazionali italiane dell'anno in formato YYYY-MM-DD; stesso calcolo di getItalianHolidays
// nel Core (Pasqua con l'algoritmo di Meeus/Jones/Butcher)
export const italianHolidays = (year: number): string[] => {

    let a: number = year % 19;
    let b: number = Math.floor(year / 100);
    let c: number = year % 100;
    let d: number = Math.floor(b / 4);
    let e: number = b % 4;
    let f: number = Math.floor((b + 8) / 25);
    let g: number = Math.floor((b - f + 1) / 3);
    let h: number = (19 * a + b - d - g + 15) % 30;
    let i: number = Math.floor(c / 4);
    let k: number = c % 4;
    let l: number = (32 + 2 * e + 2 * i - h - k) % 7;
    let m: number = Math.floor((a + 11 * h + 22 * l) / 451);
    let easterMonth: number = Math.floor((h + l - 7 * m + 114) / 31);
    let easterDay: number = ((h + l - 7 * m + 114) % 31) + 1;

    // in moment i mesi partono da 0
    let easter = moment({year: year, month: easterMonth - 1, date: easterDay});

    let holidays: string[] = [
        `${year}-01-01`,                                        // Capodanno
        `${year}-01-06`,                                        // Epifania
        easter.format('YYYY-MM-DD'),                            // Pasqua
        easter.clone().add(1, 'day').format('YYYY-MM-DD'),      // Lunedì dell'Angelo
        `${year}-04-25`,                                        // Liberazione
        `${year}-05-01`,                                        // Lavoro
        `${year}-06-02`,                                        // Repubblica
        `${year}-08-15`,                                        // Ferragosto
        `${year}-11-01`,                                        // Tutti i Santi
        `${year}-12-08`,                                        // Immacolata
        `${year}-12-25`,                                        // Natale
        `${year}-12-26`                                         // Santo Stefano
    ];

    // San Francesco d'Assisi è di nuovo festività nazionale dal 2026
    if( year >= 2026 ) {
        holidays.push(`${year}-10-04`);
    }

    return holidays;
}
