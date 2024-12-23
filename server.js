const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/youtube-certifications', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// MongoDB Schemas and Models
const VideoSchema = new mongoose.Schema({
    youtubeLink: String,
    description: String,
    questions: [
        {
            question: String,
            options: [String],
            correctAnswer: Number,
        },
    ],
});
const Video = mongoose.model('Video', VideoSchema);

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    videoId: mongoose.Schema.Types.ObjectId,
    score: Number,
    certificatePath: String,
});
const User = mongoose.model('User', UserSchema);

// API Endpoints

// 1. Submit Video Details
app.post('/submit-video', async (req, res) => {
    const { youtubeLink, description, questions } = req.body;
    try {
        const video = new Video({ youtubeLink, description, questions });
        await video.save();
        res.json({ success: true, message: 'Video saved successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving video.', error });
    }
});

// 2. Fetch Questions for a Video
app.get('/get-questions/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });

        res.json({ success: true, questions: video.questions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching questions.', error });
    }
});

// 3. Submit Test and Generate Certificate
app.post('/submit-test', async (req, res) => {
    const { name, email, videoId, answers } = req.body;

    try {
        const video = await Video.findById(videoId);
        if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });

        let score = 0;
        video.questions.forEach((q, idx) => {
            if (answers[idx] == q.correctAnswer) score++;
        });

        // Generate Certificate if Passed
        if (score >= video.questions.length * 0.7) {
            const certificatePath = `certificates/${name}_${Date.now()}.pdf`;

            // Generate PDF
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream(certificatePath));
            doc.fontSize(25).text('Certificate of Completion', { align: 'center' });
            doc.fontSize(16).text(
                `This certifies that ${name} has successfully completed the test for the video: ${video.description}.`,
                { align: 'center' }
            );
            doc.end();

            // Save User Data
            const user = new User({ name, email, videoId, score, certificatePath });
            await user.save();

            res.json({ success: true, message: 'Test Passed!', certificatePath });
        } else {
            res.json({ success: false, message: 'Test Failed. Try Again!' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error processing test.', error });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));
