import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { runAudit } from '../../lib/auditEngine';
import { useNavigate } from 'react-router-dom';

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
  const [seats, setSeats] = useState('');
  const [currentSpend, setCurrentSpend] = useState('');
  const [useCase, setUseCase] = useState('mixed');
  const [teamSize, setTeamSize] = useState('');

  
  const handleAddTool = () => {
    if (!tool || !plan || !currentSpend) return;
    
    
    const finalSeats = seats === '' || seats < 1 ? 1 : Number(seats);
    
    const newItem = { id: crypto.randomUUID(), tool, plan, seats: finalSeats, currentSpend: Number(currentSpend), useCase };
    setUserStack([...userStack, newItem]);
    
    
    setTool(''); setPlan(''); setSeats(''); setCurrentSpend(''); setUseCase('mixed');
  };

  const handleRemoveTool = (id) => {
    setUserStack(userStack.filter(item => item.id !== id));
  };

  const handleRunAudit = () => {
    
    const finalTeamSize = teamSize === '' || teamSize < 1 ? 1 : Number(teamSize);

    const results = runAudit(userStack, finalTeamSize); 
    const totalSpend = userStack.reduce((sum, item) => sum + item.currentSpend, 0);

    
    navigate('/dashboard', { state: { results, totalCurrentSpend: totalSpend, userStack, teamSize: finalTeamSize } });
  };

  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in duration-500 relative">
      
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
        
        <select value={tool} onChange={(e) => { setTool(e.target.value); setPlan(''); setCurrentSpend(''); }} className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white">
          <option value="">Select AI Tool...</option>
          <option value="Cursor">Cursor</option>
          <option value="GitHub Copilot">GitHub Copilot</option>
          <option value="Claude">Claude</option>
          <option value="ChatGPT">ChatGPT</option>
          <option value="Anthropic API direct">Anthropic API direct</option>
          <option value="OpenAI API direct">OpenAI API direct</option>
          <option value="Gemini">Gemini</option>
          <option value="v0">v0 (Vercel)</option>
        </select>

        <select value={plan} onChange={(e) => setPlan(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white disabled:opacity-50" disabled={!tool}>
          <option value="">Select Tier...</option>
          <option value="Free / Hobby">Free / Hobby</option>
          <option value="Individual / Pro / Plus">Individual / Pro / Plus</option>
          <option value="Max / Ultra">Max / Ultra</option>
          <option value="Team / Business">Team / Business</option>
          <option value="Enterprise">Enterprise</option>
          <option value="API direct">API Direct</option>
        </select>

        <input type="number" placeholder="Seats (e.g. 5)" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white" />
        
        <div className="relative lg:col-span-1">
          <span className="absolute left-4 top-3 text-slate-400">$</span>
          <input type="number" placeholder="Spend/mo" value={currentSpend} onChange={(e) => setCurrentSpend(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-3 text-white" />
        </div>
        
        <select value={useCase} onChange={(e) => setUseCase(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white">
          <option value="mixed">Mixed</option>
          <option value="coding">Coding</option>
          <option value="writing">Writing</option>
          <option value="data">Data</option>
          <option value="research">Research</option>
        </select>

        
        <input type="number" placeholder="Total Team Size (e.g. 50)" min="1" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white" />
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
        onClick={handleRunAudit}
        disabled={userStack.length === 0}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-4 rounded-lg shadow-lg transition-colors text-lg"
      >
        Run Audit Engine →
      </button>

    </div>
  );
}