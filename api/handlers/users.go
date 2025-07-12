package handlers

import (
	"image-gallery/api/inputs"
	"image-gallery/database"
	"image-gallery/utils"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func Login(c *fiber.Ctx) error {
	var payload inputs.AuthInput
	err := c.BodyParser(&payload)
	if err != nil {
		return c.Status(400).SendString(err.Error())
	}

	payloadToClean := inputs.AuthInput{
		Email:    payload.Email,
		Password: payload.Password,
	}

	cleanInput, err := inputs.Auth(payloadToClean)
	if err != nil {
		return c.Status(400).SendString(err.Error())
	}

	user, err := database.GetUserByEmail(cleanInput.Email)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(cleanInput.Password))
	if err != nil {
		return c.Status(403).SendString("Wrong Password!")
	}

	secondsToByValid := 60 * 60 * 24 * 30
	expDuration := time.Duration(secondsToByValid) * time.Second
	now := time.Now().UTC()
	exp := now.Add(expDuration).Unix()
	token, err := utils.GenerateJWT(os.Getenv("SECRET_KEY"), "", user.ID, secondsToByValid)
	if err != nil {
		return c.Status(401).SendString(err.Error())
	}

	return c.Status(200).JSON(fiber.Map{
		"token":  token,
		"exp":    exp,
		"userId": user.ID,
		"email":  user.Email,
	})
}

func Signup(c *fiber.Ctx) error {
	var payload inputs.AuthInput
	err := c.BodyParser(&payload)
	if err != nil {
		return c.Status(400).SendString(err.Error())
	}

	payloadToClean := inputs.AuthInput{
		Email:    payload.Email,
		Password: payload.Password,
	}

	cleanInput, err := inputs.Auth(payloadToClean)
	if err != nil {
		return c.Status(400).SendString(err.Error())
	}

	err = database.CreateUser(cleanInput.Email, cleanInput.Password)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	return c.SendStatus(200)
}
