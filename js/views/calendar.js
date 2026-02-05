/**
 * Calendar View Component
 * Handles the calendar grid rendering and date interactions
 */

const CalendarView = (function() {
    'use strict';

    // ========================
    // CALENDAR RENDERING
    // ========================
    
    function render() {
        const currentDate = AppState.get('currentDate');
        const currentLanguage = AppState.getLanguage();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Update header
        const monthName = currentLanguage === 'en'
            ? `${translations.en.months[month]} ${year}`
            : `${translations.kh.months[month]} ${AppState.formatNumber(year)}`;
        $('#headerTitle').text(monthName);

        // Update lunar info
        if (typeof getLunarMonthRange === 'function') {
            $('#lunarInfo').text(getLunarMonthRange(year, month + 1));
        }

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
        AppState.setSelectedDate(null);
        
        // Trigger appointment render
        if (typeof AppointmentsManager !== 'undefined') {
            AppointmentsManager.render();
        }
    }

    function renderDay(date, isOtherMonth, dayOfWeek) {
        const currentLanguage = AppState.getLanguage();
        const appointments = AppState.get('appointments');
        const day = date.getDate();
        const dateKey = formatDateKey(date);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        
        // Get holidays
        const holidays = typeof getHolidays === 'function' ? getHolidays(date.getFullYear()) : {};
        const holiday = holidays[dateKey];
        
        // Get Buddhist info
        const buddhistInfo = typeof getBuddhistDateInfo === 'function' ? getBuddhistDateInfo(date) : null;

        // Count appointments for this date
        const dayAppointments = appointments.filter(apt => apt.dateStart && apt.dateStart.startsWith(dateKey));
        const appointmentCount = dayAppointments.length;

        let classes = 'day-cell';
        if (isOtherMonth) classes += ' other-month';
        if (isToday) classes += ' today';
        if (dayOfWeek === 0 || dayOfWeek === 6) classes += ' weekend';
        if (holiday && holiday.isRestDay) classes += ' holiday';

        let html = `<div class="${classes}" data-date="${dateKey}" onclick="CalendarView.handleDateClick('${dateKey}')">`;

        // Day header
        html += `<div class="day-header-row">`;
        html += `<div class="day-number">${AppState.formatNumber(day)}</div>`;
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
            html += `<div class="day-info"><span class="appointment-count">${AppState.formatNumber(appointmentCount)}</span></div>`;
        }

        html += `</div>`;
        return html;
    }

    // ========================
    // DATE CLICK HANDLING
    // ========================
    
    function handleDateClick(dateKeyOrDate) {
        let date;
        
        if (typeof dateKeyOrDate === 'string') {
            const parts = dateKeyOrDate.split('-');
            date = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            date = dateKeyOrDate;
        }

        const selectedDate = AppState.get('selectedDate');
        const dateKey = formatDateKey(date);

        // Toggle selection
        if (selectedDate && formatDateKey(selectedDate) === dateKey) {
            clearDateSelection();
            return;
        }

        // Update state
        AppState.setSelectedDate(date);

        // Update UI
        $('.day-cell').removeClass('selected');
        $(`.day-cell[data-date="${dateKey}"]`).addClass('selected');

        // Show New Appointment button
        $('#newAppointmentBtn').show();

        // Update sidebar
        if (typeof AppointmentsManager !== 'undefined') {
            AppointmentsManager.render();
        }
    }

    function clearDateSelection() {
        AppState.setSelectedDate(null);
        $('.day-cell').removeClass('selected');
        $('#newAppointmentBtn').hide();
        
        if (typeof AppointmentsManager !== 'undefined') {
            AppointmentsManager.render();
        }
    }

    // ========================
    // NAVIGATION
    // ========================
    
    function navigatePrevMonth() {
        AppState.navigateMonth(-1);
        render();
    }

    function navigateNextMonth() {
        AppState.navigateMonth(1);
        render();
    }

    function navigateToToday() {
        AppState.resetToToday();
        render();
    }

    // ========================
    // HELPER FUNCTIONS
    // ========================
    
    // Note: formatDateKey is available globally from dateUtils.js
    // We just reference it directly: formatDateKey(date)

    // ========================
    // EVENT BINDING
    // ========================
    
    function bindEvents() {
        // Navigation buttons
        $('.btn-prev-month').click(navigatePrevMonth);
        $('.btn-next-month').click(navigateNextMonth);
        $('.btn-refresh').click(navigateToToday);

        // Clear date selection when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.day-cell').length && AppState.get('selectedDate')) {
                clearDateSelection();
            }
        });
    }

    // ========================
    // PUBLIC API
    // ========================
    return {
        render,
        renderDay,
        handleDateClick,
        clearDateSelection,
        navigatePrevMonth,
        navigateNextMonth,
        navigateToToday,
        bindEvents
    };
})();

// Expose globally
window.CalendarView = CalendarView;

// Also expose handleDateClick directly for onclick handlers
window.handleDateClick = function(dateKey) {
    CalendarView.handleDateClick(dateKey);
};
