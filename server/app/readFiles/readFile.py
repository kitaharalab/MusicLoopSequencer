def readFile(path: str):
    raw_data = None
    with open(path) as f:
        raw_data = f.read().split("\n")
    data = list(filter(lambda x: x != "", raw_data))
    return data
