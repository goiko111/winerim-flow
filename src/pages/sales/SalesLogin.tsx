import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appConfig } from '@/config/app';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, User } from 'lucide-react';
import winerimIcon from '@/assets/winerim-icon.png';

// Mock credentials - in production, use proper auth
const MOCK_CREDENTIALS = {
  username: 'admin',
  password: 'winerim2024',
};

export const SalesLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 500));

    if (
      username === MOCK_CREDENTIALS.username &&
      password === MOCK_CREDENTIALS.password
    ) {
      // Store auth state
      localStorage.setItem('winerim_sales_auth', JSON.stringify({
        user: username,
        timestamp: Date.now(),
      }));
      navigate('/sales/dashboard');
    } else {
      setError('Usuario o contraseña incorrectos');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={winerimIcon} 
            alt="Winerim" 
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Portal Comercial
          </h1>
          <p className="text-muted-foreground mt-1">
            {appConfig.brandName} - Acceso interno
          </p>
        </div>

        {/* Login form */}
        <div className="card-elevated p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-premium pl-10"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center animate-fade-in">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="btn-wine w-full"
            >
              {isLoading ? 'Accediendo...' : 'Acceder'}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Demo: admin / winerim2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesLogin;
