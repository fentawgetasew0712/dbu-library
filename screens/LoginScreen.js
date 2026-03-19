import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

import { loginUser } from '../services/api';

import { useLanguage } from '../services/i18n';

export default function LoginScreen({ navigation }) {
    const { lang, t, toggleLanguage } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', t('error_fill_all'));
            return;
        }

        setLoading(true);
        try {
            const response = await loginUser(email.toLowerCase(), password);
            setLoading(false);
            
            if (response.role === 'SuperAdmin') {
                navigation.reset({ index: 0, routes: [{ name: 'SuperAdmin', params: { user: response } }] });
            } else if (response.role === 'Admin') {
                navigation.reset({ index: 0, routes: [{ name: 'Admin', params: { user: response } }] });
            } else if (response.role === 'User') {
                navigation.reset({ index: 0, routes: [{ name: 'User', params: { user: response } }] });
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Login Failed', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage}>
                <Text style={styles.langText}>{lang === 'en' ? 'አማርኛ (Amharic)' : 'English'}</Text>
            </TouchableOpacity>

            <Text style={styles.title}>DBU Digital Library</Text>
            <Text style={styles.subtitle}>Empowering Knowledge</Text>


            
            <TextInput 
                style={styles.input} 
                placeholder={lang === 'en' ? 'Username' : 'የተጠቃሚ ስም'} 
                value={email} 
                onChangeText={setEmail} 
                autoCapitalize="none" 
            />
            <TextInput 
                style={styles.input} 
                placeholder={lang === 'en' ? 'Password' : 'የይለፍ ቃል'} 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
            />
            
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{lang === 'en' ? 'Login' : 'ግባ'}</Text>}
            </TouchableOpacity>

            <Text style={styles.footerText}>Roles: Super Admin, Library Admin, User</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', padding: 25, justifyContent: 'center' },
    logoContainer: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 140, height: 140, resizeMode: 'contain', marginBottom: 20 },
    langToggle: { position: 'absolute', top: 50, right: 25, backgroundColor: '#fff', padding: 10, borderRadius: 10, elevation: 2 },
    langText: { fontWeight: 'bold', color: '#1d4ed8', fontSize: 13 },
    title: { fontSize: 28, fontWeight: '900', color: '#1d4ed8', textAlign: 'center' },
    subtitle: { fontSize: 13, color: '#6b7280', marginTop: 5, letterSpacing: 1.2, textTransform: 'uppercase' },
    input: { width: '100%', backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 15 },
    button: { width: '100%', backgroundColor: '#1d4ed8', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },

    buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
    footerText: { marginTop: 30, textAlign: 'center', color: '#6b7280', fontSize: 12 }
});

