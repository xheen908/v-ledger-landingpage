const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const translations = require('./translations');
const app = express();
const PORT = process.env.PORT || 12000;

// Programmatic Cleanup: Force delete legacy static index.html if it exists
const legacyHtml = path.join(__dirname, 'public', 'index.html');
if (fs.existsSync(legacyHtml)) {
    try {
        fs.unlinkSync(legacyHtml);
    } catch (e) {
        console.warn('CLEANUP: Could not remove legacy index.html');
    }
}

// Force Cache-Control for lead generation consistency
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files (CSS, JS, Assets)
app.use(express.static('public'));

// Language Detection & Redirect Middleware
app.get('/', (req, res) => {
    // Detect browser language
    const langHeader = req.headers['accept-language'] || '';
    let targetLang = 'en-us'; // Default

    if (langHeader.startsWith('de')) targetLang = 'de-de';
    else if (langHeader.startsWith('es')) targetLang = 'es-es';
    else if (langHeader.startsWith('vi')) targetLang = 'vi-vn';
    else if (langHeader.startsWith('th')) targetLang = 'th-th';
    else if (langHeader.startsWith('ja')) targetLang = 'ja-jp';
    else if (langHeader.startsWith('ko')) targetLang = 'ko-kr';
    else if (langHeader.startsWith('hi')) targetLang = 'hi-in';
    else if (langHeader.startsWith('bn')) targetLang = 'bn-bd';
    else if (langHeader.startsWith('zh-tw')) targetLang = 'zh-tw';
    else if (langHeader.startsWith('zh')) targetLang = 'zh-cn';

    res.redirect(`/${targetLang}/`);
});

// Parameterized Route for Localization (SSR)
const supportedLangs = ['de-de', 'en-us', 'es-es', 'vi-vn', 'th-th', 'ja-jp', 'ko-kr', 'hi-in', 'bn-bd', 'zh-cn', 'zh-tw'];
app.get('/:langCode/', (req, res) => {
    const langCode = req.params.langCode.toLowerCase();
    
    if (!supportedLangs.includes(langCode)) {
        return res.redirect('/en-us/');
    }

    const t = translations[langCode];
    res.render('landing', { t });
});

// Parameterized Route for Legal Documents (Build 10.1)
app.get('/:langCode/legal/:type', (req, res) => {
    const langCode = req.params.langCode.toLowerCase();
    const type = req.params.type.toLowerCase(); // imprint, privacy, terms
    
    if (!supportedLangs.includes(langCode)) {
        return res.redirect('/en-us/');
    }

    const t = translations[langCode];
    if (!t.legal.content[type]) {
        return res.redirect(`/${langCode}/`);
    }

    res.render('legal', { t, type });
});

// Strategic "About Us" Route (Build 15.0)
app.get('/:langCode/about', (req, res) => {
    const langCode = req.params.langCode.toLowerCase();
    
    if (!supportedLangs.includes(langCode)) {
        return res.redirect('/en-us/about');
    }

    const t = translations[langCode];
    res.render('about', { t });
});

// Technology & Sales Route (Build 16.0)
app.get('/:langCode/technology', (req, res) => {
    const langCode = req.params.langCode.toLowerCase();
    
    if (!supportedLangs.includes(langCode)) {
        return res.redirect('/en-us/technology');
    }

    const t = translations[langCode];
    res.render('technology', { t });
});

// Handle missing trailing slash
app.get('/:langCode', (req, res) => {
    const langCode = req.params.langCode.toLowerCase();
    if (supportedLangs.includes(langCode)) {
        return res.redirect(`/${langCode}/`);
    }
    res.redirect('/en-us/');
});

// Contact Route
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    const logEntry = `[${new Date().toISOString()}] Name: ${name}, Email: ${email}, Message: ${message}\n`;
    fs.appendFileSync(path.join(__dirname, 'requests.log'), logEntry);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.MAIL_USER,
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN
        }
    });

    try {
        if (process.env.MAIL_USER && process.env.OAUTH_REFRESH_TOKEN) {
            await transporter.sendMail({
                from: `"V-Ledger Lead" <${process.env.MAIL_USER}>`,
                to: process.env.MAIL_USER, 
                subject: `New Lead: ${name} (${email})`,
                text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                html: `<b>Name:</b> ${name}<br><b>Email:</b> ${email}<br><br><b>Message:</b><br>${message}`
            });
        }
        res.json({ success: true, message: 'Request recorded successfully.' });
    } catch (error) {
        console.error('Email error:', error);
        res.json({ success: true, message: 'Request logged, email failed.' });
    }
});

app.listen(PORT, () => {
    console.log(`V-Ledger Landingpage (SSR v5.0) running on Port ${PORT}`);
});
