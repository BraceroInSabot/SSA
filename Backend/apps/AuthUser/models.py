from django.db import models
from uuid import uuid4
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin



class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        user = self.model(email=self.normalize_email(email), name=name)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None):
        user = self.create_user(email, name, password)
        user.is_teacher = True
        user.is_student = False
        user.save(using=self._db)
        return user


class AuthUser(AbstractBaseUser, PermissionsMixin):
    objects = UserManager()
    id = models.UUIDField(default=uuid4, editable=False, primary_key=True, db_column='user_PK')
    name = models.CharField(max_length=255, db_column='user_name')
    email = models.EmailField(unique=True, db_column='user_email')
    image = models.ImageField(upload_to='user_images/', null=True, blank=True, db_column='user_image')
    is_student = models.BooleanField(default=True, db_column='is_student')
    is_teacher = models.BooleanField(default=False, db_column='is_teacher')
    is_active = models.BooleanField(default=True, db_column='is_active')  
    
    is_superuser = None
        
    def __str__(self):
        return self.name
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        db_table = 'User'