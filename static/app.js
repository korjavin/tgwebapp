document.addEventListener('DOMContentLoaded', function () {
    const createClassForm = document.getElementById('create-class-form');
    const classesList = document.getElementById('classes-list');

    // Function to fetch and display classes
    async function fetchClasses() {
        try {
            const response = await fetch('/api/classes/');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const classes = await response.json();

            classesList.innerHTML = ''; // Clear the list first
            classes.forEach(cls => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <h3>${cls.topic}</h3>
                    <p>${cls.description}</p>
                    <p><strong>Time:</strong> ${new Date(cls.class_time).toLocaleString()}</p>
                    <p><strong>Creator:</strong> ${cls.creator.first_name}</p>
                `;
                classesList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            classesList.innerHTML = '<li>Failed to load classes.</li>';
        }
    }

    // Function to handle form submission
    createClassForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const topic = document.getElementById('topic').value;
        const description = document.getElementById('description').value;
        const classTime = document.getElementById('class_time').value;

        // Get user data from Telegram Web App API
        const tg = window.Telegram.WebApp;
        const userData = tg.initDataUnsafe.user;

        if (!userData) {
            alert('Could not retrieve user data from Telegram.');
            return;
        }

        const requestBody = {
            topic: topic,
            description: description,
            class_time: classTime,
            creator_telegram_id: userData.id,
            creator_first_name: userData.first_name,
            creator_last_name: userData.last_name,
            creator_username: userData.username,
        };

        try {
            const response = await fetch('/api/classes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create class');
            }

            // Clear the form and refresh the list
            createClassForm.reset();
            fetchClasses();

        } catch (error) {
            console.error('Error creating class:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Initial fetch of classes when the page loads
    fetchClasses();
});
