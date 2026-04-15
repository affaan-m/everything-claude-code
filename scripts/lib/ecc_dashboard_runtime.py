#!/usr/bin/env python3
"""
Runtime helpers for ecc_dashboard.py that do not depend on tkinter.
"""

from __future__ import annotations

import os
import platform
import subprocess
from typing import Optional, Tuple, Dict, List


def maximize_window(window) -> None:
    """Maximize the dashboard window using the safest supported method."""
    try:
        window.state('zoomed')
        return
    except Exception:
        pass

    system_name = platform.system()
    if system_name == 'Linux':
        try:
            window.attributes('-zoomed', True)
        except Exception:
            pass
    elif system_name == 'Darwin':
        try:
            window.attributes('-fullscreen', True)
        except Exception:
            pass


def build_terminal_launch(
    path: str,
    *,
    os_name: Optional[str] = None,
    system_name: Optional[str] = None,
) -> Tuple[List[str], Dict[str, object]]:
    """Return safe argv/kwargs for opening a terminal rooted at the requested path."""
    resolved_os_name = os_name or os.name
    resolved_system_name = system_name or platform.system()

    if resolved_os_name == 'nt':
        creationflags = getattr(subprocess, 'CREATE_NEW_CONSOLE', 0)
        return (
            ['cmd.exe', '/k', 'cd', '/d', path],
            {
                'cwd': path,
                'creationflags': creationflags,
            },
        )

    if resolved_system_name == 'Darwin':
        return (['open', '-a', 'Terminal', path], {})

    return (
        ['x-terminal-emulator', '-e', 'bash', '-lc', 'cd -- "$1"; exec bash', 'bash', path],
        {},
    )


def build_file_open_launch(
    path: str,
    *,
    os_name: Optional[str] = None,
    system_name: Optional[str] = None,
) -> Tuple[List[str], Dict[str, object]]:
    """Return safe argv/kwargs for opening an arbitrary file in the OS default handler.

    Mirrors the build_terminal_launch contract so dashboard callers can route every
    external launch through the same testable, injection-safe helper. The path is
    always passed as a separate argv entry, never interpolated into a shell string.

    Per-platform launcher choice:
      - Windows (``os.name == 'nt'``): ``start`` is a cmd.exe builtin, not a .exe,
        so ``Popen(['start', path])`` raises FileNotFoundError. We spawn cmd.exe
        and pass ``start "" <path>`` — the empty string is the window-title slot
        ``start`` requires whenever its first quoted argument is a path.
      - macOS (``platform.system() == 'Darwin'``): ``xdg-open`` does not ship; the
        native handler is ``open``.
      - Linux / other POSIX: ``xdg-open`` is the freedesktop standard.
    """
    resolved_os_name = os_name or os.name
    resolved_system_name = system_name or platform.system()

    if resolved_os_name == 'nt':
        return (['cmd.exe', '/c', 'start', '', path], {})

    if resolved_system_name == 'Darwin':
        return (['open', path], {})

    return (['xdg-open', path], {})
