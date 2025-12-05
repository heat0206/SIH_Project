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

const GHOST_SCHOOLS_DATA = {
    'Varanasi': [
        { id: 'SCH-VAR-001', name: 'Govt Primary School, Shivpur', attendance: '12.5', principal: 'Mr. R.K. Gupta', status: 'Critical' },
        { id: 'SCH-VAR-089', name: 'Upper Primary School, Sarnath', attendance: '28.3', principal: 'Mrs. S. Singh', status: 'Critical' },
        { id: 'SCH-VAR-112', name: 'Kanya Vidyalaya, Lanka', attendance: '41.0', principal: 'Mr. A. Pandey', status: 'Warning' }
    ],
    'Lucknow': [
        { id: 'SCH-LKO-202', name: 'Nagar Nigam School, Alambagh', attendance: '15.2', principal: 'Mr. V. Verma', status: 'Critical' },
        { id: 'SCH-LKO-331', name: 'Primary School, Gomti Nagar', attendance: '35.6', principal: 'Mrs. P. Sharma', status: 'Warning' }
    ],
    'Kanpur': [
        { id: 'SCH-KNP-554', name: 'Govt High School, Kalyanpur', attendance: '9.8', principal: 'Mr. S. Yadav', status: 'Critical' },
        { id: 'SCH-KNP-101', name: 'Balika Vidyalaya, Civil Lines', attendance: '45.2', principal: 'Mrs. K. Dixit', status: 'Warning' },
        { id: 'SCH-KNP-772', name: 'Primary Pathshala, Govind Nagar', attendance: '22.1', principal: 'Mr. M. Khan', status: 'Critical' },
        { id: 'SCH-KNP-883', name: 'Adarsh Vidyalaya, Panki', attendance: '31.4', principal: 'Mr. J. Singh', status: 'Warning' }
    ],
    'Prayagraj': [
        { id: 'SCH-PRY-005', name: 'Sangam Primary School', attendance: '18.5', principal: 'Mr. T. Tripathi', status: 'Critical' }
    ],
    'Gorakhpur': [
        { id: 'SCH-GKP-991', name: 'Railway Colony School', attendance: '25.0', principal: 'Mr. B. Lal', status: 'Critical' },
        { id: 'SCH-GKP-442', name: 'City Montessori (Govt Wing)', attendance: '38.9', principal: 'Mrs. R. Devi', status: 'Warning' }
    ]
};

export const getGhostSchools = (district) => {
    return GHOST_SCHOOLS_DATA[district] || [];
};

export const getAIInsight = (district) => {
    const drop = (Math.random() * 15 + 5).toFixed(1);
    return {
        type: 'warning',
        message: `Attendance in ${district} dropped ${drop}% compared to yesterday. Potential cause: Local Festival/Weather.`
    };
};
