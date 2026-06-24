from fastapi import FastAPI

app = FastAPI(title="Adama Engine", version="0.0.0")


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "adama-engine", "status": "ok"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
