from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse, Response
from fastapi.middleware.cors import CORSMiddleware

from src.routes.crawler import router_crawler
from src.routes.collected import router_collected

app = FastAPI(root_path="/~ywatanabe/PhishCollector/api")

app.include_router(router_collected, prefix="/collected", tags=["api_collected"])
app.include_router(router_crawler, prefix="/crawler", tags=["api_crawler"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/status", tags=["status"])
async def status():
    return PlainTextResponse("RUNNING", status_code=200)


@app.exception_handler(Exception)
async def exception_handler(req: Request, e: Exception):
    return Response(
        headers={"access-control-allow-origin": "*"},
        status_code=500,
    )
