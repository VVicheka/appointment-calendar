/**
 * Dental Appointment Calendar - Form Templates
 * Contains HTML template generators for all form types
 * 
 * Note: These templates require access to global data:
 * - mockPatients, mockProviders, treatmentCategories, appointmentTypes, rooms
 * - translations object and currentLanguage variable
 * 
 * These templates are designed to be used with the slide panel system.
 */

/**
 * Generate Patient Form HTML
 * @param {string} lang - Current language ('en' or 'kh')
 * @returns {string} - HTML string for patient form
 */
function getPatientFormTemplate(lang) {
    lang = lang || 'en';
    const t = {
        en: {
            title: 'Patient Information',
            fullName: 'Full Name',
            dob: 'Date of Birth',
            gender: 'Gender',
            phone: 'Phone Number',
            address: 'Address',
            medicalHistory: 'Medical History',
            allergies: 'Allergies',
            medicalNotes: 'Medical Notes',
            select: 'Select',
            male: 'Male',
            female: 'Female',
            other: 'Other',
            cancel: 'Cancel',
            createPatient: 'Create Patient',
            enterAllergies: 'Enter any known allergies'
        },
        kh: {
            title: 'ព័ត៌មានអ្នកជំងឺ',
            fullName: 'ឈ្មោះពេញ',
            dob: 'ថ្ងៃខែឆ្នាំកំណើត',
            gender: 'ភេទ',
            phone: 'លេខទូរស័ព្ទ',
            address: 'អាសយដ្ឋាន',
            medicalHistory: 'ប្រវត្តិវេជ្ជសាស្រ្ត',
            allergies: 'អាឡែរហ្ស៊ី',
            medicalNotes: 'កំណត់ចំណាំវេជ្ជសាស្រ្ត',
            select: 'ជ្រើសរើស',
            male: 'ប្រុស',
            female: 'ស្រី',
            other: 'ផ្សេងទៀត',
            cancel: 'បោះបង់',
            createPatient: 'បង្កើតអ្នកជំងឺ',
            enterAllergies: 'បញ្ចូលអាឡែរហ្ស៊ី'
        }
    };
    const txt = t[lang] || t.en;

    return `
        <form id="patientForm" onsubmit="handlePatientSubmit(event)">
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-user"></i>
                    ${txt.title}
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.fullName} <span class="required">*</span></label>
                        <input type="text" class="form-input" name="fullName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.dob} <span class="required">*</span></label>
                        <input type="date" class="form-input" name="dob" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.gender} <span class="required">*</span></label>
                        <select class="form-select" name="gender" required>
                            <option value="">--- ${txt.select} ---</option>
                            <option value="male">${txt.male}</option>
                            <option value="female">${txt.female}</option>
                            <option value="other">${txt.other}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.phone} <span class="required">*</span></label>
                        <input type="tel" class="form-input" name="phone" required>
                    </div>
                </div>
                <div class="form-row single">
                    <div class="form-group">
                        <label class="form-label">${txt.address}</label>
                        <textarea class="form-textarea" name="address"></textarea>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-notes-medical"></i>
                    ${txt.medicalHistory}
                </div>
                <div class="form-row single">
                    <div class="form-group">
                        <label class="form-label">${txt.allergies}</label>
                        <input type="text" class="form-input" name="allergies" placeholder="${txt.enterAllergies}">
                    </div>
                </div>
                <div class="form-row single">
                    <div class="form-group">
                        <label class="form-label">${txt.medicalNotes}</label>
                        <textarea class="form-textarea" name="medicalNotes"></textarea>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                    ${txt.cancel}
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    ${txt.createPatient}
                </button>
            </div>
        </form>
    `;
}

/**
 * Generate Lab Order Form HTML
 * @param {string} lang - Current language ('en' or 'kh')
 * @param {Array} patients - Array of patient objects
 * @param {Array} providers - Array of provider objects
 * @returns {string} - HTML string for lab order form
 */
