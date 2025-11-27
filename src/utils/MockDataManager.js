// Centralized Mock Data Manager
// This acts as a temporary "database" for the application until Firebase is fully integrated.

const initialTeachers = [
    { id: 't1', name: 'Sunil Sharma', email: 'sunil@school.com', password: 'password123', subjects: ['Mathematics', 'Physics'] },
    { id: 't2', name: 'Anita Desai', email: 'anita@school.com', password: 'password123', subjects: ['English', 'History'] },
    { id: 't3', name: 'Rajiv Kumar', email: 'rajiv@school.com', password: 'password123', subjects: ['Chemistry', 'Biology'] }
];

const initialClasses = [
    { id: 'VI-B', name: 'Class VI - Section B', teacherId: 't1', studentCount: 45 },
    { id: 'VIII-A', name: 'Class VIII - Section A', teacherId: 't1', studentCount: 38 },
    { id: 'X-A', name: 'Class X - Section A', teacherId: 't2', studentCount: 40 },
    { id: 'XI-B', name: 'Class XI - Section B', teacherId: 't3', studentCount: 35 }
];

const initialAdmins = [
    { id: 'a1', name: 'Principal', email: 'admin@school.com', password: 'admin' }
];

class MockDataManager {
    constructor() {
        // Load from localStorage if available, else use initial data
        this.teachers = JSON.parse(localStorage.getItem('mock_teachers')) || initialTeachers;
        this.classes = JSON.parse(localStorage.getItem('mock_classes')) || initialClasses;
        this.admins = JSON.parse(localStorage.getItem('mock_admins')) || initialAdmins;
    }

    _save() {
        localStorage.setItem('mock_teachers', JSON.stringify(this.teachers));
        localStorage.setItem('mock_classes', JSON.stringify(this.classes));
        localStorage.setItem('mock_admins', JSON.stringify(this.admins));
    }

    // Admin Auth
    validateAdmin(email, password) {
        return this.admins.find(a => a.email === email && a.password === password);
    }

    // Teacher Auth
    validateTeacher(email, password) {
        return this.teachers.find(t => t.email === email && t.password === password);
    }

    // Getters
    getTeachers() {
        return this.teachers;
    }

    getClasses() {
        return this.classes;
    }

    getClassesForTeacher(teacherId) {
        return this.classes.filter(c => c.teacherId === teacherId);
    }

    // Actions
    assignClassToTeacher(classId, teacherId) {
        this.classes = this.classes.map(c =>
            c.id === classId ? { ...c, teacherId } : c
        );
        this._save();
    }

    addTeacher(teacher) {
        this.teachers.push({ ...teacher, id: `t${Date.now()}` });
        this._save();
    }
}

export const mockDB = new MockDataManager();
