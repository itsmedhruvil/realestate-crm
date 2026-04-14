'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Generic data hook with built-in caching, deduplication, and revalidation
export function useData<T>(endpoint: string, options = {}) {
  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 300000, // 5 minutes cache
    keepPreviousData: true,
    ...options
  });

  return {
    data: data?.data as T,
    error,
    isLoading,
    mutate
  };
}

// Specific hooks for each data type
export function useLeads<T = any>() {
  return useData<T>('/api/leads');
}

export function useProperties<T = any>() {
  return useData<T>('/api/properties');
}

export function useClients<T = any>() {
  return useData<T>('/api/clients');
}

export function useTeam<T = any>() {
  return useData<T>('/api/team');
}

export function usePayments<T = any>() {
  return useData<T>('/api/payments');
}

export function useVisits<T = any>() {
  return useData<T>('/api/visits');
}

export function useActivities<T = any>() {
  return useData<T>('/api/activities');
}
