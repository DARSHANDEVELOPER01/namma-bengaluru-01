import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { InteractiveMap } from '../InteractiveMap';
import { GarbageCategory, SeverityLevel } from '../../types';
import {
  Camera,
  Upload,
  MapPin,
  Navigation,
  AlertTriangle,
  Send,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';

interface ReportGarbageFormProps {
  onSuccess: () => void;
}

export const ReportGarbageForm: React.FC<ReportGarbageFormProps> = ({ onSuccess }) => {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();

  // Photo states
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // GPS states
  const [latitude, setLatitude] = useState<number>(12.9716); // Default Vidhana Soudha Bengaluru
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Form details
  const [ward, setWard] = useState<string>(user?.ward || 'Ward 112 - Domlur / Indiranagar');
  const [landmark, setLandmark] = useState<string>('');
  const [address, setAddress] = useState<string>('Near 100 Feet Road, Indiranagar, Bengaluru');
  const [category, setCategory] = useState<GarbageCategory>('overflowing_bin');
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [description, setDescription] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successComplaintId, setSuccessComplaintId] = useState<string | null>(null);

  const categories: { id: GarbageCategory; labelKey: string; icon: string }[] = [
    { id: 'overflowing_bin', labelKey: 'cat_overflowing_bin', icon: '🗑️' },
    { id: 'illegal_dumping', labelKey: 'cat_illegal_dumping', icon: '⚠️' },
    { id: 'plastic_waste', labelKey: 'cat_plastic_waste', icon: '🛍️' },
    { id: 'construction_debris', labelKey: 'cat_construction_debris', icon: '🧱' },
    { id: 'sewage_overflow', labelKey: 'cat_sewage_overflow', icon: '💧' },
    { id: 'dead_animal', labelKey: 'cat_dead_animal', icon: '🐕' },
    { id: 'other', labelKey: 'cat_other', icon: '📍' },
  ];

  // Try auto GPS on component load
  useEffect(() => {
    handleDetectGps();
  }, []);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setLatitude(lat);
        setLongitude(lng);
        setGpsAccuracy(Math.round(accuracy));
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS error', err);
        setGpsError('Could not obtain live GPS signal. Defaulted to Bengaluru central coordinates.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLocationPickedOnMap = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setGpsAccuracy(5); // Map pinpoint
  };

  // Camera stream activation
  const startCamera = async () => {
    try {
      setGpsError(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access failed', err);
      setIsCameraActive(false);
      alert('Camera access denied or unavailable. Please use the "Upload from Device" option.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoPreview(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoPreview) {
      alert('Please take or upload a garbage photograph before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          citizenId: user?.id,
          citizenName: user?.name,
          citizenPhone: user?.phone,
          citizenUpi: user?.upiId,
          photoUrl: photoPreview,
          latitude,
          longitude,
          address,
          landmark,
          ward,
          category,
          description,
          severity,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok) {
        setSuccessComplaintId(data.id);
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Network error submitting complaint.');
    }
  };

  if (successComplaintId) {
    return (
      <div className="bg-slate-900/90 border border-emerald-500/50 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 inline-block mb-2">
          BBMP COMPLAINT REGISTERED
        </div>
        <h3 className="text-2xl font-black text-white">
          {language === 'kn' ? 'ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ!' : 'Report Successfully Submitted!'}
        </h3>
        <p className="text-sm text-slate-300 mt-2">
          Your complaint ID is{' '}
          <span className="font-mono font-bold text-amber-400 text-base">{successComplaintId}</span>
        </p>
        <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
          BBMP municipal administrators will review the GPS coordinates and photo. Once verified, a field staff squad will be assigned and your UPI reward will be credited!
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setSuccessComplaintId(null);
              setPhotoPreview(null);
              setDescription('');
              setLandmark('');
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            Report Another Spot
          </button>
          <button
            onClick={onSuccess}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            Track My Complaint Status →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('reportGarbageTitle')}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          {language === 'kn' ? 'ಸ್ವಚ್ಛತಾ ವರದಿ ಸಲ್ಲಿಸಿ & ಬಹುಮಾನ ಪಡೆಯಿರಿ' : 'Submit Cleanliness Complaint'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">{t('reportGarbageSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: PHOTO CAPTURE / UPLOAD */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
          <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
            1. Cleanliness Photograph (Mandatory)
          </label>

          {isCameraActive ? (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-lg mx-auto border border-amber-500/40">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xl flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-full bg-slate-900/80 text-white font-bold text-xs border border-white/20 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden bg-black max-w-md mx-auto border border-emerald-500/40">
              <img
                src={photoPreview}
                alt="Garbage preview"
                className="w-full h-56 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="p-2 rounded-xl bg-red-600/90 text-white text-xs hover:bg-red-500 transition shadow cursor-pointer"
                  title="Remove photograph"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 bg-emerald-950/80 text-emerald-300 text-[11px] text-center font-semibold">
                ✓ Photo successfully attached with geolocation tag
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              <button
                type="button"
                onClick={startCamera}
                className="p-6 rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 flex flex-col items-center justify-center text-center transition cursor-pointer group"
              >
                <Camera className="w-8 h-8 text-amber-400 group-hover:scale-110 transition mb-2" />
                <span className="text-xs font-bold text-white">{t('captureCamera')}</span>
                <span className="text-[10px] text-slate-400 mt-1">Use mobile or webcam stream</span>
              </button>

              <label className="p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-400 bg-white/5 hover:bg-emerald-500/10 flex flex-col items-center justify-center text-center transition cursor-pointer group">
                <Upload className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition mb-2" />
                <span className="text-xs font-bold text-white">{t('uploadGallery')}</span>
                <span className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 15MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* STEP 2: GPS COORDINATES & INTERACTIVE MAP */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div>
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                2. Exact GPS Coordinates & Interactive Map
              </label>
              <span className="text-[11px] text-slate-400">
                Drag marker on the map or tap anywhere to pinpoint the exact dirty spot.
              </span>
            </div>

            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer shrink-0"
            >
              {isLocating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Detecting GPS...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t('detectGps')}</span>
                </>
              )}
            </button>
          </div>

          {gpsError && (
            <div className="p-2 mb-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Latitude:</span>
              <span className="font-mono font-bold text-amber-400">{latitude.toFixed(6)}° N</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Longitude:</span>
              <span className="font-mono font-bold text-amber-400">{longitude.toFixed(6)}° E</span>
            </div>
          </div>

          {/* Embedded Interactive Map with Draggable Pin */}
          <InteractiveMap
            centerLat={latitude}
            centerLng={longitude}
            selectedLat={latitude}
            selectedLng={longitude}
            draggableMarker={true}
            onLocationSelect={handleLocationPickedOnMap}
            height="260px"
          />
        </div>

        {/* STEP 3: DETAILS, CATEGORY & DESCRIPTION */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-4">
          <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
            3. Garbage Category & Location Details
          </label>

          {/* Category Selector Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              {t('selectCategory')} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl text-left transition border cursor-pointer flex items-center gap-2 ${
                    category === cat.id
                      ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-md'
                      : 'bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-300'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs truncate">{t(cat.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                BBMP Ward / Area *
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Ward 112 - Domlur / Indiranagar">Ward 112 - Domlur / Indiranagar</option>
                <option value="Ward 151 - Koramangala">Ward 151 - Koramangala</option>
                <option value="Ward 45 - Malleshwaram">Ward 45 - Malleshwaram</option>
                <option value="Ward 168 - Jayanagar 4th Block">Ward 168 - Jayanagar 4th Block</option>
                <option value="Ward 84 - Hagadur / Whitefield">Ward 84 - Hagadur / Whitefield</option>
                <option value="Ward 174 - HSR Layout">Ward 174 - HSR Layout</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('severityLabel')}
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Low">Low (Isolated small litter)</option>
                <option value="Medium">Medium (Moderate road accumulation)</option>
                <option value="High">High (Overflowing bin / blocking walkway)</option>
                <option value="Critical">Critical (Hazardous / Drain choke / Dead animal)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('enterLandmark')} *
            </label>
            <input
              type="text"
              required
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Metro Pillar 124, Opposite Cauvery Bhavan"
              className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('describeIssue')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the condition, smell, or impact on pedestrians..."
              className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t('submitting')}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t('submitReport')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
