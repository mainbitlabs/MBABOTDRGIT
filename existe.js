var builder = require('botbuilder');

// Opciones: Si  / No, registrar cuenta.
var Registro = {
    Si: 'Si',
    No: 'No, registrar cuenta',
};

module.exports = [
function (session) {
    session.send( 'Para este proceso debes tener registrada tu cuenta en el sistema de Doble Autenticación.');
    builder.Prompts.choice(session, `¿Tu cuenta está registrada?`, [Registro.Si, Registro.No], { listStyle: builder.ListStyle.button });
},
function (session, result) {
    var selection = result.response.entity;
        switch (selection) {
            case Registro.Si:
                return session.beginDialog('reseteo');
            case Registro.No:
                return session.beginDialog('registro');
        }
}
]