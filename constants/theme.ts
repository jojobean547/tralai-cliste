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

export const Colors = {
  light: {
    // Backgrounds
    background:   '#F8F9FA',
    surface:      '#FFFFFF',
    surfaceAlt:   '#F0F8F4',

    // Borders
    border:       '#E5E7EB',
    borderStrong: '#0B5D3B',

    // Text
    textPrimary:   '#1A1C1E',
    textSecondary: '#6B7280',
    textInverse:   '#FFFFFF',

    // Brand
    primaryGreen:  '#0B5D3B',
    greenLight:    '#DCEFDE',
    greenMid:      '#2E7D32',

    // Accents
    accentPurple:  '#5C3DBA',
    accentGold:    '#F2B705',

    // Status
    success:       '#2E7D32',
    error:         '#D64545',
    errorBg:       '#FFF0F0',
    errorBorder:   '#F5C6C6',
    info:          '#2F9E44',
    infoBg:        '#E8F5E9',

    // Tab
    tabActive:     '#0B5D3B',
    tabInactive:   '#6B7280',
    tabBar:        '#FFFFFF',
    tabBorder:     '#E5E7EB',
  },

  dark: {
    // Backgrounds
    background:   '#0F1113',
    surface:      '#161A1D',
    surfaceAlt:   '#0F1A12',

    // Borders
    border:       '#2A2D31',
    borderStrong: '#1F7A4D',

    // Text
    textPrimary:   '#F8F9FA',
    textSecondary: '#A1A7AC',
    textInverse:   '#FFFFFF',

    // Brand
    primaryGreen:  '#0B5D3B',
    greenLight:    '#1F7A4D',
    greenMid:      '#1F7A4D',

    // Accents
    accentPurple:  '#5C3DBA',
    accentGold:    '#F2B705',

    // Status
    success:       '#1F7A4D',
    error:         '#D64545',
    errorBg:       '#2A1515',
    errorBorder:   '#3D1F1F',
    info:          '#1F7A4D',
    infoBg:        '#0F1A12',

    // Tab
    tabActive:     '#1F7A4D',
    tabInactive:   '#A1A7AC',
    tabBar:        '#0F1113',
    tabBorder:     '#2A2D31',
  },
} as const;

export const Typography = {
  // Font sizes — large for elderly users
  heading1:  28,
  heading2:  22,
  heading3:  18,
  body:      16,
  bodySmall: 14,
  caption:   12,
  tiny:      11,

  // Font weights
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
} as const;

export const Radii = {
  sm:   8,
  md:   12,
  lg:   16,
  pill: 24,
  full: 9999,
} as const;

export const TouchTargets = {
  // Minimum 56dp for elderly users (WCAG recommendation)
  minHeight: 56,
  minWidth:  56,
} as const;