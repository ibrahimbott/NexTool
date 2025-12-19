import { Tool } from '../types';
import { 
  Type, Image as ImageIcon, Code, FileText, Search, 
  Binary, Crop, Layers, Palette, Hash, Percent, 
  Settings, Globe, Shield, Lock, FileJson, 
  Files, Scissors, RefreshCw, QrCode, Link, ListOrdered,
  Calendar, Activity, Tag, Clock, Repeat, ArrowRightLeft, Radio,
  Shuffle, IdCard, Briefcase, Truck, Database, BarChart3, Maximize, Banknote
} from 'lucide-react';
import * as TextTools from '../tools/TextTools';
import * as DevTools from '../tools/DevTools';
import * as ImageTools from '../tools/ImageTools';
import * as PdfTools from '../tools/PdfTools';
import * as SeoTools from '../tools/SeoTools';
import * as MathTools from '../tools/MathTools';
import * as WebTools from '../tools/WebTools';
import * as BusinessTools from '../tools/BusinessTools';
import * as DataTools from '../tools/DataTools';

// Helper for "Coming Soon" components
const ComingSoon = () => (
  <div className="text-center py-20 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
    <Settings className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4 animate-spin-slow" />
    <h3 className="text-xl font-bold text-gray-700 dark:text-slate-200">Coming Soon</h3>
    <p className="text-gray-500 dark:text-slate-500 max-w-md mx-auto mt-2">
      This tool is currently being built. Check back later!
    </p>
  </div>
);

