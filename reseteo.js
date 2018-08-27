var azurest = require('azure-storage');
var builder = require('botbuilder');
const Client = require('authy-client').Client;
var config = require('./config');
console.log(config.authyCl);

const client = new Client({ key: config.authyCl });
var tableService = azurest.createTableService(config.storageA, config.accessK);

module.exports = [
function (session, results) {
    session.dialogData.accion = 'Resetear contraseña';
    builder.Prompts.text(session, `¿Cuál es tu cuenta? ejemplo: **rcortes**`);
},
function (session, results) {
    session.dialogData.cuenta = results.response.toLowerCase();
    var cuenta = session.dialogData.cuenta+"@mainbit.com.mx"
    console.log('La cuenta es: '+cuenta);
    // Busca la cuenta en la tabla de Authy botdrsatb03
    tableService.retrieveEntity('botdrsatb03', session.dialogData.accion, cuenta, function(error, result, response) {
        let authyId1 = result.AuthyID._;
            // Obtiene el AuthyID y envia un SMS al número registrado
            console.log('El id del usuario es: '+authyId1);
            client.requestSms({ authyId: authyId1 }, function (err, res) {
            });  
    });
    builder.Prompts.text(session, 'Te enviamos un código SMS a tu celular **¿Cuál es el código?**')
},
function (session, results) {
    session.dialogData.token1 = results.response;
    var token2 = session.dialogData.token1;
    var cuenta = session.dialogData.cuenta+"@mainbit.com.mx"
    console.log(cuenta);
    console.log('Token es: '+ typeof(token2))
    // session.send('Espera mientras validamos la operación...');
    tableService.retrieveEntity(config.table3, session.dialogData.accion, cuenta, function(error, result, response) {
        let authyId1 = result.AuthyID._;
            console.log(authyId1)  
            client.verifyToken({ authyId: authyId1, token: token2 })
                .then(function(response) {
                    var x = function myFunc() {
                        var y = "";
                        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                        for( var i=0; i < 4; i++ )
                        y += possible.charAt(Math.floor(Math.random() * possible.length));
                        return y;
                        };
                        var randomid = 'Mainbit.' + x();
                        console.log(randomid);
            
                    var sessame = {
                        PartitionKey : {'_': session.dialogData.accion, '$':'Edm.String'},
                        RowKey: {'_': session.dialogData.cuenta, '$':'Edm.String'},
                        RandomId: {'_': randomid, '$':'Edm.String'}
                    };
                    tableService.insertOrReplaceEntity (config.table2, sessame, function(error) {
                    if(!error) {
                        console.log('Entity botdrsatb02 inserted');   // Entity inserted
                    }}); 
                    console.log('Token is valid');
                    session.send(`Tu cuenta ha cambiado de password, ahora es: **${randomid}**.`);
                    session.endDialog(`Recuerda que si estás en la red interna de Mainbit debes esperar 1 minuto antes de validar tu acceso, en caso de estar fuera de la red interna este proceso puede tardar hasta 10 minutos.`);
                })
                .catch(function(error) {
                    session.endDialog('El código proporcionado es incorrecto.');
                    // throw error;
            });
    });
}
]