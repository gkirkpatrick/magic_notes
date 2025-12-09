from django.db import models


def normalize_tag_name(name: str) -> str:
    """
    Normalize a tag name by stripping whitespace and converting to lowercase.
    """
    return name.strip().lower()


class Tag(models.Model):
    """
    Tag model for categorizing notes.
    Tag names are normalized (stripped and lowercased) and enforced as unique.
    """
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Override save to normalize tag name before saving."""
        self.name = normalize_tag_name(self.name)
        super().save(*args, **kwargs)


class Note(models.Model):
    """
    Note model representing a single note with title, content, and tags.
    """
    title = models.CharField(max_length=200)
    content = models.TextField()
    tags = models.ManyToManyField(Tag, blank=True, related_name='notes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title
