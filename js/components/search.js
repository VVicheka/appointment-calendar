/**
 * Search Component
 * Handles global search functionality across appointments, patients, queue, and follow-ups
 */

const SearchComponent = (function () {
    'use strict';

    let searchTimeout;
    let currentSearchScopes = ['all']; // Changed to array for multiple selections

    // ========================
    // INITIALIZATION
    // ========================

    function init() {
        bindEvents();
    }

    function bindEvents() {
        // Search input handler
        $('#globalSearch').on('input', function () {
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

        // Clear button
        $('#searchClear').click(function () {
            $('#globalSearch').val('');
            $('#searchResults').hide();
            $(this).hide();
        });

        // Scope dropdown button
        $('#searchScopeBtn').click(function (e) {
            e.stopPropagation();
            const isOpen = $('#searchScopeDropdown').hasClass('show');
            $('#searchScopeDropdown').toggleClass('show');
            $(this).attr('aria-expanded', !isOpen);
        });

        // Scope checkbox selection (multi-select)
        $('#searchScopeDropdown').on('change', 'input[type="checkbox"]', function () {
            const scope = $(this).data('scope');
            if (!scope) return;

            if (scope === 'all') {
                // If "All" is checked, uncheck others
                if ($(this).is(':checked')) {
                    currentSearchScopes = ['all'];
                    $('#searchScopeDropdown input[type="checkbox"]').prop('checked', false);
                    $(this).prop('checked', true);
                } else {
                    currentSearchScopes = [];
                }
            } else {
                // If any specific scope is checked, uncheck "All"
                $('#searchScopeDropdown input[data-scope="all"]').prop('checked', false);

                // Update currentSearchScopes array
                if ($(this).is(':checked')) {
                    currentSearchScopes = currentSearchScopes.filter(s => s !== 'all');
                    if (!currentSearchScopes.includes(scope)) {
                        currentSearchScopes.push(scope);
                    }
                } else {
                    currentSearchScopes = currentSearchScopes.filter(s => s !== scope);
                }

                // If nothing is selected, check "All"
                if (currentSearchScopes.length === 0) {
                    currentSearchScopes = ['all'];
                    $('#searchScopeDropdown input[data-scope="all"]').prop('checked', true);
                }
            }

            // Update label
            updateScopeLabel();

            // Re-run search if there's a query
            const query = $('#globalSearch').val().trim();
            if (query.length >= 2) {
                performSearch(query.toLowerCase());
            }
        });

        // Close dropdown when clicking outside
        $(document).click(function (e) {
            if (!$(e.target).closest('.search-wrapper').length) {
                $('#searchScopeDropdown').removeClass('show');
                $('#searchScopeBtn').attr('aria-expanded', 'false');
                $('#searchResults').hide();
            }
        });

        // Result card clicks
        $(document).on('click', '.search-result-card', function () {
            const type = $(this).data('type');
            const id = $(this).data('id');

            if (type === 'appointment' || type === 'queue' || type === 'followup') {
                if (typeof SlidePanelComponent !== 'undefined') {
                    SlidePanelComponent.openForEdit(id);
                }
            } else if (type === 'patient') {
                showPatientHistory(id);
            }

            $('#searchResults').hide();
            $('#globalSearch').val('');
            $('#searchClear').hide();
        });
    }

    function updateScopeLabel() {
        if (currentSearchScopes.includes('all')) {
            $('#searchScopeLabel').text('All');
        } else if (currentSearchScopes.length === 1) {
            const scopeLabels = {
                'appointments': 'Appointments',
                'patients': 'Patients',
                'queue': 'Queue',
                'followup': 'Follow-up'
            };
            $('#searchScopeLabel').text(scopeLabels[currentSearchScopes[0]] || 'All');
        } else {
            $('#searchScopeLabel').text(`${currentSearchScopes.length} selected`);
        }
    }

    // ========================
    // SEARCH LOGIC
    // ========================

    function performSearch(query) {
        const appointments = AppState.get('appointments');

        const results = {
            all: [],
            appointments: [],
            patients: [],
            queue: [],
            followup: []
        };

        // Search patients
        if (currentSearchScopes.includes('all') || currentSearchScopes.includes('patients')) {
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
        }

        // Search appointments
        if (currentSearchScopes.includes('all') || currentSearchScopes.includes('appointments')) {
            appointments.forEach(apt => {
                if (apt.patientName.toLowerCase().includes(query) ||
                    apt.providerName.toLowerCase().includes(query) ||
                    apt.title.toLowerCase().includes(query) ||
                    (apt.treatment && apt.treatment.toLowerCase().includes(query))) {

                    const dateObj = new Date(apt.dateStart);
                    const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const time = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                    const result = {
                        type: 'appointment',
                        icon: 'fa-calendar-check',
                        title: `${date}, ${time}`,
                        patient: apt.patientName,
                        provider: apt.providerName,
                        treatment: apt.treatment || 'General',
                        room: apt.roomNumber || 1,
                        status: apt.type,
                        statusColor: getStatusColor(apt.type),
                        data: apt
                    };
                    results.appointments.push(result);
                    results.all.push(result);
                }
            });
        }

        // Search queue (appointments that are arrived/ready/in-treatment)
        if (currentSearchScopes.includes('all') || currentSearchScopes.includes('queue')) {
            const queueStatuses = ['arrived', 'ready', 'in-treatment'];
            appointments.forEach(apt => {
                if (queueStatuses.includes(apt.type) &&
                    (apt.patientName.toLowerCase().includes(query) ||
                        apt.providerName.toLowerCase().includes(query))) {

                    const dateObj = new Date(apt.dateStart);
                    const arrivedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    const waitMinutes = Math.floor((new Date() - dateObj) / 60000);

                    const result = {
                        type: 'queue',
                        icon: 'fa-list-ul',
                        title: apt.patientName,
                        provider: apt.providerName,
                        status: apt.type,
                        statusLabel: getStatusLabel(apt.type),
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
        }

        // Search follow-ups
        if (currentSearchScopes.includes('all') || currentSearchScopes.includes('followup')) {
            appointments.forEach(apt => {
                if (apt.type === 'needs-followup' &&
                    (apt.patientName.toLowerCase().includes(query) ||
                        apt.treatment?.toLowerCase().includes(query))) {

                    const dateObj = new Date(apt.dateStart);
                    const visitDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
        }

        renderResults(results);
    }

    // ========================
    // RENDER RESULTS
    // ========================

    function renderResults(results) {
        const $container = $('#searchResults');

        // Combine results from all selected scopes
        let displayResults = [];
        if (currentSearchScopes.includes('all')) {
            displayResults = results.all;
        } else {
            currentSearchScopes.forEach(scope => {
                if (results[scope]) {
                    displayResults = displayResults.concat(results[scope]);
                }
            });
        }

        if (displayResults.length === 0) {
            const filterLabel = currentSearchScopes.length === 1
                ? currentSearchScopes[0].charAt(0).toUpperCase() + currentSearchScopes[0].slice(1)
                : 'results';
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
                            <button class="result-action-btn" onclick="event.stopPropagation(); SlidePanelComponent.openForEdit(${result.data.id})"><i class="fas fa-eye"></i></button>
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
                            <button class="result-action-btn" onclick="event.stopPropagation(); SearchComponent.showPatientHistory(${result.data.id})"><i class="fas fa-eye"></i></button>
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
                            <button class="result-action-btn" onclick="event.stopPropagation(); SlidePanelComponent.openForEdit(${result.data.id})"><i class="fas fa-eye"></i></button>
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
                            <button class="result-action-btn" onclick="event.stopPropagation(); SlidePanelComponent.openForEdit(${result.data.id})"><i class="fas fa-eye"></i></button>
                        </div>
                    </div>
                `;

            default:
                return '';
        }
    }

    // ========================
    // PATIENT HISTORY
    // ========================

    function showPatientHistory(patientId) {
        const patient = mockPatients.find(p => p.id === patientId);
        if (!patient) return;

        const appointments = AppState.get('appointments');
        const patientAppointments = appointments.filter(apt => apt.patientId === patientId);

        if (typeof SlidePanelComponent !== 'undefined') {
            SlidePanelComponent.open('patient-history', { patient, appointments: patientAppointments });
        }
    }

    // ========================
    // HELPER FUNCTIONS
    // ========================

    function getStatusColor(type) {
        const colors = {
            'scheduled': '#3b82f6',
            'arrived': '#8b5cf6',
            'ready': '#f59e0b',
            'in-treatment': '#22c55e',
            'completed': '#10b981',
            'needs-followup': '#f97316',
            'walk-in': '#06b6d4',
            'no-show': '#6b7280',
            'cancelled': '#ef4444'
        };
        return colors[type] || '#3b82f6';
    }

    function getStatusLabel(type) {
        const labels = {
            'scheduled': 'Scheduled',
            'arrived': 'Arrived',
            'ready': 'Ready',
            'in-treatment': 'In Treatment',
            'completed': 'Completed',
            'needs-followup': 'Follow-up',
            'walk-in': 'Walk-in',
            'no-show': 'No-show',
            'cancelled': 'Cancelled'
        };
        return labels[type] || type;
    }

    // ========================
    // PUBLIC API
    // ========================
    return {
        init,
        performSearch,
        showPatientHistory,
        getStatusColor,
        getStatusLabel
    };
})();

// Expose globally
window.SearchComponent = SearchComponent;
window.showPatientHistory = function (id) { SearchComponent.showPatientHistory(id); };
