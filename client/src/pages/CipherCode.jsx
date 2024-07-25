import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks';

const CipherCode = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [cipherCode, setCipherCode] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const storedData = JSON.parse(localStorage.getItem('formData'));
    const formData = {
      ...storedData,
      cipherCode: parseInt(cipherCode, 10).toString(),
    };

    const response = await auth.register(formData);
    if (response.success) {
      toast.success(response.message);
      navigate('/login');
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="mt-4 flex grow items-center justify-around p-4 md:p-0">
      <div className="mb-40">
        <h1 className="mb-4 text-center text-4xl">Cipher Code</h1>
        <br />
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="cipherCode" className="form-label">
              Enter Cipher Code:
            </label>
            <input
              type="number"
              id="cipherCode"
              className="form-control"
              value={cipherCode}
              onChange={(e) => setCipherCode(e.target.value)}
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

export default CipherCode;
