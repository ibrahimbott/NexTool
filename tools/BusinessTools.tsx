import React, { useState, useEffect, useRef } from 'react';
import { Button, TextArea, inputClasses } from '../components/UI';
import { Plus, Trash2, Download, FileText, Save, Upload, RotateCcw, Settings, Hash, DollarSign, FolderOpen, Truck, Eye, Edit3, Image as ImageIcon, CreditCard, Banknote, User, Building } from 'lucide-react';
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

interface FeeItem {
  id: string;
  title: string;
  amount: number;
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
        className="shadow-2xl transition-transform duration-200 ease-out bg-white origin-top"
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
  const [advance, setAdvance] = useState(0);
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
  const totalBeforeAdvance = subtotal + taxAmount;
  const grandTotal = totalBeforeAdvance - advance;

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
    const data = { header, sender, recipient, items, taxRate, advance, currencySymbol, stampImage };
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
        if(data.advance !== undefined) setAdvance(data.advance);
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
        if (advance > 0) {
            addTotalLine("Advance:", formatNumber(advance));
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
                 <div className="col-span-2">
                    <label className="text-xs font-bold text-blue-600 dark:text-slate-400 mb-2 block uppercase tracking-wide">Advance Payment</label>
                    <input type="number" className={inputClasses} value={advance} onChange={e=>setAdvance(Number(e.target.value))} placeholder="Amount Paid in Advance" />
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
                      {advance > 0 && (
                         <div className="flex justify-between text-gray-600">
                            <span className="font-medium">Advance</span>
                            <span className="text-right">{formatNumber(advance)}</span>
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
  const [header, setHeader] = useState({ title: 'DELIVERY CHALLAN', number: 'DC-001', date: new Date().toISOString().split('T')[0], poNumber: '' });
  const [sender, setSender] = useState({ company: 'My Company', address: '123 Business Rd, City', phone: '123-456-7890' });
  const [recipient, setRecipient] = useState({ company: 'Client Company', address: '456 Client St, City', contact: 'John Doe' });
  const [items, setItems] = useState<ChallanItem[]>([{ id: '1', code: 'ITM-001', desc: 'Sample Item', qty: 10 }]);

  const addItem = () => setItems([...items, { id: Date.now().toString(), code: '', desc: '', qty: 1 }]);
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof ChallanItem, val: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(59, 130, 246); doc.text(header.title, 195, 20, { align: 'right' });
    
    doc.setFontSize(10); doc.setTextColor(0);
    doc.text(`No: ${header.number}`, 195, 30, { align: 'right' });
    doc.text(`Date: ${header.date}`, 195, 35, { align: 'right' });
    if(header.poNumber) doc.text(`PO Ref: ${header.poNumber}`, 195, 40, { align: 'right' });

    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text(sender.company, 14, 30);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    const senderAddr = doc.splitTextToSize(sender.address, 80);
    doc.text(senderAddr, 14, 35);
    const senderAddrH = senderAddr.length * 5;
    doc.text(sender.phone, 14, 35 + senderAddrH);

    doc.text("Ship To:", 14, 60);
    doc.setFont("helvetica", "bold"); doc.text(recipient.company, 14, 65);
    doc.setFont("helvetica", "normal");
    const recipAddr = doc.splitTextToSize(recipient.address, 80);
    doc.text(recipAddr, 14, 70);
    const recipAddrH = recipAddr.length * 5;
    doc.text(recipient.contact, 14, 70 + recipAddrH);

    autoTable(doc, {
      startY: 90,
      head: [['S.No', 'Code', 'Description', 'Quantity']],
      body: items.map((item, i) => [i + 1, item.code, item.desc, item.qty]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 40;
    doc.line(14, finalY, 70, finalY); doc.text("Receiver Signature", 14, finalY + 5);
    doc.line(140, finalY, 195, finalY); doc.text("Authorized Signature", 140, finalY + 5);

    doc.save(`Challan-${header.number}.pdf`);
  };

  return (
    <div>
        <MobileTabSwitcher active={activeTab} onChange={setActiveTab} />
        <div className="grid xl:grid-cols-5 gap-8 items-start">
             <div className={`xl:col-span-2 space-y-6 ${activeTab === 'edit' ? 'block' : 'hidden xl:block'}`}>
                 <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800 shadow-sm sticky top-0 z-10 flex gap-2">
                     <Button onClick={downloadPdf} className="w-full"><Download className="w-4 h-4 mr-2"/> Download PDF</Button>
                 </div>
                 
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">Challan Details</h3>
                    <div className="space-y-3">
                       <input className={inputClasses} placeholder="Number" value={header.number} onChange={e=>setHeader({...header, number: e.target.value})} />
                       <input type="date" className={inputClasses} value={header.date} onChange={e=>setHeader({...header, date: e.target.value})} />
                       <input className={inputClasses} placeholder="PO Number (Optional)" value={header.poNumber} onChange={e=>setHeader({...header, poNumber: e.target.value})} />
                    </div>
                 </div>

                 <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">Sender</h3>
                    <div className="space-y-3">
                       <input className={inputClasses} placeholder="Company" value={sender.company} onChange={e=>setSender({...sender, company: e.target.value})} />
                       <input className={inputClasses} placeholder="Address" value={sender.address} onChange={e=>setSender({...sender, address: e.target.value})} />
                       <input className={inputClasses} placeholder="Phone" value={sender.phone} onChange={e=>setSender({...sender, phone: e.target.value})} />
                    </div>
                 </div>

                 <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">Recipient</h3>
                    <div className="space-y-3">
                       <input className={inputClasses} placeholder="Company" value={recipient.company} onChange={e=>setRecipient({...recipient, company: e.target.value})} />
                       <input className={inputClasses} placeholder="Address" value={recipient.address} onChange={e=>setRecipient({...recipient, address: e.target.value})} />
                       <input className={inputClasses} placeholder="Contact Person" value={recipient.contact} onChange={e=>setRecipient({...recipient, contact: e.target.value})} />
                    </div>
                 </div>

                 <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">Items</h3>
                    <div className="space-y-4">
                        {items.map((item, i) => (
                           <div key={item.id} className="p-3 bg-gray-50 dark:bg-slate-950 rounded border dark:border-slate-800">
                              <div className="flex justify-between mb-2">
                                 <span className="text-xs font-bold text-gray-500">Item {i+1}</span>
                                 <button onClick={()=>removeItem(item.id)} className="text-red-500"><Trash2 className="w-3 h-3"/></button>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                 <input className={inputClasses + " p-1 text-sm col-span-1"} placeholder="Code" value={item.code} onChange={e=>updateItem(item.id, 'code', e.target.value)} />
                                 <input className={inputClasses + " p-1 text-sm col-span-2"} placeholder="Description" value={item.desc} onChange={e=>updateItem(item.id, 'desc', e.target.value)} />
                                 <input type="number" className={inputClasses + " p-1 text-sm col-span-1"} placeholder="Qty" value={item.qty} onChange={e=>updateItem(item.id, 'qty', Number(e.target.value))} />
                              </div>
                           </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addItem} className="w-full"><Plus className="w-4 h-4 mr-2"/> Add Item</Button>
                    </div>
                 </div>
             </div>

             <div className={`xl:col-span-3 ${activeTab === 'preview' ? 'block' : 'hidden xl:block'}`}>
                 <PreviewScaler>
                     <div className="w-[210mm] min-h-[297mm] p-[15mm] bg-white relative text-gray-900">
                         <div className="text-right mb-8">
                             <h1 className="text-3xl font-bold text-blue-600 mb-1">{header.title}</h1>
                             <div className="text-sm">No: <strong>{header.number}</strong></div>
                             <div className="text-sm">Date: <strong>{header.date}</strong></div>
                             {header.poNumber && <div className="text-sm">PO Ref: <strong>{header.poNumber}</strong></div>}
                         </div>

                         <div className="flex justify-between mb-10">
                             <div className="w-[45%]">
                                 <div className="text-sm font-bold text-gray-500 uppercase mb-1">From</div>
                                 <div className="font-bold text-lg">{sender.company}</div>
                                 <div className="text-sm text-gray-700 whitespace-pre-wrap">{sender.address}</div>
                                 <div className="text-sm text-gray-700 mt-1">{sender.phone}</div>
                             </div>
                             <div className="w-[45%]">
                                 <div className="text-sm font-bold text-gray-500 uppercase mb-1">Ship To</div>
                                 <div className="font-bold text-lg">{recipient.company}</div>
                                 <div className="text-sm text-gray-700 whitespace-pre-wrap">{recipient.address}</div>
                                 <div className="text-sm text-gray-700 mt-1">{recipient.contact}</div>
                             </div>
                         </div>

                         <table className="w-full text-sm mb-12">
                             <thead>
                                 <tr className="border-b-2 border-blue-500">
                                     <th className="py-2 text-left">S.No</th>
                                     <th className="py-2 text-left">Code</th>
                                     <th className="py-2 text-left">Description</th>
                                     <th className="py-2 text-center">Quantity</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {items.map((item, i) => (
                                     <tr key={item.id} className="border-b border-gray-200">
                                         <td className="py-3 text-gray-500">{i+1}</td>
                                         <td className="py-3 font-medium">{item.code}</td>
                                         <td className="py-3">{item.desc}</td>
                                         <td className="py-3 text-center font-bold">{item.qty}</td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>

                         <div className="absolute bottom-[40mm] left-[15mm] right-[15mm] flex justify-between">
                             <div className="text-center w-40">
                                 <div className="border-b border-gray-400 mb-2"></div>
                                 <div className="text-xs font-bold text-gray-500 uppercase">Receiver Signature</div>
                             </div>
                             <div className="text-center w-40">
                                 <div className="border-b border-gray-400 mb-2"></div>
                                 <div className="text-xs font-bold text-gray-500 uppercase">Authorized Signature</div>
                             </div>
                         </div>
                     </div>
                 </PreviewScaler>
             </div>
        </div>
    </div>
  );
};

// ==========================================
// 3. FEES SLIP GENERATOR
// ==========================================
export const FeesSlipGenerator: React.FC = () => {
    const [school, setSchool] = useState({ name: 'International School System', address: '123 Education City', contact: '021-1234567' });
    const [student, setStudent] = useState({ name: 'John Doe', id: 'ST-2024-001', class: 'Grade 10 - A', month: 'October 2024', issueDate: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 864000000).toISOString().split('T')[0] });
    const [fees, setFees] = useState<FeeItem[]>([{ id: '1', title: 'Tuition Fee', amount: 5000 }, { id: '2', title: 'Lab Charges', amount: 1000 }]);
    const [copies] = useState(['Office Copy', 'Student Copy', 'Bank Copy']);

    const total = fees.reduce((acc, curr) => acc + curr.amount, 0);

    const addFee = () => setFees([...fees, { id: Date.now().toString(), title: '', amount: 0 }]);
    const removeFee = (id: string) => setFees(fees.filter(f => f.id !== id));
    const updateFee = (id: string, field: keyof FeeItem, val: string | number) => {
        setFees(fees.map(f => f.id === id ? { ...f, [field]: val } : f));
    };

    const generatePdf = () => {
        const doc = new jsPDF('p', 'mm', 'a4'); 
        const pageHeight = 297;
        const slipWidth = 210 / 3;
        
        copies.forEach((copyName, i) => {
            const xOffset = i * slipWidth;
            const startX = xOffset + 5;
            let y = 10;
            
            doc.setDrawColor(200);
            if (i > 0) doc.line(xOffset, 5, xOffset, pageHeight - 5); 
            
            doc.setFontSize(10); doc.setFont("helvetica", "bold");
            doc.text(school.name, startX + 30, y, { align: 'center', maxWidth: 60 });
            y += 5;
            doc.setFontSize(8); doc.setFont("helvetica", "normal");
            doc.text(school.address, startX + 30, y, { align: 'center', maxWidth: 60 });
            y += 10;
            
            doc.setFontSize(10); doc.setFont("helvetica", "bold");
            doc.text("FEE SLIP", startX + 30, y, { align: 'center' });
            y += 5;
            doc.setFontSize(8); doc.setFont("helvetica", "italic");
            doc.text(`(${copyName})`, startX + 30, y, { align: 'center' });
            y += 8;

            doc.setFont("helvetica", "normal");
            const addField = (label: string, val: string) => {
                doc.text(label, startX, y);
                doc.text(val, startX + 60, y, { align: 'right' });
                y += 4;
            };
            
            addField("Student:", student.name);
            addField("Roll No:", student.id);
            addField("Class:", student.class);
            addField("Month:", student.month);
            addField("Issue Date:", student.issueDate);
            addField("Due Date:", student.dueDate);
            
            y += 2;
            doc.line(startX, y, startX + 60, y);
            y += 5;

            doc.setFont("helvetica", "bold");
            doc.text("Description", startX, y);
            doc.text("Amount", startX + 60, y, { align: 'right' });
            y += 4;
            doc.setFont("helvetica", "normal");
            
            fees.forEach(fee => {
                doc.text(fee.title, startX, y);
                doc.text(fee.amount.toString(), startX + 60, y, { align: 'right' });
                y += 4;
            });
            
            y += 2;
            doc.line(startX, y, startX + 60, y);
            y += 5;
            
            doc.setFont("helvetica", "bold");
            doc.text("Total Payable:", startX, y);
            doc.text(total.toString(), startX + 60, y, { align: 'right' });
            
            y += 25;
            doc.line(startX + 30, y, startX + 60, y);
            doc.setFontSize(7);
            doc.text("Authorized Signature", startX + 45, y + 3, { align: 'center' });
        });

        doc.save(`FeeSlip-${student.id}.pdf`);
    };

    return (
       <div className="grid md:grid-cols-2 gap-8">
         <div className="space-y-6">
             <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800">
                <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">School Details</h3>
                <div className="space-y-3">
                   <input className={inputClasses} placeholder="School Name" value={school.name} onChange={e=>setSchool({...school, name: e.target.value})} />
                   <input className={inputClasses} placeholder="Address" value={school.address} onChange={e=>setSchool({...school, address: e.target.value})} />
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800">
                <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">Student Details</h3>
                <div className="space-y-3">
                   <input className={inputClasses} placeholder="Student Name" value={student.name} onChange={e=>setStudent({...student, name: e.target.value})} />
                   <input className={inputClasses} placeholder="Roll No / ID" value={student.id} onChange={e=>setStudent({...student, id: e.target.value})} />
                   <input className={inputClasses} placeholder="Class / Section" value={student.class} onChange={e=>setStudent({...student, class: e.target.value})} />
                   <input className={inputClasses} placeholder="Month" value={student.month} onChange={e=>setStudent({...student, month: e.target.value})} />
                   <div className="grid grid-cols-2 gap-2">
                       <div><label className="text-xs">Issue Date</label><input type="date" className={inputClasses} value={student.issueDate} onChange={e=>setStudent({...student, issueDate: e.target.value})} /></div>
                       <div><label className="text-xs">Due Date</label><input type="date" className={inputClasses} value={student.dueDate} onChange={e=>setStudent({...student, dueDate: e.target.value})} /></div>
                   </div>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 dark:text-slate-100">Fee Breakdown</h3>
                    <Button size="sm" variant="outline" onClick={addFee}><Plus className="w-3 h-3 mr-1"/> Add</Button>
                </div>
                <div className="space-y-3">
                   {fees.map(f => (
                       <div key={f.id} className="flex gap-2 items-center">
                           <input className={inputClasses + " p-2 text-sm flex-1"} placeholder="Title" value={f.title} onChange={e=>updateFee(f.id, 'title', e.target.value)} />
                           <input type="number" className={inputClasses + " p-2 text-sm w-24"} placeholder="Amount" value={f.amount} onChange={e=>updateFee(f.id, 'amount', Number(e.target.value))} />
                           <button onClick={()=>removeFee(f.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                       </div>
                   ))}
                   <div className="pt-3 border-t flex justify-between font-bold text-gray-800 dark:text-slate-200">
                       <span>Total</span>
                       <span>{total}</span>
                   </div>
                </div>
             </div>
         </div>

         <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-950/50 rounded-xl p-8 border border-dashed border-gray-300 dark:border-slate-800">
             <div className="bg-white p-6 shadow-xl w-64 text-[10px] leading-tight mb-8">
                 <div className="text-center font-bold text-sm mb-1">{school.name}</div>
                 <div className="text-center text-gray-500 mb-4">{school.address}</div>
                 <div className="text-center font-bold border-b pb-2 mb-2">FEE SLIP (Preview)</div>
                 
                 <div className="space-y-1 mb-4">
                     <div className="flex justify-between"><span>Name:</span><span className="font-medium">{student.name}</span></div>
                     <div className="flex justify-between"><span>Roll:</span><span className="font-medium">{student.id}</span></div>
                     <div className="flex justify-between"><span>Class:</span><span className="font-medium">{student.class}</span></div>
                 </div>

                 <div className="space-y-1 mb-2">
                     <div className="flex justify-between font-bold border-b pb-1"><span>Desc</span><span>Amount</span></div>
                     {fees.map(f => (
                         <div key={f.id} className="flex justify-between"><span>{f.title}</span><span>{f.amount}</span></div>
                     ))}
                 </div>
                 <div className="flex justify-between font-bold border-t pt-1"><span>Total</span><span>{total}</span></div>
             </div>
             
             <Button onClick={generatePdf} className="w-64 bg-blue-600 hover:bg-blue-700 text-white">
                 <Download className="w-4 h-4 mr-2" /> Download 3-Copy PDF
             </Button>
             <p className="text-xs text-gray-500 mt-4 text-center max-w-xs">Generates a standard A4 page with Student, Office, and Bank copies.</p>
         </div>
       </div>
    );
};