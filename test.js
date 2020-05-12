m = require('./index.js')
b = require('run-bitbus')
p = require('planariette')

var token = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiIxR1VlQnVFUEFSOTkxeGlFeW5SbmFjb1BZeTJSa0NZeGZ2IiwiaXNzdWVyIjoiZ2VuZXJpYy1iaXRhdXRoIn0.SURuOVZVejFJNWw4TXlRTk9HSiswNUFiemd1T0xvRTl2cTV0Nm9qVnVSejRNMExsb3YxT3pEaHVwZWNybk51allVT1R0L0FiRmdDN3MyUk4vbGJQN2dRPQ'


query = {
    q:{
        find:{
            'out.tape.cell.s':'14FLDQhDGmxKCsX79qEtMm36YcdUVyGQm5',
            $or:[
                {'out.tape.cell.s':'jonathanaird@moneybutton.com'}
            ]
        }
    }
}
//p.getAll(token, query, tx=>console.log(tx), 'https://bob.bitbus.network/block').then(()=>console.log('done'))
// m.getNames(token,['jonathanaird@moneybutton.com']).then(names=>console.log(names))
m.getAllNames(token, name=>console.log(name), ()=>console.log('done'))