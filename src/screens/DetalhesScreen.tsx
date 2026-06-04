import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions, Modal, Linking } from 'react-native';
import { Heart, MessageCircle, ArrowLeft, Star } from 'lucide-react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

import { Colors } from '../theme/colors';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const conditionDescriptions: Record<string, string> = {
  'Mint (M)': 'A carta está absolutamente perfeita, sem nenhum arranhão, marca de manuseio ou imperfeição de fábrica.',
  'Near Mint (NM)': 'Perfeita ou quase perfeita. Pode apresentar marcas microscópicas ou um ponto minúsculo e imperceptível na borda resultante da abertura do booster.',
  'Slightly Played (SP/LP)': 'Apresenta pequenos sinais de uso, como leves desgastes nas bordas, pequenos arranhões no verso ou marcas de sleeve.',
  'Moderately Played (MP)': 'Possui sinais evidentes de uso em torneios, como esbranquiçamento perceptível nas bordas e cantos, mas mantém integridade estrutural.',
  'Heavily Played (HP)': 'Apresenta desgastes severos, sujeira acumulada, marcas de dobra leves, rasgos minúsculos ou marcações.',
  'Damaged (DM)': 'Danos estruturais graves, como dobras profundas (bend tests), partes rasgadas, marcas de água, rabiscos ou rasgos permanentes.'
};

const screenWidth = Dimensions.get('window').width;

export function DetalhesScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { relicId } = route.params; // Agora recebemos só o ID
  
  const [relic, setRelic] = useState<any>(null); // Estado para guardar os detalhes completos
  const [isFavorite, setIsFavorite] = useState(false);
  const [isViewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    // // quando a tela abre, a gente usa o ID pra buscar todos os detalhes da carta no banco
    const loadDetails = async () => {
      let data = await api.fetchRelicDetails(relicId);
      
      // Buscar nome e telefone reais do vendedor
      if (data && data.userId) {
        const seller = await api.fetchUserDetails(data.userId);
        if (seller) {
          data = { ...data, sellerName: seller.nickname, sellerPhone: seller.phone } as any;
        }
      }
      
      setRelic(data);

      // Checa se o usuário atual favoritou essa carta
      if (user) {
        const favStatus = await api.checkIsFavorite(user.id, relicId);
        setIsFavorite(favStatus);
      }
    };
    loadDetails();
  }, [relicId, user]);

  const handleToggleFavorite = async () => {
    if (user) {
      const newStatus = await api.toggleFavorite(user.id, relic.id);
      setIsFavorite(newStatus);
    } else {
      Alert.alert("Aviso", "Você precisa estar logado para favoritar!");
    }
  };

  const handleWhatsAppChat = () => {
    const phone = relic?.sellerPhone;
    if (!phone) {
      Alert.alert("Correio da Guilda", "Este vendedor não cadastrou um WhatsApp no perfil dele!");
      return;
    }
    
    // Remove tudo que não for número (ex: caso o usuário digite parênteses ou traços)
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Saudações! Vi sua relíquia "${relic.title}" no Lance Raro. Ainda está disponível?`;
    const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert("Erro de Invocação", "O feitiço falhou! Parece que o WhatsApp não está instalado no seu dispositivo.");
      }
    }).catch(err => console.error("Erro no Linking", err));
  };

  const handleConditionInfo = (conditionName: string) => {
    const desc = conditionDescriptions[conditionName] || "Estado de conservação da relíquia.";
    Alert.alert(`Conservação: ${conditionName}`, desc);
  };

  // Tela de loading enquanto busca os dados
  if (!relic) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.carvalhoEscuro }}>
        <ActivityIndicator size="large" color={Colors.douradoNobre} />
      </View>
    );
  }

  const images = relic.imageUrl ? relic.imageUrl.split(',') : [];
  const viewerImages = images.map((url: string) => ({ url }));

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft color={Colors.pergaminho} size={28} />
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        {images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {images.map((uri: string, idx: number) => (
              <TouchableOpacity key={idx} onPress={() => { setViewerIndex(idx); setViewerVisible(true); }}>
                <Image source={{ uri }} style={{ width: screenWidth, height: '100%' }} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.imagePlaceholder}><Text style={styles.placeholderText}>Relíquia sem registro visual</Text></View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{relic.title}</Text>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Heart color={isFavorite ? Colors.rubiBordo : Colors.azulArcano} fill={isFavorite ? Colors.rubiBordo : 'transparent'} size={28} />
          </TouchableOpacity>
        </View>

        <Text style={styles.price}>R$ {relic.price.toFixed(2)}</Text>
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Informações do Vendedor</Text>
        <View style={styles.sellerContainer}>
          <View>
            <Text style={styles.sellerName}>{relic.sellerName || `Aventureiro #${relic.userId}`}</Text>
            <View style={styles.stars}>
              {[1,2,3,4,5].map(s => <Star key={s} color={Colors.douradoNobre} fill={Colors.douradoNobre} size={16} />)}
              <Text style={styles.ratingText}>(Vendedor)</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btnChat} onPress={handleWhatsAppChat}><MessageCircle color={Colors.pergaminho} size={20} /></TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Tags Dinâmicas com os dados reais do banco */}
        <Text style={styles.sectionTitle}>Detalhes da Relíquia</Text>
        <View style={styles.tagsContainer}>
          {relic.location && <View style={[styles.tag, { backgroundColor: Colors.verdeFloresta }]}><Text style={[styles.tagText, { color: Colors.pergaminho }]}>📍 {relic.location}</Text></View>}
          {relic.tcgName && <View style={[styles.tag, { backgroundColor: Colors.douradoNobre }]}><Text style={styles.tagText}>{relic.tcgName}</Text></View>}
          {relic.conditionName && (
            <TouchableOpacity onPress={() => handleConditionInfo(relic.conditionName)}>
              <View style={styles.tag}><Text style={styles.tagText}>{relic.conditionName} ℹ️</Text></View>
            </TouchableOpacity>
          )}
          {relic.rarityName && <View style={styles.tag}><Text style={styles.tagText}>{relic.rarityName}</Text></View>}
          {relic.finishName && <View style={styles.tag}><Text style={styles.tagText}>{relic.finishName}</Text></View>}
          {relic.languageName && <View style={styles.tag}><Text style={styles.tagText}>{relic.languageName}</Text></View>}
        </View>
      </View>

      {relic.inStock && relic.userId !== user?.id && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnBuyFull} onPress={handleWhatsAppChat}>
            <MessageCircle color={Colors.carvalhoEscuro} size={24} />
            <Text style={styles.btnBuyText}>Negociar com o Vendedor</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal para ver a imagem em tela cheia com zoom */}
      <Modal visible={isViewerVisible} transparent={true} onRequestClose={() => setViewerVisible(false)}>
        <ImageViewer
          imageUrls={viewerImages}
          index={viewerIndex}
          onCancel={() => setViewerVisible(false)}
          enableSwipeDown
        />
      </Modal>
    </ScrollView>
  );
}

