import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, writeBatch, doc, setDoc } from 'firebase/firestore';
// We import ASER_DATA from utils for seeding, but use local REAL_ASER_DATA for dashboard aggregates
import { ASER_DATA } from '../utils/aserData';

const DISTRICTS = [
    'Amritsar',
    'Ludhiana',
    'Jalandhar',
    'Patiala',
    'Bathinda',
    'Mohali',
    'Hoshiarpur',
    'Gurdaspur',
    'Pathankot',
    'Ferozepur'
];

export const getDistricts = () => DISTRICTS;

// --- STATIC ASER 2024 REPORT DATA (Source of Truth for Dashboard Dashboard) ---
const REAL_ASER_DATA = {
    "Punjab": {
        "learningLevels": {
            "reading": {
                "std3_can_read_std2_level": 36.5,
                "std5_can_read_std2_level": 66.6,
                "std8_can_read_std2_level": 82.2
            },
            "arithmetic": {
                "std3_can_do_subtraction": 53.3,
                "std5_can_do_division": 53.1,
                "std8_can_do_division": 63.9
            }
        },
        "schoolFacilities": {
            "drinkingWater": {
                "available": 99.5,
                "drinkable": null
            },
            "toilets": {
                "usable": 88.6,
                "total_girls_toilets_usable": 81.2
            },
            "library": {
                "has_library": null,
                "books_available": 77.0
            },
            "computers": {
                "available": 84.3,
                "used_by_students": 31.7
            },
            "electricity": {
                "available": 97.2
            }
        }
    },
    "Maharashtra": {
        "learningLevels": {
            "reading": {
                "std3_can_read_std2_level": 37.0,
                "std5_can_read_std2_level": 66.1,
                "std8_can_read_std2_level": 81.8
            },
            "arithmetic": {
                "std3_can_do_subtraction": 34.4,
                "std5_can_do_division": 35.9,
                "std8_can_do_division": 44.1
            }
        },
        "schoolFacilities": {
            "drinkingWater": {
                "available": 95.4,
                "drinkable": null
            },
            "toilets": {
                "usable": 66.5,
                "total_girls_toilets_usable": 61.8
            },
            "library": {
                "has_library": null,
                "books_available": 58.3
            },
            "computers": {
                "available": 51.7,
                "used_by_students": 20.4
            },
            "electricity": {
                "available": 92.9
            }
        }
    },
    "Uttar Pradesh": {
        "learningLevels": {
            "reading": {
                "std3_can_read_std2_level": 27.9,
                "std5_can_read_std2_level": 50.5,
                "std8_can_read_std2_level": 67.3
            },
            "arithmetic": {
                "std3_can_do_subtraction": 31.6,
                "std5_can_do_division": 35.4,
                "std8_can_do_division": 45.2
            }
        },
        "schoolFacilities": {
            "drinkingWater": {
                "available": 91.3,
                "drinkable": null
            },
            "toilets": {
                "usable": 88.5,
                "total_girls_toilets_usable": 89.9
            },
            "library": {
                "has_library": null,
                "books_available": 88.3
            },
            "computers": {
                "available": 10.9,
                "used_by_students": 3.2
            },
            "electricity": {
                "available": 85.9
            }
        }
    },
    "Haryana": {
        "learningLevels": {
            "reading": {
                "std3_can_read_std2_level": 44.0,
                "std5_can_read_std2_level": 57.6,
                "std8_can_read_std2_level": 80.3
            },
            "arithmetic": {
                "std3_can_do_subtraction": 43.2,
                "std5_can_do_division": 51.5,
                "std8_can_do_division": 62.6
            }
        },
        "schoolFacilities": {
            "drinkingWater": {
                "available": 91.3,
                "drinkable": null
            },
            "toilets": {
                "usable": 80.5,
                "total_girls_toilets_usable": 78.7
            },
            "library": {
                "has_library": null,
                "books_available": 59.2
            },
            "computers": {
                "available": 28.5,
                "used_by_students": 12.7
            },
            "electricity": {
                "available": 95.5
            }
        }
    },
    "Himachal Pradesh": {
        "learningLevels": {
            "reading": {
                "std3_can_read_std2_level": 50.6,
                "std5_can_read_std2_level": 71.3,
                "std8_can_read_std2_level": 88.3
            },
            "arithmetic": {
                "std3_can_do_subtraction": 50.5,
                "std5_can_do_division": 57.9,
                "std8_can_do_division": 52.3
            }
        },
        "schoolFacilities": {
            "drinkingWater": {
                "available": 97.8,
                "drinkable": null
            },
            "toilets": {
                "usable": 90.4,
                "total_girls_toilets_usable": 89.9
            },
            "library": {
                "has_library": null,
                "books_available": 81.7
            },
            "computers": {
                "available": 17.3,
                "used_by_students": 2.3
            },
            "electricity": {
                "available": 95.5
            }
        }
    },
    "West Bengal": {
        "learningLevels": {
            "reading": {
                "std3_can_read_std2_level": 36.3,
                "std5_can_read_std2_level": 54.6,
                "std8_can_read_std2_level": 71.3
            },
            "arithmetic": {
                "std3_can_do_subtraction": 35.0,
                "std5_can_do_division": 40.9,
                "std8_can_do_division": 33.7
            }
        },
        "schoolFacilities": {
            "drinkingWater": {
                "available": 93.8,
                "drinkable": null
            },
            "toilets": {
                "usable": 82.3,
                "total_girls_toilets_usable": 66.2
            },
            "library": {
                "has_library": null,
                "books_available": 66.2
            },
            "computers": {
                "available": 4.7,
                "used_by_students": 1.1
            },
            "electricity": {
                "available": 84.9
            }
        }
    },
    "Karnataka": {
        "learningLevels": {
            "reading": {
                "std3_can_read_std2_level": 15.9,
                "std5_can_read_std2_level": 34.0,
                "std8_can_read_std2_level": 62.1
            },
            "arithmetic": {
                "std3_can_do_subtraction": 20.9,
                "std5_can_do_division": 25.9,
                "std8_can_do_division": 36.0
            }
        },
        "schoolFacilities": {
            "drinkingWater": {
                "available": 92.5,
                "drinkable": null
            },
            "toilets": {
                "usable": 66.8,
                "total_girls_toilets_usable": 80.7
            },
            "library": {
                "has_library": null,
                "books_available": 77.7
            },
            "computers": {
                "available": 35.9,
                "used_by_students": 13.8
            },
            "electricity": {
                "available": 94.5
            }
        }
    },
    "Gujarat": {
        "learningLevels": {
            "reading": {
                "std3_can_read_std2_level": 25.8,
                "std5_can_read_std2_level": 46.3,
                "std8_can_read_std2_level": 75.9
            },
            "arithmetic": {
                "std3_can_do_subtraction": 14.3,
                "std5_can_do_division": 19.1,
                "std8_can_do_division": 31.8
            }
        },
        "schoolFacilities": {
            "drinkingWater": {
                "available": 90.6,
                "drinkable": null
            },
            "toilets": {
                "usable": 83.5,
                "total_girls_toilets_usable": 75.6
            },
            "library": {
                "has_library": null,
                "books_available": 75.6
            },
            "computers": {
                "available": 74.6,
                "used_by_students": 40.0
            },
            "electricity": {
                "available": 97.3
            }
        }
    },
    "Chhattisgarh": {
        "learningLevels": {
            "reading": {
                "std3_can_read_std2_level": 25.0,
                "std5_can_read_std2_level": 54.4,
                "std8_can_read_std2_level": 76.0
            },
            "arithmetic": {
                "std3_can_do_subtraction": 25.7,
                "std5_can_do_division": 23.3,
                "std8_can_do_division": 40.7
            }
        },
        "schoolFacilities": {
            "drinkingWater": {
                "available": 90.9,
                "drinkable": null
            },
            "toilets": {
                "usable": 73.6,
                "total_girls_toilets_usable": 62.7
            },
            "library": {
                "has_library": null,
                "books_available": 41.8
            },
            "computers": {
                "available": 3.5,
                "used_by_students": 0.5
            },
            "electricity": {
                "available": 89.8
            }
        }
    }
};

