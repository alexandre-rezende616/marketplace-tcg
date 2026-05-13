import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Heart, MessageCircle, ShoppingBag, ArrowLeft, Star } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const screenWidth = Dimensions.get('window').width;

export function DetalhesScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { relicId } = route.params; // Agora recebemos só o ID
  
  const [relic, setRelic] = useState<any>(null); // Estado para guardar os detalhes completos
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // // quando a tela abre, a gente usa o ID pra buscar todos os detalhes da carta no banco
    const loadDetails = async () => {
      const data = await api.fetchRelicDetails(relicId);
      setRelic(data);

      // Checa se o usuário atual favoritou essa carta
      if (user) {
        const favStatus = await api.checkIsFavorite(user.id, relicId);
        setIsFavorite(favStatus);
      }
    };
    loadDetails();
  }, [relicId, user]);

  const handleBuy = () => {
    Alert.alert("Confirmar Transação", `Deseja fechar negócio por R$ ${relic.price.toFixed(2)}?`, [
      { text: "Recuar", style: "cancel" },
      { text: "Pagar", onPress: async () => {
          try {
            await api.buyRelic(relic.id);
            Alert.alert("Vitória!", "A relíquia foi adicionada ao seu inventário.");
            navigation.goBack();
          } catch (e) {
            Alert.alert("Erro", "Transação recusada.");
          }
        } 
      }
    ]);
  };

  const handleToggleFavorite = async () => {
    if (user) {
      const newStatus = await api.toggleFavorite(user.id, relic.id);
      setIsFavorite(newStatus);
    } else {
      Alert.alert("Aviso", "Você precisa estar logado para favoritar!");
    }
  };

  const handleChatMock = () => {
    Alert.alert("Correio da Guilda", "Funcionalidade de chat em tempo real será ativada nas próximas atualizações!");
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

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft color={Colors.pergaminho} size={28} />
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        {images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {images.map((uri: string, idx: number) => (
              <Image key={idx} source={{ uri }} style={{ width: screenWidth, height: '100%' }} resizeMode="cover" />
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
            <Text style={styles.sellerName}>Aventureiro #{relic.userId}</Text>
            <View style={styles.stars}>
              {[1,2,3,4,5].map(s => <Star key={s} color={Colors.douradoNobre} fill={Colors.douradoNobre} size={16} />)}
              <Text style={styles.ratingText}>(Mock)</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btnChat} onPress={handleChatMock}><MessageCircle color={Colors.pergaminho} size={20} /></TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Tags Dinâmicas com os dados reais do banco */}
        <Text style={styles.sectionTitle}>Detalhes da Relíquia</Text>
        <View style={styles.tagsContainer}>
          {relic.tcgName && <View style={[styles.tag, { backgroundColor: Colors.douradoNobre }]}><Text style={styles.tagText}>{relic.tcgName}</Text></View>}
          {relic.conditionName && <View style={styles.tag}><Text style={styles.tagText}>{relic.conditionName}</Text></View>}
          {relic.rarityName && <View style={styles.tag}><Text style={styles.tagText}>{relic.rarityName}</Text></View>}
          {relic.finishName && <View style={styles.tag}><Text style={styles.tagText}>{relic.finishName}</Text></View>}
          {relic.languageName && <View style={styles.tag}><Text style={styles.tagText}>{relic.languageName}</Text></View>}
        </View>
      </View>

      {relic.inStock && relic.userId !== user?.id && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnBuyFull} onPress={handleBuy}>
            <ShoppingBag color={Colors.carvalhoEscuro} size={20} />
            <Text style={styles.btnBuyText}>Adquirir Relíquia</Text>
          </TouchableOpacity>
        </View>
      )}
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
