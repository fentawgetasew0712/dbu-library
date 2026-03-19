import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, ScrollView } from 'react-native';


import { getAllBooks, borrowBook, returnBook, getRecommendations, getDigitalResources, getNotifications, toggleFavorite, getFavorites } from '../services/api';
import { useLanguage } from '../services/i18n';

export default function UserScreen({ navigation, route }) {
    const { t } = useLanguage();
    const { user } = route.params || {};
    const [books, setBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(t('all'));
    
    // Advanced state
    const [recommendations, setRecommendations] = useState([]);
    const [digitalResources, setDigitalResources] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        fetchBooks();
        fetchAdvancedFeatures();
    }, [searchQuery, selectedCategory]);

    const fetchBooks = async () => {
        let allBooks = await getAllBooks(searchQuery);
        if (selectedCategory !== t('all')) {
            allBooks = allBooks.filter(b => t(b.category.toLowerCase().replace(' ', '')) === selectedCategory || b.category === selectedCategory);
        }
        setBooks(allBooks);
    };


    const fetchAdvancedFeatures = async () => {
        if (user?.username) {
            const recs = await getRecommendations(user.username);
            setRecommendations(recs);
            const notes = await getNotifications(user.username);
            setNotifications(notes);
            const docs = await getDigitalResources();
            setDigitalResources(docs);
            const favs = await getFavorites(user.username);
            setFavorites(favs);
        }
    };

    const handleToggleFavorite = async (bookId) => {
        await toggleFavorite(bookId, user.username);
        fetchAdvancedFeatures();
    };



    const handleBorrow = async (bookId) => {
        try {
            await borrowBook(bookId, user.username);
            Alert.alert('📖 Success', 'Book added to your collection!');
            fetchBooks();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleReturn = async (bookId) => {
        try {
            await returnBook(bookId, user.username);
            Alert.alert('✅ Returned', 'The book is now available for others.');
            fetchBooks();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const myBooks = books.filter(b => b.status === 'Issued' && b.borrowedBy === user?.username);
    const categories = [t('all'), ...new Set(books.map(b => b.category).filter(c => c))];


    const getGroupedBooks = () => {
        const otherBooks = books.filter(b => b.status === 'Available' || (b.status === 'Issued' && b.borrowedBy !== user?.username));
        const groups = {};
        for (const book of otherBooks) {
            const key = book.title + '|' + book.author;
            if (!groups[key]) groups[key] = { title: book.title, author: book.author, category: book.category, copies: [] };
            groups[key].copies.push(book);
        }
        return Object.values(groups);
    };

    const renderMyBook = ({ item }) => {
        const isOverdue = item.dueDate && new Date(item.dueDate) < new Date();
        return (
            <View style={[styles.myBookCard, isOverdue && { borderColor: '#ef4444', borderWidth: 2 }]}>
                {isOverdue && <View style={styles.fineBadge}><Text style={styles.fineText}>Fine Alert</Text></View>}
                <View style={[styles.bookIcon, isOverdue && { backgroundColor: '#fee2e2' }]}><Text style={{ fontSize: 24 }}>📚</Text></View>
                <Text style={styles.myBookTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.myBookLib}>{item.libraryName}</Text>
                <TouchableOpacity style={styles.returnMiniBtn} onPress={() => handleReturn(item.id)}>
                    <Text style={styles.returnMiniText}>{t('return')}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderGroupedBook = ({ item }) => {
        const firstCopyId = item.copies[0].id;
        const isFav = favorites.includes(firstCopyId);
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <TouchableOpacity onPress={() => handleToggleFavorite(firstCopyId)}>
                                <Text style={{ fontSize: 20 }}>{isFav ? '⭐' : '☆'}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.cardAuthor}>{item.author}</Text>
                        <View style={styles.ratingRow}>
                            <Text style={styles.starText}>⭐⭐⭐⭐</Text>
                            <Text style={styles.ratingCount}>(24 Peers)</Text>
                        </View>
                    </View>
                    <View style={styles.categoryBadge}><Text style={styles.categoryText}>{item.category}</Text></View>
                </View>

                <View style={styles.copiesContainer}>
                    {item.copies.map((copy, index) => {
                        const available = copy.status === 'Available';
                        return (
                            <View key={copy.id} style={[styles.copyRow, index > 0 && styles.copyRowBorder]}>
                                <View style={styles.libraryInfo}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.libraryBadgeText}>{copy.libraryName}</Text>
                                        {available && <View style={styles.dotAvailable} />}
                                    </View>
                                    {!available && <Text style={styles.unavailableText}>{t('outOfStock')}</Text>}
                                </View>

                                {available ? (
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleBorrow(copy.id)}>
                                        <Text style={styles.actionText}>{t('borrow')}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.lockedBadge}>
                                        <Text style={styles.lockedText}>{t('issued')}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.headerArea}>
                    <View style={styles.headerTop}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.welcome}>{t('welcome')}, {user?.username} 👋</Text>
                            <Text style={styles.subtitle}>{t('subtitle')}</Text>
                        </View>
                        <TouchableOpacity style={styles.notifBtn} onPress={() => setShowNotifications(!showNotifications)}>
                            <Text style={{ fontSize: 24 }}>🔔</Text>
                            {notifications.length > 0 && <View style={styles.notifBadge} />}
                        </TouchableOpacity>
                    </View>


                </View>

                {showNotifications && (
                    <View style={styles.notifPanel}>
                        <Text style={styles.sectionTitle}>Notifications</Text>
                        {notifications.map(note => (
                            <View key={note.id} style={[styles.notifItem, { borderLeftColor: note.type === 'warning' ? '#f59e0b' : '#3b82f6' }]}>
                                <Text style={styles.notifTitle}>{note.title}</Text>
                                <Text style={styles.notifMsg}>{note.message}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* QUICK START ACTIVATION GUIDE */}
                <View style={styles.quickStartCard}>
                    <Text style={[styles.sectionTitle, { marginLeft: 0, marginBottom: 10, color: '#fff' }]}>🚀 {t('quickStart')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} gap={10}>
                        <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Guide', '1. Search for a book\n2. See which library has it\n3. Click Borrow!')}>
                            <Text style={styles.quickActionText}>{t('userGuide')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('System', 'All libraries are currently online and syncing.')}>
                            <Text style={styles.quickActionText}>{t('systemHealth')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.quickActionText}>{t('authStatus')}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* AI RECOMMENDATIONS */}
                {recommendations.length > 0 && (
                    <View style={styles.advancedSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>✨ {t('suggested')}</Text>
                            <View style={styles.aiBadge}><Text style={styles.aiText}>AI Powered</Text></View>
                        </View>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={recommendations}
                            renderItem={({ item }) => (
                                <View style={styles.recCard}>
                                    <View style={styles.recIcon}><Text style={{ fontSize: 28 }}>📘</Text></View>
                                    <Text style={styles.recTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.recAuthor}>{item.author}</Text>
                                    <TouchableOpacity style={styles.recBtn} onPress={() => handleBorrow(item.id)}>
                                        <Text style={styles.recBtnText}>{t('borrow')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            keyExtractor={item => 'rec-' + item.id}
                            style={styles.horizontalList}
                        />
                    </View>
                )}

                {/* MY CURRENT READINGS */}
                {myBooks.length > 0 && (
                    <View style={styles.myBooksSection}>
                        <Text style={styles.sectionTitle}>📖 {t('currentReadings')}</Text>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={myBooks}
                            renderItem={renderMyBook}
                            keyExtractor={item => 'my-' + item.id}
                            style={styles.horizontalList}
                        />
                    </View>
                )}

                {/* DIGITAL LIBRARY */}
                <View style={styles.digitalSection}>
                    <Text style={styles.sectionTitle}>📂 {t('digitalResources')}</Text>
                    {digitalResources.map(res => (
                        <TouchableOpacity key={res.id} style={styles.digitalCard} onPress={() => Alert.alert('Downloading', `Accessing ${res.type}: ${res.title}`)}>
                            <View style={styles.digitalIcon}>
                                <Text style={{ fontSize: 20 }}>{res.type === 'PDF' ? '📄' : res.type === 'Audiobook' ? '🎧' : '📱'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.digitalTitle}>{res.title}</Text>
                                <Text style={styles.digitalSub}>{res.author} • {res.type}</Text>
                            </View>
                            <Text style={styles.openText}>Open</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.searchSection}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('search')}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>


                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={styles.sectionTitle}>Available Collection</Text>
                    {getGroupedBooks().map((group, idx) => (
                        <View key={idx}>{renderGroupedBook({ item: group })}</View>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerArea: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 10 },
    headerTop: { flexDirection: 'row', alignItems: 'center' },
    headerLogo: { width: 45, height: 45, borderRadius: 10 },
    welcome: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
    profileArea: { marginRight: 15 },
    avatarMini: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
    notifBtn: { backgroundColor: '#fff', padding: 10, borderRadius: 15, elevation: 2, position: 'relative' },

    notifBadge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4, borderWidth: 1, borderColor: '#fff' },
    notifPanel: { backgroundColor: '#fff', marginHorizontal: 25, borderRadius: 20, padding: 15, marginBottom: 20, elevation: 3 },
    notifItem: { padding: 12, borderLeftWidth: 4, backgroundColor: '#f8fafc', borderRadius: 10, marginBottom: 10 },
    notifTitle: { fontWeight: 'bold', fontSize: 13, color: '#1e293b' },
    notifMsg: { fontSize: 12, color: '#64748b' },
    quickStartCard: { backgroundColor: '#4f46e5', marginHorizontal: 25, borderRadius: 25, padding: 20, marginBottom: 30, elevation: 5 },
    quickAction: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginRight: 10 },
    quickActionText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    advancedSection: { marginBottom: 30 },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginLeft: 25, marginBottom: 15 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
    aiBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 10 },
    aiText: { color: '#2563eb', fontSize: 10, fontWeight: 'bold' },
    horizontalList: { paddingLeft: 20 },
    recCard: { backgroundColor: '#fff', width: 170, padding: 18, borderRadius: 25, marginRight: 15, elevation: 3, borderWidth: 1, borderColor: '#eff6ff' },
    recIcon: { height: 60, width: 60, backgroundColor: '#f1f5f9', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    recTitle: { fontWeight: 'bold', fontSize: 14, color: '#1e293b' },
    recAuthor: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
    recBtn: { marginTop: 15, backgroundColor: '#1e293b', paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
    recBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
    myBooksSection: { marginBottom: 30 },
    myBookCard: { backgroundColor: '#111827', width: 150, padding: 15, borderRadius: 25, marginRight: 15, elevation: 5 },
    bookIcon: { height: 45, width: 45, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    myBookTitle: { fontWeight: 'bold', fontSize: 13, color: '#fff' },
    myBookLib: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    fineBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
    fineText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
    returnMiniBtn: { marginTop: 12, backgroundColor: 'rgba(239, 68, 68, 0.2)', paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
    returnMiniText: { color: '#fca5a5', fontWeight: 'bold', fontSize: 11 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    starText: { fontSize: 12 },
    ratingCount: { fontSize: 10, color: '#94a3b8', marginLeft: 5 },
    dotAvailable: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginLeft: 8 },
    digitalSection: { paddingHorizontal: 25, marginBottom: 30 },

    digitalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 12, elevation: 2 },
    digitalIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    digitalTitle: { fontWeight: '700', fontSize: 14, color: '#1e293b' },
    digitalSub: { fontSize: 11, color: '#94a3b8' },
    openText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 12 },
    searchSection: { paddingHorizontal: 25, marginBottom: 15 },
    searchInput: { backgroundColor: '#fff', padding: 16, borderRadius: 20, fontSize: 15, elevation: 1, borderWidth: 1, borderColor: '#e2e8f0' },
    catScroll: { paddingLeft: 25, marginBottom: 25 },
    catChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15, backgroundColor: '#fff', marginRight: 10, elevation: 1, borderWidth: 1, borderColor: '#e2e8f0' },
    catChipActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
    catChipText: { color: '#64748b', fontWeight: 'bold', fontSize: 13 },
    catChipTextActive: { color: '#fff' },
    card: { backgroundColor: '#fff', borderRadius: 30, marginBottom: 20, elevation: 2, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
    cardHeader: { padding: 22, borderBottomWidth: 1, borderBottomColor: '#f8fafc', flexDirection: 'row', alignItems: 'flex-start' },
    cardTitle: { fontWeight: '800', fontSize: 17, color: '#0f172a' },
    cardAuthor: { color: '#64748b', marginTop: 4, fontSize: 13 },
    categoryBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    categoryText: { color: '#059669', fontSize: 10, fontWeight: 'bold' },
    copiesContainer: { padding: 15 },
    copyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10 },
    copyRowBorder: { borderTopWidth: 1, borderTopColor: '#f8fafc' },
    libraryInfo: { flex: 1 },
    libraryBadgeText: { fontWeight: 'bold', color: '#334155', fontSize: 14 },
    unavailableText: { color: '#ef4444', fontSize: 11, marginTop: 2 },
    actionBtn: { backgroundColor: '#0f172a', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 15 },
    actionText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    lockedBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 15 },
    lockedText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
    logoutButton: { position: 'absolute', bottom: 30, left: 25, right: 25, backgroundColor: '#ef4444', padding: 20, borderRadius: 22, alignItems: 'center', elevation: 10 },
    logoutText: { color: '#fff', fontWeight: '900', fontSize: 15 }
});



