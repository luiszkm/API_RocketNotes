const knex = require("../database/knex")
const AppError = require("../utils/appError")
const DiskStorage = require("../providers/DiskStorage")
const { diskStorage } = require("multer")
class UserAvatarController {
  async update(request, response) {
    const user_id = request.user.id
    const avatarFileName = request.file.filename

    const diskStorage = new DiskStorage()

    const user = await knex("users")
      .where({ id: user_id }).first()

    if (!user) {
      throw new AppError("Somente usuários autenticados pode alterar a foto de perfil", 401)
    }
    if (user.avatar) {
      await diskStorage.deleFile(user.avatar)
    }

    const filename = await diskStorage.saveFile(avatarFileName)
    user.avatar = filename

    await knex("users").update(user).where({ id: user_id})

    return response.json(user)

  }


}
module.exports = UserAvatarController;