from django.db import models

class SessionRecord(models.Model):
    session_id   = models.CharField(max_length=100, unique=True)
    file_content = models.TextField()

    def __str__(self):
        return f"{self.session_id}"

class Category(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class ConfigType(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    def __str__(self):
        return self.name

class Parameter(models.Model):
    category      = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='params')
    name          = models.CharField(max_length=200)
    best_practice = models.CharField(max_length=100, blank=True)
    min_value     = models.IntegerField(null=True, blank=True)
    max_value     = models.IntegerField(null=True, blank=True)
    config_type   = models.ForeignKey(ConfigType, on_delete=models.PROTECT)
    visible       = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.category.name} → {self.name}"

class ConfigSegment(models.Model):
    SEGMENT_TYPES = [('pt','Text'),('val','Value')]
    parameter     = models.ForeignKey(Parameter, on_delete=models.CASCADE, related_name='segments')
    seg_name      = models.CharField(max_length=10, choices=SEGMENT_TYPES)
    default_text  = models.TextField(blank=True)
    is_value_slot = models.BooleanField(default=False)
    position      = models.PositiveSmallIntegerField(default=1)
    line          = models.PositiveSmallIntegerField(default=1)
    class Meta:
        ordering = ['position']
    def __str__(self):
        return f"{self.parameter.name} [{self.seg_name}]"

class Value(models.Model):
    config_type = models.ForeignKey(ConfigType, on_delete=models.CASCADE, related_name='values')
    #segment     = models.ForeignKey(ConfigSegment, on_delete=models.CASCADE, related_name='values')
    state       = models.CharField(max_length=50)
    value       = models.CharField(max_length=100)
    value_number= models.PositiveSmallIntegerField(null=True, blank=True)
    def __str__(self):
        return f"{self.config_type.name} → {self.state}={self.value}"
