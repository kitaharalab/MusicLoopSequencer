from util.structure import Structure


def music_section_info_from_section_array(section_array):
    if section_array is None:
        return None

    music_section = []
    structure = list(Structure)
    index = 0
    while index < len(section_array):
        # section_arrayの値が同じであるような範囲の探索：[start,end]
        start = index
        end = index
        for i in range(index, len(section_array)):
            if section_array[index] != section_array[i]:
                break
            end = i

        # 小節番号は1始まり
        music_section.append(
            {
                "start": start + 1,
                "end": end + 1,
                "section_name": structure[section_array[start]].value,
            }
        )
        index = end + 1

    return music_section
