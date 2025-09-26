import {
  ensureUserProfile,
  loadFromSupabase,
  saveHourEntry,
  updateHourEntry,
  deleteHourEntry,
  saveOutOfOfficeEntry,
  deleteOutOfOfficeEntry,
  loadOutOfOfficeData,
} from '@/lib/utils/supabaseData'
import { createMockSupabaseClient } from '../../__mocks__/supabase'
import { 
  mockPsychotherapyEntry,
  mockSupervisionEntry,
  mockOutOfOfficeEntry,
  mockDatabaseResponses,
  mockErrors,
} from '../../__fixtures__/testData'

describe('supabaseData', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    jest.clearAllMocks()
  })

  describe('ensureUserProfile', () => {
    it('should return existing user profile ID when user exists', async () => {
      const mockProfileData = { id: 'existing-user-id' }
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [mockProfileData],
              error: null,
            }),
          }),
        }),
      })

      const result = await ensureUserProfile(mockSupabase, 'clerk-user-123')

      expect(result).toBe('existing-user-id')
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
    })

    it('should create new user profile when user does not exist', async () => {
      // Mock empty select result
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      })

      // Mock successful insert
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'new-user-id' },
              error: null,
            }),
          }),
        }),
      })

      const result = await ensureUserProfile(mockSupabase, 'new-clerk-user')

      expect(result).toBe('new-user-id')
    })

    it('should handle database errors during user lookup', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: mockErrors.networkError,
            }),
          }),
        }),
      })

      await expect(ensureUserProfile(mockSupabase, 'clerk-user-123'))
        .rejects.toThrow('Network connection failed')
    })

    it('should handle database errors during user creation', async () => {
      // Mock empty select result
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      })

      // Mock failed insert
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockErrors.networkError,
            }),
          }),
        }),
      })

      await expect(ensureUserProfile(mockSupabase, 'new-clerk-user'))
        .rejects.toThrow('Network connection failed')
    })
  })

  describe('saveHourEntry', () => {
    beforeEach(() => {
      // Mock ensureUserProfile to return a user ID
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })
    })

    it('should save hour entry successfully when date is not OOO', async () => {
      // Mock OOO check (no OOO entries)
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'out_of_office') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'hour_entries') {
          return {
            insert: jest.fn().mockResolvedValue({
              data: mockDatabaseResponses.successfulInsert.data,
              error: null,
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })

      await expect(
        saveHourEntry(mockSupabase, 'clerk-user-123', '2024-01-15', mockPsychotherapyEntry)
      ).resolves.not.toThrow()
    })

    it('should prevent saving when date is marked as out of office', async () => {
      // Mock OOO check (has OOO entry)
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'out_of_office') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [{ id: 'ooo-entry-1' }],
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })

      await expect(
        saveHourEntry(mockSupabase, 'clerk-user-123', '2024-01-25', mockPsychotherapyEntry)
      ).rejects.toThrow('Cannot add hours to a day marked as out of office')
    })

    it('should handle database errors during save', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'out_of_office') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'hour_entries') {
          return {
            insert: jest.fn().mockResolvedValue({
              data: null,
              error: mockErrors.networkError,
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })

      await expect(
        saveHourEntry(mockSupabase, 'clerk-user-123', '2024-01-15', mockPsychotherapyEntry)
      ).rejects.toThrow('Network connection failed')
    })
  })

  describe('updateHourEntry', () => {
    beforeEach(() => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })
    })

    it('should update existing hour entry successfully', async () => {
      const oldEntry = mockPsychotherapyEntry
      const newEntry = { ...mockPsychotherapyEntry, hours: 3.0 }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'hour_entries') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({
                          data: [{ id: 'entry-123' }],
                          error: null,
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })

      await expect(
        updateHourEntry(mockSupabase, 'clerk-user-123', '2024-01-15', oldEntry, newEntry)
      ).resolves.not.toThrow()
    })

    it('should handle entry not found error', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'hour_entries') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({
                          data: [], // No matching entry found
                          error: null,
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })

      await expect(
        updateHourEntry(mockSupabase, 'clerk-user-123', '2024-01-15', mockPsychotherapyEntry, mockPsychotherapyEntry)
      ).rejects.toThrow('Entry not found for update')
    })
  })

  describe('deleteHourEntry', () => {
    beforeEach(() => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })
    })

    it('should delete hour entry successfully', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'hour_entries') {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({
                          data: null,
                          error: null,
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })

      await expect(
        deleteHourEntry(mockSupabase, 'clerk-user-123', '2024-01-15', mockPsychotherapyEntry)
      ).resolves.not.toThrow()
    })

    it('should handle database errors during delete', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'hour_entries') {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                      eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({
                          data: null,
                          error: mockErrors.networkError,
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })

      await expect(
        deleteHourEntry(mockSupabase, 'clerk-user-123', '2024-01-15', mockPsychotherapyEntry)
      ).rejects.toThrow('Network connection failed')
    })
  })

  describe('Out of Office operations', () => {
    beforeEach(() => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })
    })

    describe('saveOutOfOfficeEntry', () => {
      it('should save OOO entry when no hours exist for the date', async () => {
        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'user_profiles') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [{ id: 'user-123' }],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'hour_entries') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue({
                      data: [], // No existing hours
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          if (table === 'out_of_office') {
            return {
              insert: jest.fn().mockResolvedValue({
                data: mockDatabaseResponses.successfulInsert.data,
                error: null,
              }),
            }
          }
          return createMockSupabaseClient().from(table)
        })

        await expect(
          saveOutOfOfficeEntry(mockSupabase, 'clerk-user-123', mockOutOfOfficeEntry)
        ).resolves.not.toThrow()
      })

      it('should prevent saving OOO when hours already exist for the date', async () => {
        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'user_profiles') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [{ id: 'user-123' }],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'hour_entries') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue({
                      data: [{ id: 'existing-hour-entry' }], // Hours exist
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          return createMockSupabaseClient().from(table)
        })

        await expect(
          saveOutOfOfficeEntry(mockSupabase, 'clerk-user-123', mockOutOfOfficeEntry)
        ).rejects.toThrow('Cannot mark day as out of office when hours are already logged')
      })
    })

    describe('deleteOutOfOfficeEntry', () => {
      it('should delete OOO entry successfully', async () => {
        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'user_profiles') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [{ id: 'user-123' }],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'out_of_office') {
            return {
              delete: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }
          }
          return createMockSupabaseClient().from(table)
        })

        await expect(
          deleteOutOfOfficeEntry(mockSupabase, 'clerk-user-123', '2024-01-25')
        ).resolves.not.toThrow()
      })
    })

    describe('loadOutOfOfficeData', () => {
      it('should load OOO data successfully', async () => {
        const mockOOOData = [
          {
            id: 1,
            user_id: 'user-123',
            date: '2024-01-25',
            reason: 'OoO',
            notes: 'Vacation',
            created_at: '2024-01-24T12:00:00Z',
            updated_at: '2024-01-24T12:00:00Z',
          },
        ]

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'user_profiles') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [{ id: 'user-123' }],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'out_of_office') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: mockOOOData,
                  error: null,
                }),
              }),
            }
          }
          return createMockSupabaseClient().from(table)
        })

        const result = await loadOutOfOfficeData(mockSupabase, 'clerk-user-123')

        expect(result).toHaveProperty('2024-01-25')
        expect(result['2024-01-25']).toMatchObject({
          id: 1,
          date: '2024-01-25',
          reason: 'OoO',
          notes: 'Vacation',
        })
      })

      it('should handle empty OOO data', async () => {
        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'user_profiles') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [{ id: 'user-123' }],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'out_of_office') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }
          }
          return createMockSupabaseClient().from(table)
        })

        const result = await loadOutOfOfficeData(mockSupabase, 'clerk-user-123')

        expect(result).toEqual({})
      })
    })
  })

  describe('loadFromSupabase', () => {
    it('should load complete user data successfully', async () => {
      const mockHourEntries = [
        {
          id: 'entry-1',
          user_id: 'user-123',
          entry_date: '2024-01-15',
          type: 'session',
          subtype: 'individual',
          hours: 2.5,
          notes: 'Individual session',
          reviewed_audio: false,
          reviewed_video: false,
          timestamp: '2024-01-15T10:00:00Z',
          ce_category: null,
          delivery_format: null,
        },
        {
          id: 'entry-2',
          user_id: 'user-123',
          entry_date: '2024-01-15',
          type: 'supervision',
          subtype: 'individual',
          hours: 1.0,
          notes: 'Supervision with video',
          reviewed_audio: false,
          reviewed_video: true,
          timestamp: '2024-01-15T15:00:00Z',
          ce_category: null,
          delivery_format: null,
        },
      ]

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { preferences: { selectedDate: '2024-01-15' } },
                  error: null,
                }),
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'user-123' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'hour_entries') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockHourEntries,
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'out_of_office') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })

      const result = await loadFromSupabase(mockSupabase, 'clerk-user-123')

      expect(result).toHaveProperty('entries')
      expect(result).toHaveProperty('outOfOfficeData')
      expect(result).toHaveProperty('supervisionHours')
      expect(result.entries['2024-01-15']).toHaveLength(2)
      expect(result.supervisionHours?.total).toBe(1.0) // Only supervision entry
      expect(result.supervisionHours?.videoAudio).toBe(1.0) // Has video review
    })

    it('should handle errors gracefully and return empty data', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: null,
                  error: mockErrors.networkError,
                }),
              }),
            }),
          }
        }
        return createMockSupabaseClient().from(table)
      })

      const result = await loadFromSupabase(mockSupabase, 'clerk-user-123')

      expect(result).toEqual({
        entries: {},
        outOfOfficeData: {},
      })
    })
  })
})