// Os estilos (styles) continuam os mesmos do passo anterior, não precisa mudar.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.carvalhoEscuro },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10, backgroundColor: 'rgba(44, 27, 18, 0.6)', padding: 8, borderRadius: 20 },
  imageContainer: { width: '100%', height: 400, backgroundColor: '#1A0F0A' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EADBB0' },
  placeholderText: { color: Colors.carvalhoEscuro, fontSize: 16 },
  content: { padding: 20, backgroundColor: Colors.carvalhoEscuro, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 26, fontFamily: 'serif', color: Colors.pergaminho, flex: 1, marginRight: 10, fontWeight: 'bold' },
  price: { fontSize: 24, fontFamily: 'sans-serif', color: Colors.douradoNobre, marginTop: 10, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: Colors.azulArcano, opacity: 0.3, marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontFamily: 'serif', color: Colors.douradoNobre, marginBottom: 10 },
  sellerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#3A2418', padding: 15, borderRadius: 12 },
  sellerName: { color: Colors.pergaminho, fontSize: 16, fontWeight: 'bold' },
  stars: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
  ratingText: { color: Colors.pergaminho, fontSize: 12, marginLeft: 8, opacity: 0.7 },
  btnChat: { backgroundColor: Colors.azulArcano, padding: 12, borderRadius: 50 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { backgroundColor: '#EADBB0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  tagText: { color: Colors.carvalhoEscuro, fontWeight: 'bold', fontSize: 12 },
  footer: { padding: 20, paddingBottom: 40 },
  btnBuyFull: { backgroundColor: Colors.douradoNobre, flexDirection: 'row', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnBuyText: { color: Colors.carvalhoEscuro, fontWeight: 'bold', marginLeft: 10, fontSize: 18 }
});
