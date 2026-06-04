import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Modal, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Search, SlidersHorizontal, X, ScrollText, MapPin, Bell, Trash2 } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Colors } from '../theme/colors';

export function MuralScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [relics, setRelics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tcgs, setTcgs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isInboxVisible, setIsInboxVisible] = useState(false);
  
  const [isLocating, setIsLocating] = useState(false);
  
  const [selectedTcg, setSelectedTcg] = useState<number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<number | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTcgModalVisible, setIsTcgModalVisible] = useState(false);
  const [tcgSearch, setTcgSearch] = useState('');

  useEffect(() => {
    api.fetchTcgGroups().then(setTcgs);
    api.fetchCategories().then(setCategories);
  }, []);

  const filteredGames = tcgs.filter(g => g.name.toLowerCase().includes(tcgSearch.toLowerCase()));

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Atenção', 'A guilda precisa de permissão para ler o seu mapa (GPS).');
        setIsLocating(false);
        return;
      }

      let locationData = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync(locationData.coords);
      if (geocode.length > 0) {
        const place = geocode[0];
        setLocationQuery(`${place.subregion || place.city || place.region}, ${place.region}`);
      }
    } catch (error) {
      Alert.alert('Erro', 'O feitiço de localização falhou. Tente digitar manualmente.');
    }
    setIsLocating(false);
  };

  // Filtros Dinâmicos! Só exibe Raridade e Acabamento do TCG Selecionado.
  const conditions = categories.filter(c => c.type?.toLowerCase() === 'condition');
  const languages = categories.filter(c => c.type?.toLowerCase() === 'language');
  const rarities = categories.filter(c => c.type?.toLowerCase() === 'rarity' && c.tcgId === selectedTcg);
  const finishes = categories.filter(c => c.type?.toLowerCase() === 'finish' && c.tcgId === selectedTcg);

  const loadRelics = async () => {
    const data = await api.fetchRelics(selectedTcg, searchQuery, selectedCondition, selectedRarity, selectedFinish, selectedLanguage, locationQuery);
    // Magia da Ordem VIP: Quem tem maior nível (Ouro > Prata > Bronze > 0) vai pro topo da lista!
    const sortedData = data.sort((a: any, b: any) => (b.boostLevel || 0) - (a.boostLevel || 0));
    setRelics(sortedData);
  };

  useFocusEffect(useCallback(() => { loadRelics(); }, [selectedTcg, searchQuery, selectedCondition, selectedRarity, selectedFinish, selectedLanguage, locationQuery]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRelics();
    await loadNotifications();
    setRefreshing(false);
  }, [selectedTcg, searchQuery, selectedCondition, selectedRarity, selectedFinish, selectedLanguage, locationQuery]);

  const handleOpenInbox = () => {
    setIsInboxVisible(true);
    // Marca todas como lidas ao abrir a caixa de entrada
    notifications.filter(n => !n.isRead).forEach(async (n) => {
      await api.markNotificationRead(n.id);
    });
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = async (id: number) => {
    await api.deleteNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Define o brilho da carta baseada no pacote pago
  const getBoostStyle = (level: number) => {
    if (level === 3) return { borderColor: '#FFD700', borderWidth: 2, shadowColor: '#FFD700', shadowOpacity: 0.8, shadowRadius: 8, elevation: 10 }; // Ouro
    if (level === 2) return { borderColor: '#C0C0C0', borderWidth: 2, shadowColor: '#C0C0C0', shadowOpacity: 0.5 }; // Prata
    if (level === 1) return { borderColor: '#CD7F32', borderWidth: 2 }; // Bronze
    return {};
  };
  
  const loadNotifications = async () => {
    if (user) {
      const data = await api.fetchNotifications(user.id);
      setNotifications(data);
    }
  };

  const renderCard = ({ item }: { item: any }) => {
    const boostStyle = getBoostStyle(item.boostLevel || 0);
    return (
    <TouchableOpacity style={[styles.relicCard, boostStyle]} onPress={() => navigation.navigate('Detalhes', { relicId: item.id })}>
      <Image source={{ uri: item.imageUrl ? item.imageUrl.split(',')[0] : '' }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.relicTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.relicPrice}>R$ {item.price.toFixed(2)}</Text>
        {item.location && <Text style={{ color: Colors.douradoNobre, fontSize: 12, marginTop: 4, marginBottom: 4 }}>📍 {item.location}</Text>}
        {item.boostLevel === 3 && <Text style={{ color: '#FFD700', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>✨ Destaque Ouro</Text>}
        {item.boostLevel === 2 && <Text style={{ color: '#C0C0C0', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>✨ Destaque Prata</Text>}
        {item.boostLevel === 1 && <Text style={{ color: '#CD7F32', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>✨ Destaque Bronze</Text>}
        <View style={item.inStock ? styles.tagStock : styles.tagOut}><Text style={styles.tagText}>{item.inStock ? 'Em Estoque' : 'Vendida'}</Text></View>
      </View>
    </TouchableOpacity>
  )};

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Mural da Guilda</Text>
        {user && (
          <TouchableOpacity style={styles.bellButton} onPress={handleOpenInbox}>
            <Bell color={Colors.douradoNobre} size={28} />
            {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>}
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Search color={Colors.carvalhoEscuro} size={20} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Buscar pergaminhos..." placeholderTextColor="#A08C75" value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.filterBtn}>
          <SlidersHorizontal color={Colors.douradoNobre} size={24} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.dropdownBtn} onPress={() => setIsTcgModalVisible(true)}>
        <Text style={styles.dropdownBtnText}>
          {selectedTcg ? tcgs.find(c => c.id === selectedTcg)?.name : "Selecionar TCG para habilitar Filtros Completos..."}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={relics}
        keyExtractor={i => i.id.toString()}
        renderItem={renderCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ScrollText color={Colors.pergaminho} size={48} opacity={0.6} />
            <Text style={styles.emptyText}>
              {searchQuery ? "Nenhum pergaminho místico corresponde à sua busca." : "O mural está vazio. Seja o primeiro a anunciar!"}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.douradoNobre]} // Cor do spinner no Android
            tintColor={Colors.douradoNobre} // Cor do spinner no iOS
          />
        }
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Filtros Avançados</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}><X color={Colors.rubiBordo} size={28} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              
              <Text style={styles.modalLabel}>Filtrar Região</Text>
              <View style={styles.locationContainerModal}>
                <TextInput style={[styles.locationInput, { flex: 1, marginBottom: 0 }]} placeholder="Ex: São Paulo, Curitiba..." placeholderTextColor="#A08C75" value={locationQuery} onChangeText={setLocationQuery} />
                <TouchableOpacity style={styles.btnLocation} onPress={handleGetLocation} disabled={isLocating}>
                  {isLocating ? <ActivityIndicator color={Colors.pergaminho} size="small" /> : <MapPin color={Colors.pergaminho} size={20} />}
                </TouchableOpacity>
              </View>

              {selectedTcg ? (
                <>
                  {renderFilterGroup("Raridade do TCG Específico", rarities, selectedRarity, setSelectedRarity)}
                  {finishes.length > 0 && renderFilterGroup("Acabamento/Tratamento Especial", finishes, selectedFinish, setSelectedFinish)}
                </>
              ) : (
                <Text style={{ color: Colors.rubiBordo, marginBottom: 20, fontStyle: 'italic' }}>
                  * Selecione um Jogo (TCG) no menu anterior para desbloquear a filtragem por Raridade e Acabamento específicos.
                </Text>
              )}
              {renderFilterGroup("Estado de Conservação (Global)", conditions, selectedCondition, setSelectedCondition)}
              {renderFilterGroup("Idioma (Global)", languages, selectedLanguage, setSelectedLanguage)}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isTcgModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentTcg}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setIsTcgModalVisible(false)}><X color={Colors.rubiBordo} size={24} /></TouchableOpacity>
            <Text style={styles.modalTitle}>Mudar Dimensão de Jogo</Text>
            
            <TouchableOpacity style={[styles.dropdownItem, selectedTcg === null && { backgroundColor: Colors.azulArcano }]} onPress={() => { setSelectedTcg(null); setSelectedRarity(null); setSelectedFinish(null); setIsTcgModalVisible(false); setTcgSearch(''); }}>
              <Text style={styles.dropdownItemText}>Mostrar Todos (Raridades Ocultas)</Text>
            </TouchableOpacity>

            <View style={styles.searchContainerModal}>
              <Search color={Colors.carvalhoEscuro} size={20} />
              <TextInput style={styles.searchInput} placeholder="Buscar jogo..." placeholderTextColor="#A08C75" value={tcgSearch} onChangeText={setTcgSearch} />
            </View>
            <FlatList
              data={filteredGames}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSelectedTcg(item.id); setSelectedRarity(null); setSelectedFinish(null); setIsTcgModalVisible(false); setTcgSearch(''); }}>
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Correio da Taverna (Inbox) */}
      <Modal visible={isInboxVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Correio da Taverna</Text>
              <TouchableOpacity onPress={() => setIsInboxVisible(false)}><X color={Colors.rubiBordo} size={28} /></TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              keyExtractor={item => item.id.toString()}
              ListEmptyComponent={<Text style={{color: Colors.pergaminho, textAlign: 'center', marginVertical: 20}}>Nenhum corvo chegou para você ainda.</Text>}
              renderItem={({ item }) => (
                <View style={[styles.notificationCard, !item.isRead && { borderColor: Colors.douradoNobre }]}>
                  <View style={{flex: 1}}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteNotification(item.id)}><Trash2 color={Colors.rubiBordo} size={20} /></TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos mantidos rústicos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.carvalhoEscuro },
  headerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 16, paddingHorizontal: 16, position: 'relative' },
  header: { fontSize: 24, fontFamily: 'serif', color: Colors.douradoNobre },
  bellButton: { position: 'absolute', right: 16, top: 16 },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: Colors.rubiBordo, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: Colors.pergaminho, fontSize: 12, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#EADBB0', margin: 16, borderRadius: 8, alignItems: 'center', paddingHorizontal: 10 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, color: Colors.carvalhoEscuro, fontFamily: 'sans-serif' },
  filterBtn: { padding: 8, backgroundColor: Colors.carvalhoEscuro, borderRadius: 6, marginLeft: 8 },
  dropdownBtn: { backgroundColor: '#EADBB0', borderRadius: 8, padding: 12, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.douradoNobre },
  dropdownBtnText: { color: Colors.carvalhoEscuro, fontWeight: 'bold', textAlign: 'center', fontSize: 14 },
  catBadge: { backgroundColor: Colors.carvalhoEscuro, borderWidth: 1, borderColor: Colors.pergaminho, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  catBadgeActive: { backgroundColor: Colors.douradoNobre, borderColor: Colors.douradoNobre },
  catText: { color: Colors.pergaminho },
  catTextActive: { color: Colors.carvalhoEscuro, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText: { color: Colors.pergaminho, textAlign: 'center', marginTop: 16, fontStyle: 'italic', fontSize: 16, opacity: 0.8 },
  relicCard: { backgroundColor: Colors.pergaminho, borderRadius: 8, borderWidth: 1, borderColor: Colors.douradoNobre, marginBottom: 16, flexDirection: 'row', overflow: 'hidden', minHeight: 140, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
  image: { width: 100, minHeight: 140 },
  infoContainer: { flex: 1, padding: 12, justifyContent: 'center' },
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
  locationContainerModal: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  locationInput: { backgroundColor: '#EADBB0', borderRadius: 8, padding: 12, color: Colors.carvalhoEscuro, borderWidth: 1, borderColor: Colors.douradoNobre },
  btnLocation: { backgroundColor: Colors.azulArcano, padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  searchContainerModal: { flexDirection: 'row', backgroundColor: '#EADBB0', borderRadius: 8, alignItems: 'center', paddingHorizontal: 10, marginBottom: 15 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: Colors.azulArcano },
  dropdownItemText: { color: Colors.pergaminho, fontSize: 16 },
  notificationCard: { flexDirection: 'row', backgroundColor: '#3A2418', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: 'transparent', alignItems: 'center' },
  notificationTitle: { color: Colors.douradoNobre, fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  notificationMessage: { color: Colors.pergaminho, fontSize: 14 }
});
