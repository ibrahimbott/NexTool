import React, { useState, useEffect, useRef } from 'react';
import { Button, TextArea } from '../components/UI';
import { Palette, Play, Pause, RotateCcw, Copy, Globe, RefreshCw } from 'lucide-react';

// --- CSS Minifier ---
export const CssMinifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const minify = () => {
    const minified = input
      .replace(/\/\*[\s\S]*?\*\/|[\r\n\t]+/g, '')
      .replace(/ {2,}/g, ' ')
      .replace(/ ?([:;,{}]) ?/g, '$1')
      .replace(/;}/g, '}');
    setOutput(minified);
  };

  return (
    <div className="space-y-4">
      <Button onClick={minify}>Minify CSS</Button>
      <div className="grid md:grid-cols-2 gap-4">
        <TextArea rows={10} placeholder="Paste CSS here..." value={input} onChange={(e) => setInput(e.target.value)} />
        <TextArea rows={10} readOnly placeholder="Minified Output..." value={output} />
      </div>
    </div>
  );
};

// --- JS Minifier (Basic) ---
export const JsMinifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const minify = () => {
    // Basic regex minification (Not a full parser)
    const minified = input
      .replace(/\/\*[\s\S]*?\*\/|[\r\n\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s?([=+\-*/{}();,:])\s?/g, '$1');
    setOutput(minified);
  };

  return (
    <div className="space-y-4">
      <Button onClick={minify}>Minify JS (Basic)</Button>
      <div className="grid md:grid-cols-2 gap-4">
        <TextArea rows={10} placeholder="Paste JS here..." value={input} onChange={(e) => setInput(e.target.value)} />
        <TextArea rows={10} readOnly placeholder="Minified Output..." value={output} />
      </div>
    </div>
  );
};

// --- HTML Minifier ---
export const HtmlMinifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const minify = () => {
    const minified = input
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/>\s+</g, '><'); // Remove space between tags
    setOutput(minified);
  };

  return (
    <div className="space-y-4">
      <Button onClick={minify}>Minify HTML</Button>
      <div className="grid md:grid-cols-2 gap-4">
        <TextArea rows={10} placeholder="Paste HTML here..." value={input} onChange={(e) => setInput(e.target.value)} />
        <TextArea rows={10} readOnly placeholder="Minified Output..." value={output} />
      </div>
    </div>
  );
};

// --- Color Converter ---
export const ColorConverter: React.FC = () => {
  const [hex, setHex] = useState('#2563eb');
  const [rgb, setRgb] = useState('37, 99, 235');

  useEffect(() => {
    // Hex to RGB
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(result) {
      setRgb(`${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`);
    }
  }, [hex]);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div 
        className="w-full h-32 rounded-xl shadow-inner border dark:border-slate-700 transition-colors" 
        style={{ backgroundColor: hex }} 
      />
      <div className="grid gap-4 text-gray-700 dark:text-slate-300">
         <div>
            <label className="block text-sm font-bold mb-1">HEX Color</label>
            <div className="flex gap-2">
               <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-10 w-10 p-0 border-0 rounded cursor-pointer" />
               <input type="text" value={hex} onChange={(e) => setHex(e.target.value)} className="flex-1 p-2 border rounded uppercase bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
            </div>
         </div>
         <div>
            <label className="block text-sm font-bold mb-1">RGB Value</label>
            <div className="flex gap-2">
               <input type="text" readOnly value={`rgb(${rgb})`} className="flex-1 p-2 border rounded bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" />
               <Button size="sm" onClick={() => navigator.clipboard.writeText(`rgb(${rgb})`)}><Copy className="w-4 h-4" /></Button>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- Stopwatch ---
export const Stopwatch: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime((t) => t + 10);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if(intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10">
       <div className="text-7xl font-mono font-bold text-gray-800 dark:text-slate-100 tracking-wider">
         {formatTime(time)}
       </div>
       <div className="flex gap-4">
         <Button onClick={() => setIsRunning(!isRunning)} className={isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}>
           {isRunning ? <><Pause className="w-4 h-4 mr-2 inline"/> Pause</> : <><Play className="w-4 h-4 mr-2 inline"/> Start</>}
         </Button>
         <Button variant="secondary" onClick={() => { setIsRunning(false); setTime(0); }}>
           <RotateCcw className="w-4 h-4 mr-2 inline" /> Reset
         </Button>
       </div>
    </div>
  );
};

