// Wait for the HTML document to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {

  // --- Sample Data ---
  // In a real application, you would fetch this data from a server.
  const attendanceData = [
    { class: 'Class VI - B', percentage: 95.5 },
    { class: 'Class VIII - A', percentage: 88.0 },
    { class: 'Class X - A', percentage: 85.1 },
    { class: 'Class XI - B', percentage: 98.2 }
  ];

  // Prepare the data for Chart.js
  const classLabels = attendanceData.map(item => item.class); // X-axis labels
  const attendancePercentages = attendanceData.map(item => item.percentage); // Y-axis values

  // Get the canvas element from the HTML
  const ctx = document.getElementById('attendanceChart').getContext('2d');

  // --- Create the Chart ---
  const attendanceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: classLabels,
      datasets: [{
        label: 'Attendance Percentage',
        data: attendancePercentages,
        backgroundColor: [
          'rgba(79, 70, 229, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(255, 205, 86, 0.85)',
          'rgba(255, 99, 132, 0.85)'
        ],
        borderRadius: { topLeft: 5, topRight: 5, bottomLeft: 0, bottomRight: 0 }, // Rounded top only
        borderSkipped: false,
        borderWidth: 0,
        hoverBackgroundColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        barPercentage: 0.7,
        categoryPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 24
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: '#e5e7eb',
            borderDash: [4, 4]
          },
          title: {
            display: true,
            text: 'Attendance Percentage (%)',
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#232946'
          },
          ticks: {
            color: '#232946',
            font: {
              size: 13,
              weight: 'bold'
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'Class',
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#232946'
          },
          ticks: {
            color: '#232946',
            font: {
              size: 13,
              weight: 'bold'
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#232946',
          titleColor: '#eebbc3',
          bodyColor: '#fff',
          borderColor: '#eebbc3',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `Attendance: ${context.parsed.y}%`;
            }
          }
        },
        title: {
          display: true,
          text: 'Class-wise Attendance Report',
          font: {
            size: 20,
            weight: 'bold'
          },
          color: '#232946',
          padding: {
            top: 10,
            bottom: 20
          }
        }
      },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      }
    }
  });
});