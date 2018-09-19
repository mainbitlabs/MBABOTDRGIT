var builder = require('botbuilder');

// Opciones: Si  / No, registrar cuenta.
var Registro = {
    Si: 'Si, estoy registrado',
    No: 'No, registrar cuenta',
    Volver: 'Volver al inicio'
};

module.exports = [
function (session) {
    session.send( 'Para este proceso debes tener registrada tu cuenta en el sistema de Doble Autenticación.');
    builder.Prompts.choice(session, `¿Tu cuenta está registrada?`, [Registro.Si, Registro.No, Registro.Volver], { listStyle: builder.ListStyle.button });
},
function (session, result) {
    var selection = result.response.entity;
        switch (selection) {
            case Registro.Si:
                return session.beginDialog('reseteo');
            case Registro.No:
                return session.beginDialog('registro');
            case Registro.Volver:
                return session.beginDialog('/');
        }
}
]