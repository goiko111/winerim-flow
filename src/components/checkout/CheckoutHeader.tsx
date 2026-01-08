import { appConfig } from '@/config/app';
import { Link } from 'react-router-dom';

export const CheckoutHeader = () => {
  return (
    <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-wine flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">W</span>
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              {appConfig.brandName}
            </span>
          </Link>

          {/* Right side links */}
          <div className="flex items-center gap-6 text-sm">
            <a 
              href={appConfig.termsUrl} 
              className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
            >
              Condiciones
            </a>
            <a 
              href={appConfig.privacyUrl} 
              className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
            >
              Privacidad
            </a>
            <a 
              href={`mailto:${appConfig.supportEmail}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {appConfig.supportEmail}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
