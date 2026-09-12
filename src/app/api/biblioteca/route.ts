import { NextRequest, NextResponse } from 'next/server';
import rawBooksData from '@/lib/bibliotecaData.json';
import { BibliotecaBook } from '@/types';

// O rawBooksData de 4.9MB permanece exclusivamente no servidor e NÃO vai para o bundle do cliente
const allServerBooks: BibliotecaBook[] = (rawBooksData as BibliotecaBook[]).map((b) => ({
  ...b,
  is_custom: false,
  in_library: true,
  is_available: true,
}));

// Categorias únicas calculadas no servidor
const uniqueCategories: string[] = Array.from(
  new Set(allServerBooks.map((b) => b.category).filter(Boolean))
).sort();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('q') || searchParams.get('search') || '').toLowerCase().trim();
    const category = searchParams.get('category') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limitParam = searchParams.get('limit');
    const returnAll = limitParam === 'all';
    const limit = returnAll ? allServerBooks.length : Math.max(1, Math.min(100, parseInt(limitParam || '30', 10)));

    let filtered = allServerBooks;

    if (category && category !== 'all' && category !== 'TODAS') {
      filtered = filtered.filter((b) => b.category === category);
    }

    if (search) {
      filtered = filtered.filter(
        (b) =>
          (b.title && b.title.toLowerCase().includes(search)) ||
          (b.author && b.author.toLowerCase().includes(search)) ||
          (b.category && b.category.toLowerCase().includes(search)) ||
          (b.description && b.description.toLowerCase().includes(search)) ||
          (b.subcategoria && b.subcategoria.toLowerCase().includes(search))
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const books = returnAll ? filtered : filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages,
      categories: uniqueCategories,
      books,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao consultar acervo da biblioteca.',
      },
      { status: 500 }
    );
  }
}
