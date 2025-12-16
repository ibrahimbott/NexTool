import React, { useState } from 'react';
import { Button, TextArea } from '../components/UI';
import { Copy, FileText } from 'lucide-react';

export const UrlEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700 dark:text-slate-300">Decoded URL</h3>
        <TextArea rows={8} value={input} onChange={(e) => {
          setInput(e.target.value);
          setOutput(encodeURIComponent(e.target.value));
        }} />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700 dark:text-slate-300">Encoded URL</h3>
        <TextArea rows={8} value={output} onChange={(e) => {
          setOutput(e.target.value);
          try { setInput(decodeURIComponent(e.target.value)); } catch {}
        }} />
      </div>
    </div>
  );
};

export const MetaTagGenerator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');

  const code = `
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="keywords" content="${keywords}">
<meta name="author" content="${author}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
  `.trim();

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4 text-gray-700 dark:text-slate-300">
        <div>
          <label className="block text-sm font-medium mb-1">Site Title</label>
          <input type="text" className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={title} onChange={e => setTitle(e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">{title.length}/60 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
           <p className="text-xs text-gray-400 mt-1">{desc.length}/160 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Keywords</label>
          <input type="text" className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="tool, seo, free" />
        </div>
         <div>
          <label className="block text-sm font-medium mb-1">Author</label>
          <input type="text" className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={author} onChange={e => setAuthor(e.target.value)} />
        </div>
      </div>
      <div className="bg-gray-800 p-4 rounded-xl text-white relative border dark:border-slate-700">
        <pre className="text-sm whitespace-pre-wrap">{code}</pre>
        <button onClick={() => navigator.clipboard.writeText(code)} className="absolute top-2 right-2 p-2 bg-gray-700 rounded hover:bg-gray-600"><Copy className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

export const KeywordDensity: React.FC = () => {
  const [text, setText] = useState('');
  const [results, setResults] = useState<{word:string, count:number, percent:string}[]>([]);

  const analyze = () => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const total = words.length;
    const counts: Record<string, number> = {};
    
    words.forEach(w => counts[w] = (counts[w] || 0) + 1);
    
    const sorted = Object.entries(counts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count]) => ({
        word,
        count,
        percent: ((count/total)*100).toFixed(1)
      }));
    
    setResults(sorted);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
       <div className="space-y-4">
          <TextArea rows={12} placeholder="Paste your article text here..." value={text} onChange={e => setText(e.target.value)} />
          <Button onClick={analyze} disabled={!text}>Check Density</Button>
       </div>
       <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="p-3">Word</th>
                <th className="p-3">Count</th>
                <th className="p-3">%</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {results.map(r => (
                <tr key={r.word}>
                  <td className="p-3 font-medium text-gray-800 dark:text-slate-200">{r.word}</td>
                  <td className="p-3 text-gray-600 dark:text-slate-400">{r.count}</td>
                  <td className="p-3 text-blue-600 dark:text-blue-400">{r.percent}%</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400 dark:text-slate-500">Enter text to see keyword analysis</td>
                </tr>
              )}
            </tbody>
          </table>
       </div>
    </div>
  );
};

export const RobotsTxtGen: React.FC = () => {
  const [agent, setAgent] = useState('*');
  const [allow, setAllow] = useState('/');
  const [disallow, setDisallow] = useState('/admin/');
  const [sitemap, setSitemap] = useState('');

  const result = `User-agent: ${agent}\nAllow: ${allow}\nDisallow: ${disallow}\n\nSitemap: ${sitemap}`;

  return (
    <div className="grid md:grid-cols-2 gap-8">
       <div className="space-y-4 text-gray-700 dark:text-slate-300">
          <div>
            <label className="block text-sm font-bold mb-1">User Agent</label>
            <input className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={agent} onChange={e => setAgent(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Allow Path</label>
            <input className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={allow} onChange={e => setAllow(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Disallow Path</label>
            <input className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={disallow} onChange={e => setDisallow(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Sitemap URL</label>
            <input className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={sitemap} onChange={e => setSitemap(e.target.value)} placeholder="https://example.com/sitemap.xml" />
          </div>
       </div>
       <div className="bg-gray-800 p-4 rounded-xl text-white relative border dark:border-slate-700">
          <pre className="text-sm font-mono whitespace-pre-wrap">{result}</pre>
          <button onClick={() => navigator.clipboard.writeText(result)} className="absolute top-2 right-2 p-2 bg-gray-700 rounded hover:bg-gray-600"><Copy className="w-4 h-4" /></button>
       </div>
    </div>
  );
};