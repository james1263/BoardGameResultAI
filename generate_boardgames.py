
import csv
import json
import re
import sys
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
    """
    讀取數字。
    空白或無法解析的值回傳 None，
    產生 TypeScript 時會變成 null，而不是 0。
    """
    text = clean_text(value)

    if not text:
        return None

    # 兼容千分位，例如 1,200
    text = text.replace(",", "")

    try:
        number = float(text)
    except ValueError:
        return None

    if not number.is_integer():
        return number

    return int(number)


def get_player_list(value):
    """
    將「3, 4, 5」轉成 [3, 4, 5]。
    空白或無效的內容會轉成空陣列。
    """
    text = clean_text(value)

    if not text:
        return []

    parts = re.split(r"[,，、;/；\s]+", text)
    result = []

    for part in parts:
        if not part:
            continue

        number = get_number(part)

        # 玩家人數必須是正整數
        if (
            number is not None
            and isinstance(number, (int, float))
            and number > 0
            and number == int(number)
        ):
            result.append(int(number))

    # 去除重複值並排序
    return sorted(set(result))


def get_categories(value):
    """
    將「派對, 賽車, 骰子」轉成：
    ["派對", "賽車", "骰子"]
    """
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
    """讀取指定 CSV 欄位；不存在時回傳空字串。"""
    return clean_text(row.get(column_name, ""))


def get_optional_number(row, column_name):
    """讀取可缺失的數值。"""
    return get_number(row.get(column_name, ""))


# --------------------------------------------------
# 讀取 CSV
# --------------------------------------------------

def load_csv():
    if not CSV_PATH.exists():
        raise FileNotFoundError(
            f"找不到 CSV 檔案：{CSV_PATH}"
        )

    # utf-8-sig 可以處理常見的 UTF-8 BOM
    with CSV_PATH.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:
        reader = csv.DictReader(file)

        if not reader.fieldnames:
            raise ValueError("CSV 沒有欄位標題。")

        # 清除欄位名稱前後空白。
        # 例如「最佳人數 」會變成「最佳人數」。
        reader.fieldnames = [
            clean_text(name)
            for name in reader.fieldnames
        ]

        required_columns = [
            "屬性",
            "類型",
            "bgg網站",
            "BGG分數",
            "BGG時間",
            "BGG難度",
            "Ranking engine",
            "人數上限",
            "人數下限",
            "推薦人數",
            "最佳人數",
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
                + "\n請確認 CSV 標題列是否與原始資料一致。"
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

    if not name:
        raise ValueError(
            f"CSV 第 {index + 2} 列的「屬性」欄位是空白，"
            "無法建立桌遊名稱。"
        )

    game = {
        "id": index + 1,
        "name": name,
        "slug": f"game-{index + 1}",

        "links": {
            "bgg": get_value(row, "bgg網站"),
            "rulebookZh": "",
            "rulebookEn": "",
            "faq": "",
        },

        "category": get_categories(
            get_value(row, "類型")
        ),

        "bggScore": get_optional_number(
            row, "BGG分數"
        ),
        "maxPlayers": get_optional_number(
            row, "人數上限"
        ),
        "minPlayers": get_optional_number(
            row, "人數下限"
        ),
        "bggTime": get_optional_number(
            row, "BGG時間"
        ),
        "bggDifficulty": get_optional_number(
            row, "BGG難度"
        ),

        "bestPlayers": get_player_list(
            get_value(row, "最佳人數")
        ),
        "recommendPlayers": get_player_list(
            get_value(row, "推薦人數")
        ),

        "rankingEngine": get_optional_number(
            row, "Ranking engine"
        ),
        "classicGameRanking": get_optional_number(
            row, "老遊戲想玩綜合評分"
        ),

        "playerImpactRanking": get_optional_number(
            row, "玩家影響性排名"
        ),
        "changeRanking": get_optional_number(
            row, "變化排名"
        ),
        "uniqueRanking": get_optional_number(
            row, "獨特排名"
        ),
        "communicationRanking": get_optional_number(
            row, "溝通排名"
        ),

        "likeDegree": get_optional_number(
            row, "喜歡程度"
        ),
        "changeDegree": get_optional_number(
            row, "變化程度"
        ),
        "communicationDegree": get_optional_number(
            row, "溝通互動"
        ),
        "playerImpactDegree": get_optional_number(
            row, "玩家影響程度（在意操作+下一步限制）"
        ),
        "uniqueDegree": get_optional_number(
            row, "獨特程度"
        ),
        "complexityDegree": get_optional_number(
            row, "複雜度"
        ),
    }

    return game


# --------------------------------------------------
# 產生 TypeScript 檔案
# --------------------------------------------------

def write_typescript(games):
    output_type = """\
export type BoardGame = {
  id: number
  name: string
  slug: string
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
}

"""

    output_data = (
        "export const boardGames: BoardGame[] = "
        + json.dumps(
            games,
            ensure_ascii=False,
            indent=2
        )
        + ";\n"
    )

    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

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

        # 檢查是否有重複名稱
        names = [game["name"] for game in games]
        duplicate_names = sorted({
            name
            for name in names
            if names.count(name) > 1
        })

        write_typescript(games)

        missing_bgg_urls = sum(
            not game["links"]["bgg"]
            for game in games
        )

        missing_bgg_scores = sum(
            game["bggScore"] is None
            for game in games
        )

        missing_difficulties = sum(
            game["bggDifficulty"] is None
            for game in games
        )

        print("===== 桌遊資料產生完成 =====")
        print(f"CSV 資料筆數：{len(rows)}")
        print(f"產生桌遊筆數：{len(games)}")
        print(f"缺少 BGG 網址：{missing_bgg_urls}")
        print(f"缺少 BGG 分數：{missing_bgg_scores}")
        print(f"缺少 BGG 難度：{missing_difficulties}")
        print(f"重複桌遊名稱：{len(duplicate_names)}")
        print(f"輸出檔案：{OUTPUT_PATH}")

        if duplicate_names:
            print("\n請檢查重複名稱：")
            for name in duplicate_names:
                print(f"- {name}")

        print("\n前 3 款桌遊檢查：")

        for game in games[:3]:
            print(
                f"- {game['name']} | "
                f"類型：{'、'.join(game['category'])} | "
                f"最佳人數：{game['bestPlayers']} | "
                f"推薦人數：{game['recommendPlayers']}"
            )

        if len(games) != 107:
            print(
                "\n注意：目前不是 107 筆資料。"
                "請先確認 CSV 是否完整，不要覆蓋舊檔。"
            )

    except (OSError, ValueError, csv.Error) as error:
        print(f"產生失敗：{error}")
        sys.exit(1)


if __name__ == "__main__":
    main()
