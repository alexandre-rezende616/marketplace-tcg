import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, Modal, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, PlusCircle, Search, X } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Colors } from '../theme/colors';

export function AnunciarScreen({ navigation }: any) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  
  const [cats, setCats] = useState<any[]>([]);
  
  // Estados para as múltiplas seleções
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<number | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  
  const [isTcgModalVisible, setIsTcgModalVisible] = useState(false);
  const [tcgSearch, setTcgSearch] = useState('');

  useEffect(() => {
    api.fetchCategories().then(setCats);
  }, []);

  // Separando as categorias por tipo para renderizar na tela
  const games = cats.filter(c => c.type === 'TCG');
  const conditions = cats.filter(c => c.type === 'Condition');
  const rarities = cats.filter(c => c.type === 'Rarity');
  const languages = cats.filter(c => c.type === 'Language');
  const filteredGames = games.filter(g => g.name.toLowerCase().includes(tcgSearch.toLowerCase()));

  const pickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.7,
      });
      if (!result.canceled) {
        setImageUris([...imageUris, result.assets[0].uri]);
      }
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      if (!result.canceled) {
        const newUris = result.assets.map(a => a.uri);
        setImageUris([...imageUris, ...newUris]);
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageUris(imageUris.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePost = async () => {
    if (!title || !price || !selectedGame || !selectedCondition || !selectedRarity || !selectedLanguage || imageUris.length === 0) {
      Alert.alert('Atenção', 'O ritual falhou! Preencha todos os dados e tire uma foto da relíquia.');
      return;
    }

    try {
      const formattedPrice = parseFloat(price.replace(',', '.'));
      
      await api.addRelic(
        title, 
        formattedPrice, 
        selectedGame, 
        selectedCondition, 
        selectedRarity, 
        selectedLanguage, 
        user!.id, 
        imageUris.join(',') // Transformando a lista de fotos em um único texto para salvar!
      );
      
      Alert.alert('Sucesso!', 'Sua relíquia foi fixada no Mural da Guilda!');
      
      // Limpar formulário
      setTitle(''); setPrice(''); setImageUris([]);
      setSelectedGame(null); setSelectedCondition(null); setSelectedRarity(null); setSelectedLanguage(null);
      
      navigation.navigate('Mural');
    } catch (e) {
      Alert.alert('Erro', 'A magia falhou ao salvar a carta no banco.');
    }
  };

  // Componente auxiliar para não repetirmos código na hora de desenhar as listas
  const renderCategoryGroup = (title: string, data: any[], selectedValue: number | null, onSelect: (id: number) => void) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupLabel}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollGroup}>
        {data.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.catBadge, selectedValue === item.id && styles.catBadgeActive]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={[styles.catText, selectedValue === item.id && styles.catTextActive]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.header}>Oferecer Relíquia</Text>

        <View style={styles.imageContainer}>
          {imageUris.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }} style={{ width: '100%' }}>
              {imageUris.map((uri, idx) => (
                <View key={idx}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(idx)}>
                    <X color={Colors.pergaminho} size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>Tire a foto da carta</Text>
            </View>
          )}
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.btnPhoto} onPress={() => pickImage(true)}>
              <Camera color={Colors.pergaminho} size={20} />
              <Text style={styles.btnText}>Câmera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPhoto} onPress={() => pickImage(false)}>
              <ImageIcon color={Colors.pergaminho} size={20} />
              <Text style={styles.btnText}>Galeria</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Nome da Carta..." placeholderTextColor="#A08C75" value={title} onChangeText={setTitle} />
          <TextInput style={styles.input} placeholder="Valor em R$ (Ex: 150.00)" placeholderTextColor="#A08C75" keyboardType="numeric" value={price} onChangeText={setPrice} />
          
          <Text style={styles.groupLabel}>1. Qual o Jogo?</Text>
          <TouchableOpacity style={styles.dropdownBtn} onPress={() => setIsTcgModalVisible(true)}>
            <Text style={styles.dropdownBtnText}>
              {selectedGame ? games.find(g => g.id === selectedGame)?.name : "Pesquisar Jogo Mágico..."}
            </Text>
          </TouchableOpacity>

          {renderCategoryGroup("2. Estado de Conservação?", conditions, selectedCondition, setSelectedCondition)}
          {renderCategoryGroup("3. Nível de Raridade?", rarities, selectedRarity, setSelectedRarity)}
          {renderCategoryGroup("4. Idioma da Carta?", languages, selectedLanguage, setSelectedLanguage)}

          <TouchableOpacity style={styles.btnPrimary} onPress={handlePost}>
            <PlusCircle color={Colors.carvalhoEscuro} size={20} />
            <Text style={styles.btnPrimaryText}>Fixar no Mural</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Busca de Jogo (TCG) */}
      <Modal visible={isTcgModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setIsTcgModalVisible(false)}><X color={Colors.rubiBordo} size={24} /></TouchableOpacity>
            <Text style={styles.modalTitle}>Escolha o Jogo</Text>
            <View style={styles.searchContainer}>
              <Search color={Colors.carvalhoEscuro} size={20} />
              <TextInput style={styles.searchInput} placeholder="Buscar jogo..." placeholderTextColor="#A08C75" value={tcgSearch} onChangeText={setTcgSearch} />
            </View>
            <FlatList
              data={filteredGames}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSelectedGame(item.id); setIsTcgModalVisible(false); setTcgSearch(''); }}>
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.carvalhoEscuro },
  header: { fontSize: 24, fontFamily: 'serif', color: Colors.douradoNobre, padding: 20, textAlign: 'center' },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  imagePlaceholder: { width: 150, height: 200, backgroundColor: '#EADBB0', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.douradoNobre, borderStyle: 'dashed' },
  placeholderText: { color: Colors.carvalhoEscuro, textAlign: 'center', padding: 10, fontWeight: 'bold' },
  imagePreview: { width: 150, height: 200, borderRadius: 8, borderWidth: 2, borderColor: Colors.douradoNobre },
  removeImageBtn: { position: 'absolute', top: -10, right: -10, backgroundColor: Colors.rubiBordo, padding: 5, borderRadius: 20 },
  photoButtons: { flexDirection: 'row', marginTop: 15, gap: 15 },
  btnPhoto: { backgroundColor: Colors.azulArcano, flexDirection: 'row', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: Colors.pergaminho, fontWeight: 'bold', marginLeft: 8 },
  form: { paddingHorizontal: 0 },
  input: { backgroundColor: '#EADBB0', borderRadius: 8, padding: 12, marginBottom: 15, marginHorizontal: 20 },
  
  // Estilos dos Grupos Horizontais
  groupContainer: { marginBottom: 20 },
  groupLabel: { color: Colors.pergaminho, marginBottom: 10, fontFamily: 'serif', fontSize: 16, paddingHorizontal: 20 },
  scrollGroup: { paddingHorizontal: 20, gap: 10 },
  catBadge: { backgroundColor: Colors.carvalhoEscuro, borderWidth: 1, borderColor: Colors.pergaminho, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  catBadgeActive: { backgroundColor: Colors.douradoNobre, borderColor: Colors.douradoNobre },
  catText: { color: Colors.pergaminho },
  catTextActive: { color: Colors.carvalhoEscuro, fontWeight: 'bold' },
  
  btnPrimary: { backgroundColor: Colors.douradoNobre, flexDirection: 'row', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 10 },
  btnPrimaryText: { color: Colors.carvalhoEscuro, fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  dropdownBtn: { backgroundColor: '#EADBB0', borderRadius: 8, padding: 15, marginHorizontal: 20, marginBottom: 15, borderWidth: 1, borderColor: Colors.douradoNobre },
  dropdownBtnText: { color: Colors.carvalhoEscuro, fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '80%', backgroundColor: Colors.carvalhoEscuro, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.douradoNobre },
  modalClose: { alignSelf: 'flex-end', marginBottom: 10 },
  modalTitle: { fontSize: 22, fontFamily: 'serif', color: Colors.douradoNobre, textAlign: 'center', marginBottom: 20 },
  searchContainer: { flexDirection: 'row', backgroundColor: '#EADBB0', borderRadius: 8, alignItems: 'center', paddingHorizontal: 10, marginBottom: 15 },
  searchInput: { flex: 1, paddingVertical: 10, color: Colors.carvalhoEscuro, fontFamily: 'sans-serif', marginLeft: 8 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: Colors.azulArcano },
  dropdownItemText: { color: Colors.pergaminho, fontSize: 16 }
});
