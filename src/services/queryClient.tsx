import { AppState, type AppStateStatus } from 'react-native';
import type { ReactNode } from 'react';
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener(
    'change',
    (status: AppStateStatus) => setFocused(status === 'active'),
  );

  return () => subscription.remove();
});

export function RemoteStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export const queryKeys = {
  relics: ['relics'] as const,
  relicList: (filters: readonly unknown[]) =>
    [...queryKeys.relics, ...filters] as const,
  relicDetails: (relicId: number) => ['relic-details', relicId] as const,
  categories: ['categories'] as const,
  tcgGroups: ['tcg-groups'] as const,
  userRelics: (userId: number) => ['user-relics', userId] as const,
  userFavorites: (userId: number) => ['user-favorites', userId] as const,
  favoriteStatus: (userId: number, relicId: number) =>
    ['favorite-status', userId, relicId] as const,
  notifications: (userId: number) => ['notifications', userId] as const,
  adminStats: ['admin-stats'] as const,
};
