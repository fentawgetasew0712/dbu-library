import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';


import { getBooksByLibrary, addBook, getLibraries, deleteBook, getStats, scanBookById } from '../services/api';
import CustomPicker from '../components/CustomPicker';
import { useLanguage } from '../services/i18n';

export default function AdminScreen({ navigation, route }) {
    const { t } = useLanguage();
    const { user } = route.params || {};
    const [books, setBooks] = useState([]);
    const [libraries, setLibraries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ totalBooks: 0, issuedBooks: 0, availableBooks: 0, categoryStats: [] });
    
    // Form state
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState(t('computerScience'));

    const [targetLib, setTargetLib] = useState(''); 
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (user && user.libraryId) {
            setTargetLib(user.libraryId);
            fetchLibraries();
        }
    }, [user]);

    useEffect(() => {
        if (targetLib) {
            fetchBooksForTargetLibrary();
            fetchStats();
        }
    }, [targetLib, searchQuery]);

    const fetchLibraries = async () => {
        const libs = await getLibraries();
        setLibraries(libs);
    };

    const fetchStats = async () => {
        const s = await getStats(targetLib);
        setStats(s);
    };

    const handleScan = async () => {
        // SIMULATION: In a real app, this would use expo-barcode-scanner
        Alert.prompt(
            "Scan Barcode",
            "Enter Book Barcode ID (e.g., 1, 3, 5)",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Scan", 
                    onPress: async (barcode) => {
                        try {
                            const book = await scanBookById(barcode);
                            Alert.alert('Scan Result', `Book Found: ${book.title}\nStatus: ${book.status}`);
                        } catch (e) {
                            Alert.alert('Scan Error', 'Invalid Barcode');
                        }
                    }
                }
            ]
        );
    };

    const fetchBooksForTargetLibrary = async () => {
        const libBooks = await getBooksByLibrary(targetLib, searchQuery);
        setBooks(libBooks);
    };


    const handleAddBook = async () => {
        if (!title || !author || !targetLib) {
            Alert.alert('Missing Data', 'Please provide book details');
            return;
        }
        await addBook(targetLib, title, author, category);
        setTitle(''); 
        setAuthor('');
        fetchBooksForTargetLibrary();
        fetchStats();
        Alert.alert('Book Added', 'Catalog updated successfully!');
    };

    const handleDeleteBook = async (bookId) => {
        Alert.alert(
            'Remove from Catalog?',
            'This action is permanent.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: async () => {
                        await deleteBook(bookId);
                        fetchBooksForTargetLibrary();
                        fetchStats();
                    }
                }
            ]
        );
    };

    const renderBook = (item) => (
        <View key={item.id} style={styles.card}>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>by {item.author} | {item.category}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Available' ? '#dcfce7' : '#fee2e2' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'Available' ? '#166534' : '#991b1b' }]}>{item.status}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleDeleteBook(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    const libItems = libraries.map(l => ({ label: l.name, value: l.id }));
    const catItems = [
        { label: 'Computer Science', value: 'Computer Science' },
        { label: 'Mathematics', value: 'Mathematics' },
        { label: 'Software Engineering', value: 'Software Engineering' },
        { label: 'Literature', value: 'Literature' },
        { label: 'Philosophy', value: 'Philosophy' },
        { label: 'History', value: 'History' },
    ];
    const currentLibName = libraries.find(l => l.id === targetLib)?.name;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <View>
                        <Text style={styles.title}>{t('libraryConsole')}</Text>
                        <Text style={styles.subtitle}>{t('branchManager')}: {user?.username}</Text>
                    </View>
                    <TouchableOpacity style={styles.scanBtn} onPress={handleScan}>
                        <Text style={{ fontSize: 24 }}>📷</Text>
                        <Text style={styles.scanText}>{t('quickStart')}</Text>
                    </TouchableOpacity>
                </View>




                {/* Branch Stats */}
                <View style={styles.statsRow}>
                    <View style={[styles.miniStat, { backgroundColor: '#4f46e5' }]}>
                        <Text style={styles.miniStatVal}>{stats.totalBooks}</Text>
                        <Text style={styles.miniStatLabel}>{t('total')}</Text>
                    </View>
                    <View style={[styles.miniStat, { backgroundColor: '#10b981' }]}>
                        <Text style={styles.miniStatVal}>{stats.availableBooks}</Text>
                        <Text style={styles.miniStatLabel}>{t('ready')}</Text>
                    </View>
                    <View style={[styles.miniStat, { backgroundColor: '#f59e0b' }]}>
                        <Text style={styles.miniStatVal}>{stats.issuedBooks}</Text>
                        <Text style={styles.miniStatLabel}>{t('out')}</Text>
                    </View>
                </View>

                {/* Category Analysis */}
                <View style={styles.chartCard}>
                    <Text style={styles.formHeader}>Subject Distribution</Text>
                    <View style={styles.barContainer}>
                        {stats.categoryStats?.map((c, i) => (
                            <View key={i} style={styles.barWrap}>
                                <View style={[styles.bar, { height: (c.count / (stats.totalBooks || 1)) * 50 + 10 }]} />
                                <Text style={styles.barLabel}>{c.category}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.formHeader}>{t('addInventory')}</Text>
                    <TextInput style={styles.input} placeholder={t('title')} value={title} onChangeText={setTitle} />
                    <TextInput style={styles.input} placeholder={t('author')} value={author} onChangeText={setAuthor} />
                    
                    <Text style={styles.inputLabel}>{t('category')}:</Text>
                    <CustomPicker items={catItems} selectedValue={category} onValueChange={setCategory} placeholder="Choose Category" />
                    
                    <TouchableOpacity style={styles.submitBtn} onPress={handleAddBook}>
                        <Text style={styles.submitBtnText}>{t('addInventory')}</Text>
                    </TouchableOpacity>
                </View>


                <View style={styles.listHeader}>
                    <Text style={styles.listSectionTitle}>Current Shelf: {currentLibName}</Text>
                    <TextInput 
                        style={styles.searchBar} 
                        placeholder={t('search')}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>


                {books.length > 0 ? (
                    books.map(book => renderBook(book))
                ) : (
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyText}>Shelf is empty.</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.exitBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}>
                    <Text style={styles.exitBtnText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContainer: { padding: 20 },
    header: { marginBottom: 25 },
    title: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
    scanBtn: { alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 20, elevation: 4, borderWidth: 1, borderColor: '#e2e8f0' },
    scanText: { fontSize: 10, fontWeight: 'bold', color: '#4f46e5', marginTop: 4 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    miniStat: { flex: 1, marginHorizontal: 4, padding: 18, borderRadius: 20, alignItems: 'center', elevation: 3 },
    miniStatVal: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    miniStatLabel: { fontSize: 10, color: '#fff', opacity: 0.9, textTransform: 'uppercase', fontWeight: '900' },
    chartCard: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 20, elevation: 2 },
    barContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 100, justifyContent: 'space-around', marginTop: 15 },
    barWrap: { alignItems: 'center', flex: 1 },
    bar: { width: 12, backgroundColor: '#4f46e5', borderRadius: 6 },
    barLabel: { fontSize: 8, color: '#64748b', marginTop: 8, height: 20, textAlign: 'center' },
    formCard: { backgroundColor: '#fff', padding: 22, borderRadius: 24, marginBottom: 25, elevation: 3 },
    formHeader: { fontSize: 17, fontWeight: '800', marginBottom: 15, color: '#1e293b' },
    inputLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 8 },
    input: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 15, marginBottom: 15, fontSize: 15, borderWidth: 1, borderColor: '#e2e8f0' },
    submitBtn: { backgroundColor: '#0f172a', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    listHeader: { marginBottom: 15 },
    listSectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
    searchBar: { backgroundColor: '#fff', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14, elevation: 1 },
    card: { backgroundColor: '#fff', padding: 18, borderRadius: 22, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
    cardInfo: { flex: 1 },
    cardTitle: { fontWeight: '800', fontSize: 16, color: '#1e293b' },
    cardSubtitle: { color: '#64748b', marginTop: 3, fontSize: 13 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginTop: 12 },
    statusText: { fontSize: 11, fontWeight: 'bold' },
    deleteBtn: { padding: 12 },
    deleteBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 13 },
    emptyWrap: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic' },
    exitBtn: { backgroundColor: '#e2e8f0', padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 20 },
    exitBtnText: { color: '#475569', fontWeight: 'bold' }
});




