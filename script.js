$(document).ready(function() {
    let currentDate = new Date();
    let currentLanguage = localStorage.getItem('calendar-language') || 'en';
    let selectedDateInfo = null;
    let appointments = JSON.parse(localStorage.getItem('calendar-appointments')) || [];

    // Dynamic holidays cache
    let holidaysCache = {};
    let buddhistEventsCache = {};

    // Get fixed civil holidays from local data
    function getFixedHolidays(year) {
        const holidays = {};
        
        // MomentKH doesn't provide getHolidays function, so use local data
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

        // Convert to full date format with year
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
        
        console.log(`🔥 Calculating Buddhist holidays for ${year}...`);
        
        try {
            // Check if MomentKH is properly loaded
            if (typeof momentkh === 'undefined') {
                console.error('MomentKH library not loaded!');
                return events;
            }
            
            // 1. Khmer New Year - use getNewYear function
            try {
                const khmerNewYear = momentkh.getNewYear(year);
                if (khmerNewYear && khmerNewYear.year && khmerNewYear.month && khmerNewYear.day) {
                    const newYearDate = new Date(khmerNewYear.year, khmerNewYear.month - 1, khmerNewYear.day);
                    
                    // Add 3 days for Khmer New Year
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
                    console.log(`✅ Khmer New Year calculated: ${formatDateKey(newYearDate)}`);
                }
            } catch (e) {
                console.error('Error calculating Khmer New Year:', e);
            }

            // 2. Calculate Buddhist holidays - try multiple BE years since lunar calendar can span Gregorian years
            const potentialBEYears = [year + 543, year + 544, year + 545]; // Try different BE year calculations
            
            // Define Buddhist holidays with proper data structure
            const buddhistHolidays = [
                { 
                    name: 'Meak Bochea', 
                    nameKh: 'ពិធីបុណ្យមាឃបូជា',
                    day: 15, 
                    moonPhase: 0, // 0 = Koeut (waxing)
                    monthIndex: 2, // 3rd month (Meak)
                    isRestDay: true 
                },
                { 
                    name: 'Visakha Bochea', 
                    nameKh: 'ពិធីបុណ្យវិសាខបូជា',
                    day: 15, 
                    moonPhase: 0, // 0 = Koeut (waxing)
                    monthIndex: 5, // 6th month (Visak)
                    isRestDay: true 
                },
                { 
                    name: 'Asalha Bochea', 
                    nameKh: 'ពិធីបុណ្យអាសាឡ្ហបូជា',
                    day: 15, 
                    moonPhase: 0, // 0 = Koeut (waxing)
                    monthIndex: 7, // 8th month (Asath)
                    isRestDay: true 
                },
                { 
                    name: 'Royal Ploughing Ceremony', 
                    nameKh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល',
                    day: 4, 
                    moonPhase: 0, // 0 = Koeut (waxing)
                    monthIndex: 6, // 7th month (usually in May)
                    isRestDay: true 
                }
            ];
            
            // Calculate each Buddhist holiday
            buddhistHolidays.forEach(holiday => {
                let found = false;
                
                for (const beYear of potentialBEYears) {
                    try {
                        const khmerDate = momentkh.fromKhmer(beYear, holiday.monthIndex, holiday.day, holiday.moonPhase);
                        
                        if (khmerDate && khmerDate.gregorian) {
                            const gYear = khmerDate.gregorian.year;
                            const gMonth = khmerDate.gregorian.month;
                            const gDay = khmerDate.gregorian.day;
                            
                            // Only add if it falls in the target Gregorian year
                            if (gYear === year) {
                                const date = new Date(gYear, gMonth - 1, gDay);
                                const dateKey = formatDateKey(date);
                                
                                events[dateKey] = {
                                    en: holiday.name,
                                    kh: holiday.nameKh,
                                    isRestDay: holiday.isRestDay
                                };
                                
                                console.log(`✅ ${holiday.name} calculated: ${dateKey}`);
                                found = true;
                                break;
                            }
                        }
                    } catch (e) {
                        // Continue trying other BE years
                    }
                }
                
                if (!found) {
                    console.warn(`⚠️ Could not calculate ${holiday.name} for year ${year}`);
                }
            });

            // 3. Multi-day festivals
            const multidayFestivals = [
                {
                    name: 'Pchum Ben',
                    nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ',
                    days: [13, 14, 15],
                    moonPhase: 0, // Koeut
                    monthIndex: 10, // 10th month (Pheakta Bot)
                    isRestDay: true
                },
                {
                    name: 'Water Festival',
                    nameKh: 'ពិធីបុណ្យអុំទូក',
                    days: [13, 14, 15],
                    moonPhase: 0, // Koeut
                    monthIndex: 11, // 12th month (Kadeuk)
                    isRestDay: true
                }
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
                            
                            console.log(`✅ ${festival.name} calculated`);
                            break;
                        }
                    } catch (e) {
                        // Continue trying
                    }
                }
            });

            const eventCount = Object.keys(events).length;
            console.log(`🎯 Total Buddhist holidays calculated for ${year}:`, eventCount, 'events');
            
            if (eventCount === 0) {
                console.warn(`⚠️ No Buddhist events found for ${year}. Check MomentKH library.`);
            }

        } catch (e) {
            console.error('❌ Critical error calculating Buddhist holidays for year', year, ':', e);
        }

        buddhistEventsCache[year] = events;
        return events;
    }

    // Get all holidays for a given year (fixed + dynamic)
    function getHolidays(year) {
        if (holidaysCache[year]) {
            return holidaysCache[year];
        }

        const holidays = {};
        
        // Get fixed holidays (from local data)
        const fixedHolidays = getFixedHolidays(year);
        Object.assign(holidays, fixedHolidays);
        console.log(`📋 Fixed holidays for ${year}:`, Object.keys(fixedHolidays).length);
        
        // Add dynamic Buddhist holidays
        const buddhistEvents = calculateBuddhistHolidays(year);
        console.log(`🏮 Buddhist events for ${year}:`, Object.keys(buddhistEvents).length, buddhistEvents);
        
        Object.keys(buddhistEvents).forEach(dateKey => {
            holidays[dateKey] = buddhistEvents[dateKey];
        });
        
        console.log(`🎯 Total holidays for ${year}:`, Object.keys(holidays).length, 'events');
        console.log(`🔍 Sample holiday dates:`, Object.keys(holidays).slice(0, 5));
        
        holidaysCache[year] = holidays;
        return holidays;
    }

    // Get Buddhist events for a given year
    function getBuddhistEvents(year) {
        return calculateBuddhistHolidays(year);
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

    // Khmer Number Converter - DISABLED, always use Arabic numerals
    function toKhmerNumber(num) {
        return num; // Always return Arabic numerals
    }

    // Get Buddhist Date Info
    function getBuddhistDateInfo(date) {
        try {
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
            console.error('MomentKH error:', e);
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
            const beYear = firstDay.khmer.beYear; // Always Arabic numerals
            
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

    // Show date modal
    window.showDateModal = function(date) {
        const buddhistInfo = getBuddhistDateInfo(date);
        if (!buddhistInfo) return;

        selectedDateInfo = {
            date: date,
            buddhistInfo: buddhistInfo
        };

        // Add Buddha background if holy day
        if (buddhistInfo.isBuddhistHolyDay) {
            $('.date-modal-content').addClass('has-buddha-bg');
        } else {
            $('.date-modal-content').removeClass('has-buddha-bg');
        }

        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        const dayOfWeek = translations[currentLanguage].daysFull[date.getDay()];
        const gregorianDay = date.getDate(); // Always Arabic numerals
        const gregorianMonth = translations[currentLanguage].months[date.getMonth()];
        const gregorianYear = date.getFullYear(); // Always Arabic numerals
        
        // Title
        if (currentLanguage === 'kh') {
            if (isToday) {
                $('#modalTitle').text(`ថ្ងៃនេះ - ${dayOfWeek}`);
            } else {
                $('#modalTitle').text(dayOfWeek);
            }
        } else {
            if (isToday) {
                $('#modalTitle').text(`Today - ${dayOfWeek}`);
            } else {
                $('#modalTitle').text(dayOfWeek);
            }
        }
        
        // Modal text
        if (currentLanguage === 'kh') {
            // Khmer: Buddhist date first, then "ត្រូវនឹង", then Gregorian
            const khmerFullDate = momentkh.format(buddhistInfo.fullKhmerDate, "ថ្ងៃW dN ខែm ឆ្នាំa ព.ស.b");
            const gregorianPart = `ត្រូវនឹង ថ្ងៃទី${gregorianDay} ${gregorianMonth} ${gregorianYear}`;
            let modalText = `${khmerFullDate} ${gregorianPart}`;
            
            // Add all events for this day with colors
            const dateKey = formatDateKey(date);
            const holidays = getHolidays(date.getFullYear());
            const holiday = holidays[dateKey];
            
            if (holiday) {
                const holidayName = holiday.kh || holiday.en;
                modalText += `\n\n<span style="color: #ff0000; font-weight: 600;">🎉 ${holidayName}</span>`;
            }
            
            $('#modalText').html(modalText.replace(/\n/g, '<br>'));
            $('#modalDateEn').text(`${translations.en.months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`);
        } else {
            // English: Gregorian first, then "which in Lunar is..."
            const moonPhaseText = buddhistInfo.moonPhase === 0 ? 'Koeut' : 'Roach';
            let text = `${dayOfWeek}, ${gregorianMonth} ${gregorianDay}, ${gregorianYear} which in Lunar is day of ${buddhistInfo.lunarDay} ${moonPhaseText}, month of ${buddhistInfo.monthName}, year of ${buddhistInfo.animalYearName}, ${buddhistInfo.sakName} era, Buddhist era ${buddhistInfo.beYear}`;
            
            // Add all events for this day with colors
            const dateKey = formatDateKey(date);
            const holidays = getHolidays(date.getFullYear());
            const holiday = holidays[dateKey];
            
            if (holiday) {
                const holidayName = holiday.en || holiday.kh;
                text += `\n\n<span style="color: #ff0000; font-weight: 600;">🎉 ${holidayName}</span>`;
            }
            
            $('#modalText').html(text.replace(/\n/g, '<br>'));
            $('#modalDateEn').text('');
        }
        
        $('#dateModal').addClass('show');
    };

    window.closeDateModal = function() {
        $('#dateModal').removeClass('show');
        selectedDateInfo = null;
    };

    window.copyText = function() {
        if (!selectedDateInfo) return;
        const text = $('#modalText').text() + '\n' + $('#modalDateEn').text();
        navigator.clipboard.writeText(text).then(() => {
            alert(currentLanguage === 'en' ? 'Copied to clipboard!' : 'ចម្លងទៅក្ដារតម្បៀតខ្ទាស់!');
        });
    };

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
            
            // Day cells
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
        
        // Render appointments sidebar
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
        
        let classes = 'day-cell';
        if (isOtherMonth) classes += ' other-month';
        if (isToday) classes += ' today';
        if (dayOfWeek === 0 || dayOfWeek === 6) classes += ' weekend';
        if (holiday && holiday.isRestDay) classes += ' holiday';
        
        let html = `<div class="${classes}" onclick="showDateModal(new Date('${date.toISOString()}'))">`;
        
        // Day header with number and Buddhist icon
        html += `<div class="day-header-row">`;
        html += `<div class="day-number">${day}</div>`; // Always Arabic numerals
        if (buddhistInfo && buddhistInfo.isBuddhistHolyDay) {
            html += `<img src="buddha-icon.png" class="buddhist-icon" alt="Buddhist Holy Day" />`;
        }
        html += `</div>`;
        
        // Lunar date
        if (buddhistInfo) {
            html += `<div class="lunar-date">${buddhistInfo.lunarDateStr}</div>`;
            
            // Special Buddhist days
            if (buddhistInfo.isFullMoon) {
                html += `<div class="day-info special-day">${translations[currentLanguage].fullMoon}</div>`;
            } else if (buddhistInfo.isShaveDay) {
                html += `<div class="day-info special-day">${translations[currentLanguage].shaveDay}</div>`;
            }
        }
        
        // Holiday/Event text (show for all dates, not just current month)
        if (holiday) {
            const holidayName = currentLanguage === 'en' ? holiday.en : holiday.kh;
            if (holiday.isRestDay) {
                html += `<div class="day-info holiday-text">${holidayName}</div>`;
            } else {
                html += `<div class="day-info event-text">${holidayName}</div>`;
            }
        } else {
            // Check appointments
            const dayAppointments = appointments.filter(apt => apt.date === dateKey);
            if (dayAppointments.length > 0) {
                html += `<div class="day-info event-text">${dayAppointments.length} ${currentLanguage === 'en' ? 'appointment' : 'ការណាត់'}</div>`;
            }
        }
        
        html += `</div>`;
        return html;
    }

    function renderAppointments() {
        const sortedAppointments = [...appointments].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        
        let html = '';
        if (sortedAppointments.length === 0) {
            html = `<div class="no-appointments">${currentLanguage === 'en' ? 'No appointments scheduled' : 'មិនមានការណាត់ជួប'}</div>`;
        } else {
            sortedAppointments.forEach((apt, index) => {
                const date = new Date(apt.date);
                const dayName = translations[currentLanguage].daysShort[date.getDay()];
                html += `
                    <div class="appointment-item" onclick="editAppointment(${index})">
                        <div class="appointment-date">${dayName}, ${date.getDate()} ${translations[currentLanguage].months[date.getMonth()]}</div>
                        <div class="appointment-title">${apt.title}</div>
                        ${apt.time ? `<div class="appointment-time">${apt.time}</div>` : ''}
                    </div>
                `;
            });
        }
        
        $('#appointmentsList').html(html);
    }

    function updateSidebarTitle() {
        $('#sidebarTitle').text(currentLanguage === 'en' ? 'Appointments' : 'ការណាត់ជួប');
    }

    window.editAppointment = function(index) {
        // TODO: Open edit modal
        alert('Edit appointment: ' + appointments[index].title);
    };

    // Update button labels when language changes
    function updateButtonLabels() {
        if (currentLanguage === 'kh') {
            $('#btnCopyText').text('ចម្លង');
            $('#btnAddAppointment').text('បន្ថែមការណាត់ជួប');
        } else {
            $('#btnCopyText').text('Copy text');
            $('#btnAddAppointment').text('Add Appointment');
        }
    }

    window.addAppointment = function() {
        if (!selectedDateInfo) return;
        const date = selectedDateInfo.date;
        const dateStr = formatDateKey(date);
        
        // TODO: Open add appointment modal
        const title = prompt(currentLanguage === 'en' ? 'Appointment title:' : 'ចំណងជើងការណាត់ជួប:');
        if (!title) return;
        
        const time = prompt(currentLanguage === 'en' ? 'Time (optional):' : 'ម៉ោង (ស្រេចចិត្ត):');
        
        appointments.push({
            id: Date.now(),
            date: dateStr,
            title: title,
            time: time || ''
        });
        
        localStorage.setItem('calendar-appointments', JSON.stringify(appointments));
        renderAppointments();
        closeDateModal();
        
        alert(currentLanguage === 'en' ? 'Appointment added!' : 'បានបន្ថែមការណាត់ជួប!');
    };

    // Language Toggle
    $('#langToggle').click(function() {
        currentLanguage = currentLanguage === 'en' ? 'kh' : 'en';
        localStorage.setItem('calendar-language', currentLanguage);
        const flag = currentLanguage === 'en' ? '🇬🇧' : '🇰🇭';
        const text = currentLanguage === 'en' ? 'English' : 'ខ្មែរ';
        $(this).find('.lang-flag').text(flag);
        $(this).find('#langText').text(text);
        
        updateButtonLabels();
        updateSidebarTitle();
        updateQuickActionLanguage(); // Update quick action language
        renderCalendar();
        renderAppointments();
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

    // Close modal on background click
    $('#dateModal').click(function(e) {
        if (e.target === this) {
            closeDateModal();
        }
    });

    // Debug function to test Buddhist holidays
    window.testBuddhistHolidays = function() {
        console.log('🔍 MANUAL TEST: Clearing caches and testing Buddhist holidays...');
        holidaysCache = {};
        buddhistEventsCache = {};
        
        const holidays2026 = getHolidays(2026);
        console.log('🔍 2026 holidays after cache clear:', holidays2026);
        console.log('🔍 Keys containing 2026-02:', Object.keys(holidays2026).filter(k => k.includes('2026-02')));
        console.log('🔍 Keys containing 2026-05:', Object.keys(holidays2026).filter(k => k.includes('2026-05')));
        
        // Navigate directly to February 2026 to test Meak Bochea
        currentDate = new Date(2026, 1, 1); // February 1, 2026
        renderCalendar();
        
        console.log('🔍 Navigated to February 2026. Look for Meak Bochea on Feb 2nd!');
    };
    
    // Quick navigation function
    window.goToFebruary2026 = function() {
        currentDate = new Date(2026, 1, 1); // February 1, 2026
        renderCalendar();
    };
    
    window.goToMay2026 = function() {
        currentDate = new Date(2026, 4, 1); // May 1, 2026  
        renderCalendar();
    };

    // ====================
    // QUICK ACTION DROPDOWN
    // ====================
    
    // User permissions (can be loaded from localStorage or API)
    let userRole = localStorage.getItem('user-role') || 'staff'; // staff, clinical, admin
    
    // Quick Action Translations
    const quickActionTranslations = {
        en: {
            quickAction: 'New',
            dropdownTitle: 'Quick Actions',
            patient: 'New Patient',
            appointment: 'New Appointment',
            labOrder: 'New Lab Order',
            payment: 'New Payment',
            employee: 'New Employee',
            prescription: 'New Prescription',
            services: 'New Services',
            cancel: 'Cancel',
            save: 'Save',
            create: 'Create'
        },
        kh: {
            quickAction: 'ថ្មី',
            dropdownTitle: 'សកម្មភាពរហ័ស',
            patient: 'អ្នកជំងឺថ្មី',
            appointment: 'ការណាត់ជួបថ្មី',
            labOrder: 'សំណើមន្ទីរពិសោធន៍',
            payment: 'ការទូទាត់ថ្មី',
            employee: 'បុគ្គលិកថ្មី',
            prescription: 'វេជ្ជបញ្ជាថ្មី',
            services: 'សេវាកម្មថ្មី',
            cancel: 'បោះបង់',
            save: 'រក្សាទុក',
            create: 'បង្កើត'
        }
    };
    
    // Update Quick Action button text
    function updateQuickActionLanguage() {
        $('#quickActionText').text(quickActionTranslations[currentLanguage].quickAction);
        $('#dropdownTitle').text(quickActionTranslations[currentLanguage].dropdownTitle);
        
        // Update action labels
        $('.action-label').each(function() {
            const $label = $(this);
            const enText = $label.attr('data-en');
            const khText = $label.attr('data-kh');
            $label.text(currentLanguage === 'en' ? enText : khText);
        });
    }
    
    // Toggle Quick Action Dropdown
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
        
        // Filter items based on permissions
        filterActionsByPermission();
        
        // Focus first item for keyboard navigation
        setTimeout(() => {
            $('.quick-action-item:visible:first').focus();
        }, 100);
    }
    
    function closeQuickActionDropdown() {
        $('#quickActionDropdown').removeClass('show');
        $('#quickActionBtn').attr('aria-expanded', 'false');
    }
    
    // Close dropdown when clicking outside
    $(document).click(function(e) {
        if (!$(e.target).closest('.quick-action-wrapper').length) {
            closeQuickActionDropdown();
        }
    });
    
    // Close dropdown on Escape key
    $(document).keydown(function(e) {
        if (e.key === 'Escape') {
            closeQuickActionDropdown();
            closeActionModal();
        }
    });
    
    // Filter actions based on user permissions
    function filterActionsByPermission() {
        $('.quick-action-item').each(function() {
            const $item = $(this);
            const requiredPermission = $item.attr('data-permission');
            
            // Permission hierarchy: admin > clinical > staff
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
    
    // Handle Quick Action item clicks
    $('.quick-action-item').click(function() {
        const action = $(this).attr('data-action');
        handleQuickAction(action);
        closeQuickActionDropdown();
    });
    
    // Keyboard navigation for dropdown
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
    
    // Handle Quick Actions
    function handleQuickAction(action) {
        console.log('Quick Action:', action);
        
        switch(action) {
            case 'patient':
                openActionModal('patient');
                break;
            case 'appointment':
                openActionModal('appointment');
                break;
            case 'lab-order':
                openActionModal('lab-order');
                break;
            case 'payment':
                openActionModal('payment');
                break;
            case 'employee':
                openActionModal('employee');
                break;
            case 'prescription':
                openActionModal('prescription');
                break;
            case 'services':
                openActionModal('services');
                break;
            default:
                alert('Action not implemented yet');
        }
    }
    
    // Open Action Modal with form
    function openActionModal(actionType) {
        const modal = $('#actionModal');
        const icon = $('#actionModalIcon');
        const title = $('#actionModalTitle');
        const body = $('#actionModalBody');
        
        // Set icon and title based on action type
        const actionConfig = {
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
        
        const config = actionConfig[actionType];
        if (!config) return;
        
        icon.attr('class', 'action-modal-icon ' + config.icon);
        title.text(config.title);
        body.html(config.form);
        
        modal.addClass('show');
        
        // Focus first input
        setTimeout(() => {
            body.find('input, select, textarea').first().focus();
        }, 100);
    }
    
    window.closeActionModal = function() {
        $('#actionModal').removeClass('show');
    };
    
    // Form Templates
    function getPatientForm() {
        return `
            <form id="patientForm" onsubmit="handlePatientSubmit(event)">
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Full Name' : 'ឈ្មោះពេញ'}</label>
                    <input type="text" class="action-form-input" name="fullName" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Date of Birth' : 'ថ្ងៃខែឆ្នាំកំណើត'}</label>
                    <input type="date" class="action-form-input" name="dob" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Gender' : 'ភេទ'}</label>
                    <select class="action-form-select" name="gender" required>
                        <option value="">${currentLanguage === 'en' ? 'Select...' : 'ជ្រើសរើស...'}</option>
                        <option value="male">${currentLanguage === 'en' ? 'Male' : 'ប្រុស'}</option>
                        <option value="female">${currentLanguage === 'en' ? 'Female' : 'ស្រី'}</option>
                        <option value="other">${currentLanguage === 'en' ? 'Other' : 'ផ្សេងទៀត'}</option>
                    </select>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Phone Number' : 'លេខទូរស័ព្ទ'}</label>
                    <input type="tel" class="action-form-input" name="phone" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Address' : 'អាសយដ្ឋាន'}</label>
                    <textarea class="action-form-textarea" name="address"></textarea>
                </div>
                <div class="action-form-actions">
                    <button type="button" class="action-form-btn action-form-btn-secondary" onclick="closeActionModal()">
                        ${quickActionTranslations[currentLanguage].cancel}
                    </button>
                    <button type="submit" class="action-form-btn action-form-btn-primary">
                        ${quickActionTranslations[currentLanguage].create}
                    </button>
                </div>
            </form>
        `;
    }
    
    function getAppointmentForm() {
        return `
            <form id="appointmentForm" onsubmit="handleAppointmentSubmit(event)">
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Patient Name' : 'ឈ្មោះអ្នកជំងឺ'}</label>
                    <input type="text" class="action-form-input" name="patientName" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Date' : 'កាលបរិច្ឆេទ'}</label>
                    <input type="date" class="action-form-input" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Time' : 'ម៉ោង'}</label>
                    <input type="time" class="action-form-input" name="time" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Reason' : 'មូលហេតុ'}</label>
                    <textarea class="action-form-textarea" name="reason"></textarea>
                </div>
                <div class="action-form-actions">
                    <button type="button" class="action-form-btn action-form-btn-secondary" onclick="closeActionModal()">
                        ${quickActionTranslations[currentLanguage].cancel}
                    </button>
                    <button type="submit" class="action-form-btn action-form-btn-primary">
                        ${quickActionTranslations[currentLanguage].create}
                    </button>
                </div>
            </form>
        `;
    }
    
    function getLabOrderForm() {
        return `
            <form id="labOrderForm" onsubmit="handleLabOrderSubmit(event)">
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Patient Name' : 'ឈ្មោះអ្នកជំងឺ'}</label>
                    <input type="text" class="action-form-input" name="patientName" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Test Type' : 'ប្រភេទតេស្ត'}</label>
                    <select class="action-form-select" name="testType" required>
                        <option value="">${currentLanguage === 'en' ? 'Select...' : 'ជ្រើសរើស...'}</option>
                        <option value="blood">Blood Test</option>
                        <option value="urine">Urine Test</option>
                        <option value="xray">X-Ray</option>
                        <option value="ultrasound">Ultrasound</option>
                    </select>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Priority' : 'អាទិភាព'}</label>
                    <select class="action-form-select" name="priority" required>
                        <option value="routine">${currentLanguage === 'en' ? 'Routine' : 'ធម្មតា'}</option>
                        <option value="urgent">${currentLanguage === 'en' ? 'Urgent' : 'បន្ទាន់'}</option>
                        <option value="stat">STAT</option>
                    </select>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Notes' : 'កំណត់ចំណាំ'}</label>
                    <textarea class="action-form-textarea" name="notes"></textarea>
                </div>
                <div class="action-form-actions">
                    <button type="button" class="action-form-btn action-form-btn-secondary" onclick="closeActionModal()">
                        ${quickActionTranslations[currentLanguage].cancel}
                    </button>
                    <button type="submit" class="action-form-btn action-form-btn-primary">
                        ${quickActionTranslations[currentLanguage].create}
                    </button>
                </div>
            </form>
        `;
    }
    
    function getPaymentForm() {
        return `
            <form id="paymentForm" onsubmit="handlePaymentSubmit(event)">
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Patient Name' : 'ឈ្មោះអ្នកជំងឺ'}</label>
                    <input type="text" class="action-form-input" name="patientName" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Amount' : 'ចំនួនទឹកប្រាក់'}</label>
                    <input type="number" class="action-form-input" name="amount" step="0.01" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Payment Method' : 'វិធីទូទាត់'}</label>
                    <select class="action-form-select" name="paymentMethod" required>
                        <option value="">${currentLanguage === 'en' ? 'Select...' : 'ជ្រើសរើស...'}</option>
                        <option value="cash">${currentLanguage === 'en' ? 'Cash' : 'សាច់ប្រាក់'}</option>
                        <option value="card">${currentLanguage === 'en' ? 'Card' : 'កាត'}</option>
                        <option value="bank-transfer">${currentLanguage === 'en' ? 'Bank Transfer' : 'ផ្ទេរប្រាក់'}</option>
                    </select>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Description' : 'ពិពណ៌នា'}</label>
                    <textarea class="action-form-textarea" name="description"></textarea>
                </div>
                <div class="action-form-actions">
                    <button type="button" class="action-form-btn action-form-btn-secondary" onclick="closeActionModal()">
                        ${quickActionTranslations[currentLanguage].cancel}
                    </button>
                    <button type="submit" class="action-form-btn action-form-btn-primary">
                        ${quickActionTranslations[currentLanguage].create}
                    </button>
                </div>
            </form>
        `;
    }
    
    function getEmployeeForm() {
        return `
            <form id="employeeForm" onsubmit="handleEmployeeSubmit(event)">
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Full Name' : 'ឈ្មោះពេញ'}</label>
                    <input type="text" class="action-form-input" name="fullName" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Position' : 'មុខតំណែង'}</label>
                    <input type="text" class="action-form-input" name="position" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Department' : 'នាយកដ្ឋាន'}</label>
                    <input type="text" class="action-form-input" name="department" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Email' : 'អ៊ីមែល'}</label>
                    <input type="email" class="action-form-input" name="email" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Phone Number' : 'លេខទូរស័ព្ទ'}</label>
                    <input type="tel" class="action-form-input" name="phone" required>
                </div>
                <div class="action-form-actions">
                    <button type="button" class="action-form-btn action-form-btn-secondary" onclick="closeActionModal()">
                        ${quickActionTranslations[currentLanguage].cancel}
                    </button>
                    <button type="submit" class="action-form-btn action-form-btn-primary">
                        ${quickActionTranslations[currentLanguage].create}
                    </button>
                </div>
            </form>
        `;
    }
    
    function getPrescriptionForm() {
        return `
            <form id="prescriptionForm" onsubmit="handlePrescriptionSubmit(event)">
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Patient Name' : 'ឈ្មោះអ្នកជំងឺ'}</label>
                    <input type="text" class="action-form-input" name="patientName" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Medication' : 'ថ្នាំ'}</label>
                    <input type="text" class="action-form-input" name="medication" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Dosage' : 'ទំហំ'}</label>
                    <input type="text" class="action-form-input" name="dosage" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Frequency' : 'ប្រេកង់'}</label>
                    <input type="text" class="action-form-input" name="frequency" placeholder="e.g., 3 times daily" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Duration' : 'រយៈពេល'}</label>
                    <input type="text" class="action-form-input" name="duration" placeholder="e.g., 7 days" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Instructions' : 'សេចក្តីណែនាំ'}</label>
                    <textarea class="action-form-textarea" name="instructions"></textarea>
                </div>
                <div class="action-form-actions">
                    <button type="button" class="action-form-btn action-form-btn-secondary" onclick="closeActionModal()">
                        ${quickActionTranslations[currentLanguage].cancel}
                    </button>
                    <button type="submit" class="action-form-btn action-form-btn-primary">
                        ${quickActionTranslations[currentLanguage].create}
                    </button>
                </div>
            </form>
        `;
    }
    
    function getServicesForm() {
        return `
            <form id="servicesForm" onsubmit="handleServicesSubmit(event)">
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Service Name' : 'ឈ្មោះសេវាកម្ម'}</label>
                    <input type="text" class="action-form-input" name="serviceName" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Category' : 'ប្រភេទ'}</label>
                    <select class="action-form-select" name="category" required>
                        <option value="">${currentLanguage === 'en' ? 'Select...' : 'ជ្រើសរើស...'}</option>
                        <option value="consultation">${currentLanguage === 'en' ? 'Consultation' : 'ពិគ្រោះ'}</option>
                        <option value="procedure">${currentLanguage === 'en' ? 'Procedure' : 'វិធីសាស្រ្ត'}</option>
                        <option value="diagnostic">${currentLanguage === 'en' ? 'Diagnostic' : 'ការវិនិច្ឆ័យ'}</option>
                        <option value="therapy">${currentLanguage === 'en' ? 'Therapy' : 'ការព្យាបាល'}</option>
                    </select>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Price' : 'តម្លៃ'}</label>
                    <input type="number" class="action-form-input" name="price" step="0.01" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Duration (minutes)' : 'រយៈពេល (នាទី)'}</label>
                    <input type="number" class="action-form-input" name="duration" required>
                </div>
                <div class="action-form-group">
                    <label class="action-form-label">${currentLanguage === 'en' ? 'Description' : 'ពិពណ៌នា'}</label>
                    <textarea class="action-form-textarea" name="description"></textarea>
                </div>
                <div class="action-form-actions">
                    <button type="button" class="action-form-btn action-form-btn-secondary" onclick="closeActionModal()">
                        ${quickActionTranslations[currentLanguage].cancel}
                    </button>
                    <button type="submit" class="action-form-btn action-form-btn-primary">
                        ${quickActionTranslations[currentLanguage].create}
                    </button>
                </div>
            </form>
        `;
    }
    
    // Form Submit Handlers
    window.handlePatientSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Patient Data:', data);
        
        // TODO: Save to database/API
        alert(currentLanguage === 'en' ? 'Patient created successfully!' : 'បានបង្កើតអ្នកជំងឺដោយជោគជ័យ!');
        closeActionModal();
    };
    
    window.handleAppointmentSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Appointment Data:', data);
        
        // Add to appointments array
        const dateStr = data.date;
        appointments.push({
            id: Date.now(),
            date: dateStr,
            title: `${data.patientName} - ${data.reason || 'Appointment'}`,
            time: data.time
        });
        
        localStorage.setItem('calendar-appointments', JSON.stringify(appointments));
        renderAppointments();
        renderCalendar();
        
        alert(currentLanguage === 'en' ? 'Appointment created successfully!' : 'បានបង្កើតការណាត់ជួបដោយជោគជ័យ!');
        closeActionModal();
    };
    
    window.handleLabOrderSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Lab Order Data:', data);
        
        alert(currentLanguage === 'en' ? 'Lab order created successfully!' : 'បានបង្កើតសំណើមន្ទីរពិសោធន៍ដោយជោគជ័យ!');
        closeActionModal();
    };
    
    window.handlePaymentSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Payment Data:', data);
        
        alert(currentLanguage === 'en' ? 'Payment recorded successfully!' : 'បានកត់ត្រាការទូទាត់ដោយជោគជ័យ!');
        closeActionModal();
    };
    
    window.handleEmployeeSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Employee Data:', data);
        
        alert(currentLanguage === 'en' ? 'Employee created successfully!' : 'បានបង្កើតបុគ្គលិកដោយជោគជ័យ!');
        closeActionModal();
    };
    
    window.handlePrescriptionSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Prescription Data:', data);
        
        alert(currentLanguage === 'en' ? 'Prescription created successfully!' : 'បានបង្កើតវេជ្ជបញ្ជាដោយជោគជ័យ!');
        closeActionModal();
    };
    
    window.handleServicesSubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Service Data:', data);
        
        alert(currentLanguage === 'en' ? 'Service created successfully!' : 'បានបង្កើតសេវាកម្មដោយជោគជ័យ!');
        closeActionModal();
    };
    
    // Close modal on background click
    $('#actionModal').click(function(e) {
        if (e.target === this) {
            closeActionModal();
        }
    });
    
    // Initialize quick action language
    updateQuickActionLanguage();
    
    // ====================
    // END QUICK ACTION DROPDOWN
    // ====================
    
    // Initialize
    updateButtonLabels();
    updateSidebarTitle();
    
    // Set initial language UI
    const flag = currentLanguage === 'en' ? '🇬🇧' : '🇰🇭';
    const text = currentLanguage === 'en' ? 'English' : 'ខ្មែរ';
    $('#langToggle').find('.lang-flag').text(flag);
    $('#langToggle').find('#langText').text(text);
    
    // Clear caches on startup to ensure fresh data
    holidaysCache = {};
    buddhistEventsCache = {};
    
    renderCalendar();
    renderAppointments();
    console.log('✅ Khmer Lunar Calendar loaded successfully!');
});