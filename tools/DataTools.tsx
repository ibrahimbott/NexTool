import React, { useState } from 'react';
import { Button, TextArea } from '../components/UI';
import { FileJson, ArrowLeftRight, Upload, Download } from 'lucide-react';
import FileSaver from 'file-saver';

export const CsvJsonConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInput(event.target.result as string);
          // Auto-detect mode roughly based on first char
          const text = event.target.result as string;
          if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
            setMode('json2csv');
          } else {
            setMode('csv2json');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const csvToJson = (csv: string) => {
    const lines = csv.trim().split(/\r\n|\n/);
    if (lines.length < 2) throw new Error("CSV must have headers and data");
    
    // Basic CSV split ignoring commas inside quotes
    const splitLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
    };

    const headers = splitLine(lines[0]);
    const result = lines.slice(1).map(line => {
      const values = splitLine(line);
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] !== undefined ? values[i] : null;
      });
      return obj;
    });
    return JSON.stringify(result, null, 2);
  };

  const jsonToCsv = (json: string) => {
    let data = JSON.parse(json);
    if (!Array.isArray(data)) {
      data = [data]; // Handle single object
    }
    if (data.length === 0) return '';

    // Collect all unique keys
    const keys = Array.from(new Set(data.flatMap((obj: any) => Object.keys(obj)))) as string[];
    
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerRow = keys.map(escapeCsv).join(',');
    const rows = data.map((obj: any) => {
      return keys.map(k => escapeCsv(obj[k])).join(',');
    });

    return [headerRow, ...rows].join('\n');
  };

  const convert = () => {
    setError(null);
    try {
      if (!input.trim()) return;
      if (mode === 'csv2json') {
        setOutput(csvToJson(input));
      } else {
        setOutput(jsonToCsv(input));
      }
    } catch (e: any) {
      setError("Conversion Error: " + e.message);
    }
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const ext = mode === 'csv2json' ? 'json' : 'csv';
    FileSaver.saveAs(blob, `converted.${ext}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700">
        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 px-4 py-2 rounded-lg border dark:border-slate-600 shadow-sm text-sm font-medium flex items-center gap-2 transition-colors">
            <Upload className="w-4 h-4" /> Upload File
            <input type="file" accept=".csv,.json,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
          <div className="flex bg-gray-200 dark:bg-slate-900 rounded-lg p-1">
             <button 
               className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'csv2json' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}
               onClick={() => setMode('csv2json')}
             >
               CSV to JSON
             </button>
             <button 
               className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'json2csv' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}
               onClick={() => setMode('json2csv')}
             >
               JSON to CSV
             </button>
          </div>
        </div>
        <Button onClick={convert}>
          <ArrowLeftRight className="w-4 h-4 mr-2 inline" /> Convert
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 dark:text-slate-400">Input {mode === 'csv2json' ? '(CSV)' : '(JSON)'}</label>
          <TextArea 
            rows={12} 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder={mode === 'csv2json' ? "Paste CSV here..." : "Paste JSON here..."}
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-gray-500 dark:text-slate-400">Output {mode === 'csv2json' ? '(JSON)' : '(CSV)'}</label>
            {output && (
              <Button size="sm" variant="outline" onClick={downloadOutput} className="py-1 h-8">
                <Download className="w-3 h-3 mr-1 inline" /> Download
              </Button>
            )}
          </div>
          <TextArea 
            rows={12} 
            readOnly 
            value={output} 
            placeholder="Result..."
            className="font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
};
