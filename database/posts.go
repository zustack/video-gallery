package database

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"
)

type Post struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	Body      string `json:"body"`
	MediaUrl  string `json:"media_url"`
	Thumbnail string `json:"thumbnail"`
	Status    string `json:"status"`
	FileID    string `json:"file_id"`
	CreatedAt string `json:"created_at"`
}

func GetPostByFileID(fileID string) (Post, error) {
	var p Post
	row := DB.QueryRow(`SELECT id, user_id, body, media_url, thumbnail, status, 
  file_id, created_at FROM posts WHERE file_id = ?`, fileID)
	if err := row.Scan(&p.ID, &p.UserID, &p.Body, &p.MediaUrl, &p.Thumbnail,
  &p.Status, &p.FileID, &p.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
      return p, fmt.Errorf("no post found with the file ID: %s", fileID)
		}
		return p, fmt.Errorf("an unexpected error occurred: %v", err)
	}
	return p, nil
}

func GetPostByID(id string) (Post, error) {
	var p Post
	row := DB.QueryRow(`SELECT id, user_id, body, media_url, thumbnail, status, file_id, 
  created_at FROM posts WHERE id = ?`, id)
	if err := row.Scan(&p.ID, &p.UserID, &p.Body, &p.MediaUrl, &p.Thumbnail, &p.Status, 
  &p.FileID, &p.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return p, fmt.Errorf("no post found with the id %s", id)
		}
		return p, fmt.Errorf("an unexpected error occurred: %v", err)
	}
	return p, nil
}

func DeletePost(id string) error {
	result, err := DB.Exec(`DELETE FROM posts WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("Failed to delete file: %v", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("An unexpected error occurred: %v", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("No post found with the id %v", id)
	}
	return nil
}

func GetPosts() ([]Post, error) {
	var posts []Post
	rows, err := DB.Query(`SELECT * FROM posts WHERE status = 'success' ORDER BY created_at DESC;`)
	if err != nil {
		return nil, fmt.Errorf("error: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var p Post
		err := rows.Scan(
			&p.ID,
			&p.UserID,
			&p.Body,
			&p.MediaUrl,
			&p.Thumbnail,
			&p.Status,
			&p.FileID,
			&p.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error: %v", err)
		}
		posts = append(posts, p)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error: %v", err)
	}
	return posts, nil
}

func UpdatePost(fileID, mediaURL, thumbnail, status string) error {
	result, err := DB.Exec(`UPDATE posts SET media_url = ?, thumbnail = ?, status = ? WHERE file_id = ?`, mediaURL, thumbnail, status, fileID)
	if err != nil {
		return fmt.Errorf("An unexpected error occurred: %v", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("An unexpected error occurred: %v", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("No post found with file id: %s", fileID)
	}
	return nil
}

func CreatePost(userID, body, fileID string) error {
	id := uuid.New()
	_, err := DB.Exec(`INSERT INTO posts (id, user_id, body, 
  status, file_id) 
  VALUES (?, ?, ?, ?, ?)`,
		id, userID, body, "pending", fileID)
	if err != nil {
		return fmt.Errorf("An unexpected error occurred: %v", err)
	}
	return nil
}
