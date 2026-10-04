import { useState, useEffect, useCallback, useMemo } from 'react';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// Web Audio API Synthesizer for UPI-style physical Soundbox earcons
class SoundboxEngine {
  ctx: AudioContext | null;
  constructor() {
    this.ctx = null;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  // UPI Soundbox 2-tone melodic chime (cheerful, non-anxious alert)
  playDispatchChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.3, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.32);

      // Note 2: B5 (987.77 Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0.001, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.35, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.62);
    } catch (e) {
      console.warn("Soundbox chime silenced:", e);
    }
  }

  // Affirmative major-triad chord chime for instant physical acceptance confirmation
  playAcceptChime() {
    try {
      this.init();
      const ctx = this.ctx;
      if (!ctx) return;
      const now = ctx.currentTime;
      const chord = [392.00, 523.25, 659.25]; // G4, C5, E5
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + (idx * 0.06);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.32, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.48);
      });
    } catch (e) {
      console.warn("Accept chime silenced:", e);
    }
  }
}

const soundbox = new SoundboxEngine();

interface TraditionalClutter {
  pickupFull: string;
  dropFull: string;
  customerRating: string;
  passengerName: string;
}

interface HomeMatch {
  percentage: number;
  isTowardsHome: boolean;
  badgeKn: string;
  badgeEn: string;
  prefixKn: string;
  prefixPhoneticKn: string;
  prefixEn: string;
}

interface Trip {
  id: string;
  fare: string;
  paymentType: string;
  paymentTypeKn: string;
  pickup: string;
  pickupKn: string;
  pickupSub: string;
  pickupSubKn: string;
  drop: string;
  dropKn: string;
  dropSub: string;
  dropSubKn: string;
  direction: string;
  directionLabel: string;
  directionLabelKn: string;
  distance: string;
  duration: string;
  speechKn: string;
  speechPhoneticKn: string;
  speechEn: string;
  traditionalClutter: TraditionalClutter;
  homeMatch: HomeMatch;
}

const TRIPS_DATA: Trip[] = [
  {
    id: 'trip-1',
    fare: '185',
    paymentType: 'CASH',
    paymentTypeKn: 'ನಗದು',
    pickup: 'SOUTH END CIRCLE METRO',
    pickupKn: 'ಸೌತ್ ಎಂಡ್ ಸರ್ಕಲ್ ಮೆಟ್ರೋ',
    pickupSub: 'Beside Pai Vista • Gate 2',
    pickupSubKn: 'ಪೈ ವಿಸ್ಟಾ ಹತ್ತಿರ • ಗೇಟ್ 2',
    drop: 'MAJESTIC KBS',
    dropKn: 'ಮೆಜೆಸ್ಟಿಕ್ ಬಸ್ ನಿಲ್ದಾಣ',
    dropSub: 'Platform 3 • City Railway Side',
    dropSubKn: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ 3 • ರೈಲ್ವೆ ನಿಲ್ದಾಣ',
    direction: 'NW 320°',
    directionLabel: 'NORTH-WEST',
    directionLabelKn: 'ವಾಯುವ್ಯ',
    distance: '6.4 KM',
    duration: '22 MIN',
    // Native Kannada Unicode Script with punctuation pauses for TTS clarity
    speechKn: 'ಹೊಸ ಬಾಡಿಗೆ. ಪಿಕಪ್, ಸೌತ್ ಎಂಡ್ ಸರ್ಕಲ್ ಮೆಟ್ರೋ. ಡ್ರಾಪ್, ಮೆಜೆಸ್ಟಿಕ್. ಬಾಡಿಗೆ, ನೂರ ಎಂಬತ್ತೈದು ರೂಪಾಯಿ, ನಗದು.',
    // Phonetic Kannada with comma-spaced pauses for English/Hindi TTS engines
    speechPhoneticKn: 'Hosa ride. Pickup, South End Circle Metro. Drop, Majestic. Baadige, noora embhatthaaidhu roopaayi, cash payment.',
    speechEn: 'New Ride. Pickup, South End Circle Metro. Drop, Majestic. Fare, 185 Rupees, Cash.',
    traditionalClutter: {
      pickupFull: '#42/1, 2nd Cross, Near Pai Vista, Lalbagh Fort Road, Basavanagudi, Bengaluru - 560004',
      dropFull: 'Kempegowda Bus Station Terminal 3, Subhash Nagar, Gandhi Nagar, Bengaluru - 560009',
      customerRating: '4.82 (124 ratings)',
      passengerName: 'Karthik S.'
    },
    homeMatch: {
      percentage: 95,
      isTowardsHome: true,
      badgeKn: '🏠 ಮನೆ ಕಡೆಗೆ • 95% Match',
      badgeEn: '🏠 TOWARDS HOME • 95% Match',
      prefixKn: 'ಮನೆ ಕಡೆಗೆ ಸವಾರಿ! ',
      prefixPhoneticKn: 'Mane kadege ride! ',
      prefixEn: 'Ride towards home! '
    }
  },
  {
    id: 'trip-2',
    fare: '140',
    paymentType: 'UPI AUTO',
    paymentTypeKn: 'ಯು.ಪಿ.ಐ ಆನ್ಲೈನ್',
    pickup: 'INDIRANAGAR 100FT RD',
    pickupKn: 'ಇಂದಿರಾನಗರ 100 ಅಡಿ ರಸ್ತೆ',
    pickupSub: 'Opposite KFC Junction',
    pickupSubKn: 'ಕೆ.ಎಫ್.ಸಿ ಜಂಕ್ಷನ್ ಎದುರು',
    drop: 'KORAMANGALA SONY WORLD',
    dropKn: 'ಕೋರಮಂಗಲ ಸೋನಿ ವರ್ಲ್ಡ್',
    dropSub: '80ft Road Signal Corner',
    dropSubKn: '80 ಅಡಿ ರಸ್ತೆ ಸಿಗ್ನಲ್ ಕಾರ್ನರ್',
    direction: 'SOUTH 180°',
    directionLabel: 'SOUTH',
    directionLabelKn: 'ದಕ್ಷಿಣ',
    distance: '4.8 KM',
    duration: '16 MIN',
    speechKn: 'ಹೊಸ ಬಾಡಿಗೆ. ಪಿಕಪ್, ಇಂದಿರಾನಗರ 100 ಅಡಿ ರಸ್ತೆ. ಡ್ರಾಪ್, ಕೋರಮಂಗಲ ಸೋನಿ ವರ್ಲ್ಡ್. ಬಾಡಿಗೆ, ನೂರ ನಲವತ್ತು ರೂಪಾಯಿ, ಆನ್ಲೈನ್ ಪಾವತಿ.',
    speechPhoneticKn: 'Hosa ride. Pickup, Indiranagar 100 feet road. Drop, Koramangala Sony World. Baadige, noora nalvatthu roopaayi, UPI payment.',
    speechEn: 'New Ride. Pickup, Indiranagar 100 Feet Road. Drop, Koramangala Sony World. Fare, 140 Rupees, UPI.',
    traditionalClutter: {
      pickupFull: 'Shop 7, Ground Floor, 100 Feet Rd, HAL 2nd Stage, Defence Colony, Indiranagar, Bengaluru - 560038',
      dropFull: 'Sony World Junction, 80 Feet Road, 4th Block, Koramangala, Bengaluru - 560034',
      customerRating: '4.67 (45 ratings)',
      passengerName: 'Aishwarya R.'
    },
    homeMatch: {
      percentage: 75,
      isTowardsHome: true,
      badgeKn: '🏠 ಮನೆ ಕಡೆಗೆ • 75% Match',
      badgeEn: '🏠 TOWARDS HOME • 75% Match',
      prefixKn: 'ಮನೆ ಕಡೆಗೆ ಸವಾರಿ! ',
      prefixPhoneticKn: 'Mane kadege ride! ',
      prefixEn: 'Ride towards home! '
    }
  },
  {
    id: 'trip-3',
    fare: '260',
    paymentType: 'CASH',
    paymentTypeKn: 'ನಗದು',
    pickup: 'SILK BOARD FLYOVER',
    pickupKn: 'ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಫ್ಲೈಓವರ್',
    pickupSub: 'Hosur Road Service Lane entry',
    pickupSubKn: 'ಹೊಸೂರು ರಸ್ತೆ ಸರ್ವಿಸ್ ಲೇನ್',
    drop: 'ELECTRONIC CITY PHASE 1',
    dropKn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ ಫೇಸ್ 1',
    dropSub: 'Toll Gate Plaza • Wipro Gate',
    dropSubKn: 'ಟೋಲ್ ಗೇಟ್ • ವಿಪ್ರೋ ಗೇಟ್',
    direction: 'SE 140°',
    directionLabel: 'SOUTH-EAST',
    directionLabelKn: 'ಆಗ್ನೇಯ',
    distance: '9.2 KM',
    duration: '25 MIN',
    speechKn: 'ಹೊಸ ಬಾಡಿಗೆ. ಪಿಕಪ್, ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಫ್ಲೈಓವರ್. ಡ್ರಾಪ್, ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ. ಬಾಡಿಗೆ, ಇನ್ನೂರಾ ಅರವತ್ತು ರೂಪಾಯಿ, ನಗದು.',
    speechPhoneticKn: 'Hosa ride. Pickup, Silk Board Flyover. Drop, Electronic City. Baadige, innoora aravatthu roopaayi, cash.',
    speechEn: 'New Ride. Pickup, Silk Board Flyover. Drop, Electronic City. Fare, 260 Rupees, Cash.',
    traditionalClutter: {
      pickupFull: 'Near Silk Board U-Turn, Central Silk Board Colony, Madiwala, Bengaluru - 560068',
      dropFull: 'Keonics Electronic City Phase 1, Hosur Main Road, Bengaluru - 560100',
      customerRating: '4.91 (230 ratings)',
      passengerName: 'Manjunath G.'
    },
    homeMatch: {
      percentage: 20,
      isTowardsHome: false,
      badgeKn: '⚠️ ಬೇರೆ ದಿಕ್ಕು • 20% Match',
      badgeEn: '⚠️ AWAY FROM HOME • 20% Match',
      prefixKn: 'ಬೇರೆ ದಿಕ್ಕಿನ ಸವಾರಿ! ',
      prefixPhoneticKn: 'Bere dikkina ride! ',
      prefixEn: 'Opposite direction ride! '
    }
  },
  {
    id: 'trip-4',
    fare: '120',
    paymentType: 'CASH',
    paymentTypeKn: 'ನಗದು',
    pickup: 'MALLESHWARAM 8TH CROSS',
    pickupKn: 'ಮಲ್ಲೇಶ್ವರಂ 8ನೇ ಕ್ರಾಸ್',
    pickupSub: 'Near CTR Hotel • Margosa Road',
    pickupSubKn: 'ಸಿ.ಟಿ.ಆರ್ ಹೋಟೆಲ್ ಬಳಿ • ಮಾರ್ಗೋಸಾ ರಸ್ತೆ',
    drop: 'YESHWANTHPUR STATION',
    dropKn: 'ಯಶವಂತಪುರ ರೈಲ್ವೆ ನಿಲ್ದಾಣ',
    dropSub: 'Platform 1 Entrance • Circle Side',
    dropSubKn: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ 1 ದ್ವಾರ • ಸರ್ಕಲ್ ಕಡೆ',
    direction: 'NORTH 350°',
    directionLabel: 'NORTH',
    directionLabelKn: 'ಉತ್ತರ',
    distance: '3.6 KM',
    duration: '14 MIN',
    speechKn: 'ಹೊಸ ಬಾಡಿಗೆ. ಪಿಕಪ್, ಮಲ್ಲೇಶ್ವರಂ 8ನೇ ಕ್ರಾಸ್. ಡ್ರಾಪ್, ಯಶವಂತಪುರ ನಿಲ್ದಾಣ. ಬಾಡಿಗೆ, ನೂರ ಇಪ್ಪತ್ತು ರೂಪಾಯಿ, ನಗದು.',
    speechPhoneticKn: 'Hosa ride. Pickup, Malleshwaram 8th Cross. Drop, Yeshwanthpur railway station. Baadige, noora ippatthu roopaayi, cash.',
    speechEn: 'New Ride. Pickup, Malleshwaram 8th Cross. Drop, Yeshwanthpur Station. Fare, 120 Rupees, Cash.',
    traditionalClutter: {
      pickupFull: '#15, Margosa Rd, Between 7th & 8th Cross, Malleshwaram, Bengaluru - 560003',
      dropFull: 'Yeshwantpur Junction Railway Station, Tumkur Rd, Yeshwanthpur, Bengaluru - 560022',
      customerRating: '4.78 (89 ratings)',
      passengerName: 'Divya N.'
    },
    homeMatch: {
      percentage: 100,
      isTowardsHome: true,
      badgeKn: '🏠 ಮನೆ ಕಡೆಗೆ • 100% Match',
      badgeEn: '🏠 TOWARDS HOME • 100% Match',
      prefixKn: 'ಮನೆ ಕಡೆಗೆ ಸವಾರಿ! ',
      prefixPhoneticKn: 'Mane kadege ride! ',
      prefixEn: 'Ride towards home! '
    }
  }
];



const MetroLandmarkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="15" rx="3" />
    <path d="M4 11h16M12 3v8M8 19l-3 3M16 19l3 3M8 15h.01M16 15h.01" />
  </svg>
);



const EarphonesIcon = ({ active = false }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" className={`w-5 h-5 ${active ? 'text-emerald-400' : 'text-zinc-500'}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </svg>
);

const WAVE_HEIGHTS = [45, 95, 60, 100, 80, 50, 90, 65];

const AudioWaveVisualizer = ({ isSpeaking }: { isSpeaking: boolean }) => {
  const randomHeights = useMemo(
    () => WAVE_HEIGHTS.map((h) => Math.max(25, Math.round(h * Math.random()))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSpeaking]
  );

  return (
    <div className="flex items-center gap-1 h-5 px-2">
      {WAVE_HEIGHTS.map((_height, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            isSpeaking ? 'bg-amber-400 animate-pulse' : 'bg-zinc-700'
          }`}
          style={{
            height: isSpeaking ? `${randomHeights[i]}%` : '22%',
            animationDelay: `${i * 70}ms`
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  // Environmental and Ergonomic Simulators
  const [earphoneMode, setEarphoneMode] = useState(true);
  const [middayGlare, setMiddayGlare] = useState(false);
  const [engineVibration, setEngineVibration] = useState(false);
  const [lang, setLang] = useState('kn'); // 'kn' (Kannada) or 'en' (English)
  const [currentTripIndex, setCurrentTripIndex] = useState(0);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Operational Ride State Machine: 'DISPATCHING', 'ACCEPTED', 'EXPIRED'
  const [rideState, setRideState] = useState('DISPATCHING');
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceStatusText, setVoiceStatusText] = useState('Audio ready');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Phone Mode: auto-detect mobile/small screens for on-stage demos
  const [phoneMode, setPhoneMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
    }
    return false;
  });
  const [demoMenuOpen, setDemoMenuOpen] = useState<boolean>(false);
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [isHomeMode, setIsHomeMode] = useState<boolean>(false);



  const trip = TRIPS_DATA[currentTripIndex];

  // Helper to trigger transient in-app toast
  const showToast = (msg: string | null) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const sanitizeSpokenAddress = (text: string): string => {
    if (!text) return '';
    return text
      // Expand foot/feet abbreviations
      .replace(/\b100\s*ft\b/gi, '100 Feet')
      .replace(/\b80\s*ft\b/gi, '80 Feet')
      .replace(/\bft\b/gi, 'Feet')
      // Expand numbered crosses & mains
      .replace(/\b1st\s+cross\b/gi, 'First Cross')
      .replace(/\b2nd\s+cross\b/gi, 'Second Cross')
      .replace(/\b3rd\s+cross\b/gi, 'Third Cross')
      .replace(/\b4th\s+cross\b/gi, 'Fourth Cross')
      .replace(/\b5th\s+cross\b/gi, 'Fifth Cross')
      .replace(/\b1st\s+main\b/gi, 'First Main')
      .replace(/\b2nd\s+main\b/gi, 'Second Main')
      // Expand road & layout shorthand
      .replace(/\brd\.?\b/gi, 'Road')
      .replace(/\blyt\.?\b/gi, 'Layout')
      .replace(/\bblvd\.?\b/gi, 'Boulevard')
      .replace(/\bst\.?\b/gi, 'Street')
      .replace(/\bjn\.?\b/gi, 'Junction')
      .replace(/\bfl\.?\b/gi, 'Flyover')
      .trim();
  };

  const speakDispatch = useCallback((tripObj: Partial<Trip>, preferredLang: string, _explicitTrigger: boolean = false) => {
    if (!('speechSynthesis' in window)) {
      setVoiceStatusText('Speech not supported on device');
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const voices = window.speechSynthesis.getVoices();
      
      // 1. Look for native Kannada voice (rare on desktop, common on some Androids)
      const knVoice = voices.find(v => 
        v.lang.toLowerCase().includes('kn') || 
        v.name.toLowerCase().includes('kannada')
      );

      // 2. Look for Indian English or Hindi voice for phonetic Indic delivery
      const indianVoice = voices.find(v => 
        v.lang === 'en-IN' || 
        v.lang === 'hi-IN' || 
        v.name.toLowerCase().includes('india') ||
        v.lang.startsWith('hi')
      );

      // 3. Fallback to default voice
      const fallbackVoice = voices.find(v => v.default) || voices[0] || null;

      let textToSpeak: string | undefined = '';
      let chosenVoice = null;

      // Sanitize landmarks so abbreviations (100ft, 2nd Cross, etc.) are pronounced fully
      const cleanPickupKn = sanitizeSpokenAddress(tripObj.pickupKn || tripObj.pickup || '');
      const cleanDropKn = sanitizeSpokenAddress(tripObj.dropKn || tripObj.drop || '');
      const cleanPickup = sanitizeSpokenAddress(tripObj.pickup || '');
      const cleanDrop = sanitizeSpokenAddress(tripObj.drop || '');

      // Calculate Home route conditional tag (Active ONLY when isHomeMode is enabled)
      let homeTagKn = '';
      let homeTagPhonetic = '';
      let homeTagEn = '';

      if (isHomeMode && tripObj.homeMatch) {
        if (tripObj.homeMatch.isTowardsHome) {
          homeTagKn = 'ಮನೆ ಕಡೆಗೆ! ';
          homeTagPhonetic = 'Mane kadege! ';
          homeTagEn = 'Towards home! ';
        } else {
          homeTagKn = 'ಬೇರೆ ದಿಕ್ಕು! ';
          homeTagPhonetic = 'Bere dikku! ';
          homeTagEn = 'Away from home! ';
        }
      }

      // Strict Sequence: Fare -> Home Route Tag (if ON) -> Pickup -> Dropoff
      const speechTextKn = `${tripObj.fare} ರೂಪಾಯಿ. ${homeTagKn}ಪಿಕ್ ಅಪ್: ${cleanPickupKn}. ಡ್ರಾಪ್: ${cleanDropKn}.`;
      const speechTextPhoneticKn = `${tripObj.fare} rupaayi. ${homeTagPhonetic}Pickup: ${cleanPickup}. Drop: ${cleanDrop}.`;
      const speechTextEn = `${tripObj.fare} rupees. ${homeTagEn}Pickup: ${cleanPickup}. Drop: ${cleanDrop}.`;

      if (preferredLang === 'kn') {
        if (knVoice) {
          // Device has native Kannada voice engine
          textToSpeak = speechTextKn;
          chosenVoice = knVoice;
          setVoiceStatusText('ಕನ್ನಡ ಧ್ವನಿ (Native Kannada TTS)');
        } else {
          // Device lacks Kannada: speak phonetic Kannada via Indian/Default voice
          textToSpeak = speechTextPhoneticKn;
          chosenVoice = indianVoice || fallbackVoice;
          setVoiceStatusText('ಧ್ವನಿ: ಇಂಡಿಯನ್ ಫೋನೆಟಿಕ್ ಕನ್ನಡ (Universal Audio)');
        }
      } else {
        textToSpeak = speechTextEn;
        chosenVoice = indianVoice || fallbackVoice;
        setVoiceStatusText('Voice: Indian English');
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak || '');
      if (chosenVoice) utterance.voice = chosenVoice;
      utterance.rate = 0.82; // Measured slow rate for Kannada clarity over 80dB traffic noise
      utterance.pitch = 1.05;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = (err) => {
        console.warn("Speech synthesis error:", err);
        setIsSpeaking(false);
        // If native Kannada failed, immediately fallback to phonetic
        if (preferredLang === 'kn' && knVoice && chosenVoice === knVoice) {
          const fallbackUtterance = new SpeechSynthesisUtterance(speechTextPhoneticKn);
          if (indianVoice || fallbackVoice) fallbackUtterance.voice = indianVoice || fallbackVoice;
          fallbackUtterance.rate = 0.82;
          fallbackUtterance.onstart = () => setIsSpeaking(true);
          fallbackUtterance.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(fallbackUtterance);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis threw:", e);
      setIsSpeaking(false);
    }
  }, [isHomeMode]);

  useEffect(() => {
    // Populate browser speech voices when available
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    // Only run the dispatch timer and audio when actively dispatching.
    // When rideState is 'EXPIRED' or 'ACCEPTED', do nothing — stay on that screen.
    if (rideState !== 'DISPATCHING') return;

    setTimerSeconds(15); // eslint-disable-line react/set-state-in-effect

    let voiceDelay: ReturnType<typeof setTimeout> | undefined;

    // If earphone mode is active, trigger soundbox chime and spoken voice
    if (earphoneMode) {
      soundbox.playDispatchChime();
      voiceDelay = setTimeout(() => {
        speakDispatch(trip, lang);
      }, 350);
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false); // eslint-disable-line react/set-state-in-effect
      setVoiceStatusText('ಸೈಲೆಂಟ್ ಮೋಡ್ (Muted)'); // eslint-disable-line react/set-state-in-effect
    }

    // Calm 15-second non-punitive timer
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setRideState('EXPIRED');
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
          setIsSpeaking(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (voiceDelay) clearTimeout(voiceDelay);
      clearInterval(interval);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTripIndex, lang, earphoneMode, rideState, speakDispatch, trip]);

  const triggerHaptic = (pattern: number[] = [120, 60, 200]) => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const confirmAcceptance = () => {
    setRideState('ACCEPTED');
    soundbox.playAcceptChime();
    triggerHaptic([150, 70, 240]);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (earphoneMode) {
      const confirmSpeech: Partial<Trip> = lang === 'kn'
        ? { speechKn: `ಸವಾರಿ ಖಚಿತವಾಗಿದೆ! ${trip.pickupKn} ಕಡೆಗೆ ಹೊರಡಿ.`, speechPhoneticKn: `Ride confirm aagidhe! ${trip.pickup} kadege horadi.` }
        : { speechEn: `Ride confirmed! Proceeding to ${trip.pickup}.` };
      speakDispatch(confirmSpeech, lang);
    }
  };



  // ============================
  // LIVE PHONE MODE (Full-Screen Mobile)
  // ============================
  if (phoneMode) {
    return (
      <div className={`h-screen w-screen bg-[#070A0E] text-slate-100 flex flex-col font-sans select-none antialiased overflow-hidden ${engineVibration ? 'engine-shake-active' : ''}`}>

        {/* Toast Notification (Phone Mode) */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-amber-400 text-black px-4 py-2 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-black/20 animate-bounce">
            <span>🔔</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Glare Overlay (Phone Mode) */}
        {middayGlare && (
          <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
            <div 
              className="absolute -top-8 -right-8 w-56 h-56 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,240,0.25) 0%, rgba(255,245,180,0.15) 35%, rgba(255,255,255,0.05) 60%, transparent 100%)',
                filter: 'blur(6px)'
              }}
            />
            <div 
              className="absolute inset-0 opacity-15 mix-blend-screen"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,240,200,0.12) 35%, transparent 65%)'
              }}
            />
          </div>
        )}

        {/* Full-Screen Phone Display */}
        {isComparisonMode ? (
          <div className={`flex-1 flex flex-col justify-between overflow-hidden relative select-none w-full h-full box-border animate-fadeIn p-2 ${
            middayGlare ? 'glare-washout-effect' : ''
          }`}>
            {/* PERSISTENT TOP BAR: Exit Comparison Mode */}
            <div className="bg-[#121822] border border-amber-500/40 rounded-2xl px-3 py-2 flex items-center justify-between text-xs text-white shadow-xl z-30 mb-2 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-amber-400 text-base">⚠️</span>
                <div className="min-w-0">
                  <div className="font-black text-amber-300 text-[11px] leading-tight truncate">
                    Comparison Mode
                  </div>
                  <div className="text-[9px] text-zinc-400 font-medium truncate">
                    Legacy App (The Problem Space)
                  </div>
                </div>
              </div>

              {/* Dedicated Exit Button */}
              <button
                onClick={() => {
                  setIsComparisonMode(false);
                  showToast('✦ Exited Comparison Mode (Back to Concept 3)');
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs shadow-lg transition flex items-center gap-1.5 flex-shrink-0"
              >
                <span>✕</span>
                <span>Exit Comparison Mode</span>
              </button>
            </div>

            {/* THE LEGACY DRIVER CARD (Strict Zero-Scroll Fit) */}
            <div className="flex-1 bg-white text-black rounded-[32px] p-3.5 border-4 border-zinc-700 shadow-2xl flex flex-col justify-between overflow-hidden relative">
              
              {/* 1. Urgent Red Countdown Banner */}
              <div className="bg-red-600 text-white text-center py-1.5 rounded-xl font-black text-xs tracking-wider flex items-center justify-center gap-1.5 flex-shrink-0 shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>EXPIRING IN 00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</span>
              </div>

              {/* 2. Middle Alphanumeric Clutter Area */}
              <div className="space-y-2.5 py-1 text-left flex-1 flex flex-col justify-around">
                
                {/* Estimated Payout Row */}
                <div className="flex justify-between items-baseline border-b border-zinc-200 pb-2 flex-shrink-0">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">Estimated Payout</span>
                    <div className="text-3xl sm:text-4xl font-black text-zinc-900 leading-none mt-0.5">
                      ₹{trip.fare}.00
                    </div>
                  </div>
                  <span className="text-[11px] bg-zinc-200 px-2 py-0.5 rounded text-zinc-700 font-mono font-bold">
                    Auto Regular
                  </span>
                </div>

                {/* Tiny Alphanumeric Addresses */}
                <div className="space-y-2 text-[11px]">
                  {/* Pickup Address */}
                  <div className="flex gap-2 items-start">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1 flex-shrink-0"></span>
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-800 uppercase text-[10px]">Pickup Alphanumeric Address</div>
                      <div className="text-zinc-600 text-[10px] font-mono leading-tight mt-0.5">
                        {trip.traditionalClutter?.pickupFull || "#42/1, 2nd Cross, Basavanagudi, Bengaluru - 560004"}
                      </div>
                    </div>
                  </div>

                  {/* Dropoff Address */}
                  <div className="flex gap-2 items-start">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 flex-shrink-0"></span>
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-800 uppercase text-[10px]">Dropoff Alphanumeric Address</div>
                      <div className="text-zinc-600 text-[10px] font-mono leading-tight mt-0.5">
                        {trip.traditionalClutter?.dropFull || "Kempegowda Bus Station Terminal 3, Subhash Nagar, Bengaluru - 560009"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Algorithmic Warning Threat Box */}
                <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[10px] text-amber-950 leading-snug flex-shrink-0">
                  <strong>Algorithmic Warning:</strong> Declining or ignoring will decrease acceptance score below 85% leading to daily shadow-ban.
                </div>
              </div>

              {/* 3. Cramped 40px Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200 flex-shrink-0">
                <button
                  onClick={() => {
                    setIsComparisonMode(false);
                    showToast('Declined in Comparison Mode (Returned to New UX)');
                  }}
                  className="h-10 bg-zinc-200 hover:bg-zinc-300 active:scale-95 text-zinc-800 font-bold text-xs rounded-xl transition"
                >
                  DECLINE (40px)
                </button>
                <button
                  onClick={() => {
                    setIsComparisonMode(false);
                    showToast('Accepted in Comparison Mode (Returned to New UX)');
                  }}
                  className="h-10 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  ACCEPT (40px)
                </button>
              </div>

            </div>

            {/* Bottom Android Virtual Home Bar clearance */}
            <div className="w-24 h-1 bg-zinc-700 rounded-full mx-auto mt-2 flex-shrink-0" />
          </div>
        ) : (
          <div className={`flex-1 flex flex-col justify-between overflow-hidden px-3 pt-2 pb-3 ${
            middayGlare ? 'glare-washout-effect' : ''
          }`}>

          {/* Status Bar */}
          <div className="h-6 flex items-center justify-between px-1 text-[11px] font-mono font-semibold text-zinc-400 z-20">
            <span className="text-zinc-300 font-bold">12:45 PM</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-bold">4G LTE</span>
              <span className="text-emerald-400 font-bold">88%</span>
            </div>
          </div>

          {/* Earphone Toggle Bar */}
          <div className="bg-[#111720] border-2 border-zinc-700/80 rounded-2xl p-2 my-1 flex items-center justify-between shadow-lg z-20">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-xl border flex items-center justify-center transition-colors ${
                earphoneMode 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                  : 'bg-zinc-800 border-zinc-700 text-zinc-500'
              }`}>
                <EarphonesIcon active={earphoneMode} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wide text-white">
                    {lang === 'kn' ? 'ಕಿವಿಮಾತು ಮೋಡ್' : 'EARPHONE MODE'}
                  </span>
                  {earphoneMode && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">
                  {earphoneMode 
                    ? (lang === 'kn' ? 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ ಸಕ್ರಿಯ' : 'Voice guidance enabled') 
                    : (lang === 'kn' ? 'ಧ್ವನಿ ರಹಿತ (ಸೈಲೆಂಟ್)' : 'Muted / Visual only')}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !earphoneMode;
                setEarphoneMode(next);
                if (next) {
                  soundbox.playDispatchChime();
                  speakDispatch(trip, lang);
                  showToast(lang === 'kn' ? 'ಕಿವಿಮಾತು ಚಾಲೂ ಆಗಿದೆ' : 'Earphone Audio Enabled');
                } else {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  showToast(lang === 'kn' ? 'ಧ್ವನಿ ಮ್ಯೂಟ್ ಮಾಡಲಾಗಿದೆ' : 'Audio Muted');
                }
              }}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 p-0.5 focus:outline-none border ${
                earphoneMode 
                  ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/30' 
                  : 'bg-zinc-800 border-zinc-600'
              }`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center text-[10px] font-black ${
                earphoneMode ? 'translate-x-7 text-emerald-700' : 'translate-x-0 text-zinc-700'
              }`}>
                {earphoneMode ? 'ON' : 'OFF'}
              </div>
            </button>
          </div>

          {/* Phone Home Mode Toggle Pill */}
          <div className="flex items-center justify-between px-1 mb-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const next = !isHomeMode;
                setIsHomeMode(next);
                showToast(next ? '🏠 ಮನೆ ಕಡೆಗೆ (Home Mode ON)' : '🧭 ಸಾಮಾನ್ಯ ಮೋಡ್ (Regular Dispatch)');
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setTimeout(() => {
                  speakDispatch(trip, lang);
                }, 150);
              }}
              className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-black border transition-all flex items-center justify-between shadow active:scale-95 ${
                isHomeMode
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-700/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{isHomeMode ? '🏠' : '🧭'}</span>
                <span>{isHomeMode ? (lang === 'kn' ? 'ಮನೆ ಕಡೆಗೆ (Shift End)' : 'Towards Home (Shift End)') : (lang === 'kn' ? 'ಸಾಮಾನ್ಯ ಮೋಡ್' : 'Regular Dispatch')}</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                isHomeMode ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {isHomeMode ? 'ACTIVE' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Fuel Gauge Timer */}
          <div className="w-full bg-zinc-800/80 h-2.5 rounded-full overflow-hidden my-1 z-20">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-1000 ease-linear rounded-full"
              style={{ 
                width: rideState === 'DISPATCHING' ? `${(timerSeconds / 15) * 100}%` : '100%'
              }}
            />
          </div>

          {/* ACTIVE DISPATCH VIEW */}
          {rideState === 'DISPATCHING' && (
            <div className="flex-1 flex flex-col justify-between pt-1 pb-1 z-10">
              
              {/* Fare Card */}
              <div className="bg-[#121822] border-2 border-zinc-700/80 rounded-2xl p-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-amber-400">₹</span>
                    <span className="text-5xl font-black tracking-tight text-white leading-none">
                      {trip.fare}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wide">
                      {lang === 'kn' ? trip.paymentTypeKn : trip.paymentType}
                    </span>
                    <div className="text-[10px] text-zinc-400 mt-1 font-medium">
                      {lang === 'kn' ? 'ಖಚಿತ ಹಣ ಪಾವತಿ' : 'Guaranteed Payout'}
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                    <span className="px-2 py-0.5 bg-zinc-800 rounded text-amber-300 font-mono">{trip.distance}</span>
                    <span>•</span>
                    <span className="text-zinc-400">{trip.duration}</span>
                  </div>
                  {/* REPLACED COMPASS BEARING WITH BILINGUAL HOME MODE BADGE */}
                  {isHomeMode ? (
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border transition-all ${
                        trip.homeMatch?.isTowardsHome
                          ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-950'
                          : 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-sm shadow-amber-950'
                      }`}
                    >
                      <span className="text-sm">{trip.homeMatch?.isTowardsHome ? '🏠' : '⚠️'}</span>
                      <span className="tracking-wide">
                        {lang === 'kn'
                          ? (trip.homeMatch?.isTowardsHome ? 'ಮನೆ ಕಡೆಗೆ' : 'ಬೇರೆ ದಿಕ್ಕು')
                          : (trip.homeMatch?.isTowardsHome ? 'Towards Home' : 'Away from Home')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800/80 border border-zinc-700 text-zinc-400">
                      <span>🧭</span>
                      <span>{lang === 'kn' ? 'ಸಾಮಾನ್ಯ ಸವಾರಿ' : 'Regular Route'}</span>
                    </div>
                  )}
                </div>
              </div>



              {/* Landmark Cards */}
              <div className="space-y-2 my-1.5">
                <div className="bg-[#151F2C] border-2 border-emerald-500/70 rounded-2xl p-2.5 relative overflow-hidden">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MetroLandmarkIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <span>●</span> {lang === 'kn' ? 'ಪಿಕಪ್ ಜಂಕ್ಷನ್' : 'PICKUP LANDMARK'}
                      </span>
                      <h2 className="text-base font-black text-white leading-tight mt-0.5 truncate">
                        {lang === 'kn' ? trip.pickupKn : trip.pickup}
                      </h2>
                      <p className="text-[11px] text-zinc-400 font-medium truncate">
                        {lang === 'kn' ? trip.pickupSubKn : trip.pickupSub}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#151F2C] border-2 border-amber-500/60 rounded-2xl p-2.5 relative overflow-hidden">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-black">🏁</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <span>●</span> {lang === 'kn' ? 'ಡ್ರಾಪ್ ಜಂಕ್ಷನ್' : 'DROP LANDMARK'}
                      </span>
                      <h2 className="text-base font-black text-white leading-tight mt-0.5 truncate">
                        {lang === 'kn' ? trip.dropKn : trip.drop}
                      </h2>
                      <p className="text-[11px] text-zinc-400 font-medium truncate">
                        {lang === 'kn' ? trip.dropSubKn : trip.dropSub}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Replay Bar */}
              <div className="bg-[#10151C] border border-zinc-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AudioWaveVisualizer isSpeaking={isSpeaking} />
                  <div>
                    <div className="text-[11px] font-bold text-zinc-200">
                      {isSpeaking 
                        ? (lang === 'kn' ? 'ಕಿವಿಮಾತು ಓದಲಾಗುತ್ತಿದೆ...' : 'Speaking in Earbud...') 
                        : (earphoneMode 
                            ? (lang === 'kn' ? 'ರಸ್ತೆಯ ಮೇಲೆ ಕಣ್ಣಿಡಿ • ಧ್ವನಿ ಸಿದ್ಧ' : 'Eyes on road • Voice ready') 
                            : (lang === 'kn' ? 'ಧ್ವನಿ ಮ್ಯೂಟ್ ಮಾಡಲಾಗಿದೆ' : 'Earphone Mode Muted'))}
                    </div>
                    <div className="text-[9px] text-zinc-400 truncate max-w-[150px]">{voiceStatusText}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!earphoneMode) setEarphoneMode(true);
                    soundbox.playDispatchChime();
                    speakDispatch(trip, lang, true);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow ${
                    isSpeaking 
                      ? 'bg-amber-400 text-black border-amber-300 animate-pulse' 
                      : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-zinc-700'
                  }`}
                >
                  <span className="text-sm">🔊</span>
                  <span>{lang === 'kn' ? 'ಮತ್ತೆ ಕೇಳಿ' : 'Replay'}</span>
                </button>
              </div>

              {/* Accept Button */}
              <div className="mt-2 space-y-1.5">
                <button
                  onClick={confirmAcceptance}
                  className="w-full h-20 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black rounded-2xl shadow-2xl flex items-center justify-between px-4 transition-all duration-150 border-2 border-emerald-400/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-black/20 rounded-xl flex items-center justify-center text-white text-2xl font-black">✓</div>
                    <div className="text-left">
                      <div className="text-base font-black tracking-wide leading-tight">{lang === 'kn' ? 'ಒಪ್ಪಿಕೊಳ್ಳಿ' : 'ACCEPT'}</div>
                      <div className="text-[10px] font-bold opacity-70">{lang === 'kn' ? 'ಸವಾರಿ ಒಪ್ಪಿಗೆ' : 'Tap to confirm ride'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black leading-none">₹{trip.fare}</div>
                    <div className="text-[10px] font-bold opacity-70 mt-0.5">{lang === 'kn' ? trip.paymentTypeKn : trip.paymentType}</div>
                  </div>
                </button>
                <div className="flex items-center justify-between px-2 pt-0.5 text-[11px]">
                  <button
                    onClick={() => {
                      setRideState('EXPIRED');
                      showToast(lang === 'kn' ? 'ಸವಾರಿ ಸ್ಕಿಪ್ ಮಾಡಲಾಗಿದೆ' : 'Ride Skipped Calmly');
                    }}
                    className="text-zinc-400 hover:text-zinc-200 underline font-medium py-1 px-1"
                  >
                    {lang === 'kn' ? 'ಈಗ ಬೇಡ (ಸ್ಕಿಪ್)' : 'Skip ride (No penalty)'}
                  </button>
                  <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                    <span>🛡️</span>
                    {lang === 'kn' ? 'ರೇಟಿಂಗ್ ಕಡಿಮೆಯಾಗುವುದಿಲ್ಲ' : 'Zero rating penalty'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ACCEPTED SCREEN */}
          {rideState === 'ACCEPTED' && (
            <div className="flex-1 flex flex-col justify-between items-center text-center p-4 py-6 animate-fadeIn z-10">
              <div className="space-y-3">
                <div className="w-18 h-18 bg-emerald-500/20 border-4 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-3xl font-black shadow-lg shadow-emerald-500/20">✓</div>
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    {lang === 'kn' ? 'ಸವಾರಿ ಖಚಿತವಾಗಿದೆ' : 'RIDE CONFIRMED'}
                  </span>
                  <h2 className="text-3xl font-black text-white mt-0.5">₹{trip.fare} • {trip.paymentType}</h2>
                  <p className="text-xs text-zinc-400 mt-2 font-medium">{lang === 'kn' ? 'ಪಿಕಪ್ ಸ್ಥಳಕ್ಕೆ ತೆರಳಿ:' : 'Proceed to pickup:'}</p>
                  <div className="mt-0.5 text-base font-bold text-amber-400">{lang === 'kn' ? trip.pickupKn : trip.pickup}</div>
                </div>
              </div>
              <div className="w-full space-y-2.5">
                <button onClick={() => showToast("Google Maps Navigation launched!")} className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-black font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2">
                  <span>🧭</span><span>{lang === 'kn' ? 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ತೆರೆಯಿರಿ' : 'START NAVIGATION (MAPS)'}</span>
                </button>
                <button onClick={() => showToast("Calling passenger via masked number...")} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-2xl border border-zinc-700 flex items-center justify-center gap-2">
                  <span>📞</span><span>{lang === 'kn' ? 'ಪ್ರಯಾಣಿಕರಿಗೆ ಕರೆ ಮಾಡಿ' : 'CALL PASSENGER'}</span>
                </button>
                <button onClick={() => { setTimerSeconds(15); setRideState('DISPATCHING'); }} className="text-xs text-zinc-400 hover:text-white underline pt-1">↺ Reset Demo</button>
              </div>
            </div>
          )}

          {/* EXPIRED SCREEN */}
          {rideState === 'EXPIRED' && (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-4 space-y-4 animate-fadeIn z-10">
              <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center text-2xl text-zinc-400">⏱️</div>
              <div>
                <h3 className="text-lg font-bold text-white">{lang === 'kn' ? 'ಸವಾರಿ ಕಳೆದಿದೆ' : 'Trip Offer Timed Out'}</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-[260px] leading-relaxed">
                  {lang === 'kn' ? 'ಚಿಂತೆ ಬೇಡ! ಯಾವುದೇ ದಂಡವಿಲ್ಲ. ನಿಮ್ಮ ಖಾತೆ ಸುರಕ್ಷಿತವಾಗಿದೆ.' : 'No stress! Skipping does not affect your driver score or account standing.'}
                </p>
              </div>
              <button
                onClick={() => { setCurrentTripIndex(prev => (prev + 1) % TRIPS_DATA.length); setTimerSeconds(15); setRideState('DISPATCHING'); }}
                className="px-5 py-2.5 bg-amber-400 text-black font-black rounded-xl text-xs shadow-md"
              >
                {lang === 'kn' ? 'ಮುಂದಿನ ಬಾಡಿಗೆಗಾಗಿ ಹುಡುಕಿ' : 'Find Next Ride'}
              </button>
            </div>
          )}

          {/* Home Pill */}
          <div className="w-28 h-1 bg-zinc-700 rounded-full mx-auto mt-auto mb-1 z-20" />
        </div>
        )}

        {/* FLOATING DEMO CONTROL FAB */}
        {!demoMenuOpen && (
          <button
            onClick={() => setDemoMenuOpen(true)}
            className="fixed bottom-6 right-4 z-[90] w-12 h-12 bg-amber-400/90 text-black rounded-full shadow-2xl flex items-center justify-center text-lg font-black border-2 border-amber-300/60 active:scale-90 transition-transform backdrop-blur"
          >
            ⚙
          </button>
        )}

        {/* DEMO CONTROL DRAWER (Redesigned Bottom Sheet Modal) */}
        {demoMenuOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-fadeIn"
            onClick={(e) => { if (e.target === e.currentTarget) setDemoMenuOpen(false); }}
          >
            <div className="w-full max-w-md bg-[#0F1520] border border-zinc-700/80 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 text-white relative">

              {/* Header with Close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 text-sm">⚙️</span>
                  <div>
                    <h3 className="font-black text-sm text-white tracking-wide">Demo & Simulation Controls</h3>
                    <p className="text-[10px] text-zinc-400">Live presentation quick switcher</p>
                  </div>
                </div>
                <button
                  onClick={() => setDemoMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold border border-zinc-700 transition"
                >
                  ✕
                </button>
              </div>

              {/* Trip Selector — 4-Column Grid */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Select Trip Scenario</span>
                <div className="grid grid-cols-4 gap-2">
                  {TRIPS_DATA.map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => { setCurrentTripIndex(idx); setTimerSeconds(15); setRideState('DISPATCHING'); setDemoMenuOpen(false); showToast(`Trip ${idx + 1}`); }}
                      className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                        currentTripIndex === idx
                          ? 'bg-amber-400 text-black font-black shadow-lg shadow-amber-400/20'
                          : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/70'
                      }`}
                    >
                      <span>Trip {idx + 1}</span>
                      <span className="text-[9px] opacity-75">₹{t.fare}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Toggle — Segmented Pill */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Language</span>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => { setLang('kn'); setDemoMenuOpen(false); }}
                    className={`py-2 rounded-lg transition ${
                      lang === 'kn' ? 'bg-amber-400 text-black font-black shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ಕನ್ನಡ (Kannada)
                  </button>
                  <button
                    onClick={() => { setLang('en'); setDemoMenuOpen(false); }}
                    className={`py-2 rounded-lg transition ${
                      lang === 'en' ? 'bg-amber-400 text-black font-black shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Simulation Toggles — 2x2 Grid */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Simulation Toggles</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setMiddayGlare(!middayGlare); setDemoMenuOpen(false); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      middayGlare ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/70 hover:bg-zinc-700'
                    }`}
                  >
                    <span>☀️</span><span>{middayGlare ? 'Glare [ON]' : '12PM Glare'}</span>
                  </button>
                  <button
                    onClick={() => { setEngineVibration(!engineVibration); setDemoMenuOpen(false); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      engineVibration ? 'bg-red-600 text-white border-red-400' : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/70 hover:bg-zinc-700'
                    }`}
                  >
                    <span>⚡</span><span>{engineVibration ? 'Shake [ON]' : 'Handlebar Shake'}</span>
                  </button>
                  <button
                    onClick={() => { soundbox.playDispatchChime(); speakDispatch(trip, lang, true); setDemoMenuOpen(false); showToast(lang === 'kn' ? 'ಧ್ವನಿ ನುಡಿಯುತ್ತಿದೆ...' : 'Speaking aloud...'); }}
                    className="p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 bg-zinc-800/80 text-amber-300 border-zinc-700/70 hover:bg-zinc-700 transition"
                  >
                    <span>🔊</span><span>Test Voice</span>
                  </button>
                  <button
                    onClick={() => { setPhoneMode(false); setDemoMenuOpen(false); }}
                    className="p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 bg-zinc-800/80 text-zinc-400 border-zinc-700/70 hover:bg-zinc-700 transition"
                  >
                    <span>🖥️</span><span>Desktop Mode</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsComparisonMode(true);
                    setDemoMenuOpen(false);
                    showToast('⚠️ Switched to Comparison Mode (Legacy App)');
                  }}
                  className={`w-full mt-2 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow ${
                    isComparisonMode
                      ? 'bg-amber-400 text-black border-amber-300 font-black'
                      : 'bg-zinc-800/80 hover:bg-zinc-700/80 border-amber-500/50 text-amber-300'
                  }`}
                >
                  <span>⚖️</span>
                  <span>Comparison Mode</span>
                </button>
                <button
                  onClick={() => {
                    const nextMode = !isHomeMode;
                    setIsHomeMode(nextMode);
                    setDemoMenuOpen(false);
                    showToast(nextMode ? '🏠 Home Mode ON (ಮನೆ ಕಡೆಗೆ)' : '🧭 Regular Dispatch Mode');
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                    setTimeout(() => {
                      speakDispatch(trip, lang);
                    }, 150);
                  }}
                  className={`w-full mt-2 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow ${
                    isHomeMode
                      ? 'bg-emerald-500 text-black border-emerald-400 font-black'
                      : 'bg-zinc-800/80 hover:bg-zinc-700/80 border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  <span>{isHomeMode ? '🏠' : '🧭'}</span>
                  <span>{isHomeMode ? 'Home Mode [ON]' : 'Home Mode (Shift End)'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Phone Mode CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes engineShake {
            0% { transform: translate(0, 0) rotate(0deg); }
            20% { transform: translate(-1.5px, 2px) rotate(-0.35deg); }
            40% { transform: translate(2px, -1px) rotate(0.3deg); }
            60% { transform: translate(-2px, -1.5px) rotate(-0.3deg); }
            80% { transform: translate(1.5px, 1.5px) rotate(0.35deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          .engine-shake-active { animation: engineShake 0.13s infinite linear; }
          .glare-washout-effect { filter: contrast(0.88) brightness(1.12) saturate(0.85) !important; transition: filter 0.3s ease; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
        `}} />
      </div>
    );
  }

  // ============================
  // DESKTOP MODE (Original Simulator)
  // ============================
  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-amber-400 text-black px-4 py-2 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-black/20 animate-bounce">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Simulator Control Header */}
      <header className="border-b border-zinc-800 bg-[#0A0E13]/95 backdrop-blur sticky top-0 z-50 px-3 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          {/* Persona Title */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Transit Logo" 
              className="w-11 h-11 object-contain rounded-xl select-none flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-wide text-white">
                  Auto Driver UX Prototype
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Concept 3: Dashboard Meter
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Earphone Audio-First • Sub-Second Glanceability • Bengaluru
              </p>
            </div>
          </div>

          {/* Simulation Toggle Bar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Trip Selector */}
            <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded-lg p-0.5">
              {TRIPS_DATA.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setCurrentTripIndex(idx);
                    setTimerSeconds(15);
                    setRideState('DISPATCHING');
                    showToast(`Loaded Trip ${idx + 1}`);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                    currentTripIndex === idx 
                      ? 'bg-amber-400 text-black font-black shadow' 
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  Trip {idx + 1}
                </button>
              ))}
            </div>

            {/* Language Switch */}
            <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded-lg p-0.5">
              <button
                onClick={() => {
                  setLang('kn');
                  showToast('ಕನ್ನಡ ಮೋಡ್ ಸಕ್ರಿಯ (Kannada)');
                }}
                className={`px-2.5 py-1 rounded text-[11px] transition ${
                  lang === 'kn' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  showToast('English Mode Active');
                }}
                className={`px-2.5 py-1 rounded text-[11px] transition ${
                  lang === 'en' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ENG
              </button>
            </div>

            {/* Test Voice Button */}
            <button
              onClick={() => {
                soundbox.playDispatchChime();
                speakDispatch(trip, lang, true);
                showToast(lang === 'kn' ? 'ಧ್ವನಿ ನುಡಿಯುತ್ತಿದೆ...' : 'Speaking aloud...');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-amber-300 border border-zinc-600 font-bold text-[11px] shadow transition"
              title="Click to verify browser voice synthesis"
            >
              <span>🔊</span>
              <span>{lang === 'kn' ? 'ಧ್ವನಿ ಪರೀಕ್ಷೆ' : 'Test Voice'}</span>
            </button>

            {/* Midday Glare Simulator Toggle */}
            <button
              onClick={() => {
                const next = !middayGlare;
                setMiddayGlare(next);
                showToast(next ? '☀️ 12 PM Glare ON (Washout Active)' : 'Glare OFF');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition shadow ${
                middayGlare
                  ? 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-400/50'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              <span>☀️</span>
              <span>{middayGlare ? '12PM Glare [ON]' : '12PM Glare'}</span>
            </button>

            {/* 2-Stroke Vibration Toggle */}
            <button
              onClick={() => {
                const next = !engineVibration;
                setEngineVibration(next);
                showToast(next ? '⚡ 2-Stroke Handlebar Shake ON' : 'Vibration OFF');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition ${
                engineVibration
                  ? 'bg-red-600 text-white border-red-400 animate-pulse'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300'
              }`}
            >
              <span>⚡</span>
              <span>{engineVibration ? 'Shake [ON]' : '2-Stroke Shake'}</span>
            </button>

            {/* Compare Legacy App Toggle */}
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition ${
                comparisonMode
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-zinc-500'
              }`}
            >
              <span>{comparisonMode ? '✕ Exit Comparison' : '⚖ Comparison Mode'}</span>
            </button>

            {/* Home Mode Toggle */}
            <button
              onClick={() => {
                const next = !isHomeMode;
                setIsHomeMode(next);
                showToast(next ? '🏠 Home Mode [ON]' : '🧭 Regular Dispatch [OFF]');
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black border transition active:scale-95 shadow ${
                isHomeMode
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
              }`}
            >
              <span>{isHomeMode ? '🏠' : '🧭'}</span>
              <span>{isHomeMode ? 'Home Mode [ON]' : 'Home Mode [OFF]'}</span>
            </button>

            {/* Live Phone Mode Toggle */}
            <button
              onClick={() => setPhoneMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
            >
              <span>📱</span>
              <span>Live Phone Mode</span>
            </button>

          </div>
        </div>
      </header>

      {/* Simulator Workspace */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden relative">
        <div className={`flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl w-full ${
          engineVibration ? 'engine-shake-active' : ''
        }`}>
          
          {/* COMPARISON VIEW: Legacy Alphanumeric Clutter App */}
          {comparisonMode && (
            <div className="w-full max-w-[340px] flex-shrink-0 animate-fadeIn">
              <div className="text-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center justify-center gap-1">
                  <span>⚠️</span> Legacy Driver App (The Problem)
                </span>
                <p className="text-[11px] text-zinc-400">Tiny 10pt text washed out under sunlight • 40px buttons</p>
              </div>

              {/* Legacy Phone Mockup */}
              <div className="w-[330px] h-[660px] rounded-[38px] bg-white p-3 border-4 border-zinc-700 shadow-2xl relative flex flex-col justify-between text-black overflow-hidden">
                
                {/* Midday Glare Impact on Legacy App (Completely Unreadable!) */}
                {middayGlare && (
                  <div className="absolute inset-0 z-40 pointer-events-none bg-white/75 backdrop-blur-[0.5px] flex items-center justify-center p-6 text-center">
                    <div className="bg-black/90 text-red-300 p-3 rounded-xl border border-red-500/50 shadow-xl text-xs font-bold leading-snug">
                      ❌ WASHED OUT BY SUNLIGHT
                      <p className="text-[10px] text-zinc-300 font-normal mt-1">
                        Tiny gray alphanumeric text disappears completely under 12PM midday glare. Drivers cannot read this without reading glasses!
                      </p>
                    </div>
                  </div>
                )}

                {/* Legacy Red Panic Timer */}
                <div className="bg-red-600 text-white text-center py-1.5 font-black text-xs flex items-center justify-center gap-1 tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  EXPIRING IN 00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                </div>

                {/* Cluttered Alphanumeric Address Content */}
                <div className="p-3 text-left space-y-3">
                  <div className="flex justify-between items-baseline border-b pb-2">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Estimated Payout</span>
                      <div className="text-2xl font-black text-zinc-900">₹{trip.fare}.00</div>
                    </div>
                    <span className="text-xs bg-zinc-200 px-2 py-0.5 rounded text-zinc-700 font-mono">Auto Regular</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex gap-2 items-start">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1 flex-shrink-0"></span>
                      <div>
                        <div className="font-bold text-zinc-700 uppercase text-[10px]">Pickup Alphanumeric Address</div>
                        <div className="text-zinc-600 text-[10px] font-mono leading-tight">
                          {trip.traditionalClutter.pickupFull}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 flex-shrink-0"></span>
                      <div>
                        <div className="font-bold text-zinc-700 uppercase text-[10px]">Dropoff Alphanumeric Address</div>
                        <div className="text-zinc-600 text-[10px] font-mono leading-tight">
                          {trip.traditionalClutter.dropFull}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-amber-50 border border-amber-300 rounded text-[10px] text-amber-900">
                    <strong>Algorithmic Warning:</strong> Declining or ignoring will decrease acceptance score below 85% leading to daily shadow-ban.
                  </div>
                </div>

                {/* Tiny 40px buttons that misfire on potholes */}
                <div className="p-3 border-t grid grid-cols-2 gap-2">
                  <button className="h-10 bg-zinc-200 text-zinc-700 font-bold text-xs rounded">
                    DECLINE (40px)
                  </button>
                  <button className="h-10 bg-emerald-600 text-white font-bold text-xs rounded animate-bounce">
                    ACCEPT (40px)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MAIN PROTOTYPE: Driver Mobile Interface */}
          <div className="relative flex flex-col items-center py-6">
            
            {/* Handlebar Mount Simulation Brackets (Top & Bottom) */}
            <div className="hidden sm:flex absolute -top-2.5 w-48 h-6 bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800 rounded-t-lg shadow-xl border-t border-x border-zinc-600/60 items-center justify-center z-0">
              <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-300 uppercase">
                Handlebar Clamp Mount
              </span>
            </div>

            <div className="hidden sm:flex absolute -bottom-2.5 w-48 h-6 bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800 rounded-b-lg shadow-2xl border-b border-x border-zinc-600/60 items-center justify-center z-0">
              <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-300 uppercase">
                Handlebar Clamp Mount
              </span>
            </div>

            {/* Mobile Device Frame */}
            <div className="w-[360px] sm:w-[385px] h-[720px] bg-[#070A0E] rounded-[48px] p-3 border-[6px] border-[#202731] shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-zinc-700/50 z-10">
              
              {/* INTENSE 12 PM MIDDAY GLARE & SCREEN WASHOUT OVERLAY */}
              {middayGlare && (
                <div className="absolute inset-0 z-50 pointer-events-none rounded-[42px] overflow-hidden">
                  
                  {/* Specular Sun Sheen — Soft radial solar glare hotspot (20-25% opacity) */}
                  <div 
                    className="absolute -top-8 -right-8 w-56 h-56 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,240,0.25) 0%, rgba(255,245,180,0.15) 35%, rgba(255,255,255,0.05) 60%, transparent 100%)',
                      filter: 'blur(6px)'
                    }}
                  />
                  {/* Subtle diagonal reflection streak — mimics light hitting angled LCD */}
                  <div 
                    className="absolute inset-0 opacity-15 mix-blend-screen"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,240,200,0.12) 35%, transparent 65%)'
                    }}
                  />
                  {/* Faint hairline scratches — scratched matte screen protector */}
                  <svg className="absolute inset-0 w-full h-full opacity-15 stroke-white" strokeWidth="0.5">
                    <line x1="30" y1="50" x2="310" y2="580" />
                    <line x1="280" y1="90" x2="60" y2="460" strokeDasharray="8 4" />
                    <line x1="90" y1="30" x2="150" y2="200" />
                  </svg>
                  
                  {/* Persistent Glare Status Chip */}
                  <div className="absolute top-10 right-4 bg-yellow-400/90 text-black font-black text-[9px] uppercase px-2.5 py-1 rounded-full shadow-lg border border-black/20 flex items-center gap-1">
                    <span>☀️</span>
                    <span>12 PM Sunlight Washout</span>
                  </div>
                </div>
              )}

              {/* Phone Display Area (Receives optical washout filter under glare) */}
              <div className={`flex-1 flex flex-col justify-between overflow-hidden ${
                middayGlare ? 'glare-washout-effect' : ''
              }`}>

                {/* Status Bar */}
                <div className="h-6 flex items-center justify-between px-3 text-[11px] font-mono font-semibold text-zinc-400 z-20">
                  <span className="text-zinc-300 font-bold">12:45 PM</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-bold">4G LTE</span>
                    <span className="text-emerald-400 font-bold">88%</span>
                  </div>
                </div>

                {/* DEDICATED TACTILE EARPHONE MODE TOGGLE BAR */}
                <div className="bg-[#111720] border-2 border-zinc-700/80 rounded-2xl p-2 mx-0.5 my-1 flex items-center justify-between shadow-lg z-20">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-xl border flex items-center justify-center transition-colors ${
                      earphoneMode 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}>
                      <EarphonesIcon active={earphoneMode} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black tracking-wide text-white">
                          {lang === 'kn' ? 'ಕಿವಿಮಾತು ಮೋಡ್' : 'EARPHONE MODE'}
                        </span>
                        {earphoneMode && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-medium">
                        {earphoneMode 
                          ? (lang === 'kn' ? 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ ಸಕ್ರಿಯ' : 'Voice guidance enabled') 
                          : (lang === 'kn' ? 'ಧ್ವನಿ ರಹಿತ (ಸೈಲೆಂಟ್)' : 'Muted / Visual only')}
                      </div>
                    </div>
                  </div>

                  {/* Physical Style Toggle Switch */}
                  <button
                    onClick={() => {
                      const next = !earphoneMode;
                      setEarphoneMode(next);
                      if (next) {
                        soundbox.playDispatchChime();
                        speakDispatch(trip, lang);
                        showToast(lang === 'kn' ? 'ಕಿವಿಮಾತು ಚಾಲೂ ಆಗಿದೆ' : 'Earphone Audio Enabled');
                      } else {
                        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                        setIsSpeaking(false);
                        showToast(lang === 'kn' ? 'ಧ್ವನಿ ಮ್ಯೂಟ್ ಮಾಡಲಾಗಿದೆ' : 'Audio Muted');
                      }
                    }}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-200 p-0.5 focus:outline-none border ${
                      earphoneMode 
                        ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/30' 
                        : 'bg-zinc-800 border-zinc-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center text-[10px] font-black ${
                      earphoneMode ? 'translate-x-7 text-emerald-700' : 'translate-x-0 text-zinc-700'
                    }`}>
                      {earphoneMode ? 'ON' : 'OFF'}
                    </div>
                  </button>
                </div>

                {/* Ambient Fuel-Gauge Non-Punitive Temporal Indicator */}
                <div className="w-full bg-zinc-800/80 h-2.5 rounded-full overflow-hidden my-1 z-20">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-1000 ease-linear rounded-full"
                    style={{ 
                      width: rideState === 'DISPATCHING' ? `${(timerSeconds / 15) * 100}%` : '100%'
                    }}
                  />
                </div>

                {/* ACTIVE DISPATCH VIEW */}
                {rideState === 'DISPATCHING' && (
                  <div className="flex-1 flex flex-col justify-between pt-1 pb-1 z-10">
                    
                    {/* Top Giant Fare & Heading Card */}
                    <div className="bg-[#121822] border-2 border-zinc-700/80 rounded-2xl p-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-amber-400">₹</span>
                          <span className="text-5xl font-black tracking-tight text-white leading-none">
                            {trip.fare}
                          </span>
                        </div>

                        {/* Guaranteed Payment Chip */}
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wide">
                            {lang === 'kn' ? trip.paymentTypeKn : trip.paymentType}
                          </span>
                          <div className="text-[10px] text-zinc-400 mt-1 font-medium">
                            {lang === 'kn' ? 'ಖಚಿತ ಹಣ ಪಾವತಿ' : 'Guaranteed Payout'}
                          </div>
                        </div>
                      </div>

                      {/* Distance & Direction Cardinal Heuristic */}
                      <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                          <span className="px-2 py-0.5 bg-zinc-800 rounded text-amber-300 font-mono">
                            {trip.distance}
                          </span>
                          <span>•</span>
                          <span className="text-zinc-400">{trip.duration}</span>
                        </div>

                        {/* SYNCHRONIZED HOME MODE BADGE FOR BOTH DESKTOP & MOBILE */}
                        {isHomeMode ? (
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border transition-all ${
                              trip.homeMatch?.isTowardsHome
                                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-950'
                                : 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-sm shadow-amber-950'
                            }`}
                          >
                            <span className="text-sm">{trip.homeMatch?.isTowardsHome ? '🏠' : '⚠️'}</span>
                            <span className="tracking-wide">
                              {lang === 'kn'
                                ? (trip.homeMatch?.isTowardsHome ? 'ಮನೆ ಕಡೆಗೆ' : 'ಬೇರೆ ದಿಕ್ಕು')
                                : (trip.homeMatch?.isTowardsHome ? 'Towards Home' : 'Away from Home')}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800/80 border border-zinc-700 text-zinc-400">
                            <span>🧭</span>
                            <span>{lang === 'kn' ? 'ಸಾಮಾನ್ಯ ಸವಾರಿ' : 'Regular Route'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* High-Contrast Civic Landmark Badges */}
                    <div className="space-y-2 my-1.5">
                      
                      {/* PICKUP LANDMARK */}
                      <div className="bg-[#151F2C] border-2 border-emerald-500/70 rounded-2xl p-2.5 relative overflow-hidden">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MetroLandmarkIcon />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                              <span>●</span> {lang === 'kn' ? 'ಪಿಕಪ್ ಜಂಕ್ಷನ್' : 'PICKUP LANDMARK'}
                            </span>
                            <h2 className="text-base font-black text-white leading-tight mt-0.5 truncate">
                              {lang === 'kn' ? trip.pickupKn : trip.pickup}
                            </h2>
                            <p className="text-[11px] text-zinc-400 font-medium truncate">
                              {lang === 'kn' ? trip.pickupSubKn : trip.pickupSub}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* DROP LANDMARK */}
                      <div className="bg-[#151F2C] border-2 border-amber-500/60 rounded-2xl p-2.5 relative overflow-hidden">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-sm font-black">🏁</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                              <span>●</span> {lang === 'kn' ? 'ಡ್ರಾಪ್ ಜಂಕ್ಷನ್' : 'DROP LANDMARK'}
                            </span>
                            <h2 className="text-base font-black text-white leading-tight mt-0.5 truncate">
                              {lang === 'kn' ? trip.dropKn : trip.drop}
                            </h2>
                            <p className="text-[11px] text-zinc-400 font-medium truncate">
                              {lang === 'kn' ? trip.dropSubKn : trip.dropSub}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TACTILE AUDIO CONTROLLER & REPLAY BAR */}
                    <div className="bg-[#10151C] border border-zinc-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AudioWaveVisualizer isSpeaking={isSpeaking} />
                        <div>
                          <div className="text-[11px] font-bold text-zinc-200">
                            {isSpeaking 
                              ? (lang === 'kn' ? 'ಕಿವಿಮಾತು ಓದಲಾಗುತ್ತಿದೆ...' : 'Speaking in Earbud...') 
                              : (earphoneMode 
                                  ? (lang === 'kn' ? 'ರಸ್ತೆಯ ಮೇಲೆ ಕಣ್ಣಿಡಿ • ಧ್ವನಿ ಸಿದ್ಧ' : 'Eyes on road • Voice ready') 
                                  : (lang === 'kn' ? 'ಧ್ವನಿ ಮ್ಯೂಟ್ ಮಾಡಲಾಗಿದೆ' : 'Earphone Mode Muted'))}
                          </div>
                          <div className="text-[9px] text-zinc-400 truncate max-w-[150px]">
                            {voiceStatusText}
                          </div>
                        </div>
                      </div>

                      {/* Massive Blind-Tap Replay Audio Button */}
                      <button
                        onClick={() => {
                          if (!earphoneMode) setEarphoneMode(true);
                          soundbox.playDispatchChime();
                          speakDispatch(trip, lang, true);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow ${
                          isSpeaking 
                            ? 'bg-amber-400 text-black border-amber-300 animate-pulse' 
                            : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-zinc-700'
                        }`}
                      >
                        <span className="text-sm">🔊</span>
                        <span>{lang === 'kn' ? 'ಮತ್ತೆ ಕೇಳಿ' : 'Replay'}</span>
                      </button>
                    </div>

                    {/* OVERSIZED SINGLE-TAP ACCEPT BUTTON — Thumb-Friendly for Vibrating Handlebar */}
                    <div className="mt-2 space-y-1.5">
                      <button
                        onClick={confirmAcceptance}
                        className="w-full h-20 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black rounded-2xl shadow-2xl flex items-center justify-between px-4 transition-all duration-150 border-2 border-emerald-400/60"
                      >
                        {/* Left: Checkmark badge + Accept label */}
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-black/20 rounded-xl flex items-center justify-center text-white text-2xl font-black">
                            ✓
                          </div>
                          <div className="text-left">
                            <div className="text-base font-black tracking-wide leading-tight">
                              {lang === 'kn' ? 'ಒಪ್ಪಿಕೊಳ್ಳಿ' : 'ACCEPT'}
                            </div>
                            <div className="text-[10px] font-bold opacity-70">
                              {lang === 'kn' ? 'ಸವಾರಿ ಒಪ್ಪಿಗೆ' : 'Tap to confirm ride'}
                            </div>
                          </div>
                        </div>

                        {/* Right: Fare + Payment badge */}
                        <div className="text-right">
                          <div className="text-2xl font-black leading-none">
                            ₹{trip.fare}
                          </div>
                          <div className="text-[10px] font-bold opacity-70 mt-0.5">
                            {lang === 'kn' ? trip.paymentTypeKn : trip.paymentType}
                          </div>
                        </div>
                      </button>

                      {/* Non-Punitive Calm Skip Action */}
                      <div className="flex items-center justify-between px-2 pt-0.5 text-[11px]">
                        <button
                          onClick={() => {
                            setRideState('EXPIRED');
                            showToast(lang === 'kn' ? 'ಸವಾರಿ ಸ್ಕಿಪ್ ಮಾಡಲಾಗಿದೆ' : 'Ride Skipped Calmly');
                          }}
                          className="text-zinc-400 hover:text-zinc-200 underline font-medium py-1 px-1"
                        >
                          {lang === 'kn' ? 'ಈಗ ಬೇಡ (ಸ್ಕಿಪ್)' : 'Skip ride (No penalty)'}
                        </button>
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                          <span>🛡️</span>
                          {lang === 'kn' ? 'ರೇಟಿಂಗ್ ಕಡಿಮೆಯಾಗುವುದಿಲ್ಲ' : 'Zero rating penalty'}
                        </span>
                      </div>
                    </div>

                  </div>
                )}

                {/* ACCEPTED CONFIRMATION SCREEN */}
                {rideState === 'ACCEPTED' && (
                  <div className="flex-1 flex flex-col justify-between items-center text-center p-4 py-6 animate-fadeIn z-10">
                    <div className="space-y-3">
                      <div className="w-18 h-18 bg-emerald-500/20 border-4 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-3xl font-black shadow-lg shadow-emerald-500/20">
                        ✓
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                          {lang === 'kn' ? 'ಸವಾರಿ ಖಚಿತವಾಗಿದೆ' : 'RIDE CONFIRMED'}
                        </span>
                        <h2 className="text-3xl font-black text-white mt-0.5">
                          ₹{trip.fare} • {trip.paymentType}
                        </h2>
                        <p className="text-xs text-zinc-400 mt-2 font-medium">
                          {lang === 'kn' ? 'ಪಿಕಪ್ ಸ್ಥಳಕ್ಕೆ ತೆರಳಿ:' : 'Proceed to pickup:'}
                        </p>
                        <div className="mt-0.5 text-base font-bold text-amber-400">
                          {lang === 'kn' ? trip.pickupKn : trip.pickup}
                        </div>
                      </div>
                    </div>

                    <div className="w-full space-y-2.5">
                      <button
                        onClick={() => showToast("Google Maps Navigation launched!")}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-black font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
                      >
                        <span>🧭</span>
                        <span>{lang === 'kn' ? 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ತೆರೆಯಿರಿ' : 'START NAVIGATION (MAPS)'}</span>
                      </button>

                      <button
                        onClick={() => showToast("Calling passenger via masked number...")}
                        className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-2xl border border-zinc-700 flex items-center justify-center gap-2"
                      >
                        <span>📞</span>
                        <span>{lang === 'kn' ? 'ಪ್ರಯಾಣಿಕರಿಗೆ ಕರೆ ಮಾಡಿ' : 'CALL PASSENGER'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setTimerSeconds(15);
                          setRideState('DISPATCHING');
                        }}
                        className="text-xs text-zinc-400 hover:text-white underline pt-1"
                      >
                        ↺ Reset Demo
                      </button>
                    </div>
                  </div>
                )}

                {/* CALM EXPIRED SCREEN */}
                {rideState === 'EXPIRED' && (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-4 space-y-4 animate-fadeIn z-10">
                    <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center text-2xl text-zinc-400">
                      ⏱️
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {lang === 'kn' ? 'ಸವಾರಿ ಕಳೆದಿದೆ' : 'Trip Offer Timed Out'}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-[260px] leading-relaxed">
                        {lang === 'kn' 
                          ? 'ಚಿಂತೆ ಬೇಡ! ಯಾವುದೇ ದಂಡವಿಲ್ಲ. ನಿಮ್ಮ ಖಾತೆ ಸುರಕ್ಷಿತವಾಗಿದೆ.' 
                          : 'No stress! Skipping does not affect your driver score or account standing.'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTripIndex(prev => (prev + 1) % TRIPS_DATA.length);
                        setTimerSeconds(15);
                        setRideState('DISPATCHING');
                      }}
                      className="px-5 py-2.5 bg-amber-400 text-black font-black rounded-xl text-xs shadow-md"
                    >
                      {lang === 'kn' ? 'ಮುಂದಿನ ಬಾಡಿಗೆಗಾಗಿ ಹುಡುಕಿ' : 'Find Next Ride'}
                    </button>
                  </div>
                )}

                {/* Bottom Android Home Pill */}
                <div className="w-28 h-1 bg-zinc-700 rounded-full mx-auto mt-auto mb-1 z-20" />
              </div>
            </div>
          </div>

          {/* DESIGN THINKING & EVALUATION CRITERIA PANEL */}
          <div className="w-full max-w-sm space-y-4">
            <div className="bg-[#0E131A] border border-zinc-800 rounded-2xl p-5 shadow-xl text-left">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm mb-3">
                <span>💡</span>
                <span>Design Thinking Rationale</span>
              </div>
              
              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
                <div>
                  <strong className="text-white block mb-0.5">1. Universal Audio Architecture:</strong>
                  Equipped with intelligent voice fallback. If native Kannada speech engine is absent on the testing computer, it speaks phonetic Kannada (`Hosa ride! South End Circle inda...`) via Indian English TTS so it <strong>never stays silent</strong>.
                </div>

                <div>
                  <strong className="text-white block mb-0.5">2. Tactile Earphone Toggle:</strong>
                  Auto drivers in Bengaluru use single wireless earbuds during peak transit. A prominent ON/OFF switch allows drivers to switch between voice-announced dispatch and silent visual mode instantly.
                </div>

                <div>
                  <strong className="text-white block mb-0.5">3. 12 PM Sunlight Glare Proofing:</strong>
                  Toggle the glare filter to witness real LCD contrast washout. The high-contrast safety-yellow meter tile (`#FFCC00`) remains readable, whereas legacy alphanumeric addresses disappear.
                </div>

                <div>
                  <strong className="text-white block mb-0.5">4. Oversized Single-Tap Accept Button:</strong>
                  Massive 80px-tall emerald button sized for the driver's left thumb on a vibrating handlebar. Zero precision required — single tap to confirm.
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-4 pt-3.5 border-t border-zinc-800 text-[11px] text-zinc-400">
                <span className="font-bold text-zinc-200">Faculty Demo Checklist:</span>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Click <strong>'Test Voice'</strong> to test audio playback immediately.</li>
                  <li>Toggle <strong>'12PM Glare'</strong> to test contrast in midday sunlight.</li>
                  <li>Click <strong>'Compare Legacy'</strong> to demonstrate the problem space.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Global CSS for 2-Stroke Vibration and Glare Optical Washout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes engineShake {
          0% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-1.5px, 2px) rotate(-0.35deg); }
          40% { transform: translate(2px, -1px) rotate(0.3deg); }
          60% { transform: translate(-2px, -1.5px) rotate(-0.3deg); }
          80% { transform: translate(1.5px, 1.5px) rotate(0.35deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .engine-shake-active {
          animation: engineShake 0.13s infinite linear;
        }
        .glare-washout-effect {
          filter: contrast(0.88) brightness(1.12) saturate(0.85) !important;
          transition: filter 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}} />
    </div>
  );
}