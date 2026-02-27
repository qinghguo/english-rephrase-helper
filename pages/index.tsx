import { useState } from 'react';
import Head from 'next/head';

type LevelFeedback = { evaluation?: any, samples: any };
type ResultData = { level1?: LevelFeedback, level2?: LevelFeedback, level3?: LevelFeedback };

export default function RephraseApp() {
  const [mode, setMode] = useState<'practice' | 'direct'>('practice');
  
  // ================= 模式一（跟练）独立状态 =================
  const [topic, setTopic] = useState("Click '↻ AI 随机生成考题' to start!");
  const [levels, setLevels] = useState({ lv1: '', lv2: '', lv3: '' });
  const [practiceResult, setPracticeResult] = useState<ResultData | null>(null);
  const [practiceResultStandard, setPracticeResultStandard] = useState<'fce' | 'ielts'>('fce');

  // ================= 模式二（直出）独立状态 =================
  const [directInput, setDirectInput] = useState(""); 
  const [directResult, setDirectResult] = useState<ResultData | null>(null);
  const [directResultStandard, setDirectResultStandard] = useState<'fce' | 'ielts'>('fce');

  // ================= 公共控制状态 =================
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [standard, setStandard] = useState<'fce' | 'ielts'>('fce'); 

  // 模式一：AI 随机出题
  const generateTopic = async () => {
    setGenerating(true);
    setTopic("AI 正在为您生成全新考题...");
    setPracticeResult(null); 
    setErrorMsg("");
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

  // 模式一：提交批改
  const handlePracticeSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch('/api/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, standard, ...levels }),
      });
      const data = await response.json();
      if (data.error) setErrorMsg(data.error);
      else { 
        setPracticeResult(data); 
        setPracticeResultStandard(standard); 
      }
    } catch (error) {
      setErrorMsg("网络或 API 错误，请稍后再试。");
    }
    setLoading(false);
  };

  // 模式二：直接一键获取高分改写
  const handleDirectSubmit = async () => {
    if (!directInput.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setDirectResult(null); 
    try {
      const response = await fetch('/api/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: directInput, standard }),
      });
      const data = await response.json();
      if (data.error) setErrorMsg(data.error);
      else { 
        setDirectResult(data); 
        setDirectResultStandard(standard); 
      }
    } catch (error) {
      setErrorMsg("网络或 API 错误，请稍后再试。");
    }
    setLoading(false);
  };

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

  const PracticeFeedbackBlock = ({ data, focusTitle, resultStandard }: { data?: LevelFeedback, focusTitle: string, resultStandard: 'fce'|'ielts' }) => {
    if (!data) return null;
    const isFce = resultStandard === 'fce';
    return (
      <div className={`mt-6 border rounded-2xl overflow-hidden ${isFce ? 'border-purple-200 bg-purple-50/40 text-purple-900' : 'border-emerald-200 bg-emerald-50/40 text-emerald-900'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div>
            <h3 className="text-[14px] font-bold mb-4 opacity-70 uppercase">📝 {focusTitle}点评</h3>
            <div className="leading-relaxed text-lg text-slate-700">{renderFormattedText(data.evaluation, false)}</div>
          </div>
          <div className="md:border-l md:border-black/10 md:pl-8">
            <h3 className="text-[14px] font-bold mb-4 opacity-70 uppercase">💡 满分范例</h3>
            <div className="leading-relaxed text-lg font-medium text-slate-800">{renderFormattedText(data.samples, true)}</div>
          </div>
        </div>
      </div>
    );
  };

  const DirectFeedbackBlock = ({ title, data, resultStandard }: { title: string, data?: LevelFeedback, resultStandard: 'fce'|'ielts' }) => {
    if (!data) return null;
    const isFce = resultStandard === 'fce';
    return (
      <div className={`p-6 border rounded-2xl ${isFce ? 'border-purple-200 bg-purple-50/40 text-purple-900' : 'border-emerald-200 bg-emerald-50/40 text-emerald-900'}`}>
        <h3 className="text-[15px] font-bold mb-4 opacity-80 flex items-center">{title}</h3>
        <div className="leading-relaxed text-lg font-medium text-slate-800">
          {renderFormattedText(data.samples, true)}
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
        
        {/* 🚀 双模式切换选项卡 */}
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

        {/* ========== 模式一：闯关跟练 UI (用 CSS 控制隐藏显示) ========== */}
        <div className={mode === 'practice' ? 'block animate-fade-in' : 'hidden'}>
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
              <PracticeFeedbackBlock data={practiceResult?.level1} focusTitle="词汇运用" resultStandard={practiceResultStandard} />
            </div>
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
              <label className="text-lg font-bold text-slate-700 flex items-center mb-4"><span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">L2</span>句式转换 (Structure)</label>
              <input className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-xl bg-slate-50" placeholder="尝试改变句子结构..." value={levels.lv2} onChange={(e) => setLevels({...levels, lv2: e.target.value})} />
              <PracticeFeedbackBlock data={practiceResult?.level2} focusTitle="句式结构" resultStandard={practiceResultStandard} />
            </div>
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
              <label className="text-lg font-bold text-slate-700 flex items-center mb-4"><span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">L3</span>地道口语 (Idioms & Fillers)</label>
              <input className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-xl bg-slate-50" placeholder="尝试加入连接词或习语..." value={levels.lv3} onChange={(e) => setLevels({...levels, lv3: e.target.value})} />
              <PracticeFeedbackBlock data={practiceResult?.level3} focusTitle="地道表达" resultStandard={practiceResultStandard} />
            </div>
          </div>
        </div>

        {/* ========== 模式二：一键改写 UI (用 CSS 控制隐藏显示) ========== */}
        <div className={mode === 'direct' ? 'block animate-fade-in' : 'hidden'}>
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

          {directResult && (
            <div className="space-y-6 mt-10">
              <h2 className="text-xl font-bold text-slate-700 mb-6 text-center">✨ AI 改写方案</h2>
              <DirectFeedbackBlock title="🎯 Level 1: 词汇升级 (Synonyms)" data={directResult.level1} resultStandard={directResultStandard} />
              <DirectFeedbackBlock title="📐 Level 2: 句式转换 (Structure)" data={directResult.level2} resultStandard={directResultStandard} />
              <DirectFeedbackBlock title="🗣️ Level 3: 地道口语 (Idioms & Fillers)" data={directResult.level3} resultStandard={directResultStandard} />
            </div>
          )}
        </div>

        {/* ========== 公共底部区：目标选择与提交 ========== */}
        <div className="mt-12 flex flex-col items-center border-t border-slate-100 pt-10">
          <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">选择输出标准</p>
          <div className="bg-slate-100 p-1.5 rounded-xl inline-flex mb-8">
            <button onClick={() => setStandard('fce')} className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${standard === 'fce' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>🏆 FCE 卓越水平</button>
            <button onClick={() => setStandard('ielts')} className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${standard === 'ielts' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>🌟 雅思 8.0 水平</button>
          </div>

          <button 
            onClick={mode === 'practice' ? handlePracticeSubmit : handleDirectSubmit} 
            disabled={loading || (mode === 'practice' && !levels.lv1) || (mode === 'direct' && !directInput)}
            className={`w-full font-bold py-5 rounded-xl transition-all shadow-md disabled:bg-slate-300 disabled:shadow-none text-xl text-white ${standard === 'fce' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {loading ? "AI 大脑运转中..." : (mode === 'practice' ? "提交批改并获取答案" : "一键获取高级改写")}
          </button>
        </div>

        {errorMsg && <div className="mt-8 text-red-500 text-center font-medium bg-red-50 py-4 rounded-lg border border-red-100">{errorMsg}</div>}
      </div>
    </div>
  );
}
