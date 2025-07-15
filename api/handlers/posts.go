package handlers

import (
	"fmt"
	"image-gallery/api/inputs"
	"image-gallery/api/ws"
	"image-gallery/database"
	"image-gallery/utils"
	"os"

	"github.com/gofiber/fiber/v2"
)

func GetPostByID(c *fiber.Ctx) error {
  postID := c.Params("postID")
  post, err := database.GetPostByID(postID)
  if err != nil {
    return c.Status(500).SendString(err.Error())
  }
  return c.JSON(post)
}

func SignUrl(c *fiber.Ctx) error {
	scope := c.Params("scope")

	secondsToByValid := 60
	token, err := utils.GenerateJWT(os.Getenv("API_KEY_ZUSTACK"), scope, "", secondsToByValid)
	if err != nil {
		return c.Status(401).SendString(err.Error())
	}

	return c.Status(200).JSON(fiber.Map{
		"jwt": token,
	})
}

func DeletePost(c *fiber.Ctx) error {
	user := c.Locals("user").(*database.User)
	postID := c.Params("postID")
	post, err := database.GetPostByID(postID)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	if user.ID != post.UserID {
		return c.Status(403).SendString("You don't have permission to delete this post")
	}

	err = utils.DeleteFile(post.FileID)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	err = database.DeletePost(postID)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	return c.SendStatus(200)
}

func WebhookZustack(c *fiber.Ctx) error {
	fileID := c.Get("file_id")
	mediaURL := c.Get("media_url")
	status := c.Get("status")

	tokenString := utils.ExtractTokenFromHeader(c.Get("Authorization"))

	if tokenString == "" {
		return c.Status(401).SendString("You are not logged in.")
	}

	_, err := utils.ParseAndValidateToken(tokenString, os.Getenv("API_KEY_ZUSTACK"))
	if err != nil {
		return c.Status(403).SendString(err.Error())
	}

  thumbnail := fmt.Sprintf("https://assets.zustack.com/private/weur/%s/%s/thumbnail.webp", os.Getenv("BUCKET_ID"), fileID)
	err = database.UpdatePost(fileID, mediaURL, thumbnail, status)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

  post, err := database.GetPostByFileID(fileID)
  if err != nil {
		return c.Status(500).SendString(err.Error())
  }

  ws.SendToUser(post.UserID, status)

	return c.SendStatus(200)
}

func GetPosts(c *fiber.Ctx) error {
	posts, err := database.GetPosts()
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	secondsToByValid := 60 * 60
	token, err := utils.GenerateJWT(os.Getenv("API_KEY_ZUSTACK"), "read", "", secondsToByValid)
	if err != nil {
		return c.Status(401).SendString(err.Error())
	}
	return c.Status(200).JSON(fiber.Map{
		"data": posts,
		"jwt":  token,
	})
}

func CreatePost(c *fiber.Ctx) error {
	user := c.Locals("user").(*database.User)
	var payload inputs.CreatePostInput
	err := c.BodyParser(&payload)
	if err != nil {
		return c.Status(400).SendString(err.Error())
	}

	payloadToClean := inputs.CreatePostInput{
		Body:   payload.Body,
		FileID: payload.FileID,
	}

	cleanPayload, err := inputs.CreatePost(payloadToClean)
	if err != nil {
		return c.Status(400).SendString(err.Error())
	}

	err = database.CreatePost(user.ID, cleanPayload.Body, cleanPayload.FileID)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	return c.SendStatus(200)
}
