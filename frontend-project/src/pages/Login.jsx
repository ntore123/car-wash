import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      const success = await login(data.username, data.password);

      if (success) {
        navigate('/');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-instagram-lg shadow-instagram-hover border border-primary-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-700 to-primary-900 rounded-instagram flex items-center justify-center shadow-instagram">
                <span className="text-white font-bold text-2xl">CW</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-primary-900 mb-2">
              Smart Pack
            </h2>
            <h3 className="text-lg font-semibold text-primary-700 mb-1">
              Car Services Management
            </h3>
            <p className="text-sm text-primary-600">
              Rubavu | Sign in to your account
            </p>
          </div>

          {error && <Alert type="error" message={error} />}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormInput
                label="Username"
                {...register('username', { required: 'Username is required' })}
                error={errors.username?.message}
                placeholder="Enter your username"
                required
              />

              <FormInput
                label="Password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                error={errors.password?.message}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-instagram w-5 h-5 mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-800 font-medium transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-primary-100 text-center">
            <p className="text-xs text-primary-500">
              © 2024 Smart Pack Car Services. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
