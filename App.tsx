import React, { useState, useEffect } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { Briefcase } from 'lucide-react';
import Dashboard from './components/Dashboard';
import { User } from './types';

interface TokenResponse {
  access_token: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<TokenResponse | null>(null);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => setToken(tokenResponse as TokenResponse),
    onError: (error) => console.log('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/business.manage',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            },
          });
          if (res.ok) {
            const profileData = await res.json();
            setUser({
              name: profileData.name,
              email: profileData.email,
              picture: profileData.picture,
            });
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          logOut();
        }
      }
    };
    fetchUserProfile();
  }, [token]);

  const logOut = () => {
    googleLogout();
    setUser(null);
    setToken(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-lg mx-auto">
          <div className="flex justify-center items-center mx-auto w-20 h-20 bg-slate-100 rounded-full mb-6">
            <Briefcase className="w-10 h-10 text-slate-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">GMB Insights Dashboard</h1>
          <p className="text-slate-600 mb-8">
            Connect your Google My Business account to unlock powerful insights, track performance, and analyze customer reviews with AI.
          </p>
          <button
            onClick={() => login()}
            className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" className="w-6 h-6"/>
            <span>Connect Google My Business</span>
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard user={user} onLogout={logOut} />;
};

export default App;