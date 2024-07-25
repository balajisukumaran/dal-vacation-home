import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import axiosInstance from '@/utils/axios';

const SecurityQuestions = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const fetchAllQuestions = async () => {
    try {
      const { data } = await axiosInstance.get('/fetchAllQuestions');
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    fetchAllQuestions();
    // fetch(
    //   'https://aymnjk1za7.execute-api.us-east-1.amazonaws.com/Prod/dal-vacation-home-fetch-all-questions',
    // )
    //   .then((response) => response.json())
    //   .then((data) => {
    //     const parsedData = data;
    //     setQuestions(parsedData);
    //   })
    //   .catch((error) => {});
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const storedData = JSON.parse(localStorage.getItem('formData'));
    const formData = {
      ...storedData,
      passwordHash: btoa(storedData.password),
      questionId: question,
      answerHash: btoa(answer),
    };
    localStorage.setItem('formData', JSON.stringify(formData));
    navigate('/cipher-code');
  };
  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   const storedData = JSON.parse(localStorage.getItem('formData'));
  //   const formData = {
  //     ...storedData,
  //     passwordHash: btoa(storedData.password),
  //     questionId: question,
  //     answerHash: btoa(answer),
  //   };

  //   const response = await auth.register(formData);
  //   if (response.success) {
  //     toast.success(response.message);
  //     //setRedirect(true);
  //     navigate('/login');
  //   } else {
  //     toast.error(response.message);
  //   }

  //   // fetch('https://vsrax959bg.execute-api.us-east-1.amazonaws.com/dev/', {
  //   //   method: 'POST',
  //   //   headers: {
  //   //     'Content-Type': 'application/json',
  //   //   },
  //   //   body: JSON.stringify(formData),
  //   // })
  //   //   .then((response) => response.json())
  //   //   .then((data) => {
  //   //     console.log('Success:', data);
  //   //     navigate('/profile');
  //   //   })
  //   //   .catch((error) => {
  //   //     console.error('Error:', error);
  //   //   });
  // };

  return (
    <div className="mt-4 flex grow items-center justify-around p-4 md:p-0">
      <div className="mb-40">
        <h1 className="mb-4 text-center text-4xl">Security Question</h1>
        <br />
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
                <option key={q.questionId} value={q.questionId}>
                  {q.question}
                </option>
              ))}
            </select>
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

export default SecurityQuestions;
