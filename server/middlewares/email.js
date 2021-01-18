const nodemailer = require('nodemailer');


function enviarEmail(titulo, correo){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.CORREO,
            pass: process.env.PASS_CORREO
        }
    });

    const mensaje = `<body style="margin: 0; padding:0;">
    <table border="0" cellpadding="0" width="100%">
        <tr>
            <td>
                <table align="center" border=".5" cellpading="0" cellspacing="0" width="600" style="border-collapse: collapse;">
                    <tr>
                        <td align="center" bgcolor="#ec8b7b" style="padding: 40px 0 30px 0;">
                            <img src="../../assets/images/heroImg.png" alt="mara ticket" width="200">
                            <img src="../../assets/images/banner.png" alt="Purissima" width="200" height="130" style="display: block;" />
                            <img src="../../assets/images/Purissima_Logo.png" alt="Purissima" width="200" style="display: block; padding-top: 15px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px 40px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 24px;">
                                        <b>
                                            Nuevo Ticket creado!
                                        </b>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 0 30px 0;" style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                        Se ha generado un nuevo ticket <strong>${titulo}</strong>
                                        <br>
                                        Tu solicitud sera atendida lo mas pronto posible, el equipo de soporte técnico
                                        se pondrá en contacto con usted en cualquier momento.
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td width="260" valign="top" style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">Ticket ID: <strong>123654987</strong></td>
                                                <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
                                                <td width="260" valign="top" style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#70bbd9" style="padding: 30px 30px 30px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td width='75%'>
                                        <img src="../../assets/images/heroImg.png" alt="Mara Ticket" width="100">
                                    </td>
                                    <td align="right">
                                        <img src="../../assets/images/Purissima_Logo.png" alt="Purissima" width="100px" style="padding-top: 20px;">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>`;

    var mailOptions = {
        from: '"Mara Ticket" <soporte.mara.ticket@gmail.com>',
        to: correo,
        subject: 'Ticket creado exitosamente',
        html:mensaje
    };

    transporter.sendMail(mailOptions, (err, info)=>{
        if(err){
            console.log(err);
        }else{
            console.log(info);
        }
    });


}

module.exports = {
    enviarEmail
}
