// Mock Clerk hooks and components for testing
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-123',
  firstName: 'John',
  lastName: 'Doe',
  emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
  unsafeMetadata: {},
  update: jest.fn(),
  ...overrides,
})

export const mockUseUser = (user = null, isLoaded = true, isSignedIn = false) => ({
  user: user || (isSignedIn ? createMockUser() : null),
  isLoaded,
  isSignedIn,
})

// Helper to setup different authentication states
export const setupAuthState = (state: 'authenticated' | 'unauthenticated' | 'loading') => {
  const { useUser } = jest.requireMock('@clerk/nextjs')
  
  switch (state) {
    case 'authenticated':
      useUser.mockReturnValue(mockUseUser(createMockUser(), true, true))
      break
    case 'unauthenticated':
      useUser.mockReturnValue(mockUseUser(null, true, false))
      break
    case 'loading':
      useUser.mockReturnValue(mockUseUser(null, false, false))
      break
  }
}