import { Button } from "@/components/ui/button";
import { Menu, X, BarChart3, BookOpen, Home, User, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { MobileNavbar } from "./mobile/MobileNavigation";
import logo from "@/assets/logo-dostuff.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, isAuthenticated, isTeacher, loading } = useAuth();

  // Use mobile navbar only on very small mobile devices
  if (isMobile) {
    return <MobileNavbar />;
  }

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50 shadow-soft">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Do Stuff" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xl font-bold text-foreground">Do Stuff</span>
          </div>

          {/* Desktop & Tablet Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            {isAuthenticated && !loading && (
              <>
                {!isTeacher && (
                  <>
                    <button
                      onClick={() => navigate('/join')}
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Join Exam
                    </button>
                    <button
                      onClick={() => navigate('/results')}
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-2"
                      aria-label="View exam results"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Results
                    </button>
                    <button
                      onClick={() => navigate('/profile')}
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-2"
                      aria-label="View profile"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                  </>
                )}
                {isTeacher && (
                  <>
                    <button
                      onClick={() => navigate('/create-exam')}
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Exam
                    </button>
                    <button
                      onClick={() => navigate('/exams')}
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-2"
                      aria-label="View exams for teachers"
                    >
                      <BookOpen className="w-4 h-4" />
                      Exams
                    </button>
                    <button
                      onClick={() => navigate('/profile')}
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-2"
                      aria-label="View profile"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Tablet Navigation (for screens between mobile and desktop) */}
          <div className="hidden md:flex lg:hidden items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg"
              aria-label="Home"
            >
              <Home className="w-5 h-5" />
            </button>
            {isAuthenticated && !loading && (
              <>
                {!isTeacher ? (
                  <button
                    onClick={() => navigate('/join')}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg"
                    aria-label="Join Exam"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/create-exam')}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg"
                    aria-label="Create Exam"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => navigate(isTeacher ? '/exams' : '/results')}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg"
                  aria-label={isTeacher ? "Exams" : "Results"}
                >
                  {isTeacher ? <BookOpen className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated && !loading && (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button variant="hero" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden border-t border-border">
            <div className="py-6 space-y-4">
              {isAuthenticated && !loading && (
                <>
                  {!isTeacher && (
                    <>
                      <button
                        onClick={() => { setIsMenuOpen(false); navigate('/join'); }}
                        className="block text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Join Exam
                      </button>
                      <button
                        onClick={() => { setIsMenuOpen(false); navigate('/results'); }}
                        className="block text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Results
                      </button>
                    </>
                  )}
                  {isTeacher && (
                    <>
                      <button
                        onClick={() => { setIsMenuOpen(false); navigate('/create-exam'); }}
                        className="block text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Create Exam
                      </button>
                      <button
                        onClick={() => { setIsMenuOpen(false); navigate('/exams'); }}
                        className="block text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Exams
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                    className="block text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Profile
                  </button>
                </>
              )}
              <div className="pt-4 space-y-3">
                <Button variant="ghost" className="w-full" onClick={() => { setIsMenuOpen(false); navigate('/auth'); }}>
                  Sign In
                </Button>
                <Button variant="hero" className="w-full" onClick={() => { setIsMenuOpen(false); navigate('/auth'); }}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>}
      </div>
    </nav>
  );
};

export default Navbar;
