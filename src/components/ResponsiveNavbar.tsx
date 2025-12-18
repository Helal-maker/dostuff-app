import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  HelpCircle,
  BarChart3,
  User,
  Plus,
  Menu,
  X,
  ArrowLeft,
  Settings,
  LogOut,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import logo from '@/assets/logo-dostuff.png';

interface NavigationItem {
  icon: any;
  label: string;
  path: string;
  key: string;
  show?: boolean;
}

/**
 * Enhanced Responsive Navigation Component
 * Handles mobile, tablet, and desktop navigation with proper floating animations
 */
const ResponsiveNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, isAuthenticated, isTeacher, loading } = useAuth();

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const commonItems: NavigationItem[] = [
      { icon: Home, label: 'Home', path: '/', key: 'home' },
      { icon: HelpCircle, label: 'How it Works', path: '/how-it-works', key: 'how-it-works' }
    ];

    const authenticatedItems: NavigationItem[] = isAuthenticated && !loading ? [
      !isTeacher && { icon: Plus, label: 'Join Exam', path: '/join', key: 'join' },
      ...(isTeacher ? [{ icon: Plus, label: 'Create Exam', path: '/create-exam', key: 'create-exam' }] : []),
      { icon: isTeacher ? BookOpen : BarChart3, label: isTeacher ? 'Exams' : 'Results', path: isTeacher ? '/exams' : '/results', key: isTeacher ? 'exams' : 'results' },
      { icon: User, label: 'Profile', path: '/profile', key: 'profile' }
    ].filter(Boolean) as NavigationItem[] : [];

    return [...commonItems, ...authenticatedItems];
  };

  const navigationItems = getNavigationItems();

  // Update active item based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const active = navigationItems.find(item => {
      if (item.key === 'home') return currentPath === '/dashboard' || currentPath === '/';
      return currentPath.startsWith(item.path);
    });
    setActiveItem(active?.key || '');
  }, [location.pathname, navigationItems]);

  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Determine device type
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Mobile Navigation (bottom navigation)
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                  isActive
                    ? 'text-primary bg-primary/10 scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                aria-label={item.label}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
                <span className={`text-xs font-medium truncate max-w-[60px] ${isActive ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Tablet Navigation (bottom bar)
  if (isTablet) {
    return (
      <>
        {/* Top Navigation */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-soft">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center h-14">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} alt="Do Stuff" className="w-6 h-6 rounded object-cover" />
                <span className="text-lg font-bold text-foreground">Do Stuff</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Bottom Navigation Bar for Tablet */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
          <div className="flex items-center justify-around h-16 px-4">
            {navigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.key;
              
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.path)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-primary/10 scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
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
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex-1 p-4 space-y-4">
                {navigationItems.map((item) => (
                  <button 
                    key={item.key}
                    onClick={() => handleNavigate(item.path)}
                    className="block w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                
                {!isAuthenticated && !loading && (
                  <div className="pt-4 space-y-2 border-t border-border">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/auth')}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => navigate('/auth')}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop Navigation (floating with height constraints)
  return (
    <>
      {/* Floating Navigation Sidebar for Desktop */}
      <nav className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40">
        <Card className="bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-2 max-h-[60vh] overflow-hidden">
          <div className="flex flex-col items-center space-y-2">
            {/* Logo and App Name at Top */}
            <div className="flex flex-col items-center gap-2 py-2 cursor-pointer" onClick={() => navigate('/')} title="Home">
              <img src={logo} alt="Do Stuff" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-sm font-bold text-foreground">Do Stuff</span>
            </div>
            
            <div className="w-8 h-px bg-border my-1" />
            
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.key;
              
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.path)}
                  className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105'
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : ''}`} />
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-3 px-3 py-1 bg-popover text-popover-foreground text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-popover" />
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
            
            {/* User menu divider */}
            {isAuthenticated && (
              <div className="w-8 h-px bg-border my-2" />
            )}
            
            {/* User actions */}
            {isAuthenticated && !loading && (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105"
                  title="Profile Settings"
                  aria-label="Profile Settings"
                >
                  <Settings className="w-5 h-5" />
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-3 px-3 py-1 bg-popover text-popover-foreground text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Settings
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-popover" />
                  </div>
                </button>
              </>
            )}
          </div>
        </Card>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-md">
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
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 p-4 space-y-4">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.path)}
                  className="block w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              
              {!isAuthenticated && !loading && (
                <div className="pt-4 space-y-2 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsiveNavbar;
