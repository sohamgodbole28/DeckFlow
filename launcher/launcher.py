import os
import sys
import time
import socket
import threading
import subprocess
import requests
import webbrowser
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk
import qrcode
import pystray
from pystray import MenuItem as item

# Paths
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
AGENT_DIR = os.path.join(ROOT_DIR, "desktop_agent")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
DIST_DIR = os.path.join(FRONTEND_DIR, "dist")

class DeckFlowLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("DeckFlow Launcher")
        self.root.geometry("400x650")
        self.root.resizable(False, False)
        self.root.protocol("WM_DELETE_WINDOW", self.hide_window)

        # State
        self.is_production = os.path.isdir(DIST_DIR)
        self.backend_process = None
        self.agent_process = None
        self.frontend_process = None
        self.local_ip = self.get_local_ip()
        
        self.backend_url = "http://127.0.0.1:8000"
        self.frontend_url = self.backend_url if self.is_production else "http://localhost:5173"
        self.controller_url = f"http://{self.local_ip}:{8000 if self.is_production else 5173}/controller"
        
        self.status = {
            "backend": "Starting...",
            "agent": "Waiting...",
            "frontend": "Waiting...",
            "error": None
        }

        self.setup_ui()
        self.setup_tray()
        
        # Start orchestration thread
        self.orchestration_thread = threading.Thread(target=self.startup_sequence, daemon=True)
        self.orchestration_thread.start()
        
        # UI Update loop
        self.update_ui()

    def get_local_ip(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    def setup_ui(self):
        self.main_frame = tk.Frame(self.root, bg="#18181b")
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # Header
        self.header = tk.Label(self.main_frame, text="DeckFlow", font=("Helvetica", 24, "bold"), bg="#18181b", fg="#ffffff")
        self.header.pack(pady=20)

        # Mode Indicator
        mode_text = "Production Mode" if self.is_production else "Development Mode"
        tk.Label(self.main_frame, text=mode_text, font=("Helvetica", 10), bg="#18181b", fg="#a1a1aa").pack()

        # Status Frame
        self.status_frame = tk.Frame(self.main_frame, bg="#27272a", bd=1, relief=tk.FLAT)
        self.status_frame.pack(fill=tk.X, padx=20, pady=20)
        
        self.lbl_backend = tk.Label(self.status_frame, text="Backend: Starting...", bg="#27272a", fg="#ffffff", anchor="w")
        self.lbl_backend.pack(fill=tk.X, padx=10, pady=5)
        
        self.lbl_agent = tk.Label(self.status_frame, text="Desktop Agent: Waiting...", bg="#27272a", fg="#ffffff", anchor="w")
        self.lbl_agent.pack(fill=tk.X, padx=10, pady=5)
        
        self.lbl_frontend = tk.Label(self.status_frame, text="Frontend: Waiting...", bg="#27272a", fg="#ffffff", anchor="w")
        self.lbl_frontend.pack(fill=tk.X, padx=10, pady=5)

        # QR Code Area
        self.qr_frame = tk.Frame(self.main_frame, bg="#18181b")
        self.qr_frame.pack(pady=10)
        self.qr_label = tk.Label(self.qr_frame, bg="#18181b")
        self.qr_label.pack()
        self.url_label = tk.Label(self.qr_frame, text="Controller URL will appear here", bg="#18181b", fg="#3b82f6", cursor="hand2")
        self.url_label.pack()
        self.url_label.bind("<Button-1>", lambda e: webbrowser.open(self.controller_url))

        # Buttons
        self.btn_frame = tk.Frame(self.main_frame, bg="#18181b")
        self.btn_frame.pack(fill=tk.X, padx=20, pady=20)
        
        tk.Button(self.btn_frame, text="Open Editor", command=self.open_editor, bg="#3b82f6", fg="white", relief=tk.FLAT, height=2).pack(fill=tk.X, pady=5)
        
        bottom_btns = tk.Frame(self.btn_frame, bg="#18181b")
        bottom_btns.pack(fill=tk.X, pady=5)
        tk.Button(bottom_btns, text="Restart Services", command=self.restart_services, bg="#3f3f46", fg="white", relief=tk.FLAT).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        tk.Button(bottom_btns, text="Stop DeckFlow", command=self.quit_app, bg="#ef4444", fg="white", relief=tk.FLAT).pack(side=tk.RIGHT, fill=tk.X, expand=True, padx=5)

    def setup_tray(self):
        # Create a simple icon image for the tray
        image = Image.new('RGB', (64, 64), color = (59, 130, 246))
        menu = pystray.Menu(
            item('Show Launcher', self.show_window),
            item('Open Editor', self.open_editor),
            item('Restart Services', self.restart_services),
            item('Exit', self.quit_app)
        )
        self.tray_icon = pystray.Icon("name", image, "DeckFlow Launcher", menu)
        # We start the tray in a background thread because it blocks
        threading.Thread(target=self.tray_icon.run, daemon=True).start()

    def hide_window(self):
        self.root.withdraw()

    def show_window(self, icon=None, item=None):
        self.root.after(0, self.root.deiconify)

    def open_editor(self, icon=None, item=None):
        webbrowser.open(f"{self.frontend_url}/editor")

    def update_ui(self):
        # Poll status dictionary and update labels
        if self.status["error"]:
            self.lbl_backend.config(fg="#ef4444")
            self.lbl_agent.config(fg="#ef4444")
            self.lbl_frontend.config(fg="#ef4444")
        else:
            self.lbl_backend.config(text=f"Backend: {self.status['backend']}", fg="#22c55e" if "Running" in self.status['backend'] else "#ffffff")
            self.lbl_agent.config(text=f"Desktop Agent: {self.status['agent']}", fg="#22c55e" if "Connected" in self.status['agent'] else "#ffffff")
            self.lbl_frontend.config(text=f"Frontend: {self.status['frontend']}", fg="#22c55e" if "Running" in self.status['frontend'] else "#ffffff")
            
        self.root.after(500, self.update_ui)

    def check_backend_health(self):
        try:
            res = requests.get(f"{self.backend_url}/health", timeout=2)
            if res.status_code == 200:
                return res.json()
        except:
            pass
        return None

    def check_frontend_health(self):
        try:
            res = requests.get(self.frontend_url, timeout=2)
            return res.status_code == 200
        except:
            return False

    def startup_sequence(self):
        try:
            self.status["error"] = None
            
            # Refresh IP and Controller URL in case network changed
            self.local_ip = self.get_local_ip()
            self.controller_url = f"http://{self.local_ip}:{8000 if self.is_production else 5173}/controller"
            
            # 1. Backend
            self.status["backend"] = "Checking..."
            health = self.check_backend_health()
            if health:
                self.status["backend"] = "Running (Reused)"
            else:
                self.status["backend"] = "Starting..."
                if os.name == 'nt':
                    python_exe = sys.executable.replace("pythonw.exe", "python.exe")
                    self.backend_process = subprocess.Popen([python_exe, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"], cwd=BACKEND_DIR)
                else:
                    self.backend_process = subprocess.Popen([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"], cwd=BACKEND_DIR)
                
                # Wait for healthy
                for _ in range(30):
                    time.sleep(1)
                    health = self.check_backend_health()
                    if health:
                        break
                
                if not health:
                    raise Exception("Backend failed to start or is unreachable.")
                self.status["backend"] = "Running"

            # 2. Desktop Agent
            self.status["agent"] = "Checking..."
            if health and health.get("agent_connected"):
                self.status["agent"] = "Connected (Reused)"
            else:
                self.status["agent"] = "Starting..."
                if os.name == 'nt':
                    python_exe = sys.executable.replace("pythonw.exe", "python.exe")
                    self.agent_process = subprocess.Popen([python_exe, "agent.py"], cwd=AGENT_DIR)
                else:
                    self.agent_process = subprocess.Popen([sys.executable, "agent.py"], cwd=AGENT_DIR)
                
                # Wait for connection
                connected = False
                for _ in range(30):
                    time.sleep(1)
                    h = self.check_backend_health()
                    if h and h.get("agent_connected"):
                        connected = True
                        break
                        
                if not connected:
                    raise Exception("Desktop agent failed to connect.")
                self.status["agent"] = "Connected"

            # 3. Frontend
            self.status["frontend"] = "Checking..."
            if self.is_production:
                # In prod, frontend is served by backend
                if self.check_frontend_health():
                    self.status["frontend"] = "Running (Served by Backend)"
                else:
                    raise Exception("Frontend static files not reachable.")
            else:
                if self.check_frontend_health():
                    self.status["frontend"] = "Running (Reused)"
                else:
                    self.status["frontend"] = "Starting..."
                    if os.name == 'nt':
                        self.frontend_process = subprocess.Popen(["npm", "run", "dev"], cwd=FRONTEND_DIR, shell=True)
                    else:
                        self.frontend_process = subprocess.Popen(["npm", "run", "dev"], cwd=FRONTEND_DIR)
                    
                    # Wait for frontend dev server
                    ready = False
                    for _ in range(60):
                        time.sleep(1)
                        if self.check_frontend_health():
                            ready = True
                            break
                    if not ready:
                        raise Exception("Frontend development server failed to start.")
                    self.status["frontend"] = "Running"

            # 4. Generate QR Code
            self.generate_qr_code()

        except Exception as e:
            err_msg = str(e)
            self.status["error"] = err_msg
            self.root.after(0, lambda msg=err_msg: messagebox.showerror("Startup Error", msg))

    def generate_qr_code(self):
        qr = qrcode.QRCode(version=1, box_size=5, border=2)
        qr.add_data(self.controller_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        self.qr_image = ImageTk.PhotoImage(img)
        self.root.after(0, self._update_qr_ui)

    def _update_qr_ui(self):
        self.qr_label.config(image=self.qr_image)
        self.url_label.config(text=self.controller_url)

    def restart_services(self, icon=None, item=None):
        self.root.after(0, self._restart_sequence)
        
    def _restart_sequence(self):
        self.status["backend"] = "Stopping..."
        self.status["agent"] = "Stopping..."
        self.status["frontend"] = "Stopping..."
        self.qr_label.config(image='')
        self.url_label.config(text="Restarting...")
        
        # Kill processes
        self.terminate_processes()
        import time
        time.sleep(2)  # Wait for ports to be freed
        
        # Restart
        self.orchestration_thread = threading.Thread(target=self.startup_sequence, daemon=True)
        self.orchestration_thread.start()

    def terminate_processes(self):
        # We try to terminate politely
        for p in [self.frontend_process, self.agent_process, self.backend_process]:
            if p:
                try:
                    # In windows shell=True uses cmd, so p.terminate kills cmd, not the child.
                    # We will use taskkill for robust cleanup on windows if needed, but p.terminate() is standard
                    if os.name == 'nt':
                        subprocess.run(['taskkill', '/F', '/T', '/PID', str(p.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    else:
                        p.terminate()
                except:
                    pass
        
        self.frontend_process = None
        self.agent_process = None
        self.backend_process = None

    def quit_app(self, icon=None, item=None):
        if hasattr(self, 'tray_icon') and self.tray_icon:
            self.tray_icon.stop()
        self.terminate_processes()
        self.root.destroy()
        sys.exit(0)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--hidden", action="store_true", help="Start the launcher hidden in the tray")
    args = parser.parse_args()

    root = tk.Tk()
    if args.hidden:
        root.withdraw()
    app = DeckFlowLauncher(root)
    root.mainloop()
