const twilio = require('twilio');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const sendOtpToMobile = (mobileNumber, otp) => {
    const phoneNumber = parsePhoneNumberFromString(mobileNumber, 'IN');

    if (!phoneNumber || !phoneNumber.isValid()) {
        console.error('Invalid phone number');
        return;
    }

    const formattedNumber = phoneNumber.format('E.164');
    const message = `Your OTP is ${otp}`;

    client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber
    })
    .then((message) => console.log(`OTP sent successfully: ${message.sid}`))
    .catch((error) => console.error(`Error sending OTP: ${error.message}`));
};

module.exports = { sendOtpToMobile };
