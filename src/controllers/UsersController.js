const { hash, compare } = require("bcryptjs")
const AppError = require("../utils/appError")
const sqliteConnection = require("../database/sqlite")
// const { use } = require("../routes")

class UserController {
  /*
    * index- GET para listar vários registros
    * show - GET para exibir um registro especifco
    * create - POST para criar um registro
    * update - PUT para atualizar um registro
    * delete - DELETE remover um registro
  */
  async create(request, response) {
    const { name, email, password } = request.body

    const database = await sqliteConnection()

    const userExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if (userExists) {
      throw new AppError("Este email já esta cadastrado")
    }
    // if (!name) {
    //   throw new AppError('O nome é obrigatório!')
    // }
    const hashedPAssword = await hash(password, 8)
    await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPAssword])
    response.status(200).json({ name, email, password })
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body
    
    const user_id = request.user.id
    const database = await sqliteConnection()

    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id])
    if (!user) {
      throw new AppError("Usuário não encontrado")
    }
    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este email ja esta em uso")
    }
    user.name = name ?? user.name
    user.email = email ?? user.email
    if (password && !old_password) {
      throw new AppError('Voce precisa informar a senha antiga para redefinir a senha')
    }
    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new AppError('senha não confere')
      }
      user.password = await hash(password, 8)
    }
    await database.run(`
      UPDATE users SET
      name = ?,
      email = ?,
      password = ?,
      updated_at = DATETIME('now')
      WHERE id = ?
    `, [user.name, user.email, user.password, user_id])

    return response.json()
  }
}
module.exports = UserController