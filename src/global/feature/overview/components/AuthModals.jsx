import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthModals = ({ isOpen, modalType, onClose, onSwitchModal, t }) => {
  const navigate = useNavigate();
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    // Redirect to login or admin dashboard
    navigate('/admin');
    onClose();
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    // Redirect to registration or dashboard
    navigate('/register');
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content-card relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {modalType === 'signin' ? (
          /* SIGN IN MODAL */
          <div>
            <div className="mb-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t.modal_signin_title}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {t.modal_signin_sub}
              </p>
            </div>

            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.modal_email_label}
                </label>
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b2f67] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.modal_password_label}
                </label>
                <input
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b2f67] focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#8b2f67] focus:ring-[#8b2f67]"
                  />
                  <span>{t.modal_remember_me}</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#07509a] hover:underline"
                >
                  {t.modal_forgot_pwd}
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#8b2f67] hover:bg-[#5a1941] text-white font-semibold rounded-2xl shadow-md transition-all text-base"
              >
                {t.modal_signin_btn}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              {t.modal_no_account}{' '}
              <button
                type="button"
                onClick={() => onSwitchModal('signup')}
                className="text-[#07509a] font-bold hover:underline"
              >
                {t.modal_signup_link}
              </button>
            </p>
          </div>
        ) : (
          /* SIGN UP MODAL */
          <div>
            <div className="mb-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t.modal_signup_title}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {t.modal_signup_sub}
              </p>
            </div>

            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.modal_fullname_label}
                </label>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b2f67] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.modal_email_label}
                </label>
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b2f67] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.modal_password_label}
                </label>
                <input
                  type="password"
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b2f67] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.modal_confirm_pwd_label}
                </label>
                <input
                  type="password"
                  required
                  value={signUpConfirm}
                  onChange={(e) => setSignUpConfirm(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b2f67] focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-start gap-2 pt-1 text-xs sm:text-sm">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-[#8b2f67] focus:ring-[#8b2f67]"
                />
                <label htmlFor="agreeTerms" className="text-gray-600 leading-snug">
                  I agree to the{' '}
                  <a href="#" className="text-[#07509a] hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#07509a] hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#8b2f67] hover:bg-[#5a1941] text-white font-semibold rounded-2xl shadow-md transition-all text-base mt-2"
              >
                {t.modal_signup_btn}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-5">
              {t.modal_have_account}{' '}
              <button
                type="button"
                onClick={() => onSwitchModal('signin')}
                className="text-[#07509a] font-bold hover:underline"
              >
                {t.modal_signin_link}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModals;
