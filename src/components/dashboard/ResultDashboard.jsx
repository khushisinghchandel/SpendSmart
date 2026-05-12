import { useRef, useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ArrowDownRight, CheckCircle2, ArrowLeft, Download, Loader2, Mail, ExternalLink } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { generateAuditSummary } from '../../lib/aiSummary';
import { supabase } from '../../lib/supabase';
import { sendConfirmationEmail } from '../../lib/emailService';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ResultsDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const reportRef = useRef(null);
  
  // --- STATE VARIABLES ---
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(true);
  const [isFetchingDB, setIsFetchingDB] = useState(true);
  const [publicData, setPublicData] = useState(null);

  // Lead Capture State
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [honeypot, setHoneypot] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // --- EFFECT 1: FETCH DATA (Local or Database) ---
  useEffect(() => {
    const fetchPublicData = async () => {
      const { results: localResults, totalCurrentSpend: localSpend, userStack: localStack } = location.state || {};

      if (localResults && localStack) {
        setPublicData({ results: localResults, totalCurrentSpend: localSpend, userStack: localStack });
        setIsFetchingDB(false);
        return;
      }

      if (id) {
        try {
          const { data, error } = await supabase.from('audits').select('*').eq('id', id).single();
          if (error) throw error;
          
          setIsSaved(true); // If loaded via ID, it's already in the DB
          const calculatedSpend = data.user_stack.reduce((sum, item) => sum + item.currentSpend, 0);
          setPublicData({
            results: { totalMonthlySavings: data.total_savings, annualSavings: data.total_savings * 12, recommendations: [] },
            totalCurrentSpend: calculatedSpend,
            userStack: data.user_stack
          });
        } catch (error) {
          console.error("Database fetch error:", error);
        }
      }
      setIsFetchingDB(false);
    };

    fetchPublicData();
  }, [id, location.state]);

  // --- EFFECT 2: AI GENERATION ---
  useEffect(() => {
    if (!publicData?.results || !publicData?.userStack) return;

    const fetchSummary = async () => {
      setIsGeneratingAI(true);
      try {
        const summaryText = await generateAuditSummary(publicData.userStack, publicData.results);
        setAiSummary(summaryText);
      } catch (err) {
        setAiSummary("Your AI stack audit is complete. Review the financial breakdown below.");
      } finally {
        setIsGeneratingAI(false);
      }
    };

    fetchSummary();
  }, [publicData]);

  // --- ACTION: SAVE TO DATABASE & SEND EMAIL ---
  const handleSaveAudit = async (e) => {
    e.preventDefault();
    if (honeypot) return; // Abuse protection

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('audits')
        .insert([{ 
          email, 
          company: company || null,
          user_stack: publicData.userStack, 
          total_savings: publicData.results.totalMonthlySavings 
        }])
        .select().single();

      if (error) throw error;
      
      // Trigger Transactional Email
      sendConfirmationEmail(email, publicData.results.totalMonthlySavings);
      
      setIsSaved(true);
      
      // VIRAL LOOP: Transform the URL to the unique ID instantly
      window.history.replaceState(null, '', `/dashboard/${data.id}`);
      
    } catch (err) {
      console.error(err);
      alert("Error saving your audit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SECURITY / LOADING CHECKS ---
  if (isFetchingDB) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading audit data...</p>
      </div>
    );
  }

  if (!publicData) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-slate-400 mb-4">Audit not found or link has expired.</p>
        <button onClick={() => navigate('/')} className="text-emerald-500 hover:underline">Create a new audit</button>
      </div>
    );
  }

  const { results, totalCurrentSpend } = publicData;
  const optimizedSpend = totalCurrentSpend - results.totalMonthlySavings;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = reportRef.current;
      const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#1e293b', pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('SpendSmart-Audit-Report.pdf');
    } catch (error) { console.error(error); } finally { setIsDownloading(false); }
  };

  const chartData = {
    labels: ['Optimized Spend', 'Wasted Spend (Savings)'],
    datasets: [{ data: [optimizedSpend, results.totalMonthlySavings], backgroundColor: ['#10b981', '#ef4444'], borderColor: ['#0f172a'], borderWidth: 6 }],
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Edit Stack
        </button>

        <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-4 py-2 rounded-lg font-medium transition-colors">
          {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          Download PDF
        </button>
      </div>

      {/* Main Report Content */}
      <div ref={reportRef} className="bg-slate-800 p-8 md:p-12 rounded-2xl border border-slate-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-6">Audit Results</h1>
        
        {/* Hero Section */}
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
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 text-center">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Current Annual</h3>
                <p className="text-3xl font-bold text-white">${(totalCurrentSpend * 12).toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-emerald-500/30 text-center">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Optimized Annual</h3>
                <p className="text-3xl font-bold text-emerald-400">${(optimizedSpend * 12).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex items-start gap-4">
              <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={24} />
              <p className="text-emerald-100 leading-relaxed">
                By following these recommendations, you will save <strong className="text-emerald-400 font-bold">${results.annualSavings.toLocaleString()}</strong> every year.
              </p>
            </div>
          </div>
        </div>

        {/* AI Summary Block */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 mb-12">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${isGeneratingAI ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'}`}></div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">AI Executive Summary</h3>
          </div>
          {isGeneratingAI ? (
            <div className="flex items-center gap-3 text-slate-400 animate-pulse py-2">
              <Loader2 className="animate-spin" size={18} />
              <p>Analyzing stack overlap...</p>
            </div>
          ) : (
            <p className="text-slate-300 leading-relaxed text-lg">{aiSummary}</p>
          )}
        </div>

        {/* Action Plan */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">Action Plan</h2>
          {results.recommendations.length === 0 ? (
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
              Your AI stack is perfectly optimized!
            </div>
          ) : (
            <div className="space-y-4">
              {results.recommendations.map((rec) => (
                <div key={rec.id} className="bg-slate-900 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wide">{rec.tool}</span>
                      <span className="text-lg text-white font-medium">{rec.action}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed max-w-2xl text-sm">{rec.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-400/10 px-4 py-3 rounded-xl shrink-0 text-lg">
                    <ArrowDownRight size={24} /> Save ${rec.savings}/mo
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DYNAMIC LEAD CAPTURE SECTION (SCROLL DOWN TO SEE THIS) */}
      <div className="mt-12 space-y-8">
        {!isSaved ? (
          <div className={`p-8 rounded-2xl border transition-all duration-500 shadow-2xl ${results.totalMonthlySavings >= 500 ? 'bg-indigo-900/30 border-indigo-500/50 ring-1 ring-indigo-500/20' : 'bg-slate-800 border-slate-700'}`}>
            <div className="max-w-2xl">
              {results.totalMonthlySavings >= 500 ? (
                <>
                  <h2 className="text-3xl font-bold text-white mb-3">You qualify for a free Credex consultation.</h2>
                  <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
                    With over $500/mo in potential savings, your organization could benefit from professional contract negotiation. Enter your email to save this report and have a specialist reach out.
                  </p>
                </>
              ) : results.totalMonthlySavings < 100 ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-3">You're spending well.</h2>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                    Your stack is highly optimized. We can monitor your vendors for pricing changes. Enter your email to receive updates when new optimizations apply to your stack.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-3">Save and share your results.</h2>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                    Enter your email to generate a unique shareable link for your team and get a PDF copy sent to your inbox.
                  </p>
                </>
              )}
            </div>

            <form onSubmit={handleSaveAudit} className="flex flex-col md:flex-row gap-4">
              <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex="-1" autoComplete="off" />
              <input 
                type="email" 
                required 
                placeholder="work@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-emerald-500 outline-none transition-all shadow-inner"
              />
              <input 
                type="text" 
                placeholder="Company Name (Optional)" 
                value={company} 
                onChange={(e) => setCompany(e.target.value)} 
                className="md:w-1/4 bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-emerald-500 outline-none transition-all shadow-inner"
              />
              <button disabled={isSubmitting} type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-10 py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Mail size={20} /> Unlock Share Link</>}
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-4 italic">Saving this report will generate a unique public URL you can share with leadership.</p>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500 p-3 rounded-full"><ExternalLink className="text-slate-900" size={24} /></div>
              <div>
                <h3 className="text-white font-bold text-xl">Report Successfully Saved!</h3>
                <p className="text-emerald-200/60">Your unique public URL is now live in your address bar.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
              className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-8 py-3 rounded-lg hover:bg-emerald-500/30 transition-all font-bold"
            >
              Copy Shareable Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}