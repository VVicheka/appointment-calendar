$(document).ready(function() {
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
        { value: 'queue', label: 'Queue', labelKh: 'ជួរ', color: '#06b6d4' },
        { value: 'appointment', label: 'Appointment', labelKh: 'ការណាត់ជួប', color: '#3b82f6' },
        { value: 'followup', label: 'Follow Up', labelKh: 'តាមដាន', color: '#f59e0b' },
        { value: 'finished', label: 'Finished', labelKh: 'រួចរាល់', color: '#22c55e' },
        { value: 'cancelled', label: 'Cancelled', labelKh: 'បោះបង់', color: '#ef4444' }
    ];

    const rooms = [
        { id: 1, name: 'Room 1' },
        { id: 2, name: 'Room 2' },
        { id: 3, name: 'Room 3' },
        { id: 4, name: 'Room 4' },
        { id: 5, name: 'Room 5' }
    ];

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
                    } catch (e) {}
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
                    } catch (e) {}
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
    window.handleDateClick = function(dateKey) {
        const parts = dateKey.split('-');
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        handleDateClick(date);
    };

    // Get filtered appointments
    function getFilteredAppointments() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Get active filters
        const viewAll = $('#filterViewAll').is(':checked');
        const selectedProvider = $('#filterProvider').val();
        const activeTypes = [];
        $('.filter-type:checked').each(function() {
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
        
        // Sort by date
        filtered.sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));
        
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
    $('#filterViewAll').change(function() {
        if ($(this).is(':checked')) {
            $('.filter-type').prop('checked', true);
        }
        renderAppointments();
    });

    $('.filter-type').change(function() {
        const allChecked = $('.filter-type:checked').length === $('.filter-type').length;
        $('#filterViewAll').prop('checked', allChecked);
        renderAppointments();
    });

    $('#filterProvider').change(function() {
        renderAppointments();
    });

    // Edit appointment
    window.editAppointment = function(id) {
        const apt = appointments.find(a => a.id === id);
        if (!apt) return;
        
        openSlidePanel('edit-appointment', apt);
    };

    // ====================
    // SLIDE PANEL
    // ====================

    window.openSlidePanel = function(type, data = null) {
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

    function getPaymentForm() {
        return `
            <form id="paymentForm" onsubmit="handlePaymentSubmit(event)">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-dollar-sign"></i>
                        ${currentLanguage === 'en' ? 'Payment Details' : 'ព័ត៌មានការទូទាត់'}
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
                            <label class="form-label">${currentLanguage === 'en' ? 'Invoice Number' : 'លេខវិក្កយបត្រ'}</label>
                            <input type="text" class="form-input" name="invoiceNumber" placeholder="INV-001">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Amount (USD)' : 'ចំនួនទឹកប្រាក់ (ដុល្លារ)'} <span class="required">*</span></label>
                            <input type="number" class="form-input" name="amount" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Payment Method' : 'វិធីទូទាត់'} <span class="required">*</span></label>
                            <select class="form-select" name="paymentMethod" required>
                                <option value="">--- ${currentLanguage === 'en' ? 'Select' : 'ជ្រើសរើស'} ---</option>
                                <option value="cash">${currentLanguage === 'en' ? 'Cash' : 'សាច់ប្រាក់'}</option>
                                <option value="card">${currentLanguage === 'en' ? 'Credit/Debit Card' : 'កាត'}</option>
                                <option value="bank-transfer">${currentLanguage === 'en' ? 'Bank Transfer' : 'ផ្ទេរប្រាក់'}</option>
                                <option value="mobile-payment">${currentLanguage === 'en' ? 'Mobile Payment' : 'ទូទាត់តាមទូរស័ព្ទ'}</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Description' : 'ពិពណ៌នា'}</label>
                            <textarea class="form-textarea" name="description" placeholder="${currentLanguage === 'en' ? 'Payment for...' : 'ការទូទាត់សម្រាប់...'}"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                        ${currentLanguage === 'en' ? 'Cancel' : 'បោះបង់'}
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${currentLanguage === 'en' ? 'Record Payment' : 'កត់ត្រាការទូទាត់'}
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
    window.handleAppointmentSubmit = function(e, editId = null) {
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

    window.handlePatientSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Patient Data:', data);
        
        closeSlidePanel();
        alert(currentLanguage === 'en' ? 'Patient created successfully!' : 'បានបង្កើតអ្នកជំងឺដោយជោគជ័យ!');
    };

    window.handleLabOrderSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Lab Order Data:', data);
        
        closeSlidePanel();
        alert(currentLanguage === 'en' ? 'Lab order created successfully!' : 'បានបង្កើតសំណើមន្ទីរពិសោធន៍ដោយជោគជ័យ!');
    };

    window.handlePaymentSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Payment Data:', data);
        
        closeSlidePanel();
        alert(currentLanguage === 'en' ? 'Payment recorded successfully!' : 'បានកត់ត្រាការទូទាត់ដោយជោគជ័យ!');
    };

    window.handleEmployeeSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Employee Data:', data);
        
        closeSlidePanel();
        alert(currentLanguage === 'en' ? 'Employee created successfully!' : 'បានបង្កើតបុគ្គលិកដោយជោគជ័យ!');
    };

    window.handlePrescriptionSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Prescription Data:', data);
        
        closeSlidePanel();
        alert(currentLanguage === 'en' ? 'Prescription created successfully!' : 'បានបង្កើតវេជ្ជបញ្ជាដោយជោគជ័យ!');
    };

    window.handleServicesSubmit = function(e) {
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
        
        $('.action-label').each(function() {
            const $label = $(this);
            const enText = $label.attr('data-en');
            const khText = $label.attr('data-kh');
            $label.text(currentLanguage === 'en' ? enText : khText);
        });
    }
    
    $('#quickActionBtn').click(function(e) {
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
    
    $(document).click(function(e) {
        if (!$(e.target).closest('.quick-action-wrapper').length) {
            closeQuickActionDropdown();
        }
    });
    
    $(document).keydown(function(e) {
        if (e.key === 'Escape') {
            closeQuickActionDropdown();
            closeSlidePanel();
        }
    });
    
    function filterActionsByPermission() {
        $('.quick-action-item').each(function() {
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
    
    $('.quick-action-item').click(function() {
        const action = $(this).attr('data-action');
        handleQuickAction(action);
        closeQuickActionDropdown();
    });
    
    $('.quick-action-item').keydown(function(e) {
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
    $('#langToggle').click(function() {
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
    $('.btn-prev-month').click(function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    $('.btn-next-month').click(function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    $('.btn-refresh').click(function() {
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
    // VIEW TOGGLE
    // ====================
    $('#viewCalendar').click(function() {
        switchView('calendar');
    });
    
    $('#viewTimeline').click(function() {
        switchView('timeline');
    });
    
    $('#viewDashboard').click(function() {
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
    
    $('#globalSearch').on('input', function() {
        const query = $(this).val().trim().toLowerCase();
        
        clearTimeout(searchTimeout);
        
        if (query.length < 2) {
            $('#searchResults').hide();
            $('#searchClear').hide();
            return;
        }
        
        $('#searchClear').show();
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    $('#searchClear').click(function() {
        $('#globalSearch').val('');
        $('#searchResults').hide();
        $(this).hide();
    });
    
    function performSearch(query) {
        const results = [];
        
        // Search patients
        mockPatients.forEach(patient => {
            if (patient.name.toLowerCase().includes(query) || 
                patient.phone.includes(query)) {
                results.push({
                    type: 'patient',
                    icon: 'fa-user',
                    title: patient.name,
                    subtitle: patient.phone,
                    data: patient
                });
            }
        });
        
        // Search appointments
        appointments.forEach(apt => {
            if (apt.patientName.toLowerCase().includes(query) ||
                apt.providerName.toLowerCase().includes(query) ||
                apt.title.toLowerCase().includes(query)) {
                const date = apt.dateStart.split(' ')[0];
                const time = apt.dateStart.split(' ')[1];
                results.push({
                    type: 'appointment',
                    icon: 'fa-calendar',
                    title: apt.patientName,
                    subtitle: `${date} at ${time} - ${apt.providerName}`,
                    data: apt
                });
            }
        });
        
        renderSearchResults(results);
    }
    
    function renderSearchResults(results) {
        const $container = $('#searchResults');
        
        if (results.length === 0) {
            $container.html('<div class="search-no-results">No results found</div>');
            $container.show();
            return;
        }
        
        let html = '';
        results.slice(0, 10).forEach(result => {
            html += `
                <div class="search-result-item" data-type="${result.type}" data-id="${result.data.id}">
                    <i class="fas ${result.icon}"></i>
                    <div class="search-result-info">
                        <div class="search-result-title">${result.title}</div>
                        <div class="search-result-subtitle">${result.subtitle}</div>
                    </div>
                </div>
            `;
        });
        
        if (results.length > 10) {
            html += `<div class="search-more">+${results.length - 10} more results</div>`;
        }
        
        $container.html(html);
        $container.show();
    }
    
    $(document).on('click', '.search-result-item', function() {
        const type = $(this).data('type');
        const id = $(this).data('id');
        
        if (type === 'appointment') {
            editAppointment(id);
        } else if (type === 'patient') {
            showPatientHistory(id);
        }
        
        $('#searchResults').hide();
        $('#globalSearch').val('');
        $('#searchClear').hide();
    });
    
    // Close search results when clicking outside
    $(document).click(function(e) {
        if (!$(e.target).closest('.search-wrapper').length) {
            $('#searchResults').hide();
        }
    });
    
    // ====================
    // PATIENT HISTORY
    // ====================
    window.showPatientHistory = function(patientId) {
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
        
        // Get today's appointments
        const todayAppointments = appointments.filter(apt => 
            apt.dateStart && apt.dateStart.startsWith(todayKey)
        );
        
        // Calculate stats
        const total = todayAppointments.length;
        const waiting = todayAppointments.filter(apt => apt.type === 'queue').length;
        const completed = todayAppointments.filter(apt => apt.type === 'finished').length;
        const cancelled = todayAppointments.filter(apt => apt.type === 'cancelled').length;
        
        // Update stat cards
        $('#statTotal').text(total);
        $('#statWaiting').text(waiting);
        $('#statCompleted').text(completed);
        $('#statCancelled').text(cancelled);
        
        // Next Upcoming
        const now = new Date();
        const upcoming = todayAppointments
            .filter(apt => {
                const aptTime = new Date(apt.dateStart.replace(' ', 'T'));
                return aptTime > now && apt.type !== 'finished' && apt.type !== 'cancelled';
            })
            .sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));
        
        if (upcoming.length > 0) {
            const next = upcoming[0];
            const time = next.dateStart.split(' ')[1];
            $('#nextUpcoming').html(`
                <div class="upcoming-item">
                    <div class="upcoming-time">${time}</div>
                    <div class="upcoming-info">
                        <div class="upcoming-patient">${next.patientName}</div>
                        <div class="upcoming-details">${next.providerName} • Room ${next.roomNumber}</div>
                    </div>
                    <div class="upcoming-countdown" id="countdown"></div>
                </div>
            `);
            startCountdown(next.dateStart);
        } else {
            $('#nextUpcoming').html('<div class="no-data">No upcoming appointments</div>');
        }
        
        // Waiting Queue
        const queue = todayAppointments.filter(apt => apt.type === 'queue');
        if (queue.length > 0) {
            let queueHtml = '';
            queue.forEach((apt, index) => {
                queueHtml += `
                    <div class="queue-item">
                        <span class="queue-number">${index + 1}</span>
                        <div class="queue-info">
                            <div class="queue-patient">${apt.patientName}</div>
                            <div class="queue-time">${apt.dateStart.split(' ')[1]}</div>
                        </div>
                        <button class="queue-action-btn" onclick="quickStatusChange(${apt.id}, 'appointment')">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                `;
            });
            $('#waitingQueue').html(queueHtml);
        } else {
            $('#waitingQueue').html('<div class="no-data">No patients waiting</div>');
        }
        
        // Provider Status
        let providerHtml = '';
        mockProviders.forEach(provider => {
            const providerApts = todayAppointments.filter(apt => apt.providerId === provider.id);
            const inProgress = providerApts.filter(apt => apt.type === 'appointment').length;
            const done = providerApts.filter(apt => apt.type === 'finished').length;
            const status = inProgress > 0 ? 'busy' : 'available';
            
            providerHtml += `
                <div class="provider-status-item">
                    <div class="provider-avatar" style="background: ${provider.color}">
                        ${provider.name.split(' ').pop().charAt(0)}
                    </div>
                    <div class="provider-info">
                        <div class="provider-name">${provider.name}</div>
                        <div class="provider-stats">${done}/${providerApts.length} completed</div>
                    </div>
                    <span class="provider-badge ${status}">${status}</span>
                </div>
            `;
        });
        $('#providerStatus').html(providerHtml);
        
        // Recent Activity
        const recentApts = [...appointments]
            .sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart))
            .slice(0, 5);
        
        if (recentApts.length > 0) {
            let activityHtml = '';
            recentApts.forEach(apt => {
                const icon = apt.type === 'finished' ? 'check-circle' : 
                            apt.type === 'cancelled' ? 'times-circle' : 'calendar';
                const color = apt.type === 'finished' ? '#22c55e' : 
                             apt.type === 'cancelled' ? '#ef4444' : '#3b82f6';
                
                activityHtml += `
                    <div class="activity-item">
                        <i class="fas fa-${icon}" style="color: ${color}"></i>
                        <div class="activity-info">
                            <div class="activity-text">${apt.patientName} - ${apt.title}</div>
                            <div class="activity-time">${apt.dateStart}</div>
                        </div>
                    </div>
                `;
            });
            $('#recentActivity').html(activityHtml);
        }
    }
    
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
    $('#timelinePrev').click(function() {
        timelineDate.setDate(timelineDate.getDate() - 1);
        renderTimeline();
    });
    
    $('#timelineNext').click(function() {
        timelineDate.setDate(timelineDate.getDate() + 1);
        renderTimeline();
    });
    
    $('#timelineToday').click(function() {
        timelineDate = new Date();
        renderTimeline();
    });
    
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
        
        // Get appointments for this day
        const dayAppointments = appointments.filter(apt => 
            apt.dateStart && apt.dateStart.startsWith(dateKey)
        );
        
        // Build timeline grid
        let html = '';
        
        // Provider columns header
        html += '<div class="timeline-providers-header">';
        html += '<div class="timeline-time-header">Time</div>';
        mockProviders.forEach(provider => {
            html += `<div class="timeline-provider-header" style="border-top: 3px solid ${provider.color}">
                ${provider.name.split(' ').pop()}
            </div>`;
        });
        html += '</div>';
        
        // Time slots (7 AM to 7 PM)
        for (let hour = 7; hour <= 19; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const nowHour = today.getHours();
            const isCurrentHour = isToday && hour === nowHour;
            
            html += `<div class="timeline-row ${isCurrentHour ? 'current-hour' : ''}">`;
            html += `<div class="timeline-time">${timeStr}</div>`;
            
            mockProviders.forEach(provider => {
                const slotApts = dayAppointments.filter(apt => {
                    const aptHour = parseInt(apt.dateStart.split(' ')[1].split(':')[0]);
                    return apt.providerId === provider.id && aptHour === hour;
                });
                
                html += `<div class="timeline-slot" data-provider="${provider.id}" data-time="${timeStr}" data-date="${dateKey}">`;
                
                slotApts.forEach(apt => {
                    const duration = calculateDuration(apt.dateStart, apt.dateEnd);
                    html += `
                        <div class="timeline-appointment ${apt.type}" 
                             style="background: ${provider.color}20; border-left-color: ${provider.color}"
                             onclick="editAppointment(${apt.id})">
                            <div class="timeline-apt-time">${apt.dateStart.split(' ')[1]} - ${apt.dateEnd.split(' ')[1]}</div>
                            <div class="timeline-apt-patient">${apt.patientName}</div>
                            <div class="timeline-apt-room">Room ${apt.roomNumber}</div>
                            <div class="timeline-apt-actions">
                                ${getQuickActionButtons(apt)}
                            </div>
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
    
    window.quickStatusChange = function(aptId, newStatus) {
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
    window.validateAppointmentForm = function() {
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
    $(document).on('change', '#providerId, #roomNumber, #appointmentDate, #startTime, #endTime', function() {
        if ($('#appointmentForm').length) {
            validateAppointmentForm();
        }
    });
    
    // Update patient history panel config
    const originalGetPanelConfig = getPanelConfig;
    getPanelConfig = function(type, data = null) {
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
    
    console.log('🔄 Initializing calendar...');
    console.log('📅 Calendar body element:', $('#calendarBody').length);
    renderCalendar();
    console.log('📅 Calendar rendered');
    console.log('✅ Khmer Lunar Calendar loaded successfully!');
});
