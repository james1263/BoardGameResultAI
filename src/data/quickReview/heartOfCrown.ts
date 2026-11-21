// 開桌前快速複習：王冠之心（Heart of Crown）
// 版面比照 risingSun.ts：先看「主要區塊」，較少用的（設置、基本卡、一般卡速查、各擴充、組合限制與變體、來源不一致）預設收起。
// 收錄範圍：基本盒＋遠東領地（Far East Territory）＋北方魔女（Northern Enchantress）＋仙境花園（Fairy Garden，獨立擴充）＋六城同盟（Six City Alliance）＋天道之前（Path Before Heaven）；沒有單人規則。
// 內容來源：①Fairy Garden 英文規則書（Japanime，現行英文版通用規則）②各擴充英文規則書（FAQ）③巴哈姆特「王冠之心規則介紹」（繁中同人介紹，基本盒卡牌效果與中文用詞來源）④英文翻譯規則 hoc_eng_rulebook（Zimeon）與 HoCrules0407（Logan Sandefur）⑤西班牙文 FAQ（COMIENZO_ALTERNATIVO_Y_FAQS，英譯轉西文）。
// 用詞依巴哈姆特介紹（農村、直轄地、繼承點、稅收…）；擴充卡名沒有中文資料，中文為自譯並標【待核對】。擴充卡牌的完整效果文字沒有資料，不寫，看實物。
// 衝突時以英文規則書與 FAQ 為準；巴哈姆特與英文版不同處列在最後一區「來源不一致」。

import type { ReviewSection } from './risingSun'

