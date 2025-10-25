import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

interface ProcessingStep {
  label: string;
  completed: boolean;
}

interface AIProcessingScreenProps {
  onComplete: () => void;
}

export default function AIProcessingScreen({ onComplete }: AIProcessingScreenProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { label: 'Analyzing job description', completed: false },
    { label: 'Calculating measurements', completed: false },
    { label: 'Pricing materials', completed: false },
    { label: 'Generating proposal', completed: false },
  ]);

  useEffect(() => {
    const timings = [800, 1600, 2400, 3200];

    timings.forEach((timing, index) => {
      setTimeout(() => {
        setSteps(prev =>
          prev.map((step, i) =>
            i === index ? { ...step, completed: true } : step
          )
        );

        if (index === timings.length - 1) {
          setTimeout(() => {
            onComplete();
          }, 800);
        }
      }, timing);
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-white/10 rounded-full mb-6">
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Your AI is working...
          </h1>
          <p className="text-blue-100">
            Creating a professional proposal from your job details
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 text-white transition-all duration-300"
            >
              {step.completed ? (
                <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-blue-300 flex-shrink-0 animate-pulse" />
              )}
              <span
                className={`text-lg ${
                  step.completed ? 'font-semibold' : 'font-normal'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
