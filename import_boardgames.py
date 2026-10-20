
import csv
import json
from pathlib import Path
from urllib.parse import urlparse


# 1. 找出檔案的位置
project_dir = Path(__file__).resolve().parent
csv_path = project_dir / "boardgames.csv"
output_path = project_dir / "src" / "data" / "boardGames.ts"


# 2. 讀取數字；空白資料會回傳 None
def get_number(value, default=None):
    if value is None or value.strip() == "":
        return default

    try:
        number = float(value.strip())
        if number.is_integer():
            return int(number)
        return number
    except ValueError:
        return default


# 3. 將「2, 3, 4」轉成 [2, 3, 4]
def get_player_list(value):
    if not value or not value.strip():
        return []

    result = []
    for item in value.split(","):
        number = get_number(item)
        if number is not None:
            result.append(int(number))

    return result

def get_name_and_bgg_url(raw_name):
    raw_name = (raw_name or "").strip()

    # 如果原始欄位不是網址，就保留原名稱
    if not raw_name.lower().startswith(("http://", "https://")):
        return raw_name, ""

    # 拆解網址
    parsed_url = urlparse(raw_name)
    parts = parsed_url.path.strip("/").split("/")

    # 找到 boardgame 或 boardgameexpansion 後面的 ID
    for index, part in enumerate(parts):
        if part in ("boardgame", "boardgameexpansion"):
            if index + 2 < len(parts):
                slug = parts[index + 2]

                # 將 everdell-silverfrost 轉成 Everdell Silverfrost
                readable_name = slug.replace("-", " ").title()

                return readable_name, raw_name

    # 無法解析時不丟掉原始網址
    return raw_name, raw_name

# 4. 讀取 CSV，轉換成網站需要的資料
games = []

with open(csv_path, "r", encoding="utf-8-sig", newline="") as file:
    reader = csv.DictReader(file)

    for row in reader:
        # 清除欄位名稱前後的空白，處理「最佳人數 」問題
        row = {
            key.strip(): value
            for key, value in row.items()
            if key is not None
        }

        name, bgg_url = get_name_and_bgg_url(row.get("屬性"))

        # 跳過沒有桌遊名稱的空白列
        if not name:
            continue

        categories = [
            item.strip()
            for item in (row.get("類型") or "").split(",")
            if item.strip()
        ]

        game = {
            "id": len(games) + 1,
            "name": name,
            "slug": f"game-{len(games) + 1}",
            "links": {
                "bgg": bgg_url,
                "rulebook": "",
                "tutorial": "",
            },
            "category": categories,
            "bggScore": get_number(row.get("BGG分數"), 0),
            "maxPlayers": get_number(row.get("人數上限"), 0),
            "minPlayers": get_number(row.get("人數下限"), 0),
            "bggTime": get_number(row.get("BGG時間"), 0),
            "bggDifficulty": get_number(row.get("BGG難度"), 0),
            "bestPlayers": get_player_list(row.get("最佳人數")),
            "recommendPlayers": get_player_list(row.get("推薦人數")),
            "rankingEngine": get_number(row.get("Ranking engine"), 0),
            "classicGameRanking": get_number(
                row.get("老遊戲想玩綜合評分"), 0
            ),
        }

        # 排名欄位：保留原始排名，不重新計算
        optional_fields = {
            "playerImpactRanking": "玩家影響性排名",
            "changeRanking": "變化排名",
            "uniqueRanking": "獨特排名",
            "communicationRanking": "溝通排名",
        }

        for output_key, csv_key in optional_fields.items():
            value = get_number(row.get(csv_key))
            if value is not None:
                game[output_key] = value

        # 六種 emoji 的數量，直接沿用 CSV 的程度欄位
        degree_fields = {
            "likeDegree": "喜歡程度",
            "changeDegree": "變化程度",
            "communicationDegree": "溝通互動",
            "playerImpactDegree": "玩家影響程度（在意操作+下一步限制）",
            "uniqueDegree": "獨特程度",
            "complexityDegree": "複雜度",
        }

        for output_key, csv_key in degree_fields.items():
            value = get_number(row.get(csv_key))
            if value is not None:
                game[output_key] = value

        games.append(game)


# 5. 產生 TypeScript 資料檔
type_definition = """export type BoardGame = {
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
  bggScore: number
  maxPlayers: number
  minPlayers: number
  bggTime: number
  bggDifficulty: number
  bestPlayers: number[]
  recommendPlayers: number[]
  rankingEngine: number
  classicGameRanking: number
  playerImpactRanking?: number
  changeRanking?: number
  uniqueRanking?: number
  communicationRanking?: number
  likeDegree?: number
  changeDegree?: number
  communicationDegree?: number
  playerImpactDegree?: number
  uniqueDegree?: number
  complexityDegree?: number
}

"""

output_path.parent.mkdir(parents=True, exist_ok=True)

output_text = (
    type_definition
    + "export const boardGames: BoardGame[] = "
    + json.dumps(games, ensure_ascii=False, indent=2)
    + ";\n"
)

output_path.write_text(output_text, encoding="utf-8")

# 6. 顯示結果，方便檢查有沒有匯入成功
print("匯入完成！")
print(f"讀取桌遊數量：{len(games)}")
print(f"輸出檔案：{output_path}")
print("前 5 款桌遊：")

for game in games[:5]:
    print(f"- {game['name']}（{game['minPlayers']}–{game['maxPlayers']} 人）")
