from decouple import config

print("=== Email Configuration Debug ===")
print(f"EMAIL_HOST_USER: '{config('EMAIL_HOST_USER')}'")
print(f"EMAIL_HOST_PASSWORD: '{config('EMAIL_HOST_PASSWORD')}'")
print(f"Password Length: {len(config('EMAIL_HOST_PASSWORD'))}")
print(f"Has spaces: {' ' in config('EMAIL_HOST_PASSWORD')}")
print(f"DEFAULT_FROM_EMAIL: '{config('DEFAULT_FROM_EMAIL')}'")