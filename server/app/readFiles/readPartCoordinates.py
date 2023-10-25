import math

from .readFile import readFile


def readPartCoordinates(partName: str):
    lower_part_name = partName.lower()
    pass_movedpointx = f"./text/{lower_part_name}_movedpointx_list.txt"
    pass_movedpointy = f"./text/{lower_part_name}_movedpointy_list.txt"
    pass_range = f"./text/{lower_part_name}_range_list.txt"

    x_coordinate_data = readFile(pass_movedpointx)
    y_coordinate_data = readFile(pass_movedpointy)
    range_lists_data = readFile(pass_range)

    x_coordinate = list(map(lambda x: math.floor(float(x)), x_coordinate_data))
    y_coordinate = list(map(lambda y: math.floor(float(y)), y_coordinate_data))
    range_lists = list(map(lambda r: int(r), range_lists_data))

    return x_coordinate, y_coordinate, range_lists
