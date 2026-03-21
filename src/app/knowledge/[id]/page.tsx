'use client';

import { useParams, useRouter } from 'next/navigation';
import { useKnowledge } from '@/lib/store';
import { CATEGORY_COLORS } from '@/lib/types';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  ExternalLink,
  Clock,
  Eye,
  Trash2,
  Edit3,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';

export default function KnowledgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getItem, toggleFavorite, deleteItem, initialized } = useKnowledge();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const id = params.id as string;
  const item = getItem(id);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted">加载中...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted">知识不存在或已删除</p>
        <Link href="/knowledge" className="text-sm text-accent hover:underline">
          返回知识库
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteItem(id);
    router.push('/knowledge');
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Back navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/knowledge" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft size={16} />
          返回列表
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(id)}
            className={`p-2 rounded-lg border ${
              item.isFavorite
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-white border-border text-gray-400 hover:text-amber-500'
            }`}
            title={item.isFavorite ? '取消收藏' : '收藏'}
          >
            <Star size={16} fill={item.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg border border-border bg-white text-gray-400 hover:text-red-500 hover:border-red-200"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main card */}
      <article className="bg-white rounded-xl border border-border overflow-hidden animate-fade-in" style={{ opacity: 0 }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-600'}`}>
              {item.category}
            </span>
            {item.isFavorite && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                ★ 已收藏
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold leading-snug">{item.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {formatFullDate(item.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={12} />
              回顾 {item.reviewCount} 次
            </span>
            {item.lastReviewedAt && (
              <span className="text-xs">
                上次回顾：{formatFullDate(item.lastReviewedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="prose prose-sm max-w-none">
            {item.content.split('\n').map((line, i) => (
              <p key={i} className={`text-sm leading-relaxed ${line.trim() === '' ? 'h-3' : 'text-gray-700'}`}>
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        </div>

        {/* Note */}
        {item.note && (
          <div className="px-6 pb-5">
            <div className="bg-accent-light/50 rounded-lg p-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-accent" />
                <span className="text-xs font-medium text-accent">个人笔记</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{item.note}</p>
            </div>
          </div>
        )}

        {/* Source */}
        {item.source && (
          <div className="px-6 pb-5">
            <a
              href={item.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
            >
              <ExternalLink size={12} />
              查看来源
            </a>
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="px-6 pb-5 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Link
                key={tag}
                href={`/knowledge?tag=${encodeURIComponent(tag)}`}
                className="text-xs px-2.5 py-1 bg-gray-50 hover:bg-accent-light text-gray-600 hover:text-accent rounded-md"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </article>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl animate-fade-in">
            <h3 className="font-semibold text-base">确认删除？</h3>
            <p className="text-sm text-muted mt-2">删除后无法恢复，确定要删除这条知识吗？</p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-muted hover:text-foreground"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
