package schemas

import "time"

// User schemas
type User struct {
	ID         uint   `json:"id"`
	TelegramID int64  `json:"telegram_id"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name,omitempty"`
	Username   string `json:"username,omitempty"`
}

// Question schemas
type Question struct {
	ID      uint   `json:"id"`
	UserID  uint   `json:"user_id"`
	ClassID uint   `json:"class_id"`
	Text    string `json:"text"`
	User    User   `json:"user"`
}

// RSVP schemas
type RSVP struct {
	ID      uint   `json:"id"`
	UserID  uint   `json:"user_id"`
	ClassID uint   `json:"class_id"`
	Status  string `json:"status"`
	User    User   `json:"user"`
}

type RsvpRequest struct {
	TelegramID int64  `json:"telegram_id"`
	Status     string `json:"status"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name,omitempty"`
	Username   string `json:"username,omitempty"`
}

// Class schemas
type Class struct {
	ID          uint       `json:"id"`
	Topic       string     `json:"topic"`
	Description string     `json:"description"`
	ClassTime   time.Time  `json:"class_time"`
	CreatorID   uint       `json:"creator_id"`
	Creator     User       `json:"creator"`
	RSVPs       []RSVP     `json:"rsvps"`
	Questions   []Question `json:"questions"`
}

type ClassCreateRequest struct {
	Topic              string    `json:"topic"`
	Description        string    `json:"description"`
	ClassTime          time.Time `json:"class_time"`
	CreatorTelegramID  int64     `json:"creator_telegram_id"`
	CreatorFirstName   string    `json:"creator_first_name"`
	CreatorLastName    string    `json:"creator_last_name,omitempty"`
	CreatorUsername    string    `json:"creator_username,omitempty"`
}

type ClassUpdateRequest struct {
	UpdaterTelegramID int64       `json:"updater_telegram_id"`
	UpdateData        ClassUpdate `json:"update_data"`
}

type ClassUpdate struct {
	Topic       *string    `json:"topic,omitempty"`
	Description *string    `json:"description,omitempty"`
	ClassTime   *time.Time `json:"class_time,omitempty"`
}
