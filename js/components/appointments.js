/**
 * Appointments Manager Component
 * Handles appointment listing, filtering, and priority calculation
 */

const AppointmentsManager = (function() {
    'use strict';

    // ========================
    // PRIORITY CALCULATION
    // ========================
    
    function calculatePriority(appointment) {
        let score = 0;
        const now = new Date();
        const aptDate = new Date(appointment.dateStart);

        // Base score for appointment type
        const typeScores = {
            'walk-in': 30,
            'arrived': 50,
            'ready': 70,
            'scheduled': 40
        };
        score += typeScores[appointment.type] || 0;

        // Urgency keywords in notes/treatment
        const urgentKeywords = ['pain', 'emergency', 'urgent', 'swelling', 'bleeding', 'severe'];
        const notes = (appointment.notes || '').toLowerCase();
        const treatment = (appointment.treatment || '').toLowerCase();
        if (urgentKeywords.some(kw => notes.includes(kw) || treatment.includes(kw))) {
            score += 100;
        }

        // Wait time (if arrived or ready)
        if (appointment.type === 'arrived' || appointment.type === 'ready') {
            const waitMinutes = (now - aptDate) / (1000 * 60);
            score += Math.min(waitMinutes * 2, 120);
        }

        // Overdue scheduled appointment
        if (appointment.type === 'scheduled' && aptDate < now) {
            const lateMinutes = (now - aptDate) / (1000 * 60);
            score += lateMinutes;
        }

        // Patient age (elderly priority)
        if (appointment.patientAge && appointment.patientAge > 65) {
            score += 30;
        }

        // VIP flag
        if (appointment.vip) {
            score += 20;
        }

        appointment.priorityScore = Math.round(score);
        return appointment;
    }

    // ========================
    // FILTERING
    // ========================
    
    function getFiltered() {
        const currentDate = AppState.get('currentDate');
        const selectedDate = AppState.get('selectedDate');
        const selectedProviderIds = AppState.get('selectedProviderIds');
        const appointments = AppState.get('appointments');
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Get active filters
        const viewAll = $('#filterViewAll').is(':checked');
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

            // Filter by provider (multi-select)
            if (selectedProviderIds.length > 0 && !selectedProviderIds.includes(apt.providerId)) return false;

            return true;
        });

        // Calculate priority for each appointment
        filtered = filtered.map(apt => calculatePriority(apt));

        // Sort by priority score (highest first), then by date
        filtered.sort((a, b) => {
            if (b.priorityScore !== a.priorityScore) {
                return b.priorityScore - a.priorityScore;
            }
            return new Date(a.dateStart) - new Date(b.dateStart);
        });

        return filtered;
    }

    // ========================
    // SIDEBAR TITLE UPDATE
    // ========================
    
    function updateSidebarTitle() {
        const currentLanguage = AppState.getLanguage();
        const title = currentLanguage === 'en' ? 'Appointments' : 'ការណាត់ជួប';
        $('#sidebarTitle').text(title);
    }

    // ========================
    // RENDER APPOINTMENTS
    // ========================
    
    function render() {
        const currentDate = AppState.get('currentDate');
        const selectedDate = AppState.get('selectedDate');
        const currentLanguage = AppState.getLanguage();
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
        const filteredAppointments = getFiltered();

        // Calculate daily summary
        const totalCount = filteredAppointments.length;
        const completedCount = filteredAppointments.filter(apt => apt.type === 'completed').length;
        const scheduledCount = filteredAppointments.filter(apt => apt.type === 'scheduled').length;
        const cancelledCount = filteredAppointments.filter(apt => apt.type === 'cancelled').length;

        let html = '';

        // Add compact daily summary (only if there are appointments)
        if (filteredAppointments.length > 0) {
            html += `
                <div class="daily-summary-compact">
                    <div class="summary-item">
                        <span class="summary-label">Total:</span>
                        <span class="summary-value">${AppState.formatNumber(totalCount)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Scheduled:</span>
                        <span class="summary-value">${AppState.formatNumber(scheduledCount)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Completed:</span>
                        <span class="summary-value">${AppState.formatNumber(completedCount)}</span>
                    </div>
                    ${cancelledCount > 0 ? `
                    <div class="summary-item">
                        <span class="summary-label">Cancelled:</span>
                        <span class="summary-value">${AppState.formatNumber(cancelledCount)}</span>
                    </div>
                    ` : ''}
                </div>
            `;
        }

        if (filteredAppointments.length === 0) {
            html += `
                <div class="no-appointments-state">
                    <div class="no-appointments-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="no-appointments-title">
                        ${currentLanguage === 'en' ? 'No Appointments' : 'គ្មានការណាត់ជួប'}
                    </div>
                    <div class="no-appointments-text">
                        ${currentLanguage === 'en' ? 'No appointments found for the selected criteria' : 'រកមិនឃើញការណាត់ជួបសម្រាប់លក្ខណៈវិនិច្ឆ័យដែលបានជ្រើសរើស'}
                    </div>
                </div>
            `;
        } else {
            html += renderGroupedByProvider(filteredAppointments);
        }

        $('#appointmentsList').html(html);
    }

    function renderGroupedByProvider(filteredAppointments) {
        const currentLanguage = AppState.getLanguage();
        let html = '';
        
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
            const providerAppointments = grouped[providerId];

            // Calculate time range for this provider
            const times = providerAppointments.map(apt => apt.dateStart.split(' ')[1]);
            const firstTime = times[0];
            const lastTime = times[times.length - 1];

            html += `<div class="appointment-date-group">`;
            html += `
                <div class="provider-group-header provider-${providerId}">
                    <div class="provider-header-main">
                        <i class="fas fa-user-md"></i>
                        <div class="provider-header-info">
                            <div class="provider-header-name">${providerName}</div>
                            <div class="provider-header-meta">${AppState.formatNumber(providerAppointments.length)} appointments · ${AppState.formatNumber(firstTime)} - ${AppState.formatNumber(lastTime)}</div>
                        </div>
                    </div>
                </div>
            `;

            providerAppointments.forEach(apt => {
                html += renderAppointmentCard(apt);
            });

            html += `</div>`;
        });

        return html;
    }

    function renderAppointmentCard(apt) {
        const currentLanguage = AppState.getLanguage();
        const timeStart = apt.dateStart.split(' ')[1] || '';
        const timeEnd = apt.dateEnd ? apt.dateEnd.split(' ')[1] : '';
        const dateStr = apt.dateStart.split(' ')[0];
        const aptDate = new Date(dateStr);
        const dayName = translations[currentLanguage].daysShort[aptDate.getDay()];
        const dayNum = aptDate.getDate();
        const monthName = translations[currentLanguage].months[aptDate.getMonth()];

        // Status badge text
        const statusLabels = {
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
        const statusLabel = statusLabels[apt.type] || apt.type;

        return `
            <div class="appointment-item provider-${apt.providerId} status-${apt.type}" 
                 onclick="SlidePanelComponent.openForEdit(${apt.id})" 
                 data-appointment-id="${apt.id}">
                <div class="appointment-item-header">
                    <div class="appointment-patient-name">${apt.patientName}</div>
                    <span class="appointment-status-badge badge-${apt.type}">${statusLabel}</span>
                </div>
                <div class="appointment-item-details">
                    <span class="appointment-time">${AppState.formatNumber(timeStart)}${timeEnd ? ' - ' + AppState.formatNumber(timeEnd) : ''}</span>
                    <span class="appointment-detail-divider">·</span>
                    <span>${dayName}, ${AppState.formatNumber(dayNum)} ${monthName}</span>
                    <span class="appointment-detail-divider">·</span>
                    <span>Room ${AppState.formatNumber(apt.roomNumber || 1)}</span>
                </div>
                <div class="appointment-hover-actions">
                    <button class="action-btn action-complete" onclick="event.stopPropagation(); AppointmentsManager.quickStatusChange(${apt.id}, 'completed')" title="Mark as Completed">
                        <i class="fas fa-check"></i>
                        <span>Complete</span>
                    </button>
                    <button class="action-btn action-cancel" onclick="event.stopPropagation(); AppointmentsManager.quickStatusChange(${apt.id}, 'cancelled')" title="Cancel Appointment">
                        <i class="fas fa-times"></i>
                        <span>Cancel</span>
                    </button>
                </div>
            </div>
        `;
    }

    // ========================
    // CONFLICT CHECKING
    // ========================
    
    function checkConflicts(newApt, excludeId = null) {
        const appointments = AppState.get('appointments');
        const dateKey = newApt.dateStart.split(' ')[0];
        const conflicts = [];

        // Get appointments on the same day
        const sameDayApts = appointments.filter(apt => {
            if (excludeId && apt.id === excludeId) return false;
            return apt.dateStart && apt.dateStart.startsWith(dateKey);
        });

        sameDayApts.forEach(apt => {
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

    // ========================
    // HELPER FUNCTIONS
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

    // Quick status change from appointment card buttons
    function quickStatusChange(id, newStatus) {
        if (AppState.updateAppointment(id, { type: newStatus })) {
            render();
            if (typeof showNotification === 'function') {
                showNotification('success', `Appointment marked as ${newStatus}`);
            }
        }
    }

    // ========================
    // PUBLIC API
    // ========================
    return {
        calculatePriority,
        getFiltered,
        render,
        renderAppointmentCard,
        checkConflicts,
        updateSidebarTitle,
        quickStatusChange
    };
})();

// Expose globally
window.AppointmentsManager = AppointmentsManager;
