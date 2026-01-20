import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, Check, Languages, Flag } from 'lucide-react';

const SettingsLanguage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast({
      title: 'Success',
      description: 'Language settings updated successfully',
    });
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden pt-20">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10 py-12">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="mb-6 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              <span className="text-foreground">Choose Your</span>{" "}
              <span className="text-primary">
                Language
              </span>
            </h1>
            <p className="text-lg text-primary-foreground">
              Select your preferred language for the application
            </p>
          </div>

          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-lg p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Languages className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Language Settings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose the language that works best for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-4 block">Select Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-card/50 backdrop-blur-sm h-12 border-border/50 focus:ring-primary/20">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="flex items-center gap-2">
                        <span>{lang.flag} {lang.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-all duration-300">
                <h3 className="font-medium text-foreground mb-3">Current Selection</h3>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {languages.find(l => l.code === language)?.flag}
                  </div>
                  <span className="text-foreground font-medium flex-1">
                    {languages.find(l => l.code === language)?.name}
                  </span>
                  {language === 'en' && <Check className="w-5 h-5 text-success" />}
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full text-lg py-6"
                size="lg"
              >
                {saving ? 'Saving...' : 'Save Language Settings'}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Language changes will be applied immediately after saving.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsLanguage;