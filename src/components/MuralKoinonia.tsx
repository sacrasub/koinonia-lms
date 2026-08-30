'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, Sparkles, Plus, CheckCircle2, User, RefreshCw, 
  Search, Church, HandHeart, MessageCircle, Share2, Flame
} from 'lucide-react';
import { PedidoOracaoCard, OracaoCategoria, UserRole } from '@/types';
import { 
  getPrayerCards, 
  createPrayerCard, 
  toggleIntercession 
} from '@/services/collaborationService';

interface MuralKoinoniaProps {
  userEmail: string;
  userName?: string;
  currentUserRole?: UserRole;
}

export const MuralKoinonia: React.FC<MuralKoinoniaProps> = ({
  userEmail,
  userName = 'Seminarista',
  currentUserRole = 'aluno'
}) => {
  const [cards, setCards] = useState<PedidoOracaoCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<'TODOS' | OracaoCategoria>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal Novo Pedido
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newText, setNewText] = useState<string>('');
  const [newCategory, setNewCategory] = useState<OracaoCategoria>('ORACAO');
  const [newCargo, setNewCargo] = useState<string>('Seminarista UIECB');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadPrayers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getPrayerCards();
      setCards(data);
    } catch (e) {
      console.error('Erro ao carregar mural de orações:', e);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 300);
    }
  };

  useEffect(() => {
    loadPrayers();
  }, []);

  const handleTogglePray = async (cardId: string) => {
    const updated = await toggleIntercession(cardId, userEmail);
    setCards(updated);
    const card = updated.find((c) => c.id === cardId);
    const isNowPraying = card?.intercessores.map((e) => e.toLowerCase()).includes(userEmail.toLowerCase());
    showToast(isNowPraying ? '🙏 Você se uniu em oração por este motivo!' : 'Intercessão atualizada.');
  };

  const handleCreatePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    await createPrayerCard({
      autor_email: userEmail,
      autor_nome: userName,
      autor_cargo: newCargo.trim() || 'Seminarista',
      categoria: newCategory,
      pedido_oracao: newText.trim(),
    });

    setIsModalOpen(false);
    setNewText('');
    showToast('Seu post foi compartilhado no Mural de Koinonia!');
    loadPrayers(true);
  };

  const getCategoryTheme = (cat: OracaoCategoria) => {
    switch (cat) {
      case 'ORACAO':
        return {
          bg: 'bg-amber-50/90 hover:bg-amber-50',
          border: 'border-amber-200/90 hover:border-amber-300',
          tag: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <HandHeart className="w-3.5 h-3.5 text-amber-700" />,
          label: 'Pedido de Oração',
        };
      case 'GRATIDAO':
        return {
          bg: 'bg-emerald-50/90 hover:bg-emerald-50',
          border: 'border-emerald-200/90 hover:border-emerald-300',
          tag: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-700" />,
          label: 'Testemunho & Gratidão',
        };
      case 'MISSAO':
        return {
          bg: 'bg-cyan-50/90 hover:bg-cyan-50',
          border: 'border-cyan-200/90 hover:border-cyan-300',
          tag: 'bg-cyan-100 text-cyan-800 border-cyan-300',
          icon: <Church className="w-3.5 h-3.5 text-cyan-700" />,
          label: 'Missão & Igreja Local',
        };
    }
  };

  const filteredCards = cards.filter((c) => {
    const matchesCat = selectedCategory === 'TODOS' || c.categoria === selectedCategory;
    const matchesSearch =
      c.pedido_oracao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.autor_nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.autor_cargo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* HEADER DO MURAL DE KOINONIA */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent bg-white p-5 sm:p-7 rounded-3xl border border-amber-200/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <HandHeart className="w-3 h-3" /> Mural de Koinonia Espiritual
            </span>
            <span className="text-xs text-gray-400 font-medium">Formação Pastoral UIECB</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Partilha, Oração & Apoio Comunitário
          </h1>
          <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
            Compartilhe suas lutas diárias, motivos de gratidão e desafios missionários na igreja local. Fortaleça a comunhão (*koinonia*) orando ativamente pelos seus irmãos de seminário.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadPrayers(true)}
            disabled={refreshing}
            className="p-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl transition cursor-pointer"
            title="Atualizar mural"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Post-it de Oração</span>
          </button>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'TODOS', label: 'Todos os Post-its' },
            { id: 'ORACAO', label: '🙏 Pedidos de Oração' },
            { id: 'GRATIDAO', label: '✨ Gratidão & Testemunhos' },
            { id: 'MISSAO', label: '⛪ Missão & Igreja Local' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por motivos ou irmãos..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-gray-50/50"
          />
        </div>
      </div>

      {/* GRID DE POST-ITS DIGITAIS */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-xs text-gray-400">
          Carregando pedidos de oração da turma...
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-2">
          <HandHeart className="w-8 h-8 text-amber-300 mx-auto" />
          <p className="text-xs font-bold text-gray-600">Nenhum post-it encontrado nesta categoria.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs text-amber-600 font-bold hover:underline cursor-pointer"
          >
            Seja o primeiro a publicar um pedido →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredCards.map((card) => {
            const theme = getCategoryTheme(card.categoria);
            const isUserPraying = card.intercessores.map((e) => e.toLowerCase()).includes(userEmail.toLowerCase());
            const count = card.intercessores.length;

            return (
              <div
                key={card.id}
                className={`${theme.bg} p-5 rounded-3xl border ${theme.border} shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group`}
              >
                {/* Cabeçalho do Post-it */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${theme.tag}`}>
                      {theme.icon}
                      <span>{theme.label}</span>
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(card.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-line pt-1">
                    "{card.pedido_oracao}"
                  </p>
                </div>

                {/* Rodapé com Autor e Botão de Intercessão */}
                <div className="pt-3 border-t border-gray-200/60 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                      {card.autor_nome.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block leading-tight">
                        {card.autor_nome}
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        {card.autor_cargo}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTogglePray(card.id)}
                    className={`w-full py-2 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                      isUserPraying
                        ? 'bg-amber-600 text-white shadow-amber-900/20'
                        : 'bg-white/80 hover:bg-white text-gray-700 border border-gray-300/80 hover:text-amber-700'
                    }`}
                  >
                    <HandHeart className={`w-3.5 h-3.5 ${isUserPraying ? 'fill-white' : ''}`} />
                    <span>
                      {isUserPraying ? '🙏 Você está intercedendo' : 'Apoiar em Oração'} ({count})
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL NOVO POST-IT DE ORAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg p-6 rounded-3xl border border-gray-200 shadow-2xl space-y-4 text-left my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">Novo Post-it de Koinonia</h3>
                <p className="text-xs text-gray-500">Compartilhe um pedido de oração, louvor ou chamado com os seminaristas</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePrayerSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Categoria do Post-it</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:outline-hidden"
                  >
                    <option value="ORACAO">🙏 Pedido de Oração</option>
                    <option value="GRATIDAO">✨ Testemunho & Gratidão</option>
                    <option value="MISSAO">⛪ Missão & Igreja Local</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Seu Cargo / Vocação</label>
                  <input
                    type="text"
                    value={newCargo}
                    onChange={(e) => setNewCargo(e.target.value)}
                    placeholder="Ex: Seminarista, Pastor Local, Líder de Jovens"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Seu Motivo de Oração / Gratidão *</label>
                <textarea
                  rows={4}
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Escreva com liberdade sua partilha ou necessidade para que os irmãos se unam em intercessão..."
                  className="w-full text-xs text-gray-900 p-3 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black shadow transition cursor-pointer"
                >
                  Fixar no Mural
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
