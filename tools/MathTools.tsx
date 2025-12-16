import React, { useState } from 'react';
import { Button } from '../components/UI';
import { Calculator, Calendar, Percent, Tag, DollarSign } from 'lucide-react';

// --- Age Calculator ---
export const AgeCalculator: React.FC = () => {
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<{ years: number, months: number, days: number } | null>(null);

  const calculate = () => {
    if (!birthDate) return;
    const today = new Date();
    const birth = new Date(birthDate);
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (months < 0 || (months === 0 && days < 0)) {
      years--;
      months += 12;
    }
    if (days < 0) {
      const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 0);
      days += prevMonth.getDate();
      months--;
    }

    setAge({ years, months, days });
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <label className="font-medium text-gray-700 dark:text-slate-300">Date of Birth</label>
        <input 
          type="date" 
          value={birthDate} 
          onChange={(e) => setBirthDate(e.target.value)} 
          className="w-full p-3 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white"
        />
        <Button onClick={calculate} className="w-full"><Calendar className="w-4 h-4 mr-2 inline" /> Calculate Age</Button>
      </div>
      
      {age && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl text-center border border-blue-100 dark:border-blue-800">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{age.years}</div>
          <div className="text-gray-500 dark:text-slate-400 uppercase text-xs font-bold tracking-wider mb-4">Years Old</div>
          <div className="flex justify-center gap-4 text-sm text-gray-600 dark:text-slate-300">
             <span>{age.months} Months</span>
             <span>|</span>
             <span>{age.days} Days</span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- BMI Calculator ---
export const BmiCalculator: React.FC = () => {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [bmi, setBmi] = useState<number | null>(null);

  const calculate = () => {
    const hM = height / 100;
    const val = weight / (hM * hM);
    setBmi(Number(val.toFixed(1)));
  };

  const getCategory = (v: number) => {
    if (v < 18.5) return { label: 'Underweight', color: 'text-yellow-600 dark:text-yellow-400' };
    if (v < 25) return { label: 'Normal weight', color: 'text-green-600 dark:text-green-400' };
    if (v < 30) return { label: 'Overweight', color: 'text-orange-600 dark:text-orange-400' };
    return { label: 'Obese', color: 'text-red-600 dark:text-red-400' };
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4 text-gray-700 dark:text-slate-300">
        <div>
          <label className="block text-sm font-medium mb-1">Weight (kg): {weight}</label>
          <input type="range" min="30" max="200" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Height (cm): {height}</label>
          <input type="range" min="100" max="250" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full" />
        </div>
        <Button onClick={calculate} className="w-full">Calculate BMI</Button>
      </div>
      
      <div className="flex items-center justify-center">
        {bmi ? (
          <div className="text-center">
             <div className="text-6xl font-bold text-gray-800 dark:text-slate-100 mb-2">{bmi}</div>
             <div className={`text-xl font-bold ${getCategory(bmi).color}`}>{getCategory(bmi).label}</div>
          </div>
        ) : (
          <div className="text-gray-400 dark:text-slate-500 text-sm">Enter details to see result</div>
        )}
      </div>
    </div>
  );
};

// --- Percentage Calculator ---
export const PercentageCalculator: React.FC = () => {
  const [val1, setVal1] = useState(0);
  const [val2, setVal2] = useState(0);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 flex flex-col md:flex-row items-center gap-4 text-gray-700 dark:text-slate-300">
        <span className="font-bold text-gray-500 dark:text-slate-400">What is</span>
        <input type="number" className="w-20 p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" onChange={(e) => setVal1(Number(e.target.value))} />
        <span className="font-bold text-gray-500 dark:text-slate-400">% of</span>
        <input type="number" className="w-20 p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" onChange={(e) => setVal2(Number(e.target.value))} />
        <div className="ml-auto font-bold text-xl text-blue-600 dark:text-blue-400">
           = {((val1 / 100) * val2).toFixed(2)}
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 flex flex-col md:flex-row items-center gap-4 text-gray-700 dark:text-slate-300">
        <input type="number" className="w-20 p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" onChange={(e) => setVal1(Number(e.target.value))} />
        <span className="font-bold text-gray-500 dark:text-slate-400">is what % of</span>
        <input type="number" className="w-20 p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" onChange={(e) => setVal2(Number(e.target.value))} />
        <div className="ml-auto font-bold text-xl text-blue-600 dark:text-blue-400">
           = {(val2 === 0 ? 0 : (val1 / val2) * 100).toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

// --- Discount Calculator ---
export const DiscountCalculator: React.FC = () => {
  const [price, setPrice] = useState(100);
  const [discount, setDiscount] = useState(20);

  const saved = (price * discount) / 100;
  const final = price - saved;

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
       <div className="space-y-4 text-gray-700 dark:text-slate-300">
         <div>
            <label className="block text-sm font-medium mb-1">Original Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 dark:text-slate-400">$</span>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full pl-8 p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
            </div>
         </div>
         <div>
            <label className="block text-sm font-medium mb-1">Discount (%)</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
         </div>
       </div>

       <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center space-y-2">
          <div className="text-sm text-green-700 dark:text-green-400 font-bold uppercase">Final Price</div>
          <div className="text-4xl font-bold text-green-700 dark:text-green-400">${final.toFixed(2)}</div>
          <div className="text-sm text-green-600 dark:text-green-500">You save ${saved.toFixed(2)}</div>
       </div>
    </div>
  );
};

// --- Loan Calculator ---
export const LoanCalculator: React.FC = () => {
   const [amount, setAmount] = useState(100000);
   const [rate, setRate] = useState(5);
   const [term, setTerm] = useState(10); // years

   const calculate = () => {
      const r = rate / 100 / 12;
      const n = term * 12;
      return (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
   };

   const monthly = calculate();
   const total = monthly * term * 12;
   const interest = total - amount;

   return (
      <div className="grid md:grid-cols-2 gap-8">
         <div className="space-y-4 text-gray-700 dark:text-slate-300">
            <div>
               <label className="block text-sm font-medium mb-1">Loan Amount</label>
               <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
               <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" step="0.1" />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Term (Years)</label>
               <input type="number" value={term} onChange={e => setTerm(Number(e.target.value))} className="w-full p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
            </div>
         </div>
         
         <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
               <div className="text-sm font-bold text-blue-500 uppercase">Monthly Payment</div>
               <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">${monthly.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700 text-center">
                  <div className="text-xs font-bold text-gray-500">Total Interest</div>
                  <div className="text-lg font-bold text-red-500 dark:text-red-400">${interest.toFixed(0)}</div>
               </div>
               <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700 text-center">
                  <div className="text-xs font-bold text-gray-500">Total Payback</div>
                  <div className="text-lg font-bold text-gray-700 dark:text-slate-200">${total.toFixed(0)}</div>
               </div>
            </div>
         </div>
      </div>
   );
};