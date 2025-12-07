"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Search, SlidersHorizontal, Check, AlertCircle, Loader2, FileText, Database, Server, Code, Info, ChevronDown, ChevronUp, Edit2, X, Save, Languages, ArrowRightLeft, Globe } from 'lucide-react';
import { QaEntry, QaStatus, QaDomain } from '@/lib/types';

export default function SearchPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QaEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [translatedItems, setTranslatedItems] = useState<Set<string>>(new Set());

  // Translation State
  const [translatingQuery, setTranslatingQuery] = useState(false);
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());

  // Edit State
  const [editingItem, setEditingItem] = useState<QaEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<QaStatus | 'all'>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');

  // Search Function
  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!query.trim() && statusFilter === 'all' && domainFilter === 'all') return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setExpandedItems(new Set());
    setTranslatedItems(new Set());

    try {
      const res = await fetch('/api/qa/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          status: statusFilter,
          domain: domainFilter,
          page: 1,
          pageSize: 50
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to search');
      }

      setResults(data.matches || []);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while searching. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter, domainFilter]);

  // Auto-search when filters change
  useEffect(() => {
    if (hasSearched || statusFilter !== 'all' || domainFilter !== 'all') {
      const timer = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [statusFilter, domainFilter, handleSearch]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleTranslateQuery = async () => {
    if (!query.trim()) return;
    setTranslatingQuery(true);
    try {
      // Detect if query is Arabic (simple check)
      const isArabic = /[\u0600-\u06FF]/.test(query);
      const targetLang = isArabic ? 'en' : 'ar';

      const res = await fetch('/api/qa/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query, targetLang }),
      });

      const data = await res.json();
      if (data.translatedText) {
        setQuery(data.translatedText);
      }
    } catch (err) {
      console.error("Translation failed", err);
    } finally {
      setTranslatingQuery(false);
    }
  };

  const toggleTranslateResult = async (item: QaEntry) => {
    const id = item._id!;

    // If already showing translation, hide it
    if (translatedItems.has(id)) {
      const newTranslated = new Set(translatedItems);
      newTranslated.delete(id);
      setTranslatedItems(newTranslated);
      return;
    }

    // Determine target language
    // If question_text is Arabic, we want English.
    // If question_text is English, we want Arabic.
    const isArabic = /[\u0600-\u06FF]/.test(item.question_text);
    const targetLang = isArabic ? 'en' : 'ar';

    // Check if we already have the translation
    let hasTranslation = false;
    if (targetLang === 'en' && item.question_text_en) hasTranslation = true;
    // Note: We don't have a dedicated 'question_text_ar' field in the type yet, 
    // so if target is Arabic, we might need to fetch it unless we store it elsewhere.
    // For now, let's assume we always fetch if it's not the 'en' field we have.

    if (hasTranslation) {
      const newTranslated = new Set(translatedItems);
      newTranslated.add(id);
      setTranslatedItems(newTranslated);
    } else {
      setTranslatingIds(prev => new Set(prev).add(id));
      try {
        const res = await fetch('/api/qa/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: item.question_text,
            targetLang,
            qaId: id
          }),
        });

        const data = await res.json();

        if (data.translatedText) {
          // Update local result
          setResults(prev => prev.map(r => {
            if (r._id === id) {
              // If target was EN, update question_text_en
              // If target was AR, we currently don't have a dedicated field in the frontend type to show it separately
              // BUT, for the purpose of this "Dual View", we can store it in a temporary property or reuse explanation_ar if appropriate?
              // Let's stick to updating question_text_en if it's English.
              // If it's Arabic, we might need to handle it. For now, let's assume most source is Arabic -> English.
              if (targetLang === 'en') {
                return { ...r, question_text_en: data.translatedText };
              } else {
                // Temporary hack: if we translated TO Arabic, let's put it in explanation_ar for display if empty, 
                // or just rely on the fact that we don't persist it in a visible field yet?
                // Actually, let's just update the local state with a custom field 'translated_text' for display purposes
                return { ...r, translated_text: data.translatedText } as QaEntry & { translated_text?: string };
              }
            }
            return r;
          }));

          const newTranslated = new Set(translatedItems);
          newTranslated.add(id);
          setTranslatedItems(newTranslated);
        }
      } catch (err) {
        console.error("Result translation failed", err);
        // Optional: Show toast error
      } finally {
        setTranslatingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  };

  const openEditModal = (item: QaEntry) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      const res = await fetch('/api/qa/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (!res.ok) throw new Error('Failed to update');

      setResults(prev => prev.map(item => item._id === editingItem._id ? editingItem : item));
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
        <div className="container-neo max-w-6xl mx-auto">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Intelligence Search</h1>
              <p className="text-slate-400">Advanced semantic search across security knowledge base.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                System Online
              </div>
            </div>
          </div>

          {/* Search Bar & Filters */}
          <div className="glass-panel p-4 rounded-2xl mb-8 sticky top-24 z-30 shadow-2xl shadow-sky-900/20">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything (e.g., 'How do we handle encryption keys?')"
                  className="relative z-10 w-full bg-[#0f172a]/80 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all shadow-inner"
                />

                {/* Query Translate Button */}
                <button
                  type="button"
                  onClick={handleTranslateQuery}
                  disabled={translatingQuery || !query.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                  title="Translate Query"
                >
                  {translatingQuery ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-5 py-3.5 rounded-xl border flex items-center gap-2 transition-all font-medium ${isFilterOpen ? 'bg-sky-500 text-white border-sky-500' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading ? 'Analyzing...' : 'Search'}
              </button>
            </form>

            {/* Expandable Filters */}
            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 ml-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-sky-500/50 appearance-none"
                  >
                    <option value="all" className="bg-slate-900">All Statuses</option>
                    <option value="applied" className="bg-slate-900">Applied</option>
                    <option value="not_applied" className="bg-slate-900">Not Applied</option>
                    <option value="unknown" className="bg-slate-900">Unknown</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 ml-1">Domain</label>
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-sky-500/50 appearance-none"
                  >
                    <option value="all" className="bg-slate-900">All Domains</option>
                    <option value="application" className="bg-slate-900">Application</option>
                    <option value="network" className="bg-slate-900">Network</option>
                    <option value="database" className="bg-slate-900">Database</option>
                    <option value="cloud" className="bg-slate-900">Cloud</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results Grid */}
          <div className="space-y-4">
            {loading && !results.length && (
              <div className="text-center py-20">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-sky-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-400 animate-pulse">Processing semantic vectors...</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && !error && (
              <div className="text-center py-20 glass-panel rounded-2xl">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No intelligence found</h3>
                <p className="text-slate-400">Try adjusting your search terms or filters.</p>
              </div>
            )}

            {results.map((result) => {
              const isExpanded = expandedItems.has(result._id || '');
              const showTranslation = translatedItems.has(result._id || '');
              const isTranslating = translatingIds.has(result._id || '');
              const scoreColor = (result.score || 0) > 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                (result.score || 0) > 50 ? 'text-sky-400 border-sky-500/30 bg-sky-500/10' :
                  'text-slate-400 border-slate-500/30 bg-slate-500/10';

              // Determine text to show
              const originalText = result.question_text;
              const isOriginalArabic = /[\u0600-\u06FF]/.test(originalText);

              // Translation text: prefer question_text_en if original is Arabic, or custom translated_text
              const translatedText = isOriginalArabic
                ? (result.question_text_en || (result as any).translated_text)
                : ((result as any).translated_text || "Translation not available");

              return (
                <div key={result._id} className="glass-card p-6 group hover:bg-white/[0.02] transition-all border-l-4 border-l-transparent hover:border-l-sky-500">

                  {/* Card Header: Badges & Score */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${result.status === 'applied'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : result.status === 'not_applied'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                        }`}>
                        {result.status.replace('_', ' ')}
                      </span>

                      {/* Domain Badge */}
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Database className="w-3 h-3" />
                        {result.domain}
                      </span>

                      {/* Tech Badges */}
                      {result.needs_dev_input && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1" title="Requires Developer Input">
                          <Code className="w-3 h-3" /> Dev
                        </span>
                      )}
                      {result.needs_infra_input && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-orange-500/10 border border-orange-500/20 text-orange-300 flex items-center gap-1" title="Requires Infra Input">
                          <Server className="w-3 h-3" /> Infra
                        </span>
                      )}
                    </div>

                    {/* Relevance Score */}
                    {result.score !== undefined && (
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${scoreColor}`}>
                        <span className="text-sm font-bold">{result.score}%</span>
                        <span className="text-[10px] uppercase tracking-wider opacity-80">Relevance</span>
                      </div>
                    )}
                  </div>

                  {/* Original Question */}
                  <h3
                    className="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-sky-300 transition-colors leading-snug"
                    dir={isOriginalArabic ? 'rtl' : 'ltr'}
                  >
                    {originalText}
                  </h3>

                  {/* Translation Box (Dual View) */}
                  {showTranslation && (
                    <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 animate-fade-in">
                      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-purple-400 uppercase tracking-wider">
                        <Globe className="w-3 h-3" />
                        Translation ({isOriginalArabic ? 'English' : 'Arabic'})
                      </div>
                      <p className="text-purple-100 text-lg leading-snug" dir={!isOriginalArabic ? 'rtl' : 'ltr'}>
                        {translatedText}
                      </p>
                    </div>
                  )}

                  {/* Answer Preview */}
                  <div className={`text-slate-300 leading-relaxed border-l-2 border-white/10 pl-4 whitespace-pre-wrap transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                    {result.answer_text || <span className="text-slate-500 italic">No answer provided yet.</span>}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-white/5 animate-fade-in space-y-4">

                      {/* Arabic Explanation */}
                      {result.explanation_ar && (
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                          <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Info className="w-3 h-3" /> Explanation (Arabic)
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed" dir="rtl">
                            {result.explanation_ar}
                          </p>
                        </div>
                      )}

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          <span>Source: <span className="text-slate-300">{result.source_file || 'Manual Entry'}</span></span>
                        </div>
                        {result.client_name && (
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-slate-700 flex items-center justify-center text-[8px]">C</span>
                            <span>Client: <span className="text-slate-300">{result.client_name}</span></span>
                          </div>
                        )}
                        <div>
                          <span>ID: <span className="font-mono text-slate-400">{result._id}</span></span>
                        </div>
                        <div>
                          <span>Updated: <span className="text-slate-400">{result.updated_at ? new Date(result.updated_at).toLocaleDateString() : 'N/A'}</span></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 mt-2 border-t border-white/5">

                    {/* View Details */}
                    <button
                      onClick={() => toggleExpand(result._id || '')}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all hover:text-white flex items-center gap-1.5"
                    >
                      {isExpanded ? (
                        <>Show Less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>View Details <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>

                    {/* Edit Button (Amber) */}
                    <button
                      onClick={() => openEditModal(result)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-medium text-amber-400 transition-all flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>

                    {/* Translate Button (Purple) */}
                    <button
                      onClick={() => toggleTranslateResult(result)}
                      disabled={isTranslating}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${showTranslation
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                          : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-400'
                        }`}
                      title="Show Translation"
                    >
                      {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                      {isTranslating ? 'Translating...' : showTranslation ? 'Hide Translation' : 'Translate'}
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Edit Modal */}
          {isEditModalOpen && editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">

                {/* Modal Header */}
                <div className="sticky top-0 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between z-10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-sky-400" /> Edit Entry
                  </h3>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">

                  {/* Question */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Question</label>
                    <textarea
                      value={editingItem.question_text}
                      onChange={(e) => setEditingItem({ ...editingItem, question_text: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500/50 transition-all"
                      rows={2}
                    />
                  </div>

                  {/* Answer */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Answer</label>
                    <textarea
                      value={editingItem.answer_text}
                      onChange={(e) => setEditingItem({ ...editingItem, answer_text: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500/50 transition-all"
                      rows={5}
                    />
                  </div>

                  {/* Status & Domain */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                      <select
                        value={editingItem.status}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as QaStatus })}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50"
                      >
                        <option value="applied">Applied</option>
                        <option value="not_applied">Not Applied</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Domain</label>
                      <select
                        value={editingItem.domain}
                        onChange={(e) => setEditingItem({ ...editingItem, domain: e.target.value as QaDomain })}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50"
                      >
                        <option value="application">Application</option>
                        <option value="network">Network</option>
                        <option value="database">Database</option>
                        <option value="cloud">Cloud</option>
                      </select>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Explanation (Arabic)</label>
                    <textarea
                      value={editingItem.explanation_ar || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, explanation_ar: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500/50 transition-all"
                      rows={2}
                      dir="rtl"
                    />
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 p-4 flex items-center justify-end gap-3 z-10">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
