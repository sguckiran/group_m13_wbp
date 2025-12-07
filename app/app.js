const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const port = parseInt(process.env.PORT, 10) || 8080;

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(publicDir));

// API endpoint for signup form submission
app.post('/api/signup', (req, res) => {
	console.log('Received signup request:', req.body);

	const { firstName, lastName, email, comments, timestamp } = req.body;

	// Server-side validation
	if (!firstName || !lastName || !email) {
		return res.status(400).json({
			success: false,
			message: 'First name, last name, and email are required.'
		});
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({
			success: false,
			message: 'Invalid email format.'
		});
	}

	// Sanitize inputs (basic sanitization)
	const sanitizedData = {
		firstName: firstName.trim().replace(/[<>]/g, ''),
		lastName: lastName.trim().replace(/[<>]/g, ''),
		email: email.trim().toLowerCase(),
		comments: comments ? comments.trim().replace(/[<>]/g, '') : '',
		timestamp: timestamp || new Date().toISOString()
	};

	// Read existing signups
	const signupsFile = path.join(dataDir, 'signups.json');
	let signups = [];

	try {
		if (fs.existsSync(signupsFile)) {
			const fileContent = fs.readFileSync(signupsFile, 'utf-8');
			signups = JSON.parse(fileContent);
		}
	} catch (err) {
		console.error('Error reading signups file:', err);
	}

	// Check if email already exists
	const existingSignup = signups.find(s => s.email === sanitizedData.email);
	if (existingSignup) {
		return res.status(409).json({
			success: false,
			message: 'This email is already registered for our newsletter.'
		});
	}

	// Add new signup
	signups.push(sanitizedData);

	// Save to file
	try {
		fs.writeFileSync(signupsFile, JSON.stringify(signups, null, 2), 'utf-8');
		console.log('Signup saved successfully');

		res.status(201).json({
			success: true,
			message: 'Thank you for signing up! You will receive our newsletter at ' + sanitizedData.email
		});
	} catch (err) {
		console.error('Error saving signup:', err);
		res.status(500).json({
			success: false,
			message: 'Failed to save your registration. Please try again.'
		});
	}
});

// GET endpoint to retrieve all signups (for admin purposes)
app.get('/api/signups', (req, res) => {
	const signupsFile = path.join(dataDir, 'signups.json');

	try {
		if (fs.existsSync(signupsFile)) {
			const fileContent = fs.readFileSync(signupsFile, 'utf-8');
			const signups = JSON.parse(fileContent);
			res.json({ success: true, count: signups.length, signups });
		} else {
			res.json({ success: true, count: 0, signups: [] });
		}
	} catch (err) {
		console.error('Error reading signups:', err);
		res.status(500).json({ success: false, message: 'Error retrieving signups' });
	}
});

// 404 handler
app.use((req, res) => {
	res.status(404).sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
	console.log(`Data directory: ${dataDir}`);
});
