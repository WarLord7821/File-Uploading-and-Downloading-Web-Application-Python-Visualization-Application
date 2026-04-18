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
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(METADATA_FILE)) fs.writeFileSync(METADATA_FILE, JSON.stringify([]));

const readMetadata = () => {
    try {
        return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
    } catch (err) {
        return [];
    }
};

const writeMetadata = (data) => {
    try {
        fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {}
};

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.log', '.pdf', '.csv', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only .log, .pdf, .csv, and .zip are allowed.'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// --- API Endpoints ---

// POST /upload
app.post('/upload', (req, res) => {
    const uploadHandler = upload.single('file');

    uploadHandler(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File exceeds the 5MB size limit.' });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

        const { logDate, description, uploaderName } = req.body;
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

        const metadata = readMetadata();
        metadata.push(newEntry);
        writeMetadata(metadata);

        res.status(201).json({ message: 'File uploaded successfully!', file: newEntry });
    });
});

// GET /files
app.get('/files', (req, res) => res.json(readMetadata()));

// GET /preview/:filename (Inline viewing)
app.get('/preview/:filename', (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);
    if (!filePath.startsWith(UPLOADS_DIR)) return res.status(403).json({ error: 'Access denied.' });

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'File not found.' });
    }
});

// GET /download/:filename (Forced download)
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);
    if (!filePath.startsWith(UPLOADS_DIR)) return res.status(403).json({ error: 'Access denied.' });

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});