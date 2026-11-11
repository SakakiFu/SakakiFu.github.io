#!/usr/bin/env python3
"""
蓮ノ空聖地巡禮指南：集數資料、影片連結、時間軸與地圖座標完整性驗證工具 (Data Linter)
用法：python hasunosora-guide/scripts/validate_data.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
JS_DIR = ROOT / "js"

SERIES_FILES = [
    ("plus", "せーはす Plus", "data-sehasu-plus.js"),
    ("prayer", "劇場版大賣祈願", "data-movie-prayer.js"),
    ("sehasu103", "せーはす 103", "data-sehasu-103.js"),
    ("sehasu104", "せーはす 104", "data-sehasu-104.js"),
    ("sehasu105", "せーはす 105", "data-sehasu-105.js"),
]


def norm_key(val: str) -> str:
    return re.sub(r"\s+", " ", (val or "").strip())


def parse_coordinates(path: pathlib.Path):
    text = path.read_text(encoding="utf-8")
    coords = {}
    duplicates = []
    for m in re.finditer(
        r'\{\s*key:\s*"([^"]+)"\s*,\s*lat:\s*([-\d.]+)\s*,\s*lng:\s*([-\d.]+)',
        text,
    ):
        k = norm_key(m.group(1))
        lat, lng = float(m.group(2)), float(m.group(3))
        if k in coords:
            duplicates.append(k)
        coords[k] = (lat, lng)
    return coords, duplicates


def extract_locations_and_episodes(path: pathlib.Path):
    text = path.read_text(encoding="utf-8")
    clean = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    clean = re.sub(r"//.*", "", clean)
    ep_ids = re.findall(r'["\']?id["\']?\s*:\s*["\']([^"\']+)["\']', clean)
    empty_vids = re.findall(r'["\']?videoId["\']?\s*:\s*["\']\s*["\']', clean)
    empty_timelines = re.findall(r'["\']?timeline["\']?\s*:\s*\[\s*\]', clean)
    map_queries = re.findall(
        r'["\']?name["\']?\s*:\s*"([^"]+)"\s*,\s*["\']?mapQuery["\']?\s*:\s*("([^"]*)"|null)'
        r'|["\']?mapQuery["\']?\s*:\s*("([^"]*)"|null)\s*,\s*["\']?name["\']?\s*:\s*"([^"]+)"',
        clean,
    )
    locs = []
    for m in map_queries:
        if m[0]:
            name = m[0]
            mq = None if m[1] == "null" else m[2]
        else:
            name = m[5]
            mq = None if m[3] == "null" else m[4]
        locs.append({"name": name, "mapQuery": mq, "key": norm_key(mq or name)})
    return ep_ids, locs, len(empty_vids), len(empty_timelines)


def main() -> int:
    coords_path = JS_DIR / "map-location-coordinates.js"
    coords, dup_coords = parse_coordinates(coords_path)
    errors = []
    warnings = []

    if dup_coords:
        errors.append(f"重複的座標 key: {dup_coords}")

    total_eps = 0
    total_empty_vids = 0
    total_empty_tls = 0

    for series_key, label, filename in SERIES_FILES:
        fpath = JS_DIR / filename
        if not fpath.exists():
            errors.append(f"找不到資料檔: {filename}")
            continue
        ep_ids, locs, empty_vids, empty_tls = extract_locations_and_episodes(fpath)
        total_eps += len(ep_ids)
        total_empty_vids += empty_vids
        total_empty_tls += empty_tls
        print(
            f"  - {label} ({filename}): {len(ep_ids)} 集 | 缺 videoId: {empty_vids} | 待補 timeline: {empty_tls}"
        )
        seen_ids = set()
        for eid in ep_ids:
            if eid in seen_ids:
                errors.append(f"[{filename}] 重複的集數 id: {eid}")
            seen_ids.add(eid)

        for loc in locs:
            k = loc["key"]
            if k not in coords:
                if loc["mapQuery"] is None:
                    warnings.append(f"[{filename}] 未公開地點（無座標）: {loc['name']}")
                else:
                    errors.append(
                        f"[{filename}] 缺少座標 (mapQuery={loc['mapQuery']!r}, name={loc['name']!r})"
                    )

    print(
        f"\n✅ 總計掃描 {total_eps} 集 | 缺 videoId: {total_empty_vids} 集 | 待補 timeline: {total_empty_tls} 集 | 地圖座標: {len(coords)} 筆"
    )
    if errors:
        print(f"\n❌ 發現 {len(errors)} 個錯誤：")
        for e in errors:
            print(f"  - {e}")
        return 1

    print("🎉 所有集數皆已具備有效 videoId，且所有公開拍攝地點 100% 皆有對應經緯度座標！")
    return 0


if __name__ == "__main__":
    sys.exit(main())
