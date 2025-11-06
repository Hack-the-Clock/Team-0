import React, { useState, useCallback } from 'react';
import { InterviewStage, Candidate, Job, TranscriptEntry, Analysis } from './types';
import SetupScreen from './components/SetupScreen';
import PreInterviewScreen from './components/PreInterviewScreen';
import InterviewScreen from './components/InterviewScreen';
import PostInterviewAnalysis from './components/PostInterviewAnalysis';
import { analyzeTranscript } from './services/geminiService';

const App: React.FC = () => {
  const [stage, setStage] = useState<InterviewStage>(InterviewStage.SETUP);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [recording, setRecording] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetupComplete = (newJob: Job, newCandidate: Candidate) => {
    setJob(newJob);
    setCandidate(newCandidate);
    setStage(InterviewStage.PRE_INTERVIEW);
  };

  const handleStartInterview = () => {
    setStage(InterviewStage.IN_INTERVIEW);
  };

  const handleInterviewEnd = useCallback(async (finalTranscript: TranscriptEntry[], emotionData: string, rec: Blob | null) => {
    if (!candidate || !job) {
      setError("Candidate or Job data is missing.");
      setStage(InterviewStage.ANALYSIS);
      return;
    }

    setTranscript(finalTranscript);
    setRecording(rec);
    setStage(InterviewStage.ANALYSIS);
    setError(null);
    try {
      const result = await analyzeTranscript(finalTranscript, candidate, job, emotionData);
      setAnalysis(result);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze the interview transcript. Please try again.");
    }
  }, [candidate, job]);

  const handleRestart = () => {
    setStage(InterviewStage.SETUP);
    setCandidate(null);
    setJob(null);
    setTranscript([]);
    setAnalysis(null);
    setRecording(null);
    setError(null);
  }

  const renderStage = () => {
    switch (stage) {
      case InterviewStage.SETUP:
        return (
          <SetupScreen onSetupComplete={handleSetupComplete} />
        );
      case InterviewStage.PRE_INTERVIEW:
        if (!candidate || !job) {
          // This should not happen in the normal flow
          return <div className="text-center">Loading...</div>;
        }
        return (
          <PreInterviewScreen
            candidate={candidate}
            job={job}
            onStart={handleStartInterview}
          />
        );
      case InterviewStage.IN_INTERVIEW:
        if (!candidate || !job) {
          // This should not happen in the normal flow
          return <div className="text-center">Error: Missing interview context. Please restart.</div>;
        }
        return (
          <InterviewScreen
            candidate={candidate}
            job={job}
            onInterviewEnd={handleInterviewEnd}
          />
        );
      case InterviewStage.ANALYSIS:
        return (
          <PostInterviewAnalysis 
            analysis={analysis} 
            transcript={transcript}
            error={error}
            onRestart={handleRestart}
            recording={recording}
          />
        );
      default:
        return <div>Invalid stage</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl mx-auto">
        {renderStage()}
      </div>
    </div>
  );
};

export default App;