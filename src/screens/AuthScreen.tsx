import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Colors } from '../theme/colors';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AppText } from '../components/ui/AppText';
import { TextField } from '../components/ui/TextField';

export function AuthScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Aviso', 'Preencha suas credenciais para entrar na Taverna.');
      return;
    }
    setIsLoading(true);
    try {
      const user = await api.loginUser(email, password);
      signIn(user);
    } catch (e: any) {
      Alert.alert('Erro no Feitiço', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Magia de Recuperação", "Enviamos uma coruja com as instruções para redefinir sua senha!");
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Espaço para o Logo */}
      <Image 
        source={require('../../assets/logo.png')} // O caminho volta a apontar para a pasta 'assets' na raiz do projeto
        style={styles.logo} 
      />
      <AppText variant="display" tone="accent" style={styles.title}>Lance Raro</AppText>
      <AppText variant="body" tone="inverse" style={styles.subtitle}>Guilda de Aventureiros</AppText>

      <Card>
        <TextField placeholder="E-mail da sua jornada..." value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField placeholder="Senha secreta..." value={password} onChangeText={setPassword} secureTextEntry />

        <Button onPress={handleLogin} loading={isLoading}>Adentrar a Taverna</Button>

        <TouchableOpacity onPress={handleForgotPassword} style={{ marginTop: 15 }}>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')} style={{ marginTop: 15 }}>
          <Text style={styles.registerText}>Ainda não tem conta? Assine o Pacto!</Text>
        </TouchableOpacity>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.carvalhoEscuro, justifyContent: 'center', padding: 20 },
  logo: { width: 150, height: 150, alignSelf: 'center', marginBottom: 20, resizeMode: 'contain' },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 30 },
  forgotText: { color: Colors.azulArcano, textAlign: 'center', fontWeight: 'bold' },
  registerText: { color: Colors.rubiBordo, textAlign: 'center', fontWeight: 'bold', marginTop: 10 }
});
