/**
 * Quick Actions Component
 * Handles the quick action dropdown menu
 */

const QuickActionsComponent = (function() {
    'use strict';

    const translations = {
        en: {
            quickAction: 'New',
            dropdownTitle: 'Quick Actions'
        },
        kh: {
            quickAction: 'ថ្មី',
            dropdownTitle: 'សកម្មភាពរហ័ស'
        }
    };

    // ========================
    // INITIALIZATION
    // ========================
    
    function init() {
        bindEvents();
        updateLanguage();
        filterByPermission();
    }

    function bindEvents() {
        // Primary New Appointment button
        $('#newAppointmentBtn').on('click', function() {
            if (typeof SlidePanelComponent !== 'undefined') {
                SlidePanelComponent.open('appointment');
            }
        });

        // Quick action dropdown toggle
        $('#quickActionBtn').click(function(e) {
            e.stopPropagation();
            const $dropdown = $('#quickActionDropdown');
            const isOpen = $dropdown.hasClass('show');

            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });

        // Close when clicking outside
        $(document).click(function(e) {
            if (!$(e.target).closest('.quick-action-wrapper').length) {
                closeDropdown();
            }
        });

        // Action item clicks
        $('.quick-action-item').click(function() {
            const action = $(this).attr('data-action');
            handleAction(action);
            closeDropdown();
        });

        // Keyboard navigation
        $('.quick-action-item').keydown(function(e) {
            const $items = $('.quick-action-item:visible');
            const currentIndex = $items.index(this);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % $items.length;
                $items.eq(nextIndex).focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + $items.length) % $items.length;
                $items.eq(prevIndex).focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                $(this).click();
            }
        });
    }

    // ========================
    // DROPDOWN CONTROL
    // ========================
    
    function openDropdown() {
        $('#quickActionDropdown').addClass('show');
        $('#quickActionBtn').attr('aria-expanded', 'true');
        filterByPermission();

        setTimeout(() => {
            $('.quick-action-item:visible:first').focus();
        }, 100);
    }

    function closeDropdown() {
        $('#quickActionDropdown').removeClass('show');
        $('#quickActionBtn').attr('aria-expanded', 'false');
    }

    // ========================
    // ACTION HANDLERS
    // ========================
    
    function handleAction(action) {
        if (action === 'daily-report') {
            if (typeof DailyReportComponent !== 'undefined') {
                DailyReportComponent.open();
            } else if (typeof openDailyReport === 'function') {
                openDailyReport();
            }
        } else if (typeof SlidePanelComponent !== 'undefined') {
            SlidePanelComponent.open(action);
        }
    }

    // ========================
    // PERMISSION FILTERING
    // ========================
    
    function filterByPermission() {
        const userRole = AppState.get('userRole') || 'staff';

        function canAccess(requiredPermission) {
            return (
                userRole === 'admin' ||
                (userRole === 'clinical' && requiredPermission !== 'admin') ||
                (userRole === 'staff' && requiredPermission === 'staff')
            );
        }

        $('.quick-action-item').each(function() {
            const requiredPermission = $(this).attr('data-permission');
            if (canAccess(requiredPermission)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // ========================
    // LANGUAGE UPDATE
    // ========================
    
    function updateLanguage() {
        const currentLanguage = AppState.getLanguage();
        
        $('#quickActionText').text(translations[currentLanguage].quickAction);
        $('#dropdownTitle').text(translations[currentLanguage].dropdownTitle);

        $('.action-label').each(function() {
            const $label = $(this);
            const enText = $label.attr('data-en');
            const khText = $label.attr('data-kh');
            $label.text(currentLanguage === 'en' ? enText : khText);
        });
    }

    // ========================
    // PUBLIC API
    // ========================
    return {
        init,
        openDropdown,
        closeDropdown,
        handleAction,
        updateLanguage,
        filterByPermission
    };
})();

// Expose globally
window.QuickActionsComponent = QuickActionsComponent;
