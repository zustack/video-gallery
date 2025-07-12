package database

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	CreatedAt string `json:"created_at"`
}

func GetUserByID(id string) (User, error) {
	var u User
	row := DB.QueryRow(`SELECT * FROM users WHERE id = ?`, id)
	if err := row.Scan(&u.ID, &u.Email, &u.Password, &u.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return u, fmt.Errorf("No account found with the id %s", id)
		}
		return u, fmt.Errorf("An unexpected error occurred: %v", err)
	}
	return u, nil
}

func GetUserByEmail(email string) (User, error) {
	var u User
	row := DB.QueryRow(`SELECT * FROM users WHERE email = ?`, email)
	if err := row.Scan(&u.ID, &u.Email, &u.Password, &u.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return u, fmt.Errorf("No account found with the id %s", email)
		}
		return u, fmt.Errorf("An unexpected error occurred: %v", err)
	}
	return u, nil
}

func CreateUser(email, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("Failed to hash the password: %v", err)
	}
	id := uuid.New()
	_, err = DB.Exec(`INSERT INTO users (id, email, password) VALUES (?, ?, ?)`,
		id, email, string(hashedPassword))
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed: users.email") {
			return fmt.Errorf("The email: %s already exists", email)
		} else {
			return fmt.Errorf("An unexpected error occurred: %v", err)
		}
	}
	return nil
}
