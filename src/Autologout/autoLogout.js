// AutoLogoutManager.js
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import IsAuthenticat from '../IsAuthenticat';
import { LogoutApi } from '../Services/logoutApiCall';

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 5 minutes
const MODAL_COUNTDOWN = 60; // 5 seconds before logout

const AutoLogout = ({ excludedPaths = [] }) => {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(MODAL_COUNTDOWN);
  const countdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const broadcast = new BroadcastChannel('auth_channel');

  const isExcluded = excludedPaths.some(path =>
    location.pathname.startsWith(path)
  );

  const resetTimer = () => {
    if (isExcluded) return;
    clearTimeout(timeoutRef.current);
    localStorage.setItem('lastActive', Date.now().toString());

    timeoutRef.current = setTimeout(() => {
      triggerModal();
    }, INACTIVITY_LIMIT);
  };

  const triggerModal = () => {
    if (!IsAuthenticat()  || countdown == 0 ) return;
    setShowModal(true);
    setCountdown(MODAL_COUNTDOWN);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('lastActive');
    broadcast.postMessage('logout');
    window.location.href = '/';
  };

  useEffect(() => {
    if (isExcluded) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    // const interval = setInterval(() => {
    //   const lastActive = parseInt(localStorage.getItem('lastActive'), 10);
    //   if (Date.now() - lastActive >= INACTIVITY_LIMIT && countdown !== 0) {
    //     triggerModal();
    //   }
    // }, 60000);

    broadcast.onmessage = (event) => {
      if (event.data === 'logout') {
        onLogout();
      }
    };

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timeoutRef.current);
      // clearInterval(interval);
      clearInterval(countdownRef.current);
      broadcast.close();
    };
  }, []);

  const handleContinueSession = () =>{
    localStorage.removeItem('lastActive');
    clearTimeout(timeoutRef.current);
      // clearInterval(interval);
      setShowModal(false)
      clearInterval(countdownRef.current);
      broadcast.close();
  }
  async function onLogout(){
    await LogoutApi("sessionTimeout")
    localStorage.clear();
    localStorage.clear();
    // window.location.href = '/login';
  }
  return showModal ? (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h4 style={styles.headerText}>Session Timeout Warning</h4>
        </div>

        {/* Body */}
        <div style={styles.body}>
        {countdown!==0?
        <p>Your session will expire in <strong>{countdown}</strong> seconds due to inactivity.</p>
        : <p>Your session has expired due to inactivity.</p>
      }
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            className="btn btn-warning"
            onClick={()=>{countdown === 0 ?handleConfirmLogout():handleContinueSession()}}
          >
            {countdown === 0 ? 'Login' : `Continue Session`}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  modal: {
    background: '#fff',
    width: '90%',
    maxWidth: 420,
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#f8f9fa',
    padding: '16px 24px',
    borderBottom: '1px solid #dee2e6'
  },
  headerText: {
    margin: 0,
    fontSize: '18px'
  },
  body: {
    padding: '20px 24px',
    fontSize: '16px',
    color: '#333',
    textAlign: 'center'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: '1px solid #dee2e6',
    gap: '10px'
  }
};

export default AutoLogout;
