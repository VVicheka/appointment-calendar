/**
 * Dental Appointment Calendar - Holiday Utilities
 * Contains functions for calculating holidays and Buddhist calendar dates
 */

// Dynamic holidays cache
let holidaysCache = {};
let buddhistEventsCache = {};

// Get fixed civil holidays from local data
function getFixedHolidays(year) {
    const holidays = {};
    
    Object.keys(fixedHolidayData).forEach(monthDay => {
        const fullDate = `${year}-${monthDay}`;
        holidays[fullDate] = fixedHolidayData[monthDay];
    });
    
    return holidays;
}

// Calculate dynamic Buddhist holidays for a given year using MomentKH
function calculateBuddhistHolidays(year) {
    if (buddhistEventsCache[year]) {
        return buddhistEventsCache[year];
    }

    const events = {};

    try {
        if (typeof momentkh === 'undefined') {
            console.error('MomentKH library not loaded!');
            return events;
        }

        // Khmer New Year
        try {
            const khmerNewYear = momentkh.getNewYear(year);
            if (khmerNewYear && khmerNewYear.year && khmerNewYear.month && khmerNewYear.day) {
                const newYearDate = new Date(khmerNewYear.year, khmerNewYear.month - 1, khmerNewYear.day);

                for (let i = 0; i < 3; i++) {
                    const date = new Date(newYearDate);
                    date.setDate(date.getDate() + i);
                    const dateKey = formatDateKey(date);

                    let dayName = '';
                    if (i === 0) dayName = 'Maha Songkran';
                    else if (i === 1) dayName = 'Virak Wanabat';
                    else if (i === 2) dayName = 'Virak Loeurng Sak';

                    events[dateKey] = {
                        en: `Khmer New Year - ${dayName}`,
                        kh: `បុណ្យចូលឆ្នាំថ្មីខ្មែរ - ${dayName}`,
                        isRestDay: true
                    };
                }
            }
        } catch (e) {
            console.error('Error calculating Khmer New Year:', e);
        }

        const potentialBEYears = [year + 543, year + 544, year + 545];

        const buddhistHolidays = [
            { name: 'Meak Bochea', nameKh: 'ពិធីបុណ្យមាឃបូជា', day: 15, moonPhase: 0, monthIndex: 2, isRestDay: true },
            { name: 'Visakha Bochea', nameKh: 'ពិធីបុណ្យវិសាខបូជា', day: 15, moonPhase: 0, monthIndex: 5, isRestDay: true },
            { name: 'Asalha Bochea', nameKh: 'ពិធីបុណ្យអាសាឡ្ហបូជា', day: 15, moonPhase: 0, monthIndex: 7, isRestDay: true },
            { name: 'Royal Ploughing Ceremony', nameKh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល', day: 4, moonPhase: 0, monthIndex: 6, isRestDay: true }
        ];

        buddhistHolidays.forEach(holiday => {
            for (const beYear of potentialBEYears) {
                try {
                    const khmerDate = momentkh.fromKhmer(beYear, holiday.monthIndex, holiday.day, holiday.moonPhase);

                    if (khmerDate && khmerDate.gregorian && khmerDate.gregorian.year === year) {
                        const date = new Date(khmerDate.gregorian.year, khmerDate.gregorian.month - 1, khmerDate.gregorian.day);
                        const dateKey = formatDateKey(date);

                        events[dateKey] = {
                            en: holiday.name,
                            kh: holiday.nameKh,
                            isRestDay: holiday.isRestDay
                        };
                        break;
                    }
                } catch (e) { }
            }
        });

        const multidayFestivals = [
            { name: 'Pchum Ben', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ', days: [13, 14, 15], moonPhase: 0, monthIndex: 10, isRestDay: true },
            { name: 'Water Festival', nameKh: 'ពិធីបុណ្យអុំទូក', days: [13, 14, 15], moonPhase: 0, monthIndex: 11, isRestDay: true }
        ];

        multidayFestivals.forEach(festival => {
            for (const beYear of potentialBEYears) {
                try {
                    const khmerDate = momentkh.fromKhmer(beYear, festival.monthIndex, festival.days[0], festival.moonPhase);

                    if (khmerDate && khmerDate.gregorian && khmerDate.gregorian.year === year) {
                        festival.days.forEach((day, index) => {
                            const date = new Date(khmerDate.gregorian.year, khmerDate.gregorian.month - 1, khmerDate.gregorian.day);
                            date.setDate(date.getDate() + index);
                            const dateKey = formatDateKey(date);

                            events[dateKey] = {
                                en: `${festival.name} (Day ${index + 1})`,
                                kh: `${festival.nameKh} (ថ្ងៃទី${index + 1})`,
                                isRestDay: festival.isRestDay
                            };
                        });
                        break;
                    }
                } catch (e) { }
            }
        });

    } catch (e) {
        console.error('Critical error calculating Buddhist holidays:', e);
    }

    buddhistEventsCache[year] = events;
    return events;
}

// Get all holidays for a year
function getHolidays(year) {
    if (holidaysCache[year]) {
        return holidaysCache[year];
    }

    const holidays = {};
    const fixedHolidays = getFixedHolidays(year);
    Object.assign(holidays, fixedHolidays);

    const buddhistEvents = calculateBuddhistHolidays(year);
    Object.keys(buddhistEvents).forEach(dateKey => {
        holidays[dateKey] = buddhistEvents[dateKey];
    });

    holidaysCache[year] = holidays;
    return holidays;
}

// Get Buddhist Date Info using MomentKH
function getBuddhistDateInfo(date, lang) {
    lang = lang || (typeof AppState !== 'undefined' ? AppState.getLanguage() : 'en');
    
    try {
        if (typeof momentkh === 'undefined') {
            return null;
        }

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const khmerDate = momentkh.fromGregorian(year, month, day);

        const lunarDay = khmerDate.khmer.day;
        const moonPhase = khmerDate.khmer.moonPhase;
        const monthName = khmerDate.khmer.monthName;
        const animalYearName = khmerDate.khmer.animalYearName;
        const sakName = khmerDate.khmer.sakName;
        const beYear = khmerDate.khmer.beYear;
        const dayOfWeekName = khmerDate.khmer.dayOfWeekName;

        const isBuddhistHolyDay =
            (moonPhase === 0 && (lunarDay === 1 || lunarDay === 8 || lunarDay === 15)) ||
            (moonPhase === 1 && (lunarDay === 8 || lunarDay === 15));

        const isShaveDay = moonPhase === 1 && (lunarDay === 14 || lunarDay === 15);
        const isFullMoon = moonPhase === 0 && lunarDay === 15;

        let lunarDateStr = '';
        if (lang === 'en') {
            lunarDateStr = `${lunarDay} ${moonPhase === 0 ? 'Koeut' : 'Roach'}`;
        } else {
            lunarDateStr = `${lunarDay} ${moonPhase === 0 ? 'កើត' : 'រោច'}`;
        }

        return {
            lunarDay,
            moonPhase,
            monthName,
            animalYearName,
            sakName,
            beYear,
            dayOfWeekName,
            isBuddhistHolyDay,
            isShaveDay,
            isFullMoon,
            lunarDateStr,
            fullKhmerDate: khmerDate
        };
    } catch (e) {
        return null;
    }
}

// Get lunar month range for header
function getLunarMonthRange(year, month) {
    try {
        const firstDay = momentkh.fromGregorian(year, month, 1);
        const lastDay = momentkh.fromGregorian(year, month, new Date(year, month, 0).getDate());

        const firstMonth = firstDay.khmer.monthName;
        const lastMonth = lastDay.khmer.monthName;
        const animalYear = firstDay.khmer.animalYearName;
        const beYear = firstDay.khmer.beYear;

        if (firstMonth === lastMonth) {
            return `${firstMonth} ${animalYear} ${formatNumber(beYear)}`;
        } else {
            return `${firstMonth} - ${lastMonth} ${animalYear} ${formatNumber(beYear)}`;
        }
    } catch (e) {
        return '';
    }
}
