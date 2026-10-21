
import csv
import json
import re
import sys
import unicodedata
from pathlib import Path


# --------------------------------------------------
# 路徑設定
# --------------------------------------------------

PROJECT_DIR = Path(__file__).resolve().parent
CSV_PATH = PROJECT_DIR / "boardgames.csv"
OUTPUT_PATH = PROJECT_DIR / "src" / "data" / "boardGames.generated.ts"


# --------------------------------------------------
# CSV 欄位讀取工具
# --------------------------------------------------

def clean_text(value):
    """將空值轉成空字串，並移除前後空白。"""
    if value is None:
        return ""
    return str(value).strip()


def get_number(value):
    """將數字文字轉成 int / float；空白或無效值回傳 None。"""
    text = clean_text(value)

    if not text:
        return None

    text = text.replace(",", "")

    try:
        number = float(text)
    except ValueError:
        return None

    if not number.is_integer():
        return number

    return int(number)


def get_player_list(value):
    """將「3, 4, 5」轉成 [3, 4, 5]。"""
    text = clean_text(value)

    if not text:
        return []

    parts = re.split(r"[,，、;/；\s]+", text)
    result = []

    for part in parts:
        if not part:
            continue

        number = get_number(part)

        if (
            number is not None
            and number > 0
            and number == int(number)
        ):
            result.append(int(number))

    return sorted(set(result))


def get_categories(value):
    """將多個類型文字轉成不重複的字串陣列。"""
    text = clean_text(value)

    if not text:
        return []

    parts = re.split(r"[,，、;；]+", text)

    return list(dict.fromkeys(
        part.strip()
        for part in parts
        if part.strip()
    ))


def get_value(row, column_name):
    """讀取文字欄位；空白或不存在時回傳空字串。"""
    return clean_text(row.get(column_name, ""))


def get_optional_number(row, column_name):
    """讀取可缺失的數值。"""
    return get_number(row.get(column_name, ""))

def make_cover_slug(text):
    """把 BGG 名稱轉成安全的圖片檔名（小寫、用 - 連接）。"""
    normalized = unicodedata.normalize("NFKD", clean_text(text)).lower()
    normalized = "".join(
        char for char in normalized
        if not unicodedata.combining(char)
    )
    return re.sub(r"[^\w]+", "-", normalized).strip("-")

# --------------------------------------------------
# 讀取 CSV
# --------------------------------------------------

def load_csv():
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"找不到 CSV 檔案：{CSV_PATH}")

    with CSV_PATH.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:
        reader = csv.DictReader(file)

        if not reader.fieldnames:
            raise ValueError("CSV 沒有欄位標題。")

        reader.fieldnames = [
            clean_text(name)
            for name in reader.fieldnames
        ]

        required_columns = [
            "屬性",
            "bggName",
            "類型",
            "bgg網站",
            "BGG分數",
            "BGG時間",
            "BGG難度",
            "Ranking engine",
            "分數_排名",
            "人數上限",
            "人數下限",
            "推薦人數",
            "最佳人數",
            "喜歡度",
            "快速性",
            "溝通性",
            "獨特性",
            "玩家影響性",
            "複雜性",
            "變化性",
        ]

        missing_columns = [
            column
            for column in required_columns
            if column not in reader.fieldnames
        ]

        if missing_columns:
            raise ValueError(
                "CSV 缺少必要欄位："
                + "、".join(missing_columns)
                + "\n請確認 CSV 標題列是否正確。"
            )

        rows = list(reader)

    if not rows:
        raise ValueError("CSV 中沒有任何桌遊資料。")

    return rows


# --------------------------------------------------
# 將每一列轉成 BoardGame 資料
# --------------------------------------------------

def convert_row(row, index):
    name = get_value(row, "屬性")
    bgg_name = get_value(row, "bggName")

    if not name:
        raise ValueError(
            f"CSV 第 {index + 2} 列的「屬性」欄位是空白。"
        )

    if not bgg_name:
        raise ValueError(
            f"CSV 第 {index + 2} 列的「bggName」欄位是空白。"
        )

    game = {
        "id": index + 1,
        "name": name,
        "bggName": bgg_name,
        "slug": f"game-{index + 1}",
        "coverSlug": make_cover_slug(bgg_name),

        "links": {
            "bgg": get_value(row, "bgg網站"),
            "rulebookZh": "",
            "rulebookEn": "",
            "faq": "",
        },

        "category": get_categories(get_value(row, "類型")),

        "bggScore": get_optional_number(row, "BGG分數"),
        "maxPlayers": get_optional_number(row, "人數上限"),
        "minPlayers": get_optional_number(row, "人數下限"),
        "bggTime": get_optional_number(row, "BGG時間"),
        "bggDifficulty": get_optional_number(row, "BGG難度"),

        "bestPlayers": get_player_list(get_value(row, "最佳人數")),
        "recommendPlayers": get_player_list(get_value(row, "推薦人數")),

        "rankingEngine": get_optional_number(row, "Ranking engine"),
        "classicGameRanking": get_optional_number(
            row, "老遊戲想玩綜合評分"
        ),
        # 綜合分數排名：直接讀取 CSV，不重新計算。
        "scoreRank": get_optional_number(row, "分數_排名"),
        "playerImpactRanking": get_optional_number(
            row, "玩家影響性排名"
        ),
        "changeRanking": get_optional_number(row, "變化排名"),
        "uniqueRanking": get_optional_number(row, "獨特排名"),
        "communicationRanking": get_optional_number(row, "溝通排名"),

        # 數字評分：保留原本資料，不用來重新計算 Emoji。
        "likeDegree": get_optional_number(row, "喜歡程度"),
        "changeDegree": get_optional_number(row, "變化程度"),
        "communicationDegree": get_optional_number(row, "溝通互動"),
        "playerImpactDegree": get_optional_number(
            row, "玩家影響程度（在意操作+下一步限制）"
        ),
        "uniqueDegree": get_optional_number(row, "獨特程度"),
        "complexityDegree": get_optional_number(row, "複雜度"),

        # Emoji：直接讀取 CSV，保留原始圖示與數量。
        "likeEmoji": get_value(row, "喜歡度"),
        "speedEmoji": get_value(row, "快速性"),
        "communicationEmoji": get_value(row, "溝通性"),
        "uniqueEmoji": get_value(row, "獨特性"),
        "playerImpactEmoji": get_value(row, "玩家影響性"),
        "complexityEmoji": get_value(row, "複雜性"),
        "changeEmoji": get_value(row, "變化性"),
    }

    return game


