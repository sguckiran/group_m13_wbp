const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;

if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
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

    const file = path.join(__dirname, 'data', 'signups.json');
    let signups = [];

    if (fs.existsSync(file)) {
        signups = JSON.parse(fs.readFileSync(file, 'utf-8'));
    }

    if (signups.find(s => s.email === data.email)) {
        return res.status(409).json({
            success: false,
            message: 'This email is already registered.'
        });
    }

    signups.push(data);
    fs.writeFileSync(file, JSON.stringify(signups, null, 2));

    res.status(201).json({
        success: true,
        message: 'Thank you for signing up!'
    });
});

app.get('/api/signups', (req, res) => {
    const file = path.join(__dirname, 'data', 'signups.json');
    if (fs.existsSync(file)) {
        const signups = JSON.parse(fs.readFileSync(file, 'utf-8'));
        res.json({ success: true, count: signups.length, signups });
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
