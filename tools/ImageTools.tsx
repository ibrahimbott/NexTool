import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/UI';
import { Upload, Download, Image as ImageIcon, RotateCw, Wand2, Crop, FileText, Pipette, Copy, IdCard, Maximize } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

// --- Image Converter & Compressor ---
export const ImageConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = (format: 'image/png' | 'image/jpeg' | 'image/webp') => {
    if (!preview || !canvasRef.current) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'; // Fill white for transparency handling in JPG
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Use quality state for compression
        const dataUrl = canvas.toDataURL(format, quality);
        
        const link = document.createElement('a');
        link.download = `converted-image.${format.split('/')[1]}`;
        link.href = dataUrl;
        link.click();
      }
    };
    img.src = preview;
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 text-center bg-gray-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:border-blue-400 transition-colors">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className="hidden" 
          id="img-upload" 
        />
        <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center">
          <Upload className="w-12 h-12 text-gray-400 dark:text-slate-500 mb-4" />
          <span className="text-lg font-medium text-gray-700 dark:text-slate-200">
            {selectedFile ? selectedFile.name : "Click to upload an image"}
          </span>
          <span className="text-sm text-gray-500 dark:text-slate-400 mt-2">Supports JPG, PNG, WEBP, GIF</span>
        </label>
      </div>

      {preview && (
        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm flex flex-col items-center">
             <img src={preview} alt="Preview" className="max-h-64 object-contain mb-4" />
             <canvas ref={canvasRef} className="hidden" />
             
             <div className="w-full max-w-md space-y-2 text-gray-700 dark:text-slate-300">
                <div className="flex justify-between text-sm font-medium">
                  <label>Compression Quality (for JPG/WEBP)</label>
                  <span>{Math.round(quality * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.1" 
                  value={quality} 
                  onChange={(e) => setQuality(Number(e.target.value))} 
                  className="w-full" 
                />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Button onClick={() => downloadImage('image/jpeg')}>Download as JPG</Button>
             <Button onClick={() => downloadImage('image/png')}>Download as PNG</Button>
             <Button onClick={() => downloadImage('image/webp')}>Download as WebP</Button>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Image to PDF ---
export const ImageToPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const generatePdf = async () => {
    if(!file) return;
    try {
      const pdfDoc = await PDFDocument.create();
      const imageBytes = await file.arrayBuffer();
      
      let image;
      if (file.type === 'image/jpeg') {
        image = await pdfDoc.embedJpg(imageBytes);
      } else if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        alert("Only JPG and PNG supported directly. Please convert to one of those formats first.");
        return;
      }
      
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = file.name.replace(/\.[^/.]+$/, "") + ".pdf";
      link.click();
    } catch(e) {
      alert("Error generating PDF. Ensure image is valid.");
    }
  };

  return (
    <div className="space-y-6">
      <input type="file" accept="image/jpeg, image/png" onChange={handleFile} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:text-slate-400"/>
      {preview && (
        <div className="space-y-4 text-center">
          <img src={preview} className="max-h-64 mx-auto rounded shadow" />
          <Button onClick={generatePdf}><FileText className="w-4 h-4 mr-2 inline" /> Convert to PDF</Button>
        </div>
      )}
    </div>
  );
};

// --- Image Color Picker ---
export const ImageColorPicker: React.FC = () => {
  const [file, setFile] = useState<string>('');
  const [color, setColor] = useState<{r:number, g:number, b:number} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files?.[0]) setFile(URL.createObjectURL(e.target.files[0]));
  };

  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    
    // Scale coordinates to match canvas actual size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
    setColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
  };

  useEffect(() => {
    if(file && canvasRef.current && imgRef.current) {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
      };
    }
  }, [file]);

  const hex = color ? `#${((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1).toUpperCase()}` : '';

  return (
    <div className="space-y-6">
       <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:text-slate-400"/>
       
       <div className="grid md:grid-cols-3 gap-6">
         <div className="md:col-span-2 overflow-auto bg-gray-100 dark:bg-slate-900 p-2 rounded relative border dark:border-slate-700">
           <img ref={imgRef} src={file} className="hidden" />
           {file && (
             <canvas 
               ref={canvasRef} 
               onClick={pickColor}
               className="cursor-crosshair max-w-full"
               style={{ maxHeight: '500px' }}
             />
           )}
           {!file && <div className="text-center py-20 text-gray-400 dark:text-slate-500">Upload image to pick colors</div>}
         </div>
         
         <div className="space-y-4">
           <div className="h-24 rounded-xl shadow border transition-colors flex items-center justify-center font-bold text-white text-shadow-sm" style={{ backgroundColor: hex || '#ccc' }}>
             {hex || 'Pick a color'}
           </div>
           {color && (
             <div className="space-y-2">
               <div>
                 <label className="text-xs font-bold text-gray-500 dark:text-slate-400">HEX</label>
                 <div className="flex gap-2">
                   <input className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" readOnly value={hex} />
                   <Button size="sm" onClick={() => navigator.clipboard.writeText(hex)}><Copy className="w-4 h-4" /></Button>
                 </div>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 dark:text-slate-400">RGB</label>
                 <div className="flex gap-2">
                   <input className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" readOnly value={`rgb(${color.r}, ${color.g}, ${color.b})`} />
                   <Button size="sm" onClick={() => navigator.clipboard.writeText(`rgb(${color.r}, ${color.g}, ${color.b})`)}><Copy className="w-4 h-4" /></Button>
                 </div>
               </div>
             </div>
           )}
           <div className="text-xs text-gray-400">Click anywhere on the image to sample the pixel color.</div>
         </div>
       </div>
    </div>
  );
};

