import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Colors } from '../theme/colors';
import { LogIn } from 'lucide-react-native';

export function AuthScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const user = await api.loginUser(email, password);
      signIn(user);
    } catch (e: any) {
      Alert.alert('Erro no Feitiço', e.message);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Magia de Recuperação", "Enviamos uma coruja com as instruções para redefinir sua senha!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lance Raro</Text>
      <Text style={styles.subtitle}>Guilda de Aventureiros</Text>

      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="E-mail da sua jornada..." placeholderTextColor="#A08C75" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha secreta..." placeholderTextColor="#A08C75" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
          <LogIn color={Colors.carvalhoEscuro} size={20} />
          <Text style={styles.btnText}>Adentrar a Taverna</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword} style={{ marginTop: 15 }}>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')} style={{ marginTop: 15 }}>
          <Text style={styles.registerText}>Ainda não tem conta? Assine o Pacto!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.carvalhoEscuro, justifyContent: 'center', padding: 20 },
  title: { fontSize: 36, fontFamily: 'serif', color: Colors.douradoNobre, textAlign: 'center' },
  subtitle: { fontSize: 16, color: Colors.pergaminho, textAlign: 'center', marginBottom: 40 },
  card: { backgroundColor: Colors.pergaminho, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.douradoNobre },
  input: { backgroundColor: '#EADBB0', borderRadius: 8, padding: 12, marginBottom: 15, fontFamily: 'sans-serif' },
  btnPrimary: { backgroundColor: Colors.douradoNobre, flexDirection: 'row', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  btnText: { color: Colors.carvalhoEscuro, fontWeight: 'bold', marginLeft: 10 },
  forgotText: { color: Colors.azulArcano, textAlign: 'center', fontWeight: 'bold' },
  registerText: { color: Colors.rubiBordo, textAlign: 'center', fontWeight: 'bold', marginTop: 10 }
});
