import React from 'react';
import { AlertCircle, X, Loader2 } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-effect">
        <button className="modal-close-btn" onClick={onClose} disabled={isLoading}>
          <X size={20} />
        </button>
        <div className="modal-header">
          <div className="modal-icon-container">
            <AlertCircle size={28} className="modal-icon" />
          </div>
          <h3 className="modal-title">{title}</h3>
        </div>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn-confirm" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="modal-spinner" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
