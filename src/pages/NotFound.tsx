import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import lottie404 from "../lottiefiles/404webpage.lottie?url";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-pulse-slow delay-1000" />

      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Lottie Animation - Centered */}
        <div className="w-full max-w-md md:max-w-lg animate-fade-in-up">
          <DotLottieReact
            src={lottie404}
            loop
            autoplay
            className="w-full h-auto"
          />
        </div>

        {/* Text below animation */}
        <div className="text-center mt-4 animate-fade-in-up delay-200">
          <p className="text-xl md:text-2xl text-gray-300 mb-2 font-light">
            Oops! Looks like this page got lost in the digital void
          </p>
          <p className="text-sm text-gray-400">
            Don't worry, even the best explorers sometimes take a wrong turn
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in-up delay-400">
          <a
            href="/"
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          </a>

          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex items-center gap-2 text-gray-500 text-sm animate-fade-in-up delay-600">
          <span className="w-12 h-px bg-gradient-to-r from-transparent to-purple-500" />
          <span>Page not found • 404 Error</span>
          <span className="w-12 h-px bg-gradient-to-l from-transparent to-purple-500" />
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-600 {
          animation-delay: 0.6s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
