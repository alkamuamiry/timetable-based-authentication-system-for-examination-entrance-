from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser,PermissionsMixin
import uuid
import secrets
from .configured_data import *


def generate_device_api_key():
    return secrets.token_hex(32)
class UserManager(BaseUserManager):
    def create_user(self,email,password = None,**extra_fields):
        if not email:
            raise ValueError("email is required")
        email = self.normalize_email(email)
        user = self.model(email= email,**extra_fields)
        user.set_password(password)
        user.save(using = self._db)
        return user
    def create_superuser(self,email,password,**extra_fields):
        extra_fields.setdefault("is_staff",True)
        extra_fields.setdefault("is_superuser",True)
        extra_fields.setdefault("is_active",True)
        return self.create_user(email,password,**extra_fields)
class User(AbstractBaseUser,PermissionsMixin):
    GENDER_CHOICES = [('M','Male'),('F','Female'),('O','Others'),]
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, blank=True)
    profile_image = models.ImageField(upload_to="profiles/",null=True,blank=True)
    address = models.TextField(blank=True)
    gender = models.CharField(max_length=1,blank=True,choices=GENDER_CHOICES)
    date_of_birth = models.DateField(null=True,blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    def __str__(self):
        return (f"{self.first_name.upper()}"
                f" {self.last_name.upper()}"
                f", {self.email}")
# beginining of the student authentication timetable
class Department(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    name = models.CharField(max_length=255,choices=DEPARTMENT_NAME)
    def __str__(self):
        return self.name
class Program(models.Model):
    id =models.UUIDField( primary_key=True,default= uuid.uuid4,editable=False)
    name = models.CharField(max_length=100,choices=PROGRAM_NAME)
    short_name = models.CharField(max_length=20)
    department  = models.ForeignKey(Department,on_delete=models.CASCADE,blank=True,null=True,related_name="programs")
    def __str__(self):
        return self.short_name
    
class College(models.Model):
    id = models.UUIDField(primary_key=True,default= uuid.uuid4,editable=False)
    name = models.CharField(max_length=255,choices=COLLEGES_NAME)
    short_name = models.CharField(max_length=20,choices=COLLEGE_SHORT_NAME)
    departments = models.ForeignKey(Department,on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.short_name}"
    
class AcademicYear(models.Model):
    id =models.UUIDField( primary_key=True,default= uuid.uuid4,editable=False)
    year = models.IntegerField(choices=YEAR_CHOICES,unique=True )
    def __str__(self):
        return f"Year {self.year}"
    
class Student(models.Model):
    id =models.UUIDField( primary_key=True,default= uuid.uuid4,editable=False)
    registration_number = models.CharField(max_length=100,unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15,blank=True)
    program = models.ForeignKey(Program,on_delete=models.CASCADE)
    department = models.ForeignKey(Department,on_delete=models.CASCADE)
    year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    status = models.BooleanField(default=False,blank=True)
    faceid_embeded = models.BooleanField(default=False,blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(blank=True,auto_now=True,null=True)
    student_profile_image = models.ImageField(upload_to='students_profile/',blank=True,null=True)
    def __str__(self):
        return ( f"{self.registration_number}")

class StudentFace(models.Model):
    id =models.UUIDField( primary_key=True,default= uuid.uuid4,editable=False)
    student = models.OneToOneField( Student, on_delete=models.CASCADE)
    embedding = models.JSONField(null=True,blank=True)
    model_version = models.CharField( max_length=50)
    accuracy = models.IntegerField(default=0,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

class Venue(models.Model):
    id =models.UUIDField( primary_key=True,default= uuid.uuid4,editable=False)
    name = models.CharField(max_length=100)
    capacity = models.IntegerField()
    def __str__(self):
        return self.name
    
class Course(models.Model):
    id =models.UUIDField( primary_key=True,default= uuid.uuid4,editable=False)
    code = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    def __str__(self):
        return ( f"{self.code} - {self.title}")
    
class ExamSession(models.Model):
    id =models.UUIDField( primary_key=True,default= uuid.uuid4,editable=False)
    exam_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    venue = models.ForeignKey(Venue,on_delete=models.CASCADE)
    def __str__(self):
        return (f"{self.exam_date} "f"{self.start_time}")

class ExamTimetable(models.Model):
    id =models.UUIDField( primary_key=True,default= uuid.uuid4,editable=False)
    session = models.ForeignKey( ExamSession,on_delete=models.CASCADE)
    course = models.ForeignKey(Course,on_delete=models.CASCADE)
    program = models.ForeignKey( Program, on_delete=models.CASCADE )
    year = models.ForeignKey( AcademicYear, on_delete=models.CASCADE )
    def __str__(self):
        return (f"{self.course}")

class AuthConfig(models.Model):
    """
    Controls how long before/after a session's scheduled start time a
    device is allowed to authenticate students against it. Admin-edits
    the single row through Django admin; devices read the resolved
    window through the schedule endpoint rather than hardcoding timing
    themselves, so changing it here takes effect immediately, everywhere.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    window_before_minutes = models.PositiveIntegerField(
        default=30,
        help_text="Minutes before a session's start time that authentication opens."
    )

    window_after_minutes = models.PositiveIntegerField(
        default=15,
        help_text="Minutes after a session's start time that authentication stays open."
    )

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            f"Auth window (-{self.window_before_minutes}m / "
            f"+{self.window_after_minutes}m)"
        )

    @classmethod
    def get_config(cls):
        config = cls.objects.first()
        if config is None:
            config = cls.objects.create()
        return config


class Device(models.Model):
    id =models.UUIDField( primary_key=True,default= uuid.uuid4,editable=False)
    device_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100, blank=True)
    api_key = models.CharField(
        max_length=64,
        unique=True,
        default=generate_device_api_key,
    )
    venue = models.ForeignKey( Venue,on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.device_id

class DeviceCommand(models.Model):
    id =models.UUIDField( primary_key=True,default= uuid.uuid4,editable=False)
    device = models.ForeignKey(Device,on_delete=models.CASCADE)
    command = models.CharField(max_length=50,choices=COMMAND_CHOICES)
    payload = models.JSONField(null=True,blank=True)
    is_executed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)