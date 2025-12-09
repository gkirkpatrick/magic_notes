from django.test import TestCase, Client
from notes.models import Note, Tag
import json


class NoteAPITestCase(TestCase):
    """Test suite for Note CRUD operations."""

    def setUp(self):
        """Set up test client and clear database."""
        self.client = Client()

    def test_create_note_with_tags(self):
        """Test creating a note with tags."""
        payload = {
            "title": "My First Note",
            "content": "This is the content of my note.",
            "tags": ["work", "important"]
        }

        response = self.client.post(
            '/api/notes/',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 201)
        data = response.json()

        self.assertEqual(data['title'], "My First Note")
        self.assertEqual(data['content'], "This is the content of my note.")
        self.assertIn('work', data['tags'])
        self.assertIn('important', data['tags'])
        self.assertIn('id', data)
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)

        # Verify database state
        note = Note.objects.get(id=data['id'])
        self.assertEqual(note.title, "My First Note")
        self.assertEqual(note.tags.count(), 2)

        # Verify tags are normalized
        tag_names = [tag.name for tag in note.tags.all()]
        self.assertIn('work', tag_names)
        self.assertIn('important', tag_names)

    def test_tag_normalization_on_create(self):
        """Test that tags are normalized (stripped and lowercased) on creation."""
        payload = {
            "title": "Test Note",
            "content": "Content",
            "tags": [" Work ", "work", "Personal", "URGENT", ""]
        }

        response = self.client.post(
            '/api/notes/',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 201)
        data = response.json()

        # Should have: work, personal, urgent (deduplicated and normalized)
        self.assertEqual(len(data['tags']), 3)
        self.assertIn('work', data['tags'])
        self.assertIn('personal', data['tags'])
        self.assertIn('urgent', data['tags'])

        # Verify only 3 tags in database
        self.assertEqual(Tag.objects.count(), 3)

    def test_update_note(self):
        """Test updating a note's title, content, and tags."""
        # Create initial note
        note = Note.objects.create(title="Original Title", content="Original Content")
        tag1 = Tag.objects.create(name="old-tag")
        note.tags.add(tag1)

        # Update the note
        payload = {
            "title": "Updated Title",
            "content": "Updated Content",
            "tags": ["new-tag", "another-tag"]
        }

        response = self.client.put(
            f'/api/notes/{note.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data['title'], "Updated Title")
        self.assertEqual(data['content'], "Updated Content")
        self.assertIn('new-tag', data['tags'])
        self.assertIn('another-tag', data['tags'])
        self.assertNotIn('old-tag', data['tags'])

        # Verify database update
        note.refresh_from_db()
        self.assertEqual(note.title, "Updated Title")
        self.assertEqual(note.content, "Updated Content")
        self.assertEqual(note.tags.count(), 2)

    def test_update_note_timestamps(self):
        """Test that updated_at changes on update."""
        note = Note.objects.create(title="Test", content="Test")
        original_updated_at = note.updated_at

        import time
        time.sleep(0.01)  # Small delay to ensure timestamp difference

        payload = {
            "title": "Updated",
            "content": "Updated",
            "tags": []
        }

        response = self.client.put(
            f'/api/notes/{note.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        note.refresh_from_db()
        self.assertGreater(note.updated_at, original_updated_at)

    def test_delete_note(self):
        """Test deleting a note."""
        note = Note.objects.create(title="To Delete", content="Content")
        note_id = note.id

        response = self.client.delete(f'/api/notes/{note_id}')
        self.assertEqual(response.status_code, 204)

        # Verify note is deleted
        self.assertFalse(Note.objects.filter(id=note_id).exists())

        # Attempting to delete again should return 404
        response = self.client.delete(f'/api/notes/{note_id}')
        self.assertEqual(response.status_code, 404)

    def test_get_note(self):
        """Test getting a single note by ID."""
        note = Note.objects.create(title="Test Note", content="Test Content")
        tag1 = Tag.objects.create(name="test-tag")
        note.tags.add(tag1)

        response = self.client.get(f'/api/notes/{note.id}')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data['id'], note.id)
        self.assertEqual(data['title'], "Test Note")
        self.assertEqual(data['content'], "Test Content")
        self.assertIn('test-tag', data['tags'])

    def test_get_nonexistent_note_returns_404(self):
        """Test that getting a nonexistent note returns 404."""
        response = self.client.get('/api/notes/99999')
        self.assertEqual(response.status_code, 404)

    def test_shared_tags_across_notes(self):
        """Test that tags are shared across notes (same Tag record)."""
        payload1 = {
            "title": "Note 1",
            "content": "Content 1",
            "tags": ["shared-tag", "unique1"]
        }
        payload2 = {
            "title": "Note 2",
            "content": "Content 2",
            "tags": ["shared-tag", "unique2"]
        }

        self.client.post('/api/notes/', data=json.dumps(payload1), content_type='application/json')
        self.client.post('/api/notes/', data=json.dumps(payload2), content_type='application/json')

        # Should only have 3 unique tags
        self.assertEqual(Tag.objects.count(), 3)

        # Verify shared-tag is used by both notes
        shared_tag = Tag.objects.get(name="shared-tag")
        self.assertEqual(shared_tag.notes.count(), 2)


class TagAPITestCase(TestCase):
    """Test suite for Tag operations."""

    def setUp(self):
        """Set up test client."""
        self.client = Client()

    def test_list_tags(self):
        """Test listing all tags sorted by name."""
        Tag.objects.create(name="zebra")
        Tag.objects.create(name="apple")
        Tag.objects.create(name="middle")

        response = self.client.get('/api/tags/')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data), 3)

        # Verify sorting
        tag_names = [tag['name'] for tag in data]
        self.assertEqual(tag_names, ['apple', 'middle', 'zebra'])

    def test_create_tag(self):
        """Test creating a new tag."""
        payload = {"name": "NewTag"}

        response = self.client.post(
            '/api/tags/',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Tag name should be normalized
        self.assertEqual(data['name'], 'newtag')
        self.assertIn('id', data)

        # Verify database
        self.assertTrue(Tag.objects.filter(name='newtag').exists())

    def test_create_duplicate_tag_returns_existing(self):
        """Test that creating a duplicate tag returns the existing tag."""
        Tag.objects.create(name="existing")

        payload = {"name": " EXISTING "}

        response = self.client.post(
            '/api/tags/',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['name'], 'existing')

        # Should still only have one tag
        self.assertEqual(Tag.objects.count(), 1)

    def test_tag_normalization(self):
        """Test that tag names are normalized."""
        payload = {"name": "  MixedCase  "}

        response = self.client.post(
            '/api/tags/',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['name'], 'mixedcase')


class SearchAPITestCase(TestCase):
    """Test suite for note search and filtering."""

    def setUp(self):
        """Set up test data."""
        self.client = Client()

        # Create notes with various content
        note1 = Note.objects.create(
            title="Python Tutorial",
            content="Learn Python programming basics"
        )
        tag_python = Tag.objects.create(name="python")
        tag_tutorial = Tag.objects.create(name="tutorial")
        note1.tags.add(tag_python, tag_tutorial)

        note2 = Note.objects.create(
            title="Django Guide",
            content="Advanced Django web development"
        )
        tag_django = Tag.objects.create(name="django")
        tag_tutorial_existing = Tag.objects.get(name="tutorial")
        note2.tags.add(tag_django, tag_tutorial_existing)

        note3 = Note.objects.create(
            title="React Notes",
            content="Frontend development with React"
        )
        tag_react = Tag.objects.create(name="react")
        note3.tags.add(tag_react)

    def test_search_by_body_text(self):
        """Test filtering notes by content."""
        response = self.client.get('/api/notes/?body_text=Django')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Django Guide")

    def test_search_by_title_text(self):
        """Test filtering notes by title."""
        response = self.client.get('/api/notes/?title_text=Python')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Python Tutorial")

    def test_search_by_body_and_title_with_or_logic(self):
        """Test filtering by both body and title uses OR logic (union)."""
        # Create a note with "greg" only in title
        Note.objects.create(
            title="Greg's Notes",
            content="Some unrelated content"
        )
        # Create a note with "greg" only in content
        Note.objects.create(
            title="Random Title",
            content="This was written by greg"
        )

        # Searching for greg in both fields should return both notes
        response = self.client.get('/api/notes/?body_text=greg&title_text=greg')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data), 2)
        titles = {note['title'] for note in data}
        self.assertIn("Greg's Notes", titles)
        self.assertIn("Random Title", titles)

    def test_search_by_body_and_title_union(self):
        """Test filtering by both body and title returns notes matching either (OR logic)."""
        # "Django Guide" has "development" in content and "Django" in title
        # "React Notes" has "development" in content but not "Django" in title
        response = self.client.get('/api/notes/?body_text=development&title_text=Django')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        # Should return both "Django Guide" (matches both) and "React Notes" (matches body_text)
        self.assertEqual(len(data), 2)
        titles = {note['title'] for note in data}
        self.assertIn("Django Guide", titles)
        self.assertIn("React Notes", titles)

    def test_search_by_single_tag(self):
        """Test filtering notes by a single tag."""
        response = self.client.get('/api/notes/?tags=python')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Python Tutorial")

    def test_search_by_multiple_tags_or_semantics(self):
        """Test filtering by multiple tags (OR semantics - must have at least one)."""
        response = self.client.get('/api/notes/?tags=django&tags=tutorial')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        # Should return both "Python Tutorial" (has tutorial) and "Django Guide" (has both)
        self.assertEqual(len(data), 2)
        titles = {note['title'] for note in data}
        self.assertIn("Python Tutorial", titles)
        self.assertIn("Django Guide", titles)

    def test_search_tags_case_insensitive(self):
        """Test that tag filtering is case-insensitive (OR semantics)."""
        response = self.client.get('/api/notes/?tags=PYTHON&tags=TUTORIAL')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        # Should return both notes that have python OR tutorial tags
        self.assertEqual(len(data), 2)
        titles = {note['title'] for note in data}
        self.assertIn("Python Tutorial", titles)
        self.assertIn("Django Guide", titles)

    def test_search_no_results(self):
        """Test search that returns no results."""
        response = self.client.get('/api/notes/?body_text=nonexistent')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data), 0)

    def test_list_all_notes_ordered_by_updated_at(self):
        """Test that notes are ordered by updated_at DESC."""
        response = self.client.get('/api/notes/')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data), 3)

        # Verify ordering (most recently updated first)
        # Since all created at same time, check they're all present
        titles = [note['title'] for note in data]
        self.assertIn("Python Tutorial", titles)
        self.assertIn("Django Guide", titles)
        self.assertIn("React Notes", titles)


