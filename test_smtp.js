const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'admin@skywaveads.com',
    pass: 'Newjoker2k24$'
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('SMTP OK');
  }
});
