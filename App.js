import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [members, setMembers] = useState([
    { id: '1', name: 'Simon Nyonga', balance: 50000, shares: 10 },
    { id: '2', name: 'Sylvia Swiah', balance: 75000, shares: 15 },
  ]);

  const [memberName, setMemberName] = useState('');
  const [contribution, setContribution] = useState('');

  // Load saved data on startup
  useEffect(() => {
    loadSaccoData();
  }, []);

  const loadSaccoData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('@sacco_members');
      if (storedData !== null) {
        setMembers(JSON.parse(storedData));
      }
    } catch (e) {
      console.error('Failed to load local data', e);
    }
  };

  const saveData = async (newMembers) => {
    try {
      await AsyncStorage.setItem('@sacco_members', JSON.stringify(newMembers));
    } catch (e) {
      console.error('Failed to save local data', e);
    }
  };

  const handleAddContribution = () => {
    if (!memberName.trim() || !contribution.trim()) {
      Alert.alert('Error', 'Please enter member name and contribution amount');
      return;
    }

    const amount = parseFloat(contribution);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const updatedMembers = members.map((m) => {
      if (m.name.toLowerCase() === memberName.trim().toLowerCase()) {
        return { ...m, balance: m.balance + amount, shares: m.shares + Math.floor(amount / 5000) };
      }
      return m;
    });

    const exists = members.some((m) => m.name.toLowerCase() === memberName.trim().toLowerCase());
    let finalMembers = updatedMembers;

    if (!exists) {
      const newMember = {
        id: Date.now().toString(),
        name: memberName.trim(),
        balance: amount,
        shares: Math.floor(amount / 5000),
      };
      finalMembers = [...members, newMember];
    }

    setMembers(finalMembers);
    saveData(finalMembers);
    setMemberName('');
    setContribution('');
    Alert.alert('Success', `Recorded ${amount} UGX for ${memberName.trim()}`);
  };

  const totalPool = members.reduce((sum, item) => sum + item.balance, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A365D" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sacco Savings Circle</Text>
        <Text style={styles.headerSub}>Total Group Savings Pool</Text>
        <Text style={styles.poolAmount}>{totalPool.toLocaleString()} UGX</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Record Contribution</Text>
        <TextInput
          style={styles.input}
          placeholder="Member Name"
          placeholderTextColor="#A0AEC0"
          value={memberName}
          onChangeText={setMemberName}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount (UGX)"
          placeholderTextColor="#A0AEC0"
          keyboardType="numeric"
          value={contribution}
          onChangeText={setContribution}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddContribution}>
          <Text style={styles.buttonText}>+ Add Entry to Ledger</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Member Ledgers ({members.length})</Text>
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.memberCard}>
              <View>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberShares}>{item.shares} Shares</Text>
              </View>
              <Text style={styles.memberBalance}>{item.balance.toLocaleString()} UGX</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { backgroundColor: '#1A365D', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: '#CBD5E0', marginTop: 4 },
  poolAmount: { fontSize: 28, fontWeight: 'bold', color: '#48BB78', marginTop: 8 },
  formCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 16, borderRadius: 12, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 10 },
  input: { backgroundColor: '#EDF2F7', padding: 12, borderRadius: 8, marginBottom: 10, fontSize: 15, color: '#2D3748' },
  button: { backgroundColor: '#2B6CB0', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  memberCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  memberName: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
  memberShares: { fontSize: 13, color: '#718096', marginTop: 2 },
  memberBalance: { fontSize: 16, fontWeight: 'bold', color: '#2F855A' },
});
