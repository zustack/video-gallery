package routes

import (
	"image-gallery/api/handlers"
	"image-gallery/api/middleware"

	"github.com/gofiber/fiber/v2"
)

func PostRoutes(app *fiber.App) {
	app.Post("/posts/signurl/:scope", middleware.User, handlers.SignUrl)
  app.Delete("/posts/:postID", middleware.User, handlers.DeletePost)
  app.Get("/posts/:postID", middleware.User, handlers.GetPostByID)
	app.Post("/posts/webhook", handlers.WebhookZustack)
	app.Get("/posts", middleware.User, handlers.GetPosts)
	app.Post("/posts", middleware.User, handlers.CreatePost)
}
