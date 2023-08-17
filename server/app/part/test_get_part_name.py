from get_part_name import get_part_name


def test_get_part_name():
    partid = 0
    partid = int(partid)
    partName = ""
    if partid == 0:
        partName = "sequence"
    elif partid == 1:
        partName = "synth"
    elif partid == 2:
        partName = "bass"
    else:
        partName = "drums"
    _partName = get_part_name(int(partid))
    assert partName == _partName, "get part name failed"


if __name__ == "__main__":
    test_get_part_name()
