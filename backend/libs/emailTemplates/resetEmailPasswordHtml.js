export const resetPasswordEmailTemplate = (code) => { 
const digits = String(code).split('') ;

  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Welcome</title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        body.nano_body {
            font-size: 16px;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            background: #fafafa;
        }

        .nano_wrapper {
            font-family: 'Poppins', 'Google Sans', 'Open Sans', 'Roboto', 'Segoe UI', sans-serif;
            color: #707070;
            width: 100%;
        }

        .nano_table {
            border-collapse: collapse;
            width: 640px;
            max-width: 90%;
            margin: 50px auto;
            border-radius: 5px;
            overflow: hidden;
            background: #ffffff;
        }

         .nano_logo {
        max-width: 200px;
        width: 100%;
        height: auto;
        display: block;
        margin: 0 auto 20px auto; /* centers image and adds spacing */
    }

        .nano_table td {
            padding: 0;
        }

        .nano_table img {
            display: block;
            max-width: 100%;
            height: auto;
            border: 0;
            border-radius: 10px;
        }

        .nano_h1 {
            font-size: 29px;
            font-weight: 600;
            margin: 0 0 20px 0;
            color: #3c4043;
            text-align: center;
        }

        .nano_p {
            font-size: 16px;
            margin: 0 0 20px 0;
            color: #5f6368;
            text-align: center;
        }

        .otp-table td {
            width: 45px;
            height: 45px;
            border: 1px dashed #0075ffaa;
            border-radius: 6px;
            font-size: 21px;
            font-weight: 700;
            background: #fff;
            color: #3c4043;
            text-align: center;
            vertical-align: middle;
            font-family: 'Poppins', Arial, sans-serif;
        }

        .nano_regards-text {
            font-size: 18px;
            font-weight: 700;
        }

        .nano_divider {
            margin: 20px 0;
            border-top: 1px solid #f0f0f0;
        }

        .nano_flex {
            text-align: center;
            margin-top: 15px;
        }

        .nano_flex a {
            display: inline-block;
            margin: 0 10px;
        }

        .nano_icon img {
            width: 30px;
            border-radius: 0;
            vertical-align: middle;
        }

        .nano_bg {
            background: #fafafa;
            padding: 25px;
            font-size: 13px;
            color: #706d6b;
        }

        @media screen and (max-width: 640px) {
            .nano_table {
                width: 100% !important;
            }
        }
    </style>
</head>

<body class="nano_body">
    <div class="nano_wrapper">
        <table class="nano_table">
            <tbody>
                <tr>
                    <td style="padding:25px;">
                        <a href="https://example.com" target="_blank">
                            <img class="nano_logo"  src="https://res.cloudinary.com/dcnvefdww/image/upload/v1755134427/freepik__adjust__9891_el6qj3.png" style="max-width: 250px; width: 100%; height: auto; display: block; margin: 0 auto 20px auto;" alt="Logo">
                        </a>

                        <div class="nano_h1">Reset password for account</div>
                        <div class="nano_p">We received a request to reset your password. Use the code below to continue.
                        If you didn’t request this, you can ignore this message.</div>

                        <!-- OTP CODE USING TABLE -->
                        <table class="otp-table" align="center" cellpadding="0" cellspacing="10" role="presentation">
                            <tr>
                                <td>${digits[0]}</td>
                                <td>${digits[1]}</td>
                                <td>${digits[2]}</td>
                                <td>${digits[3]}</td>
                                <td>${digits[4]}</td>
                                <td>${digits[5]}</td>
                            </tr>
                        </table>
                        <!-- END OTP CODE -->
                    </td>
                </tr>

                <tr>
                    <td style="padding:25px;">
                        <div class="nano_regards">
                            <div class="nano_regards-text">Best regards</div>
                            <div>Seekhere developer team</div>
                        </div>

                        <div class="nano_divider"></div>

                        <div class="nano_flex">
                            <a href="https://x.com/Abhi_2me" class="nano_icon">
                                <img src="https://raw.githubusercontent.com/atomjoy/icons/refs/heads/main/social-color/x.png" alt="X">
                            </a>
                            <a href="https://www.linkedin.com/in/abhishek-singh-34c54/" class="nano_icon">
                                <img src="https://raw.githubusercontent.com/atomjoy/icons/refs/heads/main/social-color/linkedin.png" alt="LinkedIn">
                            </a>
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="nano_bg">
                        <img src="https://res.cloudinary.com/dcnvefdww/image/upload/v1755114634/ChatGPT_Image_Aug_14_2025_01_09_36_AM_srafmb.png" alt="Google Logo" style="width:80px; margin-bottom:10px;">
                        <div>© 2025 Seekhere LLC</div>
                        <div>Uttar Pradesh , India</div>
                        <div class="nano_divider"></div>
                        <div>The message was sent to your email address to reset you password. If you have any queries please contact our team at <a href="mailto:seekhere.teams@gmail.com">seekhere.teams@gmail.com</a>.
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>

</html>`;
};