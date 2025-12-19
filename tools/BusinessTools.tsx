import React, { useState, useEffect, useRef } from 'react';
import { Button, TextArea, inputClasses } from '../components/UI';
import { Plus, Trash2, Download, FileText, Save, Upload, RotateCcw, Settings, Hash, DollarSign, FolderOpen, Truck, Eye, Edit3, Image as ImageIcon, CreditCard, Banknote } from 'lucide-react';
import * as docx from 'docx';
import FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Shared Interfaces ---
interface InvoiceItem {
  id: string;
  code: string;
  desc: string;
  qty: number;
  rate: number;
  amount?: number; // Added for manual override
}

interface ChallanItem {
  id: string;
  code: string;
  desc: string;
  qty: number;
}

// --- Preview Scaler Component ---
const PreviewScaler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.offsetWidth;
        const a4Width = 794; // 210mm @ 96dpi
        const availableWidth = parentWidth - 32; 
        const newScale = Math.min(1, availableWidth / a4Width);
        setScale(newScale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center overflow-hidden bg-gray-200 dark:bg-slate-950/50 rounded-xl border border-gray-300 dark:border-slate-800 p-4 md:p-8 min-h-[500px]">
      <div 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          width: '210mm', 
          minHeight: '297mm',
          height: 'auto'
        }}
        className="shadow-2xl transition-transform duration-200 ease-out bg-white"
      >
        {children}
      </div>
    </div>
  );
};

