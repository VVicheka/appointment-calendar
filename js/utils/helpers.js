/**
 * Dental Appointment Calendar - Helper Utilities
 * Contains general helper functions used across the application
 */

// Show notification toast
function showNotification(message, type) {
    type = type || 'success';
    
    // Remove existing notifications
    $('.notification').remove();
    
    const iconClass = {
        'success': 'fa-check-circle',
        'warning': 'fa-exclamation-triangle',
        'error': 'fa-times-circle',
        'info': 'fa-info-circle'
    };
    
    const notification = $(`
        <div class="notification ${type}">
            <i class="fas ${iconClass[type] || iconClass.info}"></i>
            <span>${message}</span>
        </div>
    `);
    
    $('body').append(notification);
    
    // Trigger animation
    setTimeout(() => notification.addClass('show'), 10);
    
    // Auto hide
    setTimeout(() => {
        notification.removeClass('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Generate unique ID
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Get initials from name
function getInitials(name) {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Highlight search text
function highlightText(text, search) {
    if (!search || !text) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

// Get color for status
function getStatusColor(status) {
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
    return colors[status] || '#6b7280';
}

// Get provider color
function getProviderColor(providerId) {
    const provider = mockProviders.find(p => p.id === providerId);
    return provider ? provider.color : '#6b7280';
}

// Save data to localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
}

// Load data from localStorage
function loadFromLocalStorage(key, defaultValue) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return defaultValue;
    }
}

// Calculate priority score for smart queue
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
        score += Math.min(waitMinutes * 2, 120); // Cap at 120 points
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

// Check for appointment conflicts
function checkConflicts(providerId, dateStart, dateEnd, excludeId) {
    const conflicts = [];
    
    appointments.forEach(apt => {
        if (excludeId && apt.id === excludeId) return;
        if (apt.providerId !== providerId) return;
        if (apt.type === 'cancelled' || apt.type === 'no-show') return;
        
        const aptStart = new Date(apt.dateStart);
        const aptEnd = new Date(apt.dateEnd);
        const newStart = new Date(dateStart);
        const newEnd = new Date(dateEnd);
        
        // Check for overlap
        if (newStart < aptEnd && newEnd > aptStart) {
            conflicts.push(apt);
        }
    });
    
    return conflicts;
}

// Format currency
function formatCurrency(amount, currency) {
    currency = currency || 'USD';
    if (currency === 'KHR') {
        return `${amount.toLocaleString()} ៛`;
    }
    return `$${amount.toFixed(2)}`;
}

// Smooth scroll to element
function scrollToElement(element, container) {
    if (!element) return;
    
    container = container || document.body;
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    container.scrollTo({
        top: element.offsetTop - container.offsetTop - 20,
        behavior: 'smooth'
    });
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard', 'success');
        return true;
    } catch (e) {
        console.error('Failed to copy:', e);
        return false;
    }
}

// Detect mobile device
function isMobile() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Get URL parameters
function getUrlParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    return params;
}
