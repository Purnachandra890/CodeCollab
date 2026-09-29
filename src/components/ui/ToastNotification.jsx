import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';
import './ToastNotification.css';

const ToastNotification = ({ message, isVisible, onClose, duration = 3000, type = 'success' }) => {
  const [show, setShow] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      if (duration) {
        const timer = setTimeout(() => {
          setShow(false);
          setTimeout(() => {
            if (onCloseRef.current) onCloseRef.current();
          }, 300); // Wait for fade out animation
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isVisible, duration]);

  if (!isVisible && !show) return null;

  const getPortalContainer = () => {
    let container = document.getElementById('toast-root');
    if (!container && typeof document !== 'undefined') {
      container = document.createElement('div');
      container.id = 'toast-root';
      container.className = 'toast-portal-container';
      document.body.appendChild(container);
    }
    return container || (typeof document !== 'undefined' ? document.body : null);
  };

  const portalContainer = getPortalContainer();
  if (!portalContainer) return null;

  return createPortal(
    <div className={`toast-container ${show ? 'show' : 'hide'}`}>
      <div className={`toast-content glass-effect ${type === 'warning' ? 'toast-warning' : type === 'error' ? 'toast-error' : ''}`}>
        {type === 'warning' || type === 'error' ? (
          <AlertCircle size={20} className={`toast-icon ${type === 'error' ? 'error-icon' : 'warning-icon'}`} />
        ) : (
          <CheckCircle2 size={20} className="toast-icon" />
        )}
        <span className="toast-message">{message}</span>
        <button className="toast-close-btn" onClick={() => {
          setShow(false);
          setTimeout(() => {
            if (onCloseRef.current) onCloseRef.current();
          }, 300);
        }}>
          <X size={16} />
        </button>
      </div>
    </div>,
    portalContainer
  );
};

export default ToastNotification;
