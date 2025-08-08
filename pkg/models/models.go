package models

import (
	"time"
)

type User struct {
	ID         uint   `gorm:"primaryKey"`
	TelegramID int64  `gorm:"uniqueIndex"`
	FirstName  string `gorm:"size:255"`
	LastName   string `gorm:"size:255"`
	Username   string `gorm:"size:255"`
	Classes    []Class `gorm:"foreignKey:CreatorID"`
	RSVPs      []RSVP
	Questions  []Question
}

type Class struct {
	ID          uint      `gorm:"primaryKey"`
	Topic       string    `gorm:"size:255;index"`
	Description string    `gorm:"type:text"`
	ClassTime   time.Time
	CreatorID   uint
	Creator     User `gorm:"foreignKey:CreatorID"`
	RSVPs       []RSVP
	Questions   []Question
}

type RSVP struct {
	ID      uint   `gorm:"primaryKey"`
	UserID  uint
	User    User
	ClassID uint
	Class   Class
	Status  string `gorm:"size:50"` // "yes", "no", "tentative"
}

type Question struct {
	ID      uint   `gorm:"primaryKey"`
	UserID  uint
	User    User
	ClassID uint
	Class   Class
	Text    string `gorm:"type:text"`
}
