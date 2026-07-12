import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Loader2, AlertCircle, Building2 } from 'lucide-react';
import apiClient from '../../api/authApi';
import PasswordInput from '../../components/PasswordInput/PasswordInput';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm({ name, email, password, departmentId }) {
  const errors = {};
  if (!name.trim()) {
    errors.name = 'Full name is required.';
  }
  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  if (!departmentId) {
    errors.departmentId = 'Department is required.';
  }
  return errors;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    name: '',
    email: '',
    password: '',
    departmentId: '',
  });
  const [departments, setDepartments] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDepts, setIsFetchingDepts] = useState(false);

  // Fetch departments for the select dropdown
  useEffect(() => {
    async function fetchDepartments() {
      setIsFetchingDepts(true);
      try {
        const response = await apiClient.get('/departments');
        // Standard shape: { success: true, data: [...] }
        if (response.data?.success && Array.isArray(response.data.data)) {
          setDepartments(response.data.data);
        } else if (Array.isArray(response.data)) {
          setDepartments(response.data);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setIsFetchingDepts(false);
      }
    }

    fetchDepartments();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const errors = validateForm(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      // POST /auth/signup
      await apiClient.post('/auth/signup', {
        name: fields.name.trim(),
        email: fields.email.trim(),
        password: fields.password,
        departmentId: fields.departmentId,
      });

      // Redirect to login page on success
      navigate('/login', { replace: true });
    } catch (err) {
      const apiMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        null;

      if (err?.response?.status === 400) {
        setServerError(apiMessage || 'Email already exists or invalid data.');
      } else if (!err?.response) {
        setServerError('Cannot reach the server. Please check your connection.');
      } else {
        setServerError(apiMessage || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600 mb-4">
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-white" aria-hidden="true">
              <rect x="3" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="11" y="3" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="3" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="11" y="11" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Register as an Employee
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-8 py-8">
          <form onSubmit={handleSubmit} noValidate aria-label="Registration form">
            <div className="space-y-5">
              
              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={fields.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    placeholder="John Doe"
                    className={[
                      'block w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 pl-9 outline-none',
                      'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150',
                      fieldErrors.name ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400',
                    ].join(' ')}
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                </div>
                {fieldErrors.name && (
                  <p id="name-error" className="text-xs text-red-600 mt-0.5">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={fields.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    placeholder="you@company.com"
                    className={[
                      'block w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 pl-9 outline-none',
                      'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150',
                      fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400',
                    ].join(' ')}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                </div>
                {fieldErrors.email && (
                  <p id="email-error" className="text-xs text-red-600 mt-0.5">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <PasswordInput
                  id="password"
                  label="Password"
                  value={fields.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  autoComplete="new-password"
                />
              </div>

              {/* Department Select */}
              <div className="space-y-1">
                <label htmlFor="departmentId" className="block text-sm font-medium text-slate-700">
                  Department
                </label>
                <div className="relative">
                  <select
                    id="departmentId"
                    name="departmentId"
                    value={fields.departmentId}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.departmentId)}
                    aria-describedby={fieldErrors.departmentId ? 'dept-error' : undefined}
                    className={[
                      'block w-full rounded-md border px-3 py-2 text-sm text-slate-900 pl-9 outline-none bg-white appearance-none pr-10',
                      'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150',
                      fieldErrors.departmentId ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400',
                    ].join(' ')}
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {isFetchingDepts && <p className="text-xs text-slate-500">Loading departments...</p>}
                {fieldErrors.departmentId && (
                  <p id="dept-error" className="text-xs text-red-600 mt-0.5">{fieldErrors.departmentId}</p>
                )}
              </div>

              {/* Server Error */}
              <div role="alert" aria-live="polite" aria-atomic="true">
                {serverError && (
                  <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>{serverError}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Registering…
                  </>
                ) : (
                  'Sign up'
                )}
              </button>
            </div>
          </form>

          {/* Redirect link to Login */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        {/* Footer microcopy */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Contact your administrator for account access.
        </p>
      </div>
    </div>
  );
}
