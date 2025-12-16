import React, { useState } from 'react';
import { Button, TextArea } from '../components/UI';
import { Copy, FileText, Globe, Link } from 'lucide-react';

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

// --- Sitemap Generator ---
export const SitemapGenerator: React.FC = () => {
  const [urls, setUrls] = useState('https://example.com/\nhttps://example.com/about\nhttps://example.com/contact');
  const [freq, setFreq] = useState('monthly');
  const [priority, setPriority] = useState('0.8');
  const [result, setResult] = useState('');

  const generate = () => {
    const lines = urls.split('\n').filter(u => u.trim());
    const date = new Date().toISOString().split('T')[0];
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    lines.forEach(url => {
       xml += `  <url>\n    <loc>${url.trim()}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
    });
    
    xml += '</urlset>';
    setResult(xml);
  };

  return (
    <div className="space-y-6">
       <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
             <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-slate-300">URLs (One per line)</label>
             <TextArea rows={5} value={urls} onChange={e => setUrls(e.target.value)} placeholder="https://..." />
          </div>
          <div>
             <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-slate-300">Change Frequency</label>
             <select value={freq} onChange={e => setFreq(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                <option value="always">always</option>
                <option value="hourly">hourly</option>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
                <option value="never">never</option>
             </select>
          </div>
          <div>
             <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-slate-300">Priority (0.0 - 1.0)</label>
             <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                <option value="1.0">1.0</option>
                <option value="0.9">0.9</option>
                <option value="0.8">0.8</option>
                <option value="0.7">0.7</option>
                <option value="0.6">0.6</option>
                <option value="0.5">0.5</option>
             </select>
          </div>
          <div className="flex items-end">
             <Button onClick={generate} className="w-full">Generate XML</Button>
          </div>
       </div>
       {result && (
          <div className="bg-gray-800 p-4 rounded-xl text-white relative border dark:border-slate-700">
             <pre className="text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">{result}</pre>
             <button onClick={() => navigator.clipboard.writeText(result)} className="absolute top-2 right-2 p-2 bg-gray-700 rounded hover:bg-gray-600"><Copy className="w-4 h-4" /></button>
          </div>
       )}
    </div>
  );
};

// --- Slug Generator ---
export const SlugGenerator: React.FC = () => {
  const [text, setText] = useState('');
  
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return (
     <div className="space-y-6">
        <div className="space-y-2">
           <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Input Text</label>
           <input className="w-full p-3 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={text} onChange={e => setText(e.target.value)} placeholder="Hello World! This is a Title." />
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 flex items-center justify-between">
           <span className="font-mono text-lg text-green-700 dark:text-green-400 break-all">{slug || 'result-will-appear-here'}</span>
           <Button size="sm" onClick={() => navigator.clipboard.writeText(slug)}><Copy className="w-4 h-4" /></Button>
        </div>
     </div>
  );
};