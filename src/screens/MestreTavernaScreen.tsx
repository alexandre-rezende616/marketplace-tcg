import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Colors } from '../theme/colors';
import { Flame, BarChart3, Trash2, ShieldAlert } from 'lucide-react-native';

const FILTER_TYPES = [
  { id: 'TCG', label: 'Jogo Matriz (TCG)' },
  { id: 'Rarity', label: 'Raridade' },
  { id: 'Finish', label: 'Acabamento/Foil' },
  { id: 'Condition', label: 'Estado (Global)' },
  { id: 'Language', label: 'Idioma (Global)' },
];

export function MestreTavernaScreen() {
  const [newCatName, setNewCatName] = useState('');
  const [selectedType, setSelectedType] = useState('TCG');
  
  const [tcgs, setTcgs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalRelics: 0, totalSold: 0, totalValue: 0 });
  
  const [selectedTcgForNewCat, setSelectedTcgForNewCat] = useState<number | null>(null);

  const loadAdminData = () => {
    api.getAdminStats().then(setStats);
    api.fetchTcgGroups().then(setTcgs);
    api.fetchCategories().then(setCategories);
  };

  useFocusEffect(useCallback(() => { loadAdminData(); }, []));

  const handleCreateFilter = async () => {
    if (!newCatName.trim()) {
      Alert.alert('Atenção', 'Escreva o nome do novo filtro.');
      return;
    }
    
    if ((selectedType === 'Rarity' || selectedType === 'Finish') && !selectedTcgForNewCat) {
      Alert.alert('Regra Taxonômica', 'Raridades e Acabamentos PRECISAM ser associados a um Jogo Matriz (TCG).');
      return;
    }

    try {
      if (selectedType === 'TCG') {
        await api.addTcgGroup(newCatName);
      } else {
        const isGlobal = selectedType === 'Condition' || selectedType === 'Language';
        await api.addCategory(newCatName, selectedType, isGlobal ? null : selectedTcgForNewCat);
      }
      
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
      Alert.alert("Expurgação", "Filtro destruído.");
      loadAdminData();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível destruir.");
    }
  };

  const globalCats = categories.filter(c => !c.tcgId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Painel Taxonômico</Text>
      <Text style={styles.subtitle}>Mestre da Taverna</Text>

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
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>1. Escolha a Natureza:</Text>
        <View style={styles.typeContainer}>
          {FILTER_TYPES.map((type) => (
            <TouchableOpacity key={type.id} style={[styles.typeBadge, selectedType === type.id && styles.typeBadgeActive]} onPress={() => setSelectedType(type.id)}>
              <Text style={[styles.typeText, selectedType === type.id && styles.typeTextActive]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {(selectedType === 'Rarity' || selectedType === 'Finish') && (
          <>
            <Text style={styles.label}>2. Vincule a qual Jogo (TCG):</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginBottom: 20 }}>
              {tcgs.map(tcg => (
                <TouchableOpacity key={tcg.id} style={[styles.typeBadge, selectedTcgForNewCat === tcg.id && { backgroundColor: Colors.verdeFloresta }]} onPress={() => setSelectedTcgForNewCat(tcg.id)}>
                  <Text style={styles.typeText}>{tcg.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.label}>{(selectedType === 'Rarity' || selectedType === 'Finish') ? '3. Nomeie a Variante:' : '2. Nomeie o Filtro:'}</Text>
        <TextInput style={styles.input} placeholder="Ex: Cold Foil..." placeholderTextColor="#A08C75" value={newCatName} onChangeText={setNewCatName} />
        <TouchableOpacity style={styles.btnDanger} onPress={handleCreateFilter}>
          <Flame color={Colors.pergaminho} size={20} />
          <Text style={styles.btnText}>Forjar Nova Regra</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.panel, { backgroundColor: Colors.carvalhoEscuro, borderWidth: 0 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
          <ShieldAlert color={Colors.douradoNobre} size={24} style={{ marginRight: 10 }} />
          <Text style={[styles.label, { color: Colors.douradoNobre, fontSize: 20, marginBottom: 0 }]}>Catálogo Taxonômico:</Text>
        </View>

        <Text style={styles.groupHeader}>Filtros Globais (Condição / Idioma)</Text>
        {globalCats.map(cat => (
          <View key={cat.id} style={styles.catListItem}>
            <Text style={styles.catListText}>{cat.name} <Text style={{opacity:0.6}}>({cat.type})</Text></Text>
            <TouchableOpacity onPress={() => handleDeleteCategory(cat.id)}><Trash2 color={Colors.rubiBordo} size={20} /></TouchableOpacity>
          </View>
        ))}

        {tcgs.map(tcg => {
          const tcgCats = categories.filter(c => c.tcgId === tcg.id);
          return (
            <View key={`tcg-${tcg.id}`} style={styles.tcgGroupContainer}>
              <Text style={styles.tcgGroupTitle}>{tcg.name}</Text>
              {tcgCats.length === 0 ? (
                <Text style={{color: Colors.pergaminho, fontStyle: 'italic', marginBottom: 10, paddingHorizontal: 10}}>Sem raridades ou tratamentos forjados.</Text>
              ) : (
                tcgCats.map(cat => (
                  <View key={cat.id} style={[styles.catListItem, { backgroundColor: '#2C1B12' }]}>
                    <Text style={styles.catListText}>{cat.name} <Text style={{opacity:0.6}}>({cat.type})</Text></Text>
                    <TouchableOpacity onPress={() => handleDeleteCategory(cat.id)}><Trash2 color={Colors.rubiBordo} size={20} /></TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )
        })}
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
  catListItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#3A2418', padding: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  catListText: { color: Colors.pergaminho, fontSize: 14, fontWeight: 'bold' },
  groupHeader: { color: Colors.pergaminho, fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 5, borderBottomWidth: 1, borderBottomColor: Colors.azulArcano, paddingBottom: 5 },
  tcgGroupContainer: { marginTop: 15, backgroundColor: '#3A2418', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.douradoNobre },
  tcgGroupTitle: { color: Colors.douradoNobre, fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }
});
