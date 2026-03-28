import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAddFavorite,
  useGetFavorites,
  useRemoveFavorite,
} from '@/network/hooks/file';

export function useFavorites() {
  const queryClient = useQueryClient();
  const { data } = useGetFavorites();
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();
  const favoriteUUIDs = data?.data?.data ?? [];

  const isFavorite = useCallback(
    (fileUUID: string): boolean => favoriteUUIDs.includes(fileUUID),
    [favoriteUUIDs]
  );

  const addFavorite = useCallback(
    async (fileUUID: string): Promise<void> => {
      await addFavoriteMutation.mutateAsync({ UUID: fileUUID });
      await queryClient.invalidateQueries({ queryKey: ['file', 'favorite'] });
    },
    [addFavoriteMutation, queryClient]
  );

  const removeFavorite = useCallback(
    async (fileUUID: string): Promise<void> => {
      await removeFavoriteMutation.mutateAsync({ UUID: fileUUID });
      await queryClient.invalidateQueries({ queryKey: ['file', 'favorite'] });
    },
    [queryClient, removeFavoriteMutation]
  );

  const toggleFavorite = useCallback(
    async (fileUUID: string): Promise<boolean> => {
      const alreadyFavorite = favoriteUUIDs.includes(fileUUID);

      if (alreadyFavorite) {
        await removeFavorite(fileUUID);
        return false;
      }

      await addFavorite(fileUUID);
      return true;
    },
    [addFavorite, favoriteUUIDs, removeFavorite]
  );

  return {
    favoriteIds: favoriteUUIDs,
    favoriteUUIDs,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
  };
}
