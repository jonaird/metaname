planariette = require('planariette')
Buffer = require('buffer').Buffer
bsv = require('bsv');
Message = require('bsv/Message')
bitbus = require('run-bitbus')
bitsocket = require('bitsocket-connect')


var protocolPrefix = '14FLDQhDGmxKCsX79qEtMm36YcdUVyGQm5'


exports.getNames = function (token, paymails) {
    return new Promise(resolve => {
        query = {
            q: {
                find: {
                    "out.tape.cell.s":protocolPrefix,
                    $or: []
                },
                project:{
                    'tx.h':1,
                    'out':1
                }
            }
        }

        for (var paymail of paymails) {
            query.q.find.$or.push({'out.tape.cell.s': paymail})
        }
        var names = {}
        var toReturn = []
        function process(tx) {
            
            var name = serialize(tx)
            if (name) {
                names[tx.address] = name
            }
        }

        function callback() {

            keys = Object.keys(names)

            keys.forEach(key => {
                if (verify(names[key])) {
                    toReturn.push({
                        name: names[key].name,
                        paymail: names[key].paymail,
                        publicKey: names[key].publicKey,
                        tx:names[key].tx
                    })
                }
            })
            resolve(toReturn)

        }
        planariette.getAll(token, query, process, true).then(callback).catch(er=>console.log(er))
    })


}

exports.getAllNames = function (token, process, callback) {
    query = {
        q:
        {
            find: {
                'out.tape.cell.s': protocolPrefix
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
            var valid = false
            if (name) {
                valid = verify(name)
            }
            delete name.address
            delete name.signature
            if (valid && process.constructor.name == 'AsyncFunction') {
                process(name).then(res => resolve())
            } else if (valid) {
                process(name)
                resolve()
            }
        })
    }

    planariette.start(token, query, processFunc, callback, true)
}


function findCorrectCell(tx) {
    var correctCell;
    for (var output of tx.out) {
        for (var cellObj of output.tape) {
            //making sure these are not null before checking if protocol prefix
            cell = cellObj.cell
            if (cell[0].s&& cell[0].s == protocolPrefix) {
                correctCell = cell
                break
            }
        }
        if (correctCell) {
            break
        }

    }
    return correctCell
}

function serialize(tx) {

    var cell = findCorrectCell(tx)
    var name;
    try {
        var nameText = cell[1].s
        if (nameText.length <= 50) {
            var publicKey = Buffer.from(cell[3].b, 'base64').toString('hex')
            var address = new bsv.PublicKey(publicKey).toAddress().toString()
            name = {
                name: nameText,
                paymail: cell[2].s,
                publicKey,
                address,
                signature: cell[4].s,
                tx:tx.tx.h
            }
        }

    } catch (err) {

    }

    return name
}

function verify(name){
    return Message.verify(name.name, name.address, name.signature);
}