export const HEART_OF_CROWN_REVIEW: { bggName: string; draftNote: string; sections: ReviewSection[] } = {
  bggName: 'Heart of Crown',
  draftNote: '',
  sections: [
    {
      title: '遊戲目標與勝利',
      items: [
        {
          text: '2～4 人，每人從相同的 10 張起始牌（7 農村＋3 見習女僕）開始組牌庫。目標：擁立一位公主，讓直轄地的繼承點累積到 20 點以上，宣告戴冠式並撐過其他人的最後一回合。',
          src: 'Fairy Garden 規則書 第 2、4、9 頁；巴哈姆特規則介紹 第 2 頁',
        },
        {
          label: '戴冠式',
          text: '自己的回合中，直轄地合計（公主、領地、繼承卡、繼承點指示物）≥ 20 點即可宣告。宣告後其他玩家各進行最後一個回合；沒有人也宣告、且你的點數仍 ≥ 20，你就獲勝。',
          src: 'Fairy Garden 規則書 第 15 頁',
        },
        {
          label: '被打斷',
          text: '最後一圈中，若你的繼承點被效果壓到 20 以下，戴冠式取消，遊戲照常繼續。',
          src: 'Fairy Garden 規則書 第 15 頁；巴哈姆特規則介紹 第 6 頁',
        },
        {
          label: '延長賽',
          text: '多人同時宣告戴冠式就進入延長賽：沒宣告的玩家出局（跳過回合、不受攻擊卡影響）；延長賽中先累積到 30 點的人立刻獲勝，即使點數掉到 20 以下也繼續打。',
          src: 'Fairy Garden 規則書 第 15 頁',
        },
        {
          label: '公爵耗盡',
          text: '基本市場的公爵被買光時遊戲立即結束，直轄地繼承點最高者勝，同分平手。買走最後一張公爵前先確認自己是領先者，否則等於送對手勝利。',
          src: 'Fairy Garden 規則書 第 15 頁；巴哈姆特規則介紹 第 14 頁',
        },
        {
          label: '追加回合不等於獲勝',
          text: '宣告戴冠式後再用雙子公主的追加回合，不會讓你直接獲勝；其他玩家仍要先完成最後一回合，你的下一個回合開始時才算數。',
          src: 'Fairy Garden 規則書 第 21 頁；西班牙文 FAQ 第 2 頁',
        },
      ],
    },
    {
      title: '回合流程（五階段）',
      items: [
        {
          label: '總覽',
          text: '① 主階段 → ② 副階段 → ③ 整理階段 → ④ 抽牌階段 → ⑤ 市場補充階段，然後換左手邊玩家。順時針進行。',
          src: 'Fairy Garden 規則書 第 11～14 頁',
        },
        {
          label: '① 主階段',
          text: '從手牌打出 1 張行動卡或領地卡到場上，效果由上而下結算。卡上有連結符號（右、下箭頭）才能再多打一張，每個連結符號多打一張；連結用完、手牌打完或自己不想打就結束。',
          src: 'Fairy Garden 規則書 第 11 頁；巴哈姆特規則介紹 第 4 頁',
        },
        {
          label: '② 副階段（三選一）',
          text: '買卡、擁立公主、設置繼承卡，只能選一種，不能兼做。詳見下一區。',
          src: 'Fairy Garden 規則書 第 13、14 頁',
        },
        {
          label: '③ 整理階段',
          text: '本回合打出的牌與剩下的手牌全進棄牌堆（直轄地的牌不動）；沒用完的稅收消失，不會帶到下回合。',
          src: 'Fairy Garden 規則書 第 14 頁',
        },
        {
          label: '④ 抽牌階段',
          text: '抽 5 張新手牌。牌庫不夠才把棄牌堆洗成新牌庫再繼續抽；剛好抽完時不會立刻洗，等到下次需要抽牌才洗。',
          src: 'Fairy Garden 規則書 第 14 頁；巴哈姆特規則介紹 第 5 頁',
        },
        {
          label: '⑤ 市場補充階段',
          text: '隨機市場不足 8 種時，從補給牌庫一張張翻開補滿（同種疊在一起）；補給牌庫用完就不再補。',
          src: 'Fairy Garden 規則書 第 14 頁',
        },
        {
          label: '卡牌優先',
          text: '卡牌效果與基本規則矛盾時，以卡牌為準。',
          src: 'Fairy Garden 規則書 第 19 頁',
        },
      ],
    },
    {
      title: '副階段三選一',
      items: [
        {
          label: '買卡',
          text: '用主階段的稅收從市場買卡，總價不超過稅收，張數不限；買到的卡直接進棄牌堆（不是手牌）。詛咒不在市場，不能買。',
          src: 'Fairy Garden 規則書 第 13 頁；西班牙文 FAQ 第 3 頁',
        },
        {
          label: '擁立公主',
          text: '尚未擁立公主時，付該公主的擁立費用（基本盒皆為 6 稅收），把公主放在面前，這塊區域就是你的直轄地。同時把本回合打出的領地卡中成本最高的 3 張（不足 3 張就全部）移進直轄地，其他卡不動。公主能力立刻生效。一人只能擁立一位，不能換。',
          src: 'Fairy Garden 規則書 第 13、20 頁；巴哈姆特規則介紹 第 5 頁',
        },
        {
          label: '設置繼承卡',
          text: '已擁立公主後，把手牌中任意張繼承卡放進直轄地，繼承點才算數。這個選擇會讓你本回合不能買卡。農村、見習女僕是負分，通常不要放。',
          src: 'Fairy Garden 規則書 第 14 頁',
        },
        {
          label: '擁立前',
          text: '擁立公主前不能放任何牌進直轄地，也不能得到繼承點。',
          src: 'Fairy Garden 規則書 第 20 頁；西班牙文 FAQ 第 1 頁',
        },
        {
          label: '領地不一定要有',
          text: '少於 3 張領地也能擁立（只要付得起），甚至直轄地可以沒有任何領地；沒有領地時仍可設置繼承卡。擁立時不能選擇不移領地。',
          src: 'Fairy Garden 規則書 第 20、22 頁；西班牙文 FAQ 第 3 頁',
        },
        {
          label: '例外：領地兼繼承卡',
          text: '帝都卡里庫瑪（Imperial Capital）、貴族領地（Imperial Estate）這類同時是領地與繼承卡的牌，可在副階段當繼承卡放進直轄地，之後能在上面 Keep 行動卡。',
          src: 'Fairy Garden 規則書 第 17 頁；西班牙文 FAQ 第 2 頁',
        },
      ],
    },
    {
      title: '保留（Keep）與傳喚（Recall）',
      items: [
        {
          label: 'Keep',
          text: '擁立公主後，主階段可把手牌的行動卡面朝上放在直轄地的領地卡上：只能放行動卡、每張領地只能放 1 張、被放的行動卡成本不能高於該領地。例：成本 5 的牌能放大都市（6），放不了都市（3）或農村（1）。Keep 的牌不會在整理階段棄掉，可留到之後回合。',
          src: 'Fairy Garden 規則書 第 12 頁；巴哈姆特規則介紹 第 4 頁',
        },
        {
          label: 'Recall',
          text: '主階段可隨時把 Keep 的牌收回手牌，Keep 與 Recall 次數不限，但不能在別人回合做。常用法：把雙連結的牌 Keep 住，需要時叫回手牌再打。',
          src: 'Fairy Garden 規則書 第 12 頁',
        },
        {
          label: '防衛牌',
          text: 'Keep 在直轄地的防衛牌被攻擊時仍可公開使用，公開後留在原位。',
          src: 'HoCrules0407 第 4 頁；巴哈姆特規則介紹 第 6 頁',
        },
        {
          label: '手牌啟動不受連結限制',
          text: '手牌啟動能力（Hand Activation Ability）在主階段、牌在手牌中就能用，不需要連結，也不需要真的打出那張牌；牌已打出或 Keep 後就不能用。',
          src: 'Fairy Garden 規則書 第 16 頁',
        },
      ],
    },
    {
      title: '公主（基本盒 6 位）',
      items: [
        {
          label: '第一公主 露露娜賽卡（Lulunasaika）',
          text: '繼承點 +6，沒有其他能力，是最保守的選擇；拿到帝冠就幾乎能立刻宣告。',
          src: '巴哈姆特規則介紹 第 8 頁',
        },
        {
          label: '第二公主 萊歐莉莉（Laolily）',
          text: '擁立時可從市場獲得最多 5 張宮廷女僕（Royal Maid），可以少拿；市場不夠就拿剩下的。',
          src: 'Fairy Garden 規則書 第 22 頁；巴哈姆特規則介紹 第 8 頁',
        },
        {
          label: '南海的市姬 克蘭克蘭（Klam-Klam）',
          text: '你買卡的成本 −1（不會低於 0），每張買的卡各減 1，張數不限。與收買（Bribery）的 +1 疊加，剛好抵銷。',
          src: 'Fairy Garden 規則書 第 21 頁；西班牙文 FAQ 第 2、3 頁',
        },
        {
          label: '大方博雅公主 貝爾佳摩特（Bergamotte）',
          text: '[啟動能力]（從手牌棄 1 張非詛咒卡）：從棄牌堆拿 1 張行動卡到手牌；每個主階段 1 次。棄牌堆沒有行動卡時，仍可棄牌但沒有後續效果。',
          src: 'Fairy Garden 規則書 第 16、21 頁',
        },
        {
          label: '姬將軍 芙拉瑪莉亞（Flammaria）',
          text: '英文版（Japanime）：擁立時從市場獲得 2 張成本 5 以下的卡；農村不會進直轄地（留在場上，整理階段正常棄掉）。巴哈姆特介紹的原版能力不同，見「來源不一致」。',
          src: 'Fairy Garden 規則書 第 22 頁；巴哈姆特規則介紹 第 10 頁',
        },
        {
          label: '雙子公主 蕾茵與希恩（Lain and Shion）',
          text: '擁立時得到雙子指示物（數量依巴哈姆特：已擁立的公主人數 +1，英文版卡面〔未驗證〕）。主階段棄 1 個指示物，本回合結束後多進行一個完整回合；一次只能棄 1 個，追加回合中不能再宣告使用（巴哈姆特）。',
          src: 'Fairy Garden 規則書 第 21 頁；巴哈姆特規則介紹 第 11 頁',
        },
        {
          label: '擴充公主',
          text: '遠東公主 桜花（Far East Princess of Sums Ohka）、北方魔女公主 安娜塔西亞（Witch Princess of the North Anastasia）、綠洲公主 艾姆榭蕾（Oasis Princess Emshielé）、古王朝公主 如意（Ru Li）、妖精公主 艾露恩（Fairy Princess Elrune，Fairy Garden 贈品）。中文為自譯【待核對】，能力看實物。',
          src: '各擴充規則書；HoC_Card_list_V2_0',
        },
        {
          label: '守護者規則',
          text: '公主 8 位以上時可用：擁立時可再選 1 位公主面朝下放進直轄地當守護者，能力不生效、不能放指示物，但別人無法再擁立她。',
          src: 'Fairy Garden 規則書 第 26 頁',
        },
      ],
    },
    {
      title: '攻擊與防衛',
      items: [
        {
          label: '防衛牌怎麼用',
          text: '被攻擊卡波及時，可從手牌或直轄地（Keep）公開防衛牌，並套用「防衛時公開」之後的效果，優先於攻擊效果。防衛牌不會因此被棄掉，留在原位；有多張防衛牌可全部使用。當成一般行動卡打出時，不會觸發這段防衛效果。',
          src: 'HoCrules0407 第 4 頁；巴哈姆特規則介紹 第 6 頁',
        },
        {
          label: '任何防衛牌對任何攻擊',
          text: '任一防衛牌都能拿來回應任一攻擊卡，即使效果看起來無關。',
          src: '西班牙文 FAQ 第 5 頁',
        },
        {
          label: '複製攻擊',
          text: '用忍術（Shinobi）複製攻擊卡時，對手仍可防衛，也會連副類型一起複製。',
          src: '西班牙文 FAQ 第 5 頁；Far East Territory 規則書 第 4 頁',
        },
        {
          label: '多人受影響',
          text: '效果影響多位玩家時，從發動者開始順時針逐一結算。例：詛咒發到一半用完，後面的人就不用拿。',
          src: 'Fairy Garden 規則書 第 17 頁',
        },
        {
          label: '已公開的牌',
          text: '攻擊要求公開的牌若已經面朝上，維持面朝上，其餘效果照常結算。',
          src: '西班牙文 FAQ 第 2 頁；Fairy Garden 規則書 第 23 頁',
        },
      ],
    },
    {
      title: '常用名詞與結算規則',
      items: [
        {
          label: '獲得（Acquire）與購買',
          text: '從牌庫以外的地方拿牌都叫獲得，預設進棄牌堆；購買是獲得的一種。「購買時」的效果只在真的花錢買時觸發；「獲得時」的效果買或被效果給都會觸發。用效果獲得卡不算「買卡」，所以副階段仍可選擇設置繼承卡。',
          src: 'Fairy Garden 規則書 第 18 頁；西班牙文 FAQ 第 3 頁',
        },
        {
          label: '流放（Banish／Exile）',
          text: '被流放的卡放到所有人共用的「國外」（Outskirts），不再算遊戲中的牌，只有專門針對國外的牌能動它。',
          src: 'Fairy Garden 規則書 第 8、19 頁',
        },
        {
          label: '公開（Reveal）',
          text: '公開牌庫頂的牌是翻面放回原位，保持面朝上，直到被抽走或被移動；被移動後不再算公開。牌庫空了要公開時，先把棄牌堆洗成新牌庫。',
          src: 'Fairy Garden 規則書 第 18 頁；Northern Enchantress 規則書 第 4 頁',
        },
        {
          label: '指示物',
          text: '繼承點 +1 指示物算 1 點；稅收指示物可在主階段隨時移除 1 個換 1 稅收；需要放指示物的區域不存在就自動建立。遊戲內附的指示物不夠可用任何東西代替。',
          src: 'Fairy Garden 規則書 第 18 頁',
        },
        {
          label: '支付費用',
          text: '卡牌要你付稅收時，要先有足夠稅收（先打出產稅的牌）才能付；付不出來，該卡之後的效果不發。付出去的稅收消失。',
          src: 'Fairy Garden 規則書 第 19 頁',
        },
        {
          label: '效果不發',
          text: '效果由上而下結算，遇到無法解決的就停止，後面的效果全部忽略；但卡上其他獨立的能力不受影響（例：買到種植園時市場農村不夠，仍照常拿到之後打出時的稅收）。',
          src: 'Fairy Garden 規則書 第 19 頁',
        },
        {
          label: '啟動能力（Activation）',
          text: '格式「[Activation Ability]（先做某事）：效果」，在主階段宣告，牌要在直轄地。',
          src: 'Fairy Garden 規則書 第 16 頁',
        },
        {
          label: '宣告卡名',
          text: '只能宣告本局有在使用的卡。',
          src: 'Fairy Garden 規則書 第 19 頁',
        },
        {
          label: '類型與副類型',
          text: '主類型：公主、領地、行動、攻擊、繼承、災厄（詛咒）；攻擊卡一定也是行動卡。副類型寫在括號：兵力、魔法、計謀、商人、女僕等。宣告副類型時（如公會長）不能宣告主類型。',
          src: 'Fairy Garden 規則書 第 7、23 頁；巴哈姆特規則介紹 第 2、3 頁',
        },
        {
          label: '洗牌與牌庫不足',
          text: '要抽、看或公開的牌不夠時，把棄牌堆洗成新牌庫；棄牌堆也空就照現狀繼續。洗牌後牌庫面朝下。',
          src: 'Fairy Garden 規則書 第 17 頁',
        },
      ],
    },
    {
      title: '容易搞錯（FAQ 精選）',
      items: [
        {
          text: '擁立公主時一定要把成本最高的 3 張領地移進直轄地，不能少移；沒用到的農村（例：芙拉瑪莉亞）整理階段正常棄掉。',
          src: 'Fairy Garden 規則書 第 22 頁；西班牙文 FAQ 第 3 頁',
        },
        {
          text: '同一個回合擁立公主與設置繼承卡不能同時做；買卡與設置繼承卡也二選一。',
          src: 'Fairy Garden 規則書 第 4、13 頁',
        },
        {
          text: '冒險者（Adventurer）等「獲得」效果不算買卡，之後副階段仍可設置繼承卡；但收買（Bribery）是買卡的一部分，用了之後就不能再設置繼承卡。',
          src: '西班牙文 FAQ 第 3 頁',
        },
        {
          text: '魔法護符（Magic Talisman）同時算詛咒：冒險者不能流放它，但詛咒相關的防禦與流放效果都把它當詛咒。',
          src: '西班牙文 FAQ 第 5 頁；Far East Territory 規則書 第 4 頁',
        },
        {
          text: '貸款（Moneylender）的指示物還在時，所有取得的稅收要先拿去還貸款，不能拿來付卡牌效果的費用。',
          src: '西班牙文 FAQ 第 5 頁',
        },
        {
          text: '火耕（Slash-and-Burn Farming）：同回合打多張不疊加，農村只是變成 2 稅收；詛咒用完時效果不發，農村維持 1 稅收。',
          src: '西班牙文 FAQ 第 5 頁',
        },
        {
          text: '被埋沒的財寶（Buried Treasure）在補給牌庫空了時仍可打出，但沒有效果。',
          src: '西班牙文 FAQ 第 3 頁',
        },
        {
          text: '城牆（Rampart）多張同時公開，效果疊加。',
          src: '西班牙文 FAQ 第 5 頁',
        },
        {
          text: '都市開發（City Development）即使市場上沒有都市／大都市可拿了，仍可選擇流放農村／都市。',
          src: '西班牙文 FAQ 第 3 頁',
        },
        {
          text: '捐款（Contribution）、徵集令狀（Draft Notice）、許願池（Wishing Well）等「付 X」「棄任意張」的效果，X 可以是 0。',
          src: '西班牙文 FAQ 第 4 頁；Fairy Garden 規則書 第 25 頁',
        },
      ],
    },
    {
      title: '設置',
      fold: true,
      items: [
        {
          label: '1～3 公主、詛咒、起始牌庫',
          text: '把基本盒 6 位公主面朝上擺出；詛咒放中央，數量＝人數 ×4（2 人 8、3 人 12、4 人 16）；每人發 7 農村＋3 見習女僕，洗好面朝下當牌庫。',
          src: 'Fairy Garden 規則書 第 9 頁；巴哈姆特規則介紹 第 3 頁',
        },
        {
          label: '4 基本市場',
          text: '都市 30、大都市 20，宮廷女僕、議員、公爵各 12。Fairy Garden 還有農村 20 張放進基本市場；基本盒的 28 張農村剛好只夠每人 7 張，市場沒有農村。',
          src: 'Fairy Garden 規則書 第 10 頁；hoc_eng_rulebook PDF 第 3 頁',
        },
        {
          label: '5 補給牌庫',
          text: '從 30 種一般卡選 10 種（可用 30 張隨機卡抽 10 張），每種 5 張，加上 2 張稀有卡（帝都卡里庫瑪／妖精女王艾露恩 與 帝冠）洗成面朝下的補給牌庫。',
          src: 'Fairy Garden 規則書 第 10 頁；巴哈姆特規則介紹 第 3 頁',
        },
        {
          label: '6 隨機市場',
          text: '從補給牌庫一張張翻開，同種疊在一起，直到有 8 種不同的卡。隨機市場加基本市場就是「市場」。',
          src: 'Fairy Garden 規則書 第 10 頁',
        },
        {
          label: '7 先手與起手',
          text: '任意方法決定先手，順時針；每人從牌庫抽 5 張當手牌。進階可用「起手手牌選擇」變體（見變體區）。',
          src: 'Fairy Garden 規則書 第 10 頁',
        },
        {
          label: '妖精女王與帝都',
          text: '要用妖精女王艾露恩（Fairy Queen Elrune）時，把帝都卡里庫瑪移出遊戲，兩張不同時使用。',
          src: 'Fairy Garden 規則書 第 25 頁',
        },
      ],
    },
    {
      title: '基本卡與稀有卡',
      fold: true,
      items: [
        {
          label: '農村（Farming Village）',
          text: '成本 1，連結 1，稅收 +1，繼承點 −2。放進直轄地每張扣 2 點。',
          src: '巴哈姆特規則介紹 第 12 頁',
        },
        {
          label: '都市（City）',
          text: '成本 3，連結 1，稅收 +2，繼承點 0。成本只有 3，直轄地裡只能 Keep 成本 3 以下的行動卡。',
          src: '巴哈姆特規則介紹 第 12 頁',
        },
        {
          label: '大都市（Large City）',
          text: '成本 6，連結 1，稅收 +3。基本卡中唯一能 Keep 所有行動卡的領地。',
          src: '巴哈姆特規則介紹 第 12、13 頁',
        },
        {
          label: '見習女僕（Apprentice Maid）',
          text: '成本 2，繼承 −2（女僕）。擁立公主前是障礙卡；全放進直轄地等於 −6 點，但牌庫會少 3 張廢卡。',
          src: '巴哈姆特規則介紹 第 13 頁',
        },
        {
          label: '宮廷女僕（Royal Maid）',
          text: '成本 3，繼承 +2（女僕）。',
          src: '巴哈姆特規則介紹 第 13 頁',
        },
        {
          label: '議員（Senator）',
          text: '成本 5，繼承 +3。',
          src: '巴哈姆特規則介紹 第 13 頁',
        },
        {
          label: '公爵（Duke）',
          text: '成本 8，繼承 +6。公爵買光遊戲立即結束。',
          src: '巴哈姆特規則介紹 第 14 頁',
        },
        {
          label: '詛咒（Curse）',
          text: '成本 0，沒有效果，只會稀釋牌庫；放在中央，不屬於市場，不能買。',
          src: '巴哈姆特規則介紹 第 14 頁；Fairy Garden 規則書 第 23 頁',
        },
        {
          label: '帝都卡里庫瑪（Imperial Capital，稀有）',
          text: '成本 11，領地＋繼承卡，連結 1，稅收 +3，繼承點 +8。可在副階段放進直轄地，之後可 Keep 行動卡。',
          src: '巴哈姆特規則介紹 第 14、15 頁',
        },
        {
          label: '帝冠（Imperial Crown，稀有）',
          text: '成本 13，繼承點 +14，是點數／成本比最高的牌。',
          src: '巴哈姆特規則介紹 第 15 頁',
        },
      ],
    },
    {
      title: '基本盒一般卡速查（30 種）',
      fold: true,
      items: [
        {
          label: '捐款（Contribution）2／連結 1',
          text: '付 1 稅收，從手牌流放 1 張牌；是唯一能流放詛咒的牌。',
          src: '巴哈姆特規則介紹 第 15 頁',
        },
        {
          label: '快馬（Post Horse）2／連結 2',
          text: '抽 1 張。',
          src: '巴哈姆特規則介紹 第 15 頁',
        },
        {
          label: '許願池（Wishing Well）2／連結 1',
          text: '棄任意張手牌，再從牌庫抽同樣張數（0 張也可以）。',
          src: '巴哈姆特規則介紹 第 16 頁；Fairy Garden 規則書 第 25 頁',
        },
        {
          label: '徵集令狀（Draft Notice）3／連結 1',
          text: '付 X 稅收，從棄牌堆選 X 張非領地的牌，依任意順序公開放在牌庫頂（X 可為 0）。',
          src: '巴哈姆特規則介紹 第 16 頁；西班牙文 FAQ 第 4 頁',
        },
        {
          label: '火耕（Slash-and-Burn Farming）3／連結 1',
          text: '從詛咒堆獲得 1 張詛咒，本回合你的農村稅收變為 2。多張不疊加；詛咒用完則效果不發。',
          src: '巴哈姆特規則介紹 第 16、17 頁；西班牙文 FAQ 第 5 頁',
        },
        {
          label: '交易船（Trading Ship）3／連結 0（商人）',
          text: '二選一：抽 2 張，或稅收 +2。',
          src: '巴哈姆特規則介紹 第 17 頁',
        },
        {
          label: '破城槌（Battering Ram）3／連結 1',
          text: '抽 1 張；對每位對手選 1 張其 Keep 在直轄地的牌，丟進棄牌堆。屬性（是否為攻擊）看實物〔未驗證〕。',
          src: '巴哈姆特規則介紹 第 17 頁',
        },
        {
          label: '被埋沒的財寶（Buried Treasure）3／連結 0',
          text: '公開補給牌庫最下面的牌，可直接獲得；不要就流放。補給牌庫空了則沒有效果。',
          src: '巴哈姆特規則介紹 第 17、18 頁；西班牙文 FAQ 第 3 頁',
        },
        {
          label: '御用商人（Government Contractor）3（原版 5）／連結 0（商人）',
          text: '稅收 +1；你在這回合副階段買的卡不進棄牌堆，改為依任意順序公開放在牌庫最下面。每買一張都要先決定放哪裡，再買下一張。',
          src: '巴哈姆特規則介紹 第 18 頁；西班牙文 FAQ 第 4 頁',
        },
        {
          label: '忍術（Shinobi）4／連結 2（計謀）',
          text: '選棄牌堆中一張非忍術的行動卡，獲得它的效果與屬性（連結不複製）。複製攻擊卡時對手可防衛。',
          src: '巴哈姆特規則介紹 第 18、19 頁；西班牙文 FAQ 第 5 頁',
        },
        {
          label: '貸款（Moneylender）4／連結 1（商人）',
          text: '稅收 +3；回合結束時建立貸款區並放 4 個貸款指示物，之後你每次獲得稅收，都改為移除等量貸款指示物。',
          src: '巴哈姆特規則介紹 第 19 頁；西班牙文 FAQ 第 5 頁',
        },
        {
          label: '圖書館（Library）4／連結 1',
          text: '二選一：從棄牌堆選 2 張非繼承卡，依任意順序公開放牌庫最下面；或抽 1 張。部分屬於繼承卡的牌（如貴族領地）不能選。',
          src: '巴哈姆特規則介紹 第 19、20 頁；西班牙文 FAQ 第 4 頁',
        },
        {
          label: '星象占卜魔女（Stargazing Witch）4／連結 2（魔法）',
          text: 'X＝本回合已打出的行動卡數 +1，看牌庫頂 X 張，任意張丟棄，其餘依任意順序放回；然後抽 1 張。',
          src: '巴哈姆特規則介紹 第 20 頁',
        },
        {
          label: '都市開發（City Development）4／連結 1（商人）',
          text: '二選一：付 1 稅收，流放手牌 1 張農村，從市場拿 1 張都市進手牌；或付 2 稅收，流放手牌 1 張都市，從市場拿 1 張大都市進手牌。',
          src: '巴哈姆特規則介紹 第 20 頁；西班牙文 FAQ 第 3 頁',
        },
        {
          label: '補給部隊（Supply Unit）4／連結 2（兵力）',
          text: '抽 1 張；整理階段開始時，可從本回合打出的非補給部隊行動卡中選 1 張，公開放到牌庫頂。不能用一張補給部隊把另一張放回牌庫。',
          src: '巴哈姆特規則介紹 第 20、21 頁；西班牙文 FAQ 第 5、6 頁',
        },
        {
          label: '銀行（Bank）5／連結 0（商人）',
          text: '稅收 +X，X＝本回合已打出的銀行、都市、大都市合計張數 +1。連結是 0，要搭配多連結的牌。',
          src: '巴哈姆特規則介紹 第 21 頁',
        },
        {
          label: '冒險者（Adventurer）5／連結 0',
          text: '付 1 稅收，流放手牌中 1 張非詛咒卡，從市場獲得 1 張成本 ≤ 被流放卡成本 +2 的卡。',
          src: '巴哈姆特規則介紹 第 21 頁；西班牙文 FAQ 第 3 頁',
        },
        {
          label: '煉金術師（Alchemist）5／連結 1',
          text: '抽 2 張。',
          src: '巴哈姆特規則介紹 第 21 頁',
        },
        {
          label: '斥候（Scout）2／連結 2（攻擊／兵力）',
          text: '所有玩家公開牌庫頂 1 張，你決定每張留著或丟棄。已經面朝上的牌你仍可選擇是否丟。',
          src: '巴哈姆特規則介紹 第 22 頁；西班牙文 FAQ 第 5 頁',
        },
        {
          label: '收買（Bribery）3／連結 1（攻擊／計謀）',
          text: '本回合買卡時，可從所有對手的棄牌堆、公開的牌庫頂、Keep 在直轄地的行動卡中購買，成本 +1。因為是買卡，之後不能再設置繼承卡。',
          src: '巴哈姆特規則介紹 第 22 頁；西班牙文 FAQ 第 3 頁',
        },
        {
          label: '被驅逐的魔獸（Evicted Monster）4／連結 1（攻擊／計謀）',
          text: '抽 1 張；手牌 5 張以上的對手必須丟 1 張成本 5 以上的手牌，沒有就公開手牌。',
          src: '巴哈姆特規則介紹 第 22 頁',
        },
        {
          label: '步兵大隊（Infantry Battalion）4／連結 0（攻擊／兵力）',
          text: '稅收 +2；手牌 5 張以上的對手必須丟 1 張領地卡，沒有就公開手牌。',
          src: '巴哈姆特規則介紹 第 22、23 頁',
        },
        {
          label: '催眠術魔女（Glamour Witch）4／連結 1（攻擊／魔法）',
          text: '抽 1 張；每位對手逐張公開牌庫，直到公開到詛咒或 2 張為止；公開的牌中非詛咒、非領地的要丟棄；之後你可選其中 1 張，從市場獲得同名卡 1 張（多張被丟也只能獲得 1 張，市場沒有同名就不獲得）。',
          src: '巴哈姆特規則介紹 第 23 頁；西班牙文 FAQ 第 6 頁',
        },
        {
          label: '近衛騎士團（Royal Guard）5／連結 0（攻擊／兵力）',
          text: '稅收 +2；牌庫頂沒有公開牌的對手要公開牌庫頂 3 張，你選 1 張放回牌庫頂，其餘棄掉。',
          src: '巴哈姆特規則介紹 第 23 頁',
        },
        {
          label: '詛咒的魔女（Curse Witch）5／連結 1（攻擊／魔法）',
          text: '英文版為手牌啟動能力：從手牌流放此牌，其他玩家獲得詛咒，主階段任何時間可用、不需連結。巴哈姆特寫的是「翻牌庫頂放詛咒」的版本，兩者不同，見「來源不一致」，看實物。',
          src: 'hoc_eng_rulebook PDF 第 3 頁；西班牙文 FAQ 第 6 頁；巴哈姆特規則介紹 第 23、24 頁',
        },
        {
          label: '城牆（Rampart）2／連結 1（防衛）',
          text: '稅收 +1；防衛時，對手兵力卡效果中的「棄牌」「公開牌」數量各減 1。可 Keep，多張疊加。只對兵力卡有效，對計謀、魔法無效。',
          src: '巴哈姆特規則介紹 第 24 頁；西班牙文 FAQ 第 5 頁',
        },
        {
          label: '避難所（Refuge）3／連結 1（防衛）',
          text: '稅收 +1；不能 Keep；打出時可把牌庫頂連續公開的牌全加入手牌（只算牌庫頂連續那一段，不含牌庫底）。防衛時可把手牌中任意張繼承或行動卡公開放回牌庫頂。',
          src: '巴哈姆特規則介紹 第 24 頁；西班牙文 FAQ 第 4 頁',
        },
        {
          label: '魔法護符（Magic Talisman）3／連結 1（防衛、詛咒）',
          text: '不能 Keep；可從手牌棄 X 張牌，稅收 +X。防衛時公開並放牌庫頂。因為算詛咒，可擋魔法攻擊，也不能被冒險者流放；擋不了斥候與收買。',
          src: '巴哈姆特規則介紹 第 25 頁；西班牙文 FAQ 第 4、5 頁',
        },
        {
          label: '貴族領地（Imperial Estate）5／連結 1（繼承、領地）',
          text: '稅收 +1；放進直轄地後，主階段 1 次可付 3 稅收在上面放 1 個繼承點 +1 指示物。用這個能力後副階段仍可選擇買卡。',
          src: '巴哈姆特規則介紹 第 25 頁；西班牙文 FAQ 第 4 頁',
        },
        {
          label: '愛八卦的公爵夫人（Gossipy Duchess）6／連結 0（繼承 +3）',
          text: '放進直轄地時，可對每位對手直轄地中的女僕、議員、公爵各選 1 張丟進棄牌堆（確切數量巴哈姆特寫法含糊，看實物〔未驗證〕）。可在對手宣告戴冠後用來打斷。',
          src: '巴哈姆特規則介紹 第 25、26 頁',
        },
      ],
    },
    {
      title: '擴充：遠東領地（Far East Territory）',
      fold: true,
      items: [
        {
          text: '基本盒擴充，需要基本盒才能玩。1 位公主＋12 種一般卡。擴充卡名（自譯【待核對】）：見習魔女（Apprentice Witch）、弓兵（Archers）、傳信鴿（Carrier Pigeon）、同盟（Confederation）、貪心妖精（Greedy Fairy）、女忍者（Kunoichi）、徵稅令（Levies）、礦業城市（Mining City）、港灣城市（Port City）、武士（Samurai）、計分簿（Tally）、商人（Trader）。',
          src: 'Far East Territory 規則書 第 1、3 頁；HoC_Card_list_V2_0',
        },
        {
          label: '桜花',
          text: '用她的能力流放卡後，若市場已經沒有同成本的卡，後續效果停止。',
          src: 'Far East Territory 規則書 第 4 頁',
        },
        {
          label: '見習魔女',
          text: '魔法護符算詛咒，所以手牌或棄牌堆有魔法護符可以防禦見習魔女。',
          src: 'Far East Territory 規則書 第 4 頁',
        },
        {
          label: '弓兵',
          text: '得稅收的來源是所有攻擊卡（例：催眠術魔女也算），不只兵力卡。用忍術複製步兵大隊或弓兵時，連卡牌類型一起複製，所以也能多得 1 稅收。',
          src: 'Far East Territory 規則書 第 4 頁',
        },
        {
          label: '傳信鴿',
          text: '用冒險者等獲得卡之後，同回合可用傳信鴿把它放進手牌。',
          src: 'Far East Territory 規則書 第 5 頁',
        },
        {
          label: '貪心妖精',
          text: '稅收指示物換稅收是指示物自己的能力，沒打貪心妖精的回合也能用；可移除任何你場上的指示物（含債務）；只能複製目前存在於你場上的指示物（不能憑空新增，且當成成本移除的指示物不能當目標）；可複製稅收指示物而得到 3 個以上，這與它自己最多產生 2 個的上限無關。',
          src: 'Far East Territory 規則書 第 5 頁',
        },
        {
          label: '同盟',
          text: '宣告的副類型必須是真的有副類型的卡，不能宣告「沒有副類型」；忍術與女忍者複製時連副類型一起複製，複製步兵大隊後會同時帶有「兵力」「計謀」等已宣告的副類型，所以能多次放繼承點 +1 指示物；擁立公主前不能獲得該指示物；打出的卡從宣告到效果結算完才算「打出中」，貪心妖精複製指示物要先結算完，同盟的指示物要等貪心妖精結算後才放。',
          src: 'Far East Territory 規則書 第 6 頁',
        },
        {
          label: '女忍者',
          text: '可以複製 Keep 在直轄地的行動卡，複製後再把原卡 Recall。',
          src: 'Far East Territory 規則書 第 7 頁',
        },
        {
          label: '徵稅令（Levies）',
          text: '徵稅標記只影響「購買」；用卡效果獲得時照常。向對手棄牌堆買牌（收買）時，徵稅標記只影響市場，收買只加 1 成本。',
          src: 'Far East Territory 規則書 第 7 頁',
        },
        {
          label: '礦業城市',
          text: '只能在結算礦業城市的能力時移除礦石指示物來獲得卡，不能隨時用。',
          src: 'Far East Territory 規則書 第 7 頁',
        },
        {
          label: '武士',
          text: '武士把卡移出遊戲，不是公開也不是棄牌，所以城牆不能防；被移出遊戲的牌不在棄牌堆，不能用貝爾佳摩特或傳信鴿拿回。',
          src: 'Far East Territory 規則書 第 8 頁',
        },
        {
          label: '商人（Trader）',
          text: '牌庫只剩 1 張時：先拿那 1 張，牌庫空了就把棄牌堆洗成新牌庫，再從新牌庫抽頂上那張，最後選一張棄牌；放回牌庫的牌可從棄牌堆全部的牌中選。',
          src: 'Far East Territory 規則書 第 8 頁',
        },
      ],
    },
    {
      title: '擴充：北方魔女（Northern Enchantress）',
      fold: true,
      items: [
        {
          text: '基本盒擴充，可再加遠東領地。1 位公主＋13 種一般卡。擴充卡名（自譯【待核對】）：洗禮（Baptism）、貓妖（Cait Sith）、詛咒人偶（Cursed Doll）、矮人珠寶匠（Dwarven Jeweler）、精靈狙擊手（Elven Sniper）、名馬（Famed Horse）、工業城市（Industrial City）、幸運物（Lucky Piece）、商人王子（Merchant Prince）、壟斷（Monopoly）、貴族千金（Noble Heiress）、地方官員（Regional Official）、宮廷紛爭（Strife in the Court）。',
          src: 'Northern Enchantress 規則書 第 1、3 頁；HoC_Card_list_V2_0',
        },
        {
          label: '安娜塔西亞',
          text: '啟動費用是從場中央拿 1 張詛咒；詛咒用完就無法支付、不能啟動；不能用從補給取來的其他詛咒類卡（魔法護符、詛咒人偶）付費。',
          src: 'Northern Enchantress 規則書 第 4 頁',
        },
        {
          label: '洗禮',
          text: '擁立公主前可放進直轄地，但拿不到繼承點 +1 指示物。',
          src: 'Northern Enchantress 規則書 第 4 頁',
        },
        {
          label: '貓妖',
          text: '牌庫底公開的牌被移到牌庫頂時就不再是公開狀態，秘密放置。',
          src: 'Northern Enchantress 規則書 第 4 頁',
        },
        {
          label: '詛咒人偶',
          text: '各種插圖在規則上都一樣；用冒險者等從市場獲得時，改由你左手邊玩家獲得（如同你買的）；不能被流放，所以洗禮、捐款等不能選它當流放對象。',
          src: 'Northern Enchantress 規則書 第 5 頁',
        },
        {
          label: '矮人珠寶匠',
          text: '「不同名稱」以卡面真正的名稱為準，忍術、女忍者複製了不同卡也不算不同名稱。',
          src: 'Northern Enchantress 規則書 第 5 頁',
        },
        {
          label: '名馬',
          text: '手牌至少有 1 張時一定要選 1 張棄牌，不能不棄；手牌 0 張時仍可打出，沒有效果但可用連結符號。',
          src: 'Northern Enchantress 規則書 第 5 頁',
        },
        {
          label: '幸運物',
          text: '魔法護符算詛咒，可拿來流放幸運物。',
          src: 'Northern Enchantress 規則書 第 6 頁',
        },
        {
          label: '商人王子',
          text: '一定要獲得 1 張大都市，不能選擇不拿；市場沒有大都市時仍可打出，但效果無效。',
          src: 'Northern Enchantress 規則書 第 6 頁',
        },
        {
          label: '壟斷（Monopoly）',
          text: '用壟斷買被流放的卡時，與市場購買同規則（可套用克蘭克蘭 −1）；國外只能買「同回合你用壟斷流放的卡」；不強制買，仍可買市場其他卡；指定的卡不在任何對手的牌庫、棄牌、手牌或直轄地時流放 0 張；對手有多張同名卡由對手自選流放哪張；不能指定已打出到場上的牌；壟斷得到的稅收可用於其他用途（如擁立公主）；用壟斷買卡仍算副階段買卡，不能再設置繼承卡；壟斷只有啟動能力，可當行動卡打出但沒有任何效果（連結也沒有）；可指定詛咒人偶，但沒有效果；可用女忍者複製直轄地中 Keep 的行動卡再 Recall。',
          src: 'Northern Enchantress 規則書 第 6、7、8 頁',
        },
        {
          label: '貴族千金',
          text: '可套用克蘭克蘭的 −1 成本。',
          src: 'Northern Enchantress 規則書 第 8 頁',
        },
        {
          label: '地方官員',
          text: '市場沒有議員時效果無效，但流放費用仍要付。',
          src: 'Northern Enchantress 規則書 第 8 頁',
        },
        {
          label: '宮廷紛爭',
          text: '對尚未擁立公主的對手（直轄地繼承點為 0），選牌讓他棄到手牌剩 4 張。',
          src: 'Northern Enchantress 規則書 第 8 頁',
        },
      ],
    },
    {
      title: '擴充：仙境花園（Fairy Garden，獨立擴充）',
      fold: true,
      items: [
        {
          text: '可單獨玩，也可混入其他套組。內含完整 6 位公主、2 張稀有卡（妖精女王艾露恩、帝冠）、30 種一般卡、各 12 張基本繼承卡、農村 48 張（20 張放基本市場）、詛咒 16、各種指示物。',
          src: 'Fairy Garden 規則書 第 1、2、10 頁',
        },
        {
          label: '一般卡名（自譯【待核對】）',
          text: '祝福 Blessing、管家 Butler、棕仙 Brownie、侍女長 Chief Maid、弩兵團 Crossbow Regiment、同盟 Coalition、魔族戰士 Demon Tribe Warrior、春風妖精 Fairy of the Spring Breeze、公會長 Guild Master、豐收祭 Harvest Festival、爐灶精靈 Hearth Spirit、冰雪精靈 Icy Snow Spirit、帝國莊園 Imperial Manor、葉妖精 Leaf Fairy、圖書管理員 Librarian、地方法官 Magistrate、商船隊 Merchant Fleet、信使 Messenger、水精靈 Nymph、小販 Peddler、朝聖者 Pilgrim、種植園 Plantation、間諜 Spy、觀星神諭 Star Reader Oracle、街頭占卜師 Street Fortuneteller、測量員 Surveyor、收稅官 Tax Collector、聖殿騎士 Templar、貿易城市 Trading City、旅行藝人 Traveling Entertainer。',
          src: 'HoC_Card_list_V2_0',
        },
        {
          label: '手牌啟動',
          text: '小販、冰雪精靈、朝聖者有手牌啟動能力。朝聖者只有這個能力，仍可當一般牌打出，沒有效果但可用它的 2 個連結。',
          src: 'Fairy Garden 規則書 第 16、24 頁',
        },
        {
          label: '春風妖精',
          text: '市場沒有農村時，仍可獲得春風妖精，只是拿不到農村。',
          src: 'Fairy Garden 規則書 第 23 頁',
        },
        {
          label: '公會長',
          text: '宣告副類型時，不能宣告行動或領地這類主類型。',
          src: 'Fairy Garden 規則書 第 23 頁',
        },
        {
          label: '種植園',
          text: '市場農村少於 3 張時，仍可獲得種植園，並獲得剩下的所有農村；打出時照常得 3 稅收。',
          src: 'Fairy Garden 規則書 第 24 頁',
        },
        {
          label: '街頭占卜師',
          text: '經由管家等效果獲得時，不需要先打出成本 3 以上的領地；但不是用買的，就拿不到「購買時」才有的效果。',
          src: 'Fairy Garden 規則書 第 24 頁',
        },
        {
          label: '測量員',
          text: '對手手牌沒有農村時，要從市場拿 1 張放牌庫頂；市場也沒有農村時，對手公開手牌，仍沒有農村就忽略其餘效果。',
          src: 'Fairy Garden 規則書 第 24 頁',
        },
        {
          label: '貿易城市',
          text: '流放卡後市場沒有成本不高於它的卡就沒有效果；注意市場包含基本市場（農村成本 1），有符合的卡就必須獲得；詛咒不在市場。',
          src: 'Fairy Garden 規則書 第 25 頁',
        },
        {
          label: '旅行藝人',
          text: '「棄任意張」可以選擇棄 0 張。',
          src: 'Fairy Garden 規則書 第 25 頁',
        },
        {
          label: '魔族戰士',
          text: '牌庫頂已公開時，對手再公開一次。',
          src: 'Fairy Garden 規則書 第 23 頁',
        },
        {
          label: '混用限制',
          text: '把仙境花園一般卡與基本盒或更早擴充的一般卡混用時，不要使用：任何防衛卡；基本盒的破城槌、被埋沒的財寶、催眠術魔女、步兵大隊、近衛騎士團、忍術、星象占卜魔女；遠東領地的弓兵與武士。',
          src: 'Fairy Garden 規則書 第 25 頁',
        },
      ],
    },
    {
      title: '擴充：六城同盟（Six City Alliance）',
      fold: true,
      items: [
        {
          text: '不能單獨玩，需要仙境花園或基本盒。1 位公主、1 張稀有卡（綠洲都市 Nefertili）、16 種一般卡、20 張災厄卡（不幸 Misfortune）。擴充卡名（自譯【待核對】）：大公（Archduke）、砲兵連（Artillery Battery）、魔術師（Conjurer）、十字軍（Crusaders）、開發令（Development Order）、遺產拍賣（Estate Sale）、漁村（Fishing Village）、女子學院（Girls’ College）、獨立城市（Independent City）、贖罪券（Indulgence）、魔法神燈（Magic Lamp）、傭兵團（Mercenary Company）、調皮妖精（Mischievous Fairy）、忍者大師（Ninja Master）、秘藏（Secret Stash）、大學城（University City）。',
          src: 'Six City Alliance 規則書 第 1、3 頁；HoC_Card_list_V2_0',
        },
        {
          label: '綠洲都市 Nefertili',
          text: '用綠洲公主艾姆榭蕾時要一併使用這張稀有卡；放在市場以外的特別區，不能正常購買。',
          src: 'Six City Alliance 規則書 第 4 頁',
        },
        {
          label: '走私標記（Contraband）',
          text: '擁立艾姆榭蕾時，立刻把 3 個標記放在市場任何牌堆上；每個標記讓該牌堆買卡成本 +1，影響所有玩家（含擁立者）；同一牌堆可疊多個，累加。牌堆買到只剩最後一張被買走時，標記暫放在艾姆榭蕾上，擁立者下一次主階段可再放到任何市場牌堆；牌堆還沒買完時標記留在原處。',
          src: 'Six City Alliance 規則書 第 4、5 頁',
        },
        {
          label: '不幸（Misfortune）',
          text: '20 張災厄卡面朝上放在專屬區；不算詛咒，所以貝爾佳摩特可以丟它。魔法神燈每打出一次獲得 2 張不幸。',
          src: 'Six City Alliance 規則書 第 4、6、7 頁',
        },
        {
          label: '獨立城市',
          text: '主階段只拿到 4 稅收、打出獨立城市後，副階段仍可擁立公主，用額外 2 稅收湊到 6。',
          src: 'Six City Alliance 規則書 第 6 頁',
        },
        {
          label: '大公',
          text: '每放一張大公進直轄地，勝利所需繼承點是設為 30／40，不是每次再 +10。',
          src: 'Six City Alliance 規則書 第 6 頁',
        },
        {
          label: '砲兵連',
          text: '只依最近一個回合給稅收；若右手邊玩家用雙子公主多走了一個回合，就以那個追加回合為準。',
          src: 'Six City Alliance 規則書 第 7 頁',
        },
        {
          label: '十字軍',
          text: '一次只能移除 1～3 個征服指示物，且只獲得 1 張卡；不能移除 4 個以上獲得多張。',
          src: 'Six City Alliance 規則書 第 7 頁',
        },
        {
          label: '忍者大師',
          text: '不能複製手牌啟動能力，所以複製不到秘藏的能力。',
          src: 'Six City Alliance 規則書 第 8 頁',
        },
      ],
    },
    {
      title: '擴充：天道之前（Path Before Heaven）',
      fold: true,
      items: [
        {
          text: '需要仙境花園或基本盒。1 位公主、10 張輔佐卡（Support Cards）、10 種一般卡。擴充一般卡名（自譯【待核對】）：商隊（Caravan）、俠盜（Chivalrous Thief）、殭屍（Hopping Vampire）、功夫大師（Kung Fu Master）、燈塔（Lighthouse）、預先投資（Prior Investment）、私人教師（Private Tutor）、孤島（Small Isolated Island）、富家千金（Wealthy Daughter）、巫醫（Witch Doctor）。輔佐卡名：Archwitch Aurora、Connected Businessman William、Gentleman Farmer Nichols、Head Maid Kurona、Imperial Diet、Imperial Library of Magic、Imperial Treasure Vault、St. Lumoi Cathedral、Tactician Shao Lin、The Late Emperor Hellard’s Scepter。建議搭配仙境花園與六城同盟。',
          src: 'Path Before Heaven 規則書 第 1、3 頁；HoC_Card_list_V2_0',
        },
        {
          label: '輔佐卡',
          text: '遊戲開始時輔佐卡面朝上放在專屬區。擁立公主時可多付 2 稅收（總共 8），並選 1 張輔佐卡一起放進直轄地；不能付 10 拿 2 張；擁立後就不能再買輔佐卡。輔佐卡的能力立即且整局有效。',
          src: 'Path Before Heaven 規則書 第 4 頁',
        },
        {
          label: '條件啟動能力',
          text: '格式「[Conditional Activation Ability: 先做某事]：效果」，是手牌啟動能力的一種：自己回合、滿足該卡條件時就能用，不需連結，也不算打出那張牌。',
          src: 'Path Before Heaven 規則書 第 4、5 頁',
        },
        {
          label: '玩家行動（Player Actions）',
          text: '算 1 個玩家行動：打出 1 張卡、用 1 次啟動能力、用 1 次手牌啟動能力、用 1 次條件啟動能力、副階段買 1 張卡、副階段設置 1 張繼承卡、擁立公主（含相關動作）。每個玩家行動只能用 1 次條件啟動能力；多張條件啟動能力同時滿足也只能用一張，但用了之後若又滿足另一張的條件，可以再用。',
          src: 'Path Before Heaven 規則書 第 5、6 頁',
        },
        {
          label: '不建議混用',
          text: '基本盒：破城槌、被埋沒的財寶、催眠術魔女、帝都卡里庫瑪、步兵大隊、近衛騎士團、忍術、星象占卜魔女；遠東領地：弓兵、武士、計分簿。守護者規則只建議 2 人用，尤其不建議 4 人用。',
          src: 'Path Before Heaven 規則書 第 7 頁',
        },
        {
          label: '如意',
          text: '擁立如意時仍可多付 2 稅收（總成本 8）再拿輔佐卡；如果她給你多張輔佐卡，效果結算順序由你決定。',
          src: 'Path Before Heaven 規則書 第 8 頁',
        },
        {
          label: '先帝赫拉爾德的權杖',
          text: '擁立第一公主露露娜賽卡時，立刻得到 +1 繼承點指示物；擁立時移動帝都卡里庫瑪也會得到 +1。',
          src: 'Path Before Heaven 規則書 第 8 頁',
        },
        {
          label: 'Archwitch Aurora',
          text: '擁立時選她當輔佐卡：其他玩家公開所有牌（手牌、牌庫、棄牌堆、直轄地 Keep 的牌）；每位對手流放其中成本最高的那張，再從市場獲得成本不高於被流放卡成本 −2 的卡；最後你從市場獲得 1 張成本不高於被流放的最高成本卡 −1 的卡。成本並列時由對手自選（稀有卡不算）；綠洲都市 Nefertili 視為稀有卡，不是合法目標。',
          src: 'Path Before Heaven 規則書 第 9 頁',
        },
        {
          label: 'Connected Businessman William',
          text: '一回合買多張卡時，只能用他的效果獲得 1 張卡。',
          src: 'Path Before Heaven 規則書 第 9 頁',
        },
        {
          label: 'Imperial Library of Magic',
          text: '效果在整理階段開始時發生：不能選本回合主階段打出的牌（還在場上），可以選副階段買的牌（已在棄牌堆）。',
          src: 'Path Before Heaven 規則書 第 10 頁',
        },
        {
          label: 'Imperial Treasure Vault',
          text: '讓你忽略稅收指示物區的數量上限（如棕仙、俠盜），但不改變一次能放幾個。',
          src: 'Path Before Heaven 規則書 第 10 頁',
        },
        {
          label: 'Imperial Diet',
          text: '每回合主階段可從手牌放 1 張議員或公爵進直轄地。',
          src: 'Path Before Heaven 規則書 第 11 頁',
        },
        {
          label: '私人教師（Private Tutor）',
          text: '「放置繼承卡進直轄地」包含任何來源（手牌、市場等），也包含副階段「打出」到直轄地；擁立公主移領地或繼承卡也能觸發條件啟動能力，但擁立與其相關動作整體算 1 個玩家行動，只能用 1 次。',
          src: 'Path Before Heaven 規則書 第 11 頁',
        },
        {
          label: '燈塔／預先投資／孤島',
          text: '啟動條件都寫「透過一般卡的效果」，所以公主卡的能力不能觸發它們。燈塔：因卡效果加進手牌的燈塔，也可立刻用它的條件啟動能力。預先投資：用小販一次獲得多張卡只算 1 個玩家行動，只能挑其中一張觸發；用侍女長在副階段獲得宮廷女僕，也能觸發預先投資。',
          src: 'Path Before Heaven 規則書 第 11、12 頁',
        },
      ],
    },
    {
      title: '變體規則與組合',
      fold: true,
      items: [
        {
          label: '2 人局',
          text: '2 人時建議把稀有卡從補給牌庫拿掉，讓遊戲更緊湊。',
          src: 'Fairy Garden 規則書 第 26 頁',
        },
        {
          label: '起手手牌選擇（座位順序變體）',
          text: '準備做到隨機市場補滿後，每人拿 10 張起始牌，秘密選 5 張當起手牌，其餘 5 張當牌庫，同時公開。見習女僕最多（農村最少）者先手並選座位，其他人依見習女僕數量由多到少順時針入座；平手用骰子等方式決定。進階玩家用，新手不建議。',
          src: 'Fairy Garden 規則書 第 26 頁；西班牙文 FAQ 第 1 頁',
        },
        {
          label: '建議第一次的組合',
          text: 'Fairy Garden Primer：Coalition、Crossbow Regiment、Fairy of the Spring Breeze、Harvest Festival、Hearth Spirit、Leaf Fairy、Merchant Fleet、Messenger、Plantation、Traveling Entertainer。基本盒第一次：Scout、Wishing Well、Post Horse、Trading Ship、Government Contractor、Supply Unit、Library、City Development、Adventurer、Alchemist。',
          src: 'Fairy Garden 規則書 第 27 頁；HoCrules0407 第 5 頁',
        },
      ],
    },
    {
      title: '來源不一致（要看實物確認）',
      fold: true,
      items: [
        {
          label: '詛咒的魔女',
          text: '巴哈姆特寫「公開對手牌庫頂，不是詛咒就放 1 張詛咒到牌庫頂」；英文規則書與西班牙文 FAQ 是「從手牌流放，其他玩家獲得詛咒」的手牌啟動能力。以英文版為準，實物確認。',
          src: '巴哈姆特規則介紹 第 23、24 頁；hoc_eng_rulebook PDF 第 3 頁；西班牙文 FAQ 第 6 頁',
        },
        {
          label: '芙拉瑪莉亞',
          text: '巴哈姆特列出原版（直轄地領地可無視成本 Keep、農村繼承點 0）與擴充版（獲得 2 張成本 5 以下的卡、農村不進直轄地）；Fairy Garden FAQ 對應擴充版。',
          src: '巴哈姆特規則介紹 第 10 頁；Fairy Garden 規則書 第 22 頁',
        },
        {
          label: '御用商人成本',
          text: '巴哈姆特原版成本 5，擴充版 3（效果不變）。',
          src: '巴哈姆特規則介紹 第 18 頁',
        },
        {
          label: '火耕',
          text: '巴哈姆特說擴充版會讓這個戰術消失，但英文版 FAQ 與卡牌清單仍有 Slash-and-Burn Farming；卡面實際文字以實物為準。',
          src: '巴哈姆特規則介紹 第 17 頁；西班牙文 FAQ 第 5 頁；HoC_Card_list_V2_0',
        },
        {
          label: '農村張數',
          text: '基本盒 28 張農村只夠起始牌庫（每人 7 張）；Fairy Garden 48 張，其中 20 張放基本市場。',
          src: 'hoc_eng_rulebook PDF 第 3 頁；Fairy Garden 規則書 第 10 頁',
        },
        {
          label: '雙子公主指示物數量',
          text: '巴哈姆特寫已擁立公主人數 +1；英文規則書與 FAQ 沒有寫數量，看實物卡面。',
          src: '巴哈姆特規則介紹 第 11 頁；Fairy Garden 規則書 第 21 頁',
        },
        {
          label: '愛八卦的公爵夫人與破城槌',
          text: '公爵夫人丟棄的張數、破城槌是否為攻擊卡，巴哈姆特描述含糊，英文資料沒有收錄卡牌文字。',
          src: '巴哈姆特規則介紹 第 17、25 頁',
        },
        {
          label: '用詞對照',
          text: '直轄地＝Domain（Zimeon 譯稿寫 Realm）；農村＝Farming Village（Sandefur 譯稿寫 Rural Territory）；宮廷女僕＝Royal Maid（舊稱 Court Handmaid）；流放＝Banish（Zimeon 譯稿寫 Exile／Abroad，國外＝Outskirts）。',
          src: 'Fairy Garden 規則書 第 8 頁；hoc_eng_rulebook PDF 第 2、3 頁；HoCrules0407 第 2 頁',
        },
        {
          label: '擴充卡牌文字',
          text: '遠東領地、北方魔女、仙境花園、六城同盟、天道之前的卡牌效果文字都沒有資料，這份只收規則書 FAQ 與規則變動；擴充公主與卡名的中文為自譯。',
          src: '各擴充規則書',
        },
      ],
    },
  ],
}
