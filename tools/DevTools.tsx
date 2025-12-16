import React, { useState, useEffect } from 'react';
import { Button, TextArea } from '../components/UI';
import { AlertCircle, CheckCircle, RefreshCw, Copy, Download, Code, Clock, Globe, Shuffle } from 'lucide-react';
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

// --- JSON Formatter ---
export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const format = () => {
    try {
      if(!input.trim()) return;
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
    }
  };

  const minify = () => {
    try {
      if(!input.trim()) return;
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setError(null);
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={format}>Prettify</Button>
        <Button variant="outline" onClick={minify}>Minify</Button>
      </div>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md flex items-center gap-2 text-sm border border-red-100 dark:border-red-900/50">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      <TextArea 
        rows={15} 
        className="font-mono text-xs" 
        placeholder="Paste JSON here..." 
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
};

// --- Base64 Converter ---
export const Base64Converter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const process = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch (e) {
      setOutput("Error: Invalid input for decoding.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg w-fit">
        <button 
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
          onClick={() => setMode('encode')}
        >
          Encode
        </button>
        <button 
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
          onClick={() => setMode('decode')}
        >
          Decode
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Input</label>
          <TextArea 
            rows={8} 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? "Text to encode..." : "Base64 string to decode..."}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Output</label>
          <TextArea readOnly rows={8} value={output} placeholder="Result will appear here..." />
        </div>
      </div>
      <Button className="w-full" onClick={process}>
        {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
      </Button>
    </div>
  );
};

// --- QR Code Generator ---
export const QrGenerator: React.FC = () => {
  const [text, setText] = useState('https://example.com');
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if(text) {
      QRCode.toDataURL(text, { width: 400, margin: 2 })
        .then(url => setQrUrl(url))
        .catch(err => console.error(err));
    }
  }, [text]);

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="space-y-4">
        <label className="block font-medium text-gray-700 dark:text-slate-300">Content (URL or Text)</label>
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          placeholder="Enter text here..."
        />
        <p className="text-sm text-gray-500 dark:text-slate-400">QR Code updates automatically as you type.</p>
      </div>
      <div className="flex flex-col items-center gap-4 bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700">
        {qrUrl && <img src={qrUrl} alt="QR Code" className="w-48 h-48 border bg-white p-2 rounded-lg shadow-sm" />}
        {qrUrl && (
          <a href={qrUrl} download="qrcode.png">
            <Button><Download className="w-4 h-4 mr-2 inline" /> Download PNG</Button>
          </a>
        )}
      </div>
    </div>
  );
};

// --- UUID Generator ---
export const UuidGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);

  const generate = () => {
    const newUuids = Array(count).fill(0).map(() => uuidv4());
    setUuids(newUuids);
  };

  useEffect(() => { generate(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Quantity</label>
          <input 
            type="number" 
            min="1" 
            max="100" 
            value={count} 
            onChange={(e) => setCount(Number(e.target.value))} 
            className="w-24 p-2 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          />
        </div>
        <Button onClick={generate}><RefreshCw className="w-4 h-4 mr-2 inline" /> Refresh</Button>
      </div>
      
      <div className="bg-slate-900 dark:bg-black text-slate-50 p-6 rounded-xl font-mono text-sm max-h-96 overflow-y-auto relative group border border-transparent dark:border-slate-800">
        <pre>{uuids.join('\n')}</pre>
        <button 
           onClick={() => navigator.clipboard.writeText(uuids.join('\n'))}
           className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- Password Generator ---
export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(16);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [password, setPassword] = useState('');

  const generate = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    
    let validChars = chars;
    if (includeNumbers) validChars += nums;
    if (includeSpecial) validChars += special;

    let generated = "";
    for(let i=0; i<length; i++) {
      generated += validChars.charAt(Math.floor(Math.random() * validChars.length));
    }
    setPassword(generated);
  };

  useEffect(() => { generate(); }, [length, includeSpecial, includeNumbers]);
  
  const getStrength = () => {
     let score = 0;
     if(length > 8) score++;
     if(length > 12) score++;
     if(includeNumbers) score++;
     if(includeSpecial) score++;
     return score;
  };
  
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-600'];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border dark:border-slate-700 shadow-sm text-center">
        <div className="text-3xl font-mono font-bold text-gray-800 dark:text-white break-all mb-4">{password}</div>
        <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
           <div className={`h-full transition-all ${colors[getStrength()]}`} style={{ width: `${(getStrength()/4)*100}%` }} />
        </div>
        <Button onClick={() => navigator.clipboard.writeText(password)} variant="secondary" size="sm">
          <Copy className="w-4 h-4 mr-2 inline" /> Copy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-700">
         <div>
           <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">Length: {length}</label>
           <input type="range" min="6" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full" />
         </div>
         <div className="space-y-2 text-gray-700 dark:text-slate-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} />
              Include Numbers
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={includeSpecial} onChange={(e) => setIncludeSpecial(e.target.checked)} />
              Include Symbols
            </label>
         </div>
      </div>
      <Button onClick={generate} className="w-full h-12 text-lg">Generate New Password</Button>
    </div>
  );
};

