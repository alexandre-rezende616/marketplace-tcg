import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera, Image as ImageIcon, PlusCircle, Search, X, MapPin } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Colors } from '../theme/colors';

export function AnunciarScreen({ navigation }: any) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  
  const [cats, setCats] = useState<any[]>([]);
  const [tcgs, setTcgs] = useState<any[]>([]);
  
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<number | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  
  const [isTcgModalVisible, setIsTcgModalVisible] = useState(false);
  const [tcgSearch, setTcgSearch] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    api.fetchTcgGroups().then(setTcgs);
    api.fetchCategories().then(setCats);
  }, []);

  const conditions = cats.filter(c => c.type?.toLowerCase() === 'condition');
  const languages = cats.filter(c => c.type?.toLowerCase() === 'language');
  
  const rarities = cats.filter(c => c.type?.toLowerCase() === 'rarity' && c.tcgId === selectedGame);
  const finishes = cats.filter(c => c.type?.toLowerCase() === 'finish' && c.tcgId === selectedGame);
  
  const filteredGames = tcgs.filter(g => g.name.toLowerCase().includes(tcgSearch.toLowerCase()));

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
        const newUris = result.assets.map((a: any) => a.uri);
        setImageUris([...imageUris, ...newUris]);
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageUris(imageUris.filter((_, idx) => idx !== indexToRemove));
  };

  const uploadImageToCloudinary = async (uri: string) => {
    const CLOUD_NAME = 'dbk9uavtw';
    const UPLOAD_PRESET = 'lanceraro_preset';

    try {
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      
      const response = await FileSystem.uploadAsync(uploadUrl, uri, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: 1, // 1 significa MULTIPART nas entranhas do Expo
        parameters: {
          upload_preset: UPLOAD_PRESET,
        },
      } as any); // <--- A MÁGICA AQUI: "as any" desativa o erro!

      const result = JSON.parse(response.body);

      // 🚨 O DETECTOR: Se o Cloudinary rejeitar, vai exibir na tela o motivo!
      if (response.status !== 200) {
        console.error("Erro Cloudinary detalhado:", result);
        Alert.alert('A Nuvem Recusou', result.error?.message || 'Erro desconhecido no Cloudinary.');
        return null;
      }

      return result.secure_url;
      
    } catch (e) {
      console.error("Erro crítico no FileSystem:", e);
      Alert.alert('Erro', 'O feitiço falhou e a foto não chegou à nuvem.');
      return null;
    }
  };

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
        setLocation(`${place.subregion || place.city || place.region}, ${place.region}`);
      }
    } catch (error) {
      Alert.alert('Erro', 'O feitiço de localização falhou. Tente digitar manualmente.');
    }
    setIsLocating(false);
  };

  const handlePost = async () => {
    if (!title || !price || !location || !selectedGame || !selectedCondition || !selectedLanguage || imageUris.length === 0) {
      Alert.alert('Atenção', 'O ritual falhou! Preencha todos os dados e tire uma foto da relíquia.');
      return;
    }

    setIsUploading(true);
    try {
      const formattedPrice = parseFloat(price.replace(',', '.'));

      const uploadedUrls = [];
      for (const uri of imageUris) {
        const cloudUrl = await uploadImageToCloudinary(uri);
        if (cloudUrl) {
          uploadedUrls.push(cloudUrl);
        }
      }
      
      // 🛡️ TRAVA DE SEGURANÇA: Cancela o envio se a foto não subir (evita cartas fantasmas)
      if (uploadedUrls.length === 0) {
        Alert.alert('Falha na Forja', 'As fotos não foram enviadas. O anúncio foi abortado!');
        setIsUploading(false);
        return;
      }
      
      await api.addRelic(
        title, 
        formattedPrice, 
        selectedGame, 
        selectedCondition, 
        selectedRarity, 
        selectedFinish,
        selectedLanguage, 
        user!.id, 
        uploadedUrls.join(','),
        location
      );
      
      Alert.alert('Sucesso!', 'Sua relíquia foi fixada no Mural da Guilda!');
      
      setTitle(''); setPrice(''); setImageUris([]); setLocation('');
      setSelectedGame(null); setSelectedCondition(null); setSelectedRarity(null); setSelectedFinish(null); setSelectedLanguage(null);
      
      navigation.navigate('Mural');
    } catch (e) {
      Alert.alert('Erro', 'A magia falhou ao salvar a carta no banco.');
    } finally {
      setIsUploading(false);
    }
  };

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
          
          <View style={styles.locationContainer}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0, marginHorizontal: 0 }]} placeholder="Localização (Ex: São Paulo, SP)" placeholderTextColor="#A08C75" value={location} onChangeText={setLocation} />
            <TouchableOpacity style={styles.btnLocation} onPress={handleGetLocation} disabled={isLocating}>
              {isLocating ? <ActivityIndicator color={Colors.pergaminho} size="small" /> : <MapPin color={Colors.pergaminho} size={20} />}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.groupLabel}>1. Qual o Jogo?</Text>
          <TouchableOpacity style={styles.dropdownBtn} onPress={() => setIsTcgModalVisible(true)}>
            <Text style={styles.dropdownBtnText}>
              {selectedGame ? tcgs.find(g => g.id === selectedGame)?.name : "Selecionar Jogo Matriz (TCG)..."}
            </Text>
          </TouchableOpacity>

          {selectedGame && rarities.length > 0 && renderCategoryGroup("2. Nível de Raridade?", rarities, selectedRarity, setSelectedRarity)}
          {selectedGame && finishes.length > 0 && renderCategoryGroup("3. Acabamento / Tratamento?", finishes, selectedFinish, setSelectedFinish)}
          
          {renderCategoryGroup("4. Estado de Conservação?", conditions, selectedCondition, setSelectedCondition)}
          {renderCategoryGroup("5. Idioma da Carta?", languages, selectedLanguage, setSelectedLanguage)}

          <TouchableOpacity style={styles.btnPrimary} onPress={handlePost} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator color={Colors.carvalhoEscuro} size="small" />
            ) : (
              <>
                <PlusCircle color={Colors.carvalhoEscuro} size={20} />
                <Text style={styles.btnPrimaryText}>Fixar no Mural</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

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
                <TouchableOpacity 
                  style={styles.dropdownItem} 
                  onPress={() => { 
                    setSelectedGame(item.id); 
                    setSelectedRarity(null); 
                    setSelectedFinish(null); 
                    setIsTcgModalVisible(false); 
                    setTcgSearch(''); 
                  }}>
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
  imagePlaceholder: { width: 150, height: 200, backgroundColor: '#EADBB0', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.douradoNobre, borderStyle: 'dashed', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  placeholderText: { color: Colors.carvalhoEscuro, textAlign: 'center', padding: 10, fontWeight: 'bold' },
  imagePreview: { width: 150, height: 200, borderRadius: 8, borderWidth: 2, borderColor: Colors.douradoNobre, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  removeImageBtn: { position: 'absolute', top: -10, right: -10, backgroundColor: Colors.rubiBordo, padding: 5, borderRadius: 20 },
  photoButtons: { flexDirection: 'row', marginTop: 15, gap: 15 },
  btnPhoto: { backgroundColor: Colors.azulArcano, flexDirection: 'row', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: Colors.pergaminho, fontWeight: 'bold', marginLeft: 8 },
  form: { paddingHorizontal: 0 },
  input: { backgroundColor: '#EADBB0', borderRadius: 8, padding: 12, marginBottom: 15, marginHorizontal: 20 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 15, gap: 10 },
  btnLocation: { backgroundColor: Colors.azulArcano, padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  groupContainer: { marginBottom: 20 },
  groupLabel: { color: Colors.pergaminho, marginBottom: 10, fontFamily: 'serif', fontSize: 16, paddingHorizontal: 20 },
  scrollGroup: { paddingHorizontal: 20, gap: 10 },
  catBadge: { backgroundColor: Colors.carvalhoEscuro, borderWidth: 1, borderColor: Colors.pergaminho, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  catBadgeActive: { backgroundColor: Colors.douradoNobre, borderColor: Colors.douradoNobre },
  catText: { color: Colors.pergaminho },
  catTextActive: { color: Colors.carvalhoEscuro, fontWeight: 'bold' },
  btnPrimary: { backgroundColor: Colors.douradoNobre, flexDirection: 'row', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 6 },
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