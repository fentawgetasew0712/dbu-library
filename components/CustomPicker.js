import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';

export default function CustomPicker({ items, selectedValue, onValueChange, placeholder }) {
    const [modalVisible, setModalVisible] = useState(false);
    const selectedItem = items.find(i => i.value === selectedValue);

    return (
        <View>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.pickerButtonText}>{selectedItem ? selectedItem.label : placeholder}</Text>
            </TouchableOpacity>
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{placeholder}</Text>
                        <FlatList
                            data={items}
                            keyExtractor={item => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.modalItem} onPress={() => { onValueChange(item.value); setModalVisible(false); }}>
                                    <Text style={styles.modalItemText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCloseBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    pickerButton: { borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 5, marginBottom: 10, backgroundColor: '#fff', justifyContent: 'center' },
    pickerButtonText: { color: '#374151', fontSize: 14 },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 15, borderTopRightRadius: 15, padding: 20, maxHeight: '50%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#111827' },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    modalItemText: { fontSize: 16, color: '#1f2937' },
    modalCloseBtn: { marginTop: 15, padding: 15, backgroundColor: '#ef4444', borderRadius: 8, alignItems: 'center' },
    modalCloseBtnText: { color: '#fff', fontWeight: 'bold' }
});
