const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Paths
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const METADATA_FILE = path.join(__dirname, 'metadata.json');

// --- Initialization ---

// Ensure the /uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure the metadata.json file exists
if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify([]));
}

// Helper function to read metadata
const readMetadata = () => {
    try {
        const data = fs.readFileSync(METADATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading metadata:", err);
        return [];
    }
};

// Helper function to write metadata
const writeMetadata = (data) => {
    try {
        fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing metadata:", err);
    }
};

// --- Multer Configuration ---

// Configure storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // Append a timestamp to the original filename to prevent overwriting
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

// Configure file filter (restrict to .log, .pdf, .csv, .zip)
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.log', '.pdf', '.csv', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only .log, .pdf, .csv, and .zip are allowed.'), false); // Reject
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});

// --- API Endpoints ---

/**
 * POST /upload
 * Accepts a single file and text fields (logDate, description, uploaderName)
 */
app.post('/upload', (req, res) => {
    // Handle the upload manually to catch the fileFilter error cleanly
    const uploadHandler = upload.single('file');

    uploadHandler(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading (e.g., file too large if limits were set)
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // An unknown error occurred, or our fileFilter threw an error
            return res.status(400).json({ error: err.message });
        }

        // Check if file was actually provided
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // Extract text fields
        const { logDate, description, uploaderName } = req.body;

        // Construct metadata object
        const newEntry = {
            id: Date.now().toString(),
            originalName: req.file.originalname,
            savedName: req.file.filename,
            size: req.file.size,
            logDate: logDate || '',
            description: description || '',
            uploaderName: uploaderName || '',
            uploadTimestamp: new Date().toISOString()
        };

        // Save to database (metadata.json)
        const metadata = readMetadata();
        metadata.push(newEntry);
        writeMetadata(metadata);

        res.status(201).json({
            message: 'File uploaded successfully!',
            file: newEntry
        });
    });
});

/**
 * GET /files
 * Returns the list of all uploaded files from metadata.json
 */
app.get('/files', (req, res) => {
    const metadata = readMetadata();
    res.json(metadata);
});

/**
 * GET /download/:filename
 * Downloads a specific file from the /uploads directory
 */
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOADS_DIR, filename);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(UPLOADS_DIR)) {
        return res.status(403).json({ error: 'Access denied.' });
    }

    if (fs.existsSync(filePath)) {
        res.download(filePath, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to download the file.' });
                }
            }
        });
    } else {
        res.status(404).json({ error: 'File not found.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Uploads directory: ${UPLOADS_DIR}`);
    console.log(`Metadata database: ${METADATA_FILE}`);
});