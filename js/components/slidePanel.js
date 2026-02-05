/**
 * Slide Panel Component
 * Handles the sliding panel for forms (appointments, patients, payments, etc.)
 */

const SlidePanelComponent = (function() {
    'use strict';

    // ========================
    // PANEL CONFIGURATIONS
    // ========================
    
    function getPanelConfig(type, data = null) {
        const currentLanguage = AppState.getLanguage();
        
        const configs = {
            'patient': {
                icon: 'fas fa-user-plus',
                title: currentLanguage === 'en' ? 'New Patient' : 'អ្នកជំងឺថ្មី',
                form: () => getPatientFormTemplate(currentLanguage)
            },
            'appointment': {
                icon: 'fas fa-calendar-plus',
                title: currentLanguage === 'en' ? 'New Appointment' : 'ការណាត់ជួបថ្មី',
                form: (data) => getAppointmentFormTemplate({
                    lang: currentLanguage,
                    patients: mockPatients,
                    providers: mockProviders,
                    treatments: treatmentCategories,
                    types: appointmentTypes,
                    rooms: rooms,
                    data: null,
                    selectedDate: data?.dateKey || ''
                })
            },
            'edit-appointment': {
                icon: 'fas fa-edit',
                title: currentLanguage === 'en' ? 'Edit Appointment' : 'កែប្រែការណាត់ជួប',
                form: (data) => getAppointmentFormTemplate({
                    lang: currentLanguage,
                    patients: mockPatients,
                    providers: mockProviders,
                    treatments: treatmentCategories,
                    types: appointmentTypes,
                    rooms: rooms,
                    data: data
                })
            },
            'lab-order': {
                icon: 'fas fa-flask',
                title: currentLanguage === 'en' ? 'New Lab Order' : 'សំណើមន្ទីរពិសោធន៍',
                form: () => getLabOrderFormTemplate(currentLanguage, mockPatients, mockProviders)
            },
            'payment': {
                icon: 'fas fa-dollar-sign',
                title: currentLanguage === 'en' ? 'New Payment' : 'ការទូទាត់ថ្មី',
                form: () => getPaymentFormTemplate(currentLanguage, mockPatients)
            },
            'employee': {
                icon: 'fas fa-user-tie',
                title: currentLanguage === 'en' ? 'New Employee' : 'បុគ្គលិកថ្មី',
                form: () => getEmployeeFormTemplate(currentLanguage)
            },
            'prescription': {
                icon: 'fas fa-prescription',
                title: currentLanguage === 'en' ? 'New Prescription' : 'វេជ្ជបញ្ជាថ្មី',
                form: () => getPrescriptionFormTemplate(currentLanguage, mockPatients, mockProviders)
            },
            'services': {
                icon: 'fas fa-hand-holding-medical',
                title: currentLanguage === 'en' ? 'New Services' : 'សេវាកម្មថ្មី',
                form: () => getServicesFormTemplate(currentLanguage)
            },
            'patient-history': {
                icon: 'fas fa-history',
                title: currentLanguage === 'en' ? 'Patient History' : 'ប្រវត្តិអ្នកជំងឺ',
                form: getPatientHistoryView
            }
        };

        return configs[type];
    }

    // ========================
    // OPEN / CLOSE PANEL
    // ========================
    
    function open(type, data = null) {
        const config = getPanelConfig(type, data);
        if (!config) {
            console.error('Unknown panel type:', type);
            return;
        }

        const panel = $('#slidePanel');
        const overlay = $('#slidePanelOverlay');
        const icon = $('#slidePanelIcon');
        const title = $('#slidePanelTitle');
        const body = $('#slidePanelBody');

        // Set icon and title
        icon.attr('class', 'slide-panel-icon ' + config.icon);
        title.text(config.title);

        // Generate form content
        let formHtml;
        if (typeof config.form === 'function') {
            formHtml = config.form(data);
        } else {
            formHtml = config.form;
        }
        body.html(formHtml);

        // Show panel
        panel.addClass('show');
        overlay.addClass('show');

        // Focus on first input
        setTimeout(() => {
            body.find('input:first, select:first').focus();
        }, 300);
    }

    function close() {
        $('#slidePanel').removeClass('show');
        $('#slidePanelOverlay').removeClass('show');
        $('#slidePanelBody').html('');
    }

    function openForEdit(appointmentId) {
        const apt = AppState.getAppointmentById(appointmentId);
        if (apt) {
            open('edit-appointment', apt);
        }
    }

    // ========================
    // FORM TEMPLATES
    // ========================
    
    function getAppointmentForm(data = null) {
        const currentLanguage = AppState.getLanguage();
        const selectedDate = AppState.get('selectedDate');
        const isEdit = data !== null && data.id;
        
        // Handle prefill data from timeline quick book
        const isQuickBook = data && data.isQuickBook;
        
        const dateValue = data ? (data.dateKey || data.dateStart?.split(' ')[0]) : 
            (selectedDate ? formatDateKey(selectedDate) : new Date().toISOString().split('T')[0]);

        // Patient options
        let patientOptions = `<option value="">--- ${currentLanguage === 'en' ? 'Select Patient' : 'ជ្រើសរើសអ្នកជំងឺ'} ---</option>`;
        mockPatients.forEach(p => {
            const selected = data && data.patientId === p.id ? 'selected' : '';
            patientOptions += `<option value="${p.id}" ${selected}>${p.name}</option>`;
        });

        // Provider options
        let providerOptions = `<option value="">--- ${currentLanguage === 'en' ? 'Select Provider' : 'ជ្រើសរើសអ្នកផ្តល់សេវា'} ---</option>`;
        mockProviders.forEach(p => {
            const selected = data && data.providerId === p.id ? 'selected' : '';
            providerOptions += `<option value="${p.id}" ${selected}>${p.name}</option>`;
        });

        // Treatment options
        let treatmentOptions = `<option value="">--- ${currentLanguage === 'en' ? 'Select Category' : 'ជ្រើសរើសប្រភេទ'} ---</option>`;
        const treatments = typeof treatmentCategories !== 'undefined' ? treatmentCategories : [];
        treatments.forEach(t => {
            const selected = data && data.treatmentCategory === t.value ? 'selected' : '';
            treatmentOptions += `<option value="${t.value}" ${selected}>${currentLanguage === 'en' ? t.label : t.labelKh}</option>`;
        });

        // Room options
        let roomOptions = `<option value="">--- ${currentLanguage === 'en' ? 'Select Room' : 'ជ្រើសរើសបន្ទប់'} ---</option>`;
        const roomList = typeof rooms !== 'undefined' ? rooms : [];
        roomList.forEach(r => {
            const selected = data && data.roomNumber === r.id ? 'selected' : '';
            roomOptions += `<option value="${r.id}" ${selected}>${r.name}</option>`;
        });

        // Type options
        let typeOptions = '';
        const types = typeof appointmentTypes !== 'undefined' ? appointmentTypes : [];
        types.forEach(t => {
            const selected = data && data.type === t.value ? 'selected' : '';
            typeOptions += `<option value="${t.value}" ${selected}>${currentLanguage === 'en' ? t.label : t.labelKh}</option>`;
        });

        const startTime = data ? (data.startTime || data.dateStart?.split(' ')[1]) : '09:00';
        const endTime = data ? (data.endTime || data.dateEnd?.split(' ')[1]) : '10:00';

        return `
            <form id="appointmentForm" onsubmit="SlidePanelComponent.handleAppointmentSubmit(event, ${isEdit ? data.id : 'null'})">
                <div id="conflictWarning"></div>
                
                <!-- Patient Info Section -->
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-user"></i>
                        ${currentLanguage === 'en' ? 'Patient Info' : 'ព័ត៌មានអ្នកជំងឺ'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? "Patient's name" : 'ឈ្មោះអ្នកជំងឺ'} <span class="required">*</span></label>
                            <select class="form-select" name="patientId" id="patientId" required>
                                ${patientOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Provider' : 'អ្នកផ្តល់សេវា'} <span class="required">*</span></label>
                            <select class="form-select" name="providerId" id="providerId" required ${isQuickBook ? 'disabled' : ''}>
                                ${providerOptions}
                            </select>
                            ${isQuickBook ? `<input type="hidden" name="providerId" value="${data.providerId}">` : ''}
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Treatment' : 'ការព្យាបាល'}</label>
                            <select class="form-select" name="treatmentCategory" id="treatmentCategory">
                                ${treatmentOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Room' : 'បន្ទប់'}</label>
                            <select class="form-select" name="roomNumber" id="roomNumber">
                                ${roomOptions}
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Appointment Info Section -->
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-calendar-alt"></i>
                        ${currentLanguage === 'en' ? 'Appointment Info' : 'ព័ត៌មានការណាត់ជួប'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Title' : 'ចំណងជើង'}</label>
                            <input type="text" class="form-input" name="title" id="title" value="${data?.title || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Date' : 'កាលបរិច្ឆេទ'}</label>
                            <input type="date" class="form-input" name="appointmentDate" id="appointmentDate" value="${dateValue}" ${isQuickBook ? 'readonly' : ''}>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Start Time' : 'ម៉ោងចាប់ផ្តើម'}</label>
                            <input type="time" class="form-input" name="startTime" id="startTime" value="${startTime}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'End Time' : 'ម៉ោងបញ្ចប់'}</label>
                            <input type="time" class="form-input" name="endTime" id="endTime" value="${endTime}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Type' : 'ប្រភេទ'}</label>
                            <select class="form-select" name="type" id="appointmentType">
                                ${typeOptions}
                            </select>
                        </div>
                        <div class="form-group"></div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Notes' : 'កំណត់ចំណាំ'}</label>
                            <textarea class="form-textarea" name="notes" id="notes">${data?.notes || ''}</textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="SlidePanelComponent.close()">
                        ${currentLanguage === 'en' ? 'Cancel' : 'បោះបង់'}
                    </button>
                    ${isEdit ? `
                        <button type="button" class="btn btn-danger" onclick="SlidePanelComponent.deleteAppointment(${data.id})">
                            <i class="fas fa-trash"></i>
                            ${currentLanguage === 'en' ? 'Delete' : 'លុប'}
                        </button>
                    ` : ''}
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEdit ? (currentLanguage === 'en' ? 'Update' : 'ធ្វើបច្ចុប្បន្នភាព') : (currentLanguage === 'en' ? 'Create' : 'បង្កើត')}
                    </button>
                </div>
            </form>
        `;
    }

    function getPatientForm(data = null) {
        const currentLanguage = AppState.getLanguage();
        
        return `
            <form id="patientForm" onsubmit="SlidePanelComponent.handlePatientSubmit(event)">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-user"></i>
                        ${currentLanguage === 'en' ? 'Patient Information' : 'ព័ត៌មានអ្នកជំងឺ'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Full Name' : 'ឈ្មោះពេញ'} <span class="required">*</span></label>
                            <input type="text" class="form-input" name="fullName" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Date of Birth' : 'ថ្ងៃខែឆ្នាំកំណើត'}</label>
                            <input type="date" class="form-input" name="dob">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Gender' : 'ភេទ'}</label>
                            <select class="form-select" name="gender">
                                <option value="">---</option>
                                <option value="male">${currentLanguage === 'en' ? 'Male' : 'ប្រុស'}</option>
                                <option value="female">${currentLanguage === 'en' ? 'Female' : 'ស្រី'}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Phone' : 'ទូរស័ព្ទ'} <span class="required">*</span></label>
                            <input type="tel" class="form-input" name="phone" required>
                        </div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Address' : 'អាសយដ្ឋាន'}</label>
                            <textarea class="form-textarea" name="address"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="SlidePanelComponent.close()">
                        ${currentLanguage === 'en' ? 'Cancel' : 'បោះបង់'}
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${currentLanguage === 'en' ? 'Create Patient' : 'បង្កើតអ្នកជំងឺ'}
                    </button>
                </div>
            </form>
        `;
    }

    function getLabOrderForm(data = null) {
        const currentLanguage = AppState.getLanguage();
        
        return `
            <form id="labOrderForm" onsubmit="SlidePanelComponent.handleFormSubmit(event, 'lab-order')">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-flask"></i>
                        ${currentLanguage === 'en' ? 'Lab Order Details' : 'ព័ត៌មានសំណើមន្ទីរពិសោធន៍'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Patient' : 'អ្នកជំងឺ'} <span class="required">*</span></label>
                            <select class="form-select" name="patientId" required>
                                <option value="">---</option>
                                ${mockPatients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Provider' : 'អ្នកផ្តល់សេវា'} <span class="required">*</span></label>
                            <select class="form-select" name="providerId" required>
                                <option value="">---</option>
                                ${mockProviders.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Test Type' : 'ប្រភេទតេស្ត'}</label>
                            <select class="form-select" name="testType">
                                <option value="blood">Blood Test</option>
                                <option value="urine">Urine Test</option>
                                <option value="xray">X-Ray</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Priority' : 'អាទិភាព'}</label>
                            <select class="form-select" name="priority">
                                <option value="routine">Routine</option>
                                <option value="urgent">Urgent</option>
                                <option value="stat">STAT</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="SlidePanelComponent.close()">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Create</button>
                </div>
            </form>
        `;
    }

    function getPaymentForm(data = null) {
        const currentLanguage = AppState.getLanguage();
        const today = new Date().toISOString().split('T')[0];
        
        return `
            <form id="paymentForm" onsubmit="SlidePanelComponent.handlePaymentSubmit(event)">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-user"></i>
                        ${currentLanguage === 'en' ? 'Patient Information' : 'ព័ត៌មានអ្នកជំងឺ'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Patient' : 'អ្នកជំងឺ'} <span class="required">*</span></label>
                            <select class="form-select" name="patientId" id="paymentPatientSelect" required onchange="SlidePanelComponent.loadPatientInvoice()">
                                <option value="">---</option>
                                ${mockPatients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Date' : 'កាលបរិច្ឆេទ'}</label>
                            <input type="date" class="form-input" name="date" value="${today}">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-calculator"></i>
                        ${currentLanguage === 'en' ? 'Payment Amounts' : 'ការគណនាទូទាត់'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Total Amount' : 'ចំនួនសរុប'} <span class="required">*</span></label>
                            <input type="number" class="form-input" name="totalAmount" id="totalAmount" step="0.01" required oninput="SlidePanelComponent.calculatePaymentTotals()">
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Paid Amount' : 'ចំនួនទូទាត់'} <span class="required">*</span></label>
                            <input type="number" class="form-input" name="paidAmount" id="paidAmount" step="0.01" required oninput="SlidePanelComponent.calculatePaymentTotals()">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Method' : 'វិធីសាស្ត្រ'}</label>
                            <select class="form-select" name="method">
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="bank-transfer">Bank Transfer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${currentLanguage === 'en' ? 'Balance' : 'សមតុល្យ'}</label>
                            <input type="number" class="form-input" id="remainingBalance" readonly style="background:#f3f4f6;">
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="SlidePanelComponent.close()">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-check-circle"></i> Receive Payment</button>
                </div>
            </form>
        `;
    }

    function getEmployeeForm() {
        const currentLanguage = AppState.getLanguage();
        return `<form><div class="form-section"><p>Employee form - Coming soon</p></div><div class="form-actions"><button type="button" class="btn btn-secondary" onclick="SlidePanelComponent.close()">Close</button></div></form>`;
    }

    function getPrescriptionForm() {
        const currentLanguage = AppState.getLanguage();
        return `<form><div class="form-section"><p>Prescription form - Coming soon</p></div><div class="form-actions"><button type="button" class="btn btn-secondary" onclick="SlidePanelComponent.close()">Close</button></div></form>`;
    }

    function getServicesForm() {
        const currentLanguage = AppState.getLanguage();
        return `<form><div class="form-section"><p>Services form - Coming soon</p></div><div class="form-actions"><button type="button" class="btn btn-secondary" onclick="SlidePanelComponent.close()">Close</button></div></form>`;
    }

    function getPatientHistoryView(data) {
        const currentLanguage = AppState.getLanguage();
        const { patient, appointments } = data;
        
        let historyHtml = '';
        if (appointments.length === 0) {
            historyHtml = '<p class="text-muted">No appointment history</p>';
        } else {
            appointments.sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart));
            appointments.forEach(apt => {
                const date = new Date(apt.dateStart).toLocaleDateString();
                historyHtml += `
                    <div class="history-item">
                        <div class="history-date">${date}</div>
                        <div class="history-details">
                            <strong>${apt.treatment || apt.title}</strong>
                            <span class="status-badge status-${apt.type}">${apt.type}</span>
                        </div>
                        <div class="history-provider">${apt.providerName}</div>
                    </div>
                `;
            });
        }
        
        return `
            <div class="patient-history-panel">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-user"></i>
                        ${patient.name}
                    </div>
                    <p><i class="fas fa-phone"></i> ${patient.phone}</p>
                </div>
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-history"></i>
                        ${currentLanguage === 'en' ? 'Visit History' : 'ប្រវត្តិជួប'}
                    </div>
                    <div class="history-list">
                        ${historyHtml}
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="SlidePanelComponent.close()">Close</button>
                    <button type="button" class="btn btn-primary" onclick="SlidePanelComponent.open('appointment', {patientId: ${patient.id}, patientName: '${patient.name}'})">
                        <i class="fas fa-calendar-plus"></i> New Appointment
                    </button>
                </div>
            </div>
        `;
    }

    // ========================
    // FORM HANDLERS
    // ========================
    
    function handleAppointmentSubmit(event, editId) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const patientId = parseInt(formData.get('patientId'));
        const patient = mockPatients.find(p => p.id === patientId);
        const providerId = parseInt(formData.get('providerId'));
        const provider = mockProviders.find(p => p.id === providerId);
        
        const appointmentData = {
            patientId: patientId,
            patientName: patient?.name || '',
            providerId: providerId,
            providerName: provider?.name || '',
            treatmentCategory: formData.get('treatmentCategory'),
            treatment: formData.get('treatmentCategory'),
            roomNumber: parseInt(formData.get('roomNumber')) || 1,
            title: formData.get('title') || 'Appointment',
            dateStart: `${formData.get('appointmentDate')} ${formData.get('startTime')}`,
            dateEnd: `${formData.get('appointmentDate')} ${formData.get('endTime')}`,
            type: formData.get('type') || 'scheduled',
            notes: formData.get('notes') || ''
        };
        
        if (editId) {
            // Update existing
            AppState.updateAppointment(editId, appointmentData);
            if (typeof showNotification === 'function') {
                showNotification('Appointment updated successfully', 'success');
            }
        } else {
            // Create new
            appointmentData.id = Date.now();
            AppState.addAppointment(appointmentData);
            if (typeof showNotification === 'function') {
                showNotification('Appointment created successfully', 'success');
            }
        }
        
        close();
        refreshViews();
    }

    function handlePatientSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const newPatient = {
            id: Date.now(),
            name: formData.get('fullName'),
            phone: formData.get('phone'),
            gender: formData.get('gender'),
            dob: formData.get('dob'),
            address: formData.get('address')
        };
        
        // Add to mockPatients (in real app, this would be an API call)
        mockPatients.push(newPatient);
        
        if (typeof showNotification === 'function') {
            showNotification('Patient created successfully', 'success');
        }
        
        close();
    }

    function handlePaymentSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const patientId = parseInt(formData.get('patientId'));
        const patient = mockPatients.find(p => p.id === patientId);
        
        const paymentData = {
            id: Date.now(),
            patientId: patientId,
            patientName: patient?.name || '',
            totalAmount: parseFloat(formData.get('totalAmount')),
            paidAmount: parseFloat(formData.get('paidAmount')),
            method: formData.get('method'),
            paidDate: formData.get('date'),
            createdAt: new Date().toISOString()
        };
        
        AppState.addPayment(paymentData);
        
        if (typeof showNotification === 'function') {
            showNotification('Payment recorded successfully', 'success');
        }
        
        close();
        refreshViews();
    }

    function handleFormSubmit(event, formType) {
        event.preventDefault();
        if (typeof showNotification === 'function') {
            showNotification(`${formType} saved successfully`, 'success');
        }
        close();
    }

    function deleteAppointment(id) {
        const currentLanguage = AppState.getLanguage();
        const confirmMsg = currentLanguage === 'en' ? 
            'Are you sure you want to delete this appointment?' : 
            'តើអ្នកប្រាកដថាចង់លុបការណាត់ជួបនេះ?';
            
        if (confirm(confirmMsg)) {
            AppState.deleteAppointment(id);
            if (typeof showNotification === 'function') {
                showNotification('Appointment deleted', 'success');
            }
            close();
            refreshViews();
        }
    }

    // ========================
    // HELPER FUNCTIONS
    // ========================
    
    function calculatePaymentTotals() {
        const totalAmount = parseFloat($('#totalAmount').val()) || 0;
        const paidAmount = parseFloat($('#paidAmount').val()) || 0;
        const remainingBalance = Math.max(0, totalAmount - paidAmount);
        
        $('#remainingBalance').val(remainingBalance.toFixed(2));
        $('#remainingBalance').css('color', remainingBalance > 0 ? '#dc2626' : '#059669');
    }

    function loadPatientInvoice() {
        // Placeholder for loading patient invoice data
    }

    function refreshViews() {
        const currentView = AppState.getView();
        
        if (typeof CalendarView !== 'undefined') CalendarView.render();
        if (typeof AppointmentsManager !== 'undefined') AppointmentsManager.render();
        
        if (currentView === 'timeline' && typeof TimelineView !== 'undefined') {
            TimelineView.render();
        } else if (currentView === 'dashboard' && typeof DashboardView !== 'undefined') {
            DashboardView.render();
        }
    }

    function formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ========================
    // EVENT BINDING
    // ========================
    
    function bindEvents() {
        // Close button
        $('#closePanelBtn').click(close);
        
        // Overlay click
        $('#slidePanelOverlay').click(close);
        
        // Escape key
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                close();
            }
        });
    }

    // ========================
    // PUBLIC API
    // ========================
    return {
        open,
        close,
        openForEdit,
        bindEvents,
        handleAppointmentSubmit,
        handlePatientSubmit,
        handlePaymentSubmit,
        handleFormSubmit,
        deleteAppointment,
        calculatePaymentTotals,
        loadPatientInvoice
    };
})();

// Expose globally
window.SlidePanelComponent = SlidePanelComponent;

// Global function aliases for onclick handlers
window.openSlidePanel = function(type, data) { SlidePanelComponent.open(type, data); };
window.closeSlidePanel = function() { SlidePanelComponent.close(); };
window.editAppointment = function(id) { SlidePanelComponent.openForEdit(id); };
window.handleAppointmentSubmit = function(e, id) { SlidePanelComponent.handleAppointmentSubmit(e, id); };
window.handlePatientSubmit = function(e) { SlidePanelComponent.handlePatientSubmit(e); };
window.handlePaymentSubmit = function(e) { SlidePanelComponent.handlePaymentSubmit(e); };
window.calculatePaymentTotals = function() { SlidePanelComponent.calculatePaymentTotals(); };
window.loadPatientInvoice = function() { SlidePanelComponent.loadPatientInvoice(); };
