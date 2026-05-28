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

import type { AlertButton } from '@/components/ui/AppAlert';
import { useState } from 'react';

interface AlertConfig {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

export function useAlert() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({ title: '', buttons: [] });

  const showAlert = (alertConfig: AlertConfig) => {
    setConfig(alertConfig);
    setVisible(true);
  };

  const hideAlert = () => setVisible(false);

  const alertProps = {
    visible,
    title: config.title,
    message: config.message,
    buttons: config.buttons,
    onDismiss: hideAlert,
  };

  return { showAlert, hideAlert, alertProps };
}
