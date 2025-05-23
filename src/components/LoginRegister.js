import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import InputField from './InputField';
import './LoginRegister.css'
import passwordIcon from '../icons/password.png'
import userInterfaceIcon from '../icons/user-interface.png';
import mailIcon from '../icons/mail.png';

const LoginRegister = ({ onSuccess }) => {
    const userRef = useRef(null);
    const errRef = useRef(null);
    const [action, setAction] = useState('Login');
    const [user, setUser] = useState('');
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [matchPwd, setMatchPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (action === 'Login') userRef.current?.focus();
    }, [action]);

    useEffect(() => setErrMsg(''), [user, pwd, email, matchPwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (action === 'Register' && pwd !== matchPwd) {
            setErrMsg('Passwords do not match');
            return;
        }

        try {
            const endpoint = action === 'Login' ? '/login' : '/register';
            const payload = action === 'Login'
                ? { username: user.trim(), password: pwd.trim() }
                : { username: user.trim(), email: email.trim(), password: pwd.trim() };

            const response = await axios.post(`http://localhost:3500${endpoint}`, payload);

            if ((action === 'Login' && response.status === 200) || (action === 'Register' && response.status === 201)) {
                console.log(`${action} successful:`, response.data);
                setSuccess(true);
                onSuccess?.(response.data.user);
                setErrMsg('');
                setUser('');
                setEmail('');
                setPwd('');
                setMatchPwd('');
                if (action === 'Login') {
                    props.onSuccess?.(response.data.user);
                }
                return; 
            }
        } catch (error) {
            const status = error.response?.status;
            setErrMsg(
                !error.response
                    ? 'No Server Response'
                    : status === 400
                    ? action === 'Login'
                        ? 'Invalid Username or Password'
                        : 'Bad Request - Invalid Data'
                    : status === 409
                    ? 'User already exists'
                    : `${action} Failed`
            );
            setSuccess(false);
        }
    };

    return (
        <div className="wrapper">
            <form onSubmit={handleSubmit} className={`form-box ${action.toLowerCase()}`}>
                <h1>{action}</h1>
                <InputField
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="Username"
                    icon={userInterfaceIcon}
                    innerRef={userRef}
                />
                {action === 'Register' && (
                    <InputField
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        icon={mailIcon}
                    />
                )}
                <InputField
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="Password"
                    icon={passwordIcon}
                />
                {action === 'Register' && (
                    <InputField
                        type="password"
                        value={matchPwd}
                        onChange={(e) => setMatchPwd(e.target.value)}
                        placeholder="Confirm Password"
                        icon={passwordIcon}
                    />
                )}
                <div className="remember-forgot">
                    <label>
                        <input type="checkbox" />
                        {action === 'Login' ? ' Remember Me' : ' I agree to the terms & conditions'}
                    </label>
                    {action === 'Login' && <a href="#">Forgot Password</a>}
                </div>
                <button type="submit">{action === 'Login' ? 'Sign In' : 'Register'}</button>
                {errMsg && !success && <div ref={errRef} style={{ color: 'red', marginTop: '10px' }}>{errMsg}</div>}
                {success && !errMsg && (
                    <p style={{ color: 'green', marginTop: '10px' }}>
                        {action} successful!
                    </p>
                )}
                <div className="register-link">
                    <p>
                        {action === 'Login'
                            ? 'Need an Account? '
                            : 'Already have an account? '}
                        <span onClick={() => setAction(action === 'Login' ? 'Register' : 'Login')} className="toggleAction">
                            {action === 'Login' ? 'Sign Up' : 'Login'}
                        </span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default LoginRegister;
