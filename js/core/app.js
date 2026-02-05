/**
 * App Initializer
 * Main entry point that orchestrates all components
 */

const App = (function() {
    'use strict';

    // ========================
    // DATA LOADING
    // ========================
    
    async function loadData() {
        try {
            const response = await fetch('appointments.json');
            if (response.ok) {
                const data = await response.json();
                AppState.set('appointments', data.appointments || []);
                AppState.set('payments', data.payments || []);
                AppState.set('dataLoadedFromJson', true);
                console.log('✅ Loaded data from appointments.json');
                
                // Save to localStorage as backup
                localStorage.setItem('calendar-appointments', JSON.stringify(data.appointments || []));
                localStorage.setItem('calendar-payments', JSON.stringify(data.payments || []));
            } else {
                throw new Error('JSON file not found');
            }
        } catch (error) {
            console.log('⚠️ Could not load from JSON, using localStorage:', error.message);
            loadFromLocalStorage();
        }
    }

    function loadFromLocalStorage() {
        let storedAppointments = JSON.parse(localStorage.getItem('calendar-appointments')) || [];
        
        // Filter out old format appointments
        const appointments = storedAppointments.filter(apt => apt.dateStart);
        
        if (appointments.length !== storedAppointments.length) {
            console.log('🔧 Cleaned up old appointment data');
            localStorage.setItem('calendar-appointments', JSON.stringify(appointments));
        }
        
        AppState.set('appointments', appointments);
        AppState.set('payments', JSON.parse(localStorage.getItem('calendar-payments')) || []);
        
        // Use sample data if empty
        if (appointments.length === 0) {
            loadSampleData();
        }
    }

    function loadSampleData() {
        const sampleAppointments = typeof getSampleAppointments === 'function' 
            ? getSampleAppointments() 
            : [
                {
                    id: 1,
                    patientId: 1,
                    patientName: 'Sokha Meas',
                    providerId: 1,
                    providerName: 'Dr. Sopheap Chhorn',
                    treatmentCategory: 'consultation',
                    treatment: 'consultation',
                    roomNumber: 1,
                    title: 'Initial Consultation',
                    dateStart: '2026-02-04 08:00',
                    dateEnd: '2026-02-04 08:30',
                    type: 'scheduled',
                    notes: 'New patient registration'
                }
            ];
        
        AppState.set('appointments', sampleAppointments);
        localStorage.setItem('calendar-appointments', JSON.stringify(sampleAppointments));
    }

    // ========================
    // VIEW SWITCHING
    // ========================
    
    function switchView(view) {
        AppState.setView(view);

        // Update button states
        $('.view-btn').removeClass('active');
        $(`#view${view.charAt(0).toUpperCase() + view.slice(1)}`).addClass('active');

        // Show/hide sections
        $('#calendarMain, #appointmentsSidebar').toggle(view === 'calendar');
        $('#timelineSection').toggle(view === 'timeline');
        $('#dashboardSection').toggle(view === 'dashboard');

        // Render appropriate view
        if (view === 'timeline' && typeof TimelineView !== 'undefined') {
            TimelineView.render();
        } else if (view === 'dashboard' && typeof DashboardView !== 'undefined') {
            DashboardView.render();
        }
    }

    // ========================
    // LANGUAGE TOGGLE
    // ========================
    
    function toggleLanguage() {
        const newLang = AppState.toggleLanguage();
        
        const flag = newLang === 'en' ? '🇬🇧' : '🇰🇭';
        const text = newLang === 'en' ? 'English' : 'ខ្មែរ';
        $('#langToggle').find('.lang-flag').text(flag);
        $('#langToggle').find('#langText').text(text);

        // Update all components
        if (typeof QuickActionsComponent !== 'undefined') {
            QuickActionsComponent.updateLanguage();
        }
        if (typeof AppointmentsManager !== 'undefined') {
            AppointmentsManager.updateSidebarTitle();
        }
        
        populateProviderFilter();
        
        if (typeof CalendarView !== 'undefined') {
            CalendarView.render();
        }
    }

    // ========================
    // PROVIDER FILTER
    // ========================
    
    function populateProviderFilter() {
        const currentLanguage = AppState.getLanguage();
        const selectedProviderIds = AppState.get('selectedProviderIds');
        
        let html = '';
        mockProviders.forEach(p => {
            const isChecked = selectedProviderIds.includes(p.id) ? 'checked' : '';
            html += `
                <label class="provider-filter-item">
                    <input type="checkbox" class="provider-checkbox" value="${p.id}" ${isChecked} onchange="App.toggleProvider(${p.id})">
                    <span class="provider-color" style="background: ${p.color}"></span>
                    <span class="provider-name">${p.name}</span>
                </label>
            `;
        });
        
        $('#providerFilterList').html(html);
    }

    function toggleProvider(providerId) {
        AppState.toggleProviderFilter(providerId);
        if (typeof AppointmentsManager !== 'undefined') {
            AppointmentsManager.render();
        }
    }

    // ========================
    // EVENT BINDING
    // ========================
    
    function bindGlobalEvents() {
        // View toggle buttons
        $('#viewCalendar').click(function() { switchView('calendar'); });
        $('#viewTimeline').click(function() { switchView('timeline'); });
        $('#viewDashboard').click(function() { switchView('dashboard'); });

        // Language toggle
        $('#langToggle').click(toggleLanguage);

        // Provider filter toggle
        $('#providerFilterBtn').click(function() {
            $('#providerFilterList').toggle();
        });

        // Close provider filter when clicking outside
        $(document).click(function(e) {
            if (!$(e.target).closest('.provider-filter-wrapper').length) {
                $('#providerFilterList').hide();
            }
        });

        // Escape key handler
        $(document).keydown(function(e) {
            if (e.key === 'Escape') {
                if (typeof SlidePanelComponent !== 'undefined') {
                    SlidePanelComponent.close();
                }
                if (typeof QuickActionsComponent !== 'undefined') {
                    QuickActionsComponent.closeDropdown();
                }
            }
        });

        // Filter checkboxes
        $('#filterViewAll').on('change', function() {
            if ($(this).is(':checked')) {
                $('.filter-type').prop('checked', false);
            }
            if (typeof AppointmentsManager !== 'undefined') {
                AppointmentsManager.render();
            }
        });

        $('.filter-type').on('change', function() {
            if ($(this).is(':checked')) {
                $('#filterViewAll').prop('checked', false);
            }
            if (typeof AppointmentsManager !== 'undefined') {
                AppointmentsManager.render();
            }
        });
    }

    // ========================
    // INITIALIZATION
    // ========================
    
    async function init() {
        console.log('🚀 Initializing Appointment Calendar...');

        // Load data first
        await loadData();

        // Initialize components
        if (typeof CalendarView !== 'undefined') {
            CalendarView.bindEvents();
        }
        if (typeof TimelineView !== 'undefined') {
            TimelineView.bindEvents();
        }
        if (typeof SlidePanelComponent !== 'undefined') {
            SlidePanelComponent.bindEvents();
        }
        if (typeof SearchComponent !== 'undefined') {
            SearchComponent.init();
        }
        if (typeof QuickActionsComponent !== 'undefined') {
            QuickActionsComponent.init();
        }

        // Bind global events
        bindGlobalEvents();

        // Set initial language display
        const currentLanguage = AppState.getLanguage();
        const flag = currentLanguage === 'en' ? '🇬🇧' : '🇰🇭';
        const text = currentLanguage === 'en' ? 'English' : 'ខ្មែរ';
        $('#langToggle').find('.lang-flag').text(flag);
        $('#langToggle').find('#langText').text(text);

        // Populate provider filter
        populateProviderFilter();

        // Hide New Appointment button initially
        $('#newAppointmentBtn').hide();

        // Render initial view
        if (typeof CalendarView !== 'undefined') {
            CalendarView.render();
        }

        console.log('✅ Appointment Calendar initialized successfully');
    }

    // ========================
    // PUBLIC API
    // ========================
    return {
        init,
        switchView,
        toggleLanguage,
        toggleProvider,
        populateProviderFilter
    };
})();

// Initialize on document ready
$(document).ready(function() {
    App.init();
});

// Expose globally
window.App = App;
