import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, FlatList, Modal, TextInput, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Trash2, Edit3, X, Save, LogOut, CheckCircle, HeartCrack, ScrollText, Settings, Sparkles, ShieldAlert } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { api, getErrorMessage, uploadCloudinaryImage } from '../services/api';
import { Colors } from '../theme/colors';
import { queryKeys } from '../services/queryClient';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, signIn, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl || null);
  const [activeTab, setActiveTab] = useState<'anuncios' | 'favoritos'>('anuncios');

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState(user?.phone ?? '');
  const [isUploading, setIsUploading] = useState(false);
  
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isBoostVisible, setIsBoostVisible] = useState(false);
  const [relicToBoost, setRelicToBoost] = useState<any>(null);

  const userRelicsQuery = useQuery({
    queryKey: queryKeys.userRelics(user?.id ?? 0),
    queryFn: () => api.fetchUserRelics(user!.id),
    enabled: Boolean(user),
  });
  const userFavoritesQuery = useQuery({
    queryKey: queryKeys.userFavorites(user?.id ?? 0),
    queryFn: () => api.fetchUserFavorites(user!.id),
    enabled: Boolean(user),
  });
  const myRelics = userRelicsQuery.data ?? [];
  const myFavorites = userFavoritesQuery.data ?? [];

  const onRefresh = useCallback(async () => {
    await Promise.all([userRelicsQuery.refetch(), userFavoritesQuery.refetch()]);
  }, [userFavoritesQuery.refetch, userRelicsQuery.refetch]);

  // // useFocusEffect é tipo um useEffect que roda toda vez que a gente entra na tela
  // // bom pra atualizar a lista depois que a gente anuncia uma carta nova
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.userRelics(user.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.userFavorites(user.id) });
    }, [queryClient, user])
  );

  const handleAvatarChange = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && user) {
      setIsUploading(true);
      try {
        const cloudUrl = await uploadCloudinaryImage(
          result.assets[0].uri,
          `avatar_${Date.now()}.jpg`,
        );
        await api.updateUserAvatar(user.id, cloudUrl);
        setAvatarUri(cloudUrl);
        signIn({ ...user, avatarUrl: cloudUrl });
      } catch (error) {
        Alert.alert('Erro', getErrorMessage(error, 'Falha ao enviar o retrato.'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (user) {
      try {
        await api.updateUserProfile(user.id, newNickname, newPassword, newPhone);
        Alert.alert("Sucesso", "Seu pergaminho de identidade foi atualizado!");
        signIn({
          ...user,
          nickname: newNickname || user.nickname,
          phone: newPhone || user.phone,
        });
        setIsEditModalVisible(false);
        setNewPassword('');
      } catch (error) {
        Alert.alert("Erro", getErrorMessage(error, "Falha ao atualizar perfil."));
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
              try {
                await api.deleteRelic(relicId);
                await Promise.all([
                  queryClient.invalidateQueries({ queryKey: queryKeys.userRelics(user.id) }),
                  queryClient.invalidateQueries({ queryKey: queryKeys.relics }),
                  queryClient.invalidateQueries({ queryKey: queryKeys.adminStats }),
                ]);
              } catch (error) {
                Alert.alert('Erro', getErrorMessage(error, 'Não foi possível remover o anúncio.'));
              }
            }
          }
        }
      ]
    );
  };

  const handleMarkAsSold = (relicId: number) => {
    Alert.alert(
      "Marcar como Vendida?",
      "A carta sairá do mural e ficará registrada como vendida no seu histórico.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar Venda", 
          onPress: async () => {
            if (user) {
              try {
                await api.buyRelic(relicId);
                await Promise.all([
                  queryClient.invalidateQueries({ queryKey: queryKeys.userRelics(user.id) }),
                  queryClient.invalidateQueries({ queryKey: queryKeys.relics }),
                  queryClient.invalidateQueries({ queryKey: queryKeys.adminStats }),
                ]);
              } catch (error) {
                Alert.alert('Erro', getErrorMessage(error, 'Não foi possível atualizar o anúncio.'));
              }
            }
          }
        }
      ]
    );
  };

  const handleRemoveFavorite = async (relicId: number) => {
    if (user) {
      try {
        await api.toggleFavorite(user.id, relicId);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.userFavorites(user.id) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.favoriteStatus(user.id, relicId) }),
        ]);
      } catch (error) {
        Alert.alert('Erro', getErrorMessage(error, 'Não foi possível atualizar os favoritos.'));
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert("Banimento Definitivo", "Tem certeza que deseja apagar sua conta? Essa ação não tem volta!", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir Tudo", style: "destructive", onPress: async () => {
        if (user) {
          try {
            await api.deleteAccount(user.id);
            signOut();
          } catch (error) {
            Alert.alert('Erro', getErrorMessage(error, 'Não foi possível excluir a conta.'));
          }
        }
      }}
    ]);
  };

  const handleBuyBoost = async (level: number, priceStr: string) => {
    if (!relicToBoost || !user) return;

    Alert.alert(
      "Gerar Pagamento",
      `Deseja ir para o AbacatePay gerar a cobrança PIX de ${priceStr}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Ir para Pagamento", onPress: async () => {
            try {
              const billingInfo = await api.generatePixBilling(relicToBoost.id, level, user.email);
              if (!billingInfo?.checkoutUrl) {
                throw new Error('A resposta do pagamento não contém um link de checkout.');
              }

              await Linking.openURL(billingInfo.checkoutUrl);
              setIsBoostVisible(false);
              await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.userRelics(user.id) }),
                queryClient.invalidateQueries({ queryKey: queryKeys.relics }),
              ]);
            } catch (error) {
              Alert.alert('Erro', getErrorMessage(error, 'A guilda não conseguiu gerar o pagamento.'));
            }
        }}
      ]
    );
  };

  const formatBoostDate = (dateData: any) => {
    if (!dateData) return '...';
    if (Array.isArray(dateData)) {
      const [y, m, d] = dateData;
      return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    }
    return new Date(dateData).toLocaleDateString('pt-BR');
  };

  const renderRelicItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.relicCard} onPress={() => navigation.navigate('Detalhes', { relicId: item.id })}>
      <Image source={{ uri: item.imageUrl ? item.imageUrl.split(',')[0] : '' }} style={styles.relicImage} />
      <View style={styles.relicInfo}>
        <Text style={styles.relicTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.relicPrice}>R$ {item.price.toFixed(2)}</Text>
      </View>
      {activeTab === 'anuncios' && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {item.inStock && (
            <TouchableOpacity onPress={() => handleMarkAsSold(item.id)} style={[styles.deleteButton, { backgroundColor: Colors.verdeFloresta }]}>
              <CheckCircle color={Colors.pergaminho} size={20} />
            </TouchableOpacity>
          )}
          {item.inStock && (item.boostLevel || 0) === 0 && (
            <TouchableOpacity onPress={() => { setRelicToBoost(item); setIsBoostVisible(true); }} style={[styles.deleteButton, { backgroundColor: Colors.douradoNobre }]}>
              <Sparkles color={Colors.carvalhoEscuro} size={20} />
            </TouchableOpacity>
          )}
          
          {/* Aviso de validade do VIP */}
          {item.inStock && (item.boostLevel || 0) > 0 && (
            <View style={{ backgroundColor: '#2C1B12', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, justifyContent: 'center' }}>
              <Text style={{ color: Colors.douradoNobre, fontSize: 10, fontWeight: 'bold' }}>Destaque Ativo</Text>
              <Text style={{ color: Colors.pergaminho, fontSize: 10, marginTop: 2 }}>
                Até {formatBoostDate(item.boostExpiresAt)}
              </Text>
            </View>
          )}

          <TouchableOpacity onPress={() => handleDeleteRelic(item.id)} style={styles.deleteButton}>
            <Trash2 color={Colors.pergaminho} size={20} />
          </TouchableOpacity>
        </View>
      )}
      {activeTab === 'favoritos' && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => handleRemoveFavorite(item.id)} style={[styles.deleteButton, { backgroundColor: Colors.carvalhoEscuro }]}>
            <HeartCrack color={Colors.pergaminho} size={20} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarChange} disabled={isUploading}>
          {isUploading ? (
            <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#EADBB0' }]}>
              <ActivityIndicator size="large" color={Colors.carvalhoEscuro} />
            </View>
          ) : (
            <>
              <Image source={avatarUri ? { uri: avatarUri } : { uri: 'https://ui-avatars.com/api/?name=Aventureiro&background=EADBB0&color=2C1B12&size=200' }} style={styles.avatar} />
              <View style={styles.cameraIcon}>
                <Camera color={Colors.carvalhoEscuro} size={16} />
              </View>
            </>
          )}
        </TouchableOpacity>
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Text style={styles.nickname}>{(user as any)?.nickname || 'Aventureiro Sem Nome'} (ID: {user?.id})</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.editProfileBtn} onPress={() => setIsEditModalVisible(true)}>
            <Edit3 color={Colors.pergaminho} size={16} />
            <Text style={styles.editProfileText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: '#3A2418' }]} onPress={() => setIsSettingsVisible(true)}>
            <Settings color={Colors.pergaminho} size={16} />
            <Text style={styles.editProfileText}>Configurações</Text>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ScrollText color={Colors.pergaminho} size={48} opacity={0.6} />
            <Text style={styles.emptyText}>
              {activeTab === 'anuncios' && userRelicsQuery.isLoading
                ? 'Carregando seus anúncios...'
                : activeTab === 'favoritos' && userFavoritesQuery.isLoading
                  ? 'Carregando seus favoritos...'
                  : (activeTab === 'anuncios' ? userRelicsQuery.isError : userFavoritesQuery.isError)
                    ? 'Não foi possível carregar esta lista. Puxe para atualizar.'
                    : activeTab === 'anuncios'
                      ? 'Você ainda não forjou nenhuma relíquia.'
                      : 'Sua lista de desejos está vazia.'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
              refreshing={userRelicsQuery.isRefetching || userFavoritesQuery.isRefetching}
            onRefresh={onRefresh}
            colors={[Colors.douradoNobre]}
            tintColor={Colors.douradoNobre}
          />
        }
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
            <TextInput style={styles.input} placeholder="WhatsApp (Ex: 5511999999999)" placeholderTextColor="#A08C75" keyboardType="phone-pad" value={newPhone} onChangeText={setNewPhone} />
            
            <TouchableOpacity style={styles.btnSave} onPress={handleSaveProfile}>
              <Save color={Colors.carvalhoEscuro} size={20} />
              <Text style={styles.btnSaveText}>Salvar Mudanças</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Configurações */}
      <Modal visible={isSettingsVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setIsSettingsVisible(false)}>
              <X color={Colors.rubiBordo} size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Configurações</Text>
            
            <TouchableOpacity style={styles.settingsItem} onPress={() => Alert.alert("Sobre", "Lance Raro - Versão 1.0.0")}>
              <Text style={styles.settingsItemText}>📜 Sobre o Lance Raro</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem} onPress={() => Alert.alert("Políticas", "A Guilda não se responsabiliza por goblins ladrões de cartas.")}>
              <Text style={styles.settingsItemText}>⚖️ Políticas e Termos de Uso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingsItem, { borderBottomWidth: 0 }]} onPress={signOut}>
              <LogOut color={Colors.rubiBordo} size={20} />
              <Text style={[styles.settingsItemText, { color: Colors.rubiBordo, marginLeft: 10 }]}>Desconectar da Taverna</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 30 }}>
              <TouchableOpacity style={styles.btnDanger} onPress={handleDeleteAccount}>
                <ShieldAlert color={Colors.pergaminho} size={20} />
                <Text style={styles.btnDangerText}>Excluir Conta Definitivamente</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Impulsionamento (Boost VIP) */}
      <Modal visible={isBoostVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setIsBoostVisible(false)}>
              <X color={Colors.rubiBordo} size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>✨ Destaque VIP ✨</Text>
            <Text style={{ color: Colors.pergaminho, textAlign: 'center', marginBottom: 20 }}>Chame a atenção dos aventureiros e venda muito mais rápido!</Text>
            <TouchableOpacity style={[styles.boostOption, { borderColor: '#CD7F32' }]} onPress={() => handleBuyBoost(1, 'R$ 5,00')}><Text style={[styles.boostOptionTitle, { color: '#CD7F32' }]}>🥉 Destaque Bronze (R$ 5,00)</Text><Text style={styles.boostOptionDesc}>Borda bronzeada. Sobe posições no Mural por 3 dias.</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.boostOption, { borderColor: '#C0C0C0' }]} onPress={() => handleBuyBoost(2, 'R$ 10,00')}><Text style={[styles.boostOptionTitle, { color: '#C0C0C0' }]}>🥈 Destaque Prata (R$ 10,00)</Text><Text style={styles.boostOptionDesc}>Borda prateada brilhante. Alta prioridade nas buscas por 7 dias.</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.boostOption, { borderColor: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.1)' }]} onPress={() => handleBuyBoost(3, 'R$ 25,00')}><Text style={[styles.boostOptionTitle, { color: '#FFD700' }]}>🥇 Destaque Ouro (R$ 25,00)</Text><Text style={styles.boostOptionDesc}>O ápice do luxo! Topo absoluto do Mural com borda mágica por 30 dias.</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// // NOTA: criar uma pasta 'assets' na raiz do projeto e colocar uma imagem de 'default-avatar.png' lá dentro

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.carvalhoEscuro },
  header: { alignItems: 'center', padding: 20, backgroundColor: '#25160F', borderBottomWidth: 1, borderBottomColor: Colors.douradoNobre },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Colors.douradoNobre, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 8 },
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
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50, paddingHorizontal: 20 },
  emptyText: { color: Colors.pergaminho, textAlign: 'center', marginTop: 16, fontStyle: 'italic', fontSize: 14, opacity: 0.8 },
  relicCard: { flexDirection: 'row', backgroundColor: Colors.pergaminho, borderRadius: 8, padding: 10, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
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
  btnSaveText: { color: Colors.carvalhoEscuro, fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  settingsItem: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: Colors.azulArcano, alignItems: 'center' },
  settingsItemText: { color: Colors.pergaminho, fontSize: 16, fontFamily: 'serif' },
  btnDanger: { backgroundColor: Colors.rubiBordo, flexDirection: 'row', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnDangerText: { color: Colors.pergaminho, fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  boostOption: { borderWidth: 2, padding: 15, borderRadius: 10, marginBottom: 15, backgroundColor: '#2C1B12' },
  boostOptionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  boostOptionDesc: { color: Colors.pergaminho, fontSize: 14, opacity: 0.9 }
});
