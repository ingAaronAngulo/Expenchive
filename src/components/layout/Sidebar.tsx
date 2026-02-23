import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  TrendingUp,
  Wallet,
  Settings,
  X,
  HandCoins,
  Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Credit Cards', href: '/credit-cards', icon: CreditCard },
  { name: 'Investments', href: '/investments', icon: TrendingUp },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Loans', href: '/loans', icon: HandCoins },
  { name: 'Snapshots', href: '/snapshots', icon: Camera },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-xl md:shadow-none transform transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: 'hsl(var(--card))' }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <h1 className="text-xl font-bold text-primary">Expenchive</h1>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
