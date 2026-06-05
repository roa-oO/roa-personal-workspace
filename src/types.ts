/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface ShortcutItem {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export type TimerMode = 'focus' | 'break';

export interface TimerState {
  mode: TimerMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  completedSessions: number;
  lastUpdatedDate: string; // YYYY-MM-DD
}
