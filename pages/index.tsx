import { useState } from 'react';
import Head from 'next/head';

type LevelFeedback = { evaluation?: any, samples: any };
type ResultData = { level1?: LevelFeedback, level2?: LevelFeedback, level3?: LevelFeedback };

export default function RephraseApp() {
  const [mode, setMode] = useState<'practice' | 'direct'>('practice');
  
  // ================= 🔐 独立记忆库 1：闯关跟练 (Practice) =================
  const [topic, setTopic] = useState("Click '↻ AI 随机生成考题' to start!");
  const [levels, setLevels] = useState({ lv1: '', lv2: '', lv3: '' });
  const [pResult, setPResult] = useState<{data: ResultData, standard: 'fce'|'ielts'} | null>(null);
  const [pStandard, setPStandard] = useState<'fce' | 'ielts'>('fce');
  const [pLoading, setPLoading] = useState(false);
  const [pError, setPError] = useState("");
  const [generating, setGenerating] = useState(false);

  // ================= 🔐 独立记忆库 2：一键改写 (Direct) =================
  const [directInput, setDirectInput] = useState(""); 
  const [dResult, setDResult] = useState<{data: ResultData, standard: 'fce'|'ielts'} | null>(null);
  const [dStandard, setDStandard] = useState<'fce' | 'ielts'>('fce');
  const [dLoading, setDLoading] = useState(false);
  const [dError, setDError] = useState("");

  // ================= 逻辑处理 =================
  const generateTopic = async () => {
    setGenerating(true); setPError(""); setPResult(null);
    setTopic("AI 正在为您生成全新考题...");
    setLevels({ lv1: '', lv2: '', lv3: '' });
    try {
      const res = await fetch('/api/generate');
      const data = await res.json();
      setTopic(data.topic || "题目生成失败，请点击重试。");
    } catch (e) {
      setTopic("网络错误，请检查连接。");
    }
    setGenerating(false);
  };

  const handlePracticeSubmit = async () => {
    setPLoading(true); setPError("");
    try {
      const response = await fetch('/api/rephrase', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, standard: pStandard, ...levels }),
      });
      const data = await response.json();
      if (data.error) setPError(data.error);
      else setPResult({ data, standard: pStandard });
    } catch (error) { setPError("网络或 API 错误，请稍后再试。"); }
    setPLoading(false);
  };

  const handleDirectSubmit = async () => {
    if (!directInput.trim()) return;
    setDLoading(true); setDError(""); setDResult(null);
    try {
      const response = await fetch('/api/direct', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: directInput, standard: dStandard }),
      });
      const data = await response.json();
      if (data.error) setDError(data.error);
      else setDResult({ data, standard: dStandard });
    } catch (error) { setDError("网络或 API 错误，请稍后再试。"); }
    setDLoading(false);
  };

  // ================= UI 组件 =================
  const renderFormattedText = (content: any, isSample: boolean = false) => {
    if (!content) return "等待解析...";
    let text = typeof content === 'string' ? content : (Array.isArray(content) ? content.join('\n\n') : JSON.stringify(content, null, 2));
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className="min-h-[1.5em] mb-2">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const cleanText = part.slice(2, -2);
              return isSample ? 
                <strong key={j} className="font-extrabold text-blue-700 bg-blue-100/50 px-1 rounded">{cleanText}</strong> : 
                <strong key={j} className="font-bold text-slate-900">{cleanText}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
        </div>
      );
    });
  };

  const PracticeFeedbackBlock = ({ feedback, focusTitle, std }: { feedback?: LevelFeedback, focusTitle: string, std: 'fce'|'ielts' }) => {
    if (!feedback) return null;
    const isFce = std === 'fce';
    return (
      <div className={`mt-6 border rounded-2xl overflow-hidden ${isFce ? 'border-purple-200 bg-purple-50/40 text-purple-900' : 'border-emerald-200 bg-emerald-50/40 text-emerald-900'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div>
            <h3 className="text-[14px] font-bold mb-4 opacity-70 uppercase">📝 {focusTitle}点评</h3>
            <div className="leading-relaxed text-lg text-slate-700">{renderFormattedText(feedback.evaluation, false)}</div>
          </div>
          <div className="md:border-l md:border-black/10 md:pl-8">
            <h3 className="text-[14px] font-bold mb-4 opacity-70 uppercase">💡 满分范例</h3>
            <div className="leading-relaxed text-lg font-medium text-slate-800">{renderFormattedText(feedback.samples, true)}</div>
          </div>
        </div>
      </div>
    );
  };

  const DirectFeedbackBlock = ({ title, feedback, std }: { title: string, feedback?: LevelFeedback, std: 'fce'|'ielts' }) => {
    if (!feedback) return null;
    const isFce = std === 'fce';
    return (
      <div className={`p-6 border rounded-2xl ${isFce ? 'border-purple-200 bg-purple-50/40 text-purple-900' : 'border-emerald-200 bg-emerald-50/40 text-emerald-900'}`}>
        <h3 className="text-[15px] font-bold mb-4 opacity-80 flex items-center">{title}</h3>
        <div className="leading-relaxed text-lg font-medium text-slate-800">
          {renderFormattedText(feedback.samples, true)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 font-sans text-slate-800 flex flex-col items-center">
      <Head>
        <title>English Rephrase Coach</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-14">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">English Rephrase Coach</h1>
        
        {/* 🚀 顶层模式切换开关 */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-inner">
            <button 
              onClick={() => setMode('practice')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'practice' ? 'bg-white text-blue-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ✍️ 闯关跟练模式
            </button>
            <button 
              onClick={() => setMode('direct')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'direct' ? 'bg-white text-blue-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ⚡️ 自定义一键改写
            </button>
          </div>
        </div>

        {/* =========================================================
            图层一：闯关跟练 (只有在 mode === practice 时显示)
            ========================================================= */}
        <div style={{ display: mode === 'practice' ? 'block' : 'none' }}>
          <div className="bg-slate-800 text-white rounded-2xl p-8 mb-10 relative shadow-md">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original Sentence</span>
            <p className="text-2xl font-medium mt-3">{topic}</p>
            <button 
              onClick={generateTopic} disabled={generating}
              className="absolute right-8 top-8 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {generating ? "生成中..." : "↻ AI 随机生成考题"}
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
              <label className="text-lg font-bold text-slate-700 flex items-center mb-4"><span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">L1</span>词汇升级 (Synonyms)</label>
              <input className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-xl bg-slate-50" placeholder="尝试换用高级词汇..." value={levels.lv1} onChange={(e) => setLevels({...levels, lv1: e.target.value})} />
              <PracticeFeedbackBlock feedback={pResult?.data.level1} focusTitle="词汇运用" std={pResult?.standard || 'fce'} />
            </div>
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
              <label className="text-lg font-bold text-slate-700 flex items-center mb-4"><span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">L2</span>句式转换 (Structure)</label>
              <input className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-xl bg-slate-50" placeholder="尝试改变句子结构..." value={levels.lv2} onChange={(e) => setLevels({...levels, lv2: e.target.value})} />
              <PracticeFeedbackBlock feedback={pResult?.data.level2} focusTitle="句式结构" std={pResult?.standard || 'fce'} />
            </div>
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
              <label className="text-lg font-bold text-slate-700 flex items-center mb-4"><span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">L3</span>地道口语 (Idioms & Fillers)</label>
              <input className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-xl bg-slate-50" placeholder="尝试加入连接词或习语..." value={levels.lv3} onChange={(e) => setLevels({...levels, lv3: e.target.value})} />
              <PracticeFeedbackBlock feedback={pResult?.data.level3} focusTitle="地道表达" std={pResult?.standard || 'fce'} />
            </div>
          </div>

          {/* 专属底部控制区 */}
          <div className="mt-12 flex flex-col items-center border-t border-slate-100 pt-10">
            <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">选择输出标准</p>
            <div className="bg-slate-100 p-1.5 rounded-xl inline-flex mb-8">
              <button onClick={() => setPStandard('fce')} className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${pStandard === 'fce' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>🏆 FCE 卓越水平</button>
              <button onClick={() => setPStandard('ielts')} className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${pStandard === 'ielts' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>🌟 雅思 8.0 水平</button>
            </div>
            <button onClick={handlePracticeSubmit} disabled={pLoading || !levels.lv1} className={`w-full font-bold py-5 rounded-xl transition-all shadow-md disabled:bg-slate-300 disabled:shadow-none text-xl text-white ${pStandard === 'fce' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {pLoading ? "AI 大脑运转中..." : "提交批改并获取答案"}
            </button>
          </div>
          {pError && <div className="mt-8 text-red-500 text-center font-medium bg-red-50 py-4 rounded-lg border border-red-100">{pError}</div>}
        </div>

        {/* =========================================================
            图层二：一键改写 (只有在 mode === direct 时显示)
            ========================================================= */}
        <div style={{ display: mode === 'direct' ? 'block' : 'none' }}>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-10 shadow-sm">
            <label className="text-lg font-bold text-blue-800 mb-4 block">✏️ 输入你想打磨的句子</label>
            <textarea 
              className="w-full p-5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-2xl font-medium bg-white resize-none shadow-inner"
              rows={3}
              placeholder="例如: I want to tell you my idea about the new project..."
              value={directInput} 
              onChange={(e) => setDirectInput(e.target.value)} 
            />
          </div>

          {dResult && (
            <div className="space-y-6 mt-10">
              <h2 className="text-xl font-bold text-slate-700 mb-6 text-center">✨ AI 改写方案</h2>
              <DirectFeedbackBlock title="🎯 Level 1: 词汇升级 (Synonyms)" feedback={dResult.data.level1} std={dResult.standard} />
              <DirectFeedbackBlock title="📐 Level 2: 句式转换 (Structure)" feedback={dResult.data.level2} std={dResult.standard} />
              <DirectFeedbackBlock title="🗣️ Level 3: 地道口语 (Idioms & Fillers)" feedback={dResult.data.level3} std={dResult.standard} />
            </div>
          )}

          {/* 专属底部控制区 */}
          <div className="mt-12 flex flex-col items-center border-t border-slate-100 pt-10">
            <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">选择输出标准</p>
            <div className="bg-slate-100 p-1.5 rounded-xl inline-flex mb-8">
              <button onClick={() => setDStandard('fce')} className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${dStandard === 'fce' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>🏆 FCE 卓越水平</button>
              <button onClick={() => setDStandard('ielts')} className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${dStandard === 'ielts' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>🌟 雅思 8.0 水平</button>
            </div>
            <button onClick={handleDirectSubmit} disabled={dLoading || !directInput} className={`w-full font-bold py-5 rounded-xl transition-all shadow-md disabled:bg-slate-300 disabled:shadow-none text-xl text-white ${dStandard === 'fce' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {dLoading ? "AI 大脑运转中..." : "一键获取高级改写"}
            </button>
          </div>
          {dError && <div className="mt-8 text-red-500 text-center font-medium bg-red-50 py-4 rounded-lg border border-red-100">{dError}</div>}
        </div>

      </div>
    </div>
  );
}
