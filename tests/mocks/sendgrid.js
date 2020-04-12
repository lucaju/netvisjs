/* eslint-disable quotes */
const nock = require('nock');

const sendEmailInvite = () => {
    return nock('https://api.sendgrid.com:443', {
            "encodedQueryParams": true,
        })
        .post('/v3/mail/send', {
            "from": {
                "email": "lucaju@gmail.com",
                "name": "NetVis"
            },
            "subject": "Invitation to NetVis",
            "personalizations": [{
                "to": [{
                    "email": "lucaju@me.com",
                    "name": "Luciano"
                }]
            }],
            "content": [{
                "value": "\n    <!doctype html>\n        <html lang='en'>\n        <head>\n            <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>\n            <meta name='viewport' content='width=device-width, initial-scale=1'>\n            <meta http-equiv='X-UA-Compatible' content='IE=edge'>\n            <meta name='format-detection' content='telephone=no'>\n        </head>\n\n        <body style='margin:0;\n            padding:0;\n            font-family:Helvetica, Arial, sans-serif;\n            font-size:14px;\n            font-weight:400;\n            color:#374550;\n            text-align:left;'\n            bgcolor='#F0F0F0'\n            leftmargin='0'\n            topmargin='0'\n            marginwidth='0'\n            marginheight='0'>\n\n            <table border='0'\n                width='100%'\n                height='100%'\n                cellpadding='0'\n                cellspacing='0'>\n            <tr>\n                <td align='center'\n                    valign='top'>\n\n                <br>\n                \n                <table border='0'\n                        width='600'\n                        cellpadding='0'\n                        cellspacing='0'\n                        class='container'\n                        style='width:600px;\n                        max-width:600px'>\n\n                    <tr>\n                        <td align='left'\n                            style='padding-left:24px;'>\n                        <p style='text-align:left;\n                            font-weight:400;\n                            font-size:20px;\n                            color:#666666'>NetVis</p>\n                        </td>\n                    </tr>\n\n                    <tr>\n                    <td align='left'\n                        style='padding-left:24px;\n                        padding-right:24px;\n                        padding-top:12px;\n                        padding-bottom:12px;\n                        background-color:#ffffff;\n                        border: 1px solid #e3e3e3; '>\n                        \n                        <p class='title'\n                            style='font-size:18px;\n                            font-weight:600;\n                            color:#374550'>Hello Luciano.</p>\n\n                        \n                        <p style='font-family:Helvetica, Arial, sans-serif;\n                            font-size:14px;\n                            line-height:20px;\n                            text-align:left;\n                            color:#333333;\n                            line-height:22px;'>You have been invited to <b>NetVis</b>. Use your email (lucaju@me.com) to sign in.</p><br>\n\n                        <table border='0'\n                            width='180'\n                            cellpadding='0'\n                            cellspacing='0'\n                            style='width:180px;\n                            max-width:180px;\n                            background-color:#EF6C00;\n                            color:#ffffff'>\n                            <tr>\n                            <td align='left'\n                                style='padding-left:24px;\n                                padding-right:24px;\n                                padding-top:12px;\n                                padding-bottom:12px;'>\n                                       \n                                <a href='localhost/reset?_id=5e914b02df146879d9acb469&action=create&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTkxNGIwMmRmMTQ2ODc5ZDlhY2I0NjkiLCJpYXQiOjE1ODY1ODAyMjZ9.6hxM5QTRWWhX0A-7SGttupciinyomAh5iIQs-vaLsfE'\n                                    target='_blank'\n                                    style='color:#ffffff;\n                                    text-decoration: none;'>Click here to access</a>\n                            </td>\n                            </tr>\n\n                        </table>\n\n                        <br>\n\n                    </td>\n                    </tr>\n\n                    <tr>\n                    <td align='left'\n                        style='padding-left:24px;\n                            padding-right:24px;\n                            padding-top:12px;\n                            padding-bottom:12px;\n                            color:#666666;'>\n                        <p style='text-align:left;\n                            font-size:12px;\n                            font-weight:400;\n                            line-height:18px;'>\n                            <strong>NetVis</strong></br>\n                            <a href='localhost' style='color:#555555;'>localhost</a>\n                        </p>\n                    </td>\n                    </tr>\n\n                </table>\n                \n                <br><br>\n\n                </td>\n            </tr>\n            </table>\n\n        </body>\n    </html>\n    ",
                "type": "text/html"
            }]
        })
        .matchHeader("User-agent", "sendgrid/7.0.0;nodejs")
        .reply(202, "", [
            'Server',
            'nginx',
            'Date',
            'Sat, 11 Apr 2020 04:43:47 GMT',
            'Content-Length',
            '0',
            'Connection',
            'close',
            'X-Message-Id',
            '4gDRcIYcSsONGLtYghl_nQ',
            'Access-Control-Allow-Origin',
            'https://sendgrid.api-docs.io',
            'Access-Control-Allow-Methods',
            'POST',
            'Access-Control-Allow-Headers',
            'Authorization, Content-Type, On-behalf-of, x-sg-elas-acl',
            'Access-Control-Max-Age',
            '600',
            'X-No-CORS-Reason',
            'https://sendgrid.com/docs/Classroom/Basics/API/cors.html'
        ]);
};

module.exports = {
    sendEmailInvite
};