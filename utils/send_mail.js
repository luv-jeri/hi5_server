const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  //` create reusable transporter object using the default SMTP transport
  var transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    // service : 'mailtrap',
    port: 2525,
    auth: {
      user: 'b8de122139ee4e',
      pass: 'f4ab0ce56aa0a1',
    },
  });

  //` send mail with defined transport object
  const mailOptions = {
    from: "Hello From Let's walk <contact@letswalk.com>",
    to: options.to,
    subject: options.subject,
    text: options.text,
    // html: options.html,
  };

  await transport.sendMail(mailOptions);
};

module.exports = sendMail;
