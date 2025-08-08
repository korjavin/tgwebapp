package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/korjavin/tgwebapp/pkg/db"
	"github.com/korjavin/tgwebapp/pkg/models"
	"github.com/korjavin/tgwebapp/pkg/schemas"
)

func main() {
	db.Init()
	r := gin.Default()

	// Serve static files
	r.Static("/static", "./static")
	r.GET("/", func(c *gin.Context) {
		c.File("./static/index.html")
	})

	// API Endpoints
	api := r.Group("/api")
	{
		api.POST("/classes", createClass)
		api.GET("/classes", getClasses)
		api.POST("/classes/:class_id/rsvp", rsvpToClass)
		api.PUT("/classes/:class_id", updateClass)
		api.DELETE("/classes/:class_id", deleteClass)
	}

	r.Run(":8000")
}

func createClass(c *gin.Context) {
	var req schemas.ClassCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := db.GetUserByTelegramID(req.CreatorTelegramID)
	if err != nil {
		user = &models.User{
			TelegramID: req.CreatorTelegramID,
			FirstName:  req.CreatorFirstName,
			LastName:   req.CreatorLastName,
			Username:   req.CreatorUsername,
		}
		user, err = db.CreateUser(user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	}

	class := &models.Class{
		Topic:       req.Topic,
		Description: req.Description,
		ClassTime:   req.ClassTime,
		CreatorID:   user.ID,
	}

	newClass, err := db.CreateClass(class)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create class"})
		return
	}

	c.JSON(http.StatusOK, newClass)
}

func getClasses(c *gin.Context) {
	skip, _ := strconv.Atoi(c.DefaultQuery("skip", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	classes, err := db.GetClasses(skip, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get classes"})
		return
	}

	c.JSON(http.StatusOK, classes)
}

func rsvpToClass(c *gin.Context) {
	classID, err := strconv.ParseUint(c.Param("class_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID"})
		return
	}

	var req schemas.RsvpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := db.GetUserByTelegramID(req.TelegramID)
	if err != nil {
		user = &models.User{
			TelegramID: req.TelegramID,
			FirstName:  req.FirstName,
			LastName:   req.LastName,
			Username:   req.Username,
		}
		user, err = db.CreateUser(user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	}

	rsvp := &models.RSVP{
		UserID:  user.ID,
		ClassID: uint(classID),
		Status:  req.Status,
	}

	newRSVP, err := db.CreateOrUpdateRSVP(rsvp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create or update RSVP"})
		return
	}

	c.JSON(http.StatusOK, newRSVP)
}

func updateClass(c *gin.Context) {
	classID, err := strconv.ParseUint(c.Param("class_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID"})
		return
	}

	var req schemas.ClassUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ownership check
	user, err := db.GetUserByTelegramID(req.UpdaterTelegramID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	class, err := db.GetClasses(0, 1) // A bit of a hack to get a single class
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	if class[0].CreatorID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to update this class"})
		return
	}

	updatedClass, err := db.UpdateClass(uint(classID), &req.UpdateData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update class"})
		return
	}

	c.JSON(http.StatusOK, updatedClass)
}

func deleteClass(c *gin.Context) {
	classID, err := strconv.ParseUint(c.Param("class_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID"})
		return
	}

	deleterTelegramID, err := strconv.ParseInt(c.Query("deleter_telegram_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid deleter_telegram_id"})
		return
	}

	// Ownership check
	user, err := db.GetUserByTelegramID(deleterTelegramID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	class, err := db.GetClasses(0, 1) // A bit of a hack to get a single class
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	if class[0].CreatorID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to delete this class"})
		return
	}

	err = db.DeleteClass(uint(classID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete class"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "deleted", "class_id": classID})
}