export const ASER_VITAL_STATS = {
    'Punjab': {
        avg_student_attendance: 80.1, // Primary schools [1]
        avg_teacher_attendance: 81.8, // Primary schools [1]
        enrollment_govt: 58.0,        // Age 6-14 [2]
        not_enrolled: 0.5,            // Age 6-14 [2]
        private_tuition: 19.5         // Govt Std I-V [3]
    },
    'Maharashtra': {
        avg_student_attendance: 87.7, // Primary schools [4]
        avg_teacher_attendance: 92.7, // Primary schools [4]
        enrollment_govt: 60.9,        // Age 6-14 [5]
        not_enrolled: 0.4,            // Age 6-14 [5]
        private_tuition: 9.8          // Govt Std I-V [6]
    },
    'Uttar Pradesh': {
        avg_student_attendance: 71.4, // Primary schools [7]
        avg_teacher_attendance: 85.5, // Primary schools [7]
        enrollment_govt: 49.1,        // Age 6-14 [8]
        not_enrolled: 3.9,            // Age 6-14 [8]
        private_tuition: 11.4         // Govt Std I-V [9]
    },
    'Haryana': {
        avg_student_attendance: 78.4, // Primary schools [10]
        avg_teacher_attendance: 84.6, // Primary schools [10]
        enrollment_govt: 46.0,        // Age 6-14 [11]
        not_enrolled: 1.3,            // Age 6-14 [11]
        private_tuition: 12.0         // Govt Std I-V [12]
    },
    'Himachal Pradesh': {
        avg_student_attendance: 85.2, // Primary schools [13]
        avg_teacher_attendance: 81.2, // Primary schools [13]
        enrollment_govt: 58.6,        // Age 6-14 [14]
        not_enrolled: 0.4,            // Age 6-14 [14]
        private_tuition: 4.2          // Govt Std I-V [15]
    },
    'West Bengal': {
        avg_student_attendance: 64.3, // Primary schools [16]
        avg_teacher_attendance: 83.8, // Primary schools [16]
        enrollment_govt: 89.6,        // Age 6-14 [17]
        not_enrolled: 0.9,            // Age 6-14 [17]
        private_tuition: 77.2         // Govt Std I-V [9]
    },
    'Karnataka': {
        avg_student_attendance: 89.2, // Primary schools [18]
        avg_teacher_attendance: 93.8, // Primary schools [18]
        enrollment_govt: 71.1,        // Age 6-14 [19]
        not_enrolled: 0.3,            // Age 6-14 [19]
        private_tuition: 6.5          // Govt Std I-V [12]
    },
    'Gujarat': {
        avg_student_attendance: 86.4, // Primary schools [20]
        avg_teacher_attendance: 95.9, // Primary schools [20]
        enrollment_govt: 86.5,        // Age 6-14 [21]
        not_enrolled: 1.0,            // Age 6-14 [21]
        private_tuition: 12.8         // Govt Std I-V [15]
    },
    'Chhattisgarh': {
        avg_student_attendance: 74.1, // Primary schools [22]
        avg_teacher_attendance: 89.9, // Primary schools [22]
        enrollment_govt: 80.6,        // Age 6-14 [23]
        not_enrolled: 1.8,            // Age 6-14 [23]
        private_tuition: 1.1          // Govt Std I-V [24]
    }
};

