import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ArrowDownRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ResultsDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
 
  const { results, totalCurrentSpend } = location.state || {};

  if (!results) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-slate-400 mb-4">No data found. Please complete the audit form first.</p>
        <button onClick={() => navigate('/')} className="text-emerald-500 hover:underline">Go back to Form</button>
      </div>
    );
  }

  const optimizedSpend = totalCurrentSpend - results.totalMonthlySavings;

  const chartData = {
    labels: ['Optimized Spend', 'Wasted Spend (Savings)'],
    datasets: [{
      data: [optimizedSpend, results.totalMonthlySavings],
      backgroundColor: ['#10b981', '#ef4444'],
      borderColor: ['#0f172a'], 
      borderWidth: 6,
    }],
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={18} /> Edit Stack
      </button>

      <div className="bg-slate-800 p-8 md:p-12 rounded-2xl border border-slate-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-6">Audit Results</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
         
          <div className="relative h-72 flex justify-center">
            <Doughnut data={chartData} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
              <span className="text-slate-400 text-sm font-medium">Potential Savings</span>
              <span className="text-4xl font-bold text-emerald-400">${results.totalMonthlySavings}</span>
              <span className="text-slate-500 text-sm">/ month</span>
            </div>
          </div>

          
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Current Annual</h3>
                <p className="text-3xl font-bold text-white">${(totalCurrentSpend * 12).toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-emerald-500/30">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Optimized Annual</h3>
                <p className="text-3xl font-bold text-emerald-400">${(optimizedSpend * 12).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex items-start gap-4">
              <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={24} />
              <p className="text-emerald-100 leading-relaxed">
                By applying these recommendations, you will save <strong className="text-emerald-400 font-bold">${results.annualSavings.toLocaleString()}</strong> every single year.
              </p>
            </div>
          </div>
        </div>

      
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">Action Plan</h2>
          {results.recommendations.length === 0 ? (
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
              Your AI stack is perfectly optimized! No wasted spend detected.
            </div>
          ) : (
            <div className="space-y-4">
              {results.recommendations.map((rec) => (
                <div key={rec.id} className="bg-slate-900 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-slate-500 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wide">
                        {rec.tool}
                      </span>
                      <span className="text-lg text-white font-medium">{rec.action}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed max-w-2xl">{rec.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-400/10 px-4 py-3 rounded-xl shrink-0 text-lg">
                    <ArrowDownRight size={24} />
                    Save ${rec.savings}/mo
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}