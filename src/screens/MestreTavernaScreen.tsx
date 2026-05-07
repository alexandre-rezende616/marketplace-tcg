import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Colors } from '../theme/colors';
import { Flame, BarChart3, Trash2 } from 'lucide-react-native';

const FILTER_TYPES = [
  { id: 'TCG', label: 'Jogo (TCG)' },
  { id: 'Rarity', label: 'Raridade' },
  { id: 'Finish', label: 'Acabamento' },
  { id: 'Condition', label: 'Estado' },
  { id: 'Language', label: 'Idioma' },
];

export function MestreTavernaScreen() {
  const [newCatName, setNewCatName] = useState('');
  const [selectedType, setSelectedType] = useState('TCG');
  const [stats, setStats] = useState({ totalRelics: 0, totalSold: 0, totalValue: 0 });
  const [categories, setCategories] = useState<any[]>([]);

  const loadAdminData = () => {
    api.getAdminStats().then(setStats);
    api.fetchCategories().then(setCategories);
  };

  useFocusEffect(useCallback(() => { loadAdminData(); }, []));

  const handleCreateFilter = async () => {
    if (!newCatName.trim()) {
      Alert.alert('Atenção', 'Escreva o nome do novo filtro.');
      return;
    }
    try {
      await api.addCategory(newCatName, selectedType);
      Alert.alert('Sucesso!', `Filtro "${newCatName}" forjado.`);
      setNewCatName('');
      loadAdminData();
    } catch (e) {
      Alert.alert('Erro', 'A magia falhou.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await api.deleteCategory(id);
      Alert.alert("Feito", "Filtro destruído.");
      loadAdminData();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível destruir. Existem relíquias ligadas a ele?");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Mestre da Taverna</Text>
      <Text style={styles.subtitle}>Relatórios e Forja</Text>

      <View style={styles.panel}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
          <BarChart3 color={Colors.carvalhoEscuro} size={24} style={{ marginRight: 10 }} />
          <Text style={styles.label}>Estatísticas da Guilda</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.totalRelics}</Text>
            <Text style={styles.statLabel}>Anunciadas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.totalSold}</Text>
            <Text style={styles.statLabel}>Vendidas</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: Colors.douradoNobre }]}>
            <Text style={[styles.statNumber, { color: Colors.carvalhoEscuro }]}>R$ {stats.totalValue.toFixed(2)}</Text>
            <Text style={[styles.statLabel, { color: Colors.carvalhoEscuro }]}>Movimentado</Text>
          </View>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>1. Escolha a Natureza do Filtro:</Text>
        <View style={styles.typeContainer}>
          {FILTER_TYPES.map((type) => (
            <TouchableOpacity key={type.id} style={[styles.typeBadge, selectedType === type.id && styles.typeBadgeActive]} onPress={() => setSelectedType(type.id)}>
              <Text style={[styles.typeText, selectedType === type.id && styles.typeTextActive]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>2. Nomeie o Filtro:</Text>
        <TextInput style={styles.input} placeholder="Ex: Novo Acabamento..." placeholderTextColor="#A08C75" value={newCatName} onChangeText={setNewCatName} />
        <TouchableOpacity style={styles.btnDanger} onPress={handleCreateFilter}>
          <Flame color={Colors.pergaminho} size={20} />
          <Text style={styles.btnText}>Forjar Novo Filtro</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.panel, { backgroundColor: Colors.carvalhoEscuro, borderWidth: 0 }]}>
        <Text style={[styles.label, { color: Colors.douradoNobre, fontSize: 20 }]}>Gerenciar Filtros Existentes:</Text>
        {categories.map(cat => (
          <View key={cat.id} style={styles.catListItem}>
            <Text style={styles.catListText}>{cat.name} <Text style={{opacity:0.6}}>({cat.type})</Text></Text>
            <TouchableOpacity onPress={() => handleDeleteCategory(cat.id)}>
              <Trash2 color={Colors.rubiBordo} size={24} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.carvalhoEscuro, padding: 20 },
  title: { fontSize: 28, fontFamily: 'serif', color: Colors.douradoNobre, textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 14, color: Colors.pergaminho, textAlign: 'center', marginBottom: 20 },
  panel: { backgroundColor: Colors.pergaminho, padding: 20, borderRadius: 8, borderWidth: 1, borderColor: Colors.douradoNobre, marginBottom: 20 },
  label: { color: Colors.carvalhoEscuro, fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  statBox: { flex: 1, backgroundColor: Colors.carvalhoEscuro, padding: 10, borderRadius: 8, alignItems: 'center' },
  statNumber: { color: Colors.douradoNobre, fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: Colors.pergaminho, fontSize: 12, marginTop: 4, textAlign: 'center' },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeBadge: { backgroundColor: Colors.carvalhoEscuro, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  typeBadgeActive: { backgroundColor: Colors.douradoNobre },
  typeText: { color: Colors.pergaminho },
  typeTextActive: { color: Colors.carvalhoEscuro, fontWeight: 'bold' },
  input: { backgroundColor: '#EADBB0', borderRadius: 8, padding: 12, marginBottom: 20, color: Colors.carvalhoEscuro },
  btnDanger: { backgroundColor: Colors.rubiBordo, flexDirection: 'row', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: Colors.pergaminho, fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  catListItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#3A2418', padding: 15, borderRadius: 8, marginBottom: 10 },
  catListText: { color: Colors.pergaminho, fontSize: 16, fontWeight: 'bold' }
});
