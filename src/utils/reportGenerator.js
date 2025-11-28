/**
 * Utility to generate and download CSV reports.
 */

export const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const generateMasterComplianceReport = (teachers, classes) => {
    // Headers
    let csvContent = "Report Type,Master Compliance Report\n";
    csvContent += `Generated On,${new Date().toLocaleString()}\n\n`;

    // Section 1: Class Statistics
    csvContent += "--- Class Statistics ---\n";
    csvContent += "Class Name,Assigned Teacher,Total Students,Average Attendance,MDM Status\n";

    classes.forEach(cls => {
        const teacher = teachers.find(t => t.id === cls.teacherId);
        const teacherName = teacher ? teacher.name : "Unassigned";
        // Mock data for stats as we don't have real-time stats in this context yet
        const totalStudents = Math.floor(Math.random() * 20) + 30;
        const avgAttendance = (Math.random() * 15 + 80).toFixed(1) + "%";
        const mdmStatus = Math.random() > 0.1 ? "Served" : "Pending";

        csvContent += `${cls.name},${teacherName},${totalStudents},${avgAttendance},${mdmStatus}\n`;
    });

    csvContent += "\n";

    // Section 2: Teacher Attendance (Mock)
    csvContent += "--- Teacher Attendance Summary ---\n";
    csvContent += "Teacher Name,ID,Status,Last Check-in\n";

    teachers.forEach(t => {
        const status = Math.random() > 0.1 ? "Present" : "Absent";
        const checkIn = status === "Present" ? "08:15 AM" : "-";
        csvContent += `${t.name},${t.id},${status},${checkIn}\n`;
    });

    return csvContent;
};

export const generateClassRegisterReport = (students, className) => {
    let csvContent = "Report Type,Class Register Download\n";
    csvContent += `Class,${className}\n`;
    csvContent += `Date,${new Date().toLocaleDateString()}\n\n`;

    csvContent += "Roll No,Student Name,ID,Status,Verification Method\n";

    students.forEach(s => {
        const status = s.present ? "Present" : "Absent";
        const verification = s.present ? (s.verificationMethod || "Manual") : "-";
        csvContent += `${s.roll},${s.name},${s.rfid_tag || "N/A"},${status},${verification}\n`;
    });

    return csvContent;
};
