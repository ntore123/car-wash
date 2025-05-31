import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/ui/FormInput';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await authAPI.register(data.username, data.password, data.confirmPassword);

      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to dashboard...');

        // Update auth context with user data
        login(response.data.data);

        // Reset form
        reset();

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-dark via-olive-medium to-olive-light flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Registration Card */}
        <div className="bg-white rounded-instagram shadow-instagram p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-olive-medium to-olive-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-white text-2xl font-bold">CW</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join SmartPark Rubavu Car Wash Management</p>
          </div>

          {/* Success Message */}
          {success && <Alert type="success" message={success} className="mb-6" />}

          {/* Error Message */}
          {error && <Alert type="error" message={error} className="mb-6" />}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              label="Username"
              type="text"
              placeholder="Enter your username"
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters long'
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
              error={errors.username?.message}
              required
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters long'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                }
              })}
              error={errors.password?.message}
              required
            />

            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value =>
                  value === password || 'Passwords do not match'
              })}
              error={errors.confirmPassword?.message}
              required
            />

            {/* Password Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${password && password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  At least 6 characters long
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${password && /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  One uppercase letter
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${password && /[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  One lowercase letter
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${password && /\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  One number
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-olive-medium to-olive-dark text-white py-3 px-6 rounded-instagram font-medium hover:shadow-instagram-hover transform hover:scale-105 transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-olive-medium hover:text-olive-dark font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white text-sm opacity-80">
            SmartPark Rubavu - Car Wash Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
