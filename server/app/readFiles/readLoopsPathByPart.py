from .readFile import readFile


def readLoopsPath(partName: str):
    path = f"./text/{partName.lower()}_word_list.txt"
    sounds = readFile(path)

    return sounds


if __name__ == "__main__":
    print(readLoopsPath("drums"))
