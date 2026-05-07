import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';

import { api } from '../services/api';
import { Colors } from '../theme/colors';

export function MuralScreen() {
  const navigation = useNavigation<any>();
  const [relics, setRelics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<number | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTcgModalVisible, setIsTcgModalVisible] = useState(false);
  const [tcgSearch, setTcgSearch] = useState('');

  useEffect(() => {
    api.fetchCategories().then(setCategories);
  }, []);

  const tcgCats = categories.filter(c => c.type === 'TCG');
  const conditions = categories.filter(c => c.type === 'Condition');
  const rarities = categories.filter(c => c.type === 'Rarity');
  const languages = categories.filter(c => c.type === 'Language');

  const filteredGames = tcgCats.filter(g => g.name.toLowerCase().includes(tcgSearch.toLowerCase()));

  const loadRelics = async () => {
    const data = await api.fetchRelics(selectedCat, searchQuery, selectedCondition, selectedRarity, selectedLanguage);
    setRelics(data);
  };

  useFocusEffect(useCallback(() => { loadRelics(); }, [selectedCat, searchQuery, selectedCondition, selectedRarity, selectedLanguage]));

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.relicCard} onPress={() => navigation.navigate('Detalhes', { relicId: item.id })}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}><Text style={styles.placeholderText}>Sem Imagem</Text></View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.relicTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.relicPrice}>R$ {item.price.toFixed(2)}</Text>
        <View style={item.inStock ? styles.tagStock : styles.tagOut}>
          <Text style={styles.tagText}>{item.inStock ? 'Em Estoque' : 'Vendida'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterGroup = (title: string, data: any[], selected: number | null, onSelect: (id: number | null) => void) => (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.modalLabel}>{title}</Text>
      <View style={styles.modalTagsContainer}>
        <TouchableOpacity style={[styles.catBadge, selected === null && styles.catBadgeActive]} onPress={() => onSelect(null)}>
          <Text style={[styles.catText, selected === null && styles.catTextActive]}>Todos</Text>
        </TouchableOpacity>
        {data.map(item => (
          <TouchableOpacity key={item.id} style={[styles.catBadge, selected === item.id && styles.catBadgeActive]} onPress={() => onSelect(item.id)}>
            <Text style={[styles.catText, selected === item.id && styles.catTextActive]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mural da Guilda</Text>
      
      <View style={styles.searchContainer}>
        <Search color={Colors.carvalhoEscuro} size={20} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Buscar pergaminhos..." placeholderTextColor="#A08C75" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.filterBtn}>
          <SlidersHorizontal color={Colors.douradoNobre} size={24} />
        </TouchableOpacity>
      </View>

      {/* Botão de Filtro de Jogo */}
      <TouchableOpacity style={styles.dropdownBtn} onPress={() => setIsTcgModalVisible(true)}>
        <Text style={styles.dropdownBtnText}>
          {selectedCat ? tcgCats.find(c => c.id === selectedCat)?.name : "Filtrar por Jogo Específico..."}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={relics}
        keyExtractor={i => i.id.toString()}
        renderItem={renderCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma relíquia encontrada.</Text>}
      />

      {/* Modal de Filtros Avançados */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Filtros Mágicos</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}><X color={Colors.rubiBordo} size={28} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderFilterGroup("Estado de Conservação", conditions, selectedCondition, setSelectedCondition)}
              {renderFilterGroup("Nível de Raridade", rarities, selectedRarity, setSelectedRarity)}
              {renderFilterGroup("Idioma", languages, selectedLanguage, setSelectedLanguage)}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Busca de Jogo (TCG) */}
      <Modal visible={isTcgModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentTcg}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setIsTcgModalVisible(false)}><X color={Colors.rubiBordo} size={24} /></TouchableOpacity>
            <Text style={styles.modalTitle}>Qual Jogo deseja ver?</Text>
            
            <TouchableOpacity style={[styles.dropdownItem, selectedCat === null && { backgroundColor: Colors.azulArcano }]} onPress={() => { setSelectedCat(null); setIsTcgModalVisible(false); setTcgSearch(''); }}>
              <Text style={styles.dropdownItemText}>Mostrar Todos os Jogos</Text>
            </TouchableOpacity>

            <View style={styles.searchContainerModal}>
              <Search color={Colors.carvalhoEscuro} size={20} />
              <TextInput style={styles.searchInput} placeholder="Buscar jogo..." placeholderTextColor="#A08C75" value={tcgSearch} onChangeText={setTcgSearch} />
            </View>
            <FlatList
              data={filteredGames}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSelectedCat(item.id); setIsTcgModalVisible(false); setTcgSearch(''); }}>
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.carvalhoEscuro },
  header: { fontSize: 24, fontFamily: 'serif', color: Colors.douradoNobre, paddingTop: 16, paddingHorizontal: 16, textAlign: 'center' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#EADBB0', margin: 16, borderRadius: 8, alignItems: 'center', paddingHorizontal: 10 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, color: Colors.carvalhoEscuro, fontFamily: 'sans-serif' },
  filterBtn: { padding: 8, backgroundColor: Colors.carvalhoEscuro, borderRadius: 6, marginLeft: 8 },
  dropdownBtn: { backgroundColor: '#EADBB0', borderRadius: 8, padding: 12, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.douradoNobre },
  dropdownBtnText: { color: Colors.carvalhoEscuro, fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  catBadge: { backgroundColor: Colors.carvalhoEscuro, borderWidth: 1, borderColor: Colors.pergaminho, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  catBadgeActive: { backgroundColor: Colors.douradoNobre, borderColor: Colors.douradoNobre },
  catText: { color: Colors.pergaminho },
  catTextActive: { color: Colors.carvalhoEscuro, fontWeight: 'bold' },
  emptyText: { color: Colors.pergaminho, textAlign: 'center', marginTop: 40, fontStyle: 'italic' },
  relicCard: { backgroundColor: Colors.pergaminho, borderRadius: 8, borderWidth: 1, borderColor: Colors.douradoNobre, marginBottom: 16, flexDirection: 'row', overflow: 'hidden', height: 120 },
  image: { width: 90, height: '100%' },
  imagePlaceholder: { width: 90, height: '100%', backgroundColor: '#EADBB0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: Colors.carvalhoEscuro, fontSize: 12 },
  infoContainer: { flex: 1, padding: 12, justifyContent: 'space-around' },
  relicTitle: { fontSize: 16, fontFamily: 'serif', color: Colors.carvalhoEscuro, fontWeight: 'bold' },
  relicPrice: { fontSize: 16, fontFamily: 'sans-serif', color: Colors.azulArcano },
  tagStock: { backgroundColor: Colors.verdeFloresta, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagOut: { backgroundColor: Colors.rubiBordo, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagText: { color: Colors.pergaminho, fontSize: 12, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.pergaminho, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalContentTcg: { backgroundColor: Colors.carvalhoEscuro, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%', borderWidth: 1, borderColor: Colors.douradoNobre },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontFamily: 'serif', color: Colors.douradoNobre, fontWeight: 'bold', marginBottom: 15 },
  modalLabel: { fontSize: 16, fontFamily: 'serif', color: Colors.carvalhoEscuro, marginBottom: 10, fontWeight: 'bold' },
  modalTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modalClose: { alignSelf: 'flex-end', marginBottom: -30, zIndex: 10 },
  searchContainerModal: { flexDirection: 'row', backgroundColor: '#EADBB0', borderRadius: 8, alignItems: 'center', paddingHorizontal: 10, marginBottom: 15 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: Colors.azulArcano },
  dropdownItemText: { color: Colors.pergaminho, fontSize: 16 }
});
