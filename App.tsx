
import React, { useState } from 'react';
import { BriefcaseBusiness, BarChart2 } from 'lucide-react';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleConnect = () => {
    // In a real application, this would trigger the OAuth flow.
    // Here, we simulate a successful connection.
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-lg mx-auto">
          <div className="flex justify-center items-center mx-auto w-20 h-20 bg-slate-100 rounded-full mb-6">
            <BriefcaseBusiness className="w-10 h-10 text-slate-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">GMB Insights Dashboard</h1>
          <p className="text-slate-600 mb-8">
            Connect your Google My Business account to unlock powerful insights, track performance, and analyze customer reviews with AI.
          </p>
          <button
            onClick={handleConnect}
            className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" className="w-6 h-6"/>
            <span>Connect Google My Business</span>
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default App;