// --- Gradient Generator ---
export const GradientGenerator: React.FC = () => {
   const [color1, setColor1] = useState('#2563eb');
   const [color2, setColor2] = useState('#9333ea');
   const [angle, setAngle] = useState(45);
   const [type, setType] = useState('linear');
   
   const css = `background: ${type}-gradient(${type === 'linear' ? angle + 'deg' : 'circle'}, ${color1}, ${color2});`;

   return (
      <div className="space-y-6">
         <div 
           className="w-full h-48 rounded-2xl shadow-lg border dark:border-slate-700 transition-all" 
           style={{ background: `${type}-gradient(${type === 'linear' ? angle + 'deg' : 'circle'}, ${color1}, ${color2})` }} 
         />
         
         <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700">
               <div>
                  <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-slate-300">Colors</label>
                  <div className="flex gap-2">
                     <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="h-10 w-full cursor-pointer rounded border-0" />
                     <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="h-10 w-full cursor-pointer rounded border-0" />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-slate-300">Type</label>
                  <div className="flex gap-2">
                     <Button size="sm" variant={type === 'linear' ? 'primary' : 'outline'} onClick={() => setType('linear')}>Linear</Button>
                     <Button size="sm" variant={type === 'radial' ? 'primary' : 'outline'} onClick={() => setType('radial')}>Radial</Button>
                  </div>
               </div>
               {type === 'linear' && (
                 <div>
                    <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-slate-300">Angle: {angle}°</label>
                    <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full" />
                 </div>
               )}
            </div>
            
            <div className="bg-gray-800 p-4 rounded-xl text-white relative flex items-center border dark:border-slate-700">
               <code className="text-sm break-all">{css}</code>
               <button onClick={() => navigator.clipboard.writeText(css)} className="absolute top-2 right-2 p-2 bg-gray-700 rounded hover:bg-gray-600"><Copy className="w-4 h-4" /></button>
            </div>
         </div>
      </div>
   );
};

// --- IP Lookup ---
export const IpLookup: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchIp = async () => {
     setLoading(true);
     try {
       // Using ipapi.co (free tier, usually reliable for client-side)
       const res = await fetch('https://ipapi.co/json/');
       const json = await res.json();
       setData(json);
     } catch (e) {
       setData({ error: "Failed to fetch IP data. Adblocker might be blocking the request." });
     } finally {
       setLoading(false);
     }
  };

  useEffect(() => { fetchIp(); }, []);

  return (
    <div className="space-y-6">
       <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
          <div className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Your Public IP Address</div>
          <div className="text-4xl font-mono font-bold text-blue-600 dark:text-blue-400">
             {loading ? 'Loading...' : (data?.ip || 'Unknown')}
          </div>
          <Button size="sm" onClick={fetchIp} variant="outline" className="mt-4"><RefreshCw className="w-4 h-4 mr-2 inline" /> Refresh</Button>
       </div>
       
       {data && !data.error && (
          <div className="grid md:grid-cols-2 gap-4">
             {[
               { l: 'Network', v: data.org },
               { l: 'City', v: data.city },
               { l: 'Region', v: data.region },
               { l: 'Country', v: data.country_name },
               { l: 'Timezone', v: data.timezone },
               { l: 'Latitude/Longitude', v: `${data.latitude}, ${data.longitude}` },
             ].map(item => (
                <div key={item.l} className="p-3 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 flex justify-between">
                   <span className="text-gray-500 dark:text-slate-400 font-medium">{item.l}</span>
                   <span className="font-bold text-gray-800 dark:text-slate-200">{item.v}</span>
                </div>
             ))}
          </div>
       )}
    </div>
  );
};