import React, { useState, useEffect } from 'react';
import { useGoogleLogin, googleLogout, TokenResponse } from '@react-oauth/google';
import { Briefcase, Loader2, AlertTriangle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import { User, GmbAccount, ApiLocation } from './types';
import { getAccounts, getLocations } from './services/gmbService';

type AppState = 'login' | 'loading-accounts' | 'select-account' | 'loading-locations' | 'dashboard' | 'error';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<TokenResponse | null>(null);
  const [accounts, setAccounts] = useState<GmbAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<GmbAccount | null>(null);
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [appState, setAppState] = useState<AppState>('login');
  const [error, setError] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
        setToken(tokenResponse);
        setAppState('loading-accounts');
    },
    onError: (error) => {
        console.error('Login Failed:', error);
        setError('Google login failed. Please try again.');
        setAppState('error');
    },
    scope: 'https://www.googleapis.com/auth/business.manage',
  });

  useEffect(() => {
    const processLogin = async () => {
      if (token) {
        try {
          // Fetch user profile
          const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${token.access_token}` },
          });
          if (!res.ok) throw new Error('Failed to fetch user profile');
          const profileData = await res.json();
          setUser({ name: profileData.name, email: profileData.email, picture: profileData.picture });
          
          // Fetch GMB accounts
          const gmbAccounts = await getAccounts(token.access_token);
          if (gmbAccounts.length === 0) {
            setError("No Google Business Profile accounts found for this user.");
            setAppState('error');
          } else if (gmbAccounts.length === 1) {
            setSelectedAccount(gmbAccounts[0]);
            setAppState('loading-locations');
          } else {
            setAccounts(gmbAccounts);
            setAppState('select-account');
          }

        } catch (err) {
          console.error("Error during login process:", err);
          setError(err instanceof Error ? err.message : "An unknown error occurred.");
          setAppState('error');
          logOut();
        }
      }
    };
    if (appState === 'loading-accounts') {
        processLogin();
    }
  }, [token, appState]);

  useEffect(() => {
    const fetchLocations = async () => {
        if (selectedAccount && token) {
            try {
                const gmbLocations = await getLocations(token.access_token, selectedAccount.name);
                if (gmbLocations.length === 0) {
                    setError(`No locations found in the account "${selectedAccount.displayName}".`);
                    setAppState('error');
                } else {
                    setLocations(gmbLocations);
                    setAppState('dashboard');
                }
            } catch (err) {
                console.error("Error fetching locations:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch locations.");
                setAppState('error');
            }
        }
    }
    if (appState === 'loading-locations') {
        fetchLocations();
    }
  }, [selectedAccount, token, appState]);


  const logOut = () => {
    googleLogout();
    setUser(null);
    setToken(null);
    setAccounts([]);
    setSelectedAccount(null);
    setLocations([]);
    setError(null);
    setAppState('login');
  };

  const renderContent = () => {
    switch (appState) {
        case 'login':
            return (
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-lg mx-auto">
                    <div className="flex justify-center items-center mx-auto w-20 h-20 bg-slate-100 rounded-full mb-6">
                    <Briefcase className="w-10 h-10 text-slate-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">GMB Insights Dashboard</h1>
                    <p className="text-slate-600 mb-8">
                    Connect your Google Business Profile account to unlock powerful insights, track performance, and analyze customer reviews with AI.
                    </p>
                    <button
                    onClick={() => login()}
                    className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" className="w-6 h-6"/>
                    <span>Connect Google My Business</span>
                    </button>
                </div>
            );
        case 'loading-accounts':
        case 'loading-locations':
            return (
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-auto">
                    <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700">
                        {appState === 'loading-accounts' ? 'Fetching your accounts...' : 'Loading locations...'}
                    </h2>
                </div>
            );
        case 'select-account':
            return (
                <div className="p-8 bg-white rounded-xl shadow-lg max-w-md mx-auto">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Select an Account</h2>
                    <p className="text-slate-600 mb-6">You have access to multiple Google Business Profile accounts. Please choose one to continue.</p>
                    <div className="space-y-3">
                        {accounts.map(acc => (
                            <button
                                key={acc.name}
                                onClick={() => {
                                    setSelectedAccount(acc);
                                    setAppState('loading-locations');
                                }}
                                className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 border rounded-lg transition"
                            >
                                <p className="font-semibold">{acc.displayName}</p>
                                <p className="text-sm text-slate-500">{acc.name}</p>
                            </button>
                        ))}
                    </div>
                </div>
            );
        case 'error':
            return (
                <div className="p-8 bg-white rounded-xl shadow-lg max-w-lg mx-auto text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">An Error Occurred</h2>
                    <p className="text-slate-600 bg-red-50 p-3 rounded-md mb-6">{error}</p>
                    <button
                        onClick={logOut}
                        className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        Return to Login
                    </button>
                </div>
            );
        case 'dashboard':
            if (user && token && selectedAccount && locations.length > 0) {
                return <Dashboard
                    user={user}
                    onLogout={logOut}
                    token={token.access_token}
                    accountId={selectedAccount.name}
                    locations={locations}
                 />;
            }
            // Fallback to login if state is inconsistent
            logOut();
            return null;
        
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
        {renderContent()}
    </div>
  )
};

export default App;