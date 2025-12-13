import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-dostuff.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50 shadow-soft">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Do Stuff" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xl font-bold text-foreground">Do Stuff</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate('/how-it-works')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              How it Works
            </button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button variant="hero" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden border-t border-border">
            <div className="py-6 space-y-4">
              <button 
                onClick={() => { setIsMenuOpen(false); navigate('/how-it-works'); }}
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                How it Works
              </button>
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
