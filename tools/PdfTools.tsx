import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Button } from '../components/UI';
import { Upload, Download, FileText, RotateCw, Scissors } from 'lucide-react';

// --- Merge PDF ---
export const PdfMerge: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'merged-document.pdf';
      link.click();
    } catch (error) {
      alert('Error merging PDFs. Please ensure they are valid PDF files.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 text-center bg-gray-50 dark:bg-slate-800">
        <input 
          type="file" 
          accept="application/pdf" 
          multiple 
          onChange={handleFileChange} 
          className="hidden" 
          id="pdf-merge-upload" 
        />
        <label htmlFor="pdf-merge-upload" className="cursor-pointer flex flex-col items-center">
          <Upload className="w-12 h-12 text-gray-400 dark:text-slate-500 mb-4" />
          <span className="text-lg font-medium text-gray-700 dark:text-slate-200">Select Multiple PDF Files</span>
          <span className="text-sm text-gray-500 dark:text-slate-400 mt-2">Hold Ctrl/Cmd to select multiple files</span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700">
          <h4 className="font-bold mb-3 text-gray-800 dark:text-slate-200">Selected Files ({files.length})</h4>
          <ul className="space-y-2 mb-4">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                <FileText className="w-4 h-4 text-red-500" /> {f.name}
              </li>
            ))}
          </ul>
          <Button onClick={mergePdfs} disabled={files.length < 2 || isProcessing} className="w-full">
            {isProcessing ? 'Processing...' : 'Merge PDFs'}
          </Button>
        </div>
      )}
    </div>
  );
};

// --- Rotate PDF ---
export const PdfRotate: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);

  const rotatePdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const pages = pdf.getPages();
      
      pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `rotated-${file.name}`;
      link.click();
    } catch (e) {
      alert("Error rotating PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
       <input 
          type="file" 
          accept="application/pdf" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:text-slate-400"
        />
        
        {file && (
          <div className="flex gap-4 items-center bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
             <select 
               value={rotation} 
               onChange={(e) => setRotation(Number(e.target.value))}
               className="p-2 rounded border bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white"
             >
               <option value={90}>Rotate 90° CW</option>
               <option value={180}>Rotate 180°</option>
               <option value={270}>Rotate 90° CCW</option>
             </select>
             <Button onClick={rotatePdf} disabled={isProcessing}>
               <RotateCw className="w-4 h-4 mr-2 inline" /> 
               {isProcessing ? 'Saving...' : 'Rotate & Download'}
             </Button>
          </div>
        )}
    </div>
  );
};

// --- Split PDF ---
export const PdfSplit: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      setPageCount(pdf.getPageCount());
    }
  };

  const extractPage = async (index: number) => {
    if(!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const dstDoc = await PDFDocument.create();
      const [copied] = await dstDoc.copyPages(srcDoc, [index]);
      dstDoc.addPage(copied);
      
      const bytes = await dstDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${file.name}-page-${index + 1}.pdf`;
      link.click();
    } catch(e) { alert("Error splitting PDF"); }
  };

  return (
    <div className="space-y-6">
      <input type="file" accept="application/pdf" onChange={handleFile} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:text-slate-400"/>
      
      {file && (
        <div>
           <h4 className="font-bold mb-4 text-gray-800 dark:text-slate-200">Found {pageCount} pages. Click to download individually:</h4>
           <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
             {Array.from({length: pageCount}).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => extractPage(i)}
                  className="p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-sm font-bold"
                >
                  Page {i + 1}
                </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};