// --- Image Resizer ---
export const ImageResizer: React.FC = () => {
   const [file, setFile] = useState<File|null>(null);
   const [preview, setPreview] = useState<string>('');
   const [width, setWidth] = useState(0);
   const [height, setHeight] = useState(0);
   const [ratio, setRatio] = useState(true);
   const [originalAspect, setOriginalAspect] = useState(0);
   const canvasRef = useRef<HTMLCanvasElement>(null);

   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
     if(e.target.files?.[0]) {
       const f = e.target.files[0];
       setFile(f);
       const url = URL.createObjectURL(f);
       setPreview(url);
       const img = new Image();
       img.onload = () => {
         setWidth(img.width);
         setHeight(img.height);
         setOriginalAspect(img.width / img.height);
       };
       img.src = url;
     }
   };

   const handleWidthChange = (w: number) => {
     setWidth(w);
     if(ratio) setHeight(Math.round(w / originalAspect));
   };

   const handleHeightChange = (h: number) => {
     setHeight(h);
     if(ratio) setWidth(Math.round(h * originalAspect));
   };

   const download = () => {
     const cvs = canvasRef.current;
     if(!cvs || !preview) return;
     const ctx = cvs.getContext('2d');
     const img = new Image();
     img.onload = () => {
       cvs.width = width;
       cvs.height = height;
       ctx?.drawImage(img, 0, 0, width, height);
       const link = document.createElement('a');
       link.download = `resized-${file?.name}`;
       link.href = cvs.toDataURL(file?.type);
       link.click();
     };
     img.src = preview;
   };

   return (
     <div className="space-y-6">
        <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:text-slate-400"/>
        
        {preview && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-100 dark:bg-slate-900 p-4 rounded flex items-center justify-center border dark:border-slate-700">
              <img src={preview} style={{ maxWidth: '100%', maxHeight: '300px' }} />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="space-y-4 text-gray-700 dark:text-slate-300">
               <div>
                 <label className="block text-sm font-bold mb-1">Width (px)</label>
                 <input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
               </div>
               <div>
                 <label className="block text-sm font-bold mb-1">Height (px)</label>
                 <input type="number" value={height} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
               </div>
               <label className="flex items-center gap-2 text-sm">
                 <input type="checkbox" checked={ratio} onChange={(e) => setRatio(e.target.checked)} />
                 Maintain Aspect Ratio
               </label>
               <Button onClick={download} className="w-full">Download Resized Image</Button>
            </div>
          </div>
        )}
     </div>
   );
};

