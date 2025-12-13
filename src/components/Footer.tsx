import { Mail, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-dostuff.png";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Do Stuff" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xl font-bold">Do Stuff</span>
            </div>
            <p className="text-background/70 mb-6 max-w-md leading-relaxed">
              The ultimate exam platform for teachers and students.
              Create engaging assessments and track progress with ease.
            </p>
            <div className="flex gap-4">
              <a
                href="https://oryno-co.pages.dev/contact"
                className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://buymeacoffee.com/oryno801"
                className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Coffee className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-background/70">
              
              <li>
                <a href="https://oryno-co.pages.dev/contact" className="hover:text-background transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate('/privacy-policy')}
                  className="hover:text-background transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/terms-of-service')}
                  className="hover:text-background transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-background/70">© 2025 Do Stuff. All rights reserved. Made with ❤️ for educators and learners.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
