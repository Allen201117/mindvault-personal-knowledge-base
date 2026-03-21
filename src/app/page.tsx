'use client';

import { useKnowledge } from '@/lib/store';
import { CATEGORIES, CATEGORY_DOT_COLORS } from '@/lib/types';
import Link from 'next/link';
import {
  BookOpen,
  Star,
  RotateCcw,
  PlusCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { items, initialized } = useKnowledge();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted">加载中...</div>
      </div>
    );
  }

  const totalItems = items.length;
  const favoriteCount = items.filter((i) => i.isFavorite).length;
  const reviewedCount = items.filter((i) => i.reviewCount > 0).length;
  const needReviewCount = items.filter(
    (i) => !i.lastReviewedAt || daysSince(i.lastReviewedAt) >= 7
  ).length;

  const categoryStats = CATEGORIES.map((cat) => ({
    name: cat,
    count: items.filter((i) => i.category === cat).length,
  })).filter((c) => c.count > 0);

  const recentItems = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const allTags = items.flatMap((i) => i.tags);
  const tagCounts = allTags.reduce(
    (acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">我的知识库</h1>
          <p className="text-muted text-sm mt-1">
            收集 · 整理 · 检索 · 回顾 —— 让知识真正属于你
          </p>
        </div>
        <Link
          href="/knowledge/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-indigo-600 shadow-sm shadow-accent/20 shrink-0"
        >
          <PlusCircle size={16} />
          新增知识
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="知识总数" value={totalItems} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Star} label="已收藏" value={favoriteCount} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={TrendingUp} label="已回顾" value={reviewedCount} color="text-green-600" bg="bg-green-50" />
        <Link href="/review" className="block">
          <div className="bg-white rounded-xl border border-border p-4 card-hover cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <RotateCcw size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted">待回顾</p>
                <p className="text-xl font-bold text-purple-600">{needReviewCount}</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent items */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted" />
              <h2 className="font-semibold text-sm">最近添加</h2>
            </div>
            <Link href="/knowledge" className="text-xs text-accent hover:underline flex items-center gap-1">
              查看全部 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentItems.map((item, idx) => (
              <Link
                key={item.id}
                href={`/knowledge/${item.id}`}
                className={`block px-5 py-3.5 hover:bg-gray-50 animate-fade-in stagger-${idx + 1}`}
                style={{ opacity: 0 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted mt-1 line-clamp-1">{item.content}</p>
                  </div>
                  <span className="text-[11px] text-muted whitespace-nowrap shrink-0">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
            {recentItems.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted">
                还没有知识条目，点击右上角新增吧
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Category distribution */}
          <div className="bg-white rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-sm">分类分布</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {categoryStats.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_DOT_COLORS[cat.name] || 'bg-gray-400'}`} />
                  <span className="text-sm flex-1">{cat.name}</span>
                  <span className="text-xs text-muted">{cat.count}</span>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${CATEGORY_DOT_COLORS[cat.name] || 'bg-gray-400'}`}
                      style={{ width: `${(cat.count / totalItems) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {categoryStats.length === 0 && (
                <p className="text-sm text-muted text-center py-2">暂无数据</p>
              )}
            </div>
          </div>

          {/* Hot tags */}
          <div className="bg-white rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              <h2 className="font-semibold text-sm">热门标签</h2>
            </div>
            <div className="px-5 py-4 flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <Link
                  key={tag}
                  href={`/knowledge?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 hover:bg-accent-light text-xs rounded-md text-gray-600 hover:text-accent"
                >
                  #{tag}
                  <span className="text-[10px] text-muted">({count})</span>
                </Link>
              ))}
              {topTags.length === 0 && (
                <p className="text-sm text-muted">暂无标签</p>
              )}
            </div>
          </div>

          {/* Quick review CTA */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
            <RotateCcw size={20} className="mb-3 opacity-80" />
            <h3 className="font-semibold text-sm">开始回顾</h3>
            <p className="text-xs opacity-80 mt-1 leading-relaxed">
              {needReviewCount > 0
                ? `有 ${needReviewCount} 条知识等待回顾，保持学习的节奏吧！`
                : '所有知识都已回顾过，保持节奏！'}
            </p>
            <Link
              href="/review"
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-xs font-medium"
            >
              进入回顾 <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 card-hover">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
        <div>
          <p className="text-xs text-muted">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function daysSince(dateStr: string): number {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