// --- CSS Box Shadow Generator (Visual Tool) ---
export const BoxShadowGenerator: React.FC = () => {
  const [hOffset, setHOffset] = useState(10);
  const [vOffset, setVOffset] = useState(10);
  const [blur, setBlur] = useState(20);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(0.2);

  const shadowString = `${hOffset}px ${vOffset}px ${blur}px ${spread}px rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, ${opacity})`;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 text-gray-700 dark:text-slate-300">
        <h3 className="font-bold mb-4">Settings</h3>
        
        {[
          { l: 'Horizontal', v: hOffset, s: setHOffset, min: -50, max: 50 },
          { l: 'Vertical', v: vOffset, s: setVOffset, min: -50, max: 50 },
          { l: 'Blur', v: blur, s: setBlur, min: 0, max: 100 },
          { l: 'Spread', v: spread, s: setSpread, min: -50, max: 50 },
        ].map((c) => (
          <div key={c.l}>
            <div className="flex justify-between text-sm mb-1">
              <label>{c.l}</label>
              <span>{c.v}px</span>
            </div>
            <input type="range" min={c.min} max={c.max} value={c.v} onChange={(e) => c.s(Number(e.target.value))} className="w-full" />
          </div>
        ))}

        <div>
           <div className="flex justify-between text-sm mb-1">
              <label>Opacity</label>
              <span>{Math.round(opacity * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
        </div>
        
        <div className="flex items-center gap-4">
          <label className="text-sm">Shadow Color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6">
        <div 
          className="w-32 h-32 bg-white rounded-xl flex items-center justify-center font-bold text-gray-500 border border-gray-100"
          style={{ boxShadow: shadowString }}
        >
          Preview
        </div>
        
        <div className="w-full bg-gray-800 text-white p-4 rounded-lg font-mono text-xs overflow-x-auto relative group">
           <code>box-shadow: {shadowString};</code>
           <button 
             onClick={() => navigator.clipboard.writeText(`box-shadow: ${shadowString};`)}
             className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
           >
             Copy
           </button>
        </div>
      </div>
    </div>
  );
}

// --- Image Filters ---
export const ImageFilters: React.FC = () => {
   const [file, setFile] = useState<string>('');
   const [filter, setFilter] = useState('none');
   
   const filters = [
     { name: 'None', val: 'none' },
     { name: 'Grayscale', val: 'grayscale(100%)' },
     { name: 'Sepia', val: 'sepia(100%)' },
     { name: 'Invert', val: 'invert(100%)' },
     { name: 'Blur', val: 'blur(5px)' },
     { name: 'Brightness', val: 'brightness(150%)' },
     { name: 'Contrast', val: 'contrast(150%)' },
   ];

   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
     if(e.target.files?.[0]) setFile(URL.createObjectURL(e.target.files[0]));
   };

   return (
     <div className="space-y-6">
        <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:text-slate-400"/>
        {file && (
          <div className="space-y-4">
             <div className="flex flex-wrap gap-2">
                {filters.map(f => (
                   <Button key={f.name} size="sm" variant={filter === f.val ? 'primary' : 'outline'} onClick={() => setFilter(f.val)}>{f.name}</Button>
                ))}
             </div>
             <div className="flex justify-center border dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900 overflow-hidden">
               <img src={file} style={{ filter: filter, maxWidth: '100%', maxHeight: '400px' }} className="transition-all" />
             </div>
          </div>
        )}
     </div>
   );
};

// --- Image Flip/Rotate ---
export const ImageFlipper: React.FC = () => {
   const [file, setFile] = useState<string>('');
   const [rotate, setRotate] = useState(0);
   const [scaleX, setScaleX] = useState(1);
   const [scaleY, setScaleY] = useState(1);
   
   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
     if(e.target.files?.[0]) setFile(URL.createObjectURL(e.target.files[0]));
   };

   return (
     <div className="space-y-6">
        <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:text-slate-400"/>
        {file && (
          <div className="space-y-4">
             <div className="flex gap-2 justify-center flex-wrap">
                <Button size="sm" variant="outline" onClick={() => setRotate(r => r - 90)}><RotateCw className="w-4 h-4 mr-1 -scale-x-100" /> -90°</Button>
                <Button size="sm" variant="outline" onClick={() => setRotate(r => r + 90)}><RotateCw className="w-4 h-4 mr-1" /> +90°</Button>
                <Button size="sm" variant="outline" onClick={() => setScaleX(s => s * -1)}>Flip Horizontally</Button>
                <Button size="sm" variant="outline" onClick={() => setScaleY(s => s * -1)}>Flip Vertically</Button>
             </div>
             <div className="flex justify-center border dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900 overflow-hidden">
               <img 
                 src={file} 
                 style={{ transform: `rotate(${rotate}deg) scale(${scaleX}, ${scaleY})`, maxWidth: '100%', maxHeight: '400px', transition: 'transform 0.3s' }} 
               />
             </div>
          </div>
        )}
     </div>
   );
};

