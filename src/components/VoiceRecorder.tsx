import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  onError?: (error: string) => void;
  maxDuration?: number;
  contextPrompt?: string;
}

export default function VoiceRecorder({
  onTranscriptionComplete,
  onError,
  maxDuration = 600,
  contextPrompt = 'Transcribe this contractor describing a home remodeling job:',
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        if (audioContextRef.current) {
          audioContextRef.current.close();
        }

        await processAudio(audioBlob);
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setIsRecording(true);
      setRecordingTime(0);
      setPermissionDenied(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          if (newTime === maxDuration - 60) {
            if (onError) {
              onError('1 minute remaining');
            }
          }
          return newTime;
        });
      }, 1000);

      visualizeAudio();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionDenied(true);
      if (onError) {
        onError('Microphone access denied. Please enable microphone permissions.');
      }
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current || !isRecording) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);

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
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    if (audioBlob.size === 0) {
      if (onError) {
        onError('No audio detected in recording. Please try again.');
      }
      return;
    }

    setIsProcessing(true);

    try {
      const openaiKey = import.meta.env.OPENAI_API_KEY;

      if (!openaiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Transcription failed: ${errorText}`);
      }

      const data = await response.json();

      if (data.text) {
        onTranscriptionComplete(data.text);
      } else {
        throw new Error('No transcription returned');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      if (onError) {
        const message = error instanceof Error ? error.message : 'Could not process audio';
        onError(message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (permissionDenied) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-900 mb-1">
            Microphone Access Required
          </p>
          <p className="text-sm text-red-700 mb-3">
            Please enable microphone permissions in your browser settings to use voice input.
          </p>
          <button
            onClick={() => {
              setPermissionDenied(false);
              startRecording();
            }}
            className="text-sm text-red-600 font-semibold hover:text-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 mb-1">Processing Audio...</p>
            <p className="text-sm text-gray-600">
              Transcribing your recording with AI
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div
              className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"
              style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
            ></div>
            <button
              onClick={stopRecording}
              className="relative w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
            >
              <Square className="w-8 h-8 text-white fill-white" />
            </button>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-red-900 mb-1">Recording...</p>
            <p className="text-2xl font-mono font-bold text-red-700">
              {formatTime(recordingTime)}
            </p>
            {recordingTime >= maxDuration - 60 && (
              <p className="text-sm text-red-600 mt-2 font-semibold">
                {formatTime(maxDuration - recordingTime)} remaining
              </p>
            )}
          </div>

          <div className="w-full max-w-xs">
            <div className="h-2 bg-red-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-75"
                style={{ width: `${audioLevel * 100}%` }}
              ></div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Tap the button to stop recording
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
      <div className="flex flex-col items-center justify-center gap-4">
        <button
          onClick={startRecording}
          className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Mic className="w-10 h-10 text-white" />
        </button>

        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-1">
            Ready to Record
          </p>
          <p className="text-sm text-gray-600">
            Tap the microphone to start voice input
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Maximum duration: {formatTime(maxDuration)}
          </p>
        </div>
      </div>
    </div>
  );
}
