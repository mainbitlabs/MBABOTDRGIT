/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/
var azurest = require('azure-storage');
var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Create table service for Azure Storage Bot
var tableService = azurest.createTableService('botdrsa01','bKetS5g0o7rdmcbw+UsOM53EHq3BzAjQbQfN8yzkNLqQHfP08Npo5jDMLW6Oer9cpdY0ZdA2rrARncCgZUBVUg==');
// Setup Restify Server

// Setup Restify Server
// nuevo coment línea 14
// nuevo coment línea 15
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


bot.dialog('/', [
    function (session) {
        session.send('Hola desde mi entorno local')
        builder.Prompts.text(session, "What's your name?");
    },
    function (session, results) {
        session.dialogData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response + ", How many years have you been coding?"); 
    },
    function (session, results) {
        session.dialogData.coding = results.response;
        builder.Prompts.choice(session, "What language do you code Node using?", ["JavaScript", "CoffeeScript", "TypeScript"]);
    },
    function (session, results) {
        session.dialogData.language = results.response.entity;
        session.send("Got it... " + session.dialogData.name + 
                    " you've been programming for " + session.dialogData.coding + 
                    " years and use " + session.dialogData.language + ".");
                    var table1 = {
                        PartitionKey : {'_': session.dialogData.name, '$':'Edm.String'},
                        RowKey: {'_': session.dialogData.language, '$':'Edm.String'},
                        Anios: {'_': session.dialogData.coding, '$':'Edm.String'}
                    };
                    tableService.insertOrReplaceEntity ('botdrsatb01', table1, function(error) {
                    if(!error) {
                        session.send('Entity botdrsatb01 inserted');   // Entity inserted
                    }
                else{
                    console.log(error);
                    
                }}); 
                    tableService.insertOrReplaceEntity ('botdrsatb02', table1, function(error) {
                    if(!error) {
                        session.send('Entity botdrsatb02 inserted');   // Entity inserted
                    }
                else{
                    console.log(error);
                    
                }}); 
                    tableService.insertOrReplaceEntity ('botdrsatb03', table1, function(error) {
                    if(!error) {
                        session.send('Entity botdrsatb03 inserted');   // Entity inserted
                    }
                else{
                    console.log(error);
                    
                }}); 
    }
]); 