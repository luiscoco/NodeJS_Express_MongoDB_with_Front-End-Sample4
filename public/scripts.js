const notesContainer = document.querySelector('.notes-container');
const createNoteForm = document.getElementById('createNoteForm');

// Function to fetch and display notes
async function fetchNotes() {
  try {
    const response = await fetch('/notes');
    const data = await response.json();
    renderNotes(data); // Call the renderNotes function to display the notes
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
}

// Function to render notes on the page
function renderNotes(notes) {
  notesContainer.innerHTML = '';

  notes.forEach(note => {
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <button class="editNote" data-id="${note._id}">Edit</button>
      <button class="deleteNote" data-id="${note._id}">Delete</button>
    `;
    notesContainer.appendChild(noteElement);
  });

  // Attach event listeners to edit and delete buttons
  const editButtons = document.querySelectorAll('.editNote');
  const deleteButtons = document.querySelectorAll('.deleteNote');

  editButtons.forEach(button => {
    button.addEventListener('click', handleEditNote);
  });

  deleteButtons.forEach(button => {
    button.addEventListener('click', handleDeleteNote);
  });
}

// Function to handle note editing
function handleEditNote(event) {
  const noteId = event.target.dataset.id;
  // Implement your logic here to handle editing the note.
  // For example, you can display a form with the current note data pre-filled for editing.
  // For simplicity, we'll just display an alert with the note ID.
  alert(`Editing note with ID: ${noteId}`);
}

// Function to handle note deletion
async function handleDeleteNote(event) {
  const noteId = event.target.dataset.id;
  const confirmation = confirm('Are you sure you want to delete this note?');
  if (confirmation) {
    try {
      const response = await fetch(`/notes/${noteId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.ok) {
        fetchNotes(); // Refresh notes after deletion
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }
}

// Function to create a new note
async function createNote() {
  const noteTitle = document.getElementById('noteTitle').value;
  const noteContent = document.getElementById('noteContent').value;

  if (!noteTitle || !noteContent) {
    alert('Please provide both a title and content for the note.');
    return;
  }

  try {
    const response = await fetch('/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: noteTitle, content: noteContent }),
    });

    const data = await response.json(); // Parse the JSON response

    if (response.ok) {
      alert(data.message); // Show the response message from the server
      createNoteForm.reset(); // Reset the form after successful note creation
      fetchNotes(); // Fetch and display updated notes
    } else {
      alert('Error creating note: ' + data.error); // Show the error message
    }
  } catch (error) {
    console.log('Error creating note:', error);
  }
}

// Event listener for create note form submission
createNoteForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent form submission and handle it manually
  createNote();
});

// Fetch notes when the page loads
fetchNotes();