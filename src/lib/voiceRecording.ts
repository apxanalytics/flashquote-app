import { useState, useRef, useCallback } from 'react';

export interface UseVoiceRecordingReturn {
  isRecording: boolean;
  transcript: string;
  audioBlob: Blob | null;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  setTranscript: (text: string) => void;
  reset: () => void;
}

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      durationIntervalRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        throw new Error('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (error instanceof Error && error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      } else {
        throw new Error('Failed to access microphone. Please try again.');
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const reset = useCallback(() => {
    setTranscript('');
    setAudioBlob(null);
    setDuration(0);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    transcript,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    setTranscript,
    reset,
  };
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');

  const response = await fetch(
    `/functions/v1/whisper-transcribe`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Transcription error: ${errorText}`);
  }

  const data = await response.json();
  return data.text || '';
}

export async function transcribeWithRetry(
  audioBlob: Blob,
  maxRetries = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await transcribeAudio(audioBlob);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Transcription attempt ${attempt} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error('Transcription failed after multiple attempts');
}

export interface ProposalData {
  jobTitle: string;
  roomType: string;
  measurements: {
    length: number;
    width: number;
    height?: number;
    totalSqFt: number;
  };
  scopeOfWork: string[];
  materials: Array<{
    item: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  laborHours: number;
  laborCost: number;
  materialsCost: number;
  totalCost: number;
  durationDays: number;
  notes?: string;
}

export async function parseTranscriptToProposal(
  transcript: string,
  userSettings: {
    hourlyRate: number;
    materialMarkup: number;
    trade: string;
  }
): Promise<ProposalData> {
  const response = await fetch(
    `/functions/v1/chat-assistant`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        userSettings,
        parseMode: true,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to parse job description');
  }

  const data = await response.json();
  return data.proposalData;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export async function estimateTranscriptionCost(durationSeconds: number): Promise<number> {
  const minutes = Math.ceil(durationSeconds / 60);
  const costPerMinute = 0.006;
  return minutes * costPerMinute;
}

export async function logAIUsage(
  userId: string,
  type: 'whisper_transcription' | 'gpt4_parsing',
  metadata: {
    durationSeconds?: number;
    tokens?: number;
    cost: number;
  }
): Promise<void> {
  try {
    const { supabase } = await import('./supabase');

    await supabase.from('usage_logs').insert({
      user_id: userId,
      usage_type: type,
      quantity: metadata.tokens || Math.ceil((metadata.durationSeconds || 0) / 60),
      cost: metadata.cost,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  } catch (error) {
    console.error('Failed to log AI usage:', error);
  }
}
