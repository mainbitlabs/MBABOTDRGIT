/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/
var azurest = require('azure-storage');
var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var config = require('./config');
console.log(config.email);
console.log(config.table3);
console.log(config.accessK);
console.log(config.storageA);

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

// Opciones iniciales Desbloquear cuenta y Resetear contraseña
var DialogLabels = {
    Unlock: 'Desbloquear cuenta',
    Reset: 'Resetear contraseña'
};
var time;
// El díalogo principal inicia aquí
bot.dialog('/', [
    
    function (session, results, next) {
        // El bot envía las dos opciónes inicales
        builder.Prompts.choice(session, 'Hola ¿en qué te puedo ayudar?', [DialogLabels.Unlock, DialogLabels.Reset], { listStyle: builder.ListStyle.button });
        session.send(`**Sugerencia:** Si por alguna razón necesitas volver a este menú introduce el texto **cancelar.** \n **Importante:** este bot tiene un ciclo de vida de 5 minutos, te recomendamos concluir la actividad antes de este periodo.`);
        time = setTimeout(() => {
            session.endDialog(`**Lo sentimos ha transcurrido el tiempo estimado para completar esta actividad. Intentalo nuevamente.**`);
        }, 300000);
    },
    function (session, result) {
             
        var selection = result.response.entity;
        switch (selection) {
            // El díalogo desbloqueo inicia si el usuario presiona Desbloquear cuenta
            case DialogLabels.Unlock:
            return session.beginDialog('desbloqueo');
            // El díalogo existe inicia si el usuario presiona Resetear contraseña
            case DialogLabels.Reset:
            return session.beginDialog('existe');
        }
    }
]);
bot.dialog('existe', require('./existe'));
bot.dialog('registro', require('./registro'));
bot.dialog('reseteo', require('./reseteo'));
bot.dialog('desbloqueo', require('./desbloqueo'));
bot.dialog('pass', require('./pass')); // comprueba los factores de seguridad del nuevo pass.

// Cuando el usuario escribe "cancelar" el bot vuelve al menú principal
bot.dialog('cancel',
    function (session) {
        clearTimeout(time);
        session.endConversation('No hay problema, volvamos a iniciar de nuevo.');
        session.replaceDialog('/');
    }
).triggerAction(
    {matches: /(cancel|cancelar)/gi}
);