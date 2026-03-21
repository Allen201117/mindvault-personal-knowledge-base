export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source: string;
  note: string;
  isFavorite: boolean;
  reviewCount: number;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Category = '技术' | '产品' | '设计' | '商业' | '生活' | '阅读';

export const CATEGORIES: Category[] = ['技术', '产品', '设计', '商业', '生活', '阅读'];

export const CATEGORY_COLORS: Record<string, string> = {
  '技术': 'bg-blue-100 text-blue-700',
  '产品': 'bg-purple-100 text-purple-700',
  '设计': 'bg-pink-100 text-pink-700',
  '商业': 'bg-amber-100 text-amber-700',
  '生活': 'bg-green-100 text-green-700',
  '阅读': 'bg-orange-100 text-orange-700',
};

export const CATEGORY_DOT_COLORS: Record<string, string> = {
  '技术': 'bg-blue-500',
  '产品': 'bg-purple-500',
  '设计': 'bg-pink-500',
  '商业': 'bg-amber-500',
  '生活': 'bg-green-500',
  '阅读': 'bg-orange-500',
};
