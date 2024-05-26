from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware

from src.routes.collected import router

app = FastAPI(root_path="/~ywatanabe/PhishCollector/api")

app.include_router(router, prefix="/collected", tags=["api_collected"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def exception_handler(req: Request, e: Exception):
    return Response(
        headers={"access-control-allow-origin": "*"},
        status_code=500,
    )
