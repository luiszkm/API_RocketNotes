const { Router } = require("express")

const UserController = require("../controllers/UsersController")

const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const uploadConfig = require("../configs/upload")

const multer = require("multer")

const userController = new UserController()

const userRoutes = Router()

const upload = multer(uploadConfig.MULTER)

userRoutes.post('/', userController.create)
userRoutes.put('/', ensureAuthenticated, userController.update)

userRoutes.patch("/avatar", ensureAuthenticated, upload.single("avatar"), (request, response) => {
  console.log(request.file.filename);
  response.json()
})

module.exports = userRoutes