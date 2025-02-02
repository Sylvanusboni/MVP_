import { Fragment, useState, useEffect } from 'react';
import { useGoogleLogin} from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './connection-form.css';


const Connect = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    flow: 'redirect',
    onSuccess: async (credentialResponse) => {
      try {
        const { code } = credentialResponse;
        const endpoint = isLogin ? 'google' : 'google';

        const response = await axios.post(`http://localhost:8080/api/auth/${endpoint}`, { code });
        if (response.status === 200) {
          if (isLogin) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('name', response.data.user.name);
            localStorage.setItem('userId', response.data.user.id);
            localStorage.setItem('role', response.data.user.role);
            window.location.href = '/services';
          } else {
            alert('Registration successful! Please log in.');
            setIsLogin(true);
          }
        }
      } catch (error) {
        console.error('Google Login/Signup Failed:', error);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
    },
  });

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const usernameField = document.getElementById('username');

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!usernameField && !isLogin) {
      setEmailError(true);
      setEmailErrorMessage('Username is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleNavigate = (condition) => {
    if (condition.role === 'admin') {
       navigate('/');
      // window.location.href = '/dashboard';
      return;
    } else if (condition.role === 'user') {
      window.location.href = '/';
      return;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const usernameValue = isLogin ? null : document.getElementById('username').value;

    try {
      const endpoint = isLogin ? 'login' : 'signup';
      const response = await axios.post(`http://localhost:8080/api/auth/${endpoint}`, {
        email,
        password,
        fullName: usernameValue,
      });

      if (response.status === 200) {
        console.log(response.data.user);
        alert(`${isLogin ? 'Login' : 'Registration'} successful!`);
        if (isLogin) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('name', response.data.user.name);
          localStorage.setItem('userId', response.data.user.id);
          localStorage.setItem('role', response.data.user.role);
          // window.location.href = '/services';
          handleNavigate(response.data.user);
        }
      } else if (response.status === 201) {
        alert('Registration successful! Please log in.');
        setIsLogin(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.message;
        console.log(errorMessage);

        if (errorMessage.includes('User does not exist')) {
          setEmailError(true);
          setEmailErrorMessage('This email is not registered.');
        } else if (errorMessage.includes('User already exists')) {
          setEmailError(true);
          setEmailErrorMessage('User already exists');
        } else if (errorMessage.includes('Invalid credentials')) {
          setPasswordError(true);
          setPasswordErrorMessage('Incorrect password.');
        } else {
          alert('An error occurred. Please try again.');
        }
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  useEffect(() => {
    const originalConsoleError = console.error;

    console.error = (message, ...args) => {
      if (message && message.includes('Failed to fetch')) {
        return;
      }
      originalConsoleError(message, ...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <Fragment>
      <div className="form-container">
        <div className="form-card">
          <h1>{isLogin ? 'Login' : 'Subscribe'}</h1>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  className={`form-input ${emailError ? 'error' : ''}`}
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {/* {emailError && <p className="error-message">{emailErrorMessage}</p>} */}
              </div>
            )}
            <div className="form-group">
              <input
                type="email"
                placeholder="Email address"
                className={`form-input ${emailError ? 'error' : ''}`}
                id="email"
              />
              {emailError && <p className="error-message">{emailErrorMessage}</p>}
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                className={`form-input ${passwordError ? 'error' : ''}`}
                id="password"
              />
              {passwordError && <p className="error-message">{passwordErrorMessage}</p>}
            </div>
            <button type="submit" className="form-button">
              {isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </form>
          <button onClick={googleLogin}  className="form-button">
            {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
          </button>
          <p className="toggle-form">
            {isLogin
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              type="button"
              className="toggle-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Subscribe' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </Fragment>
  );
};

export default Connect;
