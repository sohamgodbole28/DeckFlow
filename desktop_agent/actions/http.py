import requests

def execute_http(config: dict):
    url = config.get("url")
    if not url:
        raise ValueError("No URL specified")
        
    method = config.get("method", "GET").upper()
    headers = config.get("headers", {})
    payload = config.get("payload", {})
    
    if method == "GET":
        requests.get(url, headers=headers)
    elif method == "POST":
        requests.post(url, headers=headers, json=payload)
    elif method == "PUT":
        requests.put(url, headers=headers, json=payload)
    elif method == "DELETE":
        requests.delete(url, headers=headers)
    else:
        raise ValueError(f"Unsupported HTTP method: {method}")
