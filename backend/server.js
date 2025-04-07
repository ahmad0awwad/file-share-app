const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');
const Message = require('./models/message');
const fileRoutes = require('./routes/fileRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json({ limit: '2048mb' }));
app.use('/uploads', express.static('uploads'));
app.use('/api', fileRoutes);

// ✅ Multer config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 * 1024 } });

// ✅ Video stream route
app.get('/video/:filename', (req, res) => {
  const path = `uploads/${req.params.filename}`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });

    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(path).pipe(res);
  }
});

// ✅ API routes
app.post('/api/message', upload.single('file'), async (req, res) => {
  const { sender, receiver, text } = req.body;
  let fileUrl = '';
  let fileType = '';

  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
    if (req.file.mimetype.startsWith('image/')) fileType = 'image';
    else if (req.file.mimetype.startsWith('video/')) fileType = 'video';
    else if (req.file.mimetype === 'application/pdf') fileType = 'pdf';
    else fileType = 'other';
  }

  const msg = new Message({
    sender,
    receiver,
    text,
    fileUrl,
    fileType
  });

  await msg.save();
  io.to(receiver).emit('newMessage', msg);
  res.json({ success: true, msg });
});

app.get('/api/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  const msgs = await Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 }
    ]
  }).sort({ timestamp: 1 });

  res.json({ success: true, messages: msgs });
});

app.post('/api/mark-read', async (req, res) => {
  const { sender, receiver } = req.body;
  await Message.updateMany(
    { sender, receiver, read: false },
    { $set: { read: true } }
  );
  res.json({ success: true });
});

// ✅ Socket.IO
io.on('connection', socket => {
  console.log('🔌 User connected');

  socket.on('join', (username) => {
    socket.join(username);
    console.log(`User joined room: ${username}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

// ✅ Connect to DB THEN start server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');

  const PORT = process.env.PORT || 1000;
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err);
});