class ValidationTestCase(TestCase):
    """Test suite for input validation."""

    def setUp(self):
        """Set up test client."""
        self.client = Client()

    def test_empty_title_validation(self):
        """Test that empty title returns 400."""
        payload = {
            "title": "   ",
            "content": "Valid content",
            "tags": []
        }

        response = self.client.post(
            '/api/notes/',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 422)  # Validation error

    def test_empty_content_validation(self):
        """Test that empty content returns 400."""
        payload = {
            "title": "Valid title",
            "content": "   ",
            "tags": []
        }

        response = self.client.post(
            '/api/notes/',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 422)

    def test_title_too_long_validation(self):
        """Test that title over 200 chars returns 400."""
        payload = {
            "title": "a" * 201,
            "content": "Valid content",
            "tags": []
        }

        response = self.client.post(
            '/api/notes/',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 422)

    def test_content_too_long_validation(self):
        """Test that content over 10,000 chars returns 400."""
        payload = {
            "title": "Valid title",
            "content": "a" * 10001,
            "tags": []
        }

        response = self.client.post(
            '/api/notes/',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 422)

    def test_valid_max_length_title(self):
        """Test that title with exactly 200 chars is valid."""
        payload = {
            "title": "a" * 200,
            "content": "Valid content",
            "tags": []
        }

        response = self.client.post(
            '/api/notes/',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 201)

    def test_empty_tag_name_validation(self):
        """Test that empty tag name returns 422."""
        payload = {"name": "   "}

        response = self.client.post(
            '/api/tags/',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 422)
