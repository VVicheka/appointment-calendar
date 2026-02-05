/**
 * Dental Appointment Calendar - Date Utilities
 * Contains date formatting and calculation functions
 */

// Keep numbers in English format only
function formatNumber(num) {
    return String(num);
}

// Format date for key (YYYY-MM-DD)
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format time (HH:MM)
function formatTime(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Format date for display
function formatDateDisplay(date, lang) {
    lang = lang || (typeof AppState !== 'undefined' ? AppState.getLanguage() : 'en');
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    const dayName = translations[lang].daysFull[date.getDay()];
    const dayNum = date.getDate();
    const monthName = translations[lang].months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

// Format date short
function formatDateShort(date, lang) {
    lang = lang || (typeof AppState !== 'undefined' ? AppState.getLanguage() : 'en');
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    const dayName = translations[lang].daysShort[date.getDay()];
    const dayNum = date.getDate();
    const monthName = translations[lang].months[date.getMonth()];
    
    return `${dayName}, ${dayNum} ${monthName}`;
}

// Parse date string to Date object
function parseDate(dateString) {
    if (!dateString) return null;
    
    // Handle YYYY-MM-DD HH:MM format
    if (dateString.includes(' ')) {
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    }
    
    // Handle YYYY-MM-DD format
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Add minutes to date
function addMinutes(date, minutes) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return new Date(date.getTime() + minutes * 60000);
}

// Add days to date
function addDays(date, days) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Check if same day
function isSameDay(date1, date2) {
    if (typeof date1 === 'string') date1 = new Date(date1);
    if (typeof date2 === 'string') date2 = new Date(date2);
    
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Check if today
function isToday(date) {
    if (typeof date === 'string') date = new Date(date);
    return isSameDay(date, new Date());
}

// Get start of day
function startOfDay(date) {
    if (typeof date === 'string') date = new Date(date);
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

// Get end of day
function endOfDay(date) {
    if (typeof date === 'string') date = new Date(date);
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}

// Get days in month
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

// Get first day of month (0 = Sunday, 6 = Saturday)
function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

// Get time slots for a day (for timeline view)
function getTimeSlots(startHour, endHour, intervalMinutes) {
    startHour = startHour || 7;
    endHour = endHour || 20;
    intervalMinutes = intervalMinutes || 30;
    
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            slots.push({
                hour: hour,
                minute: minute,
                label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
            });
        }
    }
    return slots;
}

// Calculate duration between two times in minutes
function calculateDuration(startTime, endTime) {
    if (typeof startTime === 'string') startTime = new Date(startTime);
    if (typeof endTime === 'string') endTime = new Date(endTime);
    
    return Math.round((endTime - startTime) / 60000);
}

// Format duration to human readable
function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours} hr`;
    }
    return `${hours} hr ${mins} min`;
}
