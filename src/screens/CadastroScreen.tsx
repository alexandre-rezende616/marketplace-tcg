import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../services/api';
import { Colors } from '../theme/colors';
import { ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react-native';

export function CadastroScreen({ navigation }: any) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!nickname || !email || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Preencha todos os campos para entrar na guilda!');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'Os feitiços de senha não coincidem!');
      return;
    }
    try {
      await api.registerUser(email, password, nickname);
      Alert.alert('Sucesso!', 'Seu registro foi aceito. Você já pode adentrar a taverna!');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <ArrowLeft color={Colors.pergaminho} size={28} />
      </TouchableOpacity>
      
      <Text style={styles.title}>Novo Aventureiro</Text>
      
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Apelido / Nome na Guilda..." placeholderTextColor="#A08C75" value={nickname} onChangeText={setNickname} />
        <TextInput style={styles.input} placeholder="E-mail de contato..." placeholderTextColor="#A08C75" value={email} onChangeText={setEmail} autoCapitalize="none" />
        
        <View style={styles.passwordContainer}>
          <TextInput style={styles.passwordInput} placeholder="Senha secreta..." placeholderTextColor="#A08C75" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            {showPassword ? <EyeOff color={Colors.carvalhoEscuro} size={20} /> : <Eye color={Colors.carvalhoEscuro} size={20} />}
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput style={styles.passwordInput} placeholder="Confirme sua senha..." placeholderTextColor="#A08C75" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
            {showConfirmPassword ? <EyeOff color={Colors.carvalhoEscuro} size={20} /> : <Eye color={Colors.carvalhoEscuro} size={20} />}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister}>
          <UserPlus color={Colors.carvalhoEscuro} size={20} />
          <Text style={styles.btnText}>Assinar o Pacto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.carvalhoEscuro, justifyContent: 'center', padding: 20 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 10 },
  title: { fontSize: 32, fontFamily: 'serif', color: Colors.douradoNobre, textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: Colors.pergaminho, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.douradoNobre },
  input: { backgroundColor: '#EADBB0', borderRadius: 8, padding: 12, marginBottom: 15, fontFamily: 'sans-serif' },
  passwordContainer: { flexDirection: 'row', backgroundColor: '#EADBB0', borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  passwordInput: { flex: 1, padding: 12, fontFamily: 'sans-serif' },
  eyeIcon: { padding: 10, paddingRight: 15 },
  btnPrimary: { backgroundColor: Colors.douradoNobre, flexDirection: 'row', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: Colors.carvalhoEscuro, fontWeight: 'bold', marginLeft: 10, fontSize: 16 }
});