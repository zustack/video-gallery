package inputs

import "fmt"

type AuthInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Auth(input AuthInput) (AuthInput, error) {
	if input.Email == "" {
		return AuthInput{}, fmt.Errorf("The email is required.")
	}
	if len(input.Email) > 55 {
		return AuthInput{}, fmt.Errorf("The email should not have more than 55 characters.")
	}

	if input.Password == "" {
		return AuthInput{}, fmt.Errorf("The password is required.")
	}
	if len(input.Password) > 55 {
		return AuthInput{}, fmt.Errorf("The password should not have more than 55 characters.")
	}
	if len(input.Password) < 8 {
		return AuthInput{}, fmt.Errorf("The password should have at least 8 characters.")
	}

	return AuthInput{
		Email:    input.Email,
		Password: input.Password,
	}, nil
}
