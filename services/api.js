import AsyncStorage from '@react-native-async-storage/async-storage';

// Database Keys (Version 2 to force reload new hardcoded defaults)
const DB_LIBS = '@libraries_v2';
const DB_ADMINS = '@admins_v2';
const DB_BOOKS = '@books_v2';
const DB_USERS = '@users_v2'; // New table for students

// --- INITIAL DEFAULT DATA (Applied only if the database is completely empty) ---
const initialLibraries = [
    { id: '1', name: 'Haile Gebresilasie', location: 'Main Campus' },
    { id: '2', name: 'Kebede Michael', location: 'Tech Campus' }
];

const initialAdmins = [
    { id: '1', name: 'Admin Haile', username: 'admin1', password: 'admin', libraryId: '1' },
    { id: '2', name: 'Admin Kebede', username: 'admin2', password: 'admin', libraryId: '2' },
];

const initialStudents = [
    { id: '1', name: 'Default Student', username: 'user', password: 'user' },
];

const initialBooks = [
    { id: '1', libraryId: '1', title: 'Calculus Early Transcendentals', author: 'James Stewart', status: 'Available', borrowedBy: null, category: 'Mathematics' },
    { id: '2', libraryId: '1', title: 'Introduction to Algorithms', author: 'Cormen', status: 'Issued', borrowedBy: 'user', category: 'Computer Science', dueDate: '2026-04-01' },
    { id: '3', libraryId: '2', title: 'Clean Code', author: 'Robert C. Martin', status: 'Available', borrowedBy: null, category: 'Software Engineering' },
    { id: '4', libraryId: '2', title: 'React Native in Action', author: 'Nader Dabit', status: 'Available', borrowedBy: null, category: 'Software Development' },
    { id: '5', libraryId: '1', title: 'The Art of Computer Programming', author: 'Knuth', status: 'Available', borrowedBy: null, category: 'Computer Science' },
];


export const getStats = async (libraryId = null) => {
    const books = await getTable(DB_BOOKS, initialBooks);
    const libs = await getTable(DB_LIBS, initialLibraries);
    const users = await getTable(DB_USERS, initialStudents);
    const filters = libraryId ? books.filter(b => b.libraryId === libraryId) : books;
    
    // Calculate Analytics
    const categories = [...new Set(books.map(b => b.category))];
    const categoryStats = categories.map(c => ({
        name: c,
        count: books.filter(b => b.category === c).length
    }));

    return {
        totalBooks: filters.length,
        issuedBooks: filters.filter(b => b.status === 'Issued').length,
        availableBooks: filters.filter(b => b.status === 'Available').length,
        totalLibraries: libs.length,
        totalStudents: users.length,
        categoryStats,
        activeBooks: filters.filter(b => b.status === 'Issued').map(b => ({ title: b.title, due: b.dueDate }))
    };
};

// --- ADVANCED FEATURES MOCK DATA ---
const digitalResources = [
    { id: 'd1', title: 'Python Data Science Handbook', author: 'Jake VanderPlas', type: 'PDF', url: 'https://example.com/python.pdf', category: 'Computer Science' },
    { id: 'd2', title: 'Deep Learning', author: 'Ian Goodfellow', type: 'E-Book', url: 'https://example.com/dl.pdf', category: 'Software Engineering' },
    { id: 'd3', title: 'The Lean Startup', author: 'Eric Ries', type: 'Audiobook', url: 'https://example.com/lean.mp3', category: 'Business' },
];




// --- IN-MEMORY FALLBACK (Just in case AsyncStorage fails ) ---
const memoryDatabase = {};

// --- CORE DATABASE FUNCTIONS ---
const getTable = async (key, initialValue) => {
    try {
        if (!AsyncStorage || !AsyncStorage.getItem) {
            throw new Error('AsyncStorage is entirely missing or null.');
        }
        const jsonValue = await AsyncStorage.getItem(key);
        if (jsonValue != null) {
            return JSON.parse(jsonValue);
        } else {
            // First time running app: populate with default data
            await AsyncStorage.setItem(key, JSON.stringify(initialValue));
            return initialValue;
        }
    } catch (e) {
        console.warn(`Database Read Warning for ${key}:`, e.message);
        // If AsyncStorage fails, fallback to memory storage for this session
        if (!memoryDatabase[key]) {
            memoryDatabase[key] = initialValue;
        }
        return memoryDatabase[key];
    }
};

