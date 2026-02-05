/**
 * Dental Appointment Calendar - Appointment Form Templates
 * Contains appointment form HTML generators
 */

/**
 * Generate Appointment Form HTML
 * @param {Object} options - Form configuration options
 * @param {string} options.lang - Current language ('en' or 'kh')
 * @param {Array} options.patients - Array of patient objects
 * @param {Array} options.providers - Array of provider objects
 * @param {Array} options.treatments - Array of treatment category objects
 * @param {Array} options.types - Array of appointment type objects
 * @param {Array} options.rooms - Array of room objects
 * @param {Object} options.data - Existing appointment data (for editing)
 * @param {string} options.selectedDate - Pre-selected date (YYYY-MM-DD)
 * @returns {string} - HTML string for appointment form
 */
function getAppointmentFormTemplate(options) {
    const lang = options.lang || 'en';
    const patients = options.patients || [];
    const providers = options.providers || [];
    const treatments = options.treatments || [];
    const types = options.types || [];
    const roomList = options.rooms || [];
    const data = options.data || null;
    const selectedDate = options.selectedDate || '';
    const isEdit = data !== null;
    
    const dateValue = data ? data.dateStart.split(' ')[0] : (selectedDate || new Date().toISOString().split('T')[0]);
    
    const t = {
        en: {
            patientInfo: 'Patient Info',
            patientName: "Patient's name",
            provider: 'Provider/dentist response',
            treatmentCategory: 'Treatment Category',
            roomNum: 'Room Num',
            appointmentInfo: 'Appointment Info',
            appointmentTitle: 'Appointment Title',
            date: 'Date',
            startTime: 'Start Time',
            endTime: 'End Time',
            type: 'Type',
            notes: 'Notes',
            selectPatient: 'Select Patient',
            selectProvider: 'Select Provider',
            selectCategory: 'Select Category',
            selectRoom: 'Select Room',
            eventTitle: 'Event Title',
            additionalNotes: 'Additional notes',
            searchPatient: 'Search patient by name or phone...',
            searchHelper: 'Type to search and select patient',
            cancel: 'Cancel',
            create: 'Create',
            update: 'Update'
        },
        kh: {
            patientInfo: 'ព័ត៌មានអ្នកជំងឺ',
            patientName: 'ឈ្មោះអ្នកជំងឺ',
            provider: 'អ្នកផ្តល់សេវា',
            treatmentCategory: 'ប្រភេទការព្យាបាល',
            roomNum: 'លេខបន្ទប់',
            appointmentInfo: 'ព័ត៌មានការណាត់ជួប',
            appointmentTitle: 'ចំណងជើង',
            date: 'កាលបរិច្ឆេទ',
            startTime: 'ម៉ោងចាប់ផ្តើម',
            endTime: 'ម៉ោងបញ្ចប់',
            type: 'ប្រភេទ',
            notes: 'កំណត់ចំណាំ',
            selectPatient: 'ជ្រើសរើសអ្នកជំងឺ',
            selectProvider: 'ជ្រើសរើសអ្នកផ្តល់សេវា',
            selectCategory: 'ជ្រើសរើសប្រភេទ',
            selectRoom: 'ជ្រើសរើសបន្ទប់',
            eventTitle: 'ចំណងជើង',
            additionalNotes: 'កំណត់ចំណាំបន្ថែម',
            searchPatient: 'ស្វែងរកអ្នកជំងឺតាមឈ្មោះ ឬលេខទូរស័ព្ទ...',
            searchHelper: 'វាយបញ្ចូលដើម្បីស្វែងរក និងជ្រើសរើសអ្នកជំងឺ',
            cancel: 'បោះបង់',
            create: 'បង្កើត',
            update: 'ធ្វើបច្ចុប្បន្នភាព'
        }
    };
    const txt = t[lang] || t.en;

    // Build patient options
    let patientOptions = `<option value="">--- ${txt.selectPatient} ---</option>`;
    patients.forEach(p => {
        const selected = data && data.patientId === p.id ? 'selected' : '';
        patientOptions += `<option value="${p.id}" ${selected}>${p.name}</option>`;
    });

    // Build provider options
    let providerOptions = `<option value="">--- ${txt.selectProvider} ---</option>`;
    providers.forEach(p => {
        const selected = data && data.providerId === p.id ? 'selected' : '';
        providerOptions += `<option value="${p.id}" ${selected}>${p.name}</option>`;
    });

    // Build treatment options
    let treatmentOptions = `<option value="">--- ${txt.selectCategory} ---</option>`;
    treatments.forEach(t => {
        const selected = data && data.treatmentCategory === t.value ? 'selected' : '';
        const label = lang === 'en' ? t.label : (t.labelKh || t.label);
        treatmentOptions += `<option value="${t.value}" ${selected}>${label}</option>`;
    });

    // Build room options
    let roomOptions = `<option value="">--- ${txt.selectRoom} ---</option>`;
    roomList.forEach(r => {
        const selected = data && data.roomNumber === r.id ? 'selected' : '';
        roomOptions += `<option value="${r.id}" ${selected}>${r.name}</option>`;
    });

    // Build type options
    let typeOptions = '';
    types.forEach(t => {
        const selected = data && data.type === t.value ? 'selected' : '';
        const label = lang === 'en' ? t.label : (t.labelKh || t.label);
        typeOptions += `<option value="${t.value}" ${selected}>${label}</option>`;
    });

    return `
        <form id="appointmentForm" onsubmit="handleAppointmentSubmit(event, ${isEdit ? data.id : 'null'})">
            <!-- Patient Info Section -->
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-user"></i>
                    ${txt.patientInfo}
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.patientName} <span class="required">*</span></label>
                        <select class="form-select" name="patientId" id="patientId" required>
                            ${patientOptions}
                        </select>
                        <div style="position: relative; margin-top: 0.5rem;">
                            <input type="text" class="form-input" id="patientSearchInput" placeholder="${txt.searchPatient}" oninput="filterPatients(this.value)" onfocus="filterPatients(this.value)">
                            <div id="patientSearchResults" class="patient-search-dropdown" style="display: none;"></div>
                        </div>
                        <small class="form-helper" style="display: block; margin-top: 0.25rem; color: #666; font-size: 0.85rem;">
                            ${txt.searchHelper}
                        </small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.provider} <span class="required">*</span></label>
                        <select class="form-select" name="providerId" id="providerId" required>
                            ${providerOptions}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.treatmentCategory}</label>
                        <select class="form-select" name="treatmentCategory" id="treatmentCategory">
                            ${treatmentOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.roomNum}</label>
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
                    ${txt.appointmentInfo}
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.appointmentTitle}</label>
                        <input type="text" class="form-input" name="title" id="title" placeholder="${txt.eventTitle}" value="${data ? data.title : ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.date}</label>
                        <input type="date" class="form-input" name="appointmentDate" id="appointmentDate" value="${dateValue}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.startTime}</label>
                        <input type="time" class="form-input" name="startTime" id="startTime" value="${data ? data.dateStart.split(' ')[1] : '09:00'}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">${txt.endTime}</label>
                        <input type="time" class="form-input" name="endTime" id="endTime" value="${data ? data.dateEnd.split(' ')[1] : '10:00'}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">${txt.type}</label>
                        <select class="form-select" name="type" id="appointmentType">
                            ${typeOptions}
                        </select>
                    </div>
                    <div class="form-group"></div>
                </div>
                <div class="form-row single">
                    <div class="form-group">
                        <label class="form-label">${txt.notes}</label>
                        <textarea class="form-textarea" name="notes" id="notes" placeholder="${txt.additionalNotes}">${data ? data.notes : ''}</textarea>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()">
                    ${txt.cancel}
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    ${isEdit ? txt.update : txt.create}
                </button>
            </div>
        </form>
    `;
}

