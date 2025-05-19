import { supabase } from "../../supabaseClient"
const SignInWithGoogleButton = (props) => {

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  
    if (error) {
      console.error('Google sign-in error:', error.message);
    }
  };
  return (
    <button onClick={() => {handleGoogleSignIn()}} className="px-5 py-4 border flex flex-row justify-center gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150 w-full self-center">
            <img
                className="w-6 h-6"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                loading="lazy"
                alt="google logo"
            />
            <span>Continue with Google</span>
            </button>
  )
}

export default SignInWithGoogleButton