const updateTable = async (key, newData) => {
    try {
        if (!AsyncStorage || !AsyncStorage.setItem) {
            throw new Error('AsyncStorage is entirely missing or null.');
        }
        await AsyncStorage.setItem(key, JSON.stringify(newData));
    } catch (e) {
        console.warn(`Database Update Warning for ${key}:`, e.message);
        // If AsyncStorage fails, fallback to updating memory storage
        memoryDatabase[key] = newData;
    }
};

// --- API METHODS ---

export const loginUser = async (email, password) => {
    return new Promise(async (resolve, reject) => {
        const admins = await getTable(DB_ADMINS, initialAdmins);
        const users = await getTable(DB_USERS, initialStudents);
        
        setTimeout(() => {
            if (email === 'super' && password === 'admin') {
                resolve({ role: 'SuperAdmin', username: 'Super Admin' });
            } else {
                const admin = admins.find(a => a.username === email && a.password === password);
                if (admin) {
                     resolve({ role: 'Admin', username: admin.name, libraryId: admin.libraryId });
                } else {
                    const user = users.find(u => u.username === email && u.password === password);
                    if (user) {
                        resolve({ role: 'User', username: user.name });
                    } else {
                        reject(new Error('Invalid credentials.'));
                    }
                }
            }
        }, 500);
    });
};

export const getStudents = async () => {
    return await getTable(DB_USERS, initialStudents);
};

export const createStudent = async (name, username, password) => {
    const users = await getTable(DB_USERS, initialStudents);
    const newUser = { id: Date.now().toString(), name, username, password };
    users.push(newUser);
    await updateTable(DB_USERS, users);
    return newUser;
};

export const deleteStudent = async (id) => {
    const users = await getTable(DB_USERS, initialStudents);
    const filtered = users.filter(u => u.id !== id);
    await updateTable(DB_USERS, filtered);
};


// Super Admin APIs
export const getLibraries = async () => {
    return await getTable(DB_LIBS, initialLibraries);
};

export const createLibrary = async (name, location) => {
    const libs = await getTable(DB_LIBS, initialLibraries);
    const newLib = { id: Date.now().toString(), name, location };
    libs.push(newLib);
    await updateTable(DB_LIBS, libs);
    return newLib;
};

export const updateLibrary = async (id, updatedData) => {
    const libs = await getTable(DB_LIBS, initialLibraries);
    const index = libs.findIndex(l => l.id === id);
    if (index > -1) {
        libs[index] = { ...libs[index], ...updatedData };
        await updateTable(DB_LIBS, libs);
    }
};

export const deleteLibrary = async (id) => {
    const libs = await getTable(DB_LIBS, initialLibraries);
    const filtered = libs.filter(l => l.id !== id);
    await updateTable(DB_LIBS, filtered);
};

export const getAdmins = async () => {
    return await getTable(DB_ADMINS, initialAdmins);
};

export const assignAdmin = async (name, username, password, libraryId) => {
    const admins = await getTable(DB_ADMINS, initialAdmins);
    const newAdmin = { id: Date.now().toString(), name, username, password, libraryId };
    admins.push(newAdmin);
    await updateTable(DB_ADMINS, admins);
    return newAdmin;
};

export const deleteAdmin = async (id) => {
    const admins = await getTable(DB_ADMINS, initialAdmins);
    const filtered = admins.filter(a => a.id !== id);
    await updateTable(DB_ADMINS, filtered);
};

// Admin APIs
export const getBooksByLibrary = async (libraryId, searchQuery = '') => {
    const books = await getTable(DB_BOOKS, initialBooks);
    let filtered = books.filter(b => b.libraryId === libraryId);
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(b => 
            b.title.toLowerCase().includes(query) || 
            b.author.toLowerCase().includes(query)
        );
    }
    return filtered;
};

export const addBook = async (libraryId, title, author, category = 'General') => {
    const books = await getTable(DB_BOOKS, initialBooks);
    const newBook = { id: Date.now().toString(), libraryId, title, author, status: 'Available', borrowedBy: null, category };
    books.push(newBook);
    await updateTable(DB_BOOKS, books);
    return newBook;
};


export const updateBook = async (id, updatedData) => {
    const books = await getTable(DB_BOOKS, initialBooks);
    const index = books.findIndex(b => b.id === id);
    if (index > -1) {
        books[index] = { ...books[index], ...updatedData };
        await updateTable(DB_BOOKS, books);
    }
};

export const deleteBook = async (id) => {
    const books = await getTable(DB_BOOKS, initialBooks);
    const filtered = books.filter(b => b.id !== id);
    await updateTable(DB_BOOKS, filtered);
};

