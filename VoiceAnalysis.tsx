import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Mic, MicOff, AlertCircle, CheckCircle, XCircle, Activity } from 'lucide-react';

type VoiceHealthStatus = 'healthy' | 'needs-consultation' | 'high-risk' | null;

interface VoiceAnalysisResult {
  status: VoiceHealthStatus;
  confidence: number;
  metrics: {
    pitch: number;
    volume: number;
    duration: number;
    clarity: number;
  };
  details: string[];
  recommendations: string[];
}

export function VoiceAnalysis() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setRecordingTime(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context for real-time analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        analyzeVoice();
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start audio level monitoring
      monitorAudioLevel();
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current || !isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(100, (average / 255) * 100));
      
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  const analyzeVoice = async () => {
    setIsAnalyzing(true);
    setError(null);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (recordingTime < 3) {
      setError('Recording too short. Please speak for at least 3 seconds.');
      setIsAnalyzing(false);
      setRecordingTime(0);
      return;
    }

    // Mock analysis based on recording metrics
    const mockPitch = 100 + Math.random() * 100; // Hz
    const mockVolume = 50 + Math.random() * 40; // dB
    const mockClarity = 70 + Math.random() * 25; // %
    
    // Simulate health analysis
    const randomFactor = Math.random();
    let status: VoiceHealthStatus;
    let details: string[];
    let recommendations: string[];
    let confidence: number;

    if (randomFactor > 0.7) {
      status = 'healthy';
      confidence = 75 + Math.random() * 20;
      details = [
        'Voice pitch within normal range',
        'Clear pronunciation detected',
        'No irregular breathing patterns',
        'Normal speech tempo',
        'No signs of voice strain or hoarseness'
      ];
      recommendations = [
        'Voice characteristics appear normal',
        'Continue maintaining good vocal health',
        'Stay hydrated and avoid excessive strain',
        'Regular health checkups recommended'
      ];
    } else if (randomFactor > 0.35) {
      status = 'needs-consultation';
      confidence = 60 + Math.random() * 15;
      details = [
        'Minor voice irregularities detected',
        'Slight hoarseness or strain observed',
        'Irregular breathing pattern noticed',
        'Voice pitch variation detected',
        'Possible signs of fatigue or stress'
      ];
      recommendations = [
        'Schedule a consultation with a healthcare provider',
        'Consider ENT specialist evaluation',
        'Monitor for persistent voice changes',
        'Rest your voice and stay hydrated',
        'Avoid shouting or excessive talking'
      ];
    } else {
      status = 'high-risk';
      confidence = 55 + Math.random() * 10;
      details = [
        'Significant voice abnormalities detected',
        'Severe hoarseness or strain present',
        'Irregular breathing patterns observed',
        'Multiple risk indicators identified',
        'Possible respiratory concerns'
      ];
      recommendations = [
        'Consult a healthcare professional immediately',
        'Schedule ENT and respiratory evaluation',
        'Document any additional symptoms',
        'Avoid straining your voice',
        'Seek medical attention without delay'
      ];
    }

    setAnalysisResult({
      status,
      confidence: Math.round(confidence),
      metrics: {
        pitch: Math.round(mockPitch),
        volume: Math.round(mockVolume),
        duration: recordingTime,
        clarity: Math.round(mockClarity)
      },
      details,
      recommendations
    });

    setIsAnalyzing(false);
    setRecordingTime(0);
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setRecordingTime(0);
    setAudioLevel(0);
  };

  const getStatusBadge = (status: VoiceHealthStatus) => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Voice Analysis</CardTitle>
          <CardDescription>
            Record your voice for AI-powered vocal health analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <Alert>
            <AlertDescription className="text-sm">
              <strong>Instructions:</strong> Click "Start Recording" and speak clearly for at least 5 seconds. You can say anything - count numbers, read a sentence, or describe your day.
            </AlertDescription>
          </Alert>

          {!analysisResult && (
            <>
              <div className="flex flex-col items-center space-y-4 py-8">
                <div className={`relative ${isRecording ? 'animate-pulse' : ''}`}>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    {isRecording ? (
                      <MicOff className="w-16 h-16 text-white" />
                    ) : (
                      <Mic className="w-16 h-16 text-white" />
                    )}
                  </div>
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75" />
                  )}
                </div>

                {isRecording && (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Recording Time</span>
                      <span className="font-mono">{formatTime(recordingTime)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Audio Level</span>
                        <span>{Math.round(audioLevel)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-100"
                          style={{ width: `${audioLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      size="lg"
                      disabled={isAnalyzing}
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      variant="destructive"
                    >
                      <MicOff className="w-5 h-5 mr-2" />
                      Stop & Analyze
                    </Button>
                  )}
                </div>

                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4 animate-spin" />
                    Analyzing voice patterns...
                  </div>
                )}
              </div>
            </>
          )}

          {analysisResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg">Analysis Result</h3>
                  {getStatusBadge(analysisResult.status)}
                </div>
                <Button onClick={resetAnalysis} variant="outline">
                  New Analysis
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confidence Level</span>
                  <span>{analysisResult.confidence}%</span>
                </div>
                <Progress value={analysisResult.confidence} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Pitch</div>
                    <div className="text-2xl font-semibold">{analysisResult.metrics.pitch} Hz</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Volume</div>
                    <div className="text-2xl font-semibold">{analysisResult.metrics.volume} dB</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="text-2xl font-semibold">{analysisResult.metrics.duration}s</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Clarity</div>
                    <div className="text-2xl font-semibold">{analysisResult.metrics.clarity}%</div>
                  </CardContent>
                </Card>
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
