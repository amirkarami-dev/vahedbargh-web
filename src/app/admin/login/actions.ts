// Re-export shared auth actions for the /admin/login route.
export {
  loginWithUsernameAction as loginAction,
  sendOtpAction,
  verifyOtpAction,
} from "@/lib/auth-actions";
