import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, CheckCircle2, XCircle, UserCheck, Search, ShieldCheck, Bus, RefreshCw, AlertCircle, Upload, Camera } from 'lucide-react';
import { api } from '../../services/api';
import { ConductorLayout } from '../../components/ConductorLayout';

export function ConductorQRScanner() {
  const [manualInput, setManualInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [boardLoading, setBoardLoading] = useState(false);
  const [boardSuccessMsg, setBoardSuccessMsg] = useState('');

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setScannerError('');
    setScanResult(null);
    setBoardSuccessMsg('');
    setScanning(true);

    // Short delay to ensure #qr-viewfinder is visible in DOM
    setTimeout(async () => {
      try {
        if (html5QrCodeRef.current) {
          try {
            if (html5QrCodeRef.current.isScanning) {
              await html5QrCodeRef.current.stop();
            }
            html5QrCodeRef.current.clear();
          } catch (e) {}
        }

        const container = document.getElementById('qr-viewfinder');
        if (!container) return;

        const html5QrCode = new Html5Qrcode('qr-viewfinder');
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edgeSize = Math.max(180, Math.floor(minEdge * 0.8));
            return { width: edgeSize, height: edgeSize };
          },
        };

        const onScanSuccess = (decodedText) => {
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
          } catch (e) {}

          if (navigator.vibrate) {
            navigator.vibrate(100);
          }

          stopCamera();
          handleVerifyTicket(decodedText);
        };

        // Try environment (rear) camera first, fallback to user facing if environment fails
        try {
          await html5QrCode.start({ facingMode: 'environment' }, config, onScanSuccess, () => {});
        } catch (err1) {
          try {
            await html5QrCode.start({ facingMode: 'user' }, config, onScanSuccess, () => {});
          } catch (err2) {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
              await html5QrCode.start(devices[devices.length - 1].id, config, onScanSuccess, () => {});
            } else {
              throw new Error('No camera hardware found');
            }
          }
        }
      } catch (err) {
        console.error('Camera start error:', err);
        setScanning(false);
        setScannerError('Camera access denied or blocked by browser. Please tap "Allow" on browser permissions or select a QR photo below.');
      }
    }, 100);
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
    }
    setScanning(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannerError('');
    setScanResult(null);
    setLoading(true);

    try {
      const html5QrCode = new Html5Qrcode('qr-viewfinder');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleVerifyTicket(decodedText);
    } catch (err) {
      console.error('File QR decode error:', err);
      setScannerError('Could not decode QR code from the selected image. Please try another photo or enter booking reference manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTicket = async (refToVerify) => {
    const ref = refToVerify || manualInput;
    if (!ref || !ref.trim()) return;

    setLoading(true);
    setScanResult(null);
    setBoardSuccessMsg('');
    setScannerError('');

    try {
      const res = await api.scanConductorTicket(ref.trim());
      setScanResult(res);
    } catch (err) {
      console.error(err);
      setScanResult({
        valid: false,
        reason: err.response?.data?.reason || err.response?.data?.error || 'Verification request failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBoardPassenger = async () => {
    if (!scanResult || (!scanResult.bookingId && !scanResult.bookingRef)) return;

    setBoardLoading(true);
    setBoardSuccessMsg('');
    try {
      const targetId = scanResult.bookingId || scanResult.bookingRef;
      const res = await api.boardPassenger(targetId);
      if (res && res.success) {
        setBoardSuccessMsg(res.message);
        setScanResult((prev) => ({
          ...prev,
          boardingStatus: 'Boarded',
        }));
      } else {
        alert(res?.error || 'Failed to mark as boarded');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to mark as boarded');
    } finally {
      setBoardLoading(false);
    }
  };

  return (
    <ConductorLayout title="QR Ticket Scanner">
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Page Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-100">Boarding Verification Scanner</h2>
          <p className="text-xs text-slate-400">Scan passenger QR ticket or enter reference number</p>
        </div>

        {/* Camera Container */}
        <div className="glass-card p-4 text-center space-y-4">
          <div className="w-full min-h-[220px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative">
            {/* Dedicated Html5Qrcode viewfinder element - React NEVER mutates this inner DOM */}
            <div
              id="qr-viewfinder"
              className={`w-full h-full min-h-[220px] ${scanning ? 'block' : 'hidden'}`}
            />

            {/* Inactive State Display */}
            {!scanning && (
              <div className="p-6 space-y-3">
                <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Camera scanner inactive</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Live Camera</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Select QR Photo</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {scanning && (
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 cursor-pointer"
            >
              Stop Camera
            </button>
          )}

          {scannerError && (
            <div className="p-3 bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-medium rounded-xl text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{scannerError}</span>
            </div>
          )}
        </div>

        {/* Manual Input Fallback */}
        <div className="glass-card p-5 space-y-3">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Manual Booking Reference Check
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. SLB-2026-X8F9"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyTicket()}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>
            <button
              onClick={() => handleVerifyTicket()}
              disabled={loading || !manualInput.trim()}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl transition flex items-center space-x-1 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Ticket</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Verification Result Section */}
        {scanResult && (
          <div
            className={`glass-card p-6 border-2 space-y-4 animate-fade-in ${
              scanResult.valid
                ? 'border-emerald-500/50 bg-emerald-950/20'
                : 'border-rose-500/50 bg-rose-950/20'
            }`}
          >
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              {scanResult.valid ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
              )}
              <div>
                <h3
                  className={`text-base font-black ${
                    scanResult.valid ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {scanResult.valid ? 'VALID TICKET - PAYMENT VERIFIED' : 'INVALID OR UNPAID TICKET'}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {scanResult.reason || scanResult.message || 'Ticket validation completed.'}
                </p>
              </div>
            </div>

            {scanResult.valid && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Booking Ref</span>
                    <strong className="font-mono text-emerald-400 text-sm block">{scanResult.bookingRef}</strong>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Passenger Name</span>
                    <strong className="text-slate-200 text-sm block">{scanResult.passengerName}</strong>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Reserved Seats</span>
                    <strong className="text-amber-400 text-sm block">
                      {scanResult.seats ? scanResult.seats.join(', ') : 'N/A'}
                    </strong>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Phone / NIC</span>
                    <span className="text-slate-300 font-semibold block">{scanResult.passengerPhone}</span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Payment Status</span>
                    <span className="text-emerald-400 font-bold block uppercase">{scanResult.paymentStatus || 'PAID'}</span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Boarding Status</span>
                    <span className={`font-bold block uppercase ${scanResult.boardingStatus === 'Boarded' ? 'text-teal-400' : 'text-amber-400'}`}>
                      {scanResult.boardingStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                {boardSuccessMsg && (
                  <div className="p-3 bg-teal-950/80 border border-teal-500/50 text-teal-300 text-xs font-bold rounded-xl text-center">
                    {boardSuccessMsg}
                  </div>
                )}

                {scanResult.boardingStatus !== 'Boarded' && (
                  <button
                    onClick={handleBoardPassenger}
                    disabled={boardLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {boardLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>MARK AS BOARDED (PASSENGER CHECK-IN)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ConductorLayout>
  );
}
