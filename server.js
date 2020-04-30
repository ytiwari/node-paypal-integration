// import the required packages 

var express = require('express'); 
var path = require('path'); 
var app = express(); 
var paypal = require('paypal-rest-sdk');


// configure paypal with the credentials you got when you created your paypal app
paypal.configure({
  'mode': 'sandbox', //sandbox or live 
  'client_id': 'AZuTWNzm_uVoWU8RUXtuVegdMqAp_9YYJD09Bh8XZX2cRVrgc37l9QX6wIsro2qIzppP_YFDiRmWaf2D', // please provide your client id here 
  'client_secret': 'EMXVmJ-B_KynDYFX6LXyP-yoMCe-aekeJv98qAaz3pdjMcnmH1TrqT9ydMxFSsftGJRYlq9XXZlrhodx' // provide your client secret here 
});


// set public directory to serve static html files 
app.use('/', express.static(path.join(__dirname, 'public'))); 


// redirect to store when user hits http://localhost:3000
app.get('/' , (req , res) => {
    res.redirect('/index.html'); 
})

// start payment process 
app.get('/buy' , ( req , res ) => {
	// create payment object 
    var payment = {
            "intent": "authorize",
	"payer": {
		"payment_method": "paypal"
	},
	"redirect_urls": {
		"return_url": "http://127.0.0.1:3000/success",
		"cancel_url": "http://127.0.0.1:3000/err"
	},
	"transactions": [{
		"amount": {
			"total": 39.00,
			"currency": "USD"
		},
		"description": " a book on mean stack "
	}]
    }
	
	
	// call the create Pay method 
    createPay( payment ) 
        .then( ( transaction ) => {
            var id = transaction.id; 
            var links = transaction.links;
            var counter = links.length; 
            while( counter -- ) {
                if ( links[counter].method == 'REDIRECT') {
					// redirect to paypal where user approves the transaction 
                    return res.redirect( links[counter].href )
                }
            }
        })
        .catch( ( err ) => { 
            console.log( err ); 
            res.redirect('/err');
        });
}); 


// success page 
app.get('/success' , (req ,res ) => {
    console.log(req.query); 
    res.redirect('/success.html'); 
})

// error page 
app.get('/err' , (req , res) => {
    console.log(req.query); 
    res.redirect('/err.html'); 
})

// app listens on 3000 port 
app.listen( 3000 , () => {
    console.log(' app listening on 3000 '); 
})



// helper functions 
var createPay = ( payment ) => {
    return new Promise( ( resolve , reject ) => {
        paypal.payment.create( payment , function( err , payment ) {
         if ( err ) {
             reject(err); 
         }
        else {
            resolve(payment); 
        }
        }); 
    });
}						