function getLabOrderFormTemplate(lang, patients, providers) {
    lang = lang || 'en';
    patients = patients || [];
    providers = providers || [];
    
    const t = {
        en: {
            title: 'Lab Order Details',
            patientName: 'Patient Name',
            orderingProvider: 'Ordering Provider',
            testType: 'Test Type',
            priority: 'Priority',
            notes: 'Clinical Notes',
            selectPatient: 'Select Patient',
            selectProvider: 'Select Provider',
            select: 'Select',
            routine: 'Routine',
            urgent: 'Urgent',
            cancel: 'Cancel',
            createOrder: 'Create Order'
        },
        kh: {
            title: 'ព័ត៌មានសំណើមន្ទីរពិសោធន៍',
            patientName: 'ឈ្មោះអ្នកជំងឺ',
            orderingProvider: 'អ្នកបញ្ជា',
            testType: 'ប្រភេទតេស្ត',
            priority: 'អាទិភាព',
            notes: 'កំណត់ចំណាំគ្លីនិក',
            selectPatient: 'ជ្រើសរើសអ្នកជំងឺ',
            selectProvider: 'ជ្រើសរើសអ្នកផ្តល់សេវា',
            select: 'ជ្រើសរើស',
            routine: 'ធម្មតា',
            urgent: 'បន្ទាន់',
            cancel: 'បោះបង់',
            createOrder: 'បង្កើតសំណើ'
        }
    };
    const txt = t[lang] || t.en;

    const patientOptions = patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    const providerOptions = providers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    return `
        <form id="labOrderForm" onsubmit="handleLabOrderSubmit(event)">
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-flask"></i>
                    ${txt.title}
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.patientName} <span class="required">*</span></label>
                        <select class="form-select" name="patientId" required>
                            <option value="">--- ${txt.selectPatient} ---</option>
                            ${patientOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.orderingProvider} <span class="required">*</span></label>
                        <select class="form-select" name="providerId" required>
                            <option value="">--- ${txt.selectProvider} ---</option>
                            ${providerOptions}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.testType} <span class="required">*</span></label>
                        <select class="form-select" name="testType" required>
                            <option value="">--- ${txt.select} ---</option>
                            <option value="blood">Blood Test</option>
                            <option value="urine">Urine Test</option>
                            <option value="xray">X-Ray</option>
                            <option value="ultrasound">Ultrasound</option>
                            <option value="ct-scan">CT Scan</option>
                            <option value="mri">MRI</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.priority} <span class="required">*</span></label>
                        <select class="form-select" name="priority" required>
                            <option value="routine">${txt.routine}</option>
                            <option value="urgent">${txt.urgent}</option>
                            <option value="stat">STAT</option>
                        </select>
                    </div>
                </div>
                <div class="form-row single">
                    <div class="form-group">
                        <label class="form-label">${txt.notes}</label>
                        <textarea class="form-textarea" name="notes"></textarea>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                    ${txt.cancel}
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    ${txt.createOrder}
                </button>
            </div>
        </form>
    `;
}

/**
 * Generate Employee Form HTML
 * @param {string} lang - Current language ('en' or 'kh')
 * @returns {string} - HTML string for employee form
 */
