const welcomeEmail = (meta, user) => {
    return `
    <!doctype html>
        <html lang='en'>
        <head>
            <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <meta http-equiv='X-UA-Compatible' content='IE=edge'>
            <meta name='format-detection' content='telephone=no'>
        </head>

        <body style='margin:0;
            padding:0;
            font-family:Helvetica, Arial, sans-serif;
            font-size:14px;
            font-weight:400;
            color:#374550;
            text-align:left;'
            bgcolor='#F0F0F0'
            leftmargin='0'
            topmargin='0'
            marginwidth='0'
            marginheight='0'>

            <table border='0'
                width='100%'
                height='100%'
                cellpadding='0'
                cellspacing='0'>
            <tr>
                <td align='center'
                    valign='top'>

                <br>
                
                <table border='0'
                        width='600'
                        cellpadding='0'
                        cellspacing='0'
                        class='container'
                        style='width:600px;
                        max-width:600px'>

                    <tr>
                        <td align='left'
                            style='padding-left:24px;'>
                        <p style='text-align:left;
                            font-weight:400;
                            font-size:20px;
                            color:#666666'>${meta.title}</p>
                        </td>
                    </tr>

                    <tr>
                    <td align='left'
                        style='padding-left:24px;
                        padding-right:24px;
                        padding-top:12px;
                        padding-bottom:12px;
                        background-color:#ffffff;
                        border: 1px solid #e3e3e3; '>
                        
                        <p class='title'
                            style='font-size:18px;
                            font-weight:600;
                            color:#374550'>Hello ${user.name}.</p>

                        
                        <p style='font-family:Helvetica, Arial, sans-serif;
                            font-size:14px;
                            line-height:20px;
                            text-align:left;
                            color:#333333;
                            line-height:22px;'>You have been invited to <b>${meta.title}</b>. Use your email (${user.email}) to sign in.</p><br>

                        <table border='0'
                            width='180'
                            cellpadding='0'
                            cellspacing='0'
                            style='width:180px;
                            max-width:180px;
                            background-color:#EF6C00;
                            color:#ffffff'>
                            <tr>
                            <td align='left'
                                style='padding-left:24px;
                                padding-right:24px;
                                padding-top:12px;
                                padding-bottom:12px;'>
                                       
                                <a href='${meta.url}/reset?_id=${user._id}&action=create&token=${user.pwdToken}'
                                    target='_blank'
                                    style='color:#ffffff;
                                    text-decoration: none;'>Click here to access</a>
                            </td>
                            </tr>

                        </table>

                        <br>

                    </td>
                    </tr>

                    <tr>
                    <td align='left'
                        style='padding-left:24px;
                            padding-right:24px;
                            padding-top:12px;
                            padding-bottom:12px;
                            color:#666666;'>
                        <p style='text-align:left;
                            font-size:12px;
                            font-weight:400;
                            line-height:18px;'>
                            <strong>${meta.title}</strong></br>
                            <a href='${meta.url}' style='color:#555555;'>${meta.url}</a>
                        </p>
                    </td>
                    </tr>

                </table>
                
                <br><br>

                </td>
            </tr>
            </table>

        </body>
    </html>
    `;
};

const passwordResetEmail = (meta, user) => {
    return `
    <!doctype html>
        <html lang='en'>
        <head>
            <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <meta http-equiv='X-UA-Compatible' content='IE=edge'>
            <meta name='format-detection' content='telephone=no'>
        </head>

        <body style='margin:0;
            padding:0;
            font-family:Helvetica, Arial, sans-serif;
            font-size:14px;
            font-weight:400;
            color:#374550;
            text-align:left;'
            bgcolor='#F0F0F0'
            leftmargin='0'
            topmargin='0'
            marginwidth='0'
            marginheight='0'>

            <table border='0'
                width='100%'
                height='100%'
                cellpadding='0'
                cellspacing='0'>
            <tr>
                <td align='center'
                    valign='top'>

                <br>
                
                <table border='0'
                    width='600'
                    cellpadding='0'
                    cellspacing='0'
                    class='container'
                    style='width:600px;
                    max-width:600px'>

                    <tr>
                        <td align='left'
                            style='padding-left:24px;'>
                        <p style='text-align:left;
                            font-weight:400;
                            font-size:20px;
                            color:#666666'>${meta.title}</p>
                        </td>
                    </tr>

                    <tr>
                    <td align='left'
                        style='padding-left:24px;
                        padding-right:24px;
                        padding-top:12px;
                        padding-bottom:12px;
                        background-color:#ffffff;
                        border: 1px solid #e3e3e3;'>
                        
                        <p class='title'
                        style='font-size:18px;
                            font-weight:600;
                            color:#374550'>Hello ${user.name}.</p>

                        <p style='font-family:Helvetica, Arial, sans-serif;
                            font-size:14px;
                            line-height:20px;
                            text-align:left;
                            color:#333333;
                            line-height:22px;'>We've received a request to recover your password to access <b>${meta.title}</b>.
                            If you didn't make the request, just ignore this email. Otherwise you can reset your password using this link:</p><br>

                        <table border='0'
                            width='260'
                            cellpadding='0'
                            cellspacing='0'
                            style='width:260px;
                            max-width:260px;
                            background-color:#EF6C00;
                            color:#ffffff'>
                            <tr>
                            <td align='left'
                                style='padding-left:24px;
                                padding-right:24px;
                                padding-top:12px;
                                padding-bottom:12px;'>
                                
                                <a href='${meta.url}/reset?_id=${user._id}&action=reset&token=${user.pwdToken}'
                                    target='_blank'
                                    style='color:#ffffff;
                                    text-decoration: none;'>Click here to reset your password</a>
                            </td>
                            </tr>

                        </table>

                        <br>

                    </td>
                    </tr>

                    <tr>
                    <td align='left'
                        style='padding-left:24px;
                        padding-right:24px;
                        padding-top:12px;
                        padding-bottom:12px;
                        color:#666666;'>
                        <p style='text-align:left;
                            font-size:12px;
                            font-weight:400;
                            line-height:18px;'>
                            <strong>${meta.title}</strong></br>
                            <a href='${meta.url}' style='color:#555555;'>${meta.url}</a>
                        </p>
                    </td>
                    </tr>

                </table>
                
                <br><br>

                </td>
            </tr>
            </table>

        </body>
    </html>
    `;
};

module.exports = {
    welcomeEmail,
    passwordResetEmail
};