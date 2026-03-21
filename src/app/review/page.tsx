'use client';

import { useKnowledge } from '@/lib/store';
import { CATEGORY_COLORS } from '@/lib/types';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Shuffle,
  Star,
  BookOpen,
  Eye,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

type ReviewMode = 'all' | 'needReview' | 'favorites';

export default function ReviewPage() {
  const { items, initialized, markReviewed, toggleFavorite } = useKnowledge();
  const [mode, setMode] = useState<ReviewMode>('needReview');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedInSession, setReviewedInSession] = useState<Set<string>>(new Set());
  const [started, setStarted] = useState(false);

  const reviewItems = useMemo(() => {
    let pool = [...items];
    if (mode === 'needReview') {
      pool = pool.filter(
        (i) => !i.lastReviewedAt || daysSince(i.lastReviewedAt) >= 7
      );
    } else if (mode === 'favorites') {
      pool = pool.filter((i) => i.isFavorite);
    }
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }, [items, mode]);

  const currentItem = reviewItems[currentIndex];
  const isFinished = currentIndex >= reviewItems.length;

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleMarkReviewed = () => {
    if (currentItem) {
      markReviewed(currentItem.id);
      setReviewedInSession((prev) => new Set(prev).add(currentItem.id));
    }
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setReviewedInSession(new Set());
    setStarted(false);
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted">加载中...</div>
      </div>
    );
  }

  // Start screen
  if (!started) {
    const needReviewCount = items.filter(
      (i) => !i.lastReviewedAt || daysSince(i.lastReviewedAt) >= 7
    ).length;
    const favCount = items.filter((i) => i.isFavorite).length;

    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RotateCcw size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">知识回顾</h1>
          <p className="text-muted text-sm mt-2">
            通过闪卡模式回顾你的知识，加深记忆
          </p>
        </div>

        <div className="space-y-3">
          <ModeCard
            active={mode === 'needReview'}
            onClick={() => setMode('needReview')}
            icon={Lightbulb}
            title="待回顾"
            desc={`${needReviewCount} 条知识超过 7 天未回顾`}
            count={needReviewCount}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <ModeCard
            active={mode === 'favorites'}
            onClick={() => setMode('favorites')}
            icon={Star}
            title="收藏精选"
            desc={`回顾你收藏的 ${favCount} 条重要知识`}
            count={favCount}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <ModeCard
            active={mode === 'all'}
            onClick={() => setMode('all')}
            icon={Shuffle}
            title="全部随机"
            desc={`从全部 ${items.length} 条知识中随机抽取`}
            count={items.length}
            color="text-blue-600"
            bg="bg-blue-50"
          />
        </div>

        <button
          onClick={() => setStarted(true)}
          disabled={
            (mode === 'needReview' && needReviewCount === 0) ||
            (mode === 'favorites' && favCount === 0) ||
            items.length === 0
          }
          className="w-full mt-6 py-3 bg-accent text-white rounded-xl text-sm font-medium hover:bg-indigo-600 shadow-sm shadow-accent/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          开始回顾 <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // Finished screen
  if (isFinished) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="text-center py-12 animate-fade-in" style={{ opacity: 0 }}>
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold">回顾完成！</h2>
          <p className="text-muted text-sm mt-2">
            本次共回顾了 {reviewedInSession.size} 条知识
          </p>
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-indigo-600"
            >
              <RotateCcw size={14} />
              再来一轮
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm hover:bg-gray-50"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Review card
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-muted">
          {currentIndex + 1} / {reviewItems.length}
        </span>
        <button
          onClick={handleRestart}
          className="text-xs text-muted hover:text-foreground"
        >
          退出回顾
        </button>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / reviewItems.length) * 100}%` }}
        />
      </div>

      {/* Flash card */}
      <div
        className="flip-card w-full cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{ minHeight: 320 }}
      >
        <div className={`flip-card-inner relative w-full ${flipped ? 'flipped' : ''}`} style={{ minHeight: 320 }}>
          {/* Front - question */}
          <div className="flip-card-front absolute inset-0 bg-white rounded-2xl border border-border shadow-sm p-8 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[currentItem.category] || 'bg-gray-100 text-gray-600'}`}>
                {currentItem.category}
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Eye size={12} />
                回顾 {currentItem.reviewCount} 次
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <h2 className="text-xl font-bold text-center leading-relaxed">
                {currentItem.title}
              </h2>
            </div>
            <p className="text-xs text-muted text-center mt-4">
              点击卡片查看内容 →
            </p>
          </div>

          {/* Back - answer */}
          <div className="flip-card-back absolute inset-0 bg-white rounded-2xl border border-border shadow-sm p-8 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">{currentItem.title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currentItem.id);
                }}
                className="p-1"
              >
                <Star
                  size={16}
                  className={currentItem.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                />
              </button>
            </div>
            <div className="flex-1 space-y-1.5">
              {currentItem.content.split('\n').map((line, i) => (
                <p key={i} className={`text-sm leading-relaxed ${line.trim() === '' ? 'h-2' : 'text-gray-700'}`}>
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
            {currentItem.note && (
              <div className="mt-4 p-3 bg-accent-light/50 rounded-lg border border-indigo-100">
                <p className="text-xs text-accent font-medium mb-1">💡 个人笔记</p>
                <p className="text-xs text-gray-600 leading-relaxed">{currentItem.note}</p>
              </div>
            )}
            <p className="text-xs text-muted text-center mt-3">
              点击卡片翻回正面
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleNext}
          className="flex-1 py-3 border border-border rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          跳过 <ChevronRight size={14} />
        </button>
        <button
          onClick={handleMarkReviewed}
          className="flex-1 py-3 bg-accent text-white rounded-xl text-sm font-medium hover:bg-indigo-600 flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={14} />
          已掌握
        </button>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
  count,
  color,
  bg,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
  count: number;
  color: string;
  bg: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left ${
        active
          ? 'border-accent bg-accent-light/30 ring-1 ring-accent/20'
          : 'border-border bg-white hover:bg-gray-50'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted mt-0.5">{desc}</p>
      </div>
      <span className={`text-lg font-bold ${color}`}>{count}</span>
    </button>
  );
}

function daysSince(dateStr: string): number {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
}
