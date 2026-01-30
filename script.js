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
                console.error('❌ MomentKH library not loaded!');
                buddhistEventsCache[year] = events;
                return events;
            }
            
            // 1. Khmer New Year - use getNewYear function
            try {
                const khmerNewYear = momentkh.getNewYear(year);
                console.log('🎉 Khmer New Year data:', khmerNewYear);
                
                if (khmerNewYear && khmerNewYear.year && khmerNewYear.month && khmerNewYear.day) {
                    // 3 days of Khmer New Year
                    const nyYear = khmerNewYear.year;
                    const nyMonth = khmerNewYear.month;
                    const nyDay = khmerNewYear.day;
                    
                    for (let i = 0; i < 3; i++) {
                        const nyDate = new Date(nyYear, nyMonth - 1, nyDay + i);
                        const dateKey = formatDateKey(nyDate);
                        
                        let timeInfo = '';
                        if (i === 0 && khmerNewYear.hour !== undefined && khmerNewYear.minute !== undefined) {
                            timeInfo = ` at ${String(khmerNewYear.hour).padStart(2, '0')}:${String(khmerNewYear.minute).padStart(2, '0')}`;
                        }
                        
                        const dayNames = {
                            0: { en: `Khmer New Year - Maha Songkran${timeInfo}`, kh: `ចូលឆ្នាំខ្មែរ មហាសង្ក្រាន្ត${timeInfo}`, isRestDay: true },
                            1: { en: 'Khmer New Year - Vara Vanabat', kh: 'ចូលឆ្នាំខ្មែរ វារៈវ័នបត', isRestDay: true },
                            2: { en: 'Khmer New Year - Vara Loeng Sak', kh: 'ចូលឆ្នាំខ្មែរ ថ្ងៃឡើងស័ក', isRestDay: true }
                        };
                        
                        events[dateKey] = dayNames[i];
                        console.log(`✅ Added Khmer New Year day ${i + 1}:`, dateKey);
                    }
                }
            } catch (e) {
                console.error('❌ Error calculating Khmer New Year:', e);
            }

            // 2. Calculate Buddhist holidays - try multiple BE years since lunar calendar can span Gregorian years
            const potentialBEYears = [year + 543, year + 544, year + 545]; // Try different BE year calculations
            
            // Define Buddhist holidays with proper data structure
            const buddhistHolidays = [
                { 
                    name: 'Meak Bochea', 
                    nameKh: 'ពិធីបុណ្យមាឃបូជា',
                    day: 15, 
                    moonPhase: 0, // waxing (កើត)
                    monthIndex: 2, // Meak (មាឃ) - index 2
                    isRestDay: true 
                },
                { 
                    name: 'Visakha Bochea', 
                    nameKh: 'ពិធីបុណ្យវិសាខបូជា',
                    day: 15, 
                    moonPhase: 0, // waxing (កើត)
                    monthIndex: 5, // Pisakh (ពិសាខ) - index 5
                    isRestDay: true 
                },
                { 
                    name: 'Asalha Bochea', 
                    nameKh: 'ពិធីបុណ្យអាសាឡ្ហបូជា',
                    day: 15, 
                    moonPhase: 0, // waxing (កើត)
                    monthIndex: 7, // Asadh (អាសាឍ) - index 7
                    isRestDay: true 
                },
                { 
                    name: 'Royal Ploughing Ceremony', 
                    nameKh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល',
                    day: 4, 
                    moonPhase: 0, // waxing (កើត)
                    monthIndex: 6, // Jesth (ជេស្ឋ) - index 6
                    isRestDay: true 
                }
            ];
            
            // Calculate each Buddhist holiday
            buddhistHolidays.forEach(holiday => {
                let found = false;
                
                // Try different BE years until we find one that falls in our target Gregorian year
                for (const beYear of potentialBEYears) {
                    try {
                        console.log(`🔍 Trying ${holiday.name} with BE ${beYear} for Gregorian ${year}...`);
                        const gregorianResult = momentkh.fromKhmer(holiday.day, holiday.moonPhase, holiday.monthIndex, beYear);
                        console.log(`📅 ${holiday.name} result:`, gregorianResult);
                        
                        if (gregorianResult && gregorianResult.year && gregorianResult.month && gregorianResult.day) {
                            // Check if this result falls in our target year or close to it
                            if (gregorianResult.year === year) {
                                const dateKey = formatDateKey(new Date(gregorianResult.year, gregorianResult.month - 1, gregorianResult.day));
                                events[dateKey] = { 
                                    en: holiday.name, 
                                    kh: holiday.nameKh,
                                    isRestDay: holiday.isRestDay 
                                };
                                console.log(`✅ Added ${holiday.name}:`, dateKey, `(BE ${beYear})`);
                                
                                // Special handling for Asalha Bochea - add Buddhist Lent the next day
                                if (holiday.name === 'Asalha Bochea') {
                                    const lentDate = new Date(gregorianResult.year, gregorianResult.month - 1, gregorianResult.day + 1);
                                    const lentDateKey = formatDateKey(lentDate);
                                    events[lentDateKey] = { 
                                        en: 'Buddhist Lent Begins', 
                                        kh: 'ចូលវស្សា',
                                        isRestDay: false 
                                    };
                                    console.log('✅ Added Buddhist Lent:', lentDateKey);
                                }
                                found = true;
                                break; // Found a match, stop trying other BE years
                            }
                        }
                    } catch (e) {
                        console.log(`⚠️ ${holiday.name} with BE ${beYear} failed:`, e.message);
                        continue; // Try next BE year
                    }
                }
                
                if (!found) {
                    console.warn(`❌ Could not find ${holiday.name} for year ${year} with any BE year`);
                }
            });

            // 3. Multi-day festivals
            const multidayFestivals = [
                {
                    name: 'Pchum Ben',
                    nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ',
                    days: [13, 14, 15],
                    moonPhase: 0, // waxing (កើត)
                    monthIndex: 10, // Assoch (អស្សុជ) - index 10
                    isRestDay: true
                },
                {
                    name: 'Water Festival',
                    nameKh: 'ពិធីបុណ្យអុំទូក',
                    days: [13, 14, 15],
                    moonPhase: 0, // waxing (កើត)
                    monthIndex: 11, // Kadeuk (កត្ដិក) - index 11
                    isRestDay: true
                }
            ];
            
            multidayFestivals.forEach(festival => {
                console.log(`🔍 Calculating ${festival.name} (${festival.days.length} days) for year ${year}...`);
                let foundDays = 0;
                
                // Try different BE years
                for (const beYear of potentialBEYears) {
                    festival.days.forEach(day => {
                        try {
                            const gregorianResult = momentkh.fromKhmer(day, festival.moonPhase, festival.monthIndex, beYear);
                            
                            if (gregorianResult && gregorianResult.year === year) {
                                const dateKey = formatDateKey(new Date(gregorianResult.year, gregorianResult.month - 1, gregorianResult.day));
                                
                                // Avoid duplicates
                                if (!events[dateKey] || !events[dateKey].en.includes(festival.name)) {
                                    events[dateKey] = { 
                                        en: festival.name, 
                                        kh: festival.nameKh,
                                        isRestDay: festival.isRestDay 
                                    };
                                    console.log(`✅ Added ${festival.name} day ${day}:`, dateKey, `(BE ${beYear})`);
                                    foundDays++;
                                }
                            }
                        } catch (e) {
                            // Silent fail, continue with other combinations
                        }
                    });
                    
                    if (foundDays > 0) break; // If we found some days with this BE year, don't try others
                }
            });

            const eventCount = Object.keys(events).length;
            console.log(`🎯 Total Buddhist holidays calculated for ${year}:`, eventCount, 'events');
            
            if (eventCount === 0) {
                console.warn(`⚠️ No Buddhist holidays calculated for ${year}! This might indicate an issue.`);
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
        
        // Debug: Check for specific Buddhist holidays
        const feb2 = `${year}-02-02`;
        const may1 = `${year}-05-01`;
        if (holidays[feb2]) {
            console.log(`✅ CONFIRMED: Meak Bochea found in final holidays object:`, holidays[feb2]);
        } else {
            console.log(`❌ MISSING: Meak Bochea not found in final holidays object for ${feb2}`);
        }
        if (holidays[may1]) {
            console.log(`✅ CONFIRMED: Visakha Bochea found in final holidays object:`, holidays[may1]);
        } else {
            console.log(`❌ MISSING: Visakha Bochea not found in final holidays object for ${may1}`);
        }
        
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
                lunarDateStr = `${lunarDay} ${moonPhase === 0 ? translations.en.koeut : translations.en.roach}`;
            } else {
                // Use Arabic numerals even in Khmer mode
                lunarDateStr = `${lunarDay}${moonPhase === 0 ? translations.kh.koeut : translations.kh.roach}`;
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
                return `${firstMonth}, ${animalYear} ${currentLanguage === 'en' ? 'B.E.' : 'ព.ស.'} ${beYear}`;
            } else {
                return `${firstMonth} - ${lastMonth}, ${animalYear} ${currentLanguage === 'en' ? 'B.E.' : 'ព.ស.'} ${beYear}`;
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
                $('#modalTitle').text('ថ្ងៃនេះ:');
            } else {
                $('#modalTitle').text(`ថ្ងៃទី${gregorianDay}ខែ${gregorianMonth} ឆ្នាំ${gregorianYear}`);
            }
        } else {
            if (isToday) {
                $('#modalTitle').text('Today');
            } else {
                $('#modalTitle').text(`${gregorianMonth} ${gregorianDay}, ${gregorianYear}`);
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
                modalText += '\n';
                const colorStyle = holiday.isRestDay ? 'color: #ff0000' : 'color: #9933cc';
                modalText += `\n<span style="${colorStyle}">• ${holiday.kh}</span>`;
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
                text += '\n';
                const colorStyle = holiday.isRestDay ? 'color: #ff0000' : 'color: #9933cc';
                text += `\n<span style="${colorStyle}">• ${holiday.en}</span>`;
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
                const date = new Date(year, month, dayCount);
                const isCurrentMonth = date.getMonth() === month;
                calendarHtml += renderDay(date, !isCurrentMonth, day);
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
        
        // Debug: Track rendering of specific dates
        if (dateKey === '2026-02-02' || dateKey === '2026-05-01') {
            console.log(`🔥 RENDERING CRITICAL DATE: ${dateKey}`);
            console.log(`🔥 isOtherMonth: ${isOtherMonth}`);
            console.log(`🔥 holidays object keys:`, Object.keys(holidays).filter(key => key.includes('2026-02') || key.includes('2026-05')));
            console.log(`🔥 holiday found:`, holiday);
        }
        
        // Debug: Log holiday data for current month days with specific date tracking
        if (!isOtherMonth) {
            if (holiday) {
                console.log(`🎯 Holiday found for ${dateKey}:`, holiday);
                
                // Special tracking for known Buddhist holidays
                if (dateKey === '2026-02-02' || dateKey === '2026-05-01') {
                    console.log(`🔥 CRITICAL BUDDHIST HOLIDAY FOUND: ${dateKey}`, holiday);
                    console.log('🔥 Holiday object structure:', JSON.stringify(holiday, null, 2));
                }
            } else {
                // Check if this date should have a Buddhist holiday
                const monthStr = date.getMonth() + 1;
                if ([2, 4, 5, 7, 10, 11].includes(monthStr)) { // Months that typically have Buddhist holidays
                    console.log(`🔍 No holiday found for ${dateKey} (checking month ${monthStr})`);
                }
                
                // Special tracking for dates we know should have holidays
                if (dateKey === '2026-02-02' || dateKey === '2026-05-01') {
                    console.log(`🚨 MISSING EXPECTED BUDDHIST HOLIDAY: ${dateKey}`);
                    console.log(`🚨 All holidays for year ${date.getFullYear()}:`, Object.keys(holidays));
                    console.log(`🚨 Holiday object:`, holidays[dateKey]);
                }
            }
        }
        
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
            
            // Special day markers (only for current month)
            if (!isOtherMonth) {
                if (buddhistInfo.isShaveDay) {
                    html += `<div class="day-info special-day">${translations[currentLanguage].shaveDay}</div>`;
                }
                if (buddhistInfo.isFullMoon) {
                    html += `<div class="day-info special-day">${translations[currentLanguage].fullMoon}</div>`;
                }
            }
        }
        
        // Holiday/Event text (show for all dates, not just current month)
        if (holiday) {
            const holidayText = currentLanguage === 'kh' ? holiday.kh : holiday.en;
            const textClass = holiday.isRestDay ? 'holiday-text' : 'buddhist-event-text';
            const holidayHtml = `<div class="day-info ${textClass}">${holidayText}</div>`;
            html += holidayHtml;
            
            // Debug: Log when holiday is actually rendered
            if (!isOtherMonth) {
                console.log(`🎨 RENDERED holiday for ${dateKey}: "${holidayText}" (${textClass})`);
            }
            
            // Special tracking for critical dates
            if (dateKey === '2026-02-02' || dateKey === '2026-05-01') {
                console.log(`🔥 CRITICAL HOLIDAY RENDERED: ${dateKey}`);
                console.log(`🔥 Holiday text: "${holidayText}"`);
                console.log(`🔥 CSS class: ${textClass}`);
                console.log(`🔥 Generated HTML:`, holidayHtml);
            }
        } else {
            // Debug: Log when no holiday is rendered but expected
            if (!isOtherMonth && [2, 4, 5, 7, 10, 11].includes(date.getMonth() + 1)) {
                console.log(`❌ NO HOLIDAY RENDERED for ${dateKey} despite being in holiday month`);
            }
            
            // Critical date tracking
            if (dateKey === '2026-02-02' || dateKey === '2026-05-01') {
                console.log(`🚨 CRITICAL HOLIDAY MISSING: ${dateKey}`);
                console.log(`🚨 Holiday lookup result:`, holiday);
                console.log(`🚨 Available holidays:`, Object.keys(holidays).filter(k => k.includes('2026')));
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
            html = `<div class="no-appointments">${currentLanguage === 'en' ? 'No appointments yet' : 'មិនទាន់មានការណាត់ជួប'}</div>`;
        } else {
            sortedAppointments.forEach((apt, index) => {
                const date = new Date(apt.date);
                const dateStr = currentLanguage === 'en' 
                    ? `${translations.en.months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
                    : `${date.getDate()} ${translations.kh.months[date.getMonth()]} ${date.getFullYear()}`;
                
                html += `<div class="appointment-item" onclick="editAppointment(${index})">`;
                html += `<div class="appointment-date">${dateStr}</div>`;
                html += `<div class="appointment-title">${apt.title}</div>`;
                if (apt.time) {
                    html += `<div class="appointment-time">⏰ ${apt.time}</div>`;
                }
                html += `</div>`;
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
            $('#btnCopyText').text('ចម្លងអត្ថបទ');
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
    
    // Initialize
    updateButtonLabels();
    updateSidebarTitle();
    
    // Set initial language UI
    const flag = currentLanguage === 'en' ? '🇬🇧' : '🇰🇭';
    const text = currentLanguage === 'en' ? 'English' : 'ខ្મែរ';
    $('#langToggle').find('.lang-flag').text(flag);
    $('#langToggle').find('#langText').text(text);
    
    // Clear caches on startup to ensure fresh data
    holidaysCache = {};
    buddhistEventsCache = {};
    
    renderCalendar();
    renderAppointments();
    console.log('✅ Khmer Lunar Calendar loaded successfully!');
});