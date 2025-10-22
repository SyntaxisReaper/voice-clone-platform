# Alembic Setup (Stub)

This repository includes Alembic in backend/requirements.txt. To initialize migrations locally:

```bash
# From the backend directory
alembic init migrations
```

Update alembic.ini to point at your async database URL or set it via env:

```
# alembic.ini
sqlalchemy.url = postgresql+asyncpg://voice_user:voice_password@localhost:5432/voice_clone_db
```

For async SQLAlchemy, use `render_as_batch` or offline migrations as needed. A common pattern is to use env.py with `async_engine_from_config`.

Initial migration example after defining models:

```bash
alembic revision --autogenerate -m "Initial tables"
alembic upgrade head
```

Note: This is a stub document. Finalize the Alembic env.py to import models from `app.models` and bind to `app.core.database.engine`.