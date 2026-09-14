import { ArrowLeftRight, CircleDollarSign, LayoutDashboard, Settings, Wallet } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface MobileBottomNavigationProps {
  onQuickExpense: () => void;
}

export function MobileBottomNavigation({ onQuickExpense }: MobileBottomNavigationProps) {
  const { t } = useTranslation();
  const navigation = [
    { name: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('nav.movements'), href: '/movements', icon: ArrowLeftRight },
    { name: t('nav.accounts'), href: '/accounts', icon: Wallet },
    { name: t('nav.settings'), href: '/settings', icon: Settings },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={t('nav.mobileNavigation')}
    >
      <div className="grid h-16 grid-cols-5 items-stretch px-1">
        {navigation.slice(0, 2).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) => cn(
                'flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{item.name}</span>
            </NavLink>
          );
        })}

        <div className="relative flex items-end justify-center pb-1">
          <button
            type="button"
            onClick={onQuickExpense}
            className="absolute -top-7 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-amber-400 text-amber-950 shadow-xl transition-transform hover:bg-amber-300 active:scale-95"
            aria-label={t('dashboard.quickAddExpense')}
            title={t('dashboard.quickAddExpense')}
          >
            <CircleDollarSign className="h-9 w-9" strokeWidth={2.25} />
          </button>
          <span className="text-[10px] font-medium text-muted-foreground">{t('nav.quick')}</span>
        </div>

        {navigation.slice(2).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => cn(
                'flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
