document.addEventListener('DOMContentLoaded', function () {

    // --- DOM Element References ---
    const detailsView = document.getElementById('details-view');
    const createClassForm = document.getElementById('create-class-form');
    const classesList = document.getElementById('classes-list');
    const editModal = document.getElementById('edit-modal');
    const editClassForm = document.getElementById('edit-class-form');
    const saveEditButton = document.getElementById('save-edit-button');

    // --- Global State ---
    let classesData = [];

    // --- Helper Functions ---

    function openEditModal(classId) {
        const classToEdit = classesData.find(cls => cls.id === classId);
        if (classToEdit) {
            document.getElementById('edit-class-id').value = classToEdit.id;
            document.getElementById('edit-topic').value = classToEdit.topic;
            document.getElementById('edit-description').value = classToEdit.description;
            const d = new Date(classToEdit.class_time);
            const formattedDate = `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}T${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}`;
            document.getElementById('edit-class-time').value = formattedDate;
            const modalInstance = M.Modal.getInstance(editModal);
            modalInstance.open();
        }
    }

    // --- View Rendering ---

    async function fetchClasses() {
        try {
            const response = await fetch('/api/classes/');
            if (!response.ok) throw new Error('Network response was not ok');
            classesData = await response.json();

            classesList.innerHTML = '';
            const tg = window.Telegram.WebApp;
            const currentUser = tg.initDataUnsafe.user;

            classesData.forEach(cls => {
                const listItem = document.createElement('a');
                listItem.className = 'collection-item';
                listItem.href = `#/class/${cls.id}`;

                const yesRsvps = cls.rsvps.filter(r => r.status === 'yes');
                const tentativeRsvps = cls.rsvps.filter(r => r.status === 'tentative');
                const noRsvps = cls.rsvps.filter(r => r.status === 'no');

                let rsvpSummary = `<p>RSVPs: ${yesRsvps.length} Yes, ${tentativeRsvps.length} Tentative</p>`;
                let creatorRsvpDetails = '';
                let ownerControls = '';

                if (currentUser && currentUser.id === cls.creator.telegram_id) {
                    const renderRsvpList = (rsvps) => rsvps.length === 0 ? '<li>None</li>' : rsvps.map(r => `<li>${r.user.first_name} (@${r.user.username || '...'})</li>`).join('');
                    creatorRsvpDetails = `
                        <div class="rsvp-details">
                            <h4>RSVP Details:</h4>
                            <strong>Yes (${yesRsvps.length}):</strong> <ul>${renderRsvpList(yesRsvps)}</ul>
                            <strong>No (${noRsvps.length}):</strong> <ul>${renderRsvpList(noRsvps)}</ul>
                            <strong>Tentative (${tentativeRsvps.length}):</strong> <ul>${renderRsvpList(tentativeRsvps)}</ul>
                        </div>`;
                    ownerControls = `
                        <div class="owner-controls" style="margin-top: 10px;">
                            <a class="waves-effect waves-light btn-small edit-button" data-class-id="${cls.id}"><i class="material-icons left">edit</i>Edit</a>
                            <a class="waves-effect waves-light btn-small red cancel-button" data-class-id="${cls.id}"><i class="material-icons left">delete</i>Cancel</a>
                        </div>`;
                }

                listItem.innerHTML = `
                    <span class="title"><b>${cls.topic}</b></span>
                    <p>${cls.description}</p>
                    <p><b>Time:</b> ${new Date(cls.class_time).toLocaleString()}</p>
                    <p><b>Creator:</b> ${cls.creator.first_name}</p>
                    ${rsvpSummary}
                    <div class="rsvp-buttons" style="margin-top: 10px;">
                        <a class="waves-effect waves-light btn-small rsvp-button" data-class-id="${cls.id}" data-status="yes">Yes</a>
                        <a class="waves-effect waves-light btn-small rsvp-button" data-class-id="${cls.id}" data-status="no">No</a>
                        <a class="waves-effect waves-light btn-small rsvp-button" data-class-id="${cls.id}" data-status="tentative">Tentative</a>
                    </div>
                    ${ownerControls}
                    ${creatorRsvpDetails}`;
                classesList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            classesList.innerHTML = '<div class="collection-item">Failed to load classes.</div>';
        }
    }

    async function renderDetailsView(classId) {
        try {
            const response = await fetch(`/api/classes/${classId}`, { cache: 'no-cache' });
            if (!response.ok) throw new Error('Network response was not ok');
            const cls = await response.json();

            let questionsHtml = '<h5>Questions</h5><ul class="collection">';
            if (cls.questions.length > 0) {
                questionsHtml += cls.questions.map(q => `<li class="collection-item">${q.text}<span class="secondary-content">by ${q.user.first_name}</span></li>`).join('');
            } else {
                questionsHtml += '<li class="collection-item">No questions yet.</li>';
            }
            questionsHtml += '</ul>';

            const addQuestionFormHtml = `
                <h5>Ask a Question</h5>
                <form id="add-question-form" data-class-id="${classId}">
                    <div class="input-field">
                        <textarea id="question-text" class="materialize-textarea"></textarea>
                        <label for="question-text">Your Question</label>
                    </div>
                    <button type="submit" class="btn">Submit Question</button>
                </form>`;

            const tg = window.Telegram.WebApp;
            const currentUser = tg.initDataUnsafe.user;
            let ownerControls = '';
            if (currentUser && currentUser.id === cls.creator.telegram_id) {
                ownerControls = `
                    <div class="owner-controls" style="margin-top: 10px;">
                        <a class="waves-effect waves-light btn-small edit-button" data-class-id="${cls.id}"><i class="material-icons left">edit</i>Edit</a>
                        <a class="waves-effect waves-light btn-small red cancel-button" data-class-id="${cls.id}"><i class="material-icons left">delete</i>Cancel</a>
                    </div>`;
            }

            detailsView.innerHTML = `
                <a href="#" class="btn-flat waves-effect">&lt; Back to list</a>
                <h2>${cls.topic}</h2>
                <p>${cls.description}</p>
                <p><b>Time:</b> ${new Date(cls.class_time).toLocaleString()}</p>
                <p><b>Creator:</b> ${cls.creator.first_name}</p>
                ${ownerControls}
                <hr>
                ${questionsHtml}
                ${addQuestionFormHtml}`;
        } catch (error) {
            console.error('Failed to fetch class details:', error);
            detailsView.innerHTML = '<h2>Failed to load class details.</h2>';
        }
    }

    // --- App Initialization ---

    function onTelegramReady() {
        function router() {
            const hash = window.location.hash;
            const listView = document.getElementById('list-view');

            listView.style.display = 'none';
            detailsView.style.display = 'none';

            if (hash.startsWith('#/class/')) {
                const classId = hash.split('/')[2];
                detailsView.style.display = 'block';
                renderDetailsView(classId);
            } else {
                listView.style.display = 'block';
                fetchClasses();
            }
        }

        // --- Event Listeners ---

        createClassForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const tg = window.Telegram.WebApp;
            const userData = tg.initDataUnsafe.user;
            if (!userData) return alert('Could not retrieve user data from Telegram.');

            const requestBody = {
                topic: document.getElementById('topic').value,
                description: document.getElementById('description').value,
                class_time: document.getElementById('class_time').value,
                creator_telegram_id: userData.id,
                creator_first_name: userData.first_name,
                creator_last_name: userData.last_name,
                creator_username: userData.username,
            };

            try {
                const response = await fetch('/api/classes/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });
                if (!response.ok) throw new Error((await response.json()).detail || 'Failed to create class');
                createClassForm.reset();
                fetchClasses();
            } catch (error) {
                console.error('Error creating class:', error);
                alert(`Error: ${error.message}`);
            }
        });

        classesList.addEventListener('click', async function (event) {
            const button = event.target.closest('a');
            if (!button) return;

            const tg = window.Telegram.WebApp;
            const userData = tg.initDataUnsafe.user;
            if (!userData) return alert('Could not retrieve user data from Telegram.');

            const classId = button.dataset.classId;

            if (button.classList.contains('rsvp-button')) {
                const requestBody = {
                    telegram_id: userData.id,
                    status: button.dataset.status,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    username: userData.username,
                };
                try {
                    const response = await fetch(`/api/classes/${classId}/rsvp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody),
                    });
                    if (!response.ok) throw new Error((await response.json()).detail || 'Failed to RSVP');
                    alert(`You have successfully RSVPed "${button.dataset.status}"`);
                    fetchClasses();
                } catch (error) {
                    console.error('Error RSVPing:', error);
                    alert(`Error: ${error.message}`);
                }
            } else if (button.classList.contains('cancel-button')) {
                if (confirm('Are you sure you want to cancel this class?')) {
                    try {
                        const response = await fetch(`/api/classes/${classId}?deleter_telegram_id=${userData.id}`, { method: 'DELETE' });
                        if (!response.ok) throw new Error((await response.json()).detail || 'Failed to cancel class');
                        alert('Class cancelled successfully.');
                        fetchClasses();
                    } catch (error) {
                        console.error('Error cancelling class:', error);
                        alert(`Error: ${error.message}`);
                    }
                }
            } else if (button.classList.contains('edit-button')) {
                openEditModal(parseInt(classId, 10));
            }
        });

        saveEditButton.addEventListener('click', async function (event) {
            const tg = window.Telegram.WebApp;
            const userData = tg.initDataUnsafe.user;
            if (!userData) return alert('Could not retrieve user data from Telegram.');

            const classId = document.getElementById('edit-class-id').value;
            const requestBody = {
                updater_telegram_id: userData.id,
                update_data: {
                    topic: document.getElementById('edit-topic').value,
                    description: document.getElementById('edit-description').value,
                    class_time: document.getElementById('edit-class-time').value,
                }
            };

            try {
                const response = await fetch(`/api/classes/${classId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });
                if (!response.ok) throw new Error((await response.json()).detail || 'Failed to update class');
                const modalInstance = M.Modal.getInstance(editModal);
                modalInstance.close();
                fetchClasses();
            } catch (error) {
                console.error('Error updating class:', error);
                alert(`Error: ${error.message}`);
            }
        });

        detailsView.addEventListener('click', async function (event) {
            const button = event.target.closest('a');
            if (!button) return;

            const tg = window.Telegram.WebApp;
            const userData = tg.initDataUnsafe.user;
            if (!userData) return alert('Could not retrieve user data from Telegram.');

            const classId = button.dataset.classId;

            if (button.classList.contains('cancel-button')) {
                 if (confirm('Are you sure you want to cancel this class?')) {
                    try {
                        const response = await fetch(`/api/classes/${classId}?deleter_telegram_id=${userData.id}`, { method: 'DELETE' });
                        if (!response.ok) throw new Error((await response.json()).detail || 'Failed to cancel class');
                        alert('Class cancelled successfully.');
                        window.location.hash = '';
                    } catch (error) {
                        console.error('Error cancelling class:', error);
                        alert(`Error: ${error.message}`);
                    }
                }
            } else if (button.classList.contains('edit-button')) {
                openEditModal(parseInt(classId, 10));
            }
        });

        detailsView.addEventListener('submit', async function (event) {
            if (event.target.id === 'add-question-form') {
                event.preventDefault();
                const tg = window.Telegram.WebApp;
                const userData = tg.initDataUnsafe.user;
                if (!userData) return alert('Could not retrieve user data from Telegram.');

                const classId = event.target.dataset.classId;
                const requestBody = {
                    text: document.getElementById('question-text').value,
                    author_telegram_id: userData.id,
                    author_first_name: userData.first_name,
                    author_last_name: userData.last_name,
                    author_username: userData.username,
                };

                try {
                    const response = await fetch(`/api/classes/${classId}/questions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody),
                    });
                    if (!response.ok) throw new Error((await response.json()).detail || 'Failed to add question');
                    renderDetailsView(classId);
                } catch (error) {
                    console.error('Error adding question:', error);
                    alert(`Error: ${error.message}`);
                }
            }
        });

        // Set up the router
        window.addEventListener('hashchange', router);
        router();
    }

    function checkTelegramData() {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
            onTelegramReady();
        } else {
            setTimeout(checkTelegramData, 100);
        }
    }

    M.AutoInit();
    checkTelegramData();
});
