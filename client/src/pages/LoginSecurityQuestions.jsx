import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginSecurityQuestions = () => {
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [storedAnswerHash, setStoredAnswerHash] = useState('');

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    const allQuestions = JSON.parse(localStorage.getItem('allQuestions'));

    if (localUser && localUser.questionId && allQuestions) {
      const selectedQuestion = allQuestions.find(
        (q) => q.questionId === localUser.questionId,
      );
      if (selectedQuestion) {
        setQuestion(selectedQuestion.question);
        setStoredAnswerHash(localUser.answerHash);
      }
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Hash the user's input and compare with the stored hash
    const answerHash = btoa(answer);

    if (answerHash === storedAnswerHash) {
      toast.success('Answer correct. Redirecting to CipherCode...');
      navigate('/verify-cipher');
    } else {
      toast.error('Incorrect answer. Please try again.');
      localStorage.user = null;
      localStorage.allQuestions = null;
      localStorage.token = null;
      navigate('/login');
    }
  };

  return (
    <div className="mt-4 flex grow items-center justify-around p-4 md:p-0">
      <div className="mb-40">
        <h1 className="mb-4 text-center text-4xl">Security Question</h1>
        <br />

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="question" className="form-label">
              {question}
            </label>
          </div>

          <div className="mb-3">
            <input
              type="text"
              id="answer"
              className="form-control"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary my-2">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginSecurityQuestions;
