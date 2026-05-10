import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { runAudit } from '../../lib/auditEngine';
import ResultsDashboard from '../dashboard/ResultDashboard';
import { useNavigate } from 'react-router-dom';

export default function SpendForm() {
  
  const navigate = useNavigate();
  const [userStack, setUserStack] = useState([]);
  
  
  const [tool, setTool] = useState('chatgpt');
  const [plan, setPlan] = useState('plus');
  const [seats, setSeats] = useState(1);
  const [currentSpend, setCurrentSpend] = useState(20);
  const [useCase, setUseCase] = useState('mixed');

  const handleAddTool = (e) => {
    e.preventDefault();
    const newTool = {
      id: crypto.randomUUID(),
      tool,
      plan,
      seats: Number(seats),
      currentSpend: Number(currentSpend),
      useCase
    };
    setUserStack([...userStack, newTool]);
  };

  const handleRemoveTool = (id) => {
    setUserStack(userStack.filter(t => t.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4">Add AI Subscription</h2>
        <form onSubmit={handleAddTool} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tool</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={tool} onChange={(e) => setTool(e.target.value)}
              >
                <option value="chatgpt">ChatGPT</option>
                <option value="cursor">Cursor</option>
                <option value="claude">Claude</option>
                <option value="github_copilot">GitHub Copilot</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Plan Tier</label>
              <input 
                type="text"
                placeholder="e.g. Plus, Pro, Team"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={plan} onChange={(e) => setPlan(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Seats / Users</label>
              <input 
                type="number" min="1"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={seats} onChange={(e) => setSeats(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Monthly Spend ($)</label>
              <input 
                type="number" min="0" step="0.01"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={currentSpend} onChange={(e) => setCurrentSpend(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Primary Use Case</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              value={useCase} onChange={(e) => setUseCase(e.target.value)}
            >
              <option value="coding">Coding / Engineering</option>
              <option value="writing">Writing / Content</option>
              <option value="data">Data Analysis</option>
              <option value="research">Research</option>
              <option value="mixed">Mixed / General</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add to Stack
          </button>
        </form>
      </div>

      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col">
        <h2 className="text-xl font-semibold text-white mb-4">Your AI Stack</h2>
        
        <div className="flex-1 overflow-y-auto space-y-3">
          {userStack.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm italic border-2 border-dashed border-slate-700 rounded-lg p-8">
              No tools added yet. Start building your stack.
            </div>
          ) : (
            userStack.map((item) => (
              <div key={item.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex justify-between items-center group">
                <div>
                  <p className="text-white font-medium capitalize">{item.tool} <span className="text-emerald-400 text-sm ml-1">({item.plan})</span></p>
                  <p className="text-slate-400 text-sm mt-0.5">{item.seats} seat(s) • ${item.currentSpend}/mo</p>
                </div>
                <button 
                  onClick={() => handleRemoveTool(item.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {userStack.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-700">
            <button 
  onClick={() => {
  const results = runAudit(userStack);
  const totalSpend = userStack.reduce((sum, item) => sum + item.currentSpend, 0);

 
  navigate('/dashboard', { state: { results, totalCurrentSpend: totalSpend } });
}}
  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-lg shadow-lg transition-colors text-lg"
>
  Run Audit Engine →
</button>
          </div>
        )}
      </div>

    </div>
  );
}