// --- Mobile Tab Switcher ---
const MobileTabSwitcher: React.FC<{ active: 'edit' | 'preview', onChange: (t: 'edit' | 'preview') => void }> = ({ active, onChange }) => (
  <div className="xl:hidden flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-md border border-gray-200 dark:border-slate-800 mb-6 sticky top-20 z-30 mx-auto max-w-sm">
    <button 
      onClick={() => onChange('edit')}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${active === 'edit' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
    >
      <Edit3 className="w-4 h-4" /> Editor
    </button>
    <button 
      onClick={() => onChange('preview')}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${active === 'preview' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
    >
      <Eye className="w-4 h-4" /> Preview
    </button>
  </div>
);

// ==========================================
// 1. INVOICE GENERATOR
// ==========================================
export const InvoiceGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [stampImage, setStampImage] = useState<string | null>(null);

  const [header, setHeader] = useState({
    title: 'INVOICE',
    number: '121054',
    date: new Date().toISOString().split('T')[0],
    ntn: '3379147-3',
    forLabel: 'Office Material',
    poNumber: 'QICT.PO.25.18522'
  });
  
  const [sender, setSender] = useState({
    company: 'H & H Emporium',
    person: 'Tayyab Memon',
    address1: 'Al Khayam Arcade Nursery',
    address2: 'Karachi, Pakistan',
    phone: '03452430044'
  });

  const [recipient, setRecipient] = useState({
    header: 'DP World',
    company: 'Qasim International Container Terminal Pakistan Ltd',
    address1: 'Berth 5 - 10 Marginal Wharves, port Muhammad Bin Qasim',
    address2: 'P.O Box 6425 Karachi- 75020 Pakistan',
    contact: 'UAN + 92 (21) 111786888, tell: +92 (21) 34739100'
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { 
      id: '1', 
      code: 'MATERIAL', 
      desc: 'Wooden Cupboard with Installation. Dimension of cupboard is 6ftx6ftx1.5ft. Cupboard required to have a total of 12 cabinet, 6 above, 6 below similar as attached picture', 
      qty: 1, 
      rate: 86500,
      amount: 86500
    }
  ]);

  // Helper to safely get the effective amount for calculation
  const getItemAmount = (item: InvoiceItem) => {
    return item.amount !== undefined ? item.amount : (item.qty * item.rate);
  };

  const subtotal = items.reduce((sum, item) => sum + getItemAmount(item), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const formatNumber = (num: number) => {
    const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return currencySymbol ? `${currencySymbol}${formatted}` : formatted;
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if(ev.target?.result) setStampImage(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const saveInvoiceData = () => {
    const data = { header, sender, recipient, items, taxRate, currencySymbol, stampImage };
    localStorage.setItem('nextool_invoice_data', JSON.stringify(data));
    alert('Invoice draft saved successfully!');
  };

  const loadInvoiceData = () => {
    const saved = localStorage.getItem('nextool_invoice_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if(data.header) setHeader(data.header);
        if(data.sender) setSender(data.sender);
        if(data.recipient) setRecipient(data.recipient);
        if(data.items) setItems(data.items);
        if(data.taxRate !== undefined) setTaxRate(data.taxRate);
        if(data.currencySymbol !== undefined) setCurrencySymbol(data.currencySymbol);
        if(data.stampImage) setStampImage(data.stampImage);
      } catch (e) { alert('Failed to load saved data.'); }
    } else { alert('No saved draft found.'); }
  };

  const generateNextNumber = () => {
    const current = header.number;
    const match = current.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const numStr = match[2];
      const nextNum = parseInt(numStr) + 1;
      const paddedNum = nextNum.toString().padStart(numStr.length, '0');
      setHeader({ ...header, number: `${prefix}${paddedNum}` });
    } else {
      setHeader({ ...header, number: `${current}-1` });
    }
  };

  const addItem = () => setItems([...items, { id: Date.now().toString(), code: '', desc: '', qty: 1, rate: 0, amount: 0 }]);
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
  
  const updateItem = (id: string, field: keyof InvoiceItem, val: string | number) => {
    setItems(items.map(i => {
      if (i.id !== id) return i;
      
      const newItem = { ...i, [field]: val };
      
      // Auto-calculate amount if qty or rate changes
      if (field === 'qty' || field === 'rate') {
        const q = field === 'qty' ? Number(val) : i.qty;
        const r = field === 'rate' ? Number(val) : i.rate;
        newItem.amount = q * r;
      }
      
      return newItem;
    }));
  };

  // --- PDF Generation ---
  const downloadPdf = () => {
    const doc = new jsPDF();
    const rightX = 195;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246);
    doc.text(header.title, rightX, 20, { align: 'right' });

    doc.setFontSize(10);
    let yPos = 30;
    const addHeaderLine = (label: string, val: string, isBlueLabel = false, isBlueVal = false) => {
      if(!val) return;
      const valWidth = doc.getTextWidth(` ${val}`);
      doc.setFont("helvetica", "bold");
      if(isBlueLabel) doc.setTextColor(59, 130, 246); else doc.setTextColor(0);
      doc.text(label, rightX - valWidth, yPos, { align: 'right' });
      if(isBlueVal) doc.setTextColor(59, 130, 246); else doc.setTextColor(80);
      doc.setFont("helvetica", "normal");
      doc.text(` ${val}`, rightX, yPos, { align: 'right' });
      yPos += 6;
    };

    addHeaderLine("INVOICE", `#${header.number}`, true, false);
    addHeaderLine("DATE", header.date, true, false);
    addHeaderLine("NTN", header.ntn, false, false);
    if(header.forLabel) {
       doc.setFont("helvetica", "bold");
       doc.setTextColor(59, 130, 246);
       doc.text("FOR", rightX - doc.getTextWidth(` ${header.forLabel}`), yPos, { align: 'right' });
       doc.setTextColor(0);
       doc.text(` ${header.forLabel}`, rightX, yPos, { align: 'right' });
       yPos += 6;
    }
    addHeaderLine("P.O.#", header.poNumber, true, true);

    doc.setTextColor(80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(sender.company, 14, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0);
    let leftY = 56;
    doc.text(sender.person, 14, leftY); leftY += 5;
    doc.text(sender.address1, 14, leftY); leftY += 5;
    doc.text(sender.address2, 14, leftY); leftY += 5;
    doc.text(`Phone ${sender.phone}`, 14, leftY); leftY += 10;

    if(recipient.header) {
      doc.setFont("helvetica", "normal");
      doc.text(recipient.header, 14, leftY); leftY += 5;
    }
    doc.setFont("helvetica", "bold");
    doc.text(recipient.company, 14, leftY); 
    const textWidth = doc.getTextWidth(recipient.company);
    doc.line(14, leftY + 1, 14 + textWidth, leftY + 1);
    leftY += 5;
    doc.setFont("helvetica", "normal");
    const splitAddress = doc.splitTextToSize(recipient.address1, 100);
    doc.text(splitAddress, 14, leftY);
    leftY += (splitAddress.length * 5);
    doc.text(recipient.address2, 14, leftY); leftY += 5;
    doc.text(recipient.contact, 14, leftY);

    const tableStartY = Math.max(leftY + 10, yPos + 10);
    autoTable(doc, {
      startY: tableStartY,
      head: [['S. No', 'Item Code', 'Description', 'Qty', 'Unit Price', 'Amount', 'Total Amount']],
      body: items.map((item, index) => {
        const amt = getItemAmount(item);
        return [
          index + 1, item.code, item.desc, item.qty, formatNumber(item.rate),
          formatNumber(amt), formatNumber(amt)
        ];
      }),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 3, textColor: 0, valign: 'top' },
      headStyles: { fillColor: false, textColor: [59, 130, 246], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        4: { halign: 'right' }, 5: { halign: 'right', fontStyle: 'bold' }, 6: { halign: 'right' }
      },
      didDrawPage: (data) => {
          const tableY = data.settings.startY;
          doc.setDrawColor(200, 220, 255);
          doc.line(14, tableY, 195, tableY);
          doc.line(14, tableY + 8, 195, tableY + 8);
      }
    });

    const tableEnd = (doc as any).lastAutoTable?.finalY || tableStartY + 20;
    let finalY = tableEnd + 10;
    const startTotalX = 140;
    const endTotalX = 195;
    doc.setDrawColor(200);
    doc.line(14, tableEnd, 195, tableEnd);

    const addTotalLine = (label: string, val: string, isBold = false) => {
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setTextColor(isBold ? 0 : 80);
        doc.text(label, startTotalX, finalY);
        doc.text(val, endTotalX, finalY, { align: 'right' });
        finalY += 6;
    };

    if (items.length > 0) {
        addTotalLine("Subtotal:", formatNumber(subtotal));
        if (taxRate > 0) {
            addTotalLine(`Tax (${taxRate}%):`, formatNumber(taxAmount));
        }
        finalY += 2;
        doc.setFontSize(11);
        doc.setTextColor(59, 130, 246);
        addTotalLine("Total:", formatNumber(grandTotal), true);
    }

    finalY += 10;
    const signX = 140;
    if (finalY > doc.internal.pageSize.height - 40) {
      doc.addPage();
      finalY = 30;
    }
    if (stampImage) {
      try { doc.addImage(stampImage, 'PNG', signX, finalY, 40, 25); } catch (e) {}
    }
    doc.setDrawColor(150);
    doc.line(signX, finalY + 30, signX + 50, finalY + 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text("Stamp & Sign", signX + 10, finalY + 36);
    const blob = doc.output('blob');
    FileSaver.saveAs(blob, `Invoice-${header.number}.pdf`);
  };

  const downloadDocx = () => {
    const doc = new docx.Document({
      sections: [{ children: [ new docx.Paragraph({ text: "Invoice Generated via NexTool" }) ] }]
    });
    docx.Packer.toBlob(doc).then(blob => FileSaver.saveAs(blob, `Invoice.docx`));
  };

  return (
    <div>
      <MobileTabSwitcher active={activeTab} onChange={setActiveTab} />

      <div className="grid xl:grid-cols-5 gap-8 items-start">
        
        {/* --- Editor Panel --- */}
        <div className={`xl:col-span-2 space-y-6 ${activeTab === 'edit' ? 'block' : 'hidden xl:block'}`}>
           
           {/* Actions Toolbar */}
           <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm sticky top-[90px] xl:top-0 z-20 flex flex-wrap gap-2">
              <Button onClick={saveInvoiceData} variant="outline" size="sm" className="flex-1 min-w-[80px]" title="Save">
                 <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button onClick={loadInvoiceData} variant="outline" size="sm" className="flex-1 min-w-[80px]" title="Load">
                 <FolderOpen className="w-4 h-4 mr-1" /> Load
              </Button>
              <Button onClick={downloadPdf} className="flex-1 min-w-[80px] bg-red-600 hover:bg-red-700 text-white border-0">
                 <Download className="w-4 h-4 mr-1" /> PDF
              </Button>
              <Button onClick={downloadDocx} className="flex-1 min-w-[80px] bg-blue-700 hover:bg-blue-800 text-white border-0">
                 <FileText className="w-4 h-4 mr-1" /> DOCX
              </Button>
           </div>

           {/* Settings */}
           <div className="bg-blue-50 dark:bg-slate-900 p-5 rounded-2xl border border-blue-100 dark:border-slate-800">
              <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" /> Global Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-blue-600 dark:text-slate-400 mb-2 block uppercase tracking-wide">Currency</label>
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-slate-700 overflow-hidden focus-within:ring-2 ring-blue-500">
                      <span className="pl-3 pr-2 text-gray-400"><DollarSign className="w-4 h-4"/></span>
                      <input className="w-full p-3 text-sm outline-none bg-transparent dark:text-white" value={currencySymbol} onChange={e=>setCurrencySymbol(e.target.value)} placeholder="e.g. $" />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-blue-600 dark:text-slate-400 mb-2 block uppercase tracking-wide">Tax Rate %</label>
                    <input type="number" className={inputClasses} value={taxRate} onChange={e=>setTaxRate(Number(e.target.value))} />
                 </div>
              </div>
           </div>

           {/* Invoice Info */}
           <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-gray-800 dark:text-slate-100">Invoice Info</h3>
                <Button size="sm" variant="outline" onClick={generateNextNumber} className="text-xs px-3 py-1 h-8">
                  <Hash className="w-3 h-3 mr-1 inline" /> Next #
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">Invoice #</label><input className={inputClasses} value={header.number} onChange={e=>setHeader({...header, number: e.target.value})} /></div>
                 <div><label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">Date</label><input type="date" className={inputClasses} value={header.date} onChange={e=>setHeader({...header, date: e.target.value})} /></div>
                 <div><label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">NTN / Tax ID</label><input className={inputClasses} value={header.ntn} onChange={e=>setHeader({...header, ntn: e.target.value})} /></div>
                 <div><label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">P.O. #</label><input className={inputClasses} value={header.poNumber} onChange={e=>setHeader({...header, poNumber: e.target.value})} /></div>
                 <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">FOR (Project)</label><input className={inputClasses} value={header.forLabel} onChange={e=>setHeader({...header, forLabel: e.target.value})} /></div>
              </div>
           </div>

           {/* Sender */}
           <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">From (Sender)</h3>
              <div className="space-y-3">
                 <input className={inputClasses + " font-bold"} placeholder="Company Name" value={sender.company} onChange={e=>setSender({...sender, company: e.target.value})} />
                 <input className={inputClasses} placeholder="Person Name" value={sender.person} onChange={e=>setSender({...sender, person: e.target.value})} />
                 <input className={inputClasses} placeholder="Address L1" value={sender.address1} onChange={e=>setSender({...sender, address1: e.target.value})} />
                 <input className={inputClasses} placeholder="Address L2" value={sender.address2} onChange={e=>setSender({...sender, address2: e.target.value})} />
                 <input className={inputClasses} placeholder="Phone" value={sender.phone} onChange={e=>setSender({...sender, phone: e.target.value})} />
              </div>
           </div>

           {/* Recipient */}
           <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Bill To (Recipient)</h3>
              <div className="space-y-3">
                 <input className={inputClasses} placeholder="Header (e.g. DP World)" value={recipient.header} onChange={e=>setRecipient({...recipient, header: e.target.value})} />
                 <input className={inputClasses + " font-bold"} placeholder="Company Name" value={recipient.company} onChange={e=>setRecipient({...recipient, company: e.target.value})} />
                 <input className={inputClasses} placeholder="Address L1" value={recipient.address1} onChange={e=>setRecipient({...recipient, address1: e.target.value})} />
                 <input className={inputClasses} placeholder="Address L2" value={recipient.address2} onChange={e=>setRecipient({...recipient, address2: e.target.value})} />
                 <input className={inputClasses} placeholder="Contact Info" value={recipient.contact} onChange={e=>setRecipient({...recipient, contact: e.target.value})} />
              </div>
           </div>

           {/* Items */}
           <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Line Items</h3>
              <div className="space-y-6">
                {items.map((item, i) => (
                  <div key={item.id} className="relative p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 group">
                     <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">Item {i + 1}</span>
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4"/></button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Row 1: Code and Qty */}
                        <div className="col-span-1 md:col-span-3">
                           <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Code</label>
                           <input className={inputClasses + " p-2 text-sm"} value={item.code} onChange={e=>updateItem(item.id, 'code', e.target.value)} />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                           <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Qty</label>
                           <input className={inputClasses + " p-2 text-sm"} type="number" value={item.qty} onChange={e=>updateItem(item.id, 'qty', Number(e.target.value))} />
                        </div>
                        {/* Row 2: Price and Amounts */}
                        <div className="col-span-1 md:col-span-3">
                           <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Unit Price</label>
                           <input className={inputClasses + " p-2 text-sm"} type="number" value={item.rate} onChange={e=>updateItem(item.id, 'rate', Number(e.target.value))} />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                           <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Amount</label>
                           <input 
                             type="number" 
                             className={inputClasses + " p-2 text-sm bg-gray-100 dark:bg-slate-900 font-mono"} 
                             value={item.amount !== undefined ? item.amount : (item.qty * item.rate)} 
                             onChange={e=>updateItem(item.id, 'amount', Number(e.target.value))} 
                           />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                           <label className="text-[10px] font-bold text-blue-500 dark:text-blue-400 mb-1 block uppercase">Total Amount</label>
                           <input 
                             type="number" 
                             className={inputClasses + " p-2 text-sm bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold font-mono"} 
                             value={item.amount !== undefined ? item.amount : (item.qty * item.rate)} 
                             onChange={e=>updateItem(item.id, 'amount', Number(e.target.value))} 
                           />
                        </div>
                        {/* Row 3: Description */}
                        <div className="col-span-1 md:col-span-12">
                           <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Description</label>
                           <TextArea 
                             className="min-h-[80px] bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
                             rows={2} 
                             value={item.desc} 
                             onChange={e=>updateItem(item.id, 'desc', e.target.value)} 
                           />
                        </div>
                     </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-dashed" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" /> Add New Item
                </Button>
              </div>
           </div>

           {/* Stamp */}
           <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Stamp & Signature</h3>
              <div className="flex flex-col gap-4">
                <label className="cursor-pointer bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 dark:text-slate-400">
                   <Upload className="w-8 h-8 mb-2 text-gray-400"/> 
                   <span className="text-sm font-medium">Click to upload image</span>
                   <input type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
                </label>
                {stampImage && (
                  <div className="relative w-fit group">
                    <img src={stampImage} alt="Stamp" className="h-20 object-contain border dark:border-slate-700 rounded bg-white p-2" />
                    <button onClick={() => setStampImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"><Trash2 className="w-3 h-3"/></button>
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* --- Preview Panel --- */}
        <div className={`xl:col-span-3 ${activeTab === 'preview' ? 'block' : 'hidden xl:block'}`}>
           <PreviewScaler>
             <div className="w-[210mm] min-h-[297mm] p-[10mm] relative text-gray-900 leading-tight bg-white">
                
                {/* Header Right */}
                <div className="absolute top-[10mm] right-[10mm] text-right">
                   <h1 className="text-4xl font-bold text-blue-500 mb-2">{header.title}</h1>
                   <div className="space-y-1.5 text-sm">
                      <div className="font-bold text-blue-500">INVOICE <span className="text-gray-800 font-normal">#{header.number}</span></div>
                      <div className="font-bold text-blue-500">DATE <span className="text-gray-800 font-normal">{header.date}</span></div>
                      <div className="font-normal text-gray-800">NTN {header.ntn}</div>
                      {header.forLabel && <div className="font-bold text-blue-500">FOR <span className="text-gray-800 font-normal">{header.forLabel}</span></div>}
                      {header.poNumber && <div className="font-bold text-blue-500">P.O.#{header.poNumber}</div>}
                   </div>
                </div>

                {/* Sender Left */}
                <div className="mt-8 mb-8">
                   <h2 className="text-xl font-bold text-gray-700 mb-2">{sender.company}</h2>
                   <div className="text-sm text-gray-800 space-y-1">
                      <p className="font-medium">{sender.person}</p>
                      <p>{sender.address1}</p>
                      <p>{sender.address2}</p>
                      <p className="mt-1">Phone {sender.phone}</p>
                   </div>
                </div>

                {/* Recipient Left */}
                <div className="mb-10 max-w-[60%]">
                   {recipient.header && <p className="text-sm font-normal mb-1">{recipient.header}</p>}
                   <h3 className="text-sm font-bold underline decoration-2 decoration-gray-800 mb-2">{recipient.company}</h3>
                   <div className="text-sm text-gray-800 space-y-1">
                      <p>{recipient.address1}</p>
                      <p>{recipient.address2}</p>
                      <p>{recipient.contact}</p>
                   </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-sm mb-6">
                   <thead>
                      <tr className="border-t border-b border-blue-200">
                         <th className="py-2 text-blue-500 text-center w-12 font-bold">S. No</th>
                         <th className="py-2 text-blue-500 text-left w-24 font-bold">Item Code</th>
                         <th className="py-2 text-blue-500 text-left font-bold">Description</th>
                         <th className="py-2 text-blue-500 text-center w-16 font-bold">Qty</th>
                         <th className="py-2 text-blue-500 text-right w-28 whitespace-nowrap font-bold">Unit Price</th>
                         <th className="py-2 text-blue-500 text-right w-28 font-bold whitespace-nowrap">Amount</th>
                         <th className="py-2 text-blue-500 text-right w-32 whitespace-nowrap font-bold">Total Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {items.map((item, i) => (
                         <tr key={item.id} className="align-top">
                            <td className="py-3 text-center text-gray-500">{i + 1}</td>
                            <td className="py-3 font-bold text-gray-700">{item.code}</td>
                            <td className="py-3 pr-4 text-gray-600 leading-snug whitespace-pre-wrap">{item.desc}</td>
                            <td className="py-3 text-center">{item.qty}</td>
                            <td className="py-3 text-right text-gray-600">{formatNumber(item.rate)}</td>
                            <td className="py-3 text-right font-bold text-gray-800">{formatNumber(getItemAmount(item))}</td>
                            <td className="py-3 text-right text-gray-800">{formatNumber(getItemAmount(item))}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>

                {/* Totals Section */}
                <div className="flex justify-end mb-12 border-t pt-4">
                   <div className="w-64 space-y-2 text-sm">
                      <div className="flex justify-between">
                         <span className="text-gray-600 font-medium">Subtotal</span>
                         <span className="text-gray-800 text-right">{formatNumber(subtotal)}</span>
                      </div>
                      {taxRate > 0 && (
                         <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Tax ({taxRate}%)</span>
                            <span className="text-gray-800 text-right">{formatNumber(taxAmount)}</span>
                         </div>
                      )}
                      <div className="flex justify-between font-bold text-lg text-blue-600 mt-2 pt-2 border-t border-gray-100">
                         <span>Total</span>
                         <span className="text-right">{formatNumber(grandTotal)}</span>
                      </div>
                   </div>
                </div>

                {/* Footer / Stamp */}
                <div className="absolute bottom-[20mm] right-[20mm] w-48 text-center">
                   {stampImage && (
                      <img src={stampImage} className="h-16 w-auto mx-auto mb-2 object-contain" alt="Stamp" />
                   )}
                   <div className="border-t border-gray-400 pt-2 text-gray-500 text-sm font-medium">Stamp & Sign</div>
                </div>

             </div>
           </PreviewScaler>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. DELIVERY CHALLAN GENERATOR
// ==========================================
export const DeliveryChallanGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  
  // Header with fields matching the screenshot
  const [header, setHeader] = useState({
    title: 'Delivery Challan',
    invoiceNo: '121051',
    ntn: '3379147-3',
    forLabel: 'Office Material',
    poNumber: 'QICT.PO.25.18097',
    date: new Date().toISOString().split('T')[0] // Useful to keep, even if screenshot doesn't show it in top right header block.
  });

  // Sender details updated to include Person, Address2
  const [sender, setSender] = useState({
    company: 'H & H Emporium',
    person: 'Tayyab Memon',
    address1: 'Al Khayam Arcade Nursery',
    address2: 'Karachi, Pakistan',
    phone: '03452430044'
  });

  // Recipient details updated to include Header (DP World), Address2
  const [recipient, setRecipient] = useState({
    header: 'DP World',
    company: 'Qasim International Container Terminal Pakistan Ltd',
    address1: 'Berth 5 - 10 Marginal Wharves, port Muhammad Bin Qasim',
    address2: 'P.O Box 6425 Karachi- 75020 Pakistan',
    contact: 'UAN + 92 (21) 111786888, tell: +92 (21) 34739100'
  });

  // Items: S.No, Item Code, Description, Qty (Matching screenshot)
  const [items, setItems] = useState<ChallanItem[]>([
    { id: '1', code: 'MATERIAL', desc: 'Window Blinds (as per attached picture) approx. size 12\'+4\'\'x5\' with complete installation.', qty: 1 },
    { id: '2', code: 'MATERIAL', desc: 'Window Blinds (as per attached picture) approx. size 2\'+6\'\'x5\' with complete installation.', qty: 2 }
  ]);
  
  const [stampImage, setStampImage] = useState<string | null>(null);

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { if(ev.target?.result) setStampImage(ev.target.result as string); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const addItem = () => setItems([...items, { id: Date.now().toString(), code: '', desc: '', qty: 1 }]);
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof ChallanItem, val: string | number) => setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  
  const downloadPdf = () => { alert("PDF Download Logic Placeholder"); };
  const downloadDocx = () => { alert("DOCX Download Logic Placeholder"); };

  return (
    <div>
      <MobileTabSwitcher active={activeTab} onChange={setActiveTab} />

      <div className="grid xl:grid-cols-5 gap-8 items-start">
        
        {/* --- Editor Panel --- */}
        <div className={`xl:col-span-2 space-y-6 ${activeTab === 'edit' ? 'block' : 'hidden xl:block'}`}>
           <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm flex flex-wrap gap-2 sticky top-[90px] xl:top-0 z-20">
               <Button onClick={downloadPdf} className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 text-xs"><Download className="w-4 h-4 mr-1" /> PDF</Button>
               <Button onClick={downloadDocx} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white border-0 text-xs"><FileText className="w-4 h-4 mr-1" /> DOCX</Button>
           </div>
           
           {/* Header Info */}
           <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm">
               <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Challan Info</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">Invoice #</label><input className={inputClasses} value={header.invoiceNo} onChange={e=>setHeader({...header, invoiceNo: e.target.value})} /></div>
                 <div><label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">NTN</label><input className={inputClasses} value={header.ntn} onChange={e=>setHeader({...header, ntn: e.target.value})} /></div>
                 <div><label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">FOR (Project)</label><input className={inputClasses} value={header.forLabel} onChange={e=>setHeader({...header, forLabel: e.target.value})} /></div>
                 <div><label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">P.O. #</label><input className={inputClasses} value={header.poNumber} onChange={e=>setHeader({...header, poNumber: e.target.value})} /></div>
                 <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">Date (Metadata)</label><input type="date" className={inputClasses} value={header.date} onChange={e=>setHeader({...header, date: e.target.value})} /></div>
               </div>
           </div>

           {/* Sender */}
           <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Sender</h3>
              <div className="space-y-3">
                 <input className={inputClasses + " font-bold"} value={sender.company} onChange={e=>setSender({...sender, company: e.target.value})} placeholder="Company Name"/>
                 <input className={inputClasses} value={sender.person} onChange={e=>setSender({...sender, person: e.target.value})} placeholder="Person Name"/>
                 <input className={inputClasses} value={sender.address1} onChange={e=>setSender({...sender, address1: e.target.value})} placeholder="Address Line 1"/>
                 <input className={inputClasses} value={sender.address2} onChange={e=>setSender({...sender, address2: e.target.value})} placeholder="Address Line 2"/>
                 <input className={inputClasses} value={sender.phone} onChange={e=>setSender({...sender, phone: e.target.value})} placeholder="Phone"/>
              </div>
           </div>

           {/* Recipient */}
           <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Recipient</h3>
              <div className="space-y-3">
                 <input className={inputClasses} value={recipient.header} onChange={e=>setRecipient({...recipient, header: e.target.value})} placeholder="Header (e.g. DP World)"/>
                 <input className={inputClasses + " font-bold"} value={recipient.company} onChange={e=>setRecipient({...recipient, company: e.target.value})} placeholder="Company Name"/>
                 <input className={inputClasses} value={recipient.address1} onChange={e=>setRecipient({...recipient, address1: e.target.value})} placeholder="Address Line 1"/>
                 <input className={inputClasses} value={recipient.address2} onChange={e=>setRecipient({...recipient, address2: e.target.value})} placeholder="Address Line 2"/>
                 <input className={inputClasses} value={recipient.contact} onChange={e=>setRecipient({...recipient, contact: e.target.value})} placeholder="Contact Info"/>
              </div>
           </div>

           {/* Items */}
           <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm">
               <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Items</h3>
               <div className="space-y-4">
                 {items.map((item, i) => (
                    <div key={item.id} className="relative p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 group">
                       <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">Item {i+1}</span>
                          <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4"/></button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="col-span-1 md:col-span-4">
                             <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Code</label>
                             <input className={inputClasses + " p-2 text-sm"} placeholder="Code" value={item.code} onChange={e=>updateItem(item.id, 'code', e.target.value)} />
                          </div>
                          <div className="col-span-1 md:col-span-4">
                             <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Qty</label>
                             <input className={inputClasses + " p-2 text-sm"} type="number" placeholder="Qty" value={item.qty} onChange={e=>updateItem(item.id, 'qty', Number(e.target.value))} />
                          </div>
                          <div className="col-span-1 md:col-span-12">
                             <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Description</label>
                             <TextArea 
                               rows={3} 
                               className="min-h-[80px] bg-white dark:bg-slate-800 text-gray-900 dark:text-white" 
                               placeholder="Description" 
                               value={item.desc} 
                               onChange={e=>updateItem(item.id, 'desc', e.target.value)} 
                             />
                          </div>
                       </div>
                    </div>
                 ))}
                 <Button variant="outline" className="w-full border-dashed" onClick={addItem}><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
               </div>
           </div>

           {/* Stamp */}
           <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm">
               <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl cursor-pointer text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                  <Upload className="w-8 h-8 mb-2"/> 
                  <span className="text-sm font-medium">Upload Stamp/Signature</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
               </label>
               {stampImage && (
                 <div className="mt-4 flex justify-center relative">
                   <img src={stampImage} className="h-16 border dark:border-slate-700 bg-white p-1 rounded" />
                   <button onClick={() => setStampImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><Trash2 className="w-3 h-3"/></button>
                 </div>
               )}
           </div>
        </div>

        {/* --- Preview Panel (MATCHING SCREENSHOT) --- */}
        <div className={`xl:col-span-3 ${activeTab === 'preview' ? 'block' : 'hidden xl:block'}`}>
           <PreviewScaler>
             <div className="w-[210mm] min-h-[297mm] p-[10mm] relative text-gray-900 bg-white font-sans">
                 
                 {/* Header Right Block */}
                 <div className="absolute top-[10mm] right-[10mm] text-right">
                    <h1 className="text-3xl font-bold text-blue-600 mb-1">Delivery Challan</h1>
                    <div className="text-sm font-bold text-gray-900 mb-1">INVOICE #{header.invoiceNo}</div>
                    <div className="text-sm font-bold text-gray-900 mb-2">NTN {header.ntn}</div>
                    
                    <div className="flex justify-end items-center gap-1 mb-1">
                       <span className="font-bold text-blue-600 text-sm">FOR</span>
                       <span className="text-gray-800 text-sm">{header.forLabel}</span>
                    </div>
                    <div className="font-bold text-blue-600 text-sm">P.O.#{header.poNumber}</div>
                 </div>
                 
                 {/* Sender (Left) */}
                 <div className="mt-12 mb-8 max-w-[60%]">
                    <h2 className="text-lg font-bold text-gray-700 mb-1">{sender.company}</h2>
                    <div className="text-sm text-gray-800 space-y-0.5 leading-snug">
                       <p>{sender.person}</p>
                       <p>{sender.address1}</p>
                       <p>{sender.address2}</p>
                       <p>Phone {sender.phone}</p>
                    </div>
                 </div>

                 {/* Recipient (Left, below sender) */}
                 <div className="mb-10 max-w-[60%]">
                    {recipient.header && <p className="text-sm text-gray-800 mb-1">{recipient.header}</p>}
                    <h3 className="text-sm font-bold underline decoration-2 decoration-gray-800 mb-2">{recipient.company}</h3>
                    <div className="text-sm text-gray-800 space-y-0.5 leading-snug">
                       <p>{recipient.address1}</p>
                       <p>{recipient.address2}</p>
                       <p>{recipient.contact}</p>
                    </div>
                 </div>

                 {/* Items Table (Matching columns: S.No, Item Code, Description, Qty) */}
                 <table className="w-full text-sm mb-12">
                    <thead>
                       <tr className="border-t border-b border-blue-200 text-left">
                          <th className="py-2 w-12 text-center font-bold text-blue-600">S. No</th>
                          <th className="py-2 w-32 font-bold text-blue-600">Item Code</th>
                          <th className="py-2 font-bold text-blue-600">Description</th>
                          <th className="py-2 w-16 text-center font-bold text-blue-600">Qty</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {items.map((item, i) => (
                          <tr key={item.id} className="align-top">
                             <td className="py-4 text-center text-gray-900">{i+1}</td>
                             <td className="py-4 font-bold text-gray-900">{item.code}</td>
                             <td className="py-4 text-gray-900 font-bold whitespace-pre-wrap leading-snug">{item.desc}</td>
                             <td className="py-4 text-center font-bold text-gray-900">{item.qty}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 
                 <div className="border-t border-blue-200 w-full mb-8"></div>

                 {/* Stamp & Sign */}
                 <div className="absolute bottom-[20mm] right-[20mm] w-48 text-center">
                    {stampImage && (
                       <img src={stampImage} className="h-16 w-auto mx-auto mb-2 object-contain" alt="Stamp" />
                    )}
                    <div className="border-t border-gray-400 pt-2 text-gray-600 text-sm">Stamp & Sign</div>
                 </div>
             </div>
           </PreviewScaler>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. FEES SLIP GENERATOR (SMIT STYLE)
// ==========================================
export const FeesSlipGenerator: React.FC = () => {
   const [data, setData] = useState({
      name: 'Ibrahim Tayyab',
      rollNo: '786032',
      dueDate: '19-12-2025',
      month: 'December',
      netPayable: 1000,
      invoiceAmount: 1035,
      invoiceId: '100333 0391 2535 1000 05'
   });

   const [logo, setLogo] = useState<string | null>(null);
   const [blinqLogo, setBlinqLogo] = useState<string | null>(null);
   const svgRef = useRef<SVGSVGElement>(null);

   const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         const reader = new FileReader();
         reader.onload = (ev) => {
            if (ev.target?.result) setLogo(ev.target.result as string);
         };
         reader.readAsDataURL(e.target.files[0]);
      }
   };

   const handleBlinqLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         const reader = new FileReader();
         reader.onload = (ev) => {
            if (ev.target?.result) setBlinqLogo(ev.target.result as string);
         };
         reader.readAsDataURL(e.target.files[0]);
      }
   };

   const download = async (format: 'pdf' | 'png' | 'jpg' | 'svg') => {
      if (!svgRef.current) return;
      
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      if (format === 'svg') {
         FileSaver.saveAs(svgBlob, `Fee-Slip-${data.rollNo}.svg`);
         return;
      }

      const img = new Image();
      img.src = url;
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = 1200; // High resolution
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // White background for JPG/PDF
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 1200, 800);

      if (format === 'png') {
         canvas.toBlob(blob => FileSaver.saveAs(blob!, `Fee-Slip-${data.rollNo}.png`));
      } else if (format === 'jpg') {
         canvas.toBlob(blob => FileSaver.saveAs(blob!, `Fee-Slip-${data.rollNo}.jpg`), 'image/jpeg', 0.9);
      } else if (format === 'pdf') {
         const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1200, 800] });
         pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, 1200, 800);
         pdf.save(`Fee-Slip-${data.rollNo}.pdf`);
      }
   };

   // Helper to render one side of the slip
   const renderSlipContent = (type: 'student' | 'bank', xOffset: number) => {
      const headerColor = "#595959"; 
      const borderColor = "#000000";
      const logoBlue = "#2563eb";
      const logoGreen = "#16a34a";
      const formatCurrency = (val: number) => val.toLocaleString();
      
      const WIDTH = 470; // Total width of the content area
      const GRID_Y = 140; // Push grid down to make room for logo

      return (
         <g transform={`translate(${xOffset}, 0)`}>
            {/* Outer Border for the slip (Optional, helps define "paper" edge) */}
            <rect x="-10" y="-10" width={WIDTH + 20} height="520" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />

            {/* --- Logo Area --- */}
            {/* Increased height allowance to 120px and width to 300px for a big logo */}
            <g transform="translate(0, 10)">
               {logo ? (
                  <image 
                    href={logo} 
                    x="0" 
                    y="0" 
                    width="400" 
                    height="120" 
                    preserveAspectRatio="xMinYMid meet" 
                  />
               ) : (
                  // Fallback logo
                  <g transform="translate(20, 20)">
                     {/* Fallback SMIT Text Logo Approximation */}
                     <path d="M10,40 Q10,10 40,10 L45,10" fill="none" stroke={logoBlue} strokeWidth="5" strokeLinecap="round" />
                     <text x="10" y="55" fontFamily="Arial" fontWeight="bold" fontSize="40" fill={logoBlue}>S</text>
                     <text x="45" y="55" fontFamily="Arial" fontWeight="bold" fontSize="40" fill={logoBlue}>M</text>
                     <circle cx="95" cy="25" r="5" fill={logoGreen} />
                     <text x="88" y="55" fontFamily="Arial" fontWeight="bold" fontSize="40" fill={logoBlue}>I</text>
                     <text x="110" y="55" fontFamily="Arial" fontWeight="bold" fontSize="40" fill={logoBlue}>T</text>
                     <path d="M45,20 L65,10 L85,20 L65,30 Z" fill={logoBlue} />
                     <path d="M85,20 L85,35 L65,30" fill="none" stroke={logoBlue} strokeWidth="2" />
                     <text x="10" y="75" fontFamily="Arial" fontSize="10" fontWeight="bold" letterSpacing="1" fill="#000">SAYLANI MASS IT TRAINING</text>
                  </g>
               )}
            </g>
            
            {/* Copy Label (Top Right) */}
            <text x={WIDTH} y="30" textAnchor="end" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="#000">
               {type === 'student' ? 'Student Copy' : 'Bank Copy'}
            </text>

            {/* --- Info Grid --- */}
            <g transform={`translate(0, ${GRID_Y})`}>
               {/* Column Widths: 110 | 140 | 80 | 140 = 470 total */}
               
               {/* Row 1 */}
               {/* Customer Name Label */}
               <rect x="0" y="0" width="110" height="25" fill={headerColor} stroke={borderColor} strokeWidth="0.5" />
               <text x="5" y="17" fill="white" fontSize="11" fontFamily="Arial" fontWeight="bold">Customer Name :</text>
               
               {/* Customer Name Value */}
               <rect x="110" y="0" width="140" height="25" fill="white" stroke={borderColor} strokeWidth="0.5" />
               <text x="115" y="17" fill="black" fontSize="11" fontFamily="Arial" fontWeight="bold" clipPath="url(#clip-name)">{data.name}</text>

               {/* Roll No Label */}
               <rect x="250" y="0" width="80" height="25" fill={headerColor} stroke={borderColor} strokeWidth="0.5" />
               <text x="255" y="17" fill="white" fontSize="11" fontFamily="Arial" fontWeight="bold">Roll No.</text>
               
               {/* Roll No Value */}
               <rect x="330" y="0" width="140" height="25" fill="white" stroke={borderColor} strokeWidth="0.5" />
               <text x="335" y="17" fill="black" fontSize="11" fontFamily="Arial" fontWeight="bold">{data.rollNo}</text>

               {/* Row 2 */}
               {/* Due Date Label */}
               <rect x="0" y="25" width="110" height="25" fill={headerColor} stroke={borderColor} strokeWidth="0.5" />
               <text x="5" y="42" fill="white" fontSize="11" fontFamily="Arial" fontWeight="bold">Due Date :</text>
               
               {/* Due Date Value */}
               <rect x="110" y="25" width="140" height="25" fill="white" stroke={borderColor} strokeWidth="0.5" />
               <text x="115" y="42" fill="black" fontSize="11" fontFamily="Arial" fontWeight="bold">{data.dueDate}</text>

               {/* Month Label */}
               <rect x="250" y="25" width="80" height="25" fill={headerColor} stroke={borderColor} strokeWidth="0.5" />
               <text x="255" y="42" fill="white" fontSize="11" fontFamily="Arial" fontWeight="bold">Month :</text>
               
               {/* Month Value */}
               <rect x="330" y="25" width="140" height="25" fill="white" stroke={borderColor} strokeWidth="0.5" />
               <text x="335" y="42" fill="black" fontSize="11" fontFamily="Arial" fontWeight="bold">{data.month}</text>
            </g>

            {/* --- Invoice ID Box --- */}
            <g transform={`translate(0, ${GRID_Y + 60})`}>
               <rect x="0" y="0" width={WIDTH} height="30" fill="none" stroke={borderColor} strokeWidth="0.5" />
               <text x={WIDTH / 2} y="20" textAnchor="middle" fontSize="13" fontFamily="Arial" fontWeight="bold">
                  1BILL INVOICE ID: {data.invoiceId}
               </text>
            </g>

            {/* --- Payment Options Box --- */}
            <g transform={`translate(0, ${GRID_Y + 100})`}>
               <rect x="0" y="0" width={WIDTH} height="120" fill="none" stroke={borderColor} strokeWidth="0.5" />
               
               {/* Vertical Divider for Logo */}
               <line x1="100" y1="0" x2="100" y2="120" stroke={borderColor} strokeWidth="0.5" />
               {/* Horizontal Divider */}
               <line x1="100" y1="60" x2={WIDTH} y2="60" stroke={borderColor} strokeWidth="0.5" />

               {/* Blinq Logo */}
               <g transform="translate(5, 35)">
                  {blinqLogo ? (
                     <image href={blinqLogo} x="0" y="0" width="90" height="50" preserveAspectRatio="xMidYMid meet" />
                  ) : (
                     <g>
                        <text x="10" y="30" fontFamily="Arial" fontWeight="900" fontSize="24" fill="black">Blinq</text>
                        <circle cx="80" cy="18" r="4" fill="#fbbf24" />
                     </g>
                  )}
               </g>

               {/* Cash Section */}
               <text x="105" y="15" fontSize="10" fontFamily="Arial">
                  Pay in <tspan fontWeight="bold">Cash</tspan> using 1Bill Invoice ID at any branch of :
               </text>
               <g transform="translate(105, 30)" fontSize="9" fontFamily="Arial" fontWeight="bold">
                  {/* Using slightly tighter spacing to fit width */}
                  <text x="0" y="0">• Meezan</text>
                  <text x="80" y="0">• Alfalah</text>
                  <text x="160" y="0">• Faysal</text>
                  <text x="230" y="0">• Habib Metro</text>
                  <text x="310" y="0">• Al Baraka</text>

                  <text x="0" y="15">• Bank Islami</text>
                  <text x="80" y="15">• Askari</text>
                  <text x="160" y="15">• DIB</text>
                  <text x="230" y="15">• TCS</text>
                  <text x="310" y="15">• Leopards</text>
               </g>

               {/* Online Section */}
               <text x="105" y="75" fontSize="10" fontFamily="Arial">
                  Pay <tspan fontWeight="bold">Online</tspan> using 1Bill Invoice ID via
               </text>
               <g transform="translate(105, 95)" fontSize="9" fontFamily="Arial" fontWeight="bold">
                  <text x="0" y="0">• Internet Banking</text>
                  <text x="100" y="0">• Mobile Banking</text>
                  <text x="190" y="0">• EasyPaisa Wallet</text>
                  <text x="290" y="0">• JazzCash Wallet</text>
               </g>
            </g>

            {/* --- Fee Table --- */}
            <g transform={`translate(0, ${GRID_Y + 230})`}>
               {/* Head */}
               <rect x="0" y="0" width={WIDTH - 150} height="25" fill={headerColor} stroke={borderColor} strokeWidth="0.5" />
               <text x="5" y="17" fill="white" fontSize="11" fontFamily="Arial" fontWeight="bold">Fee Head Information</text>
               
               <rect x={WIDTH - 150} y="0" width="150" height="25" fill={headerColor} stroke={borderColor} strokeWidth="0.5" />
               <text x={WIDTH - 75} y="17" fill="white" fontSize="11" fontFamily="Arial" fontWeight="bold" textAnchor="middle">Amount</text>

               {/* Net Payable */}
               <rect x="0" y="25" width={WIDTH - 150} height="25" fill="white" stroke={borderColor} strokeWidth="0.5" />
               <text x="5" y="42" fontSize="11" fontFamily="Arial" fontWeight="bold">Net Payable</text>
               <rect x={WIDTH - 150} y="25" width="150" height="25" fill="white" stroke={borderColor} strokeWidth="0.5" />
               <text x={WIDTH - 75} y="42" fontSize="11" fontFamily="Arial" textAnchor="middle">{formatCurrency(data.netPayable)}</text>

               {/* 1Bill Amount */}
               <rect x="0" y="50" width={WIDTH - 150} height="25" fill="white" stroke={borderColor} strokeWidth="0.5" />
               <text x="5" y="67" fontSize="11" fontFamily="Arial" fontWeight="bold">1Bill Invoice Amount</text>
               <rect x={WIDTH - 150} y="50" width="150" height="25" fill="white" stroke={borderColor} strokeWidth="0.5" />
               <text x={WIDTH - 75} y="67" fontSize="11" fontFamily="Arial" textAnchor="middle">{formatCurrency(data.invoiceAmount)}</text>
            </g>

            {/* --- Instructions --- */}
            <g transform={`translate(0, ${GRID_Y + 315})`}>
               <rect x="0" y="0" width={WIDTH} height="50" fill="none" stroke="#d1d5db" strokeWidth="0.5" />
               <text x="5" y="12" fontSize="9" fontFamily="Arial" fontWeight="bold">PAYMENT INSTRUCTIONS:</text>
               <text x="5" y="25" fontSize="9" fontFamily="Arial">1. For cash payments, please keep the paid voucher receipt for any future reference</text>
               <text x="5" y="38" fontSize="9" fontFamily="Arial">
                  2. For payment related queries <tspan fontWeight="bold">Call or Whatsapp at Blinq Helpline 0333 0325467 | 0317 2893669</tspan>
               </text>
            </g>
         </g>
      );
   };

   return (
      <div className="grid xl:grid-cols-5 gap-8 items-start">
         <div className="xl:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm">
               <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Student Details</h3>
               <div className="space-y-3">
                  <input className={inputClasses} value={data.name} onChange={e=>setData({...data, name: e.target.value})} placeholder="Student Name" />
                  <input className={inputClasses} value={data.rollNo} onChange={e=>setData({...data, rollNo: e.target.value})} placeholder="Roll No" />
                  <div className="grid grid-cols-2 gap-3">
                     <input type="date" className={inputClasses} value={data.dueDate.split('-').reverse().join('-')} onChange={e=>setData({...data, dueDate: e.target.value.split('-').reverse().join('-')})} />
                     <input className={inputClasses} value={data.month} onChange={e=>setData({...data, month: e.target.value})} placeholder="Month" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <input type="number" className={inputClasses} value={data.netPayable} onChange={e=>setData({...data, netPayable: Number(e.target.value)})} placeholder="Net Payable" />
                     <input type="number" className={inputClasses} value={data.invoiceAmount} onChange={e=>setData({...data, invoiceAmount: Number(e.target.value)})} placeholder="1Bill Amount" />
                  </div>
                  <input className={inputClasses} value={data.invoiceId} onChange={e=>setData({...data, invoiceId: e.target.value})} placeholder="1Bill Invoice ID" />
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm space-y-4">
               <h3 className="font-bold text-gray-800 dark:text-slate-100 border-b border-gray-100 dark:border-slate-800 pb-3">Branding & Logos</h3>
               
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Main Logo (e.g. SMIT)</label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl cursor-pointer text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                     <span className="text-xs font-medium">Upload Institution Logo</span>
                     <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {logo && <div className="mt-2 text-xs text-green-600 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Logo Uploaded</div>}
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Payment Partner Logo (e.g. Blinq)</label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl cursor-pointer text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                     <span className="text-xs font-medium">Upload Payment Logo</span>
                     <input type="file" accept="image/*" className="hidden" onChange={handleBlinqLogoUpload} />
                  </label>
                  {blinqLogo && <div className="mt-2 text-xs text-green-600 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Logo Uploaded</div>}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <Button onClick={() => download('pdf')} className="bg-red-600 hover:bg-red-700 text-white border-0"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
               <Button onClick={() => download('png')} className="bg-blue-600 hover:bg-blue-700 text-white border-0"><ImageIcon className="w-4 h-4 mr-2" /> Download PNG</Button>
               <Button onClick={() => download('jpg')} variant="outline"><ImageIcon className="w-4 h-4 mr-2" /> Download JPG</Button>
               <Button onClick={() => download('svg')} variant="outline"><FileText className="w-4 h-4 mr-2" /> Download SVG</Button>
            </div>
         </div>

         <div className="xl:col-span-3">
            <div className="w-full overflow-auto bg-gray-200 dark:bg-slate-950/50 p-4 rounded-xl border border-gray-300 dark:border-slate-800">
               {/* Fixed SVG Output for Exact Layout */}
               <svg 
                  ref={svgRef}
                  width="1100" 
                  height="600" 
                  viewBox="0 0 1020 550" 
                  className="bg-white shadow-2xl mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <defs>
                     <style>
                        {`text { font-family: Arial, sans-serif; }`}
                     </style>
                  </defs>
                  
                  {/* Background */}
                  <rect width="1020" height="550" fill="white" />
                  
                  {/* Student Copy */}
                  {renderSlipContent('student', 15)}
                  
                  {/* Divider Line */}
                  <line x1="500" y1="20" x2="500" y2="520" stroke="#d1d5db" strokeDasharray="5,5" />
                  
                  {/* Bank Copy */}
                  {renderSlipContent('bank', 535)}
               </svg>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">Preview (Scroll to see full)</p>
         </div>
      </div>
   );
};