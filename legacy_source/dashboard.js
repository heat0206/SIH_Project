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

  // (Removed duplicate recentScans array and duplicate updateRecentScans function)
  // If you want i18n support, rename the first updateRecentScans to updateRecentScansBasic and use only one version.
  // Otherwise, keep only one updateRecentScans function and one recentScans array.

})();