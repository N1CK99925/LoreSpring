import os, asyncio
from neo4j._async import AsyncGraphDatabase

async def test():
    uri = os.getenv("NEO4J_URI")
    user = os.getenv("NEO4J_USERNAME")
    pwd = os.getenv("NEO4J_PASSWORD")
    print("Connecting to:", uri)
    driver = AsyncGraphDatabase.driver(uri, auth=(user, pwd))
    try:
        async with driver.session() as session:
            rec = await session.run("RETURN 1 AS ok")
            r = await rec.single()
            print("OK:", r["ok"])
    finally:
        await driver.close()

asyncio.run(test())