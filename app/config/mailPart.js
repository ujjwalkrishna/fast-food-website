require('dotenv').config();
var nodemailer = require('nodemailer');
const { google } = require("googleapis");


function mailPart(order) {
    return new Promise((resolve, reject) => {
        console.log('In buyer email', order);
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

        const OAuth2 = google.auth.OAuth2;

        username = process.env.USER
        client_id = process.env.CLIENT_ID
        client_secret = process.env.CLIENT_SECRET
        refresh_token = process.env.REFRESH_TOKEN

        console.log(username);

        const oauth2Client = new OAuth2(
            client_id,
            client_secret,
            "https://developers.google.com/oauthplayground"
        );
        let parsedItems = Object.values(order.items);
        console.log(parsedItems);
        let msg = `<h2>Order Details:</h2>\n\<p><b>Address: </b>${order.address}</p>\n\<p><b>Phone: </b>${order.phone}</p>\n\<p><b>Email: </b>${order.email}</p>\n\<p><b>Total Price: </b>₹${order.totalPrice}</p>\n <h3>Items:</h3>\n`;
        parsedItems.map((menuItem) => {
            console.log(menuItem.item)
            msg += `<p>${menuItem.item.name} - ${menuItem.qty} pcs (₹${menuItem.item.price * menuItem.qty}) </p>\n`
        })
        console.log(msg);

        oauth2Client.setCredentials({
            refresh_token: refresh_token
        });

        var accessToken = oauth2Client.getAccessToken()
        console.log(accessToken);

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                user: username,
                clientId: client_id,
                clientSecret: client_secret,
                refreshToken: refresh_token,
                accessToken: accessToken
            }
        });

        var mailOptions = {
            from: username,
            to: username,
            subject: 'New Order Arrived!',
            html: msg
        };
        //return resolve("Success")
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return resolve('Email Not Sent')
            } else {
                console.log('Email sent: ' + info.response);
                return resolve('Success');
            }
        });
    })
}

module.exports = mailPart;