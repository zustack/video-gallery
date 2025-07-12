package middleware

import (
	"fmt"
	"image-gallery/database"
	"image-gallery/utils"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt"
)

func User(c *fiber.Ctx) error {
	tokenString := utils.ExtractTokenFromHeader(c.Get("Authorization"))

	if tokenString == "" {
		return c.Status(401).SendString("You are not logged in.")
	}

	token, err := utils.ParseAndValidateToken(tokenString, os.Getenv("SECRET_KEY"))
	if err != nil {
		return c.Status(403).SendString(err.Error())
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return c.Status(403).SendString("Invalid token claim.")
	}

	user, err := database.GetUserByID(fmt.Sprint(claims["user_id"]))
	if err != nil {
		if err.Error() == "No user found with id "+fmt.Sprint(claims["user_id"]) {
			return c.Status(403).SendString("No user found with this token.")
		}
		return c.Status(403).SendString(err.Error())
	}

	c.Locals("user", &user)
	return c.Next()
}
