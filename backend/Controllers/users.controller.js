const usuarios = [
  { username: 'ylazo', password: 'password_0', userId: 'userId' },
  { username: 'admin', password: 'password_0', userId: 'admin' }
]

const findOne = (userFind) => {
  return new Promise((resolve, reject) => {
    const found = usuarios.find(user => {
      for (const prop in userFind) {
        if (userFind[prop] !== user[prop]) return false
      }
      return true
    })

    if (found) {
      resolve(found)
    } else {
      reject({ message: `Usuario o contraseña incorrectos` })
    }
  })
}

module.exports = {
  findOne
}