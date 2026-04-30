/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, RotateCw, Sparkles, Target, Settings2, Play, Pause, Settings, X, History } from 'lucide-react';
import { generateNewAppIdea, AppIdea, GenerationSettings } from './services/gemini';

const TIMER_DURATION = 60; // seconds

export default function App() {
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [timerDuration, setTimerDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({ category: 'الكل', focus: '' });

  const currentIdea = ideas[activeIndex];

  const fetchIdea = useCallback(async () => {
    setIsLoading(true);
    try {
      const idea = await generateNewAppIdea(settings);
      setIdeas((prev) => [idea, ...prev]);
      setActiveIndex(0);
      setTimeLeft(timerDuration);
    } catch (error) {
      console.error("Failed to fetch idea:", error);
    } finally {
      setIsLoading(false);
    }
  }, [settings, timerDuration]);

  // Initial fetch
  useEffect(() => {
    fetchIdea();
  }, [fetchIdea]);

  // Timer logic
  useEffect(() => {
    if (isPaused || isLoading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchIdea();
          return timerDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isLoading, fetchIdea, timerDuration]);

  const handleManualRefresh = () => {
    fetchIdea();
  };

  const progressPercentage = ((timerDuration - timeLeft) / timerDuration) * 100;

  const categories = ['الكل', 'التعليم', 'الصحة', 'التجارة الإلكترونية', 'الترفيه', 'الإنتاجية', 'الذكاء الاصطناعي', 'الألعاب'];

  return (
    <div className="min-h-screen mesh-bg text-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans overflow-x-hidden">
      <div className="w-full max-w-5xl h-full md:h-[90vh] min-h-[700px] flex flex-col gap-6">
        <header className="flex justify-between items-center px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              نبض الأفكار <span className="text-cyan-400">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="glass-card py-2 px-4 rounded-full flex items-center gap-2 hidden md:flex">
              <div className="w-2 h-2 rounded-full bg-green-400 pulse"></div>
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest whitespace-nowrap">
                {isLoading ? "جاري التوليد..." : "توليد مباشر"}
              </span>
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="glass-button w-10 h-10 flex items-center justify-center rounded-full text-white"
              title={isPaused ? "استئناف" : "إيقاف مؤقت"}
            >
              {isPaused ? <Play className="w-4 h-4 ml-1" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="glass-button w-10 h-10 flex items-center justify-center rounded-full text-white"
              title="الإعدادات"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="glass-button py-2 px-4 sm:px-6 rounded-full text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">فكرة جديدة</span>
            </button>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-[400px]">
            <div className="glass-card flex-1 rounded-3xl p-6 sm:p-10 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1 bg-white/10 rtl-reverse">
                <motion.div 
                  className="h-full bg-cyan-400"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ ease: "linear", duration: 1 }}
                />
              </div>

              <div className="flex justify-between items-start mb-8 shrink-0">
                <span className="text-cyan-400 font-mono text-xs sm:text-sm tracking-tighter">
                  {isLoading ? "يتم التوليد الآن..." : `فكرة جديدة مهيأة`}
                </span>
                <div className="text-left">
                  <p className="text-white/40 text-[10px] sm:text-xs mb-1 uppercase tracking-widest">
                    التالي خلال
                  </p>
                  <p className="text-white font-mono text-xl">{timeLeft} ث</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {(!currentIdea && isLoading) || (isLoading && activeIndex === 0 && ideas.length > 0) ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center"
                  >
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                      <Lightbulb className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                  </motion.div>
                ) : currentIdea ? (
                  <motion.div
                    key={currentIdea.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                    className="flex-1 flex flex-col min-h-0"
                  >
                    <div className="mt-auto mb-auto space-y-4 sm:space-y-6 overflow-y-auto pr-2 pb-2 custom-scrollbar">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                        {currentIdea.title}
                      </h2>
                      <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl">
                        {currentIdea.description}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 shrink-0 border-t border-white/10">
                      <div className="glass-card py-3 px-5 rounded-2xl flex flex-col flex-1">
                        <span className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase font-bold mb-1">
                          <Target className="w-3.5 h-3.5" />
                          الجمهور المستهدف
                        </span>
                        <span className="text-white font-bold text-sm sm:text-base">{currentIdea.targetAudience}</span>
                      </div>
                      
                      <div className="glass-card py-3 px-5 rounded-2xl flex flex-col flex-[1.5]">
                        <span className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase font-bold mb-2">
                          <Settings2 className="w-3.5 h-3.5" />
                          أهم الميزات
                        </span>
                        <ul className="space-y-2">
                          {currentIdea.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-white/80 text-xs sm:text-sm font-medium">
                              <span className="shrink-0 w-1 h-1 bg-cyan-400 rounded-full mt-1.5" />
                              <span className="line-clamp-2 md:line-clamp-1">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-[300px]">
            <div className="glass-card rounded-3xl p-6 flex flex-col h-full overflow-hidden">
              <h3 className="text-white font-bold mb-6 flex items-center justify-between shrink-0">
                <span>الأفكار السابقة</span>
                <span className="text-xs text-white/40 font-normal">
                  محدث
                </span>
              </h3>
              
              <div className="space-y-3 overflow-y-auto pr-2 pb-2 custom-scrollbar flex-1 min-h-0">
                {ideas.length === 0 ? (
                  <p className="text-white/40 text-sm text-center mt-8">لا توجد أفكار بعد</p>
                ) : (
                  ideas.map((idea, idx) => {
                    const colors = [
                      "text-cyan-300",
                      "text-fuchsia-300",
                      "text-emerald-300",
                      "text-amber-300",
                    ];
                    const colorClass = colors[idx % colors.length];
                    const opacityClass = idx > 4 ? "opacity-60" : "";
                    const isActive = idx === activeIndex;

                    return (
                      <div
                        key={`${idea.title}-${idx}`}
                        onClick={() => setActiveIndex(idx)}
                        className={`p-4 rounded-2xl bg-white/5 border transition-colors cursor-pointer ${isActive ? 'border-cyan-500/50 bg-white/10' : 'border-white/10 hover:bg-white/10'} ${opacityClass}`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`${colorClass} font-bold text-sm`}>{idea.title}</h4>
                          {idx === 0 && <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-sm">الأحدَث</span>}
                        </div>
                        <p className="text-white/50 text-xs line-clamp-2">{idea.description}</p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-white/10 shrink-0">
                <div className="flex items-center justify-between text-white/60 text-xs mb-2">
                  <span>إجمالي أفكارك اليـوم</span>
                  <span className="text-white font-mono font-bold">{ideas.length}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="text-center py-2 text-white/30 text-[10px] uppercase tracking-[0.2em] shrink-0">
          نظام ذكاء اصطناعي ذاتي التوليد • جميع الحقوق محفوظة لعام {new Date().getFullYear()}
        </footer>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700/50 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-cyan-400" />
                إعدادات التوليد
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    المجال (التصنيف)
                  </label>
                  <select
                    value={settings.category}
                    onChange={(e) => setSettings({ ...settings, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    التركيز على شيء محدد (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: طلاب الجامعات، ذوي الاحتياجات الخاصة..."
                    value={settings.focus || ''}
                    onChange={(e) => setSettings({ ...settings, focus: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    مدة المؤقت (بالثواني)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="600"
                    value={timerDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 60;
                      setTimerDuration(val);
                      if (timeLeft > val) setTimeLeft(val);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors"
                  />
                  <p className="text-xs text-slate-500 mt-2">كم ثانية تنتظر بين توليد الفكرة والأخرى؟</p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  حفظ الإعدادات
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
