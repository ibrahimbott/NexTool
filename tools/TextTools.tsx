import React, { useState } from 'react';
import { Button, TextArea } from '../components/UI';
import { Copy, Trash2, Wand2, ListOrdered, FileMinus, ArrowRightLeft, Repeat } from 'lucide-react';

// --- Word Counter ---
export const WordCounter: React.FC = () => {
  const [text, setText] = useState('');

  const stats = {
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    chars: text.length,
    sentences: text.split(/[.!?]+/).filter(Boolean).length,
    paragraphs: text.split(/\n+/).filter(Boolean).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="bg-blue-50 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-600">{val}</div>
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wide">{key}</div>
          </div>
        ))}
      </div>
      <TextArea 
        rows={10} 
        placeholder="Type or paste your text here..." 
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => setText('')}><Trash2 className="w-4 h-4 mr-2 inline" /> Clear</Button>
        <Button onClick={() => navigator.clipboard.writeText(text)}><Copy className="w-4 h-4 mr-2 inline" /> Copy Text</Button>
      </div>
    </div>
  );
};

// --- Case Converter ---
export const CaseConverter: React.FC = () => {
  const [text, setText] = useState('');

  const transforms = {
    uppercase: (t: string) => t.toUpperCase(),
    lowercase: (t: string) => t.toLowerCase(),
    capitalize: (t: string) => t.replace(/\b\w/g, l => l.toUpperCase()),
    sentenceCase: (t: string) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
  };

  const handleTransform = (type: keyof typeof transforms) => {
    setText(transforms[type](text));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="outline" onClick={() => handleTransform('uppercase')}>UPPERCASE</Button>
        <Button variant="outline" onClick={() => handleTransform('lowercase')}>lowercase</Button>
        <Button variant="outline" onClick={() => handleTransform('capitalize')}>Capitalize Word</Button>
        <Button variant="outline" onClick={() => handleTransform('sentenceCase')}>Sentence case</Button>
      </div>
      <TextArea 
        rows={8} 
        placeholder="Enter text to convert..." 
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm text-gray-500">
        <span>{text.length} characters</span>
        <Button size="sm" onClick={() => navigator.clipboard.writeText(text)}><Copy className="w-4 h-4" /></Button>
      </div>
    </div>
  );
};

// --- Lorem Ipsum Generator ---
export const LoremGenerator: React.FC = () => {
  const [paragraphs, setParagraphs] = useState(3);
  const [result, setResult] = useState('');

  const generate = () => {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    setResult(Array(paragraphs).fill(lorem).join('\n\n'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <label className="font-medium text-gray-700">Paragraphs:</label>
        <input 
          type="number" 
          min="1" 
          max="50" 
          value={paragraphs} 
          onChange={(e) => setParagraphs(Number(e.target.value))}
          className="w-20 p-2 border rounded-md"
        />
        <Button onClick={generate}><Wand2 className="w-4 h-4 mr-2 inline" /> Generate</Button>
      </div>
      {result && (
        <TextArea readOnly rows={12} value={result} />
      )}
    </div>
  );
};

// --- Text Sorter ---
export const TextSorter: React.FC = () => {
  const [text, setText] = useState('');
  
  const sort = (direction: 'asc' | 'desc' | 'random' | 'reverse') => {
    const lines = text.split('\n');
    let sorted = [];
    if (direction === 'asc') sorted = lines.sort();
    else if (direction === 'desc') sorted = lines.sort().reverse();
    else if (direction === 'random') sorted = lines.sort(() => Math.random() - 0.5);
    else if (direction === 'reverse') sorted = lines.reverse();
    
    setText(sorted!.join('\n'));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => sort('asc')}>A-Z</Button>
        <Button size="sm" variant="outline" onClick={() => sort('desc')}>Z-A</Button>
        <Button size="sm" variant="outline" onClick={() => sort('reverse')}>Reverse</Button>
        <Button size="sm" variant="outline" onClick={() => sort('random')}>Shuffle</Button>
      </div>
      <TextArea rows={12} value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter list items separated by new lines..." />
    </div>
  );
};

// --- Duplicate Remover ---
export const DuplicateRemover: React.FC = () => {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({ original: 0, removed: 0 });

  const process = () => {
    const lines = text.split('\n');
    const unique = [...new Set(lines)];
    setStats({ original: lines.length, removed: lines.length - unique.length });
    setText(unique.join('\n'));
  };

  return (
    <div className="space-y-4">
      <Button onClick={process}><FileMinus className="w-4 h-4 mr-2 inline" /> Remove Duplicates</Button>
      {stats.removed > 0 && <span className="text-green-600 text-sm ml-4">Removed {stats.removed} duplicates!</span>}
      <TextArea rows={12} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your list here..." />
    </div>
  );
};

// --- Binary Converter ---
export const BinaryConverter: React.FC = () => {
  const [text, setText] = useState('');
  const [binary, setBinary] = useState('');

  const toBinary = () => {
    setBinary(text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' '));
  };
  
  const toText = () => {
    setText(binary.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join(''));
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
         <Button size="sm" onClick={toBinary} className="w-full">Text to Binary &rarr;</Button>
         <TextArea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Plain Text" />
      </div>
      <div className="space-y-2">
         <Button size="sm" variant="secondary" onClick={toText} className="w-full">Binary to Text &larr;</Button>
         <TextArea rows={10} value={binary} onChange={(e) => setBinary(e.target.value)} placeholder="0101001..." className="font-mono text-xs" />
      </div>
    </div>
  );
};

