package db

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"github.com/korjavin/tgwebapp/pkg/models"
	"github.com/korjavin/tgwebapp/pkg/schemas"
)

var DB *gorm.DB

func Init() {
	var err error
	DB, err = gorm.Open(sqlite.Open("sql_app.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database")
	}

	DB.AutoMigrate(&models.User{}, &models.Class{}, &models.RSVP{}, &models.Question{})
}

// User CRUD
func GetUser(userID uint) (*models.User, error) {
	var user models.User
	err := DB.First(&user, userID).Error
	return &user, err
}

func GetUserByTelegramID(telegramID int64) (*models.User, error) {
	var user models.User
	err := DB.Where("telegram_id = ?", telegramID).First(&user).Error
	return &user, err
}

func CreateUser(user *models.User) (*models.User, error) {
	err := DB.Create(user).Error
	return user, err
}

// Class CRUD
func GetClasses(skip, limit int) ([]models.Class, error) {
	var classes []models.Class
	err := DB.Preload("Creator").Preload("RSVPs.User").Offset(skip).Limit(limit).Find(&classes).Error
	return classes, err
}

func CreateClass(class *models.Class) (*models.Class, error) {
	err := DB.Create(class).Error
	return class, err
}

func DeleteClass(classID uint) error {
	return DB.Delete(&models.Class{}, classID).Error
}

func UpdateClass(classID uint, updateData *schemas.ClassUpdate) (*models.Class, error) {
	var class models.Class
	if err := DB.First(&class, classID).Error; err != nil {
		return nil, err
	}

	if updateData.Topic != nil {
		class.Topic = *updateData.Topic
	}
	if updateData.Description != nil {
		class.Description = *updateData.Description
	}
	if updateData.ClassTime != nil {
		class.ClassTime = *updateData.ClassTime
	}

	err := DB.Save(&class).Error
	return &class, err
}

// RSVP CRUD
func CreateOrUpdateRSVP(rsvp *models.RSVP) (*models.RSVP, error) {
	var existingRSVP models.RSVP
	err := DB.Where("user_id = ? AND class_id = ?", rsvp.UserID, rsvp.ClassID).First(&existingRSVP).Error

	if err == nil {
		existingRSVP.Status = rsvp.Status
		err = DB.Save(&existingRSVP).Error
		return &existingRSVP, err
	}

	if err == gorm.ErrRecordNotFound {
		err = DB.Create(rsvp).Error
		return rsvp, err
	}

	return nil, err
}