// User APIs
export const getAllBooks = async (searchQuery = '') => {
    const books = await getTable(DB_BOOKS, initialBooks);
    const libs = await getTable(DB_LIBS, initialLibraries);
    
    let mapped = books.map(book => {
        const lib = libs.find(l => l.id === book.libraryId);
        return { ...book, libraryName: lib ? lib.name : 'Unknown' };
    });

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        mapped = mapped.filter(b => 
            b.title.toLowerCase().includes(query) || 
            b.author.toLowerCase().includes(query) ||
            b.libraryName.toLowerCase().includes(query)
        );
    }
    return mapped;
};

export const borrowBook = async (bookId, username) => {
    const books = await getTable(DB_BOOKS, initialBooks);
    const bookIndex = books.findIndex(b => b.id === bookId);
    
    if (bookIndex > -1 && books[bookIndex].status === 'Available') {
        // Calculate due date (14 days from now)
        const due = new Date();
        due.setDate(due.getDate() + 14);
        
        books[bookIndex].status = 'Issued';
        books[bookIndex].borrowedBy = username;
        books[bookIndex].dueDate = due.toISOString().split('T')[0];
        
        await updateTable(DB_BOOKS, books);
        return true;
    }
    throw new Error('Book not available');
};


export const returnBook = async (bookId, username) => {
    const books = await getTable(DB_BOOKS, initialBooks);
    const bookIndex = books.findIndex(b => b.id === bookId && b.borrowedBy === username);
    
    if (bookIndex > -1) {
        books[bookIndex].status = 'Available';
        books[bookIndex].borrowedBy = null;
        await updateTable(DB_BOOKS, books);
        return true;
    }
    throw new Error('You cannot return this book');
};

// --- NEW ADVANCED API METHODS ---

export const getRecommendations = async (username) => {
    const books = await getTable(DB_BOOKS, initialBooks);
    const borrowed = books.filter(b => b.borrowedBy === username);
    
    if (borrowed.length === 0) {
        // Default popular recommendations (Mathematics + AI)
        return books.filter(b => b.category === 'Mathematics' || b.category === 'Computer Science').slice(0, 3);
    }

    // AI recommendation based on preferred category
    const topCategory = borrowed[0].category;
    const sameCat = books.filter(b => b.category === topCategory && b.status === 'Available');
    return sameCat.length > 0 ? sameCat.slice(0, 3) : books.slice(0, 3);
};

export const getDigitalResources = async () => {
    return digitalResources;
};

export const getNotifications = async (username) => {
    const books = await getTable(DB_BOOKS, initialBooks);
    const borrowed = books.filter(b => b.borrowedBy === username);
    
    const notifications = [];
    borrowed.forEach(b => {
        if (b.dueDate) {
            const daysLeft = Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysLeft < 0) {
                notifications.push({
                    id: Date.now().toString() + b.id,
                    title: '🏮 OVERDUE FINE',
                    message: `Book "${b.title}" is ${Math.abs(daysLeft)} days late. Fine: $${Math.abs(daysLeft) * 2}`,
                    type: 'danger'
                });
            } else if (daysLeft <= 3) {
                notifications.push({
                    id: Date.now().toString() + b.id,
                    title: 'Return Reminder',
                    message: `Book "${b.title}" is due in ${daysLeft} days!`,
                    type: 'warning'
                });
            }
        }
    });

    if (notifications.length === 0) {
        notifications.push({
            id: 'n1',
            title: 'Welcome Back',
            message: 'Check out the new AI recommendations in your dashboard.',
            type: 'info'
        });
    }

    return notifications;
};

// --- COMMUNITY & STAR SYSTEM ---

export const toggleFavorite = async (bookId, username) => {
     try {
        const key = `@fav_${username}`;
        const favs = JSON.parse(await AsyncStorage.getItem(key)) || [];
        const index = favs.indexOf(bookId);
        if (index > -1) favs.splice(index, 1);
        else favs.push(bookId);
        await AsyncStorage.setItem(key, JSON.stringify(favs));
        return true;
     } catch (e) { return false; }
};

export const getFavorites = async (username) => {
    try {
        const key = `@fav_${username}`;
        return JSON.parse(await AsyncStorage.getItem(key)) || [];
    } catch (e) { return []; }
};

export const addReview = async (bookId, username, rating) => {
    // Simulated review update
    const books = await getTable(DB_BOOKS, initialBooks);
    const index = books.findIndex(b => b.id === bookId);
    if (index > -1) {
        books[index].rating = rating;
        await updateTable(DB_BOOKS, books);
    }
};


export const scanBookById = async (bookId) => {
    const books = await getTable(DB_BOOKS, initialBooks);
    const book = books.find(b => b.id === bookId);
    if (!book) throw new Error('Invalid Barcode/QR Code');
    return book;
};


