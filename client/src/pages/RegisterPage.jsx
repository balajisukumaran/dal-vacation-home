import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../hooks';
import {
  faCheck,
  faInfoCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

const firstLastRegex = /^[a-zA-Z]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

const RegisterPage = () => {
  const navigate = useNavigate();

  const userRef = useRef();
  const errorRef = useRef();

  const [userF, setUserF] = useState('');
  const [validFName, setValidFName] = useState(false);
  const [userFFocus, setUserFFocus] = useState(false);

  const [userL, setUserL] = useState('');
  const [validLName, setValidLName] = useState(false);
  const [userLFocus, setUserLFocus] = useState(false);

  const [email, setEmail] = useState('');
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [pwd, setPwd] = useState('');
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState('');
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [agent, setAgent] = useState(false);

  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setValidFName(firstLastRegex.test(userF));
  }, [userF]);

  useEffect(() => {
    setValidLName(firstLastRegex.test(userL));
  }, [userL]);

  useEffect(() => {
    setValidEmail(emailRegex.test(email));
  }, [email]);

  useEffect(() => {
    const isValidPwd = passwordRegex.test(pwd);
    setValidPwd(isValidPwd);
    setValidMatch(isValidPwd && pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg('');
  }, [userF, userL, email, pwd, matchPwd]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = {
      firstName: userF,
      lastName: userL,
      email: email,
      password: pwd,
      agent: agent ? 'y' : 'n',
    };
    localStorage.setItem('formData', JSON.stringify(formData));
    navigate('/security-questions');
  };

  return (
    <div className="mt-4 flex grow items-center justify-around p-4 md:p-0">
      <div className="mb-40">
        <h1 className="mb-4 text-center text-4xl">Register</h1>
        <p
          ref={errorRef}
          className={errMsg ? 'errmsg' : 'offscreen'}
          aria-live="assertive"
        >
          {errMsg}
        </p>
        <form className="mx-auto max-w-md" onSubmit={handleSubmit}>
          <label htmlFor="firstname">
            {validFName && userF && (
              <span className="valid">
                <FontAwesomeIcon icon={faCheck} />
              </span>
            )}
            {!validFName && userFFocus && userF && (
              <span className="invalid">
                <FontAwesomeIcon icon={faTimes} />
              </span>
            )}
          </label>
          <input
            type="text"
            id="firstname"
            placeholder="First Name"
            ref={userRef}
            autoComplete="off"
            value={userF}
            onChange={(e) => setUserF(e.target.value)}
            required
            aria-invalid={!validFName && userFFocus && userF ? 'true' : 'false'}
            aria-describedby="fNamenote"
            onFocus={() => setUserFFocus(true)}
            onBlur={() => setUserFFocus(false)}
          />
          {!validFName && userFFocus && userF && (
            <p id="fNamenote" className="instructions">
              <FontAwesomeIcon icon={faInfoCircle} />
              First Name should contain alphabets only.
            </p>
          )}
          <label htmlFor="lastname">
            {validLName && userL && (
              <span className="valid">
                <FontAwesomeIcon icon={faCheck} />
              </span>
            )}
            {!validLName && userLFocus && userL && (
              <span className="invalid">
                <FontAwesomeIcon icon={faTimes} />
              </span>
            )}
          </label>
          <input
            type="text"
            id="lastname"
            placeholder="Last Name"
            ref={userRef}
            autoComplete="off"
            value={userL}
            onChange={(e) => setUserL(e.target.value)}
            required
            aria-invalid={!validLName && userLFocus && userL ? 'true' : 'false'}
            aria-describedby="lNamenote"
            onFocus={() => setUserLFocus(true)}
            onBlur={() => setUserLFocus(false)}
          />
          {!validLName && userLFocus && userL && (
            <p id="lNamenote" className="instructions">
              <FontAwesomeIcon icon={faInfoCircle} />
              Last Name should contain alphabets only.
            </p>
          )}
          <label htmlFor="email">
            {validEmail && email && (
              <span className="valid">
                <FontAwesomeIcon icon={faCheck} />
              </span>
            )}
            {!validEmail && emailFocus && email && (
              <span className="invalid">
                <FontAwesomeIcon icon={faTimes} />
              </span>
            )}
          </label>
          <input
            type="text"
            id="email"
            placeholder="Email Id"
            ref={userRef}
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={!validEmail && emailFocus && email ? 'true' : 'false'}
            aria-describedby="emailnote"
            onFocus={() => setEmailFocus(true)}
            onBlur={() => setEmailFocus(false)}
          />
          {!validEmail && !emailFocus && email && (
            <p id="emailnote" className="instructions">
              <FontAwesomeIcon icon={faInfoCircle} />
              Email not in correct format.
            </p>
          )}
          <label htmlFor="password">
            {validPwd && pwd && (
              <span className="valid">
                <FontAwesomeIcon icon={faCheck} />
              </span>
            )}
            {!validPwd && pwdFocus && pwd && (
              <span className="invalid">
                <FontAwesomeIcon icon={faTimes} />
              </span>
            )}
          </label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            onChange={(e) => setPwd(e.target.value)}
            required
            aria-invalid={!validPwd && pwdFocus && pwd ? 'true' : 'false'}
            aria-describedby="pwdnote"
            onFocus={() => setPwdFocus(true)}
            onBlur={() => setPwdFocus(false)}
          />
          {!validPwd && pwdFocus && pwd && (
            <p id="pwdnote" className="instructions">
              <FontAwesomeIcon icon={faInfoCircle} />
              Password should have alpha-numeric and special characters. Minimum
              limit is 8 characters.
            </p>
          )}
          <label htmlFor="repwd">
            {validMatch && matchPwd && (
              <span className="valid">
                <FontAwesomeIcon icon={faCheck} />
              </span>
            )}
            {!validMatch && matchFocus && matchPwd && (
              <span className="invalid">
                <FontAwesomeIcon icon={faTimes} />
              </span>
            )}
          </label>
          <input
            type="password"
            id="confirm_pwd"
            placeholder="Re-Enter Password"
            onChange={(e) => setMatchPwd(e.target.value)}
            required
            aria-invalid={!validMatch ? 'true' : 'false'}
            aria-describedby="repwdnote"
            onFocus={() => setMatchFocus(true)}
            onBlur={() => setMatchFocus(false)}
          />
          {!validMatch && matchFocus && (
            <p id="repwdnote" className="instructions">
              <FontAwesomeIcon icon={faInfoCircle} />
              Passwords do not match.
            </p>
          )}
          <div className="my-2">
            <label htmlFor="agent">
              <input
                type="checkbox"
                id="agent"
                checked={agent}
                onChange={() => setAgent(!agent)}
              />
              &nbsp; Are you an agent?
            </label>
          </div>
          <button
            className="primary my-2"
            disabled={
              !validFName || !validLName || !validEmail || !validMatch
                ? true
                : false
            }
          >
            Register
          </button>
        </form>
        <div className="py-2 text-center text-gray-500">
          Already a member?
          <Link className="text-black underline" to={'/login'}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
