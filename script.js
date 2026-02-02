$(document).ready(function () {
    let currentDate = new Date();
    let currentLanguage = localStorage.getItem('calendar-language') || 'en';
    let selectedDate = null; // Currently selected date for filtering

    // Load appointments and validate/migrate old data
    let storedAppointments = JSON.parse(localStorage.getItem('calendar-appointments')) || [];

    // Filter out old format appointments that don't have dateStart
    let appointments = storedAppointments.filter(apt => apt.dateStart);

    // If we filtered out invalid data, save the clean version
    if (appointments.length !== storedAppointments.length) {
        console.log('🔧 Cleaned up old appointment data');
        localStorage.setItem('calendar-appointments', JSON.stringify(appointments));
    }

    // Load payments from localStorage
    let payments = JSON.parse(localStorage.getItem('calendar-payments')) || [];

    // Mock data for patients and providers
    const mockPatients = [
        { id: 1, name: 'Sokha Meas', phone: '012 345 678', gender: 'male' },
        { id: 2, name: 'Channary Ouk', phone: '077 234 567', gender: 'female' },
        { id: 3, name: 'Visal Keo', phone: '089 456 789', gender: 'male' },
        { id: 4, name: 'Sreymom Pich', phone: '015 678 901', gender: 'female' },
        { id: 5, name: 'Bunthoeun Heng', phone: '096 789 012', gender: 'male' },
        { id: 6, name: 'Socheata Ly', phone: '070 890 123', gender: 'female' },
        { id: 7, name: 'Rithya Noun', phone: '011 901 234', gender: 'male' },
        { id: 8, name: 'Pisey Seng', phone: '078 012 345', gender: 'female' }
    ];

    const mockProviders = [
        { id: 1, name: 'Dr. Sopheap Chhorn', specialty: 'General Dentistry', color: '#8b5cf6' },
        { id: 2, name: 'Dr. Veasna Prak', specialty: 'Orthodontics', color: '#ec4899' },
        { id: 3, name: 'Dr. Kosal Mony', specialty: 'Oral Surgery', color: '#14b8a6' },
        { id: 4, name: 'Dr. Sreyleak Tep', specialty: 'Pediatric Dentistry', color: '#f97316' }
    ];

    const treatmentCategories = [
        { value: 'consultation', label: 'Consultation', labelKh: 'ពិគ្រោះ' },
        { value: 'cleaning', label: 'Cleaning', labelKh: 'សម្អាត' },
        { value: 'filling', label: 'Filling', labelKh: 'ចាក់បំពេញ' },
        { value: 'extraction', label: 'Extraction', labelKh: 'ដកធ្មេញ' },
        { value: 'root-canal', label: 'Root Canal', labelKh: 'ព្យាបាលរាករាក' },
        { value: 'crown', label: 'Crown', labelKh: 'គ្រោង' },
        { value: 'regular-checkup', label: 'Regular Checkup', labelKh: 'ពិនិត្យទៀងទាត់' },
        { value: 'other', label: 'Other', labelKh: 'ផ្សេងទៀត' }
    ];

    const appointmentTypes = [
        { value: 'scheduled', label: 'Scheduled', labelKh: 'បានកក់', color: '#3b82f6' },
        { value: 'arrived', label: 'Arrived', labelKh: 'មកដល់', color: '#8b5cf6' },
        { value: 'ready', label: 'Ready to See', labelKh: 'ត្រៀមជួប', color: '#f59e0b' },
        { value: 'in-treatment', label: 'In Treatment', labelKh: 'កំពុងព្យាបាល', color: '#22c55e' },
        { value: 'completed', label: 'Completed', labelKh: 'បញ្ចប់', color: '#10b981' },
        { value: 'needs-followup', label: 'Needs Follow-up', labelKh: 'ត្រូវតាមដាន', color: '#f97316' },
        { value: 'walk-in', label: 'Walk-in', labelKh: 'ដើរចូល', color: '#06b6d4' },
        { value: 'no-show', label: 'No-show', labelKh: 'មិនមក', color: '#6b7280' },
        { value: 'cancelled', label: 'Cancelled', labelKh: 'បោះបង់', color: '#ef4444' }
    ];

    const rooms = [
        { id: 1, name: 'Room 1' },
        { id: 2, name: 'Room 2' },
        { id: 3, name: 'Room 3' },
        { id: 4, name: 'Room 4' },
        { id: 5, name: 'Room 5' }
    ];

    // Treatment-based follow-up rules
    const treatmentFollowUpRules = {
        'root-canal': { days: 7, priority: 'urgent', label: 'Root Canal Check' },
        'extraction': { days: 3, priority: 'high', label: 'Post-Extraction Check' },
        'crown': { days: 14, priority: 'normal', label: 'Crown Fitting' },
        'filling': { days: 0, priority: 'none', label: 'No Follow-up' },
        'cleaning': { days: 180, priority: 'low', label: 'Regular Cleaning' },
        'consultation': { days: 0, priority: 'none', label: 'No Follow-up' },
        'regular-checkup': { days: 180, priority: 'low', label: 'Next Checkup' },
        'other': { days: 0, priority: 'none', label: 'As Needed' }
    };

    // Initialize with sample appointments if empty
    if (appointments.length === 0) {
        appointments = [
            // Multiple appointments on Jan 31 (today)
            {
                id: 1,
                patientId: 1,
                patientName: 'Sokha Meas',
                providerId: 1,
                providerName: 'Dr. Sopheap Chhorn',
                treatmentCategory: 'consultation',
                roomNumber: 1,
                title: 'Initial Consultation',
                dateStart: '2026-01-31 08:00',
                dateEnd: '2026-01-31 08:30',
                type: 'finished',
                notes: 'New patient registration'
            },
            {
                id: 2,
                patientId: 2,
                patientName: 'Channary Ouk',
                providerId: 2,
                providerName: 'Dr. Veasna Prak',
                treatmentCategory: 'cleaning',
                roomNumber: 2,
                title: 'Teeth Cleaning',
                dateStart: '2026-01-31 09:00',
                dateEnd: '2026-01-31 09:45',
                type: 'queue',
                notes: 'Regular cleaning'
            },
            {
                id: 3,
                patientId: 3,
                patientName: 'Visal Keo',
                providerId: 1,
                providerName: 'Dr. Sopheap Chhorn',
                treatmentCategory: 'filling',
                roomNumber: 1,
                title: 'Cavity Filling',
                dateStart: '2026-01-31 10:00',
                dateEnd: '2026-01-31 11:00',
                type: 'appointment',
                notes: '2 cavities on upper molars'
            },
            {
                id: 4,
                patientId: 4,
                patientName: 'Sreymom Pich',
                providerId: 3,
                providerName: 'Dr. Kosal Mony',
                treatmentCategory: 'extraction',
                roomNumber: 3,
                title: 'Wisdom Tooth Extraction',
                dateStart: '2026-01-31 11:30',
                dateEnd: '2026-01-31 12:30',
                type: 'appointment',
                notes: 'Lower right wisdom tooth'
            },
            {
                id: 5,
                patientId: 5,
                patientName: 'Bunthoeun Heng',
                providerId: 2,
                providerName: 'Dr. Veasna Prak',
                treatmentCategory: 'regular-checkup',
                roomNumber: 2,
                title: 'Regular Checkup',
                dateStart: '2026-01-31 14:00',
                dateEnd: '2026-01-31 14:30',
                type: 'followup',
                notes: 'Follow up from last month'
            },
            // More appointments on different days
            {
                id: 6,
                patientId: 6,
                patientName: 'Socheata Ly',
                providerId: 4,
                providerName: 'Dr. Sreyleak Tep',
                treatmentCategory: 'consultation',
                roomNumber: 4,
                title: 'Child Dental Checkup',
                dateStart: '2026-01-15 09:00',
                dateEnd: '2026-01-15 09:30',
                type: 'finished',
                notes: 'Pediatric patient - age 8'
            },
            {
                id: 7,
                patientId: 7,
                patientName: 'Rithya Noun',
                providerId: 1,
                providerName: 'Dr. Sopheap Chhorn',
                treatmentCategory: 'root-canal',
                roomNumber: 1,
                title: 'Root Canal Treatment',
                dateStart: '2026-01-20 10:00',
                dateEnd: '2026-01-20 11:30',
                type: 'cancelled',
                notes: 'Patient rescheduled'
            },
            {
                id: 8,
                patientId: 8,
                patientName: 'Pisey Seng',
                providerId: 3,
                providerName: 'Dr. Kosal Mony',
                treatmentCategory: 'crown',
                roomNumber: 3,
                title: 'Crown Fitting',
                dateStart: '2026-02-05 11:00',
                dateEnd: '2026-02-05 12:00',
                type: 'appointment',
                notes: 'Final crown fitting'
            }
        ];
        localStorage.setItem('calendar-appointments', JSON.stringify(appointments));
    }

    // Dynamic holidays cache
    let holidaysCache = {};
    let buddhistEventsCache = {};

    // Get fixed civil holidays from local data
    function getFixedHolidays(year) {
        const holidays = {};

        const fixedHolidayData = {
            '01-01': { en: 'New Year\'s Day', kh: 'ថ្ងៃចូលឆ្នាំសាកល', isRestDay: true },
            '01-07': { en: 'Victory Over Genocide Day', kh: 'ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍', isRestDay: true },
            '03-08': { en: 'International Women\'s Day', kh: 'ទិវាអន្តរជាតិនារី', isRestDay: true },
            '04-07': { en: 'World Health Day', kh: 'ទិវាសុខភាពពិភពលោក', isRestDay: false },
            '04-28': { en: 'World Day for Safety and Health at Work', kh: 'ទិវាពិភពលោកសម្រាប់សុវត្ថិភាព និងសុខភាពការងារ', isRestDay: false },
            '04-30': { en: 'Cambodia joined ASEAN', kh: 'កម្ពុជាចូលរួមជាមួយអាស៊ាន', isRestDay: false },
            '05-01': { en: 'Labour Day', kh: 'ទិវាពលកម្មអន្តរជាតិ', isRestDay: true },
            '06-01': { en: 'Children\'s Day', kh: 'ទិវាកុមារអន្តរជាតិ', isRestDay: true },
            '06-18': { en: 'Queen\'s Birthday', kh: 'ព្រះជន្មព្រះមហាក្សត្រី', isRestDay: true },
            '09-24': { en: 'Constitution Day', kh: 'ទិវារដ្ឋធម្មនុញ្ញ', isRestDay: true },
            '10-15': { en: 'Mourning King Father', kh: 'ប្រារព្ធទុក្ខព្រះបាទ', isRestDay: true },
            '10-29': { en: 'King\'s Birthday', kh: 'ព្រះជន្មព្រះមហាក្សត្រ', isRestDay: true },
            '11-09': { en: 'Independence Day', kh: 'ទិវាឯករាជ្យជាតិ', isRestDay: true },
        };

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

    // Translations
    const translations = {
        en: {
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            daysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            shaveDay: 'Shave Day',
            fullMoon: 'Full Moon',
            koeut: 'Koeut',
            roach: 'Roach',
            today: 'Today'
        },
        kh: {
            months: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'],
            daysShort: ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'],
            daysFull: ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'],
            shaveDay: 'ថ្ងៃកោរ',
            fullMoon: 'ពេញបូណ៌មី',
            koeut: 'កើត',
            roach: 'រោច',
            today: 'ថ្ងៃនេះ'
        }
    };

    // Get Buddhist Date Info
    function getBuddhistDateInfo(date) {
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
            if (currentLanguage === 'en') {
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
                return `${firstMonth} ${animalYear} ${beYear}`;
            } else {
                return `${firstMonth} - ${lastMonth} ${animalYear} ${beYear}`;
            }
        } catch (e) {
            return '';
        }
    }

    // Format date for key
    function formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Handle date click - show appointments for that date (toggle selection)
    function handleDateClick(date) {
        const dateKey = formatDateKey(date);

        // If clicking the same date, deselect it
        if (selectedDate && formatDateKey(selectedDate) === dateKey) {
            selectedDate = null;
            $('.day-cell').removeClass('selected');
        } else {
            selectedDate = date;
            // Update selected state in calendar
            $('.day-cell').removeClass('selected');
            $(`.day-cell[data-date="${dateKey}"]`).addClass('selected');
        }

        // Update sidebar
        renderAppointments();
    }

    // Clear date selection - show all month appointments
    function clearDateSelection() {
        selectedDate = null;
        $('.day-cell').removeClass('selected');
        renderAppointments();
    }

    // Render Calendar
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Update header
        const monthName = currentLanguage === 'en'
            ? `${translations.en.months[month]} ${year}`
            : `${translations.kh.months[month]} ${year}`;
        $('#headerTitle').text(monthName);

        // Update lunar info
        $('#lunarInfo').text(getLunarMonthRange(year, month + 1));

        // Render weekdays
        for (let i = 0; i < 7; i++) {
            $(`#weekday${i}`).text(translations[currentLanguage].daysShort[i]);
        }

        // Render calendar body
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let calendarHtml = '';
        let dayCount = 1 - firstDay;

        // Always show 6 weeks
        for (let week = 0; week < 6; week++) {
            calendarHtml += `<div class="calendar-row">`;

            for (let day = 0; day < 7; day++) {
                const currentDayCount = dayCount;
                const cellDate = new Date(year, month, currentDayCount);
                const isOtherMonth = currentDayCount < 1 || currentDayCount > daysInMonth;
                calendarHtml += renderDay(cellDate, isOtherMonth, day);
                dayCount++;
            }

            calendarHtml += `</div>`;
        }

        $('#calendarBody').html(calendarHtml);

        // Clear selection and render appointments for the month
        selectedDate = null;
        renderAppointments();
    }

    function renderDay(date, isOtherMonth, dayOfWeek) {
        const day = date.getDate();
        const dateKey = formatDateKey(date);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const holidays = getHolidays(date.getFullYear());
        const holiday = holidays[dateKey];
        const buddhistInfo = getBuddhistDateInfo(date);

        // Count appointments for this date (safely check for dateStart property)
        const dayAppointments = appointments.filter(apt => apt.dateStart && apt.dateStart.startsWith(dateKey));
        const appointmentCount = dayAppointments.length;

        let classes = 'day-cell';
        if (isOtherMonth) classes += ' other-month';
        if (isToday) classes += ' today';
        if (dayOfWeek === 0 || dayOfWeek === 6) classes += ' weekend';
        if (holiday && holiday.isRestDay) classes += ' holiday';

        let html = `<div class="${classes}" data-date="${dateKey}" onclick="handleDateClick('${dateKey}')">`;

        // Day header
        html += `<div class="day-header-row">`;
        html += `<div class="day-number">${day}</div>`;
        if (buddhistInfo && buddhistInfo.isBuddhistHolyDay) {
            html += `<img src="buddha-icon.png" class="buddhist-icon" alt="Buddhist Holy Day" onerror="this.style.display='none'" />`;
        }
        html += `</div>`;

        // Lunar date
        if (buddhistInfo) {
            html += `<div class="lunar-date">${buddhistInfo.lunarDateStr}</div>`;
        }

        // Holiday text
        if (holiday) {
            const holidayName = currentLanguage === 'en' ? holiday.en : holiday.kh;
            html += `<div class="day-info holiday-text">${holidayName}</div>`;
        }

        // Appointment count
        if (appointmentCount > 0) {
            html += `<div class="day-info"><span class="appointment-count">${appointmentCount}</span></div>`;
        }

        html += `</div>`;
        return html;
    }

    // Handle date click globally
    window.handleDateClick = function (dateKey) {
        const parts = dateKey.split('-');
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        handleDateClick(date);
    };

    // Calculate priority score for smart queue
    function calculatePriority(appointment) {
        let score = 0;
        const now = new Date();
        const aptDate = new Date(appointment.dateStart);

        // Base score for appointment type
        const typeScores = {
            'walk-in': 30,
            'arrived': 50,
            'ready': 70,
            'scheduled': 40
        };
        score += typeScores[appointment.type] || 0;

        // Urgency keywords in notes/treatment
        const urgentKeywords = ['pain', 'emergency', 'urgent', 'swelling', 'bleeding', 'severe'];
        const notes = (appointment.notes || '').toLowerCase();
        const treatment = (appointment.treatment || '').toLowerCase();
        if (urgentKeywords.some(kw => notes.includes(kw) || treatment.includes(kw))) {
            score += 100;
        }

        // Wait time (if arrived or ready)
        if (appointment.type === 'arrived' || appointment.type === 'ready') {
            const waitMinutes = (now - aptDate) / (1000 * 60);
            score += Math.min(waitMinutes * 2, 120); // Cap at 120 points
        }

        // Overdue scheduled appointment
        if (appointment.type === 'scheduled' && aptDate < now) {
            const lateMinutes = (now - aptDate) / (1000 * 60);
            score += lateMinutes;
        }

        // Patient age (elderly priority)
        if (appointment.patientAge && appointment.patientAge > 65) {
            score += 30;
        }

        // VIP flag
        if (appointment.vip) {
            score += 20;
        }

        appointment.priorityScore = Math.round(score);
        return appointment;
    }

    // Get filtered appointments
    function getFilteredAppointments() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Get active filters
        const viewAll = $('#filterViewAll').is(':checked');
        const selectedProvider = $('#filterProvider').val();
        const activeTypes = [];
        $('.filter-type:checked').each(function () {
            activeTypes.push($(this).val());
        });

        let filtered = appointments.filter(apt => {
            // Skip appointments without valid dateStart
            if (!apt.dateStart) return false;

            const aptDate = new Date(apt.dateStart);

            // Filter by date
            if (selectedDate) {
                const selectedDateKey = formatDateKey(selectedDate);
                if (!apt.dateStart.startsWith(selectedDateKey)) return false;
            } else {
                // Filter by month
                if (aptDate.getFullYear() !== year || aptDate.getMonth() !== month) return false;
            }

            // Filter by type
            if (!viewAll && !activeTypes.includes(apt.type)) return false;

            // Filter by provider
            if (selectedProvider && apt.providerId != selectedProvider) return false;

            return true;
        });

        // Calculate priority for each appointment
        filtered = filtered.map(apt => calculatePriority(apt));

        // Sort by priority score (highest first), then by date
        filtered.sort((a, b) => {
            if (b.priorityScore !== a.priorityScore) {
                return b.priorityScore - a.priorityScore;
            }
            return new Date(a.dateStart) - new Date(b.dateStart);
        });

        return filtered;
    }

    // Render Appointments
    function renderAppointments() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Update sidebar title and date info
        updateSidebarTitle();

        if (selectedDate) {
            const dayName = translations[currentLanguage].daysFull[selectedDate.getDay()];
            const dayNum = selectedDate.getDate();
            const monthName = translations[currentLanguage].months[selectedDate.getMonth()];
            $('#sidebarDateInfo').text(`${dayName}, ${dayNum} ${monthName} ${selectedDate.getFullYear()}`);
        } else {
            const monthName = translations[currentLanguage].months[month];
            $('#sidebarDateInfo').text(`${monthName} ${year}`);
        }

        // Get filtered appointments
        const filteredAppointments = getFilteredAppointments();

        let html = '';
        if (filteredAppointments.length === 0) {
            html = `<div class="no-appointments">${currentLanguage === 'en' ? 'No appointments found' : 'រកមិនឃើញការណាត់ជួប'}</div>`;
        } else {
            // Group by provider (doctor)
            const grouped = {};
            filteredAppointments.forEach(apt => {
                const providerId = apt.providerId || 0;
                if (!grouped[providerId]) grouped[providerId] = [];
                grouped[providerId].push(apt);
            });

            // Sort appointments within each provider by date/time
            Object.keys(grouped).forEach(providerId => {
                grouped[providerId].sort((a, b) => {
                    return a.dateStart.localeCompare(b.dateStart);
                });
            });

            // Render grouped appointments by provider
            Object.keys(grouped).forEach(providerId => {
                const provider = mockProviders.find(p => p.id == providerId);
                const providerName = provider ? provider.name : 'Unknown Provider';
                const appointments = grouped[providerId];

                html += `<div class="appointment-date-group">`;
                html += `<div class="provider-group-header provider-${providerId}">
                    <i class="fas fa-user-md"></i>
                    <span>${providerName}</span>
                    <span class="provider-count-badge">${appointments.length}</span>
                </div>`;

                appointments.forEach(apt => {
                    const timeStart = apt.dateStart.split(' ')[1] || '';
                    const timeEnd = apt.dateEnd.split(' ')[1] || '';
                    const dateStr = apt.dateStart.split(' ')[0];
                    const aptDate = new Date(dateStr);
                    const dayName = translations[currentLanguage].daysShort[aptDate.getDay()];
                    const dayNum = aptDate.getDate();
                    const monthName = translations[currentLanguage].months[aptDate.getMonth()];

                    html += `
                        <div class="appointment-item provider-${apt.providerId} ${apt.type === 'cancelled' ? 'type-cancelled' : ''}" onclick="editAppointment(${apt.id})">
                            <div class="appointment-patient">${apt.patientName}</div>
                            <div class="appointment-details">
                                <span><i class="fas fa-calendar"></i> ${dayName}, ${dayNum} ${monthName}</span>
                                <span><i class="fas fa-clock"></i> ${timeStart} - ${timeEnd}</span>
                                <span><i class="fas fa-door-open"></i> Room ${apt.roomNumber}</span>
                            </div>
                            <div class="appointment-footer">
                                <span class="appointment-type-badge ${apt.type}">${apt.type}</span>
                                <div class="appointment-quick-actions">
                                    ${getQuickActionButtons(apt)}
                                </div>
                            </div>
                        </div>
                    `;
                });

                html += `</div>`;
            });
        }

        $('#appointmentsList').html(html);
    }

    function updateSidebarTitle() {
        $('#sidebarTitle').text(currentLanguage === 'en' ? 'Appointments' : 'ការណាត់ជួប');
    }

    // Populate provider filter
    function populateProviderFilter() {
        let options = `<option value="">--- ${currentLanguage === 'en' ? 'select provider' : 'ជ្រើសរើសអ្នកផ្តល់សេវា'} ---</option>`;
        mockProviders.forEach(p => {
            options += `<option value="${p.id}">${p.name}</option>`;
        });
        $('#filterProvider').html(options);
    }

    // Filter change handlers
    $('#filterViewAll').change(function () {
        if ($(this).is(':checked')) {
            $('.filter-type').prop('checked', true);
        }
        renderAppointments();
    });

    $('.filter-type').change(function () {
        const allChecked = $('.filter-type:checked').length === $('.filter-type').length;
        $('#filterViewAll').prop('checked', allChecked);
        renderAppointments();
    });

    $('#filterProvider').change(function () {
        renderAppointments();
    });

    // Edit appointment
    window.editAppointment = function (id) {
        const apt = appointments.find(a => a.id === id);
        if (!apt) return;

        openSlidePanel('edit-appointment', apt);
    };

    // ====================
    // SLIDE PANEL
    // ====================

    window.openSlidePanel = function (type, data = null) {
        const panel = $('#slidePanel');
        const overlay = $('#slidePanelOverlay');
        const icon = $('#slidePanelIcon');
        const title = $('#slidePanelTitle');
        const body = $('#slidePanelBody');

        const config = getPanelConfig(type, data);
        if (!config) return;

        icon.attr('class', 'slide-panel-icon ' + config.icon);
        title.text(config.title);
        body.html(config.form);

        panel.addClass('show');
        overlay.addClass('show');

        // Initialize form data if editing
        if (data && type === 'edit-appointment') {
            populateAppointmentForm(data);
        }

        setTimeout(() => {
            body.find('input, select, textarea').first().focus();
        }, 300);
    };

    function closeSlidePanel() {
        $('#slidePanel').removeClass('show');
        $('#slidePanelOverlay').removeClass('show');
    }

    // Close button handler
    $('#slidePanelClose').click(closeSlidePanel);

    // Close panel when clicking outside (on overlay)
    $('#slidePanelOverlay').click(function (e) {
        if (e.target === this) {
            closeSlidePanel();
        }
    });

    // Panel configurations
    function getPanelConfig(type, data = null) {
        const configs = {
            'patient': {
                icon: 'fas fa-user-plus',
                title: currentLanguage === 'en' ? 'New Patient' : 'អ្នកជំងឺថ្មី',
                form: getPatientForm()
            },
            'appointment': {
                icon: 'fas fa-calendar-plus',
                title: currentLanguage === 'en' ? 'New Appointment' : 'ការណាត់ជួបថ្មី',
                form: getAppointmentForm()
            },
            'edit-appointment': {
                icon: 'fas fa-edit',
                title: currentLanguage === 'en' ? 'Edit Appointment' : 'កែប្រែការណាត់ជួប',
                form: getAppointmentForm(data)
            },
            'lab-order': {
                icon: 'fas fa-flask',
                title: currentLanguage === 'en' ? 'New Lab Order' : 'សំណើមន្ទីរពិសោធន៍',
                form: getLabOrderForm()
            },
            'payment': {
                icon: 'fas fa-dollar-sign',
                title: currentLanguage === 'en' ? 'New Payment' : 'ការទូទាត់ថ្មី',
                form: getPaymentForm()
            },
            'employee': {
                icon: 'fas fa-user-tie',
                title: currentLanguage === 'en' ? 'New Employee' : 'បុគ្គលិកថ្មី',
                form: getEmployeeForm()
            },
            'prescription': {
                icon: 'fas fa-prescription',
                title: currentLanguage === 'en' ? 'New Prescription' : 'វេជ្ជបញ្ជាថ្មី',
                form: getPrescriptionForm()
            },
            'services': {
                icon: 'fas fa-hand-holding-medical',
                title: currentLanguage === 'en' ? 'New Services' : 'សេវាកម្មថ្មី',
                form: getServicesForm()
            }
        };

        return configs[type];
    }

    /**
     * Open enhanced appointment form with smart pre-filling
     * Shows conflict warnings and suggestions
     */
    function openEnhancedAppointmentForm(prefillData) {
        const panel = $('#slidePanel');
        const overlay = $('#slidePanelOverlay');
        const icon = $('#slidePanelIcon');
        const title = $('#slidePanelTitle');
        const body = $('#slidePanelBody');

        // Set panel title and icon
        icon.attr('class', 'slide-panel-icon fas fa-calendar-plus');
        title.text(currentLanguage === 'en' ? 'Quick Book Appointment' : 'កក់ការណាត់ជួបរហ័ស');

        // Generate form with pre-filled data
        const formHtml = getEnhancedAppointmentForm(prefillData);
        body.html(formHtml);

        panel.addClass('show');
        overlay.addClass('show');

        // Focus on patient select (first required field not pre-filled)
        setTimeout(() => {
            $('#patientId').focus();
        }, 300);

        // Add real-time conflict checking on time change
        $('#startTime, #endTime').on('change', function () {
            checkAndShowConflicts();
        });
    }

    /**
     * Real-time conflict checking as user adjusts times
     */
    function checkAndShowConflicts() {
        const providerId = parseInt($('#providerId').val());
        const dateKey = $('#appointmentDate').val();
        const startTime = $('#startTime').val();
        const endTime = $('#endTime').val();

        if (!providerId || !dateKey || !startTime || !endTime) return;

        const testApt = {
            providerId: providerId,
            dateStart: `${dateKey} ${startTime}:00`,
            dateEnd: `${dateKey} ${endTime}:00`
        };

        const conflicts = checkTimelineConflicts(testApt);
        const $warningArea = $('#conflictWarning');

        if (conflicts.length > 0) {
            let warningHtml = `
                <div class="conflict-warning-box">
                    <div class="conflict-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>${currentLanguage === 'en' ? 'Time Conflict Detected!' : 'រកឃើញការប៉ះទង្គិច!'}</strong>
                    </div>
                    <div class="conflict-message">
                        ${currentLanguage === 'en' ? 'This time slot overlaps with:' : 'ពេលវេលានេះទំនាក់ទំនងជាមួយ:'}
                    </div>
                    <ul class="conflict-list">
            `;

            conflicts.forEach(c => {
                warningHtml += `
                    <li>
                        <strong>${c.patientName}</strong> - ${c.startTime} to ${c.endTime}
                        ${c.treatment ? `(${c.treatment})` : ''}
                    </li>
                `;
            });

            // Suggest alternatives
            const alternatives = suggestAlternativeSlots(providerId, dateKey, startTime);
            if (alternatives.length > 0) {
                warningHtml += `</ul>
                    <div class="conflict-suggestion">
                        <strong>${currentLanguage === 'en' ? 'Available times today:' : 'ពេលវេលាទំនេរថ្ងៃនេះ:'}</strong>
                        <div class="alternative-times">`;

                alternatives.forEach(alt => {
                    warningHtml += `
                        <button type="button" class="alt-time-btn" onclick="selectAlternativeTime('${alt.time}')">
                            ${alt.time}
                        </button>
                    `;
                });

                warningHtml += `</div></div>`;
            } else {
                warningHtml += `</ul>
                    <div class="conflict-suggestion">
                        <strong>${currentLanguage === 'en' ? 'No available slots today. Consider tomorrow?' : 'គ្មានពេលទំនេរថ្ងៃនេះទេ។'}</strong>
                    </div>`;
            }

            warningHtml += `</div>`;
            $warningArea.html(warningHtml).show();
        } else {
            $warningArea.html(`
                <div class="conflict-success-box">
                    <i class="fas fa-check-circle"></i>
                    <span>${currentLanguage === 'en' ? 'Time slot is available!' : 'ពេលវេលាទំនេរ!'}</span>
                </div>
            `).show();
        }
    }

    /**
     * Select alternative time slot
     */
    window.selectAlternativeTime = function (timeStr) {
        $('#startTime').val(timeStr);

        // Auto-adjust end time (1 hour later)
        const startHour = parseInt(timeStr.split(':')[0]);
        const endHour = startHour + 1;
        $('#endTime').val(`${endHour.toString().padStart(2, '0')}:00`);

        checkAndShowConflicts();
    };

    // Form Templates
    function getAppointmentForm(data = null) {
        const isEdit = data !== null;
        const dateValue = data ? data.dateStart.split(' ')[0] : new Date().toISOString().split('T')[0];

        // Patient options
        let patientOptions = `<option value="">--- ${currentLanguage === 'en' ? 'Select Patient' : 'ជ្រើសរើសអ្នកជំងឺ'} ---</option>`;
        mockPatients.forEach(p => {
            const selected = data && data.patientId === p.id ? 'selected' : '';
            patientOptions += `<option value="${p.id}" ${selected}>${p.name}</option>`;
        });

        // Provider options
        let providerOptions = `<option value="">--- ${currentLanguage === 'en' ? 'Select Provider' : 'ជ្រើសរើសអ្នកផ្តល់សេវា'} ---</option>`;
        mockProviders.forEach(p => {
            const selected = data && data.providerId === p.id ? 'selected' : '';
            providerOptions += `<option value="${p.id}" ${selected}>${p.name}</option>`;
        });

        // Treatment options
        let treatmentOptions = `<option value="">--- ${currentLanguage === 'en' ? 'Select Category' : 'ជ្រើសរើសប្រភេទ'} ---</option>`;
        treatmentCategories.forEach(t => {
            const selected = data && data.treatmentCategory === t.value ? 'selected' : '';
            treatmentOptions += `<option value="${t.value}" ${selected}>${currentLanguage === 'en' ? t.label : t.labelKh}</option>`;
        });

        // Room options
        let roomOptions = `<option value="">--- ${currentLanguage === 'en' ? 'Select Room' : 'ជ្រើសរើសបន្ទប់'} ---</option>`;
        rooms.forEach(r => {
            const selected = data && data.roomNumber === r.id ? 'selected' : '';
            roomOptions += `<option value="${r.id}" ${selected}>${r.name}</option>`;
        });

        // Type options
        let typeOptions = '';
        appointmentTypes.forEach(t => {
            const selected = data && data.type === t.value ? 'selected' : '';
            typeOptions += `<option value="${t.value}" ${selected}>${currentLanguage === 'en' ? t.label : t.labelKh}</option>`;
        });

        return `
            <form id="appointmentForm" onsubmit="handleAppointmentSubmit(event, ${isEdit ? data.id : 'null'})">
                <!-- Patient Info Section -->
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-user"></i>
                        ${currentLanguage === 'en' ? 'Patient Info' : 'ព័ត៌មានអ្នកជំងឺ'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? "Patient's name" : 'ឈ្មោះអ្នកជំងឺ'} <span class="required">*</span></label>
                            <select class="form-select" name="patientId" id="patientId" required>
                                ${patientOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Provider/dentist response' : 'អ្នកផ្តល់សេវា'} <span class="required">*</span></label>
                            <select class="form-select" name="providerId" id="providerId" required>
                                ${providerOptions}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Treatment Category' : 'ប្រភេទការព្យាបាល'}</label>
                            <select class="form-select" name="treatmentCategory" id="treatmentCategory">
                                ${treatmentOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Room Num' : 'លេខបន្ទប់'}</label>
                            <select class="form-select" name="roomNumber" id="roomNumber">
                                ${roomOptions}
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Appointment Info Section -->
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-calendar-alt"></i>
                        ${currentLanguage === 'en' ? 'Appointment Info' : 'ព័ត៌មានការណាត់ជួប'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Appointment Title' : 'ចំណងជើង'}</label>
                            <input type="text" class="form-input" name="title" id="title" placeholder="${currentLanguage === 'en' ? 'Event Title' : 'ចំណងជើង'}" value="${data ? data.title : ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Date' : 'កាលបរិច្ឆេទ'}</label>
                            <input type="date" class="form-input" name="appointmentDate" id="appointmentDate" value="${data ? data.dateStart.split(' ')[0] : (selectedDate ? formatDateKey(selectedDate) : '')}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Start Time' : 'ម៉ោងចាប់ផ្តើម'}</label>
                            <input type="time" class="form-input" name="startTime" id="startTime" value="${data ? data.dateStart.split(' ')[1] : '09:00'}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'End Time' : 'ម៉ោងបញ្ចប់'}</label>
                            <input type="time" class="form-input" name="endTime" id="endTime" value="${data ? data.dateEnd.split(' ')[1] : '10:00'}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Type' : 'ប្រភេទ'}</label>
                            <select class="form-select" name="type" id="appointmentType">
                                ${typeOptions}
                            </select>
                        </div>
                        <div class="form-group"></div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Notes' : 'កំណត់ចំណាំ'}</label>
                            <textarea class="form-textarea" name="notes" id="notes" placeholder="${currentLanguage === 'en' ? 'Additional notes' : 'កំណត់ចំណាំបន្ថែម'}">${data ? data.notes : ''}</textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                        ${currentLanguage === 'en' ? 'Cancel' : 'បោះបង់'}
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEdit ? (currentLanguage === 'en' ? 'Update' : 'ធ្វើបច្ចុប្បន្នភាព') : (currentLanguage === 'en' ? 'Create' : 'បង្កើត')}
                    </button>
                </div>
            </form>
        `;
    }

    function populateAppointmentForm(data) {
        // Form will be populated by the getAppointmentForm function with data parameter
    }

    function getPatientForm() {
        return `
            <form id="patientForm" onsubmit="handlePatientSubmit(event)">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-user"></i>
                        ${currentLanguage === 'en' ? 'Patient Information' : 'ព័ត៌មានអ្នកជំងឺ'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Full Name' : 'ឈ្មោះពេញ'} <span class="required">*</span></label>
                            <input type="text" class="form-input" name="fullName" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Date of Birth' : 'ថ្ងៃខែឆ្នាំកំណើត'} <span class="required">*</span></label>
                            <input type="date" class="form-input" name="dob" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Gender' : 'ភេទ'} <span class="required">*</span></label>
                            <select class="form-select" name="gender" required>
                                <option value="">--- ${currentLanguage === 'en' ? 'Select' : 'ជ្រើសរើស'} ---</option>
                                <option value="male">${currentLanguage === 'en' ? 'Male' : 'ប្រុស'}</option>
                                <option value="female">${currentLanguage === 'en' ? 'Female' : 'ស្រី'}</option>
                                <option value="other">${currentLanguage === 'en' ? 'Other' : 'ផ្សេងទៀត'}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Phone Number' : 'លេខទូរស័ព្ទ'} <span class="required">*</span></label>
                            <input type="tel" class="form-input" name="phone" required>
                        </div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Address' : 'អាសយដ្ឋាន'}</label>
                            <textarea class="form-textarea" name="address"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-notes-medical"></i>
                        ${currentLanguage === 'en' ? 'Medical History' : 'ប្រវត្តិវេជ្ជសាស្រ្ត'}
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Allergies' : 'អាឡែរហ្ស៊ី'}</label>
                            <input type="text" class="form-input" name="allergies" placeholder="${currentLanguage === 'en' ? 'Enter any known allergies' : 'បញ្ចូលអាឡែរហ្ស៊ី'}">
                        </div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Medical Notes' : 'កំណត់ចំណាំវេជ្ជសាស្រ្ត'}</label>
                            <textarea class="form-textarea" name="medicalNotes"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                        ${currentLanguage === 'en' ? 'Cancel' : 'បោះបង់'}
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${currentLanguage === 'en' ? 'Create Patient' : 'បង្កើតអ្នកជំងឺ'}
                    </button>
                </div>
            </form>
        `;
    }

    function getLabOrderForm() {
        return `
            <form id="labOrderForm" onsubmit="handleLabOrderSubmit(event)">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-flask"></i>
                        ${currentLanguage === 'en' ? 'Lab Order Details' : 'ព័ត៌មានសំណើមន្ទីរពិសោធន៍'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Patient Name' : 'ឈ្មោះអ្នកជំងឺ'} <span class="required">*</span></label>
                            <select class="form-select" name="patientId" required>
                                <option value="">--- ${currentLanguage === 'en' ? 'Select Patient' : 'ជ្រើសរើសអ្នកជំងឺ'} ---</option>
                                ${mockPatients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Ordering Provider' : 'អ្នកបញ្ជា'} <span class="required">*</span></label>
                            <select class="form-select" name="providerId" required>
                                <option value="">--- ${currentLanguage === 'en' ? 'Select Provider' : 'ជ្រើសរើសអ្នកផ្តល់សេវា'} ---</option>
                                ${mockProviders.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Test Type' : 'ប្រភេទតេស្ត'} <span class="required">*</span></label>
                            <select class="form-select" name="testType" required>
                                <option value="">--- ${currentLanguage === 'en' ? 'Select' : 'ជ្រើសរើស'} ---</option>
                                <option value="blood">Blood Test</option>
                                <option value="urine">Urine Test</option>
                                <option value="xray">X-Ray</option>
                                <option value="ultrasound">Ultrasound</option>
                                <option value="ct-scan">CT Scan</option>
                                <option value="mri">MRI</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Priority' : 'អាទិភាព'} <span class="required">*</span></label>
                            <select class="form-select" name="priority" required>
                                <option value="routine">${currentLanguage === 'en' ? 'Routine' : 'ធម្មតា'}</option>
                                <option value="urgent">${currentLanguage === 'en' ? 'Urgent' : 'បន្ទាន់'}</option>
                                <option value="stat">STAT</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Clinical Notes' : 'កំណត់ចំណាំគ្លីនិក'}</label>
                            <textarea class="form-textarea" name="notes"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                        ${currentLanguage === 'en' ? 'Cancel' : 'បោះបង់'}
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${currentLanguage === 'en' ? 'Create Order' : 'បង្កើតសំណើ'}
                    </button>
                </div>
            </form>
        `;
    }

    // ====================
    // PAYMENT HELPER FUNCTIONS
    // ====================

    /**
     * Generate unique payment code
     */
    function generatePaymentCode() {
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        // Get today's payment count
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const todayPayments = payments.filter(p => p.createdAt >= todayStart);
        const sequence = String(todayPayments.length + 1).padStart(4, '0');

        return `PAY${year}${month}${day}-${sequence}`;
    }

    /**
     * Calculate payment totals (called from form inputs)
     */
    window.calculatePaymentTotals = function () {
        const totalAmount = parseFloat($('#totalAmount').val()) || 0;
        const discountType = $('#discountType').val();
        const discountValue = parseFloat($('#discountValue').val()) || 0;
        const paidAmount = parseFloat($('#paidAmount').val()) || 0;

        let discountAmount = 0;
        if (discountType === 'percent') {
            discountAmount = (totalAmount * discountValue) / 100;
        } else {
            discountAmount = discountValue;
        }

        const grandTotal = Math.max(0, totalAmount - discountAmount);
        const remainingBalance = Math.max(0, grandTotal - paidAmount);

        $('#grandTotal').val(grandTotal.toFixed(2));
        $('#remainingBalance').val(remainingBalance.toFixed(2));

        // Visual feedback for remaining balance
        if (remainingBalance > 0) {
            $('#remainingBalance').css('color', '#dc2626');
        } else {
            $('#remainingBalance').css('color', '#059669');
        }
    };

    /**
     * Load patient invoice when patient is selected
     */
    window.loadPatientInvoice = function () {
        const patientId = parseInt($('#paymentPatientSelect').val());
        if (!patientId) {
            $('#invoiceIdField').val('');
            $('#patientPhoneField').val('');
            return;
        }

        const patient = mockPatients.find(p => p.id === patientId);
        if (!patient) return;

        // Display patient phone
        $('#patientPhoneField').val(patient.phone || '');

        // Find existing invoices/appointments for this patient
        const patientAppointments = appointments.filter(apt => apt.patientId === patientId);
        const patientPayments = payments.filter(pay => pay.patientId === patientId);

        // Generate or find invoice ID
        let invoiceId;

        if (patientPayments.length > 0) {
            // Use existing payment's invoice pattern
            const lastPayment = patientPayments[patientPayments.length - 1];
            const lastInvoiceNum = parseInt(lastPayment.invoiceId?.split('-')[1] || '0');
            invoiceId = `INV-${String(lastInvoiceNum + 1).padStart(5, '0')}`;
        } else if (patientAppointments.length > 0) {
            // Generate based on appointment count
            invoiceId = `INV-${String(patientId).padStart(3, '0')}${String(patientAppointments.length).padStart(2, '0')}`;
        } else {
            // New patient, generate new invoice ID
            const totalInvoices = payments.length;
            invoiceId = `INV-${String(totalInvoices + 1).padStart(5, '0')}`;
        }

        $('#invoiceIdField').val(invoiceId);
    };

    function getPaymentForm() {
        const today = new Date().toISOString().split('T')[0];

        return `
            <form id="paymentForm" onsubmit="handlePaymentSubmit(event)">
                <!-- Document Information -->
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-file-invoice"></i>
                        ${currentLanguage === 'en' ? 'Document Information' : 'ព័ត៌មានឯកសារ'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Ref No' : 'លេខយោង'}</label>
                            <input type="text" class="form-input" name="refNo" placeholder="REF-001">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Doc Date' : 'កាលបរិច្ឆេទឯកសារ'} <span class="required">*</span></label>
                            <input type="date" class="form-input" name="docDate" value="${today}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Date' : 'កាលបរិច្ឆេទ'} <span class="required">*</span></label>
                            <input type="date" class="form-input" name="date" value="${today}" required>
                        </div>
                            <input type="date" class="form-input" name="dueDate">
                        </div>
                    </div>
                </div>

                <!-- Patient Information -->
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-user"></i>
                        ${currentLanguage === 'en' ? 'Patient Information' : 'ព័ត៌មានអ្នកជំងឺ'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Patient Name' : 'ឈ្មោះអ្នកជំងឺ'} <span class="required">*</span></label>
                            <select class="form-select" name="patientId" id="paymentPatientSelect" required onchange="loadPatientInvoice()">
                                <option value="">--- ${currentLanguage === 'en' ? 'Select Patient' : 'ជ្រើសរើសអ្នកជំងឺ'} ---</option>
                                ${mockPatients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Invoice ID' : 'លេខវិក្កយបត្រ'}</label>
                            <input type="text" class="form-input" name="invoiceId" id="invoiceIdField" readonly style="background: #f3f4f6; cursor: not-allowed;" placeholder="${currentLanguage === 'en' ? 'Auto-generated' : 'បង្កើតស្វ័យប្រវត្តិ'}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Next Schedule' : 'កាលវិភាគបន្ទាប់'}</label>
                            <input type="date" class="form-input" name="nextSchedule">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Patient Phone' : 'ទូរស័ព្ទអ្នកជំងឺ'}</label>
                            <input type="text" class="form-input" name="patientPhone" id="patientPhoneField" readonly style="background: #f3f4f6;">
                        </div>
                    </div>
                </div>

                <!-- Payment Amounts -->
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-calculator"></i>
                        ${currentLanguage === 'en' ? 'Payment Calculation' : 'ការគណនាទូទាត់'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Total Amount' : 'ចំនួនសរុប'} <span class="required">*</span></label>
                            <input type="number" class="form-input" name="totalAmount" id="totalAmount" step="0.01" min="0" required oninput="calculatePaymentTotals()">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Discount Type' : 'ប្រភេទបញ្ចុះតម្លៃ'}</label>
                            <select class="form-select" name="discountType" id="discountType" onchange="calculatePaymentTotals()">
                                <option value="amount">${currentLanguage === 'en' ? 'Amount' : 'ចំនួន'}</option>
                                <option value="percent">${currentLanguage === 'en' ? 'Percent (%)' : 'ភាគរយ (%)'}</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Discount Value' : 'តម្លៃបញ្ចុះតម្លៃ'}</label>
                            <input type="number" class="form-input" name="discountValue" id="discountValue" step="0.01" min="0" value="0" oninput="calculatePaymentTotals()">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Grand Total' : 'សរុបចុងក្រោយ'} <span class="required">*</span></label>
                            <input type="number" class="form-input" name="grandTotal" id="grandTotal" step="0.01" readonly style="background: #f3f4f6; font-weight: 600;">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Paid Amount' : 'ចំនួនទូទាត់'} <span class="required">*</span></label>
                            <input type="number" class="form-input" name="paidAmount" id="paidAmount" step="0.01" min="0" required oninput="calculatePaymentTotals()">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Remaining Balance' : 'សមតុល្យនៅសល់'}</label>
                            <input type="number" class="form-input" name="remainingBalance" id="remainingBalance" step="0.01" readonly style="background: #f3f4f6; font-weight: 600; color: #dc2626;">
                        </div>
                    </div>
                </div>

                <!-- Payment Method & Details -->
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-credit-card"></i>
                        ${currentLanguage === 'en' ? 'Payment Details' : 'ព័ត៌មានការទូទាត់'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Method' : 'វិធីសាស្ត្រ'} <span class="required">*</span></label>
                            <select class="form-select" name="method" required>
                                <option value="">--- ${currentLanguage === 'en' ? 'Select' : 'ជ្រើសរើស'} ---</option>
                                <option value="cash">${currentLanguage === 'en' ? 'Cash' : 'សាច់ប្រាក់'}</option>
                                <option value="card">${currentLanguage === 'en' ? 'Credit/Debit Card' : 'កាត'}</option>
                                <option value="bank-transfer">${currentLanguage === 'en' ? 'Bank Transfer' : 'ផ្ទេរប្រាក់'}</option>
                                <option value="mobile-payment">${currentLanguage === 'en' ? 'Mobile Payment' : 'ទូទាត់ចល័ត'}</option>
                                <option value="check">${currentLanguage === 'en' ? 'Check' : 'មូលប្បទានប័ត្រ'}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Account' : 'គណនី'}</label>
                            <input type="text" class="form-input" name="account" placeholder="${currentLanguage === 'en' ? 'Account number or name' : 'លេខគណនីឬឈ្មោះ'}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Currency' : 'រូបិយប័ណ្ណ'} <span class="required">*</span></label>
                            <select class="form-select" name="currency" required>
                                <option value="USD" selected>USD ($)</option>
                                <option value="KHR">KHR (៛)</option>
                                <option value="THB">THB (฿)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Remark' : 'កំណត់សំគាល់'}</label>
                            <input type="text" class="form-input" name="remark" placeholder="${currentLanguage === 'en' ? 'Additional notes' : 'កំណត់ចំណាំបន្ថែម'}">
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                        <i class="fas fa-times"></i>
                        ${currentLanguage === 'en' ? 'Cancel' : 'បោះបង់'}
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-check-circle"></i>
                        ${currentLanguage === 'en' ? 'Receive Payment' : 'ទទួលការទូទាត់'}
                    </button>
                </div>
            </form>
        `;
    }

    function getEmployeeForm() {
        return `
            <form id="employeeForm" onsubmit="handleEmployeeSubmit(event)">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-user-tie"></i>
                        ${currentLanguage === 'en' ? 'Employee Information' : 'ព័ត៌មានបុគ្គលិក'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Full Name' : 'ឈ្មោះពេញ'} <span class="required">*</span></label>
                            <input type="text" class="form-input" name="fullName" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Employee ID' : 'លេខសម្គាល់បុគ្គលិក'}</label>
                            <input type="text" class="form-input" name="employeeId" placeholder="EMP-001">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Position' : 'មុខតំណែង'} <span class="required">*</span></label>
                            <select class="form-select" name="position" required>
                                <option value="">--- ${currentLanguage === 'en' ? 'Select' : 'ជ្រើសរើស'} ---</option>
                                <option value="doctor">${currentLanguage === 'en' ? 'Doctor' : 'គ្រូពេទ្យ'}</option>
                                <option value="dentist">${currentLanguage === 'en' ? 'Dentist' : 'ទន្តពេទ្យ'}</option>
                                <option value="nurse">${currentLanguage === 'en' ? 'Nurse' : 'គិលានុបដ្ឋាយិកា'}</option>
                                <option value="receptionist">${currentLanguage === 'en' ? 'Receptionist' : 'អ្នកទទួលភ្ញៀវ'}</option>
                                <option value="admin">${currentLanguage === 'en' ? 'Administrator' : 'រដ្ឋបាល'}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Department' : 'នាយកដ្ឋាន'} <span class="required">*</span></label>
                            <input type="text" class="form-input" name="department" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Email' : 'អ៊ីមែល'} <span class="required">*</span></label>
                            <input type="email" class="form-input" name="email" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Phone Number' : 'លេខទូរស័ព្ទ'} <span class="required">*</span></label>
                            <input type="tel" class="form-input" name="phone" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Start Date' : 'ថ្ងៃចាប់ផ្តើម'}</label>
                            <input type="date" class="form-input" name="startDate">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Salary' : 'ប្រាក់ខែ'}</label>
                            <input type="number" class="form-input" name="salary" step="0.01">
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                        ${currentLanguage === 'en' ? 'Cancel' : 'បោះបង់'}
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${currentLanguage === 'en' ? 'Create Employee' : 'បង្កើតបុគ្គលិក'}
                    </button>
                </div>
            </form>
        `;
    }

    function getPrescriptionForm() {
        return `
            <form id="prescriptionForm" onsubmit="handlePrescriptionSubmit(event)">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-prescription"></i>
                        ${currentLanguage === 'en' ? 'Prescription Details' : 'ព័ត៌មានវេជ្ជបញ្ជា'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Patient Name' : 'ឈ្មោះអ្នកជំងឺ'} <span class="required">*</span></label>
                            <select class="form-select" name="patientId" required>
                                <option value="">--- ${currentLanguage === 'en' ? 'Select Patient' : 'ជ្រើសរើសអ្នកជំងឺ'} ---</option>
                                ${mockPatients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Prescribing Doctor' : 'វេជ្ជបណ្ឌិត'} <span class="required">*</span></label>
                            <select class="form-select" name="providerId" required>
                                <option value="">--- ${currentLanguage === 'en' ? 'Select Doctor' : 'ជ្រើសរើសវេជ្ជបណ្ឌិត'} ---</option>
                                ${mockProviders.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-pills"></i>
                        ${currentLanguage === 'en' ? 'Medication' : 'ថ្នាំ'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Medication Name' : 'ឈ្មោះថ្នាំ'} <span class="required">*</span></label>
                            <input type="text" class="form-input" name="medication" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Dosage' : 'ទំហំ'} <span class="required">*</span></label>
                            <input type="text" class="form-input" name="dosage" placeholder="e.g., 500mg" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Frequency' : 'ប្រេកង់'} <span class="required">*</span></label>
                            <input type="text" class="form-input" name="frequency" placeholder="e.g., 3 times daily" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Duration' : 'រយៈពេល'} <span class="required">*</span></label>
                            <input type="text" class="form-input" name="duration" placeholder="e.g., 7 days" required>
                        </div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Instructions' : 'សេចក្តីណែនាំ'}</label>
                            <textarea class="form-textarea" name="instructions" placeholder="${currentLanguage === 'en' ? 'Take with food...' : 'ញ៉ាំជាមួយអាហារ...'}"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                        ${currentLanguage === 'en' ? 'Cancel' : 'បោះបង់'}
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${currentLanguage === 'en' ? 'Create Prescription' : 'បង្កើតវេជ្ជបញ្ជា'}
                    </button>
                </div>
            </form>
        `;
    }

    function getServicesForm() {
        return `
            <form id="servicesForm" onsubmit="handleServicesSubmit(event)">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-hand-holding-medical"></i>
                        ${currentLanguage === 'en' ? 'Service Details' : 'ព័ត៌មានសេវាកម្ម'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Service Name' : 'ឈ្មោះសេវាកម្ម'} <span class="required">*</span></label>
                            <input type="text" class="form-input" name="serviceName" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Service Code' : 'លេខកូដសេវា'}</label>
                            <input type="text" class="form-input" name="serviceCode" placeholder="SVC-001">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Category' : 'ប្រភេទ'} <span class="required">*</span></label>
                            <select class="form-select" name="category" required>
                                <option value="">--- ${currentLanguage === 'en' ? 'Select' : 'ជ្រើសរើស'} ---</option>
                                <option value="consultation">${currentLanguage === 'en' ? 'Consultation' : 'ពិគ្រោះ'}</option>
                                <option value="procedure">${currentLanguage === 'en' ? 'Procedure' : 'វិធីសាស្រ្ត'}</option>
                                <option value="diagnostic">${currentLanguage === 'en' ? 'Diagnostic' : 'ការវិនិច្ឆ័យ'}</option>
                                <option value="therapy">${currentLanguage === 'en' ? 'Therapy' : 'ការព្យាបាល'}</option>
                                <option value="surgery">${currentLanguage === 'en' ? 'Surgery' : 'វះកាត់'}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Price (USD)' : 'តម្លៃ (ដុល្លារ)'} <span class="required">*</span></label>
                            <input type="number" class="form-input" name="price" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Duration (minutes)' : 'រយៈពេល (នាទី)'}</label>
                            <input type="number" class="form-input" name="duration">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Status' : 'ស្ថានភាព'}</label>
                            <select class="form-select" name="status">
                                <option value="active">${currentLanguage === 'en' ? 'Active' : 'សកម្ម'}</option>
                                <option value="inactive">${currentLanguage === 'en' ? 'Inactive' : 'អសកម្ម'}</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Description' : 'ពិពណ៌នា'}</label>
                            <textarea class="form-textarea" name="description"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                        ${currentLanguage === 'en' ? 'Cancel' : 'បោះបង់'}
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${currentLanguage === 'en' ? 'Create Service' : 'បង្កើតសេវាកម្ម'}
                    </button>
                </div>
            </form>
        `;
    }

    // Form Submit Handlers
    window.handleAppointmentSubmit = function (e, editId = null) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const patient = mockPatients.find(p => p.id == data.patientId);
        const provider = mockProviders.find(p => p.id == data.providerId);

        // Build date/time from separate fields
        const appointmentDate = data.appointmentDate || formatDateKey(new Date());
        const startTime = data.startTime || '09:00';
        const endTime = data.endTime || '10:00';
        const dateStart = `${appointmentDate} ${startTime}`;
        const dateEnd = `${appointmentDate} ${endTime}`;

        const appointmentData = {
            id: editId || Date.now(),
            patientId: parseInt(data.patientId),
            patientName: patient ? patient.name : '',
            providerId: parseInt(data.providerId),
            providerName: provider ? provider.name : '',
            treatmentCategory: data.treatmentCategory,
            roomNumber: parseInt(data.roomNumber) || 1,
            title: data.title || 'Appointment',
            dateStart: dateStart,
            dateEnd: dateEnd,
            type: data.type || 'appointment',
            notes: data.notes || ''
        };

        if (editId) {
            const index = appointments.findIndex(a => a.id === editId);
            if (index !== -1) {
                appointments[index] = appointmentData;
            }
        } else {
            appointments.push(appointmentData);
        }

        localStorage.setItem('calendar-appointments', JSON.stringify(appointments));
        renderCalendar();
        renderAppointments();

        closeSlidePanel();
        alert(currentLanguage === 'en'
            ? (editId ? 'Appointment updated!' : 'Appointment created!')
            : (editId ? 'បានធ្វើបច្ចុប្បន្នភាពការណាត់ជួប!' : 'បានបង្កើតការណាត់ជួប!'));
    };

    window.handlePatientSubmit = function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Patient Data:', data);

        closeSlidePanel();
        alert(currentLanguage === 'en' ? 'Patient created successfully!' : 'បានបង្កើតអ្នកជំងឺដោយជោគជ័យ!');
    };

    window.handleLabOrderSubmit = function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Lab Order Data:', data);

        closeSlidePanel();
        alert(currentLanguage === 'en' ? 'Lab order created successfully!' : 'បានបង្កើតសំណើមន្ទីរពិសោធន៍ដោយជោគជ័យ!');
    };

    window.handlePaymentSubmit = function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Extract form values
        const patientId = parseInt(formData.get('patientId'));
        const patient = mockPatients.find(p => p.id === patientId);

        const totalAmount = parseFloat(formData.get('totalAmount'));
        const discountType = formData.get('discountType');
        const discountValue = parseFloat(formData.get('discountValue')) || 0;
        const grandTotal = parseFloat(formData.get('grandTotal'));
        const paidAmount = parseFloat(formData.get('paidAmount'));
        const remainingBalance = parseFloat(formData.get('remainingBalance'));

        // Validate paid amount
        if (paidAmount > grandTotal) {
            alert(currentLanguage === 'en' ?
                'Paid amount cannot exceed grand total!' :
                'ចំនួនទូទាត់មិនអាចលើសពីសរុបចុងក្រោយ!');
            return;
        }

        if (paidAmount < 0) {
            alert(currentLanguage === 'en' ?
                'Paid amount must be positive!' :
                'ចំនួនទូទាត់ត្រូវតែជាចំនួនវិជ្ជមាន!');
            return;
        }

        // Create payment record
        const payment = {
            id: Date.now(),
            refNo: formData.get('refNo') || '',
            invoiceId: formData.get('invoiceId') || '',
            patientId: patientId,
            patientName: patient.name,
            patientPhone: patient.phone || '',
            paidDate: formData.get('paidDate'),
            docDate: formData.get('docDate'),
            date: formData.get('date'),
            dueDate: formData.get('dueDate') || null,
            totalAmount: totalAmount,
            discountType: discountType,
            discountValue: discountValue,
            grandTotal: grandTotal,
            paidAmount: paidAmount,
            remainingBalance: remainingBalance,
            method: formData.get('method'),
            account: formData.get('account') || '',
            currency: formData.get('currency'),
            nextSchedule: formData.get('nextSchedule') || null,
            remark: formData.get('remark') || '',
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        payments.push(payment);
        localStorage.setItem('calendar-payments', JSON.stringify(payments));

        console.log('Payment saved:', payment);

        closeSlidePanel();
        showNotification(
            currentLanguage === 'en' ?
                `Payment received successfully! Invoice: ${payment.invoiceId}` :
                `បានទទួលការទូទាត់ដោយជោគជ័យ! វិក្កយបត្រ: ${payment.invoiceId}`,
            'success'
        );
    };

    window.handleEmployeeSubmit = function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Employee Data:', data);

        closeSlidePanel();
        alert(currentLanguage === 'en' ? 'Employee created successfully!' : 'បានបង្កើតបុគ្គលិកដោយជោគជ័យ!');
    };

    window.handlePrescriptionSubmit = function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Prescription Data:', data);

        closeSlidePanel();
        alert(currentLanguage === 'en' ? 'Prescription created successfully!' : 'បានបង្កើតវេជ្ជបញ្ជាដោយជោគជ័យ!');
    };

    window.handleServicesSubmit = function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Service Data:', data);

        closeSlidePanel();
        alert(currentLanguage === 'en' ? 'Service created successfully!' : 'បានបង្កើតសេវាកម្មដោយជោគជ័យ!');
    };

    // Make closeSlidePanel global
    window.closeSlidePanel = closeSlidePanel;

    // ====================
    // QUICK ACTION DROPDOWN
    // ====================

    let userRole = localStorage.getItem('user-role') || 'staff';

    const quickActionTranslations = {
        en: {
            quickAction: 'New',
            dropdownTitle: 'Quick Actions'
        },
        kh: {
            quickAction: 'ថ្មី',
            dropdownTitle: 'សកម្មភាពរហ័ស'
        }
    };

    function updateQuickActionLanguage() {
        $('#quickActionText').text(quickActionTranslations[currentLanguage].quickAction);
        $('#dropdownTitle').text(quickActionTranslations[currentLanguage].dropdownTitle);

        $('.action-label').each(function () {
            const $label = $(this);
            const enText = $label.attr('data-en');
            const khText = $label.attr('data-kh');
            $label.text(currentLanguage === 'en' ? enText : khText);
        });
    }

    $('#quickActionBtn').click(function (e) {
        e.stopPropagation();
        const $dropdown = $('#quickActionDropdown');
        const isOpen = $dropdown.hasClass('show');

        if (isOpen) {
            closeQuickActionDropdown();
        } else {
            openQuickActionDropdown();
        }
    });

    function openQuickActionDropdown() {
        $('#quickActionDropdown').addClass('show');
        $('#quickActionBtn').attr('aria-expanded', 'true');
        filterActionsByPermission();

        setTimeout(() => {
            $('.quick-action-item:visible:first').focus();
        }, 100);
    }

    function closeQuickActionDropdown() {
        $('#quickActionDropdown').removeClass('show');
        $('#quickActionBtn').attr('aria-expanded', 'false');
    }

    $(document).click(function (e) {
        if (!$(e.target).closest('.quick-action-wrapper').length) {
            closeQuickActionDropdown();
        }
    });

    $(document).keydown(function (e) {
        if (e.key === 'Escape') {
            closeQuickActionDropdown();
            closeSlidePanel();
        }
    });

    function filterActionsByPermission() {
        $('.quick-action-item').each(function () {
            const $item = $(this);
            const requiredPermission = $item.attr('data-permission');

            const canAccess = (
                userRole === 'admin' ||
                (userRole === 'clinical' && requiredPermission !== 'admin') ||
                (userRole === 'staff' && requiredPermission === 'staff')
            );

            if (canAccess) {
                $item.show();
            } else {
                $item.hide();
            }
        });
    }

    $('.quick-action-item').click(function () {
        const action = $(this).attr('data-action');
        handleQuickAction(action);
        closeQuickActionDropdown();
    });

    $('.quick-action-item').keydown(function (e) {
        const $items = $('.quick-action-item:visible');
        const currentIndex = $items.index(this);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % $items.length;
            $items.eq(nextIndex).focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + $items.length) % $items.length;
            $items.eq(prevIndex).focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            $(this).click();
        }
    });

    function handleQuickAction(action) {
        openSlidePanel(action);
    }

    // Language Toggle
    $('#langToggle').click(function () {
        currentLanguage = currentLanguage === 'en' ? 'kh' : 'en';
        localStorage.setItem('calendar-language', currentLanguage);
        const flag = currentLanguage === 'en' ? '🇬🇧' : '🇰🇭';
        const text = currentLanguage === 'en' ? 'English' : 'ខ្មែរ';
        $(this).find('.lang-flag').text(flag);
        $(this).find('#langText').text(text);

        updateQuickActionLanguage();
        updateSidebarTitle();
        populateProviderFilter();
        renderCalendar();
    });

    // Navigation
    $('.btn-prev-month').click(function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    $('.btn-next-month').click(function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    $('.btn-refresh').click(function () {
        currentDate = new Date();
        renderCalendar();
    });

    // Initialize
    updateQuickActionLanguage();
    updateSidebarTitle();
    populateProviderFilter();

    const flag = currentLanguage === 'en' ? '🇬🇧' : '🇰🇭';
    const text = currentLanguage === 'en' ? 'English' : 'ខ្មែរ';
    $('#langToggle').find('.lang-flag').text(flag);
    $('#langToggle').find('#langText').text(text);

    holidaysCache = {};
    buddhistEventsCache = {};

    // ====================
    // CURRENT VIEW STATE
    // ====================
    let currentView = 'calendar'; // 'calendar', 'timeline', 'dashboard'
    let timelineDate = new Date();

    // ====================
    // TIMELINE STATE MANAGEMENT
    // ====================
    // UX Pattern: Store user preferences and view state
    let timelineViewMode = localStorage.getItem('timeline-view-mode') || 'multi'; // 'multi', 'focus', 'compact'
    let timelineSelectedProviders = JSON.parse(localStorage.getItem('timeline-selected-providers') || '[]');
    let timelineUserRole = localStorage.getItem('user-role') || 'receptionist'; // 'receptionist', 'doctor'

    // If no providers selected, select all by default
    if (timelineSelectedProviders.length === 0) {
        timelineSelectedProviders = mockProviders.map(p => p.id);
    }

    // ====================
    // VIEW TOGGLE
    // ====================
    $('#viewCalendar').click(function () {
        switchView('calendar');
    });

    $('#viewTimeline').click(function () {
        switchView('timeline');
    });

    $('#viewDashboard').click(function () {
        switchView('dashboard');
    });

    function switchView(view) {
        currentView = view;

        // Update button states
        $('.view-btn').removeClass('active');
        $(`#view${view.charAt(0).toUpperCase() + view.slice(1)}`).addClass('active');

        // Show/hide sections
        $('#calendarMain, #appointmentsSidebar').toggle(view === 'calendar');
        $('#timelineSection').toggle(view === 'timeline');
        $('#dashboardSection').toggle(view === 'dashboard');

        // Render appropriate view
        if (view === 'timeline') {
            renderTimeline();
        } else if (view === 'dashboard') {
            renderDashboard();
        }
    }

    // ====================
    // GLOBAL SEARCH
    // ====================
    let searchTimeout;
    let activeSearchFilter = 'all';

    $('#globalSearch').on('input', function () {
        const query = $(this).val().trim().toLowerCase();

        clearTimeout(searchTimeout);

        if (query.length < 2) {
            $('#searchResults').hide();
            $('#searchClear').hide();
            $('#searchFilters').hide();
            return;
        }

        $('#searchClear').show();
        $('#searchFilters').show();

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });

    $('#searchClear').click(function () {
        $('#globalSearch').val('');
        $('#searchResults').hide();
        $('#searchFilters').hide();
        $(this).hide();
        activeSearchFilter = 'all';
        $('.search-filter-chip').removeClass('active');
        $('.search-filter-chip[data-filter="all"]').addClass('active');
    });

    // Filter chip click handlers
    $(document).on('click', '.search-filter-chip', function () {
        activeSearchFilter = $(this).data('filter');
        $('.search-filter-chip').removeClass('active');
        $(this).addClass('active');

        const query = $('#globalSearch').val().trim().toLowerCase();
        if (query.length >= 2) {
            performSearch(query);
        }
    });

    function performSearch(query) {
        const results = {
            all: [],
            appointments: [],
            patients: [],
            queue: [],
            followup: []
        };

        // Search patients
        mockPatients.forEach(patient => {
            if (patient.name.toLowerCase().includes(query) ||
                patient.phone.includes(query)) {
                const patientApts = appointments.filter(a => a.patientId === patient.id);
                const upcomingCount = patientApts.filter(a => new Date(a.dateStart) > new Date()).length;
                const lastVisit = patientApts.length > 0 ?
                    patientApts.sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart))[0] : null;

                const result = {
                    type: 'patient',
                    icon: 'fa-user',
                    title: patient.name,
                    subtitle: patient.phone,
                    upcomingCount,
                    lastVisit,
                    data: patient
                };
                results.patients.push(result);
                results.all.push(result);
            }
        });

        // Search appointments
        appointments.forEach(apt => {
            if (apt.patientName.toLowerCase().includes(query) ||
                apt.providerName.toLowerCase().includes(query) ||
                apt.title.toLowerCase().includes(query) ||
                (apt.treatment && apt.treatment.toLowerCase().includes(query))) {

                const dateObj = new Date(apt.dateStart);
                const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const time = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                const provider = mockProviders.find(p => p.id === apt.providerId);

                const result = {
                    type: 'appointment',
                    icon: 'fa-calendar-check',
                    title: `${date}, ${time}`,
                    patient: apt.patientName,
                    provider: apt.providerName,
                    treatment: apt.treatment || 'General',
                    room: apt.roomNumber || 1,
                    status: apt.type,
                    statusColor: appointmentTypes.find(t => t.value === apt.type)?.color || '#3b82f6',
                    data: apt
                };
                results.appointments.push(result);
                results.all.push(result);
            }
        });

        // Search queue (appointments that are arrived/ready/in-treatment)
        const queueStatuses = ['arrived', 'ready', 'in-treatment'];
        appointments.forEach(apt => {
            if (queueStatuses.includes(apt.type) &&
                (apt.patientName.toLowerCase().includes(query) ||
                    apt.providerName.toLowerCase().includes(query))) {

                const dateObj = new Date(apt.dateStart);
                const arrivedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                const waitMinutes = Math.floor((new Date() - dateObj) / 60000);
                const provider = mockProviders.find(p => p.id === apt.providerId);

                const result = {
                    type: 'queue',
                    icon: 'fa-list-ul',
                    title: apt.patientName,
                    provider: apt.providerName,
                    status: apt.type,
                    statusLabel: appointmentTypes.find(t => t.value === apt.type)?.label || apt.type,
                    room: apt.roomNumber || 1,
                    arrivedTime,
                    waitMinutes,
                    urgency: waitMinutes > 30 ? 'high' : waitMinutes > 15 ? 'medium' : 'low',
                    data: apt
                };
                results.queue.push(result);
                results.all.push(result);
            }
        });

        // Search follow-ups (appointments with needs-followup status or future scheduled follow-ups)
        appointments.forEach(apt => {
            if (apt.type === 'needs-followup' &&
                (apt.patientName.toLowerCase().includes(query) ||
                    apt.treatment?.toLowerCase().includes(query))) {

                const dateObj = new Date(apt.dateStart);
                const visitDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const provider = mockProviders.find(p => p.id === apt.providerId);

                // Calculate suggested follow-up date (2 weeks after visit)
                const followupDate = new Date(dateObj);
                followupDate.setDate(followupDate.getDate() + 14);
                const daysUntil = Math.ceil((followupDate - new Date()) / (1000 * 60 * 60 * 24));

                const result = {
                    type: 'followup',
                    icon: 'fa-redo',
                    title: apt.patientName,
                    treatment: apt.treatment || 'General follow-up',
                    originalVisit: visitDate,
                    provider: apt.providerName,
                    dueDate: followupDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    daysUntil,
                    isOverdue: daysUntil < 0,
                    data: apt
                };
                results.followup.push(result);
                results.all.push(result);
            }
        });

        // Update filter counts
        $('.search-filter-chip[data-filter="all"] .filter-count').text(results.all.length ? `(${results.all.length})` : '');
        $('.search-filter-chip[data-filter="appointments"] .filter-count').text(results.appointments.length ? `(${results.appointments.length})` : '');
        $('.search-filter-chip[data-filter="patients"] .filter-count').text(results.patients.length ? `(${results.patients.length})` : '');
        $('.search-filter-chip[data-filter="queue"] .filter-count').text(results.queue.length ? `(${results.queue.length})` : '');
        $('.search-filter-chip[data-filter="followup"] .filter-count').text(results.followup.length ? `(${results.followup.length})` : '');

        renderSearchResults(results);
    }

    function renderSearchResults(results) {
        const $container = $('#searchResults');
        const displayResults = activeSearchFilter === 'all' ? results.all : results[activeSearchFilter];

        if (displayResults.length === 0) {
            const filterLabel = activeSearchFilter.charAt(0).toUpperCase() + activeSearchFilter.slice(1);
            $container.html(`<div class="search-no-results"><i class="fas fa-search"></i><p>No ${filterLabel} found</p><small>Try another filter or search term</small></div>`);
            $container.show();
            return;
        }

        let html = '';
        displayResults.slice(0, 20).forEach(result => {
            html += renderResultCard(result);
        });

        if (displayResults.length > 20) {
            html += `<div class="search-more"><i class="fas fa-ellipsis-h"></i> +${displayResults.length - 20} more results</div>`;
        }

        $container.html(html);
        $container.show();
    }

    function renderResultCard(result) {
        switch (result.type) {
            case 'appointment':
                return `
                    <div class="search-result-card search-result-appointment" data-type="${result.type}" data-id="${result.data.id}">
                        <div class="result-status-dot" style="background: ${result.statusColor}"></div>
                        <div class="result-main">
                            <div class="result-header">
                                <span class="result-title">${result.title}</span>
                                <span class="result-badge">📅 APT</span>
                            </div>
                            <div class="result-details">
                                <span><i class="fas fa-user"></i> ${result.patient}</span>
                                <span><i class="fas fa-tooth"></i> ${result.treatment}</span>
                                <span><i class="fas fa-door-open"></i> Room ${result.room}</span>
                            </div>
                            <div class="result-provider">${result.provider}</div>
                        </div>
                        <div class="result-actions">
                            <button class="result-action-btn" onclick="event.stopPropagation(); editAppointment(${result.data.id})"><i class="fas fa-eye"></i></button>
                        </div>
                    </div>
                `;

            case 'patient':
                const lastVisitText = result.lastVisit ?
                    `Last: ${new Date(result.lastVisit.dateStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${result.lastVisit.providerName})` :
                    'No previous visits';
                return `
                    <div class="search-result-card search-result-patient" data-type="${result.type}" data-id="${result.data.id}">
                        <div class="result-icon"><i class="fas fa-user"></i></div>
                        <div class="result-main">
                            <div class="result-header">
                                <span class="result-title">${result.title}</span>
                                <span class="result-badge">👤 PAT</span>
                            </div>
                            <div class="result-details">
                                <span><i class="fas fa-phone"></i> ${result.subtitle}</span>
                                <span><i class="fas fa-calendar-alt"></i> ${result.upcomingCount} upcoming</span>
                            </div>
                            <div class="result-meta">${lastVisitText}</div>
                        </div>
                        <div class="result-actions">
                            <button class="result-action-btn" onclick="event.stopPropagation(); showPatientHistory(${result.data.id})"><i class="fas fa-eye"></i></button>
                        </div>
                    </div>
                `;

            case 'queue':
                const urgencyClass = result.urgency === 'high' ? 'urgency-high' : result.urgency === 'medium' ? 'urgency-medium' : '';
                return `
                    <div class="search-result-card search-result-queue ${urgencyClass}" data-type="${result.type}" data-id="${result.data.id}">
                        <div class="result-icon"><i class="fas fa-bell"></i></div>
                        <div class="result-main">
                            <div class="result-header">
                                <span class="result-title">${result.title}</span>
                                <span class="result-badge">📋 QUEUE</span>
                            </div>
                            <div class="result-details">
                                <span class="status-pill status-${result.status}">${result.statusLabel}</span>
                                <span><i class="fas fa-user-md"></i> ${result.provider}</span>
                                <span><i class="fas fa-door-open"></i> Rm ${result.room}</span>
                            </div>
                            <div class="result-meta">Arrived: ${result.arrivedTime} (${result.waitMinutes} min ago)</div>
                        </div>
                        <div class="result-actions">
                            <button class="result-action-btn" onclick="event.stopPropagation(); editAppointment(${result.data.id})"><i class="fas fa-eye"></i></button>
                        </div>
                    </div>
                `;

            case 'followup':
                const overdueClass = result.isOverdue ? 'followup-overdue' : '';
                const dueText = result.isOverdue ?
                    `Overdue by ${Math.abs(result.daysUntil)} days` :
                    result.daysUntil === 0 ? 'Due today' :
                        `Due in ${result.daysUntil} days`;
                return `
                    <div class="search-result-card search-result-followup ${overdueClass}" data-type="${result.type}" data-id="${result.data.id}">
                        <div class="result-icon"><i class="fas fa-redo"></i></div>
                        <div class="result-main">
                            <div class="result-header">
                                <span class="result-title">${result.title}</span>
                                <span class="result-badge">🔄 F/UP</span>
                            </div>
                            <div class="result-details">
                                <span class="due-date">${result.dueDate} • ${dueText}</span>
                            </div>
                            <div class="result-meta">
                                <span><i class="fas fa-tooth"></i> ${result.treatment}</span>
                                <span>From: ${result.originalVisit} visit</span>
                            </div>
                        </div>
                        <div class="result-actions">
                            <button class="result-action-btn" onclick="event.stopPropagation(); editAppointment(${result.data.id})"><i class="fas fa-eye"></i></button>
                        </div>
                    </div>
                `;

            default:
                return '';
        }
    }

    $(document).on('click', '.search-result-card', function () {
        const type = $(this).data('type');
        const id = $(this).data('id');

        if (type === 'appointment' || type === 'queue' || type === 'followup') {
            editAppointment(id);
        } else if (type === 'patient') {
            showPatientHistory(id);
        }

        $('#searchResults').hide();
        $('#searchFilters').hide();
        $('#globalSearch').val('');
        $('#searchClear').hide();
    });

    // Close search results when clicking outside
    $(document).click(function (e) {
        if (!$(e.target).closest('.search-wrapper').length) {
            $('#searchResults').hide();
            $('#searchFilters').hide();
        }
    });

    // ====================
    // PATIENT HISTORY
    // ====================
    window.showPatientHistory = function (patientId) {
        const patient = mockPatients.find(p => p.id === patientId);
        if (!patient) return;

        const patientAppointments = appointments.filter(apt => apt.patientId === patientId);

        openSlidePanel('patient-history', { patient, appointments: patientAppointments });
    };

    // ====================
    // DASHBOARD
    // ====================
    function renderDashboard() {
        const today = new Date();
        const todayKey = formatDateKey(today);
        const now = new Date();

        // Get today's appointments with priority scores
        let todayAppointments = appointments.filter(apt =>
            apt.dateStart && apt.dateStart.startsWith(todayKey)
        ).map(apt => calculatePriority(apt));

        // Calculate stats
        const total = todayAppointments.length;
        const followUpCount = appointments.filter(apt => apt.type === 'needs-followup').length;
        const completed = todayAppointments.filter(apt => apt.type === 'completed').length;

        // Calculate today's revenue
        const todayPayments = payments.filter(p => p.paidDate === todayKey);
        const revenue = todayPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

        // Update stat cards with animation
        $('#statTotal').text(total);
        $('#statFollowup').text(followUpCount);
        $('#statCompleted').text(completed);
        $('#statRevenue').text(`$${revenue.toFixed(0)}`);

        // Add trend indicators
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = formatDateKey(yesterday);
        const yesterdayApts = appointments.filter(apt => apt.dateStart && apt.dateStart.startsWith(yesterdayKey)).length;
        const trend = total - yesterdayApts;

        if (trend > 0) {
            $('#statTotalTrend').html(`<span style="color: #10b981"><i class="fas fa-arrow-up"></i> +${trend}</span>`);
        } else if (trend < 0) {
            $('#statTotalTrend').html(`<span style="color: #ef4444"><i class="fas fa-arrow-down"></i> ${trend}</span>`);
        } else {
            $('#statTotalTrend').html(`<span style="color: #6b7280">—</span>`);
        }

        // NOW SERVING - Currently in treatment
        const inTreatment = todayAppointments.filter(apt => apt.type === 'in-treatment');
        if (inTreatment.length > 0) {
            let html = '';
            inTreatment.forEach(apt => {
                const startTime = new Date(apt.dateStart);
                const minutes = Math.floor((now - startTime) / 60000);
                const providerInfo = mockProviders.find(p => p.id === apt.providerId);

                html += `
                    <div class="now-serving-card">
                        <div class="now-serving-header">
                            <span class="now-serving-indicator">🟢 NOW SERVING</span>
                            <span class="now-serving-timer">${minutes} min</span>
                        </div>
                        <div class="now-serving-patient">${apt.patientName}</div>
                        <div class="now-serving-details">
                            <span><i class="fas fa-user-md"></i> ${providerInfo?.name || 'Unknown'}</span>
                            <span><i class="fas fa-door-open"></i> Room ${apt.roomNumber}</span>
                            <span><i class="fas fa-tooth"></i> ${apt.treatment}</span>
                        </div>
                        <button class="btn btn-sm btn-secondary" onclick="editAppointment(${apt.id})">
                            <i class="fas fa-edit"></i> Update Status
                        </button>
                    </div>
                `;
            });
            $('#nextUpcoming').html(html);
        } else {
            $('#nextUpcoming').html(`
                <div class="empty-state">
                    <i class="fas fa-user-clock"></i>
                    <p>No patients currently in treatment</p>
                </div>
            `);
        }

        // READY TO SEE - Checked in and waiting (sorted by priority)
        const readyToSee = todayAppointments
            .filter(apt => apt.type === 'ready' || apt.type === 'arrived')
            .sort((a, b) => b.priorityScore - a.priorityScore);

        if (readyToSee.length > 0) {
            let html = '<div class="ready-list">';
            readyToSee.forEach((apt, index) => {
                const startTime = new Date(apt.dateStart);
                const waitMinutes = Math.floor((now - startTime) / 60000);
                const urgencyClass = apt.priorityScore > 150 ? 'urgent' : apt.priorityScore > 100 ? 'high' : 'normal';
                const urgencyLabel = apt.priorityScore > 150 ? '🔴 URGENT' : apt.priorityScore > 100 ? '🟠 HIGH' : '🟡 NORMAL';

                html += `
                    <div class="ready-item ${urgencyClass}">
                        <div class="ready-priority">
                            <span class="priority-badge">${index + 1}</span>
                            <span class="priority-label">${urgencyLabel}</span>
                        </div>
                        <div class="ready-info">
                            <div class="ready-patient">${apt.patientName}</div>
                            <div class="ready-details">
                                ${apt.treatment} • Waited ${waitMinutes} min
                                ${apt.priorityScore > 150 ? ' • <strong>Pain/Emergency</strong>' : ''}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="startTreatment(${apt.id})">
                            <i class="fas fa-play"></i> Start
                        </button>
                    </div>
                `;
            });
            html += '</div>';
            $('#waitingQueue').html(html);
        } else {
            $('#waitingQueue').html(`
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>No patients waiting</p>
                </div>
            `);
        }

        // PROVIDER STATUS - Show availability
        renderProviderStatus();

        // COMING SOON - Next 2 hours scheduled
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const comingSoon = todayAppointments.filter(apt => {
            const aptTime = new Date(apt.dateStart);
            return aptTime > now && aptTime <= twoHoursLater && apt.type === 'scheduled';
        }).sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));

        if (comingSoon.length > 0) {
            let html = '<div class="coming-soon-list">';
            comingSoon.forEach(apt => {
                const time = apt.dateStart.split(' ')[1]?.substring(0, 5) || 'N/A';
                const aptTime = new Date(apt.dateStart);
                const minutesUntil = Math.floor((aptTime - now) / 60000);
                const provider = mockProviders.find(p => p.id === apt.providerId);

                html += `
                    <div class="coming-soon-item">
                        <div class="coming-soon-time">
                            ${time}
                            <span class="coming-soon-countdown">in ${minutesUntil}m</span>
                        </div>
                        <div class="coming-soon-info">
                            <div class="coming-soon-patient">${apt.patientName}</div>
                            <div class="coming-soon-treatment">${apt.treatment} • ${provider?.name || ''}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            $('#comingSoonList').html(html);
        } else {
            $('#comingSoonList').html(`
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <p>No appointments in next 2 hours</p>
                </div>
            `);
        }

        // NEEDS FOLLOW-UP - Completed treatments requiring follow-up
        const needsFollowUp = appointments.filter(apt => {
            if (apt.type === 'needs-followup') return true;

            // Check if completed treatment requires follow-up
            if (apt.type === 'completed' && apt.treatment) {
                const treatmentKey = apt.treatment.toLowerCase().replace(/\s+/g, '-');
                const rule = treatmentFollowUpRules[treatmentKey];
                if (rule && rule.days > 0) {
                    const completedDate = new Date(apt.dateStart);
                    const followUpDue = new Date(completedDate.getTime() + rule.days * 24 * 60 * 60 * 1000);

                    // Check if no follow-up appointment exists
                    const hasFollowUp = appointments.some(followApt =>
                        followApt.patientId === apt.patientId &&
                        new Date(followApt.dateStart) > completedDate &&
                        followApt.type === 'scheduled'
                    );

                    if (!hasFollowUp) {
                        apt.followUpDue = followUpDue;
                        apt.followUpOverdue = followUpDue < now;
                        return true;
                    }
                }
            }
            return false;
        });

        if (needsFollowUp.length > 0) {
            let html = '<div class="followup-list">';
            needsFollowUp.forEach(apt => {
                const isOverdue = apt.followUpOverdue;
                const dueDate = apt.followUpDue ? apt.followUpDue.toLocaleDateString() : 'ASAP';

                html += `
                    <div class="followup-item ${isOverdue ? 'overdue' : ''}">
                        <div class="followup-header">
                            ${isOverdue ? '<span class="followup-badge overdue">🚨 OVERDUE</span>' : '<span class="followup-badge">⚠️ DUE</span>'}
                        </div>
                        <div class="followup-patient">${apt.patientName}</div>
                        <div class="followup-reason">${apt.treatment} follow-up • Due: ${dueDate}</div>
                        <div class="followup-actions">
                            <button class="btn btn-sm btn-primary" onclick="bookFollowUp(${apt.id})">
                                <i class="fas fa-calendar-plus"></i> Book
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="editAppointment(${apt.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            $('#followupList').html(html);
        } else {
            $('#followupList').html(`
                <div class="empty-state">
                    <i class="fas fa-check-double"></i>
                    <p>All follow-ups scheduled</p>
                </div>
            `);
        }

        // RECENT ACTIVITY - Last 10 actions
        renderRecentActivity();
    }

    // Helper functions for dashboard actions
    window.toggleProviderFilter = function () {
        $('#providerFilterDropdown').toggle();
    };

    window.filterProviderStatus = function () {
        renderProviderStatus();
    };

    function renderProviderStatus() {
        const today = formatDateKey(new Date());
        const now = new Date();

        // Get filter settings
        const showAll = $('input[value="all"]').is(':checked');
        const showAvailable = showAll || $('.provider-status-filter[value="available"]').is(':checked');
        const showBusy = showAll || $('.provider-status-filter[value="busy"]').is(':checked');
        const showOff = $('.provider-status-filter[value="off"]').is(':checked');

        let html = '<div class="provider-status-list">';

        mockProviders.forEach(provider => {
            // Get today's appointments for this provider
            const providerApts = appointments.filter(apt =>
                apt.providerId === provider.id &&
                apt.dateStart && apt.dateStart.startsWith(today)
            );

            // Determine status
            const isInTreatment = providerApts.some(apt => apt.type === 'in-treatment');
            const readyCount = providerApts.filter(apt => apt.type === 'ready' || apt.type === 'arrived').length;
            const todayTotal = providerApts.length;
            const completedToday = providerApts.filter(apt => apt.type === 'completed').length;

            let status, statusIcon, statusClass;
            if (isInTreatment) {
                status = 'Busy';
                statusIcon = '🔴';
                statusClass = 'status-busy';
            } else if (readyCount > 0) {
                status = 'Available';
                statusIcon = '🟢';
                statusClass = 'status-available';
            } else if (todayTotal === 0) {
                status = 'Off Duty';
                statusIcon = '⚪';
                statusClass = 'status-off';
            } else {
                status = 'Available';
                statusIcon = '🟢';
                statusClass = 'status-available';
            }

            // Apply filter
            if (status === 'Busy' && !showBusy) return;
            if (status === 'Available' && !showAvailable) return;
            if (status === 'Off Duty' && !showOff) return;

            html += `
                <div class="provider-status-item ${statusClass}">
                    <div class="provider-avatar" style="background: ${provider.color}">
                        ${provider.name.charAt(0)}
                    </div>
                    <div class="provider-info">
                        <div class="provider-name">${provider.name}</div>
                        <div class="provider-specialty">${provider.specialty}</div>
                        <div class="provider-stats">
                            <span>${statusIcon} ${status}</span>
                            <span>• ${completedToday}/${todayTotal} today</span>
                            ${readyCount > 0 ? `<span>• ${readyCount} waiting</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        $('#providerStatusList').html(html);
    }

    function renderRecentActivity() {
        // Get last 10 activities (appointments created/modified, payments)
        const recentApts = [...appointments]
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);

        const recentPayments = [...payments]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        // Combine and sort by timestamp
        const activities = [];

        recentApts.forEach(apt => {
            activities.push({
                type: 'appointment',
                timestamp: apt.id,
                data: apt
            });
        });

        recentPayments.forEach(payment => {
            activities.push({
                type: 'payment',
                timestamp: new Date(payment.createdAt).getTime(),
                data: payment
            });
        });

        activities.sort((a, b) => b.timestamp - a.timestamp);

        if (activities.length > 0) {
            let html = '<div class="activity-list">';

            activities.slice(0, 8).forEach(activity => {
                const date = new Date(activity.timestamp);
                const timeAgo = getTimeAgo(date);

                if (activity.type === 'appointment') {
                    const apt = activity.data;
                    const statusInfo = appointmentTypes.find(t => t.value === apt.type);
                    html += `
                        <div class="activity-item">
                            <div class="activity-icon" style="background: ${statusInfo?.color || '#3b82f6'}">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="activity-info">
                                <div class="activity-title">${apt.patientName} - ${apt.treatment}</div>
                                <div class="activity-meta">${statusInfo?.label || apt.type} • ${timeAgo}</div>
                            </div>
                        </div>
                    `;
                } else if (activity.type === 'payment') {
                    const payment = activity.data;
                    html += `
                        <div class="activity-item">
                            <div class="activity-icon" style="background: #10b981">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="activity-info">
                                <div class="activity-title">${payment.patientName} paid $${payment.paidAmount}</div>
                                <div class="activity-meta">${payment.method} • ${timeAgo}</div>
                            </div>
                        </div>
                    `;
                }
            });

            html += '</div>';
            $('#recentActivityList').html(html);
        } else {
            $('#recentActivityList').html(`
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No recent activity</p>
                </div>
            `);
        }
    }

    function getTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    window.startTreatment = function (id) {
        const apt = appointments.find(a => a.id === id);
        if (apt) {
            apt.type = 'in-treatment';
            localStorage.setItem('calendar-appointments', JSON.stringify(appointments));
            renderCalendar();
            renderAppointments();
            if (currentView === 'dashboard') renderDashboard();
        }
    };

    window.bookFollowUp = function (id) {
        const apt = appointments.find(a => a.id === id);
        if (apt) {
            openSlidePanel('appointment', {
                patientId: apt.patientId,
                patientName: apt.patientName,
                treatment: apt.treatment + ' Follow-up',
                type: 'scheduled'
            });
        }
    };

    window.callPatient = function (phone) {
        alert(`Calling ${phone}...\n\nIn production, this would integrate with your phone system.`);
    };

    let countdownInterval;
    function startCountdown(dateTimeStr) {
        if (countdownInterval) clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            const target = new Date(dateTimeStr.replace(' ', 'T'));
            const now = new Date();
            const diff = target - now;

            if (diff <= 0) {
                $('#countdown').html('<span class="countdown-now">NOW!</span>');
                clearInterval(countdownInterval);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            let text = '';
            if (hours > 0) text += `${hours}h `;
            text += `${minutes}m ${seconds}s`;

            $('#countdown').html(`<span class="countdown-timer">${text}</span>`);
        }, 1000);
    }

    // ====================
    // TIMELINE VIEW
    // ====================
    $('#timelinePrev').click(function () {
        timelineDate.setDate(timelineDate.getDate() - 1);
        renderTimeline();
    });

    $('#timelineNext').click(function () {
        timelineDate.setDate(timelineDate.getDate() + 1);
        renderTimeline();
    });

    $('#timelineToday').click(function () {
        timelineDate = new Date();
        renderTimeline();
    });

    // ====================
    // TIMELINE RENDERING WITH UX PATTERNS
    // ====================
    /**
     * UX Design Patterns Implemented:
     * 
     * 1. FILTERING (for 5+ providers):
     *    - Provider checkboxes with "Select All" quick action
     *    - Persisted selections across sessions
     *    - Visual indicator of active filters
     * 
     * 2. VIEW MODES:
     *    - Multi: Show 3-4 providers side-by-side (default)
     *    - Focus: Single provider in detail
     *    - Compact: More providers, less detail (overview mode)
     * 
     * 3. ROLE-BASED VIEWS:
     *    - Receptionist: See all providers, manage bookings
     *    - Doctor: Auto-focus on their schedule, quick status changes
     * 
     * 4. INTERACTION MODEL:
     *    - Click slot: Book appointment
     *    - Click appointment: Edit details
     *    - Hover: Show quick actions
     *    - No complex gestures (mouse-only, works on tablets)
     */
    function renderTimeline() {
        const dateKey = formatDateKey(timelineDate);
        const today = new Date();
        const isToday = formatDateKey(today) === dateKey;

        // Update header
        const dayName = translations[currentLanguage].daysFull[timelineDate.getDay()];
        const dayNum = timelineDate.getDate();
        const monthName = translations[currentLanguage].months[timelineDate.getMonth()];
        $('#timelineDate').text(isToday ?
            `Today, ${dayNum} ${monthName}` :
            `${dayName}, ${dayNum} ${monthName}`);

        // UX: Render provider filter controls
        renderTimelineControls();

        // Get appointments for this day
        const dayAppointments = appointments.filter(apt =>
            apt.dateStart && apt.dateStart.startsWith(dateKey)
        );

        // UX Pattern: Filter providers based on selection
        const visibleProviders = mockProviders.filter(p =>
            timelineSelectedProviders.includes(p.id)
        );

        // UX Pattern: Adjust column count based on view mode
        const maxColumns = timelineViewMode === 'focus' ? 1 :
            timelineViewMode === 'compact' ? 6 : 3;
        const displayProviders = visibleProviders.slice(0, maxColumns);

        if (displayProviders.length === 0) {
            $('#timelineGrid').html(`
                <div class="timeline-empty-state">
                    <i class="fas fa-user-md"></i>
                    <p>No providers selected</p>
                    <button class="btn btn-primary" onclick="selectAllProviders()">
                        <i class="fas fa-check-double"></i> Select All Providers
                    </button>
                </div>
            `);
            return;
        }

        // Build timeline grid
        let html = '';

        // Provider columns header
        html += `<div class="timeline-providers-header" style="grid-template-columns: 80px repeat(${displayProviders.length}, 1fr);">`;
        html += '<div class="timeline-time-header">Time</div>';
        displayProviders.forEach(provider => {
            const providerApts = dayAppointments.filter(apt => apt.providerId === provider.id);
            const busySlots = providerApts.filter(apt => apt.type === 'in-treatment' || apt.type === 'arrived').length;
            const totalSlots = providerApts.length;

            html += `<div class="timeline-provider-header" style="border-top: 3px solid ${provider.color}">
                <div class="timeline-provider-name">${provider.name.split(' ').pop()}</div>
                <div class="timeline-provider-stats">${totalSlots} apts</div>
                ${timelineViewMode === 'focus' ? `<div class="timeline-provider-specialty">${provider.specialty}</div>` : ''}
            </div>`;
        });
        html += '</div>';

        // Time slots (7 AM to 7 PM)
        for (let hour = 7; hour <= 19; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const nowHour = today.getHours();
            const isCurrentHour = isToday && hour === nowHour;

            html += `<div class="timeline-row ${isCurrentHour ? 'current-hour' : ''}" style="grid-template-columns: 80px repeat(${displayProviders.length}, 1fr);">`;
            html += `<div class="timeline-time">${timeStr}</div>`;

            displayProviders.forEach(provider => {
                const slotApts = dayAppointments.filter(apt => {
                    const aptHour = parseInt(apt.dateStart.split(' ')[1].split(':')[0]);
                    return apt.providerId === provider.id && aptHour === hour;
                });

                // UX: Empty slot is clickable for quick booking
                const isEmptySlot = slotApts.length === 0;
                html += `<div class="timeline-slot ${isEmptySlot ? 'empty-slot' : ''}" 
                         data-provider="${provider.id}" 
                         data-time="${timeStr}" 
                         data-date="${dateKey}"
                         ${isEmptySlot ? `onclick="quickBookAppointment(${provider.id}, '${dateKey}', '${timeStr}')"` : ''}>`;

                slotApts.forEach(apt => {
                    const duration = calculateDuration(apt.dateStart, apt.dateEnd);

                    // UX: Show more/less detail based on view mode
                    const showDetails = timelineViewMode !== 'compact';
                    const showActions = timelineViewMode === 'focus';

                    html += `
                        <div class="timeline-appointment timeline-apt-${apt.type}" 
                             style="background: ${provider.color}20; border-left-color: ${provider.color}"
                             onclick="editAppointment(${apt.id})">
                            <div class="timeline-apt-time">${apt.dateStart.split(' ')[1]} - ${apt.dateEnd.split(' ')[1]}</div>
                            <div class="timeline-apt-patient">${apt.patientName}</div>
                            ${showDetails ? `<div class="timeline-apt-room">Room ${apt.roomNumber}</div>` : ''}
                            ${showDetails && apt.treatment ? `<div class="timeline-apt-treatment">${apt.treatment}</div>` : ''}
                            ${showActions ? `<div class="timeline-apt-actions">
                                ${getQuickActionButtons(apt)}
                            </div>` : ''}
                        </div>
                    `;
                });

                html += '</div>';
            });

            html += '</div>';
        }

        $('#timelineGrid').html(html);
    }

    function calculateDuration(start, end) {
        const startTime = new Date(`2000-01-01T${start.split(' ')[1]}`);
        const endTime = new Date(`2000-01-01T${end.split(' ')[1]}`);
        return (endTime - startTime) / (1000 * 60); // in minutes
    }

    // ====================
    // TIMELINE CONTROL FUNCTIONS
    // ====================
    /**
     * UX Pattern: Provider filtering and view mode controls
     * Rendered above the timeline grid for easy access
     */
    function renderTimelineControls() {
        // Render provider drawer list
        renderProviderDrawer();

        // Update provider count badge
        $('#providerCountBadge').text(timelineSelectedProviders.length);

        // Update view mode active state
        $('.view-pill').removeClass('active');
        $(`.view-pill[data-mode="${timelineViewMode}"]`).addClass('active');
    }

    /**
     * Render provider drawer with beautiful cards
     */
    function renderProviderDrawer() {
        const today = formatDateKey(new Date());

        const html = mockProviders.map(provider => {
            const isSelected = timelineSelectedProviders.includes(provider.id);

            // Get today's appointment stats for this provider
            const todayApts = appointments.filter(apt =>
                apt.providerId === provider.id &&
                apt.dateStart &&
                apt.dateStart.startsWith(today)
            );

            const total = todayApts.length;
            const completed = todayApts.filter(apt => apt.type === 'completed').length;
            const inProgress = todayApts.filter(apt => apt.type === 'in-treatment').length;
            const waiting = todayApts.filter(apt => apt.type === 'arrived' || apt.type === 'ready').length;

            // Determine status
            let statusIcon, statusText, statusClass;
            if (inProgress > 0) {
                statusIcon = '🔴';
                statusText = 'In Treatment';
                statusClass = 'status-busy';
            } else if (waiting > 0) {
                statusIcon = '🟡';
                statusText = `${waiting} Waiting`;
                statusClass = 'status-ready';
            } else if (total > 0) {
                statusIcon = '🟢';
                statusText = 'Available';
                statusClass = 'status-available';
            } else {
                statusIcon = '⚪';
                statusText = 'No Appointments';
                statusClass = 'status-empty';
            }

            return `
                <div class="provider-card ${isSelected ? 'selected' : ''} ${statusClass}" 
                     onclick="toggleProviderSelection(${provider.id})"
                     data-provider-name="${provider.name.toLowerCase()}"
                     data-provider-specialty="${provider.specialty.toLowerCase()}">
                    <div class="provider-card-checkbox">
                        <i class="fas fa-${isSelected ? 'check-circle' : 'circle'}"></i>
                    </div>
                    <div class="provider-card-avatar" style="background: ${provider.color}">
                        ${provider.name.charAt(0)}
                    </div>
                    <div class="provider-card-info">
                        <div class="provider-card-name">${provider.name}</div>
                        <div class="provider-card-specialty">${provider.specialty}</div>
                        <div class="provider-card-status">
                            <span>${statusIcon} ${statusText}</span>
                        </div>
                    </div>
                    <div class="provider-card-stats">
                        <div class="stat-item">
                            <span class="stat-value">${completed}</span>
                            <span class="stat-label">Done</span>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <span class="stat-value">${total}</span>
                            <span class="stat-label">Total</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $('#providerDrawerList').html(html);
    }

    /**
     * Filter provider list by search
     */
    window.filterProviderList = function () {
        const searchTerm = $('#providerSearchInput').val().toLowerCase();
        $('.provider-card').each(function () {
            const name = $(this).data('provider-name');
            const specialty = $(this).data('provider-specialty');
            if (name.includes(searchTerm) || specialty.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    };

    /**
     * Toggle provider drawer (sidebar)
     */
    window.toggleProviderDrawer = function () {
        const drawer = $('#providerDrawer');
        const toggle = $('#providerDrawerToggle');

        if (drawer.hasClass('open')) {
            drawer.removeClass('open');
            toggle.removeClass('active');
        } else {
            drawer.addClass('open');
            toggle.addClass('active');
            renderProviderDrawer(); // Refresh data
        }
    };

    /**
     * UX Pattern: Switch view mode
     * - Multi: Best for receptionists managing multiple doctors
     * - Focus: Best for individual doctors checking their schedule
     * - Compact: Best for overview/planning
     */
    window.switchTimelineMode = function (mode) {
        timelineViewMode = mode;
        localStorage.setItem('timeline-view-mode', mode);
        renderTimeline();
    };

    /**
     * UX Pattern: Toggle provider filter panel
     */
    window.toggleProviderFilter = function () {
        $('#timelineProviderFilter').slideToggle(200);
    };

    /**
     * UX Pattern: Toggle individual provider
     */
    window.toggleProviderSelection = function (providerId) {
        const index = timelineSelectedProviders.indexOf(providerId);
        if (index > -1) {
            // Don't allow deselecting if it's the last one
            if (timelineSelectedProviders.length === 1) {
                showNotification('At least one provider must be selected', 'warning');
                return;
            }
            timelineSelectedProviders.splice(index, 1);
        } else {
            timelineSelectedProviders.push(providerId);
        }
        localStorage.setItem('timeline-selected-providers', JSON.stringify(timelineSelectedProviders));
        renderTimeline();
    };

    /**
     * UX Pattern: Select all providers
     */
    window.selectAllProviders = function () {
        timelineSelectedProviders = mockProviders.map(p => p.id);
        localStorage.setItem('timeline-selected-providers', JSON.stringify(timelineSelectedProviders));
        renderTimeline();
    };

    /**
     * UX Pattern: Clear all providers
     */
    window.clearAllProviders = function () {
        // Keep at least one provider selected
        timelineSelectedProviders = [mockProviders[0].id];
        localStorage.setItem('timeline-selected-providers', JSON.stringify(timelineSelectedProviders));
        renderTimeline();
    };

    /**
     * UX Pattern: Quick book appointment from empty slot
     * 
     * IDEAL UX FLOW:
     * 1. Admin clicks empty time slot (e.g., 10:00 AM, Dr. Sopheap)
     * 2. Form opens instantly with pre-filled data:
     *    - Provider: Dr. Sopheap (locked, shows name clearly)
     *    - Date: 2026-02-02 (locked, shows day name)
     *    - Start Time: 10:00 (locked, but adjustable if needed)
     *    - End Time: 11:00 (auto-calculated, adjustable)
     *    - Type: "Scheduled" (default, can change)
     * 3. Admin only needs to:
     *    - Select patient (required)
     *    - Select treatment category (optional but recommended)
     *    - Select room (optional)
     *    - Add notes (optional)
     * 4. Before saving:
     *    - Check for conflicts (same provider, overlapping time)
     *    - Show warning if conflict found
     *    - Suggest alternative times or providers
     * 5. After saving:
     *    - Close form
     *    - Refresh timeline
     *    - Highlight new appointment
     * 
     * DATA SLOT MUST CONTAIN:
     * - providerId: Integer (which doctor)
     * - dateKey: String "YYYY-MM-DD" (which day)
     * - timeStr: String "HH:MM" (which hour)
     * 
     * SAFEGUARDS:
     * - Real-time conflict detection
     * - Visual warning before submit
     * - Auto-suggest next available slot
     * - Prevent double-booking same provider
     * - Lock pre-filled fields (can unlock if needed)
     * - Smart duration calculation (30min default)
     */
    window.quickBookAppointment = function (providerId, dateKey, timeStr) {
        const provider = mockProviders.find(p => p.id === providerId);
        if (!provider) {
            showNotification('Provider not found', 'error');
            return;
        }

        // Calculate default end time (1 hour later)
        const startHour = parseInt(timeStr.split(':')[0]);
        const startMin = parseInt(timeStr.split(':')[1]);
        const endHour = startHour + 1;
        const endTimeStr = `${endHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;

        // Check for conflicts BEFORE opening form
        const dateTime = `${dateKey} ${timeStr}:00`;
        const endDateTime = `${dateKey} ${endTimeStr}:00`;

        const potentialAppointment = {
            providerId: providerId,
            dateStart: dateTime,
            dateEnd: endDateTime
        };

        const conflicts = checkTimelineConflicts(potentialAppointment);

        // Prepare pre-filled data
        const prefillData = {
            providerId: providerId,
            providerName: provider.name,
            providerColor: provider.color,
            dateKey: dateKey,
            startTime: timeStr,
            endTime: endTimeStr,
            type: 'scheduled', // Default to scheduled
            conflicts: conflicts,
            isQuickBook: true // Flag to indicate this is from timeline
        };

        // Open enhanced appointment form
        openEnhancedAppointmentForm(prefillData);
    };

    /**
     * UX Pattern: Role-based view switching
     * Doctor view: Auto-filter to their schedule, show quick actions
     * Receptionist view: See all providers, manage bookings
     */
    window.toggleTimelineRole = function () {
        timelineUserRole = timelineUserRole === 'receptionist' ? 'doctor' : 'receptionist';
        localStorage.setItem('user-role', timelineUserRole);

        // If switching to doctor view, focus on first provider
        if (timelineUserRole === 'doctor') {
            timelineViewMode = 'focus';
            timelineSelectedProviders = [mockProviders[0].id]; // In real app, use logged-in doctor's ID
        } else {
            timelineViewMode = 'multi';
            selectAllProviders();
        }

        renderTimeline();
    };

    /**
     * Check for conflicts when booking from timeline
     * Returns array of conflicting appointments
     */
    function checkTimelineConflicts(newApt, excludeId = null) {
        const conflicts = [];
        const newStart = new Date(newApt.dateStart);
        const newEnd = new Date(newApt.dateEnd);

        appointments.forEach(apt => {
            if (excludeId && apt.id === excludeId) return;
            if (apt.type === 'cancelled' || apt.type === 'no-show') return;
            if (apt.providerId !== newApt.providerId) return; // Only check same provider

            const aptStart = new Date(apt.dateStart);
            const aptEnd = new Date(apt.dateEnd);

            // Check for time overlap
            const hasOverlap = (newStart < aptEnd && newEnd > aptStart);

            if (hasOverlap) {
                const patient = mockPatients.find(p => p.id === apt.patientId);
                conflicts.push({
                    id: apt.id,
                    patientName: patient ? patient.name : apt.patientName,
                    startTime: apt.dateStart.split(' ')[1],
                    endTime: apt.dateEnd.split(' ')[1],
                    type: apt.type,
                    treatment: apt.treatment
                });
            }
        });

        return conflicts;
    }

    /**
     * Suggest alternative time slots if conflict exists
     */
    function suggestAlternativeSlots(providerId, dateKey, requestedTime) {
        const alternatives = [];
        const dayAppointments = appointments.filter(apt =>
            apt.dateStart.startsWith(dateKey) &&
            apt.providerId === providerId &&
            apt.type !== 'cancelled' &&
            apt.type !== 'no-show'
        );

        // Check each hour from 7 AM to 7 PM
        for (let hour = 7; hour <= 18; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const dateTime = `${dateKey} ${timeStr}:00`;
            const endTime = `${dateKey} ${(hour + 1).toString().padStart(2, '0')}:00:00`;

            const testApt = {
                providerId: providerId,
                dateStart: dateTime,
                dateEnd: endTime
            };

            const conflicts = checkTimelineConflicts(testApt);
            if (conflicts.length === 0) {
                alternatives.push({
                    time: timeStr,
                    available: true
                });

                if (alternatives.length >= 3) break; // Show first 3 available slots
            }
        }

        return alternatives;
    }

    // Calculate duration helper function
    function calculateDuration(start, end) {
        const startTime = new Date(`2000-01-01T${start.split(' ')[1]}`);
        const endTime = new Date(`2000-01-01T${end.split(' ')[1]}`);
        return (endTime - startTime) / (1000 * 60); // in minutes
    }

    // ====================
    // QUICK STATUS CHANGE
    // ====================
    function getQuickActionButtons(apt) {
        let buttons = '';

        if (apt.type === 'queue') {
            buttons = `
                <button class="quick-status-btn start" onclick="event.stopPropagation(); quickStatusChange(${apt.id}, 'appointment')" title="Start">
                    <i class="fas fa-play"></i>
                </button>
                <button class="quick-status-btn cancel" onclick="event.stopPropagation(); quickStatusChange(${apt.id}, 'cancelled')" title="Cancel">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else if (apt.type === 'appointment') {
            buttons = `
                <button class="quick-status-btn complete" onclick="event.stopPropagation(); quickStatusChange(${apt.id}, 'finished')" title="Complete">
                    <i class="fas fa-check"></i>
                </button>
                <button class="quick-status-btn cancel" onclick="event.stopPropagation(); quickStatusChange(${apt.id}, 'cancelled')" title="Cancel">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else if (apt.type === 'followup') {
            buttons = `
                <button class="quick-status-btn checkin" onclick="event.stopPropagation(); quickStatusChange(${apt.id}, 'queue')" title="Check-in">
                    <i class="fas fa-user-check"></i>
                </button>
                <button class="quick-status-btn cancel" onclick="event.stopPropagation(); quickStatusChange(${apt.id}, 'cancelled')" title="Cancel">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }

        return buttons;
    }

    window.quickStatusChange = function (aptId, newStatus) {
        const apt = appointments.find(a => a.id === aptId);
        if (!apt) return;

        apt.type = newStatus;
        localStorage.setItem('calendar-appointments', JSON.stringify(appointments));

        // Refresh current view
        if (currentView === 'calendar') {
            renderCalendar();
            renderAppointments();
        } else if (currentView === 'timeline') {
            renderTimeline();
        } else if (currentView === 'dashboard') {
            renderDashboard();
        }

        // Show notification
        showNotification(currentLanguage === 'en' ?
            `Status changed to ${newStatus}` :
            `ស្ថានភាពបានប្តូរទៅ ${newStatus}`);
    };

    // ====================
    // NOTIFICATIONS
    // ====================
    function showNotification(message, type = 'success') {
        const $notification = $(`
            <div class="notification ${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `);

        $('body').append($notification);

        setTimeout(() => $notification.addClass('show'), 10);
        setTimeout(() => {
            $notification.removeClass('show');
            setTimeout(() => $notification.remove(), 300);
        }, 3000);
    }

    // ====================
    // CONFLICT DETECTION
    // ====================
    function checkConflicts(newApt, excludeId = null) {
        const conflicts = [];

        appointments.forEach(apt => {
            if (excludeId && apt.id === excludeId) return;
            if (apt.type === 'cancelled') return;

            // Check if same date
            const newDate = newApt.dateStart.split(' ')[0];
            const aptDate = apt.dateStart.split(' ')[0];
            if (newDate !== aptDate) return;

            // Check time overlap
            const newStart = new Date(`2000-01-01T${newApt.dateStart.split(' ')[1]}`);
            const newEnd = new Date(`2000-01-01T${newApt.dateEnd.split(' ')[1]}`);
            const aptStart = new Date(`2000-01-01T${apt.dateStart.split(' ')[1]}`);
            const aptEnd = new Date(`2000-01-01T${apt.dateEnd.split(' ')[1]}`);

            const hasOverlap = newStart < aptEnd && newEnd > aptStart;

            if (hasOverlap) {
                // Check provider conflict
                if (newApt.providerId === apt.providerId) {
                    conflicts.push({
                        type: 'provider',
                        message: `${apt.providerName} already has an appointment at this time`,
                        appointment: apt
                    });
                }

                // Check room conflict
                if (newApt.roomNumber === apt.roomNumber) {
                    conflicts.push({
                        type: 'room',
                        message: `Room ${apt.roomNumber} is already booked at this time`,
                        appointment: apt
                    });
                }
            }
        });

        return conflicts;
    }

    // Show conflicts in form
    window.validateAppointmentForm = function () {
        const formData = {
            providerId: parseInt($('#providerId').val()),
            providerName: $('#providerId option:selected').text(),
            roomNumber: parseInt($('#roomNumber').val()),
            dateStart: `${$('#appointmentDate').val()} ${$('#startTime').val()}`,
            dateEnd: `${$('#appointmentDate').val()} ${$('#endTime').val()}`
        };

        const editId = $('#appointmentForm').data('edit-id');
        const conflicts = checkConflicts(formData, editId);

        const $conflictArea = $('#conflictWarning');
        if (conflicts.length > 0) {
            let html = '<div class="conflict-warning"><i class="fas fa-exclamation-triangle"></i> Conflicts detected:<ul>';
            conflicts.forEach(c => {
                html += `<li>${c.message}</li>`;
            });
            html += '</ul></div>';

            if ($conflictArea.length === 0) {
                $('.form-section').first().before(`<div id="conflictWarning">${html}</div>`);
            } else {
                $conflictArea.html(html);
            }
        } else {
            $conflictArea.remove();
        }

        return conflicts.length === 0;
    };

    // Add event listeners for conflict checking
    $(document).on('change', '#providerId, #roomNumber, #appointmentDate, #startTime, #endTime', function () {
        if ($('#appointmentForm').length) {
            validateAppointmentForm();
        }
    });

    // Update patient history panel config
    const originalGetPanelConfig = getPanelConfig;
    getPanelConfig = function (type, data = null) {
        if (type === 'patient-history') {
            return {
                icon: 'fas fa-history',
                title: currentLanguage === 'en' ? 'Patient History' : 'ប្រវត្តិអ្នកជំងឺ',
                form: getPatientHistoryPanel(data)
            };
        }
        return originalGetPanelConfig(type, data);
    };

    function getPatientHistoryPanel(data) {
        const { patient, appointments } = data;

        let appointmentsHtml = '';
        if (appointments.length === 0) {
            appointmentsHtml = `<div class="no-data">${currentLanguage === 'en' ? 'No appointment history' : 'គ្មានប្រវត្តិការណាត់ជួប'}</div>`;
        } else {
            appointments.sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart));
            appointments.forEach(apt => {
                const statusClass = apt.type;
                appointmentsHtml += `
                    <div class="history-item ${statusClass}">
                        <div class="history-date">${apt.dateStart}</div>
                        <div class="history-title">${apt.title}</div>
                        <div class="history-provider">${apt.providerName}</div>
                        <span class="appointment-type-badge ${apt.type}">${apt.type}</span>
                    </div>
                `;
            });
        }

        return `
            <div class="patient-history-panel">
                <div class="patient-info-card">
                    <div class="patient-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="patient-details">
                        <h3>${patient.name}</h3>
                        <p><i class="fas fa-phone"></i> ${patient.phone}</p>
                        <p><i class="fas fa-${patient.gender === 'male' ? 'mars' : 'venus'}"></i> ${patient.gender}</p>
                    </div>
                </div>
                
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-calendar-alt"></i>
                        ${currentLanguage === 'en' ? 'Appointment History' : 'ប្រវត្តិការណាត់ជួប'}
                        <span class="history-count">${appointments.length}</span>
                    </div>
                    <div class="history-list">
                        ${appointmentsHtml}
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                        ${currentLanguage === 'en' ? 'Close' : 'បិទ'}
                    </button>
                    <button type="button" class="btn btn-primary" onclick="openSlidePanel('appointment'); $('#patientId').val(${patient.id});">
                        <i class="fas fa-plus"></i>
                        ${currentLanguage === 'en' ? 'New Appointment' : 'ការណាត់ជួបថ្មី'}
                    </button>
                </div>
            </div>
        `;
    }

    // ====================
    // ENHANCED APPOINTMENT FORM & HANDLERS
    // ====================

    /**
     * Enhanced appointment form with smart pre-filling from timeline
     */
    function getEnhancedAppointmentForm(prefillData) {
        const { providerId, providerName, providerColor, dateKey, startTime, endTime } = prefillData;
        const provider = mockProviders.find(p => p.id === providerId);
        const date = new Date(dateKey);
        const dayName = translations[currentLanguage].daysFull[date.getDay()];
        const dayNum = date.getDate();
        const monthName = translations[currentLanguage].months[date.getMonth()];
        const yearNum = date.getFullYear();
        const dateDisplay = `${dayName}, ${dayNum} ${monthName} ${yearNum}`;

        let patientOptions = `<option value="">${currentLanguage === 'en' ? '---Select Patient---' : '---ជ្រើសអ្នកជំងឺ---'}</option>`;
        mockPatients.forEach(p => patientOptions += `<option value="${p.id}">${p.name}</option>`);

        let treatmentOptions = `<option value="">${currentLanguage === 'en' ? '---Select---' : '---ជ្រើស---'}</option>`;
        treatmentCategories.forEach(t => treatmentOptions += `<option value="${t.value}">${currentLanguage === 'en' ? t.label : t.labelKh}</option>`);

        let roomOptions = `<option value="">${currentLanguage === 'en' ? '---Select---' : '---ជ្រើស---'}</option>`;
        rooms.forEach(r => roomOptions += `<option value="${r.id}">${r.name}</option>`);

        let typeOptions = '';
        appointmentTypes.forEach(t => {
            const selected = t.value === 'scheduled' ? 'selected' : '';
            typeOptions += `<option value="${t.value}" ${selected}>${currentLanguage === 'en' ? t.label : t.labelKh}</option>`;
        });

        return `
            <form id="appointmentForm" onsubmit="handleEnhancedAppointmentSubmit(event)">
                <div id="conflictWarning" style="display:none;"></div>
                <div class="prefilled-info-box">
                    <div class="prefilled-header"><i class="fas fa-info-circle"></i><span>${currentLanguage === 'en' ? 'Booking Info' : 'ព័ត៌មាន'}</span></div>
                    <div class="prefilled-details">
                        <div class="prefilled-item"><i class="fas fa-user-md" style="color:${providerColor}"></i><strong>Provider:</strong><span class="prefilled-value">${providerName}</span></div>
                        <div class="prefilled-item"><i class="fas fa-calendar-day"></i><strong>Date:</strong><span class="prefilled-value">${dateDisplay}</span></div>
                        <div class="prefilled-item"><i class="fas fa-clock"></i><strong>Time:</strong><span class="prefilled-value">${startTime}-${endTime}</span><button type="button" class="btn-unlock" onclick="unlockTimeFields()"><i class="fas fa-lock"></i></button></div>
                    </div>
                </div>
                <input type="hidden" name="providerId" id="providerId" value="${providerId}">
                <input type="hidden" name="appointmentDate" id="appointmentDate" value="${dateKey}">
                <div class="form-section">
                    <div class="form-section-title"><i class="fas fa-user"></i>${currentLanguage === 'en' ? 'Patient' : 'អ្នកជំងឺ'}<span class="required">*</span></div>
                    <div class="form-row single"><div class="form-group"><select class="form-select" name="patientId" id="patientId" required autofocus>${patientOptions}</select></div></div>
                </div>
                <div class="form-section">
                    <div class="form-section-title"><i class="fas fa-tooth"></i>${currentLanguage === 'en' ? 'Treatment' : 'ព្យាបាល'}</div>
                    <div class="form-row">
                        <div class="form-group"><label class="form-label">${currentLanguage === 'en' ? 'Category' : 'ប្រភេទ'}</label><select class="form-select" name="treatmentCategory" id="treatmentCategory">${treatmentOptions}</select></div>
                        <div class="form-group"><label class="form-label">${currentLanguage === 'en' ? 'Room' : 'បន្ទប់'}</label><select class="form-select" name="roomNumber" id="roomNumber">${roomOptions}</select></div>
                    </div>
                </div>
                <div class="form-section form-section-collapsed" id="timeAdjustSection">
                    <div class="form-section-title"><i class="fas fa-clock"></i>${currentLanguage === 'en' ? 'Time' : 'ម៉ោង'}<span class="section-badge">Locked</span></div>
                    <div class="form-row">
                        <div class="form-group"><input type="time" class="form-input" name="startTime" id="startTime" value="${startTime}" disabled></div>
                        <div class="form-group"><input type="time" class="form-input" name="endTime" id="endTime" value="${endTime}" disabled></div>
                    </div>
                </div>
                <div class="form-section">
                    <div class="form-row">
                        <div class="form-group"><label class="form-label">${currentLanguage === 'en' ? 'Type' : 'ប្រភេទ'}</label><select class="form-select" name="type" id="appointmentType">${typeOptions}</select></div>
                        <div class="form-group"><label class="form-label">${currentLanguage === 'en' ? 'Title' : 'ចំណងជើង'}</label><input type="text" class="form-input" name="title" id="title"></div>
                    </div>
                    <div class="form-row single"><div class="form-group"><label class="form-label">${currentLanguage === 'en' ? 'Notes' : 'កំណត់ចំណាំ'}</label><textarea class="form-textarea" name="notes" id="notes"></textarea></div></div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()"><i class="fas fa-times"></i>${currentLanguage === 'en' ? 'Cancel' : 'បោះបង់'}</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-check-circle"></i>${currentLanguage === 'en' ? 'Book' : 'កក់'}</button>
                </div>
            </form>
            <script>setTimeout(()=>checkAndShowConflicts(),500);</script>
        `;
    }

    window.unlockTimeFields = function () {
        $('#startTime,#endTime').prop('disabled', false);
        $('#timeAdjustSection').removeClass('form-section-collapsed');
        $('.section-badge').text('Unlocked');
        $('.btn-unlock i').removeClass('fa-lock').addClass('fa-lock-open');
    };

    window.handleEnhancedAppointmentSubmit = function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const patientId = parseInt(formData.get('patientId'));
        const providerId = parseInt(formData.get('providerId'));
        const patient = mockPatients.find(p => p.id === patientId);
        const provider = mockProviders.find(p => p.id === providerId);

        const newApt = {
            id: Date.now(),
            patientId, patientName: patient.name,
            providerId, providerName: provider.name,
            dateStart: `${formData.get('appointmentDate')} ${formData.get('startTime')}:00`,
            dateEnd: `${formData.get('appointmentDate')} ${formData.get('endTime')}:00`,
            treatment: formData.get('treatmentCategory'),
            roomNumber: parseInt(formData.get('roomNumber')) || 1,
            type: formData.get('type'),
            title: formData.get('title') || `${patient.name} - ${formData.get('treatmentCategory')}`,
            notes: formData.get('notes') || ''
        };

        appointments.push(newApt);
        localStorage.setItem('calendar-appointments', JSON.stringify(appointments));
        closeSlidePanel();
        if (currentView === 'timeline') renderTimeline();
        else { renderCalendar(); renderAppointments(); }
        showNotification('Appointment booked successfully!', 'success');
    };

    console.log('🔄 Initializing calendar...');
    console.log('📅 Calendar body element:', $('#calendarBody').length);
    renderCalendar();
    console.log('📅 Calendar rendered');
    console.log('✅ Khmer Lunar Calendar loaded successfully!');
});
