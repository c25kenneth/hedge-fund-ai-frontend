import React from 'react';
import SignInWithGoogleButton from '../components/SignInWithGoogleButton';

const AuthenticateUser = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col w-9/10 lg:w-4/10 p-6 border border-gray-300 rounded-2xl shadow shadow-gray-200 gap-y-3">
        <div className='flex flex-row justify-center items-center'>
          <h2 className="font-bold text-3xl text-center text-blue-600">Hedge Fund AI</h2>
        </div>
        <SignInWithGoogleButton />
        <p className='text-gray-400 text-start mt-3'>
          By continuing, you agree to our <span className='text-blue-500'>Terms</span> and <span className='text-blue-500'>Privacy Policy</span>.
          We never post without your permission.
        </p>
      </div>
    </div>
  );
};

export default AuthenticateUser;
