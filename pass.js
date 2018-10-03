var builder = require('botbuilder');
// Valida los factores de seguridad de la contraseña.
module.exports = [
function (session) {
    builder.Prompts.text(session, 'Escribe tu nueva contraseña');
    session.send( `**Factores de seguridad:** *Debe tener al menos 8 caracteres, un número, un caracter especial, una letra mayúscula y una minúscula.*`);
},
function (session, results) {
    var pass = results.response;
    var validatePass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_.-])(?=.{8,})/.test(pass);
        if ( validatePass == false) {
            session.send(`**La contraseña no es segura. \n Debe cumplir con todos los factores de seguridad.**`);
            session.beginDialog('pass');
        } 
        else if (validatePass == true){
            session.send(`*La contraseña es segura.*`);
            session.endDialogWithResult(results)
        }
}
];