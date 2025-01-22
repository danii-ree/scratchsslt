"use client"
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import WebViewer from "@pdftron/webviewer";
import { useRouter } from "next/navigation";

export default function PracticePage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [xp, setXp] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const router = useRouter();
  const viewer = useRef(null);

  useEffect(() => {
    import('@pdftron/webviewer').then(() => {
      WebViewer(
        {
          path: '/lib',
        },
        viewer.current,
      ).then((instance) => {
        instance.UI.loadDocument('https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf');
      });
    });
  }, []);

  const questions = {
    question_1: {
      id: 1,
      type: "multiple-choice",
      question: "What is the capital of Canada?",
      options: ["Toronto", "Ottawa", "Vancouver", "Montreal"],
      answer: "Ottawa",
    },
    question_2: {
      id: 2,
      type: "essay",
      question: "Describe the impact of climate change on Canadian ecosystems.",
      answer: "",
    },
    question_3: {
      id: 3,
      type: "matching",
      question: "Match the provinces to their capitals.",
      options: [
        { term: "Ontario", match: "Toronto" },
        { term: "British Columbia", match: "Victoria" },
      ],
      answer: ["Toronto", "Victoria"],
    },
    question_4: {
      id: 4,
      type: "ordering",
      question: "Arrange these steps in the correct order.",
      options: ["Step 1", "Step 2", "Step 3"],
      answer: ["Step 1", "Step 2", "Step 3"],
    },
  };

  const questionKeys = Object.keys(questions);
  const currentQuestion = questions[questionKeys[currentQuestionIndex]];

  const handleAnswerChange = (value) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: value,
    });
  };

  const handleNextQuestion = () => {
    if (checkAnswer(currentQuestion)) {
      setXp(xp + 10);
      setCorrectAnswersCount(correctAnswersCount + 1);
    }
    if (currentQuestionIndex + 1 < questionKeys.length) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const checkAnswer = (question) => {
    const userAnswer = userAnswers[question.id];
    if (!userAnswer) return false;

    switch (question.type) {
      case "multiple-choice":
        return userAnswer === question.answer;
      case "matching":
        return question.answer.every((ans, index) => ans === userAnswer[index]);
      case "ordering":
        return JSON.stringify(question.answer) === JSON.stringify(userAnswer);
      default:
        return false;
    }
  };

  const handleOptionSelect = (option) => {
    handleAnswerChange(option);
  };

  const handleOrderClick = (option) => {
    const currentOrder = userAnswers[currentQuestion.id] || [];
    if (!currentOrder.includes(option)) {
      handleAnswerChange([...currentOrder, option]);
    }
  };

  const renderQuestion = () => {
    if (quizComplete) {
      return (
        <div className={styles.completeScreen}>
          <h2>Questions Complete!</h2>
          <p>You earned {xp} XP</p>
          <p>Correct Answers: {correctAnswersCount}/{questionKeys.length}</p>
          <a onClick={() => router.push("/")} className={styles.homeButton}>Back to Homepage</a>
        </div>
      );
    }

    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <div className={styles.questionCard}>
            <h3 className={styles.questionTitle}>{currentQuestion.question}</h3>
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`${styles.optionButton} ${
                  userAnswers[currentQuestion.id] === option ? styles.selectedOption : ""
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case "essay":
        return (
          <div className={styles.questionCard}>
            <h3 className={styles.questionTitle}>{currentQuestion.question}</h3>
            <textarea
              onChange={(e) => handleAnswerChange(e.target.value)}
              className={styles.essayInput}
              placeholder="Write your answer here..."
            ></textarea>
          </div>
        );

      case "matching":
        return (
          <div className={styles.questionCard}>
            <h3 className={styles.questionTitle}>{currentQuestion.question}</h3>
            {currentQuestion.options.map((pair, index) => (
              <div key={index} className={styles.matchingPair}>
                <span>{pair.term}</span>
                <input
                  type="text"
                  className={styles.matchInput}
                  placeholder="Enter match"
                  onChange={(e) =>
                    handleAnswerChange({
                      ...userAnswers[currentQuestion.id],
                      [index]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>
        );

      case "ordering":
        return (
          <div className={styles.questionCard}>
            <h3 className={styles.questionTitle}>{currentQuestion.question}</h3>
            <div className={styles.orderingOptionsContainer}>
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOrderClick(option)}
                  className={`${styles.orderingOption} ${
                    (userAnswers[currentQuestion.id] || []).includes(option)
                      ? styles.selectedOrderOption
                      : ""
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className={styles.currentOrder}>
              <h4>Current Order:</h4>
              {(userAnswers[currentQuestion.id] || []).map((option, index) => (
                <span key={index} className={styles.orderOption}>
                  {option}
                </span>
              ))}
            </div>
          </div>
        );

      default:
        return <p>Unknown question type</p>;
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.progressBar} title="Progress"></div>
          <div className={styles.xpTracker}>XP: {xp}</div>
        </div>

        <div className={styles.viewer} ref={viewer} style={{ height: "100vh" }}></div>
        {renderQuestion()}
        {!quizComplete && (
          <a onClick={handleNextQuestion} className={styles.nextButton}>
            Next
          </a>
        )}
      </div>
    </div>
  );
}
