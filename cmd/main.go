package main

import (
	"fmt"
	"image-gallery/api"
	"image-gallery/database"
	"image-gallery/utils"
	"log"
	"os"
)

func main() {
	required := []string{"DB_PATH", "SECRET_KEY", "API_KEY_ZUSTACK", "BUCKET_ID", "ZUSTACK_URL"}
	if err := utils.CheckRequiredEnv(required); err != nil {
		fmt.Println("Environment error:", err)
		os.Exit(1)
	}
	err := database.ConnectDB(os.Getenv("DB_PATH"))
	if err != nil {
		fmt.Println("DB connection error:", err)
		os.Exit(1)
	}
	app := api.Server()
	log.Fatal(app.Listen(":8081"))
}
