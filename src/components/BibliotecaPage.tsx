'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Library, Download, ExternalLink, Send, CheckCircle2, 
  Filter, LayoutGrid, List, Quote, BookOpen, ChevronLeft, ChevronRight,
  FileText, Sparkles, X, Plus, Trash2, UserCheck, ShieldCheck, Copy, Check, Pencil,
  FolderOpen, Image as ImageIcon
} from 'lucide-react';
import { BibliotecaBook, UserRole } from '@/types';
import { 
  getAllBibliotecaBooks, 
  addCustomBook, 
  deleteCustomBook, 
  updateBibliotecaBook,
  updateBookDriveUrl,
  getBibliotecaCategories,
  saveCustomCategory,
  BIBLIOTECA_ROOT_DRIVE_FOLDER_URL,
  BIBLIOTECA_PROFESSOR_SUGGESTIONS_FOLDER_URL
} from '@/services/bibliotecaService';
import { getAllLivrosRecomendados } from '@/services/livrosRecomendadosService';
import { trackEvent } from '@/services/telemetryService';

interface BibliotecaPageProps {

  currentRole?: UserRole;
  userEmail?: string;
}

// Função para formatar bytes em KB, MB, GB
function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 MB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Mapa de cores temáticas para cada categoria
function getCategoryColor(category: string): { badge: string; gradient: string } {
  if (category.includes('01')) return { badge: 'bg-amber-100 text-amber-900 border-amber-200', gradient: 'from-amber-700 to-yellow-900' };
  if (category.includes('02')) return { badge: 'bg-emerald-100 text-emerald-900 border-emerald-200', gradient: 'from-emerald-700 to-teal-900' };
  if (category.includes('03')) return { badge: 'bg-blue-100 text-blue-900 border-blue-200', gradient: 'from-blue-700 to-indigo-900' };
  if (category.includes('04')) return { badge: 'bg-purple-100 text-purple-900 border-purple-200', gradient: 'from-purple-700 to-violet-900' };
  if (category.includes('05')) return { badge: 'bg-cyan-100 text-cyan-900 border-cyan-200', gradient: 'from-cyan-700 to-sky-900' };
  if (category.includes('06')) return { badge: 'bg-rose-100 text-rose-900 border-rose-200', gradient: 'from-rose-700 to-red-900' };
  if (category.includes('07')) return { badge: 'bg-orange-100 text-orange-900 border-orange-200', gradient: 'from-orange-700 to-amber-900' };
  if (category.includes('08')) return { badge: 'bg-green-100 text-green-900 border-green-200', gradient: 'from-green-700 to-emerald-900' };
  if (category.includes('09')) return { badge: 'bg-indigo-100 text-indigo-900 border-indigo-200', gradient: 'from-indigo-700 to-blue-900' };
  if (category.includes('10')) return { badge: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200', gradient: 'from-fuchsia-700 to-purple-900' };
  if (category.includes('11')) return { badge: 'bg-lime-100 text-lime-900 border-lime-200', gradient: 'from-lime-700 to-green-900' };
  if (category.includes('12')) return { badge: 'bg-stone-100 text-stone-900 border-stone-200', gradient: 'from-stone-700 to-neutral-900' };
  if (category.includes('13')) return { badge: 'bg-teal-100 text-teal-900 border-teal-200', gradient: 'from-teal-700 to-cyan-900' };
  if (category.includes('14')) return { badge: 'bg-zinc-100 text-zinc-900 border-zinc-200', gradient: 'from-zinc-700 to-slate-900' };
  if (category.includes('15')) return { badge: 'bg-amber-100 text-amber-900 border-amber-200', gradient: 'from-amber-800 to-orange-950' };
  if (category.includes('16')) return { badge: 'bg-sky-100 text-sky-900 border-sky-200', gradient: 'from-sky-700 to-indigo-900' };
  if (category.includes('17')) return { badge: 'bg-blue-100 text-blue-900 border-blue-200', gradient: 'from-blue-800 to-slate-900' };
  if (category.includes('18')) return { badge: 'bg-emerald-100 text-emerald-900 border-emerald-200', gradient: 'from-emerald-800 to-teal-950' };
  if (category.includes('19')) return { badge: 'bg-violet-100 text-violet-900 border-violet-200', gradient: 'from-violet-700 to-purple-950' };
  if (category.includes('20')) return { badge: 'bg-yellow-100 text-yellow-900 border-yellow-200', gradient: 'from-yellow-700 to-amber-950' };
  if (category.includes('21')) return { badge: 'bg-rose-100 text-rose-900 border-rose-200', gradient: 'from-rose-800 to-stone-900' };
  if (category.includes('22')) return { badge: 'bg-pink-100 text-pink-900 border-pink-200', gradient: 'from-pink-700 to-rose-900' };
  if (category.includes('23')) return { badge: 'bg-red-100 text-red-900 border-red-200', gradient: 'from-red-700 to-amber-950' };
  if (category.includes('24')) return { badge: 'bg-indigo-100 text-indigo-900 border-indigo-200', gradient: 'from-indigo-800 to-purple-900' };
  return { badge: 'bg-slate-100 text-slate-900 border-slate-200', gradient: 'from-slate-700 to-gray-900' };
}

// Limpa o prefixo numérico das categorias para exibição amigável
function cleanCategoryName(cat: string): string {
  if (!cat) return 'Sem Categoria';
  return cat.replace(/^\d+[\s.-]+/, '').trim();
}

export const BibliotecaPage: React.FC<BibliotecaPageProps> = ({
  currentRole = 'aluno',
  userEmail = 'sacrasub@gmail.com'
}) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const canAddBooks = currentRole === 'admin' || currentRole === 'professor' || currentRole === 'monitor' || normalizedEmail === 'sacrasub@gmail.com';
  const canOpenRootDrive = currentRole === 'admin' || currentRole === 'monitor' || normalizedEmail === 'sacrasub@gmail.com';

  const [allBooks, setAllBooks] = useState<BibliotecaBook[]>(() => getAllBibliotecaBooks());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedBookId, setCopiedBookId] = useState<string | null>(null);

  const [sortColumn, setSortColumn] = useState<'title' | 'author' | 'category' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal de Adição de Novo Livro (Professores, Monitores e Admin)
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('01 - Bíblia e Referência');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [newDriveUrl, setNewDriveUrl] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Modal de Edição Completa de Livro (Metadados, Descrição e Capa)
  const [isEditFullBookModalOpen, setIsEditFullBookModalOpen] = useState(false);
  const [editingFullBook, setEditingFullBook] = useState<BibliotecaBook | null>(null);
  const [editBookTitle, setEditBookTitle] = useState('');
  const [editBookAuthor, setEditBookAuthor] = useState('');
  const [editBookCategory, setEditBookCategory] = useState('01 - Bíblia e Referência');
  const [editCustomCategoryName, setEditCustomCategoryName] = useState('');
  const [editBookDescription, setEditBookDescription] = useState('');
  const [editBookDriveUrl, setEditBookDriveUrl] = useState('');
  const [editBookCoverUrl, setEditBookCoverUrl] = useState('');

  const [viewingBook, setViewingBook] = useState<BibliotecaBook | null>(null);
  const [viewModalTab, setViewModalTab] = useState<'overview' | 'reader'>('overview');

  const getBookPreviewUrl = (book: BibliotecaBook): string | null => {
    if (book.drive_url) {
      const match = book.drive_url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || book.drive_url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    if (book.id && !book.id.startsWith('18-whatsapp') && !book.id.startsWith('custom-')) {
      return `https://drive.google.com/file/d/${book.id}/preview`;
    }
    return null;
  };

  const handleOpenBookModal = (book: BibliotecaBook, tab: 'overview' | 'reader' = 'overview') => {
    setViewingBook(book);
    setViewModalTab(tab);
    if (userEmail) {
      trackEvent('biblioteca', 'read_book', book.title, { author: book.author, category: book.category }, userEmail, currentRole);
    }
  };


  const [isFetchingFromGoogle, setIsFetchingFromGoogle] = useState(false);
  const [googleBookSuggestions, setGoogleBookSuggestions] = useState<any[]>([]);

  // Função para calcular a similaridade entre o título pesquisado e o retornado pelo Google Books
  const calculateTitleSimilarity = (searched: string, candidate: string): number => {
    if (!searched || !candidate) return 0;
    const cleanWords = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2 && !['para', 'com', 'dos', 'das', 'uma', 'como'].includes(w));

    const wordsA = cleanWords(searched);
    const wordsB = cleanWords(candidate);
    if (wordsA.length === 0 || wordsB.length === 0) return 0;

    const matches = wordsA.filter(w => wordsB.some(wb => wb.includes(w) || w.includes(wb)));
    return matches.length / Math.max(wordsA.length, Math.min(wordsB.length, 6));
  };

  // Extrai o ID do Google Drive de uma URL ou string
  const extractDriveFileId = (driveUrlOrId: string): string | null => {
    if (!driveUrlOrId) return null;
    const match = driveUrlOrId.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || driveUrlOrId.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
    if (!driveUrlOrId.startsWith('http') && !driveUrlOrId.startsWith('custom-')) return driveUrlOrId;
    return null;
  };

  // Extrai a capa oficial da 1ª página do PDF hospedado no Google Drive
  const handleExtractCoverFromDrive = (driveUrlOrId: string, setCoverUrl: (url: string) => void) => {
    const fileId = extractDriveFileId(driveUrlOrId);
    if (!fileId) {
      showToast('Não foi possível identificar o ID do arquivo no Google Drive.');
      return;
    }
    const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
    setCoverUrl(thumbUrl);
    showToast('📄 Capa extraída da 1ª página do PDF com sucesso!');
  };

  // Gera uma sinopse acadêmica e teológica estruturada quando o livro não tem registro no Google Books
  const handleGenerateAcademicSynopsis = (
    title: string,
    author: string,
    category: string,
    setDescription: (desc: string) => void
  ) => {
    if (!title.trim()) {
      showToast('Informe o título do livro primeiro.');
      return;
    }
    const cleanCat = category ? category.replace(/^\d+\s*-\s*/, '').trim() : 'Estudos Teológicos';
    const authorStr = (author && author.toLowerCase() !== 'sem autor' && author.toLowerCase() !== 'desconhecido')
      ? `de autoria de ${author}`
      : 'no acervo do Seminário';

    const synopsis = `Obra acadêmica e formativa de referência na área de ${cleanCat}. O livro "${title.trim()}", ${authorStr}, aborda de forma aprofundada os fundamentos conceituais, metodológicos e temáticos essenciais para a formação teológica e ministerial no Seminário. Leitura recomendada para seminaristas, docentes e pesquisadores.`;

    setDescription(synopsis);
    showToast('✨ Sinopse acadêmica estruturada com sucesso!');
  };

  const fetchGoogleBooksMetadata = async (
    title: string,
    author: string,
    setCoverUrl: (url: string) => void,
    setDescription: (desc: string) => void,
    setAuthorCallback?: (author: string) => void
  ) => {
    if (!title.trim()) {
      showToast('Digite pelo menos o título do livro para buscar.');
      return;
    }

    setIsFetchingFromGoogle(true);
    setGoogleBookSuggestions([]);

    // Higienização de Título e Autor
    let cleanTitle = title
      .replace(/\.pdf$/i, '')
      .replace(/\.epub$/i, '')
      .replace(/\[.*?\]/g, '')
      .replace(/_BARCLAY/gi, '')
      .replace(/\(completo\)/gi, '')
      .replace(/\(comentário\)/gi, '')
      .replace(/\(comentario\)/gi, '')
      .trim();

    let cleanAuthor = (author || '').trim();
    if (
      !cleanAuthor || 
      cleanAuthor.toLowerCase() === 'sem autor' || 
      cleanAuthor.toLowerCase() === 'autor desconhecido' ||
      cleanAuthor.toLowerCase() === 'desconhecido'
    ) {
      cleanAuthor = '';
    }

    // Extrai autor entre parênteses: "Mateus (Barclay)" -> Título: "Mateus", Autor: "Barclay"
    const parenMatch = cleanTitle.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (parenMatch && !parenMatch[2].match(/^(vol|ano|ed|livro|\d+)/i)) {
      cleanTitle = parenMatch[1].trim();
      if (!cleanAuthor) cleanAuthor = parenMatch[2].trim();
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || 'AIzaSyA-xKtK_wyKABByiIo4TUycw-ZKfrUVou4';
    const keyParam = apiKey ? `&key=${apiKey}` : '';

    try {
      let candidateItems: any[] = [];

      // Tentativa 1: Título + Autor
      if (cleanAuthor) {
        const q1 = `intitle:${encodeURIComponent(cleanTitle)}+inauthor:${encodeURIComponent(cleanAuthor)}`;
        try {
          const res1 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q1}&maxResults=5&langRestrict=pt${keyParam}`);
          if (res1.ok) {
            const d1 = await res1.json();
            if (d1.items?.length > 0) candidateItems.push(...d1.items);
          }
        } catch (_) {}
      }

      // Tentativa 2: Somente Título
      if (candidateItems.length === 0) {
        const q2 = `intitle:${encodeURIComponent(cleanTitle)}`;
        try {
          const res2 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q2}&maxResults=5&langRestrict=pt${keyParam}`);
          if (res2.ok) {
            const d2 = await res2.json();
            if (d2.items?.length > 0) candidateItems.push(...d2.items);
          }
        } catch (_) {}
      }

      // Tentativa 3: Busca Ampla (Fuzzy)
      if (candidateItems.length === 0) {
        const fullQ = cleanAuthor ? `${cleanTitle} ${cleanAuthor}` : cleanTitle;
        try {
          const res3 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(fullQ)}&maxResults=5&langRestrict=pt${keyParam}`);
          if (res3.ok) {
            const d3 = await res3.json();
            if (d3.items?.length > 0) candidateItems.push(...d3.items);
          }
        } catch (_) {}
      }

      // Filtrar apenas candidatos que tenham real similaridade com o título digitado (evita livros errados)
      const validItems = candidateItems.filter(item => {
        const candidateTitle = item.volumeInfo?.title || '';
        const sim = calculateTitleSimilarity(cleanTitle, candidateTitle);
        return sim >= 0.35; // Pelo menos 35% das palavras-chave devem bater
      });

      if (validItems.length === 0) {
        showToast('Nenhum livro correspondente no Google Books. Você pode usar a 1ª página do PDF!');
        setIsFetchingFromGoogle(false);
        return;
      }

      // Se houver múltiplos resultados válidos, salva nas sugestões para o usuário escolher se quiser
      if (validItems.length > 1) {
        setGoogleBookSuggestions(validItems);
      }

      // Aplica o melhor resultado (1º da lista validada)
      const bestItem = validItems[0];
      const volumeInfo = bestItem.volumeInfo;
      let updatedCount = 0;

      if (volumeInfo.imageLinks) {
        let coverUrl = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail;
        if (coverUrl) {
          coverUrl = coverUrl.replace('http:', 'https:').replace('&edge=curl', '');
          setCoverUrl(coverUrl);
          updatedCount++;
        }
      }

      if (volumeInfo.description) {
        setDescription(volumeInfo.description);
        updatedCount++;
      }

      if (setAuthorCallback && volumeInfo.authors && volumeInfo.authors.length > 0) {
        if (!cleanAuthor || cleanAuthor.toLowerCase() === 'sem autor') {
          setAuthorCallback(volumeInfo.authors.join(', '));
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        showToast(`✨ Dados obtidos: "${volumeInfo.title}"!`);
      } else {
        showToast('Livro localizado, mas sem nova capa ou sinopse disponíveis.');
      }

    } catch (error) {
      showToast('Erro de conexão ao buscar no Google Books.');
    } finally {
      setIsFetchingFromGoogle(false);
    }
  };

  const handleSort = (column: 'title' | 'author' | 'category') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const openEditFullBookModal = (book: BibliotecaBook) => {
    setEditingFullBook(book);
    setEditBookTitle(book.title || '');
    setEditBookAuthor(book.author || '');
    setEditBookCategory(book.category || categoriesList[0] || '01 - Bíblia e Referência');
    setEditCustomCategoryName('');
    setEditBookDescription(book.description || '');
    setEditBookDriveUrl(book.drive_url || (book.id.startsWith('18-whatsapp') ? '' : `https://drive.google.com/file/d/${book.id}/view`));
    setEditBookCoverUrl(book.cover_url || '');
    setIsEditFullBookModalOpen(true);
  };

  const handleSaveFullBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFullBook) return;

    const finalCategory = editBookCategory === 'custom'
      ? (editCustomCategoryName.trim() || editingFullBook.category || '01 - Bíblia e Referência')
      : (editBookCategory.trim() || editingFullBook.category || '01 - Bíblia e Referência');

    if (editBookCategory === 'custom' && editCustomCategoryName.trim()) {
      saveCustomCategory(editCustomCategoryName.trim());
    }

    updateBibliotecaBook(editingFullBook.id, {
      title: editBookTitle.trim() || editingFullBook.title,
      author: editBookAuthor.trim() || editingFullBook.author,
      category: finalCategory,
      description: editBookDescription.trim(),
      drive_url: editBookDriveUrl.trim(),
      cover_url: editBookCoverUrl.trim() || undefined,
    });

    setIsEditFullBookModalOpen(false);
    showToast(`Livro atualizado com sucesso: ${editBookTitle || editingFullBook.title}`);
    setAllBooks(getAllBibliotecaBooks());
  };

  // Carregar e sincronizar acervo completo
  useEffect(() => {
    setAllBooks(getAllBibliotecaBooks());
    const handleUpd = () => {
      setAllBooks(getAllBibliotecaBooks());
    };
    const handleSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string | { search?: string; category?: string }>;
      if (typeof customEvent.detail === 'string') {
        setSearchTerm(customEvent.detail);
        setSelectedCategory('all');
      } else if (customEvent.detail) {
        if (customEvent.detail.search) setSearchTerm(customEvent.detail.search);
        if (customEvent.detail.category) setSelectedCategory(customEvent.detail.category);
      }
    };

    window.addEventListener('lms_biblioteca_updated', handleUpd);
    window.addEventListener('lms_search_biblioteca', handleSearchEvent);

    return () => {
      window.removeEventListener('lms_biblioteca_updated', handleUpd);
      window.removeEventListener('lms_search_biblioteca', handleSearchEvent);
    };
  }, []);

  // Livros recomendados de todas as disciplinas
  const livrosRecomendados = useMemo(() => {
    return getAllLivrosRecomendados();
  }, []);

  // Mapa de recomendação rápida por ID de livro ou por Título
  const recommendedMap = useMemo(() => {
    const map = new Map<string, { disciplina: string; isMandatory?: boolean; notes?: string }>();
    livrosRecomendados.forEach((lr) => {
      if (lr.biblioteca_book_id) {
        map.set(lr.biblioteca_book_id, {
          disciplina: lr.disciplina_name,
          isMandatory: lr.is_mandatory,
          notes: lr.notes,
        });
      }
      if (lr.book_title) {
        const normTitle = lr.book_title.toLowerCase().trim();
        map.set(normTitle, {
          disciplina: lr.disciplina_name,
          isMandatory: lr.is_mandatory,
          notes: lr.notes,
        });
      }
    });
    return map;
  }, [livrosRecomendados]);

  const getBookRecommendation = (book: BibliotecaBook) => {
    if (recommendedMap.has(book.id)) return recommendedMap.get(book.id);
    const norm = (book.title || '').toLowerCase().trim();
    if (recommendedMap.has(norm)) return recommendedMap.get(norm);
    for (const [key, val] of recommendedMap.entries()) {
      if (key.length > 5 && (norm.includes(key) || key.includes(norm))) {
        return val;
      }
    }
    return null;
  };

  // Contagem de obras recomendadas disponíveis no acervo
  const recommendedCount = useMemo(() => {
    return allBooks.filter((b) => !!getBookRecommendation(b)).length;
  }, [allBooks, recommendedMap]);

  // Extrai lista única e ordenada de categorias
  const categoriesList = useMemo(() => {
    return getBibliotecaCategories();
  }, [allBooks]);

  // Filtra livros baseado na busca e categoria selecionada
  const filteredBooks = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return allBooks.filter((book) => {
      const rec = getBookRecommendation(book);
      if (selectedCategory === 'recommended') {
        if (!rec) return false;
      } else if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        return false;
      }

      if (!query) return true;
      const matchesTitle = book.title?.toLowerCase().includes(query);
      const matchesAuthor = book.author?.toLowerCase().includes(query);
      const matchesCat = book.category?.toLowerCase().includes(query);
      const matchesDisc = rec?.disciplina.toLowerCase().includes(query);
      return matchesTitle || matchesAuthor || matchesCat || matchesDisc;
    });
  }, [allBooks, searchTerm, selectedCategory, recommendedMap]);

  // Reseta página ao mudar busca ou categoria
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, itemsPerPage]);

  // Paginação e Ordenação
  const sortedBooks = useMemo(() => {
    if (!sortColumn) return filteredBooks;
    return [...filteredBooks].sort((a, b) => {
      let valA = '';
      let valB = '';
      
      if (sortColumn === 'title') {
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
      } else if (sortColumn === 'author') {
        valA = (a.author || '').toLowerCase();
        valB = (b.author || '').toLowerCase();
      } else if (sortColumn === 'category') {
        valA = (a.category || '').toLowerCase();
        valB = (b.category || '').toLowerCase();
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredBooks, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedBooks.slice(start, start + itemsPerPage);
  }, [sortedBooks, currentPage, itemsPerPage]);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const copyCitation = (book: BibliotecaBook) => {
    const authorFormatted = (book.author || 'AUTOR NÃO INFORMADO').toUpperCase();
    const citation = `${authorFormatted}. ${book.title}. [Biblioteca Digital], 2026.`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(citation).then(() => {
        showToast(`Citação ABNT copiada: ${book.title}`);
      }).catch(() => {
        fallbackCopy(citation, () => showToast(`Citação copiada: ${book.title}`));
      });
    } else {
      fallbackCopy(citation, () => showToast(`Citação copiada: ${book.title}`));
    }
  };

  const fallbackCopy = (text: string, onSuccess: () => void) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch (err) {
      console.warn('Erro ao copiar:', err);
    }
    document.body.removeChild(textArea);
  };

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim() || !newDriveUrl.trim()) {
      showToast('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const finalCat = newCategory === 'custom' ? (customCategoryName.trim() || '01 - Bíblia e Referência') : newCategory;
    if (newCategory === 'custom' && customCategoryName.trim()) {
      saveCustomCategory(customCategoryName.trim());
    }

    const authorRole = currentRole === 'admin' ? 'admin' : currentRole === 'monitor' ? 'monitor' : 'professor';

    addCustomBook({
      title: newTitle.trim(),
      author: newAuthor.trim(),
      category: finalCat,
      drive_url: newDriveUrl.trim(),
      cover_url: newCoverUrl.trim() || undefined,
      description: newDescription.trim(),
      added_by_name: normalizedEmail.includes('ary') ? 'Profº Ary Júnior' : normalizedEmail.includes('robson') || normalizedEmail.includes('sacra') ? 'Profº Robson Rocha' : normalizedEmail.includes('camila') ? 'Monitora Camila' : normalizedEmail.includes('cristiano') ? 'Monitor Cristiano' : 'Docente / Monitoria',
      added_by_role: authorRole,
      added_by_email: normalizedEmail,
    });

    showToast(`"${newTitle}" foi adicionado com sucesso e já está disponível para todos!`);
    setIsAddBookModalOpen(false);
    setNewTitle('');
    setNewAuthor('');
    setNewDriveUrl('');
    setNewCoverUrl('');
    setNewDescription('');
    setCustomCategoryName('');
  };

  const handleDeleteBook = (id: string, title: string) => {
    if (confirm(`Deseja realmente remover a obra "${title}" do acervo da biblioteca?`)) {
      deleteCustomBook(id);
      showToast(`A obra "${title}" foi removida do acervo.`);
      setAllBooks(getAllBibliotecaBooks());
    }
  };

  const handleCopyBookLink = (book: BibliotecaBook) => {
    const driveUrl = book.drive_url || `https://drive.google.com/file/d/${book.id}/view`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(driveUrl).then(() => {
        setCopiedBookId(book.id);
        showToast(`Link copiado: ${book.title}`);
        setTimeout(() => setCopiedBookId(null), 2500);
      }).catch(() => {
        fallbackCopy(driveUrl, () => {
          setCopiedBookId(book.id);
          showToast(`Link copiado: ${book.title}`);
          setTimeout(() => setCopiedBookId(null), 2500);
        });
      });
    } else {
      fallbackCopy(driveUrl, () => {
        setCopiedBookId(book.id);
        showToast(`Link copiado: ${book.title}`);
        setTimeout(() => setCopiedBookId(null), 2500);
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-5">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Banner Principal da Biblioteca Digital */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-white/10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30">
            <Library className="w-4 h-4 text-blue-300" /> Acervo Oficial Integrado • Seminário Teológico
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Biblioteca Digital
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 max-w-2xl leading-relaxed">
            Conhecimento & Fé • Consulte e baixe obras teológicas, comentários exegéticos e materiais didáticos para o seu semestre.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
            <span className="block text-2xl sm:text-3xl font-black text-white">
              {allBooks.length.toLocaleString('pt-BR')}
            </span>
            <span className="text-[10px] sm:text-[11px] text-blue-200 uppercase tracking-wider font-semibold">
              Obras no Acervo
            </span>
          </div>

          {canOpenRootDrive && (
            <a
              href={BIBLIOTECA_ROOT_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 border border-white/30 backdrop-blur-md cursor-pointer"
              title="Abrir pasta raiz oficial do Google Drive com todo o acervo de livros em PDF"
            >
              <FolderOpen className="w-4 h-4 text-amber-300" />
              <span>Pasta Raiz (Google Drive)</span>
            </a>
          )}

          {canOpenRootDrive && (
            <a
              href={BIBLIOTECA_PROFESSOR_SUGGESTIONS_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-indigo-600/60 hover:bg-indigo-600/80 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 border border-indigo-400/40 backdrop-blur-md cursor-pointer"
              title="Abrir pasta com livros sugeridos pelos professores para o semestre"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Pasta Livros Sugeridos</span>
            </a>
          )}

          {/* Botão de Atalho para as Disciplinas */}
          <button
            data-tour="nav-disciplinas"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'disciplina-detalhe' }));
              }
            }}
            className="px-4 py-3 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
            title="Ir para o Hub de Disciplinas Acadêmicas"
          >
            <BookOpen className="w-4 h-4" />
            <span>Minhas Disciplinas</span>
          </button>

          {canAddBooks && (
            <button
              onClick={() => setIsAddBookModalOpen(true)}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 font-black" />
              <span>+ Adicionar Livro</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Pesquisa, Filtro de Categorias e Modos de Visualização */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Input de Busca */}
          <div data-tour="biblioteca-search" className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título da obra, autor, categoria ou assunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-800 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Seletor de Categoria Dropdown (Para mobile/compacto) */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none max-w-[260px] truncate"
            >
              <option value="all">Todas as Categorias ({allBooks.length})</option>
              {recommendedCount > 0 && (
                <option value="recommended">⭐ Recomendados nas Matérias ({recommendedCount})</option>
              )}
              {categoriesList.map((cat) => {
                const count = allBooks.filter((b) => b.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cleanCategoryName(cat)} ({count})
                  </option>
                );
              })}
            </select>

            {/* Alternador de Grade / Tabela */}
            <div className="bg-gray-100 p-1 rounded-2xl flex items-center gap-1 border border-gray-200/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grade</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Tabela</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tags de Categorias Rápidas em Linha Rolável */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex-shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-blue-900 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas ({allBooks.length})
          </button>
          {recommendedCount > 0 && (
            <button
              onClick={() => setSelectedCategory('recommended')}
              className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition flex-shrink-0 flex items-center gap-1.5 ${
                selectedCategory === 'recommended'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>⭐ Recomendados nas Matérias ({recommendedCount})</span>
            </button>
          )}
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = allBooks.filter((b) => b.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition flex-shrink-0 ${
                  isSelected
                    ? 'bg-blue-900 text-white font-bold shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cleanCategoryName(cat)} ({count})
              </button>
            );
          })}
        </div>

        {/* Resumo da busca e contagem */}
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div>
            Exibindo <strong>{filteredBooks.length.toLocaleString('pt-BR')}</strong> obras encontradas
            {selectedCategory === 'recommended' && <span> em <strong>⭐ Leituras e Obras Recomendadas do Semestre</strong></span>}
            {selectedCategory !== 'all' && selectedCategory !== 'recommended' && <span> na categoria <strong>{cleanCategoryName(selectedCategory)}</strong></span>}
            {searchTerm && <span> para a busca "<strong>{searchTerm}</strong>"</span>}
          </div>

          <div className="flex items-center gap-2">
            <span>Itens por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="p-1 border border-gray-200 rounded-lg text-xs font-semibold bg-gray-50 focus:outline-none"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
          </div>
        </div>
      </div>

      {/* MODO 1: GRADE DE LIVROS (CARDS MODERNOS COM CAPA) */}
      {viewMode === 'grid' && filteredBooks.length > 0 && (
        <div data-tour="biblioteca-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {paginatedBooks.map((book) => {
            const driveUrl = book.drive_url || `https://drive.google.com/file/d/${book.id}/view`;
            const color = getCategoryColor(book.category);
            const rec = getBookRecommendation(book);

            return (
              <div
                key={book.id}
                className={`rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-0.5 ${
                  rec ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-200/60' : book.is_custom ? 'border-blue-300 bg-blue-50/20' : 'bg-white border-gray-200/80'
                }`}
              >
                {/* Capa do Livro (Se tiver imagem ou gradiente temático) */}
                {book.cover_url ? (
                  <div 
                    onClick={() => setViewingBook(book)}
                    className="relative h-48 bg-slate-900 overflow-hidden flex items-center justify-center cursor-pointer"
                  >
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-lg text-[9px] font-bold uppercase tracking-wider text-white truncate max-w-[150px]">
                          {cleanCategoryName(book.category)}
                        </span>
                        {rec && (
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs ${
                            rec.isMandatory ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-300 text-amber-950'
                          }`}>
                            ⭐ {rec.isMandatory ? 'Obrigatória' : 'Recomendada'}
                          </span>
                        )}
                      </div>
                      <div className="text-white">
                        <h3 className="font-bold text-xs sm:text-sm line-clamp-2 drop-shadow-md">{book.title}</h3>
                        <p className="text-[10px] text-white/80 line-clamp-1">{book.author || 'Autor não informado'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setViewingBook(book)}
                    className={`p-4 sm:p-5 bg-gradient-to-tr ${color.gradient} text-white flex flex-col justify-between min-h-[140px] relative cursor-pointer`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="px-2 py-0.5 bg-black/25 backdrop-blur-md rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/90 truncate max-w-[160px]">
                        {cleanCategoryName(book.category)}
                      </span>
                      {rec ? (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 ${
                          rec.isMandatory ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-300 text-amber-950'
                        }`}>
                          ⭐ {rec.isMandatory ? 'Obrigatória' : 'Recomendada'}
                        </span>
                      ) : book.is_custom ? (
                        <span className="text-[9px] font-black text-amber-950 bg-amber-300 px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Novo
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-white/80 bg-white/10 px-2 py-0.5 rounded-md">
                          {formatBytes(book.size)}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 text-white group-hover:text-amber-200 transition">
                        {book.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-white/80 mt-1 truncate font-medium">
                        {book.author || 'Autor Desconhecido'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rodapé do Card com Ações */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
                  <div className="space-y-1.5">
                    {rec && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[10px] sm:text-[11px] font-bold flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-amber-900 font-extrabold">
                          🎓 {rec.disciplina}
                        </span>
                        {rec.notes && (
                          <span className="text-[10px] text-amber-800 font-medium italic line-clamp-2">
                            "{rec.notes}"
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-[11px] text-gray-500 line-clamp-1">
                      📁 {cleanCategoryName(book.category)}
                    </div>
                    {book.is_custom && book.added_by_name && (
                      <div className="text-[10px] text-blue-800 font-semibold bg-blue-100/80 px-2 py-0.5 rounded-md w-fit">
                        👤 Por: {book.added_by_name}
                      </div>
                    )}
                    {book.description && !rec && (
                      <p className="text-[11px] text-gray-600 italic line-clamp-2 mt-1">
                        "{book.description}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <button
                        onClick={() => copyCitation(book)}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-blue-900 transition text-xs font-semibold flex items-center gap-1 border border-gray-200 cursor-pointer"
                        title="Copiar Citação ABNT"
                      >
                        <Quote className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">ABNT</span>
                      </button>

                      <button
                        onClick={() => handleCopyBookLink(book)}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-blue-900 transition text-xs font-semibold flex items-center gap-1 border border-gray-200 cursor-pointer"
                        title="Copiar Link Direto para Indicar aos Alunos"
                      >
                        {copiedBookId === book.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline text-[11px]">Link</span>
                      </button>

                      {canAddBooks && (
                        <button
                          onClick={() => openEditFullBookModal(book)}
                          className="p-2 rounded-xl bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-800 transition text-xs font-semibold flex items-center gap-1 border border-gray-200 cursor-pointer"
                          title="Editar Detalhes, Descrição e Capa do Livro"
                        >
                          <Pencil className="w-3.5 h-3.5 text-amber-600" />
                          <span className="hidden sm:inline text-[11px]">Editar</span>
                        </button>
                      )}

                      {canAddBooks && book.is_custom && (
                        <button
                          onClick={() => handleDeleteBook(book.id, book.title)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition text-xs font-semibold flex items-center cursor-pointer"
                          title="Remover este livro do acervo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <a
                      href={driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Abrir / Baixar
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODO 2: TABELA DE LIVROS */}
      {viewMode === 'table' && filteredBooks.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[10px] font-extrabold tracking-wider">
                <tr>
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort('title')}
                  >
                    Obra / Título {sortColumn === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort('author')}
                  >
                    Autor {sortColumn === 'author' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort('category')}
                  >
                    Categoria {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-3.5">Status no Semestre</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedBooks.map((book) => {
                  const driveUrl = book.drive_url || `https://drive.google.com/file/d/${book.id}/view`;
                  const rec = getBookRecommendation(book);

                  return (
                    <tr key={book.id} className="hover:bg-blue-50/40 transition group">
                      <td 
                        className="p-3.5 font-medium text-slate-900 cursor-pointer"
                        onClick={() => setViewingBook(book)}
                      >
                        <div className="flex items-center gap-2.5">
                          {book.cover_url ? (
                            <img src={book.cover_url} alt="" className="w-8 h-10 object-cover rounded shadow-xs" />
                          ) : (
                            <div className="w-8 h-10 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                              PDF
                            </div>
                          )}
                          <div>
                            <div className="font-bold line-clamp-1 text-slate-900">{book.title}</div>
                            {book.description && (
                              <div className="text-[11px] text-gray-500 line-clamp-1 italic">{book.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-gray-600">{book.author || '—'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-medium">
                          {cleanCategoryName(book.category)}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {rec ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            rec.isMandatory ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}>
                            ⭐ {rec.disciplina}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Acervo Geral</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canAddBooks && (
                            <button
                              onClick={() => openEditFullBookModal(book)}
                              className="p-1.5 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                              title="Editar Detalhes e Capa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}

                          <a
                            href={driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition"
                          >
                            <Download className="w-3.5 h-3.5" /> Abrir
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Página Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs sm:text-sm font-bold text-gray-700 px-3">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Próxima Página"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODAL DE DETALHES DO LIVRO E LEITOR INTEGRADO */}
      {viewingBook && (() => {
        const previewUrl = getBookPreviewUrl(viewingBook);
        const driveUrl = viewingBook.drive_url || (viewingBook.id.startsWith('18-whatsapp') ? '#' : `https://drive.google.com/file/d/${viewingBook.id}/view`);
        const rec = getBookRecommendation(viewingBook);

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] border border-gray-100">
              
              {/* Header Superior com Seletor de Abas e Fechar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-gray-100 bg-gray-50/80 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setViewModalTab('overview')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                      viewModalTab === 'overview'
                        ? 'bg-white text-blue-900 shadow-xs border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Visão Geral</span>
                  </button>

                  <button
                    onClick={() => setViewModalTab('reader')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition cursor-pointer ${
                      viewModalTab === 'reader'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Folhear Livro</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black uppercase hidden sm:inline ${
                      viewModalTab === 'reader' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                    }`}>
                      Prévia PDF
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingBook(null)}
                    className="p-2 bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full border border-gray-200 shadow-xs transition cursor-pointer"
                    title="Fechar Janela"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* ABA 1: VISÃO GERAL */}
              {viewModalTab === 'overview' && (
                <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                  {/* Lado Esquerdo: Capa */}
                  <div className="w-full md:w-2/5 bg-slate-100 flex flex-col items-center justify-center relative p-6 shrink-0 border-b md:border-b-0 md:border-r border-gray-100">
                    {viewingBook.cover_url ? (
                      <img 
                        src={viewingBook.cover_url} 
                        alt={viewingBook.title} 
                        className="w-full max-w-[280px] h-auto max-h-[50vh] object-contain rounded-xl shadow-lg border border-slate-200/50" 
                      />
                    ) : (
                      <div className={`w-full max-w-[280px] aspect-[2/3] max-h-[50vh] rounded-xl shadow-lg border border-slate-200/50 bg-gradient-to-tr ${getCategoryColor(viewingBook.category).gradient} flex flex-col items-center justify-center p-6 text-center`}>
                        <BookOpen className="w-16 h-16 text-white/50 mb-4" />
                        <h3 className="font-bold text-white text-lg line-clamp-3 mb-2">{viewingBook.title}</h3>
                        <p className="text-white/80 font-medium text-xs">{viewingBook.author}</p>
                      </div>
                    )}

                    {previewUrl && (
                      <button
                        onClick={() => setViewModalTab('reader')}
                        className="mt-4 w-full max-w-[280px] py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" /> Folhear Páginas (Prévia)
                      </button>
                    )}
                  </div>

                  {/* Lado Direito: Informações */}
                  <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {cleanCategoryName(viewingBook.category)}
                        </span>
                        {rec && (
                          <span className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                            rec.isMandatory ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}>
                            ⭐ {rec.isMandatory ? 'Leitura Obrigatória' : 'Recomendado'}
                          </span>
                        )}
                        {viewingBook.size && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold">
                            {formatBytes(viewingBook.size)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
                        {viewingBook.title}
                      </h2>
                      <p className="text-base sm:text-lg font-medium text-slate-600 mb-4">
                        {viewingBook.author || 'Autor não informado'}
                      </p>

                      {/* Box de Recomendação */}
                      {rec && (
                        <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70">
                          <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            🎓 Recomendado na Disciplina
                          </h4>
                          <p className="font-bold text-amber-950 text-sm">
                            {rec.disciplina}
                          </p>
                          {rec.notes && (
                            <p className="text-xs sm:text-sm text-amber-800 italic mt-1.5">
                              "{rec.notes}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Descrição Completa */}
                      <div className="mb-6">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Sinopse / Descrição</h4>
                        {viewingBook.description ? (
                          <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
                            {viewingBook.description}
                          </p>
                        ) : (
                          <p className="text-slate-400 italic text-sm">
                            Nenhuma sinopse disponível para este livro.
                          </p>
                        )}
                        
                        {viewingBook.is_custom && viewingBook.added_by_name && (
                          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Adicionado ao acervo por <strong>{viewingBook.added_by_name}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2.5 mt-auto">
                      <a
                        href={driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> 
                        <span className="whitespace-nowrap">Abrir / Baixar</span>
                      </a>
                      
                      <button
                        onClick={() => copyCitation(viewingBook)}
                        className="px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-gray-200 cursor-pointer"
                      >
                        <Quote className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Citação ABNT</span>
                      </button>

                      <button
                        onClick={() => handleCopyBookLink(viewingBook)}
                        className="px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-gray-200 cursor-pointer"
                      >
                        {copiedBookId === viewingBook.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Copiar Link</span>
                      </button>

                      {canAddBooks && (
                        <button
                          onClick={() => {
                            setViewingBook(null);
                            openEditFullBookModal(viewingBook);
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-amber-200 ml-auto cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* ABA 2: LEITOR INTEGRADO / FOLHEAR LIVRO */}
              {viewModalTab === 'reader' && (
                <div className="flex-1 flex flex-col min-h-[60vh] sm:min-h-[72vh] bg-slate-900/5 p-3 sm:p-5">
                  <div className="flex items-center justify-between gap-2 mb-3 px-1">
                    <div className="truncate">
                      <span className="text-xs font-bold text-gray-500 uppercase">Leitor Interno:</span>{' '}
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">{viewingBook.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 shadow-2xs flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Abrir no Google Drive
                      </a>
                    </div>
                  </div>

                  {previewUrl ? (
                    <div className="flex-1 w-full h-full min-h-[55vh] sm:min-h-[68vh] rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-slate-950 relative">
                      <iframe
                        src={previewUrl}
                        className="w-full h-full min-h-[55vh] sm:min-h-[68vh] border-0"
                        title={`Prévia do livro ${viewingBook.title}`}
                        allow="autoplay"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-gray-200">
                      <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 mb-1">Prévia interna indisponível</h4>
                      <p className="text-sm text-gray-500 max-w-md mb-6">
                        Este material está disponível diretamente pelo link externo ou Google Drive.
                      </p>
                      <a
                        href={driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm transition"
                      >
                        <ExternalLink className="w-4 h-4" /> Acessar Documento Completo
                      </a>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* MODAL 1: ADIÇÃO DE NOVO LIVRO AO ACERVO */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Adicionar Livro ao Acervo da Biblioteca
              </h3>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-sm transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="space-y-3.5 text-left">
              {/* Preenchimento Rápido com Livros Sugeridos pelos Professores */}
              <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 space-y-1.5">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Preenchimento Rápido (Sugestões dos Professores):</span>
                </label>
                <select
                  onChange={(e) => {
                    const sel = livrosRecomendados.find((lr) => lr.id === e.target.value);
                    if (sel) {
                      setNewTitle(sel.book_title || '');
                      setNewAuthor(sel.book_author || '');
                      setNewCategory(sel.category || '01. Teologia Sistemática');
                      setNewDriveUrl(sel.book_url || 'https://drive.google.com/drive/folders/1ZYlVXv5MTJNQZJB7WVrjGJmHd7ceauG1');
                      setNewDescription(sel.notes || `Livro sugerido pelo ${sel.added_by_name || 'Professor'} para a disciplina de ${sel.disciplina_name || 'Seminário'}.`);
                    }
                  }}
                  defaultValue=""
                  className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>Selecione uma obra recomendada para autopreencher...</option>
                  {livrosRecomendados.map((lr) => (
                    <option key={lr.id} value={lr.id}>
                      {lr.book_title} — {lr.added_by_name} ({lr.disciplina_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título da Obra / Livro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Teologia Sistemática"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome do Autor / Comentarista <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Wayne Grudem"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 pb-1">
                <span className="text-[11px] text-gray-500 italic">
                  Após digitar o título/autor, clique para buscar:
                </span>
                <button
                  type="button"
                  onClick={() => fetchGoogleBooksMetadata(newTitle, newAuthor, setNewCoverUrl, setNewDescription, setNewAuthor)}
                  disabled={isFetchingFromGoogle || !newTitle.trim()}
                  className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer w-full sm:w-auto justify-center"
                >
                  {isFetchingFromGoogle ? (
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" /> Buscando dados...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Auto-preencher Capa e Sinopse
                    </>
                  )}
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Categoria Teológica
                  </label>
                  {newCategory === 'custom' && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewCategory(categoriesList[0] || '01 - Bíblia e Referência');
                        setCustomCategoryName('');
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer transition"
                    >
                      ← Escolher das Existentes
                    </button>
                  )}
                </div>
                <select
                  value={newCategory}
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                    if (e.target.value !== 'custom') {
                      setCustomCategoryName('');
                    }
                  }}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="custom" className="font-bold text-blue-600">
                    ➕ Cadastrar Nova Categoria...
                  </option>
                </select>
              </div>

              {newCategory === 'custom' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <label className="block text-xs font-bold text-blue-950">
                    Nome da Nova Categoria: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 15 - Teologia Contemporânea ou Liderança Cristã"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    className="w-full p-2.5 border border-blue-300 bg-white rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                    autoFocus
                  />
                  <p className="text-[10px] text-blue-700">
                    💡 Esta nova categoria ficará salva e disponível no dropdown para todas as obras.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link do Arquivo no Google Drive / PDF <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={newDriveUrl}
                  onChange={(e) => setNewDriveUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  URL da Capa do Livro (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/capa.jpg"
                  value={newCoverUrl}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {newCoverUrl && (
                  <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2.5">
                    <img
                      src={newCoverUrl}
                      alt="Prévia da Capa"
                      className="w-10 h-14 object-cover rounded-md shadow-xs border border-gray-200"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="text-[11px] text-gray-600 truncate">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Capa carregada
                      </span>
                      <span className="text-gray-400 truncate block max-w-[240px]">{newCoverUrl}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Breve Descrição / Sinopse (Opcional)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateAcademicSynopsis(newTitle, newAuthor, newCategory === 'custom' ? customCategoryName : newCategory, setNewDescription)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer transition"
                      title="Gera uma sinopse acadêmica estruturada baseada no título, autor e categoria"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Sugerir Sinopse
                    </button>
                    {newDescription && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewDescription('');
                          showToast('Sinopse limpa!');
                        }}
                        className="text-[11px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-0.5 cursor-pointer transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        Limpar
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="Ex: Obra de referência para a disciplina de Teologia Sistemática..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Cadastrar no Acervo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR DETALHES, DESCRIÇÃO E CAPA DO LIVRO */}
      {isEditFullBookModalOpen && editingFullBook && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-600" /> Editar Livro
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{editingFullBook.title}</p>
              </div>
              <button
                onClick={() => setIsEditFullBookModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-sm transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFullBook} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título da Obra:
                </label>
                <input
                  type="text"
                  required
                  value={editBookTitle}
                  onChange={(e) => setEditBookTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome do Autor / Comentarista:
                </label>
                <input
                  type="text"
                  required
                  value={editBookAuthor}
                  onChange={(e) => setEditBookAuthor(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-2">
                <span className="block text-[11px] font-bold text-gray-700">
                  Opções de Auto-preenchimento e Capa:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchGoogleBooksMetadata(editBookTitle, editBookAuthor, setEditBookCoverUrl, setEditBookDescription, setEditBookAuthor)}
                    disabled={isFetchingFromGoogle || !editBookTitle.trim()}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isFetchingFromGoogle ? (
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" /> Buscando dados...
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Buscar no Google Books
                      </>
                    )}
                  </button>

                  {editBookDriveUrl && (
                    <button
                      type="button"
                      onClick={() => handleExtractCoverFromDrive(editBookDriveUrl, setEditBookCoverUrl)}
                      className="px-3 py-1.5 bg-white hover:bg-gray-100 text-slate-800 border border-gray-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Usa a primeira página do arquivo PDF original do Google Drive como capa oficial"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Usar 1ª Página do PDF
                    </button>
                  )}

                  {editBookCoverUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditBookCoverUrl('');
                        showToast('Capa removida. O livro usará o gradiente temático da categoria.');
                      }}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Remover imagem de capa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Limpar Capa
                    </button>
                  )}
                </div>
              </div>

              {/* Sugestões Múltiplas do Google Books para Escolha do Usuário */}
              {googleBookSuggestions.length > 0 && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                      Escolha a edição correta ({googleBookSuggestions.length} encontradas):
                    </p>
                    <button
                      type="button"
                      onClick={() => setGoogleBookSuggestions([])}
                      className="text-[10px] text-gray-500 hover:text-gray-800 font-bold"
                    >
                      Fechar ✕
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {googleBookSuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const v = item.volumeInfo;
                          if (v.imageLinks?.thumbnail) {
                            setEditBookCoverUrl(v.imageLinks.thumbnail.replace('http:', 'https:').replace('&edge=curl', ''));
                          }
                          if (v.description) setEditBookDescription(v.description);
                          if (v.authors?.length) setEditBookAuthor(v.authors.join(', '));
                          setGoogleBookSuggestions([]);
                          showToast(`✅ Aplicada edição: "${v.title}"`);
                        }}
                        className="p-2 bg-white hover:bg-blue-100/60 border border-blue-100 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition shadow-2xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {item.volumeInfo?.imageLinks?.thumbnail && (
                            <img src={item.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')} alt="" className="w-6 h-8 object-cover rounded shadow-2xs shrink-0" />
                          )}
                          <div className="truncate text-xs">
                            <p className="font-bold text-slate-800 truncate">{item.volumeInfo?.title}</p>
                            <p className="text-[10px] text-slate-500 truncate">{item.volumeInfo?.authors?.join(', ') || 'Autor Desconhecido'}</p>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shrink-0">
                          Usar este
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Categoria Teológica:
                  </label>
                  {editBookCategory === 'custom' && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditBookCategory(editingFullBook?.category || categoriesList[0] || '01 - Bíblia e Referência');
                        setEditCustomCategoryName('');
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer transition"
                    >
                      ← Escolher das Existentes
                    </button>
                  )}
                </div>
                <select
                  value={editBookCategory}
                  onChange={(e) => {
                    setEditBookCategory(e.target.value);
                    if (e.target.value !== 'custom') {
                      setEditCustomCategoryName('');
                    }
                  }}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {editingFullBook?.category && !categoriesList.includes(editingFullBook.category) && (
                    <option value={editingFullBook.category}>
                      {editingFullBook.category} (Atual)
                    </option>
                  )}
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="custom" className="font-bold text-blue-600">
                    ➕ Cadastrar Nova Categoria...
                  </option>
                </select>
              </div>

              {editBookCategory === 'custom' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <label className="block text-xs font-bold text-blue-950">
                    Nome da Nova Categoria: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 15 - Teologia Contemporânea ou Liderança Pastoral"
                    value={editCustomCategoryName}
                    onChange={(e) => setEditCustomCategoryName(e.target.value)}
                    className="w-full p-2.5 border border-blue-300 bg-white rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                    autoFocus
                  />
                  <p className="text-[10px] text-blue-700">
                    💡 Esta nova categoria ficará salva e disponível no dropdown para todas as obras.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Link do Google Drive / PDF:
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={editBookDriveUrl}
                  onChange={(e) => setEditBookDriveUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  URL da Imagem de Capa (Opcional):
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/capa.jpg"
                  value={editBookCoverUrl}
                  onChange={(e) => setEditBookCoverUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {editBookCoverUrl && (
                  <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2.5">
                    <img
                      src={editBookCoverUrl}
                      alt="Prévia da Capa"
                      className="w-10 h-14 object-cover rounded-md shadow-xs border border-gray-200"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="text-[11px] text-gray-600 truncate">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Capa carregada
                      </span>
                      <span className="text-gray-400 truncate block max-w-[240px]">{editBookCoverUrl}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Descrição / Sinopse do Livro:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateAcademicSynopsis(editBookTitle, editBookAuthor, editBookCategory, setEditBookDescription)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer transition"
                      title="Gera uma sinopse acadêmica estruturada baseada no título, autor e categoria"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Sugerir Sinopse
                    </button>
                    {editBookDescription && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditBookDescription('');
                          showToast('Sinopse limpa!');
                        }}
                        className="text-[11px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-0.5 cursor-pointer transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        Limpar
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  rows={3}
                  placeholder="Descrição da obra..."
                  value={editBookDescription}
                  onChange={(e) => setEditBookDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditFullBookModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
