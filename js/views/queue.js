/**
 * Queue View Component
 * Full-screen view for managing patient queue (arrived patients waiting for treatment)
 * Queue = patients who have arrived and are waiting
 * Appointment = patients scheduled but not yet arrived
 */

const QueueView = (function () {
    'use strict';

    // ========================
    // STATE
    // ========================
    let sortBy = 'priority'; // priority, time, provider
    let filterProvider = 'all';
    let filterUrgency = 'all';

    // ========================
    // MAIN RENDER
    // ========================

    function render() {
        const appointments = AppState.get('appointments');
        const today = formatDateKey(new Date());
        const now = new Date();

        // Get queue items (arrived or ready patients)
        let queueItems = appointments.filter(apt => {
            const isToday = apt.dateStart && apt.dateStart.startsWith(today);
            const isInQueue = apt.type === 'arrived' || apt.type === 'ready';
            return isToday && isInQueue;
        }).map(apt => {
            // Calculate priority and wait time
            const priorityData = AppointmentsManager.calculatePriority(apt);
            const startTime = new Date(apt.dateStart);
            const waitMinutes = Math.floor((now - startTime) / 60000);

            return {
                ...priorityData,
                waitMinutes
            };
        });

        // Apply filters
        if (filterProvider !== 'all') {
            queueItems = queueItems.filter(apt => apt.providerId === parseInt(filterProvider));
        }

        if (filterUrgency !== 'all') {
            queueItems = queueItems.filter(apt => {
                if (filterUrgency === 'urgent') return apt.priorityScore > 150;
                if (filterUrgency === 'high') return apt.priorityScore > 100 && apt.priorityScore <= 150;
                if (filterUrgency === 'normal') return apt.priorityScore <= 100;
                return true;
            });
        }

        // Apply sorting
        queueItems = sortQueue(queueItems);

        // Render header stats
        renderQueueStats(queueItems, now);

        // Render queue list
        renderQueueList(queueItems);
    }

    // ========================
    // QUEUE STATS
    // ========================

    function renderQueueStats(queueItems, now) {
        const totalWaiting = queueItems.length;
        const urgent = queueItems.filter(apt => apt.priorityScore > 150).length;
        const avgWaitTime = queueItems.length > 0
            ? Math.floor(queueItems.reduce((sum, apt) => sum + apt.waitMinutes, 0) / queueItems.length)
            : 0;
        const longestWait = queueItems.length > 0
            ? Math.max(...queueItems.map(apt => apt.waitMinutes))
            : 0;

        const statsHtml = `
            <div class="queue-stat">
                <div class="queue-stat-value">${totalWaiting}</div>
                <div class="queue-stat-label">Patients Waiting</div>
            </div>
            <div class="queue-stat">
                <div class="queue-stat-value urgent">${urgent}</div>
                <div class="queue-stat-label">Urgent Cases</div>
            </div>
            <div class="queue-stat">
                <div class="queue-stat-value">${avgWaitTime}m</div>
                <div class="queue-stat-label">Avg Wait Time</div>
            </div>
            <div class="queue-stat">
                <div class="queue-stat-value">${longestWait}m</div>
                <div class="queue-stat-label">Longest Wait</div>
            </div>
        `;

        $('#queueStats').html(statsHtml);
    }

    // ========================
    // QUEUE LIST
    // ========================

    function renderQueueList(queueItems) {
        if (queueItems.length === 0) {
            $('#queueList').html(`
                <div class="queue-empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>No Patients in Queue</h3>
                    <p>All patients have been seen or no one has arrived yet</p>
                </div>
            `);
            return;
        }

        let html = '';

        queueItems.forEach((apt, index) => {
            const provider = mockProviders.find(p => p.id === apt.providerId);
            const urgencyClass = apt.priorityScore > 150 ? 'urgent' : apt.priorityScore > 100 ? 'high' : 'normal';
            const urgencyLabel = apt.priorityScore > 150 ? '🔴 URGENT' : apt.priorityScore > 100 ? '🟠 HIGH PRIORITY' : '🟡 NORMAL';
            const statusLabel = apt.type === 'ready' ? 'Ready' : 'Arrived';
            const statusIcon = apt.type === 'ready' ? 'check-circle' : 'user-clock';
            const timeStr = apt.dateStart.split(' ')[1]?.substring(0, 5) || 'N/A';

            html += `
                <div class="queue-item ${urgencyClass}" data-id="${apt.id}">
                    <div class="queue-item-position">
                        <span class="position-badge">${index + 1}</span>
                    </div>
                    
                    <div class="queue-item-patient">
                        <div class="patient-name">${apt.patientName}</div>
                        <div class="patient-meta">
                            <span class="patient-age">${apt.age || 'N/A'} years</span>
                            ${apt.patientPhone ? `<span class="patient-phone"><i class="fas fa-phone"></i> ${apt.patientPhone}</span>` : ''}
                        </div>
                    </div>

                    <div class="queue-item-details">
                        <div class="detail-row">
                            <span class="detail-label"><i class="fas fa-tooth"></i> Treatment:</span>
                            <span class="detail-value">${apt.treatment}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label"><i class="fas fa-user-md"></i> Provider:</span>
                            <span class="detail-value" style="color: ${provider?.color || '#6b7280'}">${provider?.name || 'Unknown'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label"><i class="fas fa-clock"></i> Scheduled:</span>
                            <span class="detail-value">${timeStr}</span>
                        </div>
                    </div>

                    <div class="queue-item-status">
                        <div class="urgency-badge ${urgencyClass}">
                            ${urgencyLabel}
                        </div>
                        <div class="wait-time ${apt.waitMinutes > 30 ? 'warning' : ''}">
                            <i class="fas fa-hourglass-half"></i>
                            Waiting ${apt.waitMinutes} min
                        </div>
                        <div class="status-badge">
                            <i class="fas fa-${statusIcon}"></i>
                            ${statusLabel}
                        </div>
                    </div>

                    <div class="queue-item-actions">
                        <button class="btn btn-primary btn-start" onclick="QueueView.startTreatment(${apt.id})">
                            <i class="fas fa-play"></i>
                            Start Treatment
                        </button>
                        ${apt.patientPhone ? `
                        <button class="btn btn-secondary btn-call" onclick="QueueView.callPatient('${apt.patientPhone}')">
                            <i class="fas fa-phone"></i>
                            Call
                        </button>
                        ` : ''}
                        <button class="btn btn-secondary btn-edit" onclick="SlidePanelComponent.openForEdit(${apt.id})">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                    </div>
                </div>
            `;
        });

        $('#queueList').html(html);
    }

    // ========================
    // SORTING
    // ========================

    function sortQueue(items) {
        switch (sortBy) {
            case 'priority':
                return items.sort((a, b) => b.priorityScore - a.priorityScore);

            case 'time':
                return items.sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));

            case 'provider':
                return items.sort((a, b) => {
                    if (a.providerId === b.providerId) {
                        return b.priorityScore - a.priorityScore;
                    }
                    return a.providerId - b.providerId;
                });

            default:
                return items;
        }
    }

    function setSortBy(newSortBy) {
        sortBy = newSortBy;

        // Update UI
        $('.queue-sort-btn').removeClass('active');
        $(`.queue-sort-btn[data-sort="${sortBy}"]`).addClass('active');

        render();
    }

    // ========================
    // FILTERING
    // ========================

    function setFilterProvider(providerId) {
        filterProvider = providerId;

        // Update UI
        const provider = providerId === 'all' ? 'All Providers' : mockProviders.find(p => p.id === parseInt(providerId))?.name || 'Unknown';
        $('#queueProviderFilterLabel').text(provider);

        // Close dropdown
        $('#queueProviderDropdown').hide();

        render();
    }

    function setFilterUrgency(urgency) {
        filterUrgency = urgency;

        // Update UI
        const labels = {
            all: 'All Urgency',
            urgent: 'Urgent Only',
            high: 'High Priority',
            normal: 'Normal'
        };
        $('#queueUrgencyFilterLabel').text(labels[urgency] || 'All Urgency');

        // Close dropdown
        $('#queueUrgencyDropdown').hide();

        render();
    }

    // ========================
    // ACTIONS
    // ========================

    function startTreatment(id) {
        if (confirm('Start treatment for this patient?')) {
            if (AppState.updateAppointment(id, { type: 'in-treatment' })) {
                render();
                // Update other views if needed
                if (typeof CalendarView !== 'undefined') CalendarView.render();
                if (typeof AppointmentsManager !== 'undefined') AppointmentsManager.render();
                if (typeof DashboardView !== 'undefined') DashboardView.render();
            }
        }
    }

    function callPatient(phone) {
        alert(`Calling ${phone}...\n\nIn production, this would integrate with your phone system.`);
    }

    function closeQueue() {
        // Go back to dashboard
        $('#queueSection').hide();
        $('#dashboardSection').show();

        // Update view buttons
        $('.view-btn').removeClass('active');
        $('#viewDashboard').addClass('active');

        AppState.set('currentView', 'dashboard');
    }

    // ========================
    // EVENT BINDINGS
    // ========================

    function bindEvents() {
        // Provider filter dropdown toggle
        $('#queueProviderFilterBtn').on('click', function (e) {
            e.stopPropagation();
            $('#queueProviderDropdown').toggle();
            $('#queueUrgencyDropdown').hide();
            populateProviderDropdown();
        });

        // Urgency filter dropdown toggle
        $('#queueUrgencyFilterBtn').on('click', function (e) {
            e.stopPropagation();
            $('#queueUrgencyDropdown').toggle();
            $('#queueProviderDropdown').hide();
        });

        // Close dropdowns when clicking outside
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.queue-filter-dropdown').length) {
                $('.queue-dropdown-menu').hide();
            }
        });
    }

    function populateProviderDropdown() {
        let html = '<button class="dropdown-item active" onclick="QueueView.setFilterProvider(\'all\')">All Providers</button>';

        mockProviders.forEach(provider => {
            html += `
                <button class="dropdown-item" onclick="QueueView.setFilterProvider('${provider.id}')">
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${provider.color}; margin-right: 8px;"></span>
                    ${provider.name}
                </button>
            `;
        });

        $('#queueProviderDropdown').html(html);
    }

    // ========================
    // HELPERS
    // ========================

    function formatDateKey(date) {
        if (typeof window.formatDateKey === 'function') {
            return window.formatDateKey(date);
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ========================
    // PUBLIC API
    // ========================

    return {
        render,
        setSortBy,
        setFilterProvider,
        setFilterUrgency,
        startTreatment,
        callPatient,
        closeQueue,
        bindEvents
    };
})();

// Expose globally
window.QueueView = QueueView;
