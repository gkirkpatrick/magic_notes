from django.contrib import admin
from notes.models import Note, Tag


class TagInline(admin.TabularInline):
    """Inline admin for tags on note detail page."""

    model = Note.tags.through
    extra = 1


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    """Admin configuration for Note model."""

    list_display = ("id", "title", "content_preview", "tag_list", "created_at", "updated_at")
    list_display_links = ("id", "title")
    list_filter = ("created_at", "updated_at", "tags")
    search_fields = ("title", "content")
    readonly_fields = ("created_at", "updated_at")
    filter_horizontal = ("tags",)
    date_hierarchy = "updated_at"
    ordering = ("-updated_at",)

    fieldsets = (
        (
            "Note Information",
            {
                "fields": ("title", "content"),
            },
        ),
        (
            "Tags",
            {
                "fields": ("tags",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def content_preview(self, obj):
        """Show first 50 characters of content."""
        if len(obj.content) > 50:
            return f"{obj.content[:50]}..."
        return obj.content

    content_preview.short_description = "Content Preview"

    def tag_list(self, obj):
        """Show comma-separated list of tags."""
        return ", ".join([tag.name for tag in obj.tags.all()])

    tag_list.short_description = "Tags"


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Admin configuration for Tag model."""

    list_display = ("id", "name", "note_count")
    list_display_links = ("id", "name")
    search_fields = ("name",)
    ordering = ("name",)

    def note_count(self, obj):
        """Show number of notes with this tag."""
        return obj.notes.count()

    note_count.short_description = "Note Count"
