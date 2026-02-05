/**
 * Dental Appointment Calendar - Translations Module
 * Contains all text translations for English and Khmer languages
 */

const translations = {
    en: {
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        daysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        shaveDay: 'Shave Day',
        fullMoon: 'Full Moon',
        koeut: 'Koeut',
        roach: 'Roach',
        today: 'Today',
        
        // Sidebar
        appointments: 'Appointments',
        noAppointments: 'No Appointments',
        noAppointmentsFound: 'No appointments found for the selected criteria',
        
        // Status labels
        statusLabels: {
            'scheduled': 'Scheduled',
            'arrived': 'Arrived',
            'ready': 'Ready',
            'in-treatment': 'In Treatment',
            'completed': 'Completed',
            'needs-followup': 'Follow-up',
            'walk-in': 'Walk-in',
            'no-show': 'No-show',
            'cancelled': 'Cancelled'
        },
        
        // Form labels
        newAppointment: 'New Appointment',
        editAppointment: 'Edit Appointment',
        patient: 'Patient',
        provider: 'Provider',
        date: 'Date',
        time: 'Time',
        duration: 'Duration',
        treatment: 'Treatment',
        room: 'Room',
        notes: 'Notes',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        
        // Search
        searchPlaceholder: 'Search patients, appointments...',
        
        // Views
        calendarView: 'Calendar',
        timelineView: 'Timeline',
        dashboardView: 'Dashboard',
        
        // Dashboard
        todaysAppointments: "Today's Appointments",
        upcomingAppointments: 'Upcoming Appointments',
        providerStatus: 'Provider Status',
        recentActivity: 'Recent Activity',
        
        // Notifications
        appointmentSaved: 'Appointment saved successfully',
        appointmentDeleted: 'Appointment deleted',
        appointmentUpdated: 'Appointment updated',
        
        // Errors
        errorSaving: 'Error saving appointment',
        errorLoading: 'Error loading data'
    },
    kh: {
        months: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'],
        daysShort: ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'],
        daysFull: ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'],
        shaveDay: 'ថ្ងៃកោរ',
        fullMoon: 'ពេញបូណ៌មី',
        koeut: 'កើត',
        roach: 'រោច',
        today: 'ថ្ងៃនេះ',
        
        // Sidebar
        appointments: 'ការណាត់ជួប',
        noAppointments: 'គ្មានការណាត់ជួប',
        noAppointmentsFound: 'រកមិនឃើញការណាត់ជួបសម្រាប់លក្ខណៈវិនិច្ឆ័យដែលបានជ្រើសរើស',
        
        // Status labels
        statusLabels: {
            'scheduled': 'បានកក់',
            'arrived': 'មកដល់',
            'ready': 'ត្រៀមជួប',
            'in-treatment': 'កំពុងព្យាបាល',
            'completed': 'បញ្ចប់',
            'needs-followup': 'ត្រូវតាមដាន',
            'walk-in': 'ដើរចូល',
            'no-show': 'មិនមក',
            'cancelled': 'បោះបង់'
        },
        
        // Form labels
        newAppointment: 'ការណាត់ជួបថ្មី',
        editAppointment: 'កែប្រែការណាត់ជួប',
        patient: 'អ្នកជំងឺ',
        provider: 'វេជ្ជបណ្ឌិត',
        date: 'កាលបរិច្ឆេទ',
        time: 'ពេលវេលា',
        duration: 'រយៈពេល',
        treatment: 'ការព្យាបាល',
        room: 'បន្ទប់',
        notes: 'កំណត់ចំណាំ',
        save: 'រក្សាទុក',
        cancel: 'បោះបង់',
        delete: 'លុប',
        
        // Search
        searchPlaceholder: 'ស្វែងរកអ្នកជំងឺ, ការណាត់ជួប...',
        
        // Views
        calendarView: 'ប្រតិទិន',
        timelineView: 'បន្ទាត់ពេល',
        dashboardView: 'ផ្ទាំងគ្រប់គ្រង',
        
        // Dashboard
        todaysAppointments: 'ការណាត់ជួបថ្ងៃនេះ',
        upcomingAppointments: 'ការណាត់ជួបខាងមុខ',
        providerStatus: 'ស្ថានភាពវេជ្ជបណ្ឌិត',
        recentActivity: 'សកម្មភាពថ្មីៗ',
        
        // Notifications
        appointmentSaved: 'ការណាត់ជួបបានរក្សាទុកដោយជោគជ័យ',
        appointmentDeleted: 'ការណាត់ជួបបានលុប',
        appointmentUpdated: 'ការណាត់ជួបបានធ្វើបច្ចុប្បន្នភាព',
        
        // Errors
        errorSaving: 'បញ្ហាក្នុងការរក្សាទុកការណាត់ជួប',
        errorLoading: 'បញ្ហាក្នុងការផ្ទុកទិន្នន័យ'
    }
};

// Get translation by key
function getTranslation(key, lang) {
    lang = lang || (typeof AppState !== 'undefined' ? AppState.getLanguage() : 'en');
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            // Fallback to English
            value = translations.en;
            for (const k2 of keys) {
                if (value && value[k2]) {
                    value = value[k2];
                } else {
                    return key; // Return key if translation not found
                }
            }
            break;
        }
    }
    
    return value;
}

// Shorthand function
function t(key, lang) {
    return getTranslation(key, lang);
}
