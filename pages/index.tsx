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
  
  // 🎯 新增状态：保存当前选中的考试标准
  const [standard, setStandard] = useState<'fce' | 'ielts'>('fce');
  // 记录返回数据时使用的标准，用于正确渲染主题色
  const [resultStandard, setResultStandard] = useState<'fce' | 'ielts'>('fce');

  const challenges = [
    "I like playing board games with my friends.",
    "Walking in the park is good for health.",
    "I want to find a better job in the future.",
    "Learning a new language is quite difficult.",
    "People should protect animals and the environment.",
    "I think reading books is better than watching movies.",
    "A lot of people are buying things online nowadays.",
    "Living in a big city is very expensive and noisy.",
    "I want to travel around the world to see different cultures.",
    "Technology makes our lives much easier and faster.",
    "Young people should learn how to manage their money.",
    "I prefer to work from home rather than go to the office.",
    "Eating healthy food and exercising is good for your body.",
    "I enjoy spending my free time doing outdoor activities.",
    "Public transport is better than driving a car to work.",
    "We need to reduce the amount of plastic we use every day."
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
        // 🚀 提交时把选中的 standard 一并传给后台
        body: JSON.stringify({ topic, standard, ...levels }),
      });
      const data = await response.json();
      
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setResult(data);
        setResultStandard(standard); // 记录这批结果对应的标准
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

  // 🎨 反馈卡片渲染逻辑（根据 resultStandard 动态改变颜色）
  const FeedbackBlock = ({ data, focusTitle }: { data?: LevelFeedback, focusTitle: string }) => {
    if (!data) return null;
    
    const isFce = resultStandard === 'fce';
    const colorClass = isFce ? 'border-purple-200 bg-purple-50/30 text-purple-900' : 'border-emerald-200 bg-emerald-50/30 text-emerald-900';
    const icon = isFce ? '🏆' : '🌟';
    const title = isFce ? 'FCE 卓越水平 (Grade A)' : '雅思 8.0 水平 (Band 8)';

    return (
      <div className={`mt-6 border rounded-2xl overflow-hidden ${colorClass}`}>
        <div className="px-5 py-3 font-bold text-sm border-b border-black/5 flex items-center bg-white/60">
          <span className="mr-2 text-lg">{icon}</span> {title}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <h3 className="text-[13px] font-bold mb-3 flex items-center opacity-70 uppercase tracking-wider">📝 {focusTitle}点评 (中文)</h3>
            <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
              {safeRender(data.evaluation)}
            </div>
          </div>
          <div className="md:border-l md:border-black/10 md:pl-6">
            <h3 className="text-[13px] font-bold mb-3 flex items-center opacity-70 uppercase tracking-wider">💡 满分范例 (纯英文)</h3>
            <div className="whitespace-pre-wrap leading-relaxed text-[15px] font-medium">
              {safeRender(data.samples)}
            </div>
          </div>
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">English Rephrase Coach</h1>
        <p className="text-sm text-slate-500 mb-10 text-center">口语换词跟练助手</p>

        <div className="bg-slate-800 text-white rounded-2xl p-8 mb-12 relative shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original Sentence</span>
          <p className="text-2xl font-medium mt-3">{topic}</p>
          <button onClick={generateTopic} className="absolute right-8 top-8 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            ↻ 更换题目
          </button>
        </div>

        <div className="space-y-10">
          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:border-slate-300 transition-colors">
            <label className="text-lg font-bold text-slate-700 flex items-center mb-2">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">L1</span>
              词汇升级 (Synonyms)
            </label>
            <p className="text-sm text-slate-500 mb-5 ml-11">尝试把普通词汇换成更精准、高级的词汇。</p>
            <input 
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-lg bg-slate-50"
              placeholder="你的答案..."
              value={levels.lv1} onChange={(e) => setLevels({...levels, lv1: e.target.value})}
            />
            <FeedbackBlock data={result?.level1} focusTitle="词汇运用" />
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:border-slate-300 transition-colors">
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

          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:border-slate-300 transition-colors">
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

        {/* 🎯 目标选择开关 & 提交按钮区 */}
        <div className="mt-12 flex flex-col items-center border-t border-slate-100 pt-10">
          <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">选择你的训练目标</p>
          <div className="bg-slate-100 p-1.5 rounded-xl inline-flex mb-8">
            <button 
              onClick={() => setStandard('fce')}
              className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${standard === 'fce' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              🏆 FCE 卓越水平
            </button>
            <button 
              onClick={() => setStandard('ielts')}
              className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${standard === 'ielts' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              🌟 雅思 8.0 水平
            </button>
          </div>

          <button 
            onClick={handleSubmit} disabled={loading || !levels.lv1}
            className={`w-full font-bold py-5 rounded-xl transition-all shadow-md disabled:bg-slate-300 disabled:shadow-none text-xl text-white ${standard === 'fce' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {loading ? "AI 教练正在评分中..." : `提交并获取 ${standard === 'fce' ? 'FCE' : '雅思'} 专属反馈`}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-8 text-red-500 text-center font-medium bg-red-50 py-4 rounded-lg border border-red-100">{errorMsg}</div>
        )}
      </div>
    </div>
  );
}
