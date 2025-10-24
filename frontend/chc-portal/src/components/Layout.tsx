import { useState } from 'react';
import { 
  LayoutDashboard, 
  Tractor, 
  Map, 
  BookOpen, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'machines', label: 'Machines', icon: Tractor },
  { id: 'liveMap', label: 'Live Map', icon: Map },
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
];

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <div className="flex items-center gap-2">
              <Tractor className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-bold text-sidebar-foreground">
                CHC Management Portal
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 transition-all duration-300",
          sidebarOpen ? "pl-64" : "pl-0"
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