// --- Hash Generator ---
export const HashGenerator: React.FC = () => {
  const [text, setText] = useState('');
  
  return (
    <div className="space-y-6">
      <TextArea 
        placeholder="Enter text to hash..." 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        rows={4} 
      />
      <div className="space-y-4">
        {['MD5', 'SHA1', 'SHA256', 'SHA512'].map(algo => (
          <div key={algo} className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
             <div className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">{algo}</div>
             <div className="font-mono text-sm break-all text-gray-800 dark:text-slate-200">
               {text ? CryptoJS[algo as keyof typeof CryptoJS](text).toString() : '...'}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- HTML Encoder/Decoder ---
export const HtmlEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode'|'decode'>('encode');

  const process = () => {
    if(mode === 'encode') {
       const el = document.createElement('div');
       el.innerText = input;
       setOutput(el.innerHTML);
    } else {
       const el = document.createElement('textarea');
       el.innerHTML = input;
       setOutput(el.value);
    }
  };

  return (
    <div className="space-y-4">
       <div className="flex gap-2">
         <Button onClick={() => setMode('encode')} variant={mode === 'encode' ? 'primary' : 'outline'}>Encode</Button>
         <Button onClick={() => setMode('decode')} variant={mode === 'decode' ? 'primary' : 'outline'}>Decode</Button>
       </div>
       <TextArea rows={6} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input..." />
       <Button onClick={process} className="w-full">Process HTML</Button>
       <TextArea rows={6} readOnly value={output} placeholder="Result..." />
    </div>
  );
};

// --- Unix Timestamp ---
export const UnixTimestamp: React.FC = () => {
  const [now, setNow] = useState(Math.floor(Date.now()/1000));
  const [input, setInput] = useState('');
  const [converted, setConverted] = useState('');

  useEffect(() => {
    const i = setInterval(() => setNow(Math.floor(Date.now()/1000)), 1000);
    return () => clearInterval(i);
  }, []);

  const convert = () => {
     if(!input) return;
     const isNum = /^\d+$/.test(input);
     if(isNum) {
       setConverted(new Date(parseInt(input) * 1000).toUTCString());
     } else {
       setConverted(Math.floor(new Date(input).getTime()/1000).toString());
     }
  };

  return (
    <div className="space-y-6">
       <div className="bg-gray-800 dark:bg-black text-white p-6 rounded-xl text-center border dark:border-slate-800">
         <div className="text-sm font-bold text-gray-400 mb-1">Current Unix Epoch</div>
         <div className="text-4xl font-mono">{now}</div>
       </div>
       <div className="space-y-2">
         <label className="font-bold text-sm text-gray-700 dark:text-slate-300">Convert (Date string or Epoch)</label>
         <div className="flex gap-2">
           <input 
             className="flex-1 p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" 
             value={input} 
             onChange={(e) => setInput(e.target.value)} 
             placeholder="e.g. 1730000000 or 2024-01-01" 
           />
           <Button onClick={convert}>Convert</Button>
         </div>
         {converted && <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold rounded border border-green-200 dark:border-green-800">{converted}</div>}
       </div>
    </div>
  );
};

// --- URL Parser ---
export const UrlParser: React.FC = () => {
  const [url, setUrl] = useState('');
  const [parts, setParts] = useState<any>(null);

  const parse = () => {
    try {
      const u = new URL(url);
      setParts({
         Protocol: u.protocol,
         Host: u.host,
         Path: u.pathname,
         Params: u.search,
         Hash: u.hash
      });
    } catch {
      setParts(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
         <input 
           className="flex-1 p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" 
           value={url} 
           onChange={(e) => setUrl(e.target.value)} 
           placeholder="https://example.com/path?query=1" 
         />
         <Button onClick={parse}>Parse</Button>
      </div>
      {parts && (
         <div className="bg-gray-50 dark:bg-slate-800 rounded-lg overflow-hidden border dark:border-slate-700">
           {Object.entries(parts).map(([k, v]) => (
             <div key={k} className="flex border-b dark:border-slate-700 last:border-0 p-3">
               <span className="w-24 font-bold text-gray-500 dark:text-slate-400">{k}</span>
               <span className="flex-1 font-mono text-sm text-blue-600 dark:text-blue-400 break-all">{v as string || '-'}</span>
             </div>
           ))}
         </div>
      )}
    </div>
  );
};

// --- Random Number Generator ---
export const RandomGenerator: React.FC = () => {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [result, setResult] = useState<number[]>([]);

  const generate = () => {
     const arr = [];
     for(let i=0; i<count; i++) {
        arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
     }
     setResult(arr);
  };

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-3 gap-4 text-gray-700 dark:text-slate-300">
          <div>
            <label className="block text-sm mb-1">Min</label>
            <input type="number" value={min} onChange={e => setMin(Number(e.target.value))} className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1">Max</label>
            <input type="number" value={max} onChange={e => setMax(Number(e.target.value))} className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1">Count</label>
            <input type="number" value={count} onChange={e => setCount(Number(e.target.value))} className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
          </div>
       </div>
       <Button onClick={generate} className="w-full"><Shuffle className="w-4 h-4 mr-2 inline" /> Generate</Button>
       {result.length > 0 && (
         <div className="p-6 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl font-mono text-2xl text-center break-all text-gray-800 dark:text-slate-200">
            {result.join(', ')}
         </div>
       )}
    </div>
  );
};