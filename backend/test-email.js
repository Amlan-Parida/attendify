const nodemailer = require('nodemailer');

async function test() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'attendify.go@gmail.com',
      pass: 'bvponpbqcpvamvmt',
    },
  });

  try {
    let info = await transporter.sendMail({
      from: '"Attendify" <attendify.go@gmail.com>',
      to: 'attendify.go@gmail.com', // send to itself
      subject: 'Test Email',
      text: 'This is a test email to verify credentials.',
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
}

test();
