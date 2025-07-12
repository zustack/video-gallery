package utils

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

func DeleteFile(fileID string) error {
	secondsToByValid := 60
	expDuration := time.Duration(secondsToByValid) * time.Second
	signJWT, err := GenerateJWT(os.Getenv("API_KEY_ZUSTACK"), "write", "", int(expDuration))
	if err != nil {
		return err
	}

	endpoint := fmt.Sprintf("%s/files/%s/%s", os.Getenv("ZUSTACK_URL"), fileID, os.Getenv("BUCKET_ID"))
	req, err := http.NewRequest("DELETE", endpoint, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", signJWT))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("unexpected status code %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}
