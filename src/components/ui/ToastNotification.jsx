import React, { useEffect, useState } from 'react';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';
import './ToastNotification.css';

const ToastNotification = ({ message, isVisible, onClose, duration = 3000, type = 'success' }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      if (duration) {
        const timer = setTimeout(() => {
          setShow(false);
          setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !show) return null;

  return (
    <div className={`toast-container ${show ? 'show' : 'hide'}`}>
      <div className={`toast-content glass-effect ${type === 'warning' ? 'toast-warning' : ''}`}>
        {type === 'warning' ? (
          <AlertCircle size={20} className="toast-icon warning-icon" />
        ) : (
          <CheckCircle2 size={20} className="toast-icon" />
        )}
        <span className="toast-message">{message}</span>
        <button className="toast-close-btn" onClick={() => {
          setShow(false);
          setTimeout(onClose, 300);
        }}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
