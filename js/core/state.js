/**
 * App State Manager
 * Centralized state management for the appointment calendar
 * All components access and modify state through this module
 */

const AppState = (function() {
    'use strict';

    // ========================
    // CORE STATE
    // ========================
    let state = {
        // Date & Calendar
        currentDate: new Date(),
        selectedDate: null,
        timelineDate: new Date(),
        
        // Language
        currentLanguage: localStorage.getItem('calendar-language') || 'en',
        
        // View
        currentView: 'calendar', // 'calendar', 'timeline', 'dashboard'
        
        // Data
        appointments: [],
        payments: [],
        dailyReports: JSON.parse(localStorage.getItem('calendar-daily-reports')) || [],
        
        // Flags
        dataLoadedFromJson: false,
        
        // User
        userRole: localStorage.getItem('user-role') || 'staff',
        
        // Provider selection (for calendar sidebar)
        selectedProviderIds: [],
        
        // Timeline specific
        timelineViewMode: localStorage.getItem('timeline-view-mode') || 'multi',
        timelineSelectedProviders: JSON.parse(localStorage.getItem('timeline-selected-providers') || '[]'),
        
        // Caches
        holidaysCache: {},
        buddhistEventsCache: {},
        
        // Edit state
        currentDailyReport: null,
        currentEditId: null
    };

    // Initialize timeline providers if empty
    if (state.timelineSelectedProviders.length === 0 && typeof mockProviders !== 'undefined') {
        state.timelineSelectedProviders = mockProviders.map(p => p.id);
    }

    // ========================
    // STATE GETTERS
    // ========================
    function get(key) {
        return state[key];
    }

    function getAll() {
        return { ...state };
    }

    // ========================
    // STATE SETTERS
    // ========================
    function set(key, value) {
        state[key] = value;
        
        // Persist certain values to localStorage
        const persistKeys = {
            'currentLanguage': 'calendar-language',
            'appointments': 'calendar-appointments',
            'payments': 'calendar-payments',
            'dailyReports': 'calendar-daily-reports',
            'timelineViewMode': 'timeline-view-mode',
            'timelineSelectedProviders': 'timeline-selected-providers',
            'userRole': 'user-role'
        };
        
        if (persistKeys[key]) {
            const storageKey = persistKeys[key];
            const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
            localStorage.setItem(storageKey, valueToStore);
        }
    }

    function update(updates) {
        Object.keys(updates).forEach(key => {
            set(key, updates[key]);
        });
    }

    // ========================
    // APPOINTMENTS METHODS
    // ========================
    function addAppointment(appointment) {
        state.appointments.push(appointment);
        set('appointments', state.appointments);
    }

    function updateAppointment(id, updates) {
        const index = state.appointments.findIndex(apt => apt.id === id);
        if (index !== -1) {
            state.appointments[index] = { ...state.appointments[index], ...updates };
            set('appointments', state.appointments);
            return true;
        }
        return false;
    }

    function deleteAppointment(id) {
        const index = state.appointments.findIndex(apt => apt.id === id);
        if (index !== -1) {
            state.appointments.splice(index, 1);
            set('appointments', state.appointments);
            return true;
        }
        return false;
    }

    function getAppointmentById(id) {
        return state.appointments.find(apt => apt.id === id);
    }

    // ========================
    // PAYMENTS METHODS
    // ========================
    function addPayment(payment) {
        state.payments.push(payment);
        set('payments', state.payments);
    }

    function getPayments() {
        return state.payments;
    }

    // ========================
    // PROVIDER SELECTION (Calendar Sidebar)
    // ========================
    function toggleProviderFilter(providerId) {
        const index = state.selectedProviderIds.indexOf(providerId);
        if (index === -1) {
            state.selectedProviderIds.push(providerId);
        } else {
            state.selectedProviderIds.splice(index, 1);
        }
    }

    function clearProviderFilters() {
        state.selectedProviderIds = [];
    }

    // ========================
    // TIMELINE PROVIDER SELECTION
    // ========================
    function toggleTimelineProvider(providerId) {
        const index = state.timelineSelectedProviders.indexOf(providerId);
        if (index === -1) {
            state.timelineSelectedProviders.push(providerId);
        } else {
            state.timelineSelectedProviders.splice(index, 1);
        }
        set('timelineSelectedProviders', state.timelineSelectedProviders);
    }

    function selectAllTimelineProviders() {
        if (typeof mockProviders !== 'undefined') {
            state.timelineSelectedProviders = mockProviders.map(p => p.id);
            set('timelineSelectedProviders', state.timelineSelectedProviders);
        }
    }

    function clearTimelineProviders() {
        state.timelineSelectedProviders = [];
        set('timelineSelectedProviders', state.timelineSelectedProviders);
    }

    function setTimelineViewMode(mode) {
        state.timelineViewMode = mode;
        set('timelineViewMode', mode);
    }

    // ========================
    // LANGUAGE
    // ========================
    function toggleLanguage() {
        const newLang = state.currentLanguage === 'en' ? 'kh' : 'en';
        set('currentLanguage', newLang);
        return newLang;
    }

    function getLanguage() {
        return state.currentLanguage;
    }

    // ========================
    // VIEW MANAGEMENT
    // ========================
    function setView(view) {
        state.currentView = view;
    }

    function getView() {
        return state.currentView;
    }

    // ========================
    // DATE MANAGEMENT
    // ========================
    function setCurrentDate(date) {
        state.currentDate = date;
    }

    function setSelectedDate(date) {
        state.selectedDate = date;
    }

    function setTimelineDate(date) {
        state.timelineDate = date;
    }

    function navigateMonth(direction) {
        state.currentDate.setMonth(state.currentDate.getMonth() + direction);
    }

    function resetToToday() {
        state.currentDate = new Date();
        state.timelineDate = new Date();
    }

    // ========================
    // UTILITY FUNCTIONS
    // ========================
    function generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    function formatNumber(num) {
        return String(num);
    }

    // ========================
    // PUBLIC API
    // ========================
    return {
        // Generic getters/setters
        get,
        getAll,
        set,
        update,
        
        // Appointments
        addAppointment,
        updateAppointment,
        deleteAppointment,
        getAppointmentById,
        
        // Payments
        addPayment,
        getPayments,
        
        // Provider filters
        toggleProviderFilter,
        clearProviderFilters,
        
        // Timeline providers
        toggleTimelineProvider,
        selectAllTimelineProviders,
        clearTimelineProviders,
        setTimelineViewMode,
        
        // Language
        toggleLanguage,
        getLanguage,
        
        // View
        setView,
        getView,
        
        // Dates
        setCurrentDate,
        setSelectedDate,
        setTimelineDate,
        navigateMonth,
        resetToToday,
        
        // Utils
        generateId,
        formatNumber
    };
})();

// Expose globally
window.AppState = AppState;
