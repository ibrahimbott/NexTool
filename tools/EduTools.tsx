import React, { useState, useEffect, useRef } from 'react';
import { Button, inputClasses } from '../components/UI';
import { Copy, Mail, RefreshCw, Check, GraduationCap, Loader2, Inbox, AlertTriangle, ChevronRight } from 'lucide-react';

// --- University Data ---
const UNIVERSITIES = [
  { name: 'Harvard University', domain: 'harvard.edu', format: 'dot' },
  { name: 'Stanford University', domain: 'stanford.edu', format: 'first_initial' },
  { name: 'Massachusetts Institute of Technology (MIT)', domain: 'mit.edu', format: 'last' },
  { name: 'University of California, Berkeley', domain: 'berkeley.edu', format: 'dot' },
  { name: 'Columbia University', domain: 'columbia.edu', format: 'initials_num' },
  { name: 'Yale University', domain: 'yale.edu', format: 'dot' },
  { name: 'University of Oxford', domain: 'ox.ac.uk', format: 'dot' },
  { name: 'University of Cambridge', domain: 'cam.ac.uk', format: 'dot' },
  { name: 'Cornell University', domain: 'cornell.edu', format: 'initials_num' },
  { name: 'Princeton University', domain: 'princeton.edu', format: 'last' },
  { name: 'New York University', domain: 'nyu.edu', format: 'initials_num' },
  { name: 'Arizona State University', domain: 'asu.edu', format: 'dot' },
];

// --- Mock Senders Configuration ---
const SERVICES = [
  { name: 'Canva', from: 'no-reply@canva.com', subject: 'Your verification code for Canva', color: 'bg-purple-600' },
  { name: 'GitHub', from: 'support@github.com', subject: '[GitHub] Please verify your email address', color: 'bg-gray-900' },
  { name: 'Notion', from: 'team@m.notion.so', subject: 'Login code for Notion', color: 'bg-gray-800' },
  { name: 'Amazon Prime', from: 'account-update@amazon.com', subject: 'Verify your new Amazon account', color: 'bg-blue-900' },
  { name: 'Adobe', from: 'message@adobe.com', subject: 'Your Adobe ID verification code', color: 'bg-red-600' },
  { name: 'UNiDAYS', from: 'help@myunidays.com', subject: 'Verify your student status', color: 'bg-green-600' },
  { name: 'Microsoft', from: 'account-security-noreply@accountprotection.microsoft.com', subject: 'Microsoft account security code', color: 'bg-blue-600' },
  { name: 'Generic', from: 'verify@service.com', subject: 'Your verification code', color: 'bg-blue-500' },
];

