import React, { useState, useEffect, useLayoutEffect } from 'react';
import { db } from './firebase'; // Ensure you created src/firebase.js
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { 
  LineChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { 
  Cpu, Footprints, Coffee, Activity, TrendingUp, DollarSign, 
  Factory, Scale, ShieldCheck, AlertTriangle, CheckCircle, Zap, Recycle, Lightbulb, Box,
  Wrench, Truck, Database, GraduationCap, CreditCard, LayoutDashboard, Info,
  Crown, Sparkles, Target, Newspaper, Megaphone, AlertOctagon,
  ChevronRight, Percent, Flag, Lock, LifeBuoy, Siren,
  ArrowRight, BookOpen, X, Ban, Trophy, RotateCcw,
  User, Key, LogOut, Users, RefreshCw
} from 'lucide-react';

// ==========================================
// 1. CONFIGURATION & DATA
// ==========================================

const INDUSTRIES = {
  THERMO: {
    id: 'THERMO',
    name: 'Neuro Thermostats',
    type: 'High Tech',
    icon: <Cpu size={24}/>,
    desc: 'High Margin, High R&D. Competes on Innovation.',
    startingCash: 60000000,
    baseValuation: 100000000,
    unitPrice: 2000,
    baseCost: 1200
  },
  SHOE: {
    id: 'SHOE',
    name: 'Ocean Stride',
    type: 'Manufacturing',
    icon: <Footprints size={24}/>,
    desc: 'Volume play. Competes on Price & Efficiency.',
    startingCash: 40000000,
    baseValuation: 80000000,
    unitPrice: 1000,
    baseCost: 850
  },
  COFFEE: {
    id: 'COFFEE',
    name: 'Zenith Brew',
    type: 'FMCG',
    icon: <Coffee size={24}/>,
    desc: 'Brand sensitive. Competes on Marketing.',
    startingCash: 50000000,
    baseValuation: 90000000,
    unitPrice: 150,
    baseCost: 90
  }
};

const YEAR_THEMES = [
  { title: "Foundation", focus: "Establish operational stability." },
  { title: "Expansion", focus: "Capture market share." },
  { title: "Resilience", focus: "Survive the Global Recession." },
  { title: "Culture", focus: "Navigate the Workforce Crisis." },
  { title: "Transformation", focus: "Adapt to the AI Singularity." }
];

const MANDATORY_EVENTS = {
  2: { 
    name: "Global Recession", 
    desc: "CRASH: Demand -30%, Board Trust -15%. Cash is King.", 
    effects: [{ type: "DEMAND", val: 0.70 }, { type: "TRUST", val: -15 }]
  },
  3: { 
    name: "The Great Resignation", 
    desc: "LABOR CRISIS: Morale -25, Capacity -20%. Retention is vital.", 
    effects: [{ type: "MORALE", val: -25 }, { type: "CAPACITY", val: 0.80 }]
  },
  4: { 
    name: "The AI Singularity", 
    desc: "TECH SHOCK: Costs -15%, but Rival Efficiency +20%.", 
    effects: [{ type: "COST", val: 0.85 }, { type: "RIVAL_COST", val: 0.80 }]
  }
};

const EVENT_POOL = [
  { name: "Trade War", desc: "Costs +20%, Demand -5%.", effects: [{type: "COST", val: 1.2}, {type: "DEMAND", val: 0.95}] },
  { name: "Viral Hit", desc: "Demand +30%, Brand +10.", effects: [{type: "DEMAND", val: 1.3}, {type: "BRAND", val: 10}] },
  { name: "Data Breach", desc: "Brand -15, Trust -10.", effects: [{type: "BRAND", val: -15}, {type: "TRUST", val: -10}] },
  { name: "Green Subsidy", desc: "Cash +15M if ESG > 50.", effects: [{type: "CONDITIONAL_CASH", val: 15000000, condition: (s) => s.esg > 50}] },
  { name: "Labor Strike", desc: "Capacity -40%, Trust -20.", effects: [{type: "CAPACITY", val: 0.6}, {type: "TRUST", val: -20}] },
  { name: "Tech Breakthrough", desc: "Quality +10, Cost -5%.", effects: [{type: "QUALITY", val: 10}, {type: "COST", val: 0.95}] },
];

const KPI_DEFINITIONS = {
  cash: { title: "Liquid Cash", def: "Funds available.", calc: "Cash - Spend + Net Profit", tip: "Keep > ₹10M." },
  valuation: { title: "Valuation", def: "Market Cap.", calc: "Weighted Avg (Past + Current)", tip: "Momentum matters." },
  margin: { title: "Net Margin", def: "Profit %.", calc: "Net Profit / Revenue", tip: "Target > 15%." },
  inventory: { title: "Inventory", def: "Unsold Goods.", calc: "Prod - Sales", tip: "Costs storage fees." },
  morale: { title: "Morale", def: "Worker Happiness.", calc: "Base - Auto + Training", tip: "<50% risks Strikes." },
  machineHealth: { title: "Asset Health", def: "Factory Status.", calc: "Decays 10%/yr", tip: "<50% risks Breakdown." },
  quality: { title: "Quality", def: "Product Standard.", calc: "R&D Spend", tip: "Allows higher prices." },
  esg: { title: "ESG", def: "Sustainability.", calc: "Eco Spend", tip: "Generates Carbon Credits." },
  board: { title: "Board Trust", def: "Job Security.", calc: "Strategic + Financial Score", tip: "0% = Fired." }
};

const ONBOARDING_SEQUENCE = [
  {
    id: 'welcome',
    type: 'modal',
    title: "Welcome to EVOLVE",
    subtitle: "The Survival Case Competition",
    desc: "You are the CEO. Your goal is not just profit—it's survival. Markets decay, rivals adapt, and the Board is watching.",
    icon: <Crown size={48} className="text-yellow-400 mb-4"/>
  },
  {
    id: 'objectives',
    type: 'modal',
    title: "Winning Conditions",
    subtitle: "Deliver Value or Be Fired",
    content: [
      { icon: <TrendingUp size={20} className="text-blue-400"/>, text: "Momentum: Valuation is sticky. Build a track record." },
      { icon: <ShieldCheck size={20} className="text-green-400"/>, text: "Resilience: If you fail, you get ONE bailout. Use it wisely." },
      { icon: <Target size={20} className="text-red-400"/>, text: "Rivalry: If you beat them on Brand, they will undercut you on Price." }
    ]
  },
  {
    id: 'tour_news',
    type: 'highlight',
    target: 'news-ticker',
    title: "Market Intelligence",
    desc: "Look here first! This ticker shows global events and your Rival's strategy shift. Ignore it at your peril."
  },
  {
    id: 'tour_kpi',
    type: 'highlight',
    target: 'kpi-row',
    title: "The Dashboard",
    desc: "Your vitals. Valuation tracks score. Cash tracks survival. If Cash hits 0, game over."
  },
  {
    id: 'tour_growth',
    type: 'highlight',
    target: 'main-chart',
    title: "Growth History",
    desc: "Visualizes your Valuation trajectory. Ideally, this line should go up and to the right."
  },
  {
    id: 'tour_pnl',
    type: 'highlight',
    target: 'pnl-chart',
    title: "Profit & Loss",
    desc: "Green is Revenue, Red is Expense. If Red > Green, find out why (Interest? Waste? Fines?)."
  },
  {
    id: 'tour_share',
    type: 'highlight',
    target: 'share-chart',
    title: "Market Share",
    desc: "You vs. The Rival. If this shrinks, your brand is weak or your price is too high."
  },
  {
    id: 'tour_ops',
    type: 'highlight',
    target: 'ops-health',
    title: "Operational Health",
    desc: "The 'Check Engine' lights. Low Trust = Fired. Low Health = Defects. Low Morale = Strikes."
  },
  {
    id: 'tour_inv',
    type: 'highlight',
    target: 'inventory',
    title: "Inventory Trap",
    desc: "Unsold goods cost money to store. If this number gets high, use the 'Clearance' button to liquidate cash."
  },
  {
    id: 'tour_controls',
    type: 'highlight',
    target: 'sidebar',
    title: "Control Panel",
    desc: "This is where you play. Enter your budget in millions. Toggle between 'Growth' and 'Ops' tabs.",
    placement: 'right' 
  },
  {
    id: 'tour_dilemma',
    type: 'highlight',
    target: 'dilemma',
    title: "The Decision",
    desc: "Each year brings a critical Dilemma. These choices have long-term consequences on culture and brand."
  },
  {
    id: 'tour_exec',
    type: 'highlight',
    target: 'execute',
    title: "Execute Turn",
    desc: "Once you are ready, lock it in. There is no undo button."
  }
];

const DILEMMAS = [
  {
    year: 1,
    title: "The Automation Paradox",
    desc: "Robots can replace 20% of staff. Efficiency vs. Morale?",
    options: [
      { label: "Aggressive Auto", cost: 10000000, autoMod: 0.15, moraleMod: -20, desc: "High Efficiency, Strike Risk" },
      { label: "Human-Centric", cost: 3000000, autoMod: 0.05, moraleMod: 10, desc: "Slower Growth, Happy Staff" }
    ]
  },
  {
    year: 2,
    title: "Supply Chain Ethics",
    desc: "A cheaper supplier uses questionable labor practices.",
    options: [
      { label: "Cheap Supplier", cost: 0, costMod: 0.9, esgMod: -25, desc: "Lower Unit Costs, Bad ESG" },
      { label: "Ethical Supply", cost: 5000000, costMod: 1.05, esgMod: 15, desc: "Higher Costs, Brand Premium" }
    ]
  },
  {
    year: 3,
    title: "Crisis Management",
    desc: "The recession hits. Competitor slashed prices. Response?",
    options: [
      { label: "Price War", cost: 0, revMod: 0.85, volMod: 1.2, desc: "Slash Margins to keep Volume" },
      { label: "Quality Pivot", cost: 15000000, qualMod: 20, desc: "Invest in R&D to justify price" }
    ]
  },
  {
    year: 4,
    title: "Sustainability Push",
    desc: "New Carbon Tax introduced. Do we go Net Zero?",
    options: [
      { label: "Pay the Tax", cost: 2000000, esgMod: -5, desc: "Eat cost annually" },
      { label: "Green Retrofit", cost: 20000000, esgMod: 30, desc: "Huge CapEx, Passive Income later" }
    ]
  }
];

const formatMoney = (val) => `₹${(val / 1000000).toFixed(1)}M`;

// ==========================================
// 2. UI COMPONENTS
// ==========================================

const GameManual = ({ onClose }) => (
  <div 
    className="fixed inset-0 z-[60] bg-white text-slate-900 overflow-y-auto animate-in slide-in-from-bottom-10 select-none"
    onContextMenu={(e) => e.preventDefault()} 
  >
    <style>{`@media print { body { display: none; } }`}</style>
    <div className="max-w-4xl mx-auto p-12 relative">
      <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-red-500"><X size={32}/></button>
      
      <div className="flex justify-between items-end border-b-4 border-black pb-6 mb-12">
        <div>
          <h1 className="text-5xl font-black mb-2 uppercase tracking-tight">Executive Handbook</h1>
          <p className="text-xl text-slate-500 font-serif italic">CONFIDENTIAL: FOR CEO EYES ONLY</p>
        </div>
        <div className="flex items-center gap-2 text-red-500 font-bold border border-red-200 bg-red-50 px-3 py-1 rounded text-xs uppercase">
            <Ban size={14}/> Do Not Distribute
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Target className="text-blue-600"/> 1. The Objective</h2>
          <p className="mb-4 text-slate-700">Your tenure lasts <strong>5 Years</strong>. Your performance is judged on a weighted score of Growth, Resilience, and Responsibility.</p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
            <li><strong>Valuation (40%):</strong> Market Cap driven by Net Profit & P/E Ratio.</li>
            <li><strong>Resilience (20%):</strong> Avoiding bankruptcy, debt traps, and bailouts.</li>
            <li><strong>Strategy (20%):</strong> High Brand, Quality, and Market Share.</li>
            <li><strong>Responsibility (20%):</strong> High ESG, Morale, and Board Trust.</li>
          </ul>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><AlertTriangle className="text-red-600"/> Critical Warning</h2>
          <p className="text-sm text-slate-700 mb-2"><strong>The Red Queen Effect:</strong> Every year, your Brand and Quality scores decay by 10% naturally. If you stop investing, you will shrink.</p>
          <p className="text-sm text-slate-700"><strong>The Cash Cap:</strong> You cannot produce more units than your current cash can buy in raw materials. Watch your liquidity.</p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><LayoutDashboard className="text-blue-600"/> 2. Strategic Levers</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="border p-4 rounded-lg">
            <h3 className="font-bold mb-2">Growth Engine</h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li><strong>Automation (CapEx):</strong> Reduces Unit Cost but lowers Morale.</li>
              <li><strong>Marketing:</strong> Increases Brand Awareness and Demand.</li>
              <li><strong>R&D:</strong> Increases Quality, allowing premium pricing.</li>
            </ul>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="font-bold mb-2">Operations Core</h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li><strong>Training:</strong> Boosts Morale and offsets Automation risks.</li>
              <li><strong>Maintenance:</strong> Keeps Machine Health high (prevents defects).</li>
              <li><strong>Logistics:</strong> Reduces Unit Costs via supply chain efficiency.</li>
            </ul>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="font-bold mb-2">Finance & Data</h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li><strong>Analytics:</strong> Improves Forecast Accuracy (fewer stockouts).</li>
              <li><strong>Debt Repay:</strong> Reduces Interest payments.</li>
              <li><strong>Dividends:</strong> Boosts Board Trust (but drains Cash).</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-2xl text-center">
        <h3 className="text-2xl font-bold mb-2">The Bailout Protocol</h3>
        <p className="text-slate-300 max-w-2xl mx-auto">If you fail (Insolvency or Firing), the Board may offer <strong>ONE</strong> bailout. Accepting it saves the company but locks Dividends forever and applies a massive score penalty.</p>
      </div>
    </div>
  </div>
);

const OnboardingOverlay = ({ stepIndex, onNext, onSkip }) => {
  const step = ONBOARDING_SEQUENCE[stepIndex];
  
  // DYNAMIC TRACKING LOGIC
  const [rect, setRect] = useState(null);

  useLayoutEffect(() => {
    if (step.type !== 'highlight' || !step.target) {
        setRect(null);
        return;
    }

    const updateRect = () => {
        const el = document.getElementById(step.target);
        if (el) {
            const r = el.getBoundingClientRect();
            setRect({
                top: r.top - 8,
                left: r.left - 8,
                width: r.width + 16,
                height: r.height + 16,
            });
        } else {
          // Fallback if element not found: set rect to null but don't break
          setRect(null);
        }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    // Short timeout to allow rendering to settle
    const timer = setTimeout(updateRect, 100); 
    
    return () => {
        window.removeEventListener('resize', updateRect);
        clearTimeout(timer);
    };
  }, [stepIndex]); // Changed dependency to stepIndex to avoid object ref issues

  // MODAL STYLE (Welcome / Objectives)
  if (step.type === 'modal') {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-500">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <div className="mb-6 flex justify-center">{step.icon || <Flag size={48} className="text-blue-500 mb-4"/>}</div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{step.title}</h2>
          <p className="text-slate-400 text-lg mb-6 font-light">{step.subtitle}</p>
          {step.desc && <p className="text-slate-300 mb-8 leading-relaxed text-sm">{step.desc}</p>}
          {step.content && (
            <div className="space-y-3 mb-8 text-left">
              {step.content.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  {item.icon}
                  <span className="text-xs text-slate-200">{item.text}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button onClick={onNext} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
              {stepIndex === ONBOARDING_SEQUENCE.length - 1 ? "Start Simulation" : "Next"} <ChevronRight size={18}/>
            </button>
            <button onClick={onSkip} className="text-slate-500 text-xs hover:text-slate-300">Skip Intro</button>
          </div>
        </div>
      </div>
    );
  }

  // HIGHLIGHT STYLE (Dynamic) - Fallback Logic Added
  const isTargetFound = !!rect;
  
  // If target not found, show a centered modal instead of nothing (Fixing the "Step 10 button missing" issue)
  if (!isTargetFound) {
    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white text-slate-900 p-6 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative">
                <button onClick={onSkip} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><X size={20}/></button>
                <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold uppercase text-xs tracking-wider">
                    <Info size={14}/> Tutorial Guide
                </div>
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">{step.desc}</p>
                <div className="flex justify-between items-center">
                    <div className="text-[10px] text-slate-400 font-mono">Step {stepIndex + 1}/{ONBOARDING_SEQUENCE.length}</div>
                    <button onClick={onNext} className="bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                        {stepIndex === ONBOARDING_SEQUENCE.length - 1 ? "Start" : "Next"} <ChevronRight size={14}/>
                    </button>
                </div>
             </div>
        </div>
    );
  }

  // Determine text box position based on highlight position to avoid overlap
  const isLeft = rect.left < window.innerWidth / 2;
  const isTop = rect.top < window.innerHeight / 2;
  
  // FIXED LOGIC: Respect manual placement prop (e.g., 'right')
  let textStyles = {};

  if (step.placement === 'right') {
     textStyles = {
        top: Math.max(20, rect.top), 
        left: rect.left + rect.width + 20,
        width: 320 // Fixed width for sidebar tooltips
     };
  } else {
     textStyles = {
        top: isTop ? rect.top + rect.height + 20 : 'auto',
        bottom: !isTop ? window.innerHeight - rect.top + 20 : 'auto',
        left: isLeft ? rect.left : 'auto',
        right: !isLeft ? window.innerWidth - (rect.left + rect.width) : 'auto',
     };
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* THE DARKNESS WITH A HOLE */}
      <div 
        className="absolute w-full h-full transition-all duration-300 ease-out"
        style={{
          boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.75)`, 
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: '12px',
          pointerEvents: 'none' 
        }}
      ></div>

      {/* THE INFO CARD */}
      <div 
        className="absolute w-80 bg-white text-slate-900 p-5 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        style={textStyles}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{step.title}</h3>
          <button onClick={onSkip} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
        </div>
        <p className="text-slate-600 text-xs mb-4 leading-relaxed">{step.desc}</p>
        <div className="flex justify-between items-center">
          <div className="text-[10px] text-slate-400 font-mono">Step {stepIndex + 1}/{ONBOARDING_SEQUENCE.length}</div>
          <button onClick={onNext} className="bg-slate-900 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
            {stepIndex === ONBOARDING_SEQUENCE.length - 1 ? "Start" : "Next"} <ChevronRight size={12}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const TooltipCard = ({ kpiKey }) => {
  const data = KPI_DEFINITIONS[kpiKey];
  if (!data) return null;
  return (
    <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
      <div className="text-xs font-bold text-white mb-1">{data.title}</div>
      <div className="text-[10px] text-slate-300 mb-2 leading-relaxed">{data.def}</div>
      <div className="flex gap-2 items-start border-t border-slate-700 pt-2">
        <Lightbulb size={10} className="text-yellow-400 mt-0.5 shrink-0"/>
        <div className="text-[9px] text-yellow-100/80 italic">{data.tip}</div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, val, sub, icon, color, alert, kpiKey }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      className={`relative bg-slate-800/50 border ${alert ? 'border-red-500/50 animate-pulse' : 'border-slate-700'} p-3 rounded-lg flex items-center justify-between group hover:bg-slate-800 transition-all cursor-help h-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && kpiKey && <TooltipCard kpiKey={kpiKey} />}
      <div>
        <div className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-0.5 flex items-center gap-1">
          {icon} {title}
        </div>
        <div className="text-lg font-mono font-bold text-white leading-tight">{val}</div>
        <div className={`text-[10px] text-${color}-400`}>{sub}</div>
      </div>
    </div>
  );
};

const HealthBar = ({ label, value, color, threshold, kpiKey }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="mb-2 relative cursor-help" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isHovered && kpiKey && <TooltipCard kpiKey={kpiKey} />}
      <div className="flex justify-between text-[10px] mb-0.5 text-slate-300">
        <span className="flex items-center gap-1">{label} <Info size={8} className="opacity-50"/></span>
        <span className={value < threshold ? 'text-red-400 font-bold' : 'text-slate-400'}>{value.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700/50">
        <div className={`h-full transition-all duration-700 ${value < threshold ? 'bg-red-500' : color}`} style={{width: `${value}%`}}></div>
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN LOGIC
// ==========================================

export default function CompetitionFinal() {
  const [currentUser, setCurrentUser] = useState(null); // { id, role, hasPlayed, score }
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [screen, setScreen] = useState('login');
  const [teamName, setTeamName] = useState('');
  const [selectedInd, setSelectedInd] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [activeTab, setActiveTab] = useState('growth');
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showBailout, setShowBailout] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // ADMIN STATES
  const [adminData, setAdminData] = useState([]);
  const [generating, setGenerating] = useState(false);

  const [inputs, setInputs] = useState({ 
    capex: 0, rnd: 0, marketing: 0, 
    training: 0, maintenance: 0, logistics: 0, data: 0, debtPay: 0, dividend: 0 
  });
  
  const [dilemmaChoice, setDilemmaChoice] = useState(null);
  const [suggestion, setSuggestion] = useState(null);

  // --- AUTHENTICATION LOGIC ---

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Check if it's the Master Admin
      if (loginUser === "admin" && loginPass === "masterkey123") {
        setCurrentUser({ id: "admin", role: "admin" });
        setScreen('admin');
        fetchAdminData();
        setLoading(false);
        return;
      }

      // 2. Check Database for Team User
      const userRef = doc(db, "users", loginUser.toLowerCase());
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.password === loginPass) {
          if (userData.hasPlayed) {
            setError("This ID has already completed the simulation.");
          } else {
            setCurrentUser({ id: loginUser, role: "team", ...userData });
            setTeamName(loginUser.toUpperCase());
            setScreen('select');
          }
        } else {
          setError("Invalid Password.");
        }
      } else {
        setError("User ID not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Connection Error. Check Internet.");
    }
    setLoading(false);
  };

  // --- ADMIN PANEL LOGIC ---

  const fetchAdminData = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    // Sort: Played first, then by Score descending
    data.sort((a, b) => b.score - a.score);
    setAdminData(data);
  };

  const generateTeams = async () => {
    if (!window.confirm("WARNING: This will overwrite existing users. Continue?")) return;
    setGenerating(true);
    const batch = writeBatch(db);

    // Create 30 Teams
    for (let i = 1; i <= 30; i++) {
      const id = `team${String(i).padStart(2, '0')}`;
      const password = Math.floor(1000 + Math.random() * 9000).toString();
      const userRef = doc(db, "users", id);
      batch.set(userRef, {
        password: password,
        hasPlayed: false,
        score: 0,
        industry: "N/A",
        lastActive: new Date().toISOString()
      });
    }

    await batch.commit();
    await fetchAdminData();
    setGenerating(false);
    alert("30 Teams Generated Successfully!");
  };

  const uploadResult = async (finalState, failureReason = null) => {
    if (currentUser.role === 'admin') return; // Admin runs don't save
    
    const score = calculateScore(finalState); // Pass state explicitly
    const userRef = doc(db, "users", currentUser.id);
    
    try {
      await updateDoc(userRef, {
        hasPlayed: true,
        score: score,
        industry: selectedInd.name,
        valuation: finalState.valuation,
        failCause: failureReason || "Completed",
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error saving score:", e);
    }
  };

  // --- GAME LOGIC ---

  const initGame = (indKey) => {
    const ind = INDUSTRIES[indKey];
    setSelectedInd(ind);
    
    setGameState({
      year: 0,
      cash: ind.startingCash,
      debt: 20000000,
      revenue: 0,
      netProfit: 0,
      valuation: ind.baseValuation,
      
      automation: 0.1,
      quality: 50,
      brand: 50,
      esg: 50,
      esgReputation: 50,
      morale: 80,
      machineHealth: 100,
      
      boardTrust: 100,
      boardTrustHistory: [100, 100, 100], 
      
      rivalBrand: 50,
      rivalCost: 100,
      rivalStrategy: "Balanced",
      
      supplyChainScore: 50,
      dataLevel: 0,
      inventory: 0,
      marketShare: 10,
      
      consultantsUsed: 0,
      oracleUsed: 0,
      bailoutUsed: false,
      lastDividendYear: -5,
      
      history: [{
        year: 0,
        revenue: 0,
        netProfit: 0,
        valuation: ind.baseValuation,
        expenseBreakdown: { cogs: 0, fixedCost: 0, interest: 0 }
      }],
      lastEvent: { name: "Market Open", desc: "Operations begin." },
      lastWarning: null,
      failureReason: null
    });
    setScreen('dashboard');
    setShowTutorial(true);
  };

  const nextTutorial = () => {
    if (tutorialStep < ONBOARDING_SEQUENCE.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const getEvent = (year, name) => {
    if (MANDATORY_EVENTS[year]) return MANDATORY_EVENTS[year];
    let seed = 0;
    const str = name + year;
    for (let i = 0; i < str.length; i++) seed += str.charCodeAt(i);
    const index = seed % EVENT_POOL.length;
    return EVENT_POOL[index];
  };

  const acceptBailout = () => {
    const s = gameState;
    setGameState({
        ...s,
        cash: 30000000, 
        debt: s.debt + 50000000, 
        valuation: s.valuation * 0.5, 
        boardTrust: 50, 
        bailoutUsed: true, 
        failureReason: null
    });
    setShowBailout(false);
    alert("BAILOUT ACCEPTED. Strict oversight active. Dividends are now LOCKED.");
  };

  const hireConsultant = () => {
    if(gameState.cash < 2000000) return alert("Insufficient funds (Cost: ₹2M)");
    const s = gameState;
    let advice = "";
    if(s.cash < 10000000) advice = "Liquidity Crisis! Liquidate inventory or borrow.";
    else if(s.boardTrust < 60) advice = "Board angry. Improve margin or pay dividends.";
    else if(s.inventory > 40000) advice = "Overproduction. Data Analytics needed.";
    else if(s.morale < 50) advice = "Strike imminent. Training needed.";
    else advice = "Stable. Maximize Auto & Mktg.";

    setGameState({ ...s, cash: s.cash - 2000000, consultantsUsed: s.consultantsUsed + 1 });
    setSuggestion(advice);
  };

  const hireOracle = () => {
    if(gameState.cash < 15000000) return alert("Insufficient funds for Oracle (Cost: ₹15M)");
    const s = gameState;
    const availableCash = s.cash - 15000000;
    let remainingBudget = availableCash - 5000000; 
    const newInputs = { capex: 0, rnd: 0, marketing: 0, training: 0, maintenance: 0, logistics: 0, data: 0, debtPay: 0, dividend: 0 };
    
    const errorMargin = 0.3 - (s.dataLevel / 100 * 0.25);
    const randomError = 1 + (Math.random() * errorMargin * (Math.random() > 0.5 ? 1 : -1));
    remainingBudget *= randomError;

    if (s.boardTrust < 70 && !s.bailoutUsed) { newInputs.dividend = 5; remainingBudget -= 5000000; }
    if (s.machineHealth < 80) { const spend = 2; newInputs.maintenance = spend; remainingBudget -= spend*1000000; }
    if (remainingBudget > 0) {
        if (s.inventory > 20000) { newInputs.marketing = (remainingBudget * 0.5) / 1000000; newInputs.data = (remainingBudget * 0.5) / 1000000; } 
        else { newInputs.capex = (remainingBudget * 0.4) / 1000000; newInputs.marketing = (remainingBudget * 0.4) / 1000000; newInputs.rnd = (remainingBudget * 0.2) / 1000000; }
    }
    setInputs(newInputs);
    setGameState({ ...s, cash: availableCash, oracleUsed: s.oracleUsed + 1 });
    setSuggestion(`THE ORACLE: Strategy optimized. (Confidence: ${((1-errorMargin)*100).toFixed(0)}%)`);
  };

  const liquidateInventory = (discount) => {
    if (gameState.inventory <= 0) return alert("No inventory.");
    const brandHit = discount === 0.5 ? 15 : 5;
    if (!window.confirm(`Sell inventory at ${Math.round((1-discount)*100)}% off? Brand Trust -${brandHit}.`)) return;
    const s = gameState;
    const rev = s.inventory * selectedInd.unitPrice * discount;
    setGameState({ ...s, inventory: 0, cash: s.cash + rev, brand: Math.max(0, s.brand - brandHit), revenue: s.revenue + rev });
    alert(`Generated: ${formatMoney(rev)}`);
  };

  const runTurn = () => {
    const s = gameState;
    const i = inputs;
    const ind = selectedInd;

    if (s.year < 4 && !dilemmaChoice) return alert("Strategic Decision Required!");
    
    if (s.bailoutUsed && i.dividend > 0) {
        return alert("BAILOUT RESTRICTION: You cannot pay dividends while under Board oversight.");
    }

    const totalSpend = Object.values(i).reduce((a,b) => a+b, 0) * 1000000;
    const dilemmaCost = dilemmaChoice ? dilemmaChoice.cost : 0;
    if ((totalSpend + dilemmaCost) > s.cash) return alert(`Insufficient Liquidity.`);

    const d = dilemmaChoice || {};
    const event = getEvent(s.year, teamName);

    // --- LOGIC ENGINE ---
    let eventMod = { COST: 1, DEMAND: 1, CAPACITY: 1, MORALE: 0, TRUST: 0, QUALITY: 0, BRAND: 0 };

    if (event.effects) {
      event.effects.forEach(eff => {
        if (eff.type === "CONDITIONAL_CASH") return;

        if (eff.type === "COST" || eff.type === "DEMAND" || eff.type === "CAPACITY") {
          eventMod[eff.type] *= eff.val;   // MULTIPLY
        } else {
          eventMod[eff.type] += eff.val;   // ADD
        }
      });
    }

    let newRivalBrand = s.rivalBrand;
    let newRivalCost = s.rivalCost;
    let rivalStrat = "Balanced";
    if (s.brand > s.rivalBrand * 1.1) { newRivalCost *= 0.92; rivalStrat = "Price War"; } 
    else { newRivalBrand *= 1.08; rivalStrat = "Brand Blitz"; }

    const decayFactor = 0.90; 
    let currentBrand = s.brand * decayFactor;
    let currentQuality = s.quality * decayFactor;

    let dataBoost = i.data * 2; 
    let newDataLevel = Math.min(100, s.dataLevel + dataBoost);

    const autoGain = i.capex / 100; 
    let newAuto = Math.min(0.95, s.automation + autoGain + (d.autoMod || 0));
    let newMorale = Math.max(0, Math.min(100, s.morale - (autoGain * 150) + (i.training/5) + (eventMod.MORALE || 0)));
    let newHealth = Math.max(0, Math.min(100, s.machineHealth - 10 + (i.maintenance/5)));
    let newSupply = Math.min(100, s.supplyChainScore + (i.logistics/10));

    const rndEffect = Math.log1p(i.rnd) * 6; 
    const newQual = Math.min(100, currentQuality + rndEffect + (d.qualMod || 0) + (eventMod.QUALITY || 0));
    const esgDrag = s.esgReputation < 40 ? 0.95 : 1.0;
    const mktEffect = Math.sqrt(i.marketing) * 4 * esgDrag;
    const newBrand = Math.min(100, currentBrand + mktEffect + (eventMod.BRAND || 0));
    const newEsg = Math.min(100, s.esg + (d.esgMod || 0));
    const newEsgRep = (s.esgReputation + newEsg) / 2;

    let strikePenalty = newMorale < 40 ? 0.5 : 1.0;
    let machineFactor = newHealth < 50 ? 0.8 : 1.0;
    let theoreticalCapacity = 100000 * (1 + newAuto) * strikePenalty * (eventMod.CAPACITY || 1.0);
    let maxAffordableUnits = s.cash / (ind.baseCost * 0.4);
    let capacity = Math.min(theoreticalCapacity, maxAffordableUnits);

    let brandDiff = newBrand - newRivalBrand;
    let baseDemand = 100000;
    let dataBonus = 1 + (newDataLevel / 500); 
    
    // CORRECTED DEMAND LOGIC
    let marketDemand = baseDemand * (1 + (brandDiff/100)) * (newQual/50) * (eventMod.DEMAND || 1.0) * (d.volMod || 1.0) * dataBonus;
    
    let forecastError = 0.3 * (1 - (newDataLevel/100)); 
    let optimizedProduction = Math.min(capacity, marketDemand * (1 + forecastError));

    let totalAvailable = optimizedProduction + s.inventory;
    let salesVolume = Math.min(totalAvailable, marketDemand);
    let newInventory = Math.max(0, totalAvailable - marketDemand);
    let warehousingCost = newInventory * (s.year < 2 ? 50 : 100);

    let shareChange = (brandDiff / 2) + ((newQual*machineFactor - 50) / 4);
    if (brandDiff < -20) shareChange -= 5; 
    let newShare = Math.max(1, Math.min(99, s.marketShare + shareChange));

    let revenue = salesVolume * ind.unitPrice * (d.revMod || 1.0);
    let supplySavings = Math.min(100, newSupply);
    let unitCost = ind.baseCost * (1 - (newAuto * 0.3)) * (1 - (supplySavings/200)) * (eventMod.COST || 1.0);
    let cogs = salesVolume * unitCost;
    
    let newDebt = Math.max(0, s.debt - (i.debtPay * 1000000));
    let baseInterest = newDebt > 90000000 ? 0.18 : newDebt > 60000000 ? 0.14 : 0.10;
    let esgDiscount = newEsgRep > 80 ? 0.02 : 0; 
    let interestRate = Math.max(0.05, baseInterest - esgDiscount);
    let interest = newDebt * interestRate;
    
    let dividendPaid = s.bailoutUsed ? 0 : i.dividend * 1000000;
    let fixedCost = 15000000;
    let regFine = newEsg < 30 && Math.random() > 0.7 ? 5000000 : 0;
    let eventCash = event.effects ? event.effects.filter(e => e.type === "CASH" || (e.type === "CONDITIONAL_CASH" && e.condition(s))).reduce((a,b)=>a+b.val,0) : 0;

    let totalExpenses = cogs + fixedCost + warehousingCost + interest + regFine + (d.cost || 0);
    let netProfit = revenue - totalExpenses + eventCash;
    let investSpend = (i.capex + i.rnd + i.marketing + i.training + i.maintenance + i.logistics + i.data) * 1000000;
    let newCash = s.cash + netProfit - investSpend - dividendPaid - (i.debtPay * 1000000);
    
    let margin = (netProfit / revenue) * 100;
    let peRatio = margin < 5 ? 3 : margin > 20 ? 7 : 5;
    let currentValuation = ind.baseValuation + (netProfit * peRatio);
    let newValuation = (s.valuation * 0.6) + (currentValuation * 0.4);

    let trustChange = netProfit < 0 ? -10 : 5;
    if (dividendPaid > 0) trustChange += (s.year - s.lastDividendYear === 1) ? 5 : 10;
    if (newDebt > 80000000) trustChange -= 5;
    let newBoardTrust = Math.max(0, Math.min(100, s.boardTrust + trustChange + (eventMod.TRUST || 0)));
    const newTrustHistory = [...s.boardTrustHistory, newBoardTrust].slice(-3);
    const avgTrust = newTrustHistory.reduce((a,b)=>a+b,0) / newTrustHistory.length;

    let warning = null;
    let failure = null;

    if (capacity < theoreticalCapacity) warning = "Warning: Production capped by low cash!";
    else if (newInventory > 40000) warning = "Warning: Inventory piling up.";
    else if (regFine > 0) warning = "Warning: Fined 5M for poor ESG practices.";
    
    if (avgTrust < 30) failure = "Governance Failure: The Board has fired you.";
    else if (newCash < -10000000) failure = "Insolvency: The company is bankrupt.";
    else if (newMorale < 20 && s.morale < 20) failure = "Labor Revolt: Extended strikes have shut down the plant.";
    else if (newHealth < 20) failure = "Catastrophic Failure: Factory assets condemned.";

    const newState = {
      ...s, year: s.year + 1, cash: newCash, debt: newDebt, revenue, netProfit, valuation: newValuation,
      automation: newAuto, quality: newQual, brand: newBrand, esg: newEsg, esgReputation: newEsgRep, morale: newMorale, 
      machineHealth: newHealth, supplyChainScore: supplySavings, dataLevel: newDataLevel, inventory: newInventory,
      marketShare: newShare, boardTrust: newBoardTrust, boardTrustHistory: newTrustHistory, 
      rivalBrand: newRivalBrand, rivalCost: newRivalCost, rivalStrategy: rivalStrat, lastDividendYear: dividendPaid > 0 ? s.year : s.lastDividendYear,
      lastEvent: event, lastWarning: warning, failureReason: failure,
      expenseBreakdown: { cogs, fixedCost, interest, warehousingCost, regFine },
      audit: { dilemmaChoice: d.label || "N/A", inputs: { ...i }, event: event.name, profit: netProfit }
    };

    if (failure && !s.bailoutUsed) {
        setGameState({ ...s, failureReason: failure });
        setShowBailout(true);
        return;
    }

    if (failure && s.bailoutUsed) { 
        uploadResult(newState, failure);
        setGameState({...newState, history: [...s.history, newState]});
        setScreen('report'); 
        return;
    }

    if (newState.year >= 5) { 
        uploadResult(newState, "Completed");
        setGameState({...newState, history: [...s.history, newState]});
        setScreen('report'); 
        return;
    }

    setGameState({...newState, history: [...s.history, newState]});
    setInputs({ capex: 0, rnd: 0, marketing: 0, training: 0, maintenance: 0, logistics: 0, data: 0, debtPay: 0, dividend: 0 });
    setDilemmaChoice(null);
    setSuggestion(warning);
  };

  const calculateScore = (finalState) => {
    // If called without state, use current gameState
    const end = finalState || gameState;
    const initialVal = selectedInd.baseValuation;
    const growth = Math.min(40, Math.max(0, ((end.valuation - initialVal) / initialVal) * 100)); 
    const resScore = (end.history.filter(h => h.netProfit > 0).length * 4); 
    const socialScore = (end.morale + end.esgReputation) / 200 * 20;
    const penalty = (end.oracleUsed * 15) + (end.consultantsUsed * 5) + (end.bailoutUsed ? 30 : 0);
    const resilienceBonus = !end.bailoutUsed && end.year >= 5 ? 10 : 0;
    
    let total = growth + resScore + socialScore + resilienceBonus - penalty;
    if (end.cash < 0) total = Math.min(total, 35); 
    if (end.failureReason) total = Math.min(total, 20); 
    return Math.max(0, Math.min(100, Math.floor(total)));
  };

  // ==========================================
  // RENDER: LOGIN SCREEN
  // ==========================================
  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Factory size={48} className="mx-auto text-blue-500 mb-4"/>
            <h1 className="text-3xl font-black uppercase tracking-wider">Factory Sim</h1>
            <p className="text-slate-400 text-sm">Case Study Competition</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Team ID</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-slate-500"/>
                <input type="text" value={loginUser} onChange={e=>setLoginUser(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-3 pl-10 text-white focus:border-blue-500 outline-none" placeholder="e.g. team01" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Access Code</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-3.5 text-slate-500"/>
                <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-3 pl-10 text-white focus:border-blue-500 outline-none" placeholder="••••" />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center font-bold bg-red-500/10 p-2 rounded">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition-all flex justify-center items-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : "Enter Simulation"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: ADMIN DASHBOARD
  // ==========================================
  if (screen === 'admin') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3"><LayoutDashboard/> ADMIN COMMAND CENTER</h1>
            <button onClick={()=>{setScreen('login'); setCurrentUser(null)}} className="text-red-600 font-bold flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded"><LogOut size={16}/> Logout</button>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="text-sm text-slate-500 font-bold uppercase mb-2">Simulation Status</div>
              <div className="text-4xl font-black text-blue-600">{adminData.filter(u => u.hasPlayed).length} / 30</div>
              <div className="text-xs text-slate-400 mt-1">Teams Completed</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="text-sm text-slate-500 font-bold uppercase mb-2">Highest Valuation</div>
              <div className="text-4xl font-black text-green-600">{adminData.length > 0 ? formatMoney(Math.max(...adminData.map(u=>u.valuation || 0))) : "₹0"}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center gap-2">
               <button onClick={generateTeams} disabled={generating} className="w-full bg-slate-900 text-white py-2 rounded font-bold flex items-center justify-center gap-2 hover:bg-slate-700">
                 {generating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Users size={16}/> Generate 30 Teams</>}
               </button>
               <button onClick={fetchAdminData} className="w-full bg-white border border-slate-300 text-slate-600 py-2 rounded font-bold flex items-center justify-center gap-2 hover:bg-slate-50">
                 <RefreshCw size={16}/> Refresh Data
               </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold text-slate-600">Team ID</th>
                  <th className="p-4 font-bold text-slate-600">Password</th>
                  <th className="p-4 font-bold text-slate-600">Status</th>
                  <th className="p-4 font-bold text-slate-600">Score</th>
                  <th className="p-4 font-bold text-slate-600">Outcome</th>
                  <th className="p-4 font-bold text-slate-600">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminData.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-blue-600">{user.id}</td>
                    <td className="p-4 font-mono text-slate-400">{user.password}</td>
                    <td className="p-4">
                      {user.hasPlayed ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Completed</span> : <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs font-bold">Pending</span>}
                    </td>
                    <td className="p-4 font-bold text-lg">{user.score || "-"}</td>
                    <td className="p-4 text-xs">{user.failCause || "-"}</td>
                    <td className="p-4 font-mono">{user.valuation ? formatMoney(user.valuation) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: REPORT CARD
  // ==========================================
  if (screen === 'report' && gameState) {
      const score = calculateScore();
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
              <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
                  <div className="text-center mb-8">
                      <Trophy className="mx-auto text-yellow-400 mb-4 h-16 w-16" />
                      <h1 className="text-4xl font-black mb-2 uppercase">Performance Review</h1>
                      <div className="text-xl text-slate-400">ID: {currentUser.id} | Industry: {selectedInd.name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center">
                          <div className="text-sm font-bold text-slate-400 uppercase mb-2">Final Score</div>
                          <div className="text-6xl font-black text-white">{score}<span className="text-2xl text-slate-500">/100</span></div>
                           {currentUser.role !== 'admin' && (
                              <div className="mt-4 bg-green-500/20 text-green-400 p-2 rounded text-xs font-bold border border-green-500/30 flex items-center justify-center gap-2">
                                  <CheckCircle size={12}/> Score Logged to Database
                              </div>
                          )}
                      </div>
                      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col justify-center space-y-4">
                          <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm">Final Valuation</span>
                              <span className="font-mono font-bold text-blue-400">{formatMoney(gameState.valuation)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm">Total Revenue</span>
                              <span className="font-mono font-bold text-green-400">{formatMoney(gameState.history.reduce((a,b)=>a+b.revenue,0))}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm">Outcome</span>
                              <span className={`font-bold ${gameState.failureReason ? 'text-red-500' : 'text-emerald-500'}`}>
                                  {gameState.failureReason ? "Terminated" : "Contract Renewed"}
                              </span>
                          </div>
                      </div>
                  </div>

                  {gameState.failureReason && (
                      <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl mb-8 flex items-center gap-4 text-red-200">
                          <AlertTriangle className="shrink-0"/>
                          <div>
                              <div className="font-bold">Termination Cause</div>
                              <div className="text-sm">{gameState.failureReason}</div>
                          </div>
                      </div>
                  )}

                  <button 
                      onClick={() => {setScreen('login'); setCurrentUser(null);}} 
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                      <LogOut /> Log Out
                  </button>
              </div>
          </div>
      );
  }

  // ==========================================
  // VIEW: DASHBOARD
  // ==========================================
  if (screen === 'dashboard' && gameState) {
    const currentDilemma = DILEMMAS[gameState.year];
    const ind = selectedInd;
    const theme = YEAR_THEMES[gameState.year];
    const currentInputSpend = Object.values(inputs).reduce((a,b) => a+b, 0) * 1000000;
    const totalProjectedSpend = currentInputSpend + (dilemmaChoice ? dilemmaChoice.cost : 0);
    const margin = gameState.revenue > 0 ? (gameState.netProfit / gameState.revenue) * 100 : 0;

    const marketData = [
      { name: 'You', value: gameState.marketShare, color: '#3b82f6' },
      { name: 'Rival', value: 100 - gameState.marketShare, color: '#475569' },
    ];

    const pnlData = gameState.history.map(h => ({
        year: h.year,
        Revenue: h.revenue,
        Expenses: (h.expenseBreakdown?.cogs || 0) + (h.expenseBreakdown?.fixedCost || 0) + (h.expenseBreakdown?.interest || 0)
    }));

    const showOps = gameState.year > 0;

    return (
      <div className="h-screen bg-slate-950 text-white font-sans flex flex-col overflow-hidden relative">
        
        {showTutorial && <OnboardingOverlay stepIndex={tutorialStep} onNext={nextTutorial} onSkip={() => setShowTutorial(false)} />}
        {showManual && <GameManual onClose={() => setShowManual(false)} />}

        {/* BAILOUT MODAL */}
        {showBailout && (
            <div className="fixed inset-0 z-50 bg-red-900/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                <div className="max-w-md w-full bg-slate-900 border-2 border-red-500 p-8 rounded-2xl shadow-2xl text-center">
                    <Siren size={64} className="text-red-500 mx-auto mb-4 animate-pulse"/>
                    <h2 className="text-3xl font-black text-white mb-2">CRITICAL FAILURE</h2>
                    <p className="text-red-200 text-lg mb-4 font-bold">{gameState.failureReason}</p>
                    <p className="text-slate-400 text-sm mb-8">The Board is offering ONE lifeline. Accept a massive equity dilution and strict oversight to continue, or resign now.</p>
                    <div className="flex gap-4">
                        <button onClick={() => setScreen('report')} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold">Resign (Game Over)</button>
                        <button onClick={acceptBailout} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><LifeBuoy size={18}/> Accept Bailout</button>
                    </div>
                </div>
            </div>
        )}

        <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 overflow-hidden shrink-0 justify-between" id="news-ticker">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-500 shrink-0 mr-4"><Newspaper size={14}/> NEWS:</div>
                <div className="text-xs text-slate-300 font-mono whitespace-nowrap animate-pulse">
                    {gameState.lastEvent.desc} | RIVAL: {gameState.rivalStrategy.toUpperCase()}
                </div>
            </div>
            <div id="year-theme" className="text-xs text-blue-400 font-bold flex items-center gap-2">
                <Target size={14}/> YEAR {gameState.year + 1}: {theme.title.toUpperCase()}
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR */}
            <div id="sidebar" className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto shrink-0">
                <div className="p-4 border-b border-slate-800 shrink-0">
                    <h2 className="text-sm font-bold flex items-center gap-2 text-white"><LayoutDashboard className="text-blue-500" size={16}/> CONTROLS</h2>
                    <div className="text-[10px] text-slate-500 mt-1">Capital Allocation (Millions)</div>
                </div>
                <div className="flex border-b border-slate-800 shrink-0">
                    <button onClick={()=>setActiveTab('growth')} className={`flex-1 py-2 text-[10px] font-bold ${activeTab==='growth'?'bg-slate-800 text-blue-400 border-b-2 border-blue-400':'text-slate-500'}`}>GROWTH</button>
                    <button onClick={()=>setActiveTab('ops')} disabled={!showOps} className={`flex-1 py-2 text-[10px] font-bold ${activeTab==='ops'?'bg-slate-800 text-green-400 border-b-2 border-green-400': showOps ? 'text-slate-500' : 'text-slate-700 cursor-not-allowed'}`}>
                        {showOps ? 'OPS' : <span className="flex items-center justify-center gap-1"><Lock size={10}/> OPS</span>}
                    </button>
                </div>
                <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                    {activeTab === 'growth' ? (
                        <>
                        <InputGroup label="Automation" sub="Efficiency" icon={<Factory size={14}/>} val={inputs.capex} setVal={(v)=>setInputs({...inputs, capex:v})} />
                        <InputGroup label="Marketing" sub="Brand Demand" icon={<Megaphone size={14}/>} val={inputs.marketing} setVal={(v)=>setInputs({...inputs, marketing:v})} />
                        <InputGroup label="R&D" sub="Quality Premium" icon={<Zap size={14}/>} val={inputs.rnd} setVal={(v)=>setInputs({...inputs, rnd:v})} />
                        </>
                    ) : (
                        <>
                        <InputGroup label="Training" sub="Boost Morale" icon={<GraduationCap size={14}/>} val={inputs.training} setVal={(v)=>setInputs({...inputs, training:v})} />
                        <InputGroup label="Maintenance" sub="Asset Health" icon={<Wrench size={14}/>} val={inputs.maintenance} setVal={(v)=>setInputs({...inputs, maintenance:v})} />
                        <InputGroup label="Logistics" sub="Reduce Cost" icon={<Truck size={14}/>} val={inputs.logistics} setVal={(v)=>setInputs({...inputs, logistics:v})} />
                        <InputGroup label="Analytics" sub="Forecast" icon={<Database size={14}/>} val={inputs.data} setVal={(v)=>setInputs({...inputs, data:v})} />
                        <InputGroup label="Debt Repay" sub="Cut Interest" icon={<CreditCard size={14}/>} val={inputs.debtPay} setVal={(v)=>setInputs({...inputs, debtPay:v})} />
                        <InputGroup label="Dividend" sub="Boost Board" icon={<ArrowRight size={14}/>} val={inputs.dividend} setVal={(v)=>setInputs({...inputs, dividend:v})} lock={gameState.bailoutUsed} />
                        </>
                    )}
                </div>
                <div id="execute" className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
                    <div className="flex justify-between items-center mb-2 text-[10px]">
                        <span className="text-slate-400">Total Outflow:</span>
                        <span className={`font-mono ${totalProjectedSpend > gameState.cash ? 'text-red-500' : 'text-white'}`}>{formatMoney(totalProjectedSpend)}</span>
                    </div>
                    <button onClick={runTurn} disabled={gameState.year < 4 && !dilemmaChoice} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded shadow-lg disabled:opacity-50">
                        Execute Year {gameState.year + 1}
                    </button>
                    <button onClick={() => setShowManual(true)} className="w-full mt-2 py-2 border border-slate-700 hover:bg-slate-800 text-xs text-slate-400 rounded flex items-center justify-center gap-2">
                        <BookOpen size={12}/> Game Manual
                    </button>
                </div>
            </div>

            {/* MAIN DASHBOARD */}
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
                <div id="kpi-row" className="grid grid-cols-4 gap-4 mb-4 shrink-0 h-20">
                    <MetricCard title="Valuation" val={formatMoney(gameState.valuation)} sub="Market Cap" icon={<TrendingUp/>} color="blue" kpiKey="valuation" />
                    <MetricCard title="Liquid Cash" val={formatMoney(gameState.cash)} sub="Runway" icon={<DollarSign/>} color={gameState.cash<5000000?'red':'emerald'} alert={gameState.cash<5000000} kpiKey="cash" />
                    <MetricCard title="Net Profit" val={formatMoney(gameState.netProfit)} sub="Annual" icon={<Activity/>} color={gameState.netProfit<0?'red':'green'} kpiKey="valuation" />
                    <MetricCard title="Net Margin" val={`${margin.toFixed(1)}%`} sub="Profitability" icon={<Percent/>} color={margin<10?'yellow':'blue'} kpiKey="margin" />
                </div>

                <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 mb-4">
                    <div id="main-chart" className="col-span-5 bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase">Growth Trend</h3>
                            {suggestion && <span className="text-[9px] text-yellow-400 bg-yellow-900/20 px-2 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1"><AlertOctagon size={8}/> {suggestion}</span>}
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={gameState.history}>
                                    <defs><linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="year" stroke="#475569" style={{fontSize:'9px'}} />
                                    <YAxis stroke="#475569" tickFormatter={(v)=>`${v/1e6}M`} width={30} style={{fontSize:'9px'}}/>
                                    <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize:'10px'}} />
                                    <Area type="monotone" dataKey="valuation" stroke="#3b82f6" fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div id="pnl-chart" className="col-span-4 bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Revenue vs Expense</h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pnlData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="year" stroke="#475569" style={{fontSize:'9px'}} />
                                    <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize:'10px'}} />
                                    <Bar dataKey="Revenue" fill="#10b981" radius={[4,4,0,0]} />
                                    <Bar dataKey="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div id="share-chart" className="col-span-3 bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Market Share</h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={marketData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                                        {marketData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center text-xs text-blue-400 font-bold">{gameState.marketShare.toFixed(1)}%</div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4 h-32 shrink-0">
                    <div id="ops-health" className="col-span-4 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Operational Health</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <HealthBar label="Board Confidence" value={gameState.boardTrust} color="bg-yellow-500" threshold={30} kpiKey="board" />
                            <HealthBar label="Machine Health" value={gameState.machineHealth} color="bg-blue-500" threshold={50} kpiKey="machineHealth" />
                            <HealthBar label="Workforce Morale" value={gameState.morale} color="bg-green-500" threshold={40} kpiKey="morale" />
                            <HealthBar label="ESG Score" value={gameState.esg} color="bg-purple-500" threshold={40} kpiKey="esg" />
                        </div>
                    </div>

                    <div id="inventory" className="col-span-3 relative bg-slate-900 border border-slate-800 p-3 rounded-xl group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="text-[9px] uppercase text-slate-400 font-bold">Inventory</div>
                                <div className={`text-xl font-mono font-bold ${gameState.inventory>20000?'text-red-500':'text-white'}`}>{gameState.inventory}</div>
                            </div>
                            <Box size={16} className="text-orange-400"/>
                        </div>
                        <div className="text-[9px] text-slate-500">Unsold Units. Costs Storage.</div>
                        {gameState.inventory > 1000 && (
                            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                <button onClick={()=>liquidateInventory(0.7)} className="bg-blue-600 text-white text-[9px] px-3 py-1 rounded w-24">Clearance (30% Off)</button>
                                <button onClick={()=>liquidateInventory(0.5)} className="bg-red-600 text-white text-[9px] px-3 py-1 rounded w-24">Fire Sale (50% Off)</button>
                            </div>
                        )}
                    </div>

                    <div id="advisors" className="col-span-2 bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col justify-center gap-2">
                        <button onClick={hireConsultant} className="bg-slate-800 hover:bg-slate-700 text-blue-300 text-[9px] py-1.5 rounded border border-blue-500/30 flex items-center justify-center gap-1 transition-all"><Lightbulb size={12}/> Advisor (-2M)</button>
                        <button onClick={hireOracle} className="bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50 text-[9px] py-1.5 rounded border border-yellow-500/30 flex items-center justify-center gap-1 transition-all"><Sparkles size={12}/> Auto (-15M)</button>
                    </div>

                    <div id="dilemma" className="col-span-3 bg-slate-900 border border-slate-800 p-3 rounded-xl overflow-y-auto">
                        {gameState.year < 4 && !dilemmaChoice ? (
                            <div className="animate-in fade-in">
                                <div className="flex items-center gap-1 text-indigo-400 font-bold mb-1 text-[9px]"><Scale size={10}/> DECISION</div>
                                <div className="text-[10px] text-white font-bold leading-tight mb-1">{currentDilemma.title}</div>
                                <div className="space-y-1">
                                    {currentDilemma.options.map((opt, i) => (
                                        <button key={i} onClick={() => setDilemmaChoice(opt)} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded text-left hover:border-indigo-400 transition-all">
                                            <div className="flex justify-between">
                                                <span className="text-[9px] text-white font-bold">{opt.label}</span>
                                                <span className="text-[9px] text-red-400">-{formatMoney(opt.cost)}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                <CheckCircle size={24} className="mb-1 text-emerald-900"/>
                                <div className="text-[10px]">Strategy Locked</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (screen === 'select') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-6xl w-full text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
             <div className="bg-slate-800 px-4 py-1 rounded-full text-xs font-mono text-slate-400">Logged in as: <span className="text-white font-bold">{currentUser.id}</span></div>
          </div>
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">EXECUTIVE SUITE</h1>
          <p className="text-slate-400 text-xl mb-12">Select your industry vertical.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {Object.values(INDUSTRIES).map(ind => (
              <button key={ind.id} onClick={() => initGame(ind.id)} className="group relative bg-slate-900 border border-slate-800 hover:border-blue-500 p-8 rounded-2xl text-left transition-all hover:-translate-y-2 hover:shadow-2xl">
                <div className="text-5xl mb-6 text-slate-600 group-hover:text-blue-400 transition-colors">{ind.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{ind.name}</h3>
                <div className="inline-block bg-slate-800 text-xs px-2 py-1 rounded mb-4 text-blue-300 border border-slate-700">{ind.type}</div>
                <p className="text-slate-400 mb-6 text-sm">{ind.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const InputGroup = ({ label, sub, val, setVal, icon, lock }) => (
  <div className={`flex justify-between items-center group ${lock ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex items-center gap-3">
      <div className="text-slate-500 group-hover:text-blue-400 transition-colors">{icon}</div>
      <div>
        <div className="text-[10px] font-bold text-slate-200 group-hover:text-white transition-colors">{label} {lock && <Lock size={8} className="inline ml-1 text-red-500"/>}</div>
        <div className="text-[8px] text-slate-500 uppercase tracking-wide">{sub}</div>
      </div>
    </div>
    <div className="relative w-20">
      <span className="absolute left-2 top-1.5 text-slate-500 text-[10px]">M</span>
      <input type="number" value={val} onChange={(e) => setVal(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-700 rounded py-1 pl-5 pr-2 text-right text-xs focus:border-blue-500 outline-none transition-all font-mono text-white" placeholder="0" />
    </div>
  </div>
);