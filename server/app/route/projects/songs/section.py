def music_section_info_from_section_array(section_array):
    music_section = []
    id, start, end = 0, 0, 0
    section_name = ["intro", "breakdown", "buildup", "drop", "outro"]
    for i in range(len(section_array)):
        if id != section_array[i]:
            end = i - 1
            section = {
                "start": start,
                "end": end,
                "section_name": section_name[section_array[i - 1]],
            }
            music_section.append(section)
            start = i
            id = section_array[i]
        if i == len(section_array) - 1:
            end = len(section_array) - 1
            section = {
                "start": start,
                "end": end,
                "section_name": section_name[section_array[i]],
            }
            music_section.append(section)

    return music_section
