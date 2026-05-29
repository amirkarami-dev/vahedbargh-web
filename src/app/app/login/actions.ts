// Re-export shared auth actions for the /app/login route.
export {
  loginWithUsernameAction as loginAction,
  sendOtpAction,
  verifyOtpAction,
} from "@/lib/auth-actions";
