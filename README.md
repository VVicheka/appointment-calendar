# Appointment Calendar

A modern web-based appointment calendar system for dental/medical clinics, featuring Khmer lunar calendar support and JSON-based data management.

## Features
- **Multiple Views**: Calendar, Timeline, and Dashboard views
- **Khmer Lunar Calendar**: Uses the [momentkh](https://github.com/ThyrithSor/momentkh) library for accurate Khmer lunar dates
- **JSON Data Loading**: Load appointments from external JSON file with localStorage backup
- **Dashboard Analytics**: Real-time statistics, provider status, and patient queue
- **Appointment Management**: Add, edit, and view appointments with patient, provider, treatment, room, and notes
- **Doctor Color Coding**: Each provider/doctor is color-coded for easy identification
- **Smart Filters**: Filter appointments by type, provider, and date
- **Slide Panel Forms**: All forms open in a slide-in panel for a seamless experience
- **No Backend Required**: 100% static HTML/CSS/JS, no server needed

## Data Loading System

### Dual-Layer Architecture
1. **Primary Source**: `appointments.json` file
   - Loads on startup
   - Easy to edit and maintain
   - Perfect for bulk updates

2. **Fallback**: localStorage
   - Used when JSON file is unavailable
   - Persists user changes
   - Works offline

### How It Works
```
App Start → Load appointments.json → Save to localStorage → Initialize Calendar
            ↓ (if fails)
            Load from localStorage → Initialize Calendar
```

## Updating Data

### Edit JSON File
1. Open `appointments.json`
2. Modify the appointments or payments array
3. Refresh the browser
4. Changes load automatically

### Export Current Data
Open browser console (F12) and run:
```javascript
console.log(JSON.stringify({
  appointments: appointments,
  payments: payments
}, null, 2));
```

## JSON Structure

```json
{
  "appointments": [
    {
      "id": 1,
      "patientId": 1,
      "patientName": "Patient Name",
      "providerId": 1,
      "providerName": "Dr. Name",
      "treatmentCategory": "consultation",
      "roomNumber": 1,
      "title": "Appointment Title",
      "dateStart": "2026-02-04 08:00",
      "dateEnd": "2026-02-04 08:30",
      "type": "scheduled",
      "notes": "Notes here"
    }
  ],
  "payments": []
}
```

## Appointment Types
- `scheduled` - Confirmed appointment
- `arrived` - Patient checked in
- `ready` - Ready to see doctor
- `in-treatment` - Currently being treated
- `completed` - Treatment finished
- `needs-followup` - Requires follow-up appointment
- `walk-in` - Walk-in patient
- `no-show` - Patient didn't show
- `cancelled` - Cancelled appointment

## Setup
1. Open `index.html` in your browser
2. Data loads from `appointments.json`
3. Start managing appointments!

## Libraries Used
- [momentkh](https://github.com/ThyrithSor/momentkh) - Khmer lunar calendar
- [Bootstrap 5](https://getbootstrap.com/) - UI framework
- [Font Awesome 6](https://fontawesome.com/) - Icons
- [jQuery 3](https://jquery.com/) - DOM manipulation
- [Kantumruy Pro](https://fonts.google.com/specimen/Kantumruy+Pro) - Khmer font

## Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Requires localStorage and fetch API support

---

© 2026 Ecodent. All rights reserved.