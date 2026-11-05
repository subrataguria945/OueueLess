import { Login } from "./Login";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

export { ForgotPasswordModal };

/**
 * Compatibility Panel component if referenced
 */
export function ForgotPasswordPanel({ onSwitchToLogin }) {
  return (
    <ForgotPasswordModal
      isOpen={true}
      onClose={onSwitchToLogin}
    />
  );
}

/**
 * Standalone Forgot Password route (/forgot-password)
 * Loads the main Login page with the Forgot Password popup modal automatically open!
 */
export function ForgotPassword() {
  return <Login initialMode="login" initialForgotOpen={true} />;
}

export default ForgotPassword;
