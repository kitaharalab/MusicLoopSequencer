from enum import Enum

structure_name = ["intro", "breakdown", "buildup", "drop", "outro"]


class Structure(Enum):
    Intro = "intro"
    Breakdown = "breakdown"
    Buildup = "buildup"
    Drop = "drop"
    Outro = "outro"