// --- Aspect Ratio Calculator ---
export const AspectRatioCalculator: React.FC = () => {
   const [w, setW] = useState(1920);
   const [h, setH] = useState(1080);
   const [ratioW, setRatioW] = useState(16);
   const [ratioH, setRatioH] = useState(9);
   
   const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
   
   const calculateRatio = () => {
     const divisor = gcd(w, h);
     setRatioW(w / divisor);
     setRatioH(h / divisor);
   };
   
   const calculateNewDimension = (type: 'w' | 'h') => {
      if(type === 'w') setH(Math.round((w * ratioH) / ratioW));
      else setW(Math.round((h * ratioW) / ratioH));
   };

   return (
      <div className="space-y-6">
         <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700">
               <h3 className="font-bold text-gray-700 dark:text-slate-300">Dimensions (px)</h3>
               <div className="flex gap-4 items-center">
                  <div className="flex-1">
                     <label className="text-xs font-bold text-gray-500">Width</label>
                     <input type="number" className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={w} onChange={e => { setW(Number(e.target.value)); calculateRatio(); }} />
                  </div>
                  <div className="flex-1">
                     <label className="text-xs font-bold text-gray-500">Height</label>
                     <input type="number" className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={h} onChange={e => { setH(Number(e.target.value)); calculateRatio(); }} />
                  </div>
               </div>
               <div className="text-center font-bold text-blue-600 dark:text-blue-400">Resulting Ratio: {ratioW}:{ratioH}</div>
            </div>

            <div className="space-y-4 bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700">
               <h3 className="font-bold text-gray-700 dark:text-slate-300">Calculator based on Ratio</h3>
               <div className="flex gap-2 items-center">
                   <span className="text-sm font-bold w-12 text-gray-500">Ratio</span>
                   <input type="number" className="w-16 p-1 border rounded text-center bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={ratioW} onChange={e => setRatioW(Number(e.target.value))} />
                   <span className="font-bold">:</span>
                   <input type="number" className="w-16 p-1 border rounded text-center bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={ratioH} onChange={e => setRatioH(Number(e.target.value))} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <Button size="sm" variant="outline" onClick={() => calculateNewDimension('w')}>Calc Height from Width</Button>
                  <Button size="sm" variant="outline" onClick={() => calculateNewDimension('h')}>Calc Width from Height</Button>
               </div>
            </div>
         </div>
      </div>
   );
};

