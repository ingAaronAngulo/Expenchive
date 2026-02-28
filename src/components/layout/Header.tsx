import { useNavigate } from 'react-router-dom';
import { LogOut, User, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('es') ? 'en' : 'es');
  };

  const currentLang = i18n.language.startsWith('es') ? 'ES' : 'EN';
  const nextLang = i18n.language.startsWith('es') ? 'EN' : 'ES';

  return (
    <header className="h-16 bg-card border-b border-border px-4 md:px-6 flex items-center justify-between">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="md:hidden text-muted-foreground hover:text-foreground"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex-1 md:flex-initial" />

      <div className="flex items-center gap-2 md:gap-4">
        {/* Language toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="text-muted-foreground hover:text-foreground gap-1.5 text-xs font-medium px-2"
          title={t('header.toggleLanguage')}
        >
          <span className="text-foreground font-semibold">{currentLang}</span>
          <span className="opacity-40">/</span>
          <span className="opacity-40">{nextLang}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        <div className="hidden md:flex items-center gap-2">
          <User className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-foreground">
            {user?.displayName || user?.email}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">{t('header.signOut')}</span>
        </Button>
      </div>
    </header>
  );
}
