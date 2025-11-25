// Recent attendance scans data
const recentScansData = [
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

// Function to update the recent scans section
function updateRecentScans() {
    const container = document.getElementById('recentScansContainer');
    if (!container) {
        console.warn('Recent scans container not found');
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Add each scan to the container
    recentScansData.forEach(scan => {
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', updateRecentScans);