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

## Project Structure

```
appointment_calendar/
├── index.html              # Main HTML file
├── styles.css              # Original monolithic CSS (preserved)
├── styles-modular.css      # Entry point for modular CSS (uses @import)
├── script.js               # Main application JavaScript
├── appointments.json       # Sample appointment data
├── README.md               # This file
│
├── css/                    # CSS Component Files
│   ├── variables.css       # CSS custom properties (colors, statuses)
│   ├── base.css            # Resets, typography, utility classes
│   ├── header.css          # Header bar, navigation, view toggles
│   ├── calendar.css        # Calendar grid, day cells, appointment pills
│   ├── sidebar.css         # Appointments sidebar, filters
│   ├── forms.css           # Slide panels, form inputs, patient search
│   ├── search.css          # Search box, results dropdown
│   ├── dashboard.css       # Dashboard stats, provider status, activity
│   ├── timeline.css        # Timeline view, provider drawer
│   ├── reports.css         # Daily report, modals
│   ├── notifications.css   # Toast notifications, conflict warnings
│   ├── responsive.css      # Media queries for all screen sizes
│   └── print.css           # Print-specific styles
│
└── js/                     # JavaScript Component Files
    ├── data/
    │   ├── mockData.js     # Mock data (patients, providers, treatments)
    │   └── translations.js # Text translations (English/Khmer)
    ├── utils/
    │   ├── dateUtils.js    # Date formatting and calculations
    │   ├── holidayUtils.js # Holiday and Buddhist calendar functions
    │   └── helpers.js      # General helper functions
    ├── forms/              # Form HTML template generators
    │   ├── formTemplates.js    # Patient, Lab Order, Employee, etc.
    │   ├── appointmentForm.js  # Appointment form templates
    │   └── paymentForm.js      # Payment form template
    └── views/              # (Reserved for view components)
```

## JavaScript Component Architecture

The JavaScript code is now modularized into component files that are loaded before the main script.js:

### Data Components (js/data/)
- **mockData.js**: Contains all mock data including patients, providers, treatment categories, appointment types, rooms, and follow-up rules
- **translations.js**: English and Khmer translations for all UI text

### Utility Components (js/utils/)
- **dateUtils.js**: Date formatting, parsing, and calculation functions
- **holidayUtils.js**: Cambodian holiday calculations and Buddhist calendar integration
- **helpers.js**: General utility functions (notifications, ID generation, etc.)

### Form Components (js/forms/)
- **formTemplates.js**: HTML generators for patient, lab order, employee, prescription, and service forms
- **appointmentForm.js**: Standard and enhanced (timeline quick-book) appointment forms
- **paymentForm.js**: Payment collection form with calculation helpers

### How It Works
1. Component files are loaded before script.js
2. They define global variables and functions
3. script.js checks for external definitions and uses them if available
4. Fallback inline definitions ensure the app works even if component files fail to load

## CSS Component Architecture

The CSS is now modularized using `@import` statements. This approach:
- Works without any build tools or bundler
- Organizes styles by component/feature
- Makes maintenance easier
- Preserves all original styling and functionality

To switch between original and modular CSS, edit `index.html`:
```html
<!-- Use modular CSS (current) -->
<link rel="stylesheet" href="styles-modular.css">

<!-- Or use original monolithic CSS -->
<link rel="stylesheet" href="styles.css">
```

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