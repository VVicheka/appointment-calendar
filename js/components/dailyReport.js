/**
 * Daily Report Component
 * Handles daily report generation and printing
 */

const DailyReportComponent = (function() {
    'use strict';

    // ========================
    // OPEN / CLOSE
    // ========================
    
    function open() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('reportDate').value = today;
        document.getElementById('dailyReportPanel').classList.add('show');
        load();
    }

    function close() {
        document.getElementById('dailyReportPanel').classList.remove('show');
    }

    // ========================
    // LOAD REPORT DATA
    // ========================
    
    function load() {
        const tbody = document.getElementById('dailyReportBody');
        const reportDate = document.getElementById('reportDate').value;
        tbody.innerHTML = '';

        const appointments = AppState.get('appointments');
        const dateKey = reportDate;
        const filteredAppointments = appointments.filter(apt =>
            apt.dateStart && apt.dateStart.startsWith(dateKey)
        );

        let total = 0, completed = 0, cancelled = 0, revenue = 0;

        filteredAppointments.forEach((apt, index) => {
            total++;
            if (apt.type === 'completed') completed++;
            if (apt.type === 'cancelled') cancelled++;

            // Calculate amount (mock calculation)
            const amount = apt.type === 'completed' ? (Math.random() * 50 + 10).toFixed(0) : 0;
            revenue += parseFloat(amount);

            const provider = mockProviders.find(p => p.id == apt.providerId);
            const providerName = provider ? provider.name.replace('Dr. ', '') : 'N/A';

            const date = new Date(apt.dateStart.split(' ')[0]);
            const dateFormatted = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
            const time = apt.dateStart.split(' ')[1].substring(0, 5);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${dateFormatted}</td>
                <td>${time}</td>
                <td>${apt.patientName}</td>
                <td>${providerName}</td>
                <td>${apt.roomNumber}</td>
                <td><span class="status-badge-${apt.type}">${apt.type}</span></td>
                <td>${apt.treatment || 'General'}</td>
                <td>$${amount}</td>
            `;
            tbody.appendChild(tr);
        });

        // Update summary
        document.getElementById('sumAppointments').innerText = total;
        document.getElementById('sumCompleted').innerText = completed;
        document.getElementById('sumCancelled').innerText = cancelled;
        document.getElementById('sumRevenue').innerText = '$' + revenue.toFixed(2);
    }

    // ========================
    // APPROVAL MODAL
    // ========================
    
    function openApprovalModal() {
        document.getElementById('approvalModal').style.display = 'flex';
    }

    function closeApprovalModal() {
        document.getElementById('approvalModal').style.display = 'none';
    }

    // ========================
    // PRINT FUNCTIONALITY
    // ========================
    
    function print() {
        // Prepare print content
        ensurePrintNotesBox();
        
        const printNotesBox = document.getElementById('printNotesBox');
        if (printNotesBox) {
            const notesTextarea = document.querySelector('.report-notes textarea');
            if (notesTextarea) {
                printNotesBox.innerHTML = notesTextarea.value.replace(/\n/g, '<br>');
            }
        }

        window.print();
    }

    function ensurePrintNotesBox() {
        const notesWrap = document.querySelector('.report-notes');
        if (!notesWrap) return;

        let box = document.getElementById('printNotesBox');
        if (!box) {
            box = document.createElement('div');
            box.id = 'printNotesBox';
            box.className = 'print-notes-box';
            box.style.display = 'none';
            notesWrap.appendChild(box);
        }
    }

    // ========================
    // EXPORT FUNCTIONALITY
    // ========================
    
    function exportCSV() {
        const appointments = AppState.get('appointments');
        const reportDate = document.getElementById('reportDate').value;
        
        const filteredAppointments = appointments.filter(apt =>
            apt.dateStart && apt.dateStart.startsWith(reportDate)
        );

        let csv = 'No,Date,Time,Patient,Provider,Room,Status,Treatment,Amount\n';
        
        filteredAppointments.forEach((apt, index) => {
            const provider = mockProviders.find(p => p.id == apt.providerId);
            const providerName = provider ? provider.name : 'N/A';
            const amount = apt.type === 'completed' ? '$' + (Math.random() * 50 + 10).toFixed(0) : '$0';
            
            csv += `${index + 1},"${apt.dateStart.split(' ')[0]}","${apt.dateStart.split(' ')[1]}","${apt.patientName}","${providerName}",${apt.roomNumber},"${apt.type}","${apt.treatment || 'General'}","${amount}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-report-${reportDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // ========================
    // PUBLIC API
    // ========================
    return {
        open,
        close,
        load,
        openApprovalModal,
        closeApprovalModal,
        print,
        exportCSV
    };
})();

// Expose globally
window.DailyReportComponent = DailyReportComponent;
window.openDailyReport = function() { DailyReportComponent.open(); };
window.closeDailyReport = function() { DailyReportComponent.close(); };
window.loadDailyReport = function() { DailyReportComponent.load(); };
window.openApprovalModal = function() { DailyReportComponent.openApprovalModal(); };
window.closeApprovalModal = function() { DailyReportComponent.closeApprovalModal(); };
