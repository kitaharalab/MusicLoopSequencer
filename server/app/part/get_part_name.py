def get_part_name(partId: int) -> str:
    """get part name from part id

    Args:
        partId (int): part id

    Returns:
        str: part name
    """

    if partId == 0:
        return "sequence"
    elif partId == 1:
        return "synth"
    elif partId == 2:
        return "bass"
    else:
        return "drums"
