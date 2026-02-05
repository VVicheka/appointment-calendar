/**
 * Timeline View Component
 * Handles the timeline grid view for appointments by provider
 */

const TimelineView = (function() {
    'use strict';

    // ========================
    // TIMELINE RENDERING
    // ========================
    
    function render() {
        const timelineDate = AppState.get('timelineDate');
        const timelineViewMode = AppState.get('timelineViewMode');
        const timelineSelectedProviders = AppState.get('timelineSelectedProviders');
        const appointments = AppState.get('appointments');
        const currentLanguage = AppState.getLanguage();
        
        const dateKey = formatDateKey(timelineDate);
        const today = new Date();
        const isToday = formatDateKey(today) === dateKey;

        // Update header
        const dayName = translations[currentLanguage].daysFull[timelineDate.getDay()];
        const dayNum = timelineDate.getDate();
        const monthName = translations[currentLanguage].months[timelineDate.getMonth()];
        $('#timelineDate').text(isToday ?
            `Today, ${dayNum} ${monthName}` :
            `${dayName}, ${dayNum} ${monthName}`);

        // Render provider filter controls
        renderControls();

        // Get appointments for this day
        const dayAppointments = appointments.filter(apt =>
            apt.dateStart && apt.dateStart.startsWith(dateKey)
        );

        // Filter providers based on selection
        const visibleProviders = mockProviders.filter(p =>
            timelineSelectedProviders.includes(p.id)
        );

        // Different display logic based on view mode
        let displayProviders;

        if (timelineViewMode === 'focus') {
            if (visibleProviders.length === 0) {
                $('#timelineGrid').html(`
                    <div class="timeline-empty-state">
                        <i class="fas fa-user-md"></i>
                        <p>Focus mode requires one provider</p>
                        <p style="font-size: 0.9rem; color: #6b7280; margin-top: 0.5rem;">
                            Please select a provider from the provider list
                        </p>
                        <button class="btn btn-primary" onclick="TimelineView.toggleProviderDrawer()">
                            <i class="fas fa-users"></i> Select Provider
                        </button>
                    </div>
                `);
                return;
            }

            if (visibleProviders.length > 1) {
                $('#timelineGrid').html(`
                    <div class="timeline-empty-state">
                        <i class="fas fa-user-md"></i>
                        <p>Focus mode: Select only ONE provider</p>
                        <p style="font-size: 0.9rem; color: #6b7280; margin-top: 0.5rem;">
                            You have ${visibleProviders.length} providers selected.
                        </p>
                        <button class="btn btn-primary" onclick="TimelineView.toggleProviderDrawer()">
                            <i class="fas fa-users"></i> Adjust Selection
                        </button>
                    </div>
                `);
                return;
            }

            displayProviders = visibleProviders;
        } else {
            displayProviders = visibleProviders.slice(0, 10);
        }

        if (displayProviders.length === 0) {
            $('#timelineGrid').html(`
                <div class="timeline-empty-state">
                    <i class="fas fa-user-md"></i>
                    <p>No providers selected</p>
                    <button class="btn btn-primary" onclick="TimelineView.selectAllProviders()">
                        <i class="fas fa-check-double"></i> Select All Providers
                    </button>
                </div>
            `);
            return;
        }

        // Build timeline grid
        const html = buildTimelineGrid(displayProviders, dayAppointments, timeSlots(displayProviders, dayAppointments, isToday, timelineViewMode), dateKey, isToday, timelineViewMode);
        $('#timelineGrid').html(html);
    }

    function timeSlots(displayProviders, dayAppointments, isToday, viewMode) {
        const today = new Date();
        const slots = [];
        
        for (let hour = 7; hour <= 19; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const nowHour = today.getHours();
            const isCurrentHour = isToday && hour === nowHour;

            if (viewMode === 'compact') {
                const hasAppointments = displayProviders.some(provider => {
                    return dayAppointments.some(apt => {
                        const aptHour = parseInt(apt.dateStart.split(' ')[1].split(':')[0]);
                        return apt.providerId === provider.id && aptHour === hour;
                    });
                });

                if (hasAppointments) {
                    slots.push({ hour, timeStr, isCurrentHour });
                }
            } else {
                slots.push({ hour, timeStr, isCurrentHour });
            }
        }
        
        return slots;
    }

    function buildTimelineGrid(displayProviders, dayAppointments, timeSlots, dateKey, isToday, viewMode) {
        const viewModeClass = `timeline-mode-${viewMode}`;

        let html = `<div class="timeline-scroll-container ${viewModeClass}">`;

        // Sticky time column
        html += '<div class="timeline-time-column">';
        html += '<div class="timeline-time-header">Time</div>';

        timeSlots.forEach(slot => {
            html += `<div class="timeline-time-cell ${slot.isCurrentHour ? 'current-hour' : ''}">${slot.timeStr}</div>`;
        });
        html += '</div>';

        // Scrollable providers container
        html += '<div class="timeline-providers-scroll">';

        // Providers header row
        html += '<div class="timeline-providers-header-row">';
        displayProviders.forEach(provider => {
            const providerApts = dayAppointments.filter(apt => apt.providerId === provider.id);
            const totalSlots = providerApts.length;

            html += `<div class="timeline-provider-column-header" style="border-top: 3px solid ${provider.color}">
                <div class="timeline-provider-name">${provider.name.split(' ').pop()}</div>
                <div class="timeline-provider-stats">${totalSlots} apts</div>
                ${viewMode === 'focus' ? `<div class="timeline-provider-specialty">${provider.specialty}</div>` : ''}
            </div>`;
        });
        html += '</div>';

        // Providers content rows
        html += '<div class="timeline-providers-rows">';

        timeSlots.forEach(slot => {
            html += `<div class="timeline-providers-row ${slot.isCurrentHour ? 'current-hour' : ''}">`;

            displayProviders.forEach(provider => {
                const slotApts = dayAppointments.filter(apt => {
                    const aptHour = parseInt(apt.dateStart.split(' ')[1].split(':')[0]);
                    return apt.providerId === provider.id && aptHour === slot.hour;
                });

                const isEmptySlot = slotApts.length === 0;
                html += `<div class="timeline-provider-slot ${isEmptySlot ? 'empty-slot' : ''}" 
                         data-provider="${provider.id}" 
                         data-time="${slot.timeStr}" 
                         data-date="${dateKey}"
                         ${isEmptySlot ? `onclick="TimelineView.quickBookAppointment(${provider.id}, '${dateKey}', '${slot.timeStr}')"` : ''}>`;

                slotApts.forEach(apt => {
                    const showDetails = viewMode !== 'compact';
                    const showActions = viewMode === 'focus';

                    html += `
                        <div class="timeline-appointment timeline-apt-${apt.type}" 
                             style="background: ${provider.color}20; border-left-color: ${provider.color}"
                             onclick="SlidePanelComponent.openForEdit(${apt.id})">
                            <div class="timeline-apt-time">${apt.dateStart.split(' ')[1]} - ${apt.dateEnd.split(' ')[1]}</div>
                            <div class="timeline-apt-patient">${apt.patientName}</div>
                            ${showDetails ? `<div class="timeline-apt-room">Room ${apt.roomNumber}</div>` : ''}
                            ${showDetails && apt.treatment ? `<div class="timeline-apt-treatment">${apt.treatment}</div>` : ''}
                            ${showActions ? `<div class="timeline-apt-actions">${getQuickActionButtons(apt)}</div>` : ''}
                        </div>
                    `;
                });

                html += '</div>';
            });

            html += '</div>';
        });
        html += '</div>';
        html += '</div>';
        html += '</div>';

        return html;
    }

    function getQuickActionButtons(apt) {
        let buttons = '';
        
        if (apt.type === 'scheduled') {
            buttons += `<button class="timeline-quick-btn" onclick="event.stopPropagation(); TimelineView.updateStatus(${apt.id}, 'arrived')" title="Mark Arrived"><i class="fas fa-check"></i></button>`;
        } else if (apt.type === 'arrived') {
            buttons += `<button class="timeline-quick-btn" onclick="event.stopPropagation(); TimelineView.updateStatus(${apt.id}, 'ready')" title="Mark Ready"><i class="fas fa-bell"></i></button>`;
        } else if (apt.type === 'ready') {
            buttons += `<button class="timeline-quick-btn" onclick="event.stopPropagation(); TimelineView.updateStatus(${apt.id}, 'in-treatment')" title="Start Treatment"><i class="fas fa-play"></i></button>`;
        } else if (apt.type === 'in-treatment') {
            buttons += `<button class="timeline-quick-btn" onclick="event.stopPropagation(); TimelineView.updateStatus(${apt.id}, 'completed')" title="Complete"><i class="fas fa-check-double"></i></button>`;
        }
        
        return buttons;
    }

    // ========================
    // TIMELINE CONTROLS
    // ========================
    
    function renderControls() {
        renderProviderDrawer();
        
        const timelineSelectedProviders = AppState.get('timelineSelectedProviders');
        const timelineViewMode = AppState.get('timelineViewMode');
        
        $('#providerCountBadge').text(timelineSelectedProviders.length);
        
        $('.view-pill').removeClass('active');
        $(`.view-pill[data-mode="${timelineViewMode}"]`).addClass('active');
    }

    function renderProviderDrawer() {
        const appointments = AppState.get('appointments');
        const timelineSelectedProviders = AppState.get('timelineSelectedProviders');
        const today = formatDateKey(new Date());

        const html = mockProviders.map(provider => {
            const isSelected = timelineSelectedProviders.includes(provider.id);

            const todayApts = appointments.filter(apt =>
                apt.providerId === provider.id &&
                apt.dateStart &&
                apt.dateStart.startsWith(today)
            );

            const total = todayApts.length;
            const completed = todayApts.filter(apt => apt.type === 'completed').length;
            const inProgress = todayApts.filter(apt => apt.type === 'in-treatment').length;
            const waiting = todayApts.filter(apt => apt.type === 'arrived' || apt.type === 'ready').length;

            let statusIcon, statusText, statusClass;
            if (inProgress > 0) {
                statusIcon = '🔴';
                statusText = 'In Treatment';
                statusClass = 'status-busy';
            } else if (waiting > 0) {
                statusIcon = '🟡';
                statusText = `${waiting} Waiting`;
                statusClass = 'status-ready';
            } else if (total > 0) {
                statusIcon = '🟢';
                statusText = 'Available';
                statusClass = 'status-available';
            } else {
                statusIcon = '⚪';
                statusText = 'No Appointments';
                statusClass = 'status-empty';
            }

            return `
                <div class="provider-card ${isSelected ? 'selected' : ''} ${statusClass}" 
                     onclick="TimelineView.toggleProviderSelection(${provider.id})"
                     data-provider-name="${provider.name.toLowerCase()}"
                     data-provider-specialty="${provider.specialty.toLowerCase()}">
                    <div class="provider-card-checkbox">
                        <i class="fas fa-${isSelected ? 'check-circle' : 'circle'}"></i>
                    </div>
                    <div class="provider-card-avatar" style="background: ${provider.color}">
                        ${provider.name.charAt(0)}
                    </div>
                    <div class="provider-card-info">
                        <div class="provider-card-name">${provider.name}</div>
                        <div class="provider-card-specialty">${provider.specialty}</div>
                        <div class="provider-card-status">
                            <span>${statusIcon} ${statusText}</span>
                        </div>
                    </div>
                    <div class="provider-card-stats">
                        <div class="stat-item">
                            <span class="stat-value">${completed}</span>
                            <span class="stat-label">Done</span>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <span class="stat-value">${total}</span>
                            <span class="stat-label">Total</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $('#providerDrawerList').html(html);
    }

    // ========================
    // NAVIGATION
    // ========================
    
    function navigatePrev() {
        const timelineDate = AppState.get('timelineDate');
        timelineDate.setDate(timelineDate.getDate() - 1);
        AppState.setTimelineDate(timelineDate);
        render();
    }

    function navigateNext() {
        const timelineDate = AppState.get('timelineDate');
        timelineDate.setDate(timelineDate.getDate() + 1);
        AppState.setTimelineDate(timelineDate);
        render();
    }

    function navigateToday() {
        AppState.setTimelineDate(new Date());
        render();
    }

    // ========================
    // PROVIDER SELECTION
    // ========================
    
    function toggleProviderSelection(providerId) {
        const timelineSelectedProviders = AppState.get('timelineSelectedProviders');
        const index = timelineSelectedProviders.indexOf(providerId);
        
        if (index > -1) {
            if (timelineSelectedProviders.length === 1) {
                if (typeof showNotification === 'function') {
                    showNotification('At least one provider must be selected', 'warning');
                }
                return;
            }
            timelineSelectedProviders.splice(index, 1);
        } else {
            timelineSelectedProviders.push(providerId);
        }
        
        AppState.set('timelineSelectedProviders', timelineSelectedProviders);
        render();
    }

    function selectAllProviders() {
        AppState.selectAllTimelineProviders();
        render();
    }

    function clearAllProviders() {
        const firstProvider = mockProviders[0];
        if (firstProvider) {
            AppState.set('timelineSelectedProviders', [firstProvider.id]);
        }
        render();
    }

    function toggleProviderDrawer() {
        const drawer = $('#providerDrawer');
        const toggle = $('#providerDrawerToggle');

        if (drawer.hasClass('open')) {
            drawer.removeClass('open');
            toggle.removeClass('active');
        } else {
            drawer.addClass('open');
            toggle.addClass('active');
            renderProviderDrawer();
        }
    }

    function filterProviderList() {
        const searchTerm = $('#providerSearchInput').val().toLowerCase();
        $('.provider-card').each(function() {
            const name = $(this).data('provider-name');
            const specialty = $(this).data('provider-specialty');
            if (name.includes(searchTerm) || specialty.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // ========================
    // VIEW MODE
    // ========================
    
    function switchMode(mode) {
        AppState.setTimelineViewMode(mode);
        render();
    }

    // ========================
    // QUICK ACTIONS
    // ========================
    
    function updateStatus(aptId, newStatus) {
        if (AppState.updateAppointment(aptId, { type: newStatus })) {
            render();
            if (typeof showNotification === 'function') {
                showNotification(`Status updated to ${newStatus}`, 'success');
            }
        }
    }

    function quickBookAppointment(providerId, dateKey, timeStr) {
        const provider = mockProviders.find(p => p.id === providerId);
        if (!provider) {
            if (typeof showNotification === 'function') {
                showNotification('Provider not found', 'error');
            }
            return;
        }

        // Calculate default end time (1 hour later)
        const startHour = parseInt(timeStr.split(':')[0]);
        const startMin = parseInt(timeStr.split(':')[1]);
        const endHour = startHour + 1;
        const endTimeStr = `${endHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;

        // Prepare pre-filled data and open form
        const prefillData = {
            providerId: providerId,
            providerName: provider.name,
            providerColor: provider.color,
            dateKey: dateKey,
            startTime: timeStr,
            endTime: endTimeStr,
            type: 'scheduled',
            isQuickBook: true
        };

        if (typeof SlidePanelComponent !== 'undefined') {
            SlidePanelComponent.open('appointment', prefillData);
        }
    }

    // ========================
    // EVENT BINDING
    // ========================
    
    function bindEvents() {
        $('#timelinePrev').click(navigatePrev);
        $('#timelineNext').click(navigateNext);
        $('#timelineToday').click(navigateToday);
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

    // ========================
    // PUBLIC API
    // ========================
    return {
        render,
        renderControls,
        renderProviderDrawer,
        navigatePrev,
        navigateNext,
        navigateToday,
        toggleProviderSelection,
        selectAllProviders,
        clearAllProviders,
        toggleProviderDrawer,
        filterProviderList,
        switchMode,
        updateStatus,
        quickBookAppointment,
        bindEvents
    };
})();

// Expose globally
window.TimelineView = TimelineView;

// Global function aliases for onclick handlers
window.toggleProviderSelection = function(id) { TimelineView.toggleProviderSelection(id); };
window.selectAllProviders = function() { TimelineView.selectAllProviders(); };
window.clearAllProviders = function() { TimelineView.clearAllProviders(); };
window.toggleProviderDrawer = function() { TimelineView.toggleProviderDrawer(); };
window.filterProviderList = function() { TimelineView.filterProviderList(); };
window.switchTimelineMode = function(mode) { TimelineView.switchMode(mode); };
window.quickBookAppointment = function(providerId, dateKey, timeStr) { TimelineView.quickBookAppointment(providerId, dateKey, timeStr); };
