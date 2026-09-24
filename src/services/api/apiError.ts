import axios from 'axios'

// Shape of the API's error responses (ProblemDetails from ExceptionHandlingMiddleware).
interface ApiProblem {
  title?: string
  status?: number
  errors?: Record<string, string[]> | null
}

// Turns any error thrown by apiClient into a message we can show to the user.
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!axios.isAxiosError<ApiProblem>(error)) return fallback

  if (!error.response) return 'Cannot reach the server. Check your internet connection.'

  const problem = error.response.data
  const firstFieldError = problem?.errors ? Object.values(problem.errors).flat()[0] : undefined

  return firstFieldError ?? problem?.title ?? fallback
}

// Validation errors per field, e.g. { Email: ["'Email' is not a valid email address."] }.
export function getFieldErrors(error: unknown): Record<string, string[]> {
  if (!axios.isAxiosError<ApiProblem>(error)) return {}
  return error.response?.data?.errors ?? {}
}