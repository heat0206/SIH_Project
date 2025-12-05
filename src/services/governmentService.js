// Mock Data Service for Government Dashboard

const DISTRICTS = ['Varanasi', 'Lucknow', 'Kanpur', 'Prayagraj', 'Gorakhpur'];

const generateRandomStats = (baseAttendance) => {
    const variance = Math.random() * 10 - 5; // +/- 5%
    return Math.min(100, Math.max(0, baseAttendance + variance)).toFixed(1);
};

export const getDistricts = () => DISTRICTS;

export const getDistrictStats = (district) => {
    // Simulate API call
    const schoolCount = Math.floor(Math.random() * 50) + 20; // 20-70 schools
    const avgAttendance = generateRandomStats(75); // ~75% avg
    const totalEnrolled = schoolCount * 400; // ~400 students per school
    const totalPresent = Math.floor(totalEnrolled * (avgAttendance / 100));
    const mealsSaved = totalEnrolled - totalPresent;

    return {
        activeSchools: schoolCount,
        avgAttendance: avgAttendance,
        totalEnrolled: totalEnrolled,
        totalPresent: totalPresent,
        mealsSaved: mealsSaved,
        lastUpdated: new Date().toISOString()
    };
};

export const getSchoolTrends = (district) => {
    // Generate 7 days of data
    const labels = [];
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        labels.push(d.toLocaleDateString('en-IN', { weekday: 'short' }));
        data.push(generateRandomStats(70 + Math.random() * 10));
    }

    return { labels, data };
};

export const getGhostSchools = (district) => {
    // Generate 3-5 "Ghost Schools" with low attendance
    const count = Math.floor(Math.random() * 3) + 1;
    const schools = [];

    for (let i = 0; i < count; i++) {
        schools.push({
            id: `SCH-${Math.floor(Math.random() * 10000)}`,
            name: `Govt Primary School ${String.fromCharCode(65 + i)} - ${district}`,
            attendance: (Math.random() * 40 + 10).toFixed(1), // 10-50%
            principal: "Mr. " + (Math.random() > 0.5 ? "Sharma" : "Verma"),
            status: "Critical"
        });
    }
    return schools;
};

export const getAIInsight = (district) => {
    const drop = (Math.random() * 15 + 5).toFixed(1);
    return {
        type: 'warning',
        message: `Attendance in ${district} dropped ${drop}% compared to yesterday. Potential cause: Local Festival/Weather.`
    };
};
