This is a practical example of how to integrate the **Zustack API** into 
a full-stack video application using **Go** and **React**.

---

## Set up the database

Run the following command to create the necessary tables in the SQLite database:

```bash
sqlite3 db.db ".read tables.sql"
```

---

## Export the required environment variables

Before running the app, make sure to export the required environment variables:

```bash
export DB_PATH=/absolute/path/to/db.db
export SECRET_KEY=your_secret_key
export API_KEY_ZUSTACK=your_zustack_api_key
export BUCKET_ID=your_bucket_id
export ZUSTACK_URL=zustack_url
```

> You can also put these variables in a `.env.sh` file and run `source .env.sh` 
to load them automatically.

## How to use
Clone the repo and run
```bash
git clone https://github.com/zustack/image-gallery.git ~/image-gallery
cd image-gallery
go run cmd/main.go
```

Now open the app on your browser
```bash 
http://localhost:8081
```
