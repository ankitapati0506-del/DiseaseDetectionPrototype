import { useState, useRef, useEffect } from 'react';
import * as blazeface from '@tensorflow-models/blazeface';
import { loadBlazeFaceModel } from '../utils/tfLoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Camera, Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

type HealthStatus = 'healthy' | 'needs-consultation' | 'high-risk' | null;

interface AnalysisResult {
  status: HealthStatus;
  confidence: number;
  details: string[];
  recommendations: string[];
}

export function FaceScan() {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    loadModel();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModel = async () => {
    // Prevent multiple simultaneous load attempts
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setIsModelLoading(true);
      const loadedModel = await loadBlazeFaceModel();
      setModel(loadedModel);
      setIsModelLoading(false);
    } catch (err) {
      setError('Failed to load AI model. Please refresh the page.');
      setIsModelLoading(false);
    } finally {
      isLoadingRef.current = false;
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || !model) return;

    setIsAnalyzing(true);
    setError(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);

    try {
      const predictions = await model.estimateFaces(canvas, false);
      
      if (predictions.length === 0) {
        setError('No face detected. Please ensure your face is clearly visible.');
        setIsAnalyzing(false);
        return;
      }

      // Draw detection box
      predictions.forEach(prediction => {
        const start = prediction.topLeft as [number, number];
        const end = prediction.bottomRight as [number, number];
        const size = [end[0] - start[0], end[1] - start[1]];
        
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(start[0], start[1], size[0], size[1]);
      });

      // Simulate AI analysis
      await analyzeHealth(predictions);
      
      stopCamera();
    } catch (err) {
      setError('Analysis failed. Please try again.');
    }
    
    setIsAnalyzing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current || !model) return;

    setIsAnalyzing(true);
    setError(null);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const predictions = await model.estimateFaces(canvas, false);
        
        if (predictions.length === 0) {
          setError('No face detected in the image. Please upload a clear face photo.');
          setIsAnalyzing(false);
          return;
        }

        // Draw detection box
        predictions.forEach(prediction => {
          const start = prediction.topLeft as [number, number];
          const end = prediction.bottomRight as [number, number];
          const size = [end[0] - start[0], end[1] - start[1]];
          
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.strokeRect(start[0], start[1], size[0], size[1]);
        });

        await analyzeHealth(predictions);
      } catch (err) {
        setError('Analysis failed. Please try again.');
      }
      
      setIsAnalyzing(false);
      URL.revokeObjectURL(img.src);
    };
  };

  const analyzeHealth = async (predictions: any[]) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock analysis based on detection confidence and random factors
    const faceCount = predictions.length;
    const confidence = predictions[0]?.probability || 0.95;
    
    // Simulate health analysis (this is mock data)
    const randomFactor = Math.random();
    let status: HealthStatus;
    let details: string[];
    let recommendations: string[];
    let finalConfidence: number;

    if (randomFactor > 0.7) {
      status = 'healthy';
      finalConfidence = 75 + Math.random() * 20;
      details = [
        'Normal facial symmetry detected',
        'Skin tone analysis: Within normal range',
        'Eye analysis: No visible abnormalities',
        'Facial temperature estimation: Normal'
      ];
      recommendations = [
        'Continue maintaining good health habits',
        'Regular health checkups recommended',
        'Stay hydrated and get adequate sleep'
      ];
    } else if (randomFactor > 0.35) {
      status = 'needs-consultation';
      finalConfidence = 60 + Math.random() * 15;
      details = [
        'Minor facial asymmetry detected',
        'Skin tone variation observed',
        'Eye fatigue indicators present',
        'Possible signs of stress or fatigue'
      ];
      recommendations = [
        'Schedule a consultation with a healthcare provider',
        'Monitor for any changes in symptoms',
        'Ensure adequate rest and stress management',
        'Consider a comprehensive health screening'
      ];
    } else {
      status = 'high-risk';
      finalConfidence = 55 + Math.random() * 10;
      details = [
        'Significant facial irregularities detected',
        'Abnormal skin tone patterns observed',
        'Multiple risk indicators present',
        'Immediate medical attention may be needed'
      ];
      recommendations = [
        'Consult a healthcare professional immediately',
        'Schedule comprehensive medical examination',
        'Document any recent symptoms or changes',
        'Do not delay seeking medical advice'
      ];
    }

    setAnalysisResult({
      status,
      confidence: Math.round(finalConfidence),
      details,
      recommendations
    });
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-4 h-4 mr-1" />Healthy</Badge>;
      case 'needs-consultation':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertCircle className="w-4 h-4 mr-1" />Needs Consultation</Badge>;
      case 'high-risk':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-4 h-4 mr-1" />High Risk</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Face Scan Analysis</CardTitle>
          <CardDescription>
            Use your camera or upload an image for AI-powered facial health analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isModelLoading && (
            <Alert>
              <AlertDescription>Loading AI model, please wait...</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription className="text-sm">
              <strong>Disclaimer:</strong> This is a prototype demonstration only. Results are simulated and should NOT be used for actual medical diagnosis. Always consult qualified healthcare professionals for health concerns.
            </AlertDescription>
          </Alert>

          {!analysisResult && (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                {!isCameraActive ? (
                  <Button
                    onClick={startCamera}
                    disabled={isModelLoading}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={captureAndAnalyze}
                      disabled={isAnalyzing}
                      className="flex-1"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Capture & Analyze'}
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      disabled={isAnalyzing}
                    >
                      Stop Camera
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isModelLoading || isAnalyzing || isCameraActive}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p>Camera preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <canvas ref={canvasRef} className={analysisResult ? 'w-full rounded-lg' : 'hidden'} />

          {analysisResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg">Analysis Result</h3>
                  {getStatusBadge(analysisResult.status)}
                </div>
                <Button onClick={resetAnalysis} variant="outline">
                  New Scan
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confidence Level</span>
                  <span>{analysisResult.confidence}%</span>
                </div>
                <Progress value={analysisResult.confidence} />
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Analysis Details:</h4>
                <ul className="space-y-1 text-sm">
                  {analysisResult.details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Recommendations:</h4>
                <ul className="space-y-1 text-sm">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
