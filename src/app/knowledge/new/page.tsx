'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKnowledge } from '@/lib/store';
import { CATEGORIES } from '@/lib/types';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewKnowledgePage() {
  const router = useRouter();
  const { addItem } = useKnowledge();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = '请输入标题';
    if (!content.trim()) newErrors.content = '请输入内容';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addItem({
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
      source: source.trim(),
      note: note.trim(),
    });

    router.push('/knowledge');
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/knowledge"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">新增知识</h1>
          <p className="text-xs text-muted mt-0.5">记录一条新的知识卡片</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：费曼学习法的核心原理"
            className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent ${
              errors.title ? 'border-red-300' : 'border-border'
            }`}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="记录知识的核心内容、要点、步骤..."
            rows={8}
            className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y ${
              errors.content ? 'border-red-300' : 'border-border'
            }`}
          />
          {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
        </div>

        {/* Category + Tags row */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1.5">分类</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                    category === cat
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white border-border text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1.5">标签</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入标签，按 Enter 添加"
                className="flex-1 px-3 py-1.5 bg-white border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                <Plus size={14} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-light text-accent rounded text-xs"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium mb-1.5">来源链接</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium mb-1.5">个人笔记</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="记录你的理解、心得、联想..."
            rows={3}
            className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-indigo-600 shadow-sm shadow-accent/20"
          >
            <Save size={16} />
            保存知识
          </button>
          <Link
            href="/knowledge"
            className="px-5 py-2.5 text-sm text-muted hover:text-foreground"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
