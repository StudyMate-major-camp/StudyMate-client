import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userLevelsApi } from '../api/userLevels'
import type { Level } from '../types'

const KEY = ['user-levels'] as const

export function useUserLevels() {
  return useQuery({
    queryKey: KEY,
    queryFn: userLevelsApi.list,
  })
}

export function useUpsertUserLevels() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (levels: { subject: string; level: Level }[]) =>
      userLevelsApi.upsert(levels),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteUserLevel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (subject: string) => userLevelsApi.remove(subject),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
