/**
 * Dental Appointment Calendar - Data Module
 * Contains mock data for patients, providers, treatments, and other static data
 */

// Mock data for patients
const mockPatients = [
    { id: 1, name: 'Sokha Meas', phone: '012 345 678', gender: 'male' },
    { id: 2, name: 'Channary Ouk', phone: '077 234 567', gender: 'female' },
    { id: 3, name: 'Visal Keo', phone: '089 456 789', gender: 'male' },
    { id: 4, name: 'Sreymom Pich', phone: '015 678 901', gender: 'female' },
    { id: 5, name: 'Bunthoeun Heng', phone: '096 789 012', gender: 'male' },
    { id: 6, name: 'Socheata Ly', phone: '070 890 123', gender: 'female' },
    { id: 7, name: 'Rithya Noun', phone: '011 901 234', gender: 'male' },
    { id: 8, name: 'Pisey Seng', phone: '078 012 345', gender: 'female' }
];

// Mock data for providers (doctors)
const mockProviders = [
    { id: 1, name: 'Dr. Sopheap Chhorn', specialty: 'General Dentistry', color: '#8b5cf6' },
    { id: 2, name: 'Dr. Veasna Prak', specialty: 'Orthodontics', color: '#ec4899' },
    { id: 3, name: 'Dr. Kosal Mony', specialty: 'Oral Surgery', color: '#14b8a6' },
    { id: 4, name: 'Dr. Sreyleak Tep', specialty: 'Pediatric Dentistry', color: '#f97316' },
    { id: 5, name: 'Dr. Rattanak Soun', specialty: 'Endodontics', color: '#3b82f6' },
    { id: 6, name: 'Dr. Chenda Lim', specialty: 'Periodontics', color: '#10b981' },
    { id: 7, name: 'Dr. Bopha Nhem', specialty: 'Prosthodontics', color: '#f59e0b' },
    { id: 8, name: 'Dr. Dara Chhay', specialty: 'Oral Medicine', color: '#ef4444' },
    { id: 9, name: 'Dr. Sovannak Rath', specialty: 'Cosmetic Dentistry', color: '#06b6d4' },
    { id: 10, name: 'Dr. Sreymom Tan', specialty: 'Dental Implants', color: '#8b5cf6' }
];

// Treatment categories
const treatmentCategories = [
    { value: 'consultation', label: 'Consultation', labelKh: 'ពិគ្រោះ' },
    { value: 'cleaning', label: 'Cleaning', labelKh: 'សម្អាត' },
    { value: 'filling', label: 'Filling', labelKh: 'ចាក់បំពេញ' },
    { value: 'extraction', label: 'Extraction', labelKh: 'ដកធ្មេញ' },
    { value: 'root-canal', label: 'Root Canal', labelKh: 'ព្យាបាលរាករាក' },
    { value: 'crown', label: 'Crown', labelKh: 'គ្រោង' },
    { value: 'regular-checkup', label: 'Regular Checkup', labelKh: 'ពិនិត្យទៀងទាត់' },
    { value: 'other', label: 'Other', labelKh: 'ផ្សេងទៀត' }
];

// Appointment types (statuses)
const appointmentTypes = [
    { value: 'scheduled', label: 'Scheduled', labelKh: 'បានកក់', color: '#3b82f6' },
    { value: 'arrived', label: 'Arrived', labelKh: 'មកដល់', color: '#8b5cf6' },
    { value: 'ready', label: 'Ready to See', labelKh: 'ត្រៀមជួប', color: '#f59e0b' },
    { value: 'in-treatment', label: 'In Treatment', labelKh: 'កំពុងព្យាបាល', color: '#22c55e' },
    { value: 'completed', label: 'Completed', labelKh: 'បញ្ចប់', color: '#10b981' },
    { value: 'needs-followup', label: 'Needs Follow-up', labelKh: 'ត្រូវតាមដាន', color: '#f97316' },
    { value: 'walk-in', label: 'Walk-in', labelKh: 'ដើរចូល', color: '#06b6d4' },
    { value: 'no-show', label: 'No-show', labelKh: 'មិនមក', color: '#6b7280' },
    { value: 'cancelled', label: 'Cancelled', labelKh: 'បោះបង់', color: '#ef4444' }
];

// Rooms
const rooms = [
    { id: 1, name: 'Room 1' },
    { id: 2, name: 'Room 2' },
    { id: 3, name: 'Room 3' },
    { id: 4, name: 'Room 4' },
    { id: 5, name: 'Room 5' }
];

// Treatment-based follow-up rules
const treatmentFollowUpRules = {
    'root-canal': { days: 7, priority: 'urgent', label: 'Root Canal Check' },
    'extraction': { days: 3, priority: 'high', label: 'Post-Extraction Check' },
    'crown': { days: 14, priority: 'normal', label: 'Crown Fitting' },
    'filling': { days: 0, priority: 'none', label: 'No Follow-up' },
    'cleaning': { days: 180, priority: 'low', label: 'Regular Cleaning' },
    'consultation': { days: 0, priority: 'none', label: 'No Follow-up' },
    'regular-checkup': { days: 180, priority: 'low', label: 'Next Checkup' },
    'other': { days: 0, priority: 'none', label: 'As Needed' }
};

// Fixed civil holidays
const fixedHolidayData = {
    '01-01': { en: 'New Year\'s Day', kh: 'ថ្ងៃចូលឆ្នាំសាកល', isRestDay: true },
    '01-07': { en: 'Victory Over Genocide Day', kh: 'ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍', isRestDay: true },
    '03-08': { en: 'International Women\'s Day', kh: 'ទិវាអន្តរជាតិនារី', isRestDay: true },
    '04-07': { en: 'World Health Day', kh: 'ទិវាសុខភាពពិភពលោក', isRestDay: false },
    '04-28': { en: 'World Day for Safety and Health at Work', kh: 'ទិវាពិភពលោកសម្រាប់សុវត្ថិភាព និងសុខភាពការងារ', isRestDay: false },
    '04-30': { en: 'Cambodia joined ASEAN', kh: 'កម្ពុជាចូលរួមជាមួយអាស៊ាន', isRestDay: false },
    '05-01': { en: 'Labour Day', kh: 'ទិវាពលកម្មអន្តរជាតិ', isRestDay: true },
    '06-01': { en: 'Children\'s Day', kh: 'ទិវាកុមារអន្តរជាតិ', isRestDay: true },
    '06-18': { en: 'Queen\'s Birthday', kh: 'ព្រះជន្មព្រះមហាក្សត្រី', isRestDay: true },
    '09-24': { en: 'Constitution Day', kh: 'ទិវារដ្ឋធម្មនុញ្ញ', isRestDay: true },
    '10-15': { en: 'Mourning King Father', kh: 'ប្រារព្ធទុក្ខព្រះបាទ', isRestDay: true },
    '10-29': { en: 'King\'s Birthday', kh: 'ព្រះជន្មព្រះមហាក្សត្រ', isRestDay: true },
    '11-09': { en: 'Independence Day', kh: 'ទិវាឯករាជ្យជាតិ', isRestDay: true }
};

// Sample appointment data (used when no data in localStorage)
function getSampleAppointments() {
    return [
        {
            id: 1,
            patientId: 1,
            patientName: 'Sokha Meas',
            providerId: 1,
            providerName: 'Dr. Sopheap Chhorn',
            treatmentCategory: 'consultation',
            roomNumber: 1,
            title: 'Initial Consultation',
            dateStart: '2026-02-04 08:00',
            dateEnd: '2026-02-04 08:30',
            type: 'scheduled',
            notes: 'New patient registration'
        }
    ];
}
