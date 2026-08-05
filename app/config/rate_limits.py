class RateLimits:
    LOGIN = "10/minute"
    REGISTER = "5/minute"

    class LLM:
        GENERATE = "5/minute"
        STREAM = "5/minute"
        RESUME = "5/minute"
