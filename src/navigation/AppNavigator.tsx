import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Flame, Scroll, PlusSquare, UserCircle } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { AuthScreen } from '../screens/AuthScreen';
import { CadastroScreen } from '../screens/CadastroScreen';
import { MuralScreen } from '../screens/MuralScreen';
import { MestreTavernaScreen } from '../screens/MestreTavernaScreen';
import { AnunciarScreen } from '../screens/AnunciarScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { DetalhesScreen } from '../screens/DetalhesScreen';
import { Colors } from '../theme/colors';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  const { user } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.carvalhoEscuro },
        headerTintColor: Colors.douradoNobre,
        tabBarStyle: { backgroundColor: Colors.carvalhoEscuro, borderTopColor: Colors.douradoNobre },
        tabBarActiveTintColor: Colors.douradoNobre,
        tabBarInactiveTintColor: Colors.pergaminho,
      }}
    >
      <Tab.Screen name="Mural" component={MuralScreen} options={{ tabBarIcon: ({ color, size }) => <Scroll color={color} size={size} /> }} />
      <Tab.Screen name="Anunciar" component={AnunciarScreen} options={{ tabBarIcon: ({ color, size }) => <PlusSquare color={color} size={size} /> }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} /> }} />
      
      {user?.role === 'admin' && (
        <Tab.Screen name="Taverna (Admin)" component={MestreTavernaScreen} options={{ tabBarIcon: ({ color, size }) => <Flame color={color} size={size} /> }} />
      )}
    </Tab.Navigator>
  );
}

function MainApp() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="AppTabs" component={AppTabs} />
      <AppStack.Screen name="Detalhes" component={DetalhesScreen} />
    </AppStack.Navigator>
  );
}

export function AppNavigator() {
  const { user } = useAuth();
  return (
    <NavigationContainer>
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <AuthStack.Screen name="Main" component={MainApp} />
        ) : (
          <>
            <AuthStack.Screen name="Auth" component={AuthScreen} />
            <AuthStack.Screen name="Cadastro" component={CadastroScreen} />
          </>
        )}
      </AuthStack.Navigator>
    </NavigationContainer>
  );
}
