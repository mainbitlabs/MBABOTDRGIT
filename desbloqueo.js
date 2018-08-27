var azurest = require('azure-storage');
var restify = require('restify');
var builder = require('botbuilder');
var azure = require('botbuilder-azure'); 

var tableService = azurest.createTableService('botdrsa01','bKetS5g0o7rdmcbw+UsOM53EHq3BzAjQbQfN8yzkNLqQHfP08Npo5jDMLW6Oer9cpdY0ZdA2rrARncCgZUBVUg==');

module.exports = [
    function (session, results) {
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

        var table1 = {
            PartitionKey : {'_': session.dialogData.accion, '$':'Edm.String'},
            RowKey: {'_': session.dialogData.cuenta, '$':'Edm.String'},
            RandomId: {'_': randomid, '$':'Edm.String'}
        };
        tableService.insertOrReplaceEntity ('botdrsatb01', table1, function(error) {
        if(!error) {
            console.log('Entity botdrsatb01 inserted');   // Entity inserted
        }
        }); 
        var table2 = {
            PartitionKey : {'_': 'Desbloqueo cuenta', '$':'Edm.String'},
            RowKey: {'_': session.dialogData.cuenta, '$':'Edm.String'},
            Status: {'_': 'Desbloqueado', '$':'Edm.String'}
        };
        tableService.insertOrReplaceEntity ('botdrsatb02', table2, function(error) {
        if(!error) {
            console.log('Entity botdrsatb02 inserted');   // Entity inserted
        }
        }); 
        
        if (results.response) {
            
            session.sendTyping();
            session.send('Estamos atendiendo tu solicitud. Espera un momento...');
            setTimeout(() => {
                
                tableService.retrieveEntity('botdrsatb02', 'Desbloqueo cuenta', session.dialogData.cuenta, function(error, result, response) {
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
            }, 5000);
                // session.endDialog(`Me solicitaste **${session.dialogData.accion}**, tu cuenta es **${session.dialogData.cuenta}**, Saludos.`);
            
           
        }
        else {
            session.endDialog('Adios!');
        }
    }
]