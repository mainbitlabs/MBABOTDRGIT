var builder = require('botbuilder');
var nodeoutlook = require('nodejs-nodemailer-outlook');
var config = require('./config');
var azurest = require('azure-storage');
var tableService = azurest.createTableService(config.storageA, config.accessK);
const Client = require('authy-client').Client;
const client = new Client({ key: config.authyCl });
console.log("Registro: " + config.authyCl);

// Registro de usuarios en Authy.
module.exports = [
    function (session) {
        // Se solicita el correo completo del usuario para el registro
        builder.Prompts.text(session, '¿Cuál es tu correo? ejemplo: **aregil@mainbit.com.mx**');
    },
    function (session, results) {
        // Se solicita el teléfono celular de 10 dígitos para el registro
        session.dialogData.email = results.response;
        builder.Prompts.text(session, '¿Cuál es tu celular? debe ser de 10 dígitos, ejemplo: 55-1234-5678');
        
    },
    function (session, results) {
        var email = session.dialogData.email;
        console.log(email);        
        var matched = results.response.match(/\d+/g);
        var number = matched ? matched.join('') : '';
        session.dialogData.phoneNumber = number; // Save the number.
              
        console.log(session.dialogData.phoneNumber, typeof(session.dialogData.phoneNumber),);        
        
        
        // Se registra al usuario en Authy
        client.registerUser({
            countryCode: 'MX',
            email: email,
            phone: session.dialogData.phoneNumber
        }        
        ,
        function (err, res) {
            if (err) {
                console.log(`Error al Registrar Usuario`);
            }
            else {
                console.log(`Usuario Registrado:`, res);
                var authyUser = res.user.id;
                var registro = {
                    PartitionKey : {'_': 'Usuario registrado', '$':'Edm.String'},
                    RowKey: {'_': email , '$':'Edm.String'},
                    AuthyID: {'_': authyUser , '$':'Edm.String'}
                };
                tableService.insertOrReplaceEntity(config.table3, registro, function(error) {
                if(!error) {
                    console.log('Entity Authy inserted');   // Entity inserted
                }
                }); 
                nodeoutlook.sendEmail({
                    auth: {
                        user: `${config.email}`,
                        pass: `${config.pass}`,
                    }, from: `${config.email}`,
                    to: `${email}`,
                    subject: 'Código de validación - Servicio de Doble Autenticación',
                    html: `<p>Tu código de seguridad es:<br><h3> <b>${authyUser}</b> </h3> </p><br><p>Saludos.</p>`,
                    text: 'This is text version!',});
            }
        }
    ),
            
        
        // Se valida la autenticación del usuario con el código 
        session.send('Enviamos un código de validación a tu correo.');
        builder.Prompts.text(session, 'Por favor, **introduce el código enviado**');
    },
    function (session, results) {
        session.dialogData.token = results.response;
        console.log(config.table3, session.dialogData.email);
        
        tableService.retrieveEntity(config.table3, 'Usuario registrado', session.dialogData.email, function(error, result, response) {
            let authyId1 = result.AuthyID._;
            console.log('Id tabla'+authyId1 + typeof(authyId1)) ;
            console.log('Id Proporcionado'+session.dialogData.token+ typeof(session.dialogData.token) ) ;
            if (authyId1 == session.dialogData.token) {
                session.endDialog('Tu cuenta fue registrada correctamente.')
            } else {
                client.deleteUser({ authyId: authyId1 });
                session.endDialog('No pudimos validar el código proporicionado, vuelve a realizar el proceso de registro.');
            }
        });
    }

]