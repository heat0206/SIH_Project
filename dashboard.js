// Dashboard functionality
// Recent attendance scans data
const recentScans = [
  {
      name: "Ankit Sharma",
      rollNo: "2023045",
      status: "present",
      time: "10:30 AM",
      class: "VI-B"
  },
  {
      name: "Meera Patel",
      rollNo: "2023038",
      status: "present",
      time: "10:32 AM",
      class: "VIII-A"
  },
  {
      name: "Raj Kumar",
      rollNo: "2023040",
      status: "absent",
      time: "10:35 AM",
      class: "X-A"
  },
  {
      name: "Priya Singh",
      rollNo: "2023035",
      status: "present",
      time: "10:38 AM",
      class: "XI-B"
  },
  {
      name: "Arun Verma",
      rollNo: "2023042",
      status: "present",
      time: "10:40 AM",
      class: "VI-B"
  }
];

(function() {
  'use strict';

  // Date picker functionality
  function initializeDatePicker() {
    const datePicker = document.getElementById('datePicker');
    const dateDisplay = document.getElementById('dateDisplay');
    
    if (!datePicker || !dateDisplay) {
      console.warn('Date picker or display element not found');
      return;
    }
    
    // Set today's date as default
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    datePicker.value = todayString;
    
    // Format date as "Day Month Year" for display
    function formatDateForDisplay(dateString) {
      const date = new Date(dateString);
      const options = { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    }
    
    // Update display when date changes
    function updateDateDisplay() {
      const selectedDate = datePicker.value;
      if (selectedDate) {
        // Update the display text
        dateDisplay.textContent = formatDateForDisplay(selectedDate);
        
        console.log('Selected date:', selectedDate);
        
        // Here you would typically load attendance data for the selected date
        // loadAttendanceForDate(selectedDate);
        
        // You could also update the page title or other UI elements
        updatePageTitle(selectedDate);
      }
    }
    
    // Update page title with selected date
    function updatePageTitle(dateString) {
      const date = new Date(dateString);
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const formattedDate = date.toLocaleDateString('en-US', options);
      
      // Update page title if needed
      document.title = `Attendance Dashboard - ${formattedDate}`;
    }
    
    // Add event listener for date changes
    datePicker.addEventListener('change', updateDateDisplay);
    
    // Initialize with today's date
    updateDateDisplay();
  }

  // Function to update the recent scans section
  async function updateRecentScans() {
    const container = document.getElementById('recentScansContainer');
    if (!container) {
      console.warn('Recent scans container not found');
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Add each scan to the container
    recentScans.forEach(scan => {
      const row = document.createElement('div');
      row.className = 'student-row';
      
      row.innerHTML = `
        <div class="student-info">
          <div class="student-name">${scan.name}</div>
          <div class="student-roll">Roll No: ${scan.rollNo} | Class: ${scan.class}</div>
        </div>
        <div class="scan-info">
          <div class="scan-time">${scan.time}</div>
          <div class="status-chip status-${scan.status}">
            ${scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
          </div>
        </div>
      `;
      
      container.appendChild(row);
    });
  }

  // Initialize dashboard when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initializeDatePicker();
    updateRecentScans(); // Initialize recent scans
    console.log('Dashboard initialized');
  });

  // Export functions for external use if needed
  window.Dashboard = {
    initializeDatePicker: initializeDatePicker,
    updateRecentScans: updateRecentScans
  };

  // Recent attendance scans data matched with classes
  const recentScans = [
    {
        name: "Ankit Sharma",
        rollNo: "2023045",
        status: "present",
        time: "10:30 AM",
        class: "VI-B"
    },
    {
        name: "Meera Patel",
        rollNo: "2023038",
        status: "present",
        time: "10:32 AM",
        class: "VIII-A"
    },
    {
        name: "Raj Kumar",
        rollNo: "2023040",
        status: "absent",
        time: "10:35 AM",
        class: "X-A"
    },
    {
        name: "Priya Singh",
        rollNo: "2023035",
        status: "present",
        time: "10:38 AM",
        class: "XI-B"
    },
    {
        name: "Arun Verma",
        rollNo: "2023042",
        status: "present",
        time: "10:40 AM",
        class: "VI-B"
    }
        rollNo: "2023040",
        status: "absent",
        time: "10:35 AM",
        class: "X-A"
    },
    {
        name: "Priya Singh",
        rollNo: "2023035",
        status: "present",
        time: "10:38 AM",
        class: "XI-B"
    },
    {
        name: "Arun Verma",
        rollNo: "2023042",
        status: "present",
        time: "10:40 AM",
        class: "VI-B"
    }
  ];

  // Function to update the recent scans section with i18n support
  async function updateRecentScans(lang = 'en') {
    const container = document.getElementById('recentScansContainer');
    if (!container) return;

    // Load language file
    const response = await fetch(`languages/${lang}.json`);
    const translations = await response.json();

    // Update section title
    const sectionTitle = document.getElementById('recentScansTitle');
    if (sectionTitle) {
        sectionTitle.textContent = translations.recentScans.title;
    }

    // Clear existing content
    container.innerHTML = '';

    // Add each scan to the container
    recentScans.forEach(scan => {
        const row = document.createElement('div');
        row.className = 'student-row';
        
        row.innerHTML = `
            <div class="student-info">
                <div class="student-name">${scan.name}</div>
                <div class="student-roll">${translations.recentScans.rollNo}: ${scan.rollNo} | ${translations.recentScans.class}: ${scan.class}</div>
            </div>
            <div class="scan-info">
                <div class="scan-time">${translations.recentScans.time}: ${scan.time}</div>
                <div class="status-chip status-${scan.status}">
                    ${translations[scan.status]}
                </div>
            </div>
        `;
        
        container.appendChild(row);
    });
  }

  // Class cards data with bilingual support
const classData = [
    {
        id: "VIB",
        nameEn: "Class VI-B",
        nameHi: "कक्षा VI-B",
        total: 45,
        present: 42,
        absent: 3
    },
    {
        id: "VIIIA",
        nameEn: "Class VIII-A",
        nameHi: "कक्षा VIII-A",
        total: 48,
        present: 45,
        absent: 3
    },
    {
        id: "XA",
        nameEn: "Class X-A",
        nameHi: "कक्षा X-A",
        total: 50,
        present: 47,
        absent: 3
    },
    {
        id: "XIB",
        nameEn: "Class XI-B",
        nameHi: "कक्षा XI-B",
        total: 46,
        present: 43,
        absent: 3
    }
];

// Function to update class cards with language support
async function updateClassCards(lang = 'en') {
    const container = document.querySelector('.class-list');
    if (!container) return;

    const response = await fetch(`languages/${lang}.json`);
    const translations = await response.json();

    container.innerHTML = classData.map(cls => `
        <div class="class-card attendance-marked">
            <div class="class-info">
                <h3>${lang === 'en' ? cls.nameEn : cls.nameHi}</h3>
                <div class="attendance-stats">
                    <span>${translations.totalStudentsLabel}: ${cls.total}</span>
                    <span>${translations.presentLabel}: ${cls.present}</span>
                    <span>${translations.absentLabel}: ${cls.absent}</span>
                </div>
                <div class="status-indicator">
                    <span class="status-text">${translations.statusMarkedLabel}</span>
                </div>
            </div>
            <a href="view-edit.html?class=${cls.id}" class="view-edit-btn">${translations.viewEditLink}</a>
        </div>
    `).join('');
}

// Update the language switch handler
function handleLanguageSwitch(lang) {
    updateClassCards(lang);
    updateRecentScans(lang);
    updateDateDisplay(lang);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDatePicker();
    updateClassCards('en');
    updateRecentScans('en');
    
    // Add language switch event listeners
    document.querySelectorAll('.lang-switch a').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = btn.dataset.lang;
            handleLanguageSwitch(lang);
        });
    });
});

})();