import { useState } from 'react';
import Head from 'next/head';

export default function RephraseApp() {
  const [topic, setTopic] = useState("Click 'New Challenge' to start!");
  const [levels, setLevels] = useState({ lv1: '', lv2: '', lv3: '' });
  const [result, setResult] = useState<{evaluation: string, samples: string} | null>(null);
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
        setResult({ evaluation: data.evaluation, samples: data.samples });
      }
    } catch (error) {
      setErrorMsg("网络或 API 错误，请稍后再试。");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 md:px-8 font-sans text-slate-800 flex flex-col items-center">
      <Head>
        <title>English Rephrase Coach</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      
      {/* 宽度由 max-w-2xl 放宽到 max-w-4xl (将近 900px 宽) */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-blue-100 p-6 md:p-10">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">English Rephrase Coach</h1>
        <p className="text-sm text-slate-500 mb-8 text-center">雅思 / FCE 口语换词跟练助手</p>

        <div className="bg-blue-100 rounded-xl p-5 mb-8 relative">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Original Sentence</span>
          <p className="text-xl font-medium mt-2">{topic}</p>
          <button onClick={generateTopic} className="absolute right-5 top-5 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
            ↻ 新挑战
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-600">Level 1: 词汇升级 (Synonyms)</label>
            <input 
              className="w-full mt-1.5 p-3.5 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-lg"
              placeholder="尝试把普通词汇换成高级词汇..."
              value={levels.lv1} onChange={(e) => setLevels({...levels, lv1: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">Level 2: 句式转换 (Structure)</label>
            <input 
              className="w-full mt-1.5 p-3.5 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-lg"
              placeholder="尝试改变句子结构，如被动语态、强调句..."
              value={levels.lv2} onChange={(e) => setLevels({...levels, lv2: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">Level 3: 地道口语 (Idioms & Fillers)</label>
            <input 
              className="w-full mt-1.5 p-3.5 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-lg"
              placeholder="尝试加入口语连接词或习语..."
              value={levels.lv3} onChange={(e) => setLevels({...levels, lv3: e.target.value})}
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit} disabled={loading || !levels.lv1}
          className="w-full mt-10 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all disabled:bg-slate-300 text-lg"
        >
          {loading ? "AI 正在批改中..." : "提交并获取点评"}
        </button>

        {errorMsg && (
          <div className="mt-6 text-red-500 text-center font-medium">{errorMsg}</div>
        )}

        {/* 结果展示区：分为左右两块或上下两块 */}
        {result && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* 左侧/上方：评估区域 */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 h-full">
              <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm mr-2">📝</span> 
                教练点评
              </h2>
              <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                {result.evaluation}
              </div>
            </div>

            {/* 右侧/下方：参考答案区域 */}
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 h-full">
              <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                <span className="bg-white text-blue-600 px-2 py-1 rounded shadow-sm text-sm mr-2">💡</span> 
                地道表达参考
              </h2>
              <div className="whitespace-pre-wrap leading-relaxed text-slate-800">
                {result.samples}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
