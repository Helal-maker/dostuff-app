import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Info, ArrowLeft, Users, Trophy, Shield, Zap } from 'lucide-react';

const SettingsAbout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary-glow rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10 py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="mb-6 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="text-foreground">About</span>{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Do Stuff
              </span>
            </h1>
            <p className="text-xl text-primary-foreground">
              Revolutionizing education through innovative exam technology
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-12">
            <Card className="bg-gradient-card rounded-3xl shadow-strong p-8 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  Do Stuff is a comprehensive exam platform designed to make creating, taking,
                  and managing exams easier for educators and students alike. Our mission is to
                  provide a secure, user-friendly environment for educational assessment with
                  advanced anti-cheating features and real-time analytics.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card rounded-3xl shadow-strong p-8 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-success" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Who We Serve</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  From primary schools to universities, our platform serves educators who want
                  to focus on teaching rather than exam logistics. Students benefit from
                  engaging, interactive assessments that enhance learning outcomes.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-card rounded-3xl shadow-strong p-8 backdrop-blur-sm mb-8">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-foreground">Key Features</CardTitle>
              <CardDescription className="text-muted-foreground">
                What makes Do Stuff the leading exam platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-6 h-6 text-warning" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Multiple Formats</h3>
                  <p className="text-sm text-muted-foreground">10+ question types including multiple choice, essays, and translations</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Anti-Cheating</h3>
                  <p className="text-sm text-muted-foreground">Advanced security features to maintain exam integrity</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Real-time Analytics</h3>
                  <p className="text-sm text-muted-foreground">Instant results and detailed performance insights</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card rounded-3xl shadow-strong p-8 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-foreground">About the Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 text-center">
                <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Built with modern web technologies, Do Stuff offers a Progressive Web App (PWA)
                  experience that works seamlessly across devices. Our platform includes offline
                  capabilities, push notifications, and comprehensive accessibility features.
                </p>

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="font-bold text-foreground text-2xl">2024</p>
                    <p className="text-sm text-muted-foreground">Founded</p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-2xl">1.0.0</p>
                    <p className="text-sm text-muted-foreground">Version</p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-2xl">10+</p>
                    <p className="text-sm text-muted-foreground">Question Types</p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-2xl">∞</p>
                    <p className="text-sm text-muted-foreground">Possibilities</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsAbout;