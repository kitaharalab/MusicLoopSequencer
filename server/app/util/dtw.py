def dtw(excitement_array):
    """DTWの計算を行う"""
    # セクションは4小節ごとに考慮する
    short_excitement_array = list()
    sum = 0
    for i, e in enumerate(excitement_array, 1):
        if i % 4 == 0 and i != 0:
            short_excitement_array.append(round(sum / 4))
            sum = 0
        sum += e
    excitement_array = short_excitement_array
    # セクションが取るであろう盛り上がり度
    # intro, breakdown + buildup, drop, outro
    section_excitement = [0, 1, 3.3, 0]
    # 2つの時系列の長さ
    excitement_len = len(excitement_array)
    section_len = len(section_excitement)
    # 初期化
    dtw = calc_dtw(excitement_len, section_len, excitement_array, section_excitement)
    # セクションを決定する
    section_array = list()
    # 逆から考える
    dtw = dtw[::-1]
    # outroで終わるように調整
    for i in range(4):
        section_array.append(4)
    # 最小値を見ながらセクションを決定する
    for d in dtw[1:]:
        # 見る範囲
        start = section_array[-1] - 1
        end = section_array[-1] + 1
        section = d.index(min(d[start:end]))
        for i in range(4):
            section_array.append(section)
    # もとに戻す
    section_array = restore_section_array(section_array)
    return section_array


def restore_section_array(section_array):
    section_array = section_array[::-1]
    section_array = section_array[4:]
    section_array = [s - 1 for s in section_array]
    for i in range(len(section_array)):
        if section_array[i] == 2 or section_array[i] == 3:
            section_array[i] += 1
    buildup_start = section_array.index(3) - 2
    buildup_end = section_array.index(3)
    section_array[buildup_start:buildup_end] = [2, 2]
    return section_array


def calc_dtw(excitement_len, section_len, excitement_array, section_excitement):
    dtw = [
        [float("inf") for i in range(section_len + 1)]
        for j in range(excitement_len + 1)
    ]
    dtw[0][0] = 0
    # 累積を考える
    for i in range(1, excitement_len + 1):
        for j in range(1, section_len + 1):
            cost = abs(excitement_array[i - 1] - section_excitement[j - 1])
            dtw[i][j] = cost + min(dtw[i - 1][j - 1], dtw[i - 1][j])
    return dtw