// --- Student Card Generator (Existing code) ---
export const StudentCardGenerator: React.FC = () => {
  const [details, setDetails] = useState({
    name: 'Alex Johnson',
    university: 'Global Institute of Technology',
    id: 'STU-2024-8892',
    program: 'B.Sc. Computer Science',
    dob: '2001-05-15',
    valid: '2025-12-31'
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState('#2563eb');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files?.[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  useEffect(() => {
    drawCard();
  }, [details, photo, themeColor]);

  const drawCard = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    // Canvas Size (Standard ID Ratio)
    canvas.width = 600;
    canvas.height = 378;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative Header (Curved)
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, 100);
    ctx.bezierCurveTo(canvas.width, 100, canvas.width/2, 140, 0, 100);
    ctx.fill();

    // Footer Strip
    ctx.fillStyle = themeColor;
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // University Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(details.university.toUpperCase(), canvas.width / 2, 50);

    // Title label
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText("STUDENT IDENTITY CARD", canvas.width / 2, 75);

    // Photo Placeholder or Image
    const photoX = 40;
    const photoY = 120;
    const photoW = 140;
    const photoH = 170;

    ctx.save();
    // Border for photo
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(photoX, photoY, photoW, photoH);
    
    if(photo) {
      const img = new Image();
      img.src = photo;
      img.onload = () => {
        ctx.drawImage(img, photoX, photoY, photoW, photoH);
      };
      // Note: Because image loading is async, we try to draw it. 
      // If it's already cached/loaded, it draws immediately. 
      // A proper implementation handles onload separately, but React state update re-triggers this effect effectively.
      if(img.complete) {
         ctx.drawImage(img, photoX, photoY, photoW, photoH);
      }
    } else {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.font = '12px Arial';
      ctx.fillText("PHOTO", photoX + photoW/2, photoY + photoH/2);
    }
    ctx.restore();

    // Details Text
    const textX = 210;
    const startY = 140;
    const lineHeight = 35;

    ctx.textAlign = 'left';
    
    const drawField = (label: string, value: string, y: number) => {
      ctx.fillStyle = '#64748b'; // Label Color
      ctx.font = 'bold 12px Arial';
      ctx.fillText(label.toUpperCase(), textX, y);
      
      ctx.fillStyle = '#1e293b'; // Value Color
      ctx.font = 'bold 18px Arial';
      ctx.fillText(value, textX, y + 18);
    };

    drawField("Student Name", details.name, startY);
    drawField("Student ID", details.id, startY + lineHeight * 1.5);
    drawField("Program / Course", details.program, startY + lineHeight * 3);
    
    // Valid Thru
    ctx.fillStyle = themeColor;
    ctx.fillRect(textX, startY + lineHeight * 4.5, 120, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText("VALID UNTIL", textX + 10, startY + lineHeight * 4.5 + 12);
    ctx.font = 'bold 14px Arial';
    ctx.fillText(details.valid, textX + 10, startY + lineHeight * 4.5 + 26);

    // Fake Barcode
    const barcodeX = 450;
    const barcodeY = 280;
    ctx.fillStyle = '#000';
    for(let i=0; i<30; i++) {
       const w = Math.random() > 0.5 ? 2 : 4;
       ctx.fillRect(barcodeX + i*4, barcodeY, w, 40);
    }
  };

  const downloadCard = () => {
    const link = document.createElement('a');
    link.download = `student-card-${details.name.replace(/\s+/g,'-').toLowerCase()}.png`;
    link.href = canvasRef.current?.toDataURL() || '';
    link.click();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Controls */}
      <div className="space-y-4">
         <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-gray-700 dark:text-slate-200">Card Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <input className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Name" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} />
               <input className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="ID Number" value={details.id} onChange={e => setDetails({...details, id: e.target.value})} />
               <input className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="University" value={details.university} onChange={e => setDetails({...details, university: e.target.value})} />
               <input className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Course/Program" value={details.program} onChange={e => setDetails({...details, program: e.target.value})} />
               <input className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" type="date" value={details.dob} onChange={e => setDetails({...details, dob: e.target.value})} />
               <input className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" type="date" value={details.valid} onChange={e => setDetails({...details, valid: e.target.value})} />
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700">
               <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-2">Theme Color</h3>
               <div className="flex gap-2">
                 <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-10 h-10 p-0 border-0 rounded cursor-pointer" />
                 <span className="text-sm self-center text-gray-500 dark:text-slate-400 uppercase">{themeColor}</span>
               </div>
             </div>
             <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700">
                <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-2">Student Photo</h3>
                <input type="file" accept="image/*" onChange={handlePhoto} className="text-xs w-full dark:text-slate-400" />
             </div>
         </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col items-center gap-6">
         <canvas 
           ref={canvasRef} 
           className="w-full max-w-[500px] shadow-2xl rounded-xl border border-gray-200 dark:border-slate-700 bg-white" 
         />
         <Button size="lg" onClick={downloadCard} className="w-full max-w-[300px] shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0">
            <Download className="w-5 h-5 mr-2 inline" /> Download ID Card
         </Button>
      </div>
    </div>
  );
};