function getEmployeeFormTemplate(lang) {
    lang = lang || 'en';
    const t = {
        en: {
            title: 'Employee Information',
            fullName: 'Full Name',
            employeeId: 'Employee ID',
            position: 'Position',
            department: 'Department',
            email: 'Email',
            phone: 'Phone Number',
            startDate: 'Start Date',
            salary: 'Salary',
            select: 'Select',
            doctor: 'Doctor',
            dentist: 'Dentist',
            nurse: 'Nurse',
            receptionist: 'Receptionist',
            admin: 'Administrator',
            cancel: 'Cancel',
            createEmployee: 'Create Employee'
        },
        kh: {
            title: 'ព័ត៌មានបុគ្គលិក',
            fullName: 'ឈ្មោះពេញ',
            employeeId: 'លេខសម្គាល់បុគ្គលិក',
            position: 'មុខតំណែង',
            department: 'នាយកដ្ឋាន',
            email: 'អ៊ីមែល',
            phone: 'លេខទូរស័ព្ទ',
            startDate: 'ថ្ងៃចាប់ផ្តើម',
            salary: 'ប្រាក់ខែ',
            select: 'ជ្រើសរើស',
            doctor: 'គ្រូពេទ្យ',
            dentist: 'ទន្តពេទ្យ',
            nurse: 'គិលានុបដ្ឋាយិកា',
            receptionist: 'អ្នកទទួលភ្ញៀវ',
            admin: 'រដ្ឋបាល',
            cancel: 'បោះបង់',
            createEmployee: 'បង្កើតបុគ្គលិក'
        }
    };
    const txt = t[lang] || t.en;

    return `
        <form id="employeeForm" onsubmit="handleEmployeeSubmit(event)">
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-user-tie"></i>
                    ${txt.title}
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.fullName} <span class="required">*</span></label>
                        <input type="text" class="form-input" name="fullName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.employeeId}</label>
                        <input type="text" class="form-input" name="employeeId" placeholder="EMP-001">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.position} <span class="required">*</span></label>
                        <select class="form-select" name="position" required>
                            <option value="">--- ${txt.select} ---</option>
                            <option value="doctor">${txt.doctor}</option>
                            <option value="dentist">${txt.dentist}</option>
                            <option value="nurse">${txt.nurse}</option>
                            <option value="receptionist">${txt.receptionist}</option>
                            <option value="admin">${txt.admin}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.department} <span class="required">*</span></label>
                        <input type="text" class="form-input" name="department" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.email} <span class="required">*</span></label>
                        <input type="email" class="form-input" name="email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.phone} <span class="required">*</span></label>
                        <input type="tel" class="form-input" name="phone" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.startDate}</label>
                        <input type="date" class="form-input" name="startDate">
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.salary}</label>
                        <input type="number" class="form-input" name="salary" step="0.01">
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                    ${txt.cancel}
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    ${txt.createEmployee}
                </button>
            </div>
        </form>
    `;
}

/**
 * Generate Prescription Form HTML
 * @param {string} lang - Current language ('en' or 'kh')
 * @param {Array} patients - Array of patient objects
 * @param {Array} providers - Array of provider objects
 * @returns {string} - HTML string for prescription form
 */
function getPrescriptionFormTemplate(lang, patients, providers) {
    lang = lang || 'en';
    patients = patients || [];
    providers = providers || [];
    
    const t = {
        en: {
            prescriptionDetails: 'Prescription Details',
            patientName: 'Patient Name',
            prescribingDoctor: 'Prescribing Doctor',
            medication: 'Medication',
            medicationName: 'Medication Name',
            dosage: 'Dosage',
            frequency: 'Frequency',
            duration: 'Duration',
            instructions: 'Instructions',
            selectPatient: 'Select Patient',
            selectDoctor: 'Select Doctor',
            takeWithFood: 'Take with food...',
            cancel: 'Cancel',
            createPrescription: 'Create Prescription'
        },
        kh: {
            prescriptionDetails: 'ព័ត៌មានវេជ្ជបញ្ជា',
            patientName: 'ឈ្មោះអ្នកជំងឺ',
            prescribingDoctor: 'វេជ្ជបណ្ឌិត',
            medication: 'ថ្នាំ',
            medicationName: 'ឈ្មោះថ្នាំ',
            dosage: 'ទំហំ',
            frequency: 'ប្រេកង់',
            duration: 'រយៈពេល',
            instructions: 'សេចក្តីណែនាំ',
            selectPatient: 'ជ្រើសរើសអ្នកជំងឺ',
            selectDoctor: 'ជ្រើសរើសវេជ្ជបណ្ឌិត',
            takeWithFood: 'ញ៉ាំជាមួយអាហារ...',
            cancel: 'បោះបង់',
            createPrescription: 'បង្កើតវេជ្ជបញ្ជា'
        }
    };
    const txt = t[lang] || t.en;

    const patientOptions = patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    const providerOptions = providers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    return `
        <form id="prescriptionForm" onsubmit="handlePrescriptionSubmit(event)">
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-prescription"></i>
                    ${txt.prescriptionDetails}
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.patientName} <span class="required">*</span></label>
                        <select class="form-select" name="patientId" required>
                            <option value="">--- ${txt.selectPatient} ---</option>
                            ${patientOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.prescribingDoctor} <span class="required">*</span></label>
                        <select class="form-select" name="providerId" required>
                            <option value="">--- ${txt.selectDoctor} ---</option>
                            ${providerOptions}
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-pills"></i>
                    ${txt.medication}
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.medicationName} <span class="required">*</span></label>
                        <input type="text" class="form-input" name="medication" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.dosage} <span class="required">*</span></label>
                        <input type="text" class="form-input" name="dosage" placeholder="e.g., 500mg" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.frequency} <span class="required">*</span></label>
                        <input type="text" class="form-input" name="frequency" placeholder="e.g., 3 times daily" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.duration} <span class="required">*</span></label>
                        <input type="text" class="form-input" name="duration" placeholder="e.g., 7 days" required>
                    </div>
                </div>
                <div class="form-row single">
                    <div class="form-group">
                        <label class="form-label">${txt.instructions}</label>
                        <textarea class="form-textarea" name="instructions" placeholder="${txt.takeWithFood}"></textarea>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                    ${txt.cancel}
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    ${txt.createPrescription}
                </button>
            </div>
        </form>
    `;
}

