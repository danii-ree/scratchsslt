"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { db } from "../firebase/config";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, addDoc, collection } from "firebase/firestore";


export default function UploadModal({ onClose, onUpload }) {
  const [questions, setQuestions] = useState([
    { question: "", answers: [], type: "multiple-choice", correctAnswer: "" },
  ]);
  const [file, setFile] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);

  // handling upload
  const handleUpload = async () => {
    if (!file) return;

    const storage = getStorage();
    const firestore = getFirestore();

    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `uploads/${file.name}`);
      await uploadBytes(storageRef, file);

      // Get download URL for the uploaded file
      const fileUrl = await getDownloadURL(storageRef);

      // Save data to Firestore, including file URL
      const docRef = await addDoc(collection(firestore, "practiceProblems"), {
        questions,
        type,
        fileUrl, // Save the file URL in Firestore
        uploadedAt: new Date(),
      });

      console.log("Document written with ID: ", docRef.id);
      onClose(); // Close the modal after upload
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  }

  const handleAddQuestion = () => {
    if (questionCount < 6) {
      setQuestions([
        ...questions,
        { question: "", answers: [], type: "multiple-choice", correctAnswer: "" },
      ]);
      setQuestionCount(questionCount + 1);
    }
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
    setQuestionCount(questionCount - 1);
    if (currentPage >= questionCount - 1) setCurrentPage(currentPage - 1);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (index, answerIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[index].answers[answerIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerSelect = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const renderQuestionForm = () => {
    const question = questions[currentPage];

    return (
      <div className={styles.questionForm}>
        <div className={styles.questionInput}>
          <label>Question:</label>
          <input
            type="text"
            value={question.question}
            onChange={(e) => handleQuestionChange(currentPage, "question", e.target.value)}
            placeholder="Write the question"
          />
        </div>

        {question.type === "multiple-choice" && (
          <div className={styles.answersInput}>
            <label>Answers:</label>
            {question.answers.map((answer, ansIndex) => (
              <div key={ansIndex} className={styles.answerOption}>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(currentPage, ansIndex, e.target.value)}
                  placeholder={`Answer ${ansIndex + 1}`}
                />
                <input
                  type="radio"
                  name={`correctAnswer-${currentPage}`}
                  checked={question.correctAnswer === answer}
                  onChange={() => handleCorrectAnswerSelect(currentPage, answer)}
                />
                <span>Mark as correct</span>
              </div>
            ))}
            <button
              className={styles.addAnswerButton}
              onClick={() => {
                const newQuestions = [...questions];
                newQuestions[currentPage].answers.push("");
                setQuestions(newQuestions);
              }}
            >
              Add Answer
            </button>
          </div>
        )}

        {question.type === "essay" && (
          <div className={styles.essayInput}>
            <label>Essay Question:</label>
            <p>Only the question header is required for an essay question.</p>
          </div>
        )}

        {question.type === "arranging-orders" && (
          <div className={styles.orderingInput}>
            <label>Number of Items:</label>
            <input
              type="range"
              min="1"
              max="4"
              value={question.answers.length}
              onChange={(e) => {
                const newQuestions = [...questions];
                const count = parseInt(e.target.value);
                newQuestions[currentPage].answers = Array(count).fill("");
                setQuestions(newQuestions);
              }}
            />
            <div>
              {question.answers.map((item, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={item}
                  onChange={(e) => handleAnswerChange(currentPage, idx, e.target.value)}
                  placeholder={`Item ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {question.type === "matching" && (
          <div className={styles.matchingInput}>
            <label>Matching Pairs:</label>
            {question.answers.map((pair, idx) => (
              <div key={idx} className={styles.matchingPair}>
                <input
                  type="text"
                  value={pair.term || ""}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[currentPage].answers[idx].term = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  placeholder="Term"
                />
                <input
                  type="text"
                  value={pair.match || ""}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[currentPage].answers[idx].match = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  placeholder="Match"
                />
              </div>
            ))}
            <button
              className={styles.addMatchingPairButton}
              onClick={() => {
                const newQuestions = [...questions];
                newQuestions[currentPage].answers.push({ term: "", match: "" });
                setQuestions(newQuestions);
              }}
            >
              Add Pair
            </button>
          </div>
        )}

        <div className={styles.questionType}>
          <label>Question Type:</label>
          <select
            value={question.type}
            onChange={(e) => handleQuestionChange(currentPage, "type", e.target.value)}
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="essay">Essay</option>
            <option value="matching">Matching</option>
            <option value="arranging-orders">Arranging Orders</option>
          </select>
        </div>

        <button
          className={styles.removeQuestionButton}
          onClick={() => handleRemoveQuestion(currentPage)}
        >
          Remove Question
        </button>
      </div>
    );
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Upload OSSLT Practice Problems</h2>
          <button className={styles.closeButton} onClick={onClose}>
            X
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.fileUpload}>
            <label htmlFor="file-upload" className={styles.fileLabel}>
              Upload PDF File:
            </label>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept="application/pdf"
            />
          </div>

          <div className={styles.questionList}>
            <h3>Questions ({questionCount}/6)</h3>
            {renderQuestionForm()}
          </div>

          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, questionCount - 1))}
              disabled={currentPage === questionCount - 1}
            >
              Next
            </button>
          </div>

          <button
            className={styles.addQuestionButton}
            onClick={handleAddQuestion}
            disabled={questionCount >= 6}
          >
            Add Question
          </button>

          <div className={styles.actions}>
            <a className={styles.uploadButton} onClick={handleUpload}>
              Upload Practice Problems
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
