import { useState } from 'react';
import Head from 'next/head';

export default function RephraseApp() {
  const [topic, setTopic] = useState("Click 'New Challenge' to start!");
  const [levels, setLevels] = useState({ lv1: '', lv2: '', lv3: '' });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

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
    setResult("");
    setLevels({ lv1: '', lv2: '', lv3: '' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, ...levels }),
      });
      const data = await response.json();
      setResult(data.analysis || "Error: No response from AI.");
    } catch (error) {
      setResult("Error connecting to AI. Please check your API key.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 md:p-8 font-sans text-slate-800">
      <Head>
        <title>English Rephrase Coach</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">English Rephrase Coach</h1>
        <p className="text-sm text-slate-500 mb-6">Master IELTS/FCE speaking with 3-level practice.</p>

        <div className="bg-blue-100 rounded-xl p-4 mb-6 relative">
          <span className="text-xs font-bold text-blue-500 uppercase">Original Sentence</span>
          <p className="text-lg font-medium mt-1">{topic}</p>
          <button onClick={generateTopic} className="absolute right-4 top-4 text-blue-600 hover:text-blue-800 text-sm font-semibold">
            ↻ New Challenge
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-600">Level 1: Vocabulary Boost (Synonyms)</label>
            <input 
              className="w-full mt-1 p-3 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Change 'like' or 'good' to advanced words..."
              value={levels.lv1} onChange={(e) => setLevels({...levels, lv1: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">Level 2: Grammar Flip (Structure)</label>
            <input 
              className="w-full mt-1 p-3 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Use passive voice, 'It is...' or relative clauses..."
              value={levels.lv2} onChange={(e) => setLevels({...levels, lv2: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">Level 3: Native Flow (Idioms & Fillers)</label>
            <input 
              className="w-full mt-1 p-3 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Add 'To be honest', 'Right up my alley', etc."
              value={levels.lv3} onChange={(e) => setLevels({...levels, lv3: e.target.value})}
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit} disabled={loading || !levels.lv1}
          className="w-full mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all disabled:bg-slate-300"
        >
          {loading ? "AI is evaluating..." : "Submit & Get Feedback"}
        </button>

        {result && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
            <h2 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">Coach's Feedback</h2>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
