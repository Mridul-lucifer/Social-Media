const fs = require('fs')

const readDatabase = (Database) => {
    if(!fs.existsSync(Database)){
        fs.writeFileSync(Database,JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(Database,'utf-8'))
}

const writeDatabase = (Database , Data)=>{
    fs.writeFileSync(Database,JSON.stringify(Data,null,2))
}

module.exports = {readDatabase , writeDatabase};