**Author:** Rishabh Zambre  
**Date:** April 2026  

This repository contains the completed deliverables, split into two distinct utilities: a full-stack Web Utility (Part 1) and a Python-based Data CLI Utility (Part 2).

---

## ⚙️ System Requirements & Prerequisites

The applications are designed to be cross-platform compatible (Windows x86 / Debian ARM). To run the utilities, the following must be installed on the host machine:

**Global Requirements:**
* **Git:** For cloning the repository.
* **Operating System:** Windows, Linux (Debian/Ubuntu), or macOS.

**For Part 1 (Web Utility):**
* **Primary (Recommended):** Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux).
* **Fallback (Native Build):** Node.js (v20.19+ or 22.12+) and `npm`.

**For Part 2 (Data Utility):**
* **Python:** Python 3.8 or higher.
* **Package Manager:** `pip` (to install `pandas` and `matplotlib`).

---
## 📥 Getting Started

To evaluate this assignment, first clone the repository to your local machine:


1. git clone https://github.com/WarLord7821/aeron-assignment.git
2. cd aeron-assignment

---

## 🚀 Part 1: The Web Utility (File Upload Portal)

A modern, full-stack web application designed to securely handle, validate, and preview file uploads.

### **Tech Stack**
* **Frontend:** React (Vite), Tailwind CSS, Lucide-React, React-Hot-Toast
* **Backend:** Node.js, Express, Multer
* **Database:** Local JSON File (`metadata.json`)
* **Infrastructure:** Docker & Docker Compose

### **Key Features**
* **Modern UI/UX:** Fully responsive Tailwind CSS dashboard with a drag-and-drop file upload zone.
* **Strict Validation:** Backend enforces a 5MB size limit and strictly accepts only `.log`, `.pdf`, `.csv`, and `.zip` extensions.
* **Interactive Dashboard:** Uploaded files are displayed in a clean data table with their associated metadata (Date, Description, Uploader).
* **Live Document Preview:** Users can preview `.pdf`, `.csv`, and `.log` files directly in the browser via a custom modal before downloading.
* **Graceful Error Handling:** Integrated toast notifications for clean success/failure feedback.

### **Installation & Execution**

**Method A: Docker (Recommended)**
The fastest way to spin up the entire application stack.
1. Open Docker Desktop, ensure Docker Engine is running and ready to use. (small text at bottom left)
2. Navigate to the web utility directory: `cd part1-web-utility`
3. Build and start the containers: `docker-compose up --build`
4. Open `http://localhost:5173` in your browser.

**Method B: Native Build (Fallback-if Docker not avaliable)**
If Docker is unavailable on the host machine.
1. **Start the Backend:**
   * `cd part1-web-utility`
   * `npm install`
   * `node server.js`
2. **Start the Frontend (in a new terminal):**
   * `cd part1-web-utility/frontend`
   * `npm install`
   * `npm run dev`
3. Open the provided localhost URL in your browser.

---

## 📊 Part 2: The Data Utility (Python CSV Plotter)

A robust, terminal-based Python script that ingests CSV data and generates customizable data visualizations.

### **Tech Stack**
* **Language:** Python 3.x
* **Libraries:** `pandas`, `matplotlib`, `tkinter`

### **Key Features**
* **Dual Ingestion Engine:** Users can select a local file using a native OS GUI (`tkinter` file dialog) OR paste a URL to ingest a cloud-hosted CSV directly.
* **Automated Data Cleaning:** The script scans for `NaN` (missing) values upon ingestion and prompts the user to either drop the corrupted rows or fill them with zeros before plotting.
* **Dynamic Plotting:** Users map their chosen CSV columns to X and Y axes and select between Line or Bar charts dynamically.

### **Installation & Execution**
1. Navigate to the data utility directory: `cd part2-data-utility`
2. Install the required data science libraries: `pip install -r requirements.txt`
3. Run the script: `python plotter.py`
4. Follow the terminal prompts to ingest data and generate your graphs.

---
## 🤖 AI Collaboration & Prompt Engineering

This project was developed with the assistance of **Gemini Advanced (Pro Model)** acting as a pair-programming architect. 

### **Manual Engineering & Overrides**
While the AI generated the boilerplate code, several critical manual interventions and architectural decisions were made to ensure production readiness:
1. **Docker Node Versioning:** Manually upgraded the frontend Dockerfile base image from `node:18-alpine` to `node:20-alpine` to resolve Vite compatibility restrictions.
2. **Ghost Container Debugging:** Manually purged corrupted Docker Compose metadata (`ContainerConfig` errors) caused by legacy Ubuntu Docker installations on the AWS EC2 test server.
3. **Network & CORS Configuration:** Manually configured AWS EC2 Security Groups (opening ports 5173 and 3000) and updated the React `.env` and Express `cors()` policies to allow public IPv4 fetching instead of defaulting to `localhost`.

---
### **Core Prompts Used**
*(Note: The complete, unedited conversation transcript is attached to my submission email as `AI_Prompt_Log_RishabhZambre.pdf`).*

**Prompt 1: Full-Stack Architecture (Part 1)**
> "Act as a Senior Full-Stack Developer. I need a Node.js/Express backend and a React (Vite) frontend with Tailwind CSS. The app must accept file uploads (.log, .pdf, .csv, .zip) via multer, save metadata (Date, Description, Uploader Name) to a local `metadata.json`, and display the uploaded files in a modern dashboard table with a download button."

**Prompt 2: Advanced UI/UX & Validation (Part 1)**
> "Upgrade my React/Node Portal. Add a 5MB size limit to the backend returning a clean 400 error. On the frontend, replace the file input with a Drag-and-Drop zone, use `react-hot-toast` for error/success popups, and create a Document Preview Modal so users can view `.pdf`, `.csv`, and `.log` files directly in the browser via a new `GET /preview/:filename` endpoint."

**Prompt 3: Python Data Utility (Part 2)**
> "Act as an expert Python developer. Write a CLI script using pandas and matplotlib. It must ask the user to either (1) select a local CSV via tkinter or (2) paste a URL to a web-hosted CSV. Once loaded, automatically scan for NaN values and prompt the user to drop or fill them. Finally, let the user map columns to X and Y axes and generate a Line or Bar chart."
5. **Git Authentication:** Bypassed GitHub's deprecated password authentication by generating and injecting a Personal Access Token (PAT) for remote server cloning.
