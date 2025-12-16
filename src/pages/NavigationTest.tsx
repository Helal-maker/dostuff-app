import { useState, useEffect } from 'react';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  CheckCircle, 
  XCircle,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * Navigation Test Component
 * Tests responsive navigation across different device types
 */
const NavigationTest = () => {
  const [screenSize, setScreenSize] = useState('desktop');
  const [showTestInfo, setShowTestInfo] = useState(true);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getDeviceIcon = () => {
    switch (screenSize) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getDeviceColor = () => {
    switch (screenSize) {
      case 'mobile': return 'bg-green-500';
      case 'tablet': return 'bg-blue-500';
      default: return 'bg-purple-500';
    }
  };

  const navigationFeatures = [
    {
      name: 'Home Navigation',
      mobile: true,
      tablet: true,
      desktop: true,
      description: 'Always accessible across all devices'
    },
    {
      name: 'Join Exam',
      mobile: true,
      tablet: true,
      desktop: true,
      description: 'Available for students on all devices'
    },
    {
      name: 'Create Exam',
      mobile: true,
      tablet: true,
      desktop: true,
      description: 'Available for teachers on all devices'
    },
    {
      name: 'Results/Exams',
      mobile: true,
      tablet: true,
      desktop: true,
      description: 'Context-aware based on user role'
    },
    {
      name: 'Profile',
      mobile: true,
      tablet: true,
      desktop: true,
      description: 'Accessible from all navigation types'
    },
    {
      name: 'How it Works',
      mobile: true,
      tablet: true,
      desktop: true,
      description: 'Public navigation item'
    },
    {
      name: 'Floating Animation',
      mobile: false,
      tablet: false,
      desktop: true,
      description: 'Desktop-only floating navigation with constraints'
    },
    {
      name: 'Height Limitations',
      mobile: false,
      tablet: false,
      desktop: true,
      description: 'Desktop navigation constrained to 60vh max height'
    },
    {
      name: 'Tooltips',
      mobile: false,
      tablet: false,
      desktop: true,
      description: 'Desktop navigation shows helpful tooltips'
    },
    {
      name: 'Active Indicators',
      mobile: true,
      tablet: true,
      desktop: true,
      description: 'Visual feedback for current page on all devices'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Test Info Panel */}
      {showTestInfo && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <Card className="p-4 bg-white/90 backdrop-blur-sm border-2 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-blue-900">Navigation Test</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTestInfo(false)}
                className="p-1"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full text-white ${getDeviceColor()}`}>
                  {getDeviceIcon()}
                </div>
                <div>
                  <div className="font-medium capitalize">{screenSize} Mode</div>
                  <div className="text-sm text-gray-600">
                    Window: {window.innerWidth}px × {window.innerHeight}px
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">Mobile</div>
                  <div className="text-gray-600">< 768px</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Tablet</div>
                  <div className="text-gray-600">768-1024px</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Desktop</div>
                  <div className="text-gray-600">> 1024px</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Show Test Info Toggle */}
      {!showTestInfo && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTestInfo(true)}
          className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          Show Test Info
        </Button>
      )}

      {/* Navigation Component */}
      <ResponsiveNavbar />

      {/* Test Content */}
      <div className="pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Navigation Test Page
            </h1>
            <p className="text-lg text-gray-600">
              Testing responsive navigation across different device types
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="capitalize">
                Current: {screenSize}
              </Badge>
              <Badge variant="secondary">
                {window.innerWidth}px width
              </Badge>
            </div>
          </div>

          {/* Feature Test Grid */}
          <div className="grid gap-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Navigation Features Test
            </h2>
            
            {navigationFeatures.map((feature, index) => {
              const isSupported = feature[screenSize as keyof typeof feature] as boolean;
              
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {feature.name}
                        </h3>
                        {isSupported ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {feature.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {/* Mobile indicator */}
                      <div className={`w-3 h-3 rounded-full ${
                        feature.mobile ? 'bg-green-500' : 'bg-gray-300'
                      }`} title="Mobile" />
                      
                      {/* Tablet indicator */}
                      <div className={`w-3 h-3 rounded-full ${
                        feature.tablet ? 'bg-blue-500' : 'bg-gray-300'
                      }`} title="Tablet" />
                      
                      {/* Desktop indicator */}
                      <div className={`w-3 h-3 rounded-full ${
                        feature.desktop ? 'bg-purple-500' : 'bg-gray-300'
                      }`} title="Desktop" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Navigation Type Info */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Current Navigation Type: {screenSize}
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  {screenSize === 'mobile' && (
                    <>
                      <p>• Bottom navigation bar with icons and labels</p>
                      <p>• Touch-optimized button sizes (minimum 44px)</p>
                      <p>• Scrollable if more than 4 items</p>
                      <p>• Always visible at bottom of screen</p>
                    </>
                  )}
                  {screenSize === 'tablet' && (
                    <>
                      <p>• Top navigation bar with logo and menu button</p>
                      <p>• Bottom icon-based navigation bar</p>
                      <p>• Icon-only buttons with hover states</p>
                      <p>• Mobile menu overlay for additional options</p>
                    </>
                  )}
                  {screenSize === 'desktop' && (
                    <>
                      <p>• Top navigation bar with logo and CTA buttons</p>
                      <p>• Floating sidebar navigation with tooltips</p>
                      <p>• Height constrained to 60% of viewport</p>
                      <p>• Smooth animations and active indicators</p>
                      <p>• Settings icon for additional options</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Test Instructions */}
          <Card className="p-6 bg-gray-50 border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              Test Instructions
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>1. Resize your browser window to test different device types</p>
              <p>2. Check that navigation items are accessible on all screen sizes</p>
              <p>3. Verify that desktop shows floating navigation with tooltips</p>
              <p>4. Test that active states are highlighted correctly</p>
              <p>5. Ensure all navigation items navigate to their respective pages</p>
            </div>
          </Card>

          {/* Navigation Items for Testing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { path: '/', label: 'Home' },
              { path: '/how-it-works', label: 'How it Works' },
              { path: '/join', label: 'Join Exam' },
              { path: '/create-exam', label: 'Create Exam' },
              { path: '/exams', label: 'Exams' },
              { path: '/results', label: 'Results' },
              { path: '/profile', label: 'Profile' }
            ].map((item) => (
              <Button
                key={item.path}
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => window.location.href = item.path}
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-gray-500">{item.path}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationTest;
