import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SecurityQuestions = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    fetch('https://pt9oejf1r8.execute-api.us-east-1.amazonaws.com/dev/')
      .then((response) => response.json())
      .then((data) => {
        const parsedData = JSON.parse(data.body);
        setQuestions(parsedData);
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
      });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    const storedData = JSON.parse(localStorage.getItem('formData'));
    const formData = {
      ...storedData,
      createdAt: new Date().toISOString(),
      passwordHash: btoa(storedData.password),
      questionId: question,
      answerHash: btoa(answer),
    };

    fetch('https://vsrax959bg.execute-api.us-east-1.amazonaws.com/dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        navigate('/profile');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title mb-4 text-center">
                Security Questions
              </h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="question" className="form-label">
                    Select a Security Question:
                  </label>
                  <select
                    id="question"
                    className="form-select"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                  >
                    <option value="">Select a question</option>
                    {questions.map((q) => (
                      <option key={q.QuestionId} value={q.QuestionId}>
                        {q.Question}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="answer" className="form-label">
                    Answer:
                  </label>
                  <input
                    type="text"
                    id="answer"
                    className="form-control"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityQuestions;
