# metaname
 
Metaname is an open protocol for linking a paymail to a display name for use in applications on BSV. 
See [metaname.network](https://www.metaname.network). 
 
Rather than providing a public API endpoint for getting metanames (which are only 50 bytes in length max), metaname is also a Nodejs package that uses [Planaria endpoints](https://grid.planaria.network/) to get metanames for your backend. If you aren't using Node, consider using
a Google Cloud Function or equivalent service to create your own API. 

## Protocol Spec 
```
OP_FALSE 
OP_RETURN 
14FLDQhDGmxKCsX79qEtMm36YcdUVyGQm5 
[name] utf-8 encoded, 50 chars max
[paymail] 
[pubkey] 
[signature]
```
 
## Installation 
 
`npm i --save metaname-client` 
 
## Usage 
 
```
metaname = require('metaname-client') 
 
var token = 'YOUR PLANARIA API TOKEN'

//gets the *latest* names for a list of paymails.  
metaname.getNames(token, ['jonathanaird@moneybutton.com']).then(names=>console.log(names)) 
 
function process(name){
    console.log(name)
} 
 
function callback(){
    console.log('switched to listen mode')
}

//will call process on all names in the history of the metaname protocol
//when finished crawling, it will start listening for new names using bitsocket
metaname.getAllNames(token, process, callback) 
```
 
Name objects are returned in the following format. They have been verified
against the signature included in the transaction. However, this library
does not check whether the public key is the correct one for the corresponding
paymail. The public key is included so you can check yourself. 
 
```
{
    name: 'Jonathan Aird',
    paymail: 'jonathanaird@moneybutton.com',
    publicKey:'032107bc529a107da5ac284bb2a582d8ae559bd5701d80ecb2341c609bb7765c50',
    txid:'4f44f9079a6bebd11b9f9031fa98a9248d20e1723e62e80af673fbb2130d227e'
}
```