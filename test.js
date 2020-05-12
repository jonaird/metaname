m = require('./index.js')
b = require('run-bitbus')
p = require('planariette')

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
// p.getAll(token, query, tx=>console.log(tx), 'https://bob.bitbus.network/block').then(()=>console.log('done'))
m.getNames(token,['jonathanaird@moneybutton.com']).then(names=>console.log(names))
// m.getAllNames(token, name=>console.log(name), ()=>console.log('done'))