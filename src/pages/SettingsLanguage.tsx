import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, Check } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary-glow rounded-full blur-2xl animate-pulse"></div>
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
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Language
              </span>
            </h1>
            <p className="text-lg text-primary-foreground">
              Select your preferred language for the application
            </p>
          </div>

          <Card className="bg-gradient-card rounded-3xl shadow-strong p-8 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-success" />
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
                  <SelectTrigger className="bg-background/50 backdrop-blur-sm h-12">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-background/20 rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-2">Current Selection</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {languages.find(l => l.code === language)?.flag}
                  </span>
                  <span className="text-foreground font-medium">
                    {languages.find(l => l.code === language)?.name}
                  </span>
                  {language === 'en' && <Check className="w-4 h-4 text-success ml-auto" />}
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