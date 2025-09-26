// Mock Supabase client for testing
export const createMockSupabaseClient = () => {
  const mockClient = {
    from: jest.fn((table: string) => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        })),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  }

  return mockClient
}

// Helper to setup table-specific mocks
export const setupTableMock = (client: any, table: string, responses: any) => {
  client.from.mockImplementation((tableName: string) => {
    if (tableName === table) {
      return responses
    }
    // Return default mock for other tables
    return {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        })),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    }
  })
}