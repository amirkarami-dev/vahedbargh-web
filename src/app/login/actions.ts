// Re-export shared auth actions for the /login route.
// The redirect target defaults to /app (set via hidden form field on the page).
export {
  loginWithUsernameAction as loginAction,
  sendOtpAction,
  verifyOtpAction,
} from "@/lib/auth-actions";
