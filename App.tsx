import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// Mantém a splash screen nativa visível automaticamente
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Como migramos para o Spring Boot, não precisamos mais semear o SQLite local aqui.
        // Espaço reservado para carregamento de fontes ou outras verificações iniciais.
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
