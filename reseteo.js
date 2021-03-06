var azurest = require('azure-storage');
var builder = require('botbuilder');
var Client = require('authy-client').Client;
var config = require('./config');
console.log(config.authyCl);
// Inicia el servicio de Authy.
var client = new Client({ key: config.authyCl });
// Inicia el servicio Azure Storage Tables.
var tableService = azurest.createTableService(config.storageA, config.accessK);
// Module.exports: Exporta los díalogos para que sean utilizados por app.js
module.exports = [
function (session) {
    session.dialogData.accion = 'Usuario registrado';
    builder.Prompts.text(session, `¿Cuál es tu cuenta? ejemplo: **rcortes**`);
},
function (session, results) {
    session.dialogData.cuenta = results.response.toLowerCase();
    var cuenta = session.dialogData.cuenta +"@mainbit.com.mx";
    session.send('Estamos atendiendo tu solicitud. Por favor espera un momento...');
    console.log('La cuenta es: '+ cuenta);
    console.log("La acción es: " + session.dialogData.accion);
    console.log("La tabla es: " + config.table3);
    // SendTyping: indica al usuario que el bot está trabajando...
    session.sendTyping();
    // Hacemos un retraso de 5 segundos.
    setTimeout(() => {   
    // Busca la cuenta en la tabla 3.
    tableService.retrieveEntity(config.table3, session.dialogData.accion, cuenta, function(error, result, response) {
        // Si no hay error en la petición entonces...
       if (!error) {
           var authyId1 = result.AuthyID._;
           console.log('El id del usuario es: '+authyId1);
            // Obtiene el AuthyID y envia un SMS al número registrado
            client.requestSms({ authyId: authyId1 }, function (err, res) {
            });  
            builder.Prompts.text(session, 'Te enviamos un código SMS a tu celular **¿Cuál es el código?**');              
        } else {
            // Si la cuenta no existe en la tabla envía el siguiente mensaje.
            session.endDialog("La cuenta proporcionada está mal escrita o no está registrada, por favor vuelve a intentarlo.");
            }
        });
    }, 5000);
},
function (session, results) {
    session.dialogData.token1 = results.response;
    var token2 = session.dialogData.token1;
    var cuenta = session.dialogData.cuenta+"@mainbit.com.mx";
    console.log(cuenta);
    console.log('Token es: '+ typeof(token2));
    // session.send('Espera mientras validamos la operación...');
    tableService.retrieveEntity(config.table3, session.dialogData.accion, cuenta, function(error, result, response) {
        var authyId1 = result.AuthyID._;
            console.log(authyId1);
            // Se valida el token enviado por el usuario.
            client.verifyToken({ authyId: authyId1, token: token2 })
                // Si es exitoso genera un nuevo pass.
                .then(function(response) {
                    console.log('Token is valid');
                    session.send(`*El código es válido.*`);
                    session.beginDialog('pass');
                })
                .catch(function(error) {
                    // Si la validación no tiene éxito envía un mensaje al usuario.
                    session.endDialog('El código proporcionado es incorrecto.');
            });
    });
},
function (session, results) {
    session.dialogData.pass = results.response;
    var first = session.dialogData.pass.charAt(0);
    var mid = "*****";
    var last = session.dialogData.pass.slice(-3);
    // Inserta la información recibida a la tabla 1   
    var sessame = {
        PartitionKey : {'_': 'Resetear contraseña', '$':'Edm.String'},
        RowKey: {'_': session.dialogData.cuenta, '$':'Edm.String'},
        RandomId: {'_': session.dialogData.pass, '$':'Edm.String'}
    };
    tableService.insertOrReplaceEntity (config.table1, sessame, function(error) {
    if(!error) {
        console.log('Entity tabla 1 inserted');   // Entity inserted
    }}); 
    session.sendTyping();
    // Envíamos un mensaje al usuario para que espere.
    session.send('Estamos atendiendo tu solicitud. Por favor espera un momento...');
    session.send(`**Mientras tanto sería buena idea borrar el mensaje donde escribiste tu contraseña.**`);
    
    // Hacemos un retraso de 30 segundos.
    setTimeout(() => {
        // Busca el estatus del usuario en la tabla 2.
        tableService.retrieveEntity(config.table2, 'Resetear contraseña', session.dialogData.cuenta, function(error, result, response) {
            // var unlock = result.Status._;
            if(!error && result.Status._=='Reset') {
                // Envía el nuevo pass al usuario.
                session.send(`Tu cuenta ha cambiado de contraseña, ahora es : **${first}**${mid}**${last}**`);
                // Se borra el elemento de la tabla
                var delet = {
                    PartitionKey: {'_':'Resetear contraseña'},
                    RowKey: {'_': session.dialogData.cuenta}
                };
                
                tableService.deleteEntity(config.table2, delet, function(error, response){
                    if(!error) {
                    // Entity deleted
                    // Indica al usuario el tiempo que debe esperar para validar su acceso.
                    session.endDialog(`Recuerda que si estás en la red interna de Mainbit debes esperar 1 minuto antes de validar tu acceso, en caso de estar fuera de la red interna este proceso puede tardar hasta 10 minutos.`);
                }
                });
            }else if(!error && result.Status._=='Noexiste'){
        
                session.endDialog(`La cuenta solicitada **No existe**. Saludos.`);
            }
            else{
                session.endDialog("**Ocurrió un error:** Por favor intentalo más tarde.");
            }
        });
    }, 30000);
    
}
];