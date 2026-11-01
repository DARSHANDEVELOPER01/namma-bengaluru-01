import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  Sparkles,
  PhoneCall,
  MapPin,
  Terminal,
  ShieldCheck,
  Heart,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface AboutContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutContactModal: React.FC<AboutContactModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        {/* Modal Top */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-amber-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-amber-400 text-sm">
                ಬೆಂ
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {language === 'kn'
                  ? 'ನಮ್ಮ ಬೆಂಗಳೂರು ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನ'
                  : 'Namma Bengaluru Cleanup Mission'}
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                {language === 'kn' ? 'ನಮ್ಮ ಬೆಂಗಳೂರು, ನಮ್ಮ ಜವಾಬ್ದಾರಿ' : 'Our Bengaluru, Our Responsibility'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission Vision */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/40 to-slate-950/60 border border-amber-500/30 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Civic Transformation & Direct UPI Incentives</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Namma Bengaluru is an AI-enabled Smart City citizen participation initiative by the
            Government of Karnataka and Bruhat Bengaluru Mahanagara Palike (BBMP). The platform connects
            citizens directly with municipal administrators and on-ground sanitation warriors. Every
            verified garbage report cleared results in a direct financial reward to the citizen via PhonePe,
            Google Pay, or BHIM UPI.
          </p>
        </div>

        {/* Emergency Helplines & Control Rooms */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>BBMP Emergency Sanitation Helplines</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
              <span className="text-slate-400 text-[10px] block">Toll-Free Helpline</span>
              <span className="text-base font-bold text-emerald-400">1533</span>
              <span className="text-[10px] text-slate-500 block">24x7 Citizen Call Center</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
              <span className="text-slate-400 text-[10px] block">BBMP WhatsApp Control Room</span>
              <span className="text-sm font-bold text-amber-400">080-22660000</span>
              <span className="text-[10px] text-slate-500 block">Hudson Circle HQ</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
              <span className="text-slate-400 text-[10px] block">Bescom & Drainage</span>
              <span className="text-sm font-bold text-blue-400">1912</span>
              <span className="text-[10px] text-slate-500 block">Monsoon Emergency Squad</span>
            </div>
          </div>
        </div>

        {/* Local Setup & VS Code Instructions */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Developer / Demonstration Setup & Local Run Guide</span>
          </div>
          <p className="text-[11px] text-slate-400">
            To run this full-stack application on your local machine in Visual Studio Code:
          </p>

          <div className="bg-black/80 rounded-xl p-3 font-mono text-xs text-amber-300/90 space-y-1.5 overflow-x-auto border border-white/10">
            <div className="text-slate-500"># 1. Clone repository & open in VS Code</div>
            <div>git clone &lt;repo-url&gt; && cd namma-bengaluru</div>
            <div className="text-slate-500"># 2. Install dependencies</div>
            <div>npm install</div>
            <div className="text-slate-500"># 3. Start development server (Port 3000)</div>
            <div>npm run dev</div>
            <div className="text-slate-500"># 4. Open in browser: http://localhost:3000</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
            <div className="p-2 rounded-lg bg-slate-900 border border-white/5">
              <strong className="text-white block">Admin Demo:</strong>
              admin@bengaluru.gov.in / Admin@123
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-white/5">
              <strong className="text-white block">Citizen Demo:</strong>
              citizen.darshan@gmail.com / Citizen@123
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-white/5">
              <strong className="text-white block">Staff Demo:</strong>
              staff.rajesh@bbmp.gov.in / Staff@123
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>Built for a Cleaner, Greener Bengaluru</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
