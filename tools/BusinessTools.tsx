import React, { useState, useEffect, useRef } from 'react';
import { Button, TextArea } from '../components/UI';
import { Plus, Trash2, Download, FileText, Save, Upload, RotateCcw, Settings, Hash, DollarSign, FolderOpen, Truck } from 'lucide-react';
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
}

interface ChallanItem {
  id: string;
  code: string;
  desc: string;
  unit: string;
  qty: number;
  remarks: string;
}

// ==========================================
// 1. INVOICE GENERATOR (Existing)
// ==========================================
export const InvoiceGenerator: React.FC = () => {
  // --- State ---
  // Configuration
  const [currencySymbol, setCurrencySymbol] = useState(''); // Default empty to match screenshot usually, but user can add '$'
  const [taxRate, setTaxRate] = useState(0);
  const [stampImage, setStampImage] = useState<string | null>(null);

  // Header Details (Right Side)
  const [header, setHeader] = useState({
    title: 'INVOICE',
    number: '121054',
    date: new Date().toISOString().split('T')[0],
    ntn: '3379147-3',
    forLabel: 'Office Material',
    poNumber: 'QICT.PO.25.18522'
  });
  
  // Sender Details (Top Left)
  const [sender, setSender] = useState({
    company: 'H & H Emporium',
    person: 'Tayyab Memon',
    address1: 'Al Khayam Arcade Nursery',
    address2: 'Karachi, Pakistan',
    phone: '03452430044'
  });

  // Recipient Details (Below Sender)
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
      rate: 86500 
    }
  ]);

  // --- Calculations ---
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  // --- Helpers ---
  const formatNumber = (num: number) => {
    // If currency symbol exists, prepend it, otherwise just number formatted
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

  // --- Persistence ---
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
      } catch (e) {
        alert('Failed to load saved data.');
      }
    } else {
      alert('No saved draft found.');
    }
  };

  // --- Auto-Increment Logic ---
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

  // --- Logic ---
  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), code: '', desc: '', qty: 1, rate: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, val: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  // --- PDF Generation ---
  const downloadPdf = () => {
    const doc = new jsPDF();
    const rightX = 195; // Right alignment anchor
    
    // 1. Right Header Section (Specific Format)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Blue
    doc.text(header.title, rightX, 20, { align: 'right' });

    doc.setFontSize(10);
    
    let yPos = 30;
    
    // Custom helper to match the screenshot's specific coloring per line
    const addHeaderLine = (label: string, val: string, isBlueLabel = false, isBlueVal = false) => {
      if(!val) return;
      const valWidth = doc.getTextWidth(` ${val}`);
      
      doc.setFont("helvetica", "bold");
      if(isBlueLabel) doc.setTextColor(59, 130, 246); // Blue
      else doc.setTextColor(0); // Black

      // Draw label
      doc.text(label, rightX - valWidth, yPos, { align: 'right' });
      
      // Draw value
      if(isBlueVal) doc.setTextColor(59, 130, 246);
      else doc.setTextColor(80); // Dark Gray
      
      doc.setFont("helvetica", "normal");
      doc.text(` ${val}`, rightX, yPos, { align: 'right' });
      yPos += 6;
    };

    addHeaderLine("INVOICE", `#${header.number}`, true, false);
    addHeaderLine("DATE", header.date, true, false);
    addHeaderLine("NTN", header.ntn, false, false);
    
    // FOR label is blue, value is black
    if(header.forLabel) {
       doc.setFont("helvetica", "bold");
       doc.setTextColor(59, 130, 246);
       doc.text("FOR", rightX - doc.getTextWidth(` ${header.forLabel}`), yPos, { align: 'right' });
       doc.setTextColor(0);
       doc.text(` ${header.forLabel}`, rightX, yPos, { align: 'right' });
       yPos += 6;
    }

    addHeaderLine("P.O.#", header.poNumber, true, true);

    // 2. Sender Info (Left)
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

    // 3. Recipient Info
    if(recipient.header) {
      doc.setFont("helvetica", "normal");
      doc.text(recipient.header, 14, leftY); leftY += 5;
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(recipient.company, 14, leftY); 
    // Underline
    const textWidth = doc.getTextWidth(recipient.company);
    doc.line(14, leftY + 1, 14 + textWidth, leftY + 1);
    leftY += 5;

    doc.setFont("helvetica", "normal");
    const splitAddress = doc.splitTextToSize(recipient.address1, 100);
    doc.text(splitAddress, 14, leftY);
    leftY += (splitAddress.length * 5);
    doc.text(recipient.address2, 14, leftY); leftY += 5;
    doc.text(recipient.contact, 14, leftY);

    // 4. Table (Using AutoTable but styled to look like the image)
    const tableStartY = Math.max(leftY + 10, yPos + 10);
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['S. No', 'Item Code', 'Description', 'Qty', 'Unit Price', 'Amount', 'Total Amount']],
      body: items.map((item, index) => [
        index + 1,
        item.code,
        item.desc,
        item.qty,
        formatNumber(item.rate),
        formatNumber(item.qty * item.rate),
        formatNumber(item.qty * item.rate)
      ]),
      theme: 'plain', // Clean look
      styles: { fontSize: 9, cellPadding: 3, textColor: 0, valign: 'top' },
      headStyles: { 
        fillColor: false, 
        textColor: [59, 130, 246], // Blue Headers
        fontStyle: 'bold' 
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // S.No
        1: { cellWidth: 25, fontStyle: 'bold' }, // Code
        2: { cellWidth: 'auto' }, // Desc (Flexible width)
        3: { cellWidth: 15, halign: 'center' }, // Qty
        4: { cellWidth: 25, halign: 'right' }, // Price
        5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }, // Amount
        6: { cellWidth: 25, halign: 'right' } // Total
      },
      didDrawPage: (data) => {
          // Draw blue lines for header
          const tableY = data.settings.startY;
          doc.setDrawColor(200, 220, 255);
          doc.line(14, tableY, 195, tableY); // Top line
          doc.line(14, tableY + 8, 195, tableY + 8); // Bottom line of header
      }
    });

    // 5. Totals & Tax (Added feature in specific format)
    // FIX: Safely access lastAutoTable
    const tableEnd = (doc as any).lastAutoTable?.finalY || tableStartY + 20;
    let finalY = tableEnd + 10;

    // We align these to the right, matching the 'Total Amount' column approximately
    const startTotalX = 140;
    const endTotalX = 195;
    
    // Draw separator
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
        doc.setTextColor(59, 130, 246); // Blue Total
        addTotalLine("Total:", formatNumber(grandTotal), true);
    }

    // 6. Signature / Stamp
    finalY += 10;
    const signX = 140;
    
    // Check page break
    if (finalY > doc.internal.pageSize.height - 40) {
      doc.addPage();
      finalY = 30;
    }

    if (stampImage) {
      try {
        doc.addImage(stampImage, 'PNG', signX, finalY, 40, 25);
      } catch (e) {}
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

  // --- Word Generation ---
  const downloadDocx = () => {
    const doc = new docx.Document({
      sections: [{
        children: [
           // Header Right
           new docx.Paragraph({ children: [new docx.TextRun({ text: header.title, bold: true, size: 48, color: "3B82F6" })], alignment: docx.AlignmentType.RIGHT }),
           new docx.Paragraph({ children: [new docx.TextRun({ text: "INVOICE ", bold: true, color: "3B82F6" }), new docx.TextRun({ text: `#${header.number}` })], alignment: docx.AlignmentType.RIGHT }),
           new docx.Paragraph({ children: [new docx.TextRun({ text: "DATE ", bold: true, color: "3B82F6" }), new docx.TextRun({ text: header.date })], alignment: docx.AlignmentType.RIGHT }),
           new docx.Paragraph({ children: [new docx.TextRun({ text: `NTN ${header.ntn}` })], alignment: docx.AlignmentType.RIGHT }),
           new docx.Paragraph({ children: [new docx.TextRun({ text: "FOR ", bold: true, color: "3B82F6" }), new docx.TextRun({ text: header.forLabel })], alignment: docx.AlignmentType.RIGHT }),
           new docx.Paragraph({ children: [new docx.TextRun({ text: "P.O.#", bold: true, color: "3B82F6" }), new docx.TextRun({ text: header.poNumber, color: "3B82F6" })], alignment: docx.AlignmentType.RIGHT }),
           
           new docx.Paragraph({ text: "" }),

           // Sender
           new docx.Paragraph({ children: [new docx.TextRun({ text: sender.company, bold: true, size: 28, color: "555555" })] }),
           new docx.Paragraph({ text: sender.person }),
           new docx.Paragraph({ text: sender.address1 }),
           new docx.Paragraph({ text: sender.address2 }),
           new docx.Paragraph({ text: `Phone ${sender.phone}` }),
           
           new docx.Paragraph({ text: "" }),

           // Recipient
           new docx.Paragraph({ text: recipient.header }),
           new docx.Paragraph({ children: [new docx.TextRun({ text: recipient.company, bold: true, underline: {} })] }),
           new docx.Paragraph({ text: recipient.address1 }),
           new docx.Paragraph({ text: recipient.address2 }),
           new docx.Paragraph({ text: recipient.contact }),

           new docx.Paragraph({ text: "" }),

           // Table
           new docx.Table({
              width: { size: 100, type: docx.WidthType.PERCENTAGE },
              rows: [
                 new docx.TableRow({
                    children: ['S. No', 'Item Code', 'Description', 'Qty', 'Unit Price', 'Amount', 'Total Amount'].map(t => 
                       new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: t, bold: true, color: "3B82F6" })] })] })
                    )
                 }),
                 ...items.map((item, i) => new docx.TableRow({
                    children: [
                       (i+1).toString(), item.code, item.desc, item.qty.toString(), 
                       formatNumber(item.rate), formatNumber(item.qty*item.rate), formatNumber(item.qty*item.rate)
                    ].map(t => new docx.TableCell({ children: [new docx.Paragraph(t)] }))
                 })),
                 // Totals (Mimicking the visual spacing)
                 new docx.TableRow({
                    children: [
                        new docx.TableCell({ columnSpan: 5, children: [] }), // Spacer
                        new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Subtotal", bold: true })] })] }),
                        new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun(formatNumber(subtotal))] })] }),
                    ]
                 }),
                 new docx.TableRow({
                    children: [
                        new docx.TableCell({ columnSpan: 5, children: [] }), // Spacer
                        new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: `Tax (${taxRate}%)` })] })] }),
                        new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun(formatNumber(taxAmount))] })] }),
                    ]
                 }),
                 new docx.TableRow({
                    children: [
                        new docx.TableCell({ columnSpan: 5, children: [] }), // Spacer
                        new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Total", bold: true, color: "3B82F6", size: 24 })] })] }),
                        new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: formatNumber(grandTotal), bold: true, color: "3B82F6", size: 24 })] })] }),
                    ]
                 })
              ]
           })
        ]
      }]
    });

    docx.Packer.toBlob(doc).then(blob => {
      FileSaver.saveAs(blob, `Invoice-${header.number}.docx`);
    });
  };

  return (
    <div className="grid xl:grid-cols-5 gap-8">
      {/* --- Controls (Left) --- */}
      <div className="xl:col-span-2 space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto pr-2 custom-scrollbar">
         {/* Top Actions */}
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm sticky top-0 z-20 flex flex-wrap gap-2">
            <Button onClick={saveInvoiceData} variant="outline" size="sm" className="flex-1" title="Save Draft">
               <Save className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button onClick={loadInvoiceData} variant="outline" size="sm" className="flex-1" title="Load Draft">
               <FolderOpen className="w-4 h-4 mr-1" /> Load
            </Button>
            <Button onClick={downloadPdf} className="flex-1 bg-red-600 hover:bg-red-700 text-xs">
               <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Button onClick={downloadDocx} className="flex-1 bg-blue-700 hover:bg-blue-800 text-xs">
               <FileText className="w-4 h-4 mr-1" /> DOCX
            </Button>
         </div>

         {/* Configuration Panel */}
         <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 block">Currency</label>
                  <div className="flex items-center bg-white dark:bg-slate-900 rounded border border-blue-200 dark:border-blue-700">
                    <span className="px-2 text-gray-500 text-sm"><DollarSign className="w-3 h-3"/></span>
                    <input className="w-full p-1.5 text-sm outline-none rounded bg-transparent dark:text-white" value={currencySymbol} onChange={e=>setCurrencySymbol(e.target.value)} placeholder="e.g. $" />
                  </div>
               </div>
               <div>
                  <label className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 block">Tax Rate %</label>
                  <input type="number" className="w-full p-1.5 border border-blue-200 dark:border-blue-700 rounded text-sm bg-white dark:bg-slate-900 dark:text-white" value={taxRate} onChange={e=>setTaxRate(Number(e.target.value))} />
               </div>
            </div>
         </div>

         {/* Invoice Details */}
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-3 border-b dark:border-slate-700 pb-2 flex items-center justify-between">
              Invoice Info
              <Button size="sm" variant="outline" onClick={generateNextNumber} title="Generate Next Number">
                <Hash className="w-3 h-3 mr-1 inline" /> Next #
              </Button>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-gray-500 dark:text-slate-400">
               <div><label className="text-xs">Invoice #</label><input className="w-full p-1.5 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={header.number} onChange={e=>setHeader({...header, number: e.target.value})} /></div>
               <div><label className="text-xs">Date</label><input type="date" className="w-full p-1.5 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={header.date} onChange={e=>setHeader({...header, date: e.target.value})} /></div>
               <div><label className="text-xs">NTN / Tax ID</label><input className="w-full p-1.5 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={header.ntn} onChange={e=>setHeader({...header, ntn: e.target.value})} /></div>
               <div><label className="text-xs">P.O. #</label><input className="w-full p-1.5 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={header.poNumber} onChange={e=>setHeader({...header, poNumber: e.target.value})} /></div>
               <div className="col-span-2"><label className="text-xs">FOR (Project/Ref)</label><input className="w-full p-1.5 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={header.forLabel} onChange={e=>setHeader({...header, forLabel: e.target.value})} /></div>
            </div>
         </div>

         {/* Sender Details */}
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-2 border-b dark:border-slate-700 pb-2">Sender (From)</h3>
            <div className="space-y-2">
               <input className="w-full p-1 border rounded text-sm font-bold bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Company Name" value={sender.company} onChange={e=>setSender({...sender, company: e.target.value})} />
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Person Name" value={sender.person} onChange={e=>setSender({...sender, person: e.target.value})} />
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Address L1" value={sender.address1} onChange={e=>setSender({...sender, address1: e.target.value})} />
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Address L2" value={sender.address2} onChange={e=>setSender({...sender, address2: e.target.value})} />
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Phone" value={sender.phone} onChange={e=>setSender({...sender, phone: e.target.value})} />
            </div>
         </div>

         {/* Recipient Details */}
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-2 border-b dark:border-slate-700 pb-2">Recipient (Bill To)</h3>
            <div className="space-y-2">
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Header (e.g. DP World)" value={recipient.header} onChange={e=>setRecipient({...recipient, header: e.target.value})} />
               <input className="w-full p-1 border rounded text-sm font-bold bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Company Name" value={recipient.company} onChange={e=>setRecipient({...recipient, company: e.target.value})} />
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Address L1" value={recipient.address1} onChange={e=>setRecipient({...recipient, address1: e.target.value})} />
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Address L2" value={recipient.address2} onChange={e=>setRecipient({...recipient, address2: e.target.value})} />
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Contact/UAN" value={recipient.contact} onChange={e=>setRecipient({...recipient, contact: e.target.value})} />
            </div>
         </div>

         {/* Items */}
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-2 border-b dark:border-slate-700 pb-2">Items</h3>
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={item.id} className="p-3 bg-gray-50 dark:bg-slate-900 rounded border dark:border-slate-700 text-sm relative group">
                   <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                   <div className="mb-1 font-bold text-gray-400 dark:text-slate-500">Item {i + 1}</div>
                   <div className="grid grid-cols-2 gap-2 mb-2">
                      <input className="p-1 border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" placeholder="Code" value={item.code} onChange={e=>updateItem(item.id, 'code', e.target.value)} />
                      <input className="p-1 border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" type="number" placeholder="Qty" value={item.qty} onChange={e=>updateItem(item.id, 'qty', Number(e.target.value))} />
                   </div>
                   <TextArea className="w-full p-1 border rounded mb-2 font-sans bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" rows={3} placeholder="Description (can be long)" value={item.desc} onChange={e=>updateItem(item.id, 'desc', e.target.value)} />
                   <div className="flex justify-between items-center">
                     <input className="w-32 p-1 border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" type="number" placeholder="Unit Price" value={item.rate} onChange={e=>updateItem(item.id, 'rate', Number(e.target.value))} />
                     <span className="font-bold text-blue-600 dark:text-blue-400">{formatNumber(item.qty * item.rate)}</span>
                   </div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full" onClick={addItem}>+ Add Item</Button>
            </div>
         </div>

         {/* Stamp Upload */}
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-2 border-b dark:border-slate-700 pb-2">Stamp / Signature</h3>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 px-3 py-2 rounded text-sm flex items-center gap-2 text-gray-600 dark:text-slate-300">
                 <Upload className="w-4 h-4"/> Upload Image
                 <input type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
              </label>
              {stampImage && <Button size="sm" variant="outline" onClick={() => setStampImage(null)}><Trash2 className="w-4 h-4"/></Button>}
            </div>
            {stampImage && <img src={stampImage} alt="Stamp" className="mt-2 h-16 object-contain border rounded bg-white" />}
         </div>
      </div>

      {/* --- Live Preview (Right - Fixed Format) --- */}
      <div className="xl:col-span-3 bg-gray-500 dark:bg-slate-950 p-4 lg:p-8 rounded-xl overflow-x-auto flex justify-center items-start">
         <div className="bg-white shadow-2xl min-h-[800px] w-[210mm] p-[10mm] relative text-gray-900 leading-tight">
            
            {/* Header Right */}
            <div className="absolute top-[10mm] right-[10mm] text-right">
               <h1 className="text-4xl font-bold text-blue-500 mb-2">{header.title}</h1>
               <div className="space-y-1 text-sm">
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
               <div className="text-sm text-gray-800 space-y-0.5">
                  <p>{sender.person}</p>
                  <p>{sender.address1}</p>
                  <p>{sender.address2}</p>
                  <p className="mt-1">Phone {sender.phone}</p>
               </div>
            </div>

            {/* Recipient Left */}
            <div className="mb-10 max-w-[60%]">
               {recipient.header && <p className="text-sm font-normal mb-0.5">{recipient.header}</p>}
               <h3 className="text-sm font-bold underline decoration-2 decoration-gray-800 mb-1">{recipient.company}</h3>
               <div className="text-sm text-gray-800 space-y-0.5">
                  <p>{recipient.address1}</p>
                  <p>{recipient.address2}</p>
                  <p>{recipient.contact}</p>
               </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-sm mb-6">
               <thead>
                  <tr className="border-t border-b border-blue-200">
                     <th className="py-2 text-blue-500 text-center w-10">S. No</th>
                     <th className="py-2 text-blue-500 text-left w-24">Item Code</th>
                     <th className="py-2 text-blue-500 text-left">Description</th>
                     <th className="py-2 text-blue-500 text-center w-16">Qty</th>
                     <th className="py-2 text-blue-500 text-right w-28 whitespace-nowrap">Unit Price</th>
                     <th className="py-2 text-blue-500 text-right w-28 font-bold whitespace-nowrap">Amount</th>
                     <th className="py-2 text-blue-500 text-right w-32 whitespace-nowrap">Total Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {items.map((item, i) => (
                     <tr key={item.id} className="align-top">
                        <td className="py-3 text-center">{i + 1}</td>
                        <td className="py-3 font-bold text-gray-700">{item.code}</td>
                        <td className="py-3 pr-4 text-gray-600 leading-snug whitespace-pre-wrap">{item.desc}</td>
                        <td className="py-3 text-center">{item.qty}</td>
                        <td className="py-3 text-right">{formatNumber(item.rate)}</td>
                        <td className="py-3 text-right font-bold">{formatNumber(item.qty * item.rate)}</td>
                        <td className="py-3 text-right">{formatNumber(item.qty * item.rate)}</td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {/* Totals Section */}
            <div className="flex justify-end mb-12 border-t pt-4">
               <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between">
                     <span className="text-gray-600">Subtotal</span>
                     <span className="text-gray-800 text-right">{formatNumber(subtotal)}</span>
                  </div>
                  {taxRate > 0 && (
                     <div className="flex justify-between">
                        <span className="text-gray-600">Tax ({taxRate}%)</span>
                        <span className="text-gray-800 text-right">{formatNumber(taxAmount)}</span>
                     </div>
                  )}
                  <div className="flex justify-between font-bold text-lg text-blue-600 mt-2">
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
               <div className="border-t border-gray-400 pt-2 text-gray-500 text-sm">Stamp & Sign</div>
            </div>

         </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. DELIVERY CHALLAN GENERATOR
// ==========================================
export const DeliveryChallanGenerator: React.FC = () => {
  const [header, setHeader] = useState({
    title: 'DELIVERY CHALLAN',
    number: 'DC-001',
    date: new Date().toISOString().split('T')[0],
    poNumber: '',
    vehicleNumber: '',
    reference: ''
  });

  const [sender, setSender] = useState({
    company: 'Your Company',
    address1: 'Street Address',
    address2: 'City, State, Zip',
    phone: 'Phone Number'
  });

  const [recipient, setRecipient] = useState({
    company: 'Client Company',
    address1: 'Street Address',
    address2: 'City, State, Zip',
    contact: 'Contact Person'
  });

  const [items, setItems] = useState<ChallanItem[]>([
    { id: '1', code: 'ITM01', desc: 'Item 1', unit: 'pcs', qty: 10, remarks: '' }
  ]);
  
  const [stampImage, setStampImage] = useState<string | null>(null);

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if(ev.target?.result) setStampImage(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const addItem = () => setItems([...items, { id: Date.now().toString(), code: '', desc: '', unit: '', qty: 1, remarks: '' }]);
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof ChallanItem, val: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  };
  const generateNextNumber = () => {
    const match = header.number.match(/^(.*?)(\d+)$/);
    if(match) {
       setHeader({ ...header, number: `${match[1]}${(parseInt(match[2]) + 1).toString().padStart(match[2].length, '0')}` });
    } else {
       setHeader({ ...header, number: `${header.number}-1` });
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    const rightX = 195;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    doc.text(header.title, rightX, 20, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(0);
    let yPos = 30;

    const addLine = (label: string, val: string) => {
       if(!val) return;
       doc.setFont("helvetica", "bold");
       doc.text(label, rightX - doc.getTextWidth(` ${val}`), yPos, { align: 'right' });
       doc.setFont("helvetica", "normal");
       doc.text(` ${val}`, rightX, yPos, { align: 'right' });
       yPos += 5;
    };

    addLine("Challan #", header.number);
    addLine("Date", header.date);
    addLine("Vehicle #", header.vehicleNumber);
    addLine("Ref / PO #", header.poNumber);

    let leftY = 40;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(sender.company, 14, leftY); leftY += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(sender.address1, 14, leftY); leftY += 5;
    doc.text(sender.address2, 14, leftY); leftY += 5;
    doc.text(sender.phone, 14, leftY); leftY += 10;

    doc.setFont("helvetica", "bold");
    doc.text("To:", 14, leftY); leftY += 5;
    doc.text(recipient.company, 14, leftY); leftY += 5;
    doc.setFont("helvetica", "normal");
    doc.text(recipient.address1, 14, leftY); leftY += 5;
    doc.text(recipient.address2, 14, leftY); leftY += 5;
    doc.text(recipient.contact, 14, leftY);

    const tableStartY = Math.max(leftY + 10, yPos + 10);
    autoTable(doc, {
      startY: tableStartY,
      head: [['S.No', 'Code', 'Description', 'Unit', 'Qty', 'Remarks']],
      body: items.map((item, i) => [i+1, item.code, item.desc, item.unit, item.qty, item.remarks]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    
    // Signatures
    doc.setFont("helvetica", "bold");
    doc.text("Received By:", 14, finalY + 40);
    doc.text("Authorized Signatory:", 140, finalY + 40);
    
    if(stampImage) {
        try { doc.addImage(stampImage, 'PNG', 140, finalY + 10, 40, 25); } catch {}
    }

    doc.save(`Challan-${header.number}.pdf`);
  };

  const downloadDocx = () => {
    const doc = new docx.Document({
      sections: [{
        children: [
           new docx.Paragraph({ children: [new docx.TextRun({ text: header.title, bold: true, size: 40, color: "3B82F6" })], alignment: docx.AlignmentType.RIGHT }),
           new docx.Paragraph({ children: [new docx.TextRun({ text: `Challan #: ${header.number}`, bold: true })], alignment: docx.AlignmentType.RIGHT }),
           new docx.Paragraph({ children: [new docx.TextRun({ text: `Date: ${header.date}` })], alignment: docx.AlignmentType.RIGHT }),
           
           new docx.Paragraph({ children: [new docx.TextRun({ text: sender.company, bold: true, size: 28 })] }),
           new docx.Paragraph({ text: `${sender.address1}, ${sender.address2}` }),
           new docx.Paragraph({ text: sender.phone }),
           
           new docx.Paragraph({ text: "" }),
           new docx.Paragraph({ children: [new docx.TextRun({ text: "Delivered To:", bold: true })] }),
           new docx.Paragraph({ children: [new docx.TextRun({ text: recipient.company, bold: true })] }),
           new docx.Paragraph({ text: `${recipient.address1}, ${recipient.address2}` }),
           
           new docx.Paragraph({ text: "" }),
           new docx.Table({
              width: { size: 100, type: docx.WidthType.PERCENTAGE },
              rows: [
                 new docx.TableRow({ children: ['S.No', 'Code', 'Description', 'Unit', 'Qty', 'Remarks'].map(t => new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: t, bold: true })] })] })) }),
                 ...items.map((item, i) => new docx.TableRow({
                    children: [(i+1).toString(), item.code, item.desc, item.unit, item.qty.toString(), item.remarks].map(t => new docx.TableCell({ children: [new docx.Paragraph(t)] }))
                 }))
              ]
           }),
           
           new docx.Paragraph({ text: "" }),
           new docx.Paragraph({ text: "" }),
           new docx.Paragraph({ children: [
               new docx.TextRun({ text: "Received By: ___________________" }),
               new docx.TextRun({ text: "\t\t\t\tAuthorized Signatory: ___________________" })
           ] })
        ]
      }]
    });
    docx.Packer.toBlob(doc).then(blob => FileSaver.saveAs(blob, `Challan-${header.number}.docx`));
  };

  return (
    <div className="grid xl:grid-cols-5 gap-8">
      {/* Controls */}
      <div className="xl:col-span-2 space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto pr-2 custom-scrollbar">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm flex flex-wrap gap-2 sticky top-0 z-20">
             <Button onClick={downloadPdf} className="flex-1 bg-red-600 hover:bg-red-700 text-xs"><Download className="w-4 h-4 mr-1" /> PDF</Button>
             <Button onClick={downloadDocx} className="flex-1 bg-blue-700 hover:bg-blue-800 text-xs"><FileText className="w-4 h-4 mr-1" /> DOCX</Button>
         </div>
         
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
             <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-3 border-b dark:border-slate-700 pb-2 flex justify-between">Challan Details <Button size="sm" variant="outline" onClick={generateNextNumber}><Hash className="w-3 h-3 mr-1" /> Next</Button></h3>
             <div className="grid grid-cols-2 gap-3 text-gray-500 dark:text-slate-400">
               <div><label className="text-xs">Challan #</label><input className="w-full p-1.5 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={header.number} onChange={e=>setHeader({...header, number: e.target.value})} /></div>
               <div><label className="text-xs">Date</label><input type="date" className="w-full p-1.5 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={header.date} onChange={e=>setHeader({...header, date: e.target.value})} /></div>
               <div><label className="text-xs">Vehicle #</label><input className="w-full p-1.5 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={header.vehicleNumber} onChange={e=>setHeader({...header, vehicleNumber: e.target.value})} /></div>
               <div><label className="text-xs">Ref / PO #</label><input className="w-full p-1.5 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={header.poNumber} onChange={e=>setHeader({...header, poNumber: e.target.value})} /></div>
             </div>
         </div>

         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-2 border-b dark:border-slate-700 pb-2">Sender</h3>
            <div className="space-y-2">
               <input className="w-full p-1 border rounded text-sm font-bold bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={sender.company} onChange={e=>setSender({...sender, company: e.target.value})} placeholder="Company"/>
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={sender.address1} onChange={e=>setSender({...sender, address1: e.target.value})} placeholder="Address"/>
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={sender.phone} onChange={e=>setSender({...sender, phone: e.target.value})} placeholder="Phone"/>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-2 border-b dark:border-slate-700 pb-2">Recipient</h3>
            <div className="space-y-2">
               <input className="w-full p-1 border rounded text-sm font-bold bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={recipient.company} onChange={e=>setRecipient({...recipient, company: e.target.value})} placeholder="Company"/>
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={recipient.address1} onChange={e=>setRecipient({...recipient, address1: e.target.value})} placeholder="Address"/>
               <input className="w-full p-1 border rounded text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={recipient.contact} onChange={e=>setRecipient({...recipient, contact: e.target.value})} placeholder="Contact"/>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
             <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-2 border-b dark:border-slate-700 pb-2">Items</h3>
             <div className="space-y-3">
               {items.map((item, i) => (
                  <div key={item.id} className="p-3 bg-gray-50 dark:bg-slate-900 rounded border dark:border-slate-700 text-sm relative">
                     <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-red-500"><Trash2 className="w-4 h-4"/></button>
                     <div className="font-bold text-gray-400 dark:text-slate-500 mb-1">Item {i+1}</div>
                     <div className="grid grid-cols-3 gap-2 mb-2">
                        <input className="p-1 border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" placeholder="Code" value={item.code} onChange={e=>updateItem(item.id, 'code', e.target.value)} />
                        <input className="p-1 border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" placeholder="Unit" value={item.unit} onChange={e=>updateItem(item.id, 'unit', e.target.value)} />
                        <input className="p-1 border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" type="number" placeholder="Qty" value={item.qty} onChange={e=>updateItem(item.id, 'qty', Number(e.target.value))} />
                     </div>
                     <TextArea className="w-full p-1 border rounded mb-2 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" rows={2} placeholder="Description" value={item.desc} onChange={e=>updateItem(item.id, 'desc', e.target.value)} />
                     <input className="w-full p-1 border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" placeholder="Remarks" value={item.remarks} onChange={e=>updateItem(item.id, 'remarks', e.target.value)} />
                  </div>
               ))}
               <Button size="sm" variant="outline" className="w-full" onClick={addItem}>+ Add Item</Button>
             </div>
         </div>

         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
             <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-slate-300">
                <Upload className="w-4 h-4"/> Upload Stamp/Signature
                <input type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
             </label>
             {stampImage && <img src={stampImage} className="mt-2 h-16 border bg-white" />}
         </div>
      </div>

      {/* Preview */}
      <div className="xl:col-span-3 bg-gray-500 dark:bg-slate-950 p-8 rounded-xl overflow-x-auto flex justify-center items-start">
         <div className="bg-white shadow-2xl min-h-[800px] w-[210mm] p-[10mm] relative text-gray-900">
             <div className="text-right mb-8">
                <h1 className="text-3xl font-bold text-blue-600 uppercase mb-2">{header.title}</h1>
                <div className="text-sm font-bold">#{header.number}</div>
                <div className="text-sm text-gray-500">{header.date}</div>
             </div>
             
             <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                   <h3 className="font-bold text-gray-500 text-xs uppercase mb-1">From</h3>
                   <div className="font-bold text-lg">{sender.company}</div>
                   <div className="text-sm text-gray-600">{sender.address1}</div>
                   <div className="text-sm text-gray-600">{sender.phone}</div>
                </div>
                <div>
                   <h3 className="font-bold text-gray-500 text-xs uppercase mb-1">To</h3>
                   <div className="font-bold text-lg">{recipient.company}</div>
                   <div className="text-sm text-gray-600">{recipient.address1}</div>
                   <div className="text-sm text-gray-600">{recipient.contact}</div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded">
                <div><span className="font-bold text-xs text-gray-500 block">Vehicle No</span>{header.vehicleNumber || '-'}</div>
                <div><span className="font-bold text-xs text-gray-500 block">Reference / PO</span>{header.poNumber || '-'}</div>
             </div>

             <table className="w-full text-sm mb-12">
                <thead>
                   <tr className="border-b-2 border-blue-100 text-left">
                      <th className="py-2 w-10">S.No</th>
                      <th className="py-2 w-24">Code</th>
                      <th className="py-2">Description</th>
                      <th className="py-2 w-16">Unit</th>
                      <th className="py-2 w-16 text-center">Qty</th>
                      <th className="py-2 w-32">Remarks</th>
                   </tr>
                </thead>
                <tbody className="divide-y">
                   {items.map((item, i) => (
                      <tr key={item.id}>
                         <td className="py-3 text-gray-500">{i+1}</td>
                         <td className="py-3 font-bold">{item.code}</td>
                         <td className="py-3">{item.desc}</td>
                         <td className="py-3 text-gray-600">{item.unit}</td>
                         <td className="py-3 text-center font-bold">{item.qty}</td>
                         <td className="py-3 text-gray-500 italic">{item.remarks}</td>
                      </tr>
                   ))}
                </tbody>
             </table>

             <div className="flex justify-between mt-auto pt-12 border-t">
                 <div className="text-center">
                    <div className="h-16 mb-2"></div>
                    <div className="border-t border-gray-400 w-40 pt-2 text-sm font-bold">Received By</div>
                 </div>
                 <div className="text-center">
                    <div className="h-16 mb-2 flex justify-center">
                       {stampImage && <img src={stampImage} className="h-full object-contain" />}
                    </div>
                    <div className="border-t border-gray-400 w-40 pt-2 text-sm font-bold">Authorized Signatory</div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};