/**
 * Generate Enhanced Appointment Form HTML (for quick book from timeline)
 * @param {Object} prefillData - Pre-filled data from timeline slot
 * @param {string} lang - Current language ('en' or 'kh')
 * @param {Array} patients - Array of patient objects
 * @param {Array} treatments - Array of treatment category objects
 * @param {Array} types - Array of appointment type objects
 * @param {Array} roomList - Array of room objects
 * @param {Object} translationsObj - Translations object with daysFull and months
 * @returns {string} - HTML string for enhanced appointment form
 */
function getEnhancedAppointmentFormTemplate(prefillData, lang, patients, treatments, types, roomList, translationsObj) {
    lang = lang || 'en';
    patients = patients || [];
    treatments = treatments || [];
    types = types || [];
    roomList = roomList || [];
    
    const { providerId, providerName, providerColor, dateKey, startTime, endTime } = prefillData;
    const date = new Date(dateKey);
    
    const daysFull = translationsObj?.[lang]?.daysFull || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = translationsObj?.[lang]?.months || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = daysFull[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    const yearNum = date.getFullYear();
    const dateDisplay = `${dayName}, ${dayNum} ${monthName} ${yearNum}`;

    const t = {
        en: {
            bookingInfo: 'Booking Info',
            provider: 'Provider:',
            date: 'Date:',
            time: 'Time:',
            patient: 'Patient',
            treatment: 'Treatment',
            category: 'Category',
            room: 'Room',
            timeLabel: 'Time',
            type: 'Type',
            title: 'Title',
            notes: 'Notes',
            selectPatient: '---Select Patient---',
            select: '---Select---',
            cancel: 'Cancel',
            book: 'Book'
        },
        kh: {
            bookingInfo: 'ព័ត៌មាន',
            provider: 'អ្នកផ្តល់សេវា:',
            date: 'កាលបរិច្ឆេទ:',
            time: 'ម៉ោង:',
            patient: 'អ្នកជំងឺ',
            treatment: 'ព្យាបាល',
            category: 'ប្រភេទ',
            room: 'បន្ទប់',
            timeLabel: 'ម៉ោង',
            type: 'ប្រភេទ',
            title: 'ចំណងជើង',
            notes: 'កំណត់ចំណាំ',
            selectPatient: '---ជ្រើសអ្នកជំងឺ---',
            select: '---ជ្រើស---',
            cancel: 'បោះបង់',
            book: 'កក់'
        }
    };
    const txt = t[lang] || t.en;

    let patientOptions = `<option value="">${txt.selectPatient}</option>`;
    patients.forEach(p => patientOptions += `<option value="${p.id}">${p.name}</option>`);

    let treatmentOptions = `<option value="">${txt.select}</option>`;
    treatments.forEach(t => {
        const label = lang === 'en' ? t.label : (t.labelKh || t.label);
        treatmentOptions += `<option value="${t.value}">${label}</option>`;
    });

    let roomOptions = `<option value="">${txt.select}</option>`;
    roomList.forEach(r => roomOptions += `<option value="${r.id}">${r.name}</option>`);

    let typeOptions = '';
    types.forEach(t => {
        const selected = t.value === 'scheduled' ? 'selected' : '';
        const label = lang === 'en' ? t.label : (t.labelKh || t.label);
        typeOptions += `<option value="${t.value}" ${selected}>${label}</option>`;
    });

    return `
        <form id="appointmentForm" onsubmit="handleEnhancedAppointmentSubmit(event)">
            <div id="conflictWarning" style="display:none;"></div>
            <div class="prefilled-info-box">
                <div class="prefilled-header"><i class="fas fa-info-circle"></i><span>${txt.bookingInfo}</span></div>
                <div class="prefilled-details">
                    <div class="prefilled-item"><i class="fas fa-user-md" style="color:${providerColor}"></i><strong>${txt.provider}</strong><span class="prefilled-value">${providerName}</span></div>
                    <div class="prefilled-item"><i class="fas fa-calendar-day"></i><strong>${txt.date}</strong><span class="prefilled-value">${dateDisplay}</span></div>
                    <div class="prefilled-item"><i class="fas fa-clock"></i><strong>${txt.time}</strong><span class="prefilled-value">${startTime}-${endTime}</span><button type="button" class="btn-unlock" onclick="unlockTimeFields()"><i class="fas fa-lock"></i></button></div>
                </div>
            </div>
            <input type="hidden" name="providerId" id="providerId" value="${providerId}">
            <input type="hidden" name="appointmentDate" id="appointmentDate" value="${dateKey}">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-user"></i>${txt.patient}<span class="required">*</span></div>
                <div class="form-row single"><div class="form-group"><select class="form-select" name="patientId" id="patientId" required autofocus>${patientOptions}</select></div></div>
            </div>
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-tooth"></i>${txt.treatment}</div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">${txt.category}</label><select class="form-select" name="treatmentCategory" id="treatmentCategory">${treatmentOptions}</select></div>
                    <div class="form-group"><label class="form-label">${txt.room}</label><select class="form-select" name="roomNumber" id="roomNumber">${roomOptions}</select></div>
                </div>
            </div>
            <div class="form-section form-section-collapsed" id="timeAdjustSection">
                <div class="form-section-title"><i class="fas fa-clock"></i>${txt.timeLabel}<span class="section-badge">Locked</span></div>
                <div class="form-row">
                    <div class="form-group"><input type="time" class="form-input" name="startTime" id="startTime" value="${startTime}" disabled></div>
                    <div class="form-group"><input type="time" class="form-input" name="endTime" id="endTime" value="${endTime}" disabled></div>
                </div>
            </div>
            <div class="form-section">
                <div class="form-row">
                    <div class="form-group"><label class="form-label">${txt.type}</label><select class="form-select" name="type" id="appointmentType">${typeOptions}</select></div>
                    <div class="form-group"><label class="form-label">${txt.title}</label><input type="text" class="form-input" name="title" id="title"></div>
                </div>
                <div class="form-row single"><div class="form-group"><label class="form-label">${txt.notes}</label><textarea class="form-textarea" name="notes" id="notes"></textarea></div></div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeSlidePanel()"><i class="fas fa-times"></i>${txt.cancel}</button>
                <button type="submit" class="btn btn-primary"><i class="fas fa-check-circle"></i>${txt.book}</button>
            </div>
        </form>
    `;
}
