// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Tralaí Cliste — Irish community grocery price comparison app
// Copyright (C) 2026 Tralaí Cliste Contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type ClubCard = {
  id: string;
  name: string;
  store: string;
};

export const AVAILABLE_CLUB_CARDS: ClubCard[] = [
  { id: 'tesco_clubcard', name: 'Tesco Clubcard', store: 'Tesco' },
  { id: 'real_rewards',   name: 'Real Rewards',   store: 'SuperValu' },
  { id: 'lidl_plus',      name: 'Lidl Plus',       store: 'Lidl' },
  { id: 'valueclub',      name: 'VALUEclub',       store: 'Dunnes Stores' },
];

const STORAGE_KEY = '@tralai_club_cards';

type UserPreferencesContextType = {
  userClubCards: string[];
  availableClubCards: ClubCard[];
  toggleClubCard: (id: string) => void;
  hasClubCard: (cardName: string) => boolean;
  isLoading: boolean;
};

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [userClubCards, setUserClubCards] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => { if (raw) setUserClubCards(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const toggleClubCard = useCallback((id: string) => {
    setUserClubCards(prev => {
      const updated = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const hasClubCard = useCallback(
    (cardName: string): boolean =>
      AVAILABLE_CLUB_CARDS.some(c => c.name === cardName && userClubCards.includes(c.id)),
    [userClubCards]
  );

  return (
    <UserPreferencesContext.Provider value={{
      userClubCards,
      availableClubCards: AVAILABLE_CLUB_CARDS,
      toggleClubCard,
      hasClubCard,
      isLoading,
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  return ctx;
}