/**
 * Generate Services Form HTML
 * @param {string} lang - Current language ('en' or 'kh')
 * @returns {string} - HTML string for services form
 */
function getServicesFormTemplate(lang) {
    lang = lang || 'en';
    const t = {
        en: {
            title: 'Service Details',
            serviceName: 'Service Name',
            serviceCode: 'Service Code',
            category: 'Category',
            price: 'Price (USD)',
            duration: 'Duration (minutes)',
            status: 'Status',
            description: 'Description',
            select: 'Select',
            consultation: 'Consultation',
            procedure: 'Procedure',
            diagnostic: 'Diagnostic',
            therapy: 'Therapy',
            surgery: 'Surgery',
            active: 'Active',
            inactive: 'Inactive',
            cancel: 'Cancel',
            createService: 'Create Service'
        },
        kh: {
            title: 'ព័ត៌មានសេវាកម្ម',
            serviceName: 'ឈ្មោះសេវាកម្ម',
            serviceCode: 'លេខកូដសេវា',
            category: 'ប្រភេទ',
            price: 'តម្លៃ (ដុល្លារ)',
            duration: 'រយៈពេល (នាទី)',
            status: 'ស្ថានភាព',
            description: 'ពិពណ៌នា',
            select: 'ជ្រើសរើស',
            consultation: 'ពិគ្រោះ',
            procedure: 'វិធីសាស្រ្ត',
            diagnostic: 'ការវិនិច្ឆ័យ',
            therapy: 'ការព្យាបាល',
            surgery: 'វះកាត់',
            active: 'សកម្ម',
            inactive: 'អសកម្ម',
            cancel: 'បោះបង់',
            createService: 'បង្កើតសេវាកម្ម'
        }
    };
    const txt = t[lang] || t.en;

    return `
        <form id="servicesForm" onsubmit="handleServicesSubmit(event)">
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-hand-holding-medical"></i>
                    ${txt.title}
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.serviceName} <span class="required">*</span></label>
                        <input type="text" class="form-input" name="serviceName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.serviceCode}</label>
                        <input type="text" class="form-input" name="serviceCode" placeholder="SVC-001">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.category} <span class="required">*</span></label>
                        <select class="form-select" name="category" required>
                            <option value="">--- ${txt.select} ---</option>
                            <option value="consultation">${txt.consultation}</option>
                            <option value="procedure">${txt.procedure}</option>
                            <option value="diagnostic">${txt.diagnostic}</option>
                            <option value="therapy">${txt.therapy}</option>
                            <option value="surgery">${txt.surgery}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.price} <span class="required">*</span></label>
                        <input type="number" class="form-input" name="price" step="0.01" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.duration}</label>
                        <input type="number" class="form-input" name="duration">
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.status}</label>
                        <select class="form-select" name="status">
                            <option value="active">${txt.active}</option>
                            <option value="inactive">${txt.inactive}</option>
                        </select>
                    </div>
                </div>
                <div class="form-row single">
                    <div class="form-group">
                        <label class="form-label">${txt.description}</label>
                        <textarea class="form-textarea" name="description"></textarea>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                    ${txt.cancel}
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    ${txt.createService}
                </button>
            </div>
        </form>
    `;
}
