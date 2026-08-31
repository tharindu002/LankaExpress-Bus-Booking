import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, CheckCircle2, XCircle, UserCheck, Search, ShieldCheck, Bus, RefreshCw, AlertCircle, Upload } from 'lucide-react';
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

    try {
      // 1. Explicitly request camera permissions from browser to trigger permission prompt
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr) {
          console.warn('getUserMedia permission warning:', permErr);
        }
      }

      // 2. Stop any previous instance
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {}
      }

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edgeSize = Math.max(180, Math.floor(minEdge * 0.75));
          return { width: edgeSize, height: edgeSize };
        },
      };

      const onScanSuccess = (decodedText) => {
        stopCamera();
        handleVerifyTicket(decodedText);
      };

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
      setScannerError('Camera access denied or camera not found. Please allow camera permissions in your browser or select/upload a QR ticket image below.');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
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
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleVerifyTicket(decodedText);
    } catch (err) {
      console.error('File QR decode error:', err);
      setScannerError('Could not decode QR code from the selected image. Please try another image or enter booking reference manually.');
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
    if (!scanResult || !scanResult.bookingId && !scanResult.bookingRef) return;

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
          <div
            id="qr-reader-container"
            className="w-full min-h-[220px] max-h-[300px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative"
          >
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
              className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30"
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
            Or Enter Ticket Reference / QR Code Data
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. SLB-2026-X8F9"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyTicket()}
              className="input-control py-3 text-xs uppercase font-mono tracking-wider w-full"
            />
            <button
              onClick={() => handleVerifyTicket()}
              disabled={loading}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow shrink-0 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Verify'}</span>
            </button>
          </div>
        </div>

        {/* Success Message Banner after Boarding */}
        {boardSuccessMsg && (
          <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-3 animate-fade-in shadow-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-extrabold text-sm text-emerald-200">BOARDED SUCCESSFULLY!</div>
              <div>{boardSuccessMsg}</div>
            </div>
          </div>
        )}

        {/* Verification Result Card */}
        {scanResult && (
          <div
            className={`glass-card p-6 space-y-5 border-2 animate-fade-in ${
              scanResult.valid
                ? 'border-emerald-500/50 bg-emerald-950/20'
                : 'border-rose-500/50 bg-rose-950/20'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                {scanResult.valid ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-500" />
                )}
                <div>
                  <h3
                    className={`text-lg font-black tracking-wide ${
                      scanResult.valid ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {scanResult.valid ? 'VALID TICKET' : 'INVALID TICKET'}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">{scanResult.reason || scanResult.message}</p>
                </div>
              </div>

              <span className="font-mono font-extrabold text-slate-200 text-sm">
                {scanResult.bookingRef}
              </span>
            </div>

            {/* Ticket details if valid or partially available */}
            {scanResult.passengerName && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Passenger Name</span>
                    <strong className="text-slate-100 text-sm">{scanResult.passengerName}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Reserved Seats</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {scanResult.seats?.map((seat) => (
                        <span key={seat} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold rounded">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone / NIC</span>
                    <span className="text-slate-200">{scanResult.passengerPhone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Status</span>
                    <span className="text-emerald-400 font-bold uppercase">{scanResult.paymentStatus || 'PAID'}</span>
                  </div>
                </div>

                {scanResult.schedule && (
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Route</span>
                    <strong className="text-slate-100 block">{scanResult.schedule.routeName}</strong>
                    <div className="text-[11px] text-slate-400">
                      Bus: {scanResult.schedule.busName} ({scanResult.schedule.busRegNo}) • Dep: {scanResult.schedule.departureTime}
                    </div>
                  </div>
                )}

                {/* Mark as Boarded Action Button */}
                {scanResult.valid && scanResult.boardingStatus !== 'Boarded' && (
                  <button
                    onClick={handleBoardPassenger}
                    disabled={boardLoading}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <UserCheck className="w-5 h-5" />
                    <span>{boardLoading ? 'Processing...' : 'MARK AS BOARDED'}</span>
                  </button>
                )}

                {scanResult.boardingStatus === 'Boarded' && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-center font-extrabold rounded-xl">
                    PASSENGER IS ALREADY BOARDED
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ConductorLayout>
  );
}
