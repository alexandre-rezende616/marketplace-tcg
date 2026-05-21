import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { seedDatabase } from './src/db/db';

// Mantém a splash screen nativa visível automaticamente
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Executa a nossa função de criação e semeadura do banco de dados
        await seedDatabase();
        console.log("Banco de dados e sementes verificados com sucesso!");
      } catch (e) {
        console.warn("Erro ao preparar o app:", e);
      } finally {
        // Diz ao app que ele está pronto para ser renderizado
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Função para esconder a splash screen somente quando o app estiver pronto e renderizado
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Não renderiza nada enquanto o app não está pronto, mantendo a splash visível
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </View>
  );
}
