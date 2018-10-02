var builder = require('botbuilder');
// Valida los factores de seguridad de la contraseña.
module.exports = [
function (session) {
    builder.Prompts.text(session, `¿Cuál es tu nueva contraseña?`);
    session.send( `**Factores de seguridad: Debe tener al menos 8 caracteres, un número, un caracter especial, una letra mayúscula y una minúscula.**`);
},
function (session, results) {
    var pass = results.response;
    var validatePass = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(pass);
        if ( validatePass == false) {
            session.send(`**La contraseña no es segura. \n Debe cumplir con todos los factores de seguridad.**`);
            session.beginDialog('pass');
        } 
        else if (validatePass == true){
            session.endDialogWithResult(results)
        }
}
];