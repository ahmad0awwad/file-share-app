const express = require('express');
const multer = require('multer');
const File = require('../models/file');
const User = require('../models/user');

const router = express.Router();

// LOGIN
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   console.log('Login attempt:', username, password);

//   const user = await User.findOne({ username });
//   if (!user) {
//     console.log('User not found');
//     return res.status(401).json({ success: false, message: 'User not found' });
//   }

//   if (user.password !== password) {
//     console.log('Wrong password');
//     return res.status(401).json({ success: false, message: 'Incorrect password' });
//   }

//   console.log('Login successful');
//   res.json({ success: true, user });
// });
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ success: false, message: 'User not found' });
  if (user.password !== password) return res.status(401).json({ success: false, message: 'Incorrect password' });
  res.json({ success: true, user });
});


// UPLOAD
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)


});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  const { sender, recipients } = req.body;
  const file = await File.create({
    sender,
    recipients: JSON.parse(recipients),
    filePath: req.file.path,
    fileName: req.file.originalname,
     description: req.body.description,
  size: req.file.size
  });
  res.json({ success: true, file });
});

// INBOX
router.get('/inbox/:username', async (req, res) => {
  const username = req.params.username;
  const files = await File.find({ recipients: username });
  res.json({ files });
});

module.exports = router;
