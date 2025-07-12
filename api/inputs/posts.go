package inputs

import "fmt"

type CreatePostInput struct {
	Body   string `json:"body"`
	FileID string `json:"file_id"`
}

func CreatePost(input CreatePostInput) (CreatePostInput, error) {
	if input.Body == "" {
		return CreatePostInput{}, fmt.Errorf("The body is required.")
	}
	if len(input.Body) > 55 {
		return CreatePostInput{}, fmt.Errorf("The body should not have more than 55 characters.")
	}
	if len(input.FileID) > 255 {
		return CreatePostInput{}, fmt.Errorf("The file id should not have more than 255 characters.")
	}
	return CreatePostInput{
		Body:   input.Body,
		FileID: input.FileID,
	}, nil
}
