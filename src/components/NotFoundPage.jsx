import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes bodyBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes headScratch {
          0%   { transform: rotate(0deg); }
          20%  { transform: rotate(-12deg); }
          40%  { transform: rotate(8deg); }
          60%  { transform: rotate(-10deg); }
          80%  { transform: rotate(6deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes armScratch {
          0%   { transform: rotate(0deg) translateY(0); }
          25%  { transform: rotate(-18deg) translateY(-3px); }
          50%  { transform: rotate(10deg) translateY(-1px); }
          75%  { transform: rotate(-14deg) translateY(-3px); }
          100% { transform: rotate(0deg) translateY(0); }
        }
        @keyframes cableSwing {
          0%   { transform: rotate(-8deg); }
          50%  { transform: rotate(8deg); }
          100% { transform: rotate(-8deg); }
        }
        @keyframes rockFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes rockFloat2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-5px) rotate(-2deg); }
        }
        @keyframes eyeBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95%            { transform: scaleY(0.05); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes plugPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: scaleX(1); opacity: 0.18; }
          50%       { transform: scaleX(0.85); opacity: 0.1; }
        }
        .anim-body    { animation: bodyBob 2.4s ease-in-out infinite; }
        .anim-head    { animation: headScratch 1.8s ease-in-out infinite; transform-origin: center bottom; }
        .anim-arm     { animation: armScratch 1.8s ease-in-out infinite; transform-origin: left top; }
        .anim-cable   { animation: cableSwing 2s ease-in-out infinite; transform-origin: top center; }
        .anim-rock1   { animation: rockFloat 3.2s ease-in-out infinite; }
        .anim-rock2   { animation: rockFloat2 2.7s ease-in-out infinite 0.4s; }
        .anim-eye     { animation: eyeBlink 4s ease-in-out infinite; transform-origin: center center; }
        .anim-plug    { animation: plugPulse 1.8s ease-in-out infinite; }
        .anim-shadow  { animation: shadowPulse 2.4s ease-in-out infinite; }
        .anim-title   { animation: fadeSlideUp 0.7s ease both; }
        .anim-sub     { animation: fadeSlideUp 0.7s ease 0.15s both; }
        .anim-buttons { animation: fadeSlideUp 0.7s ease 0.3s both; }
        .btn-back {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 600;
          background: transparent; color: #870d4c;
          border: 2px solid #870d4c; cursor: pointer;
          transition: background 0.2s, color 0.2s, transform 0.15s;
          font-family: inherit;
        }
        .btn-back:hover { background: #870d4c; color: #fff; transform: translateY(-2px); }
        .btn-home {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 600;
          background: #870d4c; color: #fff; border: 2px solid #870d4c; cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          font-family: inherit;
          box-shadow: 0 4px 14px rgba(135,13,76,0.3);
        }
        .btn-home:hover { background: #9d1159; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(135,13,76,0.4); }
      `}</style>

      {/* Title */}
      <div className="anim-title" style={styles.heading404}>404</div>

      <h1 className="anim-title" style={styles.title}>
        <strong>Whoops!</strong> There's nothing to be found here. Sorry!
      </h1>

      {/* Scene */}
      <div style={styles.scene}>
        <svg
          viewBox="0 0 640 320"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', maxWidth: 640, overflow: 'visible' }}
        >
          {/* Ground */}
          <rect x="0" y="272" width="640" height="48" rx="0" fill="#f0eeec" />

          {/* ── Left rock (tall obelisk) ── */}
          <g className="anim-rock1" style={{ transformOrigin: '148px 272px' }}>
            <ellipse cx="148" cy="270" rx="34" ry="8" fill="#d9d5d0" opacity="0.5" />
            <rect x="126" y="170" width="44" height="100" rx="22" fill="#c8c4bf" />
            <ellipse cx="148" cy="170" rx="22" ry="14" fill="#dedad6" />
            {/* moss */}
            <ellipse cx="130" cy="255" rx="12" ry="7" fill="#7ab648" opacity="0.85" />
            <ellipse cx="162" cy="260" rx="9" ry="6" fill="#7ab648" opacity="0.7" />
          </g>

          {/* ── Right rock (gravestone) ── */}
          <g className="anim-rock2" style={{ transformOrigin: '496px 272px' }}>
            <ellipse cx="496" cy="270" rx="42" ry="9" fill="#d9d5d0" opacity="0.5" />
            <rect x="458" y="155" width="76" height="117" rx="38" fill="#c8c4bf" />
            <ellipse cx="496" cy="155" rx="38" ry="24" fill="#dedad6" />
            {/* cracks */}
            <line x1="492" y1="175" x2="498" y2="220" stroke="#b0aca7" strokeWidth="1.5" opacity="0.6" />
            <line x1="496" y1="195" x2="506" y2="210" stroke="#b0aca7" strokeWidth="1.2" opacity="0.5" />
            {/* moss */}
            <ellipse cx="462" cy="258" rx="14" ry="8" fill="#7ab648" opacity="0.8" />
            <ellipse cx="530" cy="263" rx="10" ry="6" fill="#7ab648" opacity="0.7" />
          </g>

          {/* Small pebbles */}
          <ellipse cx="210" cy="272" rx="12" ry="6" fill="#c0bcb8" />
          <ellipse cx="220" cy="271" rx="7" ry="4" fill="#cbc8c4" />
          <ellipse cx="390" cy="274" rx="10" ry="5" fill="#c0bcb8" />
          <ellipse cx="582" cy="273" rx="16" ry="6" fill="#c8c4bf" />
          <ellipse cx="68" cy="273" rx="13" ry="5" fill="#c8c4bf" />

          {/* Ground bush left */}
          <ellipse cx="188" cy="270" rx="22" ry="10" fill="#5a9e30" opacity="0.75" />
          <ellipse cx="205" cy="268" rx="16" ry="9" fill="#7ab648" opacity="0.75" />
          {/* Ground bush right */}
          <ellipse cx="432" cy="270" rx="18" ry="9" fill="#7ab648" opacity="0.7" />
          <ellipse cx="450" cy="269" rx="14" ry="8" fill="#5a9e30" opacity="0.75" />
          {/* Right grass cluster */}
          <ellipse cx="556" cy="271" rx="22" ry="8" fill="#7ab648" opacity="0.65" />

          {/* ══════════════════════════════════════ */}
          {/*            CAVEMAN CHARACTER           */}
          {/* ══════════════════════════════════════ */}
          <g className="anim-body" style={{ transformOrigin: '320px 272px' }}>

            {/* Shadow */}
            <ellipse className="anim-shadow" cx="320" cy="278" rx="46" ry="9" fill="#00000030" style={{ transformOrigin: '320px 278px' }} />

            {/* ── Legs ── */}
            {/* Left leg */}
            <rect x="300" y="230" width="20" height="45" rx="10" fill="#e8c49a" />
            {/* Right leg */}
            <rect x="324" y="230" width="20" height="45" rx="10" fill="#e8c49a" />
            {/* Feet */}
            <ellipse cx="310" cy="275" rx="14" ry="7" fill="#c49a6e" />
            <ellipse cx="334" cy="275" rx="14" ry="7" fill="#c49a6e" />

            {/* ── Tunic/body ── */}
            <rect x="290" y="158" width="64" height="82" rx="18" fill="#e8a838" />
            {/* Tunic spots */}
            <circle cx="305" cy="175" r="5" fill="#d4922a" opacity="0.6" />
            <circle cx="325" cy="190" r="6" fill="#d4922a" opacity="0.55" />
            <circle cx="312" cy="205" r="4" fill="#d4922a" opacity="0.5" />
            <circle cx="338" cy="172" r="4" fill="#d4922a" opacity="0.5" />
            <circle cx="345" cy="200" r="5" fill="#d4922a" opacity="0.5" />
            {/* Tunic hem (jagged) */}
            <polygon points="290,236 298,248 306,236 314,248 322,236 330,248 338,236 346,248 354,236" fill="#e8a838" />

            {/* ── Left arm (holding cable) ── */}
            <g style={{ transformOrigin: '292px 175px' }}>
              <rect x="268" y="170" width="28" height="14" rx="7" fill="#e8c49a" />
              {/* Hand */}
              <ellipse cx="263" cy="177" rx="10" ry="8" fill="#e8c49a" />
              {/* Fingers */}
              <ellipse cx="256" cy="172" rx="5" ry="4" fill="#e8c49a" />
              <ellipse cx="252" cy="178" rx="5" ry="4" fill="#e8c49a" />
              <ellipse cx="255" cy="185" rx="5" ry="4" fill="#e8c49a" />
            </g>

            {/* ── Right arm (scratching head) ── */}
            <g className="anim-arm" style={{ transformOrigin: '348px 168px' }}>
              <rect x="346" y="158" width="30" height="14" rx="7" fill="#e8c49a" transform="rotate(-45 346 162)" />
              {/* Upper arm going up-right */}
              <rect x="355" y="138" width="14" height="30" rx="7" fill="#e8c49a" transform="rotate(25 362 150)" />
              {/* Hand at head */}
              <ellipse cx="374" cy="132" rx="10" ry="8" fill="#e8c49a" />
              {/* Fingers scratching */}
              <line x1="368" y1="126" x2="364" y2="118" stroke="#e8c49a" strokeWidth="6" strokeLinecap="round" />
              <line x1="374" y1="124" x2="372" y2="115" stroke="#e8c49a" strokeWidth="6" strokeLinecap="round" />
              <line x1="380" y1="126" x2="380" y2="116" stroke="#e8c49a" strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* ── Neck ── */}
            <rect x="308" y="148" width="28" height="18" rx="8" fill="#e8c49a" />

            {/* ── Head ── */}
            <g className="anim-head" style={{ transformOrigin: '320px 148px' }}>
              {/* Hair/top */}
              <ellipse cx="320" cy="120" rx="34" ry="36" fill="#6b3d14" />
              {/* Face */}
              <ellipse cx="320" cy="128" rx="30" ry="32" fill="#e8c49a" />
              {/* Forehead hair */}
              <path d="M290,120 Q295,108 305,115 Q310,105 318,112 Q324,104 332,112 Q340,107 348,116 Q352,108 356,118" stroke="#6b3d14" strokeWidth="3" fill="none" />
              {/* Eyebrows (furrowed — confused) */}
              <path d="M298,118 Q306,113 312,116" stroke="#4a2808" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M326,116 Q332,113 340,118" stroke="#4a2808" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Frown wrinkle between brows */}
              <path d="M318,115 Q320,119 322,115" stroke="#c49a6e" strokeWidth="1.5" fill="none" />
              {/* Eyes */}
              <g className="anim-eye" style={{ transformOrigin: '306px 124px' }}>
                <ellipse cx="306" cy="124" rx="5" ry="6" fill="#3d2008" />
                <circle cx="308" cy="122" r="1.5" fill="white" opacity="0.7" />
              </g>
              <g className="anim-eye" style={{ transformOrigin: '334px 124px' }}>
                <ellipse cx="334" cy="124" rx="5" ry="6" fill="#3d2008" />
                <circle cx="336" cy="122" r="1.5" fill="white" opacity="0.7" />
              </g>
              {/* Nose */}
              <ellipse cx="320" cy="133" rx="5" ry="4" fill="#d4956e" />
              <circle cx="317" cy="134" r="2" fill="#c4855e" />
              <circle cx="323" cy="134" r="2" fill="#c4855e" />
              {/* Mouth (confused frown) */}
              <path d="M308,144 Q312,140 320,141 Q328,140 332,144" stroke="#4a2808" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Beard */}
              <path d="M292,136 Q294,152 300,158 Q310,165 320,163 Q330,165 340,158 Q346,152 348,136" fill="#6b3d14" opacity="0.9" />
              <path d="M294,140 Q296,155 305,162 Q312,167 320,165 Q328,167 335,162 Q344,155 346,140 Q338,148 320,147 Q302,148 294,140Z" fill="#7a4618" />
            </g>

            {/* ── Cable in left hand ── */}
            <g className="anim-cable" style={{ transformOrigin: '263px 180px' }}>
              {/* Cable cord */}
              <path
                d="M263,185 C250,210 240,230 248,255 C252,268 268,272 272,272"
                stroke="#2a2a2a"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Plug head */}
              <g className="anim-plug">
                <rect x="262" y="268" width="20" height="10" rx="3" fill="#333" />
                <rect x="265" y="278" width="4" height="8" rx="2" fill="#555" />
                <rect x="273" y="278" width="4" height="8" rx="2" fill="#555" />
                {/* Sparks */}
                <line x1="258" y1="275" x2="252" y2="270" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                <line x1="286" y1="273" x2="292" y2="268" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                <circle cx="258" cy="270" r="2" fill="#fbbf24" />
                <circle cx="292" cy="268" r="2" fill="#fbbf24" />
              </g>
            </g>

            {/* ── Wrist band on left hand ── */}
            <rect x="262" y="183" width="14" height="8" rx="4" fill="#8b6914" />
            <line x1="264" y1="185" x2="264" y2="189" stroke="#6b4f10" strokeWidth="1" />
            <line x1="267" y1="185" x2="267" y2="189" stroke="#6b4f10" strokeWidth="1" />
            <line x1="270" y1="185" x2="270" y2="189" stroke="#6b4f10" strokeWidth="1" />

          </g>{/* end caveman body group */}

        </svg>
      </div>

      <div className="anim-buttons mt-5" style={styles.btnGroup}>
        <button
          id="not-found-go-back"
          className="btn-home"
          onClick={() => navigate(-1)}
        >
         Go Back
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    fontFamily: "'Geist Variable', 'Inter', sans-serif",
    padding: '40px 20px',
    userSelect: 'none',
  },
  heading404: {
    fontSize: 'clamp(3rem, 10vw, 5rem)',
    fontWeight: 900,
    color: '#870d4c',
    letterSpacing: '-2px',
    lineHeight: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
    color: '#444',
    fontWeight: 400,
    textAlign: 'center',
    margin: '0 0 4px',
  },
  scene: {
    width: '100%',
    maxWidth: 640,
    margin: '10px 0 0',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 28,
    textAlign: 'center',
  },
  code: {
    background: '#f3f0f5',
    color: '#870d4c',
    padding: '1px 6px',
    borderRadius: 4,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  btnGroup: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
}
