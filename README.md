# DeckFlow

DeckFlow is a local, browser-based Stream Deck replacement. It allows any phone, tablet, or browser to control a Windows PC over the local network with zero reliance on cloud services.

## Features
- **Local & Private**: Everything runs on your local network. No cloud connection required.
- **Customizable Grid**: Add buttons, assign emojis, labels, and customize colors.
- **Actions Engine**: Trigger keyboard shortcuts, open apps, execute system commands, control media, and more.
- **Secure**: Approve or deny external devices easily.

## Installation (Windows)

Before starting, you must manually install Python and Node.js. They are not installed automatically.

### Prerequisites
The easiest way to install Python and Node.js on Windows is to run the included script:
1. Double-click the **`install_prerequisites.bat`** file in this folder. 
2. It will automatically download and install Python and Node.js using Windows Package Manager (`winget`).
3. **IMPORTANT**: After it finishes, close any open terminal windows and open a new one so your system recognizes the new tools.

*(Alternatively, you can manually download [Python 3.10+](https://www.python.org/downloads/) and [Node.js 18+](https://nodejs.org/en/download/)).*

### Step 1: Install Dependencies
Open a Command Prompt or PowerShell and install the requirements for each component:

1. **Backend**
   ```cmd
   cd backend
   pip install -r requirements.txt
   ```
2. **Desktop Agent**
   ```cmd
   cd desktop_agent
   pip install -r requirements.txt
   ```
3. **Frontend**
   ```cmd
   cd frontend
   npm install
   npm run build
   ```
4. **Launcher**
   ```cmd
   cd launcher
   pip install -r requirements.txt
   ```

### Step 2: Run DeckFlow
The simplest way to run DeckFlow is using the unified Launcher, which orchestrates all the components and provides a system tray icon.

```cmd
cd launcher
python launcher.py
```
*Tip: You can also use the `Start DeckFlow` shortcut in the main folder to launch it easily.*

## Getting Started

### 1. Creating Profiles and Pages
1. Open the Editor (`http://localhost:5173/editor`) on your PC.
2. Click the `+` icon next to **Profiles** to create a new profile (e.g., "Gaming" or "Coding").
3. Click the `+` icon next to **Pages** to add a new page.

### 2. Creating Buttons & Assigning Actions
1. Click on any empty `+` slot in the Grid Editor to create a button.
2. Edit its properties in the right sidebar (Label, Emoji, Colors).
3. Click **Add Command Action** to assign a system action.
4. Drag and drop buttons across the grid to rearrange them.

### 3. Pairing Your Phone or Tablet
To maintain security, remote devices must be explicitly approved.
1. Make sure your phone is connected to the same Wi-Fi network as your PC.
2. Open the Controller on your phone by navigating to the PC's local network IP address (e.g., `http://192.168.1.100:5173/controller`). You can find the exact link or scan a QR code by right-clicking the DeckFlow icon in your system tray.
3. Your phone will generate a Device ID and wait for approval.
4. Open the Editor on your Desktop (`http://localhost:5173/settings`).
5. In the Settings tab, under Device Management, locate your phone's Device ID and click **Approve This Device**.

## Supported Actions
- **Keyboard Shortcut**: Emulate keystrokes (e.g., `Ctrl+C`, `Media Play/Pause`).
- **Mouse Click**: Left, Right, Double-click, or Move.
- **Launch Application**: Open files, folders, or executables.
- **Open Website**: Open a URL in your default browser.
- **Run Command/PowerShell**: Execute shell or PowerShell scripts.
- **System Controls**: Sleep, Restart, Shutdown, Lock PC.
- **HTTP Request**: Send requests to external APIs or smart home devices.

## Troubleshooting
- **Controller endlessly loads**: Ensure both devices are on the same Wi-Fi network and you are accessing the PC's correct local IP address.
- **Buttons don't execute actions**: Ensure the device is approved in the Settings tab.
