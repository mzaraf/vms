from django.db import models
from django.utils.translation import gettext_lazy as _

class Department(models.Model):
    name = models.CharField(
        _('name'),
        max_length=100,
        unique=True,
        help_text=_("Name of the department")
    )
    description = models.TextField(
        _('description'),
        blank=True,
        null=True,
        help_text=_("Brief description of the department")
    )
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True,
        help_text=_("When the department was created")
    )
    updated_at = models.DateTimeField(
        _('updated at'),
        auto_now=True,
        help_text=_("When the department was last updated")
    )

    class Meta:
        verbose_name = _('department')
        verbose_name_plural = _('departments')
        ordering = ['name']

    def __str__(self):
        return self.name