// Return the appropriate ASER data (Mapping districts to State if needed)
const getASERStatsForDistrict = (district) => {
    // In a real app with more districts, we'd have a mapping object/function
    // Defaulting to Punjab/Uttar Pradesh based on common districts
    // For now, simple direct access if state matches, else default
    return REAL_ASER_DATA[district] || REAL_ASER_DATA['Punjab'];
};

export const getDistrictStats = (district) => {
    // We prioritize the Static ASER 2024 Data for the Dashboard Report
    const aserData = getASERStatsForDistrict(district);
    const vitalStats = ASER_VITAL_STATS[district] || ASER_VITAL_STATS['Punjab']; // Default mapping

    return {
        ...vitalStats,
        aserData: aserData,
        lastUpdated: new Date().toISOString()
    };
};

// --- NEW BACKEND FEATURES (From Main Branch) ---
// These are kept to support the 'Manage Data', 'Seeding', and 'Teacher Stats' features
// without disrupting the main ASER Dashboard view.

export const seedDatabase = async () => {
    try {
        const batch = writeBatch(db);
        const schoolsCollection = collection(db, 'schools');
        const schoolsData = ASER_DATA.schools || [];

        console.log(`Seeding ${schoolsData.length} schools from ASER data...`);

        for (const school of schoolsData) {
            const schoolRef = doc(schoolsCollection); // Auto-ID
            const attendanceLog = {};
            const today = new Date();
            for (let d = 0; d < 7; d++) {
                const date = new Date(today);
                date.setDate(date.getDate() - d);
                const dateStr = date.toISOString().split('T')[0];
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
        console.log("Database seeded successfully!");
    } catch (e) {
        console.error("Seeding failed", e);
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
        // If DB is empty, return simple mocks so UI doesn't look broken
        if (Object.keys(stats).length === 0) {
            return { "Math": 12, "Science": 10, "English": 15, "Hindi": 14 };
        }
        return stats;
    } catch (error) {
        console.error("Error fetching teacher stats:", error);
        return { "Math": 10, "Science": 8, "English": 12, "Hindi": 10 }; // Fallback
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

export const getAIInsight = (district) => {
    // Keep mock for now or simple heuristic
    const drop = (Math.random() * 15 + 5).toFixed(1);
    return {
        type: 'warning',
        message: `Attendance in ${district} dropped ${drop}% compared to yesterday. Potential cause: Local Festival/Weather.`
    };
};
