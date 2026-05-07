import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, FlatList, Modal, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Camera, Trash2, Edit3, X, Save, LogOut } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Colors } from '../theme/colors';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, signIn, signOut } = useAuth();
  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl || null);
  const [myRelics, setMyRelics] = useState<any[]>([]);
  const [myFavorites, setMyFavorites] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'anuncios' | 'favoritos'>('anuncios');

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const loadMyRelics = async () => {
    if (user) {
      const relics = await api.fetchUserRelics(user.id);
      setMyRelics(relics);

      const favs = await api.fetchUserFavorites(user.id);
      setMyFavorites(favs);
    }
  };

  // // useFocusEffect é tipo um useEffect que roda toda vez que a gente entra na tela
  // // bom pra atualizar a lista depois que a gente anuncia uma carta nova
  useFocusEffect(
    useCallback(() => {
      loadMyRelics();
    }, [user])
  );

  const handleAvatarChange = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && user) {
      const newUri = result.assets[0].uri;
      await api.updateUserAvatar(user.id, newUri);
      setAvatarUri(newUri);
      // Atualiza o user no context pra foto aparecer em todo o app (se precisar)
      signIn({ ...user, avatarUrl: newUri });
    }
  };

  const handleSaveProfile = async () => {
    if (user) {
      try {
        await api.updateUserProfile(user.id, newNickname, newPassword);
        Alert.alert("Sucesso", "Seu pergaminho de identidade foi atualizado!");
        signIn({ ...user, nickname: newNickname || (user as any).nickname });
        setIsEditModalVisible(false);
        setNewPassword('');
      } catch (error) {
        Alert.alert("Erro", "Falha ao atualizar perfil.");
      }
    }
  };

  const handleDeleteRelic = (relicId: number) => {
    Alert.alert(
      "Destruir Relíquia?",
      "Esta ação não pode ser desfeita. A carta será removida do Mural.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Destruir", 
          style: "destructive", 
          onPress: async () => {
            if (user) {
              await api.deleteRelic(relicId, user.id);
              loadMyRelics(); // Recarrega a lista pra tirar a carta que foi deletada
            }
          }
        }
      ]
    );
  };

  const renderRelicItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.relicCard} onPress={() => navigation.navigate('Detalhes', { relicId: item.id })}>
      <Image source={{ uri: item.imageUrl ? item.imageUrl.split(',')[0] : '' }} style={styles.relicImage} />
      <View style={styles.relicInfo}>
        <Text style={styles.relicTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.relicPrice}>R$ {item.price.toFixed(2)}</Text>
      </View>
      {activeTab === 'anuncios' && (
        <TouchableOpacity onPress={() => handleDeleteRelic(item.id)} style={styles.deleteButton}>
          <Trash2 color={Colors.pergaminho} size={20} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarChange}>
          <Image 
            source={avatarUri ? { uri: avatarUri } : { uri: 'https://ui-avatars.com/api/?name=Aventureiro&background=EADBB0&color=2C1B12&size=200' }}
            style={styles.avatar} 
          />
          <View style={styles.cameraIcon}>
            <Camera color={Colors.carvalhoEscuro} size={16} />
          </View>
        </TouchableOpacity>
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Text style={styles.nickname}>{(user as any)?.nickname || 'Aventureiro Sem Nome'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.editProfileBtn} onPress={() => setIsEditModalVisible(true)}>
            <Edit3 color={Colors.pergaminho} size={16} />
            <Text style={styles.editProfileText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: Colors.rubiBordo }]} onPress={signOut}>
            <LogOut color={Colors.pergaminho} size={16} />
            <Text style={styles.editProfileText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'anuncios' && styles.tabButtonActive]} 
          onPress={() => setActiveTab('anuncios')}
        >
          <Text style={[styles.tabText, activeTab === 'anuncios' && styles.tabTextActive]}>Meus Anúncios</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'favoritos' && styles.tabButtonActive]} 
          onPress={() => setActiveTab('favoritos')}
        >
          <Text style={[styles.tabText, activeTab === 'favoritos' && styles.tabTextActive]}>Meus Favoritos</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'anuncios' ? myRelics : myFavorites}
        keyExtractor={item => item.id.toString()}
        renderItem={renderRelicItem}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>{activeTab === 'anuncios' ? 'Você ainda não anunciou nenhuma relíquia.' : 'Sua lista de desejos está vazia.'}</Text>}
      />

      {/* O Modal de Edição de Perfil que estava faltando! */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setIsEditModalVisible(false)}>
              <X color={Colors.rubiBordo} size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sua Identidade</Text>
            
            <TextInput style={styles.input} placeholder="Novo Nome de Aventureiro..." placeholderTextColor="#A08C75" value={newNickname} onChangeText={setNewNickname} />
            <TextInput style={styles.input} placeholder="Nova Senha..." placeholderTextColor="#A08C75" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
            
            <TouchableOpacity style={styles.btnSave} onPress={handleSaveProfile}>
              <Save color={Colors.carvalhoEscuro} size={20} />
              <Text style={styles.btnSaveText}>Salvar Mudanças</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// // NOTA: Crie uma pasta 'assets' na raiz do projeto e coloque uma imagem 'default-avatar.png' lá dentro.

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.carvalhoEscuro },
  header: { alignItems: 'center', padding: 20, backgroundColor: '#25160F', borderBottomWidth: 1, borderBottomColor: Colors.douradoNobre },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Colors.douradoNobre },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.douradoNobre, padding: 8, borderRadius: 20 },
  nickname: { color: Colors.douradoNobre, fontSize: 22, fontFamily: 'serif', fontWeight: 'bold' },
  email: { color: Colors.pergaminho, fontSize: 14, fontFamily: 'sans-serif', opacity: 0.8 },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.azulArcano, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginTop: 15 },
  editProfileText: { color: Colors.pergaminho, fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  tabContainer: { flexDirection: 'row', padding: 16, justifyContent: 'center', gap: 10 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.douradoNobre },
  tabButtonActive: { backgroundColor: Colors.douradoNobre },
  tabText: { color: Colors.pergaminho, fontFamily: 'serif', fontSize: 14 },
  tabTextActive: { color: Colors.carvalhoEscuro, fontWeight: 'bold' },
  emptyText: { color: Colors.pergaminho, textAlign: 'center', marginTop: 20 },
  relicCard: { flexDirection: 'row', backgroundColor: Colors.pergaminho, borderRadius: 8, padding: 10, marginBottom: 12, alignItems: 'center' },
  relicImage: { width: 50, height: 70, borderRadius: 4 },
  relicInfo: { flex: 1, marginLeft: 10 },
  relicTitle: { color: Colors.carvalhoEscuro, fontSize: 16, fontWeight: 'bold' },
  relicPrice: { color: Colors.azulArcano, fontSize: 14 },
  deleteButton: { backgroundColor: Colors.rubiBordo, padding: 10, borderRadius: 8 },
  
  // Estilos do Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: Colors.carvalhoEscuro, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.douradoNobre },
  modalClose: { alignSelf: 'flex-end', marginBottom: 10 },
  modalTitle: { fontSize: 22, fontFamily: 'serif', color: Colors.douradoNobre, textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#EADBB0', borderRadius: 8, padding: 12, marginBottom: 15, fontFamily: 'sans-serif', color: Colors.carvalhoEscuro },
  btnSave: { backgroundColor: Colors.douradoNobre, flexDirection: 'row', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  btnSaveText: { color: Colors.carvalhoEscuro, fontWeight: 'bold', marginLeft: 8, fontSize: 16 }
});
