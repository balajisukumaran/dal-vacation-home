import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerifyCipher = () => {
  const navigate = useNavigate();
  const [randomText, setRandomText] = useState('');
  const [userInputCipher, setUserInputCipher] = useState('');

  useEffect(() => {
    // Generate a random 4-alphabet code
    const generateRandomText = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < 4; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }
      return result;
    };

    const randomText = generateRandomText();
    setRandomText(randomText);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Retrieve the email from local storage
    const user = JSON.parse(localStorage.getItem('user'));
    const email = user ? user.email : '';

    // Prepare data to send to the API
    const requestData = {
      randomText,
      cipher: userInputCipher,
      email, // Add the email to the requestData object
    };

    try {
      const response = await fetch(
        'https://aymnjk1za7.execute-api.us-east-1.amazonaws.com/Prod/user/verifycipher',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        },
      );

      const result = await response.json();

      if (result.status === 'true') {
        toast.success('Verification successful. Redirecting to profile...');
        navigate('/');
      } else {
        toast.error('Incorrect verification. Please try again.');
        localStorage.removeItem('user');
        localStorage.removeItem('allQuestions');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      toast.error('An error occurred during verification. Please try again.');
    }
  };

  return (
    <div className="mt-4 flex grow items-center justify-around p-4 md:p-0">
      <div className="mb-40">
        <h1 className="mb-4 text-center text-4xl">Verify Cipher</h1>
        <br />

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="randomText" className="form-label">
              Random Text: {randomText}
            </label>
          </div>

          <div className="mb-3">
          <p>
              Please enter the cipher text based on the random text above. The word can be made from the letters ABCDEFGHIJKLMNOPQRSTUVWXYZ. 
            </p>
            <input
              type="text"
              id="userInputCipher"
              className="form-control"
              value={userInputCipher}
              onChange={(e) => setUserInputCipher(e.target.value)}
              required
              maxLength="4"
              pattern="[A-Za-z]{4}"
              title="Must be 4 alphabetic characters"
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

export default VerifyCipher;
