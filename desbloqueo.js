var azurest = require('azure-storage');
var restify = require('restify');
var builder = require('botbuilder');
var config = require('./config');
var azure = require('botbuilder-azure'); 
// Inicia el servicio Azure Storage Tables
var tableService = azurest.createTableService(config.storageA, config.accessK);
// Module.exports: Exporta los díalogos para que sean utilizados por app.js
module.exports = [
    function (session) {
        session.dialogData.accion = 'Desbloquear cuenta';
        builder.Prompts.text(session, `¿Cuál es la cuenta que deseas desbloquear? ejemplo: **aperez**`);
    },
    function (session, results) {
        session.dialogData.cuenta = results.response;
        // var random = require('./randomid');
        var x = function myFunc() {
            var y = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for( var i=0; i < 9; i++ )
            y += possible.charAt(Math.floor(Math.random() * possible.length));
            return y;
            };
            var randomid = x();
            console.log(randomid);
        // Variables de desbloqueo tabla 1
        var unlock = {
            PartitionKey : {'_': session.dialogData.accion, '$':'Edm.String'},
            RowKey: {'_': session.dialogData.cuenta, '$':'Edm.String'},
            RandomId: {'_': randomid, '$':'Edm.String'}
        };
        // Función de guardar solicitud de desbloqueo en tabla 1
        tableService.insertOrReplaceEntity (config.table1, unlock, function(error) {
        if(!error) {
            console.log('Entity tabla1 inserted');   // Entity inserted
        }
        }); 
        
        // Condición: si el usuario envía una respuesta...
        if (results.response) {
            // SendTyping: indica al usuario que el bot está trabajando...
            session.sendTyping();
            // Envíamos un mensaje al usuario para que espere.
            session.send('Estamos atendiendo tu solicitud. Por favor espera un momento...');
            // Hacemos un retraso de 5 segundos.
            setTimeout(() => {
                // Busca el estatus del usuario en la tabla 2.
                tableService.retrieveEntity(config.table2, 'Desbloqueo cuenta', session.dialogData.cuenta, function(error, result, response) {
                    // var unlock = result.Status._;
                    if(!error && result.Status._=='Desbloqueado') {
            
                        session.endDialog(`Me solicitaste **Desbloquear tu cuenta**, la cuenta ha sido desbloqueada. Saludos.`);
                            
                    }else if(!error && result.Status._=='Noexiste'){
                
                        session.endDialog(`La cuenta solicitada **No existe**. Saludos.`);
                    }
                    else{
                        session.endDialog("**Error:** Por favor intentalo más tarde.");
                    }
                });
            }, 30000);
        }
        else {
            session.endDialog('Adios!');
        }
    }
];