import { Keyboard, MousePointerClick, Play, SkipForward, SkipBack, Volume2, Volume1, VolumeX, Monitor, PowerOff, Moon, Terminal, Globe, File, Folder, Clock, SquareTerminal } from 'lucide-react';
import ActionFormKeyboard from './forms/ActionFormKeyboard';
import ActionFormLaunchApp from './forms/ActionFormLaunchApp';
import ActionFormWebsite from './forms/ActionFormWebsite';
import ActionFormCommand from './forms/ActionFormCommand';
import ActionFormPython from './forms/ActionFormPython';
import ActionFormFile from './forms/ActionFormFile';
import ActionFormFolder from './forms/ActionFormFolder';
import ActionFormDelay from './forms/ActionFormDelay';

export interface ActionMetadata {
  id: string;
  label: string;
  category: string;
  icon: any;
  description: string;
  defaultConfig: any;
  component?: React.ComponentType<any>;
  keywords: string[];
  isQuickAction?: boolean;
}

export const ACTION_CATEGORIES = [
  'Applications', 'Keyboard', 'Mouse', 'Media', 'System', 'Terminal', 'Web', 'Files & Folders', 'Utilities'
];

export const ACTION_REGISTRY: ActionMetadata[] = [
  {
    id: 'KEYBOARD_SHORTCUT',
    label: 'Keyboard Shortcut',
    category: 'Keyboard',
    icon: Keyboard,
    description: 'Simulate pressing a combination of keys.',
    defaultConfig: { ctrl: false, shift: false, alt: false, win: false, key: '' },
    component: ActionFormKeyboard,
    keywords: ['keys', 'press', 'macro', 'type', 'shortcut'],
    isQuickAction: true
  },
  {
    id: 'LAUNCH_APPLICATION',
    label: 'Launch Application',
    category: 'Applications',
    icon: Monitor,
    description: 'Start an application or executable.',
    defaultConfig: { target: '', arguments: '', cwd: '', runAsAdmin: false },
    component: ActionFormLaunchApp,
    keywords: ['exe', 'program', 'start', 'run', 'app'],
    isQuickAction: true
  },
  {
    id: 'OPEN_WEBSITE',
    label: 'Open Website',
    category: 'Web',
    icon: Globe,
    description: 'Open a URL in your default or preferred browser.',
    defaultConfig: { target: '', browser: 'default' },
    component: ActionFormWebsite,
    keywords: ['url', 'http', 'https', 'browser', 'chrome', 'link', 'site'],
    isQuickAction: true
  },
  {
    id: 'RUN_COMMAND',
    label: 'Run Command',
    category: 'Terminal',
    icon: Terminal,
    description: 'Execute a command in CMD or PowerShell.',
    defaultConfig: { shell: 'cmd', command: '', cwd: '' },
    component: ActionFormCommand,
    keywords: ['cmd', 'powershell', 'cli', 'batch', 'script', 'shell'],
    isQuickAction: true
  },
  {
    id: 'RUN_PYTHON_SCRIPT',
    label: 'Run Python Script',
    category: 'Terminal',
    icon: SquareTerminal,
    description: 'Execute a local Python (.py) script.',
    defaultConfig: { command: '', cwd: '' },
    component: ActionFormPython,
    keywords: ['python', 'py', 'script', 'code']
  },
  {
    id: 'OPEN_FILE',
    label: 'Open File',
    category: 'Files & Folders',
    icon: File,
    description: 'Open a specific document or file with its default application.',
    defaultConfig: { target: '' },
    component: ActionFormFile,
    keywords: ['document', 'pdf', 'txt', 'open']
  },
  {
    id: 'OPEN_FOLDER',
    label: 'Open Folder',
    category: 'Files & Folders',
    icon: Folder,
    description: 'Open a directory in File Explorer.',
    defaultConfig: { target: '' },
    component: ActionFormFolder,
    keywords: ['directory', 'explorer', 'path']
  },
  {
    id: 'DELAY',
    label: 'Delay',
    category: 'Utilities',
    icon: Clock,
    description: 'Pause execution for a specific number of milliseconds.',
    defaultConfig: { duration_ms: 500 },
    component: ActionFormDelay,
    keywords: ['wait', 'sleep', 'pause', 'timer', 'timeout']
  },

  // Media Actions (No config needed)
  {
    id: 'MEDIA_KEYS:play_pause',
    label: 'Play / Pause',
    category: 'Media',
    icon: Play,
    description: 'Toggle media playback.',
    defaultConfig: { key: 'play_pause' },
    keywords: ['music', 'video', 'spotify', 'toggle']
  },
  {
    id: 'MEDIA_KEYS:next_track',
    label: 'Next Track',
    category: 'Media',
    icon: SkipForward,
    description: 'Skip to the next media track.',
    defaultConfig: { key: 'next_track' },
    keywords: ['skip', 'forward']
  },
  {
    id: 'MEDIA_KEYS:prev_track',
    label: 'Previous Track',
    category: 'Media',
    icon: SkipBack,
    description: 'Go back to the previous media track.',
    defaultConfig: { key: 'prev_track' },
    keywords: ['back', 'rewind']
  },
  {
    id: 'VOLUME_CONTROLS:volume_up',
    label: 'Volume Up',
    category: 'Media',
    icon: Volume2,
    description: 'Increase system volume.',
    defaultConfig: { key: 'volume_up' },
    keywords: ['sound', 'loud', 'audio', 'increase'],
    isQuickAction: true
  },
  {
    id: 'VOLUME_CONTROLS:volume_down',
    label: 'Volume Down',
    category: 'Media',
    icon: Volume1,
    description: 'Decrease system volume.',
    defaultConfig: { key: 'volume_down' },
    keywords: ['sound', 'quiet', 'audio', 'decrease'],
    isQuickAction: true
  },
  {
    id: 'VOLUME_CONTROLS:volume_mute',
    label: 'Mute',
    category: 'Media',
    icon: VolumeX,
    description: 'Toggle system volume mute.',
    defaultConfig: { key: 'volume_mute' },
    keywords: ['sound', 'silence', 'audio', 'mute', 'unmute'],
    isQuickAction: true
  },

  // Mouse Actions
  {
    id: 'MOUSE_CLICK:left',
    label: 'Left Click',
    category: 'Mouse',
    icon: MousePointerClick,
    description: 'Simulate a left mouse click.',
    defaultConfig: { button: 'left' },
    keywords: ['click', 'press', 'lmb']
  },
  {
    id: 'MOUSE_CLICK:right',
    label: 'Right Click',
    category: 'Mouse',
    icon: MousePointerClick,
    description: 'Simulate a right mouse click.',
    defaultConfig: { button: 'right' },
    keywords: ['click', 'press', 'rmb']
  },
  {
    id: 'MOUSE_CLICK:double',
    label: 'Double Click',
    category: 'Mouse',
    icon: MousePointerClick,
    description: 'Simulate a double mouse click.',
    defaultConfig: { button: 'double' },
    keywords: ['click', 'press', 'twice']
  },

  // System Actions
  {
    id: 'SYSTEM_CONTROL:lock',
    label: 'Lock PC',
    category: 'System',
    icon: Monitor,
    description: 'Lock your Windows session.',
    defaultConfig: { command: 'lock' },
    keywords: ['secure', 'screen', 'win+l'],
    isQuickAction: true
  },
  {
    id: 'SYSTEM_CONTROL:sleep',
    label: 'Sleep',
    category: 'System',
    icon: Moon,
    description: 'Put your computer to sleep.',
    defaultConfig: { command: 'sleep' },
    keywords: ['standby', 'suspend']
  },
  {
    id: 'SYSTEM_CONTROL:restart',
    label: 'Restart',
    category: 'System',
    icon: PowerOff,
    description: 'Restart your computer.',
    defaultConfig: { command: 'restart' },
    keywords: ['reboot', 'power'],
    isQuickAction: true
  },
  {
    id: 'SYSTEM_CONTROL:shutdown',
    label: 'Shutdown',
    category: 'System',
    icon: PowerOff,
    description: 'Turn off your computer.',
    defaultConfig: { command: 'shutdown' },
    keywords: ['power', 'off', 'turn', 'close'],
    isQuickAction: true
  }
];
