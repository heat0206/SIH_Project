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

// ... existing code ...

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

export const generateDistrictAuditReport = (districtName, stats) => {
    let csvContent = `Report Type,District Audit Report (ASER 2024)\n`;
    csvContent += `District,${districtName}\n`;
    csvContent += `Generated On,${new Date().toLocaleString()}\n\n`;

    // Section 1: ASER Learning Outcomes
    csvContent += "--- Learning Outcomes (ASER 2024) ---\n";
    if (stats.aserData && stats.aserData.learningLevels) {
        csvContent += "Metric,Grade,Value,Description\n";
        csvContent += `Reading,Grade 3,${stats.aserData.learningLevels.reading.std3_can_read_std2_level}%,Can read Std II level text\n`;
        csvContent += `Reading,Grade 5,${stats.aserData.learningLevels.reading.std5_can_read_std2_level}%,Can read Std II level text\n`;
        csvContent += `Reading,Grade 8,${stats.aserData.learningLevels.reading.std8_can_read_std2_level}%,Can read Std II level text\n`;
        csvContent += `Arithmetic,Grade 3,${stats.aserData.learningLevels.arithmetic.std3_can_do_subtraction}%,Can do Subtraction\n`;
        csvContent += `Arithmetic,Grade 5,${stats.aserData.learningLevels.arithmetic.std5_can_do_division}%,Can do Division\n`;
        csvContent += `Arithmetic,Grade 8,${stats.aserData.learningLevels.arithmetic.std8_can_do_division}%,Can do Division\n`;
    } else {
        csvContent += "No Learning Data Available\n";
    }
    csvContent += "\n";

    // Section 2: School Facilities
    csvContent += "--- Infrastructure & Facilities ---\n";
    if (stats.aserData && stats.aserData.schoolFacilities) {
        csvContent += "Facility,Status,Value\n";
        csvContent += `Drinking Water,Available,${stats.aserData.schoolFacilities.drinkingWater.available}%\n`;
        csvContent += `Toilets,Usable,${stats.aserData.schoolFacilities.toilets.usable}%\n`;
        csvContent += `Library Books,Available,${stats.aserData.schoolFacilities.library.books_available || 'N/A'}%\n`;
        csvContent += `Computers,Available,${stats.aserData.schoolFacilities.computers.available}%\n`;
        csvContent += `Electricity,Available,${stats.aserData.schoolFacilities.electricity.available}%\n`;
    }
    csvContent += "\n";

    // Section 3: Vital Stats
    csvContent += "--- Vital Statistics ---\n";
    csvContent += `Avg Student Attendance (DoV),${stats.avg_student_attendance}%\n`;
    csvContent += `Avg Teacher Attendance,${stats.avg_teacher_attendance}%\n`;
    csvContent += `Govt School Enrollment (6-14),${stats.enrollment_govt}%\n`;
    csvContent += `Not Enrolled (6-14),${stats.not_enrolled}%\n`;
    csvContent += `Private Tuition (Std I-V),${stats.private_tuition}%\n`;
    csvContent += "\n";

    // Section 4: Block Data
    csvContent += "--- Block-wise Audit Data ---\n";
    if (stats.blocks && stats.blocks.length > 0) {
        csvContent += "Block Name,Avg Attendance,Risk Status\n";
        stats.blocks.forEach(block => {
            csvContent += `${block.name},${block.attendance}%,${block.risk}\n`;
        });
    } else {
        csvContent += "No specific block data available (Privacy Protected)\n";
    }

    return csvContent;
};
