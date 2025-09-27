// Dashboard functionality
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

  // Initialize dashboard when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initializeDatePicker();
    
    // Add any other dashboard initialization here
    console.log('Dashboard initialized');
  });

  // Export functions for external use if needed
  window.Dashboard = {
    initializeDatePicker: initializeDatePicker
  };

})();