# --------------------------------------------------
# 驗證資料
# --------------------------------------------------

def validate_games(games):
    names = [game["name"] for game in games]
    bgg_names = [game["bggName"] for game in games]
    cover_slugs = [game["coverSlug"] for game in games]

    duplicate_names = sorted({
        name for name in names
        if names.count(name) > 1
    })

    duplicate_bgg_names = sorted({
        name for name in bgg_names
        if bgg_names.count(name) > 1
    })

    duplicate_cover_slugs = sorted({
        slug for slug in cover_slugs
        if cover_slugs.count(slug) > 1
    })

    if duplicate_bgg_names:
        raise ValueError(
            "bggName 有重複值，為避免桌遊對應錯誤，取消產生檔案：\n"
            + "\n".join(f"- {name}" for name in duplicate_bgg_names)
        )

    if duplicate_cover_slugs:
        raise ValueError(
            "圖片檔名有重複，請確認 bggName：\n"
            + "\n".join(f"- {slug}" for slug in duplicate_cover_slugs)
        )

    return duplicate_names

# --------------------------------------------------
# 產生 TypeScript 檔案
# --------------------------------------------------

def write_typescript(games):
    output_type = """\
export type BoardGame = {
  id: number
  name: string
  bggName: string
  slug: string
  coverSlug: string
  links: {
    bgg: string
    rulebookZh: string
    rulebookEn: string
    faq: string
  }
  category: string[]
  bggScore: number | null
  maxPlayers: number | null
  minPlayers: number | null
  bggTime: number | null
  bggDifficulty: number | null
  bestPlayers: number[]
  recommendPlayers: number[]
  rankingEngine: number | null
  classicGameRanking: number | null
  scoreRank: number | null
  playerImpactRanking: number | null
  changeRanking: number | null
  uniqueRanking: number | null
  communicationRanking: number | null
  likeDegree: number | null
  changeDegree: number | null
  communicationDegree: number | null
  playerImpactDegree: number | null
  uniqueDegree: number | null
  complexityDegree: number | null
  likeEmoji: string
  speedEmoji: string
  communicationEmoji: string
  uniqueEmoji: string
  playerImpactEmoji: string
  complexityEmoji: string
  changeEmoji: string
}

"""

    output_data = (
        "export const boardGames: BoardGame[] = "
        + json.dumps(games, ensure_ascii=False, indent=2)
        + ";\n"
    )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    OUTPUT_PATH.write_text(
        output_type + output_data,
        encoding="utf-8"
    )


# --------------------------------------------------
# 主程式
# --------------------------------------------------

def main():
    try:
        rows = load_csv()

        games = [
            convert_row(row, index)
            for index, row in enumerate(rows)
        ]

        # 所有資料驗證完成後，才允許覆寫產生檔。
        duplicate_names = validate_games(games)

        missing_bgg_urls = sum(
            not game["links"]["bgg"] for game in games
        )
        missing_bgg_scores = sum(
            game["bggScore"] is None for game in games
        )
        missing_difficulties = sum(
            game["bggDifficulty"] is None for game in games
        )

        write_typescript(games)

        print("===== 桌遊資料產生完成 =====")
        print(f"CSV 資料筆數：{len(rows)}")
        print(f"產生桌遊筆數：{len(games)}")
        print(f"缺少 BGG 網址：{missing_bgg_urls}")
        print(f"缺少 BGG 分數：{missing_bgg_scores}")
        print(f"缺少 BGG 難度：{missing_difficulties}")
        print(f"重複桌遊名稱：{len(duplicate_names)}")
        print(f"輸出檔案：{OUTPUT_PATH}")

        if duplicate_names:
            print("\n提醒：以下桌遊名稱重複，請確認是否為不同版本：")
            for name in duplicate_names:
                print(f"- {name}")

        print("\n前 3 款桌遊檢查：")
        for game in games[:3]:
            print(
                f"- {game['name']} | "
                f"bggName：{game['bggName']} | "
                f"喜歡度：{game['likeEmoji'] or '未提供'} | "
                f"快速性：{game['speedEmoji'] or '未提供'}"
            )

    except (OSError, ValueError, csv.Error) as error:
        print(f"產生失敗：{error}")
        sys.exit(1)


if __name__ == "__main__":
    main()
