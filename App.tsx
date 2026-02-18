import { useState } from 'react';
import { FaceScan } from './components/FaceScan';
import { VoiceAnalysis } from './components/VoiceAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { Scan, Mic, Activity, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('face');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl mb-2">AI Disease Detection Prototype</h1>
          <p className="text-muted-foreground text-lg">
            Advanced facial and voice analysis powered by machine learning
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-6 border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Medical Disclaimer:</strong> This is a technology demonstration prototype only. 
            All analysis results are simulated for educational purposes and should NEVER be used for 
            actual medical diagnosis, treatment decisions, or health assessments. Always consult 
            qualified healthcare professionals for any health concerns.
          </AlertDescription>
        </Alert>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Scan className="w-5 h-5" />
                Face Scan
              </CardTitle>
              <CardDescription>
                Advanced facial analysis using TensorFlow.js and BlazeFace model to detect facial features and patterns
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Mic className="w-5 h-5" />
                Voice Analysis
              </CardTitle>
              <CardDescription>
                Real-time voice pattern analysis examining pitch, tone, clarity, and other vocal characteristics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="face" className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              Face Scan
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voice Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="face">
            <FaceScan />
          </TabsContent>

          <TabsContent value="voice">
            <VoiceAnalysis />
          </TabsContent>
        </Tabs>

        {/* How It Works Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Face Scan Technology:</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Uses TensorFlow.js BlazeFace model for real-time face detection</li>
                <li>• Analyzes facial features, symmetry, and visual patterns</li>
                <li>• Supports both live camera feed and uploaded images</li>
                <li>• Provides detailed health indicators based on facial analysis</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Voice Analysis Technology:</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Records and processes voice using Web Audio API</li>
                <li>• Analyzes pitch, volume, clarity, and speech patterns</li>
                <li>• Real-time audio level monitoring during recording</li>
                <li>• Evaluates vocal characteristics for health insights</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Privacy & Security:</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• All processing happens locally in your browser</li>
                <li>• No data is uploaded to external servers</li>
                <li>• Camera and microphone access requires your permission</li>
                <li>• Your privacy and data security are protected</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2026 AI Disease Detection Prototype | For Educational & Demonstration Purposes Only</p>
        </div>
      </div>
    </div>
  );
}
