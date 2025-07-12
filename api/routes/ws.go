package routes

import (
	"image-gallery/api/ws"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func WsRoutes(app *fiber.App) {
	app.Get("/ws", websocket.New(ws.WebsocketHandler))
}
