import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('savings'); // 'savings' | 'loans' | 'analytics'
  
  // States
  const [members, setMembers] = useState([
    { id: '1', name: 'Simon Nyonga', balance: 150000, shares: 30 },
    { id: '2', name: 'Sylvia Swiah', balance: 200000, shares: 40 },
  ]);
  const [loans, setLoans] = useState([
    { id: '101', borrower: 'Simon Nyonga', amount: 50000, interestRate: 10, status: 'Active' },
  ]);

  // Form Inputs
  const [memberName, setMemberName] = useState('');
  const [contribution, setContribution] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');

  // Load Saved Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedMembers = await AsyncStorage.getItem('@sacco_members_v2');
      const storedLoans = await AsyncStorage.getItem('@sacco_loans_v2');
      if (storedMembers) setMembers(JSON.parse(storedMembers));
      if (storedLoans) setLoans(JSON.parse(storedLoans));
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const saveData = async (newMembers, newLoans) => {
    try {
      await AsyncStorage.setItem('@sacco_members_v2', JSON.stringify(newMembers));
      await AsyncStorage.setItem('@sacco_loans_v2', JSON.stringify(newLoans));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  // Savings Handler
  const handleAddContribution = () => {
    if (!memberName.trim() || !contribution.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const amount = parseFloat(contribution);
    if (isNaN(amount) || amount <= 0) return;

    const exists = members.some((m) => m.name.toLowerCase() === memberName.trim().toLowerCase());
    let updatedMembers;

    if (exists) {
      updatedMembers = members.map((m) =>
        m.name.toLowerCase() === memberName.trim().toLowerCase()
          ? { ...m, balance: m.balance + amount, shares: m.shares + Math.floor(amount / 5000) }
          : m
      );
    } else {
      updatedMembers = [...members, { id: Date.now().toString(), name: memberName.trim(), balance: amount, shares: Math.floor(amount / 5000) }];
    }

    setMembers(updatedMembers);
    saveData(updatedMembers, loans);
    setMemberName('');
    setContribution('');
    Alert.alert('Saved', `Added ${amount.toLocaleString()} UGX for ${memberName.trim()}`);
  };

  // Loan Handler
  const handleIssueLoan = () => {
    if (!borrowerName.trim() || !loanAmount.trim()) {
      Alert.alert('Error', 'Please enter borrower name and loan amount');
      return;
    }
    const amount = parseFloat(loanAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newLoan = {
      id: Date.now().toString(),
      borrower: borrowerName.trim(),
      amount: amount,
      interestRate: 10, // Default 10% interest rate
      status: 'Active',
    };

    const updatedLoans = [...loans, newLoan];
    setLoans(updatedLoans);
    saveData(members, updatedLoans);
    setBorrowerName('');
    setLoanAmount('');
    Alert.alert('Loan Approved', `Issued ${amount.toLocaleString()} UGX loan to ${borrowerName.trim()}`);
  };

  const totalSavings = members.reduce((sum, item) => sum + item.balance, 0);
  const totalLoans = loans.reduce((sum, item) => sum + item.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A365D" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sacco Circle Manager</Text>
        <Text style={styles.headerSub}>Offline Savings & Micro-Loan Ledger</Text>
      </View>

      {/* Tabs Bar */}
      <View style={styles.navTabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'savings' && styles.activeTab]} onPress={() => setActiveTab('savings')}>
          <Text style={[styles.tabText, activeTab === 'savings' && styles.activeTabText]}>💰 Savings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'loans' && styles.activeTab]} onPress={() => setActiveTab('loans')}>
          <Text style={[styles.tabText, activeTab === 'loans' && styles.activeTabText]}>🤝 Loans</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'analytics' && styles.activeTab]} onPress={() => setActiveTab('analytics')}>
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>📊 Pool Stats</Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: SAVINGS */}
      {activeTab === 'savings' && (
        <ScrollView style={styles.contentContainer}>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Record Contribution</Text>
            <TextInput style={styles.input} placeholder="Member Name" placeholderTextColor="#A0AEC0" value={memberName} onChangeText={setMemberName} />
            <TextInput style={styles.input} placeholder="Amount (UGX)" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={contribution} onChangeText={setContribution} />
            <TouchableOpacity style={styles.button} onPress={handleAddContribution}>
              <Text style={styles.buttonText}>+ Add to Ledger</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Members Ledger ({members.length})</Text>
          {members.map((item) => (
            <View key={item.id} style={styles.card}>
              <View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.shares} Total Shares</Text>
              </View>
              <Text style={styles.cardHighlight}>{item.balance.toLocaleString()} UGX</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* TAB 2: LOANS */}
      {activeTab === 'loans' && (
        <ScrollView style={styles.contentContainer}>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Issue Member Loan</Text>
            <TextInput style={styles.input} placeholder="Borrower Name" placeholderTextColor="#A0AEC0" value={borrowerName} onChangeText={setBorrowerName} />
            <TextInput style={styles.input} placeholder="Loan Amount (UGX)" placeholderTextColor="#A0AEC0" keyboardType="numeric" value={loanAmount} onChangeText={setLoanAmount} />
            <TouchableOpacity style={[styles.button, { backgroundColor: '#DD6B20' }]} onPress={handleIssueLoan}>
              <Text style={styles.buttonText}>+ Issue Loan (10% Interest)</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Active Loans ({loans.length})</Text>
          {loans.map((item) => {
            const totalRepay = item.amount + (item.amount * item.interestRate) / 100;
            return (
              <View key={item.id} style={styles.card}>
                <View>
                  <Text style={styles.cardTitle}>{item.borrower}</Text>
                  <Text style={styles.cardSub}>Repayment: {totalRepay.toLocaleString()} UGX (10% int.)</Text>
                </View>
                <Text style={[styles.cardHighlight, { color: '#E53E3E' }]}>{item.amount.toLocaleString()} UGX</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* TAB 3: ANALYTICS / OVERVIEW */}
      {activeTab === 'analytics' && (
        <View style={styles.contentContainer}>
          <View style={[styles.statBox, { backgroundColor: '#E6FFFA' }]}>
            <Text style={styles.statLabel}>Total Group Savings</Text>
            <Text style={[styles.statValue, { color: '#2F855A' }]}>{totalSavings.toLocaleString()} UGX</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: '#FFFAF0' }]}>
            <Text style={styles.statLabel}>Total Outstanding Loans</Text>
            <Text style={[styles.statValue, { color: '#C05621' }]}>{totalLoans.toLocaleString()} UGX</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: '#EBF8FF' }]}>
            <Text style={styles.statLabel}>Available Cash Pool</Text>
            <Text style={[styles.statValue, { color: '#2B6CB0' }]}>{(totalSavings - totalLoans).toLocaleString()} UGX</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { backgroundColor: '#1A365D', padding: 18, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: '#CBD5E0', marginTop: 2 },
  navTabs: { flexDirection: 'row', backgroundColor: '#2D3748' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#3182CE', backgroundColor: '#1A202C' },
  tabText: { color: '#A0AEC0', fontWeight: 'bold', fontSize: 14 },
  activeTabText: { color: '#FFFFFF' },
  contentContainer: { flex: 1, padding: 16 },
  formCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, elevation: 3, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 10 },
  input: { backgroundColor: '#EDF2F7', padding: 12, borderRadius: 8, marginBottom: 10, fontSize: 15, color: '#2D3748' },
  button: { backgroundColor: '#2B6CB0', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
  cardSub: { fontSize: 13, color: '#718096', marginTop: 2 },
  cardHighlight: { fontSize: 16, fontWeight: 'bold', color: '#2F855A' },
  statBox: { padding: 20, borderRadius: 12, marginBottom: 16, alignItems: 'center', elevation: 1 },
  statLabel: { fontSize: 14, color: '#4A5568', fontWeight: '600' },
  statValue: { fontSize: 26, fontWeight: 'bold', marginTop: 6 },
});
