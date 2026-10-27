import axios from 'axios';

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://lance-raro-api.onrender.com/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { Accept: 'application/json' },
});

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    const message =
      typeof responseData === 'string' ? responseData : responseData?.message;
    return typeof message === 'string' && message ? message : error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

type RelicRecord = {
  id: number;
  title: string;
  price: number;
  imageUrl?: string | null;
  userId: number;
  inStock: boolean;
  location?: string | null;
  tcgId?: number | null;
  conditionId?: number | null;
  rarityId?: number | null;
  finishId?: number | null;
  languageId?: number | null;
  boostLevel?: number | null;
};

type CategoryRecord = {
  id: number;
  name: string;
  type: string;
  tcgId: number | null;
};

type TcgGroupRecord = {
  id: number;
  name: string;
};

type NotificationRecord = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
};

type RelicDetails = RelicRecord & {
  tcgName: string;
  conditionName: string;
  rarityName: string;
  finishName: string;
  languageName: string;
  sellerName?: string;
  sellerPhone?: string | null;
};

async function fetchOptional<T>(url: string): Promise<T | null> {
  try {
    const { data } = await apiClient.get<T | null>(url);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

export const api = {
  loginUser: async (email: string, pass: string) => {
    try {
      const { data } = await apiClient.post('/users/login', {
        email,
        password: pass,
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Credenciais da guilda inválidas!');
      }

      throw error;
    }
  },

  registerUser: async (email: string, pass: string, nickname: string) => {
    try {
      await apiClient.post('/users/register', {
        email,
        password: pass,
        nickname,
      });
    } catch (error) {
      throw new Error(
        getErrorMessage(error, 'Este e-mail já pertence a outro aventureiro.'),
      );
    }
  },

  fetchRelics: async (
    tcgId: number | null = null,
    searchQuery = '',
    conditionId: number | null = null,
    rarityId: number | null = null,
    finishId: number | null = null,
    languageId: number | null = null,
    locationQuery = '',
  ) => {
    const { data } = await apiClient.get<RelicRecord[]>('/relics');
    const query = searchQuery.trim().toLowerCase();
    const location = locationQuery.trim().toLowerCase();

    return data.filter((relic) => {
      return (
        (tcgId === null || relic.tcgId === tcgId) &&
        (conditionId === null || relic.conditionId === conditionId) &&
        (rarityId === null || relic.rarityId === rarityId) &&
        (finishId === null || relic.finishId === finishId) &&
        (languageId === null || relic.languageId === languageId) &&
        (!query || relic.title.toLowerCase().includes(query)) &&
        (!location ||
          Boolean(relic.location?.toLowerCase().includes(location)))
      );
    });
  },

  fetchUserRelics: async (userId: number) => {
    const { data } = await apiClient.get<RelicRecord[]>(`/relics/user/${userId}`);
    return data;
  },

  fetchCategories: async () => {
    const { data } = await apiClient.get<CategoryRecord[]>('/categories');
    return data;
  },

  fetchTcgGroups: async () => {
    const { data } = await apiClient.get<TcgGroupRecord[]>('/tcggroups');
    return data;
  },

  addTcgGroup: async (name: string) => {
    await apiClient.post('/tcggroups', { name });
  },

  addCategory: async (name: string, type: string, tcgId: number | null = null) => {
    await apiClient.post('/categories', { name, type, tcgId });
  },

  deleteCategory: async (categoryId: number) => {
    await apiClient.delete(`/categories/${categoryId}`);
  },

  addRelic: async (
    title: string,
    price: number,
    tcgId: number,
    conditionId: number,
    rarityId: number | null,
    finishId: number | null,
    languageId: number,
    userId: number,
    imageUrl: string,
    location: string,
  ) => {
    await apiClient.post('/relics', {
      title,
      price,
      tcgId,
      conditionId,
      rarityId,
      finishId,
      languageId,
      userId,
      imageUrl,
      location,
      inStock: true,
    });
  },

  updateUserAvatar: async (userId: number, avatarUrl: string) => {
    await apiClient.put(`/users/${userId}`, { avatarUrl });
  },

  deleteRelic: async (relicId: number) => {
    await apiClient.delete(`/relics/${relicId}`);
  },

  boostRelic: async (relicId: number, level: number) => {
    await apiClient.put(`/relics/${relicId}/boost`, null, {
      params: { level },
    });
  },

  deleteAccount: async (userId: number) => {
    await apiClient.delete(`/users/${userId}`);
  },

  buyRelic: async (relicId: number) => {
    await apiClient.put(`/relics/${relicId}/buy`);
  },

  generatePixBilling: async (
    relicId: number,
    boostLevel: number,
    payerEmail: string,
  ) => {
    const { data } = await apiClient.post('/payments/create-billing', {
      relicId,
      boostLevel,
      payerEmail,
    });
    return data;
  },

  fetchRelicDetails: async (relicId: number): Promise<RelicDetails> => {
    const { data } = await apiClient.get<RelicRecord>(`/relics/${relicId}`);

    if (!data) {
      throw new Error('Carta não encontrada na Taverna.');
    }

    const [tcg, condition, rarity, finish, language] = await Promise.all([
      data.tcgId ? fetchOptional<{ name: string }>(`/tcggroups/${data.tcgId}`) : null,
      data.conditionId ? fetchOptional<{ name: string }>(`/categories/${data.conditionId}`) : null,
      data.rarityId ? fetchOptional<{ name: string }>(`/categories/${data.rarityId}`) : null,
      data.finishId ? fetchOptional<{ name: string }>(`/categories/${data.finishId}`) : null,
      data.languageId ? fetchOptional<{ name: string }>(`/categories/${data.languageId}`) : null,
    ]);

    return {
      ...data,
      tcgName: tcg?.name ?? 'Desconhecido',
      conditionName: condition?.name ?? 'Desconhecida',
      rarityName: rarity?.name ?? 'Desconhecida',
      finishName: finish?.name ?? 'Desconhecido',
      languageName: language?.name ?? 'Desconhecido',
    };
  },

  checkIsFavorite: async (userId: number, relicId: number) => {
    const { data } = await apiClient.get<boolean>('/favorites/check', {
      params: { userId, relicId },
    });
    return data;
  },

  toggleFavorite: async (userId: number, relicId: number) => {
    const { data } = await apiClient.post<boolean>('/favorites/toggle', {
      userId,
      relicId,
    });
    return data;
  },

  fetchUserFavorites: async (userId: number) => {
    const { data: favorites } = await apiClient.get<{ relicId: number }[]>(
      `/favorites/user/${userId}`,
    );

    return Promise.all(
      favorites.map(async ({ relicId }) => {
        const { data } = await apiClient.get<RelicRecord>(`/relics/${relicId}`);
        return data;
      }),
    );
  },

  getAdminStats: async () => {
    const { data: allRelics } = await apiClient.get<RelicRecord[]>('/relics');
    const soldRelics = allRelics.filter((relic) => !relic.inStock);

    return {
      totalRelics: allRelics.length,
      totalSold: soldRelics.length,
      totalValue: soldRelics.reduce((total, relic) => total + relic.price, 0),
    };
  },

  fetchUserDetails: async (userId: number) => {
    return fetchOptional<{ nickname?: string; phone?: string | null }>(
      `/users/${userId}`,
    );
  },

  updateUserProfile: async (
    userId: number,
    nickname: string,
    pass: string,
    phone?: string,
  ) => {
    const data: Record<string, string> = {};
    if (nickname) data.nickname = nickname;
    if (pass) data.password = pass;
    if (phone) data.phone = phone;

    if (Object.keys(data).length > 0) {
      await apiClient.put(`/users/${userId}`, data);
    }
  },

  fetchNotifications: async (userId: number) => {
    const { data } = await apiClient.get<NotificationRecord[]>(
      `/notifications/user/${userId}`,
    );
    return data;
  },

  markNotificationRead: async (notifId: number) => {
    await apiClient.put(`/notifications/${notifId}/read`);
  },

  deleteNotification: async (notifId: number) => {
    await apiClient.delete(`/notifications/${notifId}`);
  },
};

export async function uploadCloudinaryImage(uri: string, fileName: string) {
  const cloudName = 'dbk9uavtw';
  const formData = new FormData();
  formData.append(
    'file',
    { uri, type: 'image/jpeg', name: fileName } as unknown as Blob,
  );
  formData.append('upload_preset', 'lanceraro_preset');

  const { data } = await axios.post<{ secure_url: string }>(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData,
    { timeout: 30000 },
  );

  if (!data.secure_url) {
    throw new Error('O serviço de imagens não retornou o endereço do arquivo.');
  }

  return data.secure_url;
}