export const EduEmailGenerator: React.FC = () => {
  const [name, setName] = useState('');
  const [selectedUni, setSelectedUni] = useState(UNIVERSITIES[0].domain);
  const [selectedService, setSelectedService] = useState(SERVICES[0].name);
  const [generatedEmail, setGeneratedEmail] = useState('');
  
  // Inbox Simulation State
  const [inboxStatus, setInboxStatus] = useState<'idle' | 'listening' | 'received'>('idle');
  const [progress, setProgress] = useState(0);
  const [receivedCode, setReceivedCode] = useState('');
  const [receivedMessage, setReceivedMessage] = useState<any>(null);

  const generateEmail = () => {
    if (!name.trim()) {
      alert("Please enter a student name first");
      return;
    }

    const uni = UNIVERSITIES.find(u => u.domain === selectedUni) || UNIVERSITIES[0];
    const cleanName = name.toLowerCase().replace(/[^a-z\s]/g, '').split(' ');
    const first = cleanName[0] || 'student';
    const last = cleanName.length > 1 ? cleanName[cleanName.length - 1] : 'user';
    
    let emailPrefix = '';

    switch (uni.format) {
      case 'dot': emailPrefix = `${first}.${last}`; break;
      case 'first_initial': emailPrefix = `${first[0]}${last}`; break;
      case 'last': emailPrefix = last; break;
      case 'initials_num': emailPrefix = `${first[0]}${last[0]}${Math.floor(Math.random() * 900) + 100}`; break;
      default: emailPrefix = `${first}.${last}`;
    }

    setGeneratedEmail(`${emailPrefix}@${uni.domain}`);
    setInboxStatus('idle'); 
    setReceivedCode('');
    setReceivedMessage(null);
    setProgress(0);
  };

  const startListening = () => {
    if (!generatedEmail) return;
    setInboxStatus('listening');
    setProgress(0);
    setReceivedCode('');
    
    // Simulate connection progress
    const duration = 8000; // 8 seconds wait
    const interval = 100;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.min(95, (currentStep / steps) * 100));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        receiveMockEmail();
      }
    }, interval);
  };

  const receiveMockEmail = () => {
    const service = SERVICES.find(s => s.name === selectedService) || SERVICES[0];
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    setReceivedCode(mockCode);
    setReceivedMessage({
       ...service,
       date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setInboxStatus('received');
    setProgress(100);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* --- Configuration Panel --- */}
      <div className="grid md:grid-cols-5 gap-6">
         {/* Left: Inputs */}
         <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
               <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="font-bold text-gray-800 dark:text-white">Student Profile</h2>
               </div>
               
               <div className="space-y-4">
                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                     <input 
                       className={inputClasses} 
                       placeholder="e.g. Alex Smith" 
                       value={name} 
                       onChange={e => setName(e.target.value)} 
                     />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">University Domain</label>
                     <select className={inputClasses} value={selectedUni} onChange={e => setSelectedUni(e.target.value)}>
                        {UNIVERSITIES.map(u => (
                          <option key={u.domain} value={u.domain}>{u.name} (@{u.domain})</option>
                        ))}
                     </select>
                  </div>
                  <Button onClick={generateEmail} className="w-full font-bold">
                     <RefreshCw className="w-4 h-4 mr-2" /> Generate Email
                  </Button>
               </div>
            </div>

            {/* Step 2: Service Selection */}
            {generatedEmail && (
               <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 animate-in slide-in-from-left-4 fade-in">
                  <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3">Incoming Mail Settings</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">Select which service you are expecting a code from to make the email look authentic.</p>
                  
                  <div className="space-y-3">
                     <label className="text-xs font-bold text-blue-600/70 uppercase block">Expected Sender</label>
                     <select className={inputClasses} value={selectedService} onChange={e => setSelectedService(e.target.value)}>
                        {SERVICES.map(s => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                     </select>
                     
                     <Button 
                       onClick={startListening} 
                       disabled={inboxStatus !== 'idle'}
                       className={`w-full ${inboxStatus === 'idle' ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
                     >
                        {inboxStatus === 'idle' ? 'Start Receiving' : 'Listening...'}
                     </Button>
                  </div>
               </div>
            )}
         </div>

         {/* Right: Interface */}
         <div className="md:col-span-3 space-y-6">
            
            {/* Generated Email Display */}
            <div className={`transition-all duration-500 ${generatedEmail ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
               <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                     <span className="text-xs font-bold text-gray-500 uppercase">Active Identity</span>
                     {generatedEmail && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Active</span>}
                  </div>
                  <div className="p-6 text-center">
                     {generatedEmail ? (
                        <div>
                           <div className="text-2xl md:text-3xl font-mono font-bold text-gray-800 dark:text-white mb-4 break-all selection:bg-blue-200 selection:text-blue-900">
                              {generatedEmail}
                           </div>
                           <Button onClick={() => navigator.clipboard.writeText(generatedEmail)} variant="outline" size="sm" className="mx-auto">
                              <Copy className="w-4 h-4 mr-2" /> Copy Address
                           </Button>
                        </div>
                     ) : (
                        <div className="text-gray-400 py-4">Generate an email to start</div>
                     )}
                  </div>
               </div>
            </div>

            {/* Inbox Simulator */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden min-h-[400px] flex flex-col relative">
               
               {/* Inbox Header */}
               <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-slate-700 rounded-lg"><Inbox className="w-4 h-4" /></div>
                     <div>
                        <div className="font-bold text-sm">University Webmail</div>
                        <div className="text-[10px] text-slate-400">{generatedEmail || 'Not Connected'}</div>
                     </div>
                  </div>
                  <div className="flex gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
               </div>

               {/* Inbox Body */}
               <div className="flex-1 bg-gray-50 dark:bg-slate-950 relative">
                  
                  {/* State: Idle / No Email */}
                  {inboxStatus === 'idle' && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Mail className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-sm font-medium">Inbox Empty</p>
                        <p className="text-xs opacity-70 mt-1 max-w-[200px] text-center">Click "Start Receiving" after pasting your email on the target website.</p>
                     </div>
                  )}

                  {/* State: Listening */}
                  {inboxStatus === 'listening' && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Waiting for email...</h3>
                        <p className="text-sm text-gray-500 mb-6">Listening for incoming messages on {generatedEmail}</p>
                        
                        <div className="w-64 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-blue-600 transition-all duration-300 ease-out"
                             style={{ width: `${progress}%` }}
                           />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Connecting to mail server...</p>
                     </div>
                  )}

                  {/* State: Received */}
                  {inboxStatus === 'received' && receivedMessage && (
                     <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                        {/* Email List Item */}
                        <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-l-blue-500">
                           <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-gray-900 dark:text-white text-sm">{receivedMessage.from}</span>
                              <span className="text-[10px] text-gray-500">{receivedMessage.date}</span>
                           </div>
                           <div className="font-medium text-sm text-gray-800 dark:text-slate-200 mb-1">{receivedMessage.subject}</div>
                           <div className="text-xs text-gray-500 line-clamp-1">Use the verification code below to complete your sign-in request.</div>
                        </div>

                        {/* Email View */}
                        <div className="flex-1 p-6 md:p-8 bg-white dark:bg-slate-800 overflow-y-auto">
                           <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                              <div className={`h-2 ${receivedMessage.color || 'bg-blue-600'}`}></div>
                              <div className="p-6">
                                 <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-10 h-10 rounded-full ${receivedMessage.color} flex items-center justify-center text-white font-bold text-lg`}>
                                       {receivedMessage.name[0]}
                                    </div>
                                    <div>
                                       <div className="font-bold text-gray-900 dark:text-white">{receivedMessage.name}</div>
                                       <div className="text-xs text-gray-500">to me</div>
                                    </div>
                                 </div>
                                 
                                 <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Verification Code</h2>
                                 <p className="text-sm text-gray-600 dark:text-slate-300 mb-6 leading-relaxed">
                                    Hello {name.split(' ')[0] || 'Student'},<br/><br/>
                                    Please use the following One-Time Password (OTP) to verify your account. This code is valid for 10 minutes.
                                 </p>

                                 <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-6 text-center mb-6 group relative">
                                    <span className="text-4xl font-mono font-bold tracking-[0.2em] text-gray-900 dark:text-white">
                                       {receivedCode}
                                    </span>
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(receivedCode)}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded text-gray-400 hover:text-blue-600 transition-colors"
                                      title="Copy Code"
                                    >
                                       <Copy className="w-5 h-5" />
                                    </button>
                                 </div>

                                 <p className="text-xs text-gray-400 text-center">
                                    If you didn't request this code, you can safely ignore this email.
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

               </div>
            </div>

         </div>
      </div>
    </div>
  );
};
