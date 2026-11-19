'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Camera, X, Keyboard } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onScan }) {
  const [useCamera, setUseCamera] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !useCamera) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, useCamera]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        animFrameRef.current = requestAnimationFrame(scanTick);
      }
    } catch (err) {
      console.warn('Camera access unavailable:', err);
      setCameraError('Camera access not granted or unavailable. You can enter the warranty number below.');
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const scanTick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          // If code is a full URL e.g. https://.../verify/TOKEN, extract token
          let extracted = code.data;
          if (extracted.includes('/verify/')) {
            extracted = extracted.split('/verify/')[1];
          }
          stopCamera();
          onScan(extracted);
          return;
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(scanTick);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      stopCamera();
      onScan(manualInput.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Scan Warranty QR Code</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {cameraError && (
          <div className="alert alert-info">
            {cameraError}
          </div>
        )}

        {useCamera ? (
          <div>
            <div style={{ position: 'relative', width: '100%', height: '260px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '180px',
                height: '180px',
                border: '2px dashed var(--accent)',
                borderRadius: '12px'
              }} />
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button onClick={() => setUseCamera(false)} className="btn btn-secondary btn-sm">
                <Keyboard size={15} /> Switch to Manual Warranty ID Entry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <label className="form-label">Warranty Number or QR Token</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. EWN-2026-000001 or Token string"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                autoFocus
                required
              />
              <span className="form-hint">Enter the 14-character warranty number printed on your receipt.</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setUseCamera(true)} className="btn btn-secondary">
                <Camera size={16} /> Try Camera Again
              </button>
              <button type="submit" className="btn btn-primary">
                Look Up Warranty
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

