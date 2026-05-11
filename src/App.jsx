import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SpendForm from './components/form/SpendForm.jsx';
import ResultsDashboard from './components/dashboard/ResultDashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-emerald-500/30">
        
       
        <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-lg text-slate-900">
                $
              </div>
              <span className="text-xl font-bold tracking-tight">SpendSmart</span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12">
          <Routes>
            
            <Route path="/" element={
              <>
                <div className="mb-10 text-center max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                    Stop overpaying for AI.
                  </h1>
                  <p className="text-lg text-slate-400">
                    Enter your current AI tool stack below. Our engine will instantly calculate where you are overspending and recommend exact alternatives.
                  </p>
                </div>
                <SpendForm />
              </>
            } />

           
            <Route path="/dashboard/:id" element={<ResultsDashboard />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;