import React from "react";
import { RefreshCw, RotateCcw } from "lucide-react";

function ErrorScene() {
  return (
    <svg
      viewBox="0 0 640 320"
      xmlns="http://www.w3.org/2000/svg"
      className="error-boundary-scene"
      aria-hidden="true"
    >
      {/* Ground */}
      <rect x="0" y="272" width="640" height="48" fill="#f0eeec" />

      {/* Rocks */}
      <g className="eb-rock">
        <rect x="126" y="175" width="44" height="97" rx="22" fill="#c8c4bf" />
        <ellipse cx="148" cy="175" rx="22" ry="14" fill="#dedad6" />
        <ellipse cx="133" cy="265" rx="16" ry="7" fill="#7ab648" />
      </g>

      <g className="eb-rock eb-rock-delayed">
        <rect x="458" y="161" width="76" height="111" rx="38" fill="#c8c4bf" />
        <ellipse cx="496" cy="161" rx="38" ry="24" fill="#dedad6" />
        <path
          d="M490 180 L498 210 L492 225"
          fill="none"
          stroke="#b0aca7"
          strokeWidth="2"
        />
        <ellipse cx="523" cy="266" rx="20" ry="7" fill="#7ab648" />
      </g>

      {/* Pebbles and grass */}
      <ellipse cx="78" cy="274" rx="15" ry="5" fill="#c8c4bf" />
      <ellipse cx="218" cy="273" rx="12" ry="5" fill="#c8c4bf" />
      <ellipse cx="403" cy="275" rx="12" ry="5" fill="#c8c4bf" />
      <ellipse cx="579" cy="274" rx="17" ry="5" fill="#c8c4bf" />
      <ellipse cx="191" cy="270" rx="21" ry="9" fill="#7ab648" />
      <ellipse cx="438" cy="270" rx="19" ry="8" fill="#7ab648" />

      {/* Character shadow */}
      <ellipse cx="320" cy="279" rx="44" ry="8" fill="#00000018" />

      <g className="eb-body">
        {/* Legs */}
        <rect x="301" y="230" width="19" height="43" rx="9" fill="#e8c49a" />
        <rect x="326" y="230" width="19" height="43" rx="9" fill="#e8c49a" />
        <ellipse cx="308" cy="274" rx="15" ry="7" fill="#c49a6e" />
        <ellipse cx="337" cy="274" rx="15" ry="7" fill="#c49a6e" />

        {/* Tunic */}
        <rect x="290" y="157" width="65" height="83" rx="18" fill="#e8a838" />
        <path
          d="M290 233 L298 248 L307 237 L315 248 L324 237 L333 248 L343 237 L355 245 L355 230"
          fill="#e8a838"
        />
        <g fill="#d4922a" opacity="0.65">
          <circle cx="305" cy="178" r="5" />
          <circle cx="330" cy="192" r="6" />
          <circle cx="311" cy="215" r="5" />
          <circle cx="344" cy="219" r="4" />
        </g>

        {/* Arm holding cable */}
        <path
          d="M295 174 L264 181"
          stroke="#e8c49a"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <circle cx="260" cy="181" r="10" fill="#e8c49a" />

        {/* Scratching arm */}
        <g className="eb-arm">
          <path
            d="M348 174 L372 153 L371 127"
            fill="none"
            stroke="#e8c49a"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="370" cy="124" r="10" fill="#e8c49a" />
        </g>

        {/* Neck */}
        <rect x="309" y="143" width="26" height="24" rx="8" fill="#e8c49a" />

        {/* Head */}
        <g className="eb-head">
          <ellipse cx="321" cy="119" rx="35" ry="37" fill="#6b3d14" />
          <ellipse cx="321" cy="128" rx="30" ry="32" fill="#e8c49a" />

          <path
            d="M291 114 Q303 96 314 109 Q325 95 337 109 Q347 101 352 117"
            fill="#6b3d14"
          />

          <path
            d="M298 117 L311 114 M328 114 L341 119"
            stroke="#4a2808"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <g className="eb-eyes">
            <ellipse cx="306" cy="126" rx="4" ry="5" fill="#3d2008" />
            <ellipse cx="335" cy="126" rx="4" ry="5" fill="#3d2008" />
          </g>

          <ellipse cx="321" cy="136" rx="5" ry="4" fill="#d4956e" />

          <path
            d="M293 139 Q297 163 321 165 Q346 163 349 139 Q336 149 321 147 Q305 149 293 139"
            fill="#7a4618"
          />
          <path
            d="M312 143 Q321 138 330 143"
            fill="none"
            stroke="#4a2808"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Disconnected cable */}
        <g className="eb-cable">
          <path
            d="M260 187 C240 215 239 253 264 267"
            fill="none"
            stroke="#333"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="259" y="263" width="23" height="13" rx="4" fill="#333" />
          <path
            d="M266 276 V285 M275 276 V285"
            stroke="#555"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <g className="eb-sparks" stroke="#f59e0b" strokeWidth="2.5">
            <path d="M251 269 L245 264 M288 268 L295 262" />
          </g>
        </g>
      </g>

      {/* Confusion marks */}
      <g className="eb-sparks" fill="#870d4c">
        <text x="396" y="102" fontSize="29" fontWeight="700">
          ?
        </text>
        <circle cx="416" cy="119" r="3" opacity="0.35" />
      </g>
    </svg>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback != null) {
      return this.props.fallback;
    }

    return (
      <section className="error-boundary-page">
        <style>{`
        .error-boundary-page {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fff;
          padding: 0;
          font-family: 'Geist Variable', 'Inter', sans-serif;
          text-align: center;
        }

          .error-boundary-page *,
          .error-boundary-page *::before,
          .error-boundary-page *::after {
            box-sizing: border-box;
          }

          .eb-heading {
            margin: 0 0 10px;
            color: #870d4c;
            font-size: clamp(2.5rem, 8vw, 4.5rem);
            font-weight: 900;
            letter-spacing: -2px;
            line-height: 1.1;
          }

          .eb-description {
            max-width: 460px;
            margin: 0;
            color: #555;
            font-size: clamp(14px, 2vw, 17px);
            line-height: 1.7;
          }

          .eb-description strong {
            color: #333;
            font-weight: 700;
          }

          .error-boundary-scene {
            display: block;
            width: 100%;
            max-width: 640px;
            margin: 12px 0 0;
          }

          .eb-helper {
            max-width: 400px;
            margin: 22px 0 20px;
            color: #777;
            font-size: 13px;
            line-height: 1.7;
          }

          .eb-actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
          }

          .eb-button {
            display: inline-flex;
            min-height: 44px;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 24px;
            border: 2px solid #870d4c;
            border-radius: 10px;
            background: transparent;
            color: #870d4c;
            font-family: inherit;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition:
              background 0.2s,
              color 0.2s,
              transform 0.15s,
              box-shadow 0.2s;
          }

          .eb-button:hover {
            background: #fdf2f8;
            transform: translateY(-2px);
          }

          .eb-button:focus-visible {
            outline: 2px solid #870d4c;
            outline-offset: 4px;
          }

          .eb-button-primary {
            background: #870d4c;
            color: #fff;
            box-shadow: 0 4px 14px rgba(135, 13, 76, 0.2);
          }

          .eb-button-primary:hover {
            background: #9d1159;
            border-color: #9d1159;
            box-shadow: 0 6px 20px rgba(135, 13, 76, 0.25);
          }

          .eb-details {
            width: 100%;
            max-width: 460px;
            margin-top: 24px;
            border: 1px solid #eee;
            border-radius: 8px;
            text-align: left;
          }

          .eb-details summary {
            padding: 12px 16px;
            color: #777;
            font-size: 12px;
            cursor: pointer;
          }

          .eb-details pre {
            max-height: 160px;
            overflow: auto;
            margin: 0;
            padding: 16px;
            border-top: 1px solid #eee;
            background: #faf8fa;
            color: #870d4c;
            font-size: 12px;
            line-height: 1.6;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
          }

          @keyframes eb-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          @keyframes eb-scratch {
            0%, 100% { transform: rotate(0deg); }
            30% { transform: rotate(-9deg); }
            65% { transform: rotate(7deg); }
          }

          @keyframes eb-swing {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }

          @keyframes eb-blink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
          }

          @keyframes eb-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.35; }
          }

          .eb-body {
            animation: eb-bob 2.4s ease-in-out infinite;
          }

          .eb-head {
            transform-origin: 321px 155px;
            animation: eb-scratch 2s ease-in-out infinite;
          }

          .eb-arm {
            transform-origin: 348px 174px;
            animation: eb-scratch 2s ease-in-out infinite;
          }

          .eb-cable {
            transform-origin: 260px 187px;
            animation: eb-swing 2.4s ease-in-out infinite;
          }

          .eb-eyes {
            transform-origin: 321px 126px;
            animation: eb-blink 4s ease-in-out infinite;
          }

          .eb-rock {
            animation: eb-bob 3.2s ease-in-out infinite;
          }

          .eb-rock-delayed {
            animation-delay: 0.6s;
          }

          .eb-sparks {
            animation: eb-pulse 2s ease-in-out infinite;
          }

          @media (max-width: 480px) {
            .eb-actions {
              width: 100%;
              max-width: 320px;
            }

            .eb-button {
              width: 100%;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .error-boundary-page * {
              animation: none !important;
              transition: none !important;
            }
          }
        `}</style>

        <h1 className="eb-heading">Whoops!</h1>

        <p className="eb-description">
          <strong>Something went wrong.</strong>
          <br />
          We couldn’t display this section.
        </p>

        <ErrorScene />

        <p className="eb-helper">
          Let’s give it another try. If the problem continues, try refreshing
          the page.
        </p>

        <div className="eb-actions">
          <button
            type="button"
            className="eb-button eb-button-primary"
            onClick={this.handleReset}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Try again
          </button>

          <button
            type="button"
            className="eb-button"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Refresh page
          </button>
        </div>

        {this.props.showDetails && this.state.error && (
          <details className="eb-details">
            <summary>Technical details</summary>
            <pre>{String(this.state.error.message || this.state.error)}</pre>
          </details>
        )}
      </section>
    );
  }
}

export default ErrorBoundary;
