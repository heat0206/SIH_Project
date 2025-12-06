import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, writeBatch, doc, setDoc } from 'firebase/firestore';
import { ASER_DATA } from '../utils/aserData';

const DISTRICTS = [...new Set(ASER_DATA.schools.map(school => school.district))];

export const getDistricts = () => DISTRICTS;

// Seed Data Function
export const seedDatabase = async () => {
    const batch = writeBatch(db);
    const schoolsCollection = collection(db, 'schools');
    const schoolsData = ASER_DATA.schools;

    console.log(`Seeding ${schoolsData.length} schools from ASER data...`);

    for (const school of schoolsData) {
        const schoolRef = doc(schoolsCollection); // Auto-ID

        // Generate daily attendance trend (last 7 days) based on avgAttendance
        const attendanceLog = {};
        const today = new Date();
        for (let d = 0; d < 7; d++) {
            const date = new Date(today);
            date.setDate(date.getDate() - d);
            const dateStr = date.toISOString().split('T')[0];
            // Add some random variance to daily attendance
            const dailyVariance = (Math.random() * 10 - 5);
            const dailyVal = Math.min(100, Math.max(0, school.avgAttendance + dailyVariance)).toFixed(1);
            attendanceLog[dateStr] = dailyVal;
        }

        batch.set(schoolRef, {
            name: school.name,
            district: school.district,
            totalEnrolled: school.totalEnrolled,
            avgAttendance: school.avgAttendance,
            principal: school.principal,
            teachers: school.teachers,
            infrastructure: school.infrastructure,
            attendanceLog: attendanceLog,
            lastUpdated: new Date()
        });
    }

    await batch.commit();
    console.log("Database seeded successfully with ASER data!");
};

export const getDistrictStats = async (district) => {
    try {
        const q = query(collection(db, 'schools'), where('district', '==', district));
        const snapshot = await getDocs(q);

        let totalEnrolled = 0;
        let totalAvgAttendance = 0;
        let schoolCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            totalEnrolled += data.totalEnrolled || 0;
            totalAvgAttendance += data.avgAttendance || 0;
            schoolCount++;
        });

        const overallAvg = schoolCount > 0 ? (totalAvgAttendance / schoolCount).toFixed(1) : 0;
        const totalPresent = Math.floor(totalEnrolled * (overallAvg / 100));

        return {
            activeSchools: schoolCount,
            avgAttendance: overallAvg,
            totalEnrolled: totalEnrolled,
            totalPresent: totalPresent,
            mealsSaved: totalEnrolled - totalPresent,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error("Error fetching district stats:", error);
        return null;
    }
};

export const getSchoolTrends = async (district) => {
    try {
        const q = query(collection(db, 'schools'), where('district', '==', district));
        const snapshot = await getDocs(q);

        const dailyTotals = {}; // date -> {sum: 0, count: 0}

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.attendanceLog) {
                Object.entries(data.attendanceLog).forEach(([date, val]) => {
                    if (!dailyTotals[date]) dailyTotals[date] = { sum: 0, count: 0 };
                    dailyTotals[date].sum += parseFloat(val);
                    dailyTotals[date].count++;
                });
            }
        });

        const labels = [];
        const data = [];
        // Sort dates
        const sortedDates = Object.keys(dailyTotals).sort();

        sortedDates.forEach(date => {
            const dayData = dailyTotals[date];
            labels.push(new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }));
            data.push((dayData.sum / dayData.count).toFixed(1));
        });

        return { labels, data };
    } catch (error) {
        console.error("Error fetching trends:", error);
        return { labels: [], data: [] };
    }
};

export const getGhostSchools = async (district) => {
    try {
        // Define ghost school as attendance < 50%
        const q = query(collection(db, 'schools'), where('district', '==', district));
        const snapshot = await getDocs(q);

        const ghosts = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.avgAttendance < 50) {
                ghosts.push({
                    id: doc.id,
                    name: data.name,
                    attendance: data.avgAttendance,
                    principal: data.principal,
                    status: data.avgAttendance < 30 ? 'Critical' : 'Warning'
                });
            }
        });
        return ghosts;
    } catch (error) {
        console.error("Error fetching ghost schools:", error);
        return [];
    }
};

export const getTeacherStats = async (district) => {
    try {
        const q = query(collection(db, 'schools'), where('district', '==', district));
        const snapshot = await getDocs(q);

        const stats = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.teachers) {
                Object.entries(data.teachers).forEach(([subj, count]) => {
                    stats[subj] = (stats[subj] || 0) + count;
                });
            }
        });
        return stats;
    } catch (error) {
        console.error("Error fetching teacher stats:", error);
        return {};
    }
};

export const addSchool = async (schoolData) => {
    try {
        const schoolsCollection = collection(db, 'schools');
        await addDoc(schoolsCollection, {
            ...schoolData,
            lastUpdated: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding school:", error);
        return { success: false, error };
    }
};

export const updateSchool = async (schoolId, updateData) => {
    try {
        const schoolRef = doc(db, 'schools', schoolId);
        await setDoc(schoolRef, {
            ...updateData,
            lastUpdated: new Date()
        }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Error updating school:", error);
        return { success: false, error };
    }
};

export const getAIInsight = (district) => {
    // Keep mock for now or simple heuristic
    const drop = (Math.random() * 15 + 5).toFixed(1);
    return {
        type: 'warning',
        message: `Attendance in ${district} dropped ${drop}% compared to yesterday. Potential cause: Local Festival/Weather.`
    };
};
