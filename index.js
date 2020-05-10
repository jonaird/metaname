planariette = require('planariette')
Buffer = require('buffer').Buffer
bsv = require('bsv');
Message = require('bsv/Message')
bitbus = require('run-bitbus')
bitsocket = require('bitsocket-connect')


var protocolPrefix = '1BHj8PWXFzNbhUjNwYyj5oSMfoWpWceCse'

function findCorrectTape(tx){
    var correctTape;

    for(var output of tx.out){
        for(var tape of output.tape){
            //making sure these are not null before checking if protocol prefix
            if(tape[1]&&tape[1].cell[0].s&&tape[1].cell[0].s==protocolPrefix){
                correctTape=tape
                break
            } 
        }
        if(correctTape){
            break
        }

    }
    
    return correctTape
}

function serialize(tx) {

    var tape=findCorrectTape(tx)
    var name;
    try {
        var nameText = tape.cell[1].s
        if (nameText.length <= 50) {
            var publicKey = Buffer.from(tape.cell[3].b, 'base64').toString('hex')
            var address = new bsv.PublicKey(publicKey).toAddress().toString()
            name = {
                name: nameText,
                paymail: tape.cell[2].s,
                publicKey,
                address,
                signature: tape.cell[4].s
            }
        }

    } catch (err) {

    }

    return name
}

function verify(tx) {
    return Message.verify(tx.name, tx.address, tx.signature);
}



exports.getNames = function (paymails, token) {
    return new Promise(resolve => {
        query = {
            q: {
                find: {
                    $or: []
                }
            }
        }

        for (var paymail of paymails) {
            query.q.find.$or[query.q.find.$or.length]={ 
                $and:[
                    {'out.tape.cell.s': 'bitnametest'},
                    {'out.tape.cell.s': paymail}
                ]
            }
        }
        var names = {}
        var toReturn = []
        console.log(query.q.find.$or)
        function process(tx) {
            name = serialize(tx)
            if (name) {
                names[tx.address] = name
            }
        }

        function callback() {

            keys = Object.keys(names)

            keys.forEach(key => {
                if (verify(names[key])) {
                    toReturn[toReturn.length] = {
                        paymail: names[key].paymail,
                        name: names[key].name,
                        publicKey: names[key].publicKey
                    }
                }
            })

        }

        bitbus.run(token, query, process, () => {
            bitsocket.crawlRecent(token, query, process, () => {
                callback();
                resolve(toReturn);
            },'https://bob.bitsocket.network/crawl')

        },'https://bob.bitbus.network/block')
    })


}

exports.getAllNames = function (token, process, callback) {
    query = {
        q:
        {
            find: {
                'out.tape.s': protocolPrefix
            },
            project: {
                "out": 1,
                "tx.h": 1
            }
        }
    }

    async function processFunc(tx) {
        return new Promise(resolve => {

            var name = serialize(tx);
            var valid=false
            if(name){
                valid=verify(name)
            }
            if (valid && process.constructor.name == 'AsyncFunction' ) {
                process(name).then(res => resolve())
            } else if (valid) {
                process(name)
                resolve()
            }
        })
    }

    planariette.start(token, query, processFunc, callback)
}
