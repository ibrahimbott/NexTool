import React, { useState } from 'react';
import { Button } from '../components/UI';
import { Calculator, Calendar, Percent, Tag } from 'lucide-react';

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
        <label className="font-medium text-gray-700">Date of Birth</label>
        <input 
          type="date" 
          value={birthDate} 
          onChange={(e) => setBirthDate(e.target.value)} 
          className="w-full p-3 border rounded-lg"
        />
        <Button onClick={calculate} className="w-full"><Calendar className="w-4 h-4 mr-2 inline" /> Calculate Age</Button>
      </div>
      
      {age && (
        <div className="bg-blue-50 p-6 rounded-xl text-center border border-blue-100">
          <div className="text-4xl font-bold text-blue-600 mb-2">{age.years}</div>
          <div className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-4">Years Old</div>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
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
    if (v < 18.5) return { label: 'Underweight', color: 'text-yellow-600' };
    if (v < 25) return { label: 'Normal weight', color: 'text-green-600' };
    if (v < 30) return { label: 'Overweight', color: 'text-orange-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
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
             <div className="text-6xl font-bold text-gray-800 mb-2">{bmi}</div>
             <div className={`text-xl font-bold ${getCategory(bmi).color}`}>{getCategory(bmi).label}</div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Enter details to see result</div>
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
      <div className="bg-white p-4 rounded-lg border flex flex-col md:flex-row items-center gap-4">
        <span className="font-bold text-gray-500">What is</span>
        <input type="number" className="w-20 p-2 border rounded" onChange={(e) => setVal1(Number(e.target.value))} />
        <span className="font-bold text-gray-500">% of</span>
        <input type="number" className="w-20 p-2 border rounded" onChange={(e) => setVal2(Number(e.target.value))} />
        <div className="ml-auto font-bold text-xl text-blue-600">
           = {((val1 / 100) * val2).toFixed(2)}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border flex flex-col md:flex-row items-center gap-4">
        <input type="number" className="w-20 p-2 border rounded" onChange={(e) => setVal1(Number(e.target.value))} />
        <span className="font-bold text-gray-500">is what % of</span>
        <input type="number" className="w-20 p-2 border rounded" onChange={(e) => setVal2(Number(e.target.value))} />
        <div className="ml-auto font-bold text-xl text-blue-600">
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
       <div className="space-y-4">
         <div>
            <label className="block text-sm font-medium mb-1">Original Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full pl-8 p-2 border rounded" />
            </div>
         </div>
         <div>
            <label className="block text-sm font-medium mb-1">Discount (%)</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full p-2 border rounded" />
         </div>
       </div>

       <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center space-y-2">
          <div className="text-sm text-green-700 font-bold uppercase">Final Price</div>
          <div className="text-4xl font-bold text-green-700">${final.toFixed(2)}</div>
          <div className="text-sm text-green-600">You save ${saved.toFixed(2)}</div>
       </div>
    </div>
  );
};
