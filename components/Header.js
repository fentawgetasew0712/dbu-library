import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Header({ title }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#2a4494', // DBU Blue
        alignItems: 'center'
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
