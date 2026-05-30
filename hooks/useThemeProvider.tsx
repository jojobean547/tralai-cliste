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
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, getRadii, getSpacing, getTypography } from '@/constants/theme';

export type DisplayDensity = 'standard' | 'compact';

const DENSITY_KEY = '@tralai_density';

interface ThemeContextValue {
  colors: typeof Colors.light | typeof Colors.dark;
  isDark: boolean;
  density: DisplayDensity;
  setDensity: (d: DisplayDensity) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: Colors.light,
  isDark: false,
  density: 'standard',
  setDensity: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [density, setDensityState] = useState<DisplayDensity>('standard');

  useEffect(() => {
    AsyncStorage.getItem(DENSITY_KEY).then(value => {
      if (value === 'compact') {
        setDensityState('compact');
      } else {
        setDensityState('standard'); // 'system' legacy value falls back to 'standard'
      }
    });
  }, []);

  const setDensity = useCallback((d: DisplayDensity) => {
    setDensityState(d);
    AsyncStorage.setItem(DENSITY_KEY, d);
  }, []);

  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ colors, isDark, density, setDensity }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const { colors, isDark, density, setDensity } = useContext(ThemeContext);
  const scale = density === 'compact' ? 0.75 : 1.0;
  const typography = getTypography(scale);
  const spacing = getSpacing(scale);
  const radii = getRadii(scale);
  return { colors, isDark, density, setDensity, typography, spacing, radii };
}