export const TOOLS: Tool[] = [
  // --- Business Tools ---
  { id: 'invoice-gen', name: 'Pro Invoice Generator', description: 'Create professional invoices. Export to PDF & Word. Auto-saves details.', category: 'Business', path: '/tool/invoice', icon: Briefcase, component: BusinessTools.InvoiceGenerator, isNew: true, isPopular: true },
  { id: 'delivery-challan-gen', name: 'Delivery Challan Gen', description: 'Generate professional delivery challans. Export to PDF & Word.', category: 'Business', path: '/tool/delivery-challan', icon: Truck, component: BusinessTools.DeliveryChallanGenerator, isNew: true },
  { id: 'fees-slip-gen', name: 'Fees Slip Generator', description: 'Generate secure, unalterable student fee slips in PDF/Image.', category: 'Business', path: '/tool/fees-slip', icon: Banknote, component: BusinessTools.FeesSlipGenerator, isNew: true },

  // --- Developer Tools ---
  { id: 'csv-json', name: 'CSV <-> JSON Converter', description: 'Convert CSV data to JSON and vice-versa.', category: 'Developer', path: '/tool/csv-json', icon: Database, component: DataTools.CsvJsonConverter, isNew: true },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Validate, minify, and format JSON data.', category: 'Developer', path: '/tool/json-formatter', icon: FileJson, component: DevTools.JsonFormatter, isPopular: true },
  { id: 'base64-converter', name: 'Base64 Converter', description: 'Convert text to Base64 and back.', category: 'Developer', path: '/tool/base64-converter', icon: Binary, component: DevTools.Base64Converter },
  { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate random UUID v4 strings.', category: 'Developer', path: '/tool/uuid', icon: Hash, component: DevTools.UuidGenerator },
  { id: 'random-gen', name: 'Random Generator', description: 'Generate random numbers.', category: 'Developer', path: '/tool/random', icon: Shuffle, component: DevTools.RandomGenerator, isNew: true },
  { id: 'password-gen', name: 'Password Generator', description: 'Create strong, secure passwords.', category: 'Developer', path: '/tool/password', icon: Lock, component: DevTools.PasswordGenerator, isPopular: true },
  { id: 'qr-generator', name: 'QR Code Generator', description: 'Create QR codes for URLs and text.', category: 'Developer', path: '/tool/qr', icon: QrCode, component: DevTools.QrGenerator },
  { id: 'hash-generator', name: 'Hash Generator', description: 'Generate MD5, SHA1, SHA256 hashes.', category: 'Developer', path: '/tool/hash', icon: Shield, component: DevTools.HashGenerator },
  { id: 'html-encoder', name: 'HTML Encoder', description: 'Encode/Decode HTML entities.', category: 'Developer', path: '/tool/html-enc', icon: Code, component: DevTools.HtmlEncoder },
  { id: 'unix-timestamp', name: 'Unix Timestamp', description: 'Convert Date to Timestamp.', category: 'Developer', path: '/tool/time', icon: Clock, component: DevTools.UnixTimestamp },
  { id: 'url-parser', name: 'URL Parser', description: 'Parse URL structure and parameters.', category: 'Developer', path: '/tool/url-parse', icon: Globe, component: DevTools.UrlParser },
  { id: 'ip-lookup', name: 'My IP Address', description: 'Show your public IP address and network info.', category: 'Developer', path: '/tool/ip', icon: Globe, component: WebTools.IpLookup, isNew: true },

  // --- Text Tools ---
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, sentences, and paragraphs.', category: 'Text', path: '/tool/word-counter', icon: Type, component: TextTools.WordCounter, isPopular: true },
  { id: 'case-converter', name: 'Case Converter', description: 'Convert text to Uppercase, Lowercase, Title Case.', category: 'Text', path: '/tool/case-converter', icon: Type, component: TextTools.CaseConverter },
  { id: 'lorem-generator', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text.', category: 'Text', path: '/tool/lorem-generator', icon: FileText, component: TextTools.LoremGenerator },
  { id: 'text-sorter', name: 'Text Sorter', description: 'Sort list items alphabetically, reverse, or random.', category: 'Text', path: '/tool/text-sorter', icon: ListOrdered, component: TextTools.TextSorter },
  { id: 'duplicate-remover', name: 'Remove Duplicates', description: 'Remove duplicate lines from a text list.', category: 'Text', path: '/tool/duplicate-remover', icon: Files, component: TextTools.DuplicateRemover },
  { id: 'binary-trans', name: 'Binary Converter', description: 'Convert Text to Binary and vice-versa.', category: 'Text', path: '/tool/binary', icon: Binary, component: TextTools.BinaryConverter },
  { id: 'hex-trans', name: 'Hex Converter', description: 'Convert Text to Hex and vice-versa.', category: 'Text', path: '/tool/hex', icon: Hash, component: TextTools.HexConverter },
  { id: 'text-repeater', name: 'Text Repeater', description: 'Repeat text multiple times instantly.', category: 'Text', path: '/tool/repeater', icon: Repeat, component: TextTools.TextRepeater },
  { id: 'text-reverser', name: 'Text Reverser', description: 'Reverse text or flip words.', category: 'Text', path: '/tool/reverse', icon: ArrowRightLeft, component: TextTools.TextReverser },
  { id: 'morse-converter', name: 'Morse Code', description: 'Translate text to Morse Code.', category: 'Text', path: '/tool/morse', icon: Radio, component: TextTools.MorseConverter },
  { id: 'ascii-art', name: 'ASCII Art Generator', description: 'Convert text to ASCII art.', category: 'Text', path: '/tool/ascii', icon: Type, component: TextTools.AsciiArtGenerator, isNew: true },
  { id: 'word-freq', name: 'Word Frequency', description: 'Analyze text repetition and word usage.', category: 'Text', path: '/tool/freq', icon: BarChart3, component: TextTools.WordFrequency, isNew: true },

  // --- Image Tools ---
  { id: 'student-card-gen', name: 'Student ID Generator', description: 'Generate realistic professional student identity cards.', category: 'Image', path: '/tool/student-card', icon: IdCard, component: ImageTools.StudentCardGenerator, isNew: true, isPopular: true },
  { id: 'image-converter', name: 'Image Converter', description: 'Convert/Compress images (JPG, PNG, WebP).', category: 'Image', path: '/tool/image-converter', icon: ImageIcon, component: ImageTools.ImageConverter, isPopular: true },
  { id: 'image-resizer', name: 'Image Resizer', description: 'Resize images by pixel or percentage.', category: 'Image', path: '/tool/resize', icon: Crop, component: ImageTools.ImageResizer },
  { id: 'image-pdf', name: 'Image to PDF', description: 'Convert JPG/PNG images to PDF document.', category: 'Image', path: '/tool/image-pdf', icon: FileText, component: ImageTools.ImageToPdf },
  { id: 'image-color', name: 'Color Picker', description: 'Pick colors from any image.', category: 'Image', path: '/tool/image-color', icon: Palette, component: ImageTools.ImageColorPicker },
  { id: 'image-filter', name: 'Image Filters', description: 'Apply filters like Grayscale, Sepia, Blur.', category: 'Image', path: '/tool/filter', icon: Palette, component: ImageTools.ImageFilters },
  { id: 'image-flip', name: 'Image Flipper', description: 'Rotate and flip images.', category: 'Image', path: '/tool/flip', icon: RefreshCw, component: ImageTools.ImageFlipper },
  { id: 'box-shadow-generator', name: 'CSS Box Shadow', description: 'Visually generate CSS box-shadow code.', category: 'CSS', path: '/tool/box-shadow-generator', icon: Layers, component: ImageTools.BoxShadowGenerator },
  { id: 'aspect-ratio', name: 'Aspect Ratio Calc', description: 'Calculate dimensions and ratios.', category: 'Image', path: '/tool/ratio', icon: Maximize, component: ImageTools.AspectRatioCalculator, isNew: true },

  // --- PDF Tools ---
  { id: 'pdf-merge', name: 'Merge PDF', description: 'Combine multiple PDF files into one.', category: 'PDF', path: '/tool/pdf-merge', icon: Files, component: PdfTools.PdfMerge, isPopular: true },
  { id: 'pdf-split', name: 'Split PDF', description: 'Extract pages from PDF files.', category: 'PDF', path: '/tool/pdf-split', icon: Scissors, component: PdfTools.PdfSplit },
  { id: 'pdf-rotate', name: 'Rotate PDF', description: 'Rotate pages in a PDF file.', category: 'PDF', path: '/tool/pdf-rotate', icon: RefreshCw, component: PdfTools.PdfRotate },
  
  // --- Math Tools ---
  { id: 'percentage-calc', name: 'Percentage Calc', description: 'Calculate percentages easily.', category: 'Math', path: '/tool/percent', icon: Percent, component: MathTools.PercentageCalculator },
  { id: 'age-calc', name: 'Age Calculator', description: 'Calculate precise age from date of birth.', category: 'Math', path: '/tool/age', icon: Calendar, component: MathTools.AgeCalculator },
  { id: 'bmi-calc', name: 'BMI Calculator', description: 'Check Body Mass Index score.', category: 'Math', path: '/tool/bmi', icon: Activity, component: MathTools.BmiCalculator },
  { id: 'discount-calc', name: 'Discount Calc', description: 'Calculate final price after discount.', category: 'Math', path: '/tool/discount', icon: Tag, component: MathTools.DiscountCalculator },
  { id: 'loan-calc', name: 'Loan Calculator', description: 'Calculate monthly loan payments.', category: 'Math', path: '/tool/loan', icon: Activity, component: MathTools.LoanCalculator, isNew: true },

  // --- Web Tools ---
  { id: 'html-minifier', name: 'HTML Minifier', description: 'Minify HTML code.', category: 'CSS', path: '/tool/html-min', icon: Code, component: WebTools.HtmlMinifier },
  { id: 'css-minifier', name: 'CSS Minifier', description: 'Minify CSS code to reduce file size.', category: 'CSS', path: '/tool/css-min', icon: Code, component: WebTools.CssMinifier },
  { id: 'js-minifier', name: 'JS Minifier', description: 'Basic JS minifier.', category: 'Developer', path: '/tool/js-min', icon: Code, component: WebTools.JsMinifier },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert HEX to RGB and vice-versa.', category: 'CSS', path: '/tool/color', icon: Palette, component: WebTools.ColorConverter },
  { id: 'stopwatch', name: 'Stopwatch', description: 'Simple online browser stopwatch.', category: 'Converter', path: '/tool/stopwatch', icon: Clock, component: WebTools.Stopwatch },
  { id: 'gradient-gen', name: 'Gradient Gen', description: 'CSS Gradients creator.', category: 'CSS', path: '/tool/gradient', icon: Palette, component: WebTools.GradientGenerator, isNew: true },

  // --- SEO Tools ---
  { id: 'url-encoder', name: 'URL Encoder/Decoder', description: 'Encode or Decode URL strings.', category: 'SEO', path: '/tool/url-enc', icon: Link, component: SeoTools.UrlEncoder },
  { id: 'meta-tag-gen', name: 'Meta Tag Generator', description: 'Create SEO meta tags for websites.', category: 'SEO', path: '/tool/meta', icon: Search, component: SeoTools.MetaTagGenerator },
  { id: 'robots-gen', name: 'Robots.txt Gen', description: 'Create robots.txt files.', category: 'SEO', path: '/tool/robots', icon: FileText, component: SeoTools.RobotsTxtGen },
  { id: 'keyword-density', name: 'Keyword Density', description: 'Check keyword frequency in text.', category: 'SEO', path: '/tool/keyword', icon: Search, component: SeoTools.KeywordDensity },
  { id: 'sitemap-gen', name: 'Sitemap Creator', description: 'Generate XML sitemaps.', category: 'SEO', path: '/tool/sitemap', icon: Globe, component: SeoTools.SitemapGenerator, isNew: true },
  { id: 'slug-gen', name: 'Slug Generator', description: 'Make strings URL friendly.', category: 'SEO', path: '/tool/slug', icon: Link, component: SeoTools.SlugGenerator, isNew: true },

  // --- Placeholders ---
  { id: 'img-to-pdf', name: 'Image to PDF', description: 'Convert photos to PDF.', category: 'PDF', path: '/tool/img-pdf', icon: ImageIcon, component: ComingSoon },
];