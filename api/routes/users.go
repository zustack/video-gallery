package routes

import (
	"image-gallery/api/handlers"

	"github.com/gofiber/fiber/v2"
)

func UserRoutes(app *fiber.App) {
	app.Post("/users/login", handlers.Login)
	app.Post("/users/signup", handlers.Signup)
}
