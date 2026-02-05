/**
 * Dashboard View Component
 * Handles the dashboard with stats, queue, and activity
 */

const DashboardView = (function() {
    'use strict';

    // ========================
    // MAIN RENDER FUNCTION
    // ========================
    
    function render() {
        const appointments = AppState.get('appointments');
        const payments = AppState.get('payments');
        
        const today = new Date();
        const todayKey = formatDateKey(today);
        const now = new Date();

        // Get today's appointments with priority scores
        let todayAppointments = appointments.filter(apt =>
            apt.dateStart && apt.dateStart.startsWith(todayKey)
        ).map(apt => AppointmentsManager.calculatePriority(apt));

        // Calculate stats
        const total = todayAppointments.length;
        const followUpCount = appointments.filter(apt => apt.type === 'needs-followup').length;
        const completed = todayAppointments.filter(apt => apt.type === 'completed').length;

        // Calculate today's revenue
        const todayPayments = payments.filter(p => p.paidDate === todayKey);
        const revenue = todayPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

        // Update stat cards
        $('#statTotal').text(total);
        $('#statFollowup').text(followUpCount);
        $('#statCompleted').text(completed);
        $('#statRevenue').text(`$${revenue.toFixed(0)}`);

        // Add trend indicators
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = formatDateKey(yesterday);
        const yesterdayApts = appointments.filter(apt => apt.dateStart && apt.dateStart.startsWith(yesterdayKey)).length;
        const trend = total - yesterdayApts;

        if (trend > 0) {
            $('#statTotalTrend').html(`<span style="color: #10b981"><i class="fas fa-arrow-up"></i> +${trend}</span>`);
        } else if (trend < 0) {
            $('#statTotalTrend').html(`<span style="color: #ef4444"><i class="fas fa-arrow-down"></i> ${trend}</span>`);
        } else {
            $('#statTotalTrend').html(`<span style="color: #6b7280">—</span>`);
        }

        // Render all sections
        renderNowServing(todayAppointments, now);
        renderWaitingQueue(todayAppointments, now);
        renderProviderStatus();
        renderComingSoon(todayAppointments, now);
        renderFollowUps(appointments, now);
        renderRecentActivity();
    }

    // ========================
    // NOW SERVING SECTION
    // ========================
    
    function renderNowServing(todayAppointments, now) {
        const inTreatment = todayAppointments.filter(apt => apt.type === 'in-treatment');
        
        if (inTreatment.length > 0) {
            let html = '';
            inTreatment.forEach(apt => {
                const startTime = new Date(apt.dateStart);
                const minutes = Math.floor((now - startTime) / 60000);
                const providerInfo = mockProviders.find(p => p.id === apt.providerId);

                html += `
                    <div class="now-serving-card">
                        <div class="now-serving-header">
                            <span class="now-serving-indicator">🟢 NOW SERVING</span>
                            <span class="now-serving-timer">${minutes} min</span>
                        </div>
                        <div class="now-serving-patient">${apt.patientName}</div>
                        <div class="now-serving-details">
                            <span><i class="fas fa-user-md"></i> ${providerInfo?.name || 'Unknown'}</span>
                            <span><i class="fas fa-door-open"></i> Room ${apt.roomNumber}</span>
                            <span><i class="fas fa-tooth"></i> ${apt.treatment}</span>
                        </div>
                        <button class="btn btn-sm btn-secondary" onclick="SlidePanelComponent.openForEdit(${apt.id})">
                            <i class="fas fa-edit"></i> Update Status
                        </button>
                    </div>
                `;
            });
            $('#nextUpcoming').html(html);
        } else {
            $('#nextUpcoming').html(`
                <div class="empty-state">
                    <i class="fas fa-user-clock"></i>
                    <p>No patients currently in treatment</p>
                </div>
            `);
        }
    }

    // ========================
    // WAITING QUEUE SECTION
    // ========================
    
    function renderWaitingQueue(todayAppointments, now) {
        const readyToSee = todayAppointments
            .filter(apt => apt.type === 'ready' || apt.type === 'arrived')
            .sort((a, b) => b.priorityScore - a.priorityScore);

        if (readyToSee.length > 0) {
            let html = '<div class="ready-list">';
            readyToSee.forEach((apt, index) => {
                const startTime = new Date(apt.dateStart);
                const waitMinutes = Math.floor((now - startTime) / 60000);
                const urgencyClass = apt.priorityScore > 150 ? 'urgent' : apt.priorityScore > 100 ? 'high' : 'normal';
                const urgencyLabel = apt.priorityScore > 150 ? '🔴 URGENT' : apt.priorityScore > 100 ? '🟠 HIGH' : '🟡 NORMAL';

                html += `
                    <div class="ready-item ${urgencyClass}">
                        <div class="ready-priority">
                            <span class="priority-badge">${index + 1}</span>
                            <span class="priority-label">${urgencyLabel}</span>
                        </div>
                        <div class="ready-info">
                            <div class="ready-patient">${apt.patientName}</div>
                            <div class="ready-details">
                                ${apt.treatment} • Waited ${waitMinutes} min
                                ${apt.priorityScore > 150 ? ' • <strong>Pain/Emergency</strong>' : ''}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="DashboardView.startTreatment(${apt.id})">
                            <i class="fas fa-play"></i> Start
                        </button>
                    </div>
                `;
            });
            html += '</div>';
            $('#waitingQueue').html(html);
        } else {
            $('#waitingQueue').html(`
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>No patients waiting</p>
                </div>
            `);
        }
    }

    // ========================
    // PROVIDER STATUS SECTION
    // ========================
    
    function renderProviderStatus() {
        const appointments = AppState.get('appointments');
        const today = formatDateKey(new Date());

        // Get filter settings
        const showAll = $('input[value="all"]').is(':checked');
        const showAvailable = showAll || $('.provider-status-filter[value="available"]').is(':checked');
        const showBusy = showAll || $('.provider-status-filter[value="busy"]').is(':checked');
        const showOff = $('.provider-status-filter[value="off"]').is(':checked');

        let html = '<div class="provider-status-list">';

        mockProviders.forEach(provider => {
            const providerApts = appointments.filter(apt =>
                apt.providerId === provider.id &&
                apt.dateStart && apt.dateStart.startsWith(today)
            );

            const isInTreatment = providerApts.some(apt => apt.type === 'in-treatment');
            const readyCount = providerApts.filter(apt => apt.type === 'ready' || apt.type === 'arrived').length;
            const todayTotal = providerApts.length;
            const completedToday = providerApts.filter(apt => apt.type === 'completed').length;

            let status, statusIcon, statusClass;
            if (isInTreatment) {
                status = 'Busy';
                statusIcon = '🔴';
                statusClass = 'status-busy';
            } else if (readyCount > 0 || todayTotal > 0) {
                status = 'Available';
                statusIcon = '🟢';
                statusClass = 'status-available';
            } else {
                status = 'Off Duty';
                statusIcon = '⚪';
                statusClass = 'status-off';
            }

            // Apply filter
            if (status === 'Busy' && !showBusy) return;
            if (status === 'Available' && !showAvailable) return;
            if (status === 'Off Duty' && !showOff) return;

            html += `
                <div class="provider-status-item ${statusClass}">
                    <div class="provider-avatar" style="background: ${provider.color}">
                        ${provider.name.charAt(0)}
                    </div>
                    <div class="provider-info">
                        <div class="provider-name">${provider.name}</div>
                        <div class="provider-specialty">${provider.specialty}</div>
                        <div class="provider-stats">
                            <span>${statusIcon} ${status}</span>
                            <span>• ${completedToday}/${todayTotal} today</span>
                            ${readyCount > 0 ? `<span>• ${readyCount} waiting</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        $('#providerStatusList').html(html);
    }

    // ========================
    // COMING SOON SECTION
    // ========================
    
    function renderComingSoon(todayAppointments, now) {
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const comingSoon = todayAppointments.filter(apt => {
            const aptTime = new Date(apt.dateStart);
            return aptTime > now && aptTime <= twoHoursLater && apt.type === 'scheduled';
        }).sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));

        if (comingSoon.length > 0) {
            let html = '<div class="coming-soon-list">';
            comingSoon.forEach(apt => {
                const time = apt.dateStart.split(' ')[1]?.substring(0, 5) || 'N/A';
                const aptTime = new Date(apt.dateStart);
                const minutesUntil = Math.floor((aptTime - now) / 60000);
                const provider = mockProviders.find(p => p.id === apt.providerId);

                html += `
                    <div class="coming-soon-item">
                        <div class="coming-soon-time">
                            ${time}
                            <span class="coming-soon-countdown">in ${minutesUntil}m</span>
                        </div>
                        <div class="coming-soon-info">
                            <div class="coming-soon-patient">${apt.patientName}</div>
                            <div class="coming-soon-treatment">${apt.treatment} • ${provider?.name || ''}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            $('#comingSoonList').html(html);
        } else {
            $('#comingSoonList').html(`
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <p>No appointments in next 2 hours</p>
                </div>
            `);
        }
    }

    // ========================
    // FOLLOW-UPS SECTION
    // ========================
    
    function renderFollowUps(appointments, now) {
        const treatmentFollowUpRules = typeof window.treatmentFollowUpRules !== 'undefined' ? window.treatmentFollowUpRules : {
            'root-canal': { days: 7 },
            'extraction': { days: 3 },
            'crown': { days: 14 },
            'cleaning': { days: 180 }
        };

        const needsFollowUp = appointments.filter(apt => {
            if (apt.type === 'needs-followup') return true;

            if (apt.type === 'completed' && apt.treatment) {
                const treatmentKey = apt.treatment.toLowerCase().replace(/\s+/g, '-');
                const rule = treatmentFollowUpRules[treatmentKey];
                if (rule && rule.days > 0) {
                    const completedDate = new Date(apt.dateStart);
                    const followUpDue = new Date(completedDate.getTime() + rule.days * 24 * 60 * 60 * 1000);

                    const hasFollowUp = appointments.some(followApt =>
                        followApt.patientId === apt.patientId &&
                        new Date(followApt.dateStart) > completedDate &&
                        followApt.type === 'scheduled'
                    );

                    if (!hasFollowUp) {
                        apt.followUpDue = followUpDue;
                        apt.followUpOverdue = followUpDue < now;
                        return true;
                    }
                }
            }
            return false;
        });

        if (needsFollowUp.length > 0) {
            let html = '<div class="followup-list">';
            needsFollowUp.forEach(apt => {
                const isOverdue = apt.followUpOverdue;
                const dueDate = apt.followUpDue ? apt.followUpDue.toLocaleDateString() : 'ASAP';

                html += `
                    <div class="followup-item ${isOverdue ? 'overdue' : ''}">
                        <div class="followup-header">
                            ${isOverdue ? '<span class="followup-badge overdue">🚨 OVERDUE</span>' : '<span class="followup-badge">⚠️ DUE</span>'}
                        </div>
                        <div class="followup-patient">${apt.patientName}</div>
                        <div class="followup-reason">${apt.treatment} follow-up • Due: ${dueDate}</div>
                        <div class="followup-actions">
                            <button class="btn btn-sm btn-primary" onclick="DashboardView.bookFollowUp(${apt.id})">
                                <i class="fas fa-calendar-plus"></i> Book
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="SlidePanelComponent.openForEdit(${apt.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            $('#followupList').html(html);
        } else {
            $('#followupList').html(`
                <div class="empty-state">
                    <i class="fas fa-check-double"></i>
                    <p>All follow-ups scheduled</p>
                </div>
            `);
        }
    }

    // ========================
    // RECENT ACTIVITY SECTION
    // ========================
    
    function renderRecentActivity() {
        const appointments = AppState.get('appointments');
        const payments = AppState.get('payments');

        const recentApts = [...appointments]
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);

        const recentPayments = [...payments]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const activities = [];

        recentApts.forEach(apt => {
            activities.push({
                type: 'appointment',
                timestamp: apt.id,
                data: apt
            });
        });

        recentPayments.forEach(payment => {
            activities.push({
                type: 'payment',
                timestamp: new Date(payment.createdAt).getTime(),
                data: payment
            });
        });

        activities.sort((a, b) => b.timestamp - a.timestamp);

        if (activities.length > 0) {
            let html = '<div class="activity-list">';

            activities.slice(0, 8).forEach(activity => {
                const date = new Date(activity.timestamp);
                const timeAgo = getTimeAgo(date);

                if (activity.type === 'appointment') {
                    const apt = activity.data;
                    html += `
                        <div class="activity-item">
                            <div class="activity-icon" style="background: #3b82f6">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="activity-info">
                                <div class="activity-title">${apt.patientName} - ${apt.treatment || 'Appointment'}</div>
                                <div class="activity-meta">${apt.type} • ${timeAgo}</div>
                            </div>
                        </div>
                    `;
                } else if (activity.type === 'payment') {
                    const payment = activity.data;
                    html += `
                        <div class="activity-item">
                            <div class="activity-icon" style="background: #10b981">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="activity-info">
                                <div class="activity-title">${payment.patientName} paid $${payment.paidAmount}</div>
                                <div class="activity-meta">${payment.method} • ${timeAgo}</div>
                            </div>
                        </div>
                    `;
                }
            });

            html += '</div>';
            $('#recentActivityList').html(html);
        } else {
            $('#recentActivityList').html(`
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No recent activity</p>
                </div>
            `);
        }
    }

    // ========================
    // ACTION HANDLERS
    // ========================
    
    function startTreatment(id) {
        if (AppState.updateAppointment(id, { type: 'in-treatment' })) {
            render();
            if (typeof CalendarView !== 'undefined') CalendarView.render();
            if (typeof AppointmentsManager !== 'undefined') AppointmentsManager.render();
        }
    }

    function bookFollowUp(id) {
        const apt = AppState.getAppointmentById(id);
        if (apt && typeof SlidePanelComponent !== 'undefined') {
            SlidePanelComponent.open('appointment', {
                patientId: apt.patientId,
                patientName: apt.patientName,
                treatment: apt.treatment + ' Follow-up',
                type: 'scheduled'
            });
        }
    }

    function callPatient(phone) {
        alert(`Calling ${phone}...\n\nIn production, this would integrate with your phone system.`);
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

    function getTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    // ========================
    // PUBLIC API
    // ========================
    return {
        render,
        renderProviderStatus,
        renderRecentActivity,
        startTreatment,
        bookFollowUp,
        callPatient
    };
})();

// Expose globally
window.DashboardView = DashboardView;

// Global function aliases
window.startTreatment = function(id) { DashboardView.startTreatment(id); };
window.bookFollowUp = function(id) { DashboardView.bookFollowUp(id); };
window.callPatient = function(phone) { DashboardView.callPatient(phone); };
window.toggleProviderFilter = function() { $('#providerFilterDropdown').toggle(); };
window.filterProviderStatus = function() { DashboardView.renderProviderStatus(); };
