import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Home,
  BookOpen,
  BarChart3,
  User,
  Plus,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo-dostuff.png';

interface MobileBottomNavProps {
  userRole?: 'student' | 'teacher';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ userRole = 'student' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const getNavItems = () => {
    if (userRole === 'teacher') {
      return [
        { icon: Home, label: 'Home', path: '/dashboard', key: 'home' },
        { icon: Plus, label: 'Create', path: '/create-exam', key: 'create' },
        { icon: BookOpen, label: 'Exams', path: '/exams', key: 'exams' },
        { icon: User, label: 'Profile', path: '/profile', key: 'profile' },
      ];
    }
    
    return [
      { icon: Home, label: 'Home', path: '/dashboard', key: 'home' },
      { icon: BookOpen, label: 'Join', path: '/join', key: 'join' },
      { icon: BarChart3, label: 'Results', path: '/results', key: 'results' },
      { icon: User, label: 'Profile', path: '/profile', key: 'profile' },
    ];
  };

  const navItems = getNavItems();

  // More specific active state detection
  const isActive = (item: any) => {
    if (item.key === 'home') {
      return location.pathname === '/dashboard';
    }
    if (item.key === 'exams') {
      return location.pathname === '/exams' ||
             (location.pathname === '/dashboard' && location.search === '?view=exams');
    }
    if (item.key === 'results') {
      return location.pathname === '/results' ||
             (location.pathname === '/dashboard' && location.search === '?view=results');
    }
    return location.pathname === item.path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
      <div className={`flex items-center justify-around h-16 px-1 ${navItems.length > 4 ? 'overflow-x-auto' : ''}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all duration-200 min-w-[44px] ${
                active
                  ? 'text-primary bg-primary/10 scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${active ? 'text-primary' : ''}`} />
              <span className={`text-xs font-medium truncate max-w-[60px] ${active ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

interface MobileNavbarProps {
  title?: string;
  showMenu?: boolean;
  showBack?: boolean;
  onBack?: () => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ 
  title = 'Do Stuff',
  showMenu = true,
  showBack = false,
  onBack
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-soft">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            {showBack ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2 -ml-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            ) : (
              <img src={logo} alt="Do Stuff" className="w-6 h-6 rounded object-cover" />
            )}
            <span className="text-lg font-bold text-foreground">{title}</span>
          </div>
          
          {showMenu && !showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Do Stuff" className="w-6 h-6 rounded object-cover" />
                <span className="text-lg font-bold text-foreground">Menu</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 p-4 space-y-4">
              <button 
                onClick={() => { navigate('/how-it-works'); setIsMenuOpen(false); }}
                className="block w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                How it Works
              </button>
              <button 
                onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}
                className="block w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                className="block w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                Profile
              </button>
              <button 
                onClick={() => { window.open('https://t.me/+P-Vu76yybMA5MjBk', '_blank'); }}
                className="block w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                Join Community
              </button>
            </div>
            
            <div className="p-4 space-y-2 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
              >
                Sign In
              </Button>
              <Button 
                variant="hero" 
                className="w-full"
                onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;