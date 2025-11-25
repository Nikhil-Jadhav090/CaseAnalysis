from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Create or update an admin user (role=admin, is_staff/is_superuser)."

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True, help='Admin email (unique)')
        parser.add_argument('--password', required=True, help='Admin password')
        parser.add_argument('--first-name', default='Admin')
        parser.add_argument('--last-name', default='User')

    def handle(self, *args, **options):
        User = get_user_model()
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        user, created = User.objects.get_or_create(email=email, defaults={
            'username': email,
            'first_name': first_name,
            'last_name': last_name,
            'role': 'admin',
        })

        # Ensure admin flags/role
        user.is_staff = True
        user.is_superuser = True
        user.role = 'admin'
        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"Admin user created: {email}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Admin user updated: {email}"))
