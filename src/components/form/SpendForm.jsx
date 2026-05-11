import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { runAudit } from '../../lib/AuditEngine';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; 

export default function SpendForm() {
  const navigate = useNavigate();
  
  
  const [userStack, setUserStack] = useState(() => {
    const saved = localStorage.getItem('spendSmartStack');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('spendSmartStack', JSON.stringify(userStack));
  }, [userStack]);

  const [tool, setTool] = useState('');
  const [plan, setPlan] = useState('');
  const [seats, setSeats] = useState(1);
  const [currentSpend, setCurrentSpend] = useState('');
  const [useCase, setUseCase] = useState('mixed');

  
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [honeypot, setHoneypot] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTool = () => {
    if (!tool || !plan || !currentSpend) return;
    const newItem = { id: crypto.randomUUID(), tool, plan, seats: Number(seats), currentSpend: Number(currentSpend), useCase };
    setUserStack([...userStack, newItem]);
    setTool(''); setPlan(''); setSeats(1); setCurrentSpend(''); setUseCase('mixed');
  };

  const handleRemoveTool = (id) => {
    setUserStack(userStack.filter(item => item.id !== id));
  };

  
  const handleGenerateAudit = async (e) => {
    e.preventDefault();
    
   
    if (honeypot) return;

    setIsSubmitting(true);
    const results = runAudit(userStack);
    const totalSpend = userStack.reduce((sum, item) => sum + item.currentSpend, 0);

    try {
      
      const { data, error } = await supabase
        .from('audits')
        .insert([
          {
            email,
            company: company || null,
            role: role || null,
            user_stack: userStack,
            total_savings: results.totalMonthlySavings
          }
        ])
        .select()
        .single(); 

     
      console.log("Supabase Error:", error);
      console.log("Supabase Data:", data);

      if (error) throw error;

     
      navigate(`/dashboard/${data.id}`, { state: { results, totalCurrentSpend: totalSpend, userStack } });
      
    } catch (err) {
      console.error("Database error:", err);
      alert("Something went wrong saving your audit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in duration-500 relative">
      
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <input type="text" placeholder="Tool (e.g. ChatGPT)" value={tool} onChange={(e) => setTool(e.target.value)} className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white" />
        <input type="text" placeholder="Plan (e.g. Plus)" value={plan} onChange={(e) => setPlan(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white" />
        <input type="number" placeholder="Seats" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white" />
        <div className="relative">
          <span className="absolute left-4 top-3 text-slate-400">$</span>
          <input type="number" placeholder="Spend/mo" value={currentSpend} onChange={(e) => setCurrentSpend(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-3 text-white" />
        </div>
        <select value={useCase} onChange={(e) => setUseCase(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white">
          <option value="mixed">Mixed</option>
          <option value="coding">Coding</option>
          <option value="writing">Writing</option>
          <option value="data">Data</option>
        </select>
      </div>

      <button onClick={handleAddTool} className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors mb-10">
        <Plus size={20} /> Add Tool to Stack
      </button>

      {userStack.length > 0 && (
        <div className="mb-10 space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Your Current Stack</h3>
          {userStack.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-slate-900/50 border border-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-emerald-400">{item.tool}</span>
                <span className="text-slate-400 text-sm">{item.plan} Plan</span>
                <span className="text-slate-500 text-sm hidden md:inline">• {item.seats} seats</span>
                <span className="text-slate-500 text-sm hidden md:inline">• {item.useCase}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-white">${item.currentSpend}/mo</span>
                <button onClick={() => handleRemoveTool(item.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    
      <button 
        onClick={() => setShowModal(true)}
        disabled={userStack.length === 0}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-4 rounded-lg shadow-lg transition-colors text-lg"
      >
        Run Audit Engine →
      </button>

      
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Your audit is ready.</h2>
                <p className="text-slate-400 text-sm">Enter your email to view your total savings and action plan.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleGenerateAudit} className="space-y-4">
              
             
              <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex="-1" autoComplete="off" />

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Work Email *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="name@company.com" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company (Optional)</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="Acme Corp" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role (Optional)</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="CTO, Founder, etc." />
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-slate-900 font-bold py-4 rounded-lg mt-6 flex justify-center items-center gap-2 transition-colors">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Unlock My Audit'}
              </button>
              <p className="text-center text-xs text-slate-500 mt-4">No credit card required. We promise not to spam.</p>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}