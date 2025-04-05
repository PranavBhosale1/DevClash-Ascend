import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react"; // Added icons for results

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer?: string;
  topic?: string;
  explanation?: string;
}

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  videoUrl: string;
}

export default function QuizModal({
  open,
  onClose,
  onSubmit,
  videoUrl,
}: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [localOpen, setLocalOpen] = useState(open);

  useEffect(() => {
    setLocalOpen(open);
  }, [open]);

  useEffect(() => {
    const generateQuizFromVideo = async () => {
      if (localOpen && videoUrl) {
        setLoading(true);
        setSubmitted(false);
        setScore(null);
        setQuestions([]);
        setSelectedAnswers({});
        try {
          const transcriptResponse = await axios.post("/api/transcript", {
            videoUrl: videoUrl,
          });

          const transcript = transcriptResponse.data.transcript;

          if (!transcript || transcript.trim() === "") {
            throw new Error("Transcript is empty. Cannot generate quiz.");
          }

          const quizResponse = await axios.post("/api/generate-quiz", {
            transcript: transcript,
          });

          const generatedQuestions: QuizQuestion[] = quizResponse.data.questions;

          if (!generatedQuestions || generatedQuestions.length === 0) {
            throw new Error("Quiz generation failed: No questions returned.");
          }

          setQuestions(generatedQuestions);
        } catch (error) {
          console.error("Error generating quiz from video:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    generateQuizFromVideo();
  }, [localOpen, videoUrl]);

  const handleOptionSelect = (questionIndex: number, option: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
    
    if (onSubmit) {
      onSubmit();
    }
  };

  const handleDone = () => {
    setLocalOpen(false);
    onClose();
  };

  const handleTryAgain = () => {
    setSubmitted(false);
    setScore(null);
    setSelectedAnswers({});
  };

  const isCorrect = (questionIndex: number, option: string) => {
    return submitted && selectedAnswers[questionIndex] === option && option === questions[questionIndex].correct_answer;
  };

  const isIncorrect = (questionIndex: number, option: string) => {
    return submitted && selectedAnswers[questionIndex] === option && option !== questions[questionIndex].correct_answer;
  };

  const isCorrectAnswer = (questionIndex: number, option: string) => {
    return submitted && option === questions[questionIndex].correct_answer;
  };

  return (
    <Dialog 
      open={localOpen} 
      onOpenChange={(isOpen) => {
        setLocalOpen(isOpen);
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Quiz 📚</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-40 bg-gray-800 rounded-lg text-white">
            <Loader2 className="animate-spin h-6 w-6 mr-2 text-gray-300" />
            <span>Generating quiz...</span>
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
            {questions.map((q, index) => (
              <div key={index} className={`p-4 rounded-lg ${submitted ? 'border' : ''}`}>
                <p className="font-medium">{`Q${index + 1}: ${q.question}`}</p>
                <div className="space-y-2 mt-2">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`cursor-pointer p-3 rounded-md border flex items-center ${
                        isCorrect(index, opt)
                          ? 'bg-green-100 border-green-900'
                          : isIncorrect(index, opt)
                          ? 'bg-red-100 border-red-900'
                          : isCorrectAnswer(index, opt) && submitted
                          ? 'bg-green-50 border-green-900'
                          : selectedAnswers[index] === opt
                          ? 'bg-gray-600 border-gray-700 text-white'
                          : 'hover:bg-gray-600 hover:text-white hover:border-gray-700'
                      }`}
                      onClick={() => handleOptionSelect(index, opt)}
                    >
                      {submitted && (
                        <span className="mr-2">
                          {isCorrect(index, opt) ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isIncorrect(index, opt) ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : isCorrectAnswer(index, opt) ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : null}
                        </span>
                      )}
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
                {submitted && q.explanation && (
                  <div className="mt-3 p-3 bg-gray-700 rounded-md text-sm text-white">
                    <p className="font-semibold">Explanation:</p>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-300 bg-gray-800 p-6 rounded-lg">No quiz available.</p>
        )}

        {submitted && score !== null && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg text-center border border-gray-800 text-white">
            <p className="text-xl font-semibold mb-1">
              Your Score: {score} / {questions.length}
            </p>
            <p className="text-sm text-gray-200">
              {score === questions.length 
                ? "Perfect score! You've mastered this content." 
                : score >= questions.length / 2 
                ? "Good job! Review the explanations to learn more." 
                : "Keep learning! Review the explanations and try again."}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={loading || questions.length === 0 || Object.keys(selectedAnswers).length < questions.length}
              className="bg-gray-700 hover:bg-gray-800 text-white"
            >
              Submit Quiz
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleTryAgain}
                className="border-gray-600 hover:bg-gray-700 hover:text-white"
              >
                Try Again
              </Button>
              <Button onClick={handleDone}
                className="bg-gray-700 hover:bg-gray-800 text-white"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
