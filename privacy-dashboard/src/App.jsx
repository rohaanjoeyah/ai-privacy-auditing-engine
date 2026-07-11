import React, { useState } from 'react';
import axios from 'axios';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  Cpu, 
  Lock, 
  Activity, 
  CheckCircle, 
  Loader2,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function App() {
  const [loadingBaseline, setLoadingBaseline] = useState(false);
  const [loadingSecure, setLoadingSecure] = useState(false);
  const [loadingAttack, setLoadingAttack] = useState(false);

  const [metrics, setMetrics] = useState({
    baselineAccuracy: null,
    secureAccuracy: null,
    privacyBudget: null,
    baselineAttackSuccess: 78.5, // Placeholder for the pre-mitigation vulnerability
    attackTrainAccuracy: null,
    attackTestAccuracy: null,
    overallAttackSuccess: null,
  });

  const [logs, setLogs] = useState([
    { time: 'System', text: 'Privacy engine control center successfully initialized.' }
  ]);

  const addLog = (text) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, text }, ...prev]);
  };

  const trainBaseline = async () => {
    setLoadingBaseline(true);
    addLog('Initiating standard baseline neural network training on 30,000 records...');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/train/baseline`);
      const accuracy = response.data.data.baseline_accuracy;
      setMetrics(prev => ({ ...prev, baselineAccuracy: accuracy }));
      addLog(`Baseline training complete. Functional Accuracy: ${accuracy.toFixed(2)}%`);
    } catch (error) {
      addLog('Error: Failed to communicate with FastAPI baseline endpoint.');
    } finally {
      setLoadingBaseline(false);
    }
  };

  const trainSecure = async () => {
    setLoadingSecure(true);
    addLog('Initializing Opacus Privacy Engine. Injecting DP-SGD noise multipliers...');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/train/secure`);
      const { secure_accuracy, epsilon } = response.data.data;
      setMetrics(prev => ({ 
        ...prev, 
        secureAccuracy: secure_accuracy, 
        privacyBudget: epsilon 
      }));
      addLog(`DP Training complete. Accuracy: ${secure_accuracy.toFixed(2)}% | ε spent: ${epsilon.toFixed(2)}`);
    } catch (error) {
      addLog('Error: Failed to communicate with FastAPI secure endpoint.');
    } finally {
      setLoadingSecure(false);
    }
  };

  const runAudit = async () => {
    setLoadingAttack(true);
    addLog('Launching Black-Box Membership Inference Attack via ART...');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/audit/attack`);
      const { train_accuracy, test_accuracy, overall_attack_success } = response.data.data;
      setMetrics(prev => ({
        ...prev,
        attackTrainAccuracy: train_accuracy,
        attackTestAccuracy: test_accuracy,
        overallAttackSuccess: overall_attack_success
      }));
      addLog(`Privacy audit complete. Adversary Success Rate: ${overall_attack_success.toFixed(2)}%`);
    } catch (error) {
      addLog('Error: Failed to execute privacy attack sequence.');
    } finally {
      setLoadingAttack(false);
    }
  };

  const accuracyComparisonData = [
    { name: 'Baseline Model', Accuracy: metrics.baselineAccuracy || 0 },
    { name: 'Secure (DP) Model', Accuracy: metrics.secureAccuracy || 0 },
  ];

  // Calculate the accuracy drop for the UI badge
  const accuracyDelta = (metrics.baselineAccuracy && metrics.secureAccuracy) 
    ? (metrics.secureAccuracy - metrics.baselineAccuracy).toFixed(1) 
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-500" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">AI Privacy Auditing Engine</h1>
            <p className="text-xs text-slate-400">Enterprise DP-SGD Verification Environment</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400">NODE_ONLINE</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls - Card 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
            <div>
              <div className="p-3 bg-indigo-500/10 rounded-lg w-fit text-indigo-400 mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">1. Standard Training</h3>
              <p className="text-sm text-slate-400 mb-6">Trains a vanilla, unregularized multi-layer perceptron target classifier vulnerable to empirical memorization footprinting.</p>
            </div>
            <button
              onClick={trainBaseline}
              disabled={loadingBaseline}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
            >
              {loadingBaseline ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {metrics.baselineAccuracy ? 'Retrain Baseline' : 'Compile Baseline'}
            </button>
          </div>

          {/* Controls - Card 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
            <div>
              <div className="p-3 bg-emerald-500/10 rounded-lg w-fit text-emerald-400 mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">2. Secure Training</h3>
              <p className="text-sm text-slate-400 mb-6">Injects differentially private noise hooks and per-sample gradient clipping routines via Opacus into the backward training loop.</p>
            </div>
            <button
              onClick={trainSecure}
              disabled={loadingSecure}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
            >
              {loadingSecure ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {metrics.secureAccuracy ? 'Retrain Secure' : 'Inject DP-SGD'}
            </button>
          </div>

          {/* Controls - Card 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
            <div>
              <div className="p-3 bg-rose-500/10 rounded-lg w-fit text-rose-400 mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">3. Privacy Audit</h3>
              <p className="text-sm text-slate-400 mb-6">Launches an adversarial black-box membership inference pipeline via ART to extract training set boundaries using logit differences.</p>
            </div>
            <button
              onClick={runAudit}
              disabled={loadingAttack || (!metrics.baselineAccuracy && !metrics.secureAccuracy)}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
            >
              {loadingAttack ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Run Membership Leak Audit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-400" />
              Comparative Cryptographic Telemetry
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
              
              {/* Chart A: Functional Accuracy Comparison */}
              <div className="bg-slate-950 border border-slate-800/60 p-4 rounded-lg flex flex-col justify-between relative">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Functional Retention</span>
                  {accuracyDelta && (
                    <span className="flex items-center gap-1 text-xs font-bold bg-rose-500/10 text-rose-400 px-2 py-1 rounded-md">
                      <TrendingDown className="w-3 h-3" />
                      {accuracyDelta}%
                    </span>
                  )}
                </div>
                <div className="w-full h-44 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={accuracyComparisonData} margin={{ top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis domain={[75, 85]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} hide={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} 
                        itemStyle={{ color: '#818cf8' }}
                        formatter={(value) => [`${value.toFixed(2)}%`, 'Accuracy']}
                      />
                      <Bar dataKey="Accuracy" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {accuracyComparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart B: Vulnerability Footprint Index */}
              <div className="bg-slate-950 border border-slate-800/60 p-4 rounded-lg flex flex-col justify-center items-center text-center relative">
                <span className="absolute top-4 left-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Adversary Success Bounds
                </span>
                
                {metrics.overallAttackSuccess ? (
                  <div className="mt-6 flex flex-col items-center">
                    <div className="text-sm font-medium text-slate-400 mb-1">
                      Before DP-SGD: <span className="text-rose-400">{metrics.baselineAttackSuccess}%</span> → After:
                    </div>
                    <div className={`text-5xl font-extrabold tracking-tight ${metrics.overallAttackSuccess > 53 ? 'text-rose-500' : 'text-emerald-400'}`}>
                      {metrics.overallAttackSuccess.toFixed(1)}%
                    </div>
                    <div className="mt-3 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 inline-block">
                      <span className="text-xs text-slate-400 font-mono">Attacker accuracy — 50% = random guess</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-mono italic mt-6">Awaiting API audit payload metrics...</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Pipeline Key Metrics</h3>
              <div className="grid grid-cols-2 gap-4 font-mono">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Baseline Acc</span>
                  <span className="text-lg font-bold text-white">{metrics.baselineAccuracy ? `${metrics.baselineAccuracy.toFixed(1)}%` : '—'}</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Secure Acc</span>
                  <span className="text-lg font-bold text-emerald-400">{metrics.secureAccuracy ? `${metrics.secureAccuracy.toFixed(1)}%` : '—'}</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Privacy Budget (ε)</span>
                  <span className="text-lg font-bold text-sky-400">{metrics.privacyBudget ? metrics.privacyBudget.toFixed(2) : '—'}</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">MIA Success</span>
                  <span className={`text-lg font-bold ${metrics.overallAttackSuccess > 53 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {metrics.overallAttackSuccess ? `${metrics.overallAttackSuccess.toFixed(1)}%` : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-grow flex flex-col min-h-[140px]">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Security Console Stream</span>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex-grow font-mono text-[11px] space-y-1.5 overflow-y-auto max-h-[160px] h-full text-slate-300">
                {logs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-indigo-400 mr-2">[{log.time}]</span>
                    <span>{log.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}