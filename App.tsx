import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { seedDatabase } from './src/db/db';
import { Colors } from './src/theme/colors';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // // TODO: perguntar pro professor se inicializar o banco no App.tsx é a melhor prática.
    const setupDatabase = async () => {
      try {
        await seedDatabase();
        setDbReady(true);
      } catch (error) {
        console.error("Erro ao forjar o banco de dados da taverna:", error);
      }
    };

    setupDatabase();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.carvalhoEscuro }}>
        <ActivityIndicator size="large" color={Colors.douradoNobre} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
