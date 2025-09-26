import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      unsafeMetadata: {},
      update: jest.fn(),
    },
    isLoaded: true,
    isSignedIn: true,
  })),
  UserButton: ({ children }) => <div data-testid="user-button">{children}</div>,
  ClerkProvider: ({ children }) => <div>{children}</div>,
  SignInButton: ({ children }) => <div data-testid="sign-in-button">{children}</div>,
  SignUpButton: ({ children }) => <div data-testid="sign-up-button">{children}</div>,
}))

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        limit: jest.fn(() => ({ data: [], error: null })),
        order: jest.fn(() => ({ data: [], error: null })),
      })),
      limit: jest.fn(() => ({ data: [], error: null })),
      order: jest.fn(() => ({ data: [], error: null })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({ single: jest.fn(() => ({ data: null, error: null })) })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({ data: null, error: null })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({ data: null, error: null })),
    })),
  })),
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.CLERK_SECRET_KEY = 'sk_test_mock'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock_anon_key'

// Mock window.confirm and alert for tests
global.confirm = jest.fn(() => true)
global.alert = jest.fn()

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Setup for fake timers if needed
beforeEach(() => {
  jest.clearAllMocks()
})