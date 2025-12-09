const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const port = 8080;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'unsustainabledevelopment461@gmail.com',
        pass: 'regm newq kmej cscu'
    }
});

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/api/signup', (req, res) => {
    const { firstName, lastName, email, comments, timestamp } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({
            success: false,
            message: 'First name, last name, and email are required.'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format.'
        });
    }

    const data = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        comments: comments ? comments.trim() : '',
        timestamp: timestamp || new Date().toISOString()
    };

    const file = path.join(dataDir, 'signups.json');
    let signups = [];

    if (fs.existsSync(file)) {
        try {
            const raw = fs.readFileSync(file, 'utf-8').trim();
            signups = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(signups)) signups = [];
        } catch (err) {
            signups = [];
        }
    }

    if (signups.find(s => s.email === data.email)) {
        return res.status(409).json({
            success: false,
            message: 'This email is already registered.'
        });
    }

    signups.push(data);
    fs.writeFileSync(file, JSON.stringify(signups, null, 2));

    const mailOptions = {
        from: 'unsustainabledevelopment461@gmail.com',
        to: data.email,
        subject: 'Thank you for signing up - UEA Sustainability',
        html: `
            <h2>Welcome to UEA Sustainability!</h2>
            <p>Dear ${data.firstName} ${data.lastName},</p>
            <p>Thank you for signing up and showing interest in our sustainability initiatives.</p>
            ${data.comments ? `<p>We received your message: "${data.comments}"</p>` : ''}
            <p>We'll keep you updated on our progress and how you can get involved.</p>
            <br>
            <p>Best regards,</p>
            <p>The UEA Sustainability Team</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });

    res.status(201).json({
        success: true,
        message: 'Thank you for signing up!'
    });
});

app.get('/api/signups', (req, res) => {
    const file = path.join(dataDir, 'signups.json');
    if (fs.existsSync(file)) {
        try {
            const raw = fs.readFileSync(file, 'utf-8').trim();
            const signups = raw ? JSON.parse(raw) : [];
            res.json({ success: true, count: signups.length, signups });
        } catch (err) {
            res.json({ success: true, count: 0, signups: [] });
        }
    } else {
        res.json({ success: true, count: 0, signups: [] });
    }
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
