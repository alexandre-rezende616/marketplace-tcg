export const api = {
  loginUser: async (email: string, pass: string) => {
    const response = await fetch('http://10.65.65.125:8080/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!response.ok) {
      throw new Error('Credenciais da guilda inválidas!');
    }
    return await response.json();
  },

  registerUser: async (email: string, pass: string, nickname: string) => {
    const response = await fetch('http://10.65.65.125:8080/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, nickname })
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao registrar aventureiro.');
      } catch {
        throw new Error('Este e-mail já pertence a outro aventureiro!');
      }
    }
  },

  fetchRelics: async (
    tcgId: number | null = null, 
    searchQuery: string = '',
    conditionId: number | null = null,
    rarityId: number | null = null,
    finishId: number | null = null,
    languageId: number | null = null
  ) => {
    try {
      const enderecoJava = 'http://10.65.65.125:8080/api/relics';
      
      console.log("Invocando o servidor Java em:", enderecoJava);
      
      const response = await fetch(enderecoJava);
      
      if (!response.ok) {
        throw new Error('A Taverna recusou a nossa conexão.');
      }

      const data = await response.json();
      
      let dadosFiltrados = data;
      if (searchQuery && searchQuery.trim() !== '') {
        dadosFiltrados = dadosFiltrados.filter((relic: any) => 
          relic.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return dadosFiltrados;
    } catch (error) {
      console.error("Erro ao buscar pergaminhos do Java:", error);
      return [];
    }
  },

  fetchUserRelics: async (userId: number) => {
    try {
      const enderecoJava = `http://10.65.65.125:8080/api/relics/user/${userId}`;
      const response = await fetch(enderecoJava);
      if (!response.ok) {
        throw new Error('Falha ao buscar as relíquias do aventureiro na Taverna.');
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar pergaminhos do usuário no Java:", error);
      return [];
    }
  },

  fetchCategories: async () => {
    try {
      const response = await fetch('http://10.65.65.125:8080/api/categories');
      return await response.json();
    } catch (e) {
      return [];
    }
  },

  fetchTcgGroups: async () => {
    try {
      const response = await fetch('http://10.65.65.125:8080/api/tcggroups');
      return await response.json();
    } catch (e) {
      return [];
    }
  },

  addTcgGroup: async (name: string) => {
    await fetch('http://10.65.65.125:8080/api/tcggroups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
  },

  addCategory: async (name: string, type: string, tcgId: number | null = null) => {
    await fetch('http://10.65.65.125:8080/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, tcgId })
    });
  },

  deleteCategory: async (categoryId: number) => {
    await fetch(`http://10.65.65.125:8080/api/categories/${categoryId}`, { method: 'DELETE' });
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
    imageUrl: string
  ) => {
    const enderecoJava = 'http://10.65.65.125:8080/api/relics';
    
    const novaReliquia = {
      title,
      price,
      tcgId,
      conditionId,
      rarityId,
      finishId,
      languageId,
      userId,
      imageUrl,
      inStock: true
    };

    const response = await fetch(enderecoJava, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(novaReliquia),
    });

    if (!response.ok) {
      throw new Error('Falha ao forjar a relíquia na Taverna (Java).');
    }
  },

  updateUserAvatar: async (userId: number, avatarUrl: string) => {
    await fetch(`http://10.65.65.125:8080/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarUrl })
    });
  },

  deleteRelic: async (relicId: number, userId: number) => {
    try {
      const enderecoJava = `http://10.65.65.125:8080/api/relics/${relicId}`;
      await fetch(enderecoJava, { method: 'DELETE' });
    } catch (error) {
      console.error("Erro ao deletar carta no Java:", error);
    }
  },

  buyRelic: async (relicId: number) => {
    try {
      const enderecoJava = `http://10.65.65.125:8080/api/relics/${relicId}/buy`;
      await fetch(enderecoJava, { method: 'PUT' });
    } catch (error) {
      console.error("Erro ao comprar carta no Java:", error);
    }
  },

  fetchRelicDetails: async (relicId: number) => {
    try {
      const enderecoJava = `http://10.65.65.125:8080/api/relics/${relicId}`;
      const response = await fetch(enderecoJava);
      
      if (!response.ok) {
        throw new Error('Carta não encontrada na Taverna.');
      }

      const data = await response.json();

      // Função auxiliar para buscar detalhes textuais dos IDs
      const fetchCat = async (id: number) => {
        if (!id) return null;
        try { 
          const res = await fetch(`http://10.65.65.125:8080/api/categories/${id}`);
          return res.ok ? await res.json() : null;
        } catch { return null; }
      };
      
      const fetchTcg = async (id: number) => {
        if (!id) return null;
        try {
          const res = await fetch(`http://10.65.65.125:8080/api/tcggroups/${id}`);
          return res.ok ? await res.json() : null;
        } catch { return null; }
      };

      const tcg = await fetchTcg(data.tcgId);
      const condition = await fetchCat(data.conditionId);
      const rarity = await fetchCat(data.rarityId);
      const finish = await fetchCat(data.finishId);
      const language = await fetchCat(data.languageId);

      return {
        id: data.id,
        title: data.title,
        price: data.price,
        imageUrl: data.imageUrl,
        userId: data.userId,
        inStock: data.inStock,
        
        tcgName: tcg ? tcg.name : 'Desconhecido',
        conditionName: condition ? condition.name : 'Desconhecida',
        rarityName: rarity ? rarity.name : 'Desconhecida',
        finishName: finish ? finish.name : 'Desconhecido',
        languageName: language ? language.name : 'Desconhecido',
      };
    } catch (error) {
      console.error("Erro ao buscar detalhes da relíquia:", error);
      return null;
    }
  },

  checkIsFavorite: async (userId: number, relicId: number) => {
    try {
      const response = await fetch(`http://10.65.65.125:8080/api/favorites/check?userId=${userId}&relicId=${relicId}`);
      return await response.json();
    } catch (e) {
      return false;
    }
  },

  toggleFavorite: async (userId: number, relicId: number) => {
    try {
      const response = await fetch('http://10.65.65.125:8080/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, relicId })
      });
      return await response.json();
    } catch (e) {
      console.error("Erro ao favoritar no Java:", e);
      return false;
    }
  },

  fetchUserFavorites: async (userId: number) => {
    try {
      const responseFavs = await fetch(`http://10.65.31.226:8080/api/favorites/user/${userId}`);
      const favs = await responseFavs.json();
      if (favs.length === 0) return [];
      
      const cartasFavoritas = [];
      for (const fav of favs) {
        const res = await fetch(`http://10.65.31.226:8080/api/relics/${fav.relicId}`);
        if (res.ok) {
          const data = await res.json();
          cartasFavoritas.push(data);
        }
      }
      return cartasFavoritas;
    } catch (error) {
      console.error("Erro ao buscar favoritos no Java:", error);
      return [];
    }
  },

  getAdminStats: async () => {
    try {
      const response = await fetch('http://10.65.65.125:8080/api/relics');
      const allRelics = await response.json();
      
      const totalRelics = allRelics.length;
      const soldRelics = allRelics.filter((r: any) => !r.inStock);
      const totalSold = soldRelics.length;
      const totalValue = soldRelics.reduce((acc: number, r: any) => acc + r.price, 0);
      
      return { totalRelics, totalSold, totalValue };
    } catch (error) {
      return { totalRelics: 0, totalSold: 0, totalValue: 0 };
    }
  },

  updateUserProfile: async (userId: number, nickname: string, pass: string) => {
    const dataToUpdate: any = {};
    if (nickname) dataToUpdate.nickname = nickname;
    if (pass) dataToUpdate.password = pass;
    
    if (Object.keys(dataToUpdate).length > 0) {
      await fetch(`http://10.65.65.125:8080/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate)
      });
    }
  }
};
