import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';

import { getLibraries, createLibrary, assignAdmin, getAdmins, deleteLibrary, deleteAdmin, getStats, getStudents, createStudent, deleteStudent } from '../services/api';
import CustomPicker from '../components/CustomPicker';
import { useLanguage } from '../services/i18n';

export default function SuperAdminScreen({ navigation, route }) {
    const { t } = useLanguage();
    const [libraries, setLibraries] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ totalBooks: 0, totalLibraries: 0, issuedBooks: 0, totalStudents: 0 });

    
    // Form states
    const [newLibName, setNewLibName] = useState('');
    const [newLibLocation, setNewLibLocation] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');
    const [adminLibrary, setAdminLibrary] = useState('');
    
    // Student Form
    const [studName, setStudName] = useState('');
    const [studUser, setStudUser] = useState('');
    const [studPass, setStudPass] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const libs = await getLibraries();
        const adms = await getAdmins();
        const studs = await getStudents();
        const s = await getStats();
        setLibraries(libs);
        setAdmins(adms);
        setStudents(studs);
        setStats(s);
    };

    const handleCreateLibrary = async () => {
        if (!newLibName || !newLibLocation) {
            Alert.alert('Missing Info', 'Please provide library name and location');
            return;
        }
        await createLibrary(newLibName, newLibLocation);
        setNewLibName(''); setNewLibLocation('');
        fetchData();
        Alert.alert('Added', 'New library branch created successfully!');
    };

    const handleAssignAdmin = async () => {
        if (!adminName || !adminUser || !adminPass || !adminLibrary) {
            Alert.alert('Oops!', 'Please fill all admin fields');
            return;
        }
        await assignAdmin(adminName, adminUser, adminPass, adminLibrary);
        setAdminName(''); setAdminUser(''); setAdminPass(''); setAdminLibrary('');
        fetchData();
        Alert.alert('Success', 'Admin assigned to library branch');
    };
    
    const handleRegisterStudent = async () => {
        if (!studName || !studUser || !studPass) {
            Alert.alert('Missing Info', 'Please fill student details');
            return;
        }
        await createStudent(studName, studUser, studPass);
        setStudName(''); setStudUser(''); setStudPass('');
        fetchData();
        Alert.alert('Registered', 'New student account created');
    };

    const handleDeleteLibrary = async (id) => {
        Alert.alert('Remove Library?', 'This will decouple all books and admins from this branch.', [
            { text: 'Cancel' },
            { text: 'Delete Branch', style: 'destructive', onPress: async () => {
                await deleteLibrary(id);
                fetchData();
            }}
        ]);
    };

    const handleDeleteAdmin = async (id) => {
        Alert.alert('Revoke Access?', 'Are you sure you want to remove this admin?', [
            { text: 'Cancel' },
            { text: 'Revoke', style: 'destructive', onPress: async () => {
                await deleteAdmin(id);
                fetchData();
            }}
        ]);
    };
    
    const handleDeleteStudent = async (id) => {
        Alert.alert('Delete Account?', 'Remove this student from the university network?', [
            { text: 'Cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => {
                await deleteStudent(id);
                fetchData();
            }}
        ]);
    };

    const libItems = libraries.map(l => ({ label: l.name, value: l.id }));

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={[styles.headerArea, { flexDirection: 'row', alignItems: 'center' }]}>
                <Image source={require('../assets/logo.png')} style={{ width: 60, height: 60, borderRadius: 15, marginRight: 15 }} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{t('superAdmin')}</Text>
                    <Text style={styles.subtitle}>{t('adminPanelDesc')}</Text>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Super Admin', 'Central University Control Active')}>
                    <Image source={require('../assets/user.png')} style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#4f46e5' }} />
                </TouchableOpacity>
            </View>


            {/* LIVE ANALYTICS DASHBOARD */}
            <View style={styles.analyticsSection}>
                <View style={styles.analyticsHeader}>
                    <Text style={styles.sectionHeader}>📊 {t('networkHealth')}</Text>
                    <View style={styles.liveBadge}><Text style={styles.liveText}>{t('live')}</Text></View>
                </View>
                
                <View style={styles.mainStatsRow}>
                    <View style={[styles.bigStatCard, { backgroundColor: '#4f46e5' }]}>
                        <Text style={styles.bigStatVal}>{stats.totalBooks}</Text>
                        <Text style={styles.bigStatLabel}>{t('totalAssets')}</Text>
                    </View>
                    <View style={[styles.bigStatCard, { backgroundColor: '#10b981' }]}>
                        <Text style={styles.bigStatVal}>{stats.totalStudents}</Text>
                        <Text style={styles.bigStatLabel}>{t('activeUsers')}</Text>
                    </View>
                </View>

                <View style={styles.miniStatsGrid}>
                     <View style={styles.miniStatItem}>
                        <Text style={styles.miniStatVal}>{stats.totalLibraries}</Text>
                        <Text style={styles.miniStatLabel}>{t('branches')}</Text>
                    </View>
                    <View style={styles.miniStatItem}>
                        <Text style={styles.miniStatVal}>{stats.issuedBooks}</Text>
                        <Text style={styles.miniStatLabel}>{t('loansOut')}</Text>
                    </View>
                    <View style={styles.miniStatItem}>
                        <Text style={styles.miniStatVal}>{Math.round((stats.issuedBooks / (stats.totalBooks || 1)) * 100)}%</Text>
                        <Text style={styles.miniStatLabel}>{t('utilization')}</Text>
                    </View>
                </View>
            </View>

            {/* PERFORMANCE CHART SIMULATION */}
            <View style={styles.chartSection}>
                <Text style={styles.sectionHeader}>📈 {t('branchActivity')}</Text>
                <View style={styles.chartPlaceholder}>
                    {libraries.map((lib, i) => (
                        <View key={lib.id} style={styles.chartBarRow}>
                            <Text style={styles.chartLibName}>{lib.name}</Text>
                            <View style={styles.barBg}>
                                <View style={[styles.barFill, { width: `${20 + i * 15}%`, backgroundColor: i % 2 === 0 ? '#4f46e5' : '#7e22ce' }]} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>


            <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t('staffManagement')}</Text>
                <View style={styles.formCard}>
                    <TextInput style={styles.input} placeholder="Admin Full Name" value={adminName} onChangeText={setAdminName} />
                    <TextInput style={styles.input} placeholder="Username" value={adminUser} onChangeText={setAdminUser} autoCapitalize="none" />
                    <TextInput style={styles.input} placeholder="Password" value={adminPass} onChangeText={setAdminPass} secureTextEntry />
                    <Text style={styles.label}>Assign to Library:</Text>
                    <CustomPicker items={libItems} selectedValue={adminLibrary} onValueChange={setAdminLibrary} placeholder="Choose Target Branch" />
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleAssignAdmin}>
                        <Text style={styles.btnTextBold}>Register Admin</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t('studentPersonnel')}</Text>
                <View style={styles.formCard}>
                    <TextInput style={styles.input} placeholder="Student Full Name" value={studName} onChangeText={setStudName} />
                    <TextInput style={styles.input} placeholder="Student ID / Username" value={studUser} onChangeText={setStudUser} autoCapitalize="none" />
                    <TextInput style={styles.input} placeholder="Initial Password" value={studPass} onChangeText={setStudPass} secureTextEntry />
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#059669' }]} onPress={handleRegisterStudent}>
                        <Text style={styles.btnTextBold}>Add Student Account</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t('libraryNetwork')}</Text>
                <View style={styles.formCard}>
                    <TextInput style={styles.input} placeholder="Branch Name (e.g. Science Lib)" value={newLibName} onChangeText={setNewLibName} />
                    <TextInput style={styles.input} placeholder="Address / Campus" value={newLibLocation} onChangeText={setNewLibLocation} />
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#7e22ce' }]} onPress={handleCreateLibrary}>
                        <Text style={styles.btnTextBold}>Create New Branch</Text>
                    </TouchableOpacity>
                </View>
            </View>


            <Text style={styles.listTitle}>Student Directory ({students.length})</Text>
            {students.map(stud => (
                <View key={stud.id} style={styles.listItem}>
                    <View style={styles.listInfo}>
                        <Text style={styles.listMain}>{stud.name}</Text>
                        <Text style={styles.listSub}>ID: {stud.username}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteStudent(stud.id)} style={styles.deleteIconBtn}>
                        <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <Text style={[styles.listTitle, { marginTop: 25 }]}>Branch Administrators ({admins.length})</Text>
            {admins.map(admin => (
                <View key={admin.id} style={styles.listItem}>
                    <View style={styles.listInfo}>
                        <Text style={styles.listMain}>{admin.name} (@{admin.username})</Text>
                        <Text style={styles.listSub}>Branch Library ID: {admin.libraryId}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteAdmin(admin.id)} style={styles.deleteIconBtn}>
                        <Text style={styles.deleteLink}>Revoke</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}>
                <Text style={styles.logoutBtnText}>Switch Account / Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fdfdfd' },
    content: { padding: 25, paddingBottom: 100 },
    headerArea: { marginBottom: 30 },
    title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    analyticsSection: { backgroundColor: '#fff', borderRadius: 30, padding: 20, marginBottom: 30, elevation: 4 },
    analyticsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionHeader: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    liveBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    liveText: { color: '#ef4444', fontSize: 10, fontWeight: 'bold' },
    mainStatsRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    bigStatCard: { flex: 1, padding: 20, borderRadius: 25, elevation: 5 },
    bigStatVal: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    bigStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    miniStatsGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 15, borderRadius: 20 },
    miniStatItem: { alignItems: 'center', flex: 1 },
    miniStatVal: { fontSize: 17, fontWeight: 'bold', color: '#0f172a' },
    miniStatLabel: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' },
    chartSection: { marginBottom: 35 },
    chartPlaceholder: { marginTop: 15 },
    chartBarRow: { marginBottom: 15 },
    chartLibName: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 5 },
    barBg: { height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 5 },
    section: { marginBottom: 40 },
    formCard: { backgroundColor: '#fff', padding: 22, borderRadius: 25, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
    label: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 10 },
    input: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 15, marginBottom: 15, fontSize: 14, borderWidth: 1, borderColor: '#e2e8f0' },
    primaryBtn: { backgroundColor: '#1e293b', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
    btnTextBold: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    listTitle: { fontSize: 19, fontWeight: '900', color: '#0f172a', marginBottom: 15 },
    listItem: { backgroundColor: '#fff', padding: 20, borderRadius: 22, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
    listInfo: { flex: 1 },
    listMain: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
    listSub: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
    deleteIconBtn: { padding: 10 },
    deleteLink: { color: '#ef4444', fontWeight: 'bold', fontSize: 13 },
    logoutBtn: { backgroundColor: '#ef4444', padding: 20, borderRadius: 22, alignItems: 'center', marginTop: 40 },
    logoutBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 }
});




