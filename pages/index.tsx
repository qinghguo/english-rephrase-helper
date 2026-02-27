import { useState } from 'react';
import Head from 'next/head';

type LevelFeedback = { evaluation: any, samples: any };
type ResultData = { level1?: LevelFeedback, level2?: LevelFeedback, level3?: LevelFeedback };

export default function RephraseApp() {
  const [topic, setTopic] = useState("Click 'New Challenge' to start!");
  const [levels, setLevels] = useState({ lv1: '', lv2: '', lv3: '' });
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const challenges = [
    "I like playing board games with my friends.",
    "Walking in the park is good for health.",
    "I want to find a better job in the future.",
    "Learning a new language is quite difficult.",
    "People should protect animals and the environment."
  ];

  const generateTopic = () => {
    const random = challenges[Math.floor(Math.random() * challenges.length)];
    setTopic(random);
    setResult(null);
    setErrorMsg("");
    setLevels({ lv1: '', lv2: '', lv3: '' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch('/api/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, ...levels }),
      });
      const data = await response.json();
      
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setResult(data);
      }
    } catch (error) {
      setErrorMsg("网络或 API 错误，请稍后再试。");
    }
    setLoading(false);
  };

  const safeRender = (content: any) => {
    if (!content) return "等待解析...";
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content.map(item => typeof item === 'string' ? item : JSON.stringify(item, null, 2)).join('\n\n');
    }
    return JSON.stringify(content, null, 2);
  };

  const FeedbackBlock = ({ data, focusTitle }: { data?: LevelFeedback, focusTitle: string }) => {
    if (!data) return null;
    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-blue-100 pt-6">
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
          <h2 className="text-md font-bold text-slate-700 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mr-2">📝</span> 
            {focusTitle}点评
          </h2>
          <div className="whitespace-pre-wrap leading-relaxed text-slate-700 text-[15px]">
            {safeRender(data.evaluation)}
          </div>
        </div>
        <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
          <h2 className="text-md font-bold text-blue-800 mb-4 flex items-center">
            <span className="bg-white text-blue-600 px-2 py-1 rounded shadow-sm text-xs mr-2">💡</span> 
            参考答案 (纯英文)
          </h2>
          <div className="whitespace-pre-wrap leading-relaxed text-slate-800 text-[15px] font-medium">
            {safeRender(data.samples)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 md:px-8 font-sans text-slate-800 flex flex-col items-center">
      <Head>
        <title>English Rephrase Coach</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      
      {/* 这里将宽度加宽到了 max-w-6xl，且增加了 padding */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border border-blue-100 p-8 md:p-14">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">English Rephrase Coach</h1>
        <p className="text-sm text-slate-500 mb-10 text-center"> 口语跟练助手</p>

        <div className="bg-blue-600 text-white rounded-2xl p-8 mb-12 relative shadow-md">
          <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Original Sentence</span>
          <p className="text-2xl font-medium mt-3">{topic}</p>
          <button onClick={generateTopic} className="absolute right-8 top-8 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            ↻ 新挑战
          </button>
        </div>

        <div className="space-y-10">
          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
            <label className="text-lg font-bold text-slate-700 flex items-center mb-2">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">L1</span>
              词汇升级 (Synonyms)
            </label>
            <p className="text-sm text-slate-500 mb-5 ml-11">尝试把普通词汇换成更精准、高级的雅思词汇。</p>
            <input 
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-lg bg-slate-50"
              placeholder="你的答案..."
              value={levels.lv1} onChange={(e) => setLevels({...levels, lv1: e.target.value})}
            />
            <FeedbackBlock data={result?.level1} focusTitle="词汇运用" />
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
            <label className="text-lg font-bold text-slate-700 flex items-center mb-2">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">L2</span>
              句式转换 (Structure)
            </label>
            <p className="text-sm text-slate-500 mb-5 ml-11">尝试改变句子结构，如使用被动语态、强调句、定语从句等。</p>
            <input 
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-lg bg-slate-50"
              placeholder="你的答案..."
              value={levels.lv2} onChange={(e) => setLevels({...levels, lv2: e.target.value})}
            />
            <FeedbackBlock data={result?.level2} focusTitle="句式结构" />
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
            <label className="text-lg font-bold text-slate-700 flex items-center mb-2">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">L3</span>
              地道口语 (Idioms & Fillers)
            </label>
            <p className="text-sm text-slate-500 mb-5 ml-11">尝试加入 native speaker 常用的连接词、习语或短语动词。</p>
            <input 
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-lg bg-slate-50"
              placeholder="你的答案..."
              value={levels.lv3} onChange={(e) => setLevels({...levels, lv3: e.target.value})}
            />
            <FeedbackBlock data={result?.level3} focusTitle="地道表达" />
          </div>
        </div>

        <button 
          onClick={handleSubmit} disabled={loading || !levels.lv1}
          className="w-full mt-12 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl transition-all shadow-md disabled:bg-slate-300 disabled:shadow-none text-xl"
        >
          {loading ? "正在多维度评分中..." : "提交全部答案"}
        </button>

        {errorMsg && (
          <div className="mt-8 text-red-500 text-center font-medium bg-red-50 py-4 rounded-lg border border-red-100">{errorMsg}</div>
        )}
      </div>
    </div>
  );
}
