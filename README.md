# Aeron Systems - AI Engineer Intern Assignment

**Author:** Rishabh Zambre  
**Date:** April 2026  

This repository contains the completed deliverables for the Aeron Systems technical assignment, split into two distinct utilities: a full-stack Web Utility (Part 1) and a Python-based Data CLI Utility (Part 2).

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
