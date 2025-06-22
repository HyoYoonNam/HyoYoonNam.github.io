import requests
import yaml
import os

owner = "HyoYoonNam"
repo = "HyoYoonNam.github.io"
token = os.environ["PERSONAL_ACCESS_TOKEN"]  # GitHub Actions에서 환경변수로 전달받음

headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": f"token {token.strip()}",
}

url = f"https://api.github.com/repos/{owner}/{repo}/traffic/popular/paths"
response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    slugs = [entry["path"].strip("/").rstrip("/") for entry in data]
    with open("_data/most_viewed_posts.yml", "w") as f:
        yaml.dump(slugs, f)
    print("✅ Updated _data/most_viewed_posts.yml")
else:
    print(f"❌ Failed: {response.status_code}")