// --- Hex Converter ---
export const HexConverter: React.FC = () => {
  const [text, setText] = useState('');
  const [hex, setHex] = useState('');

  const toHex = () => {
    setHex(text.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' '));
  };
  
  const toText = () => {
    setText(hex.split(' ').map(h => String.fromCharCode(parseInt(h, 16))).join(''));
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
         <Button size="sm" onClick={toHex} className="w-full">Text to Hex &rarr;</Button>
         <TextArea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Plain Text" />
      </div>
      <div className="space-y-2">
         <Button size="sm" variant="secondary" onClick={toText} className="w-full">Hex to Text &larr;</Button>
         <TextArea rows={10} value={hex} onChange={(e) => setHex(e.target.value)} placeholder="48 65 6c 6c 6f..." className="font-mono text-xs" />
      </div>
    </div>
  );
};

// --- Text Repeater ---
export const TextRepeater: React.FC = () => {
  const [text, setText] = useState('');
  const [count, setCount] = useState(10);
  const [result, setResult] = useState('');

  const process = () => {
    setResult(text.repeat(count));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input type="number" min="1" max="1000" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-24 p-2 border rounded" />
        <Button onClick={process}><Repeat className="w-4 h-4 mr-2 inline" /> Repeat</Button>
      </div>
      <TextArea rows={3} placeholder="Text to repeat..." value={text} onChange={(e) => setText(e.target.value)} />
      <TextArea rows={10} readOnly value={result} placeholder="Result..." />
    </div>
  );
};

// --- Text Reverser ---
export const TextReverser: React.FC = () => {
  const [text, setText] = useState('');
  
  return (
     <div className="space-y-4">
       <TextArea rows={5} placeholder="Type text here..." value={text} onChange={(e) => setText(e.target.value)} />
       <div className="flex justify-center"><ArrowRightLeft className="text-gray-400" /></div>
       <TextArea rows={5} readOnly placeholder="Reversed text..." value={text.split('').reverse().join('')} />
     </div>
  );
};

// --- Morse Code ---
export const MorseConverter: React.FC = () => {
  const [text, setText] = useState('');
  const MORSE_CODE: Record<string, string> = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/' };

  const encode = (str: string) => {
    return str.toUpperCase().split('').map(char => MORSE_CODE[char] || char).join(' ');
  };

  return (
    <div className="space-y-4">
      <TextArea rows={6} placeholder="Type text to convert to Morse Code..." value={text} onChange={(e) => setText(e.target.value)} />
      <div className="bg-gray-800 text-green-400 p-6 rounded-xl font-mono text-lg break-words">
        {text ? encode(text) : '... --- ...'}
      </div>
    </div>
  );
};
