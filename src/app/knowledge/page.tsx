'use client';

import { useKnowledge } from '@/lib/store';
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo, Suspense } from 'react';
import {
  Search,
  Star,
  Filter,
  X,
  BookOpen,
  Clock,
  Eye,
} from 'lucide-react';

function KnowledgeListContent() {
  const { items, initialized, toggleFavorite } = useKnowledge();
  const searchParams = useSearchParams();
  const initialTag = searchParams.get('tag') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostReviewed'>('newest');

  const allTags = useMemo(() => {
    const tagSet = new Set(items.flatMap((i) => i.tags));
    return Array.from(tagSet).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (selectedTag) {
      result = result.filter((item) => item.tags.includes(selectedTag));
    }

    if (showFavoritesOnly) {
      result = result.filter((item) => item.isFavorite);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return b.reviewCount - a.reviewCount;
    });

    return result;
  }, [items, searchQuery, selectedCategory, selectedTag, showFavoritesOnly, sortBy]);

  const hasFilters = searchQuery || selectedCategory || selectedTag || showFavoritesOnly;

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">知识库</h1>
        <p className="text-muted text-sm mt-1">
          共 {items.length} 条知识 · 搜索、筛选你的知识卡片
        </p>
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="搜索标题、内容或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-muted" />

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-white border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="">全部分类</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Tag filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 bg-white border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="">全部标签</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Favorites toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs ${
              showFavoritesOnly
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-border text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Star size={12} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            收藏
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'mostReviewed')}
            className="px-3 py-1.5 bg-white border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 ml-auto"
          >
            <option value="newest">最新添加</option>
            <option value="oldest">最早添加</option>
            <option value="mostReviewed">最多回顾</option>
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedTag('');
                setShowFavoritesOnly(false);
              }}
              className="text-xs text-accent hover:underline"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {hasFilters && (
        <p className="text-xs text-muted">
          找到 {filteredItems.length} 条结果
        </p>
      )}

      {/* Knowledge cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border border-border card-hover animate-fade-in stagger-${Math.min(idx + 1, 5)}`}
            style={{ opacity: 0 }}
          >
            <Link href={`/knowledge/${item.id}`} className="block p-4">
              {/* Category + Favorite row */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-600'}`}>
                  {item.category}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Star
                    size={14}
                    className={item.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                  />
                </button>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold line-clamp-2 leading-snug">{item.title}</h3>

              {/* Content preview */}
              <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">{item.content}</p>

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-muted rounded">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-[10px] text-muted">+{item.tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                  <Clock size={10} />
                  {formatDate(item.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                  <Eye size={10} />
                  回顾{item.reviewCount}次
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-sm text-muted">
            {hasFilters ? '没有找到匹配的知识' : '知识库为空'}
          </p>
          {hasFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedTag('');
                setShowFavoritesOnly(false);
              }}
              className="text-xs text-accent hover:underline mt-2"
            >
              清除筛选条件
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function KnowledgeListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-pulse text-muted">加载中...</div></div>}>
      <KnowledgeListContent />
    </